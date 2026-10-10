'use server';

import { createActionClient, ActionError, getHeaders } from '@timber-js/app/server';
import { z } from 'zod';
import { recordVote, recordFeedback } from '../../lib/sparkjoy';

import {
    consumeSparkjoyRateLimit,
    sparkjoyClientKey,
    type SparkjoyOperation,
} from '../../lib/sparkjoy-rate-limit';

const action = createActionClient();

async function enforceRateLimit(operation: SparkjoyOperation) {
    let result;
    try {
        result = await consumeSparkjoyRateLimit(sparkjoyClientKey(getHeaders()), operation);
    } catch {
        // Fail closed: database or proxy configuration failures must not
        // silently enable unlimited writes to the feedback backend.
        console.error('sparkjoy rate limiter unavailable');
        throw new ActionError('RATE_LIMIT_UNAVAILABLE');
    }
    if (!result.allowed) {
        throw new ActionError('RATE_LIMITED', { retryAfter: result.retryAfter });
    }
}

// Matches the articleUrl the catch-all route builds: /blog/<slug>/
const articleUrl = z
    .string()
    .regex(/^\/blog\/[\w.%-]+\/$/, 'not an article URL');

export const sparkjoyVote = action
    .schema(
        z.object({
            articleUrl,
            voteType: z.enum(['thumbsup', 'thumbsdown']),
        }),
    )
    .action(async ({ input }) => {
        await enforceRateLimit('vote');
        try {
            const voteId = await recordVote(input.articleUrl, input.voteType);
            return { voteId, voteType: input.voteType };
        } catch (error) {
            console.error('sparkjoy vote failed', error);
            throw new ActionError('VOTE_FAILED');
        }
    });

export const sparkjoyFeedback = action
    .schema(
        z.object({
            voteId: z.string().uuid(),
            voteType: z.enum(['thumbsup', 'thumbsdown']),
            // field_<id> names match the followupQuestions config on the
            // shared blog widget — Slack messages key answers by these ids.
            field_1: z.string().trim().max(5000).optional(), // Why?
            field_2: z.string().trim().max(5000).optional(), // Have a burning question?
            field_3: z.enum(['yes', 'no']).optional(), // Would you recommend this to a friend?
        }),
    )
    .action(async ({ input }) => {
        const answers = Object.fromEntries(
            (['field_1', 'field_2', 'field_3'] as const)
                .map((field) => [field, input[field]])
                .filter(([, value]) => value),
        ) as Record<string, string>;

        // Nothing filled in — still a valid "skip", don't bother the API
        if (Object.keys(answers).length > 0) {
            await enforceRateLimit('feedback');
            try {
                await recordFeedback({
                    voteId: input.voteId,
                    voteType: input.voteType,
                    answers,
                });
            } catch (error) {
                console.error('sparkjoy feedback failed', error);
                throw new ActionError('FEEDBACK_FAILED');
            }
        }

        return { done: true };
    });
