// src/lib/db.ts
// 資料存取層：把對 Supabase 4 張表的讀寫集中在這裡，頁面只呼叫這些函式。
// 全部自動帶上「目前登入者」的 user_id，搭配 RLS → 只會動到自己的資料。
// 依賴：./supabase（已建立）。0 個組件 import，整合風險低。
//
// 用法（之後 wiring 時）：
//   import * as db from "../lib/db";
//   const profile = await db.getProfile();
//   await db.updateProfile({ active_theme: "imperial" });

import { supabase } from "./supabase";

// 取目前登入者 id（讀本機 session，不打網路；訪客回 null）
async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ============================================================
// profiles（使用者偏好：主題 / 牌背 / 牌靈 / 造型 / 故事解鎖）
// ============================================================
export async function getProfile(): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// 部分更新；用 upsert 確保 row 一定在（註冊 trigger 通常已建好）
export async function updateProfile(patch: any): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id, ...patch }, { onConflict: "id" })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// daily_records（每日占卜，一天一筆）
// ============================================================
export async function getDailyRecord(date: string): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", id)
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDailyRecord(
  date: string,
  cards: any,
  deck: any
): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("daily_records")
    .upsert(
      { user_id: id, date, cards, deck },
      { onConflict: "user_id,date" }
    )
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// spread_records（牌陣占卜，多筆）
// ============================================================
export async function listSpreadRecords(): Promise<any[]> {
  const id = await uid();
  if (!id) return [];
  const { data, error } = await supabase
    .from("spread_records")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveSpread(date: string, cards: any): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("spread_records")
    .upsert({ user_id: id, date, cards }, { onConflict: "user_id,date" })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}


// ============================================================
// purchases（已購買項目）
// ============================================================
export async function listPurchases(): Promise<any[]> {
  const id = await uid();
  if (!id) return [];
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", id);
  if (error) throw error;
  return data || [];
}

export async function addPurchase(
  itemId: string,
  itemType: string,
  expiresAt: string | null = null
): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("purchases")
    .upsert(
      { user_id: id, item_id: itemId, item_type: itemType, expires_at: expiresAt },
      { onConflict: "user_id,item_id" }
    )
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}
