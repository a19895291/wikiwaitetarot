import { load } from "./storage";

// 訂閱/買斷方案 id（與 ShopPage 的 SHOP.monthly 對應）
export const PLAN_IDS = ["sub_month", "sub_year", "sub_life"];

// 是否為星曜會員：shop_bought 含任一方案即視為會員。
// （目前為前端 mock；接真 IAP 後可改為驗證訂閱收據與到期。）
export function isMember(): boolean {
  try {
    const b = load("shop_bought", []);
    return Array.isArray(b) && PLAN_IDS.some(id => b.includes(id));
  } catch {
    return false;
  }
}
