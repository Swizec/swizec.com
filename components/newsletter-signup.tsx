'use client';

import { useActionState } from '@timber-js/app/client';
import { subscribe } from '../app/_actions/subscribe';
import { getNewsletterForm } from '../lib/newsletter-forms';

interface NewsletterSignupProps {
    /** content_upgrade frontmatter value; omit for the default newsletter */
    formKey?: string;
}

export function NewsletterSignup({ formKey }: NewsletterSignupProps) {
    const form = getNewsletterForm(formKey);
    const [state, action, pending, errors] = useActionState(subscribe, null);

    const subscribed = Boolean(
        state && 'data' in state && (state.data as { subscribed?: boolean } | undefined)?.subscribed
    );

    if (subscribed) {
        return (
            <aside className="newsletter-signup newsletter-signup-success">
                <h3>One more step — confirm your email 💌</h3>
                <p>
                    I just sent a confirmation link to your inbox. Click that and you're in! Don't
                    see an email? Check your spam or promotions folder – or email{' '}
                    <a href="mailto:hi@swizec.com">hi@swizec.com</a> and I'll sort you out.
                </p>
            </aside>
        );
    }

    const firstNameError = errors.getFieldError('first_name');
    const emailError = errors.getFieldError('email');

    return (
        <aside className="newsletter-signup">
            <h3>{form.headline}</h3>
            <p>{form.description}</p>
            <form action={action}>
                {formKey ? <input type="hidden" name="form_key" value={formKey} /> : null}

                {/* Honeypot: invisible to humans, bots fill it and get silently dropped */}
                <div className="newsletter-signup-honeypot" aria-hidden="true">
                    <label>
                        Website
                        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                </div>

                <input
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    aria-label="First name"
                    required
                    autoComplete="given-name"
                    disabled={pending}
                />
                <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    required
                    autoComplete="email"
                    disabled={pending}
                />
                <button type="submit" disabled={pending}>
                    {pending ? (
                        <>
                            <span className="newsletter-signup-spinner" aria-hidden="true" />
                            Subscribing…
                        </>
                    ) : (
                        form.submitText
                    )}
                </button>

                {firstNameError && (
                    <p role="alert" className="newsletter-signup-error">
                        {firstNameError}
                    </p>
                )}
                {emailError && (
                    <p role="alert" className="newsletter-signup-error">
                        {emailError}
                    </p>
                )}
                {errors.serverError && (
                    <p role="alert" className="newsletter-signup-error">
                        Ouch — the subscription didn't go through. That's my email service
                        hiccuping, not you. Give it another try in a few seconds, or email{' '}
                        <a href="mailto:hi@swizec.com">hi@swizec.com</a> and I'll add you by
                        hand.
                    </p>
                )}
            </form>
        </aside>
    );
}
