/* =====================================================
   Pratap Chandra Das Memorial Trust â€” Main JS
   Shared across all pages
   ===================================================== */

'use strict';

/* --------------------------------------------------
   Scroll Progress Bar  (index.html only)
-------------------------------------------------- */
const scrollProgressBar = document.getElementById('scrollProgress');

/* --------------------------------------------------
   Navbar: transparent â†’ solid on scroll  (all pages)
-------------------------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', onScroll, { passive: true });

function onScroll() {
  const scrollY = window.scrollY;

  /* Scroll progress bar */
  if (scrollProgressBar) {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgressBar.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0).toFixed(1) + '%';
  }

  /* Navbar state */
  if (navbar) {
    navbar.classList.toggle('scrolled', scrollY > 20);
  }

  /* Hero parallax & fade  (index.html only) */
  if (heroSection) applyHeroParallax(scrollY);

  /* Stats section parallax  (index.html only) */
  if (statsBgImage) applyStatsParallax(scrollY);
}

/* --------------------------------------------------
   Mobile Navigation Toggle  (all pages)
-------------------------------------------------- */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
      /* Don't close nav when tapping a dropdown parent on mobile */
      const parentItem = link.closest('.nav-item-dropdown');
      if (parentItem && link === parentItem.querySelector(':scope > a') && window.innerWidth <= 768) {
        return;
      }
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.querySelectorAll('.nav-item-dropdown.open').forEach(el => el.classList.remove('open'));
    })
  );

  /* Mobile dropdown accordion toggle */
  document.querySelectorAll('.nav-item-dropdown').forEach(item => {
    const parentLink = item.querySelector(':scope > a');
    parentLink.addEventListener('click', e => {
      /* Always prevent navigation — About is only a dropdown trigger */
      e.preventDefault();
      if (window.innerWidth <= 768) {
        document.querySelectorAll('.nav-item-dropdown.open').forEach(other => {
          if (other !== item) other.classList.remove('open');
        });
        item.classList.toggle('open');
      }
    });
  });
}

/* --------------------------------------------------
   Scroll Reveal  (all pages)
-------------------------------------------------- */
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal, .reveal-up').forEach(el => revealObserver.observe(el));

/* --------------------------------------------------
   Hero Carousel  (index.html only)
-------------------------------------------------- */
const heroSection    = document.getElementById('hero');
const heroContent    = document.getElementById('heroContent');
const heroCarouselEl = document.getElementById('heroCarousel');
const heroScrollHint = document.getElementById('heroScrollHint');
const slides         = document.querySelectorAll('.hero-slide');
const carouselDots   = document.querySelectorAll('.carousel-dot');

let currentSlide = 0;
let carouselTimer;

if (slides.length > 0) {
  initCarousel();
}

function goToSlide(idx) {
  slides[currentSlide].classList.remove('active');
  carouselDots[currentSlide].classList.remove('active');
  currentSlide = idx;
  slides[currentSlide].classList.add('active');
  carouselDots[currentSlide].classList.add('active');
}

function nextSlide() {
  goToSlide((currentSlide + 1) % slides.length);
}

function startCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 5500);
}

function initCarousel() {
  startCarouselTimer();

  carouselDots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      startCarouselTimer(); /* restart timer on manual navigation */
    });
  });
}

/* --------------------------------------------------
   Hero Parallax (index.html only)
   Effect: background stays nearly fixed (slow drift),
   content lifts up and fades â€” "sticky background" feel
   Called on every scroll event
-------------------------------------------------- */
function applyHeroParallax(scrollY) {
  const heroH = heroSection.offsetHeight;
  const pct   = Math.min(scrollY / heroH, 1);

  /* Background drifts very slowly â€” feels pinned while content rises */
  if (heroCarouselEl) {
    heroCarouselEl.style.transform = `translateY(${scrollY * 0.22}px) scale(${1 + pct * 0.04})`;
    heroCarouselEl.style.willChange = 'transform';
  }

  /* Overlay deepens slightly as you scroll for depth separation */
  const heroOverlay = document.querySelector('.hero-overlay');
  if (heroOverlay) {
    heroOverlay.style.opacity = 1 + pct * 0.35;
  }

  /* Foreground content rises faster than background â†’ parallax separation */
  if (heroContent) {
    heroContent.style.opacity   = Math.max(1 - pct * 2.5, 0).toFixed(3);
    heroContent.style.transform = `translateY(-${scrollY * 0.28}px)`;
    heroContent.style.willChange = 'transform, opacity';
  }

  /* Scroll hint vanishes quickly */
  if (heroScrollHint) {
    heroScrollHint.style.opacity = Math.max(1 - pct * 7, 0);
  }
}

/* --------------------------------------------------
   Stats Section  (index.html only)
-------------------------------------------------- */
const statsSection = document.getElementById('statsSection');
const statsBgImage = document.querySelector('.stats-bg-image');

/* Parallax: keeps background image nearly fixed as user scrolls through section */
function applyStatsParallax(scrollY) {
  if (!statsBgImage || !statsSection) return;

  /* Skip JS parallax on iOS â€” CSS background-attachment:scroll already handles it */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) return;

  const rect = statsSection.getBoundingClientRect();
  const inView = rect.top < window.innerHeight && rect.bottom > 0;
  if (!inView) return;

  /* Move background at 30% of scroll speed */
  const offset = (scrollY - (statsSection.offsetTop - window.innerHeight * 0.5)) * 0.3;
  statsBgImage.style.transform = `translateY(${offset}px)`;
}

/* Count-up: animated numbers when section enters viewport */
if (statsSection) {
  const statValues = statsSection.querySelectorAll('.stat-value[data-target]');

  const countUp = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const startTime = performance.now();
    const accentEl = el.querySelector('.accent');
    const suffix = accentEl ? accentEl.outerHTML : '';

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      const formatted = current >= 1000
        ? (current / 1000).toFixed(current % 1000 === 0 ? 0 : 1) + 'K'
        : current.toString();
      el.innerHTML = formatted + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statValues.forEach(el => countUp(el));
          statsObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  statsObserver.observe(statsSection);
}

/* --------------------------------------------------
   Work Page Gallery Slider  (work.html only)
-------------------------------------------------- */
(function () {
  const track   = document.getElementById('wgTrack');
  const btnPrev = document.getElementById('wgPrev');
  const btnNext = document.getElementById('wgNext');

  if (!track || !btnPrev || !btnNext) return;

  let current = 0;

  function getSlidesPerView() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 1.2;
    return 2;
  }

  function getSlideWidth() {
    const slides = track.querySelectorAll('.wg-slide');
    if (!slides.length) return 0;
    const style = getComputedStyle(slides[0]);
    return slides[0].offsetWidth + parseInt(style.marginRight || 18, 10);
  }

  const totalSlides = track.querySelectorAll('.wg-slide').length;

  function maxIndex() {
    const perView = Math.floor(getSlidesPerView());
    return Math.max(0, totalSlides - perView);
  }

  function updateSlider() {
    // On mobile, native scroll-snap handles navigation — skip JS transform
    if (window.innerWidth <= 768) {
      track.style.transform = '';
      return;
    }
    const slideW = getSlideWidth();
    track.style.transform = `translateX(-${current * slideW}px)`;
    btnPrev.disabled = current <= 0;
    btnNext.disabled = current >= maxIndex();
  }

  btnPrev.addEventListener('click', () => {
    if (current > 0) { current--; updateSlider(); }
  });

  btnNext.addEventListener('click', () => {
    if (current < maxIndex()) { current++; updateSlider(); }
  });

  window.addEventListener('resize', () => {
    current = Math.min(current, maxIndex());
    updateSlider();
  }, { passive: true });

  updateSlider();
})();

/* --------------------------------------------------
   About Section Image Carousel
   Auto-rotates every 2.5 s — Ken Burns on active slide
   Pause on hover — Touch/swipe support
-------------------------------------------------- */
const aboutCarouselEl = document.getElementById('aboutCarousel');

if (aboutCarouselEl) {
  const track        = document.getElementById('aboutTrack');
  const slides       = aboutCarouselEl.querySelectorAll('.about-carousel-slide');
  const dots         = aboutCarouselEl.querySelectorAll('.about-carousel-dot');
  const progressFill = document.getElementById('aboutProgressFill');
  const INTERVAL     = 2000;
  let current        = 0;
  let timer;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = idx;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    track.style.transform = `translateX(-${current * 100}%)`;
    resetProgress();
  }

  function next() { goTo((current + 1) % slides.length); }

  function resetProgress() {
    if (!progressFill) return;
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth;
    progressFill.style.transition = `width ${INTERVAL}ms linear`;
    progressFill.style.width = '100%';
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
    resetProgress();
  }

  start();

  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); start(); }));

  aboutCarouselEl.addEventListener('mouseenter', () => {
    clearInterval(timer);
    if (progressFill) { progressFill.style.transition = 'none'; }
  });
  aboutCarouselEl.addEventListener('mouseleave', start);

  let touchStartX = 0;
  aboutCarouselEl.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  aboutCarouselEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0
        ? (current + 1) % slides.length
        : (current - 1 + slides.length) % slides.length
      );
      start();
    }
  }, { passive: true });
}

