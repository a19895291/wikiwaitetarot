// 模組 14 — Storage util（localStorage 讀寫，含 try/catch 防隱私模式錯誤）
// 來源：原 Wikiwaitetarot.tsx 第 717–718 行。
// ⚠️ 雲端化提示：Step 2.3 改存 Supabase 時，只需改這一個檔，全 App 自動切換。

export const load=(k:string,d:any)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch{return d;}};
export const save=(k:string,v:any)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}};
