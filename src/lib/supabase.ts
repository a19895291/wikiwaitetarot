// Step 1 — Supabase client（全 app 共用的單一連線）
// URL 與 Publishable key 從 .env 讀取（見專案根目錄的 .env）。
// ⚠️ 這裡只放「前端可公開」的值（URL + publishable key，本來就會出現在瀏覽器）。
//    DB 密碼 / sb_secret_... / service_role 永遠不要放這裡或任何前端程式。
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  // 給清楚的錯誤，而不是難懂的 crash
  throw new Error(
    "[supabase] 缺少環境變數。請在專案根目錄 .env 填入 VITE_SUPABASE_URL 與 VITE_SUPABASE_PUBLISHABLE_KEY。"
  );
}

// 全 app 共用這一個 client；之後 Auth、資料庫都從這裡取用。
//   import { supabase } from "../lib/supabase";
export const supabase = createClient(url, key);
