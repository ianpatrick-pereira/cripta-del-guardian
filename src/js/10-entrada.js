// ================= Entrada =================
const keys = new Set();
const mouse = { x: 0, y: 0, down: false, right: false, moved: false };
const touch = { on: false, stickId: null, ox: 0, oy: 0, x: 0, y: 0, atk: false, chg: false };
let wantDash = false, wantSwap = 0, wantUse = false, wantAbil = false, wantElem = false;

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (G && G.choice && G.choice.note) { if (['escape', 'e', 'enter', ' '].includes(k) && !e.repeat) { e.preventDefault(); closeNote(); } return; }
  if (G && G.choice && G.choice.forge) { if (['escape', 'e', 'p'].includes(k)) closeForge(); return; }
  if (G && G.choice && G.choice.gamble) { if (['1', '2', '3'].includes(k)) gamPick(+k - 1); else if (k === 'enter') gamPlace(); else if (k === 'escape') gamLeave(); return; }
  if (G && G.choice && ['1', '2', '3'].includes(k)) { pickChoice(+k - 1); return; }
  if (!started) return;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab'].includes(k)) e.preventDefault();
  if (k === 'escape' || k === 'p') { togglePause(); return; }
  if (k === 'm') { muted = !muted; return; }
  if (e.repeat) return;
  keys.add(k);
  if (k === ' ' || k === 'shift') wantDash = true;
  if (k === 'q') wantSwap = 1;
  if (k === '1') wantSwap = 'a';
  if (k === '2') wantSwap = 'b';
  if (k === 'e') wantUse = true;
  if (k === 'f') wantAbil = true;
  if (k === 'r') wantElem = true;
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => { keys.clear(); mouse.down = mouse.right = false; if (started && G && !G.over && !G.choice) setPause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && started && G && !G.over && !G.choice) setPause(true); });

function cssSize() { return { w: cv.clientWidth, h: cv.clientHeight }; }
cv.addEventListener('contextmenu', e => e.preventDefault());
cv.addEventListener('mousedown', e => {
  if (touch.on) return;
  mouse.x = e.offsetX; mouse.y = e.offsetY; mouse.moved = true;
  if (e.button === 0) mouse.down = true;
  if (e.button === 2) mouse.right = true;
});
addEventListener('mouseup', e => { if (e.button === 0) mouse.down = false; if (e.button === 2) mouse.right = false; });
cv.addEventListener('mousemove', e => { if (touch.on) return; mouse.x = e.offsetX; mouse.y = e.offsetY; mouse.moved = true; });
cv.addEventListener('pointerdown', e => {
  if (e.pointerType !== 'touch') return;
  enableTouch();
  if (touch.stickId === null && e.offsetX < cv.clientWidth * .55) {
    touch.stickId = e.pointerId; touch.ox = touch.x = e.offsetX; touch.oy = touch.y = e.offsetY;
    cv.setPointerCapture(e.pointerId);
  }
});
cv.addEventListener('pointermove', e => { if (e.pointerId === touch.stickId) { touch.x = e.offsetX; touch.y = e.offsetY; } });
const endPtr = e => { if (e.pointerId === touch.stickId) touch.stickId = null; };
cv.addEventListener('pointerup', endPtr);
cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); if (started) wantSwap = 1; }, { passive: false });

function enableTouch() { if (touch.on) return; touch.on = true; mouse.down = mouse.right = false; if (started) $('touch').hidden = false; }
function holdBtn(id, on, off) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); enableTouch(); b.setPointerCapture(e.pointerId); b.classList.add('on'); on(); });
  const up = () => { b.classList.remove('on'); off && off(); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
}
holdBtn('bAtk', () => touch.atk = true, () => touch.atk = false);
holdBtn('bChg', () => touch.chg = true, () => touch.chg = false);
holdBtn('bDash', () => wantDash = true);
holdBtn('bSwap', () => wantSwap = 1);
holdBtn('bHab', () => wantAbil = true);
holdBtn('bEle', () => wantElem = true);
holdBtn('bUse', () => wantUse = true);
holdBtn('bPause', () => togglePause());

