// 模組 04 — DailyPage（每日占卜，扇形展牌、每日上限 5 張）
// drawnCards / onDraw / remaining / onReset 由 App 以 props 傳入；持久化在 App 層處理。
import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../data/themes";
import { CB } from "../data/cardBacks";
import { KEYWORDS } from "../data/deck";
import { GoldPayBtn } from "../components/shared/GoldPayBtn";
import { cbBgStyle } from "../components/shared/cbBgStyle";

export function DailyPage({drawnCards,onDraw,remaining,onReset}){
  const [started,setStarted]=useState(drawnCards.length>0);
  const [flippedSet,setFlippedSet]=useState(()=>new Set(drawnCards.map((_,i)=>i)));
  const [selectedIdx,setSelectedIdx]=useState(null);
  const [panelCard,setPanelCard]=useState(null);
  const [dots,setDots]=useState(()=>{
    const d=Array(5).fill("idle");
    drawnCards.forEach((_,i)=>{ d[i]="done"; });
    return d;
  });
  const [dealtSet,setDealtSet]=useState(()=>new Set(drawnCards.map((_,i)=>i)));
  const [fanVisible,setFanVisible]=useState(drawnCards.length>0);
  const [panelVisible,setPanelVisible]=useState(drawnCards.length>0);
  const cardsRef=useRef(drawnCards);
  cardsRef.current=drawnCards;

  // 每次 CB 改變時直接更新 .daily-card-back 的 DOM style
  useEffect(()=>{
    const els=document.querySelectorAll('.daily-card-back');
    const isImg=CB.bg&&CB.bg.startsWith("data:");
    const isMCB=CB.id==="monsteraCard";
    const isHCB=CB.id==="hibiscusCard";
    const isImgCB=isMCB||isHCB;
    els.forEach(el=>{
      if(isImg){
        el.style.background="";
        el.style.backgroundColor=isMCB?"#f0f7f0":"#fff8f5";
        el.style.backgroundImage=`url(${CB.bg})`;
        el.style.backgroundSize="cover";
        el.style.backgroundPosition="center center";
        el.style.backgroundRepeat="no-repeat";
      } else {
        el.style.background=CB.bg;
        el.style.backgroundColor="";
        el.style.backgroundImage="";
      }
      el.style.border=isImgCB?"none":`1px solid ${CB.border}`;
      el.style.boxShadow=isHCB
        ?`inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.1),0 6px 20px rgba(0,0,0,.2),0 0 18px rgba(210,55,25,.25),0 0 0 1px rgba(210,55,25,.12)`
        :isMCB
        ?`inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.15),0 6px 20px rgba(0,0,0,.3),0 0 18px rgba(46,125,50,.35),0 0 0 1px rgba(46,125,50,.18)`
        :`inset 0 1px 0 rgba(255,255,255,.07),inset 0 -1px 0 rgba(0,0,0,.5),0 4px 16px rgba(0,0,0,.5),0 0 14px ${CB.idleShadow}`;
    });
  });

  // Sync when drawnCards grows (new card drawn)
  useEffect(()=>{
    const newIdx=drawnCards.length-1;
    if(!started||newIdx<0)return;
    if(dealtSet.has(newIdx))return;
    // Animate deal for newly drawn card
    setTimeout(()=>{
      setDealtSet(s=>new Set([...s,newIdx]));
      setDots(d=>{const nd=[...d];nd[newIdx]="active";return nd;});
      if(!panelVisible)setPanelVisible(true);
    },newIdx*160+100);
  },[drawnCards.length]);// eslint-disable-line

  // Update first active dot
  const refreshActiveDot=useCallback((flipped,total)=>{
    setDots(d=>{
      const nd=d.map((v,i)=>{
        if(i>=total)return"idle";
        if(flipped.has(i))return"done";
        return"idle";
      });
      // first unflipped drawn card gets active
      for(let i=0;i<total;i++){
        if(!flipped.has(i)){nd[i]="active";break;}
      }
      return nd;
    });
  },[]);

  const handleStart=()=>{
    if(started)return;
    setStarted(true);
    onDraw();
    setFanVisible(true);
    // deal animation: first card
    setTimeout(()=>{
      setDealtSet(new Set([0]));
      setDots(d=>{const nd=[...d];nd[0]="active";return nd;});
      setPanelVisible(true);
    },300);
  };

  const handleCardClick=useCallback((i)=>{
    const cards=cardsRef.current;
    if(i>=cards.length)return; // not yet drawn

    const alreadyFlipped=flippedSet.has(i);

    // re-select already flipped card
    if(alreadyFlipped){
      setSelectedIdx(i);
      setPanelCard({...cards[i],slotIdx:i});
      return;
    }

    // first flip — draw if needed
    const needDraw=i>=cards.length;
    if(needDraw)return;

    const flash=()=>{
      const el=document.getElementById(`daily-flash-${i}`);
      if(el){el.style.display="block";setTimeout(()=>el.style.display="none",500);}
    };

    setFlippedSet(s=>{
      const ns=new Set([...s,i]);
      refreshActiveDot(ns,cards.length);
      return ns;
    });
    setSelectedIdx(i);
    flash();
    setTimeout(()=>{
      setPanelCard({...cards[i],slotIdx:i});
    },340);
  },[flippedSet,refreshActiveDot]);

  // Draw next card when clicking undrawn slot
  const handleSlotClick=useCallback((i)=>{
    const cards=cardsRef.current;
    if(i<cards.length){
      handleCardClick(i);
    } else if(i===cards.length&&remaining>0){
      onDraw();
    }
  },[handleCardClick,remaining,onDraw]);

  const today=new Date();
  const DAYS=["日","一","二","三","四","五","六"];
  const dateStr=`── ${today.getFullYear()} 年 ${today.getMonth()+1} 月 ${today.getDate()} 日　星期${DAYS[today.getDay()]} ──`;

  const isHibiscusCB=CB.id==="hibiscusCard";
  const isMonsteraCB=CB.id==="monsteraCard";
  const backSVG=()=>isHibiscusCB
    ?``
    :isMonsteraCB
    ?``
    :`<svg viewBox="0 0 60 70" width="36" height="42" fill="none">
    <polygon points="30,3 57,18 57,52 30,67 3,52 3,18" stroke="${CB.stroke}" stroke-width="1.2" fill="none"/>
    <polygon points="30,13 47,23 47,47 30,57 13,47 13,23" stroke="${CB.strokeDim}" stroke-width="0.8" fill="none"/>
    <line x1="30" y1="3"  x2="30" y2="67" stroke="${CB.strokeFaint}" stroke-width="0.5"/>
    <line x1="3"  y1="18" x2="57" y2="52" stroke="${CB.strokeFaint}" stroke-width="0.5"/>
    <line x1="57" y1="18" x2="3"  y2="52" stroke="${CB.strokeFaint}" stroke-width="0.5"/>
    <circle cx="30" cy="35" r="7"   stroke="${CB.strokeDim}" stroke-width="0.8" fill="none"/>
    <circle cx="30" cy="35" r="2.5" fill="${CB.centerDot}"/>
    <circle cx="30" cy="18" r="1.2" fill="${CB.dot}"/>
    <circle cx="30" cy="52" r="1.2" fill="${CB.dot}"/>
    <circle cx="13" cy="26.5" r="1.2" fill="${CB.dot}"/>
    <circle cx="47" cy="26.5" r="1.2" fill="${CB.dot}"/>
    <circle cx="13" cy="43.5" r="1.2" fill="${CB.dot}"/>
    <circle cx="47" cy="43.5" r="1.2" fill="${CB.dot}"/>
  </svg>`;

  const handleReset=()=>{
    setStarted(false);setFlippedSet(new Set());setSelectedIdx(null);
    setPanelCard(null);setDots(Array(5).fill("idle"));setDealtSet(new Set());
    setFanVisible(false);setPanelVisible(false);
    onReset();
  };

  return <div style={{
    position:"relative",minHeight:"calc(100vh - 46px)",
    display:"flex",flexDirection:"column",alignItems:"center",
    padding:"0 0 120px",
    fontFamily:"'Noto Sans TC',sans-serif",
  }}>

    {/* ── Header ── */}
    <div style={{width:"100%",padding:"20px 20px 0",display:"flex",alignItems:"flex-start",justifyContent:"center",position:"relative"}}>
      <button onClick={handleReset} style={{
        position:"absolute",right:16,top:18,
        background:C.accentFaint,border:`1px solid ${C.accentDim}`,
        borderRadius:20,padding:"5px 11px",fontFamily:"'Cinzel',serif",
        fontSize:10.69,color:C.accentDim,cursor:"pointer",letterSpacing:1,transition:"all 0.2s",
      }}
        onMouseOver={e=>{e.currentTarget.style.background=C.accentFaint;e.currentTarget.style.color=C.accent;}}
        onMouseOut={e=>{e.currentTarget.style.background=C.accentFaint;e.currentTarget.style.color=C.accentDim;}}
      >RESET</button>
      <div style={{textAlign:"center"}}>
        {/* 星啓塔羅：玻璃通透感 */}
        <div style={{position:"relative",display:"inline-block"}}>
          {/* 底層：立體投影 */}
          <div style={{
            fontFamily:"'Cinzel Decorative',serif",fontSize:26.14,letterSpacing:4,
            position:"absolute",top:2,left:1,
            WebkitTextFillColor:"transparent",
            background:`linear-gradient(135deg,rgba(0,0,0,.3),rgba(0,60,10,.22))`,
            WebkitBackgroundClip:"text",backgroundClip:"text",
            filter:"blur(2.5px)",
            userSelect:"none",pointerEvents:"none",
          }}>星啟塔羅</div>
          {/* 主層：玻璃通透漸層（靜態） */}
          <div style={{
            fontFamily:"'Cinzel Decorative',serif",fontSize:26.14,letterSpacing:4,
            background:`linear-gradient(120deg,
              ${C.accent}aa 0%,
              ${C.blue}cc 20%,
              rgba(220,248,228,.92) 38%,
              rgba(255,255,255,.88) 45%,
              rgba(210,245,220,.90) 52%,
              ${C.blue}bb 68%,
              ${C.accent}99 100%
            )`,
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            filter:`drop-shadow(0 0 10px rgba(46,125,50,.45)) drop-shadow(0 2px 3px rgba(0,0,0,.35))`,
            position:"relative",zIndex:1,
          }}>星啟塔羅</div>
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:10.69,letterSpacing:6,color:C.accentDim,marginTop:2}}>DAILY READING</div>
      </div>
    </div>
    <div style={{width:"90%",height:1,background:`linear-gradient(90deg,transparent,${C.accentFaint},${C.accentDim},${C.accentFaint},transparent)`,margin:"14px 0 6px"}}/>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:11.88,letterSpacing:3,color:C.accentDim,textAlign:"center",marginBottom:4}}>{dateStr}</div>

    {/* ── Start Area ── */}
    {!started&&<div style={{
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      flex:1,
      transition:"opacity 0.4s, transform 0.4s",
    }}>
      {/* Deck Stack */}
      <div style={{position:"relative",width:134,height:207,marginBottom:28,cursor:"pointer"}} onClick={handleStart}>
        <div style={{position:"absolute",width:123,height:190,borderRadius:12,border:(isMonsteraCB||isHibiscusCB)?"none":`1px solid ${CB.border}`,top:11,left:6,...cbBgStyle(),transform:"rotate(-5deg)"}}/>
        <div style={{position:"absolute",width:123,height:190,borderRadius:12,border:(isMonsteraCB||isHibiscusCB)?"none":`1px solid ${CB.border}`,top:6,left:3,...cbBgStyle(),transform:"rotate(-2.5deg)"}}/>
        {/* Deck top */}
        <div style={{
          width:126,height:193,borderRadius:12,
          ...cbBgStyle(),
          border:(isMonsteraCB||isHibiscusCB)?"none":`1px solid ${CB.border}`,
          boxShadow:isMonsteraCB?`inset 0 2px 0 rgba(255,255,255,.45),inset 0 -1px 0 rgba(0,0,0,.15),0 8px 32px rgba(0,0,0,.4),0 0 20px rgba(46,125,50,.4),0 0 0 1px rgba(46,125,50,.15)`:`inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${CB.idleShadow}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          position:"absolute",top:0,left:0,overflow:"hidden",
          animation:"none",
        }}>
          <div style={{position:"absolute",inset:6,border:`1px solid ${isHibiscusCB?"rgba(0,0,0,0)":isMonsteraCB?"rgba(0,0,0,0)":CB.strokeDim}`,borderRadius:6}}/>
          {/* 扶桑花金屬質感 */}
          {isHibiscusCB&&<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.15) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {isHibiscusCB&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(255,255,255,.15) 0%,transparent 35%,transparent 65%,rgba(0,0,0,.07) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {/* 扶桑花光影 */}
          {isHibiscusCB&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:"linear-gradient(180deg,rgba(180,210,255,.28) 0%,rgba(180,210,255,.10) 60%,transparent 100%)",pointerEvents:"none",zIndex:4,borderRadius:"10px 10px 0 0"}}/>}
          {isHibiscusCB&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:"linear-gradient(90deg,rgba(210,225,255,.20) 0%,rgba(210,225,255,.08) 55%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {isHibiscusCB&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(60,10,5,.18) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {isHibiscusCB&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(220,235,255,.16) 0%,rgba(220,235,255,.05) 30%,transparent 55%,rgba(40,8,4,.07) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {isHibiscusCB&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:"linear-gradient(0deg,rgba(60,10,5,.16) 0%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {/* 龜背芋光影 */}
          {isMonsteraCB&&<div style={{position:"absolute",top:0,left:0,right:0,height:"20%",background:"linear-gradient(180deg,rgba(180,220,200,.28) 0%,rgba(180,220,200,.10) 60%,transparent 100%)",pointerEvents:"none",zIndex:4,borderRadius:"10px 10px 0 0"}}/>}
          {isMonsteraCB&&<div style={{position:"absolute",top:"8%",left:0,bottom:"8%",width:"18%",background:"linear-gradient(90deg,rgba(200,235,215,.20) 0%,rgba(200,235,215,.08) 55%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {isMonsteraCB&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(10,40,15,.20) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {isMonsteraCB&&<div style={{position:"absolute",inset:0,background:"linear-gradient(145deg,rgba(220,245,230,.16) 0%,rgba(220,245,230,.05) 30%,transparent 55%,rgba(5,30,10,.08) 100%)",pointerEvents:"none",zIndex:4,borderRadius:10}}/>}
          {isMonsteraCB&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:"13%",background:"linear-gradient(0deg,rgba(10,40,15,.18) 0%,transparent 100%)",pointerEvents:"none",zIndex:4}}/>}
          {!isHibiscusCB&&!isMonsteraCB&&<div style={{position:"absolute",top:"-30%",left:"-20%",width:"60%",height:"160%",
            background:CB.shimmer,transform:"skewX(-10deg)",pointerEvents:"none"}}/>}
          {/* 扶桑花銀光掃過 */}
          {isHibiscusCB&&<div style={{position:"absolute",top:"-40%",left:"-55%",width:"45%",height:"180%",
            background:"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(230,240,255,.45) 43%,rgba(210,225,255,.65) 50%,rgba(230,240,255,.45) 57%,transparent 72%,transparent 100%)",
            transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,
            animation:"hibiscusShimmer 2.8s ease-in-out infinite"}}/>}
          {/* 龜背芋銀光掃過 */}
          {isMonsteraCB&&<div style={{position:"absolute",top:"-40%",left:"-55%",width:"45%",height:"180%",
            background:"linear-gradient(105deg,transparent 0%,transparent 28%,rgba(210,240,225,.45) 43%,rgba(180,230,205,.68) 50%,rgba(210,240,225,.45) 57%,transparent 72%,transparent 100%)",
            transform:"skewX(-12deg)",pointerEvents:"none",zIndex:6,
            animation:"monsteraShimmer 2.8s ease-in-out infinite"}}/>}
          <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:8}}
            dangerouslySetInnerHTML={{__html:backSVG()}}/>
        </div>
      </div>
      <button onClick={handleStart} className="pay-btn" style={{
        fontFamily:"'Cinzel',serif",fontSize:14.26,letterSpacing:3,
        color:C.bg==="#04060d"?"#0d1628":"#ffffff",fontWeight:700,
        textShadow:C.bg==="#04060d"?"0 1px 2px rgba(0,0,0,0.18)":"0 1px 6px rgba(0,0,0,0.5),0 0 16px rgba(255,255,255,0.2)",
        background:C.bg==="#04060d"
          ?`linear-gradient(135deg,#c49f4b 0%,#d4b56e 30%,#f0d892 50%,#d4b56e 70%,#b89241 100%)`
          :`linear-gradient(135deg,${C.blue} 0%,${C.accent} 35%,${C.accent}dd 55%,${C.blue} 75%,${C.accent} 100%)`,
        backgroundSize:"200% auto",
        border:C.bg==="#04060d"?`1px solid rgba(255,210,80,0.5)`:`1px solid rgba(255,255,255,0.25)`,
        borderRadius:50,padding:"14px 36px",cursor:"pointer",
        position:"relative",overflow:"hidden",
        boxShadow:C.bg==="#04060d"
          ?`0 4px 20px rgba(0,0,0,0.5),0 0 22px rgba(212,168,67,0.55),inset 0 1px 0 rgba(255,220,100,0.45),inset 0 -2px 0 rgba(0,0,0,0.3)`
          :`0 4px 20px rgba(0,0,0,0.35),0 0 18px ${C.accentGlow},inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.2)`,
        transition:"all 0.3s",
      }}
        onMouseOver={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=C.bg==="#04060d"?`0 8px 28px rgba(0,0,0,0.55),0 0 32px rgba(212,168,67,0.7),inset 0 1px 0 rgba(255,220,100,0.55),inset 0 -2px 0 rgba(0,0,0,0.3)`:`0 8px 28px rgba(0,0,0,0.4),0 0 28px ${C.accentGlow},inset 0 1px 0 rgba(255,255,255,0.35),inset 0 -2px 0 rgba(0,0,0,0.2)`;}}
        onMouseOut={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow=C.bg==="#04060d"?`0 4px 20px rgba(0,0,0,0.5),0 0 22px rgba(212,168,67,0.55),inset 0 1px 0 rgba(255,220,100,0.45),inset 0 -2px 0 rgba(0,0,0,0.3)`:`0 4px 20px rgba(0,0,0,0.35),0 0 18px ${C.accentGlow},inset 0 1px 0 rgba(255,255,255,0.3),inset 0 -2px 0 rgba(0,0,0,0.2)`;}}
      >
        <span style={{position:"relative"}}>✦ 開始今日占卜</span>
      </button>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:10.69,letterSpacing:2,color:C.accentDim,marginTop:12}}>TAP TO BEGIN</div>
    </div>}

    {/* ── Fan Area ── */}
    {started&&<div style={{
      width:"100%",opacity:fanVisible?1:0,pointerEvents:fanVisible?"auto":"none",marginTop:20,transition:"opacity 0.5s",
    }}>
      <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",padding:"24px 10px 28px",minHeight:190}}>
        {Array(5).fill(0).map((_,i)=>{
          const card=drawnCards[i];
          const isDealt=dealtSet.has(i);
          const isFlipped=flippedSet.has(i);
          const isSelected=selectedIdx===i;
          const posClass=card?.reversed?"reversed":"upright";
          const posLabel=card?.reversed?"▽ 逆位":"△ 正位";
          const canHover=isDealt&&!isFlipped;

          return <div
            key={i}
            id={`daily-slot-${i}`}
            className={`daily-card-slot${isSelected?" selected":""}${canHover?" hoverable":""}`}
            style={{zIndex:i===2?3:i===1||i===3?2:1}}
            onClick={()=>handleSlotClick(i)}
          >
            <div
              id={`daily-inner-${i}`}
              className={`daily-card-inner${isDealt?" dealt":""}${isDealt&&isFlipped?" flipped":""}`}
              style={{opacity:isDealt?1:0,animation:isDealt&&!isFlipped?"dealIn 0.48s cubic-bezier(0.34, 1.45, 0.64, 1) forwards":undefined}}
            >
              {/* Back */}
              <div className="daily-card-back" data-cb="1">
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}
                  dangerouslySetInnerHTML={{__html:backSVG()+`<div style="font-family:'Cinzel',serif;font-size:6px;letter-spacing:3px;color:${CB.footnote}">${isHibiscusCB?"✿ ✦ ✿":isMonsteraCB?"":"✦ ✦ ✦"}</div>`}}/>
              </div>
              {/* Face */}
              {card&&<div className={`daily-card-face ${posClass}`}>
                <div className="daily-cf-content">
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:8.32,color:C.accentDim,letterSpacing:1,position:"absolute",top:4,left:5,zIndex:3}}>0{i+1}</div>
                  {card.img
                    ?<img src={card.img} alt={card.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:9,pointerEvents:"none"}}/>
                    :<div style={{fontSize:33.26,filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.6))",lineHeight:1}}>{card.emoji}</div>
                  }
                  {!card.img&&<>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:8.91,color:C.accent,textAlign:"center",letterSpacing:.5,lineHeight:1.3,padding:"0 2px"}}>{card.name}</div>
                    <div style={{fontSize:7.13,color:card.reversed?"rgba(180,120,255,0.55)":"rgba(200,200,255,0.4)",fontFamily:"'Cinzel',serif",letterSpacing:1}}>{posLabel}</div>
                  </>}
                  {card.img&&<div style={{position:"absolute",bottom:4,left:0,right:0,textAlign:"center",zIndex:2,pointerEvents:"none"}}>
                    <div style={{display:"inline-block",background:C.bgPanel,backdropFilter:"blur(4px)",borderRadius:4,padding:"1px 5px"}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontSize:7.13,color:C.accent,letterSpacing:.5,lineHeight:1.4}}>{card.name}</div>
                      <div style={{fontSize:5.94,color:card.reversed?"rgba(180,120,255,0.7)":"rgba(200,200,255,0.55)",fontFamily:"'Cinzel',serif"}}>{posLabel}</div>
                    </div>
                  </div>}
                </div>
              </div>}
              {/* Flash */}
              <div id={`daily-flash-${i}`} className="daily-card-flash" style={{display:"none"}}/>
            </div>
          </div>;
        })}
      </div>

      {/* Progress dots */}
      <div style={{display:"flex",justifyContent:"center",gap:8,margin:"0 0 14px"}}>
        {dots.map((state,i)=><div key={i} className={`daily-p-dot${state==="active"?" active":state==="done"?" done":""}`}/>)}
      </div>

      {/* Reading Panel */}
      {panelVisible&&<div style={{
        width:"calc(100% - 32px)",maxWidth:390,margin:"0 16px",
        opacity:panelCard?1:0.5,transform:"translateY(0)",transition:"opacity 0.4s, transform 0.4s",
      }}>
        <div style={{
          background:C.bgPanel,
          border:`1px solid ${C.accentDim}`,borderRadius:18,padding:20,
          backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
          boxShadow:"0 8px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.04)",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.15),transparent)"}}/>
          {panelCard
            ?<>
              {flippedSet.size===5&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",marginBottom:12}}>
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.accentDim})`}}/>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:10.69,letterSpacing:2,color:C.accentDim,whiteSpace:"nowrap"}}>✦ 五張牌已全部揭曉 ✦</div>
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.accentDim},transparent)`}}/>
              </div>}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                {panelCard.img
                  ?<div style={{width:44,height:68,borderRadius:7,overflow:"hidden",border:"1px solid rgba(196,148,28,0.5)",flexShrink:0,boxShadow:"0 0 12px rgba(196,148,28,0.25)",transform:panelCard.reversed?"rotate(180deg)":"none",transition:"transform .3s"}}>
                    <img src={panelCard.img} alt={panelCard.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </div>
                  :<div style={{fontSize:33.26,filter:`drop-shadow(0 0 8px ${C.accentDim})`}}>{panelCard.emoji}</div>
                }
                <div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:19.01,color:C.accent,letterSpacing:1}}>{panelCard.name}</div>
                  <div style={{
                    display:"inline-block",fontFamily:"'Cinzel',serif",fontSize:9.5,letterSpacing:2,
                    padding:"2px 9px",borderRadius:20,marginTop:3,
                    background:panelCard.reversed?"rgba(140,80,220,0.12)":"rgba(201,168,76,0.12)",
                    border:panelCard.reversed?"1px solid rgba(140,80,220,0.35)":`1px solid ${C.accentDim}`,
                    color:panelCard.reversed?C.purple:C.accent,
                  }}>{panelCard.reversed?"▽ 逆位":"△ 正位"}</div>
                </div>
              </div>
              {/* Keywords */}
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                {(KEYWORDS[panelCard.id]?.[panelCard.reversed?"rev":"up"]||[]).map((kw,i)=><span key={i} style={{
                  fontSize:10.69,padding:"3px 10px",borderRadius:20,
                  background:panelCard.reversed?"rgba(140,80,220,0.07)":"rgba(201,168,76,0.07)",
                  border:panelCard.reversed?"1px solid rgba(140,80,220,0.22)":"1px solid rgba(201,168,76,0.2)",
                  color:panelCard.reversed?"rgba(180,120,255,0.75)":"rgba(201,168,76,0.7)",
                  fontFamily:"'Cinzel',serif",
                }}>{kw}</span>)}
              </div>
              <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,0.2),transparent)",marginBottom:12}}/>
              <div style={{fontSize:14.26,color:C.textDim,lineHeight:1.85,fontWeight:300}}>
                {panelCard.reversed?(panelCard.rev||panelCard.reverse):(panelCard.up||panelCard.meaning)}
              </div>
            </>
            :<div style={{textAlign:"center",padding:"8px 0"}}>
              <div style={{fontSize:33.26,opacity:.3,marginBottom:8}}>✦</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:11.88,letterSpacing:2,color:C.accentDim}}>點擊任意一張牌以翻開</div>
            </div>
          }
        </div>
        {/* Draw more / complete CTA */}
        {remaining>0&&started&&<div style={{marginTop:12,textAlign:"center"}}>
          <GoldPayBtn onClick={onDraw} disabled={remaining===0} style={{padding:"11px 28px",fontSize:10}}>
            ✦ 再抽一張（剩餘 {remaining}）
          </GoldPayBtn>
        </div>}
      </div>}
    </div>}
  </div>;
}

// ── Spread Page ───────────────────────────────────────────────────────────────
