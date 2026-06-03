// 模組 06 — Diviners（占卜師 / 項目 / 排班 / 分類 / 機器人台詞）
// 來源：原 Wikiwaitetarot.tsx 第 945–1022 行 + 第 1168–1169 行。
// 注意：specialty 是字串（非陣列）、無 badge 欄位；排班用 blocked/full/slots 三欄、星期幾為 key（0=日）。
// getDayStatus 回傳 available/blocked/full（非舊文件寫的 available/busy/off）。

export const DIVINERS=[
  {id:1,name:"月影師 Luna",avatar:"🌙",rating:4.9,reviews:328,specialty:"感情・事業",online:true,price:300,desc:"20年塔羅經驗，擅長以星象結合大阿爾克那深度解讀感情迷局。"},
  {id:2,name:"星塵師 Stella",avatar:"⭐",rating:4.7,reviews:156,specialty:"財運・健康",online:true,price:250,desc:"占星結合塔羅，以宇宙能量流動分析財運與身心健康走向。"},
  {id:3,name:"暗夜師 Nox",avatar:"🔮",rating:4.8,reviews:412,specialty:"轉變・靈性",online:false,price:350,desc:"專精大阿爾克那的深邃轉化能量，引領靈性覺醒與生命蛻變。"},
  {id:4,name:"晨曦師 Aurora",avatar:"🌅",rating:4.6,reviews:89,specialty:"家庭・療癒",online:true,price:200,desc:"溫柔療癒系，以愛的頻率解讀家庭關係與心靈修復之道。"},
];


// ── 占卜項目資料 ──────────────────────────────────────────────────────────────
export const DIVINATION_ITEMS=[
  {id:"basic",name:"單牌指引",emoji:"🃏",desc:"抽一張牌，針對單一問題給予直接指引",duration:"15 分鐘",price:0,priceLabel:"依占卜師定價"},
  {id:"three",name:"三牌陣解讀",emoji:"🔯",desc:"過去・現在・未來，完整脈絡分析",duration:"30 分鐘",price:0,priceLabel:"定價 × 1.5 倍"},
  {id:"celtic",name:"凱爾特十字",emoji:"✦",desc:"十張牌深度解讀，全面剖析處境與潛能",duration:"60 分鐘",price:0,priceLabel:"定價 × 2 倍"},
  {id:"love",name:"感情專項",emoji:"💑",desc:"感情運勢、對方心意、關係走向全面解析",duration:"45 分鐘",price:0,priceLabel:"定價 × 1.8 倍"},
  {id:"career",name:"事業財運",emoji:"💼",desc:"職涯方向、財運趨勢、機遇與阻礙解讀",duration:"45 分鐘",price:0,priceLabel:"定價 × 1.8 倍"},
  {id:"annual",name:"年度星盤",emoji:"🌌",desc:"結合占星與塔羅，解讀全年運勢走向",duration:"90 分鐘",price:0,priceLabel:"定價 × 3 倍"},
];
export const ITEM_MULTIPLIER={basic:1,three:1.5,celtic:2,love:1.8,career:1.8,annual:3};

// ── 占卜師排班資料 ────────────────────────────────────────────────────────────
// blocked: 不開放日期 (YYYY-MM-DD)；full: 額滿日期；slots: 各星期幾的開放時段 (0=日)
export const DIVINER_SCHEDULE: Record<string, any> = {
  1:{ // 月影師 Luna
    blocked:["2026-06-05","2026-06-12","2026-06-19"],
    full:["2026-06-03","2026-06-10","2026-06-17","2026-06-24"],
    slots:{1:["10:00","11:00","14:00","15:00","19:00","20:00"],
           2:["10:00","11:00","14:00","15:00","19:00","20:00"],
           3:["10:00","11:00","14:00","15:00","19:00","20:00"],
           4:["10:00","11:00","14:00","15:00","19:00","20:00"],
           5:["10:00","11:00","14:00","15:00","19:00","20:00"],
           6:["14:00","15:00","16:00","19:00","20:00","21:00"]}
  },
  2:{ // 星塵師 Stella
    blocked:["2026-06-07","2026-06-14","2026-06-21","2026-06-28"],
    full:["2026-06-02","2026-06-09"],
    slots:{1:["13:00","14:00","15:00","20:00","21:00"],
           2:["13:00","14:00","15:00","20:00","21:00"],
           3:["13:00","14:00","15:00","20:00","21:00"],
           5:["13:00","14:00","15:00","20:00","21:00"],
           6:["10:00","11:00","13:00","14:00","15:00","16:00","19:00","20:00","21:00"]}
  },
  3:{ // 暗夜師 Nox
    blocked:["2026-06-01","2026-06-08","2026-06-15","2026-06-22","2026-06-29"],
    full:[],
    slots:{2:["20:00","21:00"],
           4:["20:00","21:00"],
           6:["19:00","20:00","21:00"],
           0:["19:00","20:00","21:00"]}
  },
  4:{ // 晨曦師 Aurora
    blocked:["2026-06-13","2026-06-20"],
    full:["2026-06-06","2026-06-07"],
    slots:{1:["10:00","11:00","13:00","14:00","15:00","16:00"],
           2:["10:00","11:00","13:00","14:00","15:00","16:00"],
           3:["10:00","11:00","13:00","14:00","15:00","16:00"],
           4:["10:00","11:00","13:00","14:00","15:00","16:00"],
           5:["10:00","11:00","13:00","14:00","15:00","16:00"]}
  },
};

// 取得某位占卜師在某日期的可預約狀態
export function getDayStatus(divId,dateStr){
  const sch=DIVINER_SCHEDULE[divId];
  if(!sch)return"available";
  if(sch.blocked.includes(dateStr))return"blocked";
  if(sch.full.includes(dateStr))return"full";
  const dow=new Date(dateStr).getDay();
  if(!sch.slots[dow])return"blocked";
  return"available";
}
export function getSlots(divId,dateStr){
  const sch=DIVINER_SCHEDULE[divId];
  if(!sch)return[];
  const dow=new Date(dateStr).getDay();
  return sch.slots[dow]||[];
}
// 所有可預約時段（用於顯示時間格）
export const ALL_SLOTS=["10:00","11:00","13:00","14:00","15:00","16:00","19:00","20:00","21:00"];

export const CATEGORIES=["感情","事業","財運","健康","家庭","靈性","轉變","療癒"];
export const BOT_MSGS=["請將問題默念三次，感受牌的能量…","很好，讓我們從牌陣開始…","這張牌揭示你內心深處的渴望…","逆位代表需要重新審視這個課題…","整體牌陣顯示轉變的契機即將到來…"];
