// Sakuga Dashboard · Game: ten gamified bits for streaks, goals and celebrations, at full anime volume.
// <sakuga-xp> <sakuga-levelup> <sakuga-achievement> <sakuga-streak> <sakuga-combo> <sakuga-hp> <sakuga-loot> <sakuga-dice> <sakuga-wheel> <sakuga-confetti>
// One file, no dependencies.
(() => {
function component(fx) {
// >>> dash kit (copied from dash/kit.js by tools/build.mjs: edit dash/kit.js, not this block)
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
// <<< dash kit
const later = (ms, f) => fx.later(ms, f);

// ── XP bar: gain(n) pours experience in; overflowing rolls the level with a burst ──
class SakugaXp extends fx.Base {
  static css = KIT + `:host{display:block;width:var(--sk-xp-width,280px)}.hd{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px}.lv{display:inline-block;font:italic 900 22px ${COMIC};will-change:transform}.lv small{font-size:13px}.n{font:italic 800 12.5px ${F};color:var(--sk-dim)}.bar{position:relative;height:20px;border:3px solid var(--sk-ink);border-radius:11px;background:var(--sk-track);overflow:hidden;cursor:pointer}.bar i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--sk-pri),var(--sk-fill))}.bar b{position:absolute;inset:0 auto 0 0;background:#fff;opacity:.6}.bar::after{content:"";position:absolute;left:8px;right:8px;top:3px;height:4px;border-radius:2px;background:#ffffff70}`;
  render() { return `<div class="hd"><span class="lv">Lv <span></span></span><span class="n"></span></div><div class="bar" role="progressbar" aria-label="Experience" part="bar"><b></b><i></i></div>`; }
  setup() { this.lv = +attr(this, 'level', 7); this.need = +attr(this, 'max', 1000); this.xp = +attr(this, 'value', 620); this.s = new Spring(this.xp / this.need, 90, 14); this.ghost = this.s.x; this.j = new Jelly(this.$('.lv'), 480, 9); this.paint(); this.$('.bar').addEventListener('click', () => this.gain(rnd(80, 260) | 0)); }
  gain(n) { this.xp += n; const c = at(this.$('.bar'), clamp(this.xp / this.need), 0); fx.sfx('pon', c.x, c.y - 26, { size: 46 }); fx.ticks(c.x, c.y, { n: 2, r: 3, len: 9 }); this.ghost = Math.min(1, this.xp / this.need); if (this.xp >= this.need) { this.s.to = 1; this.roll = true; } else this.s.to = this.xp / this.need; this.paint(); this.emit('change', { xp: this.xp, level: this.lv }); }
  paint() { this.$('.lv span').textContent = this.lv; this.$('.n').textContent = `${fmt(Math.min(this.xp, this.need))} / ${fmt(this.need)} XP`; this.$('.bar').setAttribute('aria-valuenow', Math.round(this.xp / this.need * 100)); }
  frame(dt) { const k = this.s.step(dt); this.$('.bar i').style.width = clamp(k) * 100 + '%'; this.$('.bar b').style.width = this.ghost * 100 + '%'; this.j.step(dt); if (this.roll && k > 0.985) { this.roll = false; this.xp -= this.need; this.lv++; this.s.x = 0; this.s.to = this.xp / this.need; this.ghost = this.s.to; this.paint(); this.j.kick(-0.6, -10); pow(this.$('.lv'), { word: 'don', size: 110, r: 46, n: 9 }); this.emit('levelup', { level: this.lv }); } }
}
define('sakuga-xp', SakugaXp);

// ── Level up: a full splash moment: rays spin, the number punches in, LEVEL UP slams down ──
class SakugaLevelup extends fx.Base {
  static css = KIT + `:host{display:inline-block}.w{position:relative;display:grid;place-items:center;width:220px;height:170px;cursor:pointer}.ry{position:absolute;inset:-10px;background:repeating-conic-gradient(var(--sk-fill) 0 10deg,transparent 10deg 20deg);border-radius:50%;mask:radial-gradient(circle,#000 30%,transparent 70%);-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);opacity:var(--o,0);will-change:transform}.n{position:relative;display:grid;place-items:center;width:96px;height:96px;border:4px solid var(--sk-ink);border-radius:50%;background:var(--sk-pri);color:#fff;font:italic 900 44px ${F};text-shadow:3px 3px 0 var(--sk-ink);box-shadow:5px 6px 0 var(--sk-ink);will-change:transform}.t{position:absolute;bottom:4px;padding:3px 14px;border:3px solid var(--sk-ink);background:#ffe58a;font:italic 900 18px ${COMIC};transform:skewX(-10deg) scale(var(--ts,0));box-shadow:4px 4px 0 var(--sk-ink)}`;
  render() { return `<div class="w" part="levelup" role="button" tabindex="0" aria-label="Level up"><i class="ry"></i><span class="n"></span><span class="t">LEVEL UP!</span></div>`; }
  setup() { this.lv = +attr(this, 'level', 12); this.$('.n').textContent = this.lv; this.j = new Jelly(this.$('.n'), 420, 8); this.o = new Spring(0, 60, 9); this.ts = new Spring(0, 380, 10); this.rot = 0; const go = () => this.fire(); this.$('.w').addEventListener('click', go); this.$('.w').addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go())); if (this.hasAttribute('autoplay')) later(600, go); }
  fire(level) { this.lv = level ?? this.lv + 1; this.$('.n').textContent = this.lv; this.j.kick(0.9); this.o.x = 1.2; this.o.to = 0.35; this.ts.x = 0; this.ts.to = 0; later(220, () => { this.ts.to = 1; const c = at(this.$('.t')); fx.puff(c.x - 60, c.y, { size: 10, n: 4, vx: -30 }); fx.puff(c.x + 60, c.y, { size: 10, n: 4, vx: 30 }); }); const c = at(this.$('.n')); fx.burst(c.x, c.y, { r: 90, spikes: 17, life: 0.45 }); fx.shards(c.x, c.y, { n: 14, speed: 300, size: 8, arc: TAU }); fx.sfx('don', c.x + 70, c.y - 60, { size: 120 }); for (const a of [0.6, 2.2, 4]) later(300 + a * 60, () => fx.kira(c.x + Math.cos(a) * 80, c.y + Math.sin(a) * 60, { r: 14 })); this.emit('levelup', { level: this.lv }); }
  frame(dt) { this.j.step(dt); this.rot += dt * 40; const o = this.o.step(dt); this.$('.ry').style.setProperty('--o', clamp(o).toFixed(3)); this.$('.ry').style.transform = `rotate(${this.rot.toFixed(1)}deg) scale(${(0.8 + clamp(o) * 0.3).toFixed(3)})`; this.$('.t').style.setProperty('--ts', clamp(this.ts.step(dt), 0, 1.4).toFixed(3)); }
}
define('sakuga-levelup', SakugaLevelup);

// ── Achievement: a toast-like medal that spins in on its edge, then flashes; locked ones rattle ──
class SakugaAchievement extends fx.Base {
  static css = KIT + `:host{display:inline-block}.card{display:flex;align-items:center;gap:12px;width:270px;padding:10px 12px;cursor:pointer}.m{flex:none;display:grid;place-items:center;width:54px;height:54px;border:3.4px solid var(--sk-ink);border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b0,#ffc94d 60%);font-size:24px;box-shadow:inset -4px -5px 0 #e0a52a;will-change:transform}:host([locked]) .m{background:var(--sk-track);box-shadow:none;filter:grayscale(1)}.tt{font:italic 900 15px ${F}}.tx{font:600 12px ${F};color:var(--sk-dim)}.r{margin-top:3px}`;
  render() { return `<div class="card" part="card" role="status"><span class="m">${esc(attr(this, 'icon', '🏆'))}</span><div><div class="tt">${esc(attr(this, 'heading', 'First 1,000 users'))}</div><div class="tx">${esc(attr(this, 'text', 'Unlocked just now'))}</div><span class="chip r">${esc(attr(this, 'reward', '+250 XP'))}</span></div></div>`; }
  setup() { this.m = this.$('.m'); this.ry = new Spring(0, 140, 7); this.sh = new Spring(0, 1300, 8); this.$('.card').addEventListener('click', () => (this.hasAttribute('locked') ? this.rattle() : this.unlock())); if (!this.hasAttribute('locked')) later(300, () => this.unlock()); }
  rattle() { this.sh.x = 10; const c = at(this.m); fx.wob(c.x - 28, c.y, { dir: -1, r: 10 }); fx.wob(c.x + 28, c.y, { dir: 1, r: 10 }); }
  unlock() { this.removeAttribute('locked'); this.ry.x = 720; this.ry.to = 0; const c = at(this.m); later(350, () => { fx.burst(c.x, c.y, { r: 46, life: 0.32 }); fx.kira(c.x + 18, c.y - 18, { r: 14 }); fx.kira(c.x - 20, c.y + 14, { r: 9 }); fx.sfx('kachi', c.x + 70, c.y - 40, { size: 80, ...fx.hollow() }); }); this.emit('unlock'); }
  frame(dt) { const x = this.sh.step(dt); this.m.style.transform = `rotateY(${this.ry.step(dt).toFixed(1)}deg) translateX(${x.toFixed(1)}px) rotate(${(x * 2).toFixed(1)}deg)`; }
}
define('sakuga-achievement', SakugaAchievement);

// ── Streak: a flame that flickers (bigger the longer the streak); extend() makes it flare ──
class SakugaStreak extends fx.Base {
  static css = KIT + `:host{display:inline-block}.card{display:flex;align-items:center;gap:12px;cursor:pointer}canvas{width:60px;height:72px}.big{font-size:32px}.ds{display:flex;gap:4px;margin-top:5px}.ds i{width:14px;height:14px;border:2.2px solid var(--sk-ink);border-radius:4px;background:var(--sk-track)}.ds i.on{background:var(--sk-acc)}`;
  render() { return `<div class="card" part="card"><canvas width="120" height="144" aria-hidden="true"></canvas><div><div class="big"></div><div class="lbl">day streak</div><div class="ds">${'<i></i>'.repeat(7)}</div></div></div>`; }
  setup() { this.n = +attr(this, 'days', 6); this.t = 0; this.flare = new Spring(0, 120, 6); this.j = new Jelly(this.$('.big'), 500, 10); this.paint(); this.$('.card').addEventListener('click', () => this.extend()); }
  extend() { this.n++; this.paint(); this.flare.x = 1; this.j.kick(-0.5, -8); const c = at(this.$('canvas'), 0.5, 0.3); fx.ticks(c.x, c.y - 20, { n: 5, r: 10, len: 12, fan: 0.5 }); fx.shards(c.x, c.y, { n: 5, size: 4, speed: 160 }); if (this.n % 7 === 0) fx.sfx('don', c.x + 60, c.y - 30, { size: 100 }); this.emit('change', { days: this.n }); }
  paint() { this.$('.big').textContent = this.n; this.$$('.ds i').forEach((d, i) => d.classList.toggle('on', i < (this.n % 7 || 7))); }
  frame(dt) { this.t += dt; this.j.step(dt); const f = this.flare.step(dt), g = this.$('canvas').getContext('2d'), P = fx.P, s = clamp(0.6 + this.n * 0.03, 0.6, 1) + f * 0.25; g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, 60, 72); g.lineJoin = 'round';
    const flame = (sc, col, ph) => { const p = new Path2D(), w = 22 * sc, h = 56 * sc, by = 66, tip = Math.sin(this.t * 9 + ph) * 5 * sc; p.moveTo(30, by); p.bezierCurveTo(30 - w, by, 30 - w, by - h * 0.55, 30 - w * 0.35, by - h * 0.75); p.quadraticCurveTo(30 - w * 0.2 + tip * 0.3, by - h * 0.5, 30 + tip, by - h); p.quadraticCurveTo(30 + w * 0.5, by - h * 0.6, 30 + w * 0.55 + tip * 0.2, by - h * 0.62); p.bezierCurveTo(30 + w * 1.1, by - h * 0.35, 30 + w, by, 30, by); g.fillStyle = col; g.fill(p); return p; };
    const o = flame(s, P.accent, 0); g.lineWidth = 3.5; g.strokeStyle = P.line; g.stroke(o); flame(s * 0.62, '#ffc94d', 1.3); flame(s * 0.3, '#fff', 2.1); }
}
define('sakuga-streak', SakugaStreak);

// ── Combo counter: hit() raises the combo with growing lettering; stop hitting and it times out ──
class SakugaCombo extends fx.Base {
  static css = KIT + `:host{display:inline-block}.w{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:200px}.c{font:italic 900 52px/1 ${F};color:var(--sk-ink);-webkit-text-stroke:2px var(--sk-ink);text-shadow:4px 4px 0 var(--sk-fill);will-change:transform}.c small{font-size:20px;-webkit-text-stroke:0}.tm{width:160px;height:8px;border:2.2px solid var(--sk-ink);border-radius:5px;overflow:hidden;background:var(--sk-track)}.tm i{display:block;height:100%;background:var(--sk-acc)}.rk{font:italic 900 16px ${COMIC};min-height:20px}`;
  render() { return `<div class="w"><div class="c" aria-live="polite">0<small>×</small></div><div class="rk"></div><div class="tm"><i></i></div><button class="pbtn on">HIT!</button></div>`; }
  setup() { this.n = 0; this.left = 0; this.j = new Jelly(this.$('.c'), 600, 9); this.sq = press(this.$('.pbtn'), 0.7); this.$('.pbtn').addEventListener('click', () => this.hit()); }
  hit() { this.n++; this.left = 1.6; this.$('.c').innerHTML = `${this.n}<small>×</small>`; this.j.kick(-0.3 - Math.min(0.4, this.n * 0.02), rnd(-10, 10)); const c = at(this.$('.c')); fx.burst(c.x, c.y, { r: 30 + Math.min(50, this.n * 3), life: 0.26 }); fx.lines(c.x, c.y, { n: 3, dir: rnd(TAU), len: 40, spread: 30 }); const R = [[5, 'Nice!'], [10, 'Great!!'], [20, 'SAKUGA!!!'], [35, 'GODLIKE']]; const r = R.filter(([k]) => this.n >= k).pop(); if (r && r[0] === this.n) { this.$('.rk').textContent = r[1]; fx.sfx(this.n >= 20 ? 'don' : 'pon', c.x + 70, c.y - 40, { size: 70 + this.n * 2 }); } this.emit('change', { combo: this.n }); }
  frame(dt) { this.j.step(dt); this.sq.step(dt); if (this.left > 0) { this.left -= dt; if (this.left <= 0 && this.n) { const c = at(this.$('.c')); fx.puff(c.x, c.y, { size: 14, n: 6, life: 0.6 }); this.emit('drop', { combo: this.n }); this.n = 0; this.$('.c').innerHTML = '0<small>×</small>'; this.$('.rk').textContent = ''; this.j.kick(0.3); } } this.$('.tm i').style.width = clamp(this.left / 1.6) * 100 + '%'; }
}
define('sakuga-combo', SakugaCombo);

// ── HP bar: a boss health bar; damage(n) knocks it back with a white trail, a shake and the number flying off ──
class SakugaHp extends fx.Base {
  static css = KIT + `:host{display:block;width:var(--sk-hp-width,300px)}.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;font:italic 900 15px ${F}}.hd small{font:800 12px ${F};color:var(--sk-dim)}.bar{position:relative;height:24px;border:3.4px solid var(--sk-ink);border-radius:6px;background:var(--sk-ink);overflow:hidden;cursor:crosshair;transform:skewX(-14deg);will-change:transform}.bar i,.bar b{position:absolute;inset:0 auto 0 0}.bar b{background:#fff}.bar i{background:linear-gradient(#ff8fc4,var(--sk-acc) 55%,#d93b80)}.bar.lo i{animation:bl .4s steps(1) infinite}@keyframes bl{50%{filter:brightness(1.5)}}.dmg{position:fixed;z-index:2147483001;pointer-events:none;font:italic 900 26px ${F};color:#fff;-webkit-text-stroke:2px var(--sk-ink);will-change:transform}`;
  render() { return `<div class="hd">${esc(attr(this, 'name', 'Q4 Deadline'))}<small></small></div><div class="bar" part="bar" role="meter" aria-label="Health"><b></b><i></i></div>`; }
  setup() { this.max = +attr(this, 'max', 1000); this.hp = +attr(this, 'value', this.max); this.s = new Spring(this.hp, 300, 22); this.trail = this.hp; this.hold = 0; this.sh = new Spring(0, 1400, 9); this.nums = []; this.paint(); this.$('.bar').addEventListener('click', (e) => this.damage(rnd(40, 140) | 0, e)); }
  damage(n, e) { if (this.hp <= 0) { this.hp = this.max; this.s.to = this.trail = this.hp; this.paint(); return; } this.hp = Math.max(0, this.hp - n); this.s.to = this.hp; this.hold = 0.45; this.sh.x = 8; this.paint(); const b = this.$('.bar').getBoundingClientRect(), x = e?.clientX ?? b.left + b.width * this.hp / this.max, y = b.top; const d = document.createElement('span'); d.className = 'dmg'; d.textContent = '-' + n; d.style.left = x + 'px'; d.style.top = y + 'px'; this.root.append(d); this.nums.push({ d, t: 0, vx: rnd(-50, 50) }); fx.burst(x + scrollX, y + scrollY + 12, { r: 26, life: 0.24 }); fx.shards(x + scrollX, y + scrollY + 12, { n: 4, size: 4 }); if (this.hp === 0) { const c = at(this.$('.bar')); fx.sfx('don', c.x, c.y - 50, { size: 130 }); pow(this.$('.bar'), { r: 70, n: 14 }); this.emit('defeated'); } this.emit('change', { hp: this.hp }); }
  paint() { this.$('.hd small').textContent = `${fmt(this.hp)} / ${fmt(this.max)}`; this.$('.bar').classList.toggle('lo', this.hp / this.max < 0.25); this.$('.bar').setAttribute('aria-valuenow', this.hp); }
  frame(dt) { const k = this.s.step(dt); if ((this.hold -= dt) < 0) this.trail = lerp(this.trail, k, Math.min(1, dt * 5)); this.$('.bar i').style.width = (k / this.max * 100) + '%'; this.$('.bar b').style.width = (this.trail / this.max * 100) + '%'; const x = this.sh.step(dt); this.$('.bar').style.translate = Math.abs(x) > 0.05 ? `${x.toFixed(1)}px ${(x * 0.3).toFixed(1)}px` : ''; this.nums = this.nums.filter((o) => { o.t += dt; o.d.style.transform = `translate(${(o.vx * o.t).toFixed(1)}px, ${(-70 * o.t + 160 * o.t * o.t - 20).toFixed(1)}px) scale(${(1 + Math.max(0, 0.6 - o.t * 3)).toFixed(2)})`; o.d.style.opacity = clamp(1.4 - o.t * 1.6); if (o.t > 0.9) { o.d.remove(); return false; } return true; }); }
}
define('sakuga-hp', SakugaHp);

// ── Loot chest: click to open; it rattles, bursts open, and the reward pops out with a glint ──
class SakugaLoot extends fx.Base {
  static css = KIT + `:host{display:inline-block}.w{display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer}svg{width:120px;height:100px;will-change:transform}.b{fill:#c9824a;stroke:var(--sk-ink);stroke-width:3.5;stroke-linejoin:round}.bd{fill:#ffc94d;stroke:var(--sk-ink);stroke-width:3}.lk{fill:#ffe58a;stroke:var(--sk-ink);stroke-width:2.5}.lid{transform-origin:12px 44px;will-change:transform}.rw{font:italic 900 15px ${COMIC};min-height:22px;will-change:transform}`;
  render() { return `<div class="w" role="button" tabindex="0" aria-label="Open the chest"><svg viewBox="0 0 120 100"><path class="b" d="M12 50h96v42H12z"/><path class="bd" d="M12 62h96v8H12zM54 50h12v42H54z"/><g class="lid"><path class="b" d="M12 50V34q0-18 48-18t48 18v16Z"/><path class="bd" d="M54 17h12v33H54z"/><rect class="lk" x="51" y="40" width="18" height="16" rx="3"/></g></svg><span class="rw lbl">Click to open</span></div>`; }
  setup() { this.lid = new Spring(0, 260, 10); this.sh = new Spring(0, 1400, 7); this.rj = new Jelly(this.$('.rw'), 480, 9); this.open = false; const go = () => this.crack(); this.$('.w').addEventListener('click', go); this.$('.w').addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go())); }
  crack() { if (this.busy) return; if (this.open) { this.open = false; this.lid.to = 0; this.$('.rw').textContent = 'Click to open'; this.$('.rw').className = 'rw lbl'; return; } this.busy = true; this.sh.x = 6; later(160, () => (this.sh.x = -8)); later(320, () => (this.sh.x = 10)); later(520, () => { this.busy = false; this.open = true; this.lid.to = -110; const c = at(this.$('svg'), 0.5, 0.45); fx.burst(c.x, c.y, { r: 70, life: 0.4 }); fx.shards(c.x, c.y, { n: 12, speed: 280, size: 7, dir: -Math.PI / 2, arc: 2.4 }); for (let i = 0; i < 3; i++) later(i * 120, () => fx.kira(c.x + rnd(-40, 40), c.y - rnd(20, 60), { r: 12 })); const R = strs(attr(this, 'rewards', '500 coins,Rare skin,2× XP boost,Golden frame')); const r = R[rnd(R.length) | 0]; this.$('.rw').textContent = '★ ' + r + ' ★'; this.$('.rw').className = 'rw chip'; this.rj.kick(-0.7, 0, -20); fx.sfx('don', c.x + 50, c.y - 70, { size: 110 }); this.emit('open', { reward: r }); }); }
  frame(dt) { this.rj.step(dt); this.$('.lid').style.transform = `rotate(${this.lid.step(dt).toFixed(1)}deg)`; const x = this.sh.step(dt); this.$('svg').style.transform = `translateX(${x.toFixed(1)}px) rotate(${(x * 0.8).toFixed(1)}deg)`; }
}
define('sakuga-loot', SakugaLoot);

// ── Dice: roll() tumbles a die across with motion and lands it with a thud and the result ──
class SakugaDice extends fx.Base {
  static css = KIT + `:host{display:inline-block}.w{display:flex;flex-direction:column;align-items:center;gap:10px}.d{position:relative;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);width:70px;height:70px;padding:9px;border:3.4px solid var(--sk-ink);border-radius:15px;background:var(--sk-card);box-shadow:4px 5px 0 var(--sk-ink);cursor:pointer;will-change:transform}.d i{width:12px;height:12px;margin:auto;border-radius:50%;background:var(--sk-ink);visibility:hidden}.d i.on{visibility:visible}.d.six i.on:nth-child(5){background:var(--sk-acc)}`;
  static PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  render() { return `<div class="w"><div class="d" role="button" tabindex="0" aria-label="Roll the die" aria-live="polite">${'<i></i>'.repeat(9)}</div><button class="pbtn">Roll</button></div>`; }
  setup() { this.d = this.$('.d'); this.v = 6; this.show(6); this.x = new Spring(0, 200, 13); this.r = new Spring(0, 160, 12); this.y = new Spring(0, 300, 10); this.sq = press(this.$('.pbtn')); for (const el of [this.d, this.$('.pbtn')]) el.addEventListener('click', () => this.roll()); this.d.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), this.roll())); }
  show(n) { const on = SakugaDice.PIPS[n]; this.$$('.d i').forEach((p, i) => p.classList.toggle('on', on.includes(i))); this.d.classList.toggle('six', n === 6); this.d.setAttribute('aria-label', `Die shows ${n}. Roll again`); }
  roll() { this.rolling = 0.55; this.x.x = -60; this.x.to = 0; this.r.x = -540; this.r.to = 0; this.y.x = -40; this.y.to = 0; this.final = (rnd(6) | 0) + 1; }
  frame(dt) { this.sq.step(dt); const x = this.x.step(dt), r = this.r.step(dt), y = this.y.step(dt); this.d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${r.toFixed(1)}deg)`; if (this.rolling > 0) { this.rolling -= dt; if (Math.random() < 0.5) this.show((rnd(6) | 0) + 1); if (this.rolling <= 0) { this.v = this.final; this.show(this.v); const c = at(this.d, 0.5, 1); fx.puff(c.x - 30, c.y, { size: 8, n: 4, vx: -30, life: 0.5 }); fx.puff(c.x + 30, c.y, { size: 8, n: 4, vx: 30, life: 0.5 }); if (this.v === 6) { fx.sfx('don', c.x + 60, c.y - 90, { size: 110 }); fx.burst(c.x, c.y - 35, { r: 60, life: 0.3 }); } else fx.ticks(c.x, c.y - 76, { n: 3, r: 6, len: 10 }); this.emit('change', { value: this.v }); } } }
}
define('sakuga-dice', SakugaDice);

// ── Prize wheel: spin() whirls it with speed lines; the pointer clacks over each peg and the prize lands ──
class SakugaWheel extends fx.Base {
  static css = KIT + `:host{display:inline-block}.w{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px}svg{width:190px;height:190px;will-change:transform}.sg{stroke:var(--sk-ink);stroke-width:2.5}.tx{font:italic 900 11px ${F};fill:var(--sk-ink)}.pt{position:absolute;top:-8px;left:50%;width:26px;height:30px;margin-left:-13px;transform-origin:50% 20%;will-change:transform}.pt path{fill:var(--sk-acc);stroke:var(--sk-ink);stroke-width:3;stroke-linejoin:round}.hub{fill:var(--sk-card);stroke:var(--sk-ink);stroke-width:3.5}.rim{fill:none;stroke:var(--sk-ink);stroke-width:5}`;
  render() { this.ps = strs(attr(this, 'prizes', '50 XP,Coffee,Day off,100 XP,Sticker,Jackpot')); const n = this.ps.length, C = ['var(--sk-fill)', 'var(--sk-card)', 'var(--sk-pri)', '#ffe58a', 'var(--sk-soft)', '#59d9a4']; let s = ''; this.ps.forEach((p, i) => { const a0 = (i / n) * TAU - Math.PI / 2, a1 = ((i + 1) / n) * TAU - Math.PI / 2, am = (a0 + a1) / 2; s += `<path class="sg" fill="${C[i % C.length]}" d="M0 0L${(Math.cos(a0) * 88).toFixed(2)} ${(Math.sin(a0) * 88).toFixed(2)}A88 88 0 0 1 ${(Math.cos(a1) * 88).toFixed(2)} ${(Math.sin(a1) * 88).toFixed(2)}Z"/><text class="tx" text-anchor="middle" transform="rotate(${(am * 180 / Math.PI + 90).toFixed(1)}) translate(0 -58)">${esc(p)}</text>`; }); return `<div class="w"><svg viewBox="-95 -95 190 190" role="img" aria-label="Prize wheel"><g class="rot">${s}</g><circle class="rim" r="88"/><circle class="hub" r="13"/></svg><svg class="pt" viewBox="0 0 26 30" aria-hidden="true"><path d="M3 3h20L13 27Z"/></svg><button class="pbtn on">Spin!</button><span class="chip res" hidden aria-live="polite"></span></div>`; }
  setup() { this.a = 0; this.v = 0; this.pt = new Spring(0, 900, 14); this.sq = press(this.$('.pbtn')); this.$('.pbtn').addEventListener('click', () => this.spin()); this.lastPeg = 0; }
  spin() { if (this.v > 0) return; this.v = rnd(900, 1400); this.$('.res').hidden = true; const c = at(this.$('svg')); fx.lines(c.x, c.y, { n: 8, dir: rnd(TAU), len: 60, spread: 90 }); fx.ring(c.x, c.y, { rx: 100, ry: 100, life: 0.4 }); }
  frame(dt) { this.sq.step(dt); if (this.v > 0) { this.a += this.v * dt; this.v = Math.max(0, this.v - (180 + this.v * 0.5) * dt); const n = this.ps.length, peg = Math.floor(this.a / (360 / n)); if (peg !== this.lastPeg) { this.lastPeg = peg; this.pt.x = -Math.min(30, 8 + this.v * 0.02); } if (this.v === 0) { const n = this.ps.length, at0 = ((360 - (this.a % 360)) % 360) / (360 / n), w = this.ps[Math.floor(at0) % n]; const r = this.$('.res'); r.hidden = false; r.textContent = '★ ' + w; const c = at(this.$('svg'), 0.5, 0); fx.burst(c.x, c.y, { r: 40, life: 0.3 }); fx.kira(c.x + 30, c.y - 10, { r: 14 }); fx.sfx(/jackpot/i.test(w) ? 'don' : 'pon', c.x + 90, c.y - 10, { size: /jackpot/i.test(w) ? 130 : 80 }); this.emit('change', { prize: w }); } } this.$('.rot').setAttribute('transform', `rotate(${this.a.toFixed(2)})`); this.$('.pt').style.transform = `rotate(${this.pt.step(dt).toFixed(1)}deg)`; }
}
define('sakuga-wheel', SakugaWheel);

// ── Confetti button: the party trigger for any win: paper confetti that flutters down over the page ──
class SakugaConfetti extends fx.Base {
  static delegates = true;
  static css = KIT + `.pbtn{padding:12px 22px;font-size:17px;background:linear-gradient(90deg,var(--sk-fill),var(--sk-pri));color:#fff;text-shadow:1px 1px 0 var(--sk-ink)}`;
  render() { return `<button class="pbtn" part="button"><slot>🎉 Celebrate</slot></button>`; }
  setup() { this.b = this.$('.pbtn'); this.sq = press(this.b, 0.6); this.b.addEventListener('click', () => this.fire()); }
  // throw confetti from the button (or from x, y in page coordinates)
  fire(x, y, n = 60) { const c = at(this.b); x ??= c.x; y ??= c.y; this.sq.pop.x = 1.25; const cols = ['#ff5fa8', '#8f8df7', '#59d9a4', '#ffc94d', '#4dc3ff', '#ffffff']; fx.burst(x, y, { r: 50, life: 0.3 }); fx.sfx('pon', x + 40, y - 60, { size: 90 });
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + rnd(-1.1, 1.1), v = rnd(260, 620), col = cols[i % cols.length], w = rnd(5, 9), h = rnd(9, 15), sp = rnd(4, 12), ph = rnd(TAU), sw = rnd(20, 60);
      const life = rnd(1.8, 2.8);
      (function add() { let vx = Math.cos(a) * v, vy = Math.sin(a) * v, px = x, py = y; const h0 = fx.persist((k, t, dt) => { if (!dt) return; vx *= Math.pow(0.12, dt); vy = vy * Math.pow(0.12, dt) + 900 * dt * Math.pow(0.12, dt * 0.2); vy = Math.min(vy, 140); px += vx * dt + Math.sin(t * 3 + ph) * sw * dt; py += vy * dt; const g = fx.g, fl = Math.cos(t * sp + ph); g.translate(px, py); g.rotate(t * sp * 0.4 + ph); g.scale(fl, 1); g.fillStyle = col; g.strokeStyle = fx.P.line; g.lineWidth = 1.4; g.globalAlpha = Math.min(1, (life - t) * 2); g.fillRect(-w / 2, -h / 2, w, h); g.strokeRect(-w / 2, -h / 2, w, h); if (t > life) h0.dead = true; }); })(); }
    this.emit('fire'); }
  frame(dt) { this.sq.step(dt); }
}
define('sakuga-confetti', SakugaConfetti);
}
// >>> sakuga core (copied from core.js by tools/build.mjs: edit core.js, not this block)
// Sakuga VFX core: springs, the effects layer and the lettering, shared by every component.
// Each component file carries a copy of this between its core markers, so any one file works on its own. The first one loaded
// sets window.SakugaFX and the others use it. Edit this file, then run `node tools/build.mjs` to stamp it into the components.
(() => {
'use strict';
if (window.SakugaFX) return;
const TAU = Math.PI * 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const out = (t) => 1 - (1 - t) ** 3, inn = (t) => t * t * t, back = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;

// A spring: the thing that makes a control overshoot and settle instead of stopping dead.
class Spring {
  constructor(x = 0, k = 300, d = 20) { this.x = x; this.v = 0; this.to = x; this.k = k; this.d = d; }
  step(dt) { if (!(dt > 0)) return this.x; for (let n = Math.ceil(dt / 0.008), h = dt / n; n--;) { this.v += (-this.k * (this.x - this.to) - this.d * this.v) * h; this.x += this.v * h; } return this.x; }
}

// ───────── the palette ─────────
// P is for the effects; the CSS variables below are for the controls.
const P = { fill: '#ffffff', shade: '#b8b3ff', line: '#5a4fd8', accent: '#ff5fa8', ink: '#1d1a4a', sfx: ['#1d1a4a', '#ffffff'] };
const VARS = '--sk-card:#fff;--sk-ink:#1d1a4a;--sk-dim:#8580b0;--sk-soft:#b8b3ff;--sk-pri:#8f8df7;--sk-pri-ink:#1d1a4a;--sk-acc:#ff5fa8;--sk-track:#c9cbe0;--sk-r:15px;--sk-bw:3.2px;--sk-sh:6px 7px 0 var(--sk-soft);--sk-btn-sh:var(--sk-sh);--sk-btn-line:var(--sk-ink);--sk-alt-sh:var(--sk-sh);--sk-alt-line:var(--sk-ink);--sk-tick:var(--sk-ink);--sk-fill:var(--sk-acc);--sk-on-pri:#fff;';
// :where() keeps these at no specificity, so a page's own :root { --sk-acc: ... } wins.
const pageCss = `:where(:root){${VARS}}
canvas.sakuga-fx{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483000}`;
document.head.append(Object.assign(document.createElement('style'), { textContent: pageCss }));

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let calm = reduce.matches; reduce.addEventListener?.('change', (e) => { calm = e.matches; });

// ───────── layers ─────────
// The front layer is one fixed canvas over the whole page. A component can also have a back layer: a canvas inside it, behind the control.
// Effects are placed in page coordinates, so they scroll with their control.
let g = null, dpr = 1;
const front = { c: null, g: null, live: [], dirty: false }, layers = [front];
function ensureFront() {
  if (front.c || !document.body) return;
  front.c = Object.assign(document.createElement('canvas'), { className: 'sakuga-fx' }); front.c.setAttribute('aria-hidden', 'true');
  document.body.append(front.c); front.g = front.c.getContext('2d'); size();
}
function size() { dpr = Math.min(2.5, devicePixelRatio || 1); if (front.c) { front.c.width = innerWidth * dpr; front.c.height = innerHeight * dpr; } }
addEventListener('resize', size);
function backLayer(canvas) { const L = { c: canvas, g: canvas.getContext('2d'), live: [], dirty: false }; layers.push(L); return L; }
const add = (life, draw, L) => { const p = { t: 0, life, draw }; if (!calm) { L = L || front; if (L === front) ensureFront(); L.live.push(p); start(); } return p; };
// an effect with no end: it draws every frame until its handle is marked dead. layer puts it on a component's back layer.
const persist = (draw, layer) => add(Infinity, draw, layer);
function tick(dt) {
  for (const L of layers) {
    if (!L.c || (!L.live.length && !L.dirty)) continue;
    let ox = scrollX, oy = scrollY;
    if (L !== front) {   // a back layer: keep its pixels matched to where it sits
      if (!L.c.isConnected) { L.live = []; L.dirty = false; continue; }
      const r = L.c.getBoundingClientRect(), w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
      if (L.c.width !== w) L.c.width = w; if (L.c.height !== h) L.c.height = h; ox += r.left; oy += r.top;
    }
    g = L.g; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, L.c.width / dpr, L.c.height / dpr);
    g.translate(-ox, -oy); g.lineJoin = g.lineCap = 'round';
    L.live = L.live.filter((p) => !p.dead && (p.t += dt) < p.life);
    for (const p of L.live) { g.save(); p.draw(p.t / p.life, p.t, dt); g.restore(); }
    L.dirty = L.live.length > 0;
  }
}

// ───────── the clock ─────────
// One loop for every component. later() runs on this clock, not on setTimeout, so a film can step it a frame at a time.
let now = 0, last = 0, running = false;
const frames = new Set(), timers = [];
const later = (ms, f) => { timers.push({ at: now + ms / 1000, f }); start(); };
function advance(dt) {
  now += dt;
  const due = timers.filter((q) => q.at <= now).sort((a, b) => a.at - b.at); if (due.length) for (const q of due) timers.splice(timers.indexOf(q), 1);
  for (const q of due) q.f();
  for (const f of frames) try { f(dt); } catch (e) { console.error(e); }   // one broken component must not stop the clock for the rest
  tick(dt);
}
function loop(ms) {
  if (!running) return;
  const dt = clamp((ms - last) / 1000, 0, 0.034); last = ms;   // a frame's timestamp can be earlier than the moment the loop started
  if (!api.paused) advance(dt);
  if (!frames.size && !timers.length && layers.every((L) => !L.live.length && !L.dirty)) { running = false; return; }
  requestAnimationFrame(loop);
}
function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(loop); }

// ───────── the effects ─────────
// circles drawn as one shape: outline, shadow tone, then the light side slid up and to the left
function blob(cs, lw = 1.5, _, { lx = -1, arcs = false, deep = 1 } = {}) {
  const u = new Path2D(); for (const [x, y, r] of cs) if (r > 0.3) { u.moveTo(x + r, y); u.arc(x, y, r, 0, TAU); }
  g.save(); g.lineWidth = lw * 2; g.strokeStyle = P.line; g.stroke(u); g.restore();
  g.save(); g.clip(u); g.fillStyle = P.shade; g.fillRect(-1e4, -1e4, 2e4, 2e4); const r = cs[0] ? cs[0][2] : 8;
  g.save(); g.translate(lx * r * 0.2 * deep, -r * 0.26 * deep); g.fillStyle = P.fill; g.fill(u); g.restore();
  if (arcs) { g.strokeStyle = P.line; g.lineWidth = lw * 0.75; g.beginPath(); for (const [x, y, rr] of cs) if (rr > 3) { g.moveTo(x + Math.cos(-2.7) * rr, y + Math.sin(-2.7) * rr); g.arc(x, y, rr, -2.7, -0.5); } g.stroke(); }   // the cumulus lines inside the cloud
  g.restore();
}
function shape(path, lw = 1.5, off = 3, fill = P.fill) {
  g.save(); g.lineWidth = lw * 2; g.strokeStyle = P.line; g.stroke(path); g.restore();
  g.save(); g.clip(path); g.fillStyle = P.shade; g.fillRect(-1e4, -1e4, 2e4, 2e4); g.translate(-off * 0.7, -off); g.fillStyle = fill; g.fill(path); g.restore();
}
// a puff of smoke: lobes swell out with a little overshoot, roll, and shrink away
function puff(x, y, { n = 5, size = 13, vx = 0, vy = -18, life = 0.8, spread = 1 } = {}) {
  const lobes = Array.from({ length: n }, (_, i) => ({ a: (i / n) * TAU + rnd(0.6), d: rnd(0.25, 0.9) * size * spread, r: rnd(0.55, 1) * size, ph: rnd(TAU), sp: rnd(0.6, 1.3) }));
  lobes.unshift({ a: 0, d: 0, r: size, ph: 0, sp: 1 });
  add(life, (k, t) => {
    const grow = back(clamp(t / 0.22)), die = 1 - inn(clamp((k - 0.55) / 0.45)), px = x + vx * out(k) * life, py = y + vy * out(k) * life;
    blob(lobes.map((l) => [px + Math.cos(l.a + t * 0.9 * l.sp) * l.d * (0.5 + out(k) * 0.9), py + Math.sin(l.a + t * 0.9 * l.sp) * l.d * (0.5 + out(k) * 0.9) - out(k) * 5 * l.sp, l.r * grow * die * (1 + Math.sin(t * 9 + l.ph) * 0.05)]), 1.5, true, { lx: 0.5, arcs: size > 6.5, deep: 1.5 });
  });
}
// the impact: pink needles, a star in the shadow tone, and a white star on top; it leaves by its points thinning to nothing
function burst(x, y, { r = 44, spikes = 13, life = 0.34, layer } = {}) {
  const j = Array.from({ length: spikes * 2 }, (_, i) => (i % 2 ? rnd(0.34, 0.5) : rnd(0.75, 1.15))), rot = rnd(TAU), pins = Array.from({ length: 8 }, (_, i) => ({ a: i / 8 * TAU + rnd(0.5), l: rnd(1.25, 1.75), w: rnd(0.03, 0.055) }));
  const star = (R, turn, inner = 1) => { const p = new Path2D(); j.forEach((m, i) => { const a = rot + turn + (i / j.length) * TAU, rr = R * (i % 2 ? m * inner : m); p[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }); p.closePath(); return p; };
  add(life, (k) => {
    const R = r * out(clamp(k / 0.3)), hollow = 1 + inn(clamp((k - 0.35) / 0.65)) * 1.3, r0 = R * 0.6 * Math.min(1.9, hollow);
    g.save(); g.fillStyle = P.accent; g.beginPath(); for (const n of pins) { const l = R * n.l; if (l <= r0) continue; g.moveTo(x + Math.cos(n.a - n.w) * r0, y + Math.sin(n.a - n.w) * r0); g.lineTo(x + Math.cos(n.a) * l, y + Math.sin(n.a) * l); g.lineTo(x + Math.cos(n.a + n.w) * r0, y + Math.sin(n.a + n.w) * r0); } g.fill(); g.restore();
    const big = star(R * 1.16, 0.19, hollow); g.save(); g.fillStyle = P.shade; g.fill(big); g.strokeStyle = P.line; g.lineWidth = 1.2; g.stroke(big); g.restore();
    shape(star(R * 0.84, 0, hollow), 1.4, 3);
  }, layer);
}
// chips of crystal: long facets with one edge line, tumbling and falling
function shards(x, y, { n = 7, speed = 190, size = 5, life = 0.75, dir = -Math.PI / 2, arc = Math.PI, grav = 420 } = {}) {
  for (let i = 0; i < n; i++) {
    const a = dir + rnd(-arc, arc) / 2, v = speed * rnd(0.5, 1.15), s = size * rnd(0.6, 1.4), spin = rnd(-7, 7), pts = [[-1.4, 0.1], [-0.6, -0.7], [1.2, -0.45], [1.5, 0.15], [0.4, 0.75]].map(([px, py]) => [px * rnd(0.8, 1.2), py * rnd(0.8, 1.2)]);
    add(life * rnd(0.7, 1), (k, t) => {
      const px = x + Math.cos(a) * v * t, py = y + Math.sin(a) * v * t + grav * t * t, sc = s * (1 - inn(clamp((k - 0.6) / 0.4)));
      g.translate(px, py); g.rotate(spin * t + a); const p = new Path2D(); pts.forEach(([u, w], q) => p[q ? 'lineTo' : 'moveTo'](u * sc, w * sc)); p.closePath(); shape(p, 1.1, sc * 0.45, P.fill);
      if (sc > 2.5) { g.strokeStyle = P.line; g.lineWidth = 0.9; g.beginPath(); g.moveTo(pts[1][0] * sc, pts[1][1] * sc); g.lineTo(pts[4][0] * sc, pts[4][1] * sc); g.stroke(); }
    });
  }
}
function ring(x, y, { rx = 40, ry = 12, life = 0.5, w = 5 } = {}) {
  add(life, (k) => { const s = out(k), lw = w * (1 - k); g.beginPath(); g.ellipse(x, y, rx * (0.3 + s), ry * (0.3 + s), 0, 0, TAU); g.strokeStyle = P.line; g.lineWidth = lw + 2.4; g.stroke(); g.strokeStyle = P.fill; g.lineWidth = lw; if (lw > 0.3) g.stroke(); });
}
// a splash crown: tongues of water rise out of a line and fall back with foam on their tips, drops fly
function splash(x, y, { w = 34, h = 26, life = 0.7 } = {}) {
  const n = 7, ts = Array.from({ length: n }, (_, i) => ({ u: i / (n - 1) - 0.5, h: h * rnd(0.55, 1.1) * (1 - Math.abs(i / (n - 1) - 0.5) * 0.7), lean: rnd(-0.4, 0.4), d: rnd(0, 0.14) }));
  add(life, (k) => {
    const p = new Path2D(), tips = []; p.moveTo(x - w * 0.62, y);
    ts.forEach((s) => { const kk = clamp((k - s.d) / 0.8), up = Math.sin(kk * Math.PI) * s.h * (1 - kk * 0.25), bx = x + s.u * w, half = w / n * 0.62, tx = bx + (s.u * 1.6 + s.lean) * up * 0.5; tips.push([tx, y - up, up]); p.quadraticCurveTo(bx - half, y - up * 0.25, tx, y - up); p.quadraticCurveTo(bx + half * 0.5, y - up * 0.3, bx + half, y); });
    p.lineTo(x + w * 0.62, y); p.closePath();
    g.save(); g.lineWidth = 2.8; g.strokeStyle = P.line; g.stroke(p); g.restore(); g.fillStyle = P.shade; g.fill(p);
    g.save(); g.clip(p); g.fillStyle = P.fill; for (const [tx, ty, up] of tips) if (up > 4) { g.beginPath(); g.ellipse(tx, ty + up * 0.2, up * 0.2 + 1.4, up * 0.34, 0, 0, TAU); g.fill(); } g.restore();
  });
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + rnd(-1.1, 1.1), v = rnd(100, 210), r0 = rnd(2, 4);   // drops are teardrops, pointed the way they came from
    add(life * rnd(0.8, 1.15), (k, t) => { const px = x + Math.cos(a) * v * t, py = y - 6 + Math.sin(a) * v * t + 520 * t * t, r = r0 * (1 - inn(clamp((k - 0.6) / 0.4))), ang = Math.atan2(Math.sin(a) * v + 1040 * t, Math.cos(a) * v), d = new Path2D();
      g.translate(px, py); g.rotate(ang); d.moveTo(-r * 2.6, 0); d.quadraticCurveTo(-r * 0.6, -r * 1.05, r * 0.5, -r * 0.9); d.arc(r * 0.4, 0, r * 0.95, -1.4, 1.4); d.quadraticCurveTo(-r * 0.6, r * 1.05, -r * 2.6, 0); if (r > 0.5) shape(d, 1, r * 0.5); }); }
}
// a slash: a crescent whose head races ahead and whose tail catches up
function slash(x, y, { len = 110, ang = -0.5, life = 0.42, thick = 15, col } = {}) {
  const R = len * 0.9, cx = x - Math.cos(ang - Math.PI / 2) * R * 0.86, cy = y - Math.sin(ang - Math.PI / 2) * R * 0.86, a0 = ang - Math.PI / 2 - 0.62, sweep = 1.24, c = col || P.accent;
  add(life, (k) => {
    const head = out(clamp(k / 0.42)), tail = inn(clamp((k - 0.22) / 0.78)); if (head - tail < 0.01) return;
    const cres = (T) => { const p = new Path2D(), N = 26; for (let i = 0; i <= N; i++) { const u = lerp(tail, head, i / N), a = a0 + sweep * u; p[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * R, cy + Math.sin(a) * R); } for (let i = N; i >= 0; i--) { const q = i / N, u = lerp(tail, head, q), a = a0 + sweep * u, rr = R - T * Math.sin(q * Math.PI) ** 0.7; p.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } p.closePath(); return p; };
    g.save(); g.fillStyle = c; g.fill(cres(thick)); g.restore(); g.fillStyle = P.fill; g.fill(cres(thick * 0.42));
    g.strokeStyle = P.line; g.lineWidth = 1.3; g.stroke(cres(thick));
  });
}
// speed lines: strokes that shoot out one way and thin away
function lines(x, y, { n = 7, dir = Math.PI, len = 46, spread = 26, life = 0.3 } = {}) {
  for (let i = 0; i < n; i++) { const o = rnd(-spread, spread), l = len * rnd(0.5, 1.3), d = rnd(0, 0.25), w = rnd(1, 2.6); add(life, (k) => { const kk = clamp((k - d) / (1 - d)), a = out(kk), b = inn(kk), px = x - Math.sin(dir) * o, py = y + Math.cos(dir) * o; g.strokeStyle = P.line; g.lineWidth = w * (1 - b); g.beginPath(); g.moveTo(px + Math.cos(dir) * l * b * 1.4, py + Math.sin(dir) * l * b * 1.4); g.lineTo(px + Math.cos(dir) * l * (0.2 + a * 1.2), py + Math.sin(dir) * l * (0.2 + a * 1.2)); if (kk > 0) g.stroke(); }); }
}
// accent ticks: little wedges that point at something and fly off it
function ticks(x, y, { n = 3, r = 16, len = 9, dir = -0.9, life = 0.4, fan = 0.42 } = {}) {
  add(life, (k) => { const a = out(clamp(k / 0.5)), b = inn(clamp((k - 0.4) / 0.6)); g.save(); g.fillStyle = P.accent; g.beginPath();
    for (let i = 0; i < n; i++) { const an = dir + (i - (n - 1) / 2) * fan, r0 = r + len * b * 1.25, r1 = r + len * a * 1.25, hw = 0.07 + 2.2 / (r1 + 8); if (r1 - r0 < 0.6) continue; g.moveTo(x + Math.cos(an) * r0, y + Math.sin(an) * r0); g.lineTo(x + Math.cos(an - hw) * r1, y + Math.sin(an - hw) * r1); g.lineTo(x + Math.cos(an + hw) * r1, y + Math.sin(an + hw) * r1); g.closePath(); }
    g.fill(); g.restore(); });
}
// a smoke ring: a lumpy hoop that drifts off and shrinks
function donut(x, y, { r = 20, vx = 30, vy = -50, life = 1, tilt = -0.25 } = {}) {
  const ph = rnd(TAU);
  add(life, (k, t) => { const s = back(clamp(t / 0.22)) * (1 - inn(clamp((k - 0.6) / 0.4))), px = x + vx * out(k) * life, py = y + vy * out(k) * life, hole = 0.42 + 0.22 * k, p = new Path2D(); if (s < 0.03) return;
    for (const [m, bump] of [[1, 0.09], [hole, 0.05]]) for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, rr = r * s * m * (1 + bump * Math.sin(a * 9 + ph + t * 2)), ex = Math.cos(a) * rr, ey = Math.sin(a) * rr * 0.52; p[i ? 'lineTo' : 'moveTo'](px + ex * Math.cos(tilt) - ey * Math.sin(tilt), py + ex * Math.sin(tilt) + ey * Math.cos(tilt)); }
    g.save(); g.lineWidth = 3; g.strokeStyle = P.line; g.stroke(p); g.restore(); g.save(); g.clip(p, 'evenodd'); g.fillStyle = P.shade; g.fillRect(-1e4, -1e4, 2e4, 2e4); g.translate(r * 0.06, -r * 0.2); g.fillStyle = P.fill; g.fill(p, 'evenodd'); g.restore(); });
}
// wobble marks: the two little arcs beside something that has just stopped
function wob(x, y, { dir = 1, r = 16, life = 0.45 } = {}) {
  add(life, (k) => { g.strokeStyle = P.line; g.lineWidth = 2.2 * (1 - k); if (g.lineWidth < 0.2) return; g.beginPath(); for (const d of [0, 7]) { const rr = r + d + out(k) * 8, c = dir > 0 ? 0 : Math.PI; g.moveTo(x - dir * r + Math.cos(c - 0.45) * rr, y + Math.sin(c - 0.45) * rr); g.arc(x - dir * r, y, rr, c - 0.45, c + 0.45); } g.stroke(); });
}
// a glint: a four-pointed sparkle that opens and closes
function kira(x, y, { r = 9, life = 0.6, col } = {}) {
  add(life, (k, t) => { const s = r * Math.sin(k * Math.PI) ** 0.6, q = s * 0.16, p = new Path2D(); g.translate(x, y); g.rotate(Math.sin(t * 3) * 0.2); p.moveTo(0, -s); p.quadraticCurveTo(q, -q, s * 0.7, 0); p.quadraticCurveTo(q, q, 0, s); p.quadraticCurveTo(-q, q, -s * 0.7, 0); p.quadraticCurveTo(-q, -q, 0, -s);
    g.save(); g.fillStyle = col || P.fill; g.fill(p); g.restore(); g.strokeStyle = P.accent; g.lineWidth = 2; g.stroke(p); });
}

// ───────── the lettering ─────────
// Six sound-effect words, painted with GPT Image and traced into paths by tools/trace.py: [width, height, path].
// >>> words (written by tools/trace.py)
const WORDS = {"don":[520,297,"M3 290C4 287 6 283 7 281C9 277 18 252 19 248C20 246 19 246 15 250C13 253 11 255 11 254C12 253 15 242 19 230C24 218 30 195 34 180C38 165 43 144 46 133C49 122 51 113 51 113C50 113 50 110 51 107C52 104 52 98 52 94C53 86 57 69 63 54C69 41 69 40 70 41C71 42 72 42 74 40L76 38L75 40C75 43 76 42 85 34C90 28 94 24 95 24C95 24 94 27 92 30C87 40 88 40 100 28C106 22 111 18 111 18C111 18 110 20 109 22C107 28 108 28 114 23C123 15 124 15 122 19C120 21 120 22 121 21C124 20 132 14 136 10C141 5 141 5 136 14C132 23 132 23 135 23C136 22 136 22 135 24C133 29 131 36 132 36C132 36 133 35 135 34C136 32 138 31 138 31C138 31 136 39 132 48C123 71 97 147 98 148C98 148 101 147 105 145C108 144 116 141 122 138C128 136 141 131 150 128C179 117 232 98 234 98C235 98 233 101 229 104C226 108 223 111 223 111C224 111 222 114 219 117C213 124 213 124 216 123C218 123 218 124 214 128C209 133 205 139 204 142C203 143 203 143 205 142C208 140 208 141 204 147C201 150 200 152 201 152C204 151 203 152 197 159C193 163 192 166 194 166C196 166 192 169 182 173C176 175 172 177 170 176C169 176 166 177 163 178C157 180 144 185 143 185C143 185 143 184 144 184C144 183 144 183 143 183C142 183 137 185 132 186C122 189 99 198 90 201L85 204L80 216C73 232 61 258 59 261C57 263 57 263 58 258L58 252L55 255C54 256 52 259 51 260C50 261 49 262 50 261C51 258 48 261 43 267C37 274 36 274 39 268C40 265 41 262 41 262C41 261 36 266 29 273C23 280 18 285 17 285C17 284 18 282 19 279C23 271 22 272 14 281C10 286 5 291 4 292L1 296L3 290ZM223 274C222 274 221 273 220 273C219 273 218 272 218 271C218 266 214 260 212 260C211 261 210 260 210 258C208 251 208 247 208 247C208 246 208 246 207 246C207 246 206 243 207 239C207 234 207 232 206 232C205 233 205 232 206 227C207 225 210 222 214 218C222 213 223 212 220 217C218 221 220 220 233 211C244 203 247 201 243 205C242 207 241 208 241 208C242 210 296 172 333 144C343 137 352 131 353 130C356 129 382 110 397 98C403 94 408 90 408 90C408 91 403 99 397 107C393 112 393 116 396 111C397 111 398 110 398 110C398 111 394 116 390 122C379 135 379 136 382 134C384 133 384 133 383 134C379 140 373 148 372 149C371 151 371 151 381 143C385 140 388 138 389 138C389 138 386 142 382 147C378 151 375 155 375 156C377 158 353 182 344 189C342 191 332 199 323 206C304 222 280 241 277 242C276 242 273 244 269 247C259 255 226 276 225 276C225 276 224 275 223 274ZM373 264C372 264 372 263 372 262C372 261 371 259 370 259C369 257 369 257 370 252C373 244 372 243 370 246C366 249 366 248 369 243C373 237 378 226 378 225C378 222 386 217 398 211C411 204 415 202 413 204C412 205 412 206 412 207C413 207 429 203 432 202C434 201 435 200 429 212C425 222 425 222 432 217C436 214 436 214 428 226C424 231 420 238 418 242L414 249L403 255C397 258 391 261 389 263C384 266 384 266 385 263C385 261 383 261 378 264C375 265 374 265 373 264ZM392 199C392 196 438 54 441 46C444 41 453 28 458 23C463 18 463 18 462 21C461 23 460 25 459 27L458 29L461 27C462 26 467 22 470 19C477 13 477 13 473 21C471 24 470 27 470 27C471 27 476 24 483 20C496 12 497 11 495 14C491 17 494 16 505 9C512 5 517 2 517 2C518 2 515 6 512 10C507 17 500 29 502 29C502 29 504 28 506 26C509 25 511 23 512 23C514 22 514 21 507 32C499 44 497 49 502 44C505 41 504 44 498 55C488 70 483 79 477 92C473 98 470 103 470 104C467 107 455 132 456 131C460 128 459 131 450 145C446 153 438 166 434 174C425 190 425 191 426 184L426 179L420 184C416 188 412 191 411 193C409 196 408 194 410 189C411 185 410 185 405 191C403 193 401 195 401 194C402 191 401 192 396 196C394 199 392 200 392 199ZM226 147C228 140 228 140 226 141C225 141 225 140 227 136C232 128 235 122 234 121C234 120 235 118 237 115C245 103 245 103 242 104C241 105 241 104 244 102C250 96 260 88 264 87C268 86 282 87 281 88C281 89 283 89 285 89C287 89 289 90 289 90C289 91 294 92 299 94C304 95 309 96 309 97C310 98 319 102 325 102C331 103 331 103 326 108C325 110 323 113 323 113C323 114 320 118 316 121C312 125 309 129 309 129C310 129 307 132 304 136L299 142L290 142C279 141 265 142 245 148C235 150 226 152 225 153L223 153L226 147ZM133 121C133 103 157 28 160 39C160 41 161 41 166 35C173 28 174 28 173 32C171 36 172 36 180 32C184 30 188 28 188 29C189 29 192 28 195 26C201 22 202 22 199 29C197 31 196 36 195 39C192 46 167 99 165 101C164 102 164 102 164 100C164 99 163 100 158 104C153 109 153 109 153 107L153 104L149 107C147 108 143 112 139 116C136 120 133 122 133 121ZM180 104C180 97 192 64 203 43C210 29 220 16 218 22L218 25L225 21C231 16 233 15 231 18C226 25 230 23 245 13C251 10 255 7 255 8C255 8 253 12 251 15C246 22 245 25 248 22C251 20 250 22 246 30C241 38 240 39 243 38C245 37 245 36 228 62C212 85 208 91 209 87C209 85 208 84 207 86C206 86 204 88 202 90L198 93L199 90C200 87 198 88 188 98C184 102 180 105 180 104Z"],"gogo":[520,288,"M1 284C1 281 1 274 1 268L2 257L15 253C22 250 32 247 37 246C42 245 46 244 46 243C47 243 50 217 49 216C48 215 31 222 19 228C4 235 6 235 6 231C7 229 7 229 6 229C4 230 4 231 6 220C8 215 9 208 10 206C10 202 10 201 13 201C15 200 24 197 34 194C43 190 51 187 52 187C52 187 52 189 52 192C52 198 53 199 60 196C66 193 79 190 80 190C80 191 79 198 77 207C73 225 70 242 70 254C69 263 72 261 44 270C28 275 18 279 1 288C0 288 0 286 1 284ZM84 281C84 280 85 273 87 263C88 254 89 245 89 243L88 239L102 234C109 232 122 228 129 226C136 224 143 222 143 222C143 221 149 189 149 187C149 185 148 186 133 192C119 197 105 204 97 209L93 211L93 207C94 203 94 202 93 203C91 203 91 202 93 198C98 186 102 173 102 169C102 167 103 166 103 166C109 164 125 159 137 154C145 151 151 149 152 149C152 149 153 152 154 156C154 160 154 163 155 163C155 163 159 161 164 159C171 156 190 152 191 153C191 153 189 164 185 178C179 205 174 231 174 240L174 245L163 248C157 250 148 253 142 255C131 258 101 271 90 278C85 281 84 281 84 281ZM191 269C191 268 192 260 193 251C195 241 196 230 196 225L196 217L200 216C203 215 217 211 233 206C249 200 263 196 265 196C267 195 268 194 269 194C269 193 276 149 276 148C275 147 241 160 230 166C226 168 219 172 214 175C201 182 202 183 205 165C206 159 208 147 209 140L211 126L215 125C217 125 231 121 247 116C263 110 276 106 278 106C280 105 280 105 281 114C281 122 281 123 283 123C284 122 289 120 294 118C307 113 327 109 327 112C327 113 324 125 321 139C312 173 305 212 307 219L307 223L298 226C293 228 283 231 276 232C259 237 209 259 196 267C192 269 192 269 191 269ZM321 255C321 253 333 202 333 201C334 201 333 199 332 197C330 192 331 191 338 191C342 190 357 187 372 184C387 180 404 176 410 175C415 174 420 173 420 172C421 172 433 117 433 115C433 113 430 114 418 118C396 124 369 136 353 146C348 150 344 152 343 152C343 151 343 148 344 144C346 137 346 136 343 138C340 139 340 139 344 124C349 108 352 94 352 88C352 83 353 81 356 81C359 81 381 75 402 69C421 63 436 59 437 59C437 60 437 65 438 70C438 76 439 81 439 82C440 82 446 80 454 77C466 72 469 72 481 70C500 68 498 68 496 73C496 76 493 84 491 92C489 99 485 112 483 119C478 132 470 167 469 178C468 182 467 187 466 191C465 195 465 200 465 203L464 209L455 211C450 212 441 215 435 216C429 218 420 221 415 223C395 228 372 237 353 246C332 257 332 257 332 254C333 251 331 251 326 254C322 257 321 258 321 255ZM55 179L56 164L64 160C69 158 74 156 74 157C74 157 73 164 71 173L67 188L62 191C59 193 56 194 56 194C55 194 55 187 55 179ZM72 188C72 186 78 162 79 161C80 160 93 155 94 155C95 155 93 162 89 173L85 184L79 186C73 188 72 188 72 188ZM157 140C157 130 157 121 156 119C156 116 156 115 159 115C160 114 166 112 171 109C176 107 181 105 181 106C182 106 181 111 179 116C178 122 176 132 175 138C174 145 173 151 173 151C172 151 158 158 158 158C157 158 157 150 157 140ZM178 149C178 146 185 115 186 114C187 113 202 107 204 107C206 107 205 113 199 131L195 146L188 148C184 149 180 150 179 150C179 150 178 150 178 149ZM285 103C285 95 285 84 285 78C285 67 285 67 288 66C293 65 300 63 308 59C320 54 319 54 315 69C311 81 308 93 306 102C305 108 305 109 302 109C301 110 296 112 292 114C288 115 285 117 285 117C284 117 284 111 285 103ZM311 106C311 105 313 97 316 87C318 77 320 68 321 67C321 66 322 65 323 64C325 63 345 56 346 56C348 56 347 62 341 78C332 104 334 102 323 105C318 106 313 107 312 108C312 108 311 107 311 106ZM443 74C442 73 442 15 442 14C443 14 445 13 447 13C450 13 458 10 466 6C474 3 481 0 481 1C482 1 480 10 478 20C475 30 472 45 470 52C469 60 467 66 467 66C466 66 461 68 455 71C442 76 443 75 443 74ZM475 64C475 64 478 52 481 37L487 11L503 5C512 2 519 0 519 1C521 2 505 55 502 59C502 59 497 61 490 62C484 63 478 64 477 65C476 65 475 65 475 64Z"],"kachi":[520,295,"M28 292C28 290 53 225 68 186C72 175 75 167 75 167C73 167 30 186 15 193C8 196 2 199 1 199C1 198 25 138 26 137C26 136 41 132 59 127C76 122 91 118 92 118C92 117 97 103 102 85C108 68 113 53 114 53C114 52 118 51 122 51C126 50 138 48 147 46C157 45 166 43 166 44C168 45 167 49 156 74C149 89 144 101 144 102C144 103 171 94 195 86C218 78 216 78 220 84C221 87 224 92 227 96L231 102L221 122C208 150 203 160 188 196C163 260 160 265 148 265C143 265 139 262 125 247C114 235 111 231 102 228C97 226 97 226 111 223C117 223 125 221 130 220L139 218L141 213C143 208 168 136 168 135C167 135 157 138 145 142L124 149L108 180C90 219 84 232 82 236C80 241 79 243 73 246C70 248 60 259 49 270C26 295 28 294 28 292ZM258 263C258 261 271 217 281 187C287 168 292 152 292 151C291 151 235 175 220 183C214 186 210 188 209 188C209 187 217 151 219 145C220 142 221 142 262 126C285 117 304 110 304 110C304 109 310 81 310 80C309 80 289 89 263 101C252 106 244 110 243 110C243 109 245 106 247 102C252 92 252 92 245 92C242 92 239 92 239 92C240 88 378 1 383 1C384 1 383 3 382 5C379 10 379 11 384 15C387 17 387 18 387 20C386 25 388 28 395 35L402 42L399 43C396 44 358 60 357 60C357 61 347 94 347 95C347 96 359 92 373 87C403 77 428 69 429 69C429 69 425 75 419 82C413 89 406 98 403 101C398 109 401 108 362 124C348 129 336 134 336 134C336 135 333 141 330 150C307 205 308 203 301 210C297 214 292 221 288 226C273 245 258 264 258 263ZM427 204C427 199 485 90 490 84C491 84 494 84 500 85C505 86 512 87 514 87C517 88 519 89 520 90C520 90 510 105 497 124L475 156L451 180C438 194 427 204 427 204ZM406 136C407 124 408 114 408 113C409 112 433 98 435 98C436 98 437 96 432 121L427 143L417 150C412 155 407 158 406 158C406 158 406 148 406 136ZM439 135C440 124 445 90 445 89C447 88 469 80 470 81C470 81 468 91 465 103L460 124L450 134C445 139 440 143 440 143C439 143 439 140 439 135Z"],"pon":[520,297,"M323 296C302 290 292 271 300 254C305 244 313 239 330 234C383 222 420 197 456 149C473 126 477 123 490 123C502 123 515 131 518 142C527 165 495 216 452 248C410 280 348 303 323 296ZM154 295C141 292 137 288 134 273C132 265 125 222 120 190C116 160 116 163 113 164C112 164 99 168 85 172C41 186 32 187 19 183C4 179-3 162 2 147C10 127 29 118 84 107C96 104 107 102 107 101C107 101 106 98 105 94C99 74 97 61 101 53C107 40 128 29 147 29C169 29 177 40 177 73C177 83 177 88 178 88C179 88 185 86 193 84L207 81L204 76C191 56 197 29 217 14C242-4 271-4 289 15C314 42 302 84 266 96L260 98L260 105C259 125 245 133 191 145C180 148 180 147 182 159C186 175 192 223 194 242C197 276 193 286 175 293C169 295 157 296 154 295ZM42 292C26 286 21 269 27 246C35 221 50 196 62 189C69 185 86 185 93 189C109 197 110 213 97 249C85 281 74 292 55 293C48 293 44 293 42 292ZM240 251C227 246 218 234 203 204C192 183 192 175 203 165C220 149 242 154 266 178C284 196 288 209 282 227C276 243 253 256 240 251ZM366 172C350 167 309 151 303 147C289 136 289 116 303 100C316 85 333 83 360 94C389 106 404 122 404 138C404 160 386 177 366 172ZM256 63C268 57 270 40 258 34C244 26 226 43 234 56C238 64 248 67 256 63Z"],"shu":[520,266,"M8 258C11 255 14 252 14 251C14 251 15 250 16 249C17 248 19 244 19 242C19 242 20 241 20 240C22 237 22 236 19 238C16 239 16 238 21 234C25 231 26 229 26 227C26 226 27 225 27 224C28 223 29 222 28 222C28 221 60 197 61 198C62 198 86 181 120 157C144 140 146 138 171 118C216 81 246 58 270 42C277 37 277 37 256 58C235 78 217 98 182 138C139 187 131 194 76 230C56 242 57 242 63 236C66 233 68 230 68 230C67 230 67 230 51 240C45 244 38 249 36 250L32 252L36 247L42 242L37 245C35 246 31 249 28 250C24 253 22 254 24 252C24 251 24 251 23 252C22 252 17 255 12 258L2 264L8 258ZM24 221C28 216 42 207 40 209C38 212 30 218 24 221L20 223L24 221ZM192 189C192 188 194 187 197 185C202 182 203 180 200 181C199 182 202 179 206 175C210 171 213 168 212 168C211 168 211 168 212 166C216 161 216 160 213 161C211 162 209 162 209 162C209 161 217 156 218 156C218 156 220 155 222 153C227 149 250 140 277 132C287 129 290 128 291 127C291 125 294 118 298 109C301 101 304 94 304 93C304 93 291 99 276 106C261 113 247 119 244 120L240 122L242 120C243 118 244 117 244 116C244 116 245 115 246 114C246 113 247 112 247 111C246 111 247 109 247 108C249 106 248 103 246 103C245 104 246 102 248 100C253 94 253 94 249 94C247 95 245 95 245 95C245 94 257 88 258 88C258 89 262 87 266 86C282 78 340 57 341 58C341 59 340 60 338 62C335 67 336 67 344 64C347 63 349 62 350 62C350 62 346 68 342 74C333 88 313 122 314 123C314 123 325 121 336 118C361 111 367 110 366 111C366 112 365 112 364 112C363 112 363 112 364 113C365 114 366 115 365 115C365 116 368 116 373 116L380 115L376 117C373 118 360 123 348 127C336 132 323 136 321 138C319 139 300 146 280 154C259 162 233 172 222 177C192 189 192 189 192 189ZM38 158C43 153 46 150 46 150C45 150 46 148 46 146C47 145 47 143 47 143C46 143 46 142 47 141C48 139 48 139 47 139C45 140 45 139 47 137L49 133L44 136L40 138L46 132C54 124 55 120 48 124C43 127 42 127 46 122C53 115 77 103 108 91C123 85 138 79 150 73C156 71 163 68 166 68C168 67 172 66 174 65C180 62 180 63 172 69C164 76 160 80 164 79C165 78 164 79 162 81C161 82 160 84 160 84C159 85 155 89 149 93C138 100 132 105 135 103C145 98 108 124 82 139C63 150 61 151 66 147C71 143 68 144 56 151C50 155 45 158 44 158C43 158 40 159 36 161L30 165L38 158ZM379 158C380 157 386 149 392 141C411 116 432 84 453 48C463 32 471 22 472 22C472 23 475 22 477 20C480 18 482 17 483 17C483 17 487 15 492 13C497 11 501 9 502 9C503 10 513 5 516 3C526-6 468 68 451 84C441 95 413 124 392 146C384 154 378 160 379 158ZM380 93C380 90 380 81 380 73C381 55 384 41 386 45C386 46 388 45 390 43C392 41 393 40 393 41C393 41 394 41 395 40C396 39 398 38 399 37C400 37 403 36 405 34C407 33 409 32 410 32C410 32 412 30 415 28C417 26 419 25 419 25C419 29 398 75 395 78C394 79 392 82 390 84C388 86 386 89 385 90C384 91 383 93 382 95C379 99 379 99 380 93ZM46 88C57 78 59 76 62 73C63 71 66 69 67 68C69 66 69 66 66 68C62 69 61 69 64 67C66 65 67 62 65 63C63 65 64 62 67 58L70 53L67 54C65 54 62 55 61 55C60 56 61 54 65 52C69 50 72 47 74 46C80 40 154 13 159 15C160 15 160 15 160 14C159 13 159 13 160 14C161 14 167 12 174 9C186 5 189 4 184 7C174 14 168 21 172 21C173 21 171 24 167 28C164 32 162 34 164 34C168 32 160 38 147 45C140 49 132 54 128 57C124 59 115 64 107 69C99 73 90 78 86 80C82 82 80 82 81 82C81 81 82 80 82 80C82 80 83 79 84 78C85 76 82 77 73 82C66 86 60 89 60 89C59 89 60 88 64 81C65 79 64 80 58 82C55 85 49 87 47 89L42 91L46 88ZM412 83C412 82 416 59 418 50C420 41 425 30 426 31C426 32 432 28 433 26C434 25 439 23 451 17C453 16 456 14 457 13C461 10 461 10 448 35C434 60 433 61 425 69C421 73 416 78 415 80C413 84 412 85 412 83Z"],"zuza":[520,287,"M3 282C6 279 27 251 63 203C78 183 99 155 109 141C119 128 128 115 129 113C130 111 131 110 131 110C130 108 61 142 35 157C28 161 22 164 22 164C22 163 23 161 25 158C31 146 40 118 40 112C40 111 39 109 38 108C38 107 37 106 37 106C37 105 48 101 67 94C82 89 92 85 155 61C177 53 195 46 195 46C195 46 195 52 193 60C192 67 190 79 189 85L188 97L166 126C153 142 143 155 143 156C143 156 148 159 154 162C172 171 213 194 215 196C215 197 213 199 211 202C203 210 189 236 189 241C189 242 189 243 188 243C188 243 152 217 132 201L119 191L101 207C79 226 53 248 52 248C52 248 52 247 53 247C53 246 54 245 54 245C54 244 52 245 26 266C16 275 6 282 4 283L2 285L3 282ZM287 256C297 230 308 203 314 189C326 161 340 127 340 126C339 126 307 137 306 138C306 138 303 147 299 158L293 176L285 183C281 187 274 193 271 197C268 201 266 204 265 204C265 204 270 173 273 154C273 151 273 148 273 148C270 148 223 167 211 173C203 177 202 177 205 171C207 167 217 136 217 134C217 133 216 131 216 130C214 128 214 128 247 119C265 114 280 110 280 110C280 109 281 102 283 93C290 64 289 66 295 63C303 59 336 45 336 45C337 45 334 52 330 61C322 81 316 99 316 100C317 100 325 98 334 95L351 90L356 77C363 57 368 44 370 42C372 39 412 20 413 21C413 22 411 28 408 35C400 52 391 78 391 79C391 80 395 80 407 77C416 75 428 72 434 71L445 68L443 71C417 103 415 105 410 106C407 107 399 109 393 111L381 114L372 136C354 181 351 186 344 194C340 197 333 205 328 212C323 218 311 231 302 242C293 252 286 261 285 261C285 261 286 259 287 256ZM424 202C426 200 436 184 447 166C459 147 472 126 477 119L486 105L493 103C502 100 517 97 518 97C519 97 516 102 512 107C508 112 498 126 489 138C474 159 473 160 458 173C450 180 439 190 435 194C431 197 426 201 425 203L423 204L424 202ZM411 154C411 146 412 136 412 131L412 123L426 115C442 107 443 107 442 110C438 130 431 152 428 153C427 155 422 158 418 162L410 168L411 154ZM442 145C449 108 449 108 454 104C459 101 478 91 479 91C479 91 468 117 462 132C461 134 457 137 452 141C441 149 442 149 442 145ZM193 104C193 103 195 89 198 74C204 36 204 33 207 31C211 28 241 11 242 11C243 11 242 14 240 19C239 23 234 37 229 49C223 68 221 72 218 76C208 88 196 102 194 104L192 106L193 104ZM223 87C223 85 243 31 246 24C247 21 250 19 256 15C270 7 282 1 282 2C281 3 278 11 274 20C270 29 264 42 261 50L256 62L248 68C244 71 237 76 232 81C227 85 223 88 223 87ZM408 70C408 66 425 22 429 18C431 15 457 1 458 2C458 3 453 13 446 26C435 48 434 50 429 54C426 56 420 61 416 65C411 68 408 71 408 70ZM437 63C444 43 455 20 458 18C462 14 488 0 489 1C489 2 470 37 465 44C464 45 458 50 451 54C436 66 436 66 437 63Z"]};
// <<< words
const shapes = {}, baked = new Map();
const word = (name) => shapes[name] || (WORDS[name] && (shapes[name] = { w: WORDS[name][0], h: WORDS[name][1], p: new Path2D(WORDS[name][2]) }));
// The outline and fill are painted once per word and colour, so a word on screen costs one drawImage a frame.
function bake(name, fc, oc, dots) {
  const key = name + fc + oc + dots; let c = baked.get(key); if (c) return c;
  const s = word(name), pad = 24, e = s.w * 0.035;
  c = document.createElement('canvas'); c.width = s.w + pad * 2; c.height = s.h + pad * 2;
  const x = c.getContext('2d'); x.translate(pad, pad); x.lineJoin = 'round';
  x.strokeStyle = x.fillStyle = oc; x.lineWidth = e * 2; x.stroke(s.p); x.fill(s.p);
  if (dots) {   // screentone letters: dots in the outline colour on white
    const t = document.createElement('canvas'); t.width = 22; t.height = 44; const y = t.getContext('2d'); y.fillStyle = '#fff'; y.fillRect(0, 0, 22, 44); y.fillStyle = oc; y.beginPath();
    for (const [px, py] of [[0, 0], [22, 0], [0, 44], [22, 44], [11, 22]]) { y.moveTo(px + 5.2, py); y.arc(px, py, 5.2, 0, TAU); } y.fill(); x.fillStyle = x.createPattern(t, 'repeat');
  } else x.fillStyle = fc;
  x.fill(s.p); baked.set(key, c); return c;
}
// A word lands a size too big and wobbles while it stays. col: fill colour. edge: outline colour. dots: screentone letters.
function sfx(name, x, y, { size = 64, rot = -0.14, life = 0.95, col, edge, dots } = {}) {
  if (!word(name)) return; const s = new Spring(0.2, 520, 17); s.to = 1; let lastT = 0;
  const c = bake(name, col || P.sfx[0], edge || P.sfx[1], !!dots), k0 = size / WORDS[name][0];
  add(life, (k, t) => {
    const sc = s.step(t - lastT) * (1 - inn(clamp((k - 0.86) / 0.14))) * k0; lastT = t;
    g.translate(x + Math.sin(t * 31) * 0.8, y + Math.cos(t * 27) * 0.8); g.rotate(rot + Math.sin(t * 6) * 0.03);
    g.drawImage(c, -c.width / 2 * sc, -c.height / 2 * sc, c.width * sc, c.height * sc);
  });
}
// two lettering styles: hollow (white with an ink edge) and dotted (screentone letters)
const hollow = () => ({ col: '#ffffff', edge: '#1d1a4a' }), dotted = () => ({ dots: true, edge: '#1d1a4a' });

// ───────── for components ─────────
const at = (el, fx = 0.5, fy = 0.5) => { const b = el.getBoundingClientRect(); return { x: b.left + scrollX + b.width * fx, y: b.top + scrollY + b.height * fy, w: b.width, h: b.height }; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// a press: squash flat while held, overshoot on release. Call step(dt) every frame.
function squashy(el, { low = 0.82, k = 520, d = 15, wide = 0.55 } = {}) {
  const s = new Spring(1, k, d), pop = new Spring(1, 300, 12), tilt = new Spring(0, 260, 10);
  el.addEventListener('pointerdown', () => { if (!el.disabled) s.to = low; });
  for (const e of ['pointerup', 'pointerleave', 'pointercancel', 'blur']) el.addEventListener(e, () => { s.to = 1; });
  return { s, pop, tilt, step(dt) { const y = s.step(dt), p = pop.step(dt), r = tilt.step(dt), still = Math.abs(y - 1) < 0.001 && Math.abs(s.v) < 0.01 && Math.abs(p - 1) < 0.001 && Math.abs(r) < 0.02;
    el.style.transform = still ? '' : `rotate(${r}deg) scale(${(1 + (1 - y) * wide) * p}, ${y * p})`; } };
}
const BASE_CSS = `:host{display:inline-block;position:relative;isolation:isolate;vertical-align:middle;color:var(--sk-ink);font:500 15px/1.4 -apple-system,BlinkMacSystemFont,"Inter","Segoe UI",system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
:host([hidden]){display:none}*{box-sizing:border-box}button,input{font:inherit;color:inherit;-webkit-tap-highlight-color:transparent}
:focus-visible{outline:2.5px solid var(--sk-acc);outline-offset:3px}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
canvas.back{position:absolute;left:-160px;top:-160px;width:calc(100% + 320px);height:calc(100% + 320px);pointer-events:none;z-index:-1}`;
// The base for every component: a shadow root built on first connect, one frame callback on the shared clock while it is on the page.
class Base extends HTMLElement {
  constructor() { super(); this.root = this.attachShadow({ mode: 'open', delegatesFocus: !!this.constructor.delegates }); if (this.constructor.formAssociated) this.internals = this.attachInternals(); }
  connectedCallback() {
    // a component built from its <option>s waits until the parser has read them
    if (!this.ready && this.constructor.fromChildren && document.readyState === 'loading') { if (!this.waiting) { this.waiting = true; document.addEventListener('DOMContentLoaded', () => { this.waiting = false; if (this.isConnected) this.connectedCallback(); }, { once: true }); } return; }
    if (!this.ready) { this.ready = true; this.root.innerHTML = `<style>${BASE_CSS}${this.constructor.css || ''}</style>${this.render()}`; this.setup(); }
    this.tickFn ||= (dt) => this.frame(dt); frames.add(this.tickFn); start();
  }
  disconnectedCallback() { frames.delete(this.tickFn); }
  $(s) { return this.root.querySelector(s); }
  $$(s) { return [...this.root.querySelectorAll(s)]; }
  render() { return ''; } setup() {} frame() {}
  backLayer() { const c = document.createElement('canvas'); c.className = 'back'; c.setAttribute('aria-hidden', 'true'); this.root.prepend(c); return backLayer(c); }
  emit(type, detail) { this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail })); }
}
const define = (tag, cls) => { if (!customElements.get(tag)) customElements.define(tag, cls); };

const api = window.SakugaFX = {
  version: 1, paused: false,
  get P() { return P; }, get calm() { return calm; }, get now() { return now; },
  TAU, clamp, lerp, rnd, Spring,
  advance, later, persist, blob, shape, get g() { return g; },
  puff, burst, shards, ring, splash, slash, lines, ticks, donut, wob, kira, sfx, hollow, dotted,
  at, esc, squashy, Base, define,
};
})();
// <<< sakuga core
component(window.SakugaFX);
})();
