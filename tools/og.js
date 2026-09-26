// Writes og.svg (the link-preview card) next to itself; render it to ../og.png with
//   node tools/og.js && rsvg-convert tools/og.svg -o og.png
const fs = require('fs');
const path = require('path');
const { deck, grip, PICK } = require('./goose.js');

const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'site.config.json'), 'utf8'));
const info = { tagline: cfg.tagline, stats: cfg.stats, links: cfg.links.map((l) => ({ label: l.label })) };
const W = 1200, H = 630, dh = 560, dw = dh * 0.3;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
  `<rect width="${W}" height="${H}" fill="#111111"/>` +
  `<g transform="rotate(-6 ${150 + dw / 2} ${H / 2})">${deck(PICK, 'b', `x="150" y="${(H - dh) / 2}" width="${dw}" height="${dh}"`)}</g>` +
  `<g transform="rotate(6 ${380 + dw / 2} ${H / 2})">${grip(info, 'g', `x="380" y="${(H - dh) / 2}" width="${dw}" height="${dh}"`)}</g>` +
  `<text x="660" y="290" font-family="Anton,'Arial Black',sans-serif" font-size="86" fill="#ece6d8" letter-spacing="3">MARTY</text>` +
  `<text x="660" y="390" font-family="Anton,'Arial Black',sans-serif" font-size="86" fill="#ece6d8" letter-spacing="3">FISHER</text>` +
  `<text x="662" y="440" font-family="Menlo,monospace" font-size="22" fill="#ece6d8" fill-opacity=".8">${cfg.tagline}</text>` +
  '</svg>';
fs.writeFileSync(path.join(__dirname, 'og.svg'), svg);
console.log('wrote tools/og.svg');
