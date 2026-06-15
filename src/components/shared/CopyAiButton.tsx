// src/components/shared/CopyAiButton.tsx
// 共用「複製給 AI 解牌」按鈕：複製 prompt + 成功回饋 + 剪貼簿失敗備援(可選取文字) + 開啟 AI。
// reading：來自頁面即時資料或 recordToReading(歷程記錄)。
// compact：小膠囊樣式（與圓圈標籤同尺寸），給歷程卡標題列用，只顯示複製鈕。
import { useState } from "react";
import { C } from "../../data/themes";
import { buildReadingPrompt, copyPrompt, getAiUrl } from "../../utils/prompt";

export function CopyAiButton({ reading, withOpen = true, compact = false, style = {} }: any) {
  const [done, setDone] = useState(false);
  const [fallback, setFallback] = useState("");

  const has = reading && Array.isArray(reading.items) && reading.items.length > 0;
  if (!has) return null;

  const onCopy = async () => {
    const text = buildReadingPrompt(reading);
    const ok = await copyPrompt(text);
    if (ok) { setDone(true); setTimeout(() => setDone(false), 1600); }
    else { setFallback(text); }
  };
  const openAi = () => { try { window.open(getAiUrl(), "_blank"); } catch (_) {} };

  const modal = fallback ? <div onClick={() => setFallback("")} style={{
    position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,.6)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  }}>
    <div onClick={(e) => e.stopPropagation()} style={{
      width: "100%", maxWidth: 340, background: C.bgModal || C.bgPanel,
      border: `1px solid ${C.gridBorder}`, borderRadius: 16, padding: 16,
    }}>
      <div style={{ fontSize: 12, color: C.gold, marginBottom: 8, fontFamily: "'Cinzel',serif" }}>長按全選複製</div>
      <textarea readOnly value={fallback} style={{
        width: "100%", height: 200, boxSizing: "border-box", padding: 10, borderRadius: 10,
        background: C.bgPanel, border: `1px solid ${C.gridBorder}`, color: C.text,
        fontSize: 12, lineHeight: 1.5, resize: "none",
      }} />
      <button onClick={() => setFallback("")} style={{
        marginTop: 10, width: "100%", padding: "9px 0", borderRadius: 50, border: "none",
        background: C.blue, color: C.gold, cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: 12,
      }}>關閉</button>
    </div>
  </div> : null;

  if (compact) {
    return <>
      <button onClick={onCopy} style={{
        fontSize: 9.5, padding: "2px 9px", borderRadius: 50, cursor: "pointer", whiteSpace: "nowrap",
        fontFamily: "'Cinzel',serif", letterSpacing: 0.5, lineHeight: 1.6,
        border: `1px solid ${done ? C.green : C.accentDim}`,
        background: done ? C.green : C.accentFaint,
        color: done ? "#fff" : C.gold,
        transition: "background .2s",
        ...style,
      }}>{done ? "已複製 ✦" : "✦ 給 AI 解牌"}</button>
      {modal}
    </>;
  }

  return <div style={{ display: "flex", gap: 8, flexWrap: "wrap", ...style }}>
    <button onClick={onCopy} style={{
      flex: "1 1 auto", padding: "9px 14px", borderRadius: 50, cursor: "pointer",
      border: `1px solid ${C.accentDim}`,
      background: done ? C.green : `linear-gradient(135deg,${C.blue},${C.blue}cc)`,
      color: C.gold, fontFamily: "'Cinzel',serif", fontSize: 11.5, letterSpacing: 0.5,
      transition: "background .2s",
    }}>{done ? "已複製 ✦" : "✦ 複製給 AI 解牌"}</button>

    {withOpen && <button onClick={openAi} style={{
      flex: "0 0 auto", padding: "9px 14px", borderRadius: 50, cursor: "pointer",
      border: `1px solid ${C.gridBorder}`, background: "transparent",
      color: C.textDim, fontFamily: "'Cinzel',serif", fontSize: 11.5, letterSpacing: 0.5,
    }}>開啟 AI ↗</button>}

    {modal}
  </div>;
}
