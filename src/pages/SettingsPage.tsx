// 模組 16 — SettingsPage（設定頁，主題/牌背快選）
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { C, THEMES, THEME_IDS } from "../data/themes";
import { CARD_BACKS } from "../data/cardBacks";
import { DECK } from "../data/deck";
import { load, save } from "../utils/storage";
import { CardBack } from "../components/shared/CardBack";
import { meaningUp, meaningRev, kwUp, kwRev, hasOverride, setOverride, clearOverride, isMeaningShown, setMeaningShown } from "../utils/overrides";
import { isSoundOn, setSoundOn, playFlip } from "../utils/sfx";
import * as db from "../lib/db";
import { isMember } from "../utils/membership";

export function SettingsPage({themeId,switchTheme,cardBackId,switchCardBack,userEmail,onLogout,onGoShop,uiScale=1}){
  const [notif,setNotif]=useState(()=>{try{return typeof Notification!=="undefined"&&Notification.permission==="granted"&&load("notif_enabled",true)!==false;}catch{return false;}});
  const [sound,setSound]=useState(isSoundOn());
  const [showMeaning,setShowMeaning]=useState(isMeaningShown());
  const [about,setAbout]=useState(false);
  const [acctOpen,setAcctOpen]=useState(false);
  const [nick,setNick]=useState(()=>load("profile_nick",""));
  const [gender,setGender]=useState(()=>load("profile_gender",""));
  const [zodiac,setZodiac]=useState(()=>load("profile_zodiac",""));
  const [anns,setAnns]=useState([]);
  const [annView,setAnnView]=useState(null);
  const [boardOpen,setBoardOpen]=useState(false);
  const [genOpen,setGenOpen]=useState(false);
  const SUPPORT_EMAIL="support@example.com"; // ← 換成你的聯絡信箱
  const [openMenu,setOpenMenu]=useState(null);
  const [libOpen,setLibOpen]=useState(false);
  const [libTab,setLibTab]=useState("major");
  const [libCard,setLibCard]=useState(null);
  const [editing,setEditing]=useState(false);
  const [dUp,setDUp]=useState("");
  const [dRev,setDRev]=useState("");
  const [dKwUp,setDKwUp]=useState([]);
  const [dKwRev,setDKwRev]=useState([]);
  const [kwInU,setKwInU]=useState("");
  const [kwInR,setKwInR]=useState("");
  const lpTimer=useRef(null);
  const lpPos=useRef({x:0,y:0});
  useEffect(()=>{let c=false;db.listAnnouncements().then(r=>{if(!c)setAnns(Array.isArray(r)?r:[]);}).catch(()=>{});return ()=>{c=true;};},[]);
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
      <div style={{fontFamily:"'Cinzel',serif",fontSize:17,color:"#fff",textAlign:"center",letterSpacing:.3,lineHeight:1.2,textShadow:"0 1px 2px rgba(0,0,0,.9)"}}>{card.name}</div>
    </div>
  </div>;
    const bought = load("shop_bought", []);
  const libBg=(()=>{
    const grad=C.bgGrad||C.bg;
    if(grad&&grad.startsWith("url(")){
      const m=grad.match(/url\(['"]?(data:[^'")]+)['"]?\)/);
      const dataUrl=m?m[1]:null;
      if(dataUrl){
        const lg=grad.lastIndexOf("linear-gradient(");
        let gp="linear-gradient(160deg,rgba(255,248,244,.95),rgba(255,245,240,.95))";
        if(lg>=0){let d=0,i=lg;for(;i<grad.length;i++){if(grad[i]==="(")d++;else if(grad[i]===")")if(--d===0){i++;break;}}gp=grad.slice(lg,i);}
        return {backgroundColor:C.bg,backgroundImage:`url(${dataUrl}), ${gp}`,backgroundSize:"380px auto, cover",backgroundPosition:"center center, center center",backgroundRepeat:"repeat, no-repeat"};
      }
    }
    return {background:grad};
  })();
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

    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:"0 16px",marginBottom:14,backdropFilter:"blur(10px)"}}>
      {[{t:"公布欄",fn:()=>setBoardOpen(true)},{t:"一般設定",fn:()=>setGenOpen(true)},{t:"帳號管理",fn:()=>setAcctOpen(true)},{t:"隱私權政策",fn:()=>window.open("/privacy.html","_blank")},{t:"服務條款",fn:()=>window.open("/terms.html","_blank")},{t:"聯絡支援",fn:()=>{window.location.href="mailto:"+SUPPORT_EMAIL;}},{t:"關於應用",fn:()=>setAbout(true)}].map((it,i,arr)=><div key={i} onClick={it.fn} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${C.gridBorder}`:"none",cursor:"pointer"}}>
        <div style={{fontSize:15.44,color:C.text}}>{it.t}</div>
        <div style={{color:C.goldDim,fontSize:16}}>›</div>
      </div>)}
    </div>

        {/* 牌庫入口（關於應用 與 介面主題 之間）*/}
    <div onClick={()=>{setLibOpen(true);setLibTab("major");}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:"16px",marginBottom:14,cursor:"pointer",backdropFilter:"blur(10px)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:20}}>📚</div>
        <div>
          <div style={{fontSize:15.44,color:C.text}}>牌庫</div>
          <div style={{fontSize:11.88,color:C.textFaint,marginTop:2}}>78 張塔羅牌義大全</div>
        </div>
      </div>
      <div style={{color:C.goldDim,fontSize:16}}>›</div>
    </div>

    {/* 牌庫總覽（全螢幕覆蓋）*/}
    {libOpen&&createPortal(<div style={{position:"fixed",top:0,left:0,right:0,bottom:"calc(env(safe-area-inset-bottom,0px) + 56px)",zIndex:500,...libBg,display:"flex",flexDirection:"column",userSelect:"none",WebkitUserSelect:"none",WebkitTouchCallout:"none"}}>
      <div style={{flexShrink:0,padding:"calc(env(safe-area-inset-top,0px) + 14px) 16px 12px",background:"transparent",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>牌庫</div>
          <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:1,marginTop:3}}>長按任一張牌查看牌義</div>
        </div>
          <button onClick={()=>{setLibOpen(false);setLibCard(null);}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:50,background:C.accentFaint,border:`1px solid ${C.accentDim}`,color:C.accent,fontSize:12.5,fontFamily:"'Noto Sans TC',sans-serif",cursor:"pointer",whiteSpace:"nowrap"}}>✕ 離開</button>
      </div>
            <div style={{flexShrink:0,padding:"4px 16px 12px"}}>
        <div style={{display:"flex",gap:4,background:C.bgPanel,borderRadius:50,padding:4,border:`1px solid ${C.gridBorder}`,boxShadow:"inset 0 2px 10px rgba(0,0,0,.3)"}}>
          {[["major","大阿爾克那"],["minor","小阿爾克那"]].map(([id,label])=><button key={id} onClick={()=>setLibTab(id)} style={{flex:1,padding:"7px 14px",borderRadius:50,border:"none",cursor:"pointer",background:libTab===id?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:"transparent",fontFamily:"'Cinzel',serif",fontSize:11.88,color:libTab===id?C.gold:C.textFaint,transition:"all .25s",whiteSpace:"nowrap",boxShadow:libTab===id?`0 0 14px ${C.accentFaint}`:"none"}}>{label}</button>)}
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehaviorY:"contain",padding:"4px 16px",paddingBottom:"16px"}}>
        {libTab==="major"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{major.map(renderTile)}</div>}
        {libTab==="minor"&&suits.map(suit=><div key={suit} style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:6,margin:"8px 0 10px"}}>
            <span style={{fontSize:22}}>{SUIT_EMOJI[suit]||"✦"}</span>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:26,color:C.gold,letterSpacing:1}}>{suit}</span>
            <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.accentDim},transparent)`}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{minor.filter(c=>c.suit===suit).map(renderTile)}</div>
        </div>)}
      </div>
    </div>, document.body)}

        {/* 牌庫：單張牌義（正/逆位）*/}
    {libCard&&createPortal(<div onClick={()=>{setLibCard(null);setEditing(false);}} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.82)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} className="card-reveal-anim" style={{width:"100%",maxWidth:330,maxHeight:"86vh",overflowY:"auto",WebkitOverflowScrolling:"touch",background:C.bgModal,border:`1px solid ${C.accentDim}`,borderRadius:20,padding:20,boxShadow:"0 20px 60px rgba(0,0,0,.6)",userSelect:editing?"auto":"none",WebkitUserSelect:editing?"auto":"none",WebkitTouchCallout:"none"}}>
        <div style={{display:"flex",gap:14,marginBottom:16}}>
          {libCard.img
            ?<div style={{width:126,height:195,borderRadius:10,overflow:"hidden",flexShrink:0,border:`1px solid ${C.accentDim}`,boxShadow:`0 0 16px ${C.accentFaint}`}}><img src={libCard.img} alt={libCard.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>
            :<div style={{fontSize:72,flexShrink:0}}>{libCard.emoji}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:27,color:C.accent,letterSpacing:.5,lineHeight:1.3}}>{libCard.name}</div>
            {libCard.en&&<div style={{fontFamily:"'Cinzel',serif",fontStyle:"italic",fontSize:16.5,color:C.textFaint,marginTop:4,letterSpacing:.5,lineHeight:1.2}}>{libCard.en}</div>}
            {hasOverride(libCard.id)&&!editing&&<div style={{display:"inline-block",marginTop:8,fontSize:11,color:C.accent,letterSpacing:1,padding:"2px 10px",borderRadius:20,background:`${C.accent}14`,border:`1px solid ${C.accentDim}`,fontFamily:"'Cinzel',serif"}}>✦ 已自訂</div>}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16.5,color:C.accent,letterSpacing:1,padding:"3px 12px",borderRadius:20,background:`${C.accent}18`,border:`1px solid ${C.accentDim}`}}>△ 正位</span>
          {editing
            ?<>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"10px 0",alignItems:"center"}}>
                {dKwUp.map((kw,i)=><span key={i} style={{fontSize:14.25,padding:"3px 8px 3px 11px",borderRadius:20,background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",color:"rgba(201,168,76,.9)",fontFamily:"'Cinzel',serif",display:"inline-flex",alignItems:"center",gap:4}}>{kw}<span onClick={()=>setDKwUp(dKwUp.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.textFaint,fontSize:16,lineHeight:1}}>×</span></span>)}
                <input value={kwInU} onChange={e=>setKwInU(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&kwInU.trim()){setDKwUp([...dKwUp,kwInU.trim()]);setKwInU("");}}} placeholder="新增…" style={{width:80,fontSize:14,padding:"4px 8px",borderRadius:20,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,color:C.text,outline:"none"}}/>
                <span onClick={()=>{if(kwInU.trim()){setDKwUp([...dKwUp,kwInU.trim()]);setKwInU("");}}} style={{cursor:"pointer",fontSize:18,color:C.accent,padding:"0 4px"}}>＋</span>
              </div>
              <textarea value={dUp} onChange={e=>setDUp(e.target.value)} rows={3} style={{width:"100%",fontSize:16,lineHeight:1.7,color:C.text,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:10,padding:10,resize:"vertical",outline:"none",fontFamily:"inherit"}}/>
            </>
            :isMeaningShown()?<>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"10px 0"}}>{kwUp(libCard.id).map((kw,i)=><span key={i} style={{fontSize:14.25,padding:"3px 11px",borderRadius:20,background:"rgba(201,168,76,.07)",border:"1px solid rgba(201,168,76,.2)",color:"rgba(201,168,76,.8)",fontFamily:"'Cinzel',serif"}}>{kw}</span>)}</div>
              <div style={{fontSize:19.5,color:C.textDim,lineHeight:1.75,fontWeight:300}}>{meaningUp(libCard)}</div>
            </>:<div style={{fontSize:16,color:C.textFaint,lineHeight:1.75,margin:"10px 0"}}>（牌義已隱藏，可於設定開啟）</div>}
        </div>
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.accentDim},transparent)`,marginBottom:16}}/>
        <div style={{marginBottom:18}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:16.5,color:C.purple,letterSpacing:1,padding:"3px 12px",borderRadius:20,background:"rgba(140,80,220,.12)",border:"1px solid rgba(140,80,220,.35)"}}>▽ 逆位</span>
          {editing
            ?<>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"10px 0",alignItems:"center"}}>
                {dKwRev.map((kw,i)=><span key={i} style={{fontSize:14.25,padding:"3px 8px 3px 11px",borderRadius:20,background:"rgba(140,80,220,.07)",border:"1px solid rgba(140,80,220,.22)",color:"rgba(180,120,255,.9)",fontFamily:"'Cinzel',serif",display:"inline-flex",alignItems:"center",gap:4}}>{kw}<span onClick={()=>setDKwRev(dKwRev.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:C.textFaint,fontSize:16,lineHeight:1}}>×</span></span>)}
                <input value={kwInR} onChange={e=>setKwInR(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&kwInR.trim()){setDKwRev([...dKwRev,kwInR.trim()]);setKwInR("");}}} placeholder="新增…" style={{width:80,fontSize:14,padding:"4px 8px",borderRadius:20,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,color:C.text,outline:"none"}}/>
                <span onClick={()=>{if(kwInR.trim()){setDKwRev([...dKwRev,kwInR.trim()]);setKwInR("");}}} style={{cursor:"pointer",fontSize:18,color:C.purple,padding:"0 4px"}}>＋</span>
              </div>
              <textarea value={dRev} onChange={e=>setDRev(e.target.value)} rows={3} style={{width:"100%",fontSize:16,lineHeight:1.7,color:C.text,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:10,padding:10,resize:"vertical",outline:"none",fontFamily:"inherit"}}/>
            </>
            :isMeaningShown()?<>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",margin:"10px 0"}}>{kwRev(libCard.id).map((kw,i)=><span key={i} style={{fontSize:14.25,padding:"3px 11px",borderRadius:20,background:"rgba(140,80,220,.07)",border:"1px solid rgba(140,80,220,.22)",color:"rgba(180,120,255,.8)",fontFamily:"'Cinzel',serif"}}>{kw}</span>)}</div>
              <div style={{fontSize:19.5,color:C.textDim,lineHeight:1.75,fontWeight:300}}>{meaningRev(libCard)}</div>
            </>:<div style={{fontSize:16,color:C.textFaint,lineHeight:1.75,margin:"10px 0"}}>（牌義已隱藏，可於設定開啟）</div>}
        </div>
        {editing
          ?<div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setOverride(libCard.id,{up:dUp.trim(),rev:dRev.trim(),kwUp:dKwUp,kwRev:dKwRev});setEditing(false);setLibCard({...libCard});}} style={{flex:1,padding:"12px",borderRadius:50,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,color:"#1a1205",fontFamily:"'Cinzel',serif",fontSize:15,letterSpacing:1}}>儲存</button>
            <button onClick={()=>setEditing(false)} style={{padding:"12px 18px",borderRadius:50,cursor:"pointer",background:"transparent",border:`1px solid ${C.gridBorder}`,color:C.textDim,fontFamily:"'Cinzel',serif",fontSize:14}}>取消</button>
            {hasOverride(libCard.id)&&<button onClick={()=>{clearOverride(libCard.id);setEditing(false);setLibCard({...libCard});}} style={{padding:"12px 14px",borderRadius:50,cursor:"pointer",background:"transparent",border:"1px solid rgba(140,80,220,.4)",color:"#b478ff",fontFamily:"'Cinzel',serif",fontSize:13}}>↺ 還原</button>}
          </div>
          :<button onClick={()=>{if(!isMember()){onGoShop&&onGoShop();return;}setDUp(meaningUp(libCard));setDRev(meaningRev(libCard));setDKwUp(kwUp(libCard.id));setDKwRev(kwRev(libCard.id));setKwInU("");setKwInR("");setEditing(true);}} style={{width:"100%",padding:"12px",borderRadius:50,cursor:"pointer",background:"transparent",border:`1px solid ${C.accentDim}`,color:C.accent,fontFamily:"'Cinzel',serif",fontSize:15,letterSpacing:1}}>{isMember()?"✎ 編輯牌義":"✎ 編輯牌義（會員專屬）"}</button>}
      </div>
    </div>, document.body)}

    
    {/* Theme selector (下拉) */}

        <div style={{background:C.bgPanel,border:"1px solid rgba(26,58,110,.32)",borderRadius:16,padding:"14px 16px",marginBottom:14,backdropFilter:"blur(10px)"}}>
         <div style={{fontSize:12,color:C.gold,fontFamily:"'Cinzel',serif",letterSpacing:1.5,marginBottom:12}}>✦ 介面主題</div>
         {(()=>{
           const t=THEMES[themeId]||THEMES[THEME_IDS[0]];
           const open=openMenu==="theme";
           return <div onClick={()=>setOpenMenu(m=>m==="theme"?null:"theme")} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,cursor:"pointer",background:`linear-gradient(135deg,${t.accent}14,${t.blue}0a)`,border:`1px solid ${t.accent}55`,transition:"all .25s"}}>
             <div style={{display:"flex",gap:4,flexShrink:0}}> 
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
          <CardBack cb={cb} w={28} h={42}/>
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
            <CardBack cb={cb} w={28} h={42}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontFamily:"'Cinzel',serif",color:active?C.accent:C.text,letterSpacing:.5}}>{cb.emoji} {cb.name}</div>
              <div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>{cb.price===0?"免費":(cb.owned||bought.includes(cb.id))?"已購買":`NT$${cb.price} — 前往商城購買`}</div>
            </div>
            {active&&<div style={{fontSize:8.5,fontFamily:"'Cinzel',serif",color:C.accent,background:`${C.accent}18`,border:`1px solid ${C.accentDim}`,borderRadius:50,padding:"2px 8px",flexShrink:0}}>使用中</div>}
          </div>;
        })}
      </div>}
    </div>


    {boardOpen&&createPortal(<div style={{position:"fixed",top:0,left:0,right:0,bottom:"calc(env(safe-area-inset-bottom,0px) + 56px)",zIndex:500,...libBg,display:"flex",flexDirection:"column",paddingTop:"env(safe-area-inset-top,0px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 12px",flexShrink:0}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:19,color:C.gold,letterSpacing:2}}>📢 公布欄</div>
        <div onClick={()=>setBoardOpen(false)} style={{fontSize:13,color:C.text,border:`1px solid ${C.gridBorder}`,borderRadius:50,padding:"5px 14px",cursor:"pointer"}}>✕ 離開</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px"}}>
        {anns.length===0
          ? <div style={{fontSize:14,color:C.textFaint,textAlign:"center",padding:"40px 0"}}>目前沒有公告</div>
          : anns.map((a,i)=><div key={a.id||i} onClick={()=>setAnnView(a)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:16,marginBottom:10,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:14,cursor:"pointer"}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:15,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.title}</div>
                <div style={{fontSize:11,color:C.textFaint,marginTop:3}}>{(a.published_at||"").slice(0,10)}</div>
              </div>
              <div style={{color:C.goldDim,fontSize:16,flexShrink:0}}>›</div>
            </div>)}
      </div>
    </div>, document.body)}

    {genOpen&&createPortal(<div style={{position:"fixed",top:0,left:0,right:0,bottom:"calc(env(safe-area-inset-bottom,0px) + 56px)",zIndex:500,...libBg,display:"flex",flexDirection:"column",paddingTop:"env(safe-area-inset-top,0px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 12px",flexShrink:0}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:19,color:C.gold,letterSpacing:2}}>⚙ 一般設定</div>
        <div onClick={()=>setGenOpen(false)} style={{fontSize:13,color:C.text,border:`1px solid ${C.gridBorder}`,borderRadius:50,padding:"5px 14px",cursor:"pointer"}}>✕ 離開</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px"}}>
        <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:"0 16px",backdropFilter:"blur(10px)"}}>
          {[["推播通知","每日抽牌提醒",notif,()=>{if(notif){setNotif(false);save("notif_enabled",false);return;}if(typeof Notification==="undefined"){return;}Notification.requestPermission().then(p=>{const ok=p==="granted";setNotif(ok);save("notif_enabled",ok);});}],["音效","翻牌與環境音",sound,()=>setSound(v=>{const nv=!v;setSoundOn(nv);if(nv)playFlip();return nv;})],["顯示牌義",isMember()?"牌面解讀與關鍵詞":"牌面解讀與關鍵詞 · 會員專屬",isMember()?showMeaning:true,()=>{if(!isMember()){onGoShop&&onGoShop();return;}setShowMeaning(v=>{const nv=!v;setMeaningShown(nv);return nv;});}]].map(([label,sub,val,onT],i,arr)=><div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:i<arr.length-1?`1px solid ${C.gridBorder}`:"none"}}>
        <div>
          <div style={{fontSize:15.44,color:C.text,fontWeight:400}}>{label}</div>
          {sub&&<div style={{fontSize:11.88,color:C.textFaint,marginTop:2}}>{sub}</div>}
        </div>
        <Toggle v={val} onT={onT}/>
      </div>)}
        </div>
      </div>
    </div>, document.body)}

    {annView&&createPortal(<div onClick={()=>setAnnView(null)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.82)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:360,maxHeight:"80vh",overflowY:"auto",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:20,padding:"22px 20px",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
        <div style={{fontSize:17,color:C.text,fontWeight:500,marginBottom:4}}>{annView.title}</div>
        <div style={{fontSize:11,color:C.textFaint,marginBottom:14}}>{(annView.published_at||"").slice(0,10)}</div>
        <div style={{fontSize:14,lineHeight:1.8,color:C.text,whiteSpace:"pre-wrap",marginBottom:18}}>{annView.body}</div>
        <button onClick={()=>setAnnView(null)} style={{width:"100%",padding:"11px 0",fontSize:13,color:C.text,background:`${C.accent}18`,border:`1px solid ${C.accentDim}`,borderRadius:50,cursor:"pointer"}}>關閉</button>
      </div>
    </div>, document.body)}

    {acctOpen&&createPortal(<div style={{position:"fixed",top:0,left:0,right:0,bottom:"calc(env(safe-area-inset-bottom,0px) + 56px)",zIndex:500,...libBg,display:"flex",flexDirection:"column",paddingTop:"env(safe-area-inset-top,0px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 16px 12px",flexShrink:0}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:19,color:C.gold,letterSpacing:2}}>👤 帳號管理</div>
        <div onClick={()=>setAcctOpen(false)} style={{fontSize:13,color:C.text,border:`1px solid ${C.gridBorder}`,borderRadius:50,padding:"5px 14px",cursor:"pointer"}}>✕ 離開</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 16px"}}>
        <div style={{background:C.bgCard,border:`1px solid ${C.gridBorder}`,borderRadius:14,padding:14,marginBottom:14}}>
          <div style={{fontSize:11,color:C.accent,letterSpacing:1,marginBottom:8}}>帳號</div>
          {userEmail?(
            <div style={{fontSize:13,color:C.text,wordBreak:"break-all"}}>已登入 · {userEmail}</div>
          ):(
            <>
              <div style={{fontSize:13,color:C.textDim,marginBottom:10}}>目前為訪客 · 註冊後可跨裝置同步</div>
              <button className="pay-btn" onClick={onLogout} style={{width:"100%",padding:"10px 0",fontSize:13,fontWeight:700,color:C.bg,background:`linear-gradient(135deg,${C.accent},${C.accentDim})`,border:"none",borderRadius:12,cursor:"pointer"}}>登入 / 註冊帳號</button>
            </>
          )}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>用戶暱稱</div>
          <input value={nick} onChange={e=>{const v=e.target.value;setNick(v);save("profile_nick",v);}} onBlur={()=>db.updateProfile({nickname:nick}).catch(()=>{})} placeholder="輸入暱稱" style={{width:"100%",padding:"10px 12px",fontSize:14,color:C.text,background:C.bgCard,border:`1px solid ${C.gridBorder}`,borderRadius:12,outline:"none"}}/>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>E-mail</div>
          <div style={{padding:"10px 12px",fontSize:14,color:userEmail?C.text:C.textFaint,background:C.bgCard,border:`1px solid ${C.gridBorder}`,borderRadius:12,wordBreak:"break-all"}}>{userEmail||"（未登入）"}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>性別</div>
          <div style={{display:"flex",gap:8}}>
            {["男","女","其他","不透露"].map(g=><div key={g} onClick={()=>{setGender(g);save("profile_gender",g);db.updateProfile({gender:g}).catch(()=>{});}} style={{flex:1,textAlign:"center",padding:"9px 0",fontSize:13,cursor:"pointer",borderRadius:50,color:gender===g?C.bg:C.textDim,background:gender===g?C.accent:"transparent",border:`1px solid ${gender===g?C.accent:C.gridBorder}`,transition:"all .2s"}}>{g}</div>)}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12,color:C.textDim,marginBottom:6}}>星座</div>
          <select value={zodiac} onChange={e=>{const v=e.target.value;setZodiac(v);save("profile_zodiac",v);db.updateProfile({zodiac:v}).catch(()=>{});}} style={{width:"100%",padding:"10px 12px",fontSize:14,color:zodiac?C.text:C.textFaint,background:C.bgCard,border:`1px solid ${C.gridBorder}`,borderRadius:12,outline:"none",appearance:"none",WebkitAppearance:"none"}}>
            <option value="">未選擇</option>
            {["牡羊座","金牛座","雙子座","巨蟹座","獅子座","處女座","天秤座","天蠍座","射手座","摩羯座","水瓶座","雙魚座"].map(z=><option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div style={{marginBottom:16,background:C.bgCard,border:`1px solid ${C.gridBorder}`,borderRadius:14,padding:14}}>
          <div style={{fontSize:12,color:C.accent,letterSpacing:1,marginBottom:6}}>付款方式</div>
          <div style={{fontSize:12.5,lineHeight:1.7,color:C.textDim}}>商城的主題、牌背與訂閱皆透過 App Store／Google Play 官方內購處理，App 內不另外綁定信用卡或收款。未來的訂閱與加購紀錄會在此顯示與管理。</div>
        </div>
        {userEmail&&<button onClick={onLogout} style={{width:"100%",padding:"11px 0",fontSize:14,fontWeight:600,color:C.textDim,background:"transparent",border:`1px solid ${C.gridBorder}`,borderRadius:12,cursor:"pointer"}}>登出</button>}
      </div>
    </div>, document.body)}

    {about&&createPortal(<div onClick={()=>setAbout(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.82)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:320,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:20,padding:"26px 22px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:2,color:C.accent,marginBottom:6}}>✦ MYSTIC TAROT ✦</div>
        <div style={{fontSize:22,color:C.text,fontWeight:500,marginBottom:4}}>星啟塔羅</div>
        <div style={{fontSize:12,color:C.textFaint,marginBottom:16}}>版本 v2.0.0</div>
        <div style={{fontSize:13,lineHeight:1.7,color:C.text,marginBottom:18}}>結合每日抽牌、牌陣占卜與牌靈陪伴的塔羅應用，願星光為你指引方向。</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:14}}>
          <button onClick={()=>window.open("/privacy.html","_blank")} style={{flex:1,padding:"9px 0",fontSize:12,color:C.accent,background:"transparent",border:`1px solid ${C.accentDim}`,borderRadius:50,cursor:"pointer"}}>隱私權政策</button>
          <button onClick={()=>window.open("/terms.html","_blank")} style={{flex:1,padding:"9px 0",fontSize:12,color:C.accent,background:"transparent",border:`1px solid ${C.accentDim}`,borderRadius:50,cursor:"pointer"}}>服務條款</button>
        </div>
        <button onClick={()=>setAbout(false)} style={{width:"100%",padding:"11px 0",fontSize:13,color:C.text,background:`${C.accent}18`,border:`1px solid ${C.accentDim}`,borderRadius:50,cursor:"pointer"}}>關閉</button>
      </div>
    </div>, document.body)}

    <div style={{textAlign:"center",fontSize:11.88,color:C.textFaint}}>星啟塔羅 · Mystic Tarot　v2.0.0</div>
  </div>;
}
