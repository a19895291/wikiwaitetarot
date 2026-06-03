// 模組 11 — CardFace（牌正面組件，reversed 時旋轉 180deg）
import { C } from "../../data/themes";

export function CardFace({card,w=54,h=84,animClass=""}){
  return <div className={animClass} style={{
    width:w, height:h, borderRadius:10,
    background:C.bgCard,
    border:`1px solid rgba(212,168,67,.5)`,
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    position:"relative",flexShrink:0,overflow:"hidden",
    boxShadow:`0 6px 20px rgba(0,0,0,.65), 0 0 16px rgba(212,168,67,.12)`,
  }}>
    <div style={{position:"absolute",inset:4,border:"1px solid rgba(212,168,67,.15)",borderRadius:7,zIndex:1}}/>
    {card.img
      ?<img src={card.img} alt={card.name} style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",borderRadius:10,transform:card.reversed?"rotate(180deg)":"none",transition:"transform .3s"}}/>
      :<div style={{fontSize:28.51,position:"relative",zIndex:2}}>{card.emoji}</div>
    }
    {!card.img&&<div style={{fontFamily:"'Cinzel',serif",fontSize:9.5,color:C.gold,textAlign:"center",padding:"0 4px",marginTop:3,letterSpacing:.5,position:"relative",zIndex:2}}>
      {card.name}{card.reversed?" ↓":" ↑"}
    </div>}
  </div>;
}

// 金屬質感支付按鈕
