// src/utils/prompt.ts
// 解牌 prompt 工具：把一次「解讀」打包成可貼給 AI 的 prompt。
// - buildReadingPrompt(reading, opts?)：產生 prompt 字串（opts 不給就讀 localStorage 設定）
// - recordToReading(record) / buildPromptFromRecord(record)：把歷程記錄轉成 prompt
// - copyPrompt(text)：寫入剪貼簿，回傳是否成功
// - DEFAULT_TEMPLATE / TONE_OPTIONS / LENGTH_OPTIONS / AI_TARGETS / getAiUrl：設定頁與牌靈用
import { load } from "./storage";
import { SPREADS } from "../data/spreads";
import { meaningUp, meaningRev, kwUp, kwRev, hasOverride } from "./overrides";

// ── 型別（寬鬆，沿用專案 any 風格）──
export type ReadingItem = { posName?: string; posHint?: string; card: any };
export type Reading = {
  kind: "spread" | "daily";
  spreadName?: string;
  question?: string;
  items: ReadingItem[];
};

// ── 預設範本（可被使用者自訂的 prompt_template 覆蓋）──
// 佔位：{牌陣} {問題} {牌組} {語氣} {長度} {額外}
// 注意：{牌組} 一定會被保留（若被刪會自動補回）。
export const DEFAULT_TEMPLATE =
`你是一位溫暖、專業的塔羅解牌師，請用繁體中文為我解讀。

牌陣：{牌陣}
我的問題：{問題}

抽到的牌：
{牌組}

請先逐一解讀每張牌的意義，再給整體綜合解讀，最後給我一個具體可行的建議。語氣{語氣}，篇幅{長度}。
{額外}`;

// ── 旋鈕選項（給設定頁 UI 用）──
export const TONE_OPTIONS = [
  { key: "warm", label: "溫暖" },
  { key: "direct", label: "直接" },
  { key: "spiritual", label: "靈性" },
];
export const LENGTH_OPTIONS = [
  { key: "short", label: "簡短" },
  { key: "medium", label: "適中" },
  { key: "deep", label: "深入" },
];

const TONE_MAP: Record<string, string> = {
  warm: "溫暖口語", direct: "直接犀利", spiritual: "靈性深層",
};
const LENGTH_MAP: Record<string, string> = {
  short: "簡短（約 150 字）", medium: "適中（約 350 字）", deep: "深入（約 600 字）",
};

// ── 偏好 AI（給牌靈/設定頁用）──
export const AI_TARGETS: Record<string, { label: string; url: string }> = {
  chatgpt: { label: "ChatGPT", url: "https://chatgpt.com/" },
  claude: { label: "Claude", url: "https://claude.ai/new" },
  gemini: { label: "Gemini", url: "https://gemini.google.com/app" },
};
export function getAiUrl(): string {
  const k = load("ai_helper", "chatgpt");
  if (k === "custom") return load("ai_helper_url", "") || AI_TARGETS.chatgpt.url;
  return (AI_TARGETS[k] && AI_TARGETS[k].url) || AI_TARGETS.chatgpt.url;
}

// ── 把歷程記錄轉成 Reading ──
export function recordToReading(record: any): Reading {
  const spreadId = record.spreadId || record.spread_id || null;
  const spreadName = record.spreadName || record.spread_name || "";
  const question = record.question || "";
  const cards = Array.isArray(record.cards) ? record.cards : [];

  // 無 spreadId = 每日抽牌
  if (!spreadId) {
    return { kind: "daily", question, items: cards.map((c: any) => ({ card: c })) };
  }

  // 牌陣：牌位描述（hint）由 spreads.ts 還原（自由盤 free 無對應，直接用 pos 當牌位名）
  const sp = SPREADS.find((s: any) => s.id === spreadId) || null;
  const items: ReadingItem[] = cards.map((c: any) => {
    const posName = c.pos || "";
    let posHint = "";
    if (sp && Array.isArray(sp.positions)) {
      const p = sp.positions.find((pp: any) => pp.name === posName);
      if (p && p.hint) posHint = p.hint;
    }
    return { posName, posHint, card: c };
  });
  return { kind: "spread", spreadName, question, items };
}

// ── 組「牌組」資料塊 ──
function buildCardsBlock(reading: Reading, includeFullMeaning: boolean): string {
  return (reading.items || []).map((item, i) => {
    const card = item.card || {};
    const rev = !!card.reversed;
    const orient = rev ? "逆位" : "正位";
    const kws = (rev ? kwRev(card.id) : kwUp(card.id)) || [];
    const kwStr = kws.length ? `｜關鍵詞：${kws.join("、")}` : "";

    let meaningPart = "";
    if (hasOverride(card.id)) {
      const m = rev ? meaningRev(card) : meaningUp(card);
      if (m) meaningPart = `｜我的牌義：${m}`;
    } else if (includeFullMeaning) {
      const m = rev ? meaningRev(card) : meaningUp(card);
      if (m) meaningPart = `｜牌義：${m}`;
    }

    const n = i + 1;
    if (reading.kind === "spread") {
      const posName = item.posName || `位置${n}`;
      const posHint = item.posHint ? `（${item.posHint}）` : "";
      return `${n}.〈${posName}〉${posHint} ${card.name}（${orient}）${kwStr}${meaningPart}`;
    }
    return `${n}. ${card.name}（${orient}）${kwStr}${meaningPart}`;
  }).join("\n");
}

export type PromptOpts = {
  template?: string;
  tone?: string;
  length?: string;
  extra?: string;
  includeFullMeaning?: boolean;
};

// ── 主函式：產生 prompt ──
export function buildReadingPrompt(reading: Reading, opts?: PromptOpts): string {
  const o = opts || {};
  const template = (o.template ?? load("prompt_template", "")) || DEFAULT_TEMPLATE;
  const toneKey = o.tone ?? load("prompt_tone", "warm");
  const lengthKey = o.length ?? load("prompt_length", "medium");
  const extra = (o.extra ?? load("prompt_extra", "")) || "";
  const includeFullMeaning = o.includeFullMeaning ?? load("prompt_full_meaning", false);

  const tone = TONE_MAP[toneKey] || toneKey || TONE_MAP.warm;
  const length = LENGTH_MAP[lengthKey] || lengthKey || LENGTH_MAP.medium;

  let tpl = template;
  // 保證 {牌組} 一定在
  if (!tpl.includes("{牌組}")) tpl = tpl + "\n\n抽到的牌：\n{牌組}";

  // 問題：有就填，沒有就整行移除（避免留下「我的問題：」空標籤）
  const q = (reading.question || "").trim();
  if (q) tpl = tpl.replace(/\{問題\}/g, q);
  else tpl = tpl.split("\n").filter((l) => !l.includes("{問題}")).join("\n");

  const cardsBlock = buildCardsBlock(reading, includeFullMeaning);
  const spreadLabel = reading.kind === "spread" ? (reading.spreadName || "牌陣") : "每日抽牌";
  const extraText = extra && extra.trim() ? `額外要求：${extra.trim()}` : "";

  tpl = tpl
    .replace(/\{牌陣\}/g, spreadLabel)
    .replace(/\{牌組\}/g, cardsBlock)
    .replace(/\{語氣\}/g, tone)
    .replace(/\{長度\}/g, length)
    .replace(/\{額外\}/g, extraText);

  return tpl.replace(/\n{3,}/g, "\n\n").trim();
}

// 便利：直接從一筆歷程記錄產 prompt
export function buildPromptFromRecord(record: any, opts?: PromptOpts): string {
  return buildReadingPrompt(recordToReading(record), opts);
}

// ── 複製到剪貼簿（回傳是否成功；失敗由呼叫端決定備援）──
export async function copyPrompt(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* ignore */ }
  // 舊版備援
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}
