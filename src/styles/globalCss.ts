// 模組 10 — Global CSS（靜態全域樣式字串）
// 來源：原 Wikiwaitetarot.tsx 第 1172–1565 行。
// 注意：此為靜態 CSS 字串，不含主題變數。含主題的動態 CSS 留在 App.tsx 的第二個 <style> 注入。

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@1,300;1,400;1,500;1,700&family=Zhi+Mang+Xing&family=Noto+Sans+TC:wght@300;400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  body{background:var(--app-bg,#04060d);}
  [data-cell], [data-cell] *,
  .daily-card-slot, .daily-card-slot *{
    -webkit-user-select:none;user-select:none;
    -webkit-touch-callout:none;
  }
  ::-webkit-scrollbar{width:3px;height:3px;}
  ::-webkit-scrollbar-thumb{background:var(--scrollbar-color,rgba(212,168,67,.25));border-radius:50px;}

  /* Light theme overrides */
  .theme-light ::-webkit-scrollbar-thumb{background:rgba(91,170,138,.35);}
  .theme-light input,
  .theme-light textarea{color:#2d4a3e !important;background:rgba(255,255,255,.9) !important;}

  /* Aurora decorative corner */
  .aurora-corner{
    position:absolute;width:36px;height:36px;pointer-events:none;
    background-size:contain;background-repeat:no-repeat;
  }
  .aurora-corner-tl{top:6px;left:6px;}
  .aurora-corner-tr{top:6px;right:6px;transform:scaleX(-1);}
  .aurora-corner-bl{bottom:6px;left:6px;transform:scaleY(-1);}
  .aurora-corner-br{bottom:6px;right:6px;transform:scale(-1,-1);}
  input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;}
  input[type=date]{color-scheme:dark;}

  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}

  @keyframes floatPet{
    0%,100%{transform:translateY(0px) rotate(0deg);}
    25%{transform:translateY(-6px) rotate(1.5deg);}
    75%{transform:translateY(-3px) rotate(-1deg);}
  }
  @keyframes breathePet{
    0%,100%{transform:scale(1);}
    50%{transform:scale(1.06);}
  }
  @keyframes jumpPet{
    0%,100%{transform:translateY(0) scale(1);}
    40%{transform:translateY(-18px) scale(1.15);}
    60%{transform:translateY(-14px) scale(1.12);}
  }
  @keyframes sleepPet{
    0%,100%{transform:rotate(-18deg) scale(.88);}
    50%{transform:rotate(-22deg) scale(.86);}
  }
  @keyframes groomPet{
    0%,100%{transform:scale(1.08) rotate(4deg);}
    50%{transform:scale(1.05) rotate(6deg);}
  }
  @keyframes bubblePop{
    0%{opacity:0;transform:translateX(-50%) scale(.7);}
    60%{transform:translateX(-50%) scale(1.05);}
    100%{opacity:1;transform:translateX(-50%) scale(1);}
  }
  /* ── Summer 2026 Theme ── */
  .theme-summer2026 {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', sans-serif !important;
    letter-spacing: 0.01em;
  }
  .theme-summer2026 button {
    font-family: 'Plus Jakarta Sans', 'Noto Sans TC', sans-serif !important;
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  .theme-summer2026 .aurora-corner {
    animation: cloudFloat 7s ease-in-out infinite;
    opacity: .7;
  }
  .theme-summer2026 .aurora-corner-tr { animation-delay: 2.5s; }
  .theme-summer2026 .aurora-corner-bl { animation-delay: 5s; }
  .theme-summer2026 .aurora-corner-br { animation-delay: 3.5s; }
  .theme-summer2026 .pay-btn:not([disabled]) {
    background: linear-gradient(135deg,#00a896 0%,#0077c8 45%,#e8406a 100%) !important;
    background-size: 200% auto !important;
    animation: payPulse 2.2s ease-in-out infinite, imperialShimmer 4s linear infinite !important;
    border-color: rgba(0,168,150,.7) !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    border-radius: 50px !important;
    box-shadow: 0 4px 18px rgba(0,168,150,.25), 0 0 10px rgba(0,168,150,.15) !important;
  }
  .theme-summer2026 input,
  .theme-summer2026 textarea {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
  }
  /* summer2026 牌堆暈染 - 清透青光 */
  .theme-summer2026 .daily-card-back[data-cb] {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.9), inset 0 -1px 0 rgba(0,168,150,.08),
      0 4px 20px rgba(0,168,150,.2), 0 0 16px rgba(0,168,150,.12) !important;
  }
  /* ── Hibiscus Theme（扶桑盛夏）── */
  .theme-hibiscus {
    font-family: 'Nunito', 'Noto Sans TC', sans-serif !important;
    letter-spacing: 0.02em;
  }
  .theme-hibiscus button {
    font-family: 'Nunito', 'Noto Sans TC', sans-serif !important;
    font-weight: 700;
    letter-spacing: 0.05em;
  }



  /* 按鈕：暖橙紅漸層，火焰感 */
  .theme-hibiscus .pay-btn:not([disabled]) {
    background: linear-gradient(135deg,#ff6b35 0%,#e63c1e 35%,#c0392b 65%,#e63c1e 100%) !important;
    background-size: 220% auto !important;
    animation: payPulse 2.2s ease-in-out infinite, imperialShimmer 4.5s linear infinite !important;
    border-color: rgba(230,60,30,.7) !important;
    color: #ffffff !important;
    font-weight: 800 !important;
    letter-spacing: 0.08em !important;
    border-radius: 50px !important;
  }
  /* 牌堆暈染：扶桑橙紅光 */
  .theme-hibiscus .daily-card-back[data-cb] {
    box-shadow: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -1px 0 rgba(230,60,30,.06),
      0 4px 20px rgba(230,60,30,.18), 0 0 18px rgba(255,120,50,.14) !important;
  }
  /* scrollbar 扶桑橙 */
  .theme-hibiscus ::-webkit-scrollbar-thumb {
    background: rgba(230,60,30,.3) !important;
  }
  /* 輸入框 focus 橙紅邊框 */
  .theme-hibiscus input:focus,
  .theme-hibiscus textarea:focus {
    outline: none;
    border-color: rgba(230,60,30,.5) !important;
    box-shadow: 0 0 0 2px rgba(230,60,30,.1) !important;
  }
  @keyframes petalFloat {
    0%,100% { transform: translateY(0) rotate(0deg); opacity:.6; }
    33% { transform: translateY(-6px) rotate(5deg); opacity:.9; }
    66% { transform: translateY(-3px) rotate(-3deg); opacity:.7; }
  }
  /* 底部導航高亮 */
  .theme-hibiscus [data-active="true"] {
    color: #e63c1e !important;
  }
  /* 卡片邊框：橙紅細框 */
  .theme-hibiscus [style*="borderRadius:18"],
  .theme-hibiscus [style*="borderRadius:16"] {
    border-color: rgba(230,60,30,.18) !important;
  }
  /* 頂部 header 底部橙紅漸層線 */
  .theme-hibiscus .nav-header::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg,transparent,rgba(230,60,30,.4),rgba(255,120,40,.6),rgba(230,60,30,.4),transparent);
  }
  /* 分頁 tab active 下的小花裝飾 */
  .theme-hibiscus [style*="pay-btn"] {
    position: relative;
  }
  /* hibiscus sway keyframe（角落花朵用）*/


  /* ── Imperial Theme ── */
  .theme-imperial {
    font-family: "Noto Serif TC", serif;
  }
  .theme-imperial button:not([disabled]) {
    letter-spacing: 0.06em;
  }
  .theme-imperial .pay-btn {
    background-size: 220% auto !important;
  }
  @keyframes imperialShimmer {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
  .theme-imperial .pay-btn:not([disabled]) {
    background: linear-gradient(135deg,#6b4f0a 0%,#c9a84c 25%,#ffe680 45%,#c9a84c 55%,#8a6514 75%,#c9a84c 100%) !important;
    background-size: 250% auto !important;
    animation: payPulse 2.2s ease-in-out infinite, imperialShimmer 4s linear infinite !important;
    border-color: rgba(201,168,76,.9) !important;
    color: #1a0e00 !important;
  }
  @keyframes silverShimmer{
    0%{left:-40%;opacity:.4;}
    50%{left:30%;opacity:.9;}
    100%{left:-40%;opacity:.4;}
  }
  @keyframes monsteraShimmer{
    0%{left:-55%;opacity:0;}
    15%{left:-55%;opacity:0;}
    40%{left:55%;opacity:1;}
    55%{left:55%;opacity:0;}
    100%{left:-55%;opacity:0;}
  }
  @keyframes hibiscusShimmer{
    0%{left:-55%;opacity:0;}
    15%{left:-55%;opacity:0;}
    40%{left:55%;opacity:1;}
    55%{left:55%;opacity:0;}
    100%{left:-55%;opacity:0;}
  }
  @keyframes glassTitleShimmer{
    0%{background-position:200% center;}
    15%{background-position:200% center;}
    40%{background-position:-20% center;}
    55%{background-position:-20% center;}
    100%{background-position:200% center;}
  }
  @keyframes cloudDrift{
    0%{transform:translateX(0) scaleX(1);}
    50%{transform:translateX(8px) scaleX(1.04);}
    100%{transform:translateX(0) scaleX(1);}
  }
  @keyframes cloudFloat{
    0%,100%{transform:translateY(0) translateX(0);}
    33%{transform:translateY(-4px) translateX(3px);}
    66%{transform:translateY(-2px) translateX(-2px);}
  }
  .theme-skyblue .aurora-corner{
    opacity:.75;
    animation:cloudFloat 8s ease-in-out infinite;
  }
  .theme-skyblue .aurora-corner-tr{
    animation-delay:2s;
  }
  .theme-skyblue .aurora-corner-bl{
    animation-delay:4s;
  }
  .theme-skyblue .aurora-corner-br{
    animation-delay:6s;
  }
  @keyframes glowPulse{
    0%,100%{box-shadow:0 0 14px rgba(212,168,67,.25),0 4px 20px rgba(0,0,0,.6);}
    50%{box-shadow:0 0 28px rgba(212,168,67,.5),0 4px 24px rgba(0,0,0,.7);}
  }
  @keyframes payPulse{
    0%,100%{box-shadow:0 0 10px rgba(212,168,67,.3),0 4px 18px rgba(0,0,0,.5);}
    50%{box-shadow:0 0 24px rgba(212,168,67,.6),0 4px 22px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.15);}
  }
  @keyframes cardFlip{
    0%{transform:perspective(600px) rotateY(0deg);opacity:1;}
    45%{transform:perspective(600px) rotateY(90deg);opacity:.4;}
    55%{transform:perspective(600px) rotateY(-90deg);opacity:.4;}
    100%{transform:perspective(600px) rotateY(0deg);opacity:1;}
  }
  @keyframes cardReveal{
    0%{transform:perspective(600px) rotateY(-90deg) scale(.9);opacity:0;}
    60%{transform:perspective(600px) rotateY(8deg) scale(1.02);}
    80%{transform:perspective(600px) rotateY(-4deg);}
    100%{transform:perspective(600px) rotateY(0deg) scale(1);opacity:1;}
  }
  @keyframes shimmer{
    0%{background-position:-200% center;}
    100%{background-position:200% center;}
  }
  @keyframes btnShimmer{
    0%{left:-55%;opacity:0;}
    15%{left:-55%;opacity:0;}
    40%{left:55%;opacity:1;}
    55%{left:55%;opacity:0;}
    100%{left:-55%;opacity:0;}
  }
  @keyframes starTwinkle{
    0%,100%{opacity:.3;transform:scale(1);}
    50%{opacity:1;transform:scale(1.3);}
  }
  @keyframes orbFloat{
    0%,100%{transform:translateY(0) translateX(0) scale(1);}
    33%{transform:translateY(-20px) translateX(10px) scale(1.05);}
    66%{transform:translateY(8px) translateX(-8px) scale(.97);}
  }
  @keyframes navItemIn{
    from{opacity:0;transform:translateY(4px);}
    to{opacity:1;transform:translateY(0);}
  }

  .card-flip-anim { animation: cardFlip 0.7s cubic-bezier(.4,0,.2,1); }
  .card-reveal-anim { animation: cardReveal 0.6s cubic-bezier(.34,1.56,.64,1) forwards; }
  .pay-btn { animation: payPulse 2.2s ease-in-out infinite; }
  .glow-card { animation: glowPulse 3s ease-in-out infinite; }

  @keyframes deckPulse {
    0%,100% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.7), 0 0 20px rgba(160,110,0,0.35); }
    50% { box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.7), 0 0 35px rgba(160,110,0,0.5), 0 2px 8px rgba(196,148,28,0.45); }
  }
  @keyframes spinSlow { to { transform: rotate(360deg); } }
  @keyframes dealIn {
    0%   { opacity: 0; transform: translateY(-55px) scale(0.78); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes twinkle { from { opacity: 0.5; } to { opacity: 1; } }
  @keyframes cardFlash {
    0%   { opacity: 0; }
    30%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ── Daily Fan Page Styles ── */
  .daily-card-slot {
    position: relative;
    width: 68px; height: 110px; flex-shrink: 0;
    cursor: pointer;
    transform-origin: bottom center;
    perspective: 800px;
    transition: transform 0.28s ease;
    margin-right: -10px;
  }
  .daily-card-slot:nth-child(1) { transform: rotate(-18deg) translateY(18px); z-index: 1; }
  .daily-card-slot:nth-child(2) { transform: rotate(-9deg)  translateY(8px);  z-index: 2; }
  .daily-card-slot:nth-child(3) { transform: rotate(0deg)   translateY(0);    z-index: 3; }
  .daily-card-slot:nth-child(4) { transform: rotate(9deg)   translateY(8px);  z-index: 2; }
  .daily-card-slot:nth-child(5) { transform: rotate(18deg)  translateY(18px); z-index: 1; margin-right: 0; }

  .daily-card-slot:nth-child(1).hoverable:hover { transform: rotate(-18deg) translateY(2px)  scale(1.06); z-index: 10; }
  .daily-card-slot:nth-child(2).hoverable:hover { transform: rotate(-9deg)  translateY(-6px) scale(1.06); z-index: 10; }
  .daily-card-slot:nth-child(3).hoverable:hover { transform: rotate(0deg)   translateY(-8px) scale(1.06); z-index: 10; }
  .daily-card-slot:nth-child(4).hoverable:hover { transform: rotate(9deg)   translateY(-6px) scale(1.06); z-index: 10; }
  .daily-card-slot:nth-child(5).hoverable:hover { transform: rotate(18deg)  translateY(2px)  scale(1.06); z-index: 10; }

  .daily-card-slot.selected {
    outline: 1px solid rgba(201,168,76,0.65);
    outline-offset: 2px;
    box-shadow: 0 0 14px rgba(201,168,76,0.35);
    border-radius: 9px;
  }

  .daily-card-inner {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: none;
    opacity: 0;
  }
  .daily-card-inner.dealt {
    opacity: 1;
    transition: transform 0.62s cubic-bezier(0.4, 0.2, 0.2, 1), opacity 0s;
  }
  .daily-card-inner.dealt.flipped {
    transform: rotateY(180deg);
  }

  .daily-card-back, .daily-card-face {
    position: absolute; inset: 0;
    border-radius: 9px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }
  .daily-card-back {
    overflow: hidden;
  }
  .daily-card-back::before { content: ''; position: absolute; inset: 5px;
    border: 1px solid var(--cb-stroke-dim, rgba(196,148,28,0.32)); border-radius: 5px; }

  .daily-card-face {
    transform: rotateY(180deg);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 0; overflow: hidden;
  }
  .daily-card-face.upright {
    background: linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 30%),
      linear-gradient(170deg, #0f0c2a 0%, #090618 50%, #120e30 100%);
    border: 1px solid var(--accent-dim,rgba(201,168,76,0.45));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 20px rgba(0,0,0,0.7), 0 0 16px rgba(201,168,76,0.15);
  }
  .daily-card-face.reversed {
    background: linear-gradient(160deg, rgba(160,100,255,0.05) 0%, transparent 30%),
      linear-gradient(170deg, #100a28 0%, #08060e 50%, #140a24 100%);
    border: 1px solid rgba(140,80,200,0.5);
    box-shadow: inset 0 1px 0 rgba(160,100,255,0.07), 0 4px 20px rgba(0,0,0,0.7), 0 0 16px rgba(120,60,200,0.18);
  }
  .daily-card-face::before { content: ''; position: absolute; top: -20%; left: -10%; width: 50%; height: 140%;
    background: linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.018) 40%,
      rgba(255,255,255,0.045) 50%, transparent 70%);
    transform: skewX(-8deg); pointer-events: none; }
  .daily-cf-content { width: 100%; height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 0; position: relative; }
  .daily-card-face.reversed .daily-cf-content { transform: rotate(180deg); }

  .daily-card-flash { position: absolute; inset: 0; border-radius: 9px; z-index: 20; pointer-events: none;
    background: radial-gradient(circle at center, rgba(201,168,76,0.35) 0%, transparent 70%);
    animation: cardFlash 0.5s ease forwards; }

  .daily-p-dot { width: 6px; height: 6px; border-radius: 3px; background: var(--accent-faint,rgba(201,168,76,0.18));
    border: 1px solid rgba(201,168,76,0.25); transition: all 0.3s; }
  .daily-p-dot.active { background: var(--accent,#c9a84c); box-shadow: 0 0 8px var(--accent-faint,rgba(201,168,76,0.3)); width: 18px; }
  .daily-p-dot.done   { background: var(--accent-dim,rgba(201,168,76,0.5)); border-color: var(--accent-dim,rgba(201,168,76,0.4)); }
`;
