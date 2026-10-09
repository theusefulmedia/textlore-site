// textlore.app: shared behaviour. No trackers, no cookies until a visitor reaches for Buy.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Sections rise in as they scroll into view.
  var risers = document.querySelectorAll('.rise, .privacy');
  if ('IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    risers.forEach(function (el) { io.observe(el); });
  } else {
    risers.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Buy: Gumroad's overlay checkout, so buyers stay on the page. gumroad.js loads only when a
  // visitor points at, focuses or taps a Buy button; without it the link opens Gumroad itself.
  var GUMROAD = 'https://gumroad.com/js/gumroad.js';
  var state = 'idle'; // idle, loading, ready, failed
  var waiting = [];
  function loadGumroad(done) {
    if (done) waiting.push(done);
    if (state === 'ready' || state === 'failed') { flush(); return; }
    if (state === 'loading') return;
    state = 'loading';
    var s = document.createElement('script');
    s.src = GUMROAD;
    s.async = true;
    // gumroad.js adds its real bundle, which binds the Buy links when it loads.
    s.onload = function () {
      var bundle = document.querySelector('script[src*="gumroad-bundle"]');
      var ready = function () { state = 'ready'; setTimeout(flush, 150); };
      if (bundle) { bundle.addEventListener('load', ready); bundle.addEventListener('error', function () { state = 'failed'; flush(); }); }
      else setTimeout(ready, 800);
    };
    s.onerror = function () { state = 'failed'; flush(); };
    document.head.appendChild(s);
  }
  function flush() { var w = waiting; waiting = []; w.forEach(function (f) { f(); }); }

  document.querySelectorAll('a.buy').forEach(function (a) {
    ['pointerenter', 'focus', 'touchstart'].forEach(function (type) {
      a.addEventListener(type, function () { loadGumroad(); }, { passive: true, once: true });
    });
    a.addEventListener('click', function (e) {
      if (state === 'ready' || e.metaKey || e.ctrlKey || e.shiftKey) return; // gumroad.js handles it
      e.preventDefault();
      var fallback = setTimeout(function () { window.location.href = a.href; }, 4000);
      loadGumroad(function () {
        clearTimeout(fallback);
        if (state === 'ready') a.click(); else window.location.href = a.href;
      });
    });
  });

  // Inner pages: highlight the section being read in the table of contents.
  var toc = document.querySelector('.toc');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    toc.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var tocIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting || !links[e.target.id]) return;
        toc.querySelectorAll('.is-current').forEach(function (a) { a.classList.remove('is-current'); });
        links[e.target.id].classList.add('is-current');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) tocIo.observe(s); });
  }
})();
