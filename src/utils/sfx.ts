// 模組 — 音效（Web Audio 即時合成，無音檔）
// 翻牌 playFlip / 抽牌 playDraw / 洗牌 playShuffle，全部即時合成、離線可用。
// 受「音效」開關控制：localStorage 鍵 sfx_enabled（預設開）。
// iOS 限制：AudioContext 必須在使用者手勢中喚醒——這些函式都由點擊觸發，故於呼叫時 resume。
import { load, save } from "./storage";

const SFX_KEY = "sfx_enabled";
const MASTER_VOL = 0.9;

export function isSoundOn(): boolean {
  try { return load(SFX_KEY, true) !== false; } catch { return true; }
}
export function setSoundOn(on: boolean): void {
  try { save(SFX_KEY, !!on); } catch {}
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensure(): boolean {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = MASTER_VOL;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 240;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass";  lp.frequency.value = 5200;
      master.connect(hp); hp.connect(lp); lp.connect(ctx.destination);
    }
    if (ctx.state === "suspended") { ctx.resume(); }
    return true;
  } catch { return false; }
}

type TexOpt = {
  hp?: number; lp?: number; lp1?: number; lp2?: number;
  peak?: number; peakG?: number; body?: number; bodyG?: number;
  vol?: number; grain?: number; rough?: number; atk?: number; rel?: number;
};

// 通用紙質脈衝：rough 低=平滑不沙；lp2 給值=向下/向上掃頻
function tex(t0: number, dur: number, o: TexOpt = {}): void {
  if (!ctx || !master) return;
  const hpF = o.hp ?? 300;
  const lp1 = o.lp1 ?? o.lp ?? 4600;
  const lp2 = o.lp2 ?? lp1;
  const peakF = o.peak ?? 1700, peakG = o.peakG ?? 2.0;
  const body = o.body ?? 1000, bodyG = o.bodyG ?? 2.0;
  const vol = o.vol ?? 0.3, grainMs = o.grain ?? 2.6, rough = o.rough ?? 0.30;
  const atkF = o.atk ?? 0.28, relF = o.rel ?? 0.55;

  const n = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  const gs = Math.max(1, Math.floor(ctx.sampleRate * grainMs / 1000));
  let r = Math.random();
  const atk = Math.max(1, Math.floor(n * atkF));
  const rel = Math.max(1, Math.floor(n * relF));
  for (let i = 0; i < n; i++) {
    if (i % gs === 0) r = Math.random();
    let env = 1;
    if (i < atk) env = Math.pow(i / atk, 1.6);
    else if (i > n - rel) env = Math.pow((n - i) / rel, 1.2);
    d[i] = (Math.random() * 2 - 1) * ((1 - rough) + rough * r) * env;
  }

  const src = ctx.createBufferSource(); src.buffer = buf;
  const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = hpF;
  const pk = ctx.createBiquadFilter(); pk.type = "peaking"; pk.frequency.value = peakF; pk.Q.value = 0.7; pk.gain.value = peakG;
  const bd = ctx.createBiquadFilter(); bd.type = "peaking"; bd.frequency.value = body; bd.Q.value = 0.7; bd.gain.value = bodyG;
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(lp1, t0);
  if (lp2 !== lp1) lp.frequency.exponentialRampToValueAtTime(Math.max(200, lp2), t0 + dur);
  const g = ctx.createGain(); g.gain.value = vol;
  src.connect(hp); hp.connect(pk); pk.connect(bd); bd.connect(lp); lp.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur + 0.03);
}

// 翻牌：飄渺、無重音、0.1 秒、兩層上揚空氣噪聲
export function playFlip(): void {
  if (!isSoundOn() || !ensure() || !ctx) return;
  const t = ctx.currentTime + 0.01;
  tex(t,        0.10, { hp:1000, lp1:1800, lp2:3800, peak:3000, peakG:0.05, vol:0.030, grain:3.0, rough:0.07, atk:0.55, rel:0.45 });
  tex(t + 0.02, 0.10, { hp:1600, lp1:2600, lp2:4400, peak:3600, peakG:0.05, vol:0.020, grain:3.2, rough:0.06, atk:0.58, rel:0.42 });
}

// 抽牌：一聲輕摩，更輕更虛、更短
export function playDraw(): void {
  if (!isSoundOn() || !ensure() || !ctx) return;
  const t = ctx.currentTime + 0.04;
  tex(t, 0.08, { hp:460, lp:3400, peak:1300, peakG:0.9, vol:0.045, grain:3.4, rough:0.10 });
}

// 洗牌：3 道間隔 0.2 秒的橋洗摩擦 + 收尾輕摩
export function playShuffle(): void {
  if (!isSoundOn() || !ensure() || !ctx) return;
  const t0 = ctx.currentTime + 0.04;
  for (let i = 0; i < 3; i++) {
    tex(t0 + i * 0.20, 0.18, { hp:430, lp:4000, peak:1500, peakG:1.6, vol:0.045, grain:2.7, rough:0.30 });
  }
  tex(t0 + 3 * 0.20, 0.15, { hp:410, lp:3700, peak:1400, vol:0.03, grain:2.9, rough:0.26 });
}

// 風鈴：更飄渺「叮」（很軟起音、弱金屬泛音、三層微解諧、極長尾），音量很輕
function bell(t0: number, freq: number, vol: number, dur: number): void {
  if (!ctx || !master) return;
  const o = ctx.createOscillator();  o.type = "sine"; o.frequency.value = freq;
  const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2.76;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.035);          // 很軟的起音（漸入）
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.0001, t0);
  g2.gain.exponentialRampToValueAtTime(vol * 0.12, t0 + 0.035);  // 金屬泛音減弱 → 更純更空靈
  g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.4);
  o.connect(g); g.connect(master);
  o2.connect(g2); g2.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.05);
  o2.start(t0); o2.stop(t0 + dur * 0.4 + 0.05);
}

export function playChime(): void {
  if (!isSoundOn() || !ensure() || !ctx) return;
  const t0 = ctx.currentTime + 0.01;
  bell(t0, 2093, 0.032, 3.0);  // 主音
  bell(t0, 2096, 0.013, 3.0);  // 單層輕微解諧（少拍頻＝少共振）
  bell(t0, 3136, 0.007, 2.2);  // 五度微光（同時、極輕，無延遲＝不像回聲）
}
