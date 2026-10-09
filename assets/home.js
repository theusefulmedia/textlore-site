// textlore.app home page. Every demo uses Sam, the made-up person in Textlore's demo library
// (docs/design/demo-persona.md in the Textlore repo). Demos play only while on screen, and with
// Reduce Motion each one is shown in its finished state.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var NS = 'http://www.w3.org/2000/svg';
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function svgEl(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  var R = window.TextloreRings, YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026], COUNTS = R.COUNTS, MAXC = R.MAXC;

  // A demo plays while on screen and rests in its finished state otherwise.
  function demo(root, play, rest, threshold) {
    if (!root) return;
    var timers = [];
    var api = { later: function (fn, ms) { timers.push(setTimeout(fn, ms)); }, stop: function () { timers.forEach(clearTimeout); timers = []; } };
    rest();
    if (reduce || !hasIO) return;
    var running = false;
    new IntersectionObserver(function (e) {
      var on = e[0].isIntersecting;
      if (on && !running) { running = true; play(api); }
      if (!on && running) { running = false; api.stop(); rest(); }
    }, { threshold: threshold || 0.35 }).observe(root);
  }

  // Scroll-linked work, once per frame.
  var scrollers = [], ticking = false;
  function onScroll(fn) { scrollers.push(fn); }
  function frame() { ticking = false; var vh = window.innerHeight; scrollers.forEach(function (fn) { fn(vh); }); }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  window.addEventListener('resize', function () { requestAnimationFrame(frame); });

  // ---------- Photos: the same made-up landscapes the app's demo library paints (sky, sun, 3 hills) ----------
  var SKIES = [['#7EC8F2', '#F9E1C0'], ['#F7A072', '#FCE3B6'], ['#3B4A8C', '#E88B6E'], ['#9BD1E8', '#E9F5F9'], ['#C9A7EB', '#FFD6A5'], ['#5E7CE2', '#B8E1FF']];
  var LANDS = ['#3E7C59', '#5B8C3A', '#2F5D62', '#7A5C3E', '#4B6B8A', '#8A6D9E'];
  var uid = 0;
  function rng(seed) { var a = (seed * 2654435761) >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function shade(hex, s) {
    var n = parseInt(hex.slice(1), 16);
    var c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { return Math.min(255, Math.round(v * s)); });
    return 'rgb(' + c.join(',') + ')';
  }
  function landscape(seed, w, h) {
    var r = rng(seed + 7), id = 'sky' + (++uid);
    var rand = function (a, b) { return a + (b - a) * r(); };
    var sky = SKIES[Math.floor(r() * SKIES.length)], land = LANDS[Math.floor(r() * LANDS.length)];
    var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky[0] + '"/><stop offset="1" stop-color="' + sky[1] + '"/></linearGradient></defs>';
    s += '<rect width="' + w + '" height="' + h + '" fill="url(#' + id + ')"/>';
    var sunR = rand(28, 60) * w / 640;
    s += '<circle cx="' + rand(60 + sunR, w - 60 - sunR).toFixed(1) + '" cy="' + (h - h * rand(0.55, 0.8) - sunR).toFixed(1) + '" r="' + sunR.toFixed(1) + '" fill="#FFEDBF" fill-opacity=".95"/>';
    for (var layer = 0; layer < 3; layer++) {
      var base = h * (0.5 - layer * 0.14), amp = rand(18, 46) * h / 480, freq = rand(1.2, 2.6), phase = rand(0, 6.28), d = 'M0 ' + h;
      for (var x = 0; x <= w; x += 8) { var t = x / w; d += ' L' + x + ' ' + (h - (base + amp * Math.sin(t * Math.PI * freq + phase))).toFixed(1); }
      d += ' L' + w + ' ' + h + 'Z';
      s += '<path d="' + d + '" fill="' + shade(land, 1.15 - layer * 0.25) + '"/>';
    }
    return s + '</svg>';
  }
  $$('[data-photo]').forEach(function (n) { n.innerHTML = landscape(+n.getAttribute('data-photo'), 480, 480); });

  // ---------- Hero: search Sam's texts, plotted on the rings ----------
  // [who, date, text, flags] flags: m sent by Sam, p photo, v video
  var WALL = [
    ['Jordan', '14 Mar 2020', 'Can you believe it has been a year already?', ''], ['Mom', '2 Aug 2023', 'Mom says dinner is at seven', ''],
    ['Jordan', '3 Feb 2024', 'I booked the cabin for August', 'm'], ['Theo', '19 Dec 2022', 'The flight lands at 6:40, terminal 1', ''],
    ['Priya', '7 May 2021', 'Look what I found in the old photo box', 'p'], ['Ana', '28 Jan 2020', 'Happy birthday! Hope today is wonderful', ''],
    ['Mom', '12 Jun 2019', 'The kids loved the park today', 'p'], ['Jordan', '22 Oct 2017', 'Still awake?', 'm'],
    ['Theo', '9 Apr 2018', 'Did you finish the playlist for the road trip?', ''], ['Jordan', '5 Jul 2025', 'Our flight lands early, skip the cab', 'm'],
    ['Priya', '30 Nov 2019', 'That place was so good, we have to go back', ''], ['Mom', '25 Dec 2021', 'Look at this view', 'p'],
    ['Ana', '16 Sep 2024', 'Text me when you get home safe', ''], ['Jordan', '1 Jan 2026', 'Best day', 'p'],
    ['Theo', '11 Mar 2020', 'Just landed, see you at baggage claim', 'm'], ['Mom', '4 May 2018', 'I need your recipe for that soup', 'm'],
    ['Jordan', '21 Aug 2024', 'This place looks great, the cabin is right on the lake', 'p'], ['Priya', '8 Feb 2022', 'Thank you so much for tonight', ''],
    ['Ana', '19 Jun 2023', 'Throwback', 'p'], ['Jordan', '14 Mar 2020', 'haha I cannot believe you did that', 'm'],
    ['Theo', '2 Oct 2026', 'Saving you a seat', ''], ['Mom', '17 Apr 2017', 'Call me when you get a chance', ''],
    ['Jordan', '6 Dec 2018', 'Can’t stop thinking about that pasta', 'm'], ['Priya', '23 Jul 2025', 'Sunday morning', 'v'],
    ['Ana', '12 Nov 2021', 'Tell your sister I said hi', ''], ['Jordan', '9 Sep 2022', 'Flight lands at 11, call you after', ''],
    ['Mom', '3 Mar 2024', 'The cake turned out great', 'p'], ['Theo', '29 May 2019', 'We should plan something for the long weekend', 'm'],
    ['Jordan', '13 Feb 2023', 'I owe you one', ''], ['Priya', '15 Jan 2018', 'Want to grab coffee tomorrow morning?', 'm'],
    ['Ana', '7 Oct 2026', 'Still awake? On my way now', ''], ['Jordan', '18 Aug 2021', 'Remember to bring the charger', ''],
    ['Mom', '10 Oct 2020', 'Happy birthday! Hope today is wonderful', ''], ['Theo', '27 Jun 2024', 'Booked the 3:15 flight on Friday', 'm'],
    ['Jordan', '31 Dec 2019', 'Good morning! Big day today', 'm'], ['Priya', '4 Apr 2026', 'For you', 'p'],
    ['Ana', '20 Mar 2017', 'Did you see the game last night?', ''], ['Jordan', '6 Aug 2024', 'Packed! See you at the cabin', 'm'],
    ['Mom', '14 Feb 2022', 'Text me when you get home safe', ''], ['Theo', '1 Sep 2025', 'That is the best news all week', ''],
    ['Mom', '8 Nov 2017', 'Did the package come?', ''], ['Ana', '2 Jun 2018', 'Look at this view', 'p'],
    ['Priya', '18 Apr 2023', 'Running ten minutes late, sorry', 'm'], ['Theo', '30 Jan 2021', 'This weather is unreal', '']
  ];
  var MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

  (function () {
    var root = $('#ringsearch');
    if (!root) return;
    var svg = $('.ringsearch__svg', root), input = $('input', root), list = $('.hits', root), count = $('.search__count', root), tip = $('.tip', root);
    var chips = $$('.chip', root);
    var rings = R.geometry(44, 286, 9), labels = [];
    rings.forEach(function (g, i) {
      var busiest = COUNTS[i] === MAXC;
      svg.appendChild(svgEl('circle', { class: 'draw', fill: 'none', pathLength: 100, cx: 300, cy: 300, r: g.r.toFixed(1), 'stroke-width': (g.w * 0.5).toFixed(1), transform: 'rotate(-90 300 300)',
        style: '--d:' + (i * 0.09).toFixed(2) + 's;stroke:' + (busiest ? 'var(--amber)' : 'var(--ink)') + ';stroke-opacity:' + (busiest ? 0.7 : (0.06 + 0.14 * COUNTS[i] / MAXC).toFixed(2)) }));
    });
    svg.appendChild(svgEl('circle', { cx: 300, cy: 300, r: 9, fill: '#F5A524' }));
    rings.forEach(function (g, i) {
      if (i % 3 !== 0 && i !== 9) return;
      var t = svgEl('text', { class: 'ylab', x: 300, y: (300 - g.r + 3.5).toFixed(1), 'text-anchor': 'middle', 'paint-order': 'stroke', stroke: 'var(--paper)', 'stroke-width': 5 });
      t.textContent = YEARS[i]; svg.appendChild(t); labels[i] = t;
    });
    var msgs = WALL.map(function (m, k) {
      var p = m[1].split(' '), date = new Date(+p[2], MONTHS[p[1]], +p[0]);
      var g = rings[YEARS.indexOf(+p[2])];
      var doy = (date - new Date(+p[2], 0, 1)) / 864e5;
      var a = (16 + doy / 365 * 328) * Math.PI / 180 - Math.PI / 2; // keeps the 12 o'clock labels clear
      var x = 300 + g.r * Math.cos(a), y = 300 + g.r * Math.sin(a);
      var halo = svgEl('circle', { class: 'halo', cx: x.toFixed(1), cy: y.toFixed(1), r: 4.6 });
      var dot = svgEl('circle', { class: 'dot', cx: x.toFixed(1), cy: y.toFixed(1), r: 4.6 });
      svg.appendChild(halo); svg.appendChild(dot);
      var msg = { k: k, who: m[0], date: m[1], text: m[2], me: m[3].indexOf('m') !== -1, photo: /[pv]/.test(m[3]), year: +p[2], t: +date, dot: dot, halo: halo, x: x, y: y };
      dot.addEventListener('pointerenter', function () { showTip(msg); });
      dot.addEventListener('pointerleave', function () { tip.classList.remove('is-on'); });
      return msg;
    });
    function showTip(m) {
      tip.textContent = '';
      tip.appendChild(el('small', '', (m.me ? 'You to ' : '') + m.who + ', ' + m.date));
      tip.appendChild(document.createTextNode(m.text));
      var box = svg.getBoundingClientRect(), host = root.getBoundingClientRect();
      tip.style.left = (box.left - host.left + m.x / 600 * box.width) + 'px';
      tip.style.top = (box.top - host.top + m.y / 600 * box.height) + 'px';
      tip.classList.add('is-on');
    }
    function parse(q) {
      var f = { text: [] };
      q.toLowerCase().split(/\s+/).forEach(function (w) {
        if (!w) return;
        var m;
        if ((m = w.match(/^from:(.+)$/))) f.from = m[1];
        else if (w === 'has:photo' || w === 'has:video') f.photo = true;
        else if ((m = w.match(/^(?:during:)?(20\d\d)$/))) f.year = +m[1];
        else f.text.push(w);
      });
      f.phrase = f.text.join(' ');
      return f;
    }
    function render(q) {
      var f = parse(q), active = q.trim() !== '';
      var hits = msgs.filter(function (m) {
        if (!active) return false;
        if (f.from && (f.from === 'me' ? !m.me : m.who.toLowerCase().indexOf(f.from) !== 0)) return false;
        if (f.photo && !m.photo) return false;
        if (f.year && m.year !== f.year) return false;
        return !f.phrase || m.text.toLowerCase().indexOf(f.phrase) !== -1;
      }).sort(function (a, b) { return b.t - a.t; });
      var years = {};
      msgs.forEach(function (m) {
        var hit = hits.indexOf(m) !== -1;
        m.dot.classList.toggle('is-hit', hit); m.halo.classList.toggle('is-hit', hit);
        m.dot.classList.toggle('is-dim', active && !hit);
        if (hit) years[m.year] = 1;
      });
      labels.forEach(function (t, i) { if (t) t.classList.toggle('is-hit', !!years[YEARS[i]]); });
      var ny = Object.keys(years).length;
      count.textContent = active ? hits.length + (hits.length === 1 ? ' text' : ' texts') + ', ' + ny + (ny === 1 ? ' year' : ' years') : '';
      list.textContent = '';
      if (!active) { list.appendChild(el('li', 'hits__note', 'Type a word, or tap a suggestion above.')); return; }
      if (!hits.length) { list.appendChild(el('li', 'hits__note', 'Nothing in this sample. Try cabin, birthday or from:Jordan.')); return; }
      hits.slice(0, 4).forEach(function (m, i) {
        var li = el('li', 'hit'); li.style.setProperty('--i', i);
        li.appendChild(el('b', '', m.me ? 'You' : m.who));
        var span = el('span');
        if (m.photo) { var ph = el('i', 'ph'); ph.innerHTML = landscape(m.k, 120, 120); span.appendChild(ph); }
        var at = f.phrase ? m.text.toLowerCase().indexOf(f.phrase) : -1;
        if (at !== -1) {
          span.appendChild(document.createTextNode(m.text.slice(0, at)));
          span.appendChild(el('mark', '', m.text.slice(at, at + f.phrase.length)));
          span.appendChild(document.createTextNode(m.text.slice(at + f.phrase.length)));
        } else span.appendChild(document.createTextNode(m.text));
        li.appendChild(span); li.appendChild(el('time', '', m.date));
        list.appendChild(li);
      });
    }
    function setChips(q) { chips.forEach(function (c) { c.setAttribute('aria-pressed', c.textContent === q ? 'true' : 'false'); }); }

    // Until the visitor takes over, the search types a few examples by itself.
    var auto = !reduce, timers = [];
    function stopAuto() { auto = false; timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    var demoQs = ['cabin', 'from:Mom', 'flight lands', 'has:photo', '2020'], qi = 0;
    function typeNext() {
      if (!auto) return;
      var q = demoQs[qi++ % demoQs.length], i = 0;
      (function step() {
        if (!auto) return;
        input.value = q.slice(0, i); render(input.value); setChips(i === q.length ? q : '');
        if (i++ < q.length) later(step, 90 + Math.random() * 60);
        else later(function () { input.value = ''; render(''); setChips(''); later(typeNext, 500); }, 3300);
      })();
    }
    ['pointerdown', 'focusin', 'keydown'].forEach(function (t) { root.addEventListener(t, function (e) { if (e.target.closest && e.target.closest('.search')) stopAuto(); }); });
    input.addEventListener('input', function () { render(input.value); setChips(input.value.trim()); });
    chips.forEach(function (c) { c.addEventListener('click', function () { input.value = c.textContent; render(input.value); setChips(c.textContent); }); });
    if (reduce || !hasIO) { input.value = 'cabin'; render('cabin'); setChips('cabin'); return; }
    render('');
    var heroIO = new IntersectionObserver(function (e) {
      if (!auto) { heroIO.disconnect(); return; }
      timers.forEach(clearTimeout); timers = [];
      if (e[0].isIntersecting) later(typeNext, 1400); else { input.value = ''; render(''); setChips(''); }
    }, { threshold: 0.3 });
    heroIO.observe(root);
  })();

  // ---------- Statement: the words light up as you read ----------
  (function () {
    var p = $('#statement');
    if (!p) return;
    var words = [];
    Array.prototype.slice.call(p.childNodes).forEach(function (node) {
      var em = node.nodeType === 1 && node.hasAttribute('data-em');
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = el('span', 'w' + (em ? ' is-em' : ''), part); words.push(s); frag.appendChild(s);
      });
      p.replaceChild(frag, node);
    });
    if (reduce) { words.forEach(function (w) { w.classList.add('is-lit'); }); return; }
    onScroll(function (vh) {
      var r = p.getBoundingClientRect();
      var n = Math.round(clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1) * words.length);
      words.forEach(function (w, i) { w.classList.toggle('is-lit', i < n); });
    });
    requestAnimationFrame(frame);
  })();

  // ---------- Find: quick search, tokens, photos ----------
  (function () {
    var root = $('#qs-demo');
    if (!root) return;
    var opt = $('[data-key="opt"]', root), space = $('[data-key="space"]', root), panel = $('.panel', root), text = $('.q-text', root), items = $$('li', panel);
    var q = text.textContent;
    demo(root, function play(t) {
      (function loop() {
        panel.classList.remove('is-open'); text.textContent = ''; items.forEach(function (li) { li.style.visibility = 'hidden'; });
        t.later(function () { opt.classList.add('is-down'); }, 400);
        t.later(function () { space.classList.add('is-down'); }, 600);
        t.later(function () { opt.classList.remove('is-down'); space.classList.remove('is-down'); panel.classList.add('is-open'); }, 900);
        for (var i = 1; i <= q.length; i++) (function (n) { t.later(function () { text.textContent = q.slice(0, n); if (n === 3) items.forEach(function (li) { li.style.visibility = ''; }); }, 1300 + n * 110); })(i);
        t.later(loop, 1300 + q.length * 110 + 3400);
      })();
    }, function rest() { opt.classList.remove('is-down'); space.classList.remove('is-down'); text.textContent = q; items.forEach(function (li) { li.style.visibility = ''; }); panel.classList.add('is-open'); });
  })();

  (function () {
    var root = $('#tokens-demo');
    if (!root) return;
    var words = ['from:Jordan', 'has:photo', 'during:2024', '-delayed', '"see you soon"'];
    function show(n, pop) { root.textContent = ''; words.slice(0, n).forEach(function (w, i) { root.appendChild(el('span', 'token' + (pop && i === n - 1 ? ' is-pop' : ''), w)); }); }
    demo(root, function play(t) {
      (function loop() {
        show(0);
        words.forEach(function (_, i) { t.later(function () { show(i + 1, true); }, 500 + i * 700); });
        t.later(loop, 500 + words.length * 700 + 2600);
      })();
    }, function rest() { show(words.length); });
  })();

  (function () {
    var root = $('#photowall'), ql = $('.ql');
    if (!root) return;
    var people = ['Jordan', 'Mom', 'Theo', 'Priya', 'Ana', 'Jordan', 'Mom', 'Theo'];
    var days = ['3 Feb 2024', '25 Dec 2021', '11 Mar 2020', '7 May 2021', '19 Jun 2023', '21 Aug 2024', '12 Jun 2019', '27 Jun 2024'];
    var photos = people.map(function (p, i) {
      var b = el('button', 'photo'); b.type = 'button';
      b.setAttribute('aria-label', 'Photo from ' + p + ', ' + days[i]);
      b.innerHTML = landscape(20 + i, 240, 240);
      b.addEventListener('click', function () { open(i); });
      root.appendChild(b); return b;
    });
    var lastFocus = null;
    function open(i) {
      lastFocus = document.activeElement;
      $('figure > div', ql).innerHTML = landscape(20 + i, 640, 480);
      $('figcaption', ql).textContent = 'From ' + people[i] + ', ' + days[i] + '. Click anywhere or press Esc to close.';
      ql.hidden = false; void ql.offsetWidth; ql.classList.add('is-open'); ql.tabIndex = -1; ql.focus();
    }
    function close() { ql.classList.remove('is-open'); setTimeout(function () { ql.hidden = true; }, 260); if (lastFocus) lastFocus.focus(); }
    ql.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !ql.hidden) close(); });
    var here = false;
    root.addEventListener('pointerenter', function () { here = true; photos.forEach(function (p) { p.classList.remove('is-up'); }); });
    root.addEventListener('pointerleave', function () { here = false; });
    demo(root, function play(t) {
      var k = 0, path = [0, 5, 2, 7, 4, 1];
      (function step() {
        photos.forEach(function (p) { p.classList.remove('is-up'); });
        if (!here) photos[path[k++ % path.length]].classList.add('is-up');
        t.later(step, 1100);
      })();
    }, function rest() { photos.forEach(function (p) { p.classList.remove('is-up'); }); });
  })();

  // ---------- Keep: Messages lets photos go, Textlore keeps them ----------
  (function () {
    var root = $('#keep-demo');
    if (!root) return;
    var goes = [0, 2, 3, 5, 6];
    var cloud = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/></svg>';
    var tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    var sides = {};
    $$('.keep__grid', root).forEach(function (g) {
      var side = g.getAttribute('data-side');
      sides[side] = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) {
        var kp = el('div', 'kp');
        kp.innerHTML = landscape(40 + i, 200, 200) + (side === 'messages' ? '<em>' + cloud + 'Kept in<br>iCloud</em>' : '<span class="tick">' + tick + '</span>');
        g.appendChild(kp); return kp;
      });
    });
    var left = $('[data-left]', root), kept = $('[data-kept]', root);
    function state(nGone, nSaved) {
      sides.messages.forEach(function (kp, i) { var k = goes.indexOf(i); kp.classList.toggle('is-gone', k !== -1 && k < nGone); });
      sides.textlore.forEach(function (kp, i) { kp.classList.toggle('is-saved', i < nSaved); });
      left.textContent = 8 - nGone; kept.textContent = nSaved;
    }
    demo(root, function play(t) {
      (function loop() {
        state(0, 0);
        for (var i = 1; i <= 8; i++) (function (n) { t.later(function () { state(0, n); }, 500 + n * 160); })(i);
        for (var j = 1; j <= goes.length; j++) (function (n) { t.later(function () { state(n, 8); }, 2400 + n * 650); })(j);
        t.later(loop, 2400 + goes.length * 650 + 3800);
      })();
    }, function rest() { state(goes.length, 8); }, 0.4);
  })();

  // ---------- Relive: the rings draw themselves as you scroll ----------
  (function () {
    var wrap = $('#lore-scroll');
    if (!wrap) return;
    var svg = $('.lore-rings', wrap), total = $('[data-total]', wrap), callouts = $$('.callout', wrap);
    var rings = R.geometry(118, 290, 8), circles = [], texts = [];
    rings.forEach(function (g, i) {
      var busiest = COUNTS[i] === MAXC;
      svg.appendChild(svgEl('circle', { cx: 300, cy: 300, r: g.r.toFixed(1), fill: 'none', stroke: 'rgba(243,240,255,0.05)', 'stroke-width': (g.w * 0.55).toFixed(1) }));
      var c = svgEl('circle', { pathLength: 100, cx: 300, cy: 300, r: g.r.toFixed(1), fill: 'none', 'stroke-width': (g.w * 0.55).toFixed(1), transform: 'rotate(-90 300 300)',
        stroke: busiest ? '#F5A524' : 'rgba(171,165,255,' + (0.18 + 0.42 * COUNTS[i] / MAXC).toFixed(2) + ')', 'stroke-dasharray': 101, 'stroke-dashoffset': 101 });
      svg.appendChild(c); circles.push(c);
    });
    rings.forEach(function (g, i) {
      var t = svgEl('text', { x: 300, y: (300 - g.r - 6).toFixed(1), 'text-anchor': 'middle', opacity: 0 });
      t.textContent = (i === 0 || i === 3 || i === 8) ? YEARS[i] : '';
      if (COUNTS[i] === MAXC) t.setAttribute('style', 'fill:#F5A524');
      svg.appendChild(t); texts.push(t);
    });
    function paint(p) {
      var sum = 0;
      circles.forEach(function (c, i) {
        var f = clamp(p / 0.78 * 10 - i, 0, 1);
        c.setAttribute('stroke-dashoffset', (101 * (1 - f)).toFixed(2));
        texts[i].setAttribute('opacity', f > 0.6 ? 1 : 0);
        sum += COUNTS[i] * f;
      });
      total.textContent = fmt(sum);
      [0.3, 0.46, 0.62, 0.78].forEach(function (at, i) { callouts[i].classList.toggle('is-on', p >= at); });
    }
    if (reduce) { paint(1); return; }
    paint(0);
    onScroll(function (vh) {
      var r = wrap.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      paint(clamp(-r.top / (r.height - vh), 0, 1));
    });
  })();

  // ---------- Relive: the share cards in a phone ----------
  (function () {
    var root = $('#lore-demo');
    if (!root) return;
    var screen = $('.screen', root), stack = $('.lore-cards', root), dots = $('.lore-dots', root);
    var looks = {
      indigo: ['#2A2185', '#FFFFFF', 'rgba(255,255,255,0.8)', '#F5A524', 'rgba(255,255,255,0.18)'],
      amber: ['#F5A524', '#1B1442', 'rgba(27,20,66,0.78)', '#2A2185', 'rgba(27,20,66,0.16)'],
      midnight: ['#0E0F14', '#F5F5F7', '#A1A1A6', '#8B83FF', 'rgba(139,131,255,0.22)'],
      paper: ['#F7F6FB', '#1D1D1F', '#5C5C61', '#5145CD', 'rgba(81,69,205,0.16)'],
      glass: ['radial-gradient(circle at 18% 14%, #F5A524 0, rgba(245,165,36,0) 36%), radial-gradient(circle at 86% 82%, #8B83FF 0, rgba(139,131,255,0) 46%), radial-gradient(circle at 80% 18%, #FF7AB6 0, rgba(255,122,182,0) 30%), linear-gradient(160deg, #3B2FC4 0%, #160F55 100%)', '#FFFFFF', 'rgba(255,255,255,0.84)', '#FFD27A', 'rgba(255,255,255,0.22)']
    };
    var I = 'var(--c-ink)', S = 'var(--c-sub)', A = 'var(--acc)';
    function svg(body) { return '<svg viewBox="0 0 300 300" aria-hidden="true">' + body + '</svg>'; }
    var rings = '', r = 14;
    COUNTS.forEach(function (c, i) {
      var w = 3 + 11 * c / MAXC; r += w / 2;
      rings += '<circle class="draw" pathLength="100" cx="150" cy="150" r="' + r.toFixed(1) + '" fill="none" stroke-width="' + w.toFixed(1) + '" style="stroke:' + (c === MAXC ? A : I) + ';stroke-opacity:' + (c === MAXC ? 1 : (0.22 + 0.6 * c / MAXC).toFixed(2)) + ';--d:' + (i * 0.1).toFixed(2) + 's" transform="rotate(-90 150 150)"/>';
      r += w / 2 + 3;
    });
    rings += '<circle cx="150" cy="150" r="7" style="fill:' + A + '"/>';
    var hours = [62, 40, 22, 10, 5, 3, 4, 10, 22, 35, 42, 48, 55, 50, 46, 48, 52, 58, 66, 74, 82, 92, 100, 85], clock = '';
    hours.forEach(function (v, i) {
      var a = i / 24 * Math.PI * 2 - Math.PI / 2, len = 16 + 84 * v / 100;
      clock += '<line class="draw" pathLength="100" x1="' + (150 + 46 * Math.cos(a)).toFixed(1) + '" y1="' + (150 + 46 * Math.sin(a)).toFixed(1) + '" x2="' + (150 + (46 + len) * Math.cos(a)).toFixed(1) + '" y2="' + (150 + (46 + len) * Math.sin(a)).toFixed(1) +
        '" stroke-width="7" stroke-linecap="round" style="stroke:' + (i === 22 ? A : I) + ';stroke-opacity:' + (i === 22 ? 1 : (0.25 + 0.55 * v / 100).toFixed(2)) + ';--d:' + (i * 0.03).toFixed(2) + 's"/>';
    });
    clock += '<text x="150" y="148" text-anchor="middle" font-size="17" font-weight="800" style="fill:' + A + '">10 PM</text><text x="150" y="166" text-anchor="middle" font-size="11" font-weight="600" style="fill:' + S + '">peak hour</text>';
    var pts = [];
    for (var i = 0; i < 90; i++) { var v = 0.2 + 0.42 * (i / 90) + 0.06 * Math.sin(i * 1.3) + 0.05 * Math.sin(i * 0.37 + 1); if (i === 29) v = 1; if (Math.abs(i - 29) === 1) v = 0.62; pts.push([10 + i * 280 / 89, 262 - v * 190]); }
    var bigday = '<path class="draw" pathLength="100" d="M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + '" fill="none" stroke-width="2.5" stroke-linejoin="round" style="stroke:' + I + '"/>' +
      '<circle class="fade" cx="' + pts[29][0].toFixed(1) + '" cy="' + pts[29][1].toFixed(1) + '" r="7" style="fill:' + A + ';--d:1.1s"/><text class="fade" x="' + pts[29][0].toFixed(1) + '" y="' + (pts[29][1] - 16).toFixed(1) + '" text-anchor="middle" font-size="14" font-weight="800" style="fill:' + I + ';--d:1.2s">1,206</text>';
    var streak = '';
    for (var k = 0; k < 420; k++) { var on = k < 412; streak += '<rect class="fade" x="' + (4 + (k % 21) * 13.8).toFixed(1) + '" y="' + (12 + Math.floor(k / 21) * 13.8).toFixed(1) + '" width="10.5" height="10.5" rx="3" style="fill:' + (on ? A : I) + ';fill-opacity:' + (on ? (0.35 + 0.65 * k / 412).toFixed(2) : 0.1) + ';--d:' + (Math.floor(k / 21) * 0.035).toFixed(2) + 's"/>'; }
    var emoji = [['😂', 4120], ['❤️', 2860], ['🙏', 1340], ['🔥', 980], ['😭', 870]].map(function (e, i) {
      var w = Math.max(40, 196 * e[1] / 4120), y = 34 + i * 50;
      return '<text x="16" y="' + (y + 24) + '" font-size="28">' + e[0] + '</text><rect class="growx" x="62" y="' + y + '" width="' + w.toFixed(0) + '" height="34" rx="17" style="fill:' + (i === 0 ? A : 'var(--soft)') + ';--d:' + (i * 0.1).toFixed(1) + 's"/><text class="fade" x="' + (62 + w + 8).toFixed(0) + '" y="' + (y + 22) + '" font-size="13" font-weight="800" style="fill:' + I + ';--d:' + (0.4 + i * 0.1).toFixed(1) + 's">' + fmt(e[1]) + '</text>';
    }).join('');
    var photoYears = [640, 980, 1240, 2050, 1610, 1880, 2730, 3410, 3020, 2140], photos = '';
    photoYears.forEach(function (v, i) { var h = 12 + 210 * v / 3410; photos += '<rect class="grow" x="' + (8 + i * 29) + '" y="' + (262 - h).toFixed(0) + '" width="22" height="' + h.toFixed(0) + '" rx="6" style="fill:' + (v === 3410 ? A : 'var(--soft)') + ';--d:' + (i * 0.06).toFixed(2) + 's"/><text x="' + (19 + i * 29) + '" y="284" text-anchor="middle" font-size="10.5" font-weight="700" style="fill:' + S + '">\'' + (17 + i) + '</text>'; });
    var owl = '<circle class="draw" pathLength="100" cx="150" cy="150" r="84" fill="none" stroke-width="8" style="stroke:' + I + ';stroke-opacity:.75" transform="rotate(-90 150 150)"/><circle class="fade" cx="150" cy="150" r="56" style="fill:' + A + ';--d:.5s"/><circle class="fade" cx="176" cy="132" r="48" style="fill:var(--bg);--d:.7s"/>';
    var chapters = [
      ['Your Lore', '10 years, one ring each', '114,100 messages. The thickest ring is your busiest year.', rings],
      ['Your rhythm', 'Certified night owl', 'You text most at 10 PM', clock],
      ['The big day', '14 March 2020', '1,206 messages in one day', bigday],
      ['Longest streak', '412 days in a row', 'Talking with Person 1, every single day', streak],
      ['Emoji signature', '😂 ❤️ 🙏', '😂 sent 4,120 times', emoji],
      ['Photo years', '2024 was your photo year', '3,410 photos and videos that year', photos],
      ['Your Lore type', 'The Night Owl Storyteller', 'Late nights, long messages, quick replies', owl]
    ];
    var cards = chapters.map(function (c, i) {
      var card = el('div', 'lore-card');
      card.setAttribute('role', 'group'); card.setAttribute('aria-roledescription', 'card');
      card.setAttribute('aria-label', (i + 1) + ' of ' + chapters.length + ': ' + c[0] + '. ' + c[1] + '. ' + c[2]);
      card.innerHTML = '<div class="lore-card__top" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3.5" stroke-width="1.6" style="stroke:' + I + '"/><circle cx="10" cy="10" r="7.5" stroke-width="1.6" style="stroke:' + I + ';stroke-opacity:.5"/><circle cx="10" cy="10" r="1.6" style="fill:' + A + '"/></svg><span>Your Lore</span><span>2017 to 2026</span></div>' +
        '<div class="lore-card__kick" aria-hidden="true">' + c[0] + '</div><h4 aria-hidden="true">' + c[1] + '</h4><p aria-hidden="true">' + c[2] + '</p>' + svg(c[3]) + '<footer aria-hidden="true">Made with Textlore, textlore.app</footer>';
      stack.appendChild(card); dots.appendChild(el('i'));
      return card;
    });
    var dotEls = $$('i', dots), at = 0;
    function show(n) {
      var old = cards[at]; old.classList.remove('is-on'); old.classList.add('is-gone');
      setTimeout(function () { old.classList.remove('is-gone'); }, 600);
      at = (n + cards.length) % cards.length;
      cards[at].classList.add('is-on');
      cards.forEach(function (c, i) { c.setAttribute('aria-hidden', i === at ? 'false' : 'true'); });
      dotEls.forEach(function (d, i) { d.classList.toggle('is-on', i === at); });
    }
    cards[0].classList.add('is-on'); dotEls[0].classList.add('is-on');
    cards.forEach(function (c, i) { c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'); });
    $$('input[name="look"]').forEach(function (input) {
      input.addEventListener('change', function () { var l = looks[input.value]; ['--bg', '--c-ink', '--c-sub', '--acc', '--soft'].forEach(function (p, i) { screen.style.setProperty(p, l[i]); }); });
    });
    var playBtn = $('[data-lore="play"]'), paused = reduce, visible = false, timer = null;
    var PLAY = '<path d="M7 4l13 8-13 8z" fill="currentColor" stroke="none"/>', PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" stroke="none"/>';
    function tick() { clearTimeout(timer); if (!paused && visible) timer = setTimeout(function () { show(at + 1); tick(); }, 2800); }
    function setPaused(p) { paused = p; playBtn.setAttribute('aria-label', p ? 'Play the cards' : 'Pause the cards'); $('svg', playBtn).innerHTML = p ? PLAY : PAUSE; tick(); }
    setPaused(paused);
    playBtn.addEventListener('click', function () { setPaused(!paused); });
    $('[data-lore="prev"]').addEventListener('click', function () { show(at - 1); tick(); });
    $('[data-lore="next"]').addEventListener('click', function () { show(at + 1); tick(); });
    // Swipe on the phone to change cards.
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) { show(at + (dx < 0 ? 1 : -1)); tick(); } x0 = null; });
    if (hasIO) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; tick(); }, { threshold: 0.4 }).observe(root);
  })();

  // ---------- Ask: an answer, and the messages it came from ----------
  (function () {
    var chat = $('#chat');
    if (!chat) return;
    var qs = $$('.q'), bubble = $('.bubble', chat), thinking = $('.thinking', chat), step = $('.step', chat), answer = $('.answer', chat), sources = $('.sources', chat);
    var data = [
      { a: 'You told Jordan you booked the cabin for August, on 3 February 2024. On 6 August you were packed and on your way.',
        s: [['3 Feb 2024', 'You to Jordan', 'I booked the cabin for August'], ['6 Aug 2024', 'You to Jordan', 'Packed! See you at the cabin']] },
      { a: 'Theo said his flight lands at 6:40, terminal 1. He sent it on 19 December 2022.',
        s: [['19 Dec 2022', 'Theo', 'The flight lands at 6:40, terminal 1'], ['19 Dec 2022', 'You to Theo', 'Perfect, I’ll be at arrivals']] },
      { a: 'Mom said dinner is at seven, on 2 August 2023. Back in 2018, you asked her for the recipe for that soup.',
        s: [['2 Aug 2023', 'Mom', 'Mom says dinner is at seven'], ['4 May 2018', 'You to Mom', 'I need your recipe for that soup']] }
    ];
    var timers = [];
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function sourcesFor(d) {
      sources.textContent = '';
      d.s.forEach(function (s, i) { var c = el('div', 'source'); c.style.setProperty('--i', i); c.appendChild(el('small', '', s[0])); c.appendChild(el('b', '', s[1])); c.appendChild(el('span', '', s[2])); sources.appendChild(c); });
    }
    function ask(i, instant) {
      timers.forEach(clearTimeout); timers = [];
      qs.forEach(function (q, k) { q.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      var d = data[i];
      bubble.textContent = qs[i].textContent; answer.textContent = ''; sources.textContent = '';
      if (instant) { thinking.hidden = true; answer.textContent = d.a; sourcesFor(d); return; }
      thinking.hidden = false; step.textContent = 'Searching messages…';
      later(function () { step.textContent = 'Reading a thread…'; }, 900);
      later(function () {
        thinking.hidden = true;
        var words = d.a.split(' '), n = 0;
        (function stream() { answer.textContent = words.slice(0, ++n).join(' '); if (n < words.length) later(stream, 38); else later(function () { sourcesFor(d); }, 150); })();
      }, 1800);
    }
    qs.forEach(function (q, i) { q.addEventListener('click', function () { ask(i, reduce); }); });
    ask(0, true);
    if (!reduce && hasIO) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { io.disconnect(); ask(0, false); } }, { threshold: 0.5 });
      io.observe(chat);
    }
  })();

  // ---------- Gallery: arrows and dots ----------
  (function () {
    var track = $('.gallery__track'), dots = $('.gallery__dots');
    if (!track) return;
    var figs = $$('figure', track);
    var dotEls = figs.map(function (f, i) {
      var b = el('button'); b.type = 'button'; b.tabIndex = -1;
      b.addEventListener('click', function () { track.scrollTo({ left: f.offsetLeft - figs[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' }); });
      dots.appendChild(b); return b;
    });
    function current() { var x = track.scrollLeft, best = 0; figs.forEach(function (f, i) { if (Math.abs(f.offsetLeft - figs[0].offsetLeft - x) < Math.abs(figs[best].offsetLeft - figs[0].offsetLeft - x)) best = i; }); return best; }
    function mark() { var c = current(); dotEls.forEach(function (d, i) { d.setAttribute('aria-current', i === c ? 'true' : 'false'); }); }
    track.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true });
    mark();
    $$('[data-gal]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = clamp(current() + (+b.getAttribute('data-gal')), 0, figs.length - 1);
        track.scrollTo({ left: figs[c].offsetLeft - figs[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  })();

  // ---------- Never: each line is struck through as it reaches the middle of the screen ----------
  (function () {
    var items = $$('.never li');
    if (!items.length) return;
    if (reduce || !hasIO) { items.forEach(function (li) { li.classList.add('is-struck'); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-struck'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0.5 });
    items.forEach(function (li) { io.observe(li); });
  })();
})();
