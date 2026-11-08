(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Ano automático no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const typedEl = document.getElementById('typed');
  const snippet = [
    'const dev = {',
    '  nome: "Amadeu Fernandes",',
    '  papel: "Desenvolvimento Full-Stack & Automações",',
    '  stack: ["JavaScript", "React", "Make", "Python", "MySQL"],',
    '  foco: ["Automações", "Integração de Sistemas", "Engenharia de Software", "IA"],',
    '  formacao: "Ciência da Computação - UFMA",',
    '  disponivel: true',
    '};'
  ].join('\n');

  function typeSnippet() {
    if (!typedEl) return;

    if (prefersReducedMotion) {
      typedEl.textContent = snippet;
      return;
    }

    let index = 0;
    const step = () => {
      typedEl.textContent = snippet.slice(0, index);
      index++;
      if (index <= snippet.length) {
        const delay = snippet[index - 1] === '\n' ? 180 : 28 + Math.random() * 40;
        setTimeout(step, delay);
      }
    };
    setTimeout(step, 600);
  }

  typeSnippet();

  /* ---------- Menu mobile ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  function setMenu(open) {
    if (!menuToggle || !navLinks) return;
    navLinks.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      setMenu(!isOpen);
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenu(false);
      }
    });
  }

  const navbar = document.getElementById('navbar');

  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if ('IntersectionObserver' in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navAnchors.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Projetos: rolagem contínua ao passar o mouse nas bordas ---------- */
  const carousel = document.getElementById('projectsCarousel');
  const track = document.getElementById('projectsTrack');

  if (carousel && track) {
    const EDGE_ZONE = 0.12;
    const SPEED = 2;
    const originals = Array.from(track.children);
    const count = originals.length;
    let setWidth = 0;
    let direction = 0;
    let frameId = null;

    function makeClone(el) {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a, button, input, textarea, select').forEach((node) => {
        node.setAttribute('tabindex', '-1');
      });
      return clone;
    }

    if (count > 0) {
      const before = document.createDocumentFragment();
      originals.forEach((el) => before.appendChild(makeClone(el)));
      track.insertBefore(before, track.firstChild);

      originals.forEach((el) => track.appendChild(makeClone(el)));
    }

    function measure() {
      const start = track.children[0];
      const first = track.children[count];
      if (!start || !first) return;

      const oldSet = setWidth;
      setWidth = first.getBoundingClientRect().left - start.getBoundingClientRect().left;

      if (oldSet > 0) {
        const offset = ((track.scrollLeft % oldSet) + oldSet) % oldSet;
        track.scrollLeft = setWidth + offset;
      } else {
        track.scrollLeft = setWidth;
      }
    }

    function wrap() {
      if (!setWidth) return;
      if (track.scrollLeft < setWidth) {
        track.scrollLeft += setWidth;
      } else if (track.scrollLeft >= setWidth * 2) {
        track.scrollLeft -= setWidth;
      }
    }

    function tick() {
      if (direction === 0) {
        frameId = null;
        return;
      }

      track.scrollLeft += direction * SPEED;
      wrap();
      frameId = requestAnimationFrame(tick);
    }

    function setDirection(dir) {
      direction = dir;
      if (dir !== 0 && frameId === null) {
        frameId = requestAnimationFrame(tick);
      }
    }

    measure();
    window.addEventListener('resize', measure);
    track.addEventListener('scroll', wrap, { passive: true });

    carousel.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;

      const rect = carousel.getBoundingClientRect();
      const position = (event.clientX - rect.left) / rect.width;

      if (position < EDGE_ZONE) {
        setDirection(-1);
      } else if (position > 1 - EDGE_ZONE) {
        setDirection(1);
      } else {
        setDirection(0);
      }
    });

    carousel.addEventListener('pointerleave', () => setDirection(0));
  }

  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }
})();