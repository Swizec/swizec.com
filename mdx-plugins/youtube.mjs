import { mdxElement, parseUrl } from './helpers.mjs';

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com']);
const YOUTUBE_SHORT_HOSTS = new Set(['youtu.be', 'www.youtu.be']);

function parseTime(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (!match) return null;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const total = hours * 3600 + minutes * 60 + seconds;

  return total > 0 ? String(total) : null;
}

function getYouTubeIdAndParams(url) {
  const parsed = parseUrl(url);
  if (!parsed) return null;

  let videoId = null;

  if (YOUTUBE_SHORT_HOSTS.has(parsed.hostname)) {
    videoId = parsed.pathname.split('/').filter(Boolean)[0] ?? null;
  } else if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    if (parsed.pathname === '/watch') {
      videoId = parsed.searchParams.get('v');
    } else {
      const [kind, id] = parsed.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'live'].includes(kind)) {
        videoId = id;
      }
    }
  }

  if (!videoId) return null;

  const params = new URLSearchParams();
  const start = parsed.searchParams.get('start') ?? parseTime(parsed.searchParams.get('t'));
  const list = parsed.searchParams.get('list');

  if (start) params.set('start', start);
  if (list) params.set('list', list);

  return {
    videoId,
    params: params.toString() || undefined,
  };
}

export function youtubeEmbed(url, context) {
  const youtube = getYouTubeIdAndParams(url);
  if (!youtube) return null;

  context.components.add('YouTubeEmbed');

  return mdxElement('YouTubeEmbed', {
    videoId: youtube.videoId,
    params: youtube.params,
  });
}
