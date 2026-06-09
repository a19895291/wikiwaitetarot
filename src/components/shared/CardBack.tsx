// 模組 11 — CardBack（牌背面組件）
// 圖片型牌背（CB.isImage）：不畫外框、六芒星、底部 ✦，只鋪圖片。
// 通用金屬光影：牌背若帶 CB.glow={light,dark,shimmer,edge}，就疊冷光光影層 + 青/綠/紅可調掃光（沿用龜背芋那套，顏色由資料決定）。
// 一般漸層牌背走六芒星圖騰；silverMoon 走 isLight 的白底掃光。
import { CB } from "../../data/cardBacks";
import { cbBgStyle } from "./cbBgStyle";

export function CardBack({w=48,h=72,style={},lifting=false}){
  const sc=w/68;
  const isLight=CB.id==="silverMoon";
  const isImage=!!CB.isImage || !!CB.image
    || (typeof CB.bg==="string" && (/^(data:|https?:|\/)/).test(CB.bg));
  const g=CB.glow; // 通用光影設定（有才畫光影層）

  const boxShadow = g
    ? (lifting
        ? `inset 0 2px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.2),0 14px 35px rgba(0,0,0,.45),0 0 28px rgba(${g.edge},.5),0 0 0 1px rgba(${g.edge},.2)`
        : `inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.15),0 6px 20px rgba(0,0,0,.3),0 0 18px rgba(${g.edge},.35),0 0 0 1px rgba(${g.edge},.18)`)
    : (lifting
        ? `inset 0 1px 0 rgba(255,255,255,.${isLight?"6":"07"}),0 12px 30px rgba(0,0,0,.${isLight?"3":"7"}),0 0 24px ${CB.liftShadow}`
        : `inset 0 1px 0 rgba(255,255,255,.${isLight?"5":"07"}),0 4px 16px rgba(0,0,0,.${isLight?"2":"6"}),0 0 14px ${CB.idleShadow}`);

  return <div style={{
    width:w, height:h, borderRadius:9,
    ...cbBgStyle(),
    border:isImage?`none`:`1px solid ${CB.border}`,
    display:"flex",alignItems:"center",justifyContent:"center",
    position:"relative",flexShrink:0,overflow:"hidden",
    transition:"transform .3s ease, box-shadow .3s ease",
    transform:lifting?"translateY(-6px) scale(1.05)":"none",
    boxShadow,
    ...style
  }}>
    {/* 通用金屬光影（glow） */}
    {g&&<>
      {/* 頂部冷光 */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"20%",
        background:`linear-gradient(180deg,rgba(${g.light},.28) 0%,rgba(${g.light},.10) 60%,transparent 100%)`,
        pointerEvents:"none",zIndex:4,borderRadius:"9px 9px 0 0"}}/>
      {/* 左側受光 */}
      <div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",
        background:`linear-gradient(90deg,rgba(${g.light},.20) 0%,rgba(${g.light},.08) 55%,transparent 100%)`,
        pointerEvents:"none",zIndex:4}}/>
      {/* 右下暗角 */}
      <div style={{position:"absolute",inset:0,
        background:`linear-gradient(135deg,transparent 40%,rgba(${g.dark},.18) 100%)`,
        pointerEvents:"none",zIndex:4,borderRadius:9}}/>
      {/* 斜面光影 */}
      <div style={{position:"absolute",inset:0,
        background:`linear-gradient(145deg,rgba(${g.light},.16) 0%,rgba(${g.light},.05) 30%,transparent 55%,rgba(${g.dark},.08) 100%)`,
        pointerEvents:"none",zIndex:4,borderRadius:9}}/>
      {/* 底部陰影 */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",
        background:`linear-gradient(0deg,rgba(${g.dark},.17) 0%,transparent 100%)`,
        pointerEvents:"none",zIndex:4}}/>
    </>}
    {/* silverMoon：0.2 冷白薄膜遮層（疊在光影之上、掃光之下） */}
    {isLight&&<div style={{position:"absolute",inset:0,
      background:"rgba(236,240,248,0.05)",
      pointerEvents:"none",zIndex:5,borderRadius:9}}/>}
    {/* 外框 - 圖片型牌背不顯示 */}
    {!isImage&&<div style={{position:"absolute",inset:Math.round(4*sc),
      border:`1px solid ${CB.strokeDim}`,
      borderRadius:5,pointerEvents:"none",zIndex:3}}/>}
    {/* 掃光 */}
    <div style={{position:"absolute",top:"-40%",left:"-35%",width:"45%",height:"180%",
      background:g
        ?`linear-gradient(105deg,transparent 0%,transparent 28%,rgba(${g.shimmer},0.45) 43%,rgba(${g.shimmer},0.68) 50%,rgba(${g.shimmer},0.45) 57%,transparent 72%,transparent 100%)`
        :CB.shimmer,
      transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,
      animation:g?"monsteraShimmer 2.8s ease-in-out infinite":isLight?"silverShimmer 3s ease-in-out infinite":"none"}}/>
    {/* 非圖片型：六芒星圖騰 */}
    {!isImage&&<svg viewBox="0 0 60 70" width={Math.round(36*sc)} height={Math.round(42*sc)} fill="none" style={{position:"relative",zIndex:2}}>
      <polygon points="30,3 57,18 57,52 30,67 3,52 3,18" stroke={CB.stroke} strokeWidth="1.2" fill="none"/>
      <polygon points="30,13 47,23 47,47 30,57 13,47 13,23" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
      <line x1="30" y1="3"  x2="30" y2="67" stroke={CB.strokeFaint} strokeWidth="0.5"/>
      <line x1="3"  y1="18" x2="57" y2="52" stroke={CB.strokeFaint} strokeWidth="0.5"/>
      <line x1="57" y1="18" x2="3"  y2="52" stroke={CB.strokeFaint} strokeWidth="0.5"/>
      <circle cx="30" cy="35" r="7"   stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
      <circle cx="30" cy="35" r="2.5" fill={CB.centerDot}/>
      <circle cx="30" cy="18" r="1.2" fill={CB.dot}/>
      <circle cx="30" cy="52" r="1.2" fill={CB.dot}/>
      <circle cx="13" cy="26.5" r="1.2" fill={CB.dot}/>
      <circle cx="47" cy="26.5" r="1.2" fill={CB.dot}/>
      <circle cx="13" cy="43.5" r="1.2" fill={CB.dot}/>
      <circle cx="47" cy="43.5" r="1.2" fill={CB.dot}/>
    </svg>}
    {/* 底部文字 - 圖片型牌背不顯示 */}
    <div style={{position:"absolute",bottom:Math.round(10*sc),fontFamily:"'Cinzel',serif",
      fontSize:Math.round(6*sc),letterSpacing:3,
      color:CB.footnote,zIndex:4}}>
      {isImage?"":"✦ ✦ ✦"}
    </div>
  </div>;
}
