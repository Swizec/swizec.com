// Spark-joy feedback machinery. Talks to the long-running sparkjoy GraphQL
// lambda (github.com/Swizec/spark-joy backend) that stores votes and answers
// in DynamoDB; a stream lambda on the feedbacks table posts them to Slack.
//
// Every vote makes two writes:
//  - the shared blog widget (BLOG_WIDGET_ID): this is the row whose stream
//    events the Slack lambda allowlists, and where followup answers attach —
//    the pipeline that must keep working. The article URL travels in
//    `instanceOfJoy`, same as the old Gatsby → Remix flow.
//  - a per-article counter widget keyed by the article URL: the legacy
//    schema can't count votes per article any other way, and this makes
//    reads a single getItem. Its incidental feedback rows aren't in the
//    Slack allowlist, so they're silent.

const BLOG_WIDGET_ID = 'aab01040-bb89-40d9-8a2e-92ede0f8d82b';
const USER_ID = 'auth0|5d315a9cd1a1680cbf1837b2';
const COUNTER_WIDGET_TYPE = 'swizec article counter';

export type VoteType = 'thumbsup' | 'thumbsdown';

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const endpoint = process.env.SPARKJOY_GRAPHQL_ENDPOINT;
    if (!endpoint) throw new Error('SPARKJOY_GRAPHQL_ENDPOINT is not set');

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
        throw new Error(`sparkjoy GraphQL failed: ${response.status} ${response.statusText}`);
    }

    const { data, errors } = (await response.json()) as {
        data: T;
        errors?: Array<{ message: string }>;
    };
    if (errors?.length) throw new Error(`sparkjoy GraphQL: ${errors[0].message}`);
    return data;
}

const voteMutation = `
    mutation widgetVote(
        $userId: String!
        $widgetId: String!
        $thumbsup: Boolean
        $thumbsdown: Boolean
        $instanceOfJoy: String
    ) {
        widgetVote(
            userId: $userId
            widgetId: $widgetId
            thumbsup: $thumbsup
            thumbsdown: $thumbsdown
            instanceOfJoy: $instanceOfJoy
        ) {
            voteId
        }
    }
`;

// Per-article vote counts, or null when no counter widget exists yet (the
// widget query resolves missing items to an empty object, not an error).
export async function articleVoteCounts(
    articleUrl: string,
): Promise<{ thumbsup: number; thumbsdown: number } | null> {
    const data = await graphql<{
        widget: { thumbsup?: number | null; thumbsdown?: number | null } | null;
    }>(
        `query counts($userId: String!, $widgetId: String!) {
            widget(userId: $userId, widgetId: $widgetId) {
                thumbsup
                thumbsdown
            }
        }`,
        { userId: USER_ID, widgetId: articleUrl },
    );

    const widget = data.widget;
    if (typeof widget?.thumbsup !== 'number') return null;
    return { thumbsup: widget.thumbsup, thumbsdown: widget.thumbsdown ?? 0 };
}

// The counter widget must exist before widgetVote can increment it —
// DynamoDB's `SET thumbsup = thumbsup + :inc` errors on missing attributes.
// saveWidget resets counters to 0, so only create when genuinely absent.
async function bumpArticleCounter(articleUrl: string, voteType: VoteType): Promise<void> {
    const counts = await articleVoteCounts(articleUrl);
    if (counts === null) {
        await graphql(
            // followupQuestions is required in practice: the resolver always
            // includes it in its DynamoDB UpdateExpression
            `mutation createCounter(
                $userId: String!
                $widgetId: String
                $widgetType: String!
                $followupQuestions: String
            ) {
                saveWidget(
                    userId: $userId
                    widgetId: $widgetId
                    widgetType: $widgetType
                    followupQuestions: $followupQuestions
                ) {
                    widgetId
                }
            }`,
            {
                userId: USER_ID,
                widgetId: articleUrl,
                widgetType: COUNTER_WIDGET_TYPE,
                followupQuestions: '[]',
            },
        );
    }
    await graphql(voteMutation, {
        userId: USER_ID,
        widgetId: articleUrl,
        thumbsup: voteType === 'thumbsup',
        thumbsdown: voteType === 'thumbsdown',
    });
}

// Records the vote and returns the voteId that followup answers attach to.
// The counter bump is best-effort — counts are decoration, the Slack-visible
// vote must not fail because of them.
export async function recordVote(articleUrl: string, voteType: VoteType): Promise<string> {
    const [data] = await Promise.all([
        graphql<{ widgetVote: { voteId: string } }>(voteMutation, {
            userId: USER_ID,
            widgetId: BLOG_WIDGET_ID,
            thumbsup: voteType === 'thumbsup',
            thumbsdown: voteType === 'thumbsdown',
            instanceOfJoy: articleUrl,
        }),
        bumpArticleCounter(articleUrl, voteType).catch((error) => {
            console.error('sparkjoy counter bump failed', error);
        }),
    ]);

    return data.widgetVote.voteId;
}

// Attaches followup answers to an existing vote row. The MODIFY stream event
// re-notifies Slack with the answers included.
export async function recordFeedback({
    voteId,
    voteType,
    answers,
}: {
    voteId: string;
    voteType: VoteType;
    answers: Record<string, string>;
}): Promise<void> {
    await graphql(
        `mutation saveFeedback(
            $widgetId: String!
            $voteId: String!
            $voteType: String!
            $answers: String!
        ) {
            saveFeedback(
                widgetId: $widgetId
                voteId: $voteId
                voteType: $voteType
                answers: $answers
            ) {
                voteId
            }
        }`,
        {
            widgetId: BLOG_WIDGET_ID,
            voteId,
            voteType,
            answers: JSON.stringify(answers),
        },
    );
}
