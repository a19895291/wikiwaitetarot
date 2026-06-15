// 模組 09 — HistoryPage（占卜歷程，三分頁）
// 同檔含 CardChip / DailyHistCard / SpreadHistCard / OnlineHistCard / EmptyHist / DEMO 資料。
// 直接讀 localStorage（key：daily_* / spread_records / online_records）。
import { useState, useRef, useMemo, useEffect } from "react";
import { C } from "../data/themes";
import { DECK } from "../data/deck";
import { CardModal } from "../components/shared/CardModal";
import * as db from "../lib/db";
import { CopyAiButton } from "../components/shared/CopyAiButton";
import { recordToReading } from "../utils/prompt";

const DEMO_ONLINE_RECORDS=[
  {id:"demo1",date:"2026-05-25",time:"19:00",diviner:"月影師 Luna",divinerAvatar:"🌙",item:"感情專項",duration:"32分鐘",fee:300,rating:5,cat:"感情"},
  {id:"demo2",date:"2026-05-22",time:"14:00",diviner:"星塵師 Stella",divinerAvatar:"⭐",item:"事業財運",duration:"20分鐘",fee:250,rating:4,cat:"事業"},
  {id:"demo3",date:"2026-05-18",time:"20:00",diviner:"晨曦師 Aurora",divinerAvatar:"🌅",item:"凱爾特十字",duration:"45分鐘",fee:500,rating:5,cat:"靈性"},
];

// ── History: long-press card chip ────────────────────────────────────────────
function CardChip({cardName,reversed,onLongPress}){
  const pressTimer=useRef(null);
  const handleDown=()=>{pressTimer.current=setTimeout(()=>onLongPress&&onLongPress(),500);};
  const handleUp=()=>{clearTimeout(pressTimer.current);};
  return <div
    onPointerDown={handleDown} onPointerUp={handleUp} onPointerCancel={handleUp}
    style={{
      fontSize:10.69,padding:"3px 8px",borderRadius:6,
      background:reversed?"rgba(140,80,220,.12)":"rgba(212,168,67,.1)",
      border:reversed?"1px solid rgba(140,80,220,.3)":"1px solid rgba(212,168,67,.22)",
      color:reversed?"rgba(180,120,255,.85)":C.goldDim,
      cursor:"pointer",userSelect:"none",WebkitUserSelect:"none",
      display:"inline-flex",alignItems:"center",gap:3,flexShrink:0,
    }}>
    {cardName}<span style={{fontSize:8,opacity:.7}}>{reversed?"▽":"△"}</span>
  </div>;
}

export function HistoryPage(){
  const [tab,setTab]=useState("daily");
  const [zoomCard,setZoomCard]=useState(null);

  // 每日占卜：掃描所有 daily_YYYY-MM-DD key
  const localDaily=useMemo(()=>{
    const records=[];
    try{
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(!key||!key.startsWith("daily_"))continue;
        const dateKey=key.replace("daily_",""); // YYYY-MM-DD
        const raw=JSON.parse(localStorage.getItem(key)||"[]");
        const cards=Array.isArray(raw)?raw:[];
        if(cards.length>0){
          // try to find stored timestamp, fallback to date only
          const ts=localStorage.getItem("daily_ts_"+dateKey)||"";
          records.push({dateKey,ts,cards});
        }
      }
    }catch{}
    // sort newest first
    records.sort((a,b)=>b.dateKey.localeCompare(a.dateKey));
    // inject demo records if empty
    if(records.length===0){
      records.push({dateKey:"2026-05-26",ts:"2026-05-26 07:42",cards:[
        {...DECK.find(c=>c.id===18),reversed:false},
        {...DECK.find(c=>c.id===19),reversed:false},
        {...DECK.find(c=>c.id===17),reversed:true},
        {...DECK.find(c=>c.id===16),reversed:false},
        {...DECK.find(c=>c.id===21),reversed:false},
      ]});
      records.push({dateKey:"2026-05-24",ts:"2026-05-24 08:15",cards:[
        {...DECK.find(c=>c.id===0),reversed:false},
        {...DECK.find(c=>c.id===1),reversed:false},
        {...DECK.find(c=>c.id===2),reversed:true},
        {...DECK.find(c=>c.id===3),reversed:false},
        {...DECK.find(c=>c.id===4),reversed:true},
      ]});
      records.push({dateKey:"2026-05-20",ts:"2026-05-20 09:03",cards:[
        {...DECK.find(c=>c.id===9),reversed:false},
        {...DECK.find(c=>c.id===10),reversed:false},
        {...DECK.find(c=>c.id===11),reversed:true},
        {...DECK.find(c=>c.id===12),reversed:false},
        {...DECK.find(c=>c.id===13),reversed:true},
      ]});
    }
    return records;
  },[]);

  // 牌陣紀錄：存在 localStorage "spread_records"
  const localSpread=useMemo(()=>{
    try{
      const raw=JSON.parse(localStorage.getItem("spread_records")||"[]");
      const data=Array.isArray(raw)?raw.map(r=>({...r,cards:Array.isArray(r.cards)?r.cards:[]})):[];
      if(data.length>0)return data;
    }catch{}
    // demo
    return [
      {id:"sp1",dateKey:"2026-05-23",ts:"2026-05-23 21:30",spreadName:"自由盤",cards:[
        {...DECK.find(c=>c.id===6),reversed:false,cellIdx:4},
        {...DECK.find(c=>c.id===7),reversed:true,cellIdx:10},
        {...DECK.find(c=>c.id===14),reversed:false,cellIdx:16},
        {...DECK.find(c=>c.id===21),reversed:false,cellIdx:22},
      ]},
      {id:"sp2",dateKey:"2026-05-19",ts:"2026-05-19 15:10",spreadName:"自由盤",cards:[
        {...DECK.find(c=>c.id===1),reversed:false,cellIdx:2},
        {...DECK.find(c=>c.id===8),reversed:true,cellIdx:9},
        {...DECK.find(c=>c.id===15),reversed:false,cellIdx:20},
      ]},
    ];
  },[]);

  // 線上占卜紀錄
  const onlineRecords=useMemo(()=>{
    try{
      const live=JSON.parse(localStorage.getItem("online_records")||"[]");
      return [...live,...DEMO_ONLINE_RECORDS].sort((a,b)=>b.date.localeCompare(a.date));
    }catch{return DEMO_ONLINE_RECORDS;}
  },[]);
  // 登入者優先讀雲端，訪客或雲端失敗則用上面的本機資料
  const [dailyRecords,setDailyRecords]=useState(localDaily);
  const [spreadRecords,setSpreadRecords]=useState(localSpread);
  useEffect(()=>{
    let cancelled=false;
    const pad=n=>String(n).padStart(2,"0");
    const fmtTs=iso=>{try{const d=new Date(iso);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}catch{return "";}};
    (async()=>{
      try{
        const [d,s]=await Promise.all([db.listDailyRecords(),db.listSpreadRecords()]);
        if(cancelled)return;
        if(d&&d.length)setDailyRecords(d.map(r=>({dateKey:r.date,ts:r.created_at?fmtTs(r.created_at):"",cards:Array.isArray(r.cards)?r.cards:[]})));
        if(s&&s.length){
          // 雲端是「一天一筆」；本機則同日每個牌陣各一筆。改為本機優先、雲端只補本機沒有的日子（跨裝置才補）
          const cloud=s.map(r=>({id:r.id,dateKey:r.date,ts:r.created_at?fmtTs(r.created_at):"",spreadId:r.spread_id,spreadName:r.spread_name,question:r.question,cards:Array.isArray(r.cards)?r.cards:[]}));
          setSpreadRecords(prev=>{
            const realLocal=(prev||[]).filter(r=>r.id!=="sp1"&&r.id!=="sp2"); // 去掉示範資料
            const localDays=new Set(realLocal.map(r=>r.dateKey));
            const cloudOnly=cloud.filter(r=>!localDays.has(r.dateKey));
            const merged=[...realLocal,...cloudOnly];
            return merged.length?merged.sort((a,b)=>String(b.dateKey||"").localeCompare(String(a.dateKey||""))):cloud;
          });
        }
      }catch(e){/* 未登入或失敗就用本機 */}
    })();
    return ()=>{cancelled=true;};
  },[]);


  const TABS=[{id:"daily",label:"每日占卜",emoji:"🌙"},{id:"spread",label:"牌陣",emoji:"✦"},{id:"online",label:"線上占卜",emoji:"🔮"}];

  // find full card data for long-press zoom
  const openCardZoom=(cardOrName,reversed)=>{
    let found=null;
    if(typeof cardOrName==="object"&&cardOrName!==null){found=cardOrName;}
    else{found=DECK.find(c=>c.name===cardOrName);}
    if(found)setZoomCard({...found,reversed:reversed??false});
  };

  const fmtDate=(dateKey,ts)=>{
    if(ts)return ts;
    return dateKey;
  };

  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .5s ease"}}>
    <div style={{textAlign:"center",marginBottom:18}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>占卜歷程</div>
      <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:3}}>DIVINATION HISTORY</div>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"10px auto 0"}}/>
    </div>

    {/* Tab bar */}
    <div style={{display:"flex",gap:4,marginBottom:18,background:C.bgPanel,borderRadius:50,padding:4,border:`1px solid ${C.gridBorder}`}}>
      {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{
        flex:1,padding:"8px 4px",borderRadius:50,border:"none",cursor:"pointer",
        background:tab===t.id?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:"transparent",
        fontFamily:"'Cinzel',serif",fontSize:10.1,
        color:tab===t.id?C.gold:C.textFaint,
        transition:"all .22s",
        display:"flex",alignItems:"center",justifyContent:"center",gap:4,
        boxShadow:tab===t.id?`0 0 14px ${C.accentFaint}`:"none",
        whiteSpace:"nowrap",
      }}>
        <span>{t.emoji}</span><span>{t.label}</span>
      </button>)}
    </div>

    {/* ── 每日占卜 Tab ── */}
    {tab==="daily"&&<>
      {dailyRecords.length===0
        ?<EmptyHist label="尚無每日占卜紀錄"/>
        :dailyRecords.map((rec,i)=><DailyHistCard key={i} rec={rec} onLongPress={openCardZoom}/>)}
    </>}

    {/* ── 牌陣 Tab ── */}
    {tab==="spread"&&<>
      {spreadRecords.length===0
        ?<EmptyHist label="尚無牌陣紀錄"/>
        :spreadRecords.map((rec,i)=><SpreadHistCard key={i} rec={rec} onLongPress={openCardZoom}/>)}
    </>}

    {/* ── 線上占卜 Tab ── */}
    {tab==="online"&&<>
      {onlineRecords.length===0
        ?<EmptyHist label="尚無線上占卜紀錄"/>
        :onlineRecords.map((rec,i)=><OnlineHistCard key={i} rec={rec}/>)}
    </>}

    {/* Long-press card zoom modal */}
    <CardModal card={zoomCard} onClose={()=>setZoomCard(null)}/>
  </div>;
}

function EmptyHist({label}){
  return <div style={{textAlign:"center",padding:"52px 0",color:C.textDim}}>
    <div style={{fontSize:36,marginBottom:10,opacity:.35}}>✦</div>
    <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:C.textFaint,letterSpacing:1}}>{label}</div>
  </div>;
}

function DailyHistCard({rec,onLongPress}){
  const {dateKey,ts}=rec;
  const cards=Array.isArray(rec.cards)?rec.cards:[];
  return <div style={{
    background:C.bgPanel,border:"1px solid rgba(26,58,110,.32)",
    borderRadius:16,padding:14,marginBottom:12,backdropFilter:"blur(8px)",
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:12.47,color:C.gold,letterSpacing:1}}>{dateKey}</div>
        {ts&&ts!==dateKey&&<div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>{ts}</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <CopyAiButton reading={recordToReading(rec)} compact/>
        <div style={{fontSize:9.5,color:C.textDim,background:"rgba(26,58,110,.28)",padding:"2px 9px",borderRadius:50,fontFamily:"'Cinzel',serif",letterSpacing:.5}}>每日占卜</div>
      </div>
    </div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
      {cards.map((card,j)=>(
        <CardChip
          key={j}
          cardName={card.name}
          reversed={card.reversed}
          onLongPress={()=>onLongPress(card,card.reversed)}
        />
      ))}
    </div>
    <div style={{fontSize:9.5,color:C.textFaint,marginTop:8,letterSpacing:.5}}>長按牌名查看牌義 ✦</div>
  </div>;
}

function SpreadHistCard({rec,onLongPress}){
  const {dateKey,ts}=rec;
  const cards=Array.isArray(rec.cards)?rec.cards:[];
  const nonNull=cards.filter(Boolean);
  // 牌陣名稱：本機紀錄帶 spreadName；雲端紀錄則從卡片內嵌欄位還原；都沒有則泛稱
  const sName=rec.spreadName||(nonNull[0]&&nonNull[0].spreadName)||"牌陣";
  // 牌位：優先用 pos；自由盤舊資料用 cellIdx 還原成「第X列Y欄」
  const posOf=card=>card.pos||(typeof card.cellIdx==="number"?`第${Math.floor(card.cellIdx/6)+1}列${card.cellIdx%6+1}欄`:null);
  return <div style={{
    background:C.bgPanel,border:"1px solid rgba(124,58,237,.2)",
    borderRadius:16,padding:14,marginBottom:12,backdropFilter:"blur(8px)",
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:12.47,color:C.gold,letterSpacing:1}}>{dateKey}</div>
        {ts&&ts!==dateKey&&<div style={{fontSize:9.5,color:C.textFaint,marginTop:1}}>{ts}</div>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <CopyAiButton reading={recordToReading(rec)} compact/>
        <div style={{fontSize:9.5,color:"rgba(180,140,255,.85)",background:C.purpleGlow.replace(",.4)",",.12)"),padding:"2px 9px",borderRadius:50,fontFamily:"'Cinzel',serif",letterSpacing:.5,border:"1px solid rgba(124,58,237,.25)",whiteSpace:"nowrap"}}>{sName}</div>
        <div style={{fontSize:10.69,color:C.textFaint}}>{nonNull.length} 張</div>
      </div>
    </div>
    {rec.question&&<div style={{fontSize:11,color:C.textDim,marginBottom:8,lineHeight:1.5}}>你問的是：{rec.question}</div>}
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {nonNull.map((card,j)=>{
        const pos=posOf(card);
        return <div key={j} style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:3}}>
          {pos&&<div style={{fontSize:8.5,color:C.textFaint,letterSpacing:.3,maxWidth:88,lineHeight:1.2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{pos}</div>}
          <CardChip
            cardName={card.name}
            reversed={card.reversed}
            onLongPress={()=>onLongPress(card,card.reversed)}
          />
        </div>;
      })}
    </div>
    <div style={{fontSize:9.5,color:C.textFaint,marginTop:8,letterSpacing:.5}}>長按牌名查看牌義 ✦</div>
  </div>;
}

function OnlineHistCard({rec}){
  return <div style={{
    background:C.bgPanel,border:"1px solid rgba(26,58,110,.32)",
    borderRadius:16,padding:14,marginBottom:12,backdropFilter:"blur(8px)",
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{fontSize:22}}>{rec.divinerAvatar||"🔮"}</div>
        <div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:12.47,color:C.gold}}>{rec.diviner}</div>
          <div style={{fontSize:9.5,color:C.textFaint}}>{rec.date}{rec.time?" "+rec.time:""}</div>
        </div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:12.47,color:C.blue,fontFamily:"'Cinzel',serif"}}>NT${rec.fee}</div>
        <div style={{fontSize:11.29}}>{rec.rating?"⭐".repeat(rec.rating):""}</div>
      </div>
    </div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
      {rec.item&&<div style={{fontSize:10.69,padding:"2px 8px",borderRadius:50,background:"rgba(26,58,110,.25)",border:"1px solid rgba(26,58,110,.4)",color:C.textDim}}>{rec.item}</div>}
      {rec.duration&&<div style={{fontSize:10.69,padding:"2px 8px",borderRadius:50,background:"rgba(26,58,110,.12)",border:"1px solid rgba(26,58,110,.25)",color:C.textFaint}}>⏱ {rec.duration}</div>}
      {rec.cat&&<div style={{fontSize:10.69,padding:"2px 8px",borderRadius:50,background:C.goldFaint,border:`1px solid rgba(212,168,67,.22)`,color:C.goldDim}}>{rec.cat}</div>}
    </div>
  </div>;
}

// ── Story Modal ───────────────────────────────────────────────────────────────
