// 模組 11 — CardBack（牌背面組件）
// 注意：CardBack 以 data-cb attribute 觸發 GLOBAL_CSS 中的動畫選擇器，
// 並內部呼叫 cbBgStyle() 處理 base64 圖片 vs CSS gradient 兩種牌背。
// silverMoon/hibiscusCard/monsteraCard 需特判 isLight/isHibiscus/isMonstera。
import { CB } from "../../data/cardBacks";
import { cbBgStyle } from "./cbBgStyle";

export function CardBack({w=48,h=72,style={},lifting=false}){
  const sc=w/68;
  const isLight=CB.id==="silverMoon";
  const isHibiscus=CB.id==="hibiscusCard";
  const isMonstera=CB.id==="monsteraCard";

  return <div style={{
    width:w, height:h, borderRadius:9,
    ...cbBgStyle(),
    border:(isMonstera||isHibiscus)?`none`:`1px solid ${CB.border}`,
    display:"flex",alignItems:"center",justifyContent:"center",
    position:"relative",flexShrink:0,overflow:"hidden",
    transition:"transform .3s ease, box-shadow .3s ease",
    transform:lifting?"translateY(-6px) scale(1.05)":"none",
    boxShadow:lifting
      ?isHibiscus
        ?`inset 0 2px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.12),0 14px 35px rgba(0,0,0,.3),0 0 28px rgba(210,55,25,.4),0 0 0 1px rgba(210,55,25,.15)`
        :isMonstera
        ?`inset 0 2px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.2),0 14px 35px rgba(0,0,0,.45),0 0 28px rgba(46,125,50,.5),0 0 0 1px rgba(46,125,50,.2)`
        :`inset 0 1px 0 rgba(255,255,255,.${isLight?"6":"07"}),0 12px 30px rgba(0,0,0,.${isLight?"3":"7"}),0 0 24px ${CB.liftShadow}`
      :isHibiscus
        ?`inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.1),0 6px 20px rgba(0,0,0,.2),0 0 18px rgba(210,55,25,.25),0 0 0 1px rgba(210,55,25,.12)`
        :isMonstera
        ?`inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.15),0 6px 20px rgba(0,0,0,.3),0 0 18px rgba(46,125,50,.35),0 0 0 1px rgba(46,125,50,.18)`
        :`inset 0 1px 0 rgba(255,255,255,.${isLight?"5":"07"}),0 4px 16px rgba(0,0,0,.${isLight?"2":"6"}),0 0 14px ${CB.idleShadow}`,
    ...style
  }}>
    {/* 扶桑花光影系統 */}
    {/* 1. 頂部冷陽光：上方20% 冷藍光照 */}
    {isHibiscus&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",
      background:"linear-gradient(180deg,rgba(180,210,255,.28) 0%,rgba(180,210,255,.10) 60%,transparent 100%)",
      pointerEvents:"none",zIndex:4,borderRadius:"9px 9px 0 0"}}/>}
    {/* 2. 左側受光邊：左緣18% 細緻側光 */}
    {isHibiscus&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",
      background:"linear-gradient(90deg,rgba(210,225,255,.20) 0%,rgba(210,225,255,.08) 55%,transparent 100%)",
      pointerEvents:"none",zIndex:4}}/>}
    {/* 3. 右下暗角：左上透明往右下壓暗 */}
    {isHibiscus&&<div style={{position:"absolute",inset:0,
      background:"linear-gradient(135deg,transparent 40%,rgba(60,10,5,.18) 100%)",
      pointerEvents:"none",zIndex:4,borderRadius:9}}/>}
    {/* 4. 斜面光影：145°金屬板面，左上冷白、右下微暗 */}
    {isHibiscus&&<div style={{position:"absolute",inset:0,
      background:"linear-gradient(145deg,rgba(220,235,255,.16) 0%,rgba(220,235,255,.05) 30%,transparent 55%,rgba(40,8,4,.07) 100%)",
      pointerEvents:"none",zIndex:4,borderRadius:9}}/>}
    {/* 5. 底部陰影：底端13% 自然陰影 */}
    {isHibiscus&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",
      background:"linear-gradient(0deg,rgba(60,10,5,.16) 0%,transparent 100%)",
      pointerEvents:"none",zIndex:4}}/>}
        {/* 龜背芋光影系統 */}
    {/* 1. 頂部冷陽光：上方20% 冷藍光照 */}
    {isMonstera&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",
      background:"linear-gradient(180deg,rgba(180,220,200,.28) 0%,rgba(180,220,200,.10) 60%,transparent 100%)",
      pointerEvents:"none",zIndex:4,borderRadius:"9px 9px 0 0"}}/>}
    {/* 2. 左側受光邊：左緣18% 細緻側光 */}
    {isMonstera&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",
      background:"linear-gradient(90deg,rgba(200,235,215,.20) 0%,rgba(200,235,215,.08) 55%,transparent 100%)",
      pointerEvents:"none",zIndex:4}}/>}
    {/* 3. 右下暗角：左上透明往右下壓暗 */}
    {isMonstera&&<div style={{position:"absolute",inset:0,
      background:"linear-gradient(135deg,transparent 40%,rgba(10,40,15,.20) 100%)",
      pointerEvents:"none",zIndex:4,borderRadius:9}}/>}
    {/* 4. 斜面光影：145°金屬板面，左上冷白、右下微暗 */}
    {isMonstera&&<div style={{position:"absolute",inset:0,
      background:"linear-gradient(145deg,rgba(220,245,230,.16) 0%,rgba(220,245,230,.05) 30%,transparent 55%,rgba(5,30,10,.08) 100%)",
      pointerEvents:"none",zIndex:4,borderRadius:9}}/>}
    {/* 5. 底部陰影：底端13% 自然陰影 */}
    {isMonstera&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",
      background:"linear-gradient(0deg,rgba(10,40,15,.18) 0%,transparent 100%)",
      pointerEvents:"none",zIndex:4}}/>}
    {/* 外框 - 圖片型牌背不顯示 */}
    {!isHibiscus&&!isMonstera&&<div style={{position:"absolute",inset:Math.round(4*sc),
      border:`1px solid ${CB.strokeDim}`,
      borderRadius:5,pointerEvents:"none",zIndex:3}}/>}
    {/* 金屬掃光 */}
    <div style={{position:"absolute",top:"-40%",left:"-35%",width:"45%",height:"180%",
      background:isMonstera
        ?"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(210,240,225,0.45) 43%,rgba(180,230,205,0.68) 50%,rgba(210,240,225,0.45) 57%,transparent 72%,transparent 100%)"
        :isHibiscus
        ?"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(230,240,255,0.45) 43%,rgba(210,225,255,0.65) 50%,rgba(230,240,255,0.45) 57%,transparent 72%,transparent 100%)"
        :CB.shimmer,
      transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,
      animation:isMonstera?"monsteraShimmer 2.8s ease-in-out infinite":isHibiscus?"hibiscusShimmer 2.8s ease-in-out infinite":isLight?"silverShimmer 3s ease-in-out infinite":"none"}}/>
    {/* 非圖片型：六芒星圖騰 */}
    {!isHibiscus&&!isMonstera&&<svg viewBox="0 0 60 70" width={Math.round(36*sc)} height={Math.round(42*sc)} fill="none" style={{position:"relative",zIndex:2}}>
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
      {(isHibiscus||isMonstera)?"":"✦ ✦ ✦"}
    </div>
  </div>;
}

