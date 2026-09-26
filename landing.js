const themeToggle = document.getElementById('theme-toggle');
function updateThemeLabel() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
  themeToggle.title = `Switch to ${next} mode`;
}
updateThemeLabel();
// The original loader owns theme persistence and toggling.
themeToggle.addEventListener('click', updateThemeLabel);

const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
const navObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    for (const link of navLinks) {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
}, { rootMargin: '-5% 0px -60% 0px' });
for (const link of navLinks) navObserver.observe(document.querySelector(link.hash));

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const motto = document.querySelector('.memento');
  motto.classList.add('motion-ready');
  const words = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      words.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -15% 0px', threshold: 1 });
  motto.querySelectorAll('span:not(.memento-period)').forEach(word => words.observe(word));
}
