// 模組 11 — Badge（小標籤組件，variant: gold/purple/green/blue）
import { C } from "../../data/themes";

export function Badge({label, variant="gold"}){
  const styles = {
    gold: {bg:"linear-gradient(135deg,#b8862a,#e8c86a)", color:C.buttonText||"#1a0e00"},
    hot: {bg:"linear-gradient(135deg,#7c1d1d,#c0392b)", color:"#fff"},
    new: {bg:"linear-gradient(135deg,#1d3a7c,#3a6ae8)", color:"#e8d8ff"},
    limited: {bg:"linear-gradient(135deg,#2d0e52,#7c3aed)", color:"#e8d8ff"},
    rec: {bg:"linear-gradient(135deg,#0e3a1c,#2ecc71)", color:"#d0fff0"},
  };
  const variantMap = {推薦:"rec",熱銷:"hot",新品:"new",限定:"limited",尊貴:"limited",基礎:"gold",經典:"gold",進階:"new",預設:"gold"};
  const s = styles[variantMap[label]||variant];
  return <div style={{
    display:"inline-flex", alignItems:"center",
    padding:"2px 8px", borderRadius:50,
    background:s.bg, color:s.color,
    fontSize:9.5, fontFamily:"'Cinzel',serif", fontWeight:700,
    letterSpacing:.5, flexShrink:0,
    boxShadow:"0 2px 8px rgba(0,0,0,.3)"
  }}>{label}</div>;
}

