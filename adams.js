/* Adams' chart companion: per-period panel links + a zoom/pan pane for a locally hosted scan.
   The scan is NOT bundled. Put a file at chart/adams.jpg (see chart/README.md for licence + credit). */
(function(){
const BASE="https://www.adamschart.org/panels/";
const PANELS=[
 {n:1,name:"The Creation and the First Patriarchs",range:"c. 4004–3500 BC",slug:"1-the-creation-and-the-first-patriarchs"},
 {n:2,name:"The Patriarchs Before the Flood",range:"c. 3500–2900 BC",slug:"2-the-patriarchs-before-the-flood"},
 {n:3,name:"Noah and the Deluge",range:"c. 2900–2300 BC",slug:"3-noah-and-the-deluge"},
 {n:4,name:"Abraham and the Early Empires",range:"c. 2300–1700 BC",slug:"4-abraham-and-the-early-empires"},
 {n:5,name:"The Exodus and the Age of the Judges",range:"c. 1700–1100 BC",slug:"5-the-exodus-and-the-judges"},
 {n:6,name:"From Saul to Cyrus: Kings, Prophets and Empires",range:"c. 1100–500 BC",slug:"6-from-saul-to-cyrus"},
 {n:7,name:"Greece, Rome and the Beginning of the Christian Era",range:"c. 500 BC–AD 100",slug:"7-greece-rome-and-the-christian-era"},
 {n:8,name:"The Fall of Rome and the Hegira",range:"c. AD 100–700",slug:"8-the-fall-of-rome-and-the-hegira"},
 {n:9,name:"Charlemagne, the Crusades and the Medieval Kingdoms",range:"c. AD 700–1300",slug:"9-charlemagne-and-the-crusades"},
 {n:10,name:"Discovery, Revolution and the United States",range:"c. AD 1300–1878",slug:"10-discovery-revolution-united-states"}
];
/* Chronicles period -> Adams panel(s), judged from Ussher-style dates against each panel's date range. */
const MAP={
 "Creation":[1],"Eden":[1],"Fall":[1],"Early Humanity":[1,2],"Pre-Flood":[2],"Flood":[3],"Post-Flood":[3],"Nations":[4],
 "Patriarchs":[4,5],"Egypt":[5],"Midian":[5],"Exodus":[5],"Wilderness":[5],"Sinai":[5],"Canaan":[5],"Moab":[5],"Judges":[5],
 "United Kingdom":[6],"Divided Kingdom":[6],"Exile":[6],"Return":[6,7],
 "Intertestamental":[7],"New Testament":[7],"Early Church":[7],"Missionary Era":[7],"Apostolic Era":[7],
 "Revelation":[7],"Eternal State":[7]
};
const NOTE={"Revelation":"prophecy; nearest chart panel","Eternal State":"future; nearest chart panel"};
const $=id=>document.getElementById(id);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const url=p=>BASE+p.slug+"/";

/* ---- Per-period panel links ---- */
window.updateAdamsBar=function(period){
 const bar=$("adamsBar");if(!bar)return;
 const ids=MAP[period];
 if(!period||!ids){bar.hidden=true;bar.innerHTML="";return}
 const links=ids.map(n=>{const p=PANELS[n-1];
  return `<a href="${url(p)}" target="_blank" rel="noopener">Panel ${p.n}: ${esc(p.name)} <span aria-hidden="true">↗</span></a>`}).join("");
 const first=PANELS[ids[0]-1];
 bar.innerHTML=`<span class="adams-label">On Adams' chart</span>${links}<button type="button" class="adams-view" data-panel="${first.n}">View in chart pane</button>`
  +(NOTE[period]?`<span class="adams-note">(${esc(NOTE[period])})</span>`:"");
 bar.hidden=false;
};

/* ---- Zoom / pan pane ---- */
const IMG="chart/adams.jpg";
let st={loaded:false,x:0,y:0,k:1,min:.02,max:8,w:0,h:0};
function apply(){const im=$("chartImg");if(!im)return;im.style.transform=`translate(${st.x}px,${st.y}px) scale(${st.k})`}
function fit(){const v=$("chartView");if(!st.loaded)return;st.k=Math.min(v.clientWidth/st.w,v.clientHeight/st.h);st.min=st.k*.5;st.x=(v.clientWidth-st.w*st.k)/2;st.y=(v.clientHeight-st.h*st.k)/2;apply()}
function zoomAt(f,cx,cy){const nk=Math.max(st.min,Math.min(st.max,st.k*f)),r=nk/st.k;st.x=cx-(cx-st.x)*r;st.y=cy-(cy-st.y)*r;st.k=nk;apply()}
function toPanel(n){ /* assumes the ten panels are equal-width slices of the full chart */
 const v=$("chartView");if(!st.loaded)return;
 st.k=Math.max(st.k,v.clientHeight/st.h);
 const px=(n-1)/10*st.w*st.k;st.x=-px+10;st.y=(v.clientHeight-st.h*st.k)/2;apply();
 document.querySelectorAll(".chart-panels button").forEach(b=>b.classList.toggle("active",+b.dataset.panel===n));
}
function openChart(panel){
 const m=$("chartModal");m.style.display="flex";document.body.style.overflow="hidden";
 if(!st.loaded&&!$("chartImg").dataset.tried){
  $("chartImg").dataset.tried="1";
  const im=$("chartImg");
  im.onload=()=>{st.loaded=true;st.w=im.naturalWidth;st.h=im.naturalHeight;$("chartMissing").hidden=true;fit();if(panel)toPanel(panel)};
  im.onerror=()=>{$("chartMissing").hidden=false};
  im.src=IMG;
 } else if(st.loaded&&panel)toPanel(panel);
}
function closeChart(){$("chartModal").style.display="none";document.body.style.overflow=""}

function init(){
 const nav=$("chartPanels");
 nav.innerHTML=PANELS.map(p=>`<button type="button" data-panel="${p.n}" title="${esc(p.name)} (${esc(p.range)})">${p.n}</button>`).join("");
 nav.addEventListener("click",e=>{const b=e.target.closest("button");if(b)toPanel(+b.dataset.panel)});
 $("chartBtn").onclick=()=>openChart();
 $("chartClose").onclick=closeChart;
 $("adamsBar").addEventListener("click",e=>{const b=e.target.closest(".adams-view");if(b)openChart(+b.dataset.panel)});
 $("zoomIn").onclick=()=>{const v=$("chartView");zoomAt(1.4,v.clientWidth/2,v.clientHeight/2)};
 $("zoomOut").onclick=()=>{const v=$("chartView");zoomAt(1/1.4,v.clientWidth/2,v.clientHeight/2)};
 $("zoomFit").onclick=fit;
 const v=$("chartView");let drag=null;
 v.addEventListener("wheel",e=>{if(!st.loaded)return;e.preventDefault();const r=v.getBoundingClientRect();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX-r.left,e.clientY-r.top)},{passive:false});
 v.addEventListener("pointerdown",e=>{if(!st.loaded)return;drag={x:e.clientX-st.x,y:e.clientY-st.y};v.setPointerCapture(e.pointerId);v.classList.add("grabbing")});
 v.addEventListener("pointermove",e=>{if(!drag)return;st.x=e.clientX-drag.x;st.y=e.clientY-drag.y;apply()});
 const end=()=>{drag=null;v.classList.remove("grabbing")};
 v.addEventListener("pointerup",end);v.addEventListener("pointercancel",end);
 v.addEventListener("dblclick",e=>{if(!st.loaded)return;const r=v.getBoundingClientRect();zoomAt(1.8,e.clientX-r.left,e.clientY-r.top)});
 $("chartModal").addEventListener("click",e=>{if(e.target===$("chartModal"))closeChart()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&$("chartModal").style.display==="flex")closeChart()});
 window.addEventListener("resize",()=>{if($("chartModal").style.display==="flex")fit()});
}
init();
})();
