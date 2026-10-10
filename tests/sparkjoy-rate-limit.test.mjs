// Requires PostgreSQL's initdb, postgres, and psql on PATH. Runs against a
// disposable local cluster over a Unix socket, never the configured site DB.
import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import {
    consumeSparkjoyRateLimit,
    pruneSparkjoyRateLimits,
    sparkjoyClientKey,
} from '../lib/sparkjoy-rate-limit.ts';

const run = promisify(execFile);
const deployed = { nodeEnv: 'production', vercel: '1' };
const keyFor = (ip) => sparkjoyClientKey(new Headers({ 'x-vercel-forwarded-for': ip }), deployed);
let directory;
let server;

async function execute(statement) {
    const { stdout } = await run('psql', [
        '-X', '-w', '-h', directory, '-U', userInfo().username,
        '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At', '-c', statement,
    ]);
    return stdout.trim();
}

// Each call uses a separate real DB connection. This tests the production
// SQL under contention, including callers with no shared process state.
function client() {
    return async (strings, ...values) => {
        const statement = strings.reduce((text, part, i) => {
            if (i === 0) return part;
            const value = values[i - 1];
            const literal = typeof value === 'number' ? String(value) : "'" + value.replaceAll("'", "''") + "'";
            return text + literal + part;
        }, '');
        return { rows: JSON.parse(await execute(`
            WITH result AS (${statement}) SELECT COALESCE(json_agg(result), '[]') FROM result
        `)) };
    };
}

before(async () => {
    directory = await mkdtemp(join(tmpdir(), 'sj-'));
    await run('initdb', ['-D', join(directory, 'data'), '-A', 'trust', '--no-locale', '-E', 'UTF8']);
    server = spawn('postgres', ['-D', join(directory, 'data'), '-h', '', '-k', directory], {
        stdio: ['ignore', 'ignore', 'pipe'],
    });
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Local Postgres startup timed out')), 15000);
        server.once('error', (error) => { clearTimeout(timeout); reject(error); });
        server.once('exit', (code) => { clearTimeout(timeout); reject(new Error(`Postgres exited: ${code}`)); });
        server.stderr.on('data', (chunk) => {
            if (chunk.toString().includes('database system is ready to accept connections')) {
                clearTimeout(timeout);
                resolve();
            }
        });
    });
    const schema = await readFile(new URL('../scripts/sparkjoy-rate-limit.sql', import.meta.url), 'utf8');
    await execute(schema);
    await execute(schema); // Setup is safe to repeat.
});

beforeEach(async () => execute('TRUNCATE sparkjoy_rate_limits'));

after(async () => {
    if (server && server.exitCode === null) {
        const stopped = once(server, 'exit');
        server.kill('SIGTERM');
        await stopped;
    }
    if (directory) await rm(directory, { recursive: true, force: true });
});

test('only trusts platform headers in deployed environments', () => {
    const headers = new Headers({
        'x-vercel-forwarded-for': '192.0.2.1',
        'x-forwarded-for': '198.51.100.1',
        'x-real-ip': '203.0.113.1',
    });
    assert.equal(sparkjoyClientKey(headers, deployed), keyFor('192.0.2.1'));
    assert.equal(sparkjoyClientKey(new Headers({ 'x-forwarded-for': '192.0.2.1' }), deployed), keyFor('192.0.2.1'));
    assert.throws(() => sparkjoyClientKey(headers, { nodeEnv: 'production', vercel: undefined }));
    assert.throws(() => sparkjoyClientKey(new Headers({ 'x-real-ip': '192.0.2.1' }), deployed));
    assert.throws(() => sparkjoyClientKey(new Headers(), deployed));
    for (const invalid of ['192.0.2.1, 198.51.100.1', 'not-an-ip', 'fe80::1%en0']) {
        assert.throws(() => keyFor(invalid));
    }
});

test('normalizes mapped IPv4 and IPv6 /64s without storing raw IPs', () => {
    assert.match(keyFor('192.0.2.1'), /^[a-f0-9]{64}$/);
    assert.equal(keyFor('192.0.2.1'), keyFor('::ffff:192.0.2.1'));
    assert.equal(keyFor('192.0.2.1'), keyFor('::ffff:c000:201'));
    assert.equal(keyFor('2001:db8:1:2::1'), keyFor('2001:0db8:0001:0002:ffff:0:0:abcd'));
    assert.equal(keyFor('::1'), keyFor('0:0:0:0:0:0:0:1'));
    assert.notEqual(keyFor('2001:db8:1:2::1'), keyFor('2001:db8:1:3::1'));
    assert.notEqual(keyFor('192.0.2.1'), keyFor('192.0.2.2'));
});

test('development cannot mint new buckets through arbitrary headers', () => {
    const development = { nodeEnv: 'development', vercel: '1' };
    assert.equal(sparkjoyClientKey(new Headers(), development), 'development');
    assert.equal(sparkjoyClientKey(new Headers({ 'x-forwarded-for': '192.0.2.2' }), development), 'development');
});

test('allows ten votes, then rejects repeats without extending the window', async () => {
    for (let i = 0; i < 10; i++) {
        assert.equal((await consumeSparkjoyRateLimit('reader', 'vote', client())).allowed, true);
    }
    const reset = await execute('SELECT reset_at FROM sparkjoy_rate_limits');
    for (let i = 0; i < 3; i++) {
        const result = await consumeSparkjoyRateLimit('reader', 'vote', client());
        assert.equal(result.allowed, false);
        assert.ok(result.retryAfter > 0 && result.retryAfter <= 600);
    }
    assert.equal(await execute('SELECT reset_at FROM sparkjoy_rate_limits'), reset);
    assert.equal(await execute('SELECT hits FROM sparkjoy_rate_limits'), '11');
});

test('a concurrent burst across independent connections cannot exceed the quota', async () => {
    const results = await Promise.all(Array.from({ length: 24 }, () =>
        consumeSparkjoyRateLimit('concurrent-reader', 'vote', client())
    ));
    assert.equal(results.filter((result) => result.allowed).length, 10);
    assert.equal(results.filter((result) => !result.allowed).length, 14);
});

test('feedback has its own five-submission quota, separate from votes and other readers', async () => {
    for (let i = 0; i < 11; i++) await consumeSparkjoyRateLimit('reader', 'vote', client());
    for (let i = 0; i < 5; i++) {
        assert.equal((await consumeSparkjoyRateLimit('reader', 'feedback', client())).allowed, true);
    }
    assert.equal((await consumeSparkjoyRateLimit('reader', 'feedback', client())).allowed, false);
    assert.equal((await consumeSparkjoyRateLimit('another-reader', 'vote', client())).allowed, true);
    assert.equal((await consumeSparkjoyRateLimit('another-reader', 'feedback', client())).allowed, true);
});

test('an expired window resets once even when requests arrive together', async () => {
    await consumeSparkjoyRateLimit('reader', 'vote', client());
    await execute("UPDATE sparkjoy_rate_limits SET hits = 11, reset_at = statement_timestamp() - interval '1 second'");
    const results = await Promise.all(Array.from({ length: 16 }, () =>
        consumeSparkjoyRateLimit('reader', 'vote', client())
    ));
    assert.equal(results.filter((result) => result.allowed).length, 10);
    assert.ok(results.every((result) => result.retryAfter > 0 && result.retryAfter <= 600));
});

test('cleanup is bounded and preserves active buckets', async () => {
    await execute(`INSERT INTO sparkjoy_rate_limits
        SELECT 'old-' || n, 1, statement_timestamp() - interval '2 days' FROM generate_series(1, 150) n`);
    await consumeSparkjoyRateLimit('active', 'vote', client());
    // Count first: the ordinary request may already have triggered cleanup.
    const before = Number(await execute("SELECT count(*) FROM sparkjoy_rate_limits WHERE bucket_key LIKE 'old-%'"));
    await pruneSparkjoyRateLimits(client());
    assert.equal(Number(await execute("SELECT count(*) FROM sparkjoy_rate_limits WHERE bucket_key LIKE 'old-%'")), Math.max(0, before - 100));
    assert.equal(await execute("SELECT hits FROM sparkjoy_rate_limits WHERE bucket_key = 'vote:active'"), '1');
});

test('database failures and malformed results fail closed', async () => {
    await assert.rejects(consumeSparkjoyRateLimit('reader', 'vote', async () => { throw new Error('offline'); }));
    await assert.rejects(consumeSparkjoyRateLimit('reader', 'vote', async () => ({ rows: [] })));
    await assert.rejects(consumeSparkjoyRateLimit('reader', 'vote', async () => ({ rows: [{ allowed: 'false', retry_after: 1 }] })));
});
