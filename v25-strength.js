// ---------- strength FIT analytics retained from v2.4 ----------
const V25_CAT={0:"Bänkpress",3:"Carry",5:"Bål",8:"Marklyft",15:"Lårcurl",17:"Utfall",23:"Rodd",24:"Axelpress",28:"Knäböj"};
const V25_SUB={
  0:{1:"Bänkpress med skivstång",6:"Bänkpress med hantlar",8:"Lutande bänkpress med skivstång",9:"Lutande bänkpress med hantlar"},
  8:{0:"Marklyft med skivstång",17:"Trap bar-marklyft",23:"Rumänska marklyft"},
  15:{0:"Lårcurl",1:"Viktad lårcurl"},
  17:{5:"Bulgarian split squat med hantlar",10:"Utfall med skivstång",21:"Utfall med hantlar",32:"Utfall"}
};
function v25SaveStrengthCache(){safeLocalSet(V25_STRENGTH_STORE,v25StrengthCache)}
function v25FitSize(base){const t=base&31;if([0,1,2,10,13].includes(t))return 1;if([3,4,11].includes(t))return 2;if([5,6,8,12].includes(t))return 4;if([9,14,15,16].includes(t))return 8;return 1}
function v25ReadArray(view,offset,size,base,little){const step=v25FitSize(base),out=[];for(let p=0;p+step<=size;p+=step){const v=fitReadNumber(view,offset+p,step,base,little);if(v!=null)out.push(v)}return out}
function v25Exercise(set){const cat=(set.categories||[]).find(Number.isFinite),sub=(set.category_subtypes||[]).find(Number.isFinite);return V25_SUB[cat]?.[sub]||V25_CAT[cat]||("Övning "+(cat??""))}
function v25ParseStrength(buf){
  const u8=new Uint8Array(buf);if(u8.length<14)return null;const hs=u8[0];
  if(hs<12||hs>32||u8.length<hs+1)return null;if(String.fromCharCode(...u8.slice(8,12))!==".FIT")return null;
  const hv=new DataView(buf),end=Math.min(u8.length,hs+hv.getUint32(4,true));let pos=hs;const defs=new Array(16),sets=[];
  while(pos<end){
    const hdr=u8[pos++];let local,definition=false,developer=false;
    if(hdr&128)local=(hdr>>5)&3;else{local=hdr&15;definition=!!(hdr&64);developer=!!(hdr&32)}
    if(definition){
      if(pos+5>end)break;pos++;const little=u8[pos++]===0,dv=new DataView(buf),globalNum=dv.getUint16(pos,little);pos+=2;
      const nf=u8[pos++],fields=[];for(let i=0;i<nf;i++){fields.push({num:u8[pos],size:u8[pos+1],base:u8[pos+2]});pos+=3}
      const dev=[];if(developer){const nd=u8[pos++];for(let i=0;i<nd;i++){dev.push({size:u8[pos+1]});pos+=3}}
      defs[local]={globalNum,little,fields,dev};continue;
    }
    const def=defs[local];if(!def)break;const values={},dv=new DataView(buf);
    for(const f of def.fields){
      if(pos+f.size>end)return null;
      if(def.globalNum===225){if(f.num===7||f.num===8)values[f.num]=v25ReadArray(dv,pos,f.size,f.base,def.little);else values[f.num]=fitReadNumber(dv,pos,f.size,f.base,def.little)}
      pos+=f.size;
    }
    for(const f of def.dev||[]){if(pos+f.size>end)return null;pos+=f.size}
    if(def.globalNum===225){
      const rw=Number(values[4]),rr=Number(values[3]),rd=Number(values[0]),st=Number(values[5]);
      const x={set_type:st===1?"ACTIVE":st===0?"REST":"OTHER",repetitions:Number.isFinite(rr)&&rr!==65535?rr:null,
        weight_kg:Number.isFinite(rw)&&rw!==65535?rw/16:null,duration_seconds:Number.isFinite(rd)&&rd!==4294967295?rd/1000:null,
        categories:Array.isArray(values[7])?values[7]:[],category_subtypes:Array.isArray(values[8])?values[8]:[]};
      x.exercise=v25Exercise(x);x.volume_kg=x.set_type==="ACTIVE"&&x.repetitions!=null&&x.weight_kg!=null?x.repetitions*x.weight_kg:0;sets.push(x);
    }
  }
  if(!sets.length)return null;
  const active=sets.filter(x=>x.set_type==="ACTIVE");
  return{sets,active_sets:active.length,total_reps:active.reduce((q,x)=>q+(x.repetitions||0),0),
    volume_kg:active.reduce((q,x)=>q+(x.volume_kg||0),0),max_weight_kg:active.reduce((m,x)=>Math.max(m,x.weight_kg||0),0),
    source:"Garmin original FIT · set message 225"};
}
async function v25StrengthData(a){
  if(!a?.id||!apiKey)return null;const k=String(a.id);if(v25StrengthCache[k]?.sets?.length)return v25StrengthCache[k];
  try{let b=await icuBinary("/activity/"+encodeURIComponent(a.id)+"/file");b=await maybeGunzip(b);const d=v25ParseStrength(b);if(d){v25StrengthCache[k]=d;v25SaveStrengthCache();return d}}catch{}
  return null;
}
async function v25HydrateStrength(days=28){const list=recentActivities(days).filter(isStrength).slice(0,10);await Promise.all(list.map(a=>v25StrengthData(a)))}
function v25StrengthSummary(days=28){
  const list=recentActivities(days).filter(isStrength),cached=list.map(a=>v25StrengthCache[String(a.id)]).filter(Boolean);
  const kg=list.reduce((q,a)=>q+(n(a,["kg_lifted"])||v25StrengthCache[String(a.id)]?.volume_kg||0),0);
  const sr=list.map(a=>{const r=n(a,["icu_rpe"]),m=secs(a)/60;return r!=null&&m>0?m*r:null}).filter(v=>v!=null);
  return{sessions:list.length,total_volume_kg:Math.round(kg),active_sets_cached:cached.reduce((q,x)=>q+(x.active_sets||0),0),
    total_reps_cached:cached.reduce((q,x)=>q+(x.total_reps||0),0),session_rpe_load_total:sr.length?Math.round(sr.reduce((a,b)=>a+b,0)):null,
    note:"Styrka bedöms med extern volym/set/reps och session-RPE när det finns. HR-load används inte som enda mått på muskulär belastning."};
}
function v25StrengthHtml(a){
  if(!isStrength(a))return"";const d=a._v25strength||v25StrengthCache[String(a.id)],kg=n(a,["kg_lifted"])??d?.volume_kg??null,
    r=n(a,["icu_rpe"]),sr=r!=null?Math.round(secs(a)/60*r):null,active=d?.sets?.filter(x=>x.set_type==="ACTIVE")||[];
  return '<div class="activity-detail-section"><h3>Styrkebelastning · Garmin FIT</h3><div class="activity-detail-feedback">'+
    (kg!=null?statCard(Math.round(kg)+" kg","Extern volym"):"")+
    (d?statCard(String(d.active_sets),"Aktiva set")+statCard(String(d.total_reps),"Repetitioner")+(d.max_weight_kg?statCard(fmt.format(d.max_weight_kg)+" kg","Tyngsta vikt"):""):"")+
    (sr!=null?statCard(String(sr),"Session-RPE load"):"")+'</div>'+
    (active.length?'<div class="strength-set-table-wrap"><table class="strength-set-table"><thead><tr><th>Set</th><th>Övning</th><th>Reps</th><th>Vikt</th><th>Volym</th></tr></thead><tbody>'+
      active.map((x,i)=>'<tr><td>'+(i+1)+'</td><td>'+esc(x.exercise)+'</td><td>'+(x.repetitions??"—")+'</td><td>'+(x.weight_kg!=null?fmt.format(x.weight_kg)+" kg":"—")+'</td><td>'+(x.volume_kg?Math.round(x.volume_kg)+" kg":"—")+'</td></tr>').join("")+
      '</tbody></table></div>':"")+
    '<div class="strength-load-note">Intervals Load/HR-load visas separat. Trail Coach använder även reps × vikt, set och session-RPE eftersom puls ensam underskattar styrkebelastningen.</div></div>';
}
const v25RenderActivityDetailBase=renderActivityDetail;
renderActivityDetail=function(a,o={}){v25RenderActivityDetailBase(a,o);const box=$("activityDetailBody");if(box&&isStrength(a)){const extra=v25StrengthHtml(a);if(extra)box.insertAdjacentHTML("beforeend",extra)}};
const v25OpenActivityDetailBase=openActivityDetail;
openActivityDetail=async function(a){if(isStrength(a)){const d=await v25StrengthData(a).catch(()=>null);if(d)a={...a,_v25strength:d}}return v25OpenActivityDetailBase(a)};

// ---------- Gym C structured workout ----------
const v25StrengthKindBase=strengthKindFromName;
strengthKindFromName=function(name){const x=String(name||"").toLowerCase();if(x.includes("styrka c")||x.includes("strength c"))return"strengthC";return v25StrengthKindBase(name)};
const v25CanonicalStrengthBase=canonicalStrengthBase;
canonicalStrengthBase=function(kind,mode="gym"){
  if(mode==="gym"&&kind==="strengthC")return[
    {exercise:"Latsdrag eller assisterad pull-up",reps:8,reps_per_side:false,seconds:50,rest_seconds:60,notes:"RPE 6–7"},
    {exercise:"Lutande hantelpress",reps:8,reps_per_side:false,seconds:50,rest_seconds:60,notes:""},
    {exercise:"Enarms kabelrodd",reps:10,reps_per_side:true,seconds:50,rest_seconds:45,notes:"per sida"},
    {exercise:"Hantelpress över huvudet",reps:8,reps_per_side:false,seconds:50,rest_seconds:60,notes:""},
    {exercise:"Face pull",reps:12,reps_per_side:false,seconds:45,rest_seconds:45,notes:""},
    {exercise:"Pallof press",reps:10,reps_per_side:true,seconds:45,rest_seconds:45,notes:"per sida"},
    {exercise:"Farmers carry",reps:0,reps_per_side:false,seconds:40,rest_seconds:60,notes:"stabil bål"}
  ];
  if(mode==="home"&&kind==="strengthC")return[
    {exercise:"Armhävning",reps:10,reps_per_side:false,seconds:45,rest_seconds:40,notes:""},
    {exercise:"Skivstångsrodd",reps:10,reps_per_side:false,seconds:50,rest_seconds:45,notes:""},
    {exercise:"Axelpress",reps:8,reps_per_side:false,seconds:45,rest_seconds:45,notes:""},
    {exercise:"Sidoplanka",reps:0,reps_per_side:true,seconds:60,rest_seconds:40,notes:"30 s per sida"},
    {exercise:"Dead bug",reps:8,reps_per_side:true,seconds:45,rest_seconds:30,notes:"per sida"},
    {exercise:"Suitcase carry",reps:0,reps_per_side:true,seconds:50,rest_seconds:45,notes:"per sida"}
  ];
  return v25CanonicalStrengthBase(kind,mode);
};
const v25StrengthDescriptionForModeBase=strengthDescriptionForMode;
strengthDescriptionForMode=function(kind,sets=3,mode="home"){
  if(kind!=="strengthC")return v25StrengthDescriptionForModeBase(kind,sets,mode);
  return strengthStepsToGarminDescription("Trail Coach · "+(mode==="gym"?"Gymstyrka":"Hemstyrka")+" C",canonicalStrengthSteps(kind,mode,sets));
};
const v25StrengthDescriptionFromNameBase=strengthDescriptionFromName;
strengthDescriptionFromName=function(name,sets=2,preferredMode=null){
  const x=String(name||"").toLowerCase();if(x.includes("styrka c")){
    const mode=preferredMode||(x.includes("gymstyrka")||x.includes("fullt gym")?"gym":"home");
    return strengthDescriptionForMode("strengthC",sets,mode);
  }
  return v25StrengthDescriptionFromNameBase(name,sets,preferredMode);
};
const v25MakeDescriptionBase=makeDescription;
makeDescription=function(kind,mins,mode){
  if(kind==="yoga")return"Yoga · "+Math.round(mins)+" min\nÅterhämtning, stretch, rörlighet och lugn bål/balans. Håll passet återhämtande.";
  if(kind==="strengthC")return strengthDescriptionForMode("strengthC",3,$("strengthMode")?.value||"home");
  return v25MakeDescriptionBase(kind,mins,mode);
};
const v25TargetLabelBase=targetLabel;
targetLabel=function(kind){if(kind==="yoga")return"Återhämtning/stretch";return v25TargetLabelBase(kind)};