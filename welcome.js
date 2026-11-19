// Ver1.9.10: 初心者ガイド表示。対戦ロジックは変更しない。
(function () {
  const overlay = document.getElementById('welcome-overlay');
  const start = document.getElementById('welcome-start');
  const help = document.getElementById('welcome-help');
  const skip = document.getElementById('welcome-skip');
  const basicTab = document.getElementById('guide-tab-basic');
  const detailTab = document.getElementById('guide-tab-detail');
  const basicPanel = document.getElementById('guide-basic');
  const detailPanel = document.getElementById('guide-detail');
  function switchGuide(detail) {
    basicPanel.hidden = detail;
    detailPanel.hidden = !detail;
    basicTab.classList.toggle('active', !detail);
    detailTab.classList.toggle('active', detail);
    basicTab.setAttribute('aria-selected', String(!detail));
    detailTab.setAttribute('aria-selected', String(detail));
  }
  basicTab.addEventListener('click', () => switchGuide(false));
  detailTab.addEventListener('click', () => switchGuide(true));
  const storageKey = 'don-clash-skip-welcome-v1';
  // チェック状態は起動時に復元。ルールボタンからいつでも変更可能。
  let preferredSkip = false;
  try { preferredSkip = localStorage.getItem(storageKey) === 'yes'; } catch (_) {}
  skip.checked = preferredSkip;
  function openGuide() {
    overlay.classList.remove('welcome-hidden');
    document.body.classList.add('welcome-active');
    start.focus();
  }
  function closeGuide() {
    try { localStorage.setItem(storageKey, skip.checked ? 'yes' : 'no'); } catch (_) {}
    overlay.classList.add('welcome-hidden');
    document.body.classList.remove('welcome-active');
  }
  start.addEventListener('click', closeGuide);
  help.addEventListener('click', openGuide);
  if (preferredSkip) {
    overlay.classList.add('welcome-hidden');
    document.body.classList.remove('welcome-active');
  } else {
    openGuide();
  }
})();
