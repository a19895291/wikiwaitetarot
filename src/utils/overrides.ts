// 模組 — 自訂牌意（覆蓋層 + 解析器 + 雲端同步）
// 本機即時快取於 localStorage("card_overrides")；登入者另同步至 Supabase(card_overrides)。
// 所有顯示牌意處改走解析器 meaningUp/meaningRev/kwUp/kwRev，有自訂回自訂、否則回預設。
import { load, save } from "./storage";
import { KEYWORDS } from "../data/deck";
import * as db from "../lib/db";

const KEY = "card_overrides";

export type Override = { up?: string; rev?: string; kwUp?: string[]; kwRev?: string[] };

export function getOverrides(): Record<string, Override> {
  return load(KEY, {}) || {};
}
export function getOverride(id: number): Override {
  return getOverrides()[id] || {};
}
export function hasOverride(id: number): boolean {
  const o = getOverride(id);
  return !!(o.up || o.rev || (o.kwUp && o.kwUp.length) || (o.kwRev && o.kwRev.length));
}

// ── 解析器：有自訂回自訂、否則回預設 ──
export function meaningUp(card: any): string {
  const o = getOverride(card?.id);
  return o.up ? o.up : (card?.up ?? "");
}
export function meaningRev(card: any): string {
  const o = getOverride(card?.id);
  return o.rev ? o.rev : (card?.rev ?? "");
}
export function kwUp(id: number): string[] {
  const o = getOverride(id);
  return (o.kwUp && o.kwUp.length) ? o.kwUp : (KEYWORDS[id]?.up || []);
}
export function kwRev(id: number): string[] {
  const o = getOverride(id);
  return (o.kwRev && o.kwRev.length) ? o.kwRev : (KEYWORDS[id]?.rev || []);
}

// ── 寫入：本機即時 + 雲端 fire-and-forget ──
export function setOverride(id: number, patch: Override): void {
  const all = getOverrides();
  all[id] = { ...(all[id] || {}), ...patch };
  save(KEY, all);
  const o = all[id];
  db.saveOverride(
    id,
    o.up ?? null,
    o.rev ?? null,
    (o.kwUp && o.kwUp.length) ? o.kwUp : null,
    (o.kwRev && o.kwRev.length) ? o.kwRev : null
  ).catch(() => {});
}

// ── 還原預設：清掉本機 + 雲端 ──
export function clearOverride(id: number): void {
  const all = getOverrides();
  delete all[id];
  save(KEY, all);
  db.deleteOverride(id).catch(() => {});
}

// ── 登入水合：雲端 → 本機合併（雲端優先）──
export async function hydrateOverridesFromCloud(): Promise<void> {
  try {
    const rows = await db.getOverrides();
    if (!rows || !rows.length) return;
    const all = getOverrides();
    for (const r of rows) {
      all[r.card_id] = {
        ...(r.up != null ? { up: r.up } : {}),
        ...(r.rev != null ? { rev: r.rev } : {}),
        ...(r.kw_up != null ? { kwUp: r.kw_up } : {}),
        ...(r.kw_rev != null ? { kwRev: r.kw_rev } : {}),
      };
    }
    save(KEY, all);
  } catch { /* 忽略雲端失敗，維持本機 */ }
}
