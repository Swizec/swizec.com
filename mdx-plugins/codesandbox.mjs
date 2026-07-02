import { mdxElement, parseUrl } from './helpers.mjs';

const CODESANDBOX_HOSTS = new Set(['codesandbox.io', 'www.codesandbox.io']);

function getCodeSandboxId(url) {
  const parsed = parseUrl(url);
  if (!parsed || !CODESANDBOX_HOSTS.has(parsed.hostname)) return null;

  const [kind, sandboxId] = parsed.pathname.split('/').filter(Boolean);
  if (!['s', 'embed'].includes(kind) || !sandboxId) return null;

  return sandboxId;
}

export function codeSandboxEmbed(url, context) {
  const sandboxId = getCodeSandboxId(url);
  if (!sandboxId) return null;

  context.components.add('CodeSandboxEmbed');

  return mdxElement('CodeSandboxEmbed', { sandboxId });
}
