// 模組 01 — Theme System（主題配色系統）
// 來源：原 Wikiwaitetarot.tsx 第 6–416 行（含 THEMES / THEME_IDS / DEFAULT_THEME / getActiveTheme / 向下相容欄位 / 全域可變 C）
// 拆檔保留原邏輯：C 為「全域可變單例」，App 以 Object.assign(C, THEMES[id]) 更新；所有組件直接 import { C } 讀取。

export const THEMES: Record<string, any> = {
  midnight: {
    id: "midnight",
    name: "星夜秘境",
    desc: "深邃午夜藍，古典金色光芒",
    preview: ["#04060d","#d4a843","#1a3a7a"],
    bg: "#04060d",
    bgGrad: "radial-gradient(ellipse at 20% 50%,rgba(26,58,122,.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(124,58,237,.1) 0%,transparent 50%),#04060d",
    bgCard: "linear-gradient(160deg,#0c1630,#060c1c)",
    bgPanel: "rgba(10,20,48,.72)",
    bgModal: "linear-gradient(170deg,#0b1428,#060c1c)",
    accent: "#d4a843",
    accentDim: "rgba(212,168,67,.5)",
    accentFaint: "rgba(212,168,67,.18)",
    accentGlow: "rgba(212,168,67,.35)",
    blue: "#1a3a7a",
    blueGlow: "rgba(26,58,122,.55)",
    purple: "#7c3aed",
    purpleGlow: "rgba(124,58,237,.4)",
    text: "#cdddf5",
    textDim: "rgba(205,221,245,.5)",
    textFaint: "rgba(205,221,245,.28)",
    green: "#34d399",
    cardBorder: "rgba(196,148,28,0.72)",
    isLight: false,
    gridBg: "rgba(5,10,24,.9)",
    gridBorder: "rgba(26,58,110,.4)",
    navBg: "rgba(4,6,13,.96)",
    navBorder: "rgba(26,58,110,.5)",
  },
  crimson: {
    id: "crimson",
    name: "朱砂煉獄",
    desc: "深紅烈焰，熔金灼灼",
    preview: ["#0d0406","#e87840","#6e1a1a"],
    bg: "#0d0406",
    bgGrad: "radial-gradient(ellipse at 20% 50%,rgba(110,26,26,.25) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(180,60,20,.12) 0%,transparent 50%),#0d0406",
    bgCard: "linear-gradient(160deg,#1e0808,#0d0303)",
    bgPanel: "rgba(40,8,8,.72)",
    bgModal: "linear-gradient(170deg,#1e0a0a,#0d0404)",
    accent: "#e87840",
    accentDim: "rgba(232,120,64,.5)",
    accentFaint: "rgba(232,120,64,.18)",
    accentGlow: "rgba(232,120,64,.35)",
    blue: "#7a1a1a",
    blueGlow: "rgba(122,26,26,.55)",
    purple: "#c0392b",
    purpleGlow: "rgba(192,57,43,.4)",
    text: "#f5e0cd",
    textDim: "rgba(245,224,205,.5)",
    textFaint: "rgba(245,224,205,.28)",
    green: "#e8a030",
    cardBorder: "rgba(232,120,64,0.72)",
    gridBg: "rgba(20,5,5,.9)",
    gridBorder: "rgba(110,26,26,.4)",
    navBg: "rgba(13,4,6,.96)",
    navBorder: "rgba(110,26,26,.5)",
    isLight: false,
  },
  aurora: {
    id: "aurora",
    name: "晨曦花園",
    desc: "清透薄荷，花草圖騰，令人心曠神怡",
    preview: ["#f0f7f4","#5baa8a","#f9c86a"],
    bg: "#f0f7f4",
    bgGrad: "radial-gradient(ellipse at 10% 20%,rgba(91,170,138,.12) 0%,transparent 50%),radial-gradient(ellipse at 90% 80%,rgba(249,200,106,.15) 0%,transparent 50%),linear-gradient(160deg,#f0f7f4,#faf5ec)",
    bgCard: "linear-gradient(160deg,#ffffff,#f3faf7)",
    bgPanel: "rgba(255,255,255,.82)",
    bgModal: "linear-gradient(170deg,#ffffff,#f3faf7)",
    accent: "#5baa8a",
    accentDim: "rgba(91,170,138,.5)",
    accentFaint: "rgba(91,170,138,.15)",
    accentGlow: "rgba(91,170,138,.3)",
    blue: "#7ec8b0",
    blueGlow: "rgba(126,200,176,.4)",
    purple: "#c084fc",
    purpleGlow: "rgba(192,132,252,.3)",
    text: "#2d4a3e",
    textDim: "rgba(45,74,62,.55)",
    textFaint: "rgba(45,74,62,.3)",
    green: "#34a87a",
    cardBorder: "rgba(91,170,138,0.55)",
    gridBg: "rgba(240,247,244,.92)",
    gridBorder: "rgba(91,170,138,.25)",
    navBg: "rgba(255,255,255,.97)",
    navBorder: "rgba(91,170,138,.3)",
    // 裝飾性 token（其他主題為 null）
    decorCorner: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M2,2 Q2,20 20,20" stroke="#5baa8a" stroke-width="1.5" fill="none" opacity="0.5"/><circle cx="5" cy="8" r="2.5" fill="#f9c86a" opacity="0.7"/><circle cx="10" cy="3" r="1.8" fill="#5baa8a" opacity="0.6"/><path d="M8,12 Q12,8 16,14" stroke="#c084fc" stroke-width="1" fill="none" opacity="0.45"/><circle cx="18" cy="5" r="1.2" fill="#f9c86a" opacity="0.5"/></svg>`,
    decorDivider: `<svg viewBox="0 0 120 12" xmlns="http://www.w3.org/2000/svg"><path d="M0,6 Q30,2 60,6 Q90,10 120,6" stroke="#5baa8a" stroke-width="1" fill="none" opacity="0.4"/><circle cx="60" cy="6" r="2.5" fill="#f9c86a" opacity="0.8"/><circle cx="45" cy="5" r="1.5" fill="#5baa8a" opacity="0.5"/><circle cx="75" cy="7" r="1.5" fill="#5baa8a" opacity="0.5"/></svg>`,
    decorPanelBorder: "1px solid rgba(91,170,138,.35)",
    decorBorderRadius: "18px",
    decorScrollbar: "rgba(91,170,138,.35)",
    isLight: true,
  },
  skyblue: {
    id: "skyblue",
    name: "藍天白雲",
    desc: "晴空碧藍，白雲悠悠，令人心曠神怡",
    preview: ["#e8f4fd","#3b8fd4","#f0f8ff"],
    bg: "#e8f4fd",
    bgGrad: "radial-gradient(ellipse at 15% 15%,rgba(255,255,255,.9) 0%,transparent 40%),radial-gradient(ellipse at 85% 20%,rgba(255,255,255,.7) 0%,transparent 35%),radial-gradient(ellipse at 50% 0%,rgba(180,220,255,.5) 0%,transparent 60%),linear-gradient(180deg,#c8e8fa 0%,#ddf0ff 40%,#f0f8ff 70%,#fafcff 100%)",
    bgCard: "linear-gradient(160deg,rgba(255,255,255,.95),rgba(235,247,255,.9))",
    bgPanel: "rgba(255,255,255,.85)",
    bgModal: "linear-gradient(170deg,rgba(255,255,255,.98),rgba(235,247,255,.95))",
    accent: "#3b8fd4",
    accentDim: "rgba(59,143,212,.5)",
    accentFaint: "rgba(59,143,212,.12)",
    accentGlow: "rgba(59,143,212,.3)",
    blue: "#1a6faa",
    blueGlow: "rgba(26,111,170,.4)",
    purple: "#7c9fd4",
    purpleGlow: "rgba(124,159,212,.35)",
    text: "#1a3a5c",
    textDim: "rgba(26,58,92,.55)",
    textFaint: "rgba(26,58,92,.3)",
    green: "#2eaa7a",
    cardBorder: "rgba(59,143,212,0.45)",
    gridBg: "rgba(235,247,255,.9)",
    gridBorder: "rgba(59,143,212,.2)",
    navBg: "rgba(255,255,255,.97)",
    navBorder: "rgba(59,143,212,.2)",
    decorCorner: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="18" rx="10" ry="6" fill="rgba(255,255,255,.9)" opacity="0.9"/>
      <ellipse cx="20" cy="15" rx="8" ry="5" fill="rgba(255,255,255,.95)" opacity="0.9"/>
      <ellipse cx="28" cy="17" rx="7" ry="4.5" fill="rgba(255,255,255,.85)" opacity="0.85"/>
      <ellipse cx="8" cy="32" rx="6" ry="3.5" fill="rgba(255,255,255,.7)" opacity="0.7"/>
      <ellipse cx="18" cy="30" rx="5" ry="3" fill="rgba(255,255,255,.65)" opacity="0.65"/>
      <circle cx="38" cy="10" r="2" fill="rgba(59,143,212,.35)" opacity="0.6"/>
      <circle cx="42" cy="16" r="1.5" fill="rgba(59,143,212,.3)" opacity="0.5"/>
      <circle cx="35" cy="22" r="1" fill="rgba(59,143,212,.25)" opacity="0.4"/>
      <path d="M2,42 Q8,36 14,40 Q18,34 24,38" stroke="rgba(59,143,212,.2)" stroke-width="1" fill="none"/>
    </svg>`,
    decorDivider: `<svg viewBox="0 0 160 16" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="8" rx="18" ry="6" fill="rgba(255,255,255,.8)" opacity="0.8"/>
      <ellipse cx="44" cy="6" rx="12" ry="5" fill="rgba(255,255,255,.85)" opacity="0.85"/>
      <ellipse cx="80" cy="7" rx="15" ry="5.5" fill="rgba(255,255,255,.8)" opacity="0.8"/>
      <ellipse cx="93" cy="5" rx="10" ry="4" fill="rgba(255,255,255,.75)" opacity="0.75"/>
      <ellipse cx="128" cy="8" rx="14" ry="5" fill="rgba(255,255,255,.8)" opacity="0.8"/>
      <ellipse cx="140" cy="6" rx="9" ry="4" fill="rgba(255,255,255,.7)" opacity="0.7"/>
      <circle cx="80" cy="14" r="1.5" fill="rgba(59,143,212,.4)"/>
      <circle cx="68" cy="13" r="1" fill="rgba(59,143,212,.3)"/>
      <circle cx="92" cy="13" r="1" fill="rgba(59,143,212,.3)"/>
    </svg>`,
    decorPanelBorder: "1px solid rgba(59,143,212,.25)",
    decorBorderRadius: "20px",
    decorScrollbar: "rgba(59,143,212,.3)",
    isLight: true,
  },
  imperial: {
    id: "imperial",
    name: "帝王黑金",
    desc: "極黑底蘊，22K流金紋路，奢華宮廷質感",
    preview: ["#080608","#c9a84c","#1a1008"],
    bg: "#080608",
    bgGrad: "radial-gradient(ellipse at 15% 25%,rgba(201,168,76,.08) 0%,transparent 45%),radial-gradient(ellipse at 85% 75%,rgba(180,140,40,.06) 0%,transparent 45%),radial-gradient(ellipse at 50% 0%,rgba(201,168,76,.04) 0%,transparent 40%),#080608",
    bgCard: "linear-gradient(160deg,#110e00,#0a0800)",
    bgPanel: "rgba(18,14,4,.88)",
    bgModal: "linear-gradient(170deg,#140f02,#0a0800)",
    accent: "#c9a84c",
    accentDim: "rgba(201,168,76,.55)",
    accentFaint: "rgba(201,168,76,.12)",
    accentGlow: "rgba(201,168,76,.32)",
    blue: "#2a1f00",
    blueGlow: "rgba(42,31,0,.6)",
    purple: "#7a5c1e",
    purpleGlow: "rgba(122,92,30,.4)",
    text: "#f0e6c8",
    textDim: "rgba(240,230,200,.55)",
    textFaint: "rgba(240,230,200,.28)",
    green: "#b8922a",
    cardBorder: "rgba(201,168,76,0.65)",
    gridBg: "rgba(12,10,2,.92)",
    gridBorder: "rgba(201,168,76,.18)",
    navBg: "rgba(8,6,8,.98)",
    navBorder: "rgba(201,168,76,.22)",
    decorCorner: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M2,2 L14,2 L14,4 L4,4 L4,14 L2,14 Z" fill="rgba(201,168,76,.6)"/>
      <path d="M2,2 L8,2 L8,3 L3,3 L3,8 L2,8 Z" fill="rgba(201,168,76,.9)"/>
      <line x1="2" y1="18" x2="2" y2="22" stroke="rgba(201,168,76,.4)" stroke-width="1"/>
      <line x1="18" y1="2" x2="22" y2="2" stroke="rgba(201,168,76,.4)" stroke-width="1"/>
      <circle cx="8" cy="8" r="1.5" fill="rgba(201,168,76,.5)"/>
      <path d="M16,16 Q20,12 24,16" stroke="rgba(201,168,76,.25)" stroke-width="0.8" fill="none"/>
      <circle cx="24" cy="4" r="1" fill="rgba(201,168,76,.3)"/>
      <circle cx="4" cy="24" r="1" fill="rgba(201,168,76,.3)"/>
    </svg>`,
    decorDivider: `<svg viewBox="0 0 160 12" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="6" x2="65" y2="6" stroke="rgba(201,168,76,.3)" stroke-width="0.8"/>
      <line x1="95" y1="6" x2="160" y2="6" stroke="rgba(201,168,76,.3)" stroke-width="0.8"/>
      <polygon points="80,2 84,6 80,10 76,6" fill="rgba(201,168,76,.7)"/>
      <polygon points="80,3.5 82.5,6 80,8.5 77.5,6" fill="rgba(201,168,76,.9)"/>
      <circle cx="68" cy="6" r="1.5" fill="rgba(201,168,76,.5)"/>
      <circle cx="92" cy="6" r="1.5" fill="rgba(201,168,76,.5)"/>
      <circle cx="60" cy="6" r="1" fill="rgba(201,168,76,.3)"/>
      <circle cx="100" cy="6" r="1" fill="rgba(201,168,76,.3)"/>
    </svg>`,
    isLight: false,
  },

  summer2026: {
    id: "summer2026",
    name: "仲夏珊瑚礁",
    desc: "2026流行色｜Teal青｜Fuchsia桃｜清爽明亮仲夏感",
    preview: ["#e8f8f6","#00a896","#e8406a"],
    bg: "#eaf8f6",
    bgGrad: "linear-gradient(rgba(234,248,246,0.6),rgba(238,250,249,0.75)), url(/themes/seawave.jpg) center/cover no-repeat",
    bgCard: "linear-gradient(160deg,#ffffff,#edfaf8)",
    bgPanel: "rgba(255,255,255,.88)",
    bgModal: "linear-gradient(170deg,#ffffff,#edfaf8)",
    accent: "#00a896",
    accentDim: "rgba(0,168,150,.5)",
    accentFaint: "rgba(0,168,150,.12)",
    accentGlow: "rgba(0,168,150,.3)",
    blue: "#0077c8",
    blueGlow: "rgba(0,119,200,.4)",
    purple: "#e8406a",
    purpleGlow: "rgba(232,64,106,.35)",
    text: "#0d3a36",
    textDim: "rgba(13,58,54,.55)",
    textFaint: "rgba(13,58,54,.3)",
    green: "#00b894",
    cardBorder: "rgba(0,168,150,0.5)",
    gridBg: "rgba(234,248,246,.92)",
    gridBorder: "rgba(0,168,150,.2)",
    navBg: "rgba(255,255,255,.97)",
    navBorder: "rgba(0,168,150,.22)",
    decorCorner: `<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="5" fill="none" stroke="rgba(0,201,184,.5)" stroke-width="1"/>
      <circle cx="8" cy="8" r="2" fill="rgba(0,201,184,.7)"/>
      <path d="M14,8 Q22,4 28,12 Q34,20 28,28" stroke="rgba(0,201,184,.3)" stroke-width="1" fill="none"/>
      <circle cx="30" cy="6" r="1.5" fill="rgba(232,64,106,.6)"/>
      <circle cx="18" cy="3" r="1" fill="rgba(232,64,106,.4)"/>
      <circle cx="6" cy="20" r="1.5" fill="rgba(24,100,200,.5)"/>
      <path d="M3,28 Q6,24 10,26 Q14,28 12,32" stroke="rgba(0,201,184,.25)" stroke-width="0.8" fill="none"/>
      <circle cx="22" cy="14" r="1" fill="rgba(0,225,160,.5)"/>
      <circle cx="4" cy="34" r="1" fill="rgba(0,201,184,.3)"/>
    </svg>`,
    decorDivider: `<svg viewBox="0 0 160 14" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="7" x2="55" y2="7" stroke="rgba(0,201,184,.3)" stroke-width="0.8"/>
      <line x1="105" y1="7" x2="160" y2="7" stroke="rgba(0,201,184,.3)" stroke-width="0.8"/>
      <circle cx="80" cy="7" r="4" fill="none" stroke="rgba(0,201,184,.6)" stroke-width="1"/>
      <circle cx="80" cy="7" r="1.5" fill="rgba(0,201,184,.9)"/>
      <circle cx="64" cy="7" r="2" fill="rgba(232,64,106,.5)"/>
      <circle cx="96" cy="7" r="2" fill="rgba(232,64,106,.5)"/>
      <circle cx="58" cy="7" r="1" fill="rgba(0,201,184,.3)"/>
      <circle cx="102" cy="7" r="1" fill="rgba(0,201,184,.3)"/>
    </svg>`,
    isLight: true,
  },

  hibiscus: {
    id: "hibiscus",
    name: "扶桑盛夏",
    desc: "熱烈扶桑，南洋花火，明亮如夏日正午的熱情",
    preview: ["#fff5f0","#e63c1e","#ff8c2a"],
    bg: "#fff3ee",
    bgGrad: "url('data:image/webp;base64,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') center/380px repeat, linear-gradient(160deg,rgba(255,248,244,.95) 0%,rgba(255,245,240,.95) 100%)",
    bgCard: "linear-gradient(160deg,rgba(255,255,255,.95),rgba(255,244,238,.9))",
    bgPanel: "rgba(255,255,255,.88)",
    bgModal: "linear-gradient(170deg,rgba(255,255,255,.98),rgba(255,244,238,.95))",
    accent: "#e63c1e",
    accentDim: "rgba(230,60,30,.5)",
    accentFaint: "rgba(230,60,30,.1)",
    accentGlow: "rgba(230,60,30,.28)",
    blue: "#e87830",
    blueGlow: "rgba(232,120,48,.4)",
    purple: "#c0392b",
    purpleGlow: "rgba(192,57,43,.35)",
    text: "#3d0a00",
    textDim: "rgba(61,10,0,.55)",
    textFaint: "rgba(61,10,0,.3)",
    green: "#2e8b3a",
    cardBorder: "rgba(230,60,30,0.45)",
    gridBg: "rgba(255,243,238,.88)",
    gridBorder: "rgba(230,60,30,.16)",
    navBg: "rgba(255,252,250,.97)",
    navBorder: "rgba(230,60,30,.18)",
    decorCorner: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
  <!-- 扶桑花瓣（左上角，5片，放射形）-->
  <!-- 花瓣1 -->
  <path d="M8,28 C4,20 6,8 14,4 C10,12 12,22 18,26 Z" fill="rgba(230,60,30,.55)" opacity="0.85"/>
  <!-- 花瓣2 -->
  <path d="M8,28 C2,24 0,12 6,6 C10,14 14,22 18,26 Z" fill="rgba(240,80,20,.5)" opacity="0.8"/>
  <!-- 花瓣3 -->
  <path d="M8,28 C0,28 -2,16 4,10 C10,18 14,24 18,26 Z" fill="rgba(220,50,40,.45)" opacity="0.75"/>
  <!-- 花托 -->
  <circle cx="18" cy="26" r="3.5" fill="rgba(240,120,40,.7)"/>
  <!-- 雄蕊柱 -->
  <line x1="18" y1="26" x2="10" y2="14" stroke="rgba(255,160,20,.6)" stroke-width="1"/>
  <circle cx="10" cy="13" r="1.2" fill="rgba(255,200,40,.8)"/>
  <circle cx="12" cy="10" r="1" fill="rgba(255,180,30,.7)"/>
  <circle cx="8" cy="11" r="0.9" fill="rgba(255,200,40,.7)"/>
  <!-- 葉子 -->
  <path d="M20,30 Q28,22 34,28 Q28,32 20,30 Z" fill="rgba(60,140,60,.4)" opacity="0.7"/>
  <path d="M22,32 Q30,28 32,36 Q24,36 22,32 Z" fill="rgba(40,120,40,.35)" opacity="0.6"/>
  <!-- 小花苞 -->
  <ellipse cx="34" cy="12" rx="3" ry="5" fill="rgba(240,80,30,.35)" transform="rotate(-30 34 12)"/>
  <path d="M34,17 Q32,20 34,22" stroke="rgba(60,140,60,.4)" stroke-width="0.8" fill="none"/>
  <!-- 花粉點 -->
  <circle cx="26" cy="8" r="1" fill="rgba(255,200,40,.5)"/>
  <circle cx="30" cy="6" r="0.8" fill="rgba(255,180,30,.45)"/>
  <circle cx="38" cy="18" r="1" fill="rgba(255,200,40,.45)"/>
</svg>`,
    decorDivider: `<svg viewBox="0 0 180 18" xmlns="http://www.w3.org/2000/svg">
  <!-- 左線 -->
  <line x1="0" y1="9" x2="58" y2="9" stroke="rgba(230,60,30,.3)" stroke-width="0.8"/>
  <!-- 右線 -->
  <line x1="122" y1="9" x2="180" y2="9" stroke="rgba(230,60,30,.3)" stroke-width="0.8"/>
  <!-- 中央扶桑花（簡化版）-->
  <path d="M90,9 C88,5 84,3 82,6 C85,7 88,8 90,9 Z" fill="rgba(230,60,30,.65)"/>
  <path d="M90,9 C88,13 84,15 82,12 C85,11 88,10 90,9 Z" fill="rgba(240,80,20,.6)"/>
  <path d="M90,9 C94,7 97,3 94,2 C93,5 92,7 90,9 Z" fill="rgba(220,50,40,.6)"/>
  <path d="M90,9 C94,11 97,15 94,16 C93,13 92,11 90,9 Z" fill="rgba(230,70,30,.55)"/>
  <path d="M90,9 C86,9 83,7 84,5 C87,6 89,7 90,9 Z" fill="rgba(240,90,20,.5)"/>
  <circle cx="90" cy="9" r="2.2" fill="rgba(255,140,30,.8)"/>
  <circle cx="90" cy="9" r="1" fill="rgba(255,200,60,.9)"/>
  <!-- 側邊花苞 -->
  <ellipse cx="68" cy="9" rx="2.5" ry="4" fill="rgba(240,80,30,.4)" transform="rotate(-15 68 9)"/>
  <ellipse cx="112" cy="9" rx="2.5" ry="4" fill="rgba(240,80,30,.4)" transform="rotate(15 112 9)"/>
  <!-- 葉片 -->
  <path d="M74,9 Q78,5 82,8 Q78,11 74,9 Z" fill="rgba(60,140,60,.35)"/>
  <path d="M98,9 Q102,5 106,8 Q102,11 98,9 Z" fill="rgba(60,140,60,.35)"/>
</svg>`,
    isLight: true,
  },


  monstera: {
    id: "monstera",
    name: "龜背芋秘境",
    desc: "深邃熱帶叢林，龜背芋葉影婆娑，神秘又生機盎然",
    preview: ["#e8f5e9","#2e7d32","#81c784"],
    bg: "#e8f5e9",
    bgGrad: "url('data:image/webp;base64,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') center/380px repeat, linear-gradient(160deg,rgba(245,250,246,.95) 0%,rgba(238,247,240,.95) 100%)",
    bgCard: "linear-gradient(160deg,rgba(255,255,255,.96),rgba(232,245,233,.92))",
    bgPanel: "rgba(255,255,255,.88)",
    bgModal: "linear-gradient(170deg,rgba(255,255,255,.98),rgba(232,245,233,.95))",
    accent: "#2e7d32",
    accentDim: "rgba(46,125,50,.5)",
    accentFaint: "rgba(46,125,50,.1)",
    accentGlow: "rgba(46,125,50,.28)",
    blue: "#388e3c",
    blueGlow: "rgba(56,142,60,.4)",
    purple: "#1b5e20",
    purpleGlow: "rgba(27,94,32,.35)",
    text: "#0a2e0c",
    textDim: "rgba(10,46,12,.55)",
    textFaint: "rgba(10,46,12,.3)",
    green: "#2e7d32",
    cardBorder: "rgba(46,125,50,0.45)",
    gridBg: "rgba(232,245,233,.88)",
    gridBorder: "rgba(46,125,50,.16)",
    navBg: "rgba(250,255,250,.97)",
    navBorder: "rgba(46,125,50,.18)",
    decorCorner: `<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
  <!-- 龜背芋葉（左上角）-->
  <path d="M4,28 C4,10 16,2 28,4 C20,10 14,18 12,28 Z" fill="rgba(46,125,50,.55)" opacity="0.85"/>
  <path d="M4,28 C2,16 8,6 16,4 C14,12 12,20 12,28 Z" fill="rgba(56,142,60,.5)" opacity="0.8"/>
  <path d="M4,28 C0,20 2,8 10,4 C12,12 12,22 12,28 Z" fill="rgba(27,94,32,.45)" opacity="0.75"/>
  <!-- 葉脈 -->
  <line x1="8" y1="28" x2="28" y2="8" stroke="rgba(129,199,132,.6)" stroke-width="1"/>
  <line x1="8" y1="28" x2="24" y2="12" stroke="rgba(129,199,132,.4)" stroke-width="0.6"/>
  <!-- 龜背芋鏤空（characteristic holes）-->
  <ellipse cx="16" cy="14" rx="2.5" ry="4" fill="rgba(232,245,233,.8)" transform="rotate(-35 16 14)" opacity="0.9"/>
  <ellipse cx="22" cy="20" rx="2" ry="3.5" fill="rgba(232,245,233,.8)" transform="rotate(-35 22 20)" opacity="0.85"/>
  <!-- 小葉 -->
  <path d="M28,28 Q36,20 40,28 Q36,34 28,28 Z" fill="rgba(46,125,50,.35)" opacity="0.7"/>
</svg>`,
    decorDivider: `<svg viewBox="0 0 180 18" xmlns="http://www.w3.org/2000/svg">
  <!-- 左線 -->
  <line x1="0" y1="9" x2="58" y2="9" stroke="rgba(46,125,50,.3)" stroke-width="0.8"/>
  <!-- 右線 -->
  <line x1="122" y1="9" x2="180" y2="9" stroke="rgba(46,125,50,.3)" stroke-width="0.8"/>
  <!-- 中央龜背芋葉（簡化版）-->
  <path d="M90,2 C84,2 80,6 80,11 C84,8 88,7 90,9 Z" fill="rgba(46,125,50,.65)"/>
  <path d="M90,16 C84,16 80,12 80,9 C84,10 88,10 90,9 Z" fill="rgba(56,142,60,.6)"/>
  <path d="M90,2 C96,2 100,6 100,11 C96,8 92,7 90,9 Z" fill="rgba(27,94,32,.6)"/>
  <path d="M90,16 C96,16 100,12 100,9 C96,10 92,10 90,9 Z" fill="rgba(46,125,50,.55)"/>
  <!-- 鏤空 -->
  <ellipse cx="86" cy="7" rx="1.2" ry="2" fill="rgba(220,240,222,.9)" transform="rotate(-20 86 7)"/>
  <ellipse cx="94" cy="7" rx="1.2" ry="2" fill="rgba(220,240,222,.9)" transform="rotate(20 94 7)"/>
  <circle cx="90" cy="9" r="1.8" fill="rgba(129,199,132,.8)"/>
  <!-- 側邊小葉 -->
  <path d="M68,9 Q72,5 76,8 Q72,12 68,9 Z" fill="rgba(46,125,50,.35)"/>
  <path d="M104,9 Q108,5 112,8 Q108,12 104,9 Z" fill="rgba(46,125,50,.35)"/>
</svg>`,
    isLight: true,
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = "midnight";

// 取得當前主題（從 localStorage 或預設）
export const getActiveTheme = () => {
  try {
    const saved = localStorage.getItem("active_theme");
    if(saved && THEMES[saved]) return THEMES[saved];
  } catch{}
  return THEMES[DEFAULT_THEME];
};

// 為每個主題補上 gold/goldDim/goldFaint 向下相容欄位
Object.keys(THEMES).forEach(k=>{
  const t=THEMES[k];
  t.gold=t.accent;
  t.goldDim=t.accentDim;
  t.goldFaint=t.accentFaint;
});

// C = 當前主題物件，App render 時透過 Object.assign 更新
export const C: Record<string, any> = Object.assign({}, THEMES[DEFAULT_THEME]);
