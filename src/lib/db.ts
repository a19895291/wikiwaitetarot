// src/lib/db.ts
import { supabase } from "./supabase";

async function uid(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

// ============================================================
// profiles
// ============================================================
export async function getProfile(): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(patch: any): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("profiles").upsert({ id, ...patch }, { onConflict: "id" })
    .select().maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// daily_records
// ============================================================
export async function getDailyRecord(date: string): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("daily_records").select("*").eq("user_id", id).eq("date", date).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveDailyRecord(date: string, cards: any, deck: any): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("daily_records")
    .upsert({ user_id: id, date, cards, deck }, { onConflict: "user_id,date" })
    .select().maybeSingle();
  if (error) throw error;
  return data;
}
export async function listDailyRecords(): Promise<any[]> {
  const id = await uid();
  if (!id) return [];
  const { data, error } = await supabase
    .from("daily_records").select("*").eq("user_id", id).order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============================================================
// spread_records
// ============================================================
export async function listSpreadRecords(): Promise<any[]> {
  const id = await uid();
  if (!id) return [];
  const { data, error } = await supabase
    .from("spread_records").select("*").eq("user_id", id).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveSpread(date: string, cards: any, meta: any = {}): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("spread_records")
    .upsert(
      { user_id: id, date, cards, spread_id: meta.spreadId || "free", spread_name: meta.spreadName ?? null, question: meta.question ?? null },
      { onConflict: "user_id,date,spread_id" }
    )
    .select().maybeSingle();
  if (error) { alert("[saveSpread 失敗] " + (error.code || "?") + " - " + (error.message || "")); throw error; }
  return data;
}

// ============================================================
// purchases
// ============================================================
export async function listPurchases(): Promise<any[]> {
  const id = await uid();
  if (!id) return [];
  const { data, error } = await supabase
    .from("purchases").select("*").eq("user_id", id);
  if (error) throw error;
  return data || [];
}

export async function addPurchase(itemId: string, itemType: string, expiresAt: string | null = null): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("purchases")
    .upsert({ user_id: id, item_id: itemId, item_type: itemType, expires_at: expiresAt }, { onConflict: "user_id,item_id" })
    .select().maybeSingle();
  if (error) throw error;
  return data;
}

// ============================================================
// card_overrides（使用者自訂牌意）
// ============================================================
export async function getOverrides(): Promise<any[]> {
  const id = await uid();
  if (!id) return [];
  const { data, error } = await supabase
    .from("card_overrides").select("*").eq("user_id", id);
  if (error) throw error;
  return data || [];
}

export async function saveOverride(
  cardId: number,
  up: string | null,
  rev: string | null,
  kwUp: string[] | null,
  kwRev: string[] | null
): Promise<any | null> {
  const id = await uid();
  if (!id) return null;
  const { data, error } = await supabase
    .from("card_overrides")
    .upsert(
      { user_id: id, card_id: cardId, up, rev, kw_up: kwUp, kw_rev: kwRev, updated_at: new Date().toISOString() },
      { onConflict: "user_id,card_id" }
    )
    .select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteOverride(cardId: number): Promise<void> {
  const id = await uid();
  if (!id) return;
  const { error } = await supabase
    .from("card_overrides").delete().eq("user_id", id).eq("card_id", cardId);
  if (error) throw error;
}

// ============================================================
// announcements（公布欄；公開讀取，不需登入）
// ============================================================
export async function listAnnouncements(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("announcements").select("*").eq("active", true)
      .order("published_at", { ascending: false }).limit(20);
    if (error) return [];
    return data || [];
  } catch { return []; }
}
