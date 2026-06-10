// 模組 11 — cbBgStyle util（牌背 background style 物件產生器）
// 圖片型牌背（isImage:true）：來源可為 data: base64、/backs/xxx.jpg、或 http(s) 網址，走 backgroundImage。
// 漸層型牌背：走 background 簡寫。
// 可選參數 cb：指定要算哪一個牌背（預設用全域當前牌背 CB），讓商城/設定縮圖能渲染各自的牌背。
// 【新增圖片牌背 SOP】見 cardBacks.ts 檔頭說明。

import { CB } from "../../data/cardBacks";

export function cbBgStyle(extraStyle = {}, cb = CB) {
  const src = cb.image || cb.bg || "";
  const isImg = !!cb.isImage || /^(data:|https?:|\/)/.test(src);
  if (isImg) {
    return {
      backgroundColor: cb.bgColor || "#fff8f5",
      backgroundImage: "url(" + src + ")",
      backgroundSize: "cover",
      backgroundPosition: "center center",
      backgroundRepeat: "no-repeat",
      ...extraStyle,
    };
  }
  return { background: cb.bg, ...extraStyle };
}
