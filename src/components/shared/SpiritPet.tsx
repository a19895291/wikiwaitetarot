// 模組 12 — SpiritPet（右下角浮動寵物，支援拖曳與點擊表情動畫）
import { useState, useEffect, useRef } from "react";
import { C } from "../../data/themes";
import { getAiUrl } from "../../utils/prompt";

export function SpiritPet({spirit,activeSpiritEmoji,uiScale=1}){
  const [action,setAction]=useState("float");
  const [msg,setMsg]=useState(null);
  const [pos,setPos]=useState({x:window.innerWidth-80,y:window.innerHeight-150});
  const isDragging=useRef(false);
  const dragOffset=useRef({x:0,y:0});
  const petRef=useRef();
  const downRef=useRef({x:0,y:0});
  const movedRef=useRef(false);

  useEffect(()=>{
    const id=setInterval(()=>{
      if(isDragging.current)return;
      const actions=["jump","float","sleep","groom","float","breathe","float"];
      setAction(actions[Math.floor(Math.random()*actions.length)]);
      if(Math.random()>.5){
        const pool=[...spirit.jokes,...spirit.tips];
        setMsg(pool[Math.floor(Math.random()*pool.length)]);
        setTimeout(()=>setMsg(null),5000);
      }
    },5500);
    return ()=>clearInterval(id);
  },[spirit]);

  const onPointerDown=e=>{
    e.preventDefault();
    isDragging.current=true;
    movedRef.current=false;
    downRef.current={x:e.clientX,y:e.clientY};
    const r=petRef.current.getBoundingClientRect();
    dragOffset.current={x:e.clientX-r.left,y:e.clientY-r.top};
    petRef.current.setPointerCapture(e.pointerId);
    setAction("idle");
  };
  const onPointerMove=e=>{
    if(!isDragging.current)return;
    if(Math.abs(e.clientX-downRef.current.x)>6||Math.abs(e.clientY-downRef.current.y)>6)movedRef.current=true;
    setPos({x:Math.min(Math.max(0,e.clientX-dragOffset.current.x),window.innerWidth-55),y:Math.min(Math.max(0,e.clientY-dragOffset.current.y),window.innerHeight-65)});
  };
  const onPointerUp=()=>{
    const wasTap=!movedRef.current;
    isDragging.current=false;setAction("float");
    if(wasTap){try{window.open(getAiUrl(),"_blank");}catch(_){}}
  };

  const animStyles = {
    float:{animation:"floatPet 3.5s ease-in-out infinite"},
    breathe:{animation:"breathePet 2.5s ease-in-out infinite"},
    jump:{animation:"jumpPet .9s cubic-bezier(.34,1.56,.64,1)"},
    sleep:{animation:"sleepPet 2s ease-in-out infinite"},
    groom:{animation:"groomPet 1.2s ease-in-out infinite"},
    idle:{},
  };

  return <div ref={petRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
    style={{position:"fixed",left:pos.x,top:pos.y,zIndex:500,userSelect:"none",touchAction:"none",cursor:isDragging.current?"grabbing":"grab"}}>
    {msg&&<div style={{
      position:"absolute",bottom:"115%",left:"50%",
      animation:"bubblePop .4s cubic-bezier(.34,1.56,.64,1) forwards",
      background:C.bgPanel,
      border:`1px solid ${C.accentDim}`,
      borderRadius:14*uiScale,padding:`${9*uiScale}px ${13*uiScale}px`,
      fontSize:13.07*uiScale,color:C.text,
      maxWidth:190*uiScale,lineHeight:1.65,whiteSpace:"pre-wrap",
      boxShadow:`0 6px 24px rgba(0,0,0,.4), 0 0 14px ${C.accentFaint}`,
      width:"max-content",pointerEvents:"none",
    }}>
      {msg}
      <div style={{position:"absolute",bottom:-7*uiScale,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:`${7*uiScale}px solid transparent`,borderRight:`${7*uiScale}px solid transparent`,borderTop:`${7*uiScale}px solid ${C.accentDim}`}}/>
    </div>}
    <div style={{
      fontSize:42.77*uiScale,lineHeight:1,
      filter:`drop-shadow(0 0 14px ${spirit.color}99)`,
      ...(animStyles[action]||animStyles.float),
      transition:"all .4s cubic-bezier(.34,1.56,.64,1)",
    }}>{activeSpiritEmoji||spirit.emoji}</div>
  </div>;
}

// ── Daily Page (index.html fan-card style) ────────────────────────────────────
