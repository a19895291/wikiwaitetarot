// 模組 14 / 03 — Deck util（洗牌與隨機抽牌）
// 來源：原 Wikiwaitetarot.tsx 第 701–715 行。
// 注意：shuffle 為「先 Fisher-Yates 洗牌、最後才 map 正逆位」（與舊文件描述相反）。

import { DECK } from "../data/deck";

export const shuffle=(a:any[])=>{
  const arr=[...a];
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr.map(c=>({...c,reversed:Math.random()<0.5}));
};
// 從78張牌中完全隨機抽一張（正逆位獨立隨機）
export const drawRandom=(excludeIds:number[]=[])=>{
  const pool=DECK.filter(c=>!excludeIds.includes(c.id));
  if(!pool.length)return null;
  const base=pool[Math.floor(Math.random()*pool.length)];
  return {...base,reversed:Math.random()<0.5};
};
