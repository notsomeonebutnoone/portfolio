export function initSocials(root) {
  const metrics = root.querySelector('#youtube-metrics');
  const status = root.querySelector('#feed-status');
  const button = root.querySelector('#refresh-socials');
  const labels = ['Subscribers', 'Channel views', 'Videos'];
  const format = new Intl.NumberFormat('en');
  let saved = null;
  let refreshing = false;
  let lastAttempt = 0;
  const feeds = ['latest', 'recent', 'top', 'popular'].map(name => root.querySelector('#youtube-' + name));

  function element(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function safeUrl(value) {
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
    catch { return ''; }
  }

  function videoCard(video) {
    const card = element('article', 'social-post');
    const preview = element('a', 'post-preview');
    preview.href = safeUrl(video.url) || 'https://www.youtube.com/@creyn1um';
    preview.target = '_blank';
    preview.rel = 'noopener noreferrer';
    preview.setAttribute('aria-label', 'Watch ' + video.title);
    const fallback = () => preview.replaceChildren(element('span', 'post-placeholder', 'Watch on YouTube ↗'));
    if (safeUrl(video.thumbnail)) {
      const image = element('img', '');
      image.src = safeUrl(video.thumbnail);
      image.alt = '';
      image.loading = 'lazy';
      image.referrerPolicy = 'no-referrer';
      image.addEventListener('error', fallback, { once: true });
      preview.append(image);
    } else fallback();
    const body = element('div', 'post-body');
    const heading = element('h4', '');
    const link = element('a', '', video.title);
    link.href = preview.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    heading.append(link);
    body.append(heading);
    const published = new Date(video.publishedAt);
    if (Number.isFinite(published.getTime())) {
      const time = element('time', '', published.toLocaleDateString());
      time.dateTime = published.toISOString();
      body.append(time);
    }
    const count = value => Number.isFinite(value) ? format.format(value) : '—';
    const views = element('p', 'post-views');
    views.append(element('strong', '', count(video.views)), ' views');
    body.append(views, element('p', 'post-engagement', `${count(video.likes)} likes · ${count(video.comments)} comments`));
    card.append(preview, body);
    return card;
  }

  function renderFeeds(data) {
    const groups = [data.recent.slice(0, 1), data.recent.slice(1), data.topVideo ? [data.topVideo] : [], data.popular.filter(video => video.id !== data.topVideo?.id)];
    feeds.forEach((feed, index) => {
      feed.replaceChildren(...(groups[index].length ? groups[index].map(videoCard) : [element('p', 'social-note', 'No videos available.')]));
    });
    root.querySelector('#youtube-coverage').textContent = data.coverage || '';
  }

  function render(values = []) {
    metrics.replaceChildren(...labels.map(label => {
      const item = document.createElement('div');
      const title = document.createElement('dt');
      const value = document.createElement('dd');
      const count = values.find(metric => metric.label === label)?.value;
      title.textContent = label === 'Channel views' ? 'Total views' : label;
      value.textContent = Number.isFinite(count) ? format.format(count) : '—';
      item.append(title, value);
      return item;
    }));
  }

  async function refresh() {
    if (refreshing) return;
    refreshing = true;
    lastAttempt = Date.now();
    button.disabled = true;
    metrics.setAttribute('aria-busy', 'true');
    feeds.forEach(feed => feed.setAttribute('aria-busy', 'true'));
    status.textContent = 'Updating…';
    try {
      const response = await fetch('/api/socials?platform=youtube', {
        signal: AbortSignal.timeout(55000), cache: 'no-store',
      });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (data.platform !== 'youtube' || !Array.isArray(data.metrics)
          || !Array.isArray(data.recent) || !Array.isArray(data.popular)
          || !['live', 'partial', 'stale'].includes(data.status)) throw new Error('Unavailable');
      saved = data.metrics;
      render(saved);
      renderFeeds(data);
      const checkedAt = new Date(data.checkedAt);
      status.textContent = data.status === 'stale' ? 'Showing last saved stats.'
        : Number.isFinite(checkedAt.getTime()) ? 'Updated ' + checkedAt.toLocaleString() : 'Stats updated.';
    } catch {
      if (!saved) feeds.forEach(feed => feed.replaceChildren(element('p', 'social-note', 'Videos unavailable. Try refreshing.')));
      status.textContent = saved ? 'Refresh unavailable. Showing last saved stats.' : 'Stats unavailable. Please try again.';
    } finally {
      refreshing = false;
      button.disabled = false;
      metrics.setAttribute('aria-busy', 'false');
      feeds.forEach(feed => feed.setAttribute('aria-busy', 'false'));
    }
  }

  button.addEventListener('click', refresh);
  const visible = () => !document.hidden && document.documentElement.dataset.track === 'socials';
  setInterval(() => { if (visible()) refresh(); }, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (visible() && Date.now() - lastAttempt >= 15 * 60 * 1000) refresh();
  });
  render();
  refresh();
}
