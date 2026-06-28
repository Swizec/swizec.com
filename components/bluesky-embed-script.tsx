'use client';

import { useEffect } from 'react';

const bskyEmbedSrc = 'https://embed.bsky.app/static/embed.js';

export function BlueskyEmbedScript() {
  useEffect(() => {
    if (document.querySelector<HTMLScriptElement>(`script[src="${bskyEmbedSrc}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = bskyEmbedSrc;
    script.charSet = 'utf-8';
    document.body.append(script);
  }, []);

  return null;
}
