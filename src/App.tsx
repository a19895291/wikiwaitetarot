// 模組 13 — App（根組件：全域狀態、頁面路由、底部導航、星空背景、雙 <style> 注入）
// 全域可變 C/CB 在 render 階段以 Object.assign 同步（與原單檔行為一致；ES module 單例保留此語意）。
import { useState, useMemo, useCallback, useEffect } from "react";
import { C, THEMES, DEFAULT_THEME } from "./data/themes";
import { CB, CARD_BACKS, DEFAULT_CARD_BACK } from "./data/cardBacks";
import { DECK } from "./data/deck";
import { SPIRITS, COSTUMES } from "./data/spirits";
import { save, load } from "./utils/storage";
import { todayKey } from "./utils/date";
import { shuffle } from "./utils/deck";
import { GLOBAL_CSS } from "./styles/globalCss";
import { useTheme } from "./hooks/useTheme";
import { DecorCorner } from "./components/shared/DecorCorner";
import { SpiritPet } from "./components/shared/SpiritPet";
import { DailyPage } from "./pages/DailyPage";
import { SpreadPage } from "./pages/SpreadPage";
import { OnlinePage } from "./pages/OnlinePage";
import { HistoryPage } from "./pages/HistoryPage";
import { SpiritPage } from "./pages/SpiritPage";
import { ShopPage } from "./pages/ShopPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import * as db from "./lib/db";

export default function App(){
  const {theme,themeId,switchTheme}=useTheme();
  Object.assign(C, THEMES[themeId] || THEMES[DEFAULT_THEME]);
  const { session, loading, signOut } = useAuth();
  const [guest, setGuest] = useState(() => load("guest_mode", false));
  const goToLogin = async () => {
  await signOut();
  save("guest_mode", false);
  setGuest(false);
  };
  const [cardBackId,setCardBackId]=useState(()=>{
    try{const s=localStorage.getItem("active_card_back");return(s&&CARD_BACKS[s])?s:DEFAULT_CARD_BACK;}catch{return DEFAULT_CARD_BACK;}
  });
  // 讓全域 CB 跟隨當前牌背
  Object.assign(CB, CARD_BACKS[cardBackId] || CARD_BACKS[DEFAULT_CARD_BACK]);
  const switchCardBack=(id)=>{
    if(!CARD_BACKS[id])return;
    setCardBackId(id);
    Object.assign(CB, CARD_BACKS[id]);
    try{localStorage.setItem("active_card_back",id);}catch{}
  };
    const [hydrated, setHydrated] = useState(false);

    // 登入後：把雲端 profile 的偏好套用到 app
  useEffect(() => {
    if (!session) { setHydrated(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const p = await db.getProfile();
        if (!cancelled && p) {
          if (p.active_theme) switchTheme(p.active_theme);
          if (p.active_card_back) switchCardBack(p.active_card_back);
          if (p.active_spirit) {
            const s = SPIRITS.find(x => x.id === p.active_spirit);
            if (s) setSpirit(s);
          }
          if (p.active_costumes && typeof p.active_costumes === "object") {
            setActiveC(p.active_costumes);
          }
        }
        // 載入雲端今日占卜紀錄（雲端優先）
        const dk = todayKey();
        const dr = await db.getDailyRecord(dk);
        if (!cancelled && dr) {
          if (Array.isArray(dr.cards)) { setDrawnCards(dr.cards); save("daily_" + dk, dr.cards); }
          if (Array.isArray(dr.deck) && dr.deck.length) { setDailyDeck(dr.deck); save("daily_deck_" + dk, dr.deck); }
        }
      } catch (e) { /* 雲端載入失敗就維持本機設定 */ }
      if (!cancelled) setHydrated(true);
    })();
    return () => { cancelled = true; };
  }, [session]);
    // 主題 / 牌背 → 寫回雲端
  useEffect(() => {
    if (session && hydrated) db.updateProfile({ active_theme: themeId }).catch(() => {});
  }, [themeId]);
  useEffect(() => {
    if (session && hydrated) db.updateProfile({ active_card_back: cardBackId }).catch(() => {});
  }, [cardBackId]);
  const [page,setPage]=useState("daily");
  const [spirit,setSpirit]=useState(SPIRITS[0]);
  const [costumes,setCostumes]=useState(COSTUMES);
  const [activeC,setActiveC]=useState({});
    // 牌靈 / 造型選擇 → 寫回雲端
  useEffect(() => {
    if (session && hydrated && spirit?.id) db.updateProfile({ active_spirit: spirit.id }).catch(() => {});
  }, [spirit]);
  useEffect(() => {
    if (session && hydrated) db.updateProfile({ active_costumes: activeC }).catch(() => {});
  }, [activeC]);
  const [onlineStep,setOnlineStep]=useState("browse");
  const [drawnCards,setDrawnCards]=useState(()=>load("daily_"+todayKey(),[]) );
  // 每日占卜牌堆：洗牌後預先排好78張（含正逆位），按序取出
  const [dailyDeck,setDailyDeck]=useState(()=>{
    const saved=load("daily_deck_"+todayKey(),null);
    return saved||shuffle(DECK);
  });
  const dailyPtr=drawnCards.length; // 下一張要取的位置
  const remaining=5-drawnCards.length;

  const activeSpiritEmoji=useMemo(()=>{
    const mine=costumes[spirit?.id]||[];
    const curId=activeC[spirit?.id]||mine[0]?.id;
    if(curId==="none")return spirit?.emoji;
    const curC=mine.find(c=>c.id===curId)||mine[0];
    return curC?.emoji||spirit?.emoji;
  },[spirit,costumes,activeC]);

    const drawDailyCard=useCallback(()=>{
    if(drawnCards.length>=5)return;
    const card=dailyDeck[dailyPtr];
    if(!card)return;
    const next=[...drawnCards,card];
    setDrawnCards(next);save("daily_"+todayKey(),next);
    if(session) db.saveDailyRecord(todayKey(), next, dailyDeck).catch(()=>{});
    // save timestamp on first draw of the day
    const tsKey="daily_ts_"+todayKey();
    if(!localStorage.getItem(tsKey)){
      const now=new Date();
      const pad=n=>String(n).padStart(2,"0");
      const ts=`${todayKey()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      save(tsKey,ts);
    }
  },[drawnCards,dailyDeck,dailyPtr,session]);
  const inSession=page==="online"&&onlineStep==="session";
  const NAV=[
    {id:"daily",label:"每日",emoji:"🌙"},
    {id:"spread",label:"牌陣",emoji:"✦"},
    {id:"online",label:"線上",emoji:"🔮"},
    {id:"history",label:"歷程",emoji:"📖"},
    {id:"spirit",label:"牌靈",emoji:"🐾"},
    {id:"shop",label:"商城",emoji:"💫"},
    {id:"settings",label:"設定",emoji:"⚙️"},
  ];

  // 處理 hibiscus 主題的 bgGrad 含 url() 需分離設定
  const appBgStyle=(()=>{
    const grad=C.bgGrad||C.bg;
    if(grad&&grad.startsWith("url(")){
      const urlMatch=grad.match(/url\(['"]?(data:[^'")]+)['"]?\)/);
      const dataUrl=urlMatch?urlMatch[1]:null;
      if(dataUrl){
        // 用括號計數法正確提取完整 linear-gradient()（內含 rgba() 嵌套括號）
        const lgStart=grad.lastIndexOf("linear-gradient(");
        let gradPart="linear-gradient(160deg,rgba(255,248,244,.95),rgba(255,245,240,.95))";
        if(lgStart>=0){
          let depth=0,i=lgStart;
          for(;i<grad.length;i++){if(grad[i]==="(")depth++;else if(grad[i]===")")if(--depth===0){i++;break;}}
          gradPart=grad.slice(lgStart,i);
        }
        return {
          backgroundColor:C.bg,
          backgroundImage:`url(${dataUrl}), ${gradPart}`,
          backgroundSize:"380px auto, cover",
          backgroundPosition:"center center, center center",
          backgroundRepeat:"repeat, no-repeat",
        };
      }
    }
    return {background:grad};
  })();

  if (loading) return (
  <div style={{minHeight:"100vh",display:"flex",alignItems:"center",
    justifyContent:"center",background:C.bg,color:C.accent,
    fontFamily:"'Cinzel Decorative',serif",letterSpacing:"0.2em"}}>
    ✦ 載入中… ✦
  </div>
);
  if (!session && !guest) return (
  <LoginPage onGuest={() => { save("guest_mode", true); setGuest(true); }} />
);

  return <div className={`theme-root theme-${theme.id}${theme.isLight?" theme-light":""}${theme.id==="skyblue"?" theme-skyblue":""}`} style={{
    minHeight:"100vh",maxWidth:390,margin:"0 auto",
    position:"relative",...appBgStyle,
    fontFamily:"'Noto Sans TC',sans-serif",color:C.text
  }}>
    <style>{GLOBAL_CSS}</style>
    <style>{`
  :root{
    --app-bg:${C.bg};
    --accent:${C.accent};
    --accent-dim:${C.accentDim};
    --accent-faint:${C.accentFaint};
    --cb-stroke-dim:${CB.strokeDim};
  }
  .daily-card-back[data-cb] {
    background:${CB.bg.startsWith("data:") ? "url("+CB.bg+") center center / cover no-repeat" : CB.bg};
    border:${(CB.id==="monsteraCard"||CB.id==="hibiscusCard")?"none":`1px solid ${CB.border}`};
    box-shadow:${CB.id==="hibiscusCard"
      ?"inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.1),0 6px 20px rgba(0,0,0,.2),0 0 18px rgba(210,55,25,.25),0 0 0 1px rgba(210,55,25,.12)"
      :CB.id==="monsteraCard"
      ?"inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.15),0 6px 20px rgba(0,0,0,.3),0 0 18px rgba(46,125,50,.35),0 0 0 1px rgba(46,125,50,.18)"
      :`inset 0 1px 0 rgba(255,255,255,.07),inset 0 -1px 0 rgba(0,0,0,.5),0 4px 16px rgba(0,0,0,.5),0 0 14px ${CB.idleShadow}`};
  }
  .daily-card-back[data-cb]::before {
    content:'';position:absolute;inset:0;
    background:${CB.id==="hibiscusCard"
      ?"linear-gradient(135deg,transparent 40%,rgba(60,10,5,.18) 100%)"
      :CB.id==="monsteraCard"
      ?"linear-gradient(135deg,transparent 40%,rgba(10,40,15,.20) 100%)"
      :"none"};
    pointer-events:none;z-index:4;border-radius:9px;
  }
  .daily-card-back[data-cb]::after {
    content:'';position:absolute;top:-40%;left:-55%;
    width:45%;height:180%;
    background:${CB.id==="monsteraCard"
      ?"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(210,240,225,0.45) 43%,rgba(180,230,205,0.68) 50%,rgba(210,240,225,0.45) 57%,transparent 72%,transparent 100%)"
      :CB.id==="hibiscusCard"
      ?"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(230,240,255,0.45) 43%,rgba(210,225,255,0.65) 50%,rgba(230,240,255,0.45) 57%,transparent 72%,transparent 100%)"
      :CB.shimmer};
    transform:skewX(-12deg);pointer-events:none;z-index:6;
    animation:${CB.id==="monsteraCard"?"monsteraShimmer 2.8s ease-in-out infinite":CB.id==="hibiscusCard"?"hibiscusShimmer 2.8s ease-in-out infinite":"none"};
  }
  @keyframes deckPulse {
    0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 8px 32px rgba(0,0,0,0.6),0 0 20px ${CB.idleShadow};}
    50%{box-shadow:inset 0 1px 0 rgba(255,255,255,0.08),0 8px 32px rgba(0,0,0,0.6),0 0 35px ${CB.liftShadow},0 2px 8px ${CB.border};}
  }
  @keyframes payPulse{
    0%,100%{box-shadow:0 0 10px ${C.accentFaint},0 4px 18px rgba(0,0,0,.4);}
    50%{box-shadow:0 0 24px ${C.accentGlow},0 4px 22px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.15);}
  }
  ${C.id==="hibiscus"?`
    @keyframes payPulse{
      0%,100%{box-shadow:0 0 12px rgba(230,60,30,.2),0 4px 18px rgba(0,0,0,.15);}
      50%{box-shadow:0 0 28px rgba(255,100,40,.45),0 4px 22px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.3);}
    }
    @keyframes deckPulse{
      0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 8px 32px rgba(0,0,0,.12),0 0 20px rgba(230,60,30,.15);}
      50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 8px 32px rgba(0,0,0,.15),0 0 35px rgba(255,100,40,.3),0 2px 8px rgba(230,60,30,.2);}
    }
  `:""}
  ${C.id==="imperial"?`
    .imperial-border::before{
      content:'';position:absolute;inset:0;
      border-radius:inherit;
      background:linear-gradient(135deg,rgba(201,168,76,.6),rgba(201,168,76,.1),rgba(201,168,76,.6),rgba(201,168,76,.1));
      -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      -webkit-mask-composite:destination-out;
      mask-composite:exclude;
      padding:1px;pointer-events:none;
    }
    * { letter-spacing:0.02em; }
    button { letter-spacing:0.08em !important; }
  `:""}
`}</style>
    <DecorCorner/>

    {/* 星空背景粒子 */}
    <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {/* 大光暈 */}
      <div style={{position:"absolute",top:"-10%",left:"20%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,.06),transparent 70%)",animation:"orbFloat 12s ease-in-out infinite"}}/>
      <div style={{position:"absolute",bottom:"20%",right:"-5%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(26,74,138,.08),transparent 70%)",animation:"orbFloat 8s ease-in-out 3s infinite"}}/>
      {/* 星塵粒子 */}
      {[...Array(40)].map((_,i)=><div key={i} style={{
        position:"absolute",
        left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
        width:`${.8+Math.random()*1.8}px`,height:`${.8+Math.random()*1.8}px`,
        borderRadius:"50%",
        background:`${C.accent}${Math.floor((.2+Math.random()*.4)*255).toString(16).padStart(2,"0")}`,
        animation:`starTwinkle ${2+Math.random()*3}s ease-in-out ${Math.random()*5}s infinite`,
      }}/>)}
    </div>

    {/* Header */}
    {!inSession&&<div style={{
      height:46,
      background:C.navBg,
      position:"sticky",top:0,zIndex:100,
      display:"flex",alignItems:"center",justifyContent:"center",
      borderBottom:`1px solid ${C.navBorder}`,
      backdropFilter:"blur(20px)",
      boxShadow:"0 2px 20px rgba(0,0,0,.3)"
    }}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16.63,color:C.gold,letterSpacing:4}}>✦ MYSTIC TAROT ✦</div>
    </div>}

    {/* Page content */}
    <div style={{position:"relative",zIndex:1,animation:"fadeInUp .45s ease"}} key={page}>
    {!session && (
      <div
      onClick={goToLogin}
      style={{
        margin: "12px 0",
        padding: "10px 14px",
        fontSize: 12.5,
        lineHeight: 1.5,
        textAlign: "center",
        color: C.accent,
        background: C.accentFaint,
        border: `1px solid ${C.accentDim}`,
        borderRadius: 12,
        cursor: "pointer",
        fontFamily: "'Noto Sans TC', sans-serif",
        }}
     >
       ✦ 你正在以訪客身分體驗 · 點此註冊，跨裝置同步占卜紀錄與牌靈 →
     </div>
    )}
      {page==="daily"&&<DailyPage drawnCards={drawnCards} onDraw={drawDailyCard} remaining={remaining} onReset={()=>{const nd=shuffle(DECK);setDailyDeck(nd);save("daily_deck_"+todayKey(),nd);setDrawnCards([]);save("daily_"+todayKey(),[]);}}/>}
      {page==="spread"&&<SpreadPage/>}
      {page==="online"&&<OnlinePage onStepChange={setOnlineStep}/>}
      {page==="history"&&<HistoryPage/>}
      {page==="spirit"&&<SpiritPage spirit={spirit} onSelect={setSpirit} costumes={costumes} setCostumes={setCostumes} activeC={activeC} setActiveC={setActiveC} themeId={themeId} switchTheme={switchTheme}/>}
      {page==="shop"&&<ShopPage switchTheme={switchTheme} cardBackId={cardBackId} switchCardBack={switchCardBack}/>}
      {page==="settings"&&<SettingsPage themeId={themeId} switchTheme={switchTheme} cardBackId={cardBackId} switchCardBack={switchCardBack} userEmail={session?.user?.email || null} onLogout={goToLogin}/>}
    </div>

    {/* Spirit Pet */}
    {!inSession&&<SpiritPet spirit={spirit} activeSpiritEmoji={activeSpiritEmoji}/>}

    {/* Bottom Nav */}
    {!inSession&&<div style={{
      position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:390,
      background:C.navBg||"rgba(4,6,13,.97)",
      borderTop:"1px solid rgba(26,58,110,.45)",
      backdropFilter:"blur(24px)",
      display:"flex",zIndex:200,
      paddingBottom:"env(safe-area-inset-bottom,0)",
      boxShadow:"0 -4px 24px rgba(0,0,0,.5)"
    }}>
      {NAV.map((n,i)=><button key={n.id} onClick={()=>setPage(n.id)} style={{
        flex:1,padding:"10px 4px 8px",
        background:"none",border:"none",cursor:"pointer",
        display:"flex",flexDirection:"column",alignItems:"center",gap:2,
        animation:`navItemIn .3s ease ${i*.04}s both`,
        position:"relative",
      }}>
        {page===n.id&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:2,borderRadius:"0 0 2px 2px",background:`linear-gradient(90deg,transparent,${C.gold},transparent)`}}/>}
        <div style={{
          fontSize:20.79,lineHeight:1,
          filter:page===n.id?`drop-shadow(0 0 8px rgba(212,168,67,.7))`:"none",
          transform:page===n.id?"scale(1.18)":"scale(1)",
          transition:"all .25s cubic-bezier(.34,1.56,.64,1)"
        }}>{n.emoji}</div>
        <div style={{
          fontSize:10.1,
          fontFamily:"'Cinzel',serif",
          letterSpacing:.5,
          color:page===n.id?C.gold:C.textFaint,
          transition:"color .2s",
          fontWeight:page===n.id?600:400,
        }}>{n.label}</div>
      </button>)}
    </div>}
  </div>;
}
