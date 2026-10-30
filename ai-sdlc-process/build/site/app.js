(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('aisdlc:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('aisdlc:' + k, JSON.stringify(v)); } catch (e) { } }
  };
  var pages = {}; $$('section.page').forEach(function (p) { pages[p.id.slice(2)] = p; });
  var navLinks = $$('#nav a[data-page]');
  var order = navLinks.map(function (a) { return a.getAttribute('data-page'); });
  var titles = {}; navLinks.forEach(function (a) { titles[a.getAttribute('data-page')] = { t: a.getAttribute('data-title'), g: a.getAttribute('data-group') }; });
  var current = null;

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  /* ---------- router ---------- */
  function show(id, keepScroll) {
    if (!pages[id]) id = 'home';
    if (current === id) return;
    Object.keys(pages).forEach(function (k) { pages[k].hidden = k !== id; }); current = id;
    navLinks.forEach(function (a) { if (a.getAttribute('data-page') === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var active = $('#nav a[aria-current="page"]');
    if (active) { var g = active.closest('.nav-group'); if (g && g.classList.contains('closed')) toggleGroup(g, false); }
    var meta = titles[id] || { t: pages[id].getAttribute('data-title'), g: pages[id].getAttribute('data-group') };
    var crumbs = $('.crumbs', pages[id]);
    if (crumbs) crumbs.innerHTML = '<a href="#home">Home</a><span aria-hidden="true">›</span><span>' + (meta.g || '') + '</span>' + (meta.g ? '<span aria-hidden="true">›</span>' : '') + '<span>' + (meta.t || '') + '</span>';
    pager(id); buildToc(); closeNav();
    if (!keepScroll) window.scrollTo(0, 0);
    store.set('last', id);
    var h1 = $('h1', pages[id]); if (h1) { h1.setAttribute('tabindex', '-1'); if (!keepScroll) h1.focus({ preventScroll: true }); }
    if (id === 'deck') deckShow(deckIndex);
  }
  function pager(id) {
    var pg = $('.pager', pages[id]); if (!pg) return;
    var i = order.indexOf(id), html = '';
    var pi = order[i - 1], ni = order[i + 1];
    if (i > 0) html += '<a class="prev" href="#' + pi + '"><small>Previous</small><span>← ' + titles[pi].t + '</span></a>';
    if (i >= 0 && i < order.length - 1) html += '<a class="next" href="#' + ni + '"><small>Next</small><span>' + titles[ni].t + ' →</span></a>';
    pg.innerHTML = html;
  }
  function buildToc() {
    var toc = $('#toc'), heads = $$('h2, h3.toc-sub', pages[current]);
    if (heads.length < 3) { toc.innerHTML = ''; return; }
    toc.innerHTML = '<h4>On this page</h4>' + heads.map(function (h, i) {
      if (!h.id) h.id = current + '-h' + i;
      return '<a href="javascript:void(0)" data-to="' + h.id + '" class="' + (h.tagName === 'H3' ? 'sub' : '') + '">' + (h.getAttribute('data-label') || h.textContent) + '</a>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-to]');
    if (a) { e.preventDefault(); var el = document.getElementById(a.getAttribute('data-to')); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });

  /* ---------- navigation drawer + groups ---------- */
  function toggleGroup(g, close) {
    var c = close === undefined ? !g.classList.contains('closed') : close;
    g.classList.toggle('closed', c); $('button', g).setAttribute('aria-expanded', String(!c));
    var closed = store.get('closedGroups', []); var key = g.getAttribute('data-group');
    closed = closed.filter(function (k) { return k !== key; }); if (c) closed.push(key); store.set('closedGroups', closed);
  }
  $$('.nav-group > button').forEach(function (b) { b.addEventListener('click', function () { toggleGroup(b.parentNode); }); });
  store.get('closedGroups', []).forEach(function (k) { var g = $('.nav-group[data-group="' + k + '"]'); if (g) { g.classList.add('closed'); $('button', g).setAttribute('aria-expanded', 'false'); } });
  function closeNav() { $('#nav').classList.remove('open'); $('#scrim').hidden = true; $('#menu').setAttribute('aria-expanded', 'false'); }
  $('#menu').addEventListener('click', function () {
    var open = !$('#nav').classList.contains('open');
    $('#nav').classList.toggle('open', open); $('#scrim').hidden = !open; this.setAttribute('aria-expanded', String(open));
  });
  $('#scrim').addEventListener('click', closeNav);

  /* ---------- tooltips ---------- */
  var tip = $('#tip'), tipFor = null;
  function showTip(el) {
    var txt = el.getAttribute('data-tip'); if (!txt) return;
    var head = el.getAttribute('data-tip-title');
    tip.innerHTML = (head ? '<b></b>' : '') + '<span></span>';
    if (head) tip.firstChild.textContent = head;
    tip.lastChild.textContent = txt; tip.hidden = false; tipFor = el;
    el.setAttribute('aria-describedby', 'tip');
    var r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    var x = Math.min(Math.max(8, r.left + r.width / 2 - tw / 2), window.innerWidth - tw - 8);
    var y = r.top - th - 8; if (y < 64) y = r.bottom + 8;
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  function hideTip() { if (tipFor) tipFor.removeAttribute('aria-describedby'); tip.hidden = true; tipFor = null; }
  document.addEventListener('mouseover', function (e) { var el = e.target.closest('[data-tip]'); if (el && el !== tipFor) showTip(el); else if (!el && tipFor) hideTip(); });
  document.addEventListener('focusin', function (e) { var el = e.target.closest('[data-tip]'); if (el) showTip(el); });
  document.addEventListener('focusout', hideTip);
  window.addEventListener('scroll', hideTip, { passive: true });
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-tip]');
    if (el && !el.closest('a, button')) { if (tipFor === el) hideTip(); else showTip(el); }
  });

  /* ---------- search ---------- */
  var index = [];
  Object.keys(pages).forEach(function (id) {
    var p = pages[id], title = (titles[id] && titles[id].t) || p.getAttribute('data-title');
    index.push({ id: id, title: title, group: (titles[id] && titles[id].g) || p.getAttribute('data-group') || '', text: p.textContent.replace(/\s+/g, ' ') });
  });
  var q = $('#q'), res = $('#results'), sel = -1;
  function runSearch() {
    var term = q.value.trim().toLowerCase();
    if (term.length < 2) { res.hidden = true; return; }
    var words = term.split(/\s+/);
    var hits = index.map(function (it) {
      var t = it.title.toLowerCase(), x = it.text.toLowerCase(), score = 0;
      for (var i = 0; i < words.length; i++) { var w = words[i]; if (x.indexOf(w) < 0 && t.indexOf(w) < 0) return null; score += (t.indexOf(w) >= 0 ? 10 : 0) + Math.min(5, x.split(w).length - 1); }
      var pos = x.indexOf(words[0]), snip = it.text.substr(Math.max(0, pos - 50), 130);
      return { it: it, score: score, snip: (pos > 50 ? '…' : '') + snip + '…' };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
    sel = -1;
    res.innerHTML = hits.length ? hits.map(function (h) {
      return '<a href="#' + h.it.id + '"><b></b><span></span></a>';
    }).join('') : '<div class="empty">No matches. Try a stage (S4), a template (T02), a role or a term such as “parity”.</div>';
    $$('a', res).forEach(function (a, i) { $('b', a).textContent = hits[i].it.title + (hits[i].it.group ? '  ·  ' + hits[i].it.group : ''); $('span', a).textContent = hits[i].snip; });
    res.hidden = false;
  }
  q.addEventListener('input', runSearch);
  q.addEventListener('keydown', function (e) {
    var items = $$('a', res);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!items.length) return; sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach(function (a, i) { a.classList.toggle('on', i === sel); }); }
    if (e.key === 'Enter') { var a = items[sel >= 0 ? sel : 0]; if (a) { location.hash = a.getAttribute('href').slice(1); res.hidden = true; q.blur(); } }
    if (e.key === 'Escape') { res.hidden = true; q.blur(); }
  });
  res.addEventListener('click', function () { res.hidden = true; });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search')) res.hidden = true; });

  /* ---------- modal (help + document viewer) ---------- */
  var lastFocus = null;
  function openModal(title, html) {
    lastFocus = document.activeElement;
    $('#modal-title').textContent = title; $('#modal-body').innerHTML = html; $('#modal').hidden = false; $('#modal .close').focus();
  }
  function closeModal() { $('#modal').hidden = true; if (lastFocus) lastFocus.focus(); }
  $('#modal .close').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
  $('#help-btn').addEventListener('click', function () { openModal('How to use this portal', $('#help-content').innerHTML); });
  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-view]'); if (!v) return;
    e.preventDefault(); var src = document.getElementById(v.getAttribute('data-view'));
    if (src) openModal(v.getAttribute('data-view-title') || 'Document', src.innerHTML);
  });

  /* ---------- theme ---------- */
  var themes = ['system', 'light', 'dark'];
  function applyTheme(t) {
    if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    $('#theme-label').textContent = t === 'system' ? 'Auto' : t === 'light' ? 'Light' : 'Dark';
    $('#theme-btn').setAttribute('data-tip', 'Theme: ' + $('#theme-label').textContent + '. Click to switch between automatic, light and dark.');
  }
  var theme = store.get('theme', 'system'); applyTheme(theme);
  $('#theme-btn').addEventListener('click', function () { theme = themes[(themes.indexOf(theme) + 1) % 3]; store.set('theme', theme); applyTheme(theme); toast('Theme: ' + $('#theme-label').textContent); });

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', function (e) {
    var typing = /input|textarea|select/i.test(e.target.tagName);
    if (e.key === 'Escape') { if (!$('#modal').hidden) closeModal(); closeNav(); hideTip(); }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); q.focus(); q.select(); }
    else if (e.key === '?') { openModal('How to use this portal', $('#help-content').innerHTML); }
    else if (e.key === ']' || e.key === '[') { var i = order.indexOf(current) + (e.key === ']' ? 1 : -1); if (order[i]) location.hash = order[i]; }
    else if (current === 'deck' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { deckShow(deckIndex + (e.key === 'ArrowRight' ? 1 : -1)); }
  });

  /* ---------- checklists (per-viewer memory) ---------- */
  $$('.check[data-key]').forEach(function (list) {
    var key = 'chk:' + list.getAttribute('data-key'), saved = store.get(key, []), boxes = $$('input', list);
    var bar = list.nextElementSibling && $('.progress i', list.nextElementSibling), lab = list.nextElementSibling && $('.done', list.nextElementSibling);
    function upd() { var n = boxes.filter(function (b) { return b.checked; }).length; if (bar) bar.style.width = (100 * n / boxes.length) + '%'; if (lab) lab.textContent = n + ' of ' + boxes.length + ' checked'; }
    boxes.forEach(function (b, i) { b.checked = saved.indexOf(i) >= 0; b.addEventListener('change', function () { store.set(key, boxes.map(function (x, j) { return x.checked ? j : -1; }).filter(function (j) { return j >= 0; })); upd(); }); });
    var reset = list.nextElementSibling && $('.reset', list.nextElementSibling);
    if (reset) reset.addEventListener('click', function () { boxes.forEach(function (b) { b.checked = false; }); store.set(key, []); upd(); toast('Checklist cleared'); });
    upd();
  });

  /* ---------- activity mode filter ---------- */
  $$('.filters[data-for]').forEach(function (f) {
    var tbl = document.getElementById(f.getAttribute('data-for'));
    $$('button', f).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', f).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var want = b.getAttribute('data-mode');
        $$('tbody tr', tbl).forEach(function (tr) { var m = tr.getAttribute('data-mode'); tr.classList.toggle('hide', want !== 'all' && (want === 'ai' ? !/AI-G|AI-A/.test(m) : m.indexOf(want) < 0)); });
      });
    });
  });

  /* ---------- library filters ---------- */
  var lib = $('#lib-grid');
  if (lib) {
    var fs = $('#lib-stage'), fw = $('#lib-wt'), ft = $('#lib-text'), cards = $$('.lib-card', lib);
    var runLib = function () {
      var s = fs.value, w = fw.value, t = ft.value.trim().toLowerCase(), n = 0;
      cards.forEach(function (c) {
        var ok = (s === 'all' || (' ' + c.getAttribute('data-stages') + ' ').indexOf(' ' + s + ' ') >= 0 || c.getAttribute('data-stages') === 'any') &&
          (w === 'all' || c.getAttribute('data-wt').indexOf(w) >= 0) && (!t || c.textContent.toLowerCase().indexOf(t) >= 0);
        c.hidden = !ok; if (ok) n++;
      });
      $('#lib-count').textContent = n + ' of ' + cards.length + ' shown';
    };
    [fs, fw].forEach(function (x) { x.addEventListener('change', runLib); }); ft.addEventListener('input', runLib); runLib();
  }

  /* ---------- copy buttons ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return;
    var src = document.getElementById(b.getAttribute('data-copy')), text = src ? src.textContent : '';
    var done = function () { toast('Copied to clipboard'); };
    try {
      navigator.clipboard.writeText(text).then(done, function () { selectText(src); toast('Press Ctrl+C to copy the selected text'); });
    } catch (err) { selectText(src); toast('Press Ctrl+C to copy the selected text'); }
  });
  function selectText(el) { if (!el) return; var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }

  /* ---------- downloads unavailable in preview ---------- */
  document.addEventListener('click', function (e) { var b = e.target.closest('.btn.off'); if (b) { e.preventDefault(); toast('Downloads work on the hosted portal. This preview cannot save files.'); } });

  /* ---------- deck viewer ---------- */
  var deckIndex = 0, slides = $$('#thumbs button');
  function deckShow(i) {
    if (!slides.length) return;
    deckIndex = Math.max(0, Math.min(slides.length - 1, i));
    var img = $('#deck-img'); img.src = slides[deckIndex].getAttribute('data-src'); img.alt = 'Slide ' + (deckIndex + 1) + ' of ' + slides.length;
    $('#deck-pos').textContent = 'Slide ' + (deckIndex + 1) + ' of ' + slides.length;
    slides.forEach(function (s, j) { s.setAttribute('aria-current', String(j === deckIndex)); });
  }
  slides.forEach(function (s, j) { s.addEventListener('click', function () { deckShow(j); $('#deck-img').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }); });
  if ($('#deck-prev')) { $('#deck-prev').addEventListener('click', function () { deckShow(deckIndex - 1); }); $('#deck-next').addEventListener('click', function () { deckShow(deckIndex + 1); }); }

  /* ---------- welcome banner ---------- */
  var wb = $('#welcome');
  if (wb) { if (store.get('welcomed', false)) wb.hidden = true; $('#welcome-x').addEventListener('click', function () { wb.hidden = true; store.set('welcomed', true); }); }

  show(location.hash.slice(1) || 'home');
})();
