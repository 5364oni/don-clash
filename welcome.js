/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

(function () {
const overlay = document.ge\u0074ElementById('welcome-overlay');
const start = document.ge\u0074ElementById('welcome-start');
const help = document.ge\u0074ElementById('welcome-help');
const skip = document.ge\u0074ElementById('welcome-skip');
const basicTab = document.ge\u0074ElementById('guide-tab-basic');
const detailTab = document.ge\u0074ElementById('guide-tab-detail');
const ba\u0073icPanel = document.ge\u0074ElementById('guide-basic');
const de\u0074ailPanel = document.ge\u0074ElementById('guide-detail');
function sw\u0069tchGuide(detail) {
ba\u0073icPanel.hidden = detail;
de\u0074ailPanel.hidden = !detail;
basicTab.classList.toggle('active', !detail);
detailTab.classList.toggle('active', detail);
basicTab.se\u0074Attribute('aria-selected', String(!detail));
detailTab.se\u0074Attribute('aria-selected', String(detail));
}
basicTab.ad\u0064EventListener('click', () => sw\u0069tchGuide(false));
detailTab.ad\u0064EventListener('click', () => sw\u0069tchGuide(true));
const st\u006frageKey = 'don-clash-skip-welcome-v1';
let pr\u0065ferredSkip = false;
try { pr\u0065ferredSkip = lo\u0063alStorage.getItem(st\u006frageKey) === 'yes'; } catch (_) {}
skip.checked = pr\u0065ferredSkip;
function openGuide() {
overlay.classList.remove('welcome-hidden');
document.body.classList.add('welcome-active');
start.focus();
}
function cl\u006fseGuide() {
try { lo\u0063alStorage.setItem(st\u006frageKey, skip.checked ? 'yes' : 'no'); } catch (_) {}
overlay.classList.add('welcome-hidden');
document.body.classList.remove('welcome-active');
}
start.ad\u0064EventListener('click', cl\u006fseGuide);
help.ad\u0064EventListener('click', openGuide);
if (pr\u0065ferredSkip) {
overlay.classList.add('welcome-hidden');
document.body.classList.remove('welcome-active');
} else {
openGuide();
}
})();
