// 模組 15 — ShopPage（商城四分頁）
// 同檔含 SHOP / SHOP_TABS / SHOP_THEMES 資料 + ThemePreview 子組件。
import { useState, useEffect } from "react";
import { C, THEMES } from "../data/themes";
import { CARD_BACKS, DEFAULT_CARD_BACK } from "../data/cardBacks";
import { save, load } from "../utils/storage";
import { GoldPayBtn } from "../components/shared/GoldPayBtn";
import { Badge } from "../components/shared/Badge";
import { CardBack } from "../components/shared/CardBack";
import * as db from "../lib/db";

const SHOP={
  monthly:[
    {id:"sub_month",name:"月訂閱",price:120,period:"/月",emoji:"🌙",unlock:"月光銀曜 牌背｜藍天白雲 主題",note:"隨時可取消",btn:"訂閱",hl:false,grants:["silverMoon","th_skyblue"]},
    {id:"sub_year",name:"年訂閱",price:1080,period:"/年",perMonth:"約 NT$90 / 月 · 最划算",emoji:"⭐",badge:"省 25%",unlock:"月光銀曜・帝王金箔 牌背｜藍天白雲・帝王黑金 主題",trial:"前 7 天免費，到期前可隨時取消",btn:"開始 7 天免費試用",hl:true,grants:["silverMoon","imperialGold","th_skyblue","th_imperial"]},
    {id:"sub_life",name:"永久解鎖",price:1620,period:"",emoji:"👑",badge:"免訂閱",unlock:"月光銀曜 牌背｜藍天白雲 主題",note:"一次付清 · 永久擁有，不續訂",btn:"買斷",hl:false,grants:["silverMoon","th_skyblue"]},
  ],
  tarot:[
    {id:"t1",name:"萊德韋特牌組",desc:"經典 78 張，適合初學者，含詳盡中文牌義說明",price:288,emoji:"🃏",badge:"經典"},
    {id:"t2",name:"托特塔羅",desc:"卡巴拉體系，深度神秘主義，進階占卜師首選",price:388,emoji:"✦",badge:"進階"},
    {id:"t3",name:"神諭卡牌包",desc:"42 張神諭卡，感性直覺系，每日靈感引導",price:198,emoji:"🌙",badge:null},
    {id:"t4",name:"凱爾特牌陣",desc:"解鎖高階十字牌陣佈局，感情與事業深度解析",price:128,emoji:"☯️",badge:"熱銷"},
    {id:"t5",name:"元素四色牌組",desc:"火水風土四元素重新詮釋，美學與能量兼備",price:328,emoji:"🔮",badge:"新品"},
  ],  
};
const SHOP_TABS=[["monthly","月費方案"],["tarot","塔羅牌"],["spirit","牌靈造型"],["theme","介面主題"]];

const SHOP_THEMES=[
  {id:"th_default",name:"星夜秘境",desc:"深邃星空，經典神秘配色",price:0,owned:true,themeKey:"midnight",preview:{bg:"#04060d",accent:"#d4a843",card:"#0c1630",border:"rgba(212,168,67,.45)",nav:"rgba(4,6,13,.97)"},emoji:"🌙",badge:"預設"},
  {id:"th_crimson",name:"朱砂煉獄",desc:"深紅烈焰，熔金灼灼",price:168,owned:false,themeKey:"crimson",preview:{bg:"#0d0406",accent:"#e87840",card:"#1e0808",border:"rgba(232,120,64,.45)",nav:"rgba(13,4,6,.97)"},emoji:"🔥",badge:"熱銷"},
  {id:"th_aurora",name:"晨曦花園",desc:"清透薄荷，花草圖騰，令人心曠神怡",price:148,owned:false,themeKey:"aurora",preview:{bg:"#f0f7f4",accent:"#5baa8a",card:"#ffffff",border:"rgba(91,170,138,.45)",nav:"rgba(255,255,255,.97)"},emoji:"🌿",badge:"新品"},
  {id:"th_skyblue",name:"藍天白雲",desc:"晴空碧藍，白雲圖騰，陽光心情",price:148,owned:false,themeKey:"skyblue",preview:{bg:"#e8f4fd",accent:"#3b8fd4",card:"rgba(255,255,255,.95)",border:"rgba(59,143,212,.45)",nav:"rgba(255,255,255,.97)"},emoji:"☁️",badge:"新品"},
  {id:"th_imperial",name:"帝王黑金",desc:"極黑底蘊，22K流金，奢華宮廷",price:388,owned:false,themeKey:"imperial",preview:{bg:"#080608",accent:"#c9a84c",card:"#110e00",border:"rgba(201,168,76,.65)",nav:"rgba(8,6,8,.98)"},emoji:"👑",badge:"尊選"},
  {id:"th_summer2026",name:"仲夏珊瑚礁",desc:"2026流行色｜清爽Teal青+活力桃紅",price:128,owned:false,themeKey:"summer2026",preview:{bg:"#eaf8f6",accent:"#00a896",card:"#ffffff",border:"rgba(0,168,150,.5)",nav:"rgba(255,255,255,.97)"},emoji:"🌊",badge:"2026新色"},
  {id:"th_hibiscus",name:"扶桑盛夏",desc:"熱烈扶桑花火，明亮如夏日正午",price:138,owned:false,themeKey:"hibiscus",preview:{bg:"#fff3ee",accent:"#e63c1e",card:"rgba(255,255,255,.95)",border:"rgba(230,60,30,.45)",nav:"rgba(255,252,250,.97)"},emoji:"🌺",badge:"夏季限定"},
  {id:"th_monstera",name:"龜背芋秘境",desc:"深邃熱帶叢林，龜背芋葉影婆娑，神秘生機",price:158,owned:false,themeKey:"monstera",preview:{bg:"#e8f5e9",accent:"#2e7d32",card:"rgba(255,255,255,.95)",border:"rgba(46,125,50,.45)",nav:"rgba(250,255,250,.97)"},emoji:"🌿",badge:"新品"},
];

function ThemePreview({theme,isActive,onSelect,onBuy}){
  const p=theme.preview;
  const isHibiscus=theme.themeKey==="hibiscus";
  const isMonstera=theme.themeKey==="monstera";
  const isSkyblue=theme.themeKey==="skyblue";
  const isAurora=theme.themeKey==="aurora";
  const isSummer=theme.themeKey==="summer2026";

  // 為每個主題建立精確的背景樣式（避免直接引用含單引號的超長 bgGrad 字串）
  const getBgStyle=()=>{
    if(isHibiscus){
      // 從 THEMES 取出 bgGrad，抽出 data URL 部分用 backgroundImage 設定（去除單引號）
      const grad=THEMES["hibiscus"].bgGrad||"";
      const urlMatch=grad.match(/url\(['"]?(data:[^'")]+)['"]?\)/);
      const dataUrl=urlMatch?urlMatch[1]:null;
      if(dataUrl){
        return {
          backgroundColor:"#fff3ee",
          backgroundImage:`url(${dataUrl}), linear-gradient(160deg,rgba(255,248,244,.95) 0%,rgba(255,245,240,.95) 100%)`,
          backgroundSize:"380px auto, cover",
          backgroundPosition:"center center, center center",
          backgroundRepeat:"repeat, no-repeat",
        };
      }
      return {background:"#fff3ee"};
    }
    if(isMonstera){
      const grad=THEMES["monstera"].bgGrad||"";
      const urlMatch=grad.match(/url\(['"]?(data:[^'")]+)['"]?\)/);
      const dataUrl=urlMatch?urlMatch[1]:null;
      if(dataUrl){
        const lgStart=grad.lastIndexOf("linear-gradient(");
        let gradPart="linear-gradient(160deg,rgba(232,245,233,.95),rgba(220,240,222,.95))";
        if(lgStart>=0){let depth=0,i=lgStart;for(;i<grad.length;i++){if(grad[i]==="(")depth++;else if(grad[i]===")")if(--depth===0){i++;break;}}gradPart=grad.slice(lgStart,i);}
        return {backgroundColor:"#e8f5e9",backgroundImage:`url(${dataUrl}), ${gradPart}`,backgroundSize:"380px auto, cover",backgroundPosition:"center center, center center",backgroundRepeat:"repeat, no-repeat"};
      }
      return {background:"#e8f5e9"};
    }
    if(isSkyblue) return {background:THEMES["skyblue"].bgGrad};
    if(isAurora)  return {background:THEMES["aurora"].bgGrad};
    if(isSummer)  return {background:THEMES["summer2026"].bgGrad};
    return {background:p.bg};
  };

  return <div style={{borderRadius:18,overflow:"hidden",border:isActive?`2px solid ${p.accent}`:"1px solid rgba(26,58,110,.3)",cursor:"pointer",transition:"all .3s",boxShadow:isActive?`0 0 28px ${p.accent}44, 0 4px 20px rgba(0,0,0,.5)`:"0 4px 14px rgba(0,0,0,.3)",display:"flex",flexDirection:"column"}} onClick={()=>theme.owned&&onSelect(theme)}>
    <div style={{...getBgStyle(),padding:"11px 11px 7px",position:"relative"}}>
      <div style={{background:p.nav,borderRadius:7,padding:"4px 9px",textAlign:"center",marginBottom:7,border:`1px solid ${p.border}`}}>
        <div style={{fontSize:8.91,color:p.accent,fontFamily:"'Cinzel',serif",letterSpacing:2}}>✦ MYSTIC TAROT ✦</div>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:7}}>
        {[0,1,2,3].map(i=>{
          if(isHibiscus){
            // 直接用 hibiscusCard 的 bg data URL，以 cover 方式渲染——與牌背完全一致
            const hcb=CARD_BACKS["hibiscusCard"];
            return <div key={i} style={{
              flex:1,aspectRatio:"2/3",borderRadius:5,
              backgroundColor:"#fff8f5",
              backgroundImage:`url(${hcb.bg})`,
              backgroundSize:"cover",backgroundPosition:"center center",backgroundRepeat:"no-repeat",
              border:`1px solid ${hcb.border}`,
              opacity:.78+i*.06,overflow:"hidden",position:"relative",
            }}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,.0) 0%,rgba(255,255,255,.08) 50%,rgba(255,255,255,.0) 100%)",pointerEvents:"none",zIndex:1}}/>
              <div style={{position:"absolute",inset:3,border:"1px solid rgba(210,55,25,0.45)",borderRadius:3,pointerEvents:"none",zIndex:2}}/>
              <div style={{position:"absolute",bottom:3,left:0,right:0,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:4,letterSpacing:2,color:"rgba(210,55,25,0.55)",zIndex:3}}>✿ ✦ ✿</div>
            </div>;
          }
          if(isMonstera){
            // 直接用 monsteraCard 的 bg data URL，與牌背完全一致
            const mcb=CARD_BACKS["monsteraCard"];
            return <div key={i} style={{
              flex:1,aspectRatio:"2/3",borderRadius:5,
              backgroundColor:"#0f2814",
              backgroundImage:`url(${mcb.bg})`,
              backgroundSize:"cover",backgroundPosition:"center center",backgroundRepeat:"no-repeat",
              border:"none",
              opacity:.76+i*.07,overflow:"hidden",position:"relative",
            }}>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(255,255,255,.0) 0%,rgba(129,199,132,.06) 50%,rgba(255,255,255,.0) 100%)",pointerEvents:"none",zIndex:1}}/>
              <div style={{position:"absolute",inset:3,border:"1px solid rgba(46,125,50,0.55)",borderRadius:3,pointerEvents:"none",zIndex:2}}/>
              <div style={{position:"absolute",bottom:3,left:0,right:0,textAlign:"center",fontFamily:"'Cinzel',serif",fontSize:4,letterSpacing:2,color:"rgba(76,175,80,0.7)",zIndex:3}}>✦ 🌿 ✦</div>
            </div>;
          }
          return <div key={i} style={{
            flex:1,aspectRatio:"2/3",borderRadius:5,
            background:p.card,
            border:`1px solid ${p.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:10.69,color:p.accent,
            opacity:.75+i*.07,
            overflow:"hidden",
            position:"relative",
          }}>✦</div>;
        })}
      </div>
      <div style={{background:p.nav,borderRadius:7,padding:"4px 9px",display:"flex",justifyContent:"space-around",border:`1px solid ${p.border}`}}>
        {["🌙","✦","🔮","📖"].map((e,i)=><div key={i} style={{fontSize:11.29,opacity:i===0?1:.5,filter:i===0?`drop-shadow(0 0 5px ${p.accent})`:"none"}}>{e}</div>)}
      </div>
      {isActive&&<div style={{position:"absolute",top:9,right:9,background:p.accent,borderRadius:50,fontSize:8.32,color:(isHibiscus||isMonstera)?"#fff":p.bg,padding:"2px 8px",fontFamily:"'Cinzel',serif",fontWeight:700}}>使用中</div>}
      {!theme.owned&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.32)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(1px)"}}>
        <div style={{fontSize:26}}>🔒</div>
      </div>}
    </div>
    <div style={{background:C.navBg,padding:"10px 12px",borderTop:`1px solid ${p.border}44`,display:"flex",flexDirection:"column",flex:1,justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
        <div style={{fontSize:15}}>{theme.emoji}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:p.accent,flex:1}}>{theme.name}</div>
        {theme.badge&&<Badge label={theme.badge}/>}
      </div>
      <div style={{fontSize:10.69,color:C.textFaint,lineHeight:1.6,marginBottom:7,minHeight:34}}>{theme.desc}</div>
      {theme.owned
        ?<div style={{fontSize:10.69,color:isActive?p.accent:C.textFaint,textAlign:"center",padding:"4px 0",border:`1px solid ${isActive?p.accent:"rgba(26,58,110,.3)"}`,borderRadius:50}}>{isActive?"✓ 目前使用":"點擊套用"}</div>
        :<GoldPayBtn onClick={e=>{e.stopPropagation();onBuy(theme);}} style={{width:"100%",textAlign:"center",padding:"6px 0",fontSize:9}}>NT${theme.price} 購買</GoldPayBtn>
      }
    </div>
  </div>;
}

export function ShopPage({switchTheme,cardBackId,switchCardBack,costumes,setCostumes}){
  const [tab,setTab]=useState("monthly");
  const [bought,setBought]=useState(()=>new Set(load("shop_bought",[])));
  const [confirm,setConfirm]=useState(null);
  const [themes,setThemes]=useState(()=>{const b=load("shop_bought",[]);return SHOP_THEMES.map(t=>({...t,owned:t.owned||b.includes(t.id)}));});
  const [activeTheme,setActiveTheme]=useState("th_default");
  const [cardBacks,setCardBacks]=useState(()=>{const b=load("shop_bought",[]);return Object.values(CARD_BACKS).map(cb=>({...cb,owned:cb.owned||b.includes(cb.id)}));});
  const activeCardBack=cardBackId||DEFAULT_CARD_BACK;
    useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await db.listPurchases();
        if (cancelled || !rows || !rows.length) return;
        const ids = rows.map(r => r.item_id);
        save("shop_bought", Array.from(new Set([...load("shop_bought",[]), ...ids])));
        setBought(prev => new Set([...prev, ...ids]));
        setThemes(prev => prev.map(t => ids.includes(t.id) ? { ...t, owned: true } : t));
        setCardBacks(prev => prev.map(cb => ids.includes(cb.id) ? { ...cb, owned: true } : cb));
      } catch (e) { /* 未登入或失敗就用本機狀態 */ }
    })();
    return () => { cancelled = true; };
  }, []);
  const items=SHOP[tab]||[];
  const persistBuy=(id)=>{const prev=load("shop_bought",[]);if(!prev.includes(id))save("shop_bought",[...prev,id]);db.addPurchase(id).catch(()=>{});};
  const buyTheme=t=>{
    persistBuy(t.id);
    setThemes(p=>p.map(x=>x.id===t.id?{...x,owned:true}:x));
    setBought(p=>new Set([...p,t.id]));
    setActiveTheme(t.id);
    setConfirm(null);
    // 同步套用到全域主題系統
    const themeMap={"th_default":"midnight","th_crimson":"crimson","th_aurora":"aurora","th_skyblue":"skyblue","th_imperial":"imperial","th_summer2026":"summer2026","th_hibiscus":"hibiscus","th_monstera":"monstera"};
    if(switchTheme&&themeMap[t.id])switchTheme(themeMap[t.id]);
  };

  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .5s ease"}}>
    <div style={{textAlign:"center",marginBottom:18}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>靈性商城</div>
      <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:3}}>MYSTIC SHOP</div>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"10px auto 0"}}/>
    </div>

    {/* Tab bar */}
    <div style={{display:"flex",gap:4,marginBottom:20,background:C.bgPanel,borderRadius:50,padding:"4px 12px",overflowX:"auto",border:`1px solid ${C.gridBorder}`,boxShadow:"inset 0 2px 8px rgba(0,0,0,.18)"}}>
      {SHOP_TABS.map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{flex:"0 0 auto",padding:"7px 14px",borderRadius:50,border:"none",cursor:"pointer",background:tab===id?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:"transparent",fontFamily:"'Cinzel',serif",fontSize:11.88,color:tab===id?C.gold:C.textFaint,transition:"all .25s",whiteSpace:"nowrap",boxShadow:tab===id?`0 0 14px ${C.accentFaint}`:"none"}}>{label}</button>)}
    </div>

    {/* Tarot tab — 牌背選擇 */}
    {tab==="tarot"&&<div>
      <div style={{fontSize:12.47,color:C.textDim,lineHeight:1.75,marginBottom:16,padding:"11px 14px",background:C.bgPanel,borderRadius:12,border:`1px solid ${C.gridBorder}`,backdropFilter:"blur(8px)"}}>
        選擇塔羅牌背面設計，<span style={{color:C.gold}}>購買後永久保留，可隨時切換。</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {cardBacks.map(cb=>{
          const isActive=activeCardBack===cb.id;
          const isBought=cb.owned||bought.has(cb.id);
          return <div key={cb.id} style={{
            borderRadius:18,overflow:"hidden",
            border:isActive?`2px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
            boxShadow:isActive?`0 0 20px ${C.accentFaint}, 0 4px 16px rgba(0,0,0,.15)`:"0 4px 14px rgba(0,0,0,.1)",
            background:C.bgPanel,position:"relative",
            transition:"all .3s",
          }}>
            {isActive&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${C.accent},transparent)`}}/>}
            <div style={{display:"flex",gap:16,alignItems:"center",padding:"16px"}}>
              {/* 牌背預覽 — 用真正的 CardBack，與牌堆/牌背完全一致 */}
              <div style={{flexShrink:0}}>
                <CardBack cb={cb} w={54} h={82} lifting={isActive}/>
              </div>
              {/* 文字 */}
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:C.accent}}>{cb.emoji} {cb.name}</div>
                  {cb.owned&&<Badge label="擁有"/>}
                  {!cb.owned&&cb.price===0&&<Badge label="免費"/>}
                </div>
                <div style={{fontSize:12,color:C.textDim,lineHeight:1.6,marginBottom:10}}>{cb.desc}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:18,color:C.blue,fontWeight:600}}>
                    {cb.price===0?"免費":`NT$${cb.price}`}
                  </div>
                  {isBought
                    ?<button onClick={()=>{if(switchCardBack)switchCardBack(cb.id);}} style={{
                        padding:"7px 16px",borderRadius:50,cursor:"pointer",
                        background:isActive?`linear-gradient(135deg,${C.blue},${C.accent})`:C.bgPanel,
                        border:`1px solid ${isActive?C.accent:C.gridBorder}`,
                        fontFamily:"'Cinzel',serif",fontSize:9.5,
                        color:isActive?C.buttonText||"#1a0e00":C.textDim,letterSpacing:.5,
                      }}>{isActive?"✓ 使用中":"套用"}</button>
                    :<GoldPayBtn onClick={()=>setConfirm({...cb,isCardBack:true})} style={{padding:"7px 16px",fontSize:9}}>
                        立即購買
                      </GoldPayBtn>
                  }
                </div>
              </div>
            </div>
          </div>;
        })}
      </div>
    </div>}

    {/* Theme tab */}
    {tab==="theme"&&<div>
      <div style={{fontSize:12.47,color:C.textDim,lineHeight:1.75,marginBottom:16,padding:"11px 14px",background:C.bgPanel,borderRadius:12,border:"1px solid rgba(26,58,110,.28)",backdropFilter:"blur(8px)"}}>
        購買主題套組後，整體介面配色與卡牌風格將全面更換。<span style={{color:C.gold}}>購買後永久保留，可隨時切換。</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {themes.map(t=><ThemePreview key={t.id} theme={t} isActive={activeTheme===t.id} onSelect={t=>{setActiveTheme(t.id);const themeMap={"th_default":"midnight","th_crimson":"crimson","th_aurora":"aurora","th_skyblue":"skyblue","th_imperial":"imperial","th_summer2026":"summer2026","th_hibiscus":"hibiscus","th_monstera":"monstera"};if(switchTheme&&themeMap[t.id])switchTheme(themeMap[t.id]);}} onBuy={t=>setConfirm(t)}/>)}
      </div>
    </div>}

    {/* Spirit costume tab — 從真資料 COSTUMES 渲染，與牌靈頁共用擁有狀態 */}
    {tab==="spirit"&&<div>
      <div style={{fontSize:12.47,color:C.textDim,lineHeight:1.75,marginBottom:16,padding:"11px 14px",background:C.bgPanel,borderRadius:12,border:`1px solid ${C.gridBorder}`,backdropFilter:"blur(8px)"}}>
        選擇牌靈造型，<span style={{color:C.gold}}>購買後立即套用，永久保留，牌靈頁同步顯示。</span>
      </div>
      {Object.keys(costumes||{}).flatMap(sid=>(costumes[sid]||[]).filter(c=>c.price>0)).map(c=>{
        const isOwned=c.owned||bought.has(c.id);
        return <div key={c.id} style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:18,padding:16,marginBottom:12,display:"flex",gap:13,alignItems:"center",boxShadow:"0 4px 14px rgba(0,0,0,.1)",backdropFilter:"blur(10px)"}}>
          <div style={{width:54,height:54,borderRadius:14,background:C.bgPanel,border:`1px solid ${C.gridBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30.89,flexShrink:0}}>{c.emoji}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14.85,color:C.accent}}>{c.name}</div>
              {isOwned&&<Badge label="擁有"/>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:9}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:19.01,color:C.blue,fontWeight:600}}>NT${c.price}</div>
              {isOwned
                ?<div style={{padding:"6px 14px",borderRadius:50,background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.3)",fontFamily:"'Cinzel',serif",fontSize:10.69,color:C.green}}>✓ 已購買</div>
                :<GoldPayBtn onClick={()=>setConfirm({...c,isCostume:true,desc:"購買後立即解鎖此造型，永久保留。"})} style={{padding:"7px 16px",fontSize:9}}>立即購買</GoldPayBtn>
              }
            </div>
          </div>
        </div>;
      })}
    </div>}

    {/* Other tabs */}
    {tab==="monthly"&&<>
      {/* 會員橫幅 */}
      <div style={{background:`linear-gradient(135deg,${C.purpleGlow},${C.blueGlow})`,border:`1px solid ${C.purple}4d`,borderRadius:14,padding:"12px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
        <div style={{fontSize:24}}>✦</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:15,color:C.gold,marginBottom:3}}>星曜會員</div>
          <div style={{fontSize:12,color:C.textDim,lineHeight:1.6}}>解鎖完整的占卜體驗</div>
        </div>
      </div>

      {/* 方案卡 */}
      {items.map(pl=><div key={pl.id} style={{background:C.bgPanel,border:pl.hl?`2px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,borderRadius:18,padding:16,marginBottom:12,position:"relative",overflow:"hidden",boxShadow:pl.hl?`0 0 20px ${C.accentFaint}`:"0 4px 14px rgba(0,0,0,.1)",backdropFilter:"blur(10px)"}}>
        {pl.hl&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${C.accent},transparent)`}}/>}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{fontSize:22}}>{pl.emoji}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:16,color:C.accent}}>{pl.name}</div>
          {pl.badge&&<Badge label={pl.badge}/>}
        </div>
        <div style={{display:"flex",alignItems:"baseline",gap:6}}>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:22,color:C.blue,fontWeight:700}}>NT${pl.price}</span>
          {pl.period&&<span style={{fontSize:11,color:C.textFaint}}>{pl.period}</span>}
        </div>
        {pl.perMonth&&<div style={{fontSize:11,color:C.gold,marginTop:2}}>{pl.perMonth}</div>}
        <div style={{margin:"10px 0 6px"}}>
          {["✦ 牌陣占卜全解鎖","✎ 自訂・修改牌義","👁 牌義顯示／隱藏切換","🚫 移除廣告"].map(t=><div key={t} style={{fontSize:12.5,color:C.text,padding:"3px 0"}}>{t}</div>)}
        </div>
        <div style={{fontSize:12.5,color:C.textDim,lineHeight:1.7,margin:"4px 0"}}>{pl.id==="sub_life"?"永久解鎖美術":"付費期間解鎖美術"}：{pl.unlock}</div>
        {pl.trial&&<div style={{fontSize:11,color:C.textFaint}}>{pl.trial}</div>}
        {pl.note&&<div style={{fontSize:11,color:C.textFaint}}>{pl.note}</div>}
        <div style={{marginTop:10}}>
          {bought.has(pl.id)
            ?<div style={{display:"inline-block",padding:"7px 16px",borderRadius:50,background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.3)",fontFamily:"'Cinzel',serif",fontSize:10.69,color:C.green}}>✓ {pl.id==="sub_life"?"已解鎖":"已訂閱"}</div>
            :<GoldPayBtn onClick={()=>setConfirm(pl)} style={{padding:"9px 20px",fontSize:10}}>{pl.btn}</GoldPayBtn>}
        </div>
      </div>)}

      {/* 免費層說明 */}
      <div style={{background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:14,padding:"12px 16px",marginBottom:14}}>
        <div style={{fontSize:13,color:C.text,fontWeight:500,marginBottom:6}}>免費也能玩</div>
        <div style={{fontSize:12,color:C.textDim,lineHeight:1.7}}>每天可抽 5 張每日牌、瀏覽牌庫。牌陣占卜、自訂牌義、牌義隱藏與無廣告體驗為星曜會員專屬。</div>
        <div style={{fontSize:10.5,color:C.textFaint,marginTop:6}}>免費版會顯示廣告</div>
      </div>

      {/* 恢復購買 + 條款 */}
      <button onClick={async()=>{try{const rows=await db.listPurchases();if(rows&&rows.length){const ids=rows.map(r=>r.item_id);save("shop_bought",Array.from(new Set([...load("shop_bought",[]),...ids])));setBought(pp=>new Set([...pp,...ids]));setCardBacks(pp=>pp.map(x=>ids.includes(x.id)?{...x,owned:true}:x));setThemes(pp=>pp.map(x=>ids.includes(x.id)?{...x,owned:true}:x));}}catch{}}} style={{width:"100%",padding:"11px 0",fontSize:12,color:C.textDim,background:"transparent",border:`1px solid ${C.gridBorder}`,borderRadius:50,cursor:"pointer",marginBottom:10}}>恢復購買</button>
      <div style={{fontSize:10,color:C.textFaint,lineHeight:1.7,textAlign:"center"}}>訂閱透過 App Store 帳號付款，於到期前 24 小時自動續訂；可隨時在「設定 → Apple ID → 訂閱」管理或取消。</div>
    </>}

    {tab==="tarot"&&<>
      {items.map(item=><div key={item.id} style={{
        background:C.bgPanel,
        border:item.hl?`2px solid ${C.accentDim}`:`1px solid ${C.gridBorder}`,
        borderRadius:18,padding:16,marginBottom:12,
        display:"flex",gap:13,alignItems:"center",
        boxShadow:item.hl?`0 0 20px ${C.accentFaint}, 0 4px 16px rgba(0,0,0,.15)`:"0 4px 14px rgba(0,0,0,.1)",
        backdropFilter:"blur(10px)",
        position:"relative",overflow:"hidden",
      }}>
        {item.hl&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,${C.accent},transparent)`}}/>}
        <div style={{
          width:54,height:54,borderRadius:14,
          background:C.bgPanel,
          border:`1px solid ${item.hl?C.accentDim:C.gridBorder}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:30.89,flexShrink:0,
          boxShadow:item.hl?`0 0 12px ${C.accentFaint}`:"none"
        }}>{item.emoji}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:14.85,color:C.accent}}>{item.name}</div>
            {item.badge&&<Badge label={item.badge}/>}
          </div>
          <div style={{fontSize:12.47,color:C.textDim,marginBottom:9,lineHeight:1.65,fontWeight:300}}>{item.desc}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:19.01,color:C.blue,fontWeight:600}}>
              NT${item.price}{tab==="monthly"&&<span style={{fontSize:10.69,color:C.textFaint}}> /月</span>}
            </div>
            {bought.has(item.id)
              ?<div style={{padding:"6px 14px",borderRadius:50,background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.3)",fontFamily:"'Cinzel',serif",fontSize:10.69,color:C.green}}>✓ 已購買</div>
              :<GoldPayBtn onClick={()=>setConfirm(item)} style={{padding:"7px 16px",fontSize:9}}>
                {tab==="monthly"?"訂閱方案":"立即購買"}
              </GoldPayBtn>
            }
          </div>
        </div>
      </div>)}
    </>}

    {/* Confirm modal */}
    {confirm&&<div onClick={()=>setConfirm(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(10px)"}}>
      <div onClick={e=>e.stopPropagation()} className="card-reveal-anim" style={{width:"100%",maxWidth:300,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderRadius:24,padding:28,textAlign:"center",boxShadow:`0 0 60px ${C.purpleGlow}, 0 20px 60px rgba(0,0,0,.5)`}}>
        <div style={{fontSize:54.65,marginBottom:12,filter:`drop-shadow(0 0 20px ${C.accentDim})`}}>{confirm.emoji}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:16.63,color:C.gold,marginBottom:5}}>{confirm.name}</div>
        <div style={{fontSize:21.38,color:C.blue,fontFamily:"'Cinzel',serif",marginBottom:5,fontWeight:700}}>NT${confirm.price}{confirm.period||""}</div>
        <div style={{fontSize:12.47,color:C.textFaint,marginBottom:24,lineHeight:1.75}}>{confirm.desc||confirm.unlock||""}</div>
        <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"0 auto 22px"}}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setConfirm(null)} style={{flex:1,padding:"11px 0",background:C.bgPanel,border:`1px solid ${C.gridBorder}`,borderRadius:50,fontFamily:"'Cinzel',serif",fontSize:11.88,color:C.textDim,cursor:"pointer"}}>取消</button>
          <GoldPayBtn onClick={()=>{
            if(confirm.id?.startsWith("sub_")){
              const ids=[confirm.id,...(confirm.grants||[])];
              ids.forEach(persistBuy);
              setBought(pp=>new Set([...pp,...ids]));
              setCardBacks(pp=>pp.map(x=>ids.includes(x.id)?{...x,owned:true}:x));
              setThemes(pp=>pp.map(x=>ids.includes(x.id)?{...x,owned:true}:x));
              setConfirm(null);
            }
            else if(confirm.id?.startsWith("th_")){buyTheme(confirm);}
            else if(confirm.isCardBack){
              persistBuy(confirm.id);
              setCardBacks(p=>p.map(x=>x.id===confirm.id?{...x,owned:true}:x));
              setBought(p=>new Set([...p,confirm.id]));
              if(switchCardBack)switchCardBack(confirm.id);
              setConfirm(null);
            }
                        else if(confirm.isCostume){
              persistBuy(confirm.id);
              setBought(p=>new Set([...p,confirm.id]));
              setCostumes(p=>{const m={};for(const k in p){m[k]=p[k].map(x=>x.id===confirm.id?{...x,owned:true}:x);}return m;});
              setConfirm(null);
            }
            else{persistBuy(confirm.id);setBought(p=>new Set([...p,confirm.id]));setConfirm(null);}
          }} style={{flex:1,textAlign:"center",fontSize:10}}>
            確認購買
          </GoldPayBtn>
        </div>
      </div>
    </div>}
  </div>;
}

// ── Settings Page ─────────────────────────────────────────────────────────────
