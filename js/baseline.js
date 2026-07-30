
/* ============ utils ============ */
const rnd=(a,b)=>Math.round((a+Math.random()*(b-a))*10)/10;
const irnd=(a,b)=>Math.round(a+Math.random()*(b-a));
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const sd=a=>{const m=avg(a);return Math.sqrt(avg(a.map(v=>(v-m)*(v-m))));};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=id=>document.getElementById(id);
const first=r=>r.name.split(" ")[0];
const last=r=>r.name.split(" ")[1];

/* ============ resident seeds: demographics, clinical context, history ============ */
const SEEDS=[
 {name:"Eleanor Jones",room:114,age:84,bathBase:1.5,motionBase:11,roomBase:6,hue:28,
  care:"Assisted living",since:"2023",mobility:"Walker",
  conditions:["On file with care team"],
  chronotype:"Early riser. Typically asleep by 9:45 PM, up by 6:15 AM.",
  social:"Common room most mornings. Rarely misses a meal in the dining hall.",
  events:[
   {d:"Jun 14",type:"resolved",t:"Bathroom activity deviation flagged. Reviewed by nurse, resolved same week."},
   {d:"Apr 02",type:"note",t:"Family raised a concern about evenings. Care team added an evening check in."},
   {d:"Feb 21",type:"incident",t:"Fall in bathroom, no injury. A restlessness deviation had been flagged that same morning."}],
  priors:["Prior flagged deviation (Jun 2026)","Prior fall, no injury (Feb 2026)"],
  watch:"Bathroom frequency and evening restlessness. Care team has noted a prior episode in June."},
 {name:"Walter Smith",room:108,age:79,bathBase:2.0,motionBase:14,roomBase:8,hue:160,
  care:"Assisted living",since:"2024",mobility:"Cane",
  conditions:["On file with care team"],
  chronotype:"Night owl. Rarely settles before 11:30 PM. Light sleeper.",
  social:"Keeps to himself mornings. Regular at the 2 PM card table.",
  events:[
   {d:"Jul 08",type:"system",t:"Baseline recalibrated after new mattress changed his motion signature."},
   {d:"May 19",type:"resolved",t:"Restlessness flagged 3 nights running. Nurse review linked it to a medication timing change. Adjusted, pattern resolved."}],
  priors:["Recurrent poor sleep stretches","Sensitive to medication timing, per care team"],
  watch:"Clustered restlessness after any medication change, per care team note."},
 {name:"Rosa Garcia",room:121,age:88,bathBase:1.0,motionBase:9,roomBase:10,hue:320,
  care:"Assisted living",since:"2022",mobility:"Independent",
  conditions:["On file with care team"],
  chronotype:"Consistent sleeper, 10 PM to 6 AM, few interruptions.",
  social:"Social patterns vary. Care team noted two withdrawn stretches this year.",
  events:[
   {d:"Mar 30",type:"resolved",t:"Extended room time flagged at 26 hours. Staff visit found a physical cause. Referral made by care team."},
   {d:"Jan 12",type:"note",t:"Daughter moved out of state. Care team noted more room time for about 2 weeks."}],
  priors:["Two withdrawn stretches logged (2026)"],
  watch:"Room time trend. Care team has twice found a physical cause behind extended room time."},
 {name:"Harold Chen",room:102,age:76,bathBase:2.5,motionBase:16,roomBase:5,hue:200,
  care:"Assisted living",since:"2025",mobility:"Independent",
  conditions:["On file with care team"],
  chronotype:"Active sleeper. Higher motion at night is normal for Harold.",
  social:"Walks the courtyard twice daily. High activity is his baseline.",
  events:[{d:"Feb 04",type:"note",t:"Admitted Jan 2025. Baseline established in 26 nights."}],
  priors:["None logged"],
  watch:"Any drop in daytime activity. For a highly active resident, slowing down is the early change."},
 {name:"Margaret Okafor",room:117,age:91,bathBase:1.0,motionBase:8,roomBase:7,hue:90,
  care:"Assisted living · high acuity",since:"2021",mobility:"Walker",
  conditions:["On file with care team"],
  chronotype:"Long sleeper, 9 PM to 7 AM. Low overnight motion.",
  social:"Mornings in the garden room. Family visits Sundays.",
  events:[
   {d:"May 27",type:"resolved",t:"Bathroom activity flagged. Nurse review linked it to a medication adjustment."},
   {d:"Mar 08",type:"incident",t:"Hospital visit. Returned after 3 days. Baseline paused and rebuilt."}],
  priors:["Hospital stay logged (Mar 2026)","Tighter thresholds set by care team"],
  watch:"Care team has set tighter thresholds for this resident."},
 {name:"Frank DiMarco",room:105,age:81,bathBase:3.0,motionBase:18,roomBase:9,hue:250,
  care:"Assisted living",since:"2023",mobility:"Cane",
  conditions:["On file with care team"],
  chronotype:"Frequent bathroom trips are his normal. Baseline reflects it.",
  social:"Dining hall regular. Evening TV in the common room.",
  events:[{d:"Apr 22",type:"note",t:"3 nightly bathroom visits is normal for Frank. Thresholds are set against his baseline, so he is not over flagged."}],
  priors:["High but stable nighttime frequency"],
  watch:"Baseline is 3 visits a night, so the trigger sits near 5. Personal baselines prevent false alarms for residents like Frank."},
 {name:"Alma Petersen",room:126,age:86,bathBase:1.5,motionBase:10,roomBase:12,hue:10,
  care:"Assisted living",since:"2024",mobility:"Walker",
  conditions:["On file with care team"],
  chronotype:"Settles late, wakes early. Averages under 7 hours.",
  social:"Prefers her room. Longer room time is normal for Alma, so her isolation threshold is extended.",
  events:[{d:"Jun 02",type:"system",t:"Isolation threshold extended to 30 hours to match her documented preference for time in her room."}],
  priors:["Extended room time is normal for this resident"],
  watch:"Overnight motion trend. Isolation threshold extended to 30 hours per care team note."},
 {name:"George Whitfield",room:111,age:77,bathBase:2.0,motionBase:13,roomBase:6,hue:130,
  care:"Assisted living",since:"2025",mobility:"Independent",
  conditions:["On file with care team"],
  chronotype:"Steady 10:30 PM to 6:30 AM. Reliable rhythms.",
  social:"Morning coffee group. Volunteers at the library cart.",
  events:[{d:"Jul 15",type:"note",t:"Six months of clean baselines. One of the steadiest patterns on the wing."}],
  priors:["None logged"],
  watch:"Care team has flagged winter respiratory checks after any restless stretch."},
];

/* ============ night generation: realistic variance + rhythm ============ */
function motionTimes(n,cluster){const t=[];for(let i=0;i<n;i++)t.push(cluster&&i%2===0?rnd(cluster[0],cluster[1]):rnd(22.2,29.8));return t.sort((a,b)=>a-b);}
function normalNight(s,i){
 const wave=Math.sin(i*0.9)*1.6+Math.sin(i*0.31)*1.1;          /* weekly-ish rhythm */
 const motion=Math.max(3,Math.round(s.motionBase+wave+rnd(-2.2,2.2)));
 const bath=Math.max(0,Math.round(s.bathBase+rnd(-1,1)+(Math.random()<0.18?1:0)));
 const sleep=clamp(Math.round(92-(motion-s.motionBase)*2.4+rnd(-4,4)),52,97);
 return{bath,motion,roomHours:Math.max(1,rnd(s.roomBase-2,s.roomBase+2)),times:motionTimes(motion,null),sleep};
}
function scenarioNight(n,sc,bb,mb){
 if(sc==="bath"){const bath=Math.round(bb+rnd(2.5,4));return{...n,bath,sleep:clamp(n.sleep-10,50,97),times:motionTimes(n.motion,[23,29])};}
 if(sc==="restless"){const motion=Math.round(mb*rnd(1.8,2.4));return{...n,motion,sleep:clamp(88-(motion-mb)*2.4,50,97),times:motionTimes(motion,[26,28])};}
 if(sc==="isolated")return{...n,roomHours:rnd(24,31)};
 return n;
}
function makeResident(s,sc){
 const history=Array.from({length:30},(_,i)=>normalNight(s,i));
 return{...s,history,tonight:scenarioNight(normalNight(s,30),sc,s.bathBase,s.motionBase),battery:s.room===117?12:irnd(55,100)};
}
/* Scripted opening week, then a low random rate.
   day is the night about to be generated (incremented after simulate runs). */
function scenarioFor(r){
 const nextDay=day+1;
 if(nextDay===2||nextDay===3||nextDay===5)return null;          /* quiet */
 if(nextDay===4)return r.room===108?"restless":null;            /* one restlessness */
 if(nextDay===6)return r.room===114?"bath":null;                /* one bathroom activity */
 const roll=Math.random();
 return roll<0.015?"bath":roll<0.04?"restless":roll<0.05?"isolated":null;
}
function simulate(r){
 // Days 2 to 6 follow a scripted sequence so a prospect clicking through sees
 // quiet mornings before a catch. Day 7 onward reverts to a low random rate.
 const sc=scenarioFor(r);
 const history=[...r.history.slice(1),r.tonight];
 return{...r,history,tonight:scenarioNight(normalNight(r,30+day),sc,avg(history.map(h=>h.bath)),avg(history.map(h=>h.motion))),battery:Math.max(5,r.battery-irnd(0,2))};
}

/* ============ the intelligence layer ============ */
function score(r){
 const recent=r.history.slice(-14);
 const bb=Math.round(avg(recent.map(h=>h.bath))*10)/10;
 const mb=Math.round(avg(recent.map(h=>h.motion)));
 const flags=[];
  if(r.tonight.bath>bb+2)flags.push({id:"bath-"+r.room,kind:"Bathroom Activity",level:"red",
  msg:r.tonight.bath+" bathroom visits overnight. "+first(r)+"'s 14 day baseline is "+bb+".",
  action:"Flagged for wellness review.",
  conf:"Deviation confidence: high · 30 night baseline"});
 if(r.tonight.motion>mb*1.5)flags.push({id:"rest-"+r.room,kind:"Overnight Restlessness",level:"yellow",
  msg:r.tonight.motion+" motion events overnight. Baseline is "+mb+". Sleep score "+r.tonight.sleep+" of 100.",
  action:"Flagged for morning huddle.",
  conf:"Deviation confidence: high · 30 night baseline"});
 if(r.tonight.roomHours>=24)flags.push({id:"iso-"+r.room,kind:"Extended Time in Room",level:"yellow",
  msg:Math.round(r.tonight.roomHours)+" hours without a room exit. Threshold is personalized to this resident.",
  action:"Flagged for staff visit.",
  conf:"Deviation confidence: medium · threshold personalized"});
 let risk=1+flags.reduce((n,f)=>n+(f.level==="red"?2:1),0);
 if(flags.length&&r.age>=85)risk+=1;
 risk=Math.min(5,risk);
 const trend7=avg(r.history.slice(-7).map(h=>h.sleep))-avg(r.history.slice(-21,-7).map(h=>h.sleep));
 return{...r,bathBase:bb,motionBase:mb,flags,risk,trend7};
}

/* ============ state ============ */
let residents=SEEDS.map((s,i)=>makeResident(s,i===0?"bath":i===1?"restless":i===2?"isolated":null));
let day=1,page="huddle",selectedRoom=null,profTab="overview",acks={};
let clockMin=6*60,feedItems=[{t:"06:00",room:null,text:"Morning Huddle Report generated"}];
const FEED=[{text:"Motion detected · bedroom"},{text:"Motion detected · bathroom"},{text:"Door opened"},{text:"Door closed"}];

function nowLabel(){const h=String(Math.floor(clockMin/60)).padStart(2,"0");const m=String(clockMin%60).padStart(2,"0");return h+":"+m;}
function scoredAll(){return residents.map(score).sort((a,b)=>b.risk-a.risk);}

/* ============ SVG chart builders ============ */
let gid=0;
function lineChart(o){
 /* o: {vals, mean, band, color, unit, label, hot}. Smooth area line with baseline band. */
 const W=560,H=140,P=8;gid++;
 const all=[...o.vals,o.mean+o.band,o.mean-o.band];
 let lo=Math.min(...all),hi=Math.max(...all);
 const pad=(hi-lo)*0.15||1;lo-=pad;hi+=pad;
 const X=i=>P+i*(W-2*P)/(o.vals.length-1);
 const Y=v=>H-P-(v-lo)/(hi-lo)*(H-2*P);
 let d="M"+X(0)+" "+Y(o.vals[0]);
 for(let i=1;i<o.vals.length;i++){const mx=(X(i-1)+X(i))/2;d+=" Q"+X(i-1)+" "+Y(o.vals[i-1])+" "+mx+" "+((Y(o.vals[i-1])+Y(o.vals[i]))/2);}
 d+=" T"+X(o.vals.length-1)+" "+Y(o.vals[o.vals.length-1]);
 const area=d+" L"+X(o.vals.length-1)+" "+(H-P)+" L"+X(0)+" "+(H-P)+" Z";
 const li=o.vals.length-1;
 return '<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;height:auto;display:block">'
  +'<defs><linearGradient id="g'+gid+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+o.color+'" stop-opacity=".22"/><stop offset="100%" stop-color="'+o.color+'" stop-opacity="0"/></linearGradient></defs>'
  +'<rect x="'+P+'" y="'+Y(o.mean+o.band)+'" width="'+(W-2*P)+'" height="'+Math.max(2,Y(o.mean-o.band)-Y(o.mean+o.band))+'" fill="#2F5148" opacity=".07" rx="3"/>'
  +'<line x1="'+P+'" x2="'+(W-P)+'" y1="'+Y(o.mean)+'" y2="'+Y(o.mean)+'" stroke="#2F5148" stroke-dasharray="4 4" stroke-width="1.2" opacity=".55"/>'
  +'<path d="'+area+'" fill="url(#g'+gid+')"/>'
  +'<path d="'+d+'" fill="none" stroke="'+o.color+'" stroke-width="2.2" stroke-linecap="round"/>'
  +'<circle cx="'+X(li)+'" cy="'+Y(o.vals[li])+'" r="4.5" fill="'+(o.hot?'#E39A2D':o.color)+'" stroke="#fff" stroke-width="1.5"/>'
  +'<text x="'+(W-P)+'" y="'+(Y(o.vals[li])-9)+'" text-anchor="end" font-family="IBM Plex Mono" font-size="10.5" fill="'+(o.hot?'#B47A1B':'#5C6B64')+'">'+o.vals[li]+' '+o.unit+'</text>'
  +'<text x="'+(P+2)+'" y="'+(Y(o.mean)-5)+'" font-family="IBM Plex Mono" font-size="9.5" fill="#5C6B64">baseline '+o.mean+'</text>'
  +'</svg>'
  +'<div style="display:flex;justify-content:space-between;font-family:\'IBM Plex Mono\',monospace;font-size:10px;color:var(--ink-soft);margin-top:3px"><span>30 nights ago</span><span>15 nights ago</span><span'+(o.hot?' style="color:var(--alert)"':'')+'>last night</span></div>';
}
function chartBox(title,sub,inner){
 return '<div class="chartbox"><div class="ch"><b>'+title+'</b><span class="mono">'+sub+'</span></div>'+inner+'</div>';
}
function miniLine(vals,color,w,h){
 w=w||90;h=h||26;
 const lo=Math.min(...vals),hi=Math.max(...vals),pad=(hi-lo)*0.2||1;
 const X=i=>i*w/(vals.length-1);
 const Y=v=>h-2-(v-(lo-pad))/((hi+pad)-(lo-pad))*(h-4);
 const pts=vals.map((v,i)=>X(i)+","+Y(v)).join(" ");
 return '<svg class="minispark" width="'+w+'" height="'+h+'" aria-hidden="true"><polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.8" stroke-linecap="round"/><circle cx="'+X(vals.length-1)+'" cy="'+Y(vals[vals.length-1])+'" r="2.6" fill="'+color+'"/></svg>';
}
function riskRing(risk){
 const p=risk*20;const c=risk>=4?"var(--red)":risk>=2?"var(--alert)":"var(--ok)";
 return '<div class="riskring" style="--p:'+p+';--rc:'+c+'" title="Deviation score '+risk+' of 5"><div>'+risk+'</div></div>';
}
function avatarHtml(r,size){const ini=r.name.split(" ").map(w=>w[0]).join("");
 return '<div class="avatar" style="width:'+size+'px;height:'+size+'px;background:hsl('+r.hue+' 32% 86%);color:hsl('+r.hue+' 35% 30%);font-size:'+Math.round(size*0.34)+'px">'+ini+'</div>';}
function flagChip(f){
 const key=day+"-"+f.id;const at=acks[key];
 return '<div class="fchip '+f.level+(at?' acked':'')+'">'
  +'<div class="frow"><span class="fk">'+(f.level==="red"?"Red":"Yellow")+' · '+f.kind+'</span>'
  +(at?'<span class="ackdone">✓ Acknowledged '+at.at+' · '+at.mins+' min response</span>'
      :'<button class="ackbtn" data-act="ack" data-id="'+f.id+'">Acknowledge</button>')
  +'</div><div class="fm">'+f.msg+'</div>'
  +(at?'':'<div class="fa">'+f.action+'</div><div class="fc">'+f.conf+'</div>')+'</div>';
}

/* ============ renderers ============ */
function render(){
 const scored=scoredAll();
 const flagged=scored.filter(r=>r.flags.length);
 const open=flagged.reduce((n,r)=>n+r.flags.filter(f=>!acks[day+"-"+f.id]).length,0);
 const low=residents.filter(r=>r.battery<20).length;
 const sel=selectedRoom?scored.find(r=>r.room===selectedRoom):null;

 ["huddle","residents","floor","sensors","calibration"].forEach(p=>$("nav-"+p).classList.toggle("active",page===p&&!sel));
 $("flagbadge").style.display=open?"inline":"none";$("flagbadge").textContent=open;
 $("crumb").textContent="Willow Creek · East Wing";
 $("dateline").textContent="Day "+day+" · report generated 06:00";
 $("pagetitle").textContent=sel?sel.name:(page==="huddle"?"Morning Huddle Report":page==="residents"?"Residents":page==="floor"?"Floor view":page==="sensors"?"Sensor health":"Calibration");

 if(sel){$("main").innerHTML=renderProfile(sel);return;}
 if(page==="huddle")$("main").innerHTML=renderHuddle(scored,flagged,open,low);
 else if(page==="residents")$("main").innerHTML=renderResidents(scored);
 else if(page==="floor")$("main").innerHTML=renderFloor(scored);
 else if(page==="sensors")$("main").innerHTML=renderSensors();
 else $("main").innerHTML=renderCalibration();
}

/* Illustrative pilot rollout. Deliberately not driven by the demo day counter,
   which represents a single night rather than a pilot week. */
function renderCalibration(){
 const WEEK=8, TOTAL=12;
 const alerts=[
  {name:"Bathroom Activity", measures:"Nighttime bathroom visits against a 14 day personal baseline",
   status:"Live", when:"Activated week 5", tone:"lo"},
  {name:"Overnight Restlessness", measures:"Overnight motion volume and timing against a personal baseline",
   status:"Live", when:"Activated week 7", tone:"lo"},
  {name:"Extended Time in Room", measures:"Hours since last room exit against a per resident threshold",
   status:"Silent", when:"Scheduled week 9", tone:"med"}
 ];
 const usefulness=[62,71,78,84,88,92];

 let h='<div class="seclabel">Calibration · Willow Creek pilot</div>';

 /* what this page is for */
 h+='<div class="card" style="padding:20px 22px;margin-bottom:16px">'
  +'<p style="font-size:15px;line-height:1.6;margin:0 0 14px">Alerts do not all switch on at install. Each type runs silent while it builds a baseline, then activates on its own schedule once your team is ready for it. This page shows where the pilot currently stands and every threshold change made so far.</p>'
  +'<div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">'
  +'<div class="mono" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft)">Pilot week '+WEEK+' of '+TOTAL+'</div>'
  +'<div style="flex:1;min-width:180px;height:7px;border-radius:99px;background:var(--line);overflow:hidden">'
  +'<div style="width:'+Math.round(WEEK/TOTAL*100)+'%;height:100%;background:var(--pine)"></div></div>'
  +'<div class="mono" style="font-size:11px;color:var(--ink-soft)">Review at week 12</div></div></div>';

 /* alert status */
 h+='<div class="seclabel" style="margin-top:22px">Alert types</div>'
  +'<div class="card" style="overflow:hidden;margin-bottom:20px">'
  +alerts.map(function(a){
    return '<div class="rowitem" style="align-items:flex-start">'
     +'<div style="flex:1;min-width:0">'
     +'<div style="font-weight:600;font-size:15px">'+a.name+'</div>'
     +'<div style="font-size:13px;color:var(--ink-soft);line-height:1.5;margin-top:2px">'+a.measures+'</div></div>'
     +'<div style="text-align:right;flex-shrink:0">'
     +'<span class="rw '+a.tone+'" style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;border-radius:999px;padding:2px 10px;display:inline-block">'+a.status+'</span>'
     +'<div class="mono" style="font-size:10.5px;color:var(--ink-soft);margin-top:5px">'+a.when+'</div></div></div>';
  }).join("")
  +'</div>';

 /* usefulness + changelog */
 h+='<div class="two-col">'
  +'<div class="panel"><h4>Staff rated alert usefulness</h4>'
  +'<p style="font-size:13px;color:var(--ink-soft);line-height:1.55;margin-bottom:12px">On the weekly call, your team rates what share of the previous week\u2019s alerts were worth acting on. This number is theirs, not ours.</p>'
  +miniLine(usefulness,"#2F5148",190,48)
  +'<div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink-soft);margin-top:4px" class="mono"><span>Week 3</span><span>Week 8</span></div>'
  +'<div class="kv" style="margin-top:10px"><b>Current</b><span class="mono" style="color:var(--ok-t)">'+usefulness[usefulness.length-1]+'% rated useful</span></div>'
  +'<div class="kv"><b>At activation</b><span class="mono">'+usefulness[0]+'%</span></div>'
  +'</div>'
  +'<div class="panel"><h4>Threshold changes <span class="mono">most recent first</span></h4>'
  +'<p style="font-size:13px;color:var(--ink-soft);line-height:1.55;margin-bottom:10px">Every adjustment is logged, with the reason and the week it was made.</p>'
  +'<div class="evt"><span class="ed">Week 7</span><span class="edot system"></span><span>Room 126 room exit threshold extended to 30 hours. Care team noted longer room time is normal for this resident.</span></div>'
  +'<div class="evt"><span class="ed">Week 6</span><span class="edot system"></span><span>Room 105 bathroom threshold raised from 5 to 6 visits after two alerts staff judged to be noise.</span></div>'
  +'<div class="evt"><span class="ed">Week 5</span><span class="edot note"></span><span>Bathroom Activity alerts activated for the pilot wing.</span></div>'
  +'<div class="evt"><span class="ed">Week 1</span><span class="edot note"></span><span>Sensors installed. System running silent while baselines build.</span></div>'
  +'</div></div>'
  +'<p style="font-size:13.5px;color:var(--ink-soft);margin-top:18px;line-height:1.6">Alerts start silent and activate one type at a time. Thresholds are tuned with your staff every week, because a system nobody trusts is a system nobody reads.</p>';

 return h;
}

function renderHuddle(scored,flagged,open,low){
 const clear=scored.filter(r=>!r.flags.length);
 const wingSleep=scored.map(r=>r.history.slice(-14).map(h=>h.sleep));
 const sleepByNight=wingSleep[0].map((_,i)=>Math.round(avg(wingSleep.map(a=>a[i]))));
 const acked=Object.values(acks).filter(a=>a&&typeof a==="object");
 const med=acked.length?Math.round(avg(acked.map(a=>a.mins))):null;
 let h='<div class="stats">'
  +'<div class="card stat"><div class="sv" style="color:'+(open?'var(--alert)':'var(--ok)')+'">'+open+'</div><div class="sl">open items</div><div class="sd '+(open?'up':'flat')+'">'+(open?'awaiting review':'none open')+'</div></div>'
  +'<div class="card stat"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="sv">'+sleepByNight[sleepByNight.length-1]+'</div><div class="sl">wing sleep index</div></div>'+miniLine(sleepByNight,"#2F5148")+'</div><div class="sd flat">14 night trend</div></div>'
  +'<div class="card stat"><div class="sv" style="color:'+(med!==null?'var(--ok-t)':'var(--ink-soft)')+'">'+(med!==null?med+' min':'n/a')+'</div><div class="sl">median response time</div><div class="sd flat">'+(med!==null?acked.length+' event'+(acked.length>1?'s':'')+' acknowledged':'no events acknowledged yet')+'</div></div>'
  +'<div class="card stat"><div class="sv" style="color:'+(low?'var(--alert)':'var(--ok)')+'">'+(scored.length*3-low)+'/'+(scored.length*3)+'</div><div class="sl">sensors reporting</div><div class="sd '+(low?'up':'flat')+'">'+(low?low+' low battery':'all reporting')+'</div></div></div>';

 h+='<div class="seclabel">'+(flagged.length?("Flagged for review · "+flagged.length+" resident"+(flagged.length>1?"s":"")):"No deviations detected")+'</div>';
 if(!flagged.length)h+='<div class="card" style="padding:24px;font-size:15px;color:var(--ink-soft);display:flex;gap:12px;align-items:center"><span style="width:10px;height:10px;border-radius:99px;background:var(--ok)"></span>All residents remained within their own baselines overnight. No items for this morning’s huddle.</div>';
 h+='<div style="display:grid;gap:14px">'+flagged.map(r=>
  '<div class="card clickable rescard" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +'<div class="reshead">'+avatarHtml(r,44)
  +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:16.5px">'+r.name+' <span class="mono" style="font-size:11px;color:var(--ink-soft);font-weight:400">· '+r.age+' · RM '+r.room+'</span></div>'
  +'<div class="mono" style="font-size:11px;color:var(--ink-soft)">'+r.care+' · '+r.mobility+'</div></div>'
  +miniLine(r.history.slice(-14).map(x=>x.sleep).concat(r.tonight.sleep),"#5C6B64")
  +riskRing(r.risk)+'</div>'
  +'<div class="resbody">'+r.flags.map(f=>flagChip(f)).join("")+'</div></div>').join("")+'</div>';

 h+='<div class="seclabel" style="margin-top:28px">No deviations · within baseline</div><div class="card" style="overflow:hidden">'
  +clear.map(r=>'<div class="rowitem clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +avatarHtml(r,30)+'<span style="font-weight:500;font-size:14.5px;flex:1">'+r.name+' <span class="mono" style="font-size:10.5px;color:var(--ink-soft)">'+r.age+'</span></span>'
  +miniLine(r.history.slice(-14).map(x=>x.sleep),"#9AA8A0")
  +'<span class="mono" style="font-size:11.5px;color:var(--ok-t);width:110px;text-align:right">Within baseline</span></div>').join("")+'</div>';
 return h;
}

function renderResidents(scored){
 return '<div class="seclabel">Resident roster · sorted by deviation score</div><div class="card" style="overflow:hidden">'
  +scored.map(r=>'<div class="rowitem clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +avatarHtml(r,36)
  +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14.5px">'+r.name+'</div><div class="mono" style="font-size:10.5px;color:var(--ink-soft)">'+r.age+' · RM '+r.room+' · '+r.mobility+'</div></div>'
  +'<div style="width:140px" class="mono" style="font-size:11px">'+r.conditions.slice(0,1).map(c=>'<span class="chip">'+c+'</span>').join("")+'</div>'
  +miniLine(r.history.slice(-14).map(x=>x.sleep),r.flags.length?"#E39A2D":"#9AA8A0")
  +riskRing(r.risk)+'</div>').join("")+'</div>';
}

function renderFloor(scored){
 const st=function(r){return r.flags.some(function(f){return f.level==="red";})?"r":(r.flags.length?"y":"");};
 const statusLabel=function(r){
  if(!r.flags.length)return "Within baseline";
  if(r.flags.length>1)return r.flags.length+" deviations";
  return r.flags[0].kind;
 };
 const col=function(x){return x==="r"?"var(--red-t)":x==="y"?"#8F5D0E":"var(--ok-t)";};
 const pill=function(x){return x==="r"?"hi":x==="y"?"med":"lo";};

 const byRoom=scored.slice().sort(function(a,b){return a.room-b.room;});
 const red=scored.filter(function(r){return r.flags.some(function(f){return f.level==="red";});}).length;
 const yellow=scored.filter(function(r){return r.flags.length&&!r.flags.some(function(f){return f.level==="red";});}).length;
 const clear=scored.length-red-yellow;
 const lowBat=residents.filter(function(r){return r.battery<20;}).length;

 let h='<div class="seclabel">Floor status · East Wing</div>';

 /* summary strip */
 h+='<div class="card" style="padding:16px 18px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:22px;align-items:center">'
  +'<div><div class="mono" style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Rooms monitored</div>'
  +'<div style="font-size:20px;font-weight:600">'+scored.length+'</div></div>'
  +'<div><div class="mono" style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Within baseline</div>'
  +'<div style="font-size:20px;font-weight:600;color:var(--ok-t)">'+clear+'</div></div>'
  +'<div><div class="mono" style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Flagged for review</div>'
  +'<div style="font-size:20px;font-weight:600;color:'+((red+yellow)?'#8F5D0E':'var(--ink-soft)')+'">'+(red+yellow)+'</div></div>'
  +'<div><div class="mono" style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Sensors online</div>'
  +'<div style="font-size:20px;font-weight:600;color:'+(lowBat?'#8F5D0E':'var(--ok-t)')+'">'+(scored.length*3-lowBat)+' / '+(scored.length*3)+'</div></div>'
  +'<div style="margin-left:auto;text-align:right"><div class="mono" style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)">Last updated</div>'
  +'<div class="mono" style="font-size:13px">'+nowLabel()+' · Day '+day+'</div></div></div>';

 /* room tiles */
 h+='<div class="card" style="padding:22px"><div class="rooms-grid">'
  +byRoom.map(function(r){
    const x=st(r);
    const bathOff=r.tonight.bath-r.bathBase;
    const detail=r.flags.length
      ? (r.flags[0].kind==="Bathroom Activity"
          ? r.tonight.bath+' visits · baseline '+r.bathBase
          : r.flags[0].kind==="Overnight Restlessness"
            ? r.tonight.motion+' events · baseline '+r.motionBase
            : Math.round(r.tonight.roomHours)+' h without room exit')
      : 'Sleep '+r.tonight.sleep+' · '+r.tonight.bath+' visits';
    return '<div class="room '+x+' clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
     +'<div class="mono" style="font-size:10.5px;letter-spacing:.1em;color:var(--ink-soft)">ROOM '+r.room+'</div>'
     +'<div style="font-weight:600;font-size:14px;margin:5px 0 1px">'+first(r).charAt(0)+'. '+last(r)+'</div>'
     +'<div class="mono" style="font-size:10px;color:var(--ink-soft);margin-bottom:8px">'+r.mobility+'</div>'
     +'<span class="rw '+pill(x)+'" style="font-family:\'IBM Plex Mono\',monospace;font-size:10px;border-radius:999px;padding:2px 8px;display:inline-block">'+statusLabel(r)+'</span>'
     +'<div class="mono" style="font-size:10px;color:'+col(x)+';margin-top:7px;line-height:1.4">'+detail+'</div>'
     +'</div>';
  }).join("")
  +'</div>';

 /* legend */
 h+='<div style="display:flex;flex-wrap:wrap;gap:20px;margin-top:20px;padding-top:16px;border-top:1px solid var(--line);font-size:12.5px;color:var(--ink-soft)">'
  +'<span><span style="color:var(--ok)">\u25cf</span> Within baseline</span>'
  +'<span><span style="color:var(--alert)">\u25cf</span> Flagged for review</span>'
  +'<span><span style="color:var(--red)">\u25cf</span> Flagged, priority review</span>'
  +'<span style="margin-left:auto">Select a room for the full overnight record.</span></div></div>';

 return h;
}

function renderSensors(){
 return '<div class="seclabel">Sensor health · three devices per room</div><div class="card" style="overflow:hidden">'
  +residents.slice().sort((a,b)=>a.room-b.room).map(r=>
   '<div class="rowitem"><span class="mono" style="width:60px;color:var(--ink-soft);font-size:12px">RM '+r.room+'</span>'
   +'<span style="flex:1;font-weight:500;font-size:14px">'+r.name+'</span>'
   +'<span class="mono" style="font-size:12px;color:var(--ok-t)">3 of 3 reporting</span>'
   +'<span class="mono" style="font-size:12px;width:100px;text-align:right;color:'+(r.battery<20?'#8F5D0E':'var(--ink-soft)')+'">Battery '+r.battery+'%</span></div>').join("")
  +'</div><p style="font-size:13px;color:var(--ink-soft);margin-top:14px">Battery levels are reported three weeks ahead of failure, so replacements are scheduled into housekeeping rounds rather than handled as emergencies.</p>';
}

/* ---- resident profile: overview | trends | profile & history ---- */
function renderProfile(r){
 let h='<button data-act="back" style="background:none;border:none;color:var(--pine);font-weight:600;font-size:13.5px;cursor:pointer;padding:0;margin-bottom:14px;font-family:inherit">← Back</button>';
 h+='<div class="card" style="overflow:hidden;margin-bottom:16px">';
 h+='<div class="prof-head">'+avatarHtml(r,62)
  +'<div style="flex:1;min-width:220px"><div class="serif" style="font-size:24px">'+r.name+'</div>'
  +'<div class="prof-meta mono" style="font-size:11.5px">Age '+r.age+' · Room '+r.room+' · '+r.care+' · Resident since '+r.since+'</div>'
  +'<div class="chips">'+r.conditions.map(c=>'<span class="chip">'+c+'</span>').join("")+'<span class="chip">'+r.mobility+'</span></div></div>'
  +'<div style="text-align:center">'+riskRing(r.risk)+'<div class="mono" style="font-size:10px;color:var(--ink-soft);margin-top:4px">deviation score</div></div>'
  +'</div>';
 h+='<div class="tabs">'
  +'<button class="tab'+(profTab==="overview"?" active":"")+'" data-act="set-tab" data-tab="overview">Overnight</button>'
  +'<button class="tab'+(profTab==="trends"?" active":"")+'" data-act="set-tab" data-tab="trends">30 night trends</button>'
  +'<button class="tab'+(profTab==="history"?" active":"")+'" data-act="set-tab" data-tab="history">Profile &amp; history</button>'
  +'</div><div class="prof-body">';
 if(profTab==="overview")h+=profOverview(r);
 else if(profTab==="trends")h+=profTrends(r);
 else h+=profHistory(r);
 h+='</div></div>';
 return h;
}
function profOverview(r){
 let h="";
 if(r.flags.length)h+='<div style="margin-bottom:14px">'+r.flags.map(f=>flagChip(f)).join("")+'</div>';
 else h+='<div class="fchip" style="background:var(--ok-soft);border-left-color:var(--ok);margin-bottom:14px"><span class="fk" style="color:var(--ok-t)">Within baseline</span><div class="fm" style="color:var(--ink-soft)">'+first(r)+' remained within all personal baselines overnight. Sleep index '+r.tonight.sleep+' of 100.</div></div>';
 h+='<div class="panel" style="margin-bottom:14px"><h4>Overnight motion record <span class="mono">'+r.tonight.motion+' motion events · '+r.tonight.bath+' bathroom visits</span></h4><div class="tl">'
  +r.tonight.times.map(t=>'<i style="left:'+(((t-22)/8)*100)+'%"></i>').join("")
  +'</div><div class="tl-x"><span>10 PM</span><span>12 AM</span><span>2 AM</span><span>4 AM</span><span>6 AM</span></div>'
  +'<div style="font-size:12.5px;color:var(--ink-soft);margin-top:8px">Each mark is a single motion event. Clustering in the early hours is what the system measures as a deviation from this resident’s baseline.</div></div>';
 h+='<div class="two-col"><div class="panel"><h4>Overnight summary vs baseline</h4>'
  +'<div class="kv"><b>Bathroom visits</b><span class="mono">'+r.tonight.bath+' <span style="opacity:.6">/ '+r.bathBase+' baseline</span></span></div>'
  +'<div class="kv"><b>Motion events</b><span class="mono">'+r.tonight.motion+' <span style="opacity:.6">/ '+r.motionBase+' baseline</span></span></div>'
  +'<div class="kv"><b>Sleep score</b><span class="mono">'+r.tonight.sleep+' / 100</span></div>'
  +'<div class="kv"><b>Hours since room exit</b><span class="mono" '+(r.tonight.roomHours>=24?'style="color:var(--red-t)"':'')+'>'+Math.round(r.tonight.roomHours)+' h</span></div></div>'
  +'<div class="panel"><h4>Care team watch list</h4><p style="font-size:13.5px;color:var(--ink-soft);line-height:1.6">'+r.watch+'</p>'
  +'<div style="margin-top:10px;font-size:11px" class="mono"><span style="color:var(--ink-soft)">7 night sleep trend: </span><span class="'+(r.trend7<-3?"up":"flat")+'">'+(r.trend7>0?"+":"")+Math.round(r.trend7)+' pts'+(r.trend7<-3?" · declining":"")+'</span></div></div></div>';
 const ackedFlag=r.flags.find(function(f){return acks[day+"-"+f.id];});
 if(ackedFlag){
  const a=acks[day+"-"+ackedFlag.id];
  h+='<div class="panel" style="margin-top:14px">'
   +'<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">'
   +'<h4 style="margin:0">Event timeline <span class="mono">exportable</span></h4>'
   +'<button class="ackbtn" data-act="export" data-room="'+r.room+'">Export timeline</button></div>'
   +'<div class="evt" style="margin-top:10px"><span class="ed">06:00</span><span class="edot system"></span><span>Deviation detected. '+ackedFlag.kind+'. '+ackedFlag.msg+'</span></div>'
   +'<div class="evt"><span class="ed">06:00</span><span class="edot note"></span><span>Routed to on shift lead.</span></div>'
   +'<div class="evt"><span class="ed">'+a.at+'</span><span class="edot resolved"></span><span>Acknowledged by staff. Response time '+a.mins+' minute'+(a.mins===1?'':'s')+'.</span></div>'
   +'<p style="font-size:12.5px;color:var(--ink-soft);margin-top:10px">Every flagged event produces a timestamped record. Nothing is reconstructed from memory.</p></div>';
 }
 return h;
}

/* Downloads the timeline for one resident. Real file, not a stub, so the
   documentation claim on the marketing page is demonstrably true. */
function exportTimeline(room){
 const r=scoredAll().find(function(x){return x.room===room;});
 if(!r)return;
 const f=r.flags.find(function(x){return acks[day+"-"+x.id];});
 const a=f?acks[day+"-"+f.id]:null;
 const lines=[
  "Baseline event timeline",
  "Room "+r.room+" | Day "+day,
  "",
  "06:00  Deviation detected. "+(f?f.kind+". "+f.msg:"none"),
  "06:00  Routed to on shift lead."
 ];
 if(a)lines.push(a.at+"  Acknowledged by staff. Response time "+a.mins+" min.");
 lines.push("");
 lines.push("Generated from sensor events. No video or audio exists.");
 const blob=new Blob([lines.join("\n")],{type:"text/plain"});
 const url=URL.createObjectURL(blob);
 const el=document.createElement("a");
 el.href=url;
 el.download="baseline-timeline-room"+r.room+"-day"+day+".txt";
 document.body.appendChild(el);
 el.click();
 document.body.removeChild(el);
 URL.revokeObjectURL(url);
}
function profTrends(r){
 const bath=r.history.map(x=>x.bath).concat(r.tonight.bath);
 const mot=r.history.map(x=>x.motion).concat(r.tonight.motion);
 const slp=r.history.map(x=>x.sleep).concat(r.tonight.sleep);
 const hotB=r.flags.some(f=>f.id.startsWith("bath"));
 const hotM=r.flags.some(f=>f.id.startsWith("rest"));
 return chartBox("Bathroom visits per night","trigger: baseline + 2",lineChart({vals:bath,mean:r.bathBase,band:Math.max(0.6,sd(bath.slice(0,-1))),color:"#2F5148",unit:"visits",hot:hotB}))
  +chartBox("Overnight motion events","trigger: baseline × 1.5",lineChart({vals:mot,mean:r.motionBase,band:Math.max(1.5,sd(mot.slice(0,-1))),color:"#2F5148",unit:"events",hot:hotM}))
  +chartBox("Sleep quality score","derived from motion timing and fragmentation",lineChart({vals:slp,mean:Math.round(avg(slp.slice(0,-1))),band:Math.max(3,sd(slp.slice(0,-1))),color:"#4E8563",unit:"/100",hot:hotM}))
  +'<p style="font-size:12.5px;color:var(--ink-soft)">The shaded band is '+first(r)+"'s own normal range over 30 nights. Alerts fire when last night lands outside it, not when "+first(r)+" differs from other residents.</p>";
}
function profHistory(r){
 return '<div class="two-col"><div>'
  +'<div class="panel" style="margin-bottom:14px"><h4>Behavioral profile</h4>'
  +'<div class="kv"><b>Sleep pattern</b><span style="text-align:right;max-width:60%">'+r.chronotype+'</span></div>'
  +'<div class="kv"><b>Social pattern</b><span style="text-align:right;max-width:60%">'+r.social+'</span></div>'
  +'<div class="kv"><b>Mobility</b><span>'+r.mobility+'</span></div></div>'
  +'<div class="panel"><h4>Care team factors <span class="mono">on file</span></h4>'
  +'<div class="rf"><span>Age '+r.age+'</span><span class="rw '+(r.age>=85?"hi":r.age>=78?"med":"lo")+'">'+(r.age>=85?"high":r.age>=78?"moderate":"low")+'</span></div>'
  +r.priors.map(p=>'<div class="rf"><span>'+p+'</span><span class="rw med">factor</span></div>').join("")
  +'<div class="rf"><span>7 night sleep trend</span><span class="rw '+(r.trend7<-3?"hi":"lo")+'">'+(r.trend7<-3?"declining":"stable")+'</span></div></div>'
  +'</div><div>'
  +'<div class="panel"><h4>Care team notes <span class="mono">most recent first</span></h4>'
  +r.events.map(e=>'<div class="evt"><span class="ed">'+e.d+'</span><span class="edot '+e.type+'"></span><span>'+e.t+'</span></div>').join("")
  +'<div style="font-size:11.5px;color:var(--ink-soft);margin-top:10px" class="mono">✓ resolved flag · ● incident · system change · care note</div></div>'
  +'</div></div>';
}

function renderFeed(){
 $("feed").innerHTML=feedItems.map(e=>'<div class="feedrow"><span>'+e.t+'</span><span class="ft">'+(e.room?("Rm "+e.room+" · "):"")+e.text+'</span></div>').join("");
}

/* ============ actions ============ */
function go(p){page=p;selectedRoom=null;render();}
function openRes(room){selectedRoom=room;profTab="overview";render();window.scrollTo(0,0);}
function backToList(){selectedRoom=null;render();}
function setTab(t){profTab=t;render();}
function ack(id){acks[day+"-"+id]={at:nowLabel(),mins:clockMin-6*60};render();}
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

/* ============ delegated events (CSP safe: no inline handlers) ============ */
function handleAction(el,ev){
  switch(el.dataset.act){
    case "go":         go(el.dataset.page); break;
    case "open-res":   openRes(Number(el.dataset.room)); break;
    case "back":       backToList(); break;
    case "export":     exportTimeline(Number(el.dataset.room)); break;
    case "set-tab":    setTab(el.dataset.tab); break;
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
  if(el&&handleAction(el,ev))ev.preventDefault();
});

document.addEventListener("keydown",(ev)=>{
  if(ev.key!=="Enter"&&ev.key!==" ")return;
  const el=ev.target.closest?.("[data-act]");
  if(!el||el.tagName==="BUTTON"||el.tagName==="A")return;
  if(handleAction(el,ev))ev.preventDefault();
});

document.addEventListener("keydown",(ev)=>{
  if(ev.key==="Escape"&&!$("app").hidden)closeDemo();
});

/* ============ ambient feed ============ */
setInterval(()=>{
  if($("app").hidden)return;
  clockMin+=irnd(1,3);
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
