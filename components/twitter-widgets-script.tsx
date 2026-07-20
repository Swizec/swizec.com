'use client';

import { useEffect } from 'react';

const twitterWidgetsSrc = 'https://platform.twitter.com/widgets.js';

type TwitterWindow = Window & {
  twttr?: {
    widgets?: {
      load?: () => void;
    };
  };
};

function loadWidgets() {
  (window as TwitterWindow).twttr?.widgets?.load?.();
}

export function TwitterWidgetsScript() {
  useEffect(() => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${twitterWidgetsSrc}"]`
    );

    if (existingScript) {
      if ((window as TwitterWindow).twttr?.widgets?.load) {
        loadWidgets();
      } else {
        existingScript.addEventListener('load', loadWidgets, { once: true });
      }

      return () => {
        existingScript.removeEventListener('load', loadWidgets);
      };
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = twitterWidgetsSrc;
    script.charSet = 'utf-8';
    script.onload = loadWidgets;

    document.body.append(script);

    return () => {
      script.onload = null;
    };
  }, []);

  return null;
}
