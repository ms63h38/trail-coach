// ---------- flexible weekly template UI ----------
function v25DayOptions(selected){
  return["Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag","Söndag"].map((x,i)=>'<option value="'+i+'" '+(i===selected?"selected":"")+'>'+x+"</option>").join("");
}
(function v25InjectPlanner(){
  const sm=$("strengthMode");if(!sm||$("gymCount"))return;
  document.getElementById("flexStrengthDay")?.closest(".field")?.remove();
  const wrap=document.createElement("div");wrap.className="v25-week-template";
  wrap.innerHTML=
    '<div class="field"><label>Gympass / vecka</label><select id="gymCount"><option value="0">0</option><option value="1">1 · Gym A</option><option value="2" selected>2 · Gym A + B</option><option value="3">3 · Gym A + B + C</option></select></div>'+ 
    '<div class="field v25-slot" data-gym-slot="1"><label>Gym A · dag</label><select id="gymDayA">'+v25DayOptions(1)+'</select></div>'+ 
    '<div class="field v25-slot" data-gym-slot="2"><label>Gym B · dag</label><select id="gymDayB">'+v25DayOptions(4)+'</select></div>'+ 
    '<div class="field v25-slot" data-gym-slot="3"><label>Gym C · dag</label><select id="gymDayC">'+v25DayOptions(2)+'</select></div>'+ 
    '<div class="field"><label>Yoga / vecka</label><select id="yogaCount"><option value="0">0</option><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select></div>'+ 
    '<div class="field v25-slot" data-yoga-slot="1"><label>Yoga 1 · dag</label><select id="yogaDay1">'+v25DayOptions(0)+'</select></div>'+ 
    '<div class="field v25-slot" data-yoga-slot="2"><label>Yoga 2 · dag</label><select id="yogaDay2">'+v25DayOptions(5)+'</select></div>'+ 
    '<div class="field v25-slot" data-yoga-slot="3"><label>Yoga 3 · dag</label><select id="yogaDay3">'+v25DayOptions(2)+'</select></div>'+ 
    '<div class="field v25-template-actions"><button id="applyWeeklyTemplate" class="secondary" type="button">Tillämpa veckorytm på utkast</button></div>'+ 
    '<div id="v25TemplateNote" class="small v25-template-note">Yoga behandlas som återhämtning/stretch. Valen sparas lokalt.</div>';
  sm.closest(".field")?.insertAdjacentElement("afterend",wrap);
})();
function v25PlanPrefs(){
  return{
    gym_count:Math.max(0,Math.min(3,Number($("gymCount")?.value||2))),
    gym_days:{A:Number($("gymDayA")?.value||1),B:Number($("gymDayB")?.value||4),C:Number($("gymDayC")?.value||2)},
    yoga_count:Math.max(0,Math.min(3,Number($("yogaCount")?.value||2))),
    yoga_days:[Number($("yogaDay1")?.value||0),Number($("yogaDay2")?.value||5),Number($("yogaDay3")?.value||2)]
  };
}
function v25SyncPrefsUi(){
  const p=v25PlanPrefs();
  document.querySelectorAll("[data-gym-slot]").forEach(el=>{const n=Number(el.dataset.gymSlot),off=n>p.gym_count;el.classList.toggle("slot-disabled",off);const s=el.querySelector("select");if(s)s.disabled=off});
  document.querySelectorAll("[data-yoga-slot]").forEach(el=>{const n=Number(el.dataset.yogaSlot),off=n>p.yoga_count;el.classList.toggle("slot-disabled",off);const s=el.querySelector("select");if(s)s.disabled=off});
}
function v25SavePrefs(){const p=v25PlanPrefs();safeLocalSet(V25_PLAN_PREFS_STORE,p);v25SyncPrefsUi();return p}
function v25RestorePrefs(){
  const p=safeLocalGet(V25_PLAN_PREFS_STORE,null);if(p){
    $("gymCount").value=String(p.gym_count??2);$("gymDayA").value=String(p.gym_days?.A??1);$("gymDayB").value=String(p.gym_days?.B??4);$("gymDayC").value=String(p.gym_days?.C??2);
    $("yogaCount").value=String(p.yoga_count??2);$("yogaDay1").value=String(p.yoga_days?.[0]??0);$("yogaDay2").value=String(p.yoga_days?.[1]??5);$("yogaDay3").value=String(p.yoga_days?.[2]??2);
  }v25SyncPrefsUi();
}
function v25MarkDraft(p,reason){
  if(p.id!=null&&p.event_id==null)p.event_id=p.id;
  p.status="READY";p.source="Trail Coach · "+reason;return p;
}
function v25StrengthEvent(start,slot,template){
  const mode=$("strengthMode")?.value||"gym",kind="strength"+slot.letter,name="Trail Coach · "+(mode==="gym"?"Gymstyrka":"Hemstyrka")+" "+slot.letter;
  const ev=makePlanEvent(addDays(start,slot.offset),kind,mode==="gym"?40:25,name,resolveMode(start),template?.week||1,"Coach");
  ev.strength_mode=mode;ev.strength_steps=canonicalStrengthSteps(kind,mode,3);ev.description=strengthStepsToGarminDescription(name,ev.strength_steps);return ev;
}
function v25ApplyWeeklyTemplate({quiet=false}={}){
  if(!Array.isArray(localPlan)||!localPlan.length){if(!quiet&&$("v25TemplateNote"))$("v25TemplateNote").textContent="Inget lokalt utkast att ändra.";return 0}
  const pref=v25SavePrefs(),groups=new Map(),remove=new Set();let changed=0;
  for(const p of localPlan){const ws=iso(weekStart(parseDate(p.date)));if(!groups.has(ws))groups.set(ws,[]);groups.get(ws).push(p)}
  for(const [ws,list] of groups){
    const start=parseDate(ws),strength=list.filter(p=>sportFamily(p.type)==="strength"),normalStrengthWeek=strength.length>=2;
    const selected=["A","B","C"].slice(0,pref.gym_count).map(letter=>({letter,offset:Number(pref.gym_days[letter])}));
    const allowed=normalStrengthWeek?selected:selected.slice(0,Math.min(selected.length,strength.length));
    const byLetter={};
    strength.forEach((p,i)=>{const k=strengthKindFromName(p.name),letter=k==="strengthA"?"A":k==="strengthB"?"B":k==="strengthC"?"C":i===0?"A":i===1?"B":"C";byLetter[letter]=p});
    for(const slot of allowed){
      let p=byLetter[slot.letter];
      if(!p&&slot.letter==="C"){p=v25StrengthEvent(start,slot,strength[0]);localPlan.push(p);byLetter.C=p;changed++}
      if(p){const nd=iso(addDays(start,slot.offset));if(p.date!==nd){p.date=nd;v25MarkDraft(p,"veckorytm");changed++}}
    }
    strength.forEach(p=>{const k=strengthKindFromName(p.name),letter=k==="strengthA"?"A":k==="strengthB"?"B":k==="strengthC"?"C":null;if(!allowed.some(x=>x.letter===letter)){remove.add(p);changed++}});

    const yoga=list.filter(p=>String(p.type||"").toLowerCase().includes("yoga")),want=Math.min(pref.yoga_count,yoga.length);
    for(let i=0;i<yoga.length;i++){
      if(i>=want){remove.add(yoga[i]);changed++;continue}
      const nd=iso(addDays(start,pref.yoga_days[i]));if(yoga[i].date!==nd){yoga[i].date=nd;v25MarkDraft(yoga[i],"veckorytm");changed++}
    }
  }
  localPlan=localPlan.filter(p=>!remove.has(p)).sort((a,b)=>a.date.localeCompare(b.date));
  if(changed){renderPlan();renderPlanCommandCenter();$("pushWeek1").disabled=!apiKey;$("pushAll4").disabled=!apiKey}
  if(!quiet&&$("v25TemplateNote"))$("v25TemplateNote").textContent=changed?changed+" planposter ändrade. Granska innan publicering.":"Veckorytmen matchar redan utkastet.";
  renderStrengthReference();return changed;
}

const v25RenderStrengthReferenceBase=renderStrengthReference;
renderStrengthReference=function(){
  v25RenderStrengthReferenceBase();
  const r=$("strengthReference");if(!r)return;
  const p=v25PlanPrefs(),days=["mån","tis","ons","tor","fre","lör","sön"];
  const gym=["A","B","C"].slice(0,p.gym_count).map(x=>x+" "+days[p.gym_days[x]]).join(" · ")||"inga gympass";
  const yog=p.yoga_days.slice(0,p.yoga_count).map((d,i)=>"Yoga "+(i+1)+" "+days[d]).join(" · ")||"ingen yoga";
  r.innerHTML+='<br><br><b>Vald veckorytm:</b> '+esc(gym)+'<br><b>Yoga/återhämtning:</b> '+esc(yog);
  if(p.gym_count>=3)r.innerHTML+='<br><b>Gym C:</b> kompletterande överkropp + bål/stabilitet.';
};

try{if(typeof v24ApplySchedule==="function")v24ApplySchedule=function(){}}catch{}
const v25BuildPlanBase=buildPlan;
buildPlan=function(){const r=v25BuildPlanBase();v25ApplyWeeklyTemplate({quiet:true});v25ApplyConstraint({quiet:true});renderPlan();return r};
if($("generatePlan"))$("generatePlan").onclick=buildPlan;
const v25ImportCoachPlanBase=importCoachPlan;
importCoachPlan=async function(){const r=await v25ImportCoachPlanBase();v25ApplyWeeklyTemplate({quiet:true});v25ApplyConstraint({quiet:true});renderPlan();return r};
if($("importCoachPlan"))$("importCoachPlan").onclick=importCoachPlan;

// ---------- temporary reprioritisation ----------
(function v25InjectConstraint(){
  const anchor=document.querySelector(".schedule-overview-panel");if(!anchor||$("runRestriction"))return;
  const el=document.createElement("section");el.className="panel full v25-constraint-panel";
  el.innerHTML='<div class="v25-constraint-head"><div><h2>Tillfällig omprioritering</h2><div class="small">Ändrar lokalt utkast. Publicering till Intervals är fortsatt separat.</div></div><div id="v25ConstraintBadge" class="training-status idle v25-constraint-badge">NORMAL</div></div>'+ 
    '<div class="v25-constraint-grid">'+ 
    '<div class="field"><label>Löprestriktion</label><select id="runRestriction"><option value="normal">Normal träning</option><option value="no_trail">Undvik teknisk trail · platt/löpband</option><option value="no_running">Pausa all löpning · låg impact</option></select></div>'+ 
    '<div class="field"><label>Primär ersättning</label><select id="replacementPrimary"><option value="Rowing">Roddmaskin</option><option value="Ride">Inomhuscykel</option></select></div>'+ 
    '<div class="field"><label>Alternativ</label><select id="replacementSecondary"><option value="Ride">Inomhuscykel</option><option value="Rowing">Roddmaskin</option></select></div>'+ 
    '<div class="field"><label>Gäller till och med</label><input id="constraintUntil" type="date"></div></div>'+ 
    '<div class="field"><label>Notering till Coach</label><input id="constraintNote" type="text" placeholder="Ex. välj endast smärtfria alternativ"></div>'+ 
    '<div class="v25-constraint-actions"><button id="saveConstraint" class="secondary" type="button">Spara</button><button id="applyConstraint" class="good" type="button">Tillämpa på utkast</button><button id="clearConstraint" class="secondary" type="button">Återställ normal</button></div>'+ 
    '<div id="constraintMsg" class="notice">Ingen tillfällig begränsning aktiv.</div>';
  anchor.insertAdjacentElement("beforebegin",el);
})();
function v25Constraint(){
  return{run_restriction:$("runRestriction")?.value||"normal",replacement_primary:$("replacementPrimary")?.value||"Rowing",replacement_secondary:$("replacementSecondary")?.value||"Ride",
    until:$("constraintUntil")?.value||"",note:$("constraintNote")?.value?.trim()||""};
}
function v25ConstraintActive(c=v25Constraint()){return !!c&&c.run_restriction!=="normal"&&(!c.until||c.until>=iso(new Date()))}
function v25SaveConstraint(){const c=v25Constraint();safeLocalSet(V25_CONSTRAINT_STORE,c);v25RenderConstraint();return c}
function v25RestoreConstraint(){
  const c=safeLocalGet(V25_CONSTRAINT_STORE,null);if(c){$("runRestriction").value=c.run_restriction||"normal";$("replacementPrimary").value=c.replacement_primary||"Rowing";$("replacementSecondary").value=c.replacement_secondary||"Ride";$("constraintUntil").value=c.until||"";$("constraintNote").value=c.note||""}
  v25RenderConstraint();
}
function v25RenderConstraint(){
  if(!$("v25ConstraintBadge"))return;const c=v25Constraint(),active=v25ConstraintActive(c),panel=document.querySelector(".v25-constraint-panel");
  panel?.classList.toggle("active",active);$("v25ConstraintBadge").textContent=active?(c.run_restriction==="no_running"?"PAUSA LÖPNING":"INGEN TEKNISK TRAIL"):"NORMAL";
  $("v25ConstraintBadge").className="training-status "+(active?"candidate":"idle")+" v25-constraint-badge";
  if($("constraintMsg"))$("constraintMsg").textContent=active?("Aktiv"+(c.until?" till "+c.until:"")+" · primärt "+(c.replacement_primary==="Rowing"?"roddmaskin":"inomhuscykel")+". Använd endast smärtfria alternativ."):"Ingen tillfällig begränsning aktiv.";
}
const v25SportFamilyBase=sportFamily;
sportFamily=function(type){const t=String(type||"").toLowerCase();if(t.includes("row"))return"row";return v25SportFamilyBase(type)};
function v25ReplacementDescription(p,c){
  const m=Math.round(Number(p.mins)||0),alt=c.replacement_secondary==="Rowing"?"roddmaskin":"inomhuscykel";
  const base="Tillfällig låg-impact-ersättning för: "+(p.original_name||p.name)+"\nAlternativ om primär aktivitet inte känns bra: "+alt+".\nByt/avbryt om smärta ökar.";
  if(p.kind==="hills")return base+"\n\n- 10m Z1-Z2 HR\n5x\n- 2m Z3 HR\n- 2m Z1 HR\n- "+Math.max(5,m-30)+"m Z1-Z2 HR";
  return base+"\n\n- "+m+"m Z1-Z2 HR intensity=active";
}
function v25ConvertRun(p,c){
  if(sportFamily(p.type)!=="run")return false;
  if(p.id!=null&&p.event_id==null)p.event_id=p.id;
  if(c.run_restriction==="no_trail"){
    p.original_name=p.original_name||p.name;p.original_type=p.original_type||p.type;p.type="Run";
    p.name=String(p.name||"").replace(/trail/ig,"platt/löpband").replace(/Backuthållighet/ig,"Löpband · kontrollerat");
    p.description="Undvik teknisk trail tillfälligt.\n\n"+p.description;p.target="HR · platt/löpband";v25MarkDraft(p,"omprioritering");return true;
  }
  if(c.run_restriction==="no_running"){
    const primary=c.replacement_primary||"Rowing";
    p.original_name=p.original_name||p.name;p.original_type=p.original_type||p.type;p.type=primary;
    p.name="Trail Coach · "+(primary==="Rowing"?"Rodd":"Inomhuscykel")+" · ersätter "+(p.kind||"löpning");
    p.mins=primary==="Rowing"?Math.min(Number(p.mins)||45,p.kind==="long"?60:50):Math.min(Number(p.mins)||45,p.kind==="long"?90:60);
    p.description=v25ReplacementDescription(p,c);p.target="Z1–Z2 HR · låg impact";p.planned_load=null;v25MarkDraft(p,"omprioritering");return true;
  }
  return false;
}
function v25ApplyConstraint({quiet=false}={}){
  const c=v25Constraint();if(!v25ConstraintActive(c)){if(!quiet&&$("constraintMsg"))$("constraintMsg").textContent="Ingen aktiv begränsning att tillämpa.";v25RenderConstraint();return 0}
  let changed=0;for(const p of localPlan)if(v25ConvertRun(p,c))changed++;
  if(changed){localPlan.sort((a,b)=>a.date.localeCompare(b.date));renderPlan();renderPlanCommandCenter();$("pushWeek1").disabled=!apiKey;$("pushAll4").disabled=!apiKey}
  if(!quiet&&$("constraintMsg"))$("constraintMsg").textContent=changed?changed+" löppass omprioriterade i lokalt utkast. Granska innan publicering.":"Inga löppass behövde ändras.";
  v25RenderConstraint();return changed;
}
function v25ClearConstraint(){
  $("runRestriction").value="normal";$("constraintUntil").value="";$("constraintNote").value="";safeLocalSet(V25_CONSTRAINT_STORE,v25Constraint());v25RenderConstraint();
  $("constraintMsg").textContent="Normal träning återställd. Befintligt utkast återställs inte automatiskt – bygg/hämta planen igen vid behov.";
}