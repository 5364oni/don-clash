/* Ver1.9.14: visual theme only. Game rules and state are untouched. */
(function () {
  'use strict';
  const key = 'don-clash-card-theme';
  const allowed = ['basic', 'pop', 'dark'];
  let selected = 'basic';
  try { const saved = localStorage.getItem(key); if (allowed.includes(saved)) selected = saved; } catch (_) {}
  document.documentElement.dataset.cardTheme = selected;
  function initialize() {
    const select = document.getElementById('card-theme');
    if (!select) return;
    select.value = selected;
    select.addEventListener('change', function () {
      if (!allowed.includes(select.value)) return;
      selected = select.value;
      document.documentElement.dataset.cardTheme = selected;
      try { localStorage.setItem(key, selected); } catch (_) {}
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();
