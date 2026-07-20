"""Backfill per-article spark-joy vote counters from historical votes.

The GraphQL API can't aggregate feedback rows, so this recomputes the
counter widgets the timber site reads (Key: userId + widgetId = article
URL, see lib/sparkjoy.ts) straight from the votes table. Recomputes from
scratch — safe to re-run, overwrites whatever counters exist. Run again
if counters ever drift from the vote rows.

Full procedure (both tables run at 1 RCU/WCU — bump capacity first or the
reads/writes throttle for an hour; remember to bump back down):

  aws dynamodb update-table --table-name spark-joy-votes-prod --region us-east-1 \\
    --provisioned-throughput ReadCapacityUnits=50,WriteCapacityUnits=1
  aws dynamodb update-table --table-name spark-joy-widgets2-prod --region us-east-1 \\
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=25
  # wait for both tables to be ACTIVE, then pull the votes:
  AWS_RETRY_MODE=adaptive AWS_MAX_ATTEMPTS=20 aws dynamodb query \\
    --table-name spark-joy-votes-prod --region us-east-1 \\
    --key-condition-expression "widgetId = :w" \\
    --expression-attribute-values '{":w":{"S":"aab01040-bb89-40d9-8a2e-92ede0f8d82b"}}' \\
    --projection-expression "instanceOfJoy, voteType" --page-size 400 \\
    --output json > blog-votes.json
  python3 backfill-sparkjoy-counts.py   # aggregates, prints stats, writes batch files
  # write the batches, paced to ~1/s (25 items x ~1 WCU each per batch):
  for f in backfill-batches/batch-*.json; do
    aws dynamodb batch-write-item --region us-east-1 --request-items file://$f \\
      --query "length(UnprocessedItems)" --output text
    sleep 1.1
  done   # any non-zero output = unprocessed items, re-run that batch
  # restore both tables to ReadCapacityUnits=1,WriteCapacityUnits=1

Last run July 19 2026: 63,589 votes, 54,232 attributable to 2,236 URLs.
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

data = json.load(open(os.path.join(HERE, "blog-votes.json")))
items = data["Items"]

counts = defaultdict(lambda: {"thumbsup": 0, "thumbsdown": 0})
skipped_no_url = 0
skipped_weird = []

for item in items:
    vote_type = item.get("voteType", {}).get("S")
    url = item.get("instanceOfJoy", {}).get("S") or ""
    if not url:
        skipped_no_url += 1
        continue
    # normalize: strip origin, query, fragment; ensure leading + trailing slash
    url = re.sub(r"^https?://(www\.)?swizec\.com", "", url)
    url = url.split("?")[0].split("#")[0]
    if not url.startswith("/"):
        url = "/" + url
    if not url.endswith("/"):
        url += "/"
    if vote_type not in ("thumbsup", "thumbsdown") or not URL_RE.match(url) or url == "/" or len(url) > 200:
        skipped_weird.append((url, vote_type))
        continue
    counts[url][vote_type] += 1

print(f"votes total: {len(items)}")
print(f"attributable: {sum(c['thumbsup'] + c['thumbsdown'] for c in counts.values())}")
print(f"no instanceOfJoy (skipped): {skipped_no_url}")
print(f"weird values (skipped): {len(skipped_weird)}", skipped_weird[:5])
print(f"distinct URLs: {len(counts)}")
top = sorted(counts.items(), key=lambda kv: -(kv[1]["thumbsup"] + kv[1]["thumbsdown"]))
print("top articles:")
for url, c in top[:8]:
    print(f"  {c['thumbsup']:5d} up {c['thumbsdown']:5d} down  {url}")
blog_urls = [u for u in counts if u.startswith("/blog/")]
print(f"of which /blog/ URLs: {len(blog_urls)}")

# batch-write request files, 25 puts each
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
