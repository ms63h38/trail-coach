const CACHE="trailcoach-2-v240";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

const V240_CSS=`<style id="tc-v240-patch">
.trail-engine-mini-head{min-width:0}.trail-engine-mini-head h3{white-space:nowrap;min-width:0}.trail-engine-mini-delta{flex:0 0 auto;white-space:nowrap;margin-left:8px}
.strength-set-table-wrap{overflow:auto;margin-top:10px;border:1px solid rgba(255,255,255,.07);border-radius:10px}.strength-set-table{width:100%;border-collapse:collapse;min-width:520px}.strength-set-table th,.strength-set-table td{padding:8px 9px;border-bottom:1px solid rgba(255,255,255,.055);font-size:10px}.strength-set-table th{text-align:left;color:var(--muted);font-weight:700;background:#101419}.strength-set-table tr:last-child td{border-bottom:0}.strength-load-note{margin-top:10px;color:var(--muted);font-size:10px;line-height:1.4}
@media(max-width:560px){#dashboard > .grid > .metric{grid-column:span 6!important;min-height:116px;padding:14px}#dashboard > .grid > .metric h3{font-size:10px;letter-spacing:.075em;white-space:nowrap}#dashboard > .grid > .metric .value{font-size:30px;margin-top:8px}#dashboard > .grid > .metric .sub{font-size:10px;line-height:1.35;max-width:100%}.trail-engine-mini-head{display:block}.trail-engine-mini-delta{display:block;margin:4px 0 0;font-size:9px;line-height:1.2}.trail-engine-metric .value{margin-top:6px!important}}
@media(max-width:360px){#dashboard > .grid > .metric{min-height:112px;padding:12px}#dashboard > .grid > .metric .value{font-size:27px}}
</style>`;

const V240_JS=`
// ===== Trail Coach v2.4 runtime patch =====
const V24_STRENGTH_STORE="trailcoach_strength_fit_cache_v1";
let v24StrengthCache=safeLocalGet(V24_STRENGTH_STORE,{})||{};
function v24SaveStrengthCache(){safeLocalSet(V24_STRENGTH_STORE,v24StrengthCache)}

try{const p=document.querySelector(".version-pill");if(p)p.textContent="v2.4";if($("appVersion"))$("appVersion").textContent="2.4.0";if($("appBuild"))$("appBuild").textContent="2026-09-04";}catch{}

prepCanvas=function(canvas,cssHeight){
  if(!canvas)return null;
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||rect.width<80)return null;
  const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  const w=Math.round(rect.width),h=Math.round(cssHeight||Math.max(10,rect.height));
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.height=h+"px";
  const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h};
};
const v24ActivateTab=activateTab;
activateTab=function(id,opts={}){
  v24ActivateTab(id,opts);
  requestAnimationFrame(()=>{if(id==="trends")renderTrends();if(id==="dashboard"){renderTrailEngine();drawTodayTrailEngineChart();}});
};

(function(){
  const sm=$("strengthMode");
  if(sm&&!$("flexStrengthDay")){
    const field=document.createElement("div");field.className="field";
    field.innerHTML='<label>Flexibel gymdag</label><select id="flexStrengthDay"><option value="auto" selected>Auto · tisdag som utgångspunkt</option><option value="0">Måndag</option><option value="1">Tisdag</option><option value="2">Onsdag</option></select>';
    sm.closest(".field")?.insertAdjacentElement("afterend",field);
  }
})();
function v24FlexStrengthOffset(){const v=$("flexStrengthDay")?.value||"auto";if(v==="auto")return 1;const x=Number(v);return[0,1,2].includes(x)?x:1}
function v24ApplySchedule(){
  if(!Array.isArray(localPlan)||!localPlan.length)return;
  const groups=new Map();
  for(const p of localPlan){const ws=iso(weekStart(parseDate(p.date)));if(!groups.has(ws))groups.set(ws,[]);groups.get(ws).push(p)}
  const remove=new Set();
  for(const [ws,list] of groups){
    const start=parseDate(ws),strength=list.filter(p=>sportFamily(p.type)==="strength");
    const a=strength.find(p=>String(p.name||"").toLowerCase().includes("styrka a"))||strength[0];
    const b=strength.find(p=>String(p.name||"").toLowerCase().includes("styrka b"))||strength[1];
    if(a)a.date=iso(addDays(start,v24FlexStrengthOffset()));
    if(b)b.date=iso(addDays(start,4));
    strength.slice(2).forEach(p=>remove.add(p));
    const yoga=list.filter(p=>String(p.type||"").toLowerCase().includes("yoga"));
    if(yoga[0])yoga[0].date=iso(addDays(start,0));
    if(yoga[1])yoga[1].date=iso(addDays(start,5));
    yoga.slice(2).forEach(p=>remove.add(p));
  }
  localPlan=localPlan.filter(p=>!remove.has(p)).sort((a,b)=>a.date.localeCompare(b.date));
}
const v24BuildPlan=buildPlan;
buildPlan=function(){v24BuildPlan();v24ApplySchedule();renderPlan();renderStrengthReference();};
if($("generatePlan"))$("generatePlan").onclick=buildPlan;
const v24ImportCoachPlan=importCoachPlan;
importCoachPlan=async function(){await v24ImportCoachPlan();v24ApplySchedule();renderPlan();renderPlanCommandCenter();renderCoachFlow();};
if($("importCoachPlan"))$("importCoachPlan").onclick=importCoachPlan;
const v24RenderStrengthReference=renderStrengthReference;
renderStrengthReference=function(){v24RenderStrengthReference();const r=$("strengthReference");if(r)r.innerHTML+='<br><br><b>Veckorytm:</b> Gym B fredag fast · Gym A flexibel mån–ons (auto tisdag) · yoga 1–2 gånger/vecka.';};
renderStrengthReference();

const V24_CAT={0:"Bänkpress",3:"Carry",5:"Bål",8:"Marklyft",15:"Lårcurl",17:"Utfall",23:"Rodd",24:"Axelpress",28:"Knäböj"};
const V24_SUB={0:{1:"Bänkpress med skivstång",6:"Bänkpress med hantlar",8:"Lutande bänkpress med skivstång",9:"Lutande bänkpress med hantlar"},8:{0:"Marklyft med skivstång",17:"Trap bar-marklyft",23:"Rumänska marklyft"},15:{0:"Lårcurl",1:"Viktad lårcurl"},17:{5:"Bulgarian split squat med hantlar",10:"Utfall med skivstång",21:"Utfall med hantlar",32:"Utfall"}};
function v24FitSize(base){const t=base&31;if([0,1,2,10,13].includes(t))return 1;if([3,4,11].includes(t))return 2;if([5,6,8,12].includes(t))return 4;if([9,14,15,16].includes(t))return 8;return 1}
function v24ReadArray(view,offset,size,base,little){const step=v24FitSize(base),out=[];for(let p=0;p+step<=size;p+=step){const v=fitReadNumber(view,offset+p,step,base,little);if(v!=null)out.push(v)}return out}
function v24Exercise(set){const cat=(set.categories||[]).find(Number.isFinite),sub=(set.category_subtypes||[]).find(Number.isFinite);return V24_SUB[cat]?.[sub]||V24_CAT[cat]||("Övning "+(cat??""))}
function v24ParseStrength(buf){
  const u8=new Uint8Array(buf);if(u8.length<14)return null;const hs=u8[0];if(hs<12||hs>32||u8.length<hs+1)return null;if(String.fromCharCode(...u8.slice(8,12))!==".FIT")return null;
  const hv=new DataView(buf),end=Math.min(u8.length,hs+hv.getUint32(4,true));let pos=hs;const defs=new Array(16),sets=[];
  while(pos<end){const hdr=u8[pos++];let local,definition=false,developer=false;if(hdr&128)local=(hdr>>5)&3;else{local=hdr&15;definition=!!(hdr&64);developer=!!(hdr&32)}
    if(definition){if(pos+5>end)break;pos++;const little=u8[pos++]===0,dv=new DataView(buf),globalNum=dv.getUint16(pos,little);pos+=2;const nf=u8[pos++],fields=[];for(let i=0;i<nf;i++){fields.push({num:u8[pos],size:u8[pos+1],base:u8[pos+2]});pos+=3}const dev=[];if(developer){const nd=u8[pos++];for(let i=0;i<nd;i++){dev.push({size:u8[pos+1]});pos+=3}}defs[local]={globalNum,little,fields,dev};continue}
    const def=defs[local];if(!def)break;const values={},dv=new DataView(buf);for(const f of def.fields){if(pos+f.size>end)return null;if(def.globalNum===225){if(f.num===7||f.num===8)values[f.num]=v24ReadArray(dv,pos,f.size,f.base,def.little);else values[f.num]=fitReadNumber(dv,pos,f.size,f.base,def.little)}pos+=f.size}for(const f of def.dev||[]){if(pos+f.size>end)return null;pos+=f.size}
    if(def.globalNum===225){const rw=Number(values[4]),rr=Number(values[3]),rd=Number(values[0]),st=Number(values[5]);const x={set_type:st===1?"ACTIVE":st===0?"REST":"OTHER",repetitions:Number.isFinite(rr)&&rr!==65535?rr:null,weight_kg:Number.isFinite(rw)&&rw!==65535?rw/16:null,duration_seconds:Number.isFinite(rd)&&rd!==4294967295?rd/1000:null,categories:Array.isArray(values[7])?values[7]:[],category_subtypes:Array.isArray(values[8])?values[8]:[]};x.exercise=v24Exercise(x);x.volume_kg=x.set_type==="ACTIVE"&&x.repetitions!=null&&x.weight_kg!=null?x.repetitions*x.weight_kg:0;sets.push(x)}
  }
  if(!sets.length)return null;const active=sets.filter(x=>x.set_type==="ACTIVE");return{sets,active_sets:active.length,total_reps:active.reduce((q,x)=>q+(x.repetitions||0),0),volume_kg:active.reduce((q,x)=>q+(x.volume_kg||0),0),max_weight_kg:active.reduce((m,x)=>Math.max(m,x.weight_kg||0),0),source:"Garmin original FIT · set message 225"};
}
async function v24StrengthData(a){if(!a?.id||!apiKey)return null;const k=String(a.id);if(v24StrengthCache[k]?.sets?.length)return v24StrengthCache[k];try{let b=await icuBinary('/activity/'+encodeURIComponent(a.id)+'/file');b=await maybeGunzip(b);const d=v24ParseStrength(b);if(d){v24StrengthCache[k]=d;v24SaveStrengthCache();return d}}catch{}return null}
async function v24HydrateStrength(days=28){const list=recentActivities(days).filter(isStrength).slice(0,10);await Promise.all(list.map(a=>v24StrengthData(a)));}
function v24StrengthSummary(days=28){const list=recentActivities(days).filter(isStrength),cached=list.map(a=>v24StrengthCache[String(a.id)]).filter(Boolean);const kg=list.reduce((q,a)=>q+(n(a,["kg_lifted"])||v24StrengthCache[String(a.id)]?.volume_kg||0),0);return{sessions:list.length,total_volume_kg:Math.round(kg),active_sets_cached:cached.reduce((q,x)=>q+(x.active_sets||0),0),total_reps_cached:cached.reduce((q,x)=>q+(x.total_reps||0),0),note:"Styrka bedöms med extern volym/set/reps och session-RPE när det finns. HR-load används inte som enda mått på muskulär belastning."}}
function v24StrengthHtml(a){if(!isStrength(a))return"";const d=a._v24strength||v24StrengthCache[String(a.id)],kg=n(a,["kg_lifted"])??d?.volume_kg??null,r=n(a,["icu_rpe"]),sr=r!=null?Math.round(secs(a)/60*r):null;const active=d?.sets?.filter(x=>x.set_type==="ACTIVE")||[];return '<div class="activity-detail-section"><h3>Styrkebelastning · Garmin FIT</h3><div class="activity-detail-feedback">'+(kg!=null?statCard(Math.round(kg)+' kg','Extern volym'):'')+(d?statCard(String(d.active_sets),'Aktiva set')+statCard(String(d.total_reps),'Repetitioner')+(d.max_weight_kg?statCard(fmt.format(d.max_weight_kg)+' kg','Tyngsta vikt'):''):'')+(sr!=null?statCard(String(sr),'Session-RPE load'):'')+'</div>'+(active.length?'<div class="strength-set-table-wrap"><table class="strength-set-table"><thead><tr><th>Set</th><th>Övning</th><th>Reps</th><th>Vikt</th><th>Volym</th></tr></thead><tbody>'+active.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.exercise)+'</td><td>'+(x.repetitions??'—')+'</td><td>'+(x.weight_kg!=null?fmt.format(x.weight_kg)+' kg':'—')+'</td><td>'+(x.volume_kg?Math.round(x.volume_kg)+' kg':'—')+'</td></tr>').join('')+'</tbody></table></div>':'')+'<div class="strength-load-note">Intervals Load/HR-load visas separat. Trail Coach använder även reps × vikt, set och session-RPE eftersom puls ensam underskattar styrkebelastningen.</div></div>'}
const v24RenderActivityDetail=renderActivityDetail;
renderActivityDetail=function(a,o={}){v24RenderActivityDetail(a,o);const box=$("activityDetailBody");if(box&&isStrength(a)){const extra=v24StrengthHtml(a);if(extra)box.insertAdjacentHTML("beforeend",extra)}};
const v24OpenActivityDetail=openActivityDetail;
openActivityDetail=async function(a){if(isStrength(a)){const d=await v24StrengthData(a).catch(()=>null);if(d)a={...a,_v24strength:d}}return v24OpenActivityDetail(a)};
const v24CoachSnapshot=coachSnapshot;
coachSnapshot=function(){const x=v24CoachSnapshot();x.strength_28d=v24StrengthSummary(28);const arr=x.recent_activities_60d||x.recent_activities||[];for(const a of arr){if(a?.id&&v24StrengthCache[String(a.id)])a.strength_fit=v24StrengthCache[String(a.id)]}return x};
const v24ExportSnapshot=exportSnapshot;
exportSnapshot=async function(){await v24HydrateStrength(28).catch(()=>0);return v24ExportSnapshot()};
if($("exportSnapshot"))$("exportSnapshot").onclick=exportSnapshot;
`;

function patchHtml(text){
  let out=text
    .replaceAll("Trail Coach 2.3.1","Trail Coach 2.4")
    .replaceAll('APP_VERSION="2.3.1"','APP_VERSION="2.4.0"')
    .replaceAll('APP_BUILD="2026-09-03"','APP_BUILD="2026-09-04"')
    .replaceAll('>v2.3.1<','>v2.4<')
    .replaceAll('>2.3.1<','>2.4.0<');
  if(!out.includes('tc-v240-patch'))out=out.replace("</head>",V240_CSS+"</head>");
  if(!out.includes('Trail Coach v2.4 runtime patch'))out=out.replace(/\}\)\(\);\s*<\/script>/,V240_JS+"\n})();\n</script>");
  return out;
}

self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
  const isHtml=e.request.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("/index.html");
  if(isHtml){e.respondWith((async()=>{try{const r=await fetch(e.request,{cache:"no-store"});const text=patchHtml(await r.text());const h=new Headers(r.headers);h.set("content-type","text/html; charset=utf-8");const p=new Response(text,{status:r.status,statusText:r.statusText,headers:h});caches.open(CACHE).then(c=>c.put(e.request,p.clone()));return p}catch{const c=await caches.match(e.request)||await caches.match("./index.html");if(!c)return Response.error();return new Response(patchHtml(await c.text()),{headers:{"content-type":"text/html; charset=utf-8"}})}})());return}
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});