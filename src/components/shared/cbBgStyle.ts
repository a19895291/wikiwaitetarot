// 模組 11 — cbBgStyle util（牌背 background style 物件產生器）
// 來源：原 Wikiwaitetarot.tsx 第 1569–1583 行。
// CB.bg 可能是 data URL（hibiscusCard/monsteraCard）或 CSS gradient，需分開處理。

import { CB } from "../../data/cardBacks";

export function cbBgStyle(extraStyle={}){
  const isImg = CB.bg && CB.bg.startsWith("data:");
  if(isImg){
    const isMCB=CB.id==="monsteraCard";
    return {
      backgroundColor:isMCB?"#f0f7f0":"#fff8f5",
      backgroundImage:"url("+CB.bg+")",
      backgroundSize:"cover",
      backgroundPosition:"center center",
      backgroundRepeat:"no-repeat",
      ...extraStyle
    };
  }
  return {background:CB.bg, ...extraStyle};
}
