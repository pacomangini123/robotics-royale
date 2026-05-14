/* ================================================================
   ROBOTICS ROYALE — script.js
   Funciones: partículas, navbar scroll, hamburger, reveal
   animaciones, contadores, skill bars, timeline interactiva
================================================================ */

'use strict';

// ----------------------------------------------------------------
// 1. INICIALIZAR ICONOS LUCIDE
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  initAll();
});

function initAll() {
  initParticles();
  initNavbar();
  initHamburger();
  initRevealObserver();
  initCounters();
  initSkillBars();
  initTimelineReveal();
  initSmoothScroll();
  initGalleryHover();
  initCursorGlow();
}

// ----------------------------------------------------------------
// 2. PARTÍCULAS — Canvas animado en fondo
// ----------------------------------------------------------------
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], animId;

  const PARTICLE_COUNT = window.innerWidth < 768 ? 60 : 120;
  const COLORS = [
    'rgba(124,58,237,',   // purple
    'rgba(59,130,246,',   // blue
    'rgba(34,211,238,',   // cyan
    'rgba(168,85,247,',   // purple light
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 10;
      this.r = Math.random() * 2 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.alpha = Math.random() * 0.6 + 0.1;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Algunas partículas son "estrellas" que parpadean
      this.twinkle = Math.random() > 0.7;
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.twinkleDir = 1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.twinkle) {
        this.alpha += this.twinkleSpeed * this.twinkleDir;
        if (this.alpha > 0.8 || this.alpha < 0.05) this.twinkleDir *= -1;
      }
      if (this.y < -10) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.alpha + ')';
      ctx.fill();
    }
  }

  // Conexiones entre partículas cercanas
  function drawConnections() {
    const dist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < dist) {
          const opacity = (1 - d / dist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  function init() {
    cancelAnimationFrame(animId);
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    loop();
  }

  window.addEventListener('resize', debounce(init, 300));
  init();
}

// ----------------------------------------------------------------
// 3. NAVBAR — scroll para efecto glass
// ----------------------------------------------------------------
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ----------------------------------------------------------------
// 4. HAMBURGER — menú móvil
// ----------------------------------------------------------------
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Cerrar al hacer clic en un link
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Cerrar al hacer clic fuera
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// ----------------------------------------------------------------
// 5. REVEAL OBSERVER — elementos entran al hacer scroll
// ----------------------------------------------------------------
function initRevealObserver() {
  // Registrar elementos que deben animarse
  const targets = document.querySelectorAll(`
    .about-visual, .about-text,
    .team-card,
    .mission-card,
    .tl-item,
    .gallery-item,
    .stat-card,
    .footer-brand, .footer-links, .footer-social, .footer-competition
  `);

  targets.forEach(el => el.classList.add('reveal'));

  // Aplicar delays a tarjetas del equipo, misión y stats
  document.querySelectorAll('[data-delay]').forEach(el => {
    el.style.transitionDelay = el.dataset.delay + 'ms';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
}

// ----------------------------------------------------------------
// 6. CONTADORES ANIMADOS
// ----------------------------------------------------------------
function initCounters() {
  const cards = document.querySelectorAll('.stat-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card    = entry.target;
      const counter = card.querySelector('.counter');
      const target  = parseInt(card.dataset.target, 10);
      const special = card.dataset.special;

      if (special || !counter) {
        observer.unobserve(card);
        return;
      }

      animateCounter(counter, target, 1800);
      observer.unobserve(card);

      // Animar skill bar si aplica
      const fill = card.querySelector('.skill-fill');
      if (fill) {
        fill.style.width = fill.style.getPropertyValue('--w') ||
                           getComputedStyle(fill).getPropertyValue('--w');
      }
    });
  }, { threshold: 0.3 });

  cards.forEach(c => observer.observe(c));
}

function animateCounter(el, target, duration) {
  const start     = performance.now();
  const startVal  = 0;

  function ease(t) {
    // Ease out cubic
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const current  = Math.round(startVal + (target - startVal) * ease(progress));
    el.textContent = current;
    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = target;
  }

  requestAnimationFrame(frame);
}

// ----------------------------------------------------------------
// 7. SKILL BARS — animar al entrar en vista
// ----------------------------------------------------------------
function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fill = entry.target;
      const target = fill.style.getPropertyValue('--w') ||
                     getComputedStyle(fill).getPropertyValue('--w') || '80%';
      fill.style.width = target;
      observer.unobserve(fill);
    });
  }, { threshold: 0.5 });

  fills.forEach(f => observer.observe(f));
}

// ----------------------------------------------------------------
// 8. TIMELINE — efecto de reveal con línea progresiva
// ----------------------------------------------------------------
function initTimelineReveal() {
  const items = document.querySelectorAll('.tl-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = `opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`;
    observer.observe(item);
  });
}

// ----------------------------------------------------------------
// 9. SMOOTH SCROLL — navegación interna
// ----------------------------------------------------------------
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ----------------------------------------------------------------
// 10. GALLERY — efecto magnético al hover
// ----------------------------------------------------------------
function initGalleryHover() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('mousemove', e => {
      const rect   = item.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / rect.width  * 6;
      const dy     = (e.clientY - cy) / rect.height * 6;
      item.style.transform = `scale(1.03) rotateY(${dx}deg) rotateX(${-dy}deg)`;
    });
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
}

// ----------------------------------------------------------------
// 11. CURSOR GLOW — sigue al cursor con halo suave
//     Solo en desktop
// ----------------------------------------------------------------
function initCursorGlow() {
  if (window.innerWidth < 768) return;

  const glow = document.createElement('div');
  glow.id = 'cursorGlow';
  glow.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 300px; height: 300px;
    pointer-events: none;
    z-index: 0;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    will-change: transform;
  `;
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;
  let rId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animGlow() {
    gx = lerp(gx, mx, 0.08);
    gy = lerp(gy, my, 0.08);
    glow.style.transform = `translate(${gx - 150}px, ${gy - 150}px)`;
    rId = requestAnimationFrame(animGlow);
  }
  animGlow();
}

// ----------------------------------------------------------------
// 12. HERO — efecto parallax leve en scroll
// ----------------------------------------------------------------
(function initHeroParallax() {
  const heroContent = document.querySelector('.hero-content');
  const orbs = document.querySelectorAll('.orb');
  if (!heroContent) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    const factor = y * 0.3;
    heroContent.style.transform = `translateY(${factor * 0.4}px)`;
    heroContent.style.opacity = 1 - y / (window.innerHeight * 0.8);
    orbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${factor * (0.1 * (i + 1))}px)`;
    });
  }, { passive: true });
})();

// ----------------------------------------------------------------
// 13. SECTION HEADER — animate on scroll
// ----------------------------------------------------------------
(function initSectionHeaders() {
  document.querySelectorAll('.section-header').forEach(header => {
    header.classList.add('reveal');
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    }, { threshold: 0.2 }).observe(header);
  });
})();

// ----------------------------------------------------------------
// 14. TYPING EFFECT — subtle en hero badge (opcional)
// ----------------------------------------------------------------
(function initTypingEffect() {
  const texts = [
    'Fusalmo · Soyapango · El Salvador',
    'STEAM Maker Challenge 2025',
    'Road to Korea 🇰🇷',
    'Innovadores · Soñadores · Campeones',
  ];
  const el = document.querySelector('.hero-badge span:last-child');
  if (!el) return;

  let i = 0, charIdx = 0, deleting = false, timer;

  function type() {
    const current = texts[i];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) {
        deleting = true;
        clearTimeout(timer);
        timer = setTimeout(type, 2200);
        return;
      }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        i = (i + 1) % texts.length;
      }
    }
    clearTimeout(timer);
    timer = setTimeout(type, deleting ? 40 : 70);
  }

  // Start after initial animation
  setTimeout(type, 1500);
})();

// ----------------------------------------------------------------
// 15. NEON FLICKER — efecto random en título hero
// ----------------------------------------------------------------
(function initNeonFlicker() {
  const line2 = document.querySelector('.line-2');
  if (!line2) return;

  function flicker() {
    // Pequeño glitch de opacidad
    line2.style.opacity = Math.random() > 0.96 ? '0.85' : '1';
    setTimeout(flicker, Math.random() * 3000 + 500);
  }
  setTimeout(flicker, 3000);
})();

// ----------------------------------------------------------------
// 16. BACKGROUND SCANLINE — línea de escaneo decorativa
// ----------------------------------------------------------------
(function initScanline() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const scanline = document.createElement('div');
  scanline.style.cssText = `
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent);
    pointer-events: none;
    z-index: 1;
    top: 0;
    animation: scanMove 8s linear infinite;
  `;
  hero.appendChild(scanline);

  // Insertar keyframes dinámicamente
  const style = document.createElement('style');
  style.textContent = `
    @keyframes scanMove {
      from { top: 0%; opacity: 0.8; }
      80%  { opacity: 0.4; }
      to   { top: 100%; opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ----------------------------------------------------------------
// 17. TEAM CARDS — 3D tilt effect
// ----------------------------------------------------------------
(function initCardTilt() {
  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = ((e.clientY - cy) / rect.height) * 10;
      const ry   = ((e.clientX - cx) / rect.width ) * -10;
      card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(.4,0,.2,1)';
    });
  });
})();

// ----------------------------------------------------------------
// 18. ACTIVE NAV LINK — resaltar sección activa
// ----------------------------------------------------------------
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) {
          active.classList.add('active');
          active.style.color = 'var(--c-purple-lt)';
        }
        links.forEach(link => {
          if (!link.classList.contains('active')) {
            link.style.color = '';
          }
        });
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-60px 0px -40% 0px'
  });

  sections.forEach(s => observer.observe(s));
})();

// ----------------------------------------------------------------
// UTILS
// ----------------------------------------------------------------
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
