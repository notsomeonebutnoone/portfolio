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
                    const bar = document.getElementById('rapid-fill');
                    if (bar) bar.style.width = `${winRate}%`;
                }, 300);

                // Win rate ring
                animateCount(document.getElementById('win-rate'), winRate, 900, '%');
                setTimeout(() => {
                    const circle = document.getElementById('winrate-circle');
                    if (circle) {
                        const circumference = 201; // 2 * PI * 32
                        const offset = circumference - (winRate / 100) * circumference;
                        circle.style.strokeDashoffset = offset;
                    }
                }, 300);
            }

            if (tactics && tactics.highest) {
                animateCount(document.getElementById('tactics-highest'), tactics.highest.rating, 900);
            }

        } catch (err) {
            console.error('Chess API failed:', err);
            const errEl = document.getElementById('chess-error');
            if (errEl) errEl.classList.remove('hidden');
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

            const thumbEl = document.getElementById('yt-thumb');
            const titleEl = document.getElementById('yt-title');
            const linkEl = document.getElementById('yt-link');
            const btnEl = document.getElementById('yt-watch-btn');
            const dateEl = document.getElementById('yt-date');

            if (thumbEl) { thumbEl.src = thumb; thumbEl.alt = latest.title; }
            if (titleEl) titleEl.textContent = latest.title;
            if (linkEl) linkEl.href = latest.link;
            if (btnEl) btnEl.href = latest.link;

            const pubDate = new Date(latest.pubDate);
            const now = new Date();
            const diffDays = Math.floor((now - pubDate) / (1000 * 60 * 60 * 24));
            let dateStr;
            if (diffDays === 0) dateStr = 'Today';
            else if (diffDays === 1) dateStr = 'Yesterday';
            else if (diffDays < 7) dateStr = `${diffDays} days ago`;
            else if (diffDays < 30) dateStr = `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
            else dateStr = pubDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

            if (dateEl) dateEl.textContent = `Published ${dateStr}`;

            const loadingEl = document.getElementById('yt-loading');
            const cardEl = document.getElementById('yt-card');
            if (loadingEl) loadingEl.classList.add('hidden');
            if (cardEl) cardEl.classList.remove('hidden');

        } catch (err) {
            console.error('YouTube RSS failed:', err);
        }
    }

    loadYouTubeLatest();

    /* ════════════════════════════════════════
       ENTERTAINMENT TRACKER — Data & Logic
       ════════════════════════════════════════ */

    /**
     * CONFIGURATION: Add your shows and movies here!
     * visible: true/false allows you to hide certain items from the public.
     */
    const HOBBIES_DATA = {
        anime: {
            watching: [
                { title: "Jujutsu Kaisen", status: "Watching", progress: 48, meta: "Season 2", description: "Cursed energy, incredible fights, and high stakes.", visible: true },
                { title: "Attack on Titan", status: "Rewatching", progress: 75, meta: "Final Season", description: "The epic conclusion to a masterpiece.", visible: true },
                { title: "Hunter x Hunter", status: "On Hold", progress: 65, meta: "2011 Version", description: "Gon's journey to find his father.", visible: true }
            ],
            watched: [
                { title: "Death Note", status: "Watched", progress: 100, meta: "Complete", description: "A battle of wits between Light and L.", visible: true },
                { title: "Your Name", status: "Watched", progress: 100, meta: "Movie", description: "A beautiful tale of connection and fate.", visible: true }
            ]
        },
        tv: {
            watching: [
                { title: "Severance", status: "Watching", progress: 60, meta: "Season 2", description: "Corporate mystery at its finest.", visible: true },
                { title: "Breaking Bad", status: "Rewatching", progress: 90, meta: "Season 5", description: "The chemistry teacher turned kingpin.", visible: true }
            ],
            watched: [
                { title: "The Office", status: "Watched", progress: 100, meta: "Complete", description: "Dunder Mifflin's daily chaos.", visible: true },
                { title: "Suits", status: "Watched", progress: 100, meta: "S1-S9", description: "High-stakes corporate law in NYC.", visible: true }
            ]
        },
        movie: {
            watching: [
                { title: "Inception", status: "Watching", progress: 10, meta: "Action/Sci-Fi", description: "Dream within a dream.", visible: true }
            ],
            watched: [
                { title: "Interstellar", status: "Watched", progress: 100, meta: "Sci-Fi", description: "Time, space, and a father's love.", visible: true },
                { title: "The Dark Knight", status: "Watched", progress: 100, meta: "Action", description: "Why so serious?", visible: true }
            ]
        }
    };

    let activeStatus = 'watching';
    let activeType = 'anime';

    // Elements
    const statusTabs = document.querySelectorAll('.status-tab');
    const typeTabs = document.querySelectorAll('.type-tab');
    const itemList = document.getElementById('entertainment-list');
    const featuredCard = document.getElementById('featured-display');

    // API Functions
    async function fetchAnimeInfo(title) {
        try {
            const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=1`);
            const data = await res.json();
            if (data.data && data.data.length > 0) {
                const anime = data.data[0];
                return {
                    poster: anime.images.webp.large_image_url,
                    description: anime.synopsis,
                    year: anime.year || anime.aired?.from?.split('-')[0] || ''
                };
            }
        } catch (e) { console.error("Jikan API Error:", e); }
        return null;
    }

    async function fetchTVInfo(title) {
        try {
            const res = await fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`);
            const data = await res.json();
            if (data) {
                return {
                    poster: data.image?.original || data.image?.medium,
                    description: data.summary?.replace(/<[^>]*>?/gm, ''),
                    year: data.premiered?.split('-')[0] || ''
                };
            }
        } catch (e) { console.error("TVmaze API Error:", e); }
        return null;
    }

    async function fetchMovieInfo(title) {
        // TVmaze actually handles some major movies too, let's try it as a fallback
        return await fetchTVInfo(title);
    }

    // Render List
    function renderList() {
        const data = HOBBIES_DATA[activeType][activeStatus].filter(item => item.visible);
        itemList.innerHTML = '';

        data.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = `item-btn ${index === 0 ? 'active' : ''}`;
            btn.innerHTML = `
                <span>${item.title}</span>
                <span class="item-year">›</span>
            `;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.item-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                pullItemDetails(item);
            });
            itemList.appendChild(btn);
        });

        if (data.length > 0) {
            pullItemDetails(data[0]);
        } else {
            resetFeatured();
        }
    }

    async function pullItemDetails(item) {
        // Show loading state
        document.getElementById('featured-title').textContent = "Pulling details...";
        document.getElementById('featured-poster').style.opacity = '0.3';

        let apiData = null;
        if (activeType === 'anime') apiData = await fetchAnimeInfo(item.title);
        else if (activeType === 'tv') apiData = await fetchTVInfo(item.title);
        else if (activeType === 'movie') apiData = await fetchMovieInfo(item.title);

        // Update UI
        document.getElementById('featured-poster').src = apiData?.poster || 'https://via.placeholder.com/400x600?text=No+Poster';
        document.getElementById('featured-poster').style.opacity = '1';
        document.getElementById('featured-title').textContent = item.title;
        document.getElementById('featured-status-badge').textContent = item.status;
        document.getElementById('featured-meta').textContent = `${activeType.toUpperCase()} · ${item.meta} ${apiData?.year ? '· ' + apiData.year : ''}`;
        document.getElementById('featured-description').textContent = apiData?.description || item.description || "No description available.";
        
        const progressFill = document.getElementById('featured-progress-fill');
        const progressText = document.getElementById('featured-progress-text');
        if (progressFill && progressText) {
            progressFill.style.width = `${item.progress}%`;
            progressText.textContent = `${item.progress}%`;
        }

        featuredCard.classList.remove('hidden');
        // Restart animation
        featuredCard.style.animation = 'none';
        featuredCard.offsetHeight;
        featuredCard.style.animation = 'slideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    function resetFeatured() {
        document.getElementById('featured-title').textContent = "No items found";
        document.getElementById('featured-poster').src = '';
        document.getElementById('featured-description').textContent = "Check back later or try a different category.";
        document.getElementById('featured-progress-fill').style.width = '0%';
        document.getElementById('featured-progress-text').textContent = '0%';
    }

    // Event Listeners
    statusTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            statusTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeStatus = tab.getAttribute('data-status');
            renderList();
        });
    });

    typeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            typeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeType = tab.getAttribute('data-type');
            renderList();
        });
    });

    // Initial Render
    renderList();

});
