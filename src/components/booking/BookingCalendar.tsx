// 模組 06 — BookingCalendar（預約日曆 + 時段 + 項目選擇器）
// 純 JS Date 計算，不依賴外部日曆庫。
import { useState } from "react";
import { C } from "../../data/themes";
import { ALL_SLOTS, DIVINATION_ITEMS, ITEM_MULTIPLIER, getDayStatus, getSlots } from "../../data/diviners";

export function BookingCalendar({divId,date,onSelectDate,time,onSelectTime,item,onSelectItem,onClose,basePrice}){
  const today=new Date();
  today.setHours(0,0,0,0);
  const [viewYear,setViewYear]=useState(today.getFullYear());
  const [viewMonth,setViewMonth]=useState(today.getMonth()); // 0-based
  const [calMode,setCalMode]=useState("date"); // "date" | "time" | "item"

  const pad2=n=>String(n).padStart(2,"0");
  const toStr=(y,m,d)=>`${y}-${pad2(m+1)}-${pad2(d)}`;

  // 建立該月所有天
  const firstDow=new Date(viewYear,viewMonth,1).getDay();
  const daysInMonth=new Date(viewYear,viewMonth+1,0).getDate();

  const prevMonth=()=>{if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const nextMonth=()=>{if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};

  const selectedSlots=date?getSlots(divId,date):[];

  if(calMode==="time")return(
    <div style={{animation:"fadeInUp .22s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <button onClick={()=>setCalMode("date")} style={{background:"none",border:"none",color:C.textDim,fontSize:19.01,cursor:"pointer",padding:"2px 4px"}}>←</button>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:C.gold,letterSpacing:1}}>{date} 可預約時段</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
        {ALL_SLOTS.map(t=>{
          const avail=selectedSlots.includes(t);
          const sel=t===time;
          return <button key={t} onClick={()=>{if(avail){onSelectTime(t);setCalMode("item");}}} style={{
            padding:"10px 0",borderRadius:10,textAlign:"center",
            background:sel?`linear-gradient(135deg,${C.blue},${C.accent})`
              :avail?"#ffffff"
              :"rgba(180,185,190,.18)",
            border:sel?`1px solid ${C.accent}`
              :avail?"1px solid rgba(180,185,190,.5)"
              :"1px solid rgba(180,185,190,.2)",
            color:sel?C.buttonText||"#1a0e00"
              :avail?C.blue
              :"rgba(160,165,170,.5)",
            fontFamily:"'Cinzel',serif",fontSize:14.26,
            cursor:avail?"pointer":"not-allowed",
            fontWeight:sel?700:400,
          }}>{t}</button>;
        })}
      </div>
      {selectedSlots.length===0&&<div style={{textAlign:"center",padding:"18px 0",fontSize:13.07,color:C.textDim}}>此日無可預約時段</div>}
    </div>
  );

  if(calMode==="item")return(
    <div style={{animation:"fadeInUp .22s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <button onClick={()=>setCalMode("time")} style={{background:"none",border:"none",color:C.textDim,fontSize:19.01,cursor:"pointer",padding:"2px 4px"}}>←</button>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:C.gold,letterSpacing:1}}>選擇占卜項目</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {DIVINATION_ITEMS.map(it=>{
          const price=basePrice?Math.round(basePrice*ITEM_MULTIPLIER[it.id]):null;
          const sel=item===it.id;
          return <button key={it.id} onClick={()=>{onSelectItem(it.id);onClose();}} style={{
            padding:"11px 13px",borderRadius:12,textAlign:"left",cursor:"pointer",
            background:sel?`linear-gradient(135deg,${C.blue}99,${C.blue}cc)`:C.bgPanel,
            border:sel?`1px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
            transition:"all .15s",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:16}}>{it.emoji}</span>
                <span style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:sel?C.gold:C.text}}>{it.name}</span>
                <span style={{fontSize:10.69,color:C.textFaint}}>({it.duration})</span>
              </div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14.26,color:sel?C.gold:C.blue,fontWeight:700,whiteSpace:"nowrap"}}>
                {price?`NT$${price}`:it.priceLabel}
              </div>
            </div>
            <div style={{fontSize:10.69,color:C.textFaint,lineHeight:1.6,paddingLeft:23}}>{it.desc}</div>
          </button>;
        })}
      </div>
    </div>
  );

  const WEEK=["日","一","二","三","四","五","六"];
  return(
    <div style={{animation:"fadeInUp .22s ease"}}>
      {/* 月份導航 */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <button onClick={prevMonth} style={{background:"none",border:"none",color:C.textDim,fontSize:21.38,cursor:"pointer",padding:"0 6px",lineHeight:1}}>‹</button>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:14.26,color:C.gold,letterSpacing:1}}>
          {viewYear} 年 {viewMonth+1} 月
        </div>
        <button onClick={nextMonth} style={{background:"none",border:"none",color:C.textDim,fontSize:21.38,cursor:"pointer",padding:"0 6px",lineHeight:1}}>›</button>
      </div>
      {/* 星期標頭 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {WEEK.map(w=><div key={w} style={{textAlign:"center",fontSize:10.69,color:C.textFaint,fontFamily:"'Cinzel',serif",padding:"2px 0"}}>{w}</div>)}
      </div>
      {/* 日期格 */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {Array(firstDow).fill(null).map((_,i)=><div key={"e"+i}/>)}
        {Array(daysInMonth).fill(0).map((_,i)=>{
          const d=i+1;
          const dateStr=toStr(viewYear,viewMonth,d);
          const isPast=new Date(dateStr)<today;
          const status=isPast?"past":getDayStatus(divId,dateStr);
          const isSelected=dateStr===date;
          const isToday=dateStr===toStr(today.getFullYear(),today.getMonth(),today.getDate());

          let bg="transparent",color=C.textDim,border="1px solid transparent",cursor="default",opacity=1;
          if(isSelected){bg="linear-gradient(135deg,#b8862a,#e8c86a)";color=C.buttonText||"#1a0e00";border="1px solid rgba(212,168,67,.8)";}
          else if(status==="available"){bg="rgba(52,211,153,.1)";color=C.green;border="1px solid rgba(52,211,153,.3)";cursor="pointer";}
          else if(status==="full"){bg="rgba(26,58,110,.12)";color="rgba(107,163,232,.35)";border="1px solid rgba(26,58,110,.18)";opacity=.6;}
          else{opacity=.28;}// blocked or past

          return <button key={d} onClick={()=>{
            if(status==="available"){onSelectDate(dateStr);setCalMode("time");}
          }} style={{
            padding:"6px 0",borderRadius:7,textAlign:"center",
            background:bg,color,border,cursor,opacity,
            fontFamily:"'Cinzel',serif",fontSize:13.07,
            fontWeight:isToday?"700":"400",
            position:"relative",
          }}>
            {d}
            {isToday&&!isSelected&&<div style={{position:"absolute",bottom:1,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:C.gold}}/>}
          </button>;
        })}
      </div>
      {/* 圖例 */}
      <div style={{display:"flex",gap:12,marginTop:10,justifyContent:"center",flexWrap:"wrap"}}>
        {[["rgba(52,211,153,.6)","可預約"],["rgba(107,163,232,.35)","額滿"],[C.textFaint,"不開放"]].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:9.5,color:C.textFaint}}>
            <div style={{width:8,height:8,borderRadius:2,background:c}}/>
            <span>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


