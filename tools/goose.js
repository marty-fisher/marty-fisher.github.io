// Goose pro-model drafts: shared drawing code.
// Goose artwork is authored in "goose space" (roughly x 40-260, y 140-810).
// Deck geometry is an 8.5" x 32" popsicle at 30 units per inch:
//   nose 6.925", 2.125" bolt pattern, 14.25" wheelbase, 2.125", tail 6.625".
//   Bolt holes: 1.625" across the width, 2.125" along the length.

const BODY = 'M80,700 C60,640 70,560 110,510 C140,475 180,480 195,520 C210,565 205,640 180,700 C160,745 100,750 80,700 Z';
const DECK = 'M22.5,125 C22.5,55 80,20 150,20 C220,20 277.5,55 277.5,125 V876 C277.5,946 220,981.5 150,981.5 C80,981.5 22.5,946 22.5,876 Z';
const BOLT_X = [125.6, 174.4];
const BOLT_Y = [227.75, 291.5, 719, 782.75];
// Midpoint between the two truck bolt clusters.
const TRUCK_MID_Y = (BOLT_Y[0] + BOLT_Y[1] + BOLT_Y[2] + BOLT_Y[3]) / 4;
const CHAIN = 'M117,408 C128,442 174,448 184,418';
const HONK_TILT = 'rotate(-10 150 500)';

function grad(id, x1, y1, x2, y2, stops) {
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` +
    stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('') +
    '</linearGradient>';
}

function inkFilter(id, seed) {
  return `<filter id="${id}" x="-8%" y="-3%" width="116%" height="106%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="n"/>` +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/></filter>';
}

// The goose, in goose space. `o` options:
//   ink, fill, acc (beak/feet), sw (stroke width), chain, pick, shades,
//   board, boardColor, front, honk, scars, beanie (color)
function goose(o, filterId) {
  const k = o.ink, f = o.fill, a = o.acc;
  const W = o.sw || 3.2, thin = +(W * 0.56).toFixed(2), heavy = +(W * 1.3).toFixed(2);
  let s = `<g filter="url(#${filterId})" stroke="${k}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round" fill="${f}">`;

  if (o.board) {
    s += `<rect x="206" y="470" width="30" height="330" rx="15" fill="${o.boardColor || '#74241f'}"/>` +
      '<rect x="199" y="522" width="44" height="8" rx="2" fill="#a8a8a8"/>' +
      '<rect x="199" y="742" width="44" height="8" rx="2" fill="#a8a8a8"/>' +
      [[199, 526], [243, 526], [199, 746], [243, 746]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#f3ead8"/>`).join('');
  }

  // Legs: normal (standing), bent (on a board), one (resting on one leg), none (sitting).
  const legs = o.sit ? 'none' : (o.legs || 'normal');
  if (legs === 'normal') {
    s += `<path d="M144,722 L156,722 L154,790 L146,790 Z" fill="${a}"/>` +
      `<path d="M140,796 L166,788 L174,800 L150,803 Z" fill="${a}"/>` +
      `<path d="M114,722 L126,722 L124,792 L116,792 Z" fill="${a}"/>`;
  } else if (legs === 'bent') {
    s += `<path d="M144,722 L156,722 L160,746 L154,768 L146,768 L150,746 Z" fill="${a}"/>` +
      `<path d="M140,774 L166,766 L174,778 L150,781 Z" fill="${a}"/>` +
      `<path d="M114,722 L126,722 L130,746 L124,766 L116,766 L120,746 Z" fill="${a}"/>`;
  } else if (legs === 'one') {
    s += `<path d="M128,722 L140,722 L138,792 L130,792 Z" fill="${a}"/>`;
  }

  // Tail feathers: pointing down when standing, back when sitting, one missing when scarred.
  let bd = o.sit
    ? '<path d="M86,690 L42,690 L72,702 L48,718 L92,710 Z"/>'
    : o.scars
      ? '<path d="M88,705 L52,748 L84,733 L96,742 L104,738 Z"/>'
      : '<path d="M88,705 L52,748 L84,733 L70,772 L104,738 Z"/>';

  // Sitting lowers the body; this fills the neck down into it.
  if (o.sit) s += '<path d="M140,500 C144,540 150,570 150,604 L190,606 C194,570 196,540 196,516 Z"/>';

  // Body with a doubled sketch line, folded wing.
  bd += `<path d="${BODY}"/>` +
    `<path d="${BODY}" transform="translate(1.5,-2)" fill="none" stroke-width="${+(W * 0.38).toFixed(2)}" stroke-opacity=".5"/>` +
    '<path d="M95,560 C120,530 170,540 180,590 C188,640 170,690 140,715 L132,700 L120,712 L114,694 L100,700 C88,660 84,600 95,560 Z"/>' +
    `<path d="M108,590 C125,575 150,580 162,605 M104,620 C122,605 150,612 160,640 M106,652 C120,640 142,648 150,672" fill="none" stroke-width="${thin}"/>`;

  if (o.scars) {
    bd += `<path d="M112,626 L150,641" fill="none" stroke-width="${thin}"/>` +
      `<path d="M119,619 l-3,11 M129,623 l-3,11 M139,627 l-3,11 M147,631 l-3,11" fill="none" stroke-width="${thin}"/>`;
  }
  bd += `<path d="M170,600 l-8,8 M176,622 l-8,8 M178,644 l-8,8" fill="none" stroke-width="${thin}"/>`;
  s += o.sit ? `<g transform="translate(0,60)">${bd}</g>` : bd;

  // Neck and head.
  let h = '';
  if (o.front) {
    h += '<path d="M128,505 C120,440 118,380 124,320 C128,290 134,262 138,240 L164,240 C168,262 174,290 178,320 C184,380 184,440 194,515 Z"/>' +
      '<ellipse cx="151" cy="222" rx="30" ry="33"/>' +
      `<path d="M137,234 C140,224 162,224 165,234 C167,248 158,260 151,264 C144,260 135,248 137,234 Z" fill="${a}"/>` +
      `<circle cx="146" cy="238" r="1.4" fill="${k}" stroke="none"/><circle cx="156" cy="238" r="1.4" fill="${k}" stroke="none"/>` +
      '<circle cx="137" cy="214" r="4.4"/><circle cx="165" cy="214" r="4.4"/>' +
      `<circle cx="137.5" cy="215.5" r="1.8" fill="${k}" stroke="none"/><circle cx="165.5" cy="215.5" r="1.8" fill="${k}" stroke="none"/>` +
      `<path d="M131,211 L143,211 M159,211 L171,211" fill="none" stroke-width="${heavy}"/>`;
    if (o.pick) h += `<path d="M157,257 L171,282" fill="none" stroke="#b08a4e" stroke-width="${+(W * 0.75).toFixed(2)}"/>`;
  } else {
    h += '<path d="M140,505 C118,440 108,380 122,320 C132,280 126,258 118,240 C112,214 124,192 150,190 C176,190 190,204 192,218 C192,236 180,250 178,262 C174,300 168,380 178,440 C184,475 192,500 196,522 Z"/>';
    if (o.honk) {
      h += '<path d="M190,216 L230,196 L228,238 L190,226 Z" fill="#5a1a14"/>' +
        `<path d="M188,206 C205,198 220,190 234,184 C222,200 206,210 190,216 Z" fill="${a}"/>` +
        `<path d="M190,226 C206,228 220,234 232,244 C214,240 200,236 190,234 Z" fill="${a}"/>` +
        `<path d="M242,198 q10,14 0,30 M254,188 q14,20 0,50" fill="none" stroke-width="${thin}"/>`;
    } else {
      h += `<path d="M188,206 C205,208 220,214 230,222 C216,228 200,230 188,230 Z" fill="${a}"/>` +
        `<path d="M191,222 L226,222" fill="none" stroke-width="${thin}"/>`;
      if (o.pick) h += `<path d="M210,229 L226,250" fill="none" stroke="#b08a4e" stroke-width="${+(W * 0.75).toFixed(2)}"/>`;
    }
    if (o.shades) {
      h += `<path d="M152,203 L184,205 C184,212 180,218 172,218 C164,218 156,214 154,209 Z" fill="${k}"/>` +
        `<path d="M152,204 L126,210" fill="none" stroke-width="${+(W * 0.8).toFixed(2)}"/>` +
        '<path d="M169,207 L178,208" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="1.6"/>';
    } else if (o.honk) {
      h += `<circle cx="165" cy="210" r="5.6"/><circle cx="166" cy="210" r="2.4" fill="${k}" stroke="none"/>`;
    } else {
      h += `<circle cx="165" cy="210" r="4.8"/><circle cx="167" cy="212" r="2" fill="${k}" stroke="none"/>` +
        `<path d="M158,207 L175,206" fill="none" stroke-width="${heavy}"/>`;
    }
  }
  h += `<path d="M128,300 l8,-5 M130,330 l8,-5 M132,360 l8,-5" fill="none" stroke-width="${thin}"/>`;

  if (o.scars) {
    const [bx, by] = o.front ? [168, 198] : [136, 204];
    h += `<g transform="translate(${bx},${by})"><rect x="-12" y="-4" width="24" height="8" rx="3" fill="#f0d5b0" transform="rotate(35)"/>` +
      `<rect x="-12" y="-4" width="24" height="8" rx="3" fill="#f0d5b0" transform="rotate(-35)"/></g>`;
  }
  if (o.beanie && !o.front) {
    h += `<path d="M118,196 C114,160 140,146 158,146 C180,146 196,162 192,192 Z" fill="${o.beanie}"/>` +
      `<path d="M114,198 C142,186 172,184 196,192 L195,201 C170,193 142,195 115,206 Z" fill="${o.beanie}"/>` +
      `<path d="M126,196 l0,7 M138,192 l0,7 M150,189 l0,7 M162,188 l0,7 M174,188 l0,7 M186,190 l0,7" fill="none" stroke-width="${+(W * 0.44).toFixed(2)}"/>` +
      `<circle cx="156" cy="142" r="8" fill="${o.beanie}"/>`;
  }
  s += o.honk ? `<g transform="${HONK_TILT}">${h}</g>` : h;

  // Wing resting on the board, near foot.
  if (o.board) s += '<path d="M168,592 C186,556 204,522 218,494 L234,500 C222,532 204,568 186,606 Z"/>';
  if (legs === 'normal') s += `<path d="M100,794 L128,784 L140,798 L116,802 Z" fill="${a}"/>`;
  else if (legs === 'bent') s += `<path d="M100,772 L128,762 L140,776 L116,780 Z" fill="${a}"/>`;
  else if (legs === 'one') {
    s += `<path d="M112,796 L138,788 L150,800 L126,803 Z" fill="${a}"/>` +
      `<path d="M146,744 L166,736 L168,746 Z" fill="${a}"/>`;
  } else s += `<path d="M168,800 L194,794 L192,806 L166,806 Z" fill="${a}"/>`;
  s += '</g>';

  if (o.chain) {
    let c = `<g stroke-linecap="round"><path d="${CHAIN}" fill="none" stroke="${k}" stroke-width="${+(W * 2).toFixed(2)}"/>` +
      `<path d="${CHAIN}" fill="none" stroke="#d4a82a" stroke-width="${+(W * 1.12).toFixed(2)}" stroke-dasharray="1 5.5"/>` +
      `<rect x="144" y="440" width="11" height="26" rx="5.5" fill="#d4a82a" stroke="${k}" stroke-width="2"/></g>`;
    if (o.honk) c = `<g transform="${HONK_TILT}">${c}</g>`;
    s += c;
  }
  return s;
}

// A full deck bottom. `p` is a unique id prefix inside a combined sheet.
function deck(o, p, attrs = '') {
  const sh = '#000', hl = '#fff';
  const kick = [[0, sh, 0.36], [0.55, sh, 0.14], [1, sh, 0]];
  const sheen = [[0, hl, 0], [0.5, hl, 0.3], [1, hl, 0]];
  const G = 0.665; // goose scale: fits inside the wheelbase with clearance
  let s = `<svg viewBox="0 0 300 1000" ${attrs}>` +
    '<defs>' + inkFilter(`${p}ink`, 11) +
    `<clipPath id="${p}clip"><path d="${DECK}"/></clipPath>` +
    grad(`${p}nose`, 0, 20, 0, 205, kick) + grad(`${p}tail`, 0, 981.5, 0, 810, kick) +
    grad(`${p}rail`, 22.5, 0, 277.5, 0, [[0, sh, 0.18], [0.14, sh, 0], [0.86, sh, 0], [1, sh, 0.18]]) +
    grad(`${p}hn`, 0, 196, 0, 214, sheen) + grad(`${p}ht`, 0, 800, 0, 818, sheen) +
    '</defs>' +
    `<path d="${DECK}" fill="${o.deck}"/>`;
  if (o.sun) {
    s += `<circle cx="150" cy="470" r="82" fill="${o.sun}" stroke="${o.ink}" stroke-width="3"/>` +
      `<circle cx="150" cy="470" r="68" fill="none" stroke="${o.ink}" stroke-width="1.5" stroke-opacity=".5"/>`;
  }
  // Center the goose between the truck clusters, on the board's centerline.
  s += `<g transform="translate(150,${TRUCK_MID_Y}) scale(${G}) translate(-141,-498)">` +
    goose({ ...o, sw: 4.4 }, `${p}ink`) + '</g>';
  if (o.name) {
    const t = (y, w) => `<text x="150" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Menlo,ui-monospace,monospace" font-weight="700" font-size="20" letter-spacing="5" fill="${o.name}">${w}</text>`;
    s += t(110, 'MARTY') + t(895, 'FISHER');
  }
  if (o.rail) {
    s += `<text x="52" y="${TRUCK_MID_Y}" transform="rotate(-90 52 ${TRUCK_MID_Y})" text-anchor="middle" dominant-baseline="middle" font-family="Anton,Impact,'Arial Black',sans-serif" font-size="34" letter-spacing="6" fill="${o.ink}">MARTY FISHER</text>`;
  }
  s += `<g clip-path="url(#${p}clip)">` +
    `<rect x="0" y="0" width="300" height="205" fill="url(#${p}nose)"/>` +
    `<rect x="0" y="810" width="300" height="190" fill="url(#${p}tail)"/>` +
    `<rect x="0" y="0" width="300" height="1000" fill="url(#${p}rail)"/>` +
    `<rect x="0" y="196" width="300" height="18" fill="url(#${p}hn)"/>` +
    `<rect x="0" y="800" width="300" height="18" fill="url(#${p}ht)"/></g>`;
  for (const y of BOLT_Y) for (const x of BOLT_X) {
    s += `<circle cx="${x}" cy="${y}" r="4.2" fill="#050505" stroke="#ffffff" stroke-opacity=".3" stroke-width="1"/>`;
  }
  s += `<path d="${DECK}" fill="none" stroke="#0d0d0d" stroke-width="2.5"/></svg>`;
  return s;
}

// A goose-only character tile on a maple swatch.
function tile(o, p, attrs = '') {
  return `<svg viewBox="30 110 240 720" ${attrs}><defs>${inkFilter(`${p}ink`, 11)}</defs>` +
    '<rect x="30" y="110" width="240" height="720" fill="#e6d2a6"/>' +
    '<ellipse cx="135" cy="806" rx="62" ry="6" fill="#000" fill-opacity=".15"/>' +
    goose(o, `${p}ink`) + '</svg>';
}

// Front-facing goose (body turned to the viewer). o.wings: 'crossed' | 'spread'.
function gooseFront(o, filterId) {
  const k = o.ink, f = o.fill, a = o.acc;
  const W = o.sw || 3.2, thin = +(W * 0.56).toFixed(2), heavy = +(W * 1.3).toFixed(2);
  const FB = 'M150,500 C200,500 222,560 222,630 C222,700 190,745 150,745 C110,745 78,700 78,630 C78,560 100,500 150,500 Z';
  let s = `<g filter="url(#${filterId})" stroke="${k}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round" fill="${f}">`;
  // Legs and front-view webbed feet.
  s += `<path d="M124,735 L136,735 L135,792 L126,792 Z" fill="${a}"/><path d="M164,735 L176,735 L174,792 L165,792 Z" fill="${a}"/>` +
    `<path d="M112,804 L130,788 L148,804 Q130,811 112,804 Z" fill="${a}"/><path d="M152,804 L170,788 L188,804 Q170,811 152,804 Z" fill="${a}"/>`;
  if (o.wings === 'spread') {
    s += '<path d="M100,560 C80,530 60,490 44,446 L58,462 L56,436 L70,458 L76,432 L86,460 L96,440 L100,472 C108,500 116,530 118,556 Z"/>' +
      '<path d="M200,560 C220,530 240,490 256,446 L242,462 L244,436 L230,458 L224,432 L214,460 L204,440 L200,472 C192,500 184,530 182,556 Z"/>';
  }
  // Neck and front-view head.
  s += '<path d="M128,505 C120,440 118,380 124,320 C128,290 134,262 138,240 L164,240 C168,262 174,290 178,320 C184,380 184,440 194,515 Z"/>' +
    '<ellipse cx="151" cy="222" rx="30" ry="33"/>' +
    `<path d="M137,234 C140,224 162,224 165,234 C167,248 158,260 151,264 C144,260 135,248 137,234 Z" fill="${a}"/>` +
    `<circle cx="146" cy="238" r="1.4" fill="${k}" stroke="none"/><circle cx="156" cy="238" r="1.4" fill="${k}" stroke="none"/>`;
  if (o.shades) {
    s += `<path d="M125,206 L149,206 L147,221 C140,224 130,223 127,219 Z M153,206 L177,206 L175,219 C172,223 162,224 155,221 Z" fill="${k}"/>` +
      `<path d="M149,209 L153,209" fill="none" stroke-width="${thin}"/>` +
      '<path d="M131,210 L138,210 M159,210 L166,210" fill="none" stroke="#ffffff" stroke-opacity=".85" stroke-width="1.6"/>';
  } else {
    s += '<circle cx="137" cy="214" r="4.4"/><circle cx="165" cy="214" r="4.4"/>' +
      `<circle cx="137.5" cy="215.5" r="1.8" fill="${k}" stroke="none"/><circle cx="165.5" cy="215.5" r="1.8" fill="${k}" stroke="none"/>` +
      `<path d="M131,211 L143,211 M159,211 L171,211" fill="none" stroke-width="${heavy}"/>`;
  }
  s += `<path d="${FB}"/><path d="${FB}" transform="translate(1.5,-2)" fill="none" stroke-width="${+(W * 0.38).toFixed(2)}" stroke-opacity=".5"/>` +
    `<path d="M118,700 l8,-8 M134,712 l8,-8 M150,716 l8,-8 M166,712 l8,-8" fill="none" stroke-width="${thin}"/>`;
  if (o.wings === 'crossed') {
    s += '<path d="M86,570 C120,580 175,610 210,650 L200,660 L206,668 L192,672 L194,680 L178,676 C140,650 104,628 84,610 Z"/>' +
      `<path d="M104,598 C130,606 160,622 184,644" fill="none" stroke-width="${thin}"/>` +
      '<path d="M214,570 C180,580 125,610 90,650 L100,660 L94,668 L108,672 L106,680 L122,676 C160,650 196,628 216,610 Z"/>' +
      `<path d="M196,598 C170,606 140,622 116,644" fill="none" stroke-width="${thin}"/>`;
  }
  if (o.pick) s += `<path d="M157,257 L171,282" fill="none" stroke="#b08a4e" stroke-width="${+(W * 0.75).toFixed(2)}"/>`;
  s += `<path d="M128,300 l8,-5 M130,330 l8,-5 M132,360 l8,-5" fill="none" stroke-width="${thin}"/></g>`;
  if (o.chain) {
    s += `<g stroke-linecap="round"><path d="${CHAIN}" fill="none" stroke="${k}" stroke-width="${+(W * 2).toFixed(2)}"/>` +
      `<path d="${CHAIN}" fill="none" stroke="#d4a82a" stroke-width="${+(W * 1.12).toFixed(2)}" stroke-dasharray="1 5.5"/>` +
      `<rect x="144" y="440" width="11" height="26" rx="5.5" fill="#d4a82a" stroke="${k}" stroke-width="2"/></g>`;
  }
  return s;
}

// A skateboard seen from the side, top surface at y=780.
function sideBoard(o, filterId) {
  const k = o.ink;
  return `<g filter="url(#${filterId})" stroke="${k}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">` +
    `<path d="M40,778 Q50,768 62,780 L218,780 Q230,768 242,778 L240,784 Q230,778 218,788 L62,788 Q50,778 42,786 Z" fill="${o.boardColor || '#74241f'}"/>` +
    '<path d="M70,788 L94,788 L89,797 L75,797 Z M190,788 L214,788 L209,797 L195,797 Z" fill="#a8a8a8"/>' +
    '<circle cx="82" cy="803" r="8" fill="#f3ead8"/><circle cx="202" cy="803" r="8" fill="#f3ead8"/></g>';
}

// A goose tile with room for airborne and wide poses.
function poseTile(o, p, attrs = '') {
  const fid = `${p}ink`;
  const shadow = (cy, rx, op) => `<ellipse cx="140" cy="${cy}" rx="${rx}" ry="6" fill="#000" fill-opacity="${op}"/>`;
  let s = `<svg viewBox="20 60 260 770" ${attrs}><defs>${inkFilter(fid, 11)}</defs>` +
    '<rect x="20" y="60" width="260" height="770" fill="#e6d2a6"/>';
  if (o.frontBody) {
    s += shadow(808, 70, 0.15) + gooseFront(o, fid);
  } else if (o.cruise) {
    s += shadow(814, 95, 0.15) + sideBoard(o, fid) + `<g transform="rotate(3 130 780)">${goose(o, fid)}</g>`;
  } else if (o.ollie) {
    s += shadow(814, 55, 0.1) +
      `<path d="M70,740 l0,34 M110,752 l0,26 M170,752 l0,26 M210,740 l0,34" fill="none" stroke="${o.ink}" stroke-width="2" stroke-linecap="round" stroke-opacity=".6"/>` +
      `<g transform="translate(0,-100)"><g transform="rotate(-10 140 784)">${sideBoard(o, fid)}</g>${goose(o, fid)}</g>`;
  } else {
    s += shadow(806, 62, 0.15) + goose(o, fid);
  }
  return s + '</svg>';
}

// Where the link buttons sit on the grip, in deck units (300 x 1000). The page overlays real <a> tags here.
const LINK_BOX = { x: 60, y: 612, step: 50, w: 180, h: 40 };

// Grip-tape side (the side that lands up after the flip). `info` holds the page copy.
// Real-deck details: the grip is trimmed just inside the edge so a sliver of the top ply shows,
// the file leaves a lighter worn line along the grip edge, relief cuts sit at the kick bends,
// one colored bolt marks the nose, and the grip wears where feet drag.
function grip(info, p, attrs = '') {
  const t = (x, y, size, txt, extra = '') =>
    `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="#ece6d8" font-size="${size}" ${extra}>${txt}</text>`;
  const IMPACT = `font-family="Anton,Impact,'Arial Black',sans-serif"`, MONO = 'font-family="Menlo,ui-monospace,monospace"';
  const hl = '#fff', kick = [[0, hl, 0.16], [0.6, hl, 0.05], [1, hl, 0]];
  const INSET = 'translate(150,500.75) scale(0.9804,0.9948) translate(-150,-500.75)';
  const WOOD = '#d6b57e';
  let s = `<svg viewBox="0 0 300 1000" ${attrs}><defs>` +
    `<clipPath id="${p}clip"><path d="${DECK}" transform="${INSET}"/></clipPath>` +
    `<filter id="${p}grit" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="4"/>` +
    '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 9 -5.2"/></filter>' +
    `<filter id="${p}scratch" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="1" seed="9" result="n"/>` +
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>' +
    grad(`${p}nose`, 0, 20, 0, 205, kick) + grad(`${p}tail`, 0, 981.5, 0, 810, kick) +
    grad(`${p}rail`, 22.5, 0, 277.5, 0, [[0, '#000', 0.35], [0.12, '#000', 0], [0.88, '#000', 0], [1, '#000', 0.35]]) +
    '</defs>' +
    // Top ply showing around the edge, then the grip sheet trimmed just inside it.
    `<path d="${DECK}" fill="${WOOD}"/>` +
    `<path d="${DECK}" transform="${INSET}" fill="#161616"/>` +
    `<g clip-path="url(#${p}clip)"><rect width="300" height="1000" fill="#ffffff" opacity=".22" filter="url(#${p}grit)"/>` +
    `<rect width="300" height="205" fill="url(#${p}nose)"/><rect y="810" width="300" height="190" fill="url(#${p}tail)"/>` +
    `<rect width="300" height="1000" fill="url(#${p}rail)"/>` +
    // Wear: front-foot drag on the nose, pop wear on the tail.
    '<ellipse cx="66" cy="168" rx="22" ry="42" transform="rotate(-10 66 168)" fill="#ffffff" opacity=".04"/>' +
    '<ellipse cx="150" cy="958" rx="74" ry="20" fill="#ffffff" opacity=".05"/></g>' +
    // Filed edge: the lighter worn line the file leaves along the grip edge.
    `<path d="${DECK}" transform="${INSET}" fill="none" stroke="#9c9c9c" stroke-width="1.2" stroke-opacity=".8" filter="url(#${p}scratch)"/>` +
    // Relief cuts at the kick bends.
    '<path d="M24.5,205 L34,205 M275.5,205 L266,205 M24.5,810 L34,810 M275.5,810 L266,810" stroke="#9c9c9c" stroke-width="1.2"/>' +
    // A few chips in the tail edge.
    `<g fill="${WOOD}"><circle cx="128" cy="979" r="2.6"/><circle cx="161" cy="979.4" r="2"/><circle cx="178" cy="978.6" r="2.4"/></g>`;

  // "Silly goose" sticker slapped on the nose.
  s += '<g transform="translate(150,112) rotate(-8)"><rect x="-84" y="-20" width="168" height="40" rx="10" fill="#e8662e" stroke="#1a1a1a" stroke-width="3"/>' +
    `<text x="0" y="1" text-anchor="middle" dominant-baseline="middle" ${IMPACT} font-size="19" letter-spacing="1.5" fill="#1a1a1a">SILLY GOOSE</text></g>`;

  // Copy, "scratched" into the grip between the trucks.
  s += `<g filter="url(#${p}scratch)">` +
    t(150, 358, 48, 'MARTY', `${IMPACT} letter-spacing="3"`) +
    t(150, 408, 48, 'FISHER', `${IMPACT} letter-spacing="3"`) +
    t(150, 448, 11.5, info.tagline, MONO) +
    t(150, 498, 36, info.stats[0].value, IMPACT) + t(150, 523, 11, info.stats[0].label, MONO) +
    t(150, 563, 36, info.stats[1].value, IMPACT) + t(150, 588, 11, info.stats[1].label, MONO) +
    '</g>';
  // Link buttons (become real links on the page).
  info.links.forEach((l, i) => {
    const y = LINK_BOX.y + i * LINK_BOX.step;
    s += `<rect x="${LINK_BOX.x}" y="${y}" width="${LINK_BOX.w}" height="${LINK_BOX.h}" rx="${LINK_BOX.h / 2}" fill="none" stroke="#ece6d8" stroke-width="2"/>` +
      t(150, y + LINK_BOX.h / 2 + 1, 14, l.label, `${MONO} font-weight="700" letter-spacing="2"`);
  });

  // Bolt heads; the orange one marks the nose.
  for (const y of BOLT_Y) for (const x of BOLT_X) {
    const nose = x === BOLT_X[1] && y === BOLT_Y[0];
    s += `<circle cx="${x}" cy="${y}" r="5.5" fill="${nose ? '#e8662e' : '#b9b9b9'}" stroke="#4a4a4a" stroke-width="1.2"/>` +
      `<path d="M${x - 2.6},${y} h5.2 M${x},${y - 2.6} v5.2" stroke="#4a4a4a" stroke-width="1.2"/>`;
  }
  return s + `<path d="${DECK}" fill="none" stroke="#0d0d0d" stroke-width="2"/></svg>`;
}

const PICK = { slug: 'shades-raw-maple', n: 'Shades on raw maple', ink: '#1a1a1a', fill: '#fbf8f1', acc: '#e8662e', deck: '#e6d2a6', name: '#1a1a1a', chain: 1, pick: 1, shades: 1 };

const BASE = { ink: '#1a1a1a', fill: '#fbf8f1', acc: '#e8662e' };

const POSES = [
  { slug: 'cruising', n: 'Cruising', ...BASE, legs: 'bent', cruise: 1, chain: 1, pick: 1 },
  { slug: 'ollie', n: 'Ollie', ...BASE, legs: 'bent', ollie: 1, chain: 1 },
  { slug: 'one-leg', n: 'One-leg chill', ...BASE, legs: 'one', chain: 1, pick: 1 },
  { slug: 'sitting', n: 'Sitting', ...BASE, sit: 1, chain: 1, pick: 1 },
  { slug: 'wings-crossed', n: 'Wings crossed', ...BASE, frontBody: 1, wings: 'crossed', chain: 1, pick: 1 },
  { slug: 'wings-spread', n: 'Wings spread', ...BASE, frontBody: 1, wings: 'spread', chain: 1, shades: 1 },
];

const DECKS = [
  { slug: 'raw-maple', n: 'Raw maple', ...BASE, deck: '#e6d2a6', name: '#1a1a1a', chain: 1, pick: 1 },
  { slug: 'oxblood', n: 'Oxblood stain', ink: '#140d0c', fill: '#f3ead8', acc: '#f0a23a', deck: '#74241f', name: '#f3ead8', chain: 1, pick: 1 },
  { slug: 'blackout', n: 'Blackout', ink: '#f1ece0', fill: '#161616', acc: '#e8662e', deck: '#161616', name: '#f1ece0', chain: 1, pick: 1 },
  { slug: 'sun', n: 'Sun', ...BASE, deck: '#e6d2a6', name: '#1a1a1a', chain: 1, pick: 1, sun: '#d9482b' },
  { slug: 'beanie', n: 'Beanie', ink: '#141a19', fill: '#f3ead8', acc: '#e8662e', deck: '#2f6b66', name: '#f3ead8', pick: 1, beanie: '#e8662e' },
  { slug: 'rail-name', n: 'Rail name', ...BASE, deck: '#d8a531', name: null, chain: 1, rail: 1 },
];

const GEESE = [
  { slug: 'og', n: 'OG', ...BASE, chain: 1, pick: 1 },
  { slug: 'shades', n: 'Shades', ...BASE, chain: 1, pick: 1, shades: 1 },
  { slug: 'leaning', n: 'Leaning', ...BASE, chain: 1, pick: 1, board: 1 },
  { slug: 'deadpan', n: 'Deadpan', ...BASE, chain: 1, pick: 1, front: 1 },
  { slug: 'honk', n: 'Honk', ...BASE, chain: 1, honk: 1 },
  { slug: 'battle-scarred', n: 'Battle-scarred', ...BASE, chain: 1, pick: 1, scars: 1 },
];

if (typeof module !== 'undefined') module.exports = { deck, tile, poseTile, grip, DECKS, GEESE, POSES, PICK, LINK_BOX, TRUCK_MID_Y };
