/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

(function () {
'use strict';
const key = 'don-clash-card-theme';
const allowed = ['basic', 'pop', 'dark'];
let selected = 'basic';
try { const saved = lo\u0063alStorage.getItem(key); if (allowed.includes(saved)) selected = saved; } catch (_) {}
document.do\u0063umentElement.dataset.cardTheme = selected;
function in\u0069tialize() {
const select = document.ge\u0074ElementById('card-theme');
if (!select) return;
select.value = selected;
select.ad\u0064EventListener('change', function () {
if (!allowed.includes(select.value)) return;
selected = select.value;
document.do\u0063umentElement.dataset.cardTheme = selected;
try { lo\u0063alStorage.setItem(key, selected); } catch (_) {}
});
}
if (document.re\u0061dyState === 'loading') document.ad\u0064EventListener('DOMContentLoaded', in\u0069tialize);
else in\u0069tialize();
})();
