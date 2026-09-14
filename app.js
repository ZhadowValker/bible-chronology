const DATA=window.CHRONICLES_DATA;
const $=id=>document.getElementById(id);
let mode="tiles", activeRecord=null, lastFocused=null;
const periods=[...new Set(DATA.map(r=>r.Period))];
const popularPeriods=periods.slice(0,10);

function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function sources(r){return (r.Source||"").split(" | ").map(s=>s.trim()).filter(Boolean)}
function firstSource(r){return sources(r)[0]||""}
function book(r){let m=r.Reference.match(/^((?:[1-3] )?[A-Za-z ]+?)(?= \d)/);return m?m[1].trim():""}

periods.forEach(p=>{const o=document.createElement("option");o.value=p;o.textContent=p;$("period").appendChild(o)});
popularPeriods.forEach(p=>{const b=document.createElement("button");b.type="button";b.className="chip";b.dataset.period=p;b.textContent=p;$("filterRow").appendChild(b)});

function getData(){
 const q=$("search").value.trim().toLowerCase(), p=$("period").value, s=$("sort").value;
 let a=DATA.filter(r=>(!p||r.Period===p)&&(!q||Object.values(r).join(" ").toLowerCase().includes(q)));
 if(s==="part") a.sort((a,b)=>Number(a.Part)-Number(b.Part)||Number(a["#"])-Number(b["#"]));
 else if(s==="title") a.sort((a,b)=>a["Part-Title"].localeCompare(b["Part-Title"])||Number(a.Part)-Number(b.Part)||Number(a["#"])-Number(b["#"]));
 else if(s==="book") a.sort((a,b)=>book(a).localeCompare(book(b))||Number(a["#"])-Number(b["#"]));
 else a.sort((a,b)=>Number(a["#"])-Number(b["#"]));
 return a;
}

function card(r){
 return `<article class="card" data-id="${esc(r["#"])}" tabindex="0" role="button" aria-label="Open ${esc(r.Event)}">
  <div class="card-top"><span class="badge">${esc(r.Period)} · Part ${esc(r.Part)}</span><span class="number">#${esc(r["#"])}</span></div>
  <h2>${esc(r["Part-Title"])}</h2><p class="event">${esc(r.Event)}</p>
  <div class="card-bottom"><span class="ref">${esc(r.Reference)}</span><span class="open-hint">Read source <span>↗</span></span></div>
 </article>`;
}
function row(r){
 return `<div class="row" data-id="${esc(r["#"])}" tabindex="0" role="button" aria-label="Open ${esc(r.Event)}">
  <span class="row-no">#${esc(r["#"])}</span><span class="row-period">${esc(r.Period)}<br><span class="muted">Part ${esc(r.Part)}</span></span>
  <span class="row-event">${esc(r.Event)}<span class="row-title">${esc(r["Part-Title"])}</span></span><span class="ref row-ref">${esc(r.Reference)}</span><span class="row-arrow">↗</span>
 </div>`;
}

function updateChips(){
 document.querySelectorAll(".chip").forEach(b=>b.classList.toggle("active",b.dataset.period===$("period").value));
}
function render(){
 const a=getData(), query=$("search").value.trim(), selected=$("period").value;
 $("count").textContent=`Showing ${a.length.toLocaleString()} of ${DATA.length.toLocaleString()} events${query?` matching “${query}”`:""}`;
 $("grid").innerHTML=a.map(card).join("");$("list").innerHTML=a.map(row).join("");
 $("grid").style.display=mode==="tiles"?"grid":"none";$("list").style.display=mode==="list"?"flex":"none";$("empty").style.display=a.length?"none":"block";
 updateChips();
 document.querySelectorAll(".card,.row").forEach(el=>{el.addEventListener("click",()=>openSource(DATA.find(x=>x["#"]===el.dataset.id)));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openSource(DATA.find(x=>x["#"]===el.dataset.id))}})});
}

function openSource(r){
 if(!r)return;
 activeRecord=r;
 lastFocused=document.activeElement;
 $("modalTitle").textContent=`${r.Reference} — ${r.Event}`;
 
 // Build list of Bible sources for this reference
 const ref = r.Reference.trim();
 const book = ref.split(' ')[0];
 const sourceList = [
   { name: 'Telugu (BSI)', url: `https://www.sajeevavahini.com/bible/telugu-bible-bsi/${book.toLowerCase()}/` },
   { name: 'KJV (BibleHub)', url: `https://biblehub.com/${book.lower()}/` },
   { name: 'NIV (Bible.com)', url: `https://www.bible.com/search?q=${encodeURIComponent(ref)}` },
   { name: 'ESV (BibleHub)', url: `https://biblehub.com/esv/${book.toLowerCase()}/` }
 ];
 
 const container = $("sourceEmpty");
 container.innerHTML = '<div class="sources-list"><p style="margin-top:0; color:#666; font-size:0.9em;">Choose a Bible source:</p></div>';
 const list = container.querySelector('.sources-list');
 
 sourceList.forEach((src, i) => {
   const btn = document.createElement('a');
   btn.href = src.url;
   btn.target = '_blank';
   btn.rel = 'noopener';
   btn.className = 'source-option';
   btn.textContent = src.name;
   btn.style.cssText = 'display:block; padding:12px 16px; margin:8px 0; background:#f0f0f0; border-radius:4px; color:#333; text-decoration:none; border:1px solid #ddd; transition:all 0.2s; cursor:pointer;';
   btn.onmouseover = () => btn.style.background = '#e0e0e0';
   btn.onmouseout = () => btn.style.background = '#f0f0f0';
   list.appendChild(btn);
 });
 
 $("overlay").style.display="flex";
 document.body.style.overflow="hidden";
 container.focus();
}
function closeSource(){ $("sourceFrame").src="";$("overlay").style.display="none";document.body.style.overflow="";if(lastFocused)lastFocused.focus();activeRecord=null }
function setMode(next){mode=next;$("tileBtn").classList.toggle("active",mode==="tiles");$("listBtn").classList.toggle("active",mode==="list");$("tileBtn").setAttribute("aria-pressed",mode==="tiles");$("listBtn").setAttribute("aria-pressed",mode==="list");render()}
function setTheme(dark,persist=true){
 document.documentElement.classList.toggle("dark",dark);$("themeBtn").textContent=dark?"☀":"☾";$("themeBtn").setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");
 document.querySelector('meta[name="theme-color"]').content=dark?"#171512":"#f6f2ea";
 if(persist){try{localStorage.setItem("chronicles-theme",dark?"dark":"light")}catch(e){}}
}

$("totalStat").textContent=DATA.length;$("periodStat").textContent=periods.length;$("bookStat").textContent=new Set(DATA.map(book).filter(Boolean)).size;
$("closeBtn").onclick=closeSource;$("overlay").addEventListener("click",e=>{if(e.target===$("overlay"))closeSource()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("overlay").style.display==="flex")closeSource();if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();$("search").focus()}});
$("search").addEventListener("input",render);$("period").addEventListener("change",render);$("sort").addEventListener("change",render);
$("filterRow").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;$("period").value=$("period").value===b.dataset.period?"":b.dataset.period;render()});
$("tileBtn").onclick=()=>setMode("tiles");$("listBtn").onclick=()=>setMode("list");$("themeBtn").onclick=()=>setTheme(!document.documentElement.classList.contains("dark"));
let savedTheme="";try{savedTheme=localStorage.getItem("chronicles-theme")||""}catch(e){}
setTheme(savedTheme?savedTheme==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches,false);
render();
