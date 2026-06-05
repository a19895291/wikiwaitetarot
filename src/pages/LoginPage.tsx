// src/pages/LoginPage.tsx
// 登入 / 註冊頁。Email + 密碼，含訪客模式入口。
// 依賴：../lib/supabase、../data/themes（全域主題 token C）
// 主要按鈕沿用全域 .pay-btn class（GLOBAL_CSS 內），不額外 import 組件 → 整合風險低。

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { C } from "../data/themes";

export default function LoginPage({ onGuest }: any) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  const isSignup = mode === "signup";

  const submit = async () => {
    setErr("");
    setInfo("");
    const mail = email.trim();
    if (!mail || !pw) {
      setErr("請輸入信箱與密碼");
      return;
    }
    if (pw.length < 6) {
      setErr("密碼至少需要 6 個字元");
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: mail,
          password: pw,
        });
        if (error) throw error;
        if (!data?.session) {
          // 信箱驗證開啟時，signUp 不會立即建立 session
          setInfo("註冊成功！我們已寄出一封確認信，請點擊信中連結完成驗證後再登入。");
          setMode("login");
          setPw("");
        }
        // 若驗證關閉，data.session 會存在 → App 的 useAuth 監聽器自動進入主畫面
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: mail,
          password: pw,
        });
        if (error) throw error;
        // 成功 → useAuth 監聽器接手導向主畫面
      }
    } catch (e: any) {
      const msg = (e && e.message) || "發生錯誤，請稍後再試";
      if (/invalid login credentials/i.test(msg)) setErr("信箱或密碼錯誤");
      else if (/already registered|already been registered/i.test(msg))
        setErr("此信箱已註冊過了，請直接登入");
      else if (/email not confirmed/i.test(msg))
        setErr("信箱尚未驗證，請先點擊確認信中的連結");
      else if (/rate limit|too many/i.test(msg))
        setErr("嘗試次數過多，請稍候再試");
      else setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: any) => {
    if (e.key === "Enter") submit();
  };

  const field: any = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    fontSize: 15,
    color: C.text,
    background: C.isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)",
    border: `1px solid ${C.gridBorder}`,
    borderRadius: 12,
    outline: "none",
    marginBottom: 12,
    fontFamily: "'Noto Sans TC', sans-serif",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      {/* 頂部光暈裝飾：用純 rgba 漸層，避開 base64 url() 在 inline style 的引號陷阱 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "55%",
          background: `radial-gradient(circle at 50% 0%, ${C.accentGlow}, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: 360, zIndex: 1 }}>
        {/* 品牌標題 */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 13,
              letterSpacing: "0.25em",
              color: C.accent,
              marginBottom: 8,
            }}
          >
            ✦ MYSTIC TAROT ✦
          </div>
          <div
            style={{
              fontFamily: "'Noto Sans TC', sans-serif",
              fontSize: 26,
              fontWeight: 700,
              color: C.text,
              letterSpacing: "0.05em",
            }}
          >
            星啟塔羅
          </div>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 10, lineHeight: 1.6 }}>
            每日一牌，傾聽宇宙給你的訊息
          </div>
        </div>

        {/* 卡片面板 */}
        <div
          style={{
            background: C.bgPanel,
            border: `1px solid ${C.gridBorder}`,
            borderRadius: 18,
            padding: 22,
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* 登入 / 註冊 切換 */}
          <div
            style={{
              display: "flex",
              background: C.isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
            }}
          >
            {[
              ["login", "登入"],
              ["signup", "註冊"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => {
                  setMode(key as any);
                  setErr("");
                  setInfo("");
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 9,
                  cursor: "pointer",
                  color: mode === key ? C.bg : C.textDim,
                  background: mode === key ? C.accent : "transparent",
                  transition: "all 0.2s",
                  fontFamily: "'Noto Sans TC', sans-serif",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 表單 */}
          <input
            type="email"
            name="password"
            autoComplete="current-password"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="信箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKey}
            style={field}
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="密碼（至少 6 字元）"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={onKey}
            style={field}
          />

          {err && (
            <div
              style={{
                fontSize: 13,
                color: "#ff8080",
                background: "rgba(255,80,80,0.1)",
                border: "1px solid rgba(255,80,80,0.3)",
                borderRadius: 10,
                padding: "9px 12px",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              {err}
            </div>
          )}
          {info && (
            <div
              style={{
                fontSize: 13,
                color: C.accent,
                background: C.accentFaint,
                border: `1px solid ${C.accentDim}`,
                borderRadius: 10,
                padding: "9px 12px",
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              {info}
            </div>
          )}

          <button
            className="pay-btn"
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 0",
              fontSize: 15,
              fontWeight: 700,
              color: C.bg,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
              border: "none",
              borderRadius: 12,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.6 : 1,
              fontFamily: "'Noto Sans TC', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {loading ? "處理中…" : isSignup ? "建立帳號" : "登入"}
          </button>
        </div>

        {/* 訪客模式 */}
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <button
            onClick={onGuest}
            style={{
              background: "transparent",
              border: "none",
              color: C.textDim,
              fontSize: 14,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 4,
              fontFamily: "'Noto Sans TC', sans-serif",
            }}
          >
            先以訪客身分體驗 →
          </button>
          <div style={{ fontSize: 11.5, color: C.textFaint, marginTop: 10, lineHeight: 1.6 }}>
            訪客可免費體驗每日占卜；
            <br />
            註冊後即可跨裝置同步紀錄、牌靈與購買項目。
          </div>
        </div>
      </div>
    </div>
  );
}
