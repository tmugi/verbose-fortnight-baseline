
/* ============ data + scoring (the product logic) ============ */
const rnd=(a,b)=>Math.round((a+Math.random()*(b-a))*10)/10;
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const pick=a=>a[Math.floor(Math.random()*a.length)];

const SEEDS=[
 {name:"Eleanor Jones",room:114,bathBase:1.5,motionBase:11,roomBase:6,hue:28},
 {name:"Walter Smith",room:108,bathBase:2.0,motionBase:14,roomBase:8,hue:160},
 {name:"Rosa Garcia",room:121,bathBase:1.0,motionBase:9,roomBase:10,hue:320},
 {name:"Harold Chen",room:102,bathBase:2.5,motionBase:16,roomBase:5,hue:200},
 {name:"Margaret Okafor",room:117,bathBase:1.0,motionBase:8,roomBase:7,hue:90},
 {name:"Frank DiMarco",room:105,bathBase:3.0,motionBase:18,roomBase:9,hue:250},
 {name:"Alma Petersen",room:126,bathBase:1.5,motionBase:10,roomBase:12,hue:10},
 {name:"George Whitfield",room:111,bathBase:2.0,motionBase:13,roomBase:6,hue:130},
];
function motionTimes(n,cluster){const t=[];for(let i=0;i<n;i++)t.push(cluster&&i%2===0?rnd(cluster[0],cluster[1]):rnd(22.2,29.8));return t.sort((a,b)=>a-b);}
function normalNight(s){const m=Math.max(2,Math.round(rnd(s.motionBase*0.8,s.motionBase*1.2)));return{bath:Math.max(0,Math.round(rnd(s.bathBase-0.5,s.bathBase+0.5))),motion:m,roomHours:Math.max(1,rnd(s.roomBase-2,s.roomBase+2)),times:motionTimes(m,null)};}
function scenarioNight(n,sc,bb,mb){
 if(sc==="uti"){const bath=Math.round(bb+rnd(2.5,4));return{...n,bath,times:motionTimes(n.motion,[23,29])};}
 if(sc==="restless"){const motion=Math.round(mb*rnd(1.8,2.4));return{...n,motion,times:motionTimes(motion,[26,28])};}
 if(sc==="isolated")return{...n,roomHours:rnd(24,31)};
 return n;
}
function makeResident(s,sc){return{...s,history:Array.from({length:14},()=>normalNight(s)),tonight:scenarioNight(normalNight(s),sc,s.bathBase,s.motionBase),battery:s.room===117?12:Math.round(rnd(55,100))};}
function simulate(r){
 // Incidence per resident per night. Tuned so an 80 bed community sees a
 // handful of flags each morning, not a wall of them.
 const roll=Math.random();const sc=roll<0.03?"uti":roll<0.055?"restless":roll<0.07?"isolated":null;
 const history=[...r.history.slice(1),r.tonight];
 return{...r,history,tonight:scenarioNight(normalNight(r),sc,avg(history.map(h=>h.bath)),avg(history.map(h=>h.motion))),battery:Math.max(5,r.battery-Math.round(rnd(0,2)))};
}
function score(r){
 const bb=Math.round(avg(r.history.map(h=>h.bath))*10)/10;
 const mb=Math.round(avg(r.history.map(h=>h.motion)));
 const flags=[];
 if(r.tonight.bath>bb+2)flags.push({id:"uti-"+r.room,kind:"UTI Predictor",level:"red",
  msg:r.tonight.bath+" bathroom visits last night. Normal is "+bb+". A sudden frequency increase is the leading early sign of a UTI.",
  action:"Nurse assessment this morning. Dip test if symptomatic."});
 if(r.tonight.motion>mb*1.5)flags.push({id:"rest-"+r.room,kind:"Restlessness Index",level:"yellow",
  msg:r.tonight.motion+" motion events overnight. Normal is "+mb+". Poor sleep raises fall risk today.",
  action:"Prioritize at morning rounds. Assist transfers."});
 if(r.tonight.roomHours>=24)flags.push({id:"iso-"+r.room,kind:"Isolation Tracker",level:"yellow",
  msg:Math.round(r.tonight.roomHours)+" hours without leaving the room. May indicate low mood or unreported pain.",
  action:"Wellness check before lunch. Note mood and appetite."});
 // 1 = within baseline, 4 = multiple concurrent changes. Every level is
 // reachable, so the number means something.
 const risk=Math.min(4,1+flags.reduce((n,f)=>n+(f.level==="red"?2:1),0));
 return{...r,bathBase:bb,motionBase:mb,flags,risk};
}

/* ============ state ============ */
let residents=SEEDS.map((s,i)=>makeResident(s,i===0?"uti":i===1?"restless":i===2?"isolated":null));
let day=1,page="huddle",selectedRoom=null,acks={};
let clockMin=6*60,feedItems=[{t:"06:00",room:null,text:"Morning Huddle Report generated"}];
const FEED=[{text:"Motion · bedroom"},{text:"Motion · bathroom"},{text:"Door · opened"},{text:"Door · closed"}];

/* ============ helpers ============ */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/</g,"&lt;");
const first=r=>r.name.split(" ")[0];
function nowLabel(){const h=String(Math.floor(clockMin/60)).padStart(2,"0");const m=String(clockMin%60).padStart(2,"0");return h+":"+m;}
function scoredAll(){return residents.map(score).sort((a,b)=>b.risk-a.risk);}
function avatar(r,size){const ini=r.name.split(" ").map(w=>w[0]).join("");
 return '<div class="avatar" style="width:'+size+'px;height:'+size+'px;background:hsl('+r.hue+' 30% 88%);color:hsl('+r.hue+' 35% 32%);font-size:'+Math.round(size*0.36)+'px">'+ini+'</div>';}
function minispark(r,flagged){const vals=[...r.history.map(h=>h.motion),r.tonight.motion];const max=Math.max(...vals);
 return '<div class="minispark" aria-hidden="true">'+vals.map((v,i)=>'<i style="height:'+Math.max(3,v/max*22)+'px'+(i===vals.length-1?';background:'+(flagged?'var(--alert)':'var(--pine)'):'')+'"></i>').join("")+'</div>';}
function flagChip(r,f){
 const key=day+"-"+f.id;const at=acks[key];
 return '<div class="fchip '+f.level+(at?' acked':'')+'">'
  +'<div class="frow"><span class="fk">'+(f.level==="red"?"Red":"Yellow")+' · '+f.kind+'</span>'
  +(at?'<span class="ackdone">✓ checked '+at+'</span>'
      :'<button class="ackbtn" data-act="ack" data-id="'+f.id+'">Mark checked</button>')
  +'</div><div class="fm">'+esc(f.msg)+'</div>'
  +(at?'':'<div class="fa"><b>Do:</b> '+esc(f.action)+'</div>')+'</div>';
}
function barChart(title,baseline,hist,tonightVal,unit){
 const vals=[...hist,tonightVal];const max=Math.max(...vals,baseline)*1.15||1;
 const bars=vals.map((v,i)=>'<div class="bar'+(i===vals.length-1?' hot':'')+'" style="height:'+Math.max(2,v/max*100)+'%" title="'+v+' '+unit+'"></div>').join("");
 const bl=Math.min(96,baseline/max*100);
 return '<div class="card" style="padding:16px 16px 12px;margin-bottom:14px">'
  +'<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="font-weight:600">'+title+'</span><span class="mono" style="color:var(--ink-soft);font-size:12px">baseline '+baseline+' '+unit+'</span></div>'
  +'<div class="chart">'+bars+'<div class="bline" style="bottom:'+bl+'%"></div></div>'
  +'<div class="chart-x"><span>14 nights ago</span><span>7 nights ago</span><span style="color:var(--alert-t)">last night</span></div></div>';
}

/* ============ renderers ============ */
function render(){
 const scored=scoredAll();
 const flagged=scored.filter(r=>r.flags.length);
 const clear=scored.filter(r=>!r.flags.length);
 const open=flagged.reduce((n,r)=>n+r.flags.filter(f=>!acks[day+"-"+f.id]).length,0);
 const low=residents.filter(r=>r.battery<20).length;
 const sel=selectedRoom?scored.find(r=>r.room===selectedRoom):null;

 /* nav + badges */
 ["huddle","floor","sensors"].forEach(p=>$("nav-"+p).classList.toggle("active",page===p&&!sel));
 $("flagbadge").style.display=open?"inline":"none";$("flagbadge").textContent=open;
 $("crumb").textContent="Willow Creek · East Wing · Day "+day;
 $("pagetitle").textContent=sel?sel.name:(page==="huddle"?"Morning Huddle Report":page==="floor"?"Floor view":"Sensor health");
 $("kpis").innerHTML=
  '<div class="kpi"><div class="v" style="color:'+(open?'var(--alert-t)':'var(--ok-t)')+'">'+open+'</div><div class="l">open flags</div></div>'
  +'<div class="kpi"><div class="v">'+residents.length+'</div><div class="l">residents</div></div>'
  +'<div class="kpi"><div class="v" style="color:'+(low?'var(--alert-t)':'var(--ok-t)')+'">'+(residents.length*3-low)+'/'+(residents.length*3)+'</div><div class="l">sensors online</div></div>'
  +'<div class="rn">RN</div>';

 if(sel){$("main").innerHTML=renderDetail(sel);return;}
 if(page==="huddle")$("main").innerHTML=renderHuddle(flagged,clear);
 else if(page==="floor")$("main").innerHTML=renderFloor(scored);
 else $("main").innerHTML=renderSensors();
}
function renderHuddle(flagged,clear){
 let h='<div class="seclabel">'+(flagged.length?("Needs attention · "+flagged.length+" resident"+(flagged.length>1?"s":"")):"All quiet overnight")+'</div>';
 if(!flagged.length)h+='<div class="card" style="padding:24px;font-size:15px;color:var(--ink-soft);display:flex;gap:12px;align-items:center"><span style="width:10px;height:10px;border-radius:99px;background:var(--ok)"></span>Every resident stayed within their own baseline last night. This is what most mornings look like.</div>';
 h+='<div style="display:grid;gap:14px">'+flagged.map(r=>
  '<div class="card clickable rescard" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +'<div class="reshead">'+avatar(r,40)
  +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:16.5px">'+r.name+'</div><div class="mono" style="font-size:11.5px;color:var(--ink-soft)">Room '+r.room+' · risk '+r.risk+'/4</div></div>'
  +minispark(r,true)+'</div>'
  +r.flags.map(f=>flagChip(r,f)).join("")+'</div>').join("")+'</div>';
 h+='<div class="seclabel" style="margin-top:28px">Within baseline</div><div class="card" style="overflow:hidden">'
  +clear.map(r=>'<div class="rowitem clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +avatar(r,30)+'<span style="font-weight:500;font-size:14.5px;flex:1">'+r.name+'</span>'+minispark(r,false)
  +'<span class="mono" style="font-size:11.5px;color:var(--ok-t)">● baseline</span></div>').join("")+'</div>';
 return h;
}
function renderFloor(scored){
 const st=r=>r.flags.some(f=>f.level==="red")?"r":r.flags.length?"y":"";
 const lbl=r=>r.flags.length?r.flags[0].kind.split(" ")[0].toLowerCase():"baseline";
 const col=s=>s==="r"?"var(--red-t)":s==="y"?"var(--alert-t)":"var(--ok-t)";
 return '<div class="seclabel">East Wing · live room status</div><div class="card" style="padding:26px"><div class="rooms-grid">'
  +scored.slice().sort((a,b)=>a.room-b.room).map(r=>{const s=st(r);
   return '<div class="room '+s+' clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
   +'<div class="mono" style="font-size:11px;color:var(--ink-soft)">RM '+r.room+'</div>'
   +'<div style="font-weight:600;font-size:13.5px;margin:4px 0 6px">'+r.name.split(" ")[0][0]+'. '+r.name.split(" ")[1]+'</div>'
   +'<span class="mono" style="font-size:10.5px;color:'+col(s)+'">● '+lbl(r)+'</span></div>';}).join("")
  +'</div><div style="display:flex;gap:18px;margin-top:20px;font-size:12px;color:var(--ink-soft)">'
  +'<span><span style="color:var(--ok-t)">●</span> within baseline</span><span><span style="color:var(--alert-t)">●</span> yellow flag</span><span><span style="color:var(--red-t)">●</span> red flag</span></div></div>';
}
function renderSensors(){
 return '<div class="seclabel">Device health · 3 sensors per room (bedroom motion · bathroom motion · door)</div><div class="card" style="overflow:hidden">'
  +residents.slice().sort((a,b)=>a.room-b.room).map(r=>
   '<div class="rowitem"><span class="mono" style="width:60px;color:var(--ink-soft);font-size:12px">RM '+r.room+'</span>'
   +'<span style="flex:1;font-weight:500;font-size:14px">'+r.name+'</span>'
   +'<span class="mono" style="font-size:12px;color:var(--ok-t)">3/3 online</span>'
   +'<span class="mono" style="font-size:12px;width:100px;text-align:right;color:'+(r.battery<20?'var(--alert-t)':'var(--ink-soft)')+'">battery '+r.battery+'%</span></div>').join("")
  +'</div><p style="font-size:13px;color:var(--ink-soft);margin-top:14px">Low battery sensors are flagged three weeks before they fail. Swaps happen on housekeeping rounds, never as emergencies.</p>';
}
function renderDetail(r){
 let h='<button data-act="back" style=""background:none;border:none;color:var(--pine);font-weight:600;font-size:13.5px;cursor:pointer;padding:0;margin-bottom:14px;font-family:inherit">← Back</button>';
 h+='<div class="card" style="padding:18px;display:flex;gap:14px;align-items:center;margin-bottom:14px">'+avatar(r,52)
  +'<div style="flex:1"><div class="serif" style="font-size:22px">'+r.name+'</div><div class="mono" style="font-size:12px;color:var(--ink-soft)">Room '+r.room+' · monitored 14+ nights · risk '+r.risk+'/4</div></div>'
  +minispark(r,r.flags.length>0)+'</div>';
 if(r.flags.length)h+='<div style="margin-bottom:14px">'+r.flags.map(f=>flagChip(r,f)).join("")+'</div>';
 h+='<div class="card" style="padding:18px;margin-bottom:14px"><div style="font-weight:600;font-size:13.5px;margin-bottom:12px">Last night, minute by minute</div><div class="tl">'
  +r.tonight.times.map(t=>'<i style="left:'+(((t-22)/8)*100)+'%"></i>').join("")
  +'</div><div class="tl-x"><span>10 PM</span><span>12 AM</span><span>2 AM</span><span>4 AM</span><span>6 AM</span></div>'
  +'<div style="font-size:12.5px;color:var(--ink-soft);margin-top:8px">Each dot is one motion event. Clusters in the small hours are what the Restlessness Index reads as a bad night.</div></div>';
 h+=barChart("Bathroom visits per night",r.bathBase,r.history.map(x=>x.bath),r.tonight.bath,"visits");
 h+=barChart("Overnight motion events",r.motionBase,r.history.map(x=>x.motion),r.tonight.motion,"events");
 h+='<div class="card" style="padding:16px;font-size:13.5px;color:var(--ink-soft)"><b style="color:var(--ink)">Time without leaving room:</b> <span class="mono" style="color:'+(r.tonight.roomHours>=24?'var(--red-t)':'var(--ink)')+'">'+Math.round(r.tonight.roomHours)+' h</span> (threshold 24 h). All comparisons are against '+first(r)+"'s own rolling 14 night baseline, never a generic standard.</div>";
 return h;
}
function renderFeed(){
 $("feed").innerHTML=feedItems.map(e=>'<div class="feedrow"><span>'+e.t+'</span><span class="ft">'+(e.room?("Rm "+e.room+" · "):"")+e.text+'</span></div>').join("");
}

/* ============ actions ============ */
function go(p){page=p;selectedRoom=null;render();}
function openRes(room){selectedRoom=room;render();window.scrollTo(0,0);}
function backToList(){selectedRoom=null;render();}
function ack(id){acks[day+"-"+id]=nowLabel();render();}
function nextNight(){
  residents=residents.map(simulate);day++;selectedRoom=null;clockMin=6*60;
  feedItems=[{t:"06:00",room:null,text:"Morning Huddle Report generated"}];
  render();renderFeed();
}
function openDemo(){
  $("site").hidden=true;$("app").hidden=false;
  window.scrollTo(0,0);render();renderFeed();
  const back=document.querySelector(".pf-back");if(back)back.focus();
}
function closeDemo(){
  $("app").hidden=true;$("site").hidden=false;window.scrollTo(0,0);
}

/* ============ delegated event wiring (CSP safe: no inline handlers) ====== */
function handleAction(el,ev){
  const act=el.dataset.act;
  if(!act)return false;
  switch(act){
    case "go":         go(el.dataset.page); break;
    case "open-res":   openRes(Number(el.dataset.room)); break;
    case "back":       backToList(); break;
    case "ack":        ev.stopPropagation(); ack(el.dataset.id); break;
    case "next-night": nextNight(); break;
    case "open-demo":  openDemo(); break;
    case "close-demo": closeDemo(); break;
    default: return false;
  }
  return true;
}

document.addEventListener("click",(ev)=>{
  const el=ev.target.closest("[data-act]");
  if(!el)return;
  if(handleAction(el,ev))ev.preventDefault();
});

document.addEventListener("keydown",(ev)=>{
  if(ev.key!=="Enter"&&ev.key!==" ")return;
  const el=ev.target.closest?.("[data-act]");
  if(!el||el.tagName==="BUTTON"||el.tagName==="A")return;
  if(handleAction(el,ev))ev.preventDefault();
});

/* Esc closes the demo */
document.addEventListener("keydown",(ev)=>{
  if(ev.key==="Escape"&&!$("app").hidden)closeDemo();
});

/* ============ ambient feed ============ */
setInterval(()=>{
  if($("app").hidden)return;
  clockMin+=Math.round(rnd(1,3));
  feedItems=[{t:nowLabel(),room:pick(residents).room,text:pick(FEED).text},...feedItems].slice(0,9);
  renderFeed();
},2600);

/* ============ hero flag reveal ============ */
(function(){
  const f=$("heroflag");
  if(!f)return;
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){f.classList.add("show");}
  else setTimeout(()=>f.classList.add("show"),900);
})();
