// 模組 05 — SpreadPage（多牌陣占卜，含凱爾特十字佈局）
import { useState, useRef, useCallback } from "react";
import { C } from "../data/themes";
import { CB } from "../data/cardBacks";
import { DECK } from "../data/deck";
import { shuffle } from "../utils/deck";
import { CardBack } from "../components/shared/CardBack";
import { CardModal } from "../components/shared/CardModal";
import { cbBgStyle } from "../components/shared/cbBgStyle";

export function SpreadPage(){
  const [grid,setGrid]=useState(Array(36).fill(null));
  const [drawn,setDrawn]=useState([]);
  const [deck,setDeck]=useState(()=>shuffle(DECK));
  const [zoom,setZoom]=useState(null);
  const [shuffleAnim,setShuffleAnim]=useState(false);
  const [liftedCard,setLiftedCard]=useState(null);
  const dragging=useRef(null);
  const hovered=useRef(-1);
  const gridRef=useRef();

  const saveSpreadRecord=useCallback((newGrid)=>{
    const placed=newGrid.filter(Boolean);
    if(placed.length===0)return;
    const now=new Date();
    const pad=n=>String(n).padStart(2,"0");
    const dateKey=`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const ts=`${dateKey} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    try{
      const existing=JSON.parse(localStorage.getItem("spread_records")||"[]");
      const todayIdx=existing.findIndex(r=>r.dateKey===dateKey);
      const rec={id:dateKey,dateKey,ts,cards:placed};
      if(todayIdx>=0)existing[todayIdx]=rec;else existing.unshift(rec);
      localStorage.setItem("spread_records",JSON.stringify(existing.slice(0,30)));
    }catch{}
  },[]);

  const doShuffle=useCallback(()=>{
    setShuffleAnim(true);
    setTimeout(()=>setShuffleAnim(false),600);
    deckPtr.current=0;setDeck(shuffle(DECK));setDrawn([]);setGrid(Array(36).fill(null));
  },[]);

  const deckPtr=useRef(0);
  const drawCard=useCallback(()=>{
    if(deckPtr.current>=deck.length)return;
    const card=deck[deckPtr.current];
    deckPtr.current+=1;
    setDrawn(p=>[...p,card]);
  },[deck]);

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
        cells.forEach((cell,i)=>{const r=cell.getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)found=i;});
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
          cells.forEach((cell,i)=>{const r=cell.getBoundingClientRect();if(ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom)found=i;});
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

  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .5s ease"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>牌陣展開</div>
        <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:3}}>6×6 SPREAD GRID</div>
      </div>
      <button onClick={doShuffle} style={{
        display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:50,
        cursor:"pointer",
        background:`linear-gradient(135deg,${C.blue},${C.blue}cc)`,
        border:`1px solid ${C.accentDim}`,
        fontFamily:"'Cinzel',serif",fontSize:11.88,color:C.gold,
        letterSpacing:1,
        transform:shuffleAnim?"scale(.93)":"scale(1)",
        transition:"transform .15s",
        boxShadow:"0 4px 14px rgba(0,0,0,.3)"
      }}>
        <span style={{fontSize:15.44,display:"inline-block",animation:shuffleAnim?"spin .6s linear":"none"}}>🔀</span>
        <span>洗牌</span>
      </button>
    </div>

    {/* 牌堆 + 抽出區 */}
    <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:16,padding:14,marginBottom:14,backdropFilter:"blur(10px)"}}>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:0}}>
        <div onClick={drawCard} style={{
          width:52,height:78,
          ...cbBgStyle(),
          border:CB.id==="monsteraCard"?"none":`1px solid ${CB.border}`,borderRadius:10,
          cursor:(deck.length-deckPtr.current)>0?"pointer":"not-allowed",
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          flexShrink:0,overflow:"hidden",
          boxShadow:(deck.length-deckPtr.current)>0?`inset 0 1px 0 rgba(255,255,255,.07),0 6px 18px rgba(0,0,0,.4),0 0 14px ${CB.idleShadow}`:"none",
          position:"relative",opacity:(deck.length-deckPtr.current)>0?1:.4,
          transition:"transform .2s, box-shadow .2s",
        }}>
          <div style={{position:"absolute",inset:4,border:`1px solid ${(CB.id==="hibiscusCard"||CB.id==="monsteraCard")?"rgba(0,0,0,0)":CB.strokeDim}`,borderRadius:5,pointerEvents:"none"}}/>
          {CB.id==="hibiscusCard"&&<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.12) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {/* 龜背芋光影 */}
          {CB.id==="monsteraCard"&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:"linear-gradient(180deg,rgba(180,220,200,.28) 0%,rgba(180,220,200,.10) 60%,transparent 100%)",pointerEvents:"none",zIndex:4,borderRadius:"10px 10px 0 0"}}/>}
          {CB.id==="monsteraCard"&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:"linear-gradient(90deg,rgba(200,235,215,.20) 0%,rgba(200,235,215,.08) 55%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {CB.id==="monsteraCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(10,40,15,.20) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {CB.id==="monsteraCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(220,245,230,.16) 0%,rgba(220,245,230,.05) 30%,transparent 55%,rgba(5,30,10,.08) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {CB.id==="monsteraCard"&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:"linear-gradient(0deg,rgba(10,40,15,.18) 0%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {CB.id==="hibiscusCard"&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:"linear-gradient(180deg,rgba(180,210,255,.28) 0%,rgba(180,210,255,.10) 60%,transparent 100%)",pointerEvents:"none",zIndex:4,borderRadius:"10px 10px 0 0"}}/>}
          {CB.id==="hibiscusCard"&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:"linear-gradient(90deg,rgba(210,225,255,.20) 0%,rgba(210,225,255,.08) 55%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {CB.id==="hibiscusCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(60,10,5,.18) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {CB.id==="hibiscusCard"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(220,235,255,.16) 0%,rgba(220,235,255,.05) 30%,transparent 55%,rgba(40,8,4,.07) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {CB.id==="hibiscusCard"&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:"linear-gradient(0deg,rgba(60,10,5,.16) 0%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {CB.id!=="hibiscusCard"&&CB.id!=="monsteraCard"&&<div style={{position:"absolute",top:"-30%",left:"-20%",width:"60%",height:"160%",background:CB.shimmer,transform:"skewX(-10deg)",pointerEvents:"none"}}/>}
          {(CB.id==="hibiscusCard"||CB.id==="monsteraCard")&&<div style={{position:"absolute",top:"-40%",left:"-55%",width:"45%",height:"180%",
            background:CB.id==="hibiscusCard"
              ?"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(230,240,255,.45) 43%,rgba(210,225,255,.65) 50%,rgba(230,240,255,.45) 57%,transparent 72%,transparent 100%)"
              :"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(210,240,225,.45) 43%,rgba(180,230,205,.68) 50%,rgba(210,240,225,.45) 57%,transparent 72%,transparent 100%)",
            transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,
            animation:CB.id==="hibiscusCard"?"hibiscusShimmer 2.8s ease-in-out infinite":"monsteraShimmer 2.8s ease-in-out infinite"}}/>}
          {CB.id==="hibiscusCard"
            ?<svg viewBox="0 0 60 70" width={20} height={23} fill="none" style={{position:"relative",zIndex:2}}>
              <path d="M30,35 C27,30 26,22 27.5,17 C28.5,14 30,13.5 30,13.5 C30,13.5 31.5,14 32.5,17 C34,22 33,30 30,35 Z" fill="rgba(210,40,20,0.82)"/>
              <path d="M30,35 C34.5,32.5 39,31.5 42.5,33.5 C44,35 44,39 40,38.5 C36,36.5 32.5,35.5 30,35 Z" fill="rgba(215,45,22,0.8)"/>
              <path d="M30,35 C32,39 32.5,45 30,48.5 C29,50.5 27.5,51 26.5,50 C27,44.5 30,35 30,35 Z" fill="rgba(205,38,18,0.8)"/>
              <path d="M30,35 C26,37 22,38.5 19.5,37 C18,36 18.5,33 24,32.5 C27,33.5 30,35 30,35 Z" fill="rgba(210,42,20,0.78)"/>
              <path d="M30,35 C27.5,31 25,27 23,23 C22,20.5 24.5,18 29,22 C30,25 30,35 30,35 Z" fill="rgba(218,48,24,0.8)"/>
              <circle cx="30" cy="35" r="3.5" fill="rgba(220,140,20,0.9)"/>
              <circle cx="30" cy="35" r="1.8" fill="rgba(250,200,40,0.95)"/>
            </svg>
            :CB.id==="monsteraCard"
            ?null
            :<svg viewBox="0 0 60 70" width={20} height={23} fill="none" style={{position:"relative",zIndex:2}}>
              <polygon points="30,3 57,18 57,52 30,67 3,52 3,18" stroke={CB.stroke} strokeWidth="1.2" fill="none"/>
              <polygon points="30,13 47,23 47,47 30,57 13,47 13,23" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
              <circle cx="30" cy="35" r="7" stroke={CB.strokeDim} strokeWidth="0.8" fill="none"/>
              <circle cx="30" cy="35" r="2.5" fill={CB.centerDot}/>
            </svg>
          }
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
    <CardModal card={zoom} onClose={()=>setZoom(null)}/>
  </div>;
}

// ── Divination Room ──────────────────────────────────────────────────────────
