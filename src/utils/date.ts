// 模組 14 — Date util
// 🔴 BUG 修正（RISKS 痛點 4）：
//   原版 const todayKey=()=>new Date().toISOString().slice(0,10);
//   toISOString() 回傳「UTC 日期」，台灣為 UTC+8，導致每天 00:00–08:00 之間日期停在前一天。
//   下方一律改用「本地時區」的年/月/日組裝，跨午夜立即更新，不受時區影響。

// 將任一 Date 轉成「本地時區」的 YYYY-MM-DD
export const dateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// 今天的本地日期 key
export const todayKey = (): string => dateKey(new Date());
