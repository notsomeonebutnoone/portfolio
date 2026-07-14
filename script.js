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
                // Keep the loading field seamless and black across every portfolio track.
                ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = 'rgba(92, 102, 112, 0.22)';
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

    document.querySelectorAll('.timeline-item, .project-card, .skills-content-box, .capability-card').forEach(el => {
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
});
