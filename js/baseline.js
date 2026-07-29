
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
  conditions:["Hypertension","Mild cognitive impairment","Osteoarthritis"],
  chronotype:"Early riser. Typically asleep by 9:45 PM, up by 6:15 AM.",
  social:"Common room most mornings. Rarely misses a meal in the dining hall.",
  events:[
   {d:"Jun 14",type:"resolved",t:"UTI flagged from bathroom frequency, confirmed by nurse and treated. Caught 2 days before visible symptoms."},
   {d:"Apr 02",type:"note",t:"Family reported mild evening confusion. Care team added evening check in."},
   {d:"Feb 21",type:"incident",t:"Fall in bathroom, no injury. A restlessness flag had fired that same morning."}],
  priors:["Prior UTI (Jun 2026)","Prior fall, no injury (Feb 2026)"],
  watch:"Bathroom frequency and evening restlessness. A prior UTI raises the chance of recurrence over the next 90 days."},
 {name:"Walter Smith",room:108,age:79,bathBase:2.0,motionBase:14,roomBase:8,hue:160,
  care:"Assisted living",since:"2024",mobility:"Cane",
  conditions:["Type 2 diabetes","Sleep apnea (untreated)","BPH"],
  chronotype:"Night owl. Rarely settles before 11:30 PM. Light sleeper.",
  social:"Keeps to himself mornings. Regular at the 2 PM card table.",
  events:[
   {d:"Jul 08",type:"system",t:"Baseline recalibrated after new mattress changed his motion signature."},
   {d:"May 19",type:"resolved",t:"Restlessness flags for 3 straight nights. Nurse review linked it to new medication timing. Adjusted, pattern resolved."}],
  priors:["Recurrent poor sleep stretches","Medication timing sensitivity"],
  watch:"Clustered restlessness after any medication change. His fall risk rises the morning after a fragmented night."},
 {name:"Rosa Garcia",room:121,age:88,bathBase:1.0,motionBase:9,roomBase:10,hue:320,
  care:"Assisted living",since:"2022",mobility:"Independent",
  conditions:["Depression (managed)","Hearing loss","Osteoporosis"],
  chronotype:"Consistent sleeper, 10 PM to 6 AM, few interruptions.",
  social:"Social patterns vary with mood. Withdrawal episodes noted twice this year.",
  events:[
   {d:"Mar 30",type:"resolved",t:"Isolation flag after 26 hours in room. Wellness check found untreated foot pain. Podiatry referral made."},
   {d:"Jan 12",type:"note",t:"Daughter moved out of state. Care team noted mood dip and increased room time for 2 weeks."}],
  priors:["Two withdrawal episodes (2026)","Osteoporosis raises injury severity if a fall occurs"],
  watch:"Room time trend. For Rosa, isolation flags have twice pointed to something physical, not just mood."},
 {name:"Harold Chen",room:102,age:76,bathBase:2.5,motionBase:16,roomBase:5,hue:200,
  care:"Assisted living",since:"2025",mobility:"Independent",
  conditions:["Atrial fibrillation","Mild hypertension"],
  chronotype:"Active sleeper. Higher motion at night is normal for Harold.",
  social:"Walks the courtyard twice daily. High activity is his baseline.",
  events:[{d:"Feb 04",type:"note",t:"Admitted Jan 2025. Baseline established in 26 nights."}],
  priors:["None logged"],
  watch:"Any drop in daytime activity. For a highly active resident, slowing down is the early signal."},
 {name:"Margaret Okafor",room:117,age:91,bathBase:1.0,motionBase:8,roomBase:7,hue:90,
  care:"Assisted living · high acuity",since:"2021",mobility:"Walker",
  conditions:["CHF (stable)","Chronic kidney disease","Arthritis"],
  chronotype:"Long sleeper, 9 PM to 7 AM. Low overnight motion.",
  social:"Mornings in the garden room. Family visits Sundays.",
  events:[
   {d:"May 27",type:"resolved",t:"Bathroom frequency flag. Nurse assessment ruled out UTI, linked to diuretic adjustment."},
   {d:"Mar 08",type:"incident",t:"ER visit for fluid overload. Returned after 3 days. Baseline paused and rebuilt."}],
  priors:["CHF hospitalization (Mar 2026)","Age 91 raises fall injury severity"],
  watch:"At 91 with CHF, small changes matter sooner. Her alert thresholds are set tighter than standard."},
 {name:"Frank DiMarco",room:105,age:81,bathBase:3.0,motionBase:18,roomBase:9,hue:250,
  care:"Assisted living",since:"2023",mobility:"Cane",
  conditions:["BPH","GERD","Anxiety"],
  chronotype:"Frequent bathroom trips are his normal. Baseline reflects it.",
  social:"Dining hall regular. Evening TV in the common room.",
  events:[{d:"Apr 22",type:"note",t:"3 nightly bathroom visits is normal for Frank. Thresholds are set against his baseline, so he is not over flagged."}],
  priors:["High but stable nighttime frequency"],
  watch:"His baseline is 3 visits a night, so his UTI trigger sits near 5. Personal baselines prevent false alarms for residents like Frank."},
 {name:"Alma Petersen",room:126,age:86,bathBase:1.5,motionBase:10,roomBase:12,hue:10,
  care:"Assisted living",since:"2024",mobility:"Walker",
  conditions:["Parkinson's (early)","Hypothyroidism"],
  chronotype:"Settles late, wakes early. Averages under 7 hours.",
  social:"Prefers her room. Longer room time is normal for Alma, so her isolation threshold is extended.",
  events:[{d:"Jun 02",type:"system",t:"Isolation threshold extended to 30 hours to match her documented preference for time in her room."}],
  priors:["Parkinson's progression is the key long term fall factor"],
  watch:"Overnight motion trend. Early Parkinson's can show up as gradually rising restlessness months before daytime changes."},
 {name:"George Whitfield",room:111,age:77,bathBase:2.0,motionBase:13,roomBase:6,hue:130,
  care:"Assisted living",since:"2025",mobility:"Independent",
  conditions:["COPD (mild)","Hyperlipidemia"],
  chronotype:"Steady 10:30 PM to 6:30 AM. Reliable rhythms.",
  social:"Morning coffee group. Volunteers at the library cart.",
  events:[{d:"Jul 15",type:"note",t:"Six months of clean baselines. One of the steadiest patterns on the wing."}],
  priors:["None logged"],
  watch:"COPD means a restless stretch in winter months deserves a respiratory check, not just a fatigue note."},
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
 if(sc==="uti"){const bath=Math.round(bb+rnd(2.5,4));return{...n,bath,sleep:clamp(n.sleep-10,50,97),times:motionTimes(n.motion,[23,29])};}
 if(sc==="restless"){const motion=Math.round(mb*rnd(1.8,2.4));return{...n,motion,sleep:clamp(88-(motion-mb)*2.4,50,97),times:motionTimes(motion,[26,28])};}
 if(sc==="isolated")return{...n,roomHours:rnd(24,31)};
 return n;
}
function makeResident(s,sc){
 const history=Array.from({length:30},(_,i)=>normalNight(s,i));
 return{...s,history,tonight:scenarioNight(normalNight(s,30),sc,s.bathBase,s.motionBase),battery:s.room===117?12:irnd(55,100)};
}
function simulate(r){
 // Incidence per resident per night. Tuned so an 80 bed community sees a
 // handful of flags each morning, not a wall of them.
 const roll=Math.random();const sc=roll<0.03?"uti":roll<0.055?"restless":roll<0.07?"isolated":null;
 const history=[...r.history.slice(1),r.tonight];
 return{...r,history,tonight:scenarioNight(normalNight(r,30+day),sc,avg(history.map(h=>h.bath)),avg(history.map(h=>h.motion))),battery:Math.max(5,r.battery-irnd(0,2))};
}

/* ============ the intelligence layer ============ */
function score(r){
 const recent=r.history.slice(-14);
 const bb=Math.round(avg(recent.map(h=>h.bath))*10)/10;
 const mb=Math.round(avg(recent.map(h=>h.motion)));
 const flags=[];
 if(r.tonight.bath>bb+2)flags.push({id:"uti-"+r.room,kind:"UTI Predictor",level:"red",
  msg:r.tonight.bath+" bathroom visits last night. "+first(r)+"'s normal is "+bb+". A sudden frequency increase is the leading early sign of a UTI.",
  action:"Nurse assessment this morning. Dip test if symptomatic.",
  conf:"Pattern confidence: high · 30 night baseline · age "+r.age});
 if(r.tonight.motion>mb*1.5)flags.push({id:"rest-"+r.room,kind:"Restlessness Index",level:"yellow",
  msg:r.tonight.motion+" motion events overnight. Normal is "+mb+". Poor sleep raises fall risk today"+(r.age>=85?", and at "+r.age+" a fall carries higher injury risk":"")+".",
  action:"Prioritize at morning rounds. Assist transfers.",
  conf:"Pattern confidence: high · sleep score "+r.tonight.sleep+"/100"});
 if(r.tonight.roomHours>=24)flags.push({id:"iso-"+r.room,kind:"Isolation Tracker",level:"yellow",
  msg:Math.round(r.tonight.roomHours)+" hours without leaving the room. May indicate low mood or unreported pain.",
  action:"Wellness check before lunch. Note mood and appetite.",
  conf:"Pattern confidence: medium · threshold personalized"});
 let risk=1+flags.reduce((n,f)=>n+(f.level==="red"?2:1),0);
 if(flags.length&&r.age>=85)risk+=1;                 /* age adjustment */
 risk=Math.min(5,risk);
 const trend7=avg(r.history.slice(-7).map(h=>h.sleep))-avg(r.history.slice(-21,-7).map(h=>h.sleep));
 return{...r,bathBase:bb,motionBase:mb,flags,risk,trend7};
}

/* ============ state ============ */
let residents=SEEDS.map((s,i)=>makeResident(s,i===0?"uti":i===1?"restless":i===2?"isolated":null));
let day=1,page="huddle",selectedRoom=null,profTab="overview",acks={};
let clockMin=6*60,feedItems=[{t:"06:00",room:null,text:"Morning Huddle Report generated"}];
const FEED=[{text:"Motion · bedroom"},{text:"Motion · bathroom"},{text:"Door · opened"},{text:"Door · closed"}];

function nowLabel(){const h=String(Math.floor(clockMin/60)).padStart(2,"0");const m=String(clockMin%60).padStart(2,"0");return h+":"+m;}
function scoredAll(){return residents.map(score).sort((a,b)=>b.risk-a.risk);}

/* ============ SVG chart builders ============ */
let gid=0;
function lineChart(o){
 /* o: {vals, mean, band, color, unit, label, hot} — smooth area line with baseline band */
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
 return '<div class="riskring" style="--p:'+p+';--rc:'+c+'" title="Risk '+risk+' of 5"><div>'+risk+'</div></div>';
}
function avatarHtml(r,size){const ini=r.name.split(" ").map(w=>w[0]).join("");
 return '<div class="avatar" style="width:'+size+'px;height:'+size+'px;background:hsl('+r.hue+' 32% 86%);color:hsl('+r.hue+' 35% 30%);font-size:'+Math.round(size*0.34)+'px">'+ini+'</div>';}
function flagChip(f){
 const key=day+"-"+f.id;const at=acks[key];
 return '<div class="fchip '+f.level+(at?' acked':'')+'">'
  +'<div class="frow"><span class="fk">'+(f.level==="red"?"Red":"Yellow")+' · '+f.kind+'</span>'
  +(at?'<span class="ackdone">✓ checked '+at+'</span>'
      :'<button class="ackbtn" data-act="ack" data-id="'+f.id+'">Mark checked</button>')
  +'</div><div class="fm">'+f.msg+'</div>'
  +(at?'':'<div class="fa"><b>Do:</b> '+f.action+'</div><div class="fc">'+f.conf+'</div>')+'</div>';
}

/* ============ renderers ============ */
function render(){
 const scored=scoredAll();
 const flagged=scored.filter(r=>r.flags.length);
 const open=flagged.reduce((n,r)=>n+r.flags.filter(f=>!acks[day+"-"+f.id]).length,0);
 const low=residents.filter(r=>r.battery<20).length;
 const sel=selectedRoom?scored.find(r=>r.room===selectedRoom):null;

 ["huddle","residents","floor","sensors"].forEach(p=>$("nav-"+p).classList.toggle("active",page===p&&!sel));
 $("flagbadge").style.display=open?"inline":"none";$("flagbadge").textContent=open;
 $("crumb").textContent="Willow Creek · East Wing";
 $("dateline").textContent="Day "+day+" · report generated 06:00";
 $("pagetitle").textContent=sel?sel.name:(page==="huddle"?"Morning Huddle Report":page==="residents"?"Residents":page==="floor"?"Floor view":"Sensor health");

 if(sel){$("main").innerHTML=renderProfile(sel);return;}
 if(page==="huddle")$("main").innerHTML=renderHuddle(scored,flagged,open,low);
 else if(page==="residents")$("main").innerHTML=renderResidents(scored);
 else if(page==="floor")$("main").innerHTML=renderFloor(scored);
 else $("main").innerHTML=renderSensors();
}

function renderHuddle(scored,flagged,open,low){
 const clear=scored.filter(r=>!r.flags.length);
 const wingSleep=scored.map(r=>r.history.slice(-14).map(h=>h.sleep));
 const sleepByNight=wingSleep[0].map((_,i)=>Math.round(avg(wingSleep.map(a=>a[i]))));
 const nightEvents=scored.reduce((n,r)=>n+r.tonight.motion,0);
 let h='<div class="stats">'
  +'<div class="card stat"><div class="sv" style="color:'+(open?'var(--alert)':'var(--ok)')+'">'+open+'</div><div class="sl">open flags</div><div class="sd '+(open?'up':'flat')+'">'+(open?'needs review':'all clear')+'</div></div>'
  +'<div class="card stat"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="sv">'+sleepByNight[sleepByNight.length-1]+'</div><div class="sl">wing sleep score</div></div>'+miniLine(sleepByNight,"#2F5148")+'</div><div class="sd flat">14 night trend</div></div>'
  +'<div class="card stat"><div class="sv">'+nightEvents+'</div><div class="sl">overnight motion events</div><div class="sd flat">across '+scored.length+' residents</div></div>'
  +'<div class="card stat"><div class="sv" style="color:'+(low?'var(--alert)':'var(--ok)')+'">'+(scored.length*3-low)+'/'+(scored.length*3)+'</div><div class="sl">sensors online</div><div class="sd '+(low?'up':'flat')+'">'+(low?low+' low battery':'healthy')+'</div></div></div>';

 h+='<div class="seclabel">'+(flagged.length?("Needs attention · "+flagged.length+" resident"+(flagged.length>1?"s":"")):"All quiet overnight")+'</div>';
 if(!flagged.length)h+='<div class="card" style="padding:24px;font-size:15px;color:var(--ink-soft);display:flex;gap:12px;align-items:center"><span style="width:10px;height:10px;border-radius:99px;background:var(--ok)"></span>Every resident stayed within their own baseline last night. This is what most mornings look like.</div>';
 h+='<div style="display:grid;gap:14px">'+flagged.map(r=>
  '<div class="card clickable rescard" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +'<div class="reshead">'+avatarHtml(r,44)
  +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:16.5px">'+r.name+' <span class="mono" style="font-size:11px;color:var(--ink-soft);font-weight:400">· '+r.age+' · RM '+r.room+'</span></div>'
  +'<div class="mono" style="font-size:11px;color:var(--ink-soft)">'+r.care+' · '+r.mobility+'</div></div>'
  +miniLine(r.history.slice(-14).map(x=>x.sleep).concat(r.tonight.sleep),"#5C6B64")
  +riskRing(r.risk)+'</div>'
  +'<div class="resbody">'+r.flags.map(f=>flagChip(f)).join("")+'</div></div>').join("")+'</div>';

 h+='<div class="seclabel" style="margin-top:28px">Within baseline</div><div class="card" style="overflow:hidden">'
  +clear.map(r=>'<div class="rowitem clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +avatarHtml(r,30)+'<span style="font-weight:500;font-size:14.5px;flex:1">'+r.name+' <span class="mono" style="font-size:10.5px;color:var(--ink-soft)">'+r.age+'</span></span>'
  +miniLine(r.history.slice(-14).map(x=>x.sleep),"#9AA8A0")
  +'<span class="mono" style="font-size:11.5px;color:var(--ok);width:86px;text-align:right">● baseline</span></div>').join("")+'</div>';
 return h;
}

function renderResidents(scored){
 return '<div class="seclabel">All residents · sorted by risk</div><div class="card" style="overflow:hidden">'
  +scored.map(r=>'<div class="rowitem clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
  +avatarHtml(r,36)
  +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14.5px">'+r.name+'</div><div class="mono" style="font-size:10.5px;color:var(--ink-soft)">'+r.age+' · RM '+r.room+' · '+r.mobility+'</div></div>'
  +'<div style="width:140px" class="mono" style="font-size:11px">'+r.conditions.slice(0,1).map(c=>'<span class="chip">'+c+'</span>').join("")+'</div>'
  +miniLine(r.history.slice(-14).map(x=>x.sleep),r.flags.length?"#E39A2D":"#9AA8A0")
  +riskRing(r.risk)+'</div>').join("")+'</div>';
}

function renderFloor(scored){
 const st=r=>r.flags.some(f=>f.level==="red")?"r":r.flags.length?"y":"";
 const lbl=r=>r.flags.length?r.flags[0].kind.split(" ")[0].toLowerCase():"baseline";
 const col=s=>s==="r"?"var(--red)":s==="y"?"var(--alert)":"var(--ok)";
 return '<div class="seclabel">East Wing · live room status</div><div class="card" style="padding:26px"><div class="rooms-grid">'
  +scored.slice().sort((a,b)=>a.room-b.room).map(r=>{const s=st(r);
   return '<div class="room '+s+' clickable" role="button" tabindex="0" data-act="open-res" data-room="'+r.room+'">'
   +'<div class="mono" style="font-size:11px;color:var(--ink-soft)">RM '+r.room+'</div>'
   +'<div style="font-weight:600;font-size:13.5px;margin:4px 0 2px">'+r.name.split(" ")[0][0]+'. '+last(r)+'</div>'
   +'<div class="mono" style="font-size:10px;color:var(--ink-soft);margin-bottom:5px">age '+r.age+'</div>'
   +'<span class="mono" style="font-size:10.5px;color:'+col(s)+'">● '+lbl(r)+'</span></div>';}).join("")
  +'</div><div style="display:flex;gap:18px;margin-top:20px;font-size:12px;color:var(--ink-soft)">'
  +'<span><span style="color:var(--ok)">●</span> within baseline</span><span><span style="color:var(--alert)">●</span> yellow flag</span><span><span style="color:var(--red)">●</span> red flag</span></div></div>';
}

function renderSensors(){
 return '<div class="seclabel">Device health · 3 sensors per room (bedroom motion · bathroom motion · door)</div><div class="card" style="overflow:hidden">'
  +residents.slice().sort((a,b)=>a.room-b.room).map(r=>
   '<div class="rowitem"><span class="mono" style="width:60px;color:var(--ink-soft);font-size:12px">RM '+r.room+'</span>'
   +'<span style="flex:1;font-weight:500;font-size:14px">'+r.name+'</span>'
   +'<span class="mono" style="font-size:12px;color:var(--ok)">3/3 online</span>'
   +'<span class="mono" style="font-size:12px;width:100px;text-align:right;color:'+(r.battery<20?'var(--alert)':'var(--ink-soft)')+'">battery '+r.battery+'%</span></div>').join("")
  +'</div><p style="font-size:13px;color:var(--ink-soft);margin-top:14px">Low battery sensors are flagged three weeks before they fail. Swaps happen on housekeeping rounds, never as emergencies.</p>';
}

/* ---- resident profile: overview | trends | profile & history ---- */
function renderProfile(r){
 let h='<button data-act="back" style="background:none;border:none;color:var(--pine);font-weight:600;font-size:13.5px;cursor:pointer;padding:0;margin-bottom:14px;font-family:inherit">← Back</button>';
 h+='<div class="card" style="overflow:hidden;margin-bottom:16px">';
 h+='<div class="prof-head">'+avatarHtml(r,62)
  +'<div style="flex:1;min-width:220px"><div class="serif" style="font-size:24px">'+r.name+'</div>'
  +'<div class="prof-meta mono" style="font-size:11.5px">Age '+r.age+' · Room '+r.room+' · '+r.care+' · Resident since '+r.since+'</div>'
  +'<div class="chips">'+r.conditions.map(c=>'<span class="chip">'+c+'</span>').join("")+'<span class="chip">'+r.mobility+'</span></div></div>'
  +'<div style="text-align:center">'+riskRing(r.risk)+'<div class="mono" style="font-size:10px;color:var(--ink-soft);margin-top:4px">risk · age adjusted</div></div>'
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
 else h+='<div class="fchip" style="background:var(--ok-soft);border-left-color:var(--ok);margin-bottom:14px"><span class="fk" style="color:var(--ok)">Within baseline</span><div class="fm" style="color:var(--ink-soft)">'+first(r)+' stayed within expected ranges last night. Sleep score '+r.tonight.sleep+'/100.</div></div>';
 h+='<div class="panel" style="margin-bottom:14px"><h4>Last night, minute by minute <span class="mono">'+r.tonight.motion+' motion events · '+r.tonight.bath+' bathroom visits</span></h4><div class="tl">'
  +r.tonight.times.map(t=>'<i style="left:'+(((t-22)/8)*100)+'%"></i>').join("")
  +'</div><div class="tl-x"><span>10 PM</span><span>12 AM</span><span>2 AM</span><span>4 AM</span><span>6 AM</span></div>'
  +'<div style="font-size:12.5px;color:var(--ink-soft);margin-top:8px">Each dot is one motion event. Clusters in the small hours are what the Restlessness Index reads as a bad night.</div></div>';
 h+='<div class="two-col"><div class="panel"><h4>Last night vs baseline</h4>'
  +'<div class="kv"><b>Bathroom visits</b><span class="mono">'+r.tonight.bath+' <span style="opacity:.6">/ '+r.bathBase+' baseline</span></span></div>'
  +'<div class="kv"><b>Motion events</b><span class="mono">'+r.tonight.motion+' <span style="opacity:.6">/ '+r.motionBase+' baseline</span></span></div>'
  +'<div class="kv"><b>Sleep score</b><span class="mono">'+r.tonight.sleep+' / 100</span></div>'
  +'<div class="kv"><b>Time without leaving room</b><span class="mono" '+(r.tonight.roomHours>=24?'style="color:var(--red)"':'')+'>'+Math.round(r.tonight.roomHours)+' h</span></div></div>'
  +'<div class="panel"><h4>What to watch</h4><p style="font-size:13.5px;color:var(--ink-soft);line-height:1.6">'+r.watch+'</p>'
  +'<div style="margin-top:10px;font-size:11px" class="mono"><span style="color:var(--ink-soft)">7 night sleep trend: </span><span class="'+(r.trend7<-3?"up":"flat")+'">'+(r.trend7>0?"+":"")+Math.round(r.trend7)+' pts'+(r.trend7<-3?" · declining":"")+'</span></div></div></div>';
 return h;
}
function profTrends(r){
 const bath=r.history.map(x=>x.bath).concat(r.tonight.bath);
 const mot=r.history.map(x=>x.motion).concat(r.tonight.motion);
 const slp=r.history.map(x=>x.sleep).concat(r.tonight.sleep);
 const hotB=r.flags.some(f=>f.id.startsWith("uti"));
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
  +'<div class="panel"><h4>Risk factors <span class="mono">age adjusted</span></h4>'
  +'<div class="rf"><span>Age '+r.age+'</span><span class="rw '+(r.age>=85?"hi":r.age>=78?"med":"lo")+'">'+(r.age>=85?"high":r.age>=78?"moderate":"low")+'</span></div>'
  +r.priors.map(p=>'<div class="rf"><span>'+p+'</span><span class="rw med">factor</span></div>').join("")
  +'<div class="rf"><span>7 night sleep trend</span><span class="rw '+(r.trend7<-3?"hi":"lo")+'">'+(r.trend7<-3?"declining":"stable")+'</span></div></div>'
  +'</div><div>'
  +'<div class="panel"><h4>Logged events <span class="mono">most recent first</span></h4>'
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

/* ============ delegated events (CSP safe: no inline handlers) ============ */
function handleAction(el,ev){
  switch(el.dataset.act){
    case "go":         go(el.dataset.page); break;
    case "open-res":   openRes(Number(el.dataset.room)); break;
    case "back":       backToList(); break;
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
