"""Backfill per-article spark-joy vote counters from historical votes.

Merges votes from the blog widget (on-site 👍👎, instanceOfJoy =
/blog/<slug>/) and the newsletter widget (email 👍👎, instanceOfJoy =
bare slug, often scrambled with a buggy rot13 — see scramble()), with a
bot filter for email-scanner clicks; votes with written followup
answers always count (see the newsletter section). Recomputes the
counter widgets the timber site reads (Key: userId + widgetId = article
URL, see lib/sparkjoy.ts) from scratch, so re-runs are idempotent. Run
again if counters ever drift — new newsletter votes only land in the
votes table, they don't bump these counters.

Full procedure (both tables run at 1 RCU/WCU — bump capacity first or
everything throttles for an hour; remember to bump back down):

  aws dynamodb update-table --table-name spark-joy-votes-prod --region us-east-1 \\
    --provisioned-throughput ReadCapacityUnits=50,WriteCapacityUnits=1
  aws dynamodb update-table --table-name spark-joy-widgets2-prod --region us-east-1 \\
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=25
  # wait for both tables to be ACTIVE, then pull votes for both widgets:
  #   blog widget:       aab01040-bb89-40d9-8a2e-92ede0f8d82b  -> blog-votes.json
  #                      projection "instanceOfJoy, voteType"
  #   newsletter widget: 1b23e2b6-1c2a-49a2-b3ee-69bb26c125e9  -> newsletter-votes.json
  #                      projection "instanceOfJoy, voteType, #c, answers" with
  #                      --expression-attribute-names '{"#c":"createdAt"}'
  #                      (timestamps drive the bot filter, answers the exemption)
  AWS_RETRY_MODE=adaptive AWS_MAX_ATTEMPTS=20 aws dynamodb query \\
    --table-name spark-joy-votes-prod --region us-east-1 \\
    --key-condition-expression "widgetId = :w" \\
    --expression-attribute-values '{":w":{"S":"<widgetId>"}}' \\
    --projection-expression <see above> --page-size 400 \\
    --output json > <file>.json
  python3 backfill-sparkjoy-counts.py   # aggregates, prints stats, writes batch files
  # write the batches, paced to ~1/s (25 items x ~1 WCU each per batch):
  for f in backfill-batches/batch-*.json; do
    aws dynamodb batch-write-item --region us-east-1 --request-items file://$f \\
      --query "length(UnprocessedItems)" --output text
    sleep 1.1
  done   # any non-zero output = unprocessed items, re-run that batch
  # restore both tables to ReadCapacityUnits=1,WriteCapacityUnits=1

Last run July 19 2026: 54,232 on-site + 16,103 newsletter votes
attributed across 2,236 URLs. Bot filter dropped 28,150 burst-window
votes and 8,712 scanner pairs; 2,813 votes kept via written answers
(none fell in burst windows — commenters read before clicking); ~18k
newsletter-only edition votes correctly left unattributed.
"""
import json
import math
import os
import re
from collections import defaultdict
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
USER_ID = "auth0|5d315a9cd1a1680cbf1837b2"
URL_RE = re.compile(r"^/[\w/.%~-]+/$")
BLOG_DIR = "/Users/Swizec/Documents/websites/swizec.com/pages/blog"

# Known slugs, for validating newsletter values and disambiguating descrambles
KNOWN_SLUGS = set()
for name in os.listdir(BLOG_DIR):
    KNOWN_SLUGS.add(name[:-4] if name.endswith(".mdx") else (name[:-3] if name.endswith(".md") else name))

# The newsletter template scrambles slugs with a buggy rot13: letters a-e
# shift +1, f-z shift +13, digits shift +3, hyphens untouched. The encoding
# is deterministic, so encode every known slug once and look scrambled
# values up in the reverse map — no ambiguity handling needed.
def scramble(slug):
    out = []
    for ch in slug:
        if ch.isdigit():
            out.append(str((int(ch) + 3) % 10))
        elif "a" <= ch <= "e":
            out.append(chr(ord(ch) + 1))
        elif ch.isalpha():
            out.append(chr((ord(ch) - ord("a") + 13) % 26 + ord("a")))
        else:
            out.append(ch)
    return "".join(out)


SCRAMBLED_TO_SLUG = {scramble(slug): slug for slug in KNOWN_SLUGS}


def levenshtein(a, b, cap):
    if abs(len(a) - len(b)) > cap:
        return cap + 1
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        best = i
        for j, cb in enumerate(b, 1):
            v = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb))
            cur.append(v)
            best = min(best, v)
        if best > cap:
            return cap + 1
        prev = cur
    return prev[-1]


def fuzzy_lookup(value, candidates, cap=2):
    """Unique candidate within edit distance cap, else None."""
    best = None
    for key, slug in candidates.items():
        if levenshtein(value, key, cap) <= cap:
            if best is not None and best != slug:
                return None  # ambiguous
            best = slug
    return best


KNOWN_MAP = {slug: slug for slug in KNOWN_SLUGS}
_match_cache = {}


def match_slug(slug):
    """Email slug → blog slug: exact, descrambled, then fuzzy in raw and
    scrambled space (the cipher is per-character, so edit distance is
    preserved — catches near-miss email slugs like theory-ON- vs
    theory-OF-constraints even when scrambled)."""
    if slug in _match_cache:
        return _match_cache[slug]
    result = (
        KNOWN_MAP.get(slug)
        or KNOWN_MAP.get(slug.lower())
        or SCRAMBLED_TO_SLUG.get(slug)
        or fuzzy_lookup(slug.lower(), KNOWN_MAP)
        or fuzzy_lookup(slug.lower(), SCRAMBLED_TO_SLUG)
    )
    _match_cache[slug] = result
    return result


def load(name):
    return json.load(open(os.path.join(HERE, name)))["Items"]


counts = defaultdict(lambda: {"thumbsup": 0, "thumbsdown": 0})
stats = defaultdict(int)

# On-site votes: instanceOfJoy is a path like /blog/<slug>/
for item in load("blog-votes.json"):
    vote_type = item.get("voteType", {}).get("S")
    url = item.get("instanceOfJoy", {}).get("S") or ""
    if not url:
        stats["blog: no url"] += 1
        continue
    url = re.sub(r"^https?://(www\.)?swizec\.com", "", url)
    url = url.split("?")[0].split("#")[0]
    if not url.startswith("/"):
        url = "/" + url
    if not url.endswith("/"):
        url += "/"
    if vote_type not in ("thumbsup", "thumbsdown") or not URL_RE.match(url) or url == "/" or len(url) > 200:
        stats["blog: unusable url"] += 1
        continue
    counts[url][vote_type] += 1
    stats["blog: attributed"] += 1

# Newsletter votes: instanceOfJoy is a bare slug, possibly scrambled.
# Email scanners (Outlook SafeLinks etc.) click every link at delivery,
# producing dozens-to-hundreds of votes per slug within seconds of a send —
# and they click BOTH thumbs. Two-stage bot filter before attribution:
#  1. burst windows: seconds with >=5 same-slug votes, padded ±3s, are a
#     delivery blast — drop everything inside
#  2. scanner pairs: a same-(slug, second) group with both vote types is
#     one scanner clicking both links — cancel one up+down pair per group
# Exception: a vote with written followup answers is provably human (bots
# never submit the form) and always counts — also covers the person who
# clicks the wrong thumb first, then re-votes and comments: the mis-click
# cancels as a pair, the commented vote survives.


def has_comments(item):
    answers = item.get("answers", {}).get("S")
    if not answers:
        return False  # absent or the empty map widgetVote writes by default
    try:
        parsed = json.loads(answers)
    except ValueError:
        return True  # unparseable but user-submitted — keep it
    return any(isinstance(v, str) and v.strip() for v in (parsed or {}).values())


newsletter_votes = []
for item in load("newsletter-votes.json"):
    vote_type = item.get("voteType", {}).get("S")
    raw_slug = (item.get("instanceOfJoy", {}).get("S") or "").strip()
    created = item.get("createdAt", {}).get("S") or ""
    if vote_type in ("thumbsup", "thumbsdown"):
        newsletter_votes.append((raw_slug, vote_type, created, has_comments(item)))
    else:
        stats["newsletter: no vote type"] += 1

# stage 1: burst windows per raw slug (bursts happen per email send, before
# any slug decoding)
BURST_MIN = 5
BURST_PAD = 3
epoch = lambda ts: int(datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()) if ts else None
by_slug_seconds = defaultdict(lambda: defaultdict(int))
for raw_slug, vote_type, created, _commented in newsletter_votes:
    sec = epoch(created)
    if sec is not None:
        by_slug_seconds[raw_slug][sec] += 1
burst_seconds = {}
for raw_slug, seconds in by_slug_seconds.items():
    hot = set()
    for sec, n in seconds.items():
        if n >= BURST_MIN:
            hot.update(range(sec - BURST_PAD, sec + BURST_PAD + 1))
    burst_seconds[raw_slug] = hot

# (slug, second) -> per-type counts, commented votes tracked separately so
# pair cancellation never eats them
survivors = defaultdict(lambda: {"thumbsup": 0, "thumbsdown": 0})
for index, (raw_slug, vote_type, created, commented) in enumerate(newsletter_votes):
    sec = epoch(created)
    if commented:
        stats["newsletter: kept via comments"] += 1
        if sec is not None and sec in burst_seconds.get(raw_slug, ()):
            stats["newsletter: kept via comments (was in burst)"] += 1
        # unique key per commented vote — never grouped, never pair-cancelled
        survivors[(raw_slug, f"commented-{index}")][vote_type] += 1
        continue
    if sec is None:
        stats["newsletter: no timestamp (kept)"] += 1
        survivors[(raw_slug, -1)][vote_type] += 1
        continue
    if sec in burst_seconds[raw_slug]:
        stats["newsletter: dropped in burst window"] += 1
        continue
    survivors[(raw_slug, sec)][vote_type] += 1

# stage 2: cancel scanner pairs among uncommented votes, then attribute
for (raw_slug, _sec), group in survivors.items():
    pairs = min(group["thumbsup"], group["thumbsdown"])
    if pairs:
        stats["newsletter: dropped as scanner pairs"] += 2 * pairs
        group["thumbsup"] -= pairs
        group["thumbsdown"] -= pairs

    for vote_type in ("thumbsup", "thumbsdown"):
        n = group[vote_type]
        if not n:
            continue
        slug = raw_slug.strip("/").split("?")[0].split("#")[0]
        slug = re.sub(r"^https?://(www\.)?swizec\.com/blog/", "", slug).strip("/")
        if not slug:
            stats["newsletter: no slug"] += n
            continue
        matched = match_slug(slug)
        if not matched:
            stats["newsletter: unmatched"] += n
            continue
        if matched != slug:
            stats["newsletter: recovered (descramble/fuzzy)"] += n
        counts[f"/blog/{matched}/"][vote_type] += n
        stats["newsletter: attributed"] += n

for key in sorted(stats):
    print(f"{key}: {stats[key]}")
print(f"distinct URLs: {len(counts)}")
top = sorted(counts.items(), key=lambda kv: -(kv[1]["thumbsup"] + kv[1]["thumbsdown"]))
print("top articles combined:")
for url, c in top[:8]:
    print(f"  {c['thumbsup']:5d} up {c['thumbsdown']:5d} down  {url}")

now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
batch_dir = os.path.join(HERE, "backfill-batches")
os.makedirs(batch_dir, exist_ok=True)
for old in os.listdir(batch_dir):
    os.remove(os.path.join(batch_dir, old))

urls = sorted(counts)
n_batches = math.ceil(len(urls) / 25)
for b in range(n_batches):
    requests = []
    for url in urls[b * 25 : (b + 1) * 25]:
        c = counts[url]
        requests.append({
            "PutRequest": {
                "Item": {
                    "userId": {"S": USER_ID},
                    "widgetId": {"S": url},
                    "widgetType": {"S": "swizec article counter"},
                    "followupQuestions": {"S": "[]"},
                    "thumbsup": {"N": str(c["thumbsup"])},
                    "thumbsdown": {"N": str(c["thumbsdown"])},
                    "createdAt": {"S": now},
                }
            }
        })
    with open(os.path.join(batch_dir, f"batch-{b:04d}.json"), "w") as f:
        json.dump({"spark-joy-widgets2-prod": requests}, f)

print(f"wrote {n_batches} batch files to {batch_dir}")
