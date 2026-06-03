// 模組 01 — useTheme Hook
// 來源：原 Wikiwaitetarot.tsx 第 600–613 行。
// 功能：從 localStorage 讀取主題 id、提供 switchTheme（原地更新全域 C 物件 + 寫 localStorage）。

import { useState } from "react";
import { THEMES, DEFAULT_THEME, C } from "../data/themes";

export function useTheme(){
  const [themeId,setThemeId]=useState(()=>{
    try{ const s=localStorage.getItem("active_theme"); return(s&&THEMES[s])?s:DEFAULT_THEME; }catch{ return DEFAULT_THEME; }
  });
  const theme=THEMES[themeId]||THEMES[DEFAULT_THEME];
  const switchTheme=(id)=>{
    if(!THEMES[id])return;
    setThemeId(id);
    Object.assign(C, THEMES[id]);
    try{ localStorage.setItem("active_theme",id); }catch{}
  };
  return {theme, themeId, switchTheme};
}

