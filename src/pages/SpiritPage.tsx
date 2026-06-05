// 模組 12 — SpiritPage（牌靈管理頁）
// 同檔含 StoryModal（故事章節）、SpiritChooseTab（選擇/造型）。COSTUMES 已移至 data/spirits.ts。
import { useState } from "react";
import { C } from "../data/themes";
import { SPIRITS } from "../data/spirits";
import { GoldPayBtn } from "../components/shared/GoldPayBtn";
import { save, load } from "../utils/storage";
import * as db from "../lib/db";

function StoryModal({spirit,onClose}){
  const [curChapter,setCurChapter]=useState(0);
  if(!spirit?.story)return null;
  const {subtitle,chapters}=spirit.story;
  const ch=chapters[curChapter];

  // ── 解鎖時間邏輯 ──────────────────────────────────────────────────────────
  // key: story_unlock_{spiritId}_{chapterIndex} => ISO timestamp of first unlock
  const getUnlockTime=(idx)=>{
    if(idx===0)return null; // 第一章永遠開放
    const raw=localStorage.getItem(`story_unlock_${spirit.id}_${idx}`);
    return raw?new Date(raw):null;
  };
  const isUnlocked=(idx)=>{
    if(idx===0)return true;
    const t=getUnlockTime(idx);
    if(!t)return false;
    return (Date.now()-t.getTime())>=48*60*60*1000;
  };
  const isEligible=(idx)=>{
    // 前一章已解鎖，且已選擇此牌靈
    if(idx===0)return true;
    return isUnlocked(idx-1)||idx===1; // ch2 需 ch1 解鎖（永遠滿足），ch3 需 ch2 解鎖
  };
  const startUnlock=(idx)=>{
    const key=`story_unlock_${spirit.id}_${idx}`;
    if(!localStorage.getItem(key)){
      localStorage.setItem(key,new Date().toISOString());
    }
  };
  // 選擇牌靈時自動開始計時第2章（index 1）
  if(!localStorage.getItem(`story_unlock_${spirit.id}_1`)){
    localStorage.setItem(`story_unlock_${spirit.id}_1`,new Date().toISOString());
  }
  const getCountdown=(idx)=>{
    const t=getUnlockTime(idx);
    if(!t)return null;
    const ms=48*60*60*1000-(Date.now()-t.getTime());
    if(ms<=0)return null;
    const h=Math.floor(ms/3600000);
    const m=Math.floor((ms%3600000)/60000);
    return `${h}h ${m}m`;
  };
  const handleChapterClick=(idx)=>{
    if(idx===0){setCurChapter(0);return;}
    if(isUnlocked(idx)){setCurChapter(idx);if(idx+1<chapters.length)startUnlock(idx+1);return;}
    // 尚未解鎖：不切換
  };
  return(
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:600,
      background:`${C.bg}ee`,
      backdropFilter:"blur(10px)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      animation:"fadeInUp .25s ease",
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        width:"100%",maxWidth:390,
        maxHeight:"88vh",
        background:C.bgModal,
        border:`1px solid ${spirit.color}44`,
        borderRadius:"24px 24px 0 0",
        overflow:"hidden",
        display:"flex",flexDirection:"column",
        boxShadow:`0 -8px 40px rgba(0,0,0,.6), 0 0 60px ${spirit.color}18`,
      }}>

        {/* Header */}
        <div style={{
          padding:"18px 18px 14px",
          borderBottom:`1px solid ${spirit.color}22`,
          background:`linear-gradient(135deg,${spirit.color}10,transparent)`,
          flexShrink:0,
        }}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{
                fontSize:28,lineHeight:1,
                filter:`drop-shadow(0 0 10px ${spirit.color}88)`,
                animation:"floatPet 3.5s ease-in-out infinite",
              }}>{spirit.emoji}</div>
              <div>
                <div style={{
                  fontSize:8.5,fontFamily:"'Cinzel',serif",letterSpacing:2,
                  color:`${spirit.color}88`,textTransform:"uppercase",marginBottom:2,
                }}>Spirit Story</div>
                <div style={{
                  fontFamily:"'Noto Serif TC',serif",
                  fontSize:13,fontWeight:700,letterSpacing:.8,
                  color:spirit.color,
                  textShadow:`0 0 14px ${spirit.color}55`,
                }}>{spirit.name}｜{subtitle}</div>
              </div>
            </div>
            <button onClick={onClose} style={{
              width:28,height:28,borderRadius:"50%",flexShrink:0,
              background:`${spirit.color}18`,border:`1px solid ${spirit.color}33`,
              color:spirit.color,fontSize:13,cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",
            }}>✕</button>
          </div>
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${spirit.color}55,transparent)`,marginBottom:12}}/>

          {/* Chapter tabs */}
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
            {chapters.map((c,i)=>{
              const active=i===curChapter;
              const unlocked=isUnlocked(i);
              const shortTitle=c.title.includes("｜")?c.title.split("｜")[1]:c.title;
              const locked=i>0&&!unlocked;
              const countdown=locked?getCountdown(i):null;
              return(
                <button key={i} onClick={()=>handleChapterClick(i)} style={{
                  flexShrink:0,
                  padding:"5px 11px",borderRadius:50,
                  cursor:locked?"not-allowed":"pointer",
                  background:active?`linear-gradient(135deg,${spirit.color}44,${spirit.color}22)`:locked?"rgba(0,0,0,.2)":"rgba(255,255,255,.04)",
                  border:`1px solid ${active?spirit.color+"66":locked?"rgba(255,255,255,.06)":"rgba(255,255,255,.08)"}`,
                  color:active?spirit.color:locked?C.textFaint:"rgba(205,221,245,.45)",
                  fontFamily:"'Noto Sans TC',sans-serif",
                  fontSize:10.5,letterSpacing:.3,
                  transition:"all .2s",
                  whiteSpace:"nowrap",
                  opacity:locked?.6:1,
                }}>
                  {locked
                    ?<span style={{fontSize:10}}>🔒</span>
                    :<span style={{fontSize:8.5,fontFamily:"'Cinzel',serif",marginRight:4,opacity:.7}}>第{["一","二","三"][i]}章</span>
                  }
                  {locked
                    ?<span style={{fontSize:8.5,marginLeft:3,color:C.textFaint}}>
                        {countdown?countdown:"解鎖中"}
                      </span>
                    :shortTitle
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Chapter body */}
        <div key={curChapter} style={{
          overflowY:"auto",padding:"20px 22px 36px",
          WebkitOverflowScrolling:"touch",
          animation:"fadeInUp .3s ease",
        }}>
          {isUnlocked(curChapter)
            ?<>
              {/* Chapter title */}
              <div style={{
                fontFamily:"'Noto Serif TC',serif",
                fontSize:14,fontWeight:700,color:spirit.color,
                letterSpacing:.8,marginBottom:16,lineHeight:1.6,
                textShadow:`0 0 12px ${spirit.color}44`,
              }}>{ch.title}</div>
              <div style={{height:1,background:`linear-gradient(90deg,${spirit.color}44,transparent)`,marginBottom:16}}/>
              <div style={{fontSize:44,lineHeight:.8,color:`${spirit.color}1a`,fontFamily:"Georgia,serif",marginBottom:6,userSelect:"none"}}>❝</div>
              {ch.paragraphs.map((p,i)=>(
                <p key={i} style={{
                  fontSize:13.5,color:C.text,
                  lineHeight:2,letterSpacing:.35,
                  marginBottom:i<ch.paragraphs.length-1?14:0,
                  textIndent:"1.5em",
                  animation:`fadeInUp .35s ease ${i*.06}s both`,
                }}>{p}</p>
              ))}
              <div style={{fontSize:44,lineHeight:.8,color:`${spirit.color}1a`,fontFamily:"Georgia,serif",textAlign:"right",marginTop:10,userSelect:"none"}}>❞</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,paddingTop:14,borderTop:`1px solid ${spirit.color}18`}}>
                <button onClick={()=>handleChapterClick(Math.max(0,curChapter-1))} style={{padding:"7px 14px",borderRadius:50,cursor:curChapter>0?"pointer":"default",opacity:curChapter>0?1:.25,background:"rgba(255,255,255,.04)",border:`1px solid ${spirit.color}33`,color:spirit.color,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:.5}}>← 上一章</button>
                <div style={{fontSize:9,color:`${spirit.color}66`,fontFamily:"'Cinzel',serif",letterSpacing:1}}>{curChapter+1} / {chapters.length}</div>
                <button onClick={()=>{const n=Math.min(chapters.length-1,curChapter+1);handleChapterClick(n);}} style={{padding:"7px 14px",borderRadius:50,cursor:curChapter<chapters.length-1&&isUnlocked(curChapter+1)?"pointer":"default",opacity:curChapter<chapters.length-1&&isUnlocked(curChapter+1)?1:.25,background:"rgba(255,255,255,.04)",border:`1px solid ${spirit.color}33`,color:spirit.color,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:.5}}>下一章 →</button>
              </div>
              <div style={{textAlign:"center",marginTop:18,fontFamily:"'jf-openfont-粉圓','jf open 粉圓',sans-serif",fontSize:11,color:`${spirit.color}55`,letterSpacing:3}}>— {spirit.trueName} —</div>
            </>
            :<div style={{
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
              padding:"48px 24px",textAlign:"center",gap:16,
            }}>
              <div style={{fontSize:40,filter:`drop-shadow(0 0 16px ${spirit.color}44)`,animation:"floatPet 3s ease-in-out infinite"}}>🔒</div>
              <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:14,color:spirit.color,letterSpacing:1}}>{ch.title}</div>
              <div style={{height:1,width:60,background:`linear-gradient(90deg,transparent,${spirit.color}55,transparent)`}}/>
              <div style={{fontSize:11.5,color:C.textDim,lineHeight:1.9,letterSpacing:.3}}>
                此章節仍在封印中。<br/>
                {getCountdown(curChapter)
                  ?<>解鎖倒數：<span style={{color:spirit.color,fontFamily:"'Cinzel',serif",fontSize:13}}>{getCountdown(curChapter)}</span></>
                  :"計時中，請稍候…"
                }
              </div>
              <div style={{fontSize:10,color:C.textFaint,letterSpacing:.5,marginTop:4}}>選擇牌靈後每 48 小時解鎖一章</div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

// ── Spirit Choose Tab ────────────────────────────────────────────────────────
function SpiritChooseTab({spirits,spirit,onSelect,costumes,activeC}){
  const [expanded,setExpanded]=useState(spirit?.id||null);
  const [storySpirit,setStorySpirit]=useState(null);

  const handleSelect=(s)=>{
    onSelect(s);
    setExpanded(s.id);
  };

  return <div>
    {spirits.map(s=>{
      const sMine=costumes[s.id]||[];
      const sCurId=activeC[s.id]||sMine[0]?.id;
      const sIsNone=sCurId==="none";
      const sCurC=sIsNone?null:(sMine.find(c=>c.id===sCurId)||sMine[0]);
      const sEmoji=sIsNone?s.emoji:(sCurC?.emoji||s.emoji);
      const isSelected=spirit?.id===s.id;
      const isExpanded=expanded===s.id;

      return <div key={s.id} style={{
        background:isSelected?`linear-gradient(160deg,${C.blue}44,${C.bgPanel})`:C.bgPanel,
        border:isSelected?`2px solid ${s.color}`:`1px solid ${C.gridBorder}`,
        borderRadius:18,marginBottom:12,overflow:"hidden",
        transition:"all .35s",
        backdropFilter:"blur(10px)",
        boxShadow:isSelected?`0 0 28px ${s.color}33, 0 4px 20px rgba(0,0,0,.3)`:"0 4px 14px rgba(0,0,0,.2)",
      }}>
        {/* Card header row */}
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",cursor:"pointer"}}
          onClick={()=>{handleSelect(s);setExpanded(isExpanded&&isSelected?null:s.id);}}>
          <div style={{
            fontSize:26,lineHeight:1,flexShrink:0,
            width:36,height:36,
            display:"flex",alignItems:"center",justifyContent:"center",
            filter:`drop-shadow(0 0 8px ${s.color}88)`,
            animation:isSelected?"floatPet 3.5s ease-in-out infinite":"none",
            transition:"all .4s cubic-bezier(.34,1.56,.64,1)",
          }}>{sEmoji}</div>
          <div style={{flex:1,minWidth:0}}>
            {/* True name + spirit name tag row */}
            <div style={{display:"flex",alignItems:"baseline",gap:7,marginBottom:2,flexWrap:"wrap"}}>
              <div style={{
                fontFamily:"'jf-openfont-粉圓','jf open 粉圓',sans-serif",
                fontSize:19,fontWeight:400,letterSpacing:2,
                color:isSelected?s.color:C.accent,
                textShadow:isSelected?`0 0 14px ${s.color}55`:"none",
                transition:"all .3s",lineHeight:1.2,
              }}>{s.trueName}</div>
              <div style={{
                fontSize:9.5,color:isSelected?`${s.color}d9`:C.accentFaint,
                fontFamily:"'Noto Sans TC',sans-serif",
                letterSpacing:.5,whiteSpace:"nowrap",lineHeight:1,
              }}>{s.name}</div>
            </div>
            {/* English true name */}
            <div style={{
              fontFamily:"'Cormorant Garamond',Georgia,serif",
              fontStyle:"italic",fontSize:16,fontWeight:700,
              color:isSelected?`${s.color}dc`:C.accentDim,
              letterSpacing:1.5,marginBottom:5,lineHeight:1,
            }}>{s.trueNameEn}</div>
            {/* Symbol quote — always visible */}
            {s.nameGuard&&<div style={{
              fontSize:14,color:C.accentDim,
              lineHeight:1.6,letterSpacing:.2,fontStyle:"italic",
            }}>{s.nameGuard}</div>}
          </div>
          <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {isSelected&&<div style={{fontSize:8.91,color:s.color,fontFamily:"'Cinzel',serif",letterSpacing:.5,whiteSpace:"nowrap"}}>當前牌靈</div>}
            <div style={{
              width:22,height:22,borderRadius:"50%",
              border:`1px solid ${s.color}55`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10,color:s.color,
              background:isExpanded?`${s.color}22`:"transparent",
              transition:"all .3s",
            }}>{isExpanded?"▲":"▼"}</div>
          </div>
        </div>

        {/* Expanded section */}
        {isExpanded&&<div style={{
          padding:"0 16px 16px",
          animation:"fadeInUp .3s ease",
        }}>
          {/* Divider */}
          <div style={{height:1,background:`linear-gradient(90deg,transparent,${s.color}55,transparent)`,marginBottom:14}}/>

          {/* Name meanings + Symbol quote block (merged) */}
          {(s.nameMeaning||s.nameSymbol)&&<div style={{
            background:C.bgPanel,
            border:`1px solid ${s.color}22`,
            borderRadius:12,padding:"11px 14px",marginBottom:10,
          }}>
            {s.nameMeaning&&s.nameMeaning.map((m,i)=>{
              const [term,...rest]=m.split("：");
              const def=rest.join("：");
              return <div key={i} style={{
                display:"flex",alignItems:"flex-start",gap:8,
                marginBottom:i<s.nameMeaning.length-1?7:0,
              }}>
                <div style={{
                  flexShrink:0,marginTop:1,
                  fontSize:9.5,fontFamily:"'Cinzel',serif",
                  color:s.color,letterSpacing:.5,
                  background:`${s.color}18`,border:`1px solid ${s.color}33`,
                  borderRadius:5,padding:"1px 7px",lineHeight:1.7,
                  whiteSpace:"nowrap",
                }}>{term}</div>
                <div style={{
                  fontSize:11,color:C.textDim,
                  lineHeight:1.75,letterSpacing:.2,
                }}>{def}</div>
              </div>;
            })}
            {s.nameSymbol&&<div style={{
              marginTop:s.nameMeaning?10:0,
              paddingTop:s.nameMeaning?10:0,
              borderTop:s.nameMeaning?`1px solid ${s.color}18`:"none",
              fontSize:11,color:C.textDim,
              lineHeight:1.8,letterSpacing:.2,fontStyle:"italic",
            }}>
              <span style={{color:`${s.color}bb`,marginRight:4}}>「</span>
              {s.nameSymbol}
              <span style={{color:`${s.color}bb`,marginLeft:4}}>」</span>
            </div>}
          </div>}

          {/* Soul voice block */}
          {s.soulVoice&&<div style={{
            padding:"12px 14px",marginBottom:10,
            background:`linear-gradient(135deg,${s.color}0a,${C.bgPanel})`,
            border:`1px solid ${s.color}30`,
            borderRadius:12,
            position:"relative",
            overflow:"hidden",
          }}>
            <div style={{
              position:"absolute",top:8,left:10,
              fontSize:28,lineHeight:1,
              color:`${s.color}18`,fontFamily:"Georgia,serif",
              pointerEvents:"none",userSelect:"none",
            }}>❝</div>
            <div style={{
              fontSize:11.5,color:C.text,
              lineHeight:1.9,letterSpacing:.3,
              paddingLeft:18,paddingRight:4,
              position:"relative",
            }}>{s.soulVoice}</div>
          </div>}

          {/* Story button + Tip badge row */}
          <div style={{display:"flex",gap:8,alignItems:"stretch"}}>
            {s.story&&<button onClick={e=>{e.stopPropagation();setStorySpirit(s);}} style={{
              flexShrink:0,
              padding:"8px 11px",
              background:`linear-gradient(135deg,${s.color}14,${s.color}08)`,
              border:`1px solid ${s.color}44`,
              borderRadius:12,cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
              transition:"all .2s cubic-bezier(.34,1.56,.64,1)",
              minWidth:46,
            }}
              onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${s.color}28,${s.color}14)`;e.currentTarget.style.transform="scale(1.04)";}}
              onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${s.color}14,${s.color}08)`;e.currentTarget.style.transform="scale(1)";}}
            >
              <span style={{fontSize:15}}>📖</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:8.5,color:s.color,letterSpacing:1,whiteSpace:"nowrap"}}>故事</span>
            </button>}
            <div style={{
              flex:1,display:"flex",alignItems:"flex-start",gap:9,
              padding:"10px 14px",
              background:C.isLight?`${s.color}08`:(`${s.color}10`),border:`1px solid ${s.color}30`,
              borderRadius:12,
            }}>
              <span style={{fontSize:13,flexShrink:0,marginTop:1,color:s.color}}>✦</span>
              <div style={{fontSize:11,color:s.color,lineHeight:1.8,letterSpacing:.2}}>{s.tips[0]}</div>
            </div>
          </div>
        </div>}
      </div>;
    })}
    {storySpirit&&<StoryModal spirit={storySpirit} onClose={()=>setStorySpirit(null)}/>}
  </div>;
}


export function SpiritPage({spirit,onSelect,costumes,setCostumes,activeC,setActiveC,themeId,switchTheme}){
  const [tab,setTab]=useState("choose");
  const [buyC,setBuyC]=useState(null);
  const mine=costumes[spirit?.id]||[];
  const curId=activeC[spirit?.id]||mine[0]?.id;
  const isNoCostume=curId==="none";
  const curC=isNoCostume?{id:"none",name:"無造型",emoji:spirit?.emoji}:(mine.find(c=>c.id===curId)||mine[0]);

  return <div style={{padding:"16px 16px 100px",animation:"fadeInUp .5s ease"}}>
    <div style={{textAlign:"center",marginBottom:18}}>
      <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:21.38,color:C.gold,letterSpacing:3}}>牌靈夥伴</div>
      <div style={{fontSize:10.69,color:C.goldDim,letterSpacing:3}}>SPIRIT COMPANION</div>
      <div style={{width:60,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"10px auto 0"}}/>
    </div>

    <div style={{display:"flex",gap:8,marginBottom:18}}>
      {[["choose","選擇牌靈"],["costume","造型"]].map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 0",borderRadius:50,cursor:"pointer",background:tab===id?`linear-gradient(135deg,${C.blue},${C.blue}cc)`:C.bgPanel,border:`1px solid ${tab===id?C.accentDim:C.gridBorder}`,fontFamily:"'Cinzel',serif",fontSize:11.88,color:tab===id?C.gold:C.textDim,boxShadow:tab===id?`0 0 14px ${C.accentFaint}`:"none"}}>{label}</button>)}
    </div>

    {tab==="choose"&&<SpiritChooseTab spirits={SPIRITS} spirit={spirit} onSelect={onSelect} costumes={costumes} activeC={activeC}/>}


    {tab==="costume"&&<div>
      <div style={{
        background:C.bgPanel,border:`1px solid ${spirit?.color}44`,
        borderRadius:18,padding:20,marginBottom:16,textAlign:"center",
        backdropFilter:"blur(12px)",
        boxShadow:`0 4px 24px rgba(0,0,0,.4), 0 0 30px ${spirit?.color}22`,
        position:"relative",overflow:"hidden",
      }}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${spirit?.color}66,transparent)`}}/>
        <div style={{fontSize:66.53,marginBottom:9,filter:`drop-shadow(0 0 20px ${spirit?.color}88)`,animation:"floatPet 3.5s ease-in-out infinite",transition:"all .4s cubic-bezier(.34,1.56,.64,1)"}}>{curC?.emoji||spirit?.emoji}</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:15.44,color:C.gold}}>{spirit?.name}</div>
        <div style={{fontSize:11.88,color:C.goldDim,marginTop:4}}>✦ {curC?.name}</div>
        <div style={{marginTop:8,display:"inline-flex",alignItems:"center",gap:5,padding:"3px 12px",borderRadius:50,background:`${spirit?.color}18`,border:`1px solid ${spirit?.color}44`,fontSize:9.5,color:spirit?.color,fontFamily:"'Cinzel',serif",letterSpacing:1}}>
          <span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:spirit?.color,animation:"starTwinkle 1.5s ease-in-out infinite"}}/>
          已同步至懸浮牌靈
        </div>
      </div>
      <div style={{fontSize:13.07,color:C.goldDim,fontFamily:"'Cinzel',serif",letterSpacing:2,marginBottom:10}}>✦ 可用造型</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:16}}>
        {/* 無造型 tile */}
        {(()=>{
          const isActive=curId==="none";
          return <div onClick={()=>{if(!isActive)setActiveC(p=>({...p,[spirit.id]:"none"}));}} style={{borderRadius:14,padding:"12px 6px",textAlign:"center",cursor:isActive?"default":"pointer",background:isActive?C.bgModal:C.bgPanel,border:isActive?`2px solid ${spirit?.color}`:`1px solid ${C.gridBorder}`,position:"relative",transition:"all .3s cubic-bezier(.34,1.56,.64,1)",backdropFilter:"blur(8px)",boxShadow:isActive?`0 0 18px ${spirit?.color}44`:"none",transform:isActive?"scale(1.04)":"scale(1)"}}>
            <div style={{fontSize:33.26,marginBottom:4,transition:"transform .3s cubic-bezier(.34,1.56,.64,1)",transform:isActive?"scale(1.12)":"scale(1)",filter:isActive?`drop-shadow(0 0 8px ${spirit?.color}88)`:"grayscale(0.3) opacity(0.7)"}}>{spirit?.emoji}</div>
            <div style={{fontSize:9.5,fontFamily:"'Cinzel',serif",color:isActive?spirit?.color:C.textDim,lineHeight:1.35}}>無造型</div>
            {isActive&&<div style={{fontSize:8.91,color:spirit?.color,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
              <span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:spirit?.color,animation:"starTwinkle 1.2s ease-in-out infinite"}}/>
              使用中
            </div>}
          </div>;
        })()}
        {mine.map(c=>{
          const isActive=c.id===curId;
          return <div key={c.id} onClick={()=>{if(c.owned&&!isActive){setActiveC(p=>({...p,[spirit.id]:c.id}));}}} style={{borderRadius:14,padding:"12px 6px",textAlign:"center",cursor:c.owned&&!isActive?"pointer":"default",background:isActive?C.bgModal:C.bgPanel,border:isActive?`2px solid ${spirit?.color}`:`1px solid ${C.gridBorder}`,opacity:c.owned?1:.55,position:"relative",transition:"all .3s cubic-bezier(.34,1.56,.64,1)",backdropFilter:"blur(8px)",boxShadow:isActive?`0 0 18px ${spirit?.color}44`:"none",transform:isActive?"scale(1.04)":"scale(1)"}}>
            {!c.owned&&<div style={{position:"absolute",top:5,right:5,fontSize:10.69,color:C.gold}}>🔒</div>}
            <div style={{fontSize:33.26,marginBottom:4,transition:"transform .3s cubic-bezier(.34,1.56,.64,1)",transform:isActive?"scale(1.12)":"scale(1)"}}>{c.emoji}</div>
            <div style={{fontSize:9.5,fontFamily:"'Cinzel',serif",color:isActive?spirit?.color:C.textDim,lineHeight:1.35}}>{c.name}</div>
            {!c.owned&&<div style={{fontSize:9.5,color:C.gold,marginTop:4}}>NT${c.price}</div>}
            {isActive&&<div style={{fontSize:8.91,color:spirit?.color,marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
              <span style={{display:"inline-block",width:5,height:5,borderRadius:"50%",background:spirit?.color,animation:"starTwinkle 1.2s ease-in-out infinite"}}/>
              使用中
            </div>}
          </div>;
        })}
      </div>
      {mine.some(c=>!c.owned)&&mine.filter(c=>!c.owned).map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:C.bgPanel,border:"1px solid rgba(26,58,110,.32)",borderRadius:14,marginBottom:8,backdropFilter:"blur(8px)"}}>
        <div style={{fontSize:28}}>{c.emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:13.07,color:C.gold,marginBottom:2}}>{c.name}</div>
          <div style={{fontSize:11.88,color:C.goldDim}}>NT${c.price}</div>
        </div>
        <GoldPayBtn onClick={()=>setBuyC(c)} style={{padding:"7px 14px",fontSize:9}}>購買</GoldPayBtn>
      </div>)}
    </div>}

    {/* Buy costume confirm */}
    {buyC&&<div onClick={()=>setBuyC(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} className="card-reveal-anim" style={{width:"100%",maxWidth:290,background:C.bgModal,border:`1px solid ${C.accentDim}`,borderRadius:22,padding:26,textAlign:"center"}}>
        <div style={{fontSize:57.02,marginBottom:10,filter:`drop-shadow(0 0 16px ${spirit?.color}66)`}}>{buyC.emoji}</div>
        <div style={{fontFamily:"'Cinzel Decorative',serif",fontSize:15.44,color:C.gold,marginBottom:6}}>{buyC.name}</div>
        <div style={{fontSize:20.2,color:C.blue,fontFamily:"'Cinzel',serif",marginBottom:4}}>NT${buyC.price}</div>
        <div style={{fontSize:12.47,color:C.textFaint,marginBottom:22,lineHeight:1.7}}>購買後立即解鎖，永久保留</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setBuyC(null)} style={{flex:1,padding:"10px 0",background:"rgba(26,58,110,.2)",border:"1px solid rgba(26,58,110,.38)",borderRadius:50,fontFamily:"'Cinzel',serif",fontSize:11.88,color:C.textDim,cursor:"pointer"}}>取消</button>
          <GoldPayBtn onClick={()=>{setCostumes(p=>({...p,[spirit.id]:p[spirit.id].map(x=>x.id===buyC.id?{...x,owned:true}:x)}));setBuyC(null);}} style={{flex:1,padding:"10px 0",textAlign:"center",fontSize:10}}>確認購買</GoldPayBtn>
        </div>
      </div>
    </div>}
  </div>;
}

// ── Shop Page ─────────────────────────────────────────────────────────────────
