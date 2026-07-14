(() => {
  const preloader = document.getElementById('preloader');
  const nameReveal = document.getElementById('name-reveal');
  const canvas = document.getElementById('matrix-canvas');
  if (!preloader || !nameReveal || !canvas) return;

  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  else document.documentElement.removeAttribute('data-theme');
  themeToggle?.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  });

  const navigation = performance.getEntriesByType('navigation')[0];
  const previousPath = document.referrer ? new URL(document.referrer).pathname : '';
  const skipRequested = new URLSearchParams(location.search).get('skipIntro') === '1';
  const returningFromTrack = skipRequested || /\/(hardware|track)\.html$/i.test(previousPath) || navigation?.type === 'back_forward';
  if (returningFromTrack) {
    preloader.remove();
    document.body.classList.remove('preloading');
    if (skipRequested) history.replaceState(null, '', 'index.html');
    return;
  }

  const ctx = canvas.getContext('2d');
  const characters = '0123456789ABCDEF';
  const fontSize = 14;
  let drops = [];
  let matrixTimer;

  const sizeCanvas = () => {
    const scale = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    drops = Array.from({length: Math.ceil(window.innerWidth / fontSize)}, () => Math.floor(Math.random() * window.innerHeight / fontSize));
  };

  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = 'rgba(92, 102, 112, 0.22)';
    ctx.font = `${fontSize}px monospace`;
    drops.forEach((drop, index) => {
      ctx.fillText(characters[Math.floor(Math.random() * characters.length)], index * fontSize, drop * fontSize);
      if (drop * fontSize > window.innerHeight && Math.random() > .975) drops[index] = 0;
      else drops[index] += 1;
    });
  };

  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  matrixTimer = window.setInterval(draw, 28);

  const target = nameReveal.dataset.name;
  let iteration = 0;
  const revealTimer = window.setInterval(() => {
    nameReveal.textContent = target.split('').map((letter, index) => {
      if (letter === ' ') return ' ';
      return index < Math.floor(iteration / 2) ? letter : characters[Math.floor(Math.random() * characters.length)];
    }).join('');
    iteration += 1;
    if (iteration >= target.length * 2) {
      window.clearInterval(revealTimer);
      nameReveal.textContent = target;
      window.setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('preloading');
        window.clearInterval(matrixTimer);
      }, 650);
    }
  }, 55);
})();

// Reliably move from the landing hero to the full track selector.
(() => {
  const trigger = document.querySelector('.gateway-cta[href="#tracks"]');
  const tracks = document.getElementById('tracks');
  if (!trigger || !tracks) return;
  trigger.addEventListener('click', event => {
    event.preventDefault();
    tracks.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    });
  });
})();

// Track-card accent glow follows the pointer without moving the card.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.gateway-track-dock .track-card').forEach(card => {
    let frame = 0;
    card.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--glow-x', `${x * 100}%`);
        card.style.setProperty('--glow-y', `${y * 100}%`);
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '50%');
    });
  });
})();

// Dependency-free adaptation of the supplied Originkit particle sphere.
(() => {
  // Superseded by the faithful Three.js implementation in particle-sphere.js.
  return;
  const canvas = document.getElementById('particle-sphere');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const count = 10000;
  const base = new Float32Array(count * 3);
  const offset = new Float32Array(count * 3);
  const velocity = new Float32Array(count * 3);
  const screen = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0, height = 0, radius = 0, dpr = 1;
  let rotationX = -.16, rotationY = 0, targetX = rotationX, targetY = 0;
  let dragging = false, lastX = 0, lastY = 0;
  const pointer = { x: -9999, y: -9999, active: false };

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    const j = i * 3;
    base[j] = Math.cos(theta) * ring;
    base[j + 1] = y;
    base[j + 2] = Math.sin(theta) * ring;
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    radius = Math.min(width, height) * .34;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const pointerPosition = event => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  };

  canvas.addEventListener('pointerdown', event => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    pointerPosition(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    pointerPosition(event);
    if (!dragging) return;
    targetY += (event.clientX - lastX) * .008;
    targetX += (event.clientY - lastY) * .008;
    lastX = event.clientX;
    lastY = event.clientY;
  });
  canvas.addEventListener('pointerup', () => { dragging = false; });
  canvas.addEventListener('pointerleave', () => { dragging = false; pointer.active = false; });
  canvas.addEventListener('click', event => {
    pointerPosition(event);
    const influence = 120;
    for (let i = 0; i < count; i++) {
      const j = i * 3;
      const dx = screen[j] - pointer.x;
      const dy = screen[j + 1] - pointer.y;
      const dist = Math.hypot(dx, dy);
      if (dist > influence || dist < 1) continue;
      const force = (1 - dist / influence) * .085;
      velocity[j] += dx / dist * force;
      velocity[j + 1] += -dy / dist * force;
      velocity[j + 2] += (Math.random() - .5) * force;
    }
  });

  const drawSphere = () => {
    ctx.clearRect(0, 0, width, height);
    if (!dragging && !reducedMotion) targetY += .0022;
    rotationX += (targetX - rotationX) * .1;
    rotationY += (targetY - rotationY) * .1;
    const sinX = Math.sin(rotationX), cosX = Math.cos(rotationX);
    const sinY = Math.sin(rotationY), cosY = Math.cos(rotationY);
    const color = getComputedStyle(canvas).getPropertyValue('--sphere-color').trim() || '#ff0000';
    ctx.fillStyle = color;

    for (let i = 0; i < count; i++) {
      const j = i * 3;
      velocity[j] += -offset[j] * .015;
      velocity[j + 1] += -offset[j + 1] * .015;
      velocity[j + 2] += -offset[j + 2] * .015;
      velocity[j] *= .94; velocity[j + 1] *= .94; velocity[j + 2] *= .94;
      offset[j] += velocity[j]; offset[j + 1] += velocity[j + 1]; offset[j + 2] += velocity[j + 2];

      const x0 = base[j] + offset[j];
      const y0 = base[j + 1] + offset[j + 1];
      const z0 = base[j + 2] + offset[j + 2];
      const x1 = x0 * cosY - z0 * sinY;
      const z1 = x0 * sinY + z0 * cosY;
      const y1 = y0 * cosX - z1 * sinX;
      const z2 = y0 * sinX + z1 * cosX;
      const perspective = 2.8 / (3.3 - z2);
      const sx = width * .5 + x1 * radius * perspective;
      const sy = height * .5 + y1 * radius * perspective;
      screen[j] = sx; screen[j + 1] = sy; screen[j + 2] = z2;

      if (pointer.active && !dragging) {
        const dx = sx - pointer.x;
        const dy = sy - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120 && dist > 1) {
          const push = (1 - dist / 120) * .0018;
          velocity[j] += dx / dist * push;
          velocity[j + 1] += -dy / dist * push;
        }
      }

      const alpha = .2 + ((z2 + 1) * .38);
      ctx.globalAlpha = Math.max(.12, Math.min(1, alpha));
      const size = Math.max(.45, 1.45 * perspective);
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawSphere);
  };

  resize();
  new ResizeObserver(resize).observe(canvas);
  requestAnimationFrame(drawSphere);
})();
