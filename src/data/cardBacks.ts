// 模組 02 — Card Backs（牌背系統）
// 來源：原 Wikiwaitetarot.tsx 第 615–699 行（CARD_BACKS / CARD_BACK_IDS / DEFAULT_CARD_BACK / 全域可變 CB）
// 注意：實際預設牌背為 "classic"（非舊文件寫的 "default"）。

export const CARD_BACKS: Record<string, any> = {
  classic: {
    id:"classic", name:"星夜秘典",
    desc:"神秘深黑底色，金色六芒星圖騰，經典塔羅質感",
    emoji:"🌑", price:0, owned:true,
    bg:"linear-gradient(145deg,rgba(255,220,100,0.06) 0%,transparent 20%,rgba(201,168,76,0.08) 35%,transparent 50%,rgba(180,130,30,0.05) 65%,transparent 80%,rgba(255,200,80,0.04) 100%),linear-gradient(200deg,#1f1500 0%,#0e0900 30%,#1c1300 50%,#0a0700 70%,#1a1100 100%)",
    border:"rgba(196,148,28,0.72)",
    shimmer:"linear-gradient(105deg,transparent 0%,rgba(255,210,80,0.04) 30%,rgba(255,220,100,0.12) 45%,rgba(201,168,76,0.10) 50%,rgba(255,210,80,0.04) 55%,transparent 80%)",
    stroke:"rgba(196,148,28,0.75)", strokeDim:"rgba(196,148,28,0.4)", strokeFaint:"rgba(196,148,28,0.2)",
    dot:"rgba(196,148,28,0.72)", centerDot:"rgba(201,168,76,0.9)", footnote:"rgba(196,148,28,0.6)",
    liftShadow:"rgba(196,148,28,.5)", idleShadow:"rgba(160,110,0,.3)",
    preview: ["#1f1500","#d4a843","#0a0700"],
  },
  silverMoon: {
    id:"silverMoon", name:"月光銀曜",
    desc:"透明玻璃質感，銀色金屬光澤，現代典雅風格",
    emoji:"🌕", price:198, owned:false,
    bg:"rgba(236,240,248,0.05)",
    glow:{ light:"236,240,248", dark:"120,135,165", shimmer:"245,248,255", edge:"168,180,210" },
    border:"rgba(180,185,210,0.8)",
    shimmer:"linear-gradient(115deg,transparent 0%,rgba(255,255,255,0.0) 25%,rgba(255,255,255,0.9) 42%,rgba(220,225,255,0.7) 50%,rgba(255,255,255,0.0) 58%,transparent 80%)",
    stroke:"rgba(160,165,195,0.7)", strokeDim:"rgba(160,165,195,0.35)", strokeFaint:"rgba(160,165,195,0.18)",
    dot:"rgba(160,165,195,0.7)", centerDot:"rgba(140,145,185,0.9)", footnote:"rgba(150,155,185,0.55)",
    liftShadow:"rgba(160,165,210,.45)", idleShadow:"rgba(140,145,200,.2)",
    preview: ["#ffffff","#c0c5d0","#e8eaf0"],
  },
  imperialGold: {
    id:"imperialGold", name:"帝王金箔",
    desc:"極黑宮廷底色，22K金箔紋路，奢華收藏級質感",
    emoji:"👑", price:398, owned:false,
    bg:"/backs/imperial.jpg",
    isImage:true,
    border:"rgba(201,168,76,0.85)",
    shimmer:"linear-gradient(118deg,transparent 0%,transparent 28%,rgba(201,168,76,0.08) 35%,rgba(255,230,120,0.35) 45%,rgba(255,240,160,0.5) 50%,rgba(255,230,120,0.35) 55%,rgba(201,168,76,0.08) 62%,transparent 68%,transparent 100%)",
    stroke:"rgba(201,168,76,0.85)", strokeDim:"rgba(201,168,76,0.45)", strokeFaint:"rgba(201,168,76,0.2)",
    dot:"rgba(201,168,76,0.8)", centerDot:"rgba(255,225,100,0.95)", footnote:"rgba(201,168,76,0.65)",
    liftShadow:"rgba(201,168,76,.6)", idleShadow:"rgba(160,110,0,.4)",
    preview: ["#080604","#c9a84c","#110900"],
  },
  coralReef: {
    id:"coralReef", name:"珊瑚礁潮浪",
    desc:"2026流行色牌背，清透白底搭配青綠光澤，明亮熱帶感",
    emoji:"🌊", price:148, owned:false,
        bg:"/backs/coral.jpg",
    isImage:true,
    bgColor:"#eaf8f6",
    glow:{ light:"212,242,238", dark:"12,74,68", shimmer:"215,248,245", edge:"0,168,150" },
    border:"rgba(0,168,150,0.6)",
    shimmer:"linear-gradient(118deg,transparent 0%,transparent 28%,rgba(255,255,255,0.0) 35%,rgba(180,255,248,0.55) 43%,rgba(255,255,255,0.92) 50%,rgba(180,255,248,0.55) 57%,rgba(255,255,255,0.0) 65%,transparent 72%,transparent 100%)",
    stroke:"rgba(0,168,150,0.65)", strokeDim:"rgba(0,168,150,0.3)", strokeFaint:"rgba(0,168,150,0.14)",
    dot:"rgba(0,168,150,0.6)", centerDot:"rgba(0,180,160,0.85)", footnote:"rgba(0,168,150,0.45)",
    liftShadow:"rgba(0,168,150,.4)", idleShadow:"rgba(0,140,130,.18)",
    preview: ["#eaf8f6","#00a896","#ffffff"],
  },
  hibiscusCard: {
    id:"hibiscusCard", name:"扶桑花語",
    desc:"白底金屬質感，艷紅扶桑花圖騰，帶有南洋奢華風情",
    emoji:"🌺", price:168, owned:false,
    // 白底帶微金屬感漸層
    bg:"/backs/hibiscus.webp",
    border:"rgba(210,60,30,0.72)",
    // 金屬掃光（帶玫瑰金調）
    shimmer:"linear-gradient(118deg,transparent 0%,transparent 25%,rgba(255,220,200,0.04) 33%,rgba(255,180,150,0.38) 43%,rgba(255,255,255,0.85) 50%,rgba(255,180,150,0.38) 57%,rgba(255,220,200,0.04) 67%,transparent 75%,transparent 100%)",
    stroke:"rgba(210,55,25,0.7)", strokeDim:"rgba(210,55,25,0.32)", strokeFaint:"rgba(210,55,25,0.14)",
    // 金色雄蕊點（金屬質感）
    dot:"rgba(200,50,20,0.55)", centerDot:"rgba(220,60,25,0.88)", footnote:"rgba(200,50,20,0.42)",
    liftShadow:"rgba(210,55,25,.38)", idleShadow:"rgba(180,40,15,.16)",
    preview: ["#ffffff","#e63c1e","#f8f5f3"],
    isHibiscus: true,
    isImage: true,
    glow:{ light:"210,225,255", dark:"60,10,5", shimmer:"220,232,255", edge:"210,55,25" },
  },
  hibiscusClear: {
    id:"hibiscusClear", name:"秋楓琉璃",
    desc:"透明琉璃質感，紅金楓葉線描，秋日透光風情",
    emoji:"🍁", price:168, owned:false,
    // 透明底（白底已去背）+ 金屬感
    bg:"/backs/maple.webp",
    bgColor:"transparent",
    border:"rgba(210,60,30,0.72)",
    // 金屬掃光（帶玫瑰金調）
    shimmer:"linear-gradient(118deg,transparent 0%,transparent 25%,rgba(255,220,200,0.04) 33%,rgba(255,180,150,0.38) 43%,rgba(255,255,255,0.85) 50%,rgba(255,180,150,0.38) 57%,rgba(255,220,200,0.04) 67%,transparent 75%,transparent 100%)",
    stroke:"rgba(210,55,25,0.7)", strokeDim:"rgba(210,55,25,0.32)", strokeFaint:"rgba(210,55,25,0.14)",
    // 金色雄蕊點（金屬質感）
    dot:"rgba(200,50,20,0.55)", centerDot:"rgba(220,60,25,0.88)", footnote:"rgba(200,50,20,0.42)",
    liftShadow:"rgba(210,55,25,.38)", idleShadow:"rgba(180,40,15,.16)",
    preview: ["#ffffff","#e63c1e","#f8f5f3"],
    isImage: true,
    glow:{ light:"210,225,255", dark:"60,10,5", shimmer:"220,232,255", edge:"210,55,25" },
  },
  monsteraCard: {
    id:"monsteraCard", name:"龜背芋秘境",
    desc:"深墨綠底，龜背芋葉脈精雕，熱帶叢林的神秘氣息",
    emoji:"🌿", price:188, owned:false,
    // 深墨綠底
    bg:"/backs/monstera.webp",
    border:"rgba(46,125,50,0.75)",
    shimmer:"linear-gradient(105deg,transparent 0%,rgba(129,199,132,0.06) 30%,rgba(165,214,167,0.14) 45%,rgba(129,199,132,0.10) 50%,rgba(165,214,167,0.06) 55%,transparent 80%)",
    stroke:"rgba(46,125,50,0.75)", strokeDim:"rgba(46,125,50,0.32)", strokeFaint:"rgba(46,125,50,0.14)",
    dot:"rgba(56,142,60,0.55)", centerDot:"rgba(76,175,80,0.88)", footnote:"rgba(56,142,60,0.42)",
    liftShadow:"rgba(46,125,50,.38)", idleShadow:"rgba(27,94,32,.16)",
    preview: ["#0f2814","#2e7d32","#1a3d1c"],
    isMonstera: true,
    isImage: true,
    bgColor: "#f0f7f0",
    glow:{ light:"200,235,215", dark:"10,40,15", shimmer:"195,235,212", edge:"46,125,50" },
  },
};
export const CARD_BACK_IDS = Object.keys(CARD_BACKS);
export const DEFAULT_CARD_BACK = "classic";

// 全域牌背（由 App render 時設定）
export const CB: Record<string, any> = Object.assign({}, CARD_BACKS[DEFAULT_CARD_BACK]);
