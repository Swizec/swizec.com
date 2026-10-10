CREATE TABLE IF NOT EXISTS sparkjoy_rate_limits (
    bucket_key text PRIMARY KEY,
    hits integer NOT NULL CHECK (hits > 0),
    reset_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS sparkjoy_rate_limits_reset_at_idx
    ON sparkjoy_rate_limits (reset_at);
