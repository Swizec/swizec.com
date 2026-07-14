import { defineSearchParams } from '@timber-js/app/search-params';
import { z } from 'zod';

// Shared search params for every article-archive listing page:
// /blog?page=3, /categories/react?year=2019&month=5, etc.
// Invalid values fall back to defaults instead of erroring.
export const archiveParams = defineSearchParams(
    z.object({
        page: z.coerce.number().int().min(1).catch(1).default(1),
        year: z.coerce.number().int().min(2000).max(2100).optional().catch(undefined),
        month: z.coerce.number().int().min(1).max(12).optional().catch(undefined),
    })
);
