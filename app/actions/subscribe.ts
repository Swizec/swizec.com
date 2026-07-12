'use server';

import { createActionClient, ActionError } from '@timber-js/app/server';
import { z } from 'zod';
import { getNewsletterForm } from '../../lib/newsletter-forms';

const action = createActionClient();

const KIT_API = 'https://api.kit.com/v4';

async function kitPost(path: string, body: Record<string, unknown>) {
    const apiKey = process.env.CONVERTKIT_APIKEY_V4;
    if (!apiKey) {
        console.error('CONVERTKIT_APIKEY_V4 is not set');
        throw new ActionError('KIT_ERROR');
    }

    const response = await fetch(`${KIT_API}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset="utf-8"',
            'X-Kit-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        console.error(`Kit API ${path} failed: ${response.status} ${response.statusText}`);
        throw new ActionError('KIT_ERROR');
    }

    return response;
}

// Bots fill hidden fields and submit literal "null" values; humans can't —
// the honeypot is invisible and both real fields are required in the UI.
// Missing/absent fields never reach the action body: schema validation
// rejects them first, so nothing gets subscribed on those either.
function isBot(input: { email: string; first_name: string; website?: string }) {
    if (input.website) return true;
    if (input.email.trim().toLowerCase() === 'null') return true;
    if (input.first_name.trim().toLowerCase() === 'null') return true;
    return false;
}

export const subscribe = action
    .schema(
        z.object({
            email: z.email("That doesn't look like an email address"),
            first_name: z.string().trim().min(1, 'What should I call you?'),
            // Honeypot — hidden from humans, bots fill it
            website: z.string().optional(),
            // Which Kit form to use; resolved server-side so form IDs stay ours
            form_key: z.string().optional(),
        })
    )
    .action(async ({ input }) => {
        // Pretend success so bots can't tell they were filtered
        if (isBot(input)) {
            return { subscribed: true };
        }

        const form = getNewsletterForm(input.form_key);

        // Same two-step Kit v4 flow as the old site (src/api/subscribe-ck.js
        // on master): create an inactive subscriber, then attach them to the
        // form. The form subscription sends the confirmation email and
        // triggers that form's automation.
        await kitPost('/subscribers', {
            email_address: input.email,
            first_name: input.first_name,
            state: 'inactive',
            fields: {
                'Last name': '',
                Birthday: '1970-01-01',
                Source: 'swizec.com',
            },
        });

        await kitPost(`/forms/${form.formId}/subscribers`, {
            email_address: input.email,
        });

        return { subscribed: true };
    });
