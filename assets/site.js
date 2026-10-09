// textlore.app: shared behaviour for every page. No trackers, no cookies until a visitor reaches for Buy.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = 'http://www.w3.org/2000/svg';

  // ---------- Year rings, drawn from Sam's demo library (one ring per year, amber = busiest) ----------
  var COUNTS = [3120, 5480, 7940, 14210, 12860, 11030, 13670, 15980, 17420, 12390];
  var MAXC = 17420;
  function ringGeometry(inner, outer, gap) {
    var widths = COUNTS.map(function (c) { return 4 + 14 * c / MAXC; });
    var total = widths.reduce(function (a, b) { return a + b; }, 0) + gap * (COUNTS.length - 1);
    var scale = (outer - inner) / total, r = inner, out = [];
    widths.forEach(function (w) { w *= scale; r += w / 2; out.push({ r: r, w: w }); r += w / 2 + gap * scale; });
    return out;
  }
  window.TextloreRings = { COUNTS: COUNTS, MAXC: MAXC, geometry: ringGeometry };
  var ringStyles = {
    footer: { inner: 40, gap: 10, width: 0.45, ink: 0.06, amber: 0.35 },
    card: { inner: 40, gap: 10, width: 0.45, ink: 0.07, amber: 0.45 },
    final: { inner: 60, gap: 12, width: 0.4, ink: 0.07, amber: 0.5, color: '#ABA5FF', draw: true },
    art: { inner: 30, gap: 9, width: 0.55, ink: 0.18, amber: 0.9, draw: true, core: true },
    lost: { inner: 30, gap: 9, width: 0.55, ink: 0.18, amber: 0.9, draw: true, core: true, broken: 6 }
  };
  $$('svg[data-rings]').forEach(function (svg) {
    var st = ringStyles[svg.getAttribute('data-rings')] || ringStyles.art;
    ringGeometry(st.inner, 292, st.gap).forEach(function (g, i) {
      var busiest = COUNTS[i] === MAXC;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', 300); c.setAttribute('cy', 300); c.setAttribute('r', g.r.toFixed(1));
      c.setAttribute('fill', 'none'); c.setAttribute('stroke-width', (g.w * st.width).toFixed(1));
      c.setAttribute('stroke', busiest ? '#F5A524' : (st.color || 'currentColor'));
      c.setAttribute('stroke-opacity', busiest ? st.amber : (st.ink + 0.1 * COUNTS[i] / MAXC).toFixed(2));
      if (st.draw) { c.setAttribute('class', 'draw'); c.setAttribute('pathLength', 100); c.setAttribute('transform', 'rotate(-90 300 300)'); c.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); }
      if (st.broken === i) { c.setAttribute('stroke', '#F5A524'); c.setAttribute('stroke-opacity', 1); c.setAttribute('stroke-linecap', 'round'); c.removeAttribute('class'); c.setAttribute('pathLength', 100); c.setAttribute('stroke-dasharray', '78 100'); c.setAttribute('transform', 'rotate(30 300 300)'); }
      svg.appendChild(c);
    });
    if (st.core) { var d = document.createElementNS(NS, 'circle'); d.setAttribute('cx', 300); d.setAttribute('cy', 300); d.setAttribute('r', 10); d.setAttribute('fill', '#F5A524'); svg.appendChild(d); }
    if (!st.color) svg.style.color = 'var(--ink)';
  });

  // ---------- Rise in as things scroll into view ----------
  var risers = $$('.rise');
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    risers.forEach(function (el) { io.observe(el); });
  } else {
    risers.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---------- Navigation: hides while scrolling down, returns on the way up; a pill follows the pointer ----------
  var nav = $('.nav');
  if (nav) {
    var lastY = window.scrollY, menu = $('.nav__menu', nav);
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > 400 && y > lastY + 4);
      if (y < lastY - 4 || y < 400) nav.classList.remove('is-hidden');
      lastY = y;
    }, { passive: true });
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('.nav__links a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); }); });
    var pill = $('.nav__pill', nav), list = $('.nav__links', nav);
    function movePill(a) {
      if (!a) { pill.style.opacity = 0; return; }
      pill.style.left = a.offsetLeft + 'px'; pill.style.width = a.offsetWidth + 'px'; pill.style.opacity = 1;
    }
    var current = function () { return $('.nav__links a[aria-current="page"], .nav__links a.is-here', nav); };
    $$('.nav__links a', nav).forEach(function (a) { a.addEventListener('pointerenter', function () { movePill(a); }); });
    list.addEventListener('pointerleave', function () { movePill(current()); });
    movePill(current());
    // On the home page, the nav item for the section in view stays lit.
    var sections = $$('.nav__links a[href^="#"]', nav).map(function (a) { return [a, document.getElementById(a.getAttribute('href').slice(1))]; }).filter(function (p) { return p[1]; });
    if (sections.length && hasIO) {
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          sections.forEach(function (p) { if (p[1] === e.target) p[0].classList.toggle('is-here', e.isIntersecting); });
        });
        if (!list.matches(':hover')) movePill(current());
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (p) { sio.observe(p[1]); });
    }
  }

  // ---------- Buttons lean toward the pointer ----------
  if (finePointer && !reduce) {
    $$('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.transform = 'translate(' + (x * 8).toFixed(1) + 'px,' + (y * 6 - 2).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    // A soft light follows the pointer across cards.
    $$('.glow').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    // Screenshots tilt a little toward the pointer.
    $$('.tilt').forEach(function (t) {
      var win = $('.frame__win', t);
      t.addEventListener('pointermove', function (e) {
        var r = t.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        win.style.transform = 'rotateY(' + (x * 4).toFixed(2) + 'deg) rotateX(' + (-y * 4).toFixed(2) + 'deg)';
      });
      t.addEventListener('pointerleave', function () { win.style.transform = ''; });
    });
  }

  // ---------- Numbers count up once they're on screen ----------
  $$('[data-count]').forEach(function (el) {
    if (reduce || !hasIO) return;
    var end = +el.getAttribute('data-count');
    el.textContent = '0';
    var cio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      cio.disconnect();
      var t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    }, { threshold: 0.6 });
    cio.observe(el);
  });

  // ---------- Light and dark switches for screenshots ----------
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  function setScheme(scheme) {
    $$('.showcase').forEach(function (s) { s.setAttribute('data-scheme', scheme); });
    $$('.scheme button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set') === scheme ? 'true' : 'false'); });
  }
  if ($('.scheme')) {
    $$('.scheme button').forEach(function (b) { b.addEventListener('click', function () { setScheme(b.getAttribute('data-set')); }); });
    $$('.scheme button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-set') === (prefersDark.matches ? 'dark' : 'light') ? 'true' : 'false'); });
  }

  // ---------- Copy the email address ----------
  $$('.copy-mail').forEach(function (b) {
    b.addEventListener('click', function () {
      var mail = b.getAttribute('data-mail');
      var done = function () { b.classList.add('is-copied'); setTimeout(function () { b.classList.remove('is-copied'); }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { location.href = 'mailto:' + mail; });
      else location.href = 'mailto:' + mail;
    });
  });

  // ---------- Floating download bar: shows after the hero, hides near the pricing and the end ----------
  var bar = $('.dlbar'), hero = $('.hero');
  if (bar && hero && hasIO) {
    var pastHero = false, nearEnd = false;
    var update = function () {
      var on = pastHero && !nearEnd;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
      $$('a', bar).forEach(function (a) { a.tabIndex = on ? 0 : -1; });
    };
    new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; update(); }).observe(hero);
    var ends = $$('#pricing, .final, .footer');
    var visible = new Set();
    var eio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target); });
      nearEnd = visible.size > 0; update();
    });
    ends.forEach(function (e) { eio.observe(e); });
  }

  // ---------- Buy: Gumroad's overlay checkout, loaded only when a visitor reaches for Buy ----------
  var GUMROAD = 'https://gumroad.com/js/gumroad.js';
  var state = 'idle', waiting = [];
  function flush() { var w = waiting; waiting = []; w.forEach(function (f) { f(); }); }
  function loadGumroad(done) {
    if (done) waiting.push(done);
    if (state === 'ready' || state === 'failed') { flush(); return; }
    if (state === 'loading') return;
    state = 'loading';
    var s = document.createElement('script');
    s.src = GUMROAD; s.async = true;
    // gumroad.js adds its real bundle, which binds the Buy links when it loads.
    s.onload = function () {
      var bundle = $('script[src*="gumroad-bundle"]');
      var ready = function () { state = 'ready'; setTimeout(flush, 150); };
      if (bundle) { bundle.addEventListener('load', ready); bundle.addEventListener('error', function () { state = 'failed'; flush(); }); }
      else setTimeout(ready, 800);
    };
    s.onerror = function () { state = 'failed'; flush(); };
    document.head.appendChild(s);
  }
  $$('a.buy').forEach(function (a) {
    ['pointerenter', 'focus', 'touchstart'].forEach(function (type) { a.addEventListener(type, function () { loadGumroad(); }, { passive: true, once: true }); });
    a.addEventListener('click', function (e) {
      if (state === 'ready' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      var fallback = setTimeout(function () { window.location.href = a.href; }, 4000);
      loadGumroad(function () { clearTimeout(fallback); if (state === 'ready') a.click(); else window.location.href = a.href; });
    });
  });

  // ---------- Inner pages: table of contents follows the reader ----------
  var toc = $('.toc');
  if (toc && hasIO) {
    var links = {};
    $$('a[href^="#"]', toc).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || !links[e.target.id]) return;
        $$('.is-current', toc).forEach(function (a) { a.classList.remove('is-current'); });
        links[e.target.id].classList.add('is-current');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) tio.observe(s); });
  }

  // ---------- Help: filter topics and sections as you type ----------
  var hs = $('#helpsearch');
  if (hs) {
    var sectionsH = $$('.prose section'), topics = $$('.topic'), none = $('.no-match');
    hs.addEventListener('input', function () {
      var q = hs.value.trim().toLowerCase(), shown = 0;
      sectionsH.forEach(function (s) { var ok = !q || s.textContent.toLowerCase().indexOf(q) !== -1; s.classList.toggle('is-filtered-out', !ok); if (ok) shown++; });
      topics.forEach(function (t) { var s = document.getElementById(t.getAttribute('href').slice(1)); t.classList.toggle('is-hidden', !!s && s.classList.contains('is-filtered-out')); });
      none.classList.toggle('is-on', shown === 0);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== hs && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); hs.focus(); }
    });
  }
})();
