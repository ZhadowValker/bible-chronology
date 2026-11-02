const DATA=window.CHRONICLES_DATA;
const $=id=>document.getElementById(id);
let mode="tiles", activeRecord=null;
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
 if(window.updateAdamsBar)updateAdamsBar(selected);
 document.querySelectorAll(".card,.row").forEach(el=>{el.addEventListener("click",()=>openSource(DATA.find(x=>x["#"]===el.dataset.id)));el.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openSource(DATA.find(x=>x["#"]===el.dataset.id))}})});
}

function parseRef(ref){
 const m=ref.trim().match(/^((?:[1-3] )?[A-Za-z]+(?: [A-Za-z]+)*?)(?:\s+(\d+))?(?:[:\u2013-].*)?$/);
 return m?{book:m[1],chapter:m[2]||"1"}:null;
}
function openSource(r){
 if(!r)return;
 activeRecord=r;
 const ref=r.Reference.trim(), p=parseRef(ref), links=[];
 // Telugu BSI: use the chapter-specific links stored with each event
 sources(r).forEach(u=>{const c=(u.match(/\/(\d+)\/?$/)||[])[1];links.push({name:"Telugu (BSI)"+(c?" \u2014 chapter "+c:""),url:u})});
 if(sources(r).length&&p){
  const bh=p.book.toLowerCase().replace(/ /g,"_");
  links.push({name:"KJV (BibleHub)",url:`https://biblehub.com/${bh}/${p.chapter}.htm`});
  links.push({name:"ESV (BibleHub)",url:`https://biblehub.com/esv/${bh}/${p.chapter}.htm`});
  links.push({name:"NIV (Bible.com)",url:`https://www.bible.com/search/bible?q=${encodeURIComponent(ref)}`});
 }
 const body=links.length
  ? "<p>Choose a Bible source:</p>"+links.map(l=>`<a href="${esc(l.url)}" target="_blank" rel="noopener" class="source-btn">${esc(l.name)}</a>`).join("")
  : "<p>This entry is a historical period, so there is no Bible chapter to open.</p>";
 const html=`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(ref)} \u2014 ${esc(r.Event)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; }
    .header h1 { font-size: 18px; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.9; }
    .sources { padding: 20px; }
    .sources p { font-size: 13px; color: #666; margin-bottom: 12px; }
    .source-btn { display: block; width: 100%; padding: 14px 16px; margin: 10px 0; background: #f0f0f0; border: 1px solid #ddd; border-radius: 6px; color: #333; text-decoration: none; font-size: 14px; font-weight: 500; text-align: left; }
    .source-btn:hover { background: #667eea; color: white; border-color: #667eea; }
    .footer { padding: 12px 20px; background: #fafafa; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${esc(ref)}</h1><p>${esc(r.Event)}</p></div>
    <div class="sources">${body}</div>
    <div class="footer">Links open in a new tab</div>
  </div>
</body>
</html>`;
 const popup=window.open("","BibleSource","width=550,height=600,resizable=yes,scrollbars=yes");
 if(!popup){ // popup blocked: fall back to opening the first source in a new tab
  if(links[0])window.open(links[0].url,"_blank","noopener");
  return;
 }
 popup.document.open();popup.document.write(html);popup.document.close();popup.focus();
}
function setMode(next){mode=next;$("tileBtn").classList.toggle("active",mode==="tiles");$("listBtn").classList.toggle("active",mode==="list");$("tileBtn").setAttribute("aria-pressed",mode==="tiles");$("listBtn").setAttribute("aria-pressed",mode==="list");render()}
function setTheme(dark,persist=true){
 document.documentElement.classList.toggle("dark",dark);$("themeBtn").textContent=dark?"☀":"☾";$("themeBtn").setAttribute("aria-label",dark?"Switch to light mode":"Switch to dark mode");
 document.querySelector('meta[name="theme-color"]').content=dark?"#171512":"#f6f2ea";
 if(persist){try{localStorage.setItem("chronicles-theme",dark?"dark":"light")}catch(e){}}
}

$("totalStat").textContent=DATA.length;$("periodStat").textContent=periods.length;$("bookStat").textContent=new Set(DATA.map(book).filter(Boolean)).size;
document.addEventListener("keydown",e=>{if(e.key==="/"&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();$("search").focus()}});
$("search").addEventListener("input",render);$("period").addEventListener("change",render);$("sort").addEventListener("change",render);
$("filterRow").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;$("period").value=$("period").value===b.dataset.period?"":b.dataset.period;render()});
$("tileBtn").onclick=()=>setMode("tiles");$("listBtn").onclick=()=>setMode("list");$("themeBtn").onclick=()=>setTheme(!document.documentElement.classList.contains("dark"));
let savedTheme="";try{savedTheme=localStorage.getItem("chronicles-theme")||""}catch(e){}
setTheme(savedTheme?savedTheme==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches,false);
render();
