import {readFile, writeFile} from 'node:fs/promises';

const profile = 'wo0tz0';
const output = new URL('../data/x-articles.json', import.meta.url);
const feed = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${profile}`;
try {
const response = await fetch(feed, {headers: {'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'en-US,en;q=0.9'}});
if (!response.ok) {
  throw new Error(`X feed returned ${response.status}`);
}
const html = await response.text();
const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
if (!match) {
  throw new Error('X feed data was not found');
}
const entries = JSON.parse(match[1])?.props?.pageProps?.timeline?.entries || [];
const articles = entries.flatMap(entry => {
  const tweet = entry?.content?.tweet;
  if (!tweet || tweet.retweeted_status) return [];
  const link = (tweet.entities?.urls || []).find(item => {
    try {
      const host = new URL(item.expanded_url).hostname.replace(/^www\./, '');
      return !['x.com', 'twitter.com', 't.co'].includes(host);
    } catch { return false; }
  });
  if (!link) return [];
  return [{
    title: (tweet.full_text || '').replace(/https?:\/\/\S+/g, '').trim() || link.display_url,
    url: link.expanded_url,
    source: link.display_url || new URL(link.expanded_url).hostname,
    date: new Date(tweet.created_at).toLocaleDateString('en', {month: 'short', day: 'numeric', year: 'numeric'})
  }];
}).slice(0, 4);
const next = `${JSON.stringify({articles}, null, 2)}\n`;
const current = await readFile(output, 'utf8').catch(() => '');
if (current !== next) await writeFile(output, next);
} catch (error) {
  console.warn(`${error.message}; keeping the previous article snapshot.`);
}
