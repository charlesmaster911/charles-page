// ===== Google Sheets 연동 URL (멤버십 + 뉴스레터 공통) =====
var SHEET_URL = 'https://script.google.com/macros/s/AKfycbxH6Sg9Jjs1ki3azFwtzHtL4OQ_nh5UhAYbbk_8FOgGNlrxkVNxY7crRecWNQ3VvIY/exec';

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
  var input = e.target.querySelector('input[type="email"]');
  var btn = e.target.querySelector('button');
  var isEn = document.documentElement.getAttribute('lang') === 'en';
  var email = input.value;

  btn.textContent = isEn ? 'Sending...' : '전송 중...';
  btn.disabled = true;

  var params = new URLSearchParams({
    email: email,
    type: 'newsletter',
    date: new Date().toLocaleString('ko-KR')
  });

  if (SHEET_URL) {
    fetch(SHEET_URL + '?' + params.toString(), { mode: 'no-cors' })
      .finally(function() {
        btn.textContent = isEn ? 'Thank you ✓' : '감사합니다 ✓';
        btn.style.background = '#2d9e6b';
        input.value = '';
        input.disabled = true;
      });
  } else {
    btn.textContent = isEn ? 'Thank you ✓' : '감사합니다 ✓';
    btn.style.background = '#2d9e6b';
    input.value = '';
    input.disabled = true;
  }
}

// ===== 결 멤버십 모달 =====
function openMembershipModal(e) {
  if (e) e.preventDefault();
  document.getElementById('membershipModal').classList.add('modal-open');
  document.body.style.overflow = 'hidden';
}
function closeMembershipModal(e) {
  if (e && e.target !== document.getElementById('membershipModal')) return;
  document.getElementById('membershipModal').classList.remove('modal-open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMembershipModal();
});

function handleMembershipApply(e) {
  e.preventDefault();
  var name = document.getElementById('memberName').value;
  var email = document.getElementById('memberEmail').value;
  var btn = e.target.querySelector('.modal-submit');
  var isEn = document.documentElement.getAttribute('lang') === 'en';

  btn.textContent = isEn ? 'Sending...' : '전송 중...';
  btn.disabled = true;

  var params = new URLSearchParams({
    name: name,
    email: email,
    type: 'membership',
    date: new Date().toLocaleString('ko-KR')
  });
  if (SHEET_URL) {
    fetch(SHEET_URL + '?' + params.toString(), { mode: 'no-cors' })
      .finally(function() { showMembershipSuccess(btn, isEn); });
  } else {
    showMembershipSuccess(btn, isEn);
  }
}
function showMembershipSuccess(btn, isEn) {
  btn.textContent = isEn ? 'Thank you ✓' : '신청 완료 ✓';
  btn.style.background = '#2d9e6b';
  document.getElementById('memberName').disabled = true;
  document.getElementById('memberEmail').disabled = true;
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

// ===== 단상 로딩 & 아코디언 =====
var thoughtsData = [];

function renderThoughts(thoughts) {
  var list = document.getElementById('thoughtsList');
  if (!list) return;
  var isEn = document.documentElement.getAttribute('lang') === 'en';
  list.innerHTML = '';
  thoughts.forEach(function(t, i) {
    var title = isEn ? (t.title_en || t.title_ko) : t.title_ko;
    var body = isEn ? (t.en || t.ko) : t.ko;
    var item = document.createElement('div');
    item.className = 'thought-item reveal';
    item.dataset.delay = i * 80;
    item.innerHTML =
      '<div class="thought-header" onclick="toggleThought(this.parentElement)">' +
        '<span class="thought-date">' + t.date + '</span>' +
        '<p class="thought-title">' + title + '</p>' +
        '<span class="thought-arrow">↓</span>' +
      '</div>' +
      '<div class="thought-body">' +
        '<p class="thought-content">' + body.replace(/\n/g, '<br>') + '</p>' +
      '</div>';
    list.appendChild(item);
    revealObs.observe(item);
  });
}

function toggleThought(item) {
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.thought-item.open').forEach(function(el) { el.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
}

(function() {
  fetch('thoughts.json')
    .then(function(r) { return r.json(); })
    .then(function(thoughts) {
      thoughtsData = thoughts;
      renderThoughts(thoughts);
    });
})();

// ===== 단상 쓰기 패널 (제목 5번 클릭) =====
var writeClickCount = 0;
var writeClickTimer = null;
document.addEventListener('DOMContentLoaded', function() {
  var title = document.querySelector('.thoughts-title');
  if (title) {
    title.addEventListener('click', function() {
      writeClickCount++;
      clearTimeout(writeClickTimer);
      writeClickTimer = setTimeout(function() { writeClickCount = 0; }, 1500);
      if (writeClickCount >= 5) {
        writeClickCount = 0;
        openWritePanel();
      }
    });
  }
});

function openWritePanel() {
  document.getElementById('thoughtWritePanel').classList.add('panel-open');
  document.body.style.overflow = 'hidden';
}
function closeWritePanel() {
  document.getElementById('thoughtWritePanel').classList.remove('panel-open');
  document.body.style.overflow = '';
}

function submitThought(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button[type="submit"]');
  var today = new Date();
  var date = today.getFullYear() + '.' +
    String(today.getMonth()+1).padStart(2,'0') + '.' +
    String(today.getDate()).padStart(2,'0');
  var params = new URLSearchParams({
    type: 'thought',
    date: date,
    title_ko: document.getElementById('wTitleKo').value,
    title_en: document.getElementById('wTitleEn').value,
    body_ko: document.getElementById('wBodyKo').value,
    body_en: document.getElementById('wBodyEn').value
  });
  btn.textContent = '저장 중...';
  btn.disabled = true;
  fetch(SHEET_URL + '?' + params.toString(), { mode: 'no-cors' })
    .finally(function() {
      btn.textContent = '올렸습니다 ✓';
      btn.style.background = '#2d9e6b';
      var newThought = {
        date: date,
        title_ko: document.getElementById('wTitleKo').value,
        title_en: document.getElementById('wTitleEn').value,
        ko: document.getElementById('wBodyKo').value,
        en: document.getElementById('wBodyEn').value
      };
      thoughtsData.unshift(newThought);
      renderThoughts(thoughtsData);
      setTimeout(function() { closeWritePanel(); btn.textContent = '올리기'; btn.disabled = false; btn.style.background = ''; e.target.reset(); }, 1500);
    });
}

// ===== 활성 네비 하이라이트 =====
const navLinks = document.querySelectorAll('nav a[href^="#"]');
// 앱 카드 스크롤 리빌
document.querySelectorAll('.app-card').forEach(function(el, i) {
  el.classList.add('reveal');
  el.dataset.delay = i * 120;
  revealObs.observe(el);
});

const sectionIds = ['about', 'brands', 'mastermind', 'playground', 'thoughts', 'newsletter'];

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
