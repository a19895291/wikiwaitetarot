// 模組 06/07/08 — OnlinePage（線上占卜完整流程）
// 同檔含 4 個內部子組件：DivinationRoom（占卜房間）、ReviewPage（評論）、FriendCard、FriendBookingBtn。
// 僅 export OnlinePage；其餘為同檔 local（function 宣告會 hoist）。
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { C } from "../data/themes";
import { CB } from "../data/cardBacks";
import { DECK } from "../data/deck";
import { DIVINERS, DIVINATION_ITEMS, ITEM_MULTIPLIER, CATEGORIES, BOT_MSGS } from "../data/diviners";
import { save, load } from "../utils/storage";
import { shuffle } from "../utils/deck";
import { CardBack } from "../components/shared/CardBack";
import { GoldPayBtn } from "../components/shared/GoldPayBtn";
import { CardModal } from "../components/shared/CardModal";
import { cbBgStyle } from "../components/shared/cbBgStyle";
import { BookingCalendar } from "../components/booking/BookingCalendar";
import { todayKey, dateKey } from "../utils/date";

function DivinationRoom({matched,timer,onEnd,isDiviner:initIsDiviner=false}){
  const [grid,setGrid]=useState(Array(36).fill(null));
  const [drawn,setDrawn]=useState([]);
  const [roomDeck,setRoomDeck]=useState(()=>shuffle(DECK));
  const [deckLeft,setDeckLeft]=useState(78);
  const [shuffleAnim,setShuffleAnim]=useState(false);
  const [isDiviner,setIsDiviner]=useState(initIsDiviner);
  const [msgs,setMsgs]=useState([
    {from:"diviner",text:`歡迎來到占卜室。我是${matched?.name}，今天由我為你解讀星盤與塔羅的交織訊息。`},
    {from:"system",text:"✦ 占卜已開始，請從下方牌堆抽牌放入牌陣。"}
  ]);
  const [input,setInput]=useState("");
  const [muted,setMuted]=useState(false);
  const [wave,setWave]=useState([3,5,8,4,6,9,3,7,5,4]);
  const [extraInput,setExtraInput]=useState("");
  const [extraPending,setExtraPending]=useState(null);
  const [extraOpen,setExtraOpen]=useState(false);
  const [totalFee,setTotalFee]=useState(matched?.price||0);
  const [zoom,setZoom]=useState(null);
  const [leaveModal,setLeaveModal]=useState(false);
  const [checkoutModal,setCheckoutModal]=useState(false);
  const chatRef=useRef();
  const gridRef=useRef();
  const dragging=useRef(null);
  const hovered=useRef(-1);

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  useEffect(()=>{const id=setInterval(()=>setWave(w=>w.map(()=>2+Math.floor(Math.random()*10))),280);return()=>clearInterval(id);},[]);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs]);
  useEffect(()=>{
    if(drawn.length===0)return;
    const latest=drawn[drawn.length-1];
    const t=setTimeout(()=>{
      const empty=grid.map((c,i)=>c?-1:i).filter(i=>i>=0);
      if(!empty.length)return;
      const idx=empty[Math.floor(Math.random()*Math.min(empty.length,10))];
      setGrid(g=>{const ng=[...g];ng[idx]=latest;return ng;});
      setDrawn(d=>d.filter(c=>c.id!==latest.id));
      setMsgs(m=>[...m,{from:"diviner",text:`已將「${latest.name}」置入牌陣，${BOT_MSGS[Math.floor(Math.random()*BOT_MSGS.length)]}`}]);
    },1800);
    return()=>clearTimeout(t);
  },[drawn.length]);

  const makeGhost=(emoji,x,y)=>{const el=document.createElement("div");el.style.cssText=`position:fixed;left:${x-27}px;top:${y-43}px;width:54px;height:82px;border-radius:10px;background:${C.bgCard};border:2px solid ${C.accent}d9;display:flex;align-items:center;justify-content:center;font-size:26px;z-index:9999;pointer-events:none;opacity:.95;transform:scale(1.12) rotate(-4deg);box-shadow:0 12px 36px rgba(0,0,0,.85),0 0 20px rgba(212,168,67,.2);`;el.textContent=emoji;document.body.appendChild(el);return el;};
  const setCellHL=(idx,on)=>{if(!gridRef.current)return;const cells=gridRef.current.querySelectorAll("[data-cell]");if(cells[idx])cells[idx].style.boxShadow=on?"inset 0 0 0 2px rgba(212,168,67,.9),0 0 14px rgba(212,168,67,.28)":"";};

  const roomDeckPtr=useRef(0);
  const drawCard=useCallback(()=>{
    if(roomDeckPtr.current>=roomDeck.length)return;
    const card=roomDeck[roomDeckPtr.current];
    roomDeckPtr.current+=1;
    setDeckLeft(n=>n-1);
    setMsgs(m=>[...m,{from:"user",text:"抽出了一張牌（牌背朝上）"}]);
    setDrawn(p=>[...p,card]);
  },[roomDeck]);

  const doShuffleRoom=useCallback(()=>{
    setShuffleAnim(true);setTimeout(()=>setShuffleAnim(false),600);
    roomDeckPtr.current=0;setRoomDeck(shuffle(DECK));setDeckLeft(78);setDrawn([]);setGrid(Array(36).fill(null));
    setMsgs(m=>[...m,{from:"system",text:"✦ 牌堆已重新洗牌，牌陣及抽出區已清空。"}]);
  },[]);

  const onCardPointerDown=useCallback((e,card)=>{
    e.preventDefault();
    const ghost=makeGhost(card,e.clientX,e.clientY);
    dragging.current={card,ghost};
    const onMove=ev=>{
      ghost.style.left=`${ev.clientX-27}px`;ghost.style.top=`${ev.clientY-43}px`;
      if(gridRef.current){const cells=gridRef.current.querySelectorAll("[data-cell]");let found=-1;cells.forEach((cell,i)=>{const r=cell.getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)found=i;});if(found!==hovered.current){if(hovered.current>=0)setCellHL(hovered.current,false);hovered.current=found;if(found>=0)setCellHL(found,true);}}
    };
    const onUp=()=>{
      document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp);
      ghost.remove();const idx=hovered.current;if(idx>=0)setCellHL(idx,false);hovered.current=-1;
      if(idx>=0&&dragging.current){const d=dragging.current.card;setGrid(g=>{const ng=[...g];const displaced=ng[idx];ng[idx]=d;if(displaced){setDrawn(p=>[...p.filter(c=>c.id!==d.id),displaced]);}else{setDrawn(p=>p.filter(c=>c.id!==d.id));}return ng;});}
      dragging.current=null;
    };
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  },[]);

  const onGridCardInteract=useCallback((e,card,srcIdx)=>{
    e.preventDefault();
    const startX=e.clientX,startY=e.clientY;const THRESH=8;let ghost=null,isDrag=false;
    let longT=setTimeout(()=>{if(!isDrag){window.getSelection()?.removeAllRanges();setZoom(card);}},600);
    const onMove=ev=>{
      const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(!isDrag&&Math.hypot(dx,dy)>THRESH){clearTimeout(longT);isDrag=true;ghost=makeGhost(card,ev.clientX,ev.clientY);dragging.current={card,ghost,src:srcIdx};}
      if(isDrag&&ghost){ghost.style.left=`${ev.clientX-27}px`;ghost.style.top=`${ev.clientY-43}px`;if(gridRef.current){const cells=gridRef.current.querySelectorAll("[data-cell]");let found=-1;cells.forEach((cell,i)=>{const r=cell.getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)found=i;});if(found!==hovered.current){if(hovered.current>=0)setCellHL(hovered.current,false);hovered.current=found;if(found>=0)setCellHL(found,true);}}}
    };
    const onUp=()=>{
      document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp);
      clearTimeout(longT);if(ghost)ghost.remove();
      const toIdx=hovered.current;if(toIdx>=0)setCellHL(toIdx,false);hovered.current=-1;
      if(isDrag&&toIdx>=0&&dragging.current&&srcIdx!==toIdx){const dropped=dragging.current.card;setGrid(g=>{const ng=[...g];const displaced=ng[toIdx];ng[toIdx]=dropped;ng[srcIdx]=displaced||null;return ng;});}
      dragging.current=null;
    };
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  },[]);

  const sendMsg=()=>{if(!input.trim())return;setMsgs(m=>[...m,{from:"user",text:input.trim()}]);setInput("");setTimeout(()=>setMsgs(m=>[...m,{from:"diviner",text:BOT_MSGS[Math.floor(Math.random()*BOT_MSGS.length)]}]),1200);};
  const submitExtra=()=>{const fee=parseInt(extraInput)||0;if(fee<=0)return;setExtraPending("sent");setMsgs(m=>[...m,{from:"system",text:`✦ 用戶申請加購 $${fee}，等待占卜師確認…`}]);setExtraInput("");setTimeout(()=>{setExtraPending("agreed");setTotalFee(t=>t+fee);setExtraOpen(false);setMsgs(m=>[...m,{from:"system",text:`✓ 占卜師已同意加購 $${fee}，費用已更新。`}]);},2000);};

  const sessionBgStyle=(()=>{
    const grad=C.bgGrad||C.bg;
    if(grad&&grad.startsWith("url(")){
      const urlMatch=grad.match(/url\(['"]?(data:[^'")]+)['"]?\)/);
      const dataUrl=urlMatch?urlMatch[1]:null;
      if(dataUrl){
        const lgStart=grad.lastIndexOf("linear-gradient(");
        let gradPart="linear-gradient(160deg,rgba(255,248,244,.95),rgba(255,245,240,.95))";
        if(lgStart>=0){
          let depth=0,i=lgStart;
          for(;i<grad.length;i++){if(grad[i]==="(")depth++;else if(grad[i]===")")if(--depth===0){i++;break;}}
          gradPart=grad.slice(lgStart,i);
        }
        return {backgroundColor:C.bg,backgroundImage:`url(${dataUrl}), ${gradPart}`,backgroundSize:"380px auto, cover",backgroundPosition:"center center, center center",backgroundRepeat:"repeat, no-repeat"};
      }
    }
    return {background:grad};
  })();
  return <div style={{position:"fixed",inset:0,...sessionBgStyle,zIndex:250,display:"flex",flexDirection:"column",fontFamily:"'Noto Sans TC',sans-serif",overscrollBehavior:"none"}}>
    {/* Top bar */}
    <div style={{display:"flex",alignItems:"center",gap:9,padding:"10px 14px",background:C.navBg,borderBottom:`1px solid ${C.navBorder}`,flexShrink:0,backdropFilter:"blur(10px)"}}>
      <div style={{fontSize:28.51,filter:"drop-shadow(0 0 10px rgba(124,58,237,.4))"}}>{matched?.avatar}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:14.26,color:C.gold,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{matched?.name}</div>
        <div style={{fontSize:10.69,color:C.green}}>● 占卜進行中</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2,height:18}}>
        {wave.map((h,i)=><div key={i} style={{width:2,height:h,borderRadius:1,background:muted?C.textFaint:"rgba(212,168,67,.7)",transition:"height .15s"}}/>)}
      </div>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:15.44,color:C.gold,flexShrink:0,background:C.bgPanel,padding:"3px 8px",borderRadius:6,border:`1px solid ${C.accentFaint}`}}>{fmt(timer)}</div>
      <button onClick={()=>setMuted(m=>!m)} style={{width:30,height:30,borderRadius:"50%",border:"none",cursor:"pointer",background:muted?"rgba(200,60,60,.25)":C.bgPanel,fontSize:15.44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{muted?"🔇":"🎙️"}</button>
      <button onClick={()=>setIsDiviner(v=>!v)} style={{
        padding:"4px 10px",borderRadius:50,cursor:"pointer",flexShrink:0,
        background:isDiviner?"rgba(212,168,67,.18)":"rgba(26,58,110,.25)",
        border:`1px solid ${isDiviner?"rgba(212,168,67,.55)":"rgba(26,58,110,.5)"}`,
        color:isDiviner?C.gold:C.textDim,
        fontFamily:"'Cinzel',serif",fontSize:9.5,letterSpacing:.5,
        transition:"all .2s",
      }}>{isDiviner?"⚜️ 師":"👤 客"}</button>
      <button onClick={()=>setLeaveModal(true)} style={{padding:"5px 11px",borderRadius:50,border:"1px solid rgba(200,80,80,.5)",background:"rgba(200,80,80,.18)",color:"rgba(240,160,160,.95)",fontFamily:"'Cinzel',serif",fontSize:10.69,cursor:"pointer",flexShrink:0}}>離開</button>
    </div>

    {/* Main scroll */}
    <div style={{flex:1,overflowY:"auto",overflowX:"hidden",overscrollBehavior:"none",paddingBottom:"25vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"4px 8px 3px",flexShrink:0,transform:"scale(0.9)",transformOrigin:"top center"}}>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:0}}>
          <div onClick={drawCard} style={{width:38,height:56,borderRadius:7,cursor:deckLeft?"pointer":"default",...cbBgStyle(),border:CB.id==="monsteraCard"?"none":`1px solid ${CB.border}`,opacity:deckLeft?1:.38,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",boxShadow:`inset 0 1px 0 rgba(255,255,255,.06),3px 3px 0 ${C.blue}4d,0 0 10px ${CB.idleShadow}`,flexShrink:0}}>
            <div style={{position:"absolute",inset:3,border:`1px solid ${(CB.id==="hibiscusCard"||CB.id==="monsteraCard")?"rgba(0,0,0,0)":CB.strokeDim}`,borderRadius:5,pointerEvents:"none"}}/>
            {(CB.id==="hibiscusCard"||CB.id==="monsteraCard")&&<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.12) 100%)",pointerEvents:"none",zIndex:4,borderRadius:7}}/>}
            {/* 龜背芋光影 */}
            {CB.id==="monsteraCard"&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:"linear-gradient(180deg,rgba(180,220,200,.28) 0%,rgba(180,220,200,.10) 60%,transparent 100%)",pointerEvents:"none",zIndex:4,borderRadius:"7px 7px 0 0"}}/>}
            {CB.id==="monsteraCard"&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:"linear-gradient(90deg,rgba(200,235,215,.20) 0%,rgba(200,235,215,.08) 55%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
            {CB.id==="monsteraCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(10,40,15,.20) 100%)",pointerEvents:"none",zIndex:4,borderRadius:7}}/>}
            {CB.id==="monsteraCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(220,245,230,.16) 0%,rgba(220,245,230,.05) 30%,transparent 55%,rgba(5,30,10,.08) 100%)",pointerEvents:"none",zIndex:4,borderRadius:7}}/>}
            {CB.id==="monsteraCard"&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:"linear-gradient(0deg,rgba(10,40,15,.18) 0%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
            {CB.id==="hibiscusCard"&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:"linear-gradient(180deg,rgba(180,210,255,.28) 0%,rgba(180,210,255,.10) 60%,transparent 100%)",pointerEvents:"none",zIndex:4,borderRadius:"7px 7px 0 0"}}/>}
            {CB.id==="hibiscusCard"&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:"linear-gradient(90deg,rgba(210,225,255,.20) 0%,rgba(210,225,255,.08) 55%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
            {CB.id==="hibiscusCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(60,10,5,.18) 100%)",pointerEvents:"none",zIndex:4,borderRadius:7}}/>}
            {CB.id==="hibiscusCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(220,235,255,.16) 0%,rgba(220,235,255,.05) 30%,transparent 55%,rgba(40,8,4,.07) 100%)",pointerEvents:"none",zIndex:4,borderRadius:7}}/>}
            {CB.id==="hibiscusCard"&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:"linear-gradient(0deg,rgba(60,10,5,.16) 0%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
            {CB.id!=="hibiscusCard"&&CB.id!=="monsteraCard"&&<div style={{position:"absolute",top:"-30%",left:"-20%",width:"60%",height:"160%",background:CB.shimmer,transform:"skewX(-10deg)",pointerEvents:"none"}}/>}
            {(CB.id==="hibiscusCard"||CB.id==="monsteraCard")&&<div style={{position:"absolute",top:"-40%",left:"-55%",width:"45%",height:"180%",
              background:CB.id==="hibiscusCard"
                ?"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(230,240,255,.45) 43%,rgba(210,225,255,.65) 50%,rgba(230,240,255,.45) 57%,transparent 72%,transparent 100%)"
                :"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(210,240,225,.45) 43%,rgba(180,230,205,.68) 50%,rgba(210,240,225,.45) 57%,transparent 72%,transparent 100%)",
              transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,
              animation:CB.id==="hibiscusCard"?"hibiscusShimmer 2.8s ease-in-out infinite":"monsteraShimmer 2.8s ease-in-out infinite"}}/>}
            {CB.id==="hibiscusCard"
              ?<svg viewBox="0 0 60 70" width={16} height={19} fill="none" style={{position:"relative",zIndex:2}}>
                <path d="M30,35 C27,30 26,22 27.5,17 C28.5,14 30,13.5 30,13.5 C30,13.5 31.5,14 32.5,17 C34,22 33,30 30,35 Z" fill="rgba(210,40,20,0.82)"/>
                <path d="M30,35 C34.5,32.5 39,31.5 42.5,33.5 C44,35 44,39 40,38.5 C36,36.5 30,35 30,35 Z" fill="rgba(215,45,22,0.8)"/>
                <path d="M30,35 C32,39 32.5,45 30,48.5 C29,50.5 27.5,51 26.5,50 C27,44.5 30,35 30,35 Z" fill="rgba(205,38,18,0.8)"/>
                <path d="M30,35 C26,37 22,38.5 19.5,37 C18,36 18.5,33 24,32.5 C27,33.5 30,35 30,35 Z" fill="rgba(210,42,20,0.78)"/>
                <path d="M30,35 C27.5,31 25,27 23,23 C22,20.5 24.5,18 29,22 C30,25 30,35 30,35 Z" fill="rgba(218,48,24,0.8)"/>
                <circle cx="30" cy="35" r="3.5" fill="rgba(220,140,20,0.9)"/>
                <circle cx="30" cy="35" r="1.8" fill="rgba(250,200,40,0.95)"/>
              </svg>
              :CB.id==="monsteraCard"
              ?null
              :<svg viewBox="0 0 60 70" width={16} height={19} fill="none" style={{position:"relative",zIndex:2}}>
                <polygon points="30,3 57,18 57,52 30,67 3,52 3,18" stroke={CB.stroke} strokeWidth="1.2" fill="none"/>
                <polygon points="30,13 47,23 47,47 30,57 13,47 13,23" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
                <circle cx="30" cy="35" r="7" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
                <circle cx="30" cy="35" r="2.5" fill={CB.centerDot}/>
              </svg>
            }
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:2,position:"relative",zIndex:2,gap:1}}>
              <div style={{fontSize:8.5,color:CB.centerDot,fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1}}>{deckLeft}</div>
              <div style={{fontSize:5.5,color:CB.footnote,fontFamily:"'Cinzel',serif",letterSpacing:.5,lineHeight:1}}>剩餘</div>
            </div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:9.5,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:2}}>✦ 牌堆（點擊抽牌）</div>
            <div style={{fontSize:8.32,color:C.textFaint,lineHeight:1.6}}>抽出牌背・拖移至格子・長按放大</div>
          </div>
          <button onClick={doShuffleRoom} style={{display:"flex",alignItems:"center",gap:3,padding:"4px 9px",borderRadius:50,cursor:"pointer",background:`linear-gradient(135deg,${C.blue},${C.blue}cc)`,border:`1px solid ${C.accentDim}`,fontFamily:"'Cinzel',serif",fontSize:9.5,color:C.gold,flexShrink:0,transform:shuffleAnim?"scale(.9)":"scale(1)",transition:"transform .15s"}}>
            <span style={{fontSize:11.88,display:"inline-block",animation:shuffleAnim?"spin .6s linear":"none"}}>🔀</span>
            <span>洗牌</span>
          </button>
        </div>
        <div style={{marginTop:6}}>
          <div style={{fontSize:8.32,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:4}}>✦ 抽出區 {drawn.length>0?`(${drawn.length})`:""}</div>
          <div style={{
            display:"flex",gap:5,overflowX:"auto",overscrollBehavior:"none",paddingBottom:3,
            minHeight:56,alignItems:"center",
            borderRadius:7,border:`1px dashed ${C.gridBorder}`,
            padding:"5px 7px",
            background:C.gridBg,
          }}>
            {drawn.length>0
              ?drawn.map((card,idx)=>(
                <div key={card.id} onPointerDown={isDiviner?e=>onCardPointerDown(e,card):undefined} style={{userSelect:"none",touchAction:"none",cursor:isDiviner?"grab":"default",opacity:isDiviner?1:.85,position:"relative",flexShrink:0}}>
                  <CardBack w={34} h={52}/>
                  <div style={{
                    position:"absolute",top:2,left:2,
                    width:13,height:13,borderRadius:"50%",
                    background:C.bgPanel,
                    border:`1px solid ${C.accentDim}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:7,fontFamily:"'Cinzel',serif",
                    color:C.accent,
                    fontWeight:700,lineHeight:1,
                    pointerEvents:"none",zIndex:10,
                  }}>{idx+1}</div>
                </div>
              ))
              :<div style={{fontSize:8,color:C.textFaint,fontFamily:"'Cinzel',serif",letterSpacing:1,margin:"auto"}}>尚未抽出牌</div>
            }
          </div>
        </div>
      </div>

      {/* 6×6 Grid */}
      <div style={{padding:"0 8px 5px",flexShrink:0,transform:"scale(0.9)",transformOrigin:"top center"}}>
        <div style={{fontSize:9.5,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2,marginBottom:4,textAlign:"center"}}>✦ 牌陣區域</div>
        <div ref={gridRef} style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:2,background:C.gridBg,border:`1px solid ${C.gridBorder}`,borderRadius:10,padding:5,boxShadow:"inset 0 2px 14px rgba(0,0,0,.3)"}}>
          {grid.map((card,i)=>(
            <div key={i} data-cell={i}
              onPointerDown={isDiviner?e=>{if(card)onGridCardInteract(e,card,i);}:undefined}
              style={{aspectRatio:"2/3",borderRadius:6,position:"relative",
                border:card?`1px solid ${C.cardBorder}`:`1px dashed ${C.gridBorder}`,
                background:card?C.bgCard:C.gridBg,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                overflow:"hidden",cursor:card&&isDiviner?"grab":"default",
                transition:"box-shadow .2s",
                userSelect:"none",touchAction:"none"}}>
              {card
                ?<>{card.img
                    ?<img src={card.img} alt={card.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:6,transform:card.reversed?"rotate(180deg)":"none",pointerEvents:"none"}}/>
                    :<div style={{fontSize:16.63,pointerEvents:"none",transform:card.reversed?"rotate(180deg)":"none",display:"inline-block"}}>{card.emoji}</div>
                  }
                  <div style={{position:"absolute",bottom:2,left:0,right:0,fontSize:4.75,fontFamily:"'Cinzel',serif",color:`${C.accent}cc`,textAlign:"center",pointerEvents:"none",zIndex:2,textShadow:"0 1px 3px rgba(0,0,0,.9)"}}>{card.name}{card.reversed?" ↓":" ↑"}</div></>
                :<div style={{fontSize:8.32,color:C.textFaint}}>✦</div>}
            </div>
          ))}
        </div>
      </div>

    </div>

    {/* Fixed chat */}
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25vh",minHeight:170,display:"flex",flexDirection:"column",background:C.navBg,borderTop:`1px solid ${C.navBorder}`,zIndex:10,overscrollBehavior:"none",backdropFilter:"blur(10px)"}}>
      {/* Chat header */}
      <div style={{padding:"5px 13px 0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:10.69,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2}}>💬 即時訊息</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Inline fee badge */}
          <div style={{display:"flex",alignItems:"center",gap:4,padding:"2px 8px",background:C.bgPanel,border:`1px solid ${C.accentFaint}`,borderRadius:50}}>
            <span style={{fontSize:9.5,color:C.goldDim,fontFamily:"'Cinzel',serif"}}>費用</span>
            <span style={{fontSize:11.88,color:C.gold,fontFamily:"'Cinzel',serif",fontWeight:700}}>NT${totalFee}</span>
            {extraPending==="agreed"&&<span style={{fontSize:10.69,color:C.green}}>✓</span>}
          </div>
          <div style={{fontSize:10.69,color:C.textFaint}}>{msgs.filter(m=>m.from!=="system").length}則</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"5px 13px",display:"flex",flexDirection:"column",gap:5,overscrollBehavior:"contain"}}>
        {msgs.map((msg,i)=><div key={i} style={{display:"flex",flexDirection:msg.from==="user"?"row-reverse":"row",alignItems:"flex-end",gap:5,animation:"fadeIn .3s ease"}}>
          {msg.from==="system"?<div style={{width:"100%",textAlign:"center",fontSize:9.5,color:C.textFaint,padding:"2px 8px",background:C.bgPanel,borderRadius:50}}>{msg.text}</div>:<>
            <div style={{fontSize:19.01,flexShrink:0}}>{msg.from==="diviner"?matched?.avatar:"🙋"}</div>
            <div style={{maxWidth:"75%",padding:"6px 10px",borderRadius:12,
              background:msg.from==="user"?`linear-gradient(135deg,${C.blue},${C.accent}22)`:C.bgPanel,
              border:msg.from==="user"?`1px solid ${C.accentFaint}`:`1px solid ${C.gridBorder}`,
              fontSize:13.66,color:C.text,lineHeight:1.65,
              borderBottomRightRadius:msg.from==="user"?2:12,
              borderBottomLeftRadius:msg.from==="diviner"?2:12}}>{msg.text}</div>
          </>}
        </div>)}
      </div>

      {/* Extra-fee inline panel (slides in above input bar) */}
      {extraOpen&&<div style={{padding:"8px 12px 6px",borderTop:`1px solid ${C.accentFaint}`,background:C.bgPanel,animation:"fadeInUp .22s ease",flexShrink:0}}>
        <div style={{fontSize:9.5,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:6}}>✦ 申請續加費用</div>
        {extraPending==="sent"
          ?<div style={{fontSize:11.88,color:C.goldDim,textAlign:"center",padding:"4px 0"}}>⏳ 等待占卜師確認…</div>
          :<div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{position:"relative",flex:1}}>
              <span style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",fontSize:13.07,color:C.goldDim,pointerEvents:"none"}}>NT$</span>
              <input
                type="number" min="1" placeholder="輸入金額"
                value={extraInput}
                onChange={e=>setExtraInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&submitExtra()}
                style={{width:"100%",padding:"7px 10px 7px 36px",background:C.bgPanel,border:`1px solid ${C.blue}88`,borderRadius:8,color:C.gold,fontSize:14.26,fontFamily:"'Cinzel',serif",outline:"none"}}
              />
            </div>
            <button
              onClick={submitExtra}
              disabled={!extraInput||parseInt(extraInput)<=0}
              style={{padding:"7px 16px",borderRadius:50,whiteSpace:"nowrap",
                background:extraInput&&parseInt(extraInput)>0?`linear-gradient(135deg,${C.blue},${C.accent})`:C.bgPanel,
                border:"1px solid rgba(212,168,67,.4)",
                fontFamily:"'Cinzel',serif",fontSize:11.88,fontWeight:700,
                color:extraInput&&parseInt(extraInput)>0?C.buttonText||"#1a0e00":C.goldDim,
                cursor:extraInput&&parseInt(extraInput)>0?"pointer":"not-allowed"}}>
              送出申請
            </button>
            <button
              onClick={()=>{setExtraOpen(false);setExtraInput("");}}
              style={{width:28,height:28,borderRadius:"50%",border:`1px solid ${C.gridBorder}`,background:C.bgPanel,color:C.textDim,fontSize:15.44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              ✕
            </button>
          </div>}
      </div>}

      {/* Input bar */}
      <div style={{padding:"5px 10px 9px",borderTop:`1px solid ${C.gridBorder}`,display:"flex",gap:7,alignItems:"center",flexShrink:0,background:C.navBg}}>
        {/* 續加按鈕 */}
        <button
          onClick={()=>{setExtraOpen(o=>!o);setExtraInput("");if(extraPending==="agreed")setExtraPending(null);}}
          title="申請續加費用"
          style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${extraOpen?C.accent:C.accentDim}`,
            background:extraOpen?`linear-gradient(135deg,${C.blue},${C.accent}44)`:C.bgPanel,
            fontSize:16.63,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            flexShrink:0,transition:"all .2s",
            boxShadow:extraOpen?`0 0 10px ${C.accentFaint}`:"none"}}>
          💰
        </button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="輸入訊息…" style={{flex:1,padding:"7px 14px",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:50,color:C.text,fontSize:14.26,outline:"none"}}/>
        <button onClick={sendMsg} style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${C.accentDim}`,background:`linear-gradient(135deg,${C.blue},${C.accent})`,fontSize:15.44,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.buttonText||"#1a0e00",fontWeight:700}}>➤</button>
      </div>
    </div>

    {/* Leave confirm */}
    {leaveModal&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.88)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(6px)"}}>
      <div style={{width:"100%",maxWidth:290,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderRadius:22,padding:26,textAlign:"center"}}>
        <div style={{fontSize:42.77,marginBottom:10}}>⚠️</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16.63,color:C.gold,marginBottom:8}}>確認離開占卜？</div>
        <div style={{fontSize:13.07,color:C.textDim,marginBottom:22,lineHeight:1.75}}>離開後將進入結帳，<br/>本次費用 <span style={{color:C.gold}}>NT${totalFee}</span></div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setLeaveModal(false)} style={{flex:1,padding:"10px 0",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:50,fontFamily:"'Cinzel',serif",fontSize:11.88,color:C.textDim,cursor:"pointer"}}>繼續占卜</button>
          <button onClick={()=>{setLeaveModal(false);setCheckoutModal(true);}} style={{flex:1,padding:"10px 0",background:"linear-gradient(135deg,#3a0c0c,#8a1a1a)",border:"1px solid rgba(200,80,80,.4)",borderRadius:50,fontFamily:"'Cinzel',serif",fontSize:11.88,color:"rgba(240,160,160,.95)",cursor:"pointer"}}>確認離開</button>
        </div>
      </div>
    </div>}

    {/* Checkout */}
    {checkoutModal&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.92)",zIndex:80,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
      <div style={{width:"100%",maxWidth:320,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderRadius:22,padding:26}}>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16.63,color:C.gold,textAlign:"center",marginBottom:20}}>結帳明細</div>
        <div style={{background:C.bgPanel,borderRadius:12,padding:14,marginBottom:16}}>
          {[["基本占卜費用",`NT$${matched?.price}`],["占卜時長",fmt(timer)]].map(([k,v],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.gridBorder}`}}>
            <span style={{fontSize:14.26,color:C.textDim}}>{k}</span>
            <span style={{fontSize:14.26,color:C.gold,fontFamily:"'Cinzel',serif"}}>{v}</span>
          </div>)}
          <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0"}}>
            <span style={{fontSize:15.44,color:C.text}}>合計</span>
            <span style={{fontSize:21.38,color:C.green,fontFamily:"'Cinzel',serif",fontWeight:700}}>NT${totalFee}</span>
          </div>
        </div>
        <div style={{fontSize:10.69,color:C.textFaint,textAlign:"center",marginBottom:18}}>付款方式：信用卡 •••• 8888</div>
        <GoldPayBtn onClick={()=>{setCheckoutModal(false);onEnd();}} style={{width:"100%",textAlign:"center",letterSpacing:3}}>
          ✦ 確認結帳
        </GoldPayBtn>
      </div>
    </div>}

    <CardModal card={zoom} onClose={()=>setZoom(null)}/>
  </div>;
}

// ── Review Page ───────────────────────────────────────────────────────────────
function ReviewPage({matched,rating,setRating,reportReasons,onDone,onAddAppointment}){
  const [reportOpen,setReportOpen]=useState(false);
  const [reportReason,setReportReason]=useState("");
  const [reportDetail,setReportDetail]=useState("");
  const [reportSent,setReportSent]=useState(false);
  const [friendAdded,setFriendAdded]=useState(false);
  const [bookingOpen,setBookingOpen]=useState(false);
  const [bookingDate,setBookingDate]=useState("");
  const [bookingTime,setBookingTime]=useState("");
  const [bookingItem,setBookingItem]=useState("");
  const [bookingSent,setBookingSent]=useState(false);
  const [calOpen,setCalOpen]=useState(false);
  const bookingItemObj=DIVINATION_ITEMS.find(i=>i.id===bookingItem);
  const bookingFinalPrice=bookingItem?Math.round((matched?.price||0)*ITEM_MULTIPLIER[bookingItem]):null;

  const submitReport=()=>{if(!reportReason)return;setReportSent(true);};
  const submitBooking=()=>{if(!bookingDate||!bookingTime||!bookingItem)return;setBookingSent(true);onAddAppointment&&onAddAppointment({divId:matched?.id,divName:matched?.name,date:bookingDate,time:bookingTime,item:bookingItem,itemObj:bookingItemObj,finalPrice:bookingFinalPrice});};

  return <div style={{padding:"24px 20px 100px",animation:"fadeInUp .4s ease"}}>
    {/* Header */}
    <div style={{textAlign:"center",marginBottom:22}}>
      <div style={{fontSize:61.78,marginBottom:10,filter:"drop-shadow(0 0 24px rgba(212,168,67,.4))"}}>✨</div>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:19.01,color:C.gold,letterSpacing:2}}>占卜圓滿結束</div>
      <div style={{fontSize:13.07,color:C.textDim,marginTop:6}}>與 {matched?.name} 的占卜已完成</div>
    </div>

    {/* Star rating card */}
    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:22,marginBottom:14,backdropFilter:"blur(10px)"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:C.goldDim,marginBottom:14,textAlign:"center",letterSpacing:2}}>為這次占卜留下評價</div>
      <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16}}>
        {[1,2,3,4,5].map(s=><div key={s} onClick={()=>{setRating(s);setReportOpen(false);setFriendAdded(false);setBookingOpen(false);}} style={{fontSize:40.39,cursor:"pointer",opacity:s<=rating?1:.25,transition:"all .2s",transform:s<=rating?"scale(1.1)":"scale(1)"}}>⭐</div>)}
      </div>

      {/* 1-star: report */}
      {rating===1&&!reportSent&&<div style={{animation:"fadeInUp .3s ease"}}>
        <div style={{fontSize:11.88,color:"rgba(240,160,160,.8)",textAlign:"center",marginBottom:12,padding:"8px 12px",background:"rgba(200,60,60,.1)",border:"1px solid rgba(200,60,60,.25)",borderRadius:10}}>
          很遺憾這次體驗未達標準，您可以向系統提交檢舉
        </div>
        {!reportOpen
          ?<button onClick={()=>setReportOpen(true)} style={{width:"100%",padding:"10px 0",borderRadius:50,background:"rgba(200,60,60,.18)",border:"1px solid rgba(200,80,80,.4)",color:"rgba(240,160,160,.9)",fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",letterSpacing:1}}>
            🚩 提交檢舉
          </button>
          :<div style={{animation:"fadeInUp .25s ease"}}>
            <div style={{fontSize:11.88,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:8}}>選擇檢舉原因</div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
              {reportReasons.map(r=><button key={r} onClick={()=>setReportReason(r)} style={{
                padding:"9px 14px",borderRadius:10,textAlign:"left",cursor:"pointer",fontSize:13.07,
                background:reportReason===r?"rgba(200,60,60,.2)":C.bgPanel,
                border:reportReason===r?"1px solid rgba(200,80,80,.55)":`1px solid ${C.gridBorder}`,
                color:reportReason===r?"rgba(250,180,180,.95)":C.text,
                transition:"all .15s"
              }}>{reportReason===r?"● ":""}{r}</button>)}
            </div>
            <textarea value={reportDetail} onChange={e=>setReportDetail(e.target.value)} placeholder="補充說明（選填）…" rows={3} style={{width:"100%",padding:"10px 12px",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:10,color:C.text,fontSize:13.07,resize:"none",outline:"none",marginBottom:10,fontFamily:"'Noto Sans TC',sans-serif",lineHeight:1.7}}/>
            <button onClick={submitReport} disabled={!reportReason} style={{width:"100%",padding:"10px 0",borderRadius:50,background:reportReason?"linear-gradient(135deg,#7c1d1d,#c0392b)":C.bgPanel,border:reportReason?"1px solid rgba(200,80,80,.5)":`1px solid ${C.gridBorder}`,color:reportReason?"#fff":C.textFaint,fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:reportReason?"pointer":"not-allowed",letterSpacing:1}}>
              {reportReason?"確認提交檢舉":"請先選擇原因"}
            </button>
          </div>}
      </div>}

      {/* 1-star: sent */}
      {rating===1&&reportSent&&<div style={{textAlign:"center",padding:"10px 0",animation:"fadeInUp .3s ease"}}>
        <div style={{fontSize:26.14,marginBottom:6}}>✅</div>
        <div style={{fontSize:13.07,color:C.green}}>檢舉已提交，系統將於 24 小時內處理</div>
      </div>}

      {/* 5-star: add friend / book */}
      {rating===5&&<div style={{animation:"fadeInUp .3s ease"}}>
        <div style={{fontSize:11.88,color:C.gold,textAlign:"center",marginBottom:12,padding:"8px 12px",background:C.goldFaint,border:`1px solid rgba(212,168,67,.28)`,borderRadius:10}}>
          五星好評！感謝您的肯定 ✦
        </div>
        {!friendAdded
          ?<button onClick={()=>setFriendAdded(true)} style={{width:"100%",padding:"10px 0",borderRadius:50,background:`linear-gradient(135deg,${C.blue},${C.blue}cc)`,border:`1px solid ${C.accentDim}`,color:C.gold,fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",letterSpacing:1,marginBottom:8}}>
            ✦ 加入占卜師好友
          </button>
          :<div style={{animation:"fadeInUp .25s ease"}}>
            <div style={{textAlign:"center",padding:"8px 0 12px",fontSize:13.07,color:C.green}}>✓ 已加入 {matched?.name} 為好友</div>
            {!bookingOpen&&!bookingSent&&<button onClick={()=>setBookingOpen(true)} style={{width:"100%",padding:"10px 0",borderRadius:50,background:"linear-gradient(135deg,#b8862a,#e8c86a)",border:"1px solid rgba(212,168,67,.6)",color:C.buttonText||"#1a0e00",fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",letterSpacing:1,fontWeight:700}}>
              📅 預約下次占卜
            </button>}
            {bookingOpen&&!bookingSent&&<div style={{animation:"fadeInUp .25s ease",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:12,padding:14}}>
              <div style={{fontSize:11.88,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:10}}>選擇預約時間</div>

              {/* 日期 */}
              <div style={{marginBottom:8}}>
                <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>日期</div>
                <button onClick={()=>setCalOpen(c=>!c)} style={{
                  width:"100%",padding:"9px 12px",borderRadius:8,textAlign:"left",cursor:"pointer",
                  background:C.bgPanel,border:bookingDate?`1px solid ${C.green}66`:`1px solid ${C.gridBorder}`,
                  color:bookingDate?C.green:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:13.07,
                  display:"flex",justifyContent:"space-between",alignItems:"center"
                }}>
                  <span>{bookingDate||"點擊選擇日期"}</span>
                  <span style={{fontSize:10.69,color:C.textFaint}}>{calOpen?"▲":"▼"}</span>
                </button>
                {calOpen&&<div style={{marginTop:6,padding:12,background:C.navBg,border:`1px solid ${C.navBorder}`,borderRadius:10}}>
                  <BookingCalendar divId={matched?.id} date={bookingDate}
                    onSelectDate={d=>{setBookingDate(d);setBookingTime("");setBookingItem("");}}
                    time={bookingTime} onSelectTime={setBookingTime}
                    item={bookingItem} onSelectItem={setBookingItem}
                    basePrice={matched?.price} onClose={()=>setCalOpen(false)}/>
                </div>}
              </div>

              {/* 時段 */}
              {bookingDate&&<div style={{marginBottom:8}}>
                <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>時段</div>
                <button onClick={()=>setCalOpen(true)} style={{
                  width:"100%",padding:"9px 12px",borderRadius:8,textAlign:"left",cursor:"pointer",
                  background:C.bgPanel,border:bookingTime?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
                  color:bookingTime?C.gold:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:13.07,
                  display:"flex",justifyContent:"space-between",alignItems:"center"
                }}>
                  <span>{bookingTime||"點擊選擇時段"}</span>
                  <span style={{fontSize:10.69,color:C.textFaint}}>▼</span>
                </button>
              </div>}

              {bookingTime&&<div style={{marginBottom:10}}>
                <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>占卜項目</div>
                <button onClick={()=>setCalOpen(true)} style={{
                  width:"100%",padding:"9px 12px",borderRadius:8,textAlign:"left",cursor:"pointer",
                  background:C.bgPanel,border:bookingItem?`1px solid ${C.blue}66`:`1px solid ${C.gridBorder}`,
                  color:bookingItem?C.blue:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:13.07,
                  display:"flex",justifyContent:"space-between",alignItems:"center"
                }}>
                  <span>{bookingItemObj?`${bookingItemObj.emoji} ${bookingItemObj.name}`:"點擊選擇項目"}</span>
                  {bookingFinalPrice&&<span style={{fontSize:11.88,color:C.gold,fontWeight:700}}>NT${bookingFinalPrice}</span>}
                </button>
              </div>}

              <button onClick={submitBooking} disabled={!bookingDate||!bookingTime||!bookingItem} style={{width:"100%",padding:"10px 0",borderRadius:50,background:bookingDate&&bookingTime&&bookingItem?`linear-gradient(135deg,${C.blue},${C.accent})`:C.bgPanel,border:bookingDate&&bookingTime&&bookingItem?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,color:bookingDate&&bookingTime&&bookingItem?C.buttonText||"#1a0e00":C.textFaint,fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:bookingDate&&bookingTime&&bookingItem?"pointer":"not-allowed",fontWeight:700}}>
                {bookingFinalPrice?`確認預約 NT$${bookingFinalPrice}`:"確認預約"}
              </button>
            </div>}
            {bookingSent&&<div style={{textAlign:"center",padding:"10px 0",animation:"fadeInUp .3s ease"}}>
              <div style={{fontSize:26.14,marginBottom:6}}>📅</div>
              <div style={{fontSize:13.07,color:C.green,marginBottom:2}}>預約成功！</div>
              <div style={{fontSize:11.88,color:C.textDim}}>{matched?.name} ・ {bookingDate} {bookingTime}</div>
            </div>}
          </div>}
      </div>}
    </div>

    <GoldPayBtn onClick={onDone} style={{width:"100%",textAlign:"center",letterSpacing:2}}>
      ✦ 完成評價
    </GoldPayBtn>
  </div>;
}

// ── Friend Card ──────────────────────────────────────────────────────────────
function FriendCard({div,rec,note,idx,total,onStartMatch,onSaveNote,onDelete,onMoveUp,onMoveDown,onAddAppointment}){
  const [menuOpen,setMenuOpen]=useState(false);
  const [mode,setMode]=useState(null); // "note" | "delete"
  const [noteVal,setNoteVal]=useState(note);
  const longPressRef=useRef(null);
  const LONG_MS=500;

  const startPress=e=>{
    e.preventDefault();
    longPressRef.current=setTimeout(()=>setMenuOpen(true),LONG_MS);
  };
  const cancelPress=()=>clearTimeout(longPressRef.current);

  const closeAll=()=>{setMenuOpen(false);setMode(null);};

  return <>
    <div
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      style={{
        background:C.bgPanel,
        border:menuOpen?"1px solid rgba(212,168,67,.7)":"1px solid rgba(212,168,67,.35)",
        borderRadius:18,padding:16,marginBottom:12,
        backdropFilter:"blur(10px)",
        boxShadow:menuOpen
          ?"0 4px 28px rgba(0,0,0,.5), 0 0 28px rgba(212,168,67,.12)"
          :"0 4px 20px rgba(0,0,0,.4), 0 0 20px rgba(212,168,67,.05)",
        transition:"border .2s, box-shadow .2s",
        userSelect:"none",
        position:"relative",
      }}>
      {/* 順序提示 */}
      <div style={{position:"absolute",top:10,right:12,fontSize:10.69,color:C.textFaint,fontFamily:"'Cinzel',serif"}}>#{idx+1}</div>

      <div style={{display:"flex",gap:13,alignItems:"flex-start"}}>
        <div style={{position:"relative"}}>
          <div style={{fontSize:47.52,lineHeight:1,filter:"drop-shadow(0 0 12px rgba(212,168,67,.3))"}}>{div.avatar}</div>
          <div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:div.online?C.green:"rgba(205,221,245,.3)",border:`2px solid ${C.bg}`,boxShadow:div.online?`0 0 6px ${C.green}`:"none"}}/>
          <div style={{position:"absolute",top:-6,left:-6,fontSize:13}}>⭐</div>
        </div>
        <div style={{flex:1,paddingRight:16}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:15.44,color:C.gold,marginBottom:2}}>{div.name}</div>
          <div style={{fontSize:11.88,color:div.online?C.green:C.textFaint,marginBottom:3}}>
            {div.online?"● 線上中":"○ 離線"} ・ ⭐ {div.rating} ({div.reviews} 則)
          </div>
          <div style={{fontSize:10.69,color:C.goldDim,marginBottom:note?6:8,display:"flex",gap:8,flexWrap:"wrap"}}>
            <span>共占卜 {rec.count||1} 次</span>
            {rec.lastDate&&<span>最近：{rec.lastDate}</span>}
          </div>
          {/* 顯示備注 */}
          {note&&<div style={{fontSize:11.88,color:C.textDim,marginBottom:8,padding:"5px 9px",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:8,lineHeight:1.6}}>
            📝 {note}
          </div>}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <GoldPayBtn onClick={()=>onStartMatch(div)} disabled={!div.online} style={{padding:"7px 16px",fontSize:9}}>
                {div.online?"✦ 立即媒合":"暫不開放"}
              </GoldPayBtn>
              {div.online&&<div style={{fontSize:10.69,color:C.textFaint}}>等待 &lt; 1 分</div>}
            </div>
            <FriendBookingBtn div={div} onAddAppointment={onAddAppointment}/>
          </div>
        </div>
      </div>

      {/* 長按提示 */}
      {!menuOpen&&<div style={{position:"absolute",bottom:10,right:12,fontSize:9.5,color:C.textFaint}}>長按管理</div>}
    </div>

    {/* 長按選單 Overlay */}
    {menuOpen&&<div onClick={closeAll} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.72)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:390,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:"16px 18px 40px",boxShadow:"0 -10px 50px rgba(0,0,0,.7)",animation:"fadeInUp .28s ease"}}>
        {/* Handle */}
        <div style={{width:36,height:3,borderRadius:2,background:C.accentDim,margin:"0 auto 16px"}}/>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
          <div style={{fontSize:28}}>{div.avatar}</div>
          <div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:15.44,color:C.gold}}>{div.name}</div>
            <div style={{fontSize:10.69,color:C.goldDim}}>好友管理</div>
          </div>
        </div>

        {/* 備注編輯模式 */}
        {mode==="note"&&<div style={{animation:"fadeInUp .2s ease",marginBottom:14}}>
          <div style={{fontSize:11.88,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:8}}>✦ 編輯備注</div>
          <textarea
            value={noteVal}
            onChange={e=>setNoteVal(e.target.value)}
            placeholder="輸入備注，例如：擅長感情問題、聲音很好聽…"
            rows={3}
            autoFocus
            style={{width:"100%",padding:"10px 12px",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:10,color:C.text,fontSize:13.07,resize:"none",outline:"none",marginBottom:10,fontFamily:"'Noto Sans TC',sans-serif",lineHeight:1.75}}
          />
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setMode(null)} style={{flex:1,padding:"9px 0",borderRadius:50,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,color:C.textDim,fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer"}}>取消</button>
            <button onClick={()=>{onSaveNote(noteVal);closeAll();}} style={{flex:2,padding:"9px 0",borderRadius:50,background:"linear-gradient(135deg,#b8862a,#e8c86a)",border:"1px solid rgba(212,168,67,.6)",color:C.buttonText||"#1a0e00",fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",fontWeight:700}}>儲存備注</button>
          </div>
        </div>}

        {/* 刪除確認模式 */}
        {mode==="delete"&&<div style={{animation:"fadeInUp .2s ease",marginBottom:14}}>
          <div style={{fontSize:13.07,color:"rgba(240,160,160,.9)",textAlign:"center",marginBottom:14,lineHeight:1.8}}>
            確定要刪除好友 <span style={{color:C.gold}}>{div.name}</span>？<br/>
            <span style={{fontSize:10.69,color:C.textFaint}}>刪除後可重新占卜並給予五星評分來恢復</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setMode(null)} style={{flex:1,padding:"9px 0",borderRadius:50,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,color:C.textDim,fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer"}}>取消</button>
            <button onClick={()=>{onDelete();closeAll();}} style={{flex:2,padding:"9px 0",borderRadius:50,background:"linear-gradient(135deg,#7c1d1d,#c0392b)",border:"1px solid rgba(200,80,80,.5)",color:"#fff",fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",fontWeight:700}}>確認刪除</button>
          </div>
        </div>}

        {/* 主選單 */}
        {!mode&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
          <button onClick={()=>setMode("note")} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:13,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:20}}>📝</span>
            <div>
              <div style={{fontSize:14.26,color:C.text,marginBottom:1}}>編輯備注</div>
              <div style={{fontSize:10.69,color:C.textFaint}}>{note?"修改現有備注":"為這位占卜師新增備注"}</div>
            </div>
          </button>
          <button onClick={()=>{if(idx>0)onMoveUp();}} disabled={idx===0} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:13,background:idx===0?C.bgPanel:C.bgPanel,border:`1px solid ${C.gridBorder}`,cursor:idx===0?"not-allowed":"pointer",opacity:idx===0?.4:1,textAlign:"left"}}>
            <span style={{fontSize:20}}>⬆️</span>
            <div>
              <div style={{fontSize:14.26,color:C.text,marginBottom:1}}>往上移動</div>
              <div style={{fontSize:10.69,color:C.textFaint}}>目前排序第 {idx+1} 位</div>
            </div>
          </button>
          <button onClick={()=>{if(idx<total-1)onMoveDown();}} disabled={idx===total-1} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:13,background:idx===total-1?C.bgPanel:C.bgPanel,border:`1px solid ${C.gridBorder}`,cursor:idx===total-1?"not-allowed":"pointer",opacity:idx===total-1?.4:1,textAlign:"left"}}>
            <span style={{fontSize:20}}>⬇️</span>
            <div>
              <div style={{fontSize:14.26,color:C.text,marginBottom:1}}>往下移動</div>
              <div style={{fontSize:10.69,color:C.textFaint}}>共 {total} 位好友</div>
            </div>
          </button>
          <button onClick={()=>setMode("delete")} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:13,background:"rgba(200,60,60,.1)",border:"1px solid rgba(200,80,80,.28)",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:20}}>🗑️</span>
            <div>
              <div style={{fontSize:14.26,color:"rgba(240,160,160,.9)",marginBottom:1}}>刪除好友</div>
              <div style={{fontSize:10.69,color:C.textFaint}}>從好友列表中移除</div>
            </div>
          </button>
          <button onClick={closeAll} style={{padding:"11px 0",borderRadius:50,background:"none",border:`1px solid ${C.gridBorder}`,color:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",marginTop:2}}>關閉</button>
        </div>}
      </div>
    </div>}
  </>;
}

// ── Friend Booking Button ─────────────────────────────────────────────────────
function FriendBookingBtn({div,onAddAppointment}){
  const [open,setOpen]=useState(false);
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [item,setItem]=useState("");
  const [calOpen,setCalOpen]=useState(false);
  const [sent,setSent]=useState(false);
  const itemObj=DIVINATION_ITEMS.find(i=>i.id===item);
  const finalPrice=item?Math.round(div.price*ITEM_MULTIPLIER[item]):null;

  if(sent)return <div style={{fontSize:11.88,color:C.green,padding:"8px 12px",background:"rgba(52,211,153,.08)",border:"1px solid rgba(52,211,153,.2)",borderRadius:10,display:"flex",flexDirection:"column",gap:3}}>
    <div style={{display:"flex",alignItems:"center",gap:5}}><span>📅</span><span>{date} {time} 已預約</span></div>
    {itemObj&&<div style={{fontSize:10.69,color:C.goldDim,paddingLeft:18}}>{itemObj.emoji} {itemObj.name}・NT${finalPrice}</div>}
  </div>;

  if(!open)return <button onClick={()=>setOpen(true)} style={{padding:"7px 14px",borderRadius:50,background:C.bgPanel,border:`1px solid ${C.accentDim}`,color:C.gold,fontFamily:"'Cinzel',serif",fontSize:10.69,cursor:"pointer",letterSpacing:.5}}>
    📅 預約
  </button>;

  return <div style={{marginTop:10,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:12,padding:12,width:"100%",animation:"fadeInUp .2s ease"}}>
    <div style={{fontSize:10.69,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:1,marginBottom:10}}>預約 {div.name}</div>

    {/* 日期選擇 */}
    <div style={{marginBottom:8}}>
      <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>日期</div>
      <button onClick={()=>setCalOpen(c=>!c)} style={{
        width:"100%",padding:"9px 12px",borderRadius:8,textAlign:"left",cursor:"pointer",
        background:C.bgPanel,border:date?`1px solid ${C.green}66`:`1px solid ${C.gridBorder}`,
        color:date?C.green:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:13.07,
        display:"flex",justifyContent:"space-between",alignItems:"center"
      }}>
        <span>{date||"點擊選擇日期"}</span>
        <span style={{fontSize:10.69,color:C.textFaint}}>{calOpen?"▲":"▼"}</span>
      </button>
      {calOpen&&<div style={{marginTop:6,padding:12,background:C.navBg,border:`1px solid ${C.navBorder}`,borderRadius:10}}>
        <BookingCalendar divId={div.id} date={date} onSelectDate={d=>{setDate(d);setTime("");setItem("");}}
          time={time} onSelectTime={setTime} item={item} onSelectItem={setItem}
          basePrice={div.price} onClose={()=>setCalOpen(false)}/>
      </div>}
    </div>

    {/* 時段選擇 */}
    {date&&<div style={{marginBottom:8}}>
      <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>時段</div>
      <button onClick={()=>setCalOpen(true)} style={{
        width:"100%",padding:"9px 12px",borderRadius:8,textAlign:"left",cursor:"pointer",
        background:C.bgPanel,border:time?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
        color:time?C.gold:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:13.07,
        display:"flex",justifyContent:"space-between",alignItems:"center"
      }}>
        <span>{time||"點擊選擇時段"}</span>
        <span style={{fontSize:10.69,color:C.textFaint}}>▼</span>
      </button>
    </div>}

    {/* 占卜項目 */}
    {time&&<div style={{marginBottom:10}}>
      <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>占卜項目</div>
      <button onClick={()=>setCalOpen(true)} style={{
        width:"100%",padding:"9px 12px",borderRadius:8,textAlign:"left",cursor:"pointer",
        background:C.bgPanel,border:item?`1px solid ${C.blue}66`:`1px solid ${C.gridBorder}`,
        color:item?C.blue:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:13.07,
        display:"flex",justifyContent:"space-between",alignItems:"center"
      }}>
        <span>{itemObj?`${itemObj.emoji} ${itemObj.name}`:"點擊選擇項目"}</span>
        {finalPrice&&<span style={{fontSize:11.88,color:C.gold,fontWeight:700}}>NT${finalPrice}</span>}
      </button>
    </div>}

    <div style={{display:"flex",gap:7}}>
      <button onClick={()=>{setOpen(false);setDate("");setTime("");setItem("");setCalOpen(false);}} style={{flex:1,padding:"8px 0",borderRadius:50,background:"rgba(26,58,110,.15)",border:"1px solid rgba(26,58,110,.3)",color:C.textFaint,fontFamily:"'Cinzel',serif",fontSize:10.69,cursor:"pointer"}}>取消</button>
      <button onClick={()=>{if(date&&time&&item){setSent(true);onAddAppointment&&onAddAppointment({divId:div.id,divName:div.name,date,time,item,itemObj,finalPrice});}}} disabled={!date||!time||!item} style={{flex:2,padding:"8px 0",borderRadius:50,background:date&&time&&item?`linear-gradient(135deg,${C.blue},${C.accent})`:C.bgPanel,border:date&&time&&item?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,color:date&&time&&item?C.buttonText||"#1a0e00":C.textFaint,fontFamily:"'Cinzel',serif",fontSize:10.69,cursor:date&&time&&item?"pointer":"not-allowed",fontWeight:700}}>
        {finalPrice?`確認預約 NT$${finalPrice}`:"確認預約"}
      </button>
    </div>
  </div>;
}

// ── Online Page ───────────────────────────────────────────────────────────────
export function OnlinePage({onStepChange=()=>{}}){
  const [step,setStep]=useState("browse");
  const [selected,setSelected]=useState(null);
  const [matched,setMatched]=useState(null);
  const [timer,setTimer]=useState(0);
  const [rating,setRating]=useState(0);
  const [browseTab,setBrowseTab]=useState("all");
  const [appointments,setAppointments]=useState(()=>load("appointments",[]));
  const [reminderAppt,setReminderAppt]=useState(null); // 前日提醒彈窗
  const [reminderPaid,setReminderPaid]=useState(false);
  const timerRef=useRef();

  // 前日提醒：每次進入頁面檢查是否有明天的預約需要確認
  useEffect(()=>{
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
    const tStr=dateKey(tomorrow);
    const pending=appointments.find(a=>a.date===tStr&&!a.reminderConfirmed&&!a.cancelled);
    if(pending)setReminderAppt(pending);
  },[appointments]);

  const addAppointment=useCallback((appt)=>{
    const newAppts=[...appointments,{...appt,id:Date.now(),reminderConfirmed:false,paid:false,cancelled:false}];
    setAppointments(newAppts);save("appointments",newAppts);
  },[appointments]);

  const confirmReminder=useCallback((apptId)=>{
    const updated=appointments.map(a=>a.id===apptId?{...a,reminderConfirmed:true,paid:true}:a);
    setAppointments(updated);save("appointments",updated);
    setReminderPaid(true);
  },[appointments]);

  const cancelAppointment=useCallback((apptId)=>{
    const updated=appointments.map(a=>a.id===apptId?{...a,cancelled:true}:a);
    setAppointments(updated);save("appointments",updated);
    setReminderAppt(null);setReminderPaid(false);
  },[appointments]);
  // 從歷史紀錄提取曾給五星的占卜師
  const friendNames=useMemo(()=>new Set(DEMO_ONLINE_RECORDS.filter(r=>r.rating===5&&r.diviner).map(r=>r.diviner)),[]);
  const friendDiviners=useMemo(()=>DIVINERS.filter(d=>friendNames.has(d.name)),[friendNames]);
  const friendRecords=useMemo(()=>{
    const map={};
    DEMO_ONLINE_RECORDS.filter(r=>r.rating===5&&r.diviner).forEach(r=>{
      if(!map[r.diviner])map[r.diviner]={lastDate:r.date,count:0,cats:[]};
      map[r.diviner].count++;
      if(r.cat&&!map[r.diviner].cats.includes(r.cat))map[r.diviner].cats.push(r.cat);
      if(r.date>map[r.diviner].lastDate)map[r.diviner].lastDate=r.date;
    });
    return map;
  },[]);
  const [showFilter,setShowFilter]=useState(false);
  const [draft,setDraft]=useState({priceMin:0,priceMax:99999,cats:[],minRating:0});
  const [applied,setApplied]=useState({priceMin:0,priceMax:99999,cats:[],minRating:0});

  useEffect(()=>{onStepChange(step);},[step]);
  useEffect(()=>{
    if(step!=="matching")return;
    let t=0;
    const id=setInterval(()=>{t++;setTimer(t);if(t>=3){clearInterval(id);setMatched(selected);setStep("session");setTimer(0);timerRef.current=setInterval(()=>setTimer(p=>p+1),1000);}},1000);
    return()=>clearInterval(id);
  },[step,selected]);
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  const startMatch=useCallback(div=>{setSelected(div);setStep("matching");setTimer(0);},[]);
  const endSession=useCallback(()=>{clearInterval(timerRef.current);setStep("review");},[]);
  const openFilter=()=>{setDraft({...applied});setShowFilter(true);};
  const applyFilter=()=>{setApplied({...draft});setShowFilter(false);};
  const toggleCat=c=>setDraft(d=>({...d,cats:d.cats.includes(c)?d.cats.filter(x=>x!==c):[...d.cats,c]}));
  const activeCount=[applied.priceMin>0||applied.priceMax<99999,applied.cats.length>0,applied.minRating>0].filter(Boolean).length;
  const filtered=DIVINERS.filter(d=>{if(d.price<applied.priceMin||d.price>applied.priceMax)return false;if(applied.minRating>0&&d.rating<applied.minRating)return false;if(applied.cats.length>0&&!applied.cats.some(c=>d.specialty.includes(c)))return false;return true;});
  const [friendOrder,setFriendOrder]=useState(()=>friendDiviners.map(d=>d.id));
  const [friendNotes,setFriendNotes]=useState({});
  const [deletedFriends,setDeletedFriends]=useState(()=>new Set());
  const orderedFriends=friendOrder.map(id=>friendDiviners.find(d=>d.id===id)).filter(d=>d&&!deletedFriends.has(d.id));

  if(step==="matching")return <div style={{padding:24,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:400,animation:"fadeInUp .4s ease"}}>
    <div style={{fontSize:66.53,marginBottom:18,animation:"spin 2s linear infinite",filter:"drop-shadow(0 0 24px rgba(124,58,237,.6))"}}>🔮</div>
    <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:19.01,color:C.gold,marginBottom:8,letterSpacing:2}}>宇宙媒合中…</div>
    <div style={{fontSize:14.26,color:C.textDim}}>正在連接 {selected?.name}</div>
    <div style={{fontSize:11.88,color:C.goldDim,marginTop:6}}>請靜心等候 {timer} 秒</div>
  </div>;

  if(step==="session")return <DivinationRoom matched={matched} timer={timer} onEnd={endSession}/>;

  if(step==="review"){
    const REPORT_REASONS=["占卜內容不專業","態度惡劣或不尊重","誘導消費或詐騙","長時間無回應","其他問題"];
    return <ReviewPage
      matched={matched}
      rating={rating}
      setRating={setRating}
      reportReasons={REPORT_REASONS}
      onDone={()=>{setStep("browse");setSelected(null);setRating(0);}}
    />;
  }

  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .4s ease"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>線上占卜</div>
        <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:3}}>LIVE DIVINATION</div>
      </div>
      {browseTab==="all"&&<button onClick={openFilter} style={{position:"relative",display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:50,background:activeCount>0?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:C.bgPanel,border:activeCount>0?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,fontFamily:"'Cinzel',serif",fontSize:11.88,color:activeCount>0?C.gold:C.textDim,cursor:"pointer",boxShadow:activeCount>0?`0 0 14px ${C.accentFaint}`:"none"}}>
        <span>⚙</span><span>篩選</span>
        {activeCount>0&&<div style={{position:"absolute",top:-6,right:-6,width:16,height:16,borderRadius:"50%",background:"linear-gradient(135deg,#b8862a,#e8c86a)",border:`2px solid ${C.bg}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9.5,color:C.buttonText||"#1a0e00",fontWeight:700}}>{activeCount}</div>}
      </button>}
    </div>

    {/* 前日提醒 Overlay */}
    {reminderAppt&&!reminderPaid&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
      <div style={{width:"100%",maxWidth:320,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderRadius:22,padding:24,animation:"fadeInUp .3s ease"}}>
        <div style={{textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:47.52,marginBottom:8}}>🔔</div>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16.63,color:C.gold,marginBottom:4}}>預約提醒</div>
          <div style={{fontSize:11.88,color:C.textDim}}>您明天有以下占卜預約</div>
        </div>
        <div style={{background:C.bgPanel,borderRadius:12,padding:14,marginBottom:16,border:`1px solid ${C.gridBorder}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
            <div style={{fontSize:28}}>{DIVINERS.find(d=>d.id===reminderAppt.divId)?.avatar||"🔮"}</div>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14.26,color:C.gold}}>{reminderAppt.divName}</div>
              <div style={{fontSize:11.88,color:C.textDim}}>{reminderAppt.date} {reminderAppt.time}</div>
            </div>
          </div>
          {reminderAppt.itemObj&&<div style={{fontSize:11.88,color:C.textDim,display:"flex",justifyContent:"space-between"}}>
            <span>{reminderAppt.itemObj.emoji} {reminderAppt.itemObj.name}</span>
            <span style={{color:C.gold,fontWeight:700}}>NT${reminderAppt.finalPrice}</span>
          </div>}
        </div>
        <div style={{fontSize:10.69,color:"rgba(240,200,100,.8)",padding:"8px 12px",background:C.accentFaint,border:`1px solid ${C.accentFaint}`,borderRadius:8,marginBottom:14,lineHeight:1.7}}>
          ⚠ 確認後將預付費用。若明天預約時間起 30 分鐘內未加入占卜室，費用將自動扣除且不予退款。
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{cancelAppointment(reminderAppt.id);}} style={{flex:1,padding:"10px 0",borderRadius:50,background:"rgba(200,60,60,.15)",border:"1px solid rgba(200,80,80,.3)",color:"rgba(240,160,160,.8)",fontFamily:"'Cinzel',serif",fontSize:10.69,cursor:"pointer"}}>取消預約</button>
          <button onClick={()=>confirmReminder(reminderAppt.id)} style={{flex:2,padding:"10px 0",borderRadius:50,background:"linear-gradient(135deg,#b8862a,#e8c86a)",border:"1px solid rgba(212,168,67,.6)",color:C.buttonText||"#1a0e00",fontFamily:"'Cinzel',serif",fontSize:11.88,cursor:"pointer",fontWeight:700}}>確認並預付 NT${reminderAppt.finalPrice||0}</button>
        </div>
      </div>
    </div>}

    {/* 預付成功提示 */}
    {reminderAppt&&reminderPaid&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}} onClick={()=>{setReminderAppt(null);setReminderPaid(false);}}>
      <div style={{textAlign:"center",animation:"fadeInUp .3s ease"}}>
        <div style={{fontSize:61.78,marginBottom:12}}>✅</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:19.01,color:C.gold,marginBottom:6}}>預付成功</div>
        <div style={{fontSize:13.07,color:C.textDim,lineHeight:1.8}}>費用已預付，請於預約時間<br/>準時進入占卜室</div>
        <div style={{fontSize:10.69,color:C.textFaint,marginTop:8}}>點擊任意處關閉</div>
      </div>
    </div>}

    {/* Tab 切換 */}
    <div style={{display:"flex",gap:0,marginBottom:16,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:12,padding:3}}>
      {[["all","全部占卜師","🔮"],["friends","我的好友","✦"],["appointments","已預約","📅"]].map(([tab,label,icon])=><button key={tab} onClick={()=>setBrowseTab(tab)} style={{
        flex:1,padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",
        background:browseTab===tab?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:"transparent",
        color:browseTab===tab?C.gold:C.textFaint,
        fontFamily:"'Cinzel',serif",fontSize:10.69,letterSpacing:.5,
        boxShadow:browseTab===tab?"0 2px 12px rgba(0,0,0,.4)":"none",
        transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:4,
      }}>
        <span style={{fontSize:11}}>{icon}</span>{label}
        {tab==="friends"&&friendDiviners.length>0&&<div style={{width:15,height:15,borderRadius:"50%",background:"linear-gradient(135deg,#b8862a,#e8c86a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8.32,color:C.buttonText||"#1a0e00",fontWeight:700}}>{friendDiviners.length}</div>}
        {tab==="appointments"&&appointments.filter(a=>!a.cancelled).length>0&&<div style={{width:15,height:15,borderRadius:"50%",background:"linear-gradient(135deg,#1a4a9a,#3a8ae8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8.32,color:"#fff",fontWeight:700}}>{appointments.filter(a=>!a.cancelled).length}</div>}
      </button>)}
    </div>

    {/* 好友分頁 */}
    {browseTab==="friends"&&<div style={{animation:"fadeInUp .3s ease"}}>
      {friendDiviners.length===0
        ?<div style={{textAlign:"center",padding:48,color:C.textDim}}>
          <div style={{fontSize:42.77,marginBottom:12}}>✦</div>
          <div style={{fontSize:15.44,color:C.goldDim,fontFamily:"'Cinzel',serif",marginBottom:6}}>尚無好友占卜師</div>
          <div style={{fontSize:13.07,color:C.textFaint,lineHeight:1.8}}>完成占卜並給予五星好評後<br/>即可加入占卜師好友</div>
        </div>
        :orderedFriends.map((div,idx)=>{
          const rec=friendRecords[div.name]||{};
          return <FriendCard
            key={div.id}
            div={div}
            rec={rec}
            note={friendNotes[div.id]||""}
            idx={idx}
            total={orderedFriends.length}
            onStartMatch={startMatch}
            onSaveNote={note=>setFriendNotes(n=>({...n,[div.id]:note}))}
            onDelete={()=>setDeletedFriends(s=>new Set([...s,div.id]))}
            onMoveUp={()=>{if(idx===0)return;setFriendOrder(o=>{const a=[...o];const i=a.indexOf(div.id);[a[i-1],a[i]]=[a[i],a[i-1]];return a;});}}
            onMoveDown={()=>{if(idx===orderedFriends.length-1)return;setFriendOrder(o=>{const a=[...o];const i=a.indexOf(div.id);[a[i],a[i+1]]=[a[i+1],a[i]];return a;});}}
            onAddAppointment={addAppointment}
          />;
        })}
    </div>}

    {/* 已預約分頁 */}
    {browseTab==="appointments"&&<div style={{animation:"fadeInUp .3s ease"}}>
      {appointments.filter(a=>!a.cancelled).length===0
        ?<div style={{textAlign:"center",padding:48,color:C.textDim}}>
          <div style={{fontSize:42.77,marginBottom:12}}>📅</div>
          <div style={{fontSize:15.44,color:C.goldDim,fontFamily:"'Cinzel',serif",marginBottom:6}}>尚無預約記錄</div>
          <div style={{fontSize:13.07,color:C.textFaint,lineHeight:1.8}}>在好友頁面或占卜結束後<br/>即可預約下次占卜</div>
        </div>
        :[...appointments].reverse().map(appt=>{
          if(appt.cancelled)return null;
          const div=DIVINERS.find(d=>d.id===appt.divId);
          const isPast=appt.date<todayKey();
          const isTomorrow=appt.date===dateKey(new Date(Date.now()+86400000));
          return <div key={appt.id} style={{
            background:C.bgPanel,
            border:appt.paid?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
            borderRadius:16,padding:15,marginBottom:10,
            opacity:isPast?.6:1,
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{fontSize:28}}>{div?.avatar||"🔮"}</div>
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:14.26,color:C.gold}}>{appt.divName}</div>
                  <div style={{fontSize:11.88,color:C.textDim}}>{appt.date} {appt.time}</div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                {appt.paid&&<div style={{fontSize:9.5,padding:"2px 8px",borderRadius:50,background:C.accentFaint,border:`1px solid ${C.accentDim}`,color:C.gold}}>已預付</div>}
                {isTomorrow&&!appt.paid&&<div style={{fontSize:9.5,padding:"2px 8px",borderRadius:50,background:"rgba(240,160,60,.15)",border:"1px solid rgba(240,160,60,.3)",color:"#f0a03c"}}>待確認</div>}
                {isPast&&<div style={{fontSize:9.5,padding:"2px 8px",borderRadius:50,background:"rgba(100,100,100,.15)",border:"1px solid rgba(100,100,100,.25)",color:C.textFaint}}>已過期</div>}
              </div>
            </div>
            {appt.itemObj&&<div style={{fontSize:11.88,color:C.textDim,display:"flex",justifyContent:"space-between",padding:"8px 10px",background:C.bgPanel,borderRadius:8,border:`1px solid ${C.gridBorder}`}}>
              <span>{appt.itemObj.emoji} {appt.itemObj.name} ({appt.itemObj.duration})</span>
              <span style={{color:appt.paid?C.gold:C.blue,fontWeight:700}}>NT${appt.finalPrice}</span>
            </div>}
            {!isPast&&!appt.paid&&<button onClick={()=>cancelAppointment(appt.id)} style={{marginTop:8,width:"100%",padding:"7px 0",borderRadius:50,background:"rgba(200,60,60,.1)",border:"1px solid rgba(200,80,80,.25)",color:"rgba(240,160,160,.75)",fontFamily:"'Cinzel',serif",fontSize:10.69,cursor:"pointer"}}>取消預約</button>}
          </div>;
        })}
    </div>}

    {/* 全部分頁 */}
    {browseTab==="all"&&<>
    {activeCount>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
      {applied.cats.map(c=><div key={c} style={{fontSize:10.69,padding:"3px 10px",borderRadius:50,background:C.bgPanel,border:`1px solid ${C.blue}44`,color:C.blue}}>{c}</div>)}
      {(applied.priceMin>0||applied.priceMax<99999)&&<div style={{fontSize:10.69,padding:"3px 10px",borderRadius:50,background:C.goldFaint,border:`1px solid rgba(212,168,67,.28)`,color:C.gold}}>${applied.priceMin}–{applied.priceMax>=99999?"不限":`$${applied.priceMax}`}</div>}
      {applied.minRating>0&&<div style={{fontSize:10.69,padding:"3px 10px",borderRadius:50,background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.25)",color:C.green}}>⭐{applied.minRating}+</div>}
      <button onClick={()=>setApplied({priceMin:0,priceMax:99999,cats:[],minRating:0})} style={{fontSize:10.69,padding:"3px 10px",borderRadius:50,background:"rgba(200,80,80,.1)",border:"1px solid rgba(200,80,80,.25)",color:"rgba(240,160,160,.85)",cursor:"pointer"}}>清除</button>
    </div>}

    <div style={{fontSize:11.88,color:C.textFaint,marginBottom:14}}>顯示 {filtered.length}/{DIVINERS.length} 位占卜師</div>

    {filtered.length===0
      ?<div style={{textAlign:"center",padding:44,color:C.textDim,fontSize:12}}><div style={{fontSize:35.64,marginBottom:10}}>🔍</div>無符合條件的占卜師</div>
      :filtered.map(div=><div key={div.id} style={{
          background:C.bgPanel,
          border:`1px solid ${C.gridBorder}`,
          borderRadius:18,padding:16,marginBottom:12,
          backdropFilter:"blur(10px)",
          boxShadow:"0 4px 18px rgba(0,0,0,.35)",
          transition:"transform .2s, box-shadow .2s",
        }}>
        <div style={{display:"flex",gap:13,alignItems:"flex-start"}}>
          <div style={{position:"relative"}}>
            <div style={{fontSize:47.52,lineHeight:1,filter:"drop-shadow(0 0 12px rgba(124,58,237,.35))"}}>{div.avatar}</div>
            <div style={{position:"absolute",bottom:-2,right:-2,width:10,height:10,borderRadius:"50%",background:div.online?C.green:"rgba(205,221,245,.3)",border:`2px solid ${C.bg}`,boxShadow:div.online?`0 0 6px ${C.green}`:"none"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:15.44,color:C.gold}}>{div.name}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:17.82,color:C.blue,fontWeight:600}}>NT${div.price}</div>
            </div>
            <div style={{fontSize:11.88,color:div.online?C.green:C.textFaint,marginBottom:4}}>
              {div.online?"● 線上中":"○ 離線"} ・ ⭐ {div.rating} ({div.reviews} 則評價)
            </div>
            <div style={{fontSize:11.88,color:C.goldDim,marginBottom:4}}>專長：{div.specialty}</div>
            <div style={{fontSize:13.07,color:C.textDim,lineHeight:1.7,marginBottom:12,fontWeight:300}}>{div.desc}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <GoldPayBtn onClick={()=>div.online&&startMatch(div)} disabled={!div.online} style={{padding:"7px 18px",fontSize:9}}>
                {div.online?"✦ 立即媒合":"暫不開放"}
              </GoldPayBtn>
              {div.online&&<div style={{fontSize:10.69,color:C.textFaint}}>平均等待 &lt; 1 分鐘</div>}
            </div>
          </div>
        </div>
      </div>)}

    </>}

    {/* Filter Sheet */}
    {showFilter&&<div onClick={()=>setShowFilter(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.78)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:390,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderTopLeftRadius:24,borderTopRightRadius:24,padding:"18px 18px 60px",boxShadow:"0 -10px 50px rgba(0,0,0,.7)",maxHeight:"82vh",overflowY:"auto",animation:"fadeInUp .35s ease"}}>
        <div style={{width:36,height:3,borderRadius:2,background:C.accentDim,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16.63,color:C.gold}}>篩選條件</div>
          <button onClick={()=>setDraft({priceMin:0,priceMax:99999,cats:[],minRating:0})} style={{fontSize:11.88,color:C.textFaint,background:"none",border:"none",cursor:"pointer"}}>重置</button>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13.07,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2,marginBottom:10}}>✦ 價格區間</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {[["priceMin","下限"],["priceMax","上限"]].map(([field,label])=><div key={field} style={{flex:1}}>
              <div style={{fontSize:10.69,color:C.textFaint,marginBottom:4}}>{label}</div>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",fontSize:13.07,color:C.goldDim}}>$</span>
                <input type="number" min={0} placeholder="不限" value={draft[field]===0&&field==="priceMin"?"":draft[field]===99999&&field==="priceMax"?"":draft[field]} onChange={e=>{const v=e.target.value===""?(field==="priceMin"?0:99999):Math.max(0,parseInt(e.target.value)||0);setDraft(d=>({...d,[field]:v}));}} style={{width:"100%",padding:"8px 8px 8px 20px",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:8,color:C.gold,fontSize:14.26,fontFamily:"'Cinzel',serif",outline:"none"}}/>
              </div>
            </div>)}
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13.07,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2,marginBottom:10}}>✦ 占卜類別</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {CATEGORIES.map(c=><button key={c} onClick={()=>toggleCat(c)} style={{padding:"6px 12px",borderRadius:50,fontSize:13.07,cursor:"pointer",background:draft.cats.includes(c)?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:C.bgPanel,border:draft.cats.includes(c)?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,color:draft.cats.includes(c)?C.gold:C.textDim}}>{c}</button>)}
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{fontSize:13.07,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2,marginBottom:10}}>✦ 最低評分</div>
          <div style={{display:"flex",gap:7}}>
            {[0,4.0,4.5,4.7,4.9].map(r=><button key={r} onClick={()=>setDraft(d=>({...d,minRating:r}))} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:11.88,cursor:"pointer",background:draft.minRating===r?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:C.bgPanel,border:draft.minRating===r?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,color:draft.minRating===r?C.gold:C.textDim}}>{r===0?"不限":`${r}+`}</button>)}
          </div>
        </div>
        <GoldPayBtn onClick={applyFilter} style={{width:"100%",textAlign:"center",letterSpacing:2}}>套用篩選</GoldPayBtn>
      </div>
    </div>}
  </div>;
}

// ── History Page ──────────────────────────────────────────────────────────────
// 線上占卜示範紀錄（靜態，真實完成的線上占卜會存進 localStorage "online_records"）
