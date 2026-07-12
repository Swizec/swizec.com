import { defineSchema } from '@timber-js/app/params';
import { codec } from '@timber-js/app/codec';

export default defineSchema({
    segmentParams: {
        // Catch-all article route: /pages content at any depth
        '[...slug]': codec.stringArray,
        // Category listing pages: /categories/[categorySlug]
        '[categorySlug]': codec.slug,
    },
});
