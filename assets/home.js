// textlore.app home page: the live demos. Each one plays only while it is on screen.
// With Reduce Motion, every demo is shown in its finished state and nothing loops.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fmt = function (n) { return n.toLocaleString('en-US'); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  // A demo plays while it is on screen and rests in its finished state otherwise.
  function demo(root, play, rest) {
    if (!root) return;
    var timers = [];
    var api = {
      later: function (fn, ms) { timers.push(setTimeout(fn, ms)); },
      stop: function () { timers.forEach(clearTimeout); timers = []; }
    };
    rest();
    if (reduce || !('IntersectionObserver' in window)) return;
    var running = false;
    new IntersectionObserver(function (entries) {
      var on = entries[0].isIntersecting;
      if (on && !running) { running = true; play(api); }
      if (!on && running) { running = false; api.stop(); rest(); }
    }, { threshold: 0.3 }).observe(root);
  }

  // Rolling digits, like .contentTransition(.numericText()) in the app.
  function Roller(node, prefix) {
    this.node = node; this.prefix = prefix || ''; this.cols = null; this.text = '';
  }
  Roller.prototype.set = function (n, start) {
    var text = fmt(n);
    if (!this.cols || text.length !== this.text.length) {
      this.node.textContent = '';
      this.node.setAttribute('aria-label', this.prefix + text);
      var wrap = el('span', 'roll');
      wrap.setAttribute('aria-hidden', 'true');
      if (this.prefix) wrap.appendChild(el('span', 'roll__d', this.prefix));
      this.cols = [];
      for (var i = 0; i < text.length; i++) {
        if (!/\d/.test(text[i])) { wrap.appendChild(el('span', 'roll__d', text[i])); this.cols.push(null); continue; }
        var d = el('span', 'roll__d'), col = el('span', 'roll__col');
        for (var k = 0; k < 10; k++) col.appendChild(el('span', '', String(k)));
        d.appendChild(col); wrap.appendChild(d); this.cols.push(col);
        col.style.transform = 'translateY(-' + (start ? 0 : +text[i]) + 'em)';
      }
      this.node.appendChild(wrap);
      if (start) { void wrap.offsetWidth; }
    }
    this.node.setAttribute('aria-label', this.prefix + text);
    for (var j = 0; j < text.length; j++) {
      if (this.cols[j]) this.cols[j].style.transform = 'translateY(-' + text[j] + 'em)';
    }
    this.text = text;
  };

  // Numbers that roll up once when they come into view.
  $$('[data-roll]').forEach(function (node) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      new Roller(node, node.getAttribute('data-prefix')).set(+node.getAttribute('data-roll'), true);
    }, { threshold: 0.6 });
    io.observe(node);
  });

  // ---------- 1. Search ----------
  (function () {
    var root = $('#search-demo');
    if (!root) return;
    var rows = [
      { who: 'Jordan', c: '#5145CD', date: '14 Mar 2024', text: 'My flight lands at 6:40, terminal 1', photo: true },
      { who: 'Theo', c: '#C2410C', date: '2 Aug 2023', text: 'Flight lands early, skip the cab' },
      { who: 'Family', c: '#0F766E', date: '19 Dec 2022', text: 'Mom: when does the flight land?' },
      { who: 'Jordan', c: '#5145CD', date: '3 Sep 2025', text: 'Flight lands at 11, call you after' },
      { who: 'Priya', c: '#9F1239', date: '7 May 2021', text: 'Lands at 9 if the flight is on time' },
      { who: 'Ana', c: '#1D4ED8', date: '28 Jan 2020', text: 'Booked the flight, finally!' },
      { who: 'Mom', c: '#B45309', date: '12 Jun 2019', text: 'Fresh mangoes at the market today' }
    ];
    // Matches in the whole demo library for each typed length, so the count feels real.
    var counts = [123580, 21409, 3310, 1288, 802, 611, 584, 120, 74, 41, 33, 29, 27];
    var list = $('.results', root), textNode = $('.capsule__text', root), tokens = $('.tokens', root);
    var countNode = $('.count', root);
    var phrase = 'flight lands';
    rows.forEach(function (r) {
      var li = el('li', 'result');
      var av = el('span', 'avatar', r.who.slice(0, 2).toUpperCase());
      av.style.background = r.c;
      li.appendChild(av); li.appendChild(el('b', '', r.who)); li.appendChild(el('time', '', r.date));
      r.line = el('span', 'line'); li.appendChild(r.line);
      r.li = li; list.appendChild(li);
    });

    function render(q, filters, sweep) {
      var lower = q.toLowerCase(), shown = 0;
      rows.forEach(function (r) {
        var ok = r.text.toLowerCase().indexOf(lower) !== -1 &&
          (!filters.from || r.who === filters.from) && (!filters.photo || r.photo);
        var was = !r.li.classList.contains('is-out');
        r.li.classList.toggle('is-out', !ok);
        r.li.classList.toggle('is-in', ok && !was);
        r.li.classList.toggle('is-first', ok && shown === 0);
        if (ok) shown++;
        // The message text, with the match marked once typing settles.
        r.line.textContent = '';
        if (r.photo) r.line.appendChild(el('i', 'thumb'));
        var at = lower ? r.text.toLowerCase().indexOf(lower) : -1;
        if (sweep && at !== -1) {
          r.line.appendChild(document.createTextNode(r.text.slice(0, at)));
          r.line.appendChild(el('mark', '', r.text.slice(at, at + q.length)));
          r.line.appendChild(document.createTextNode(r.text.slice(at + q.length)));
        } else {
          r.line.appendChild(document.createTextNode(r.text));
        }
      });
      var n = filters.photo ? 1 : filters.from ? 2 : counts[Math.min(q.length, counts.length - 1)];
      countNode.textContent = q ? fmt(n) + (n === 1 ? ' result' : ' results') : fmt(counts[0]) + ' messages';
    }
    function token(text) { tokens.appendChild(el('span', 'token', text)); }
    render(phrase, {}, true);

    demo(root, function play(t) {
      function loop() {
        tokens.textContent = ''; textNode.textContent = '';
        render('', {}, false);
        var i = 0;
        (function type() {
          if (i > phrase.length) { settle(); return; }
          textNode.textContent = phrase.slice(0, i);
          render(phrase.slice(0, i), {}, false);
          i++;
          t.later(type, i === 1 ? 700 : 95 + Math.random() * 70);
        })();
        function settle() {
          t.later(function () { render(phrase, {}, true); }, 250);
          t.later(function () { token('from:Jordan'); render(phrase, { from: 'Jordan' }, true); }, 1550);
          t.later(function () { token('has:photo'); render(phrase, { from: 'Jordan', photo: true }, true); }, 2550);
          t.later(loop, 5800);
        }
      }
      loop();
    }, function rest() {
      tokens.textContent = ''; textNode.textContent = phrase;
      token('from:Jordan'); token('has:photo');
      render(phrase, {}, true);
      render(phrase, { from: 'Jordan', photo: true }, true);
    });
  })();

  // ---------- 2. Quick search ----------
  (function () {
    var root = $('#qs-demo');
    if (!root) return;
    var opt = $('[data-key="opt"]', root), space = $('[data-key="space"]', root), panel = $('.panel', root);
    var text = $('.capsule__text', root), q = text.getAttribute('data-q');
    var items = $$('li', panel);
    demo(root, function play(t) {
      function loop() {
        panel.classList.remove('is-open'); text.textContent = '';
        items.forEach(function (li) { li.style.visibility = 'hidden'; });
        t.later(function () { opt.classList.add('is-down'); }, 500);
        t.later(function () { space.classList.add('is-down'); }, 700);
        t.later(function () { opt.classList.remove('is-down'); space.classList.remove('is-down'); panel.classList.add('is-open'); }, 1000);
        for (var i = 1; i <= q.length; i++) {
          (function (n) {
            t.later(function () {
              text.textContent = q.slice(0, n);
              if (n === 3) items.forEach(function (li, k) { if (k > 0) li.style.visibility = ''; });
              if (n === 5) items[0].style.visibility = '';
            }, 1500 + n * 110);
          })(i);
        }
        t.later(loop, 1500 + q.length * 110 + 3600);
      }
      loop();
    }, function rest() {
      opt.classList.remove('is-down'); space.classList.remove('is-down');
      text.textContent = q; items.forEach(function (li) { li.style.visibility = ''; }); panel.classList.add('is-open');
    });
  })();

  // ---------- 3. Archive ----------
  (function () {
    var root = $('#archive-demo');
    if (!root) return;
    var zone = $('.drop-zone', root), counter = new Roller($('[data-counter]', root));
    var total = 8412;
    var tiles = [
      ['#8FB996', '#3F6F55', 6, 112, -14, -4], ['#F2C46D', '#B5651D', 24, 118, 10, 5], ['#7DD3FC', '#1D4ED8', 42, 110, -8, -3],
      ['#FDA4AF', '#9F1239', 60, 120, 12, 6], ['#C4B5FD', '#5145CD', 78, 112, -10, -5], ['#FCD34D', '#F59E0B', 15, 52, 14, 7],
      ['#94A3B8', '#334155', 34, 46, -12, -6], ['#86EFAC', '#15803D', 53, 54, 8, 4], ['#F9A8D4', '#BE185D', 71, 48, -6, -2]
    ];
    function add(t, k) {
      var d = tiles[k], tile = el('span', 'tile');
      tile.style.background = 'linear-gradient(135deg,' + d[0] + ',' + d[1] + ')';
      tile.style.left = 'calc(' + d[2] + '% - 4px)';
      tile.style.top = d[3] + 'px';
      tile.style.setProperty('--r0', d[4] + 'deg');
      tile.style.setProperty('--r1', d[5] + 'deg');
      zone.appendChild(tile);
      if (t) t.later(function () { total++; counter.set(total); }, 520);
    }
    counter.set(total);
    demo(root, function play(t) {
      function loop() {
        zone.textContent = '';
        tiles.forEach(function (_, k) { t.later(function () { add(t, k); }, 300 + k * 520); });
        t.later(loop, 300 + tiles.length * 520 + 2400);
      }
      loop();
    }, function rest() { zone.textContent = ''; tiles.forEach(function (_, k) { add(null, k); }); });
  })();

  // ---------- 4. Photos and files ----------
  (function () {
    var root = $('#grid-demo');
    if (!root) return;
    var photos = $$('.photo', root), ql = $('.ql', root), qlImg = $('.ql > div', root);
    var userHere = false;
    function open(p) {
      if (p.classList.contains('photo--cloud')) return;
      qlImg.style.background = p.style.background;
      ql.classList.add('is-open');
    }
    function close() { ql.classList.remove('is-open'); }
    photos.forEach(function (p) { p.addEventListener('click', function () { open(p); }); });
    ql.addEventListener('click', close);
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      if (e.key === ' ' && document.activeElement.classList.contains('photo')) { e.preventDefault(); ql.classList.contains('is-open') ? close() : open(document.activeElement); }
    });
    root.addEventListener('pointerenter', function () { userHere = true; photos.forEach(function (p) { p.classList.remove('is-hover'); }); });
    root.addEventListener('pointerleave', function () { userHere = false; close(); });
    demo(root, function play(t) {
      var k = 0, path = [0, 1, 4, 6, 3];
      function step() {
        photos.forEach(function (p) { p.classList.remove('is-hover'); });
        if (!userHere) {
          var p = photos[path[k % path.length]];
          p.classList.add('is-hover');
          if (k % path.length === path.length - 1) {
            t.later(function () { if (!userHere) open(p); }, 500);
            t.later(function () { if (!userHere) close(); }, 2300);
          }
        }
        k++;
        t.later(step, k % path.length === 0 ? 3000 : 1000);
      }
      step();
    }, function rest() { photos.forEach(function (p) { p.classList.remove('is-hover'); }); close(); });
  })();

  // ---------- 5. Export ----------
  (function () {
    var root = $('#export-demo');
    if (!root) return;
    demo(root, function play(t) {
      function loop() {
        root.classList.remove('is-playing'); void root.offsetWidth; root.classList.add('is-playing');
        t.later(loop, 6500);
      }
      loop();
    }, function rest() { root.classList.add('is-playing'); });
  })();

  // ---------- 6. Your Lore ----------
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
    var I = 'style="stroke:var(--ink)"', A = 'style="fill:var(--acc)"';
    function svg(body) { return '<svg viewBox="0 0 300 300" aria-hidden="true">' + body + '</svg>'; }

    var years = [3120, 5480, 7940, 14210, 12860, 11030, 13670, 15980, 17420, 12390], maxY = 17420;
    var rings = '', r = 14;
    years.forEach(function (c, i) {
      var w = 3 + 11 * c / maxY; r += w / 2;
      rings += '<circle class="draw" pathLength="100" cx="150" cy="150" r="' + r.toFixed(1) + '" fill="none" stroke-width="' + w.toFixed(1) +
        '" style="stroke:' + (c === maxY ? 'var(--acc)' : 'var(--ink)') + ';stroke-opacity:' + (c === maxY ? 1 : (0.22 + 0.6 * c / maxY).toFixed(2)) + ';--d:' + (i * 0.1).toFixed(2) + 's" transform="rotate(-90 150 150)"/>';
      r += w / 2 + 3;
    });
    rings += '<circle cx="150" cy="150" r="7" ' + A + '/>';

    var hours = [62, 40, 22, 10, 5, 3, 4, 10, 22, 35, 42, 48, 55, 50, 46, 48, 52, 58, 66, 74, 82, 92, 100, 85], clock = '';
    hours.forEach(function (v, i) {
      var a = i / 24 * Math.PI * 2 - Math.PI / 2, len = 16 + 84 * v / 100;
      clock += '<line class="draw" pathLength="100" x1="' + (150 + 46 * Math.cos(a)).toFixed(1) + '" y1="' + (150 + 46 * Math.sin(a)).toFixed(1) +
        '" x2="' + (150 + (46 + len) * Math.cos(a)).toFixed(1) + '" y2="' + (150 + (46 + len) * Math.sin(a)).toFixed(1) +
        '" stroke-width="7" stroke-linecap="round" style="stroke:' + (i === 22 ? 'var(--acc)' : 'var(--ink)') + ';stroke-opacity:' + (i === 22 ? 1 : (0.25 + 0.55 * v / 100).toFixed(2)) + ';--d:' + (i * 0.03).toFixed(2) + 's"/>';
    });
    clock += '<text x="150" y="148" text-anchor="middle" font-size="17" font-weight="800" ' + A + '>10 PM</text><text x="150" y="166" text-anchor="middle" font-size="11" font-weight="600" style="fill:var(--sub)">peak hour</text>';

    var pts = [];
    for (var i = 0; i < 90; i++) {
      var v = 0.2 + 0.42 * (i / 90) + 0.06 * Math.sin(i * 1.3) + 0.05 * Math.sin(i * 0.37 + 1);
      if (i === 29) v = 1; if (Math.abs(i - 29) === 1) v = 0.62;
      pts.push([10 + i * 280 / 89, 262 - v * 190]);
    }
    var line = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    var bigday = '<path class="draw" pathLength="100" d="' + line + '" fill="none" stroke-width="2.5" stroke-linejoin="round" ' + I + '/>' +
      '<circle class="fade" cx="' + pts[29][0].toFixed(1) + '" cy="' + pts[29][1].toFixed(1) + '" r="7" ' + A.replace('"', '"--d:1.1s;') + '/>' +
      '<text class="fade" x="' + pts[29][0].toFixed(1) + '" y="' + (pts[29][1] - 16).toFixed(1) + '" text-anchor="middle" font-size="14" font-weight="800" style="fill:var(--ink);--d:1.2s">1,206</text>';

    var streak = '';
    for (var k = 0; k < 420; k++) {
      var on = k < 412;
      streak += '<rect class="fade" x="' + (4 + (k % 21) * 13.8).toFixed(1) + '" y="' + (12 + Math.floor(k / 21) * 13.8).toFixed(1) + '" width="10.5" height="10.5" rx="3" style="fill:' +
        (on ? 'var(--acc)' : 'var(--ink)') + ';fill-opacity:' + (on ? (0.35 + 0.65 * k / 412).toFixed(2) : 0.1) + ';--d:' + (Math.floor(k / 21) * 0.035).toFixed(2) + 's"/>';
    }

    var laughs = ['HAHAHAHAHAHA', 'lol lol lol lol', 'HAHAHAHAHAHA', 'lmaooo hahaha', 'HAHAHAHAHAHA', 'ha ha ha lol ha', 'HAHAHAHAHAHA'].map(function (txt, i) {
      var hot = i === 2 || i === 5;
      return '<text class="fade" x="' + (i % 2 ? -18 : 0) + '" y="' + (70 + i * 30) + '" font-size="31" font-weight="900" style="fill:' + (hot ? 'var(--acc)' : 'var(--ink)') + ';fill-opacity:' + (hot ? 1 : i % 2 ? 0.45 : 0.85) + ';--d:' + (i * 0.09).toFixed(2) + 's">' + txt + '</text>';
    }).join('');

    var emoji = [['😂', 4120], ['❤️', 2860], ['🙏', 1340], ['🔥', 980], ['😭', 870]].map(function (e, i) {
      var w = Math.max(40, 196 * e[1] / 4120), y = 34 + i * 50;
      return '<text x="16" y="' + (y + 24) + '" font-size="28">' + e[0] + '</text><rect class="growx" x="62" y="' + y + '" width="' + w.toFixed(0) + '" height="34" rx="17" style="fill:' + (i === 0 ? 'var(--acc)' : 'var(--soft)') + ';--d:' + (i * 0.1).toFixed(1) + 's"/>' +
        '<text class="fade" x="' + (62 + w + 8).toFixed(0) + '" y="' + (y + 22) + '" font-size="13" font-weight="800" style="fill:var(--ink);--d:' + (0.4 + i * 0.1).toFixed(1) + 's">' + fmt(e[1]) + '</text>';
    }).join('');

    var photoYears = [640, 980, 1240, 2050, 1610, 1880, 2730, 3410, 3020, 2140], photos = '';
    photoYears.forEach(function (v, i) {
      var h = 12 + 210 * v / 3410, top = v === 3410;
      photos += '<rect class="grow" x="' + (8 + i * 29) + '" y="' + (262 - h).toFixed(0) + '" width="22" height="' + h.toFixed(0) + '" rx="6" style="fill:' + (top ? 'var(--acc)' : 'var(--soft)') + ';--d:' + (i * 0.06).toFixed(2) + 's"/>' +
        '<text x="' + (19 + i * 29) + '" y="284" text-anchor="middle" font-size="10.5" font-weight="700" style="fill:var(--sub)">\'' + (17 + i) + '</text>';
    });
    photos += '<text class="fade" x="' + (19 + 7 * 29) + '" y="30" text-anchor="middle" font-size="14" font-weight="800" style="fill:var(--ink);--d:.8s">3,410</text>';

    var owl = '<circle class="draw" pathLength="100" cx="150" cy="150" r="84" fill="none" stroke-width="8" ' + I.replace('"', '"stroke-opacity:.75;') + ' transform="rotate(-90 150 150)"/>' +
      '<circle class="fade" cx="150" cy="150" r="56" ' + A.replace('"', '"--d:.5s;') + '/>' +
      '<circle class="fade" cx="176" cy="132" r="48" style="fill:var(--bg);--d:.7s"/>' +
      '<circle class="fade" cx="62" cy="64" r="4" style="fill:var(--ink);--d:.9s"/><circle class="fade" cx="244" cy="76" r="3" style="fill:var(--ink);--d:1s"/><circle class="fade" cx="250" cy="232" r="4" ' + A.replace('"', '"--d:1.1s;') + '/>';

    var chapters = [
      ['Your Lore', '10 years, one ring each', '114,100 messages. The thickest ring is your busiest year.', rings],
      ['The big number', '114,100 messages', '58,190 sent, 55,910 received', '<circle cx="150" cy="150" r="104" fill="none" stroke-width="36" style="stroke:var(--soft)"/><circle class="draw" pathLength="100" cx="150" cy="150" r="104" fill="none" stroke-width="36" style="stroke:var(--acc);stroke-dasharray:51 100;stroke-dashoffset:51" transform="rotate(-90 150 150)"/><text class="fade" x="150" y="160" text-anchor="middle" font-size="46" font-weight="800" style="fill:var(--ink);--d:.6s">51%</text><text class="fade" x="150" y="186" text-anchor="middle" font-size="14" font-weight="600" style="fill:var(--sub);--d:.7s">sent by you</text>'],
      ['Your rhythm', 'Certified night owl', 'You text most at 10 PM', clock],
      ['The big day', '14 March 2020', '1,206 messages in one day', bigday],
      ['Longest streak', '412 days in a row', 'Talking with Person 1, every single day', streak],
      ['Laugh count', '9,842 laughs', 'Every haha, lol and 😂, counted', laughs],
      ['Emoji signature', '😂 ❤️ 🙏', '😂 sent 4,120 times', emoji],
      ['Photo years', '2024 was your photo year', '3,410 photos and videos that year', photos],
      ['Your Lore type', 'The Night Owl Storyteller', 'Late nights, long messages, quick replies', owl]
    ];
    var cards = chapters.map(function (c, i) {
      var card = el('div', 'lore-card');
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'card');
      card.setAttribute('aria-label', (i + 1) + ' of ' + chapters.length + ': ' + c[0] + '. ' + c[1] + '. ' + c[2]);
      card.innerHTML = '<div class="lore-card__top" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3.5" stroke-width="1.6" style="stroke:var(--ink)"/><circle cx="10" cy="10" r="7.5" stroke-width="1.6" style="stroke:var(--ink);stroke-opacity:.5"/><circle cx="10" cy="10" r="1.6" style="fill:var(--acc)"/></svg><span>Your Lore</span><span>2017 to 2026</span></div>' +
        '<div class="lore-card__kick" aria-hidden="true">' + c[0] + '</div><h3 aria-hidden="true">' + c[1] + '</h3><p aria-hidden="true">' + c[2] + '</p>' + svg(c[3]) +
        '<footer aria-hidden="true">Made with Textlore · textlore.app</footer>';
      stack.appendChild(card);
      dots.appendChild(el('i'));
      return card;
    });
    var dotEls = $$('i', dots), at = 0;
    function show(n) {
      cards[at].classList.remove('is-on'); cards[at].classList.add('is-gone');
      var old = cards[at];
      setTimeout(function () { old.classList.remove('is-gone'); }, 600);
      at = (n + cards.length) % cards.length;
      cards[at].classList.add('is-on');
      cards.forEach(function (c, i) { c.hidden = false; c.setAttribute('aria-hidden', i === at ? 'false' : 'true'); });
      dotEls.forEach(function (d, i) { d.classList.toggle('is-on', i === at); });
    }
    cards[0].classList.add('is-on'); dotEls[0].classList.add('is-on');
    cards.forEach(function (c, i) { c.setAttribute('aria-hidden', i === 0 ? 'false' : 'true'); });

    $$('input[name="look"]').forEach(function (input) {
      input.addEventListener('change', function () {
        var l = looks[input.value];
        ['--bg', '--ink', '--sub', '--acc', '--soft'].forEach(function (p, i) { screen.style.setProperty(p, l[i]); });
      });
    });

    var playBtn = $('[data-lore="play"]'), paused = reduce, visible = false, timer = null;
    var PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>', PLAY = '<path d="M7 4l13 8-13 8z"/>';
    function tick() { clearTimeout(timer); if (!paused && visible) timer = setTimeout(function () { show(at + 1); tick(); }, 2800); }
    function setPaused(p) {
      paused = p;
      playBtn.setAttribute('aria-label', p ? 'Play the cards' : 'Pause the cards');
      $('svg', playBtn).innerHTML = p ? PLAY : PAUSE;
      tick();
    }
    setPaused(paused);
    playBtn.addEventListener('click', function () { setPaused(!paused); });
    $('[data-lore="prev"]').addEventListener('click', function () { show(at - 1); tick(); });
    $('[data-lore="next"]').addEventListener('click', function () { show(at + 1); tick(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; tick(); }, { threshold: 0.4 }).observe(root);
    }
  })();

  // ---------- 7. Ask AI ----------
  (function () {
    var root = $('#ask-demo');
    if (!root) return;
    var bubble = $('.bubble', root), thinking = $('.thinking', root), step = $('.step', root), answer = $('.answer', root);
    var parts = Array.prototype.slice.call(answer.children);
    demo(root, function play(t) {
      function loop() {
        bubble.hidden = true; thinking.hidden = true; answer.hidden = true;
        parts.forEach(function (p) { p.classList.remove('in'); });
        t.later(function () { bubble.hidden = false; bubble.classList.remove('in'); void bubble.offsetWidth; bubble.classList.add('in'); }, 400);
        t.later(function () { step.textContent = 'Searching messages…'; thinking.hidden = false; }, 1100);
        t.later(function () { step.textContent = 'Reading a thread…'; }, 2200);
        t.later(function () {
          thinking.hidden = true; answer.hidden = false;
          parts.forEach(function (p, i) { p.style.animationDelay = (i * 0.18) + 's'; p.classList.add('in'); });
        }, 3200);
        t.later(loop, 9500);
      }
      loop();
    }, function rest() {
      bubble.hidden = false; thinking.hidden = true; answer.hidden = false;
      parts.forEach(function (p) { p.classList.remove('in'); p.style.animationDelay = ''; });
    });
  })();
})();
