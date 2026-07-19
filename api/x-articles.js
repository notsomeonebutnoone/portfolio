const PROFILE = 'wo0tz0';
const FEED = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${PROFILE}`;

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');

  try {
    const feedResponse = await fetch(FEED, {headers: {'User-Agent': 'Mozilla/5.0'}});
    if (!feedResponse.ok) throw new Error(`X feed returned ${feedResponse.status}`);
    const html = await feedResponse.text();
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
    if (!match) throw new Error('X feed data was not found');
    const data = JSON.parse(match[1]);
    const entries = data?.props?.pageProps?.timeline?.entries || [];
    const articles = entries.flatMap(entry => {
      const tweet = entry?.content?.tweet;
      if (!tweet || tweet.retweeted_status) return [];
      const link = (tweet.entities?.urls || []).find(item => {
        try {
          const hostname = new URL(item.expanded_url).hostname.replace(/^www\./, '');
          return !['x.com', 'twitter.com', 't.co'].includes(hostname);
        } catch { return false; }
      });
      if (!link) return [];
      const title = (tweet.full_text || '').replace(/https?:\/\/\S+/g, '').trim();
      return [{
        title: title || link.display_url,
        url: link.expanded_url,
        source: link.display_url || new URL(link.expanded_url).hostname,
        date: new Date(tweet.created_at).toLocaleDateString('en', {month: 'short', day: 'numeric', year: 'numeric'})
      }];
    }).slice(0, 4);
    return response.status(200).json({articles, available: true, checkedAt: new Date().toISOString()});
  } catch (error) {
    return response.status(200).json({articles: [], available: false, error: 'Recent articles are temporarily unavailable.'});
  }
}
