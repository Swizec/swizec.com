import { defineMdastPlugin } from 'satteri';
import { cleanNewsletter } from './newsletter-cleanup.mjs';

export const satteriNewsletterCleanup = defineMdastPlugin({
  name: 'swizec-newsletter-cleanup',
  before(root, ctx) {
    if (!/\[(?:name|sparkjoy)\||PS:/i.test(ctx.source)) return;
    const cleaned = cleanNewsletter(root);
    if (cleaned !== root) ctx.replaceNode(root, cleaned);
  },
});
