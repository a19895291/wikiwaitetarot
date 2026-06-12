// 模組 11 — CardModal（長按/點擊牌後的詳細說明 Modal）
import { C } from "../../data/themes";
import { GoldPayBtn } from "./GoldPayBtn";
import { meaningUp, meaningRev } from "../../utils/overrides";

export function CardModal({card,onClose}){
  if(!card)return null;
  const up=meaningUp(card)||card.meaning;
  const rev=meaningRev(card)||card.reverse;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(8px)",userSelect:"none",WebkitUserSelect:"none"}}>
    <div onClick={e=>e.stopPropagation()} className="card-reveal-anim" style={{
      background:C.bgModal,
      border:`1px solid ${C.accentDim}`,
      borderRadius:22,padding:28,maxWidth:320,width:"100%",
      boxShadow:`0 0 60px ${C.purpleGlow}, 0 0 30px ${C.blueGlow}`,
      userSelect:"none",WebkitUserSelect:"none"
    }}>
      <div style={{textAlign:"center",marginBottom:18}}>
        {card.img
          ?<div style={{width:100,height:160,margin:"0 auto",borderRadius:10,overflow:"hidden",border:"1px solid rgba(212,168,67,.5)",boxShadow:`0 0 30px ${C.purpleGlow}`,transform:card.reversed?"rotate(180deg)":"none",transition:"transform .4s"}}>
            <img src={card.img} alt={card.name} style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none",userSelect:"none",WebkitUserSelect:"none"}} draggable={false}/>
          </div>
          :<div style={{fontSize:66.53,filter:`drop-shadow(0 0 20px ${C.purpleGlow})`,display:"inline-block",transform:card.reversed?"rotate(180deg)":"none",transition:"transform .4s"}}>{card.emoji}</div>
        }
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,marginTop:10,letterSpacing:2}}>{card.name}</div>
        <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:4,marginTop:3}}>{card.en}</div>
        {card.reversed!==undefined&&<div style={{display:"inline-block",marginTop:6,padding:"3px 12px",borderRadius:50,background:card.reversed?"rgba(124,58,237,.2)":"rgba(212,168,67,.15)",border:card.reversed?"1px solid rgba(124,58,237,.4)":"1px solid rgba(212,168,67,.3)",fontSize:10.69,color:card.reversed?"#c084fc":C.gold,fontFamily:"'Cinzel',serif",letterSpacing:2}}>{card.reversed?"逆位":"正位"}</div>}
        <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"12px auto 0"}}/>
      </div>

      {/* 當前牌義 */}
      <div style={{background:card.reversed?C.purpleGlow.replace(',.4)',',.12)'):C.bgPanel,borderRadius:12,padding:14,marginBottom:10,border:card.reversed?`1px solid ${C.purpleGlow.replace(',.4)',',.4)')}`:(`1px solid ${C.gridBorder}`)}}> 
        <div style={{fontSize:10.69,color:card.reversed?"#c084fc":C.blue,letterSpacing:3,marginBottom:8,fontFamily:"'Cinzel',serif",display:"flex",alignItems:"center",gap:5}}>
          <span style={{color:card.reversed?"#c084fc":C.gold}}>✦</span>
          {card.reversed?"逆位牌義":"正位牌義"}
        </div>
        <div style={{fontSize:15.44,color:C.text,lineHeight:2,letterSpacing:.3,fontWeight:300}}>{card.reversed?rev:up}</div>
      </div>

      {/* 參考另一方向 */}
      <div style={{background:C.bgPanel,borderRadius:12,padding:12,marginBottom:20,border:`1px solid ${C.gridBorder}`}}>
        <div style={{fontSize:10.69,color:C.textFaint,letterSpacing:2,marginBottom:6,fontFamily:"'Cinzel',serif"}}>
          ○ {card.reversed?"正位參考":"逆位參考"}
        </div>
        <div style={{fontSize:13.07,color:C.textDim,lineHeight:1.9}}>{card.reversed?up:rev}</div>
      </div>

      <GoldPayBtn onClick={onClose} style={{width:"100%",textAlign:"center"}}>關閉</GoldPayBtn>
    </div>
  </div>;
}
