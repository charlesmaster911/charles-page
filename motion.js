// 스크롤 연출: 등장(.rv) · 숫자 올라가기([data-to]) · 고정 장면(.pin) 진행값 --p · 단어 밝아짐 · 얼음 단계 · 세 번의 삶 진행선
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) root.classList.add('motion');
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };

  // 첫 화면 제목을 단어 단위로 쪼갬(<mark> 같은 요소는 한 덩어리)
  var wi = 0;
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      var parts = n.nodeType === 3 ? n.textContent.split(/(\s+)/) : [n];
      parts.forEach(function (p) {
        if (typeof p === 'string' && !p.trim()) { if (p) frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span');
        s.className = 'w'; s.style.setProperty('--i', wi++);
        s.appendChild(typeof p === 'string' ? document.createTextNode(p) : p);
        frag.appendChild(s);
      });
    });
    el.textContent = ''; el.appendChild(frag);
  });

  // 고정 장면 문장을 단어로 쪼갬(<b> 안 단어는 강조색)
  var words = [];
  document.querySelectorAll('.scrub-text').forEach(function (el) {
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      var hot = n.nodeType === 1 && n.tagName === 'B';
      if (n.nodeType === 1 && !hot) { frag.appendChild(n); return; }
      n.textContent.split(/(\s+)/).forEach(function (p) {
        if (!p.trim()) { if (p) frag.appendChild(document.createTextNode(p)); return; }
        var s = document.createElement('span');
        s.className = 'sw' + (hot ? ' hot' : ''); s.textContent = p;
        frag.appendChild(s); words.push(s);
      });
    });
    el.textContent = ''; el.appendChild(frag);
  });

  // 숫자 올라가기
  function countUp(el) {
    var to = +el.dataset.to, t0 = null;
    if (reduce) return;
    function step(t) {
      t0 = t0 || t;
      var k = clamp((t - t0) / 1400);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))).toLocaleString('ko-KR');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // 등장
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-to]').forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv, .flow, .count-wrap').forEach(function (el) {
    if (reduce) el.classList.add('in'); else io.observe(el);
  });

  // 스크롤 진행값
  var pins = document.querySelectorAll('.pin'), chapters = document.querySelector('.chapters');
  var steps = document.querySelectorAll('#ice .st'), ice = document.getElementById('ice');
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    pins.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      var p = reduce ? 1 : clamp(-r.top / (r.height - vh));
      sec.style.setProperty('--p', p.toFixed(3));
      if (sec.id === 'reframe') {
        var lit = p * 1.15 * words.length;
        words.forEach(function (w, i) { w.style.opacity = Math.max(0.14, clamp(lit - i)); });
      }
      if (sec === ice) {
        var k = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
        steps.forEach(function (s, i) { s.classList.toggle('on', i === k); });
        ice.style.setProperty('--p', clamp((p - 0.18) / 0.55).toFixed(3));
      }
    });
    if (chapters) {
      var c = chapters.getBoundingClientRect();
      chapters.style.setProperty('--p', reduce ? 1 : clamp((vh * 0.65 - c.top) / c.height).toFixed(3));
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', frame);
  frame();
})();
