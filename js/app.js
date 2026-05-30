const rand=a=>a[Math.floor(Math.random()*a.length)];
function getPraise(s){if(s>=10)return rand(PRAISE.t4);if(s>=5)return rand(PRAISE.t3);if(s>=3)return rand(PRAISE.t2);return rand(PRAISE.t1);}
let sets={sei:true,daku:false,you:false}, scripts={hira:true,kata:false}, mode="choose", pickMode="uniform";
let autoSpeak=true, slow=false, theme="sakura", jaVoice=null;
let C=0,W=0,streak=0,best=0,miss={},lvl={},cur=null,locked=false;
const $=id=>document.getElementById(id);
const root=document.documentElement;
const SAVE="kanaSave_v2";
function save(){try{localStorage.setItem(SAVE,JSON.stringify({C,W,best,miss,lvl,sets,scripts,mode,pickMode,autoSpeak,slow,theme}));}catch(e){}}
function load(){try{const d=JSON.parse(localStorage.getItem(SAVE));if(!d)return;C=d.C||0;W=d.W||0;best=d.best||0;miss=d.miss||{};lvl=d.lvl||{};if(d.sets)sets=d.sets;if(d.scripts)scripts=d.scripts;if(d.mode)mode=d.mode;if(d.pickMode)pickMode=d.pickMode;autoSpeak=d.autoSpeak!==false;slow=!!d.slow;theme=d.theme||"sakura";}catch(e){}}
function loadVoices(){try{const vs=speechSynthesis.getVoices();jaVoice=vs.find(v=>/ja[-_]/i.test(v.lang))||vs.find(v=>/ja/i.test(v.lang))||null;}catch(e){}}
if('speechSynthesis' in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
let currentAudio=null;
function fallbackSpeak(t){if(!('speechSynthesis' in window))return false;try{speechSynthesis.resume();speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';if(jaVoice)u.voice=jaVoice;u.rate=slow?0.55:0.85;speechSynthesis.speak(u);}catch(e){return false;}return true;}
function speak(t){const src=AUDIO&&AUDIO[t];if(src){try{if(currentAudio){currentAudio.pause();currentAudio.currentTime=0;}const audio=new Audio(src);currentAudio=audio;audio.playbackRate=slow?0.82:1;const p=audio.play();if(p&&p.catch)p.catch(()=>fallbackSpeak(t));return true;}catch(e){return fallbackSpeak(t);}}return fallbackSpeak(t);}
function speakExample(){if(!cur)return false;const e=EX[cur[0]];return e?speak(e[0]):false;}
function applyTheme(){const t=THEMES[theme]||THEMES.sakura;for(const k in t){if(k!=='petal')root.style.setProperty('--'+k,t[k]);}makePetals(t.petal);}
let petalTimer=null;
function makePetals(ch){document.querySelectorAll('.petal').forEach(p=>p.remove());for(let i=0;i<14;i++){const s=document.createElement('span');s.className='petal';s.textContent=ch;s.style.left=Math.random()*100+'vw';s.style.fontSize=(13+Math.random()*16)+'px';s.style.animationDuration=(8+Math.random()*9)+'s';s.style.animationDelay=(-Math.random()*12)+'s';s.style.opacity=(0.25+Math.random()*0.35);document.body.appendChild(s);}}
function burst(n){const r=$("card").getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2;const ch=(THEMES[theme]||THEMES.sakura).petal;const ex=['✨','💕','⭐',ch];for(let i=0;i<n;i++){const s=document.createElement('span');s.className='spark';s.textContent=rand(ex);const ang=Math.random()*Math.PI*2,dist=40+Math.random()*90;s.style.left=cx+'px';s.style.top=cy+'px';s.style.setProperty('--dx',Math.cos(ang)*dist+'px');s.style.setProperty('--dy',(Math.sin(ang)*dist-20)+'px');document.body.appendChild(s);setTimeout(()=>s.remove(),900);}}
function allFor(){let a=[];const t=[];if(scripts.hira)t.push(HIRA);if(scripts.kata)t.push(KATA);for(const x of t)for(const k in sets)if(sets[k])a=a.concat(x[k]);return a;}
function getLvl(kana){const n=Number(lvl[kana]);return Number.isFinite(n)?Math.max(0,Math.min(5,n)):0;}
function setLvl(kana,next){lvl[kana]=Math.max(0,Math.min(5,next));}
function pickOne(pool){if(pickMode!=="weak")return pool[Math.floor(Math.random()*pool.length)];let total=0;const weighted=pool.map(item=>{const l=getLvl(item[0]);const w=l>=5?0.3:(5-l)+1;total+=w;return {item,w};});let r=Math.random()*total;for(const entry of weighted){r-=entry.w;if(r<=0)return entry.item;}return weighted[weighted.length-1].item;}
function graduation(pool){const total=pool.length;let done=0;for(const item of pool)if(getLvl(item[0])>=5)done++;return {done,total};}
function norm(s){return s.trim().toLowerCase();}
function accept(rom,input){const i=norm(input);if(i===rom)return true;return (ALT[rom]||[]).includes(i);}
function sample(p,ex,n){const r=[],seen=new Set([ex[1]]);let g=0;while(r.length<n&&g<300){g++;const c=p[Math.floor(Math.random()*p.length)];if(!seen.has(c[1])){seen.add(c[1]);r.push(c);}}return r;}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(){const p=allFor();$("praise").textContent="";$("praise").className="praise";if(!p.length){$("q").textContent="…";$("area").innerHTML="<div class=foot>至少选一个『考哪些』和一种假名喵</div>";return;}
  $("next").style.display="none";$("card").classList.remove("pop","glow");cur=pickOne(p);locked=false;render();if(autoSpeak)speak(cur[0]);}
function render(){const p=allFor();$("fb").textContent="";$("fb").className="fb";$("ex").innerHTML="";
  if(mode==="reverse"){$("kind").textContent="看音选假名";$("q").style.fontSize="58px";$("q").textContent=cur[1];
    const opts=shuffle([cur,...sample(p,cur,3)]);$("area").innerHTML="<div class=opts>"+opts.map(o=>`<div class=opt data-k="${o[0]}">${o[0]}</div>`).join("")+"</div>";
    [...document.querySelectorAll(".opt")].forEach(el=>el.onclick=()=>{if(locked)return;judge(el.dataset.k===cur[0],el,"k");});}
  else if(mode==="choose"){$("kind").textContent="看假名选音";$("q").style.fontSize="90px";$("q").textContent=cur[0];
    const opts=shuffle([cur,...sample(p,cur,3)]);$("area").innerHTML="<div class=opts>"+opts.map(o=>`<div class=opt data-r="${o[1]}">${o[1]}</div>`).join("")+"</div>";
    [...document.querySelectorAll(".opt")].forEach(el=>el.onclick=()=>{if(locked)return;judge(el.dataset.r===cur[1],el,"r");});}
  else{$("kind").textContent="看假名打字";$("q").style.fontSize="90px";$("q").textContent=cur[0];
    $("area").innerHTML=`<input class=ans id=inp autocomplete=off autocapitalize=off placeholder="打罗马音 回车确认"><button class=btn id=go>确认</button>`;
    const inp=$("inp");inp.focus();const submit=()=>{if(locked)return;judge(accept(cur[1],inp.value),null,"t");};
    $("go").onclick=submit;inp.onkeydown=e=>{if(e.key==="Enter")submit();};}}
function judge(ok,el,kind){locked=true;const card=$("card");
  if(ok){C++;streak++;setLvl(cur[0],getLvl(cur[0])+1);if(streak>best)best=streak;$("fb").textContent="✓ 对啦";$("fb").className="fb good";if(el)el.classList.add("good");
    const pr=$("praise");pr.textContent=getPraise(streak)+(streak>=3?"  🔥×"+streak:"");pr.className="praise show";void pr.offsetWidth;pr.className="praise show";
    card.classList.add("pop","glow");burst(Math.min(8+streak*2,26));}
  else{W++;streak=0;setLvl(cur[0],getLvl(cur[0])-2);const key=cur[0]+" "+cur[1];miss[key]=(miss[key]||0)+1;
    $("fb").textContent="✗ 正解："+(mode==="reverse"?cur[0]:cur[1]);$("fb").className="fb bad";
    const pr=$("praise");pr.textContent=rand(COMFORT);pr.className="praise show";
    if(el){el.classList.add("bad");document.querySelectorAll(".opt").forEach(o=>{if((kind==="k"&&o.dataset.k===cur[0])||(kind==="r"&&o.dataset.r===cur[1]))o.classList.add("good");});}}
  {const _e=EX[cur[0]];$("ex").innerHTML=_e?'例：<button class="ex-sound" type="button" title="听例词" aria-label="听例词">🔊</button><b>'+_e[0]+'</b> '+_e[1]+'　'+_e[2]:'';}
  upd();save();$("next").style.display="block";if(autoSpeak)speakExample();}
function upd(){$("sC").textContent=C;$("sW").textContent=W;$("sS").textContent=streak;const tot=C+W;$("sR").textContent=tot?Math.round(C/tot*100)+"%":"—";$("subline").textContent="🔥 最高连击 "+best+" · 累计 "+tot+" 题";const g=graduation(allFor());$("gradline").textContent="已掌握 "+g.done+" / 当前题库 "+g.total;
  const arr=Object.entries(miss).sort((a,b)=>b[1]-a[1]).slice(0,12);$("missed").innerHTML=arr.length?"最常错："+arr.map(([k,v])=>`<span class=miss-tag>${k.split(" ")[0]} ×${v}</span>`).join(""):"";}
function syncUI(){document.querySelectorAll("#themes .chip").forEach(c=>c.classList.toggle("on",c.dataset.t===theme));
  document.querySelectorAll("#sets .chip").forEach(c=>c.classList.toggle("on",!!sets[c.dataset.set]));
  document.querySelectorAll("#scripts .chip").forEach(c=>c.classList.toggle("on",!!scripts[c.dataset.script]));
  document.querySelectorAll("#modes .chip").forEach(c=>c.classList.toggle("on",c.dataset.mode===mode));
  document.querySelector('#voice .chip[data-v=auto]').classList.toggle("on",autoSpeak);
  document.querySelector('#voice .chip[data-v=slow]').classList.toggle("on",slow);
  document.querySelectorAll("#pickModes .chip").forEach(c=>c.classList.toggle("on",c.dataset.pick===pickMode));}
document.querySelectorAll("#themes .chip").forEach(c=>c.onclick=()=>{theme=c.dataset.t;applyTheme();syncUI();save();});
document.querySelectorAll("#sets .chip").forEach(c=>c.onclick=()=>{sets[c.dataset.set]=!sets[c.dataset.set];if(!Object.values(sets).some(Boolean))sets[c.dataset.set]=true;syncUI();save();pick();});
document.querySelectorAll("#scripts .chip").forEach(c=>c.onclick=()=>{scripts[c.dataset.script]=!scripts[c.dataset.script];if(!Object.values(scripts).some(Boolean))scripts[c.dataset.script]=true;syncUI();save();pick();});
document.querySelectorAll("#modes .chip").forEach(c=>c.onclick=()=>{mode=c.dataset.mode;syncUI();save();pick();});
document.querySelectorAll("#pickModes .chip").forEach(c=>c.onclick=()=>{pickMode=c.dataset.pick;syncUI();save();pick();});
$("spk").onclick=()=>{loadVoices();const ok=cur&&speak(cur[0]);if(ok===false){$("fb").textContent="此浏览器不支持发音，请改用 Chrome 打开";$("fb").className="fb bad";}};
$("ex").onclick=e=>{if(e.target&&e.target.closest(".ex-sound,b"))speakExample();};
document.querySelectorAll("#voice .chip").forEach(c=>c.onclick=()=>{if(c.dataset.v==="auto")autoSpeak=!autoSpeak;else slow=!slow;syncUI();save();});
$("reset").onclick=()=>{if(confirm("清空正确/错误/最常错/掌握度记录？（最高连击与设置保留）")){C=W=streak=0;miss={};lvl={};upd();save();}};
$("next").onclick=()=>pick();
document.addEventListener("keydown",e=>{if(e.target&&e.target.id==="inp")return;if((e.key==="Enter"||e.key===" ")&&$("next").style.display==="block"){e.preventDefault();pick();}});
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(reg=>reg.update()).catch(()=>{});});}
load();applyTheme();syncUI();pick();upd();