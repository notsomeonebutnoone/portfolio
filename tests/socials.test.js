import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { count, summarize, loadPlatform } from '../api/socials.js';

function mockFetch(t, responder) {
  t.mock.method(globalThis, 'fetch', async (input, options) => {
    const result = responder(new URL(input), options);
    return { ok: true, json: async () => result };
  });
}

test('missing metrics remain unknown and zero remains zero', () => {
  for (const value of [undefined, null, '', 'no count']) assert.equal(count(value), null);
  assert.equal(count('0'), 0);
  assert.equal(count('2800000'), 2800000);
});

test('recent posts, popular posts and top videos use distinct ordering', () => {
  const result = summarize([
    { id: 'popular-post', publishedAt: '2026-01-01', views: 1000, type: 'post', videoViews: null },
    { id: 'popular-video', publishedAt: '2026-02-01', views: 400, type: 'video', videoViews: 300 },
    { id: 'latest', publishedAt: '2026-03-01', views: null, type: 'video', videoViews: null },
  ]);
  assert.equal(result.recent[0].id, 'latest');
  assert.equal(result.popular[0].id, 'popular-post');
  assert.equal(result.topVideo.id, 'popular-video');
  assert.equal(result.rankedCount, 2);
});

test('disconnected providers make no network requests and expose no invented data', async t => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('No request expected'));
  for (const platform of ['youtube', 'instagram', 'twitter']) {
    const result = await loadPlatform(platform, {});
    assert.equal(result.status, 'disconnected');
    assert.equal(result.checkedAt, null);
    assert.deepEqual(result.metrics, []);
    assert.deepEqual(result.popular, []);
  }
});

test('YouTube paginates uploads and discovers an older most viewed video', async t => {
  mockFetch(t, url => {
    if (url.pathname.endsWith('/channels')) return { items: [{ statistics: { hiddenSubscriberCount: true, viewCount: '900', videoCount: '2' }, contentDetails: { relatedPlaylists: { uploads: 'uploads' } } }] };
    if (url.pathname.endsWith('/playlistItems')) return url.searchParams.has('pageToken') ? { items: [{ contentDetails: { videoId: 'old' } }] } : { items: [{ contentDetails: { videoId: 'new' } }], nextPageToken: 'page2' };
    const old = url.searchParams.get('id') === 'old';
    return { items: [{ id: old ? 'old' : 'new', snippet: { title: 'Video', publishedAt: old ? '2025-01-01' : '2026-01-01' }, statistics: { viewCount: old ? '800' : '100', likeCount: '0' } }] };
  });
  const result = await loadPlatform('youtube', { YOUTUBE_API_KEY: 'test' });
  assert.equal(result.status, 'live');
  assert.equal(result.recent[0].id, 'new');
  assert.equal(result.popular[0].id, 'old');
  assert.equal(result.metrics[0].value, null);
  assert.equal(result.popular[0].likes, 0);
  assert.match(result.coverage, /all uploads/);
});

test('Instagram still shows recent work if insight access fails', async t => {
  mockFetch(t, url => {
    if (url.pathname.endsWith('/insights')) throw new Error('Private provider error and token');
    if (url.pathname.endsWith('/media')) return { data: [{ id: '10', caption: 'Reel', media_type: 'VIDEO', timestamp: '2026-03-01', permalink: 'https://www.instagram.com/reel/abc/', like_count: 5 }] };
    return { username: 'creyn1um', followers_count: 10, media_count: 1 };
  });
  const result = await loadPlatform('instagram', { INSTAGRAM_USER_ID: '123', INSTAGRAM_ACCESS_TOKEN: 'test' });
  assert.equal(result.status, 'partial');
  assert.equal(result.recent.length, 1);
  assert.equal(result.recent[0].views, null);
  assert.deepEqual(result.popular, []);
  assert.equal(result.topVideo, null);
  assert.equal(JSON.stringify(result).includes('Private provider error'), false);
});

test('Instagram insight views preserve zero counts', async t => {
  mockFetch(t, url => {
    if (url.pathname.endsWith('/insights')) return { data: [{ name: 'views', values: [{ value: 0 }] }] };
    if (url.pathname.endsWith('/media')) return { data: [{ id: '10', media_type: 'VIDEO', timestamp: '2026-03-01' }] };
    return { username: 'creyn1um', followers_count: 10, media_count: 1 };
  });
  const result = await loadPlatform('instagram', { INSTAGRAM_USER_ID: '123', INSTAGRAM_ACCESS_TOKEN: 'test' });
  assert.equal(result.status, 'live');
  assert.equal(result.topVideo.videoViews, 0);
  assert.equal(result.popular[0].views, 0);
});

test('server cache shares requests and preserves dated data after a failed refresh', async t => {
  const original = process.env.YOUTUBE_API_KEY;
  process.env.YOUTUBE_API_KEY = 'test-cache';
  t.after(() => { if (original === undefined) delete process.env.YOUTUBE_API_KEY; else process.env.YOUTUBE_API_KEY = original; });
  let now = Date.now();
  let requests = 0;
  let failing = false;
  t.mock.method(Date, 'now', () => now);
  mockFetch(t, url => {
    requests++;
    if (failing) throw new Error('Provider unavailable');
    if (url.pathname.endsWith('/channels')) return { items: [{ statistics: {}, contentDetails: { relatedPlaylists: { uploads: 'uploads' } } }] };
    return { items: [] };
  });
  async function request() {
    const response = { setHeader() {}, status() { return this; }, json(data) { this.data = data; } };
    await handler({ method: 'GET', url: '/api/socials?platform=youtube' }, response);
    return response.data;
  }
  const [first, second] = await Promise.all([request(), request()]);
  assert.equal(requests, 2);
  assert.equal(first.status, 'live');
  assert.equal(second.checkedAt, first.checkedAt);
  now += 16 * 60 * 1000;
  failing = true;
  const stale = await request();
  assert.equal(stale.status, 'stale');
  assert.equal(stale.checkedAt, first.checkedAt);
  await request();
  assert.equal(requests, 3);
});

test('X separates impressions from video plays and finds video after a photo', async t => {
  mockFetch(t, url => {
    if (url.pathname.includes('/by/username/')) return { data: { id: '42', public_metrics: { followers_count: 100, tweet_count: 8 } } };
    assert.equal(url.searchParams.get('exclude'), 'retweets,replies');
    return { data: [
      { id: '1', text: 'Popular text', created_at: '2026-02-01', public_metrics: { impression_count: 1000 } },
      { id: '2', text: 'Video', created_at: '2026-03-01', attachments: { media_keys: ['photo', 'video'] }, public_metrics: { impression_count: 100, like_count: 5, reply_count: 2, retweet_count: 1 } },
    ], includes: { media: [{ media_key: 'photo', type: 'photo', url: 'https://example.com/photo.jpg' }, { media_key: 'video', type: 'video', public_metrics: { view_count: 60 } }] } };
  });
  const result = await loadPlatform('twitter', { X_BEARER_TOKEN: 'test' });
  assert.equal(result.popular[0].id, '1');
  assert.equal(result.topVideo.id, '2');
  assert.equal(result.topVideo.videoViews, 60);
  assert.equal(result.topVideo.views, 100);
  assert.equal(result.topVideo.viewLabel, 'impressions');
});

test('provider failures expose no token or upstream error text', async t => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('SECRET_TOKEN'); });
  const result = await loadPlatform('youtube', { YOUTUBE_API_KEY: 'SECRET_TOKEN' });
  assert.equal(result.status, 'unavailable');
  assert.equal(JSON.stringify(result).includes('SECRET_TOKEN'), false);
});

test('endpoint rejects unsupported methods and prototype-like platform keys', async () => {
  const response = () => ({ code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; } });
  const post = response();
  await handler({ method: 'POST', url: '/api/socials?platform=youtube' }, post);
  assert.equal(post.code, 405);
  assert.equal(post.headers.Allow, 'GET');
  for (const platform of ['__proto__', 'constructor', 'other', '']) {
    const res = response();
    await handler({ method: 'GET', url: `/api/socials?platform=${platform}` }, res);
    assert.equal(res.code, 400);
  }
});
