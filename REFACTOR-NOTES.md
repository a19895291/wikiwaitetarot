# 拆檔紀錄 — Phase 0.2（第 1 刀：data / utils 層）

> 原則：**以實際 `Wikiwaitetarot.tsx` 為準**，不以舊 MD 為準。逐行 `sed` 精確搬移，未手動重打程式碼。

---

## 本次已搬移（原始碼 → 新檔）

| 新檔 | 內容 | 原始碼行數 |
|---|---|---|
| `src/data/themes.ts` | `THEMES` / `THEME_IDS` / `DEFAULT_THEME` / `getActiveTheme` / gold 向下相容欄位 / 全域可變 `C` | 6–416 |
| `src/data/deck.ts` | `MAJOR` / `MINOR` / `DECK` / `KEYWORDS` | 419–583 |
| `src/data/cardBacks.ts` | `CARD_BACKS` / `CARD_BACK_IDS` / `DEFAULT_CARD_BACK` / 全域可變 `CB` | 615–699 |
| `src/data/spirits.ts` | `SPIRITS` + `COSTUMES` | 720–944、4333–4341 |
| `src/data/diviners.ts` | `DIVINERS` / `DIVINATION_ITEMS` / `ITEM_MULTIPLIER` / `DIVINER_SCHEDULE` / `getDayStatus` / `getSlots` / `ALL_SLOTS` / `CATEGORIES` / `BOT_MSGS` | 945–1022、1168–1169 |
| `src/utils/storage.ts` | `load` / `save` | 717–718 |
| `src/utils/date.ts` | `todayKey`（**已修時區 bug，重寫**） | 716（取代） |
| `src/utils/deck.ts` | `shuffle` / `drawRandom`（`drawRandom` 改 `import { DECK }`） | 701–715 |

---

## 🔴 已修 Bug：時區（RISKS 痛點 4）

原版：
```ts
const todayKey=()=>new Date().toISOString().slice(0,10);  // 回傳 UTC 日期
```
台灣 UTC+8，每天 00:00–08:00 之間 `todayKey` 還停在前一天 → 過午夜抽不到新每日牌、海外日期全錯。

新版（`src/utils/date.ts`）改用本地時區年/月/日組裝，跨午夜即時更新。

---

## 「全域可變單例」C / CB 的處理（關鍵）

原架構：`C` / `CB` 是模組層的可變物件，App render 時用 `Object.assign(C, THEMES[id])` 原地更新，所有組件直接讀 `C.xxx`（非 props、非 context）。

拆檔後此語意**完整保留**：`C` 放在 `themes.ts`、`CB` 放在 `cardBacks.ts`，各自 `export`。ES module 是單例且物件為「原地修改」（非重新賦值），所有 `import { C }` 的檔案都會看到同一份、即時更新的物件。**行為與原本完全一致。**

> 提醒：與原版相同，改變 `C` 本身不會觸發 re-render；主題切換仍靠 App 的 `themeId` state 改變來重繪、間接讓子組件重讀 `C`。

---

## 📝 舊 MD 待修正清單（拆檔對齊真實碼後確認）

| MD | 寫的 | 實際程式碼 |
|---|---|---|
| 02 | `DEFAULT_CARD_BACK = "default"` | 實際 `"classic"` |
| 02 | 牌背 key：`default / crimsonFire / imperialGold / coralReef / hibiscusCard / monsteraCard` | 實際 `classic / silverMoon / imperialGold / coralReef / hibiscusCard / monsteraCard`（前兩個名字不符） |
| 03 / 14 | `shuffle` 先 map 再洗 | 實際先洗，**最後才** map reversed |
| 03 | 未提 `DIVINATION_ITEMS` / `ITEM_MULTIPLIER` | 實際有 6 項目 + 倍率表（已歸入 `diviners.ts`） |
| 06 / 14 | `getDayStatus` 回傳 available/busy/off | 實際 `available / blocked / full` |
| 06 | `DIVINERS` 有 `specialty:[]` 陣列、`badge` | 實際 `specialty` 是字串、**無 badge** |
| 14 | `todayKey` 用 getFullYear | 原碼用 `toISOString()`（已於本次修正為本地時區版） |
| 全部 | 行號標示 | 拆檔後改用「檔名 + 匯出名」 |

（MD 全面改寫排在全檔拆完之後，避免反覆。）

---

## 尚未驗證的事項（誠實聲明）

- 本環境**無網路**，無法 `npm install` 或 `tsc`/`vite build` 實際編譯驗證。
- 已做的檢查：逐行精確搬移、`{}`／`[]` 括號平衡、export 開頭/結尾正確、相依方向無循環（`utils/deck` → `data/deck` 單向）。
- 你在本機跑 `npm install && npm run dev` 後若有型別或匯入錯誤，貼給我即可逐一修。

---

## 拆檔進度（四刀全部完成 ✅）

- **第一刀** `data/` + `utils/`（8 檔）：themes / deck / cardBacks / spirits / diviners / storage / date(修時區) / deck(shuffle,drawRandom)
- **第二刀** `styles/` + `hooks/` + `components/`（11 檔）：globalCss / useTheme / cbBgStyle / DecorCorner / CardBack / CardFace / GoldPayBtn / Badge / CardModal / SpiritPet / BookingCalendar
- **第三刀** `pages/`（7 檔）：DailyPage / SpreadPage / OnlinePage(含 DivinationRoom+ReviewPage+FriendCard+FriendBookingBtn) / HistoryPage(含 CardChip+各 HistCard) / SpiritPage(含 StoryModal+SpiritChooseTab) / ShopPage(含 ThemePreview+SHOP 資料) / SettingsPage
- **第四刀** 組裝（3 檔）：`App.tsx` + `main.tsx` + `index.html`

## 已通過的靜態驗證

- 括號平衡（{} / []）：全部平衡
- 各檔 import 完整性：引用的每個外部名稱都有對應 import
- **跨檔 import 解析：68 條本地 import、28 個模組檔，路徑全部存在、export 名稱全部對得上，零本地錯誤**
- 多組件檔內部子組件完整性：無切頭切尾

## 仍待你在本機/StackBlitz 做的最終驗證

```
npm install
npx tsc --noEmit   # 型別檢查
npm run dev        # 啟動，看畫面能否渲染
```
（本環境無網路，無法 install/build；以上靜態檢查能擋掉絕大多數機械式搬移的錯誤，但 React 執行期行為仍需實跑確認。）

## 新增的 MD 待修清單（第三刀補充）

| MD | 寫的 | 實際程式碼 |
|---|---|---|
| 09 | 牌陣歷史 key `spread_history` | 實際 `spread_records`（HistoryPage 直接讀 localStorage） |
| 09 | 線上歷史 key `online_history` | 實際 `online_records` |
| 09 | 用 `load()` 讀取 | 實際直接 `localStorage.getItem` |
