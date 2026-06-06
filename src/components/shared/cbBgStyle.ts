// 模組 11 — cbBgStyle util（牌背 background style 物件產生器）
// 圖片型牌背（isImage:true）：來源可為 data: base64、/backs/xxx.jpg、或 http(s) 網址，走 backgroundImage。
// 漸層型牌背：走 background 簡寫。
// 【新增圖片牌背 SOP】見 cardBacks.ts 檔頭說明。

import { CB } from "../../data/cardBacks";

export function cbBgStyle(extraStyle = {}) {
  const src = CB.image || CB.bg || "";
  const isImg = !!CB.isImage || /^(data:|https?:|\/)/.test(src);
  if (isImg) {
    return {
      backgroundColor: CB.bgColor || "#fff8f5",
      backgroundImage: "url(" + src + ")",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      ...extraStyle,
    };
  }
  return { background: CB.bg, ...extraStyle };
}
