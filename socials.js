export function initSocials(root) {
const platforms = [
  { platform: 'youtube', name: 'YouTube', handle: '@creyn1um', url: 'https://www.youtube.com/@creyn1um', icon: 'youtube' },
  { platform: 'instagram', name: 'Instagram', handle: '@creyn1um', url: 'https://www.instagram.com/creyn1um/', icon: 'instagram' },
  { platform: 'twitter', name: 'Twitter / X', handle: '@wo0tz0', url: 'https://x.com/wo0tz0', icon: 'x' },
];
const state = new Map(platforms.map(platform => [platform.platform, { ...platform, status: 'loading', recent: [], popular: [], metrics: [] }]));
const $ = id => root.querySelector(`#${id}`);
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const url = value => { try { const parsed = new URL(value); return parsed.protocol === 'https:' ? escape(parsed.href) : ''; } catch { return ''; } };
const format = value => Number.isFinite(value) ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value) : '—';
const exact = value => Number.isFinite(value) ? new Intl.NumberFormat('en').format(value) : 'Unavailable';
const date = value => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
const statusLabels = { loading: 'Checking…', live: 'Connected', partial: 'Limited metrics', stale: 'Last saved update', unavailable: 'Updates unavailable', disconnected: 'Not connected' };
const link = (href, text, className = '', label = '') => `<a class="${className}" href="${url(href)}"${label ? ` aria-label="${escape(label)}"` : ''} target="_blank" rel="noopener noreferrer">${text}</a>`;
const skeleton = () => '<div class="social-skeleton" aria-label="Loading content"><span></span><span></span><span></span></div>';

const platformIcon = platform => {
  const icon = platforms.find(item => item.platform === platform.platform)?.icon || 'x';
  return `<img class="platform-icon icon-${icon}" src="/assets/social-icons/${icon}.svg" alt="" width="24" height="24" aria-hidden="true">`;
};

function empty(platform, popular = false) {
  if (platform.status === 'loading') return skeleton();
  const message = ['live', 'partial'].includes(platform.status)
    ? popular ? 'No view counts are available to rank this content yet.' : 'No public uploads were returned by this platform.'
    : platform.message || 'Live updates are currently unavailable.';
  return `<div class="social-empty"><p>${escape(message)}</p>${link(platform.url, `Explore ${escape(platform.name)} ↗`)}</div>`;
}

function card(item, platform, index, video = false) {
  const views = video ? item.videoViews : item.views;
  const viewLabel = video ? 'video views' : item.viewLabel;
  const thumbnail = url(item.thumbnail);
  return `<article class="social-post">
    ${link(item.url, thumbnail ? `<img src="${thumbnail}" alt="" loading="lazy" referrerpolicy="no-referrer">` : `<span class="post-placeholder" aria-hidden="true">${platformIcon(platform)}</span>`, 'post-preview', `View ${item.title} on ${platform.name}`)}
    <div class="post-body"><div class="post-meta"><span>${escape(platform.name)} · ${escape(item.type)}</span>${index === 0 ? '<span class="social-highlight">Most recent</span>' : ''}</div>
    <h4>${link(item.url, escape(item.title))}</h4><time datetime="${escape(item.publishedAt)}">${date(item.publishedAt)}</time>
    <div class="post-views" title="${exact(views)} ${escape(viewLabel)}"><strong>${format(views)}</strong> ${escape(viewLabel)}${views === null ? ' unavailable' : ''}</div>
    <p class="post-engagement">${format(item.likes)} likes · ${format(item.comments)} ${platform.platform === 'twitter' ? 'replies' : 'comments'}${Number.isFinite(item.reposts) ? ` · ${format(item.reposts)} reposts` : ''}</p>
    ${platform.platform === 'twitter' && !video && item.type === 'video' ? `<p class="post-engagement">${format(item.videoViews)} video views</p>` : ''}
    </div></article>`;
}

function render() {
  const values = [...state.values()];
  $('platform-grid').innerHTML = values.map(platform => `<article class="social-panel platform-${platform.platform}">
    <div class="platform-heading"><span class="platform-mark" aria-hidden="true">${platformIcon(platform)}</span><span class="feed-badge" data-status="${platform.status}">${statusLabels[platform.status]}</span></div>
    <h3>${link(platform.url, `${escape(platform.name)} ↗`)}</h3><p>${escape(platform.handle)}</p>
    ${platform.status === 'loading' ? skeleton() : `<dl class="social-metrics">${platform.metrics.map(metric => `<div><dt>${escape(metric.label)}</dt><dd title="${exact(metric.value)}">${format(metric.value)}</dd></div>`).join('')}</dl>`}
    ${platform.message ? `<p class="social-note">${escape(platform.message)}</p>` : ''}
    ${platform.checkedAt ? `<p class="social-note">Updated ${escape(new Date(platform.checkedAt).toLocaleString())}</p>` : ''}
    ${link(platform.url, 'Visit profile ↗')}
  </article>`).join('');
  for (const mode of ['recent', 'popular']) {
    $(`${mode}-platforms`).innerHTML = values.map(platform => `<div class="platform-feed"><div class="platform-feed-heading"><h3>${platformIcon(platform)}${escape(platform.name)} <span>${escape(platform.handle)}</span></h3>${link(platform.url, 'View profile ↗')}</div>
      ${mode === 'popular' && platform.coverage ? `<p class="social-note">${escape(platform.coverage)}</p>` : ''}
      ${mode === 'popular' && platform.fetchedCount ? `<p class="social-note">${platform.rankedCount} of ${platform.fetchedCount} posts have view counts available.</p>` : ''}
      ${mode === 'popular' ? `<div class="top-video"><h4>Top video · ${escape(platform.name)}</h4>${platform.topVideo ? card(platform.topVideo, platform, -1, true) : `<p class="social-note">${platform.status === 'loading' ? 'Checking video views…' : 'No video with an available view count to rank yet.'}</p>`}</div>` : ''}
      <div class="social-grid">${platform[mode]?.length ? platform[mode].map((item, index) => card(item, platform, mode === 'recent' ? index : -1)).join('') : empty(platform, mode === 'popular')}</div>
    </div>`).join('');
  }
  const connected = values.filter(value => ['live', 'partial'].includes(value.status)).length;
  $('feed-status').textContent = values.some(value => value.status === 'loading') ? 'Checking for updates…' : `${connected} of 3 live feeds connected. Checks every 15 minutes.`;
  $('platform-grid').setAttribute('aria-busy', String(values.some(value => value.status === 'loading')));
  root.querySelectorAll('.post-preview img').forEach(img => img.addEventListener('error', () => {
    const placeholder = document.createElement('span');
    placeholder.className = 'post-placeholder';
    placeholder.textContent = 'View on platform ↗';
    img.replaceWith(placeholder);
  }, { once: true }));
}

// Charts: render simple comparative charts using Chart.js if available
function renderCharts() {
  try {
    if (typeof Chart === 'undefined') return;
    const followersCtx = document.getElementById('followers-chart');
    const viewsCtx = document.getElementById('views-chart');
    const labels = platforms.map(p => p.name);
    const followerData = platforms.map(p => state.get(p.platform)?.metrics?.find(m => /followers|subscribers/i.test(m.label))?.value || 0);
    const viewData = platforms.map(p => state.get(p.platform)?.metrics?.find(m => /views/i.test(m.label))?.value || 0);
    if (followersCtx) new Chart(followersCtx.getContext('2d'), {type:'bar',data:{labels, datasets:[{label:'Followers / Subscribers',data:followerData,backgroundColor:['#ff6384','#36a2eb','#ffcd56']}]}, options:{responsive:true,maintainAspectRatio:false}});
    if (viewsCtx) new Chart(viewsCtx.getContext('2d'), {type:'bar',data:{labels, datasets:[{label:'Aggregate views',data:viewData,backgroundColor:['#7b61ff','#4bd3b8','#ffd27a']}]}, options:{responsive:true,maintainAspectRatio:false}});
  } catch (e) { console.warn('Charts unavailable', e); }
}

let refreshing = false;
let lastAttempt = 0;
async function refresh() {
  if (refreshing) return;
  refreshing = true;
  lastAttempt = Date.now();
  $('refresh-socials').disabled = true;
  $('refresh-socials').textContent = 'Checking…';
  await Promise.all(platforms.map(async platform => {
    const previous = state.get(platform.platform);
    try {
      const response = await fetch(`/api/socials?platform=${platform.platform}`, { signal: AbortSignal.timeout(55000), cache: 'no-store' });
      if (!response.ok) throw new Error('Feed unavailable');
      const data = await response.json();
      if (data.platform !== platform.platform || !Array.isArray(data.recent) || !Array.isArray(data.popular) || !Array.isArray(data.metrics)) throw new Error('Invalid feed');
      state.set(platform.platform, data.status === 'unavailable' && previous.checkedAt
        ? { ...previous, status: 'stale', message: 'Refresh unavailable. Showing the last successful update.' }
        : { ...platform, ...data });
    } catch {
      state.set(platform.platform, { ...previous, status: previous.checkedAt ? 'stale' : 'unavailable', message: previous.checkedAt ? 'Refresh unavailable. Showing the last successful update.' : 'Live updates could not be loaded. Please try again.' });
    }
    render();
  }));
  refreshing = false;
  $('refresh-socials').disabled = false;
  $('refresh-socials').textContent = 'Refresh updates ↻';
}

$('refresh-socials').addEventListener('click', refresh);
const isVisible = () => !document.hidden && document.documentElement.dataset.track === 'socials';
setInterval(() => { if (isVisible()) refresh(); }, 15 * 60 * 1000);
document.addEventListener('visibilitychange', () => { if (isVisible() && Date.now() - lastAttempt >= 15 * 60 * 1000) refresh(); });
render();
refresh();
}
