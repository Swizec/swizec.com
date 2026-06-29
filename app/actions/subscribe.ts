'use server';

import { createActionClient } from '@timber-js/app/server';
import { z } from 'zod';
import { getContentUpgrade } from '../../lib/content-upgrades';

const action = createActionClient({ middleware: async () => ({}) });

const CK_API = 'https://api.kit.com/v4';

async function ckPost(path: string, body: Record<string, unknown>) {
    const apiKey = process.env.CONVERTKIT_APIKEY_V4;
    if (!apiKey) {
        throw new Error('CONVERTKIT_APIKEY_V4 is not set');
    }
    const res = await fetch(`${CK_API}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Kit-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        throw new Error(`ConvertKit API error: ${res.status} ${res.statusText}`);
    }
    return res;
}

export const subscribe = action
    .schema(
        z.object({
            email: z.string().email(),
            first_name: z.string().min(1),
            // upgrade_key drives which ConvertKit form to use; validated server-side
            upgrade_key: z.string().optional(),
        })
    )
    .action(async ({ input }) => {
        const { email, first_name, upgrade_key } = input;

        // Bot detection: null in either field = silent drop
        if (
            email.toLowerCase() === 'null' ||
            first_name.toLowerCase() === 'null'
        ) {
            return { success: true };
        }

        const upgrade = getContentUpgrade(upgrade_key);

        await ckPost('/subscribers', {
            email_address: email,
            first_name,
            state: 'inactive',
            fields: {
                'Last name': '',
                Birthday: '1970-01-01',
                Source: 'swizec.com',
            },
        });

        await ckPost(`/forms/${upgrade.formId}/subscribers`, {
            email_address: email,
        });

        return { success: true };
    });
