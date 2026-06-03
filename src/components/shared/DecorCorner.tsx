// 模組 11 — DecorCorner（角落 SVG 裝飾，僅 aurora/hibiscus 等有 decorCorner token 的主題顯示）
import { C } from "../../data/themes";

export function DecorCorner(){
  if(!C.decorCorner)return null;
  const url=`data:image/svg+xml;utf8,${encodeURIComponent(C.decorCorner)}`;
  const s={backgroundImage:`url("${url}")`};
  return <>
    <div className="aurora-corner aurora-corner-tl" style={s}/>
    <div className="aurora-corner aurora-corner-tr" style={s}/>
    <div className="aurora-corner aurora-corner-bl" style={s}/>
    <div className="aurora-corner aurora-corner-br" style={s}/>
  </>;
}


// ── useTheme hook ─────────────────────────────────────────────────────────────
