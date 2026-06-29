'use client';

import { useActionState } from '@timber-js/app/client';
import { subscribe } from '../app/actions/subscribe';
import type { ContentUpgrade } from '../lib/content-upgrades';

interface NewsletterFormProps {
    upgrade: ContentUpgrade;
    upgradeKey?: string;
}

export function NewsletterForm({ upgrade, upgradeKey }: NewsletterFormProps) {
    const [state, action, pending, errors] = useActionState(subscribe, null);

    if (state?.data?.success) {
        return (
            <div>
                <p>
                    <strong>You're in!</strong> Check your inbox to confirm your subscription.
                </p>
            </div>
        );
    }

    return (
        <section>
            <h3>{upgrade.headline}</h3>
            <p>{upgrade.description}</p>
            <form action={action}>
                {upgradeKey && (
                    <input type="hidden" name="upgrade_key" value={upgradeKey} />
                )}
                <div>
                    <input
                        name="first_name"
                        type="text"
                        placeholder="First name"
                        required
                        autoComplete="given-name"
                    />
                    {errors.getFieldError('first_name') && (
                        <p role="alert">{errors.getFieldError('first_name')}</p>
                    )}
                </div>
                <div>
                    <input
                        name="email"
                        type="email"
                        placeholder="Email address"
                        required
                        autoComplete="email"
                    />
                    {errors.getFieldError('email') && (
                        <p role="alert">{errors.getFieldError('email')}</p>
                    )}
                </div>
                {errors.serverError && (
                    <p role="alert">
                        Something went wrong. Please try again.
                    </p>
                )}
                <button type="submit" disabled={pending}>
                    {pending ? 'Subscribing…' : upgrade.submitText}
                </button>
            </form>
        </section>
    );
}
