// 模組 14 — Date util
// 🔴 BUG 修正（RISKS 痛點 4）：
//   原版 const todayKey=()=>new Date().toISOString().slice(0,10);
//   toISOString() 回傳「UTC 日期」，台灣為 UTC+8，導致每天 00:00–08:00 之間 todayKey 仍停在前一天，
//   使用者過了午夜以為能抽新的每日牌，系統卻還算昨天；海外多語言用戶日期亦全錯。
//   下方改用「本地時區」的年/月/日組裝，跨午夜立即更新，且不受時區影響。
export const todayKey = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
