// Official, read-only APIs. Credentials never leave this server module.
const TTL = 15 * 60 * 1000;
const cache = new Map();
const pending = new Map();
export const accounts = {
  youtube: { name: 'YouTube', handle: '@creyn1um', url: 'https://www.youtube.com/@creyn1um' },
  instagram: { name: 'Instagram', handle: '@creyn1um', url: 'https://www.instagram.com/creyn1um/' },
  twitter: { name: 'Twitter / X', handle: '@wo0tz0', url: 'https://x.com/wo0tz0' },
};

export const count = value => value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) ? null : Math.max(0, Number(value));
const metric = (label, value) => ({ label, value: count(value) });

export function summarize(items) {
  const recent = [...items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const popular = [...items].filter(item => item.views !== null).sort((a, b) => b.views - a.views);
  const videos = items.filter(item => item.type === 'video' && item.videoViews !== null).sort((a, b) => b.videoViews - a.videoViews);
  return { recent: recent.slice(0, 6), popular: popular.slice(0, 3), topVideo: videos[0] || null, fetchedCount: items.length, rankedCount: popular.length };
}

async function json(url, headers, signal) {
  const response = await fetch(url, { headers, signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) });
  if (!response.ok) throw new Error('Platform request failed');
  const body = await response.json();
  if (body.error) throw new Error('Platform request failed');
  return body;
}

async function youtube(env, signal) {
  const get = (path, params) => json(`https://www.googleapis.com/youtube/v3/${path}?${new URLSearchParams({ ...params, key: env.YOUTUBE_API_KEY })}`, {}, signal);
  const channel = (await get('channels', { part: 'snippet,statistics,contentDetails', forHandle: accounts.youtube.handle })).items?.[0];
  if (!channel) throw new Error('Channel unavailable');
  const items = [];
  let pageToken = '';
  // Walk the uploads playlist so older popular videos are included, up to 500.
  for (let page = 0; page < 10; page++) {
    const feed = await get('playlistItems', { part: 'contentDetails', playlistId: channel.contentDetails.relatedPlaylists.uploads, maxResults: '50', ...(pageToken ? { pageToken } : {}) });
    const ids = (feed.items || []).map(item => item.contentDetails.videoId);
    if (ids.length) {
      const videos = await get('videos', { part: 'snippet,statistics', id: ids.join(',') });
      for (const video of videos.items || []) {
        const stats = video.statistics || {};
        items.push({ id: video.id, title: video.snippet.title, url: `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`, thumbnail: video.snippet.thumbnails?.high?.url, publishedAt: video.snippet.publishedAt, type: 'video', views: count(stats.viewCount), videoViews: count(stats.viewCount), viewLabel: 'views', likes: count(stats.likeCount), comments: count(stats.commentCount) });
      }
    }
    pageToken = feed.nextPageToken;
    if (!pageToken) break;
  }
  return { ...summarize(items), metrics: [metric('Subscribers', channel.statistics.hiddenSubscriberCount ? null : channel.statistics.subscriberCount), metric('Channel views', channel.statistics.viewCount), metric('Videos', channel.statistics.videoCount)], coverage: pageToken ? 'Compared the latest 500 available uploads.' : 'Compared all uploads returned by YouTube.', partial: false };
}

async function instagram(env, signal) {
  const version = env.INSTAGRAM_API_VERSION || 'v23.0';
  if (!/^v\d+\.\d+$/.test(version) || !/^\d+$/.test(env.INSTAGRAM_USER_ID)) throw new Error('Invalid Instagram configuration');
  const base = `https://graph.instagram.com/${version}/`;
  const get = (path, params) => json(`${base}${path}?${new URLSearchParams(params)}`, { Authorization: `Bearer ${env.INSTAGRAM_ACCESS_TOKEN}` }, signal);
  const [profile, feed] = await Promise.all([
    get(env.INSTAGRAM_USER_ID, { fields: 'username,followers_count,media_count' }),
    get(`${env.INSTAGRAM_USER_ID}/media`, { fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count', limit: '50' }),
  ]);
  if (profile.username?.toLowerCase() !== accounts.instagram.handle.slice(1)) throw new Error('Wrong Instagram account');
  const media = feed.data || [];
  const items = [];
  let missingInsights = false;
  // Bound parallel requests; unsupported insights remain unavailable, never zero.
  for (let offset = 0; offset < media.length; offset += 5) {
    items.push(...await Promise.all(media.slice(offset, offset + 5).map(async item => {
      let views = null;
      try {
        const insights = await get(`${item.id}/insights`, { metric: 'views' });
        views = count(insights.data?.find(entry => entry.name === 'views')?.values?.[0]?.value);
      } catch { missingInsights = true; }
      if (views === null) missingInsights = true;
      return { id: item.id, title: item.caption || (item.media_type === 'VIDEO' ? 'Instagram video' : 'Instagram post'), url: item.permalink, thumbnail: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url, publishedAt: item.timestamp, type: item.media_type === 'VIDEO' ? 'video' : 'post', views, videoViews: item.media_type === 'VIDEO' ? views : null, viewLabel: 'views', likes: count(item.like_count), comments: count(item.comments_count) };
    })));
  }
  return { ...summarize(items), metrics: [metric('Followers', profile.followers_count), metric('Posts', profile.media_count)], coverage: `Compared ${items.length} recent posts (up to 50); only posts with available view counts are ranked.`, partial: missingInsights };
}

async function twitter(env, signal) {
  const get = (path, params) => json(`https://api.x.com/2/${path}?${new URLSearchParams(params)}`, { Authorization: `Bearer ${env.X_BEARER_TOKEN}` }, signal);
  const profile = (await get(`users/by/username/${accounts.twitter.handle.slice(1)}`, { 'user.fields': 'public_metrics' })).data;
  if (!profile) throw new Error('Profile unavailable');
  const feed = await get(`users/${profile.id}/tweets`, { max_results: '100', exclude: 'retweets,replies', 'tweet.fields': 'created_at,public_metrics,attachments', expansions: 'attachments.media_keys', 'media.fields': 'type,url,preview_image_url,public_metrics' });
  if (feed.errors?.length) throw new Error('Incomplete platform response');
  const media = new Map((feed.includes?.media || []).map(item => [item.media_key, item]));
  const items = (feed.data || []).map(item => {
    const attachments = (item.attachments?.media_keys || []).map(key => media.get(key)).filter(Boolean);
    const video = attachments.filter(asset => asset.type === 'video').sort((a, b) => (count(b.public_metrics?.view_count) ?? -1) - (count(a.public_metrics?.view_count) ?? -1))[0];
    const preview = video || attachments[0];
    const stats = item.public_metrics || {};
    return { id: item.id, title: item.text, url: `https://x.com/${accounts.twitter.handle.slice(1)}/status/${encodeURIComponent(item.id)}`, thumbnail: preview?.preview_image_url || preview?.url, publishedAt: item.created_at, type: video ? 'video' : 'post', views: count(stats.impression_count), videoViews: count(video?.public_metrics?.view_count), viewLabel: 'impressions', likes: count(stats.like_count), comments: count(stats.reply_count), reposts: count(stats.retweet_count) };
  });
  return { ...summarize(items), metrics: [metric('Followers', profile.public_metrics?.followers_count), metric('Posts', profile.public_metrics?.tweet_count)], coverage: `Compared ${items.length} recent original posts (up to 100). Posts rank by impressions; videos rank by video views.`, partial: items.some(item => item.views === null) };
}

const providers = { youtube, instagram, twitter };
const required = { youtube: ['YOUTUBE_API_KEY'], instagram: ['INSTAGRAM_USER_ID', 'INSTAGRAM_ACCESS_TOKEN'], twitter: ['X_BEARER_TOKEN'] };

export async function loadPlatform(platform, env = process.env) {
  const account = accounts[platform];
  if (!account) throw new Error('Unknown platform');
  const base = { platform, ...account, recent: [], popular: [], topVideo: null, metrics: [], fetchedCount: 0, rankedCount: 0, checkedAt: null };
  if (required[platform].some(key => !env[key])) return { ...base, status: 'disconnected', message: 'Live updates are not connected yet. Explore the profile for current work.' };
  try {
    const result = await providers[platform](env, AbortSignal.timeout(45000));
    return { ...base, ...result, status: result.partial ? 'partial' : 'live', checkedAt: new Date().toISOString(), message: result.partial ? 'Some view counts are unavailable from this platform.' : '' };
  } catch {
    return { ...base, status: 'unavailable', message: 'Live updates are temporarily unavailable. Please try again later.' };
  }
}

async function cachedPlatform(platform) {
  const previous = cache.get(platform);
  if (previous?.expires > Date.now()) return previous.value;
  if (pending.has(platform)) return pending.get(platform);
  const task = loadPlatform(platform).then(result => {
    const failed = result.status === 'unavailable';
    const value = failed && previous?.value.checkedAt
      ? { ...previous.value, status: 'stale', message: 'Refresh unavailable. Showing the last successful update.' }
      : result;
    cache.set(platform, { value, expires: Date.now() + (failed || result.status === 'disconnected' ? 60000 : TTL) });
    return value;
  }).finally(() => pending.delete(platform));
  pending.set(platform, task);
  return task;
}

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed' });
  }
  const platform = new URL(request.url, 'http://localhost').searchParams.get('platform');
  if (!Object.hasOwn(accounts, platform)) return response.status(400).json({ error: 'Choose youtube, instagram, or twitter.' });
  return response.status(200).json(await cachedPlatform(platform));
}
