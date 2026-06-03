// 模組 11 — GoldPayBtn（統一付費/行動按鈕，class='pay-btn' 觸發 payPulse 動畫）
import { C } from "../../data/themes";

export function GoldPayBtn({onClick, disabled, children, style={}}){
  return <button onClick={onClick} disabled={disabled} className={disabled?"":"pay-btn"} style={{
    background: disabled
      ? C.bgPanel
      : `linear-gradient(135deg,${C.blue} 0%,${C.accent} 35%,${C.accent}cc 55%,${C.blue} 75%,${C.accent} 100%)`,
    backgroundSize: disabled ? "auto" : "200% auto",
    border: disabled ? `1px solid ${C.gridBorder}` : `1px solid ${C.accent}`,
    borderRadius: 50,
    padding:"11px 22px",
    fontFamily:"'Cinzel',serif",
    fontSize:13.07,
    letterSpacing:2,
    color: disabled ? C.accentFaint : C.buttonText||"#1a0e00",
    fontWeight:700,
    cursor: disabled ? "not-allowed" : "pointer",
    position:"relative",
    overflow:"hidden",
    transition:"all .2s",
    ...style
  }}>
    {!disabled && <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%)",backgroundSize:"200% auto",animation:"shimmer 2.5s linear infinite"}}/>}
    <span style={{position:"relative"}}>{children}</span>
  </button>;
}

// 促銷徽章
