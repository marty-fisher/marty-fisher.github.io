// Builds index.html: the goose pro-model deck. One screen, the deck floats, swipe up (or tap)
// to kickflip it to the grip side. Static, single file, no network requests besides the links.
//
// To update stats, the tagline or links: edit ../site.config.json, then run
//   node tools/build.js
// from the repo root and commit index.html with the config.
// Stat values are drawn in the Anton subset (A-Z, 0-9, space, . , +), so keep them uppercase.
const fs = require('fs');
const path = require('path');
const { deck, grip, PICK, LINK_BOX } = require('./goose.js');

const root = path.join(__dirname, '..');
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));

for (const s of cfg.stats) {
  if (!/^[A-Z0-9 .,+]+$/.test(s.value)) throw new Error(`stat value "${s.value}" uses characters outside the embedded font`);
}
if (cfg.stats.length !== 2) throw new Error('the grip layout fits exactly two stats');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const font = fs.readFileSync(path.join(__dirname, 'fonts', 'anton-subset.woff')).toString('base64');
const info = { tagline: esc(cfg.tagline), stats: cfg.stats.map((s) => ({ value: esc(s.value), label: esc(s.label) })), links: cfg.links.map((l) => ({ label: esc(l.label) })) };
const gripLabel = `Grip side: Marty Fisher, ${cfg.tagline}. ` + cfg.stats.map((x) => `${x.value} ${x.label}`).join(', ') + '.';

const bottomSvg = deck(PICK, 'b', 'width="100%" height="100%" role="img" aria-label="Deck bottom: a goose in shades with a gold chain and a toothpick"');
const gripSvg = grip(info, 'g', `width="100%" height="100%" role="img" aria-label="${esc(gripLabel)}"`);

// Real links laid over the drawn buttons. Hit areas are contiguous, one full step tall each.
const pct = (n, of) => +((n / of) * 100).toFixed(2);
const pad = (LINK_BOX.step - LINK_BOX.h) / 2;
const anchors = cfg.links.map((l, i) => {
  const top = pct(LINK_BOX.y + i * LINK_BOX.step - pad, 1000);
  return `<a href="${esc(l.href)}" style="top:${top}%"><span class="sr">${esc(l.name)}</span></a>`;
}).join('\n        ');
const linkCss = `.grip a{position:absolute;left:${pct(LINK_BOX.x, 300)}%;width:${pct(LINK_BOX.w, 300)}%;height:${pct(LINK_BOX.step, 1000)}%;border-radius:999px}`;
const favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='13' fill='%23e8662e' stroke='%231a1a1a' stroke-width='3'/%3E%3Cpath d='M10 16h12M16 10v12' stroke='%231a1a1a' stroke-width='3'/%3E%3C/svg%3E";

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#111111">
<title>${esc(cfg.site.title)}</title>
<meta name="description" content="${esc(cfg.site.description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(cfg.site.url)}">
<meta property="og:title" content="${esc(cfg.site.title)}">
<meta property="og:description" content="${esc(cfg.site.description)}">
<meta property="og:image" content="${esc(cfg.site.url)}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${favicon}">
<style>
@font-face{font-family:Anton;src:url(data:font/woff;base64,${font}) format("woff");font-display:block}
html,body{margin:0;height:100%;background:#111;color:#ece6d8;overflow:hidden;overscroll-behavior:none;
  -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}
body{display:flex;flex-direction:column;align-items:center;font:14px/1.3 ui-monospace,Menlo,monospace}
.stage{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;
  touch-action:none;perspective:1400px;padding-top:env(safe-area-inset-top);box-sizing:border-box}
.bob{transform-style:preserve-3d;animation:bob 2.6s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0) rotate(-1.2deg)}50%{transform:translateY(-8px) rotate(1.2deg)}}
.board{position:relative;height:80vh;height:80svh;aspect-ratio:3/10;max-width:80vw;
  transform-style:preserve-3d;will-change:transform}
.face{position:absolute;inset:0;-webkit-backface-visibility:hidden;backface-visibility:hidden}
.face svg{display:block;width:100%;height:100%}
.bottom{transform:translateZ(.5px)}
.grip{transform:rotateY(180deg) translateZ(.5px)}
${linkCss}
.grip a:focus-visible,.hint:focus-visible{outline:3px solid #e8662e;outline-offset:3px}
.hint{margin:6px 0 calc(16px + env(safe-area-inset-bottom));min-height:44px;padding:10px 20px;
  background:transparent;color:#ece6d8;border:1.5px solid #ece6d8;border-radius:999px;
  font:700 13px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.hint .arrow{display:inline-block;animation:nudge 1.4s ease-in-out infinite}
@keyframes nudge{50%{transform:translateY(-4px)}}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){.bob,.hint .arrow{animation:none}}
</style>
</head>
<body>
<main class="stage" id="stage">
  <h1 class="sr">Marty Fisher</h1>
  <div class="bob">
    <div class="board" id="board">
      <div class="face bottom" id="bottom">${bottomSvg}</div>
      <div class="face grip" id="grip" inert aria-hidden="true">${gripSvg}
        ${anchors}
      </div>
    </div>
  </div>
</main>
<button class="hint" id="flip" type="button"><span class="arrow" aria-hidden="true">↑</span> <span id="flipLabel">Swipe up to flip</span></button>
<script>
(() => {
  const stage = document.getElementById('stage');
  const board = document.getElementById('board');
  const bottom = document.getElementById('bottom');
  const grip = document.getElementById('grip');
  const btn = document.getElementById('flip');
  const label = document.getElementById('flipLabel');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let showingGrip = false, busy = false, angle = 0;

  function syncFaces() {
    grip.inert = !showingGrip; grip.setAttribute('aria-hidden', String(!showingGrip));
    bottom.inert = showingGrip; bottom.setAttribute('aria-hidden', String(showingGrip));
    label.textContent = showingGrip ? 'Swipe up to flip back' : 'Swipe up to flip';
  }
  function finish(next) {
    angle %= 360;
    board.style.transform = 'rotateY(' + angle + 'deg)';
    showingGrip = next; busy = false; syncFaces();
  }
  function flip() {
    if (busy) return;
    busy = true;
    const next = !showingGrip;
    if (reduce.matches) {
      // Reduced motion: a quick fade instead of the kickflip.
      board.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-in' }).onfinish = () => {
        angle += 180;
        board.style.transform = 'rotateY(' + angle + 'deg)';
        board.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' }).onfinish = () => finish(next);
      };
      return;
    }
    // Kickflip: pop up, one and a half turns around the long axis, land on the other side.
    const from = angle, to = angle + 540;
    angle = to;
    board.style.transform = 'rotateY(' + to + 'deg)';
    board.animate([
      { transform: 'translateY(0) rotateY(' + from + 'deg) scale(1)' },
      { transform: 'translateY(-16%) rotateY(' + (from + 250) + 'deg) scale(.92)', offset: 0.45 },
      { transform: 'translateY(0) rotateY(' + to + 'deg) scale(1)' }
    ], { duration: 720, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => finish(next);
  }

  // Swipe up or tap anywhere on the stage flips; links on the grip keep working.
  let sx = 0, sy = 0, st = 0, tracking = false;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a')) return;
    tracking = true; sx = e.clientX; sy = e.clientY; st = performance.now();
  });
  stage.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    const tap = Math.hypot(dx, dy) < 10 && performance.now() - st < 400;
    if ((dy < -40 && Math.abs(dy) > Math.abs(dx)) || tap) flip();
  });
  stage.addEventListener('pointercancel', () => { tracking = false; });
  btn.addEventListener('click', flip);
  // Keep the page from scrolling or rubber-banding under the gesture.
  document.addEventListener('touchmove', (e) => { if (!e.target.closest('a')) e.preventDefault(); }, { passive: false });
  syncFaces();
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`wrote index.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
