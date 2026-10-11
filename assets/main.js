(function () {
  'use strict';

  var I18N = window.WFA_I18N || { en: {} };
  var root = document.documentElement;
  var LOCALES = { en: 'en-US', az: 'az-Latn-AZ', ru: 'ru-RU' };
  var lang = 'en';

  /* ---------- Language ---------- */
  var textNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-aria]'));

  // English lives in the HTML; capture it so switching back restores it exactly.
  textNodes.forEach(function (n) { I18N.en[n.getAttribute('data-i18n')] = n.innerHTML; });
  ariaNodes.forEach(function (n) { I18N.en[n.getAttribute('data-i18n-aria')] = n.getAttribute('aria-label'); });

  function t(key) {
    var d = I18N[lang] || {};
    return d[key] != null ? d[key] : I18N.en[key];
  }

  function fmt(value, decimals) {
    try {
      return new Intl.NumberFormat(LOCALES[lang], { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
    } catch (e) {
      return value.toFixed(decimals);
    }
  }

  function setLang(next) {
    lang = I18N[next] ? next : 'en';
    textNodes.forEach(function (n) {
      var v = t(n.getAttribute('data-i18n'));
      if (v != null) n.innerHTML = v;
    });
    ariaNodes.forEach(function (n) {
      var v = t(n.getAttribute('data-i18n-aria'));
      if (v != null) n.setAttribute('aria-label', v);
    });
    root.lang = lang;
    document.querySelector('.lang').setAttribute('data-active', lang);
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang));
    });
    renderChart();
    renderPrice();
    try { localStorage.setItem('wfa-lang', lang); } catch (e) { /* storage unavailable */ }
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.getElementById('menu-btn');
  var nav = document.getElementById('site-nav');
  function closeMenu() { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  menuBtn.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Before / after chart ---------- */
  var chartMode = 'after';
  var rows = Array.prototype.slice.call(document.querySelectorAll('.bar-row'));
  var toggle = document.querySelector('.toggle');

  // Replays the short blur-in on an element whose value just changed.
  function swap(el) {
    el.classList.remove('swap');
    void el.offsetWidth;
    el.classList.add('swap');
  }

  function renderChart(animate) {
    rows.forEach(function (row) {
      var before = parseFloat(row.dataset.before);
      var after = parseFloat(row.dataset.after);
      var max = parseFloat(row.dataset.max);
      var dec = parseInt(row.dataset.dec, 10) || 0;
      var suffix = row.dataset.suffix || '';
      var value = chartMode === 'after' ? after : before;
      var bar = row.querySelector('.bar');
      var tick = row.querySelector('.tick');
      bar.style.transform = 'scaleX(' + (value / max) + ')';
      bar.classList.toggle('is-before', chartMode === 'before');
      tick.style.left = (before / max * 100) + '%';
      tick.style.opacity = chartMode === 'after' ? '1' : '0';
      var v = row.querySelector('.v');
      v.textContent = fmt(value, dec) + suffix;
      if (animate) swap(v);
      var was = row.querySelector('.was');
      was.textContent = t('ui.was').replace('{x}', fmt(before, dec) + suffix);
      was.style.visibility = chartMode === 'after' ? 'visible' : 'hidden';
    });
    toggle.setAttribute('data-mode', chartMode);
    document.querySelectorAll('.toggle button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === chartMode));
    });
  }

  document.querySelectorAll('.toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = b.getAttribute('data-mode');
      if (next === chartMode) return;
      chartMode = next;
      renderChart(true);
    });
  });

  /* ---------- Full-cost pricing example ---------- */
  var PRICE_BEFORE = 25;
  var SCALE = 64; // AZN at the right edge of the bar
  var costInputs = Array.prototype.slice.call(document.querySelectorAll('[data-cost]'));
  var totalEl = document.getElementById('price-total');
  var msgEl = document.getElementById('price-msg');

  function renderPrice(animate) {
    var total = 0;
    costInputs.forEach(function (input) {
      var v = input.checked ? parseFloat(input.dataset.cost) : 0;
      var seg = document.querySelector('[data-seg="' + input.id + '"]');
      // Segments start where the previous checked ones end; unchecked ones collapse in place.
      if (seg) seg.style.transform = 'translateX(' + (total / SCALE * 100) + '%) scaleX(' + (v / SCALE) + ')';
      total += v;
    });
    totalEl.textContent = fmt(total, 0);
    var gap = total - PRICE_BEFORE;
    msgEl.innerHTML = gap > 0 ? t('ui.gap').replace('{x}', fmt(gap, 0)) : t('ui.ok');
    if (animate) swap(totalEl);
  }

  costInputs.forEach(function (input) {
    input.addEventListener('change', function () { renderPrice(true); });
  });

  /* ---------- Method stages (tabs) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.steps [role="tab"]'));

  function selectTab(index, focus) {
    tabs.forEach(function (tab, i) {
      var selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(i, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next !== null) { e.preventDefault(); selectTab(next, true); }
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById('copy-email');
  var emailEl = document.getElementById('email');
  var copyTimer;

  function flash(text) {
    copyBtn.textContent = text;
    swap(copyBtn);
    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { copyBtn.textContent = t('ct.copy'); swap(copyBtn); }, 2200);
  }
  function selectEmail() {
    var range = document.createRange();
    range.selectNodeContents(emailEl);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    flash(t('ui.copyFail'));
  }
  copyBtn.addEventListener('click', function () {
    var text = emailEl.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(t('ui.copied')); }, selectEmail);
    } else {
      selectEmail();
    }
  });

  /* ---------- Start ---------- */
  var saved = null;
  try { saved = localStorage.getItem('wfa-lang'); } catch (e) { /* storage unavailable */ }
  setLang(saved || 'en');
  // Enable sliding-thumb transitions only after the first paint, so a saved language doesn't animate in on load.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('js-ready'); });
  });
})();
