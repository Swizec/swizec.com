// Backfill per-article spark-joy vote counters from historical votes.
//
// Merges votes from the blog widget (on-site 👍👎, instanceOfJoy =
// /blog/<slug>/) and the newsletter widget (email 👍👎, instanceOfJoy =
// bare slug, often scrambled with a buggy rot13 — see scramble()), with
// a bot filter for email-scanner clicks; votes with written followup
// answers always count. Recomputes the counter widgets the timber site
// reads (Key: userId + widgetId = article URL, see lib/sparkjoy.ts)
// from scratch, so re-runs are idempotent. Run again if counters ever
// drift — new newsletter votes only land in the votes table, they
// don't bump these counters.
//
// Usage:  pnpm backfill-sparkjoy
//
// Fully self-contained: temporarily bumps provisioned capacity on both
// tables (they normally sit at 1 RCU/WCU and would throttle for an
// hour), waits for ACTIVE, pulls votes, aggregates, batch-writes the
// counters paced to the write capacity, and always restores original
// capacity on the way out — even on failure. Needs AWS credentials
// with dynamodb Query/BatchWriteItem/DescribeTable/UpdateTable on both
// tables (same default credential chain as the aws CLI).
//
// Last run July 25 2026: 54,372 on-site + 16,158 newsletter votes
// attributed across 2,238 URLs. Bot filter dropped 28,218 burst-window
// votes and 8,744 scanner-pair votes; 2,815 votes kept via written
// answers; ~18k newsletter-only edition votes correctly left
// unattributed.

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
    DynamoDBClient,
    DescribeTableCommand,
    UpdateTableCommand,
    QueryCommand,
    BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb"

const REGION = "us-east-1"
const VOTES_TABLE = "spark-joy-votes-prod"
const WIDGETS_TABLE = "spark-joy-widgets2-prod"
const BLOG_WIDGET_ID = "aab01040-bb89-40d9-8a2e-92ede0f8d82b"
const NEWSLETTER_WIDGET_ID = "1b23e2b6-1c2a-49a2-b3ee-69bb26c125e9"
const USER_ID = "auth0|5d315a9cd1a1680cbf1837b2"
const URL_RE = /^\/[\w/.%~-]+\/$/
const BLOG_DIR = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "pages",
    "blog"
)

// Capacity while the backfill runs; both tables always go back to the 1/1
// resting state afterwards (fixed values, not "whatever it was before", so
// a crashed run that left capacity bumped can't bake the bump in)
const BUMPED = {
    [VOTES_TABLE]: { read: 50, write: 1 },
    [WIDGETS_TABLE]: { read: 5, write: 25 },
}
const RESTING = { read: 1, write: 1 }

const client = new DynamoDBClient({
    region: REGION,
    retryMode: "adaptive",
    maxAttempts: 20,
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------- capacity

async function getThroughput(table) {
    const { Table } = await client.send(
        new DescribeTableCommand({ TableName: table })
    )
    return {
        status: Table.TableStatus,
        read: Table.ProvisionedThroughput.ReadCapacityUnits,
        write: Table.ProvisionedThroughput.WriteCapacityUnits,
    }
}

async function setThroughput(table, { read, write }) {
    const current = await getThroughput(table)
    if (current.read === read && current.write === write) {
        console.log(`${table}: already at ${read}/${write}`)
    } else {
        await client.send(
            new UpdateTableCommand({
                TableName: table,
                ProvisionedThroughput: {
                    ReadCapacityUnits: read,
                    WriteCapacityUnits: write,
                },
            })
        )
        console.log(`${table}: updating to ${read} RCU / ${write} WCU`)
    }
    for (;;) {
        const { status } = await getThroughput(table)
        if (status === "ACTIVE") return
        await sleep(5000)
    }
}

// ------------------------------------------------------------------ query

async function queryAllVotes(widgetId, projection, attributeNames) {
    const items = []
    let lastKey
    do {
        const page = await client.send(
            new QueryCommand({
                TableName: VOTES_TABLE,
                KeyConditionExpression: "widgetId = :w",
                ExpressionAttributeValues: { ":w": { S: widgetId } },
                ProjectionExpression: projection,
                ExpressionAttributeNames: attributeNames,
                Limit: 400,
                ExclusiveStartKey: lastKey,
            })
        )
        items.push(...page.Items)
        lastKey = page.LastEvaluatedKey
    } while (lastKey)
    return items
}

// ---------------------------------------------------------- slug matching

// Known slugs, for validating newsletter values and disambiguating descrambles
const KNOWN_SLUGS = new Set(
    fs
        .readdirSync(BLOG_DIR)
        .map((name) => name.replace(/\.mdx?$/, ""))
)

// The newsletter template scrambles slugs with a buggy rot13: letters a-e
// shift +1, f-z shift +13, digits shift +3, hyphens untouched. The encoding
// is deterministic, so encode every known slug once and look scrambled
// values up in the reverse map — no ambiguity handling needed.
function scramble(slug) {
    let out = ""
    for (const ch of slug) {
        if (ch >= "0" && ch <= "9") {
            out += String((Number(ch) + 3) % 10)
        } else if (ch >= "a" && ch <= "e") {
            out += String.fromCharCode(ch.charCodeAt(0) + 1)
        } else if (/[a-z]/i.test(ch)) {
            out += String.fromCharCode(
                ((ch.charCodeAt(0) - 97 + 13) % 26) + 97
            )
        } else {
            out += ch
        }
    }
    return out
}

const SCRAMBLED_TO_SLUG = new Map(
    [...KNOWN_SLUGS].map((slug) => [scramble(slug), slug])
)
const KNOWN_MAP = new Map([...KNOWN_SLUGS].map((slug) => [slug, slug]))

function levenshtein(a, b, cap) {
    if (Math.abs(a.length - b.length) > cap) return cap + 1
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
    for (let i = 1; i <= a.length; i++) {
        const cur = [i]
        let best = i
        for (let j = 1; j <= b.length; j++) {
            const v = Math.min(
                prev[j] + 1,
                cur[j - 1] + 1,
                prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            )
            cur.push(v)
            best = Math.min(best, v)
        }
        if (best > cap) return cap + 1
        prev = cur
    }
    return prev[b.length]
}

// Unique candidate within edit distance cap, else null
function fuzzyLookup(value, candidates, cap = 2) {
    let best = null
    for (const [key, slug] of candidates) {
        if (levenshtein(value, key, cap) <= cap) {
            if (best !== null && best !== slug) return null // ambiguous
            best = slug
        }
    }
    return best
}

const matchCache = new Map()

// Email slug → blog slug: exact, descrambled, then fuzzy in raw and
// scrambled space (the cipher is per-character, so edit distance is
// preserved — catches near-miss email slugs like theory-ON- vs
// theory-OF-constraints even when scrambled)
function matchSlug(slug) {
    if (matchCache.has(slug)) return matchCache.get(slug)
    const result =
        KNOWN_MAP.get(slug) ??
        KNOWN_MAP.get(slug.toLowerCase()) ??
        SCRAMBLED_TO_SLUG.get(slug) ??
        fuzzyLookup(slug.toLowerCase(), KNOWN_MAP) ??
        fuzzyLookup(slug.toLowerCase(), SCRAMBLED_TO_SLUG)
    matchCache.set(slug, result)
    return result
}

// ------------------------------------------------------------ aggregation

const counts = new Map() // url -> {thumbsup, thumbsdown}
const stats = new Map()
const bump = (key, n = 1) => stats.set(key, (stats.get(key) ?? 0) + n)
const countsFor = (url) => {
    if (!counts.has(url)) counts.set(url, { thumbsup: 0, thumbsdown: 0 })
    return counts.get(url)
}

function aggregateBlogVotes(items) {
    // On-site votes: instanceOfJoy is a path like /blog/<slug>/
    for (const item of items) {
        const voteType = item.voteType?.S
        let url = item.instanceOfJoy?.S ?? ""
        if (!url) {
            bump("blog: no url")
            continue
        }
        url = url.replace(/^https?:\/\/(www\.)?swizec\.com/, "")
        url = url.split("?")[0].split("#")[0]
        if (!url.startsWith("/")) url = "/" + url
        if (!url.endsWith("/")) url += "/"
        if (
            (voteType !== "thumbsup" && voteType !== "thumbsdown") ||
            !URL_RE.test(url) ||
            url === "/" ||
            url.length > 200
        ) {
            bump("blog: unusable url")
            continue
        }
        countsFor(url)[voteType] += 1
        bump("blog: attributed")
    }
}

// A vote with written followup answers is provably human (bots never
// submit the form) and always counts
function hasComments(item) {
    const answers = item.answers?.S
    if (!answers) return false // absent or the empty map widgetVote writes by default
    let parsed
    try {
        parsed = JSON.parse(answers)
    } catch {
        return true // unparseable but user-submitted — keep it
    }
    return Object.values(parsed ?? {}).some(
        (v) => typeof v === "string" && v.trim()
    )
}

function aggregateNewsletterVotes(items) {
    // Newsletter votes: instanceOfJoy is a bare slug, possibly scrambled.
    // Email scanners (Outlook SafeLinks etc.) click every link at delivery,
    // producing dozens-to-hundreds of votes per slug within seconds of a
    // send — and they click BOTH thumbs. Two-stage bot filter before
    // attribution:
    //  1. burst windows: seconds with >=5 same-slug votes, padded ±3s, are
    //     a delivery blast — drop everything inside
    //  2. scanner pairs: a same-(slug, second) group with both vote types
    //     is one scanner clicking both links — cancel one up+down pair per
    //     group
    // Exception: commented votes always count — also covers the person who
    // clicks the wrong thumb first, then re-votes and comments: the
    // mis-click cancels as a pair, the commented vote survives.
    const votes = []
    for (const item of items) {
        const voteType = item.voteType?.S
        if (voteType !== "thumbsup" && voteType !== "thumbsdown") {
            bump("newsletter: no vote type")
            continue
        }
        const created = item.createdAt?.S ?? ""
        const ms = created ? Date.parse(created) : NaN
        votes.push({
            rawSlug: (item.instanceOfJoy?.S ?? "").trim(),
            voteType,
            sec: Number.isNaN(ms) ? null : Math.floor(ms / 1000),
            commented: hasComments(item),
        })
    }

    // stage 1: burst windows per raw slug (bursts happen per email send,
    // before any slug decoding)
    const BURST_MIN = 5
    const BURST_PAD = 3
    const bySlugSeconds = new Map()
    for (const { rawSlug, sec } of votes) {
        if (sec === null) continue
        if (!bySlugSeconds.has(rawSlug)) bySlugSeconds.set(rawSlug, new Map())
        const seconds = bySlugSeconds.get(rawSlug)
        seconds.set(sec, (seconds.get(sec) ?? 0) + 1)
    }
    const burstSeconds = new Map()
    for (const [rawSlug, seconds] of bySlugSeconds) {
        const hot = new Set()
        for (const [sec, n] of seconds) {
            if (n >= BURST_MIN) {
                for (let s = sec - BURST_PAD; s <= sec + BURST_PAD; s++)
                    hot.add(s)
            }
        }
        burstSeconds.set(rawSlug, hot)
    }

    // (slug, second) -> per-type counts, commented votes tracked separately
    // so pair cancellation never eats them
    const survivors = new Map()
    const survivorsFor = (rawSlug, groupKey) => {
        const key = JSON.stringify([rawSlug, groupKey])
        if (!survivors.has(key))
            survivors.set(key, { rawSlug, thumbsup: 0, thumbsdown: 0 })
        return survivors.get(key)
    }
    votes.forEach(({ rawSlug, voteType, sec, commented }, index) => {
        if (commented) {
            bump("newsletter: kept via comments")
            if (sec !== null && burstSeconds.get(rawSlug)?.has(sec)) {
                bump("newsletter: kept via comments (was in burst)")
            }
            // unique key per commented vote — never grouped, never
            // pair-cancelled
            survivorsFor(rawSlug, `commented-${index}`)[voteType] += 1
            return
        }
        if (sec === null) {
            bump("newsletter: no timestamp (kept)")
            survivorsFor(rawSlug, -1)[voteType] += 1
            return
        }
        if (burstSeconds.get(rawSlug).has(sec)) {
            bump("newsletter: dropped in burst window")
            return
        }
        survivorsFor(rawSlug, sec)[voteType] += 1
    })

    // stage 2: cancel scanner pairs among uncommented votes, then attribute
    for (const group of survivors.values()) {
        const pairs = Math.min(group.thumbsup, group.thumbsdown)
        if (pairs) {
            bump("newsletter: dropped as scanner pairs", 2 * pairs)
            group.thumbsup -= pairs
            group.thumbsdown -= pairs
        }

        const { rawSlug } = group
        for (const voteType of ["thumbsup", "thumbsdown"]) {
            const n = group[voteType]
            if (!n) continue
            let slug = rawSlug.replace(/^\/+|\/+$/g, "").split("?")[0].split("#")[0]
            slug = slug
                .replace(/^https?:\/\/(www\.)?swizec\.com\/blog\//, "")
                .replace(/^\/+|\/+$/g, "")
            if (!slug) {
                bump("newsletter: no slug", n)
                continue
            }
            const matched = matchSlug(slug)
            if (!matched) {
                bump("newsletter: unmatched", n)
                continue
            }
            if (matched !== slug) {
                bump("newsletter: recovered (descramble/fuzzy)", n)
            }
            countsFor(`/blog/${matched}/`)[voteType] += n
            bump("newsletter: attributed", n)
        }
    }
}

// ------------------------------------------------------------------ write

async function writeCounters() {
    const now = new Date().toISOString()
    const urls = [...counts.keys()].sort()
    const nBatches = Math.ceil(urls.length / 25)
    for (let b = 0; b < nBatches; b++) {
        let requests = urls.slice(b * 25, (b + 1) * 25).map((url) => ({
            PutRequest: {
                Item: {
                    userId: { S: USER_ID },
                    widgetId: { S: url },
                    widgetType: { S: "swizec article counter" },
                    followupQuestions: { S: "[]" },
                    thumbsup: { N: String(counts.get(url).thumbsup) },
                    thumbsdown: { N: String(counts.get(url).thumbsdown) },
                    createdAt: { S: now },
                },
            },
        }))
        // 25 items x ~1 WCU each per batch at 25 WCU -> pace to ~1 batch/s;
        // re-submit any unprocessed items with backoff
        for (let attempt = 0; requests.length; attempt++) {
            if (attempt > 8) {
                throw new Error(
                    `batch ${b}: ${requests.length} items still unprocessed after ${attempt} attempts`
                )
            }
            const { UnprocessedItems } = await client.send(
                new BatchWriteItemCommand({
                    RequestItems: { [WIDGETS_TABLE]: requests },
                })
            )
            requests = UnprocessedItems?.[WIDGETS_TABLE] ?? []
            await sleep(1100 * (attempt + 1))
        }
        if ((b + 1) % 10 === 0 || b + 1 === nBatches) {
            console.log(`wrote batch ${b + 1}/${nBatches}`)
        }
    }
}

// ------------------------------------------------------------------- main

try {
    await Promise.all([
        setThroughput(VOTES_TABLE, BUMPED[VOTES_TABLE]),
        setThroughput(WIDGETS_TABLE, BUMPED[WIDGETS_TABLE]),
    ])

    console.log("pulling votes…")
    const blogVotes = await queryAllVotes(
        BLOG_WIDGET_ID,
        "instanceOfJoy, voteType"
    )
    console.log(`blog votes: ${blogVotes.length}`)
    const newsletterVotes = await queryAllVotes(
        NEWSLETTER_WIDGET_ID,
        "instanceOfJoy, voteType, #c, answers",
        { "#c": "createdAt" }
    )
    console.log(`newsletter votes: ${newsletterVotes.length}`)

    aggregateBlogVotes(blogVotes)
    aggregateNewsletterVotes(newsletterVotes)

    for (const key of [...stats.keys()].sort()) {
        console.log(`${key}: ${stats.get(key)}`)
    }
    console.log(`distinct URLs: ${counts.size}`)
    const top = [...counts.entries()].sort(
        ([, a], [, b]) =>
            b.thumbsup + b.thumbsdown - (a.thumbsup + a.thumbsdown)
    )
    console.log("top articles combined:")
    for (const [url, c] of top.slice(0, 8)) {
        console.log(
            `  ${String(c.thumbsup).padStart(5)} up ${String(c.thumbsdown).padStart(5)} down  ${url}`
        )
    }

    await writeCounters()
    console.log("all counters written")
} finally {
    console.log("restoring resting capacity…")
    await Promise.all([
        setThroughput(VOTES_TABLE, RESTING),
        setThroughput(WIDGETS_TABLE, RESTING),
    ])
    console.log("capacity restored to 1/1")
}
