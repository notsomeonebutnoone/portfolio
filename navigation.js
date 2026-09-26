(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const routes = new Set(['/', '/index.html', '/hardware', '/software', '/analyst', '/socials']);
  let leaving = false;
  let previous = null;
  try {
    previous = JSON.parse(sessionStorage.getItem('portfolio:navigation') || 'null');
    sessionStorage.removeItem('portfolio:navigation');
  } catch { /* Navigation works without storage as well. */ }

  if (previous && !reducedMotion.matches) {
    document.body.classList.add('page-arriving');
    setTimeout(() => document.body.classList.remove('page-arriving'), 450);
    document.fonts.ready.then(() => {
      const switcher = document.querySelector('.track-switcher');
      const pill = document.querySelector('.track-switcher-pill');
      const active = document.querySelector('.track-switcher .active');
      if (!pill || !active || !previous.pill) return;
      // Let the destination initialize, then slide from the prior track position.
      requestAnimationFrame(() => {
        switcher.classList.remove('pill-ready');
        pill.style.left = `${previous.pill.left}px`;
        pill.style.width = `${previous.pill.width}px`;
        requestAnimationFrame(() => {
          switcher.classList.add('pill-ready');
          pill.style.left = `${active.offsetLeft}px`;
          pill.style.width = `${active.offsetWidth}px`;
        });
      });
    });
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href);
    if (destination.origin !== location.origin || !routes.has(destination.pathname) || destination.pathname === location.pathname) return;
    // The shared track views already animate without replacing the document.
    if (link.hasAttribute('data-track-link') || reducedMotion.matches) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    const active = document.querySelector('.track-switcher .active');
    try {
      sessionStorage.setItem('portfolio:navigation', JSON.stringify({
        pill: active ? { left: active.offsetLeft, width: active.offsetWidth } : null
      }));
    } catch {}
    document.body.classList.add('page-leaving');
    setTimeout(() => location.assign(destination.href), 200);
  });
  window.addEventListener('pageshow', () => {
    leaving = false;
    document.body.classList.remove('page-leaving');
  });
})();
