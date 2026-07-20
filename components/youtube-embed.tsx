'use client';

import { createElement, useEffect } from 'react';
import 'lite-youtube-embed/src/lite-yt-embed.css';

type YouTubeEmbedProps = {
  videoId: string;
  params?: string;
  title?: string;
};

let liteYouTubePromise: Promise<unknown> | undefined;

function loadLiteYouTube() {
  if (typeof window === 'undefined') return;

  liteYouTubePromise ??= import('lite-youtube-embed/src/lite-yt-embed.js');
}

export function YouTubeEmbed({ videoId, params, title = 'YouTube video' }: YouTubeEmbedProps) {
  const playLabel = `Play: ${title}`;

  useEffect(() => {
    loadLiteYouTube();
  }, []);

  return (
    <div className="swizec-embed swizec-embed-youtube">
      {createElement('lite-youtube', {
        videoid: videoId,
        params,
        title,
        playlabel: playLabel,
        style: {
          backgroundImage: `url("https://i.ytimg.com/vi/${videoId}/hqdefault.jpg")`,
        },
      }, (
        <a className="lyt-playbtn" href={`https://www.youtube.com/watch?v=${videoId}`} title={playLabel}>
          <span className="lyt-visually-hidden">{playLabel}</span>
        </a>
      ))}
    </div>
  );
}
