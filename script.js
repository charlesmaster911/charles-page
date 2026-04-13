// ===== 언어 토글 =====
function setLang(lang) {
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('prefLang', lang);
  const emailInput = document.querySelector('input[type="email"]');
  if (emailInput) {
    emailInput.placeholder = emailInput.getAttribute('data-' + lang + '-placeholder') || emailInput.placeholder;
  }
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.setAttribute('data-active', lang === 'ko' ? 'ko' : 'en');
  });
  document.querySelectorAll('.lang-btn')[0].setAttribute('data-active', 'ko');
  document.querySelectorAll('.lang-btn')[1].setAttribute('data-active', 'en');
}
(function() {
  const saved = localStorage.getItem('prefLang') || 'ko';
  setLang(saved);
})();

// ===== 헤더 스크롤 =====
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 40 ? '0 2px 24px rgba(0,0,0,0.5)' : 'none';
}, { passive: true });

// ===== 뉴스레터 폼 =====
function handleSubscribe(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const btn = e.target.querySelector('button');
  const isEn = document.documentElement.getAttribute('lang') === 'en';
  btn.textContent = isEn ? 'Thank you ✓' : '감사합니다 ✓';
  btn.style.background = '#2d9e6b';
  input.value = '';
  input.disabled = true;
  btn.disabled = true;
}

// ===== 스무스 스크롤 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== 커스텀 커서 =====
(function() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function animateRing() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  document.querySelectorAll('a, button, .brand-item, .book-link, .brand-mif-slide').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-ring--hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-ring--hover'));
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
})();

// ===== 카운터 애니메이션 =====
function countUp(el, target, duration) {
  duration = duration || 1400;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  })(start);
}

// ===== 스크롤 리빌 & 카운터 트리거 =====
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => {
      el.classList.add('revealed');
      if (el.dataset.count) countUp(el, parseInt(el.dataset.count));
    }, delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.12 });

// 카운터 대상
document.querySelectorAll('.count-num[data-count]').forEach(el => revealObs.observe(el));

// 섹션 라벨 언더라인
document.querySelectorAll('.section-label').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// 챕터 스태거
document.querySelectorAll('.chapter-row').forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.delay = i * 120;
  revealObs.observe(el);
});

// 브랜드 스태거
document.querySelectorAll('.brand-item').forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.delay = i * 90;
  revealObs.observe(el);
});

// 책 스태거
document.querySelectorAll('.book').forEach((el, i) => {
  el.classList.add('reveal');
  el.dataset.delay = i * 110;
  revealObs.observe(el);
});

// 블록쿼트
document.querySelectorAll('blockquote').forEach(el => {
  el.classList.add('reveal', 'reveal-right');
  revealObs.observe(el);
});

// 마스터마인드 텍스트
document.querySelectorAll('.mastermind-text').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// 뉴스레터
document.querySelectorAll('.newsletter-inner').forEach(el => {
  el.classList.add('reveal');
  revealObs.observe(el);
});

// ===== 활성 네비 하이라이트 =====
const navLinks = document.querySelectorAll('nav a[href^="#"]');
const sectionIds = ['about', 'brands', 'mastermind', 'newsletter'];

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('nav-active'));
      const link = document.querySelector(`nav a[href="#${entry.target.id}"]`);
      if (link) link.classList.add('nav-active');
    }
  });
}, { rootMargin: '-35% 0px -60% 0px' });

sectionIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) navObs.observe(el);
});
