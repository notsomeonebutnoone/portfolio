const tracks = {
  hardware: {
    label: 'Electronics & Communication Engineer',
    title: 'Hardware-minded builder working across timing analysis, embedded systems, and automation.',
    summary: 'I like building systems that feel precise, fast, and reliable. My work sits at the intersection of hardware debugging, scripting, and product-minded engineering.',
    resume: 'hresume.pdf',
    profile: 'profile-hardware.jpg',
    profileAlt: 'Chirag working at an electronics hardware bench',
    badges: ['STA & timing closure', 'Python / TCL automation', 'Embedded & distributed systems'],
    metrics: [['2', 'Industries bridged'], ['8+', 'Highlighted projects'], ['2024', 'Graduation year']],
    skills: [
      ['Physical Design', ['RTL2GDSII Flow', 'Synthesis', 'Floorplanning', 'Placement', 'CTS', 'Routing', 'Timing Closure']],
      ['Timing Analysis', ['STA', 'Setup/Hold Analysis', 'WNS/TNS', 'SDC Constraints', 'Parasitic Extraction', 'MCMM Analysis']],
      ['Tools & Verification', ['Cadence Virtuoso', 'Xilinx Vivado', 'PrimeTime', 'Tempus', 'DRC Concepts', 'LVS Concepts']],
      ['Languages & Automation', ['TCL', 'Python', 'C', 'MATLAB', 'Flow Scripting', 'Report Parsing', 'Makefiles']]
    ],
    experience: [
      {role:'Hardware Engineer', company:'External Consultant', date:'Dec 2024 — Aug 2025', bullets:['Performed timing and performance analysis on embedded hardware systems, applying STA concepts including setup/hold checks and latency optimization.','Debugged timing failures through structured log analysis, constraint validation, and timing-closure workflows.','Developed Python and TCL automation for validation, timing-report parsing, and workflow optimization.','Worked across multi-configuration hardware environments to ensure deterministic behavior and optimize system-level latency.','Contributed to GaN charger manufacturing and testing with a focus on reliability and timing consistency.','Applied digital-design and CMOS VLSI fundamentals, including signal integrity and clock-behavior awareness.']},
      {role:'Software Engineer', company:'BEML · Rail & Metro', date:'Aug — Nov 2024', bullets:['Worked on Train Control and Monitoring Systems integrating multiple onboard subsystems with deterministic real-time behavior.','Developed and validated modules over the CAN network for reliable, low-latency signaling across distributed nodes.','Collaborated with hardware teams to analyze system-level timing integrity and synchronization.','Optimized communication workflows for deterministic latency and path performance.','Supported validation and verification centered on robustness, fault tolerance, and timing stability.']}
    ],
    projects: [
      ['Readimentary · RSVP PDF Reader', 'A browser-based RSVP reader with ORP-centered rendering, adjustable WPM, chapter detection, persistent local storage, and progress-aware navigation.', 'React 19 · Vite · PDF.js', 'https://github.com/notsomeonebutnoone/readimentary'],
      ['Sneaki · AI Activity to Calendar', 'An automated activity pipeline that categorizes application usage and creates structured Google Calendar events with duration and productivity metadata.', 'Automation · Webhooks · AI backends', 'https://github.com/notsomeonebutnoone/sneaki'],
      ['Statistical Arboreal Bird Repeller', 'A computer-vision pipeline using SIFT and HOG descriptors, temporal density estimation, and dynamic PWM control for responsive ultrasonic actuation.', 'Computer vision · Signal control · Research', null],
      ['Real-Time Gesture-Controlled Robotic Hand', 'A low-latency hand-mirroring system using Python signal processing, MQTT-synchronized servo updates, and tuned motor response curves.', 'Python · MQTT · Embedded systems', null]
    ]
  },
  software: {
    label: 'Software Engineering',
    title: 'Software engineer building real-time systems, data products, and thoughtful web experiences.',
    summary: 'I turn ambiguous system problems into dependable software—from decentralized trading infrastructure and industrial control interfaces to tools that make everyday workflows faster.',
    resume: 'chiragV resume software.pdf',
    profile: 'profile-software.png',
    profileAlt: 'Chirag developing software at a dual-monitor workstation',
    badges: ['Python & data systems', 'React / modern web', 'Real-time & distributed software'],
    metrics: [['45%', 'Strategy efficiency gain'], ['30%', 'Compute reduction'], ['2.4', 'Sharpe ratio achieved']],
    skills: [
      ['Languages', ['Python', 'C', 'MATLAB', 'JavaScript']],
      ['Web & data', ['React 19', 'Vite 7', 'Tailwind CSS', 'NumPy', 'Pandas', 'Plotly']],
      ['Systems', ['Qt', 'MQTT', 'LIN', 'Linux', 'Wireshark']],
      ['Foundations', ['Data Structures', 'Algorithms', 'Operating Systems', 'OOP', 'DBMS']]
    ],
    experience: [
      {role:'Project Consultant', company:'OpenFabric · Decentralized AI Infrastructure', date:'May — Jul 2025', bullets:['Designed a modular high-frequency cryptocurrency trading system in Python for decentralized AI compute.','Implemented momentum and Bollinger Bands strategies with a 2.4 Sharpe ratio and strong backtest-to-live consistency.','Built multithreaded market-data pipelines and a real-time Plotly dashboard for execution, P&L, and performance.','Improved strategy efficiency by 45% while reducing compute use by 30%.']},
      {role:'Software Engineer', company:'BEML · Rail & Metro Division', date:'Aug — Nov 2024', bullets:['Led software visualization work for Train Control and Monitoring Systems.','Built Qt interfaces for live operational and control parameters.','Integrated LIN communication for efficient, low-latency auxiliary systems.','Debugged, tested, and deployed production-grade modules with cross-functional teams.']},
      {role:'Product Development Intern', company:'Dassault Systèmes', date:'May 2022 — Jul 2023', bullets:['Designed and simulated automated systems using Modelica and electrical design tools.','Validated circuit performance under real-world constraints and supported requirements and cost optimization.']}
    ],
    projects: [
      ['Readimentary', 'A focus-first RSVP PDF reader with ORP rendering, adjustable WPM, chapter detection, and persistent local reading state.', 'React 19 · Vite · PDF.js', 'https://readimentary.vercel.app'],
      ['Bonk', 'An open-source software project focused on a fast, direct, and playful product experience.', 'JavaScript · Web application · Open source', 'https://github.com/notsomeonebutnoone/bonk'],
      ['Sneaki', 'An AI-assisted activity pipeline that converts app and window events into structured Google Calendar records.', 'Webhooks · AI backends · Automation', 'https://github.com/notsomeonebutnoone/sneaki'],
      ['Statistical Arboreal Bird Repeller', 'A computer-vision pipeline using SIFT and HOG descriptors, temporal density estimation, and dynamic PWM control.', 'Python · Computer vision · Research', null],
      ['Gesture-Controlled Robotic Hand', 'A low-latency hand-mirroring system with Python signal smoothing and MQTT-synchronized servo updates.', 'Python · MQTT · Real-time systems', null]
    ]
  },
  analyst: {
    label: 'Analyst · Growth & GTM',
    title: 'Analyst translating complex systems into sharper operations, measurable growth, and scalable execution.',
    summary: 'I combine quantitative analysis with an engineer’s systems thinking—finding bottlenecks, automating reporting, managing operational risk, and turning noisy data into decisions teams can act on.',
    resume: 'Tchirag V resume analyst.pdf',
    profile: 'profile-analyst.png',
    profileAlt: 'Chirag analyzing growth charts and business performance',
    badges: ['Performance analytics', 'Workflow automation', 'Operations & growth strategy'],
    metrics: [['Multi-source', 'Reports automated'], ['Real-time', 'Operational systems'], ['4', 'Cross-domain projects']],
    skills: [
      ['Analytics', ['Structured Data Analysis', 'Statistical Modeling', 'Trend Evaluation', 'Quantitative Logic']],
      ['Operations', ['Performance Optimization', 'Risk Mitigation', 'Workflow Design', 'Cross-functional Integration']],
      ['Automation', ['Python', 'SQL Concepts', 'Report Parsing', 'Log Validation']],
      ['Product & GTM', ['Resource Allocation', 'Stakeholder Alignment', 'System Scalability', 'Research Communication']]
    ],
    experience: [
      {role:'Hardware Systems Operations Analyst', company:'External Consultant', date:'Dec 2024 — Aug 2025', bullets:['Analyzed complex integrated systems to improve processing efficiency and execution quality.','Evaluated diagnostic logs and design constraints to resolve cross-functional performance failures.','Automated multi-source validation reporting with Python and TCL, shortening optimization turnaround.','Supported manufacturing validation and technology rollouts across varied stress conditions.']},
      {role:'Software Engineer · Operations & Infrastructure', company:'BEML · Rail & Metro', date:'Aug — Nov 2024', bullets:['Coordinated integration of distributed onboard systems for real-time operational safety.','Audited CAN signaling modules to establish stable, low-latency communication pathways.','Optimized network data workflows for scalability and throughput.','Directed verification routines centered on fault tolerance, operational risk, and asset stability.']}
    ],
    projects: [
      ['Sneaki · Productivity Intelligence', 'Transforms raw activity signals into categorized events and time-allocation metrics for a clearer view of how work happens.', 'Operations analytics · Automation', 'https://github.com/notsomeonebutnoone/sneaki'],
      ['Statistical Arboreal Pipeline', 'Benchmarks visual signals against reference datasets, aggregates probability over time, and drives responsive intervention.', 'Statistical modeling · Research', null],
      ['Readimentary · Reading Analytics', 'A stateful document experience using velocity metrics, progress markers, and persistence to optimize reading flow.', 'Product analytics · React', 'https://github.com/notsomeonebutnoone/readimentary'],
      ['Low-Latency Control Infrastructure', 'An integrated system using signal filtering, synchronized endpoints, and calibrated response curves for reliable execution.', 'Systems analysis · MQTT', null]
    ]
  }
};

const $ = id => document.getElementById(id);
const observer = new IntersectionObserver(entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('active')), {threshold:.08});
const trackSwitcher = document.querySelector('.track-switcher');
const trackSwitcherPill = document.querySelector('.track-switcher-pill');

function positionTrackPill(target, animate = true) {
  if (!trackSwitcher || !trackSwitcherPill || !target) return;
  trackSwitcher.classList.toggle('pill-ready', animate);
  trackSwitcherPill.style.left = `${target.offsetLeft}px`;
  trackSwitcherPill.style.width = `${target.offsetWidth}px`;
  document.querySelectorAll('[data-track-link]').forEach(link => {
    link.classList.toggle('active', link === target);
  });
}

function bindTrackCardEffects() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.capability-card,.timeline-item,.project-card,.education-card').forEach(card => {
    if (card.dataset.cursorFxBound === 'true') return;
    card.dataset.cursorFxBound = 'true';
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--card-glow-x', `${x * 100}%`);
        card.style.setProperty('--card-glow-y', `${y * 100}%`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.style.setProperty('--card-glow-x', '50%');
      card.style.setProperty('--card-glow-y', '50%');
    });
  });
}

const normalizeTrack = value => value === 'hardware' || value === 'analyst' ? value : 'software';
const currentTrack = () => {
  const routeTrack = location.pathname.split('/').filter(Boolean).at(-1);
  return normalizeTrack(routeTrack || new URLSearchParams(location.search).get('track'));
};

function renderTrack(key) {
  const data = tracks[key];
  document.documentElement.dataset.track = key;
  document.title = `Chirag Venkatesh | ${data.label}`;
  $('track-eyebrow').textContent = data.label;
  $('track-title').textContent = data.title;
  $('track-summary').textContent = data.summary;
  $('resume-link').href = data.resume;
  $('track-profile-image').src = data.profile;
  $('track-profile-image').alt = data.profileAlt;
  $('track-badges').innerHTML = data.badges.map(x => `<span>${x}</span>`).join('');
  $('track-metrics').innerHTML = data.metrics.map(([value,label]) => `<div class="metric-card"><span class="metric-value">${value}</span><span class="metric-label">${label}</span></div>`).join('');
  $('skills-grid').innerHTML = data.skills.map(([title,items], i) => `<article class="capability-card"><span class="capability-number">0${i+1}</span><h3>${title}</h3><div>${items.map(x=>`<span>${x}</span>`).join('')}</div></article>`).join('');
  $('experience-list').innerHTML = data.experience.map(x => `<article class="timeline-item"><div class="timeline-header"><div><h3>${x.role}</h3><p class="company">${x.company}</p></div><span class="timeline-date">${x.date}</span></div><ul>${x.bullets.map(b=>`<li>${b}</li>`).join('')}</ul></article>`).join('');
  $('projects-grid').innerHTML = data.projects.map(([title,desc,tech,url]) => `${url?`<a href="${url}" target="_blank" rel="noopener noreferrer" class="project-link">`:''}<article class="project-card"><div class="project-topline"><span>Selected project</span>${url?'<span>↗</span>':''}</div><h3>${title}</h3><p>${desc}</p><div class="project-tech">${tech}</div></article>${url?'</a>':''}`).join('');
  $('github-activity').hidden = key !== 'software';
  if (key === 'software') renderGithubActivity();
  document.querySelectorAll('[data-track-link]').forEach(link => link.classList.toggle('active', link.dataset.trackLink === key));
  const animatePill = trackSwitcher?.classList.contains('pill-initialized');
  requestAnimationFrame(() => positionTrackPill(document.querySelector(`[data-track-link="${key}"]`), animatePill));
  trackSwitcher?.classList.add('pill-initialized');
  document.querySelectorAll('.capability-card,.timeline-item,.project-card,.education-card').forEach(el => {el.classList.add('reveal');observer.observe(el)});
  bindTrackCardEffects();
}

async function renderGithubActivity() {
  const heatmap = $('github-heatmap');
  if (!heatmap || heatmap.dataset.loaded) return;
  heatmap.dataset.loaded = 'true';

  try {
    const response = await fetch('https://github-contributions-api.jogruber.de/v4/notsomeonebutnoone?y=last');
    if (!response.ok) throw new Error('Contribution data unavailable');
    const {contributions = []} = await response.json();
    const byDate = new Map(contributions.map(day => [day.date, day]));
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay() - (25 * 7));

    const weeks = Array.from({length: 26}, (_, week) => Array.from({length: 7}, (_, day) => {
      const date = new Date(start);
      date.setDate(start.getDate() + (week * 7) + day);
      const iso = date.toISOString().slice(0, 10);
      const activity = byDate.get(iso) || {count: 0, level: 0};
      return {...activity, date, iso};
    }));

    const monthLabels = weeks.map((week, index) => {
      const currentMonth = week[0].date.getMonth();
      const previousMonth = index ? weeks[index - 1][0].date.getMonth() : -1;
      return currentMonth !== previousMonth
        ? week[0].date.toLocaleDateString('en', {month: 'short'})
        : '';
    });

    heatmap.innerHTML = `<div class="github-months"><span></span>${monthLabels.map(month => `<span>${month}</span>`).join('')}</div><div class="github-chart"><div class="github-days"><span>Mon</span><span>Wed</span><span>Fri</span></div><div class="github-weeks">${weeks.map(week => `<div class="github-week">${week.map(day => `<span class="github-day" data-level="${Math.min(day.level || 0, 4)}" title="${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.iso}"></span>`).join('')}</div>`).join('')}</div></div>`;
    const total = weeks.flat().reduce((sum, day) => sum + day.count, 0);
    heatmap.setAttribute('aria-label', `${total} GitHub contributions in the last six months`);
  } catch {
    heatmap.innerHTML = '<span class="github-heatmap-status">Contribution activity available on GitHub ↗</span>';
    heatmap.removeAttribute('role');
  }
}

renderTrack(currentTrack());

document.querySelectorAll('[data-track-link]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  const next = link.dataset.trackLink;
  if (next === document.documentElement.dataset.track) return;
  positionTrackPill(link, true);
  document.body.classList.add('track-switching');
  window.setTimeout(() => {
    history.pushState({track: next}, '', `/${next}`);
    renderTrack(next);
    window.scrollTo({top: 0, behavior: 'instant'});
    requestAnimationFrame(() => document.body.classList.remove('track-switching'));
  }, 150);
}));

window.addEventListener('popstate', () => {
  document.body.classList.add('track-switching');
  renderTrack(currentTrack());
  requestAnimationFrame(() => document.body.classList.remove('track-switching'));
});

window.addEventListener('resize', () => {
  positionTrackPill(document.querySelector('[data-track-link].active'), false);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.documentElement.dataset.theme = 'light';
$('theme-toggle').addEventListener('click', () => {
  const light = document.documentElement.dataset.theme === 'light';
  if (light) delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = 'light';
  localStorage.setItem('theme', light ? 'dark' : 'light');
});
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth'}); }));
