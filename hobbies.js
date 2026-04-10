document.addEventListener("DOMContentLoaded", () => {

    /* ── Theme (mirrors main portfolio) ── */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            const toggleTheme = () => {
                const theme = document.documentElement.getAttribute('data-theme');
                if (theme === 'light') {
                    document.documentElement.removeAttribute('data-theme');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('theme', 'light');
                }
            };
            if (!document.startViewTransition) { toggleTheme(); return; }
            const x = e.clientX, y = e.clientY;
            const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
            const transition = document.startViewTransition(toggleTheme);
            transition.ready.then(() => {
                document.documentElement.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                    { duration: 1200, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
                );
            });
        });
    }

    /* ── Smooth scroll for nav ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* ════════════════════════════════════════
       CHESS.COM — Live ELO via public API
       ════════════════════════════════════════ */
    const CHESS_USER = 'chingulala';

    async function loadChessStats() {
        try {
            const res = await fetch(`https://api.chess.com/pub/player/${CHESS_USER}/stats`, {
                headers: { 'Accept': 'application/json' }
            });
            if (!res.ok) throw new Error('Chess API error');
            const data = await res.json();

            const rapid = data.chess_rapid;
            const tactics = data.tactics;

            if (rapid) {
                const { last, best, record } = rapid;
                const total = (record.win || 0) + (record.loss || 0) + (record.draw || 0);
                const winRate = total > 0 ? Math.round((record.win / total) * 100) : 0;

                // Animate ELO number counting up
                animateCount(document.getElementById('rapid-elo').querySelector('.elo-number'), last.rating, 800);
                animateCount(document.getElementById('rapid-best'), best.rating, 900);
                animateCount(document.getElementById('rapid-wins'), record.win, 700);
                animateCount(document.getElementById('rapid-losses'), record.loss, 700);
                animateCount(document.getElementById('rapid-draws'), record.draw, 700);

                // Win/loss bar
                setTimeout(() => {
                    document.getElementById('rapid-fill').style.width = `${winRate}%`;
                }, 300);

                // Win rate ring
                animateCount(document.getElementById('win-rate'), winRate, 900, '%');
                setTimeout(() => {
                    const circle = document.getElementById('winrate-circle');
                    const circumference = 201; // 2 * PI * 32
                    const offset = circumference - (winRate / 100) * circumference;
                    circle.style.strokeDashoffset = offset;
                }, 300);
            }

            if (tactics && tactics.highest) {
                animateCount(document.getElementById('tactics-highest'), tactics.highest.rating, 900);
            }

        } catch (err) {
            console.error('Chess API failed:', err);
            document.getElementById('chess-error').classList.remove('hidden');
            // Show fallback static values from last known data
            document.getElementById('rapid-elo').querySelector('.elo-number').textContent = '619';
            document.getElementById('rapid-best').textContent = '1342';
            document.getElementById('tactics-highest').textContent = '999';
            document.getElementById('win-rate').textContent = '49%';
            setTimeout(() => { document.getElementById('rapid-fill').style.width = '49%'; }, 300);
        }
    }

    function animateCount(el, target, duration = 800, suffix = '') {
        if (!el) return;
        const start = 0;
        const startTime = performance.now();
        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
            el.textContent = Math.round(start + (target - start) * eased) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    loadChessStats();

    /* ════════════════════════════════════════
       YOUTUBE — Latest video via RSS + rss2json
       ════════════════════════════════════════ */
    const YT_CHANNEL_ID = 'UC8RJ6kFMXs0dd35V8fh67pQ';
    const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;
    const RSS2JSON = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

    async function loadYouTubeLatest() {
        try {
            const res = await fetch(RSS2JSON);
            if (!res.ok) throw new Error('RSS fetch failed');
            const data = await res.json();
            if (data.status !== 'ok' || !data.items || data.items.length === 0) throw new Error('No items');

            const latest = data.items[0];
            const videoId = latest.link.split('v=')[1]?.split('&')[0];
            const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            document.getElementById('yt-thumb').src = thumb;
            document.getElementById('yt-thumb').alt = latest.title;
            document.getElementById('yt-title').textContent = latest.title;
            document.getElementById('yt-link').href = latest.link;
            document.getElementById('yt-watch-btn').href = latest.link;

            // Format date nicely
            const pubDate = new Date(latest.pubDate);
            const now = new Date();
            const diffDays = Math.floor((now - pubDate) / (1000 * 60 * 60 * 24));
            let dateStr;
            if (diffDays === 0) dateStr = 'Today';
            else if (diffDays === 1) dateStr = 'Yesterday';
            else if (diffDays < 7) dateStr = `${diffDays} days ago`;
            else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
            else dateStr = pubDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            document.getElementById('yt-date').textContent = `Published ${dateStr}`;

            // Show card, hide loader
            document.getElementById('yt-loading').classList.add('hidden');
            document.getElementById('yt-card').classList.remove('hidden');

        } catch (err) {
            console.error('YouTube RSS failed:', err);
            // Fallback to known latest video
            document.getElementById('yt-thumb').src = `https://i.ytimg.com/vi/spiZrXeRhzs/hqdefault.jpg`;
            document.getElementById('yt-thumb').alt = 'The worst anime fumbles ever';
            document.getElementById('yt-title').textContent = 'The worst anime fumbles ever';
            document.getElementById('yt-link').href = 'https://www.youtube.com/watch?v=spiZrXeRhzs';
            document.getElementById('yt-watch-btn').href = 'https://www.youtube.com/watch?v=spiZrXeRhzs';
            document.getElementById('yt-date').textContent = 'Published 3 days ago';

            document.getElementById('yt-loading').classList.add('hidden');
            document.getElementById('yt-card').classList.remove('hidden');
        }
    }

    loadYouTubeLatest();

    /* ════════════════════════════════════════
       CURRENTLY WATCHING — Tab Switcher
       ════════════════════════════════════════ */
    const tabs = document.querySelectorAll('.watching-tab');
    const animeGrid = document.getElementById('watching-anime');
    const tvGrid = document.getElementById('watching-tv');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.getAttribute('data-tab');
            if (target === 'anime') {
                tvGrid.classList.add('hidden');
                animeGrid.classList.remove('hidden');
                // Re-trigger animations
                animeGrid.querySelectorAll('.watch-card').forEach((card, i) => {
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = `fadeInCard 0.35s ease ${i * 0.07}s backwards`;
                });
            } else {
                animeGrid.classList.add('hidden');
                tvGrid.classList.remove('hidden');
                tvGrid.querySelectorAll('.watch-card').forEach((card, i) => {
                    card.style.animation = 'none';
                    card.offsetHeight;
                    card.style.animation = `fadeInCard 0.35s ease ${i * 0.07}s backwards`;
                });
            }
        });
    });

});
