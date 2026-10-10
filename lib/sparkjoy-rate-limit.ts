import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { sql } from '@vercel/postgres';

export const SPARKJOY_LIMITS = {
    vote: { limit: 10, windowSeconds: 600 },
    feedback: { limit: 5, windowSeconds: 600 },
} as const;

export type SparkjoyOperation = keyof typeof SPARKJOY_LIMITS;
type Sql = (
    strings: TemplateStringsArray,
    ...values: Array<string | number>
) => Promise<{ rows: Array<Record<string, unknown>> }>;

function normalizeAddress(ip: string): string {
    if (isIP(ip) === 4) return ip;
    if (isIP(ip) !== 6 || ip.includes('%')) throw new Error('Invalid client address');

    // URL canonicalizes IPv6, including dotted IPv4-mapped addresses.
    const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
    const [left, right] = canonical.split('::');
    const start = left ? left.split(':') : [];
    const end = right ? right.split(':') : [];
    const parts = (right === undefined
        ? start
        : [...start, ...Array(8 - start.length - end.length).fill('0'), ...end]
    ).map((part) => parseInt(part, 16));
    if (parts.slice(0, 5).every((part) => part === 0) && parts[5] === 0xffff) {
        return [parts[6] >> 8, parts[6] & 255, parts[7] >> 8, parts[7] & 255].join('.');
    }
    // IPv6 clients can cheaply rotate addresses within their /64.
    return `${parts.slice(0, 4).map((part) => part.toString(16)).join(':')}::/64`;
}

export function sparkjoyClientKey(
    headers: Pick<Headers, 'get'>,
    environment = { nodeEnv: process.env.NODE_ENV, vercel: process.env.VERCEL },
): string {
    // Local development shares a bucket; never trust arbitrary forwarded
    // headers outside Vercel. A deployed instance must have a trusted IP.
    if (environment.nodeEnv === 'development') return 'development';
    if (environment.vercel !== '1') throw new Error('Rate limiting requires the Vercel proxy');

    // Vercel supplies these headers and overwrites client-provided values.
    // https://vercel.com/docs/headers/request-headers
    const ip = headers.get('x-vercel-forwarded-for') ?? headers.get('x-forwarded-for');
    if (!ip) throw new Error('Missing trusted client address');
    return createHash('sha256').update(normalizeAddress(ip.trim())).digest('hex');
}

// A single atomic upsert enforces the quota across concurrent requests,
// serverless instances, and cold starts. The database owns the clock.
export async function consumeSparkjoyRateLimit(
    clientKey: string,
    operation: SparkjoyOperation,
    query: Sql = sql,
): Promise<{ allowed: boolean; retryAfter: number }> {
    const { limit, windowSeconds } = SPARKJOY_LIMITS[operation];
    const bucket = `${operation}:${clientKey}`;
    const { rows } = await query`
        INSERT INTO sparkjoy_rate_limits (bucket_key, hits, reset_at)
        VALUES (${bucket}, 1, statement_timestamp() + ${windowSeconds} * interval '1 second')
        ON CONFLICT (bucket_key) DO UPDATE SET
            hits = CASE
                WHEN sparkjoy_rate_limits.reset_at <= statement_timestamp() THEN 1
                ELSE LEAST(sparkjoy_rate_limits.hits + 1, ${limit + 1})
            END,
            reset_at = CASE
                WHEN sparkjoy_rate_limits.reset_at <= statement_timestamp() THEN EXCLUDED.reset_at
                ELSE sparkjoy_rate_limits.reset_at
            END
        RETURNING hits <= ${limit} AS allowed,
            GREATEST(1, CEIL(EXTRACT(EPOCH FROM (reset_at - statement_timestamp()))))::integer AS retry_after
    `;
    const result = rows[0];
    if (typeof result?.allowed !== 'boolean' || typeof result?.retry_after !== 'number') {
        throw new Error('Invalid rate-limit result');
    }

    // Bounded, occasional cleanup avoids accumulating historical IP hashes.
    // Cleanup failure must not change the already-enforced quota.
    if (Math.random() < 0.01) {
        await pruneSparkjoyRateLimits(query).catch(() => {
            console.error('sparkjoy rate-limit cleanup failed');
        });
    }
    return { allowed: result.allowed, retryAfter: result.retry_after };
}

export async function pruneSparkjoyRateLimits(query: Sql = sql): Promise<void> {
    await query`
        DELETE FROM sparkjoy_rate_limits
        WHERE bucket_key IN (
            SELECT bucket_key FROM sparkjoy_rate_limits
            WHERE reset_at < statement_timestamp() - interval '1 day'
            ORDER BY reset_at, bucket_key
            LIMIT 100
        ) AND reset_at < statement_timestamp() - interval '1 day'
        RETURNING bucket_key
    `;
}
