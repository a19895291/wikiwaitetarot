// 模組 05 — SpreadPage（多牌陣占卜，含凱爾特十字佈局）
import { useState, useRef, useCallback, useEffect } from "react";
import { C } from "../data/themes";
import { CB } from "../data/cardBacks";
import { DECK } from "../data/deck";
import { shuffle } from "../utils/deck";
import { CardBack } from "../components/shared/CardBack";
import { CardModal } from "../components/shared/CardModal";
import { cbBgStyle } from "../components/shared/cbBgStyle";
import { playFlip, playDraw, playShuffle } from "../utils/sfx";
import * as db from "../lib/db";
import { SPREADS } from "../data/spreads";
import { load, save } from "../utils/storage";


export function SpreadPage({onGoShop}={}){
  const savedRef=useRef();
  if(savedRef.current===undefined){
    try{savedRef.current=JSON.parse(localStorage.getItem("spread_working")||"null");}catch{savedRef.current=null;}
  }
  const saved=savedRef.current;
  const [grid,setGrid]=useState(()=>(saved&&Array.isArray(saved.grid)&&saved.grid.length===36)?saved.grid:Array(36).fill(null));
  const [drawn,setDrawn]=useState(()=>(saved&&Array.isArray(saved.drawn))?saved.drawn:[]);
  const [deck,setDeck]=useState(()=>(saved&&Array.isArray(saved.deck)&&saved.deck.length)?saved.deck:shuffle(DECK));
  const [zoom,setZoom]=useState(null);
  const [shuffleAnim,setShuffleAnim]=useState(false);
  const [liftedCard,setLiftedCard]=useState(null);
  const dragging=useRef(null);
  const hovered=useRef(-1);
  const gridRef=useRef();

  const saveSpreadRecord=useCallback((newGrid)=>{
    const placed=newGrid.map((c,idx)=>c?{...c,cellIdx:idx,pos:`第${Math.floor(idx/6)+1}列${idx%6+1}欄`,spreadId:"free",spreadName:"自由盤"}:null).filter(Boolean);
    if(placed.length===0)return;
    const now=new Date();
    const pad=n=>String(n).padStart(2,"0");
    const dateKey=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const ts=`${dateKey} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    try{
      const existing=JSON.parse(localStorage.getItem("spread_records")||"[]");
      const rid=dateKey+"_free";
      const todayIdx=existing.findIndex(r=>r.id===rid);
      const rec={id:rid,dateKey,ts,spreadId:"free",spreadName:"自由盤",cards:placed};
      if(todayIdx>=0)existing[todayIdx]=rec;else existing.unshift(rec);
      localStorage.setItem("spread_records",JSON.stringify(existing.slice(0,30)));
    }catch{}
    db.saveSpread(dateKey, placed).catch(()=>{});
  },[]);

  const doShuffle=useCallback(()=>{
    playShuffle();
    setShuffleAnim(true);
    setTimeout(()=>setShuffleAnim(false),600);
    deckPtr.current=0;setDeck(shuffle(DECK));setDrawn([]);setGrid(Array(36).fill(null));
  },[]);

  const deckPtr=useRef(saved&&typeof saved.deckPtr==="number"?saved.deckPtr:0);
  // 工作狀態持久化：離開頁面再回來時還原已抽/已擺放的牌
  useEffect(()=>{
    try{localStorage.setItem("spread_working",JSON.stringify({grid,drawn,deck,deckPtr:deckPtr.current}));}catch{}
  },[grid,drawn,deck]);
  const drawCard=useCallback(()=>{
    if(deckPtr.current>=deck.length)return;
    playDraw();
    const card=deck[deckPtr.current];
    deckPtr.current+=1;
    setDrawn(p=>[...p,card]);
  },[deck]);

  // ── 牌陣分頁（自由盤 + 已購牌陣）；抽出的牌持久化：切換分頁/離開頁面再回來都保留，只有「重新洗牌」才清 ──
  const bought=load("shop_bought",[]);
  const ownsSpread=id=>bought.includes("spread_"+id);
  const initMode=(()=>{try{const m=load("spread_mode","free");return (m!=="free"&&!bought.includes("spread_"+m))?"free":m;}catch{return "free";}})();
  const initPreset=initMode!=="free"?load("spread_preset_"+initMode,null):null;
  const initSp=SPREADS.find(s=>s.id===initMode)||null;
  const [mode,setMode]=useState(initMode);
  const [pCards,setPCards]=useState(()=>{
    if(initPreset&&Array.isArray(initPreset.cards))return initPreset.cards;
    return initSp?Array(initSp.positions.length).fill(null):[];
  });
  const pDeck=useRef(initPreset&&Array.isArray(initPreset.deck)&&initPreset.deck.length?initPreset.deck:(initSp?shuffle(DECK):[]));
  const pPtr=useRef(initPreset&&typeof initPreset.ptr==="number"?initPreset.ptr:0);
  const curSpread=SPREADS.find(s=>s.id===mode)||null;
  const savePreset=(id,cards,deck,ptr)=>{ try{localStorage.setItem("spread_preset_"+id,JSON.stringify({cards,deck,ptr}));}catch{} };
  const selectTab=(id)=>{
    if(id==="free"){setMode("free");save("spread_mode","free");return;}
    if(!ownsSpread(id)){onGoShop&&onGoShop();return;}
    const sp=SPREADS.find(s=>s.id===id); if(!sp)return;
    setMode(id); save("spread_mode",id);
    const sv=load("spread_preset_"+id,null);
    if(sv&&Array.isArray(sv.cards)){ pDeck.current=sv.deck; pPtr.current=sv.ptr||0; setPCards(sv.cards); }
    else{ const d=shuffle(DECK); pDeck.current=d; pPtr.current=0; const cards=Array(sp.positions.length).fill(null); setPCards(cards); savePreset(id,cards,d,0); }
  };
  const drawPreset=()=>{
    const i=pCards.findIndex(c=>!c);
    if(i<0||pPtr.current>=pDeck.current.length)return;
    playDraw(); playFlip();
    const card=pDeck.current[pPtr.current]; pPtr.current+=1;
    setPCards(prev=>{ const np=[...prev]; np[i]=card; savePreset(mode,np,pDeck.current,pPtr.current); savePresetRecord(curSpread,np); return np; });
  };
  const resetPreset=()=>{
    if(!curSpread)return; playShuffle();
    const d=shuffle(DECK); pDeck.current=d; pPtr.current=0;
    const cards=Array(curSpread.positions.length).fill(null);
    setPCards(cards); savePreset(mode,cards,d,0);
  };
  // 預設牌陣寫入歷程（每抽一張更新當日該紀錄；帶牌陣名 + 每張牌的牌位）
  const savePresetRecord=(sp,arr)=>{
    if(!sp)return;
    const placed=arr.map((c,i)=>c?{...c,pos:(sp.positions[i]&&sp.positions[i].name)||`位置${i+1}`,spreadId:sp.id,spreadName:sp.name}:null).filter(Boolean);
    if(placed.length===0)return;
    const now=new Date(); const pad=n=>String(n).padStart(2,"0");
    const dateKey=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const ts=`${dateKey} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    try{
      const existing=JSON.parse(localStorage.getItem("spread_records")||"[]");
      const rid=dateKey+"_"+sp.id;
      const idx=existing.findIndex(r=>r.id===rid);
      const rec={id:rid,dateKey,ts,spreadId:sp.id,spreadName:sp.name,cards:placed};
      if(idx>=0)existing[idx]=rec;else existing.unshift(rec);
      localStorage.setItem("spread_records",JSON.stringify(existing.slice(0,30)));
    }catch{}
    db.saveSpread(dateKey, placed).catch(()=>{});
  };

  const makeGhost=(card,x,y)=>{
    const el=document.createElement("div");
    el.style.cssText=`position:fixed;left:${x-28}px;top:${y-44}px;width:56px;height:84px;border-radius:10px;background:linear-gradient(135deg,#1a1200,#110c00);border:2px solid rgba(196,148,28,.8);overflow:hidden;z-index:9999;pointer-events:none;opacity:.95;transform:scale(1.12) rotate(-4deg);box-shadow:0 12px 36px rgba(0,0,0,.85),0 0 24px rgba(196,148,28,.2);transition:none;`;
    if(card.img){const img=document.createElement("img");img.src=card.img;img.style.cssText=`width:100%;height:100%;object-fit:cover;transform:${card.reversed?"rotate(180deg)":"none"}`;el.appendChild(img);}
    else{el.style.display="flex";el.style.alignItems="center";el.style.justifyContent="center";el.style.fontSize="28px";el.textContent=card.emoji;}
    document.body.appendChild(el);return el;
  };

  const setCellHL=(idx,on)=>{
    if(!gridRef.current)return;
    const cells=gridRef.current.querySelectorAll("[data-cell]");
    if(cells[idx])cells[idx].style.boxShadow=on?"inset 0 0 0 2px rgba(212,168,67,.9),0 0 14px rgba(212,168,67,.3)":"";
  };

  const startDrawnDrag=useCallback((e,card)=>{
    e.preventDefault();
    setLiftedCard(card.id);
    const ghost=makeGhost(card,e.clientX,e.clientY);
    dragging.current={card,ghost,src:null};
    const onMove=ev=>{
      ghost.style.left=`${ev.clientX-28}px`;ghost.style.top=`${ev.clientY-44}px`;
      if(gridRef.current){
        const cells=gridRef.current.querySelectorAll("[data-cell]");
        let found=-1;
        const _el=document.elementFromPoint(ev.clientX,ev.clientY);const _c=_el&&_el.closest?_el.closest("[data-cell]"):null;if(_c)found=Array.prototype.indexOf.call(cells,_c);
        if(found!==hovered.current){if(hovered.current>=0)setCellHL(hovered.current,false);hovered.current=found;if(found>=0)setCellHL(found,true);}
      }
    };
    const onUp=()=>{
      document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp);
      ghost.remove();setLiftedCard(null);
      const toIdx=hovered.current;
      if(toIdx>=0)setCellHL(toIdx,false);hovered.current=-1;
      if(toIdx>=0&&dragging.current){
        const dropped=dragging.current.card;
        playFlip();
        setGrid(g=>{
          const ng=[...g];
          const displaced=ng[toIdx]; // 目標格原本的牌
          ng[toIdx]=dropped;
          if(displaced){
            // 把被頂走的牌放回抽牌區
            setDrawn(d=>[...d.filter(c=>c.id!==dropped.id),displaced]);
          } else {
            setDrawn(d=>d.filter(c=>c.id!==dropped.id));
          }
          saveSpreadRecord(ng);
          return ng;
        });
      }
      dragging.current=null;
    };
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  },[]);

  const startGridInteract=useCallback((e,card,srcIdx)=>{
    e.preventDefault();
    const startX=e.clientX,startY=e.clientY;
    const THRESHOLD=8;
    let ghost=null,isDragging=false;
    let longTimer=setTimeout(()=>{if(!isDragging){window.getSelection()?.removeAllRanges();setZoom(card);}},600);
    const onMove=ev=>{
      const dx=ev.clientX-startX,dy=ev.clientY-startY;
      if(!isDragging&&Math.hypot(dx,dy)>THRESHOLD){
        clearTimeout(longTimer);isDragging=true;
        ghost=makeGhost(card,ev.clientX,ev.clientY);
        dragging.current={card,ghost,src:srcIdx};
      }
      if(isDragging&&ghost){
        ghost.style.left=`${ev.clientX-28}px`;ghost.style.top=`${ev.clientY-44}px`;
        if(gridRef.current){
          const cells=gridRef.current.querySelectorAll("[data-cell]");let found=-1;
          const _el=document.elementFromPoint(ev.clientX,ev.clientY);const _c=_el&&_el.closest?_el.closest("[data-cell]"):null;if(_c)found=Array.prototype.indexOf.call(cells,_c);
          if(found!==hovered.current){if(hovered.current>=0)setCellHL(hovered.current,false);hovered.current=found;if(found>=0)setCellHL(found,true);}
        }
      }
    };
    const onUp=()=>{
      document.removeEventListener("pointermove",onMove);document.removeEventListener("pointerup",onUp);
      clearTimeout(longTimer);if(ghost)ghost.remove();
      const toIdx=hovered.current;if(toIdx>=0)setCellHL(toIdx,false);hovered.current=-1;
      if(isDragging&&toIdx>=0&&dragging.current&&srcIdx!==toIdx){
        const dropped=dragging.current.card;
        setGrid(g=>{
          const ng=[...g];
          const displaced=ng[toIdx]; // 目標格原本的牌
          ng[toIdx]=dropped;
          ng[srcIdx]=displaced||null; // 互換：把目標格的牌放到來源格
          saveSpreadRecord(ng);
          return ng;
        });
      }
      dragging.current=null;
    };
    document.addEventListener("pointermove",onMove);document.addEventListener("pointerup",onUp);
  },[]);

  const isImageCB=!!CB.isImage;
  const g=CB.glow;
  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .5s ease"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>{mode==="free"?"牌陣展開":(curSpread?curSpread.name:"")}</div>
        <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:3}}>{mode==="free"?"6×6 SPREAD GRID":(curSpread?curSpread.en.toUpperCase():"")}</div>
      </div>
      <button onClick={mode==="free"?doShuffle:resetPreset} style={{
        display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:50,cursor:"pointer",
        background:`linear-gradient(135deg,${C.blue},${C.blue}cc)`,border:`1px solid ${C.accentDim}`,
        fontFamily:"'Cinzel',serif",fontSize:11.88,color:C.gold,letterSpacing:1,
        transform:shuffleAnim?"scale(.93)":"scale(1)",transition:"transform .15s",boxShadow:"0 4px 14px rgba(0,0,0,.3)"
      }}>
        <span style={{fontSize:15.44,display:"inline-block",animation:shuffleAnim?"spin .6s linear":"none"}}>🔀</span>
        <span>{mode==="free"?"洗牌":"重新洗牌"}</span>
      </button>
    </div>

    {/* 分頁：自由盤 + 各牌陣（未購顯示鎖，點擊導商城）*/}
    <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:6,marginBottom:14}}>
      {[{id:"free",name:"自由盤",owned:true},...SPREADS.map(sp=>({id:sp.id,name:sp.name,owned:ownsSpread(sp.id)}))].map(t=>(
        <button key={t.id} onClick={()=>selectTab(t.id)} style={{flex:"0 0 auto",padding:"7px 13px",borderRadius:50,border:`1px solid ${mode===t.id?C.accentDim:C.gridBorder}`,cursor:"pointer",background:mode===t.id?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:"transparent",fontFamily:"'Cinzel',serif",fontSize:11.5,color:mode===t.id?C.gold:(t.owned?C.textDim:C.textFaint),whiteSpace:"nowrap",letterSpacing:.5}}>{t.owned?"":"🔒 "}{t.name}</button>
      ))}
    </div>

    {mode==="free"&&<>
    {/* 牌堆 + 抽出區 */}
    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:14,marginBottom:14,backdropFilter:"blur(10px)"}}>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:0}}>
        <div onClick={drawCard} style={{
          width:52,height:78,
          ...cbBgStyle(),
          border:isImageCB?"none":`1px solid ${CB.border}`,borderRadius:10,
          cursor:(deck.length-deckPtr.current)>0?"pointer":"not-allowed",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          flexShrink:0,overflow:"hidden",
          boxShadow:(deck.length-deckPtr.current)>0?`inset 0 1px 0 rgba(255,255,255,.07),0 6px 18px rgba(0,0,0,.4),0 0 14px ${CB.idleShadow}`:"none",
          position:"relative",opacity:(deck.length-deckPtr.current)>0?1:.4,
          transition:"transform .2s, box-shadow .2s",
        }}>
          <div style={{position:"absolute",inset:4,border:`1px solid ${isImageCB?"rgba(0,0,0,0)":CB.strokeDim}`,borderRadius:5,pointerEvents:"none"}}/>
          {g&&<>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:`linear-gradient(180deg,rgba(${g.light},.28) 0%,rgba(${g.light},.10) 60%,transparent 100%)`,pointerEvents:"none",zIndex:4,borderRadius:"10px 10px 0 0"}}/>
            <div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:`linear-gradient(90deg,rgba(${g.light},.20) 0%,rgba(${g.light},.08) 55%,transparent 100%)`,pointerEvents:"none",zIndex:4}}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,transparent 40%,rgba(${g.dark},.18) 100%)`,pointerEvents:"none",zIndex:4,borderRadius:10}}/>
            <div style={{position:"absolute",inset:0,background:`linear-gradient(145deg,rgba(${g.light},.16) 0%,rgba(${g.light},.05) 30%,transparent 55%,rgba(${g.dark},.08) 100%)`,pointerEvents:"none",zIndex:4,borderRadius:10}}/>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:`linear-gradient(0deg,rgba(${g.dark},.17) 0%,transparent 100%)`,pointerEvents:"none",zIndex:4}}/>
            <div style={{position:"absolute",top:"-40%",left:"-55%",width:"45%",height:"180%",background:`linear-gradient(105deg,transparent 0%,transparent 28%,rgba(${g.shimmer},0.45) 43%,rgba(${g.shimmer},0.68) 50%,rgba(${g.shimmer},0.45) 57%,transparent 72%,transparent 100%)`,transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,animation:"monsteraShimmer 2.8s ease-in-out infinite"}}/>
          </>}
          {!g&&<div style={{position:"absolute",top:"-30%",left:"-20%",width:"60%",height:"160%",background:CB.shimmer,transform:"skewX(-10deg)",pointerEvents:"none"}}/>}
          {!isImageCB&&<svg viewBox="0 0 60 70" width={20} height={23} fill="none" style={{position:"relative",zIndex:2}}>
              <polygon points="30,3 57,18 57,52 30,67 3,52 3,18" stroke={CB.stroke} strokeWidth="1.2" fill="none"/>
              <polygon points="30,13 47,23 47,47 30,57 13,47 13,23" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
              <circle cx="30" cy="35" r="7" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
              <circle cx="30" cy="35" r="2.5" fill={CB.centerDot}/>
            </svg>}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginTop:3,position:"relative",zIndex:2,gap:1}}>
            <div style={{fontSize:10,color:CB.centerDot,fontFamily:"'Cinzel',serif",fontWeight:700,lineHeight:1}}>{deck.length-deckPtr.current}</div>
            <div style={{fontSize:6.5,color:CB.footnote,fontFamily:"'Cinzel',serif",letterSpacing:.5,lineHeight:1}}>剩餘</div>
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:C.gold,marginBottom:4}}>✦ 牌堆（點擊抽牌）</div>
          <div style={{fontSize:10.69,color:C.textDim,lineHeight:1.7}}>
            抽出牌背，拖移至格子・格內牌可拖移換位<br/>
            <span style={{color:C.goldDim}}>長按格子內卡牌可放大查看牌義</span>
          </div>
        </div>
      </div>
      <div style={{marginTop:drawn.length?12:8}}>
        <div style={{fontSize:10.69,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2,marginBottom:7}}>✦ 抽出區 {drawn.length>0?`(${drawn.length})`:""}</div>
        <div style={{
          display:"flex",gap:7,overflowX:"auto",overscrollBehavior:"none",paddingBottom:4,
          minHeight:64,alignItems:"center",
          borderRadius:8,border:`1px dashed ${C.gridBorder}`,
          padding:"6px 8px",
          background:C.gridBg,
        }}>
          {drawn.length>0
            ?drawn.map((card,idx)=>(
              <div key={card.id} onPointerDown={e=>startDrawnDrag(e,card)} style={{userSelect:"none",touchAction:"none",flexShrink:0,transition:"transform .3s",position:"relative"}}>
                <CardBack w={40} h={60} lifting={liftedCard===card.id}/>
                <div style={{
                  position:"absolute",top:3,left:3,
                  width:15,height:15,borderRadius:"50%",
                  background:C.bgPanel,
                  border:`1px solid ${C.accentDim}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:8,fontFamily:"'Cinzel',serif",
                  color:C.accent,
                  fontWeight:700,lineHeight:1,
                  pointerEvents:"none",zIndex:10,
                }}>{idx+1}</div>
              </div>
            ))
            :<div style={{fontSize:9.5,color:C.textFaint,fontFamily:"'Cinzel',serif",letterSpacing:1,margin:"auto"}}>尚未抽出牌</div>
          }
        </div>
      </div>
    </div>

    {/* 6×6 Grid */}
    <div ref={gridRef} style={{
      display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,
      background:C.gridBg,
      border:`1px solid ${C.gridBorder}`,
      borderRadius:14,padding:8,
      boxShadow:"inset 0 2px 20px rgba(0,0,0,.3)"
    }}>
      {grid.map((card,i)=>(
        <div key={i} data-cell={i}
          onPointerDown={e=>{if(card)startGridInteract(e,card,i);}}
          style={{
            aspectRatio:"2/3",borderRadius:7,position:"relative",
            border:card?`1px solid ${C.cardBorder}`:`1px dashed ${C.gridBorder}`,
            background:card?C.bgCard:C.gridBg,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            overflow:"hidden",cursor:card?"grab":"default",
            transition:"background .2s, box-shadow .3s, transform .2s",
            userSelect:"none",touchAction:"none",
          }}>
          {card
            ?<>{card.img
                ?<img src={card.img} alt={card.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:7,transform:card.reversed?"rotate(180deg)":"none",pointerEvents:"none"}}/>
                :<div style={{fontSize:16.63,pointerEvents:"none",transform:card.reversed?"rotate(180deg)":"none",display:"inline-block"}}>{card.emoji}</div>
              }
              <div style={{position:"absolute",bottom:2,left:0,right:0,fontSize:5.94,fontFamily:"'Cinzel',serif",color:`${C.accent}d9`,textAlign:"center",pointerEvents:"none",zIndex:2,textShadow:"0 1px 3px rgba(0,0,0,.9)"}}>{card.name}{card.reversed?" ↓":" ↑"}</div></>
            :<div style={{fontSize:8.32,color:C.textFaint}}>✦</div>}
        </div>
      ))}
    </div>
    </>}

    {mode!=="free"&&curSpread&&<>
      <div style={{position:"relative",width:"100%",aspectRatio:`${curSpread.cols}/${curSpread.rows*1.5}`,background:C.gridBg,border:`1px solid ${C.gridBorder}`,borderRadius:14,boxShadow:"inset 0 2px 20px rgba(0,0,0,.3)",marginBottom:14}}>
        {curSpread.positions.map((pos,i)=>{
          const card=pCards[i];
          const isNext=pCards.findIndex(c=>!c)===i;
          return <div key={i} onClick={()=>{if(card)setZoom(card);}} style={{position:"absolute",left:`${(pos.x/curSpread.cols)*100}%`,top:`${(pos.y/curSpread.rows)*100}%`,width:`${(1/curSpread.cols)*100}%`,height:`${(1/curSpread.rows)*100}%`,padding:3,boxSizing:"border-box",zIndex:pos.rotated?5:1,cursor:card?"pointer":"default"}}>
            <div style={{width:"100%",height:"100%",borderRadius:7,position:"relative",overflow:"hidden",transform:pos.rotated?"rotate(90deg)":"none",border:card?`1px solid ${C.cardBorder}`:`1px ${isNext?"solid":"dashed"} ${isNext?C.accent:C.gridBorder}`,background:card?C.bgCard:"transparent",boxShadow:isNext&&!card?`0 0 12px ${C.accentFaint}`:"none",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              {card
                ?(card.img
                    ?<img src={card.img} alt={card.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",transform:card.reversed?"rotate(180deg)":"none"}}/>
                    :<div style={{fontSize:18,transform:card.reversed?"rotate(180deg)":"none"}}>{card.emoji}</div>)
                :<><div style={{fontSize:13,color:C.goldDim,fontFamily:"'Cinzel',serif",lineHeight:1}}>{i+1}</div><div style={{fontSize:7.5,color:C.textFaint,lineHeight:1.25,textAlign:"center",padding:"2px 2px 0"}}>{pos.name}</div></>}
            </div>
          </div>;
        })}
      </div>
      <button onClick={drawPreset} disabled={!pCards.some(c=>!c)} className="pay-btn" style={{width:"100%",padding:"12px 0",fontSize:13,fontWeight:700,color:C.bg,background:pCards.some(c=>!c)?`linear-gradient(135deg,${C.accent},${C.accentDim})`:C.gridBorder,border:"none",borderRadius:50,cursor:pCards.some(c=>!c)?"pointer":"default",marginBottom:14,opacity:pCards.some(c=>!c)?1:.5}}>✦ 抽下一張（剩 {pCards.filter(c=>!c).length}）</button>
      {/* 牌位說明（點已翻開的牌看牌義）*/}
      <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:14,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:11,color:C.accent,letterSpacing:1,marginBottom:8}}>牌位說明</div>
        {curSpread.positions.map((pos,i)=>{
          const card=pCards[i];
          return <div key={i} onClick={()=>{if(card)setZoom(card);}} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<curSpread.positions.length-1?`1px solid ${C.gridBorder}`:"none",cursor:card?"pointer":"default"}}>
            <div style={{flexShrink:0,width:16,fontSize:11,color:C.gold,fontFamily:"'Cinzel',serif"}}>{i+1}</div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:12.5,color:C.text}}>{pos.name}{card?` — ${card.name}${card.reversed?"（逆）":""}`:""}</div>
              <div style={{fontSize:11,color:C.textFaint,lineHeight:1.5}}>{pos.hint}</div>
            </div>
            {card&&<div style={{flexShrink:0,fontSize:11,color:C.goldDim}}>›</div>}
          </div>;
        })}
      </div>
    </>}

    <CardModal card={zoom} onClose={()=>setZoom(null)}/>
  </div>;
}

// ── Divination Room ──────────────────────────────────────────────────────────
