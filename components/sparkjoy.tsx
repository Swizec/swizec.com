import { Suspense } from 'react';
import { cache } from 'react';
import { articleVoteCounts, type VoteType } from '../lib/sparkjoy';
import { SparkJoyWidget } from './sparkjoy-widget';

// Request-scoped dedupe: both count slots share one DynamoDB lookup.
const getCounts = cache(articleVoteCounts);

// Streams in after the page shell — vote counts never block first paint,
// and a broken sparkjoy backend degrades to buttons without numbers.
async function VoteCount({ articleUrl, type }: { articleUrl: string; type: VoteType }) {
    try {
        const counts = await getCounts(articleUrl);
        const count = counts?.[type];
        // Hide zero — most articles predate per-article counting, and a wall
        // of zeros reads as "nobody ever votes" when the votes are simply in
        // the legacy table.
        if (!count) return null;
        return <span className="sparkjoy-count">{count}</span>;
    } catch {
        return null;
    }
}

export function SparkJoy({ articleUrl }: { articleUrl: string }) {
    return (
        <SparkJoyWidget
            articleUrl={articleUrl}
            upCount={
                <Suspense fallback={null}>
                    <VoteCount articleUrl={articleUrl} type="thumbsup" />
                </Suspense>
            }
            downCount={
                <Suspense fallback={null}>
                    <VoteCount articleUrl={articleUrl} type="thumbsdown" />
                </Suspense>
            }
        />
    );
}
