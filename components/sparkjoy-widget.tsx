'use client';

import { useActionState } from '@timber-js/app/client';
import { startTransition, useEffect, useRef, useState, type ReactNode } from 'react';
import { sparkjoyVote, sparkjoyFeedback } from '../app/_actions/sparkjoy';

type VoteType = 'thumbsup' | 'thumbsdown';

// The three-stage flow, all in place: vote buttons → followup questions →
// thanks. Count slots stream in from the server as RSC fragments.
export function SparkJoyWidget({
    articleUrl,
    title,
    upCount,
    downCount,
}: {
    articleUrl: string;
    title: string;
    upCount: ReactNode;
    downCount: ReactNode;
}) {
    const [vote, voteAction, votePending, voteErrors] = useActionState(sparkjoyVote, null);
    const [feedback, feedbackAction, feedbackPending, feedbackErrors] = useActionState(
        sparkjoyFeedback,
        null,
    );
    // The +1 burst fires on click, before the server round-trip — the
    // delight shouldn't wait on DynamoDB. Key restarts the CSS animation.
    const [burst, setBurst] = useState<{ type: VoteType; key: number } | null>(null);

    const widgetRef = useRef<HTMLElement>(null);
    const whyRef = useRef<HTMLTextAreaElement>(null);
    const linkedVote = useRef(false);

    // Successful action results nest under .data ({ data } | { serverError } | …)
    const voted = vote && 'data' in vote ? vote.data : null;
    const feedbackDone = feedback && 'data' in feedback ? (feedback.data?.done ?? false) : false;

    useEffect(() => {
        const url = new URL(window.location.href);
        const voteType = url.searchParams.get('vote');
        if (voteType !== 'thumbsup' && voteType !== 'thumbsdown') return;

        // Consume the email link before dispatching: refreshes and effect
        // replays must not submit it again. Keep campaign params and Timber's
        // history state, and leave a shareable anchor to the feedback widget.
        url.searchParams.delete('vote');
        url.hash = 'feedback';
        window.history.replaceState(window.history.state, '', url);
        linkedVote.current = true;
        widgetRef.current?.scrollIntoView();

        const data = new FormData();
        data.set('articleUrl', articleUrl);
        data.set('voteType', voteType);
        startTransition(() => voteAction(data));
    }, [articleUrl, voteAction]);

    useEffect(() => {
        if (linkedVote.current && voted?.voteId) {
            widgetRef.current?.scrollIntoView();
            whyRef.current?.focus({ preventScroll: true });
        }
    }, [voted?.voteId]);

    if (feedbackDone) {
        return (
            <aside id="feedback" ref={widgetRef} className="sparkjoy" aria-label="Article feedback">
                <p className="sparkjoy-thanks">Thanks! You're the best ❤️</p>
            </aside>
        );
    }

    if (voted?.voteId) {
        return (
            <aside id="feedback" ref={widgetRef} className="sparkjoy" aria-label="Article feedback">
                <form action={feedbackAction} className="sparkjoy-form">
                    <p className="sparkjoy-prompt">
                        {voted.voteType === 'thumbsup' ? 'Yay, glad you liked it! 🎉' : 'Ouch, sorry to hear that 😞'}{' '}
                        Got a minute for 3 quick questions? All optional.
                    </p>
                    <input type="hidden" name="voteId" value={voted.voteId} />
                    <input type="hidden" name="voteType" value={voted.voteType} />
                    <label>
                        Why?
                        <textarea ref={whyRef} name="field_1" rows={3} autoComplete="off" />
                    </label>
                    <label>
                        Have a burning question?
                        <textarea name="field_2" rows={2} autoComplete="off" />
                    </label>
                    <fieldset>
                        <legend>Would you recommend this to a friend?</legend>
                        <div className="sparkjoy-radios">
                            <label>
                                <input type="radio" name="field_3" value="yes" /> Yes
                            </label>
                            <label>
                                <input type="radio" name="field_3" value="no" /> No
                            </label>
                        </div>
                    </fieldset>
                    {feedbackErrors.hasErrors && (
                        <p className="sparkjoy-error">That didn't save — mind trying again?</p>
                    )}
                    <button type="submit" disabled={feedbackPending}>
                        {feedbackPending ? 'Sending…' : 'Send feedback'}
                    </button>
                </form>
            </aside>
        );
    }

    return (
        <aside id="feedback" ref={widgetRef} className="sparkjoy" aria-label="Article feedback">
            <form action={voteAction} className="sparkjoy-vote">
                <p className="sparkjoy-prompt">Did you enjoy {title}?</p>
                <input type="hidden" name="articleUrl" value={articleUrl} />
                <div className="sparkjoy-buttons">
                    <button
                        type="submit"
                        name="voteType"
                        value="thumbsdown"
                        disabled={votePending}
                        aria-label="No, I did not enjoy this article"
                        onClick={() => setBurst({ type: 'thumbsdown', key: Date.now() })}
                    >
                        <span aria-hidden="true">👎</span>
                        {downCount}
                        {burst?.type === 'thumbsdown' && (
                            <span key={burst.key} className="sparkjoy-plusone" aria-hidden="true">
                                +1
                            </span>
                        )}
                    </button>
                    <button
                        type="submit"
                        name="voteType"
                        value="thumbsup"
                        disabled={votePending}
                        aria-label="Yes, I enjoyed this article"
                        onClick={() => setBurst({ type: 'thumbsup', key: Date.now() })}
                    >
                        <span aria-hidden="true">👍</span>
                        {upCount}
                        {burst?.type === 'thumbsup' && (
                            <span key={burst.key} className="sparkjoy-plusone" aria-hidden="true">
                                +1
                            </span>
                        )}
                    </button>
                </div>
                {votePending && <p role="status">Saving your vote…</p>}
                {voteErrors.hasErrors && (
                    <p className="sparkjoy-error" role="alert">Vote didn't stick — mind trying again?</p>
                )}
            </form>
        </aside>
    );
}
