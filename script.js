document.addEventListener("DOMContentLoaded", () => {
    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'dark';

    if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'light') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Secret Hobbies Easter Egg: 5 clicks on profile image
    const profileImg = document.querySelector('.profile-img');
    let clickCount = 0;
    let clickTimer = null;

    if (profileImg) {
        profileImg.style.cursor = 'pointer';
        profileImg.addEventListener('click', () => {
            clickCount++;
            
            if (clickTimer) clearTimeout(clickTimer);
            
            if (clickCount >= 5) {
                clickCount = 0;
                window.location.href = 'hobbies.html';
            } else {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 2000); // Reset count after 2 seconds of inactivity
            }
        });
    }

    const preloader = document.getElementById('preloader');
    const nameReveal = document.getElementById('name-reveal');
    const canvas = document.getElementById('matrix-canvas');

    if (preloader && nameReveal) {
        let matrixInterval;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const hexCharsMatrix = '0123456789ABCDEF';
            const fontSize = 16;
            const columns = canvas.width / fontSize;
            // Initialize drops randomly across the screen height so it starts fully populated
            let drops = Array(Math.floor(columns)).fill(0).map(() => Math.floor(Math.random() * (canvas.height / fontSize)));

            function drawMatrix() {
                // Determine current theme for drawing background so that canvas fades nicely
                const isLight = document.documentElement.getAttribute('data-theme') === 'light';
                ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Text color
                ctx.fillStyle = isLight ? '#a1a1aa' : '#52525b';
                ctx.font = fontSize + 'px monospace';

                for (let i = 0; i < drops.length; i++) {
                    const text = hexCharsMatrix[Math.floor(Math.random() * hexCharsMatrix.length)];
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            }

            matrixInterval = setInterval(drawMatrix, 20); // Sped up the interval

            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                drops = Array(Math.floor(canvas.width / fontSize)).fill(1);
            });
        }

        const targetName = nameReveal.getAttribute('data-name');
        const hexChars = '0123456789ABCDEF';
        let iterations = 0;

        const interval = setInterval(() => {
            nameReveal.innerHTML = targetName.split('')
                .map((letter, index) => {
                    if (letter === ' ') return '&nbsp;';

                    if (index < Math.floor(iterations / 2)) {
                        return letter;
                    }

                    const randomChar = hexChars[Math.floor(Math.random() * hexChars.length)];
                    return `<span style="opacity: 0.4; color: var(--text-muted);">${randomChar}</span>`;
                })
                .join('');

            iterations++;

            if (iterations >= targetName.length * 2) {
                clearInterval(interval);
                nameReveal.innerHTML = targetName;

                setTimeout(() => {
                    preloader.classList.add('hidden');
                    document.body.classList.remove('preloading');
                    if (matrixInterval) clearInterval(matrixInterval);
                }, 800);
            }
        }, 50);
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.timeline-item, .project-card, .skills-content-box').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // Skills Data and Interactive Logic
    const skillsData = [
        {
            category: "Physical Design",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>`,
            skills: ["RTL2GDSII Flow", "Synthesis", "Floorplanning", "Placement", "CTS", "Routing", "Timing Closure", "MCMM Analysis"]
        },
        {
            category: "Timing Analysis",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            skills: ["STA", "Setup/Hold Analysis", "WNS/TNS", "SDC Constraints", "Parasitic Extraction"]
        },
        {
            category: "EDA Tools",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
            skills: ["Cadence Virtuoso", "Xilinx Vivado", "ICC2 (Concepts)", "Innovus (Concepts)", "PrimeTime", "Tempus"]
        },
        {
            category: "Languages",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
            skills: ["TCL", "Python", "C", "MATLAB"]
        },
        {
            category: "Automation",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            skills: ["Flow Scripting", "Report Parsing", "Constraint Validation", "Makefiles"]
        },
        {
            category: "Verification",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            skills: ["DRC Concepts", "LVS Concepts", "Layout vs Schematic"]
        },
        {
            category: "Core Concepts",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
            skills: ["CMOS VLSI Design", "Digital IC Design", "Clock Tree Design", "Signal Integrity"]
        }
    ];

    const fullSkillsData = [
        {
            category: "All Skills",
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
            skills: skillsData.flatMap(cat => cat.skills)
        },
        ...skillsData
    ];

    const tabsContainer = document.getElementById('skills-tabs');
    const listContainer = document.getElementById('skills-list');
    const footerText = document.getElementById('skills-footer');

    let activeCategory = 'Physical Design';

    function renderTabs() {
        if (!tabsContainer) return;
        tabsContainer.innerHTML = fullSkillsData.map(data => `
            <button class="skill-tab ${data.category === activeCategory ? 'active' : ''}" data-category="${data.category}">
                ${data.icon}
                ${data.category}
                <span class="skill-count">${data.skills.length}</span>
            </button>
        `).join('');

        document.querySelectorAll('.skill-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                activeCategory = e.currentTarget.getAttribute('data-category');
                renderTabs();
                renderSkills();
            });
        });
    }

    function renderSkills() {
        if (!listContainer || !footerText) return;
        const data = fullSkillsData.find(d => d.category === activeCategory);

        listContainer.style.opacity = '0';

        setTimeout(() => {
            listContainer.innerHTML = data.skills.map((skill, i) => `
                <div class="skill-pill" style="animation-delay: ${i * 0.02}s">
                    ${skill}
                </div>
            `).join('');

            footerText.textContent = `Showing ${data.skills.length} skills in ${activeCategory}`;
            listContainer.style.opacity = '1';
        }, 150);
    }

    if (listContainer) {
        listContainer.style.transition = 'opacity 0.15s ease-out';
    }

    if (tabsContainer && listContainer) {
        activeCategory = fullSkillsData[1].category; // Default to Physical Design
        renderTabs();
        renderSkills();
    }

    // --- Dynamic Hex-Grid Halftone Animation (Background) ---
    const bgCanvas = document.getElementById('bg-animation-canvas');
    if (bgCanvas) {
        const bgCtx = bgCanvas.getContext('2d');
        let width, height;
        let noise;

        // Simple Simplex Noise Implementation (Minimal)
        class SimplexNoise {
            constructor() {
                this.p = new Uint8Array(256);
                for (let i = 0; i < 256; i++) this.p[i] = i;
                for (let i = 255; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
                }
                this.perm = new Uint8Array(512);
                for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
            }

            dot(g, x, y) { return g[0] * x + g[1] * y; }

            noise2D(xin, yin) {
                const grad3 = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0, 1], [0, -1]];
                let n0, n1, n2;
                const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
                const s = (xin + yin) * F2;
                const i = Math.floor(xin + s);
                const j = Math.floor(yin + s);
                const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
                const t = (i + j) * G2;
                const X0 = i - t;
                const Y0 = j - t;
                const x0 = xin - X0;
                const y0 = yin - Y0;
                let i1, j1;
                if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
                const x1 = x0 - i1 + G2;
                const y1 = y0 - j1 + G2;
                const x2 = x0 - 1.0 + 2.0 * G2;
                const y2 = y0 - 1.0 + 2.0 * G2;
                const ii = i & 255;
                const jj = j & 255;
                const gi0 = this.perm[ii + this.perm[jj]] % 12;
                const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
                const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
                let t0 = 0.5 - x0 * x0 - y0 * y0;
                if (t0 < 0) n0 = 0.0; else { t0 *= t0; n0 = t0 * t0 * this.dot(grad3[gi0], x0, y0); }
                let t1 = 0.5 - x1 * x1 - y1 * y1;
                if (t1 < 0) n1 = 0.0; else { t1 *= t1; n1 = t1 * t1 * this.dot(grad3[gi1], x1, y1); }
                let t2 = 0.5 - x2 * x2 - y2 * y2;
                if (t2 < 0) n2 = 0.0; else { t2 *= t2; n2 = t2 * t2 * this.dot(grad3[gi2], x2, y2); }
                return 70.0 * (n0 + n1 + n2);
            }
        }

        noise = new SimplexNoise();

        function resize() {
            width = bgCanvas.width = window.innerWidth;
            height = bgCanvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        const dotSpacing = 24;
        const hexWidth = dotSpacing;
        const hexHeight = dotSpacing * Math.sqrt(3) / 2;
        let time = 0;

        function animate() {
            bgCtx.clearRect(0, 0, width, height);
            
            // Determine current theme color for dots
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            bgCtx.fillStyle = isLight ? '#000000' : '#ffffff';
            
            time += 0.002;

            for (let y = 0; y < height + hexHeight; y += hexHeight) {
                const isEvenRow = Math.floor(y / hexHeight) % 2 === 0;
                const xOffset = isEvenRow ? 0 : hexWidth / 2;

                for (let x = -hexWidth; x < width + hexWidth; x += hexWidth) {
                    const nx = (x + xOffset) * 0.003;
                    const ny = y * 0.003;
                    const val = noise.noise2D(nx + time, ny + time);
                    const radius = Math.max(0.5, (val + 1) * 2.5);

                    bgCtx.beginPath();
                    bgCtx.arc(x + xOffset, y, radius, 0, Math.PI * 2);
                    bgCtx.fill();
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }
});
