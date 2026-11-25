// Sakuga dashboard kit: the card look, a jelly spring and a few effect combos shared by every dashboard component.
// Each dash/*.js file carries a copy of this between its kit markers. Edit this file, then run `node tools/build.mjs`.
const { Spring, clamp, lerp, rnd, at, esc, TAU } = fx;
const F = '"Avenir Next","Nunito",-apple-system,"Segoe UI",system-ui,sans-serif', COMIC = '"Marker Felt","Chalkboard SE","Comic Sans MS",-apple-system,"Segoe UI",sans-serif';
const KIT = `
.card{position:relative;background:var(--sk-card);border:var(--sk-bw) solid var(--sk-ink);border-radius:var(--sk-r);box-shadow:var(--sk-sh);padding:14px 16px;will-change:transform}
.lbl{font:700 12.5px/1.25 ${F};color:var(--sk-dim)}
.big{font:italic 900 34px/1 ${F};letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.comic{font:italic 900 15px/1.15 ${COMIC}}
.chip{display:inline-block;padding:2px 10px 3px;border:2.5px solid var(--sk-ink);background:var(--sk-card);box-shadow:3px 3px 0 var(--sk-fill);transform:skewX(-10deg);font:italic 900 13px/1.2 ${COMIC};white-space:nowrap}
.chip.up{box-shadow:3px 3px 0 #59d9a4}.chip.down{box-shadow:3px 3px 0 var(--sk-acc)}
.pbtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:7px 14px;border:2.6px solid var(--sk-ink);border-radius:11px;background:var(--sk-card);box-shadow:3px 4px 0 var(--sk-soft);font:italic 800 14px/1.1 ${F};cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none;will-change:transform}
.pbtn.on,.pbtn[aria-pressed=true],.pbtn[aria-selected=true]{background:var(--sk-pri);color:var(--sk-on-pri)}
.pbtn:disabled{opacity:.45;cursor:not-allowed}
.ib{display:inline-grid;place-items:center;flex:none;width:34px;height:34px;padding:0;border:2.6px solid var(--sk-ink);border-radius:50%;background:var(--sk-card);box-shadow:2px 3px 0 var(--sk-soft);cursor:pointer;font:900 15px/1 ${F};touch-action:manipulation;will-change:transform}
.field{width:100%;padding:9px 12px;border:2.6px solid var(--sk-ink);border-radius:11px;background:var(--sk-card);box-shadow:3px 4px 0 var(--sk-soft);outline:none;font:600 15px/1.3 ${F}}
.field:focus{box-shadow:3px 4px 0 var(--sk-acc)}
.row{display:flex;align-items:center;gap:8px}.col{display:flex;flex-direction:column;gap:8px}
svg{overflow:visible}ul{list-style:none;margin:0;padding:0}`;
const nums = (s, d) => String(s ?? d ?? '').split(',').map((x) => x.trim()).filter((x) => x !== '').map(Number);
const strs = (s, d) => String(s ?? d ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const fmt = (n, dec = 0) => (+n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const attr = (el, a, d) => (el.hasAttribute(a) ? el.getAttribute(a) : d);
// A jelly: squash on a spring. kick(sq) squashes it by sq (negative stretches), rot tips it in degrees, ty bumps it up or down.
class Jelly {
  constructor(el, k = 380, d = 12) { this.el = el; this.s = new Spring(1, k, d); this.r = new Spring(0, 240, 10); this.y = new Spring(0, 300, 15); }
  kick(sq = 0.25, rot = 0, ty = 0) { this.s.x = 1 - sq; this.s.v = 0; if (rot) this.r.x = rot; if (ty) this.y.x = ty; }
  step(dt) {
    const s = this.s.step(dt), r = this.r.step(dt), y = this.y.step(dt);
    const still = Math.abs(s - 1) < 0.001 && Math.abs(this.s.v) < 0.01 && Math.abs(r) < 0.02 && Math.abs(this.r.v) < 0.05 && Math.abs(y) < 0.05 && Math.abs(this.y.v) < 0.05;
    this.el.style.transform = still ? '' : `translateY(${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${(2 - s).toFixed(4)}, ${s.toFixed(4)})`;
  }
}
// a press on any element: squash while held, overshoot on release
const press = (el, low = 0.8) => fx.squashy(el, { low, wide: 0.45 });
// effect combos, all placed on an element
const pow = (el, { word, size = 96, dots, hollow, r, fy = 0.5, n = 7, wy } = {}) => {
  const c = at(el, 0.5, fy); fx.burst(c.x, c.y, { r: r ?? Math.min(64, Math.max(c.w, c.h) * 0.55), spikes: 13, life: 0.36 }); fx.shards(c.x, c.y, { n, speed: 220, size: 6, arc: TAU, grav: 380 });
  if (word) fx.sfx(word, c.x + 6, c.y - (wy ?? c.h / 2 + 34), { size, ...(dots ? fx.dotted() : hollow ? fx.hollow() : {}) });
};
const pops = (el, { fx: ux = 0.5, fy = 0, n = 3, r = 6, len = 14, dir = -Math.PI / 2 } = {}) => { const c = at(el, ux, fy); fx.ticks(c.x, c.y, { n, r, len, dir, fan: 0.5 }); };
const dust = (el, fy = 1, size = 8) => { const c = at(el, 0.5, fy); fx.puff(c.x - c.w * 0.32, c.y, { size, n: 4, vx: -26, vy: -8, life: 0.6 }); fx.puff(c.x + c.w * 0.32, c.y, { size, n: 4, vx: 26, vy: -8, life: 0.6 }); };
const glint = (el, ux = 0.85, uy = 0.1, r = 12) => { const c = at(el, ux, uy); fx.kira(c.x, c.y, { r, life: 0.7 }); };
const zoom = (el, dir = 0, n = 6) => { const c = at(el); fx.lines(c.x - Math.cos(dir) * c.w / 2, c.y - Math.sin(dir) * c.h / 2, { n, dir: dir + Math.PI, len: 40, spread: Math.min(c.h, 30) / 2, life: 0.3 }); };
const define = (tag, cls) => fx.define(tag, cls);
