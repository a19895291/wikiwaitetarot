// 模組 16 — SettingsPage（設定頁，主題/牌背快選）
import { useState } from "react";
import { C, THEMES, THEME_IDS } from "../data/themes";
import { CARD_BACKS } from "../data/cardBacks";
import { DECK, KEYWORDS } from "../data/deck";
import { load } from "../utils/storage";

export function SettingsPage({themeId,switchTheme,cardBackId,switchCardBack,userEmail,onLogout}){
  const [notif,setNotif]=useState(true);
  const [sound,setSound]=useState(false);
  const [dark,setDark]=useState(true);
  const [openMenu,setOpenMenu]=useState(null);
  const [libOpen,setLibOpen]=useState(false);
  const [libTab,setLibTab]=useState("major");
  const [libCard,setLibCard]=useState(null);
  const lpTimer=useRef(null);
  const lpPos=useRef({x:0,y:0});
  const startLP=(card)=>(e)=>{lpPos.current={x:e.clientX,y:e.clientY};clearTimeout(lpTimer.current);lpTimer.current=setTimeout(()=>setLibCard(card),420);};
  const moveLP=(e)=>{const dx=e.clientX-lpPos.current.x,dy=e.clientY-lpPos.current.y;if(Math.hypot(dx,dy)>10)clearTimeout(lpTimer.current);};
  const cancelLP=()=>clearTimeout(lpTimer.current);
  const major=DECK.filter(c=>!c.suit);
  const minor=DECK.filter(c=>c.suit);
  const suits=[...new Set(minor.map(c=>c.suit))];
  const SUIT_EMOJI={"權杖":"🪄","聖杯":"🍷","寶劍":"⚔️","星幣":"🪙","錢幣":"🪙"};
  const renderTile=(card)=><div key={card.id}
    onPointerDown={startLP(card)} onPointerMove={moveLP} onPointerUp={cancelLP} onPointerLeave={cancelLP} onPointerCancel={cancelLP}
    onContextMenu={e=>e.preventDefault()}
    style={{position:"relative",aspectRatio:"2/3",borderRadius:8,overflow:"hidden",border:`1px solid ${C.cardBorder}`,cursor:"pointer",background:C.bgCard,WebkitUserSelect:"none",userSelect:"none",WebkitTouchCallout:"none",touchAction:"manipulation"}}>
    {card.img
      ?<img src={card.img} alt={card.name} draggable={false} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none"}}/>
      :<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>{card.emoji}</div>}
    <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"8px 4px 4px",background:"linear-gradient(0deg,rgba(0,0,0,.8),transparent)",pointerEvents:"none"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:8.5,color:"#fff",textAlign:"center",letterSpacing:.3,lineHeight:1.2,textShadow:"0 1px 2px rgba(0,0,0,.9)"}}>{card.name}</div>
    </div>
  </div>;
  const bought = load("shop_bought", []);
  const Toggle=({v,onT})=><div onClick={onT} style={{
    width:46,height:24,borderRadius:12,cursor:"pointer",
    background:v?`linear-gradient(135deg,${C.blue},${C.accent})`:C.bgPanel,
    border:v?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
    position:"relative",transition:"background .3s",
    boxShadow:v?`0 0 12px ${C.accentFaint}`:"none"
  }}>
    <div style={{position:"absolute",top:3,left:v?22:3,width:16,height:16,borderRadius:8,background:v?"#fff":C.textFaint,transition:"left .3s",boxShadow:"0 2px 4px rgba(0,0,0,.3)"}}/>
  </div>;

  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .5s ease"}}>
    <div style={{textAlign:"center",marginBottom:22}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>設定</div>
      <div style={{width:50,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"10px auto 0"}}/>
    </div>
{/* 帳號 */}
<div style={{ background: C.bgCard, border: `1px solid ${C.gridBorder}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
  <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.05em", marginBottom: 12 }}>
    帳號
  </div>
  {userEmail ? (
    <>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 12, wordBreak: "break-all" }}>
        已登入：{userEmail}
      </div>
      <button
        onClick={onLogout}
        style={{ width: "100%", padding: "11px 0", fontSize: 14, fontWeight: 600, color: C.textDim, background: "transparent", border: `1px solid ${C.gridBorder}`, borderRadius: 12, cursor: "pointer", fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        登出
      </button>
    </>
  ) : (
    <>
      <div style={{ fontSize: 13, color: C.textDim, marginBottom: 12 }}>
        目前為訪客模式 · 註冊後可跨裝置同步
      </div>
      <button
        className="pay-btn"
        onClick={onLogout}
        style={{ width: "100%", padding: "11px 0", fontSize: 14, fontWeight: 700, color: C.bg, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`, border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "'Noto Sans TC', sans-serif" }}
      >
        登入 / 註冊帳號
      </button>
    </>
  )}
</div>

    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:"0 16px",marginBottom:14,backdropFilter:"blur(10px)"}}>
      {[["推播通知","每日抽牌提醒",notif,()=>setNotif(v=>!v)],["音效","翻牌與環境音",sound,()=>setSound(v=>!v)],["深色模式","",dark,()=>setDark(v=>!v)]].map(([label,sub,val,onT],i,arr)=><div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${C.gridBorder}`:"none"}}>
        <div>
          <div style={{fontSize:15.44,color:C.text,fontWeight:400}}>{label}</div>
          {sub&&<div style={{fontSize:11.88,color:C.textFaint,marginTop:2}}>{sub}</div>}
        </div>
        <Toggle v={val} onT={onT}/>
      </div>)}
    </div>

    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:"0 16px",marginBottom:14,backdropFilter:"blur(10px)"}}>
      {["帳戶管理","隱私設定","付款方式","聯絡支援","關於應用"].map((item,i,arr)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${C.gridBorder}`:"none",cursor:"pointer"}}>
        <div style={{fontSize:15.44,color:C.text}}>{item}</div>
        <div style={{color:C.goldDim,fontSize:16}}>›</div>
      </div>)}
    </div>

    {/* Theme selector (下拉) */}
        <div style={{background:C.bgPanel,border:"1px solid rgba(26,58,110,.32)",borderRadius:16,padding:"14px 16px",marginBottom:14,backdropFilter:"blur(10px)"}}>
         <div style={{fontSize:12,color:C.gold,fontFamily:"'Cinzel',serif",letterSpacing:1.5,marginBottom:12}}>✦ 介面主題</div>
         {(()=>{
           const t=THEMES[themeId]||THEMES[THEME_IDS[0]];
           const open=openMenu==="theme";
           return <div onClick={()=>setOpenMenu(m=>m==="theme"?null:"theme")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,cursor:"pointer",background:`linear-gradient(135deg,${t.accent}14,${t.blue}0a)`,border:`1px solid ${t.accent}55`,transition:"all .25s"}}>
             <div style={{display:"flex",gap:4,flexShrink:0}}>。 
               {t.preview.map((c,i)=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:c,border:"1px solid rgba(255,255,255,.15)"}}/>)}
             </div>
             <div style={{flex:1}}>
               <div style={{fontSize:12,fontFamily:"'Cinzel',serif",color:t.accent,letterSpacing:.5}}>{t.name}</div>
               <div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>點擊{open?"收起":"展開"}選擇主題</div>
             </div>
             <div style={{fontSize:11,color:C.gold,flexShrink:0,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .25s"}}>▼</div>
           </div>;
         })()}
         {openMenu==="theme"&&<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
          {THEME_IDS.map(id=>{
             const t=THEMES[id];
             if(!t)return null;
             const active=themeId===id;
             const thId=id==="midnight"?"th_default":"th_"+id;
             const owned=id==="midnight"||bought.includes(thId);
             return <div key={id} onClick={()=>{if(owned){switchTheme(id);setOpenMenu(null);}}} style={{
               display:"flex",alignItems:"center",gap:12,
               padding:"10px 12px",borderRadius:12,cursor:owned?"pointer":"default",
               background:active?`linear-gradient(135deg,${t.accent}14,${t.blue}0a)`:"rgba(255,255,255,.02)",
               border:`1px solid ${active?t.accent+"55":"rgba(26,58,110,.25)"}`,
               opacity:owned?1:.5,transition:"all .25s",
             }}>
               <div style={{display:"flex",gap:4,flexShrink:0}}>
                 {t.preview.map((c,i)=><div key={i} style={{width:12,height:12,borderRadius:"50%",background:c,border:"1px solid rgba(255,255,255,.15)"}}/>)}
               </div> 
               <div style={{flex:1}}>
                 <div style={{fontSize:12,fontFamily:"'Cinzel',serif",color:active?t.accent:C.text,letterSpacing:.5}}>{t.name}</div>
                 <div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>{owned?t.desc:"前往商城購買"}</div>
               </div>
               {active&&owned&&<div style={{fontSize:8.5,fontFamily:"'Cinzel',serif",color:t.accent,background:`${t.accent}18`,border:`1px solid ${t.accent}44`,borderRadius:50,padding:"2px 8px",flexShrink:0}}>使用中</div>}
               {!owned&&<div style={{fontSize:13,flexShrink:0}}>🔒</div>}
             </div>;
           })}
         </div>}
       </div>

        {/* Card back selector (下拉) */}
    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:"14px 16px",marginBottom:14,backdropFilter:"blur(10px)"}}>
      <div style={{fontSize:12,color:C.gold,fontFamily:"'Cinzel',serif",letterSpacing:1.5,marginBottom:12}}>🃏 塔羅款式</div>
      {(()=>{
        const cb=CARD_BACKS[cardBackId]||Object.values(CARD_BACKS)[0];
        const open=openMenu==="cb";
        return <div onClick={()=>setOpenMenu(m=>m==="cb"?null:"cb")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,cursor:"pointer",background:`linear-gradient(135deg,${C.blue}14,${C.accent}0a)`,border:`1px solid ${C.accentDim}`,transition:"all .25s"}}>
          <div style={{width:28,height:42,borderRadius:5,...(cb.bg&&cb.bg.startsWith("data:")?{backgroundColor:cb.isMonstera?"#f0f7f0":"#fff8f5",backgroundImage:"url("+cb.bg+")",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}:{background:cb.bg}),border:cb.isMonstera?"none":`1px solid ${cb.border}`,flexShrink:0}}/>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontFamily:"'Cinzel',serif",color:C.accent,letterSpacing:.5}}>{cb.emoji} {cb.name}</div>
            <div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>點擊{open?"收起":"展開"}選擇款式</div>
          </div>
          <div style={{fontSize:11,color:C.gold,flexShrink:0,transform:open?"rotate(180deg)":"rotate(0)",transition:"transform .25s"}}>▼</div>
        </div>;
      })()}
      {openMenu==="cb"&&<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
        {Object.values(CARD_BACKS).map(cb=>{
          const active=cardBackId===cb.id;
          const ownedCb=cb.owned||cb.price===0||bought.includes(cb.id);
          return <div key={cb.id} onClick={()=>{if(ownedCb&&switchCardBack){switchCardBack(cb.id);setOpenMenu(null);}}} style={{
            display:"flex",alignItems:"center",gap:12,
            padding:"10px 12px",borderRadius:12,cursor:ownedCb?"pointer":"default",
            background:active?`linear-gradient(135deg,${C.blue}14,${C.accent}0a)`:C.bgPanel,
            border:`1px solid ${active?C.accentDim:C.gridBorder}`,
            opacity:ownedCb?1:.5,transition:"all .25s",
          }}>
            <div style={{width:28,height:42,borderRadius:5,...(cb.bg&&cb.bg.startsWith("data:")?{backgroundColor:cb.isMonstera?"#f0f7f0":"#fff8f5",backgroundImage:"url("+cb.bg+")",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}:{background:cb.bg}),border:cb.isMonstera?"none":`1px solid ${cb.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {cb.isHibiscus
                ?<svg viewBox="0 0 60 70" width="16" height="20" fill="none">
                  <path d="M30,35 C27,30 26,22 27.5,17 C28.5,14 30,13.5 30,13.5 C30,13.5 31.5,14 32.5,17 C34,22 33,30 30,35 Z" fill="rgba(210,40,20,0.82)"/>
                  <path d="M30,35 C34.5,32.5 39,31.5 42.5,33.5 C44.5,35 44,39 40,38.5 C36,36.5 32.5,35.5 30,35 Z" fill="rgba(215,45,22,0.8)"/>
                  <path d="M30,35 C32,39 32.5,45 30,48.5 C29,50.5 27.5,51 26.5,50 C25.5,49 27,44.5 30,35 Z" fill="rgba(205,38,18,0.8)"/>
                  <path d="M30,35 C26,37 22,38.5 19.5,37 C18,36 18.5,33 24,32.5 C27,33.5 30,35 30,35 Z" fill="rgba(210,42,20,0.78)"/>
                  <path d="M30,35 C27.5,31 25,27 23,23 C22,20.5 24.5,18 29,22 C30,25 30,31 30,35 Z" fill="rgba(218,48,24,0.8)"/>
                  <circle cx="30" cy="35" r="3.5" fill="rgba(220,140,20,0.9)"/>
                  <circle cx="30" cy="35" r="1.8" fill="rgba(250,200,40,0.95)"/>
                </svg>
                :cb.isMonstera
                ?null
                :<svg viewBox="0 0 60 70" width="18" height="22" fill="none">
                  <polygon points="30,3 57,18 57,52 30,67 3,52 3,18" stroke={cb.stroke} strokeWidth="1.5" fill="none"/>
                  <circle cx="30" cy="35" r="2.5" fill={cb.centerDot}/>
                </svg>
              }
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontFamily:"'Cinzel',serif",color:active?C.accent:C.text,letterSpacing:.5}}>{cb.emoji} {cb.name}</div>
              <div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>{cb.price===0?"免費":(cb.owned||bought.includes(cb.id))?"已購買":`NT$${cb.price} — 前往商城購買`}</div>
            </div>
            {active&&<div style={{fontSize:8.5,fontFamily:"'Cinzel',serif",color:C.accent,background:`${C.accent}18`,border:`1px solid ${C.accentDim}`,borderRadius:50,padding:"2px 8px",flexShrink:0}}>使用中</div>}
          </div>;
        })}
      </div>}
    </div>


    <div style={{textAlign:"center",fontSize:11.88,color:C.textFaint}}>Mystic Tarot v2.0.0</div>
  </div>;
}
