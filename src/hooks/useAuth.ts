// src/hooks/useAuth.ts
// 認證狀態 hook：監聽 Supabase 登入狀態，提供 session / loading / signOut。
// 依賴：../lib/supabase（Step 1 第一塊已建立）
// 0 個本地組件 import，整合風險極低。

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 初次載入時讀取目前 session
    supabase.auth.getSession().then(({ data }: any) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      setLoading(false);
    });

    // 持續監聽登入 / 登出事件（登入成功、登出、token 更新都會觸發）
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: any, newSession: any) => {
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  return {
    session,
    loading,
    signOut: () => supabase.auth.signOut(),
  };
}
