// ---------- external VO2 reference (local only) ----------
(function v25InjectVo2(){
  const grid=document.querySelector("#settings .settings-grid");if(grid&&!$("externalVo2Value")){
    const el=document.createElement("section");el.className="panel full settings-card v25-vo2-card";
    el.innerHTML='<div class="settings-head"><div><h2>VO₂-referenser</h2><div class="small">Garmin är automatisk. Extern referens sparas bara lokalt på denna enhet.</div></div><div id="vo2RefSummary" class="training-status idle">INGEN EXTERN</div></div>'+ 
      '<div class="row"><div class="field"><label>Extern källa</label><select id="externalVo2Source"><option value="">Ingen</option><option value="WHOOP">WHOOP</option><option value="Lab">Laboratorium</option><option value="Other">Annan</option></select></div>'+ 
      '<div class="field"><label>Extern VO₂max</label><input id="externalVo2Value" type="number" min="20" max="80" step="0.1" placeholder="t.ex. 46"></div><div><button id="saveVo2Ref" class="secondary" type="button">Spara referens</button></div></div>'+ 
      '<div id="vo2RefNote" class="notice">Trail Engine är huvudmåttet för hållbar aerob utveckling. Garmin och extern VO₂max visas som separata referenser.</div>';
    grid.prepend(el);
  }
  const vo2=$("vo2Samples90")?.closest(".panel");if(vo2&&!$("vo2ContextNote")){const n=document.createElement("div");n.id="vo2ContextNote";n.className="notice";n.style.marginTop="10px";vo2.appendChild(n)}
})();
function v25Vo2FromUi(){const source=$("externalVo2Source")?.value||"",raw=Number($("externalVo2Value")?.value);return{source,value:source&&Number.isFinite(raw)&&raw>=20&&raw<=80?raw:null}}
function v25CurrentVo2Ref(){const s=safeLocalGet(V25_VO2_REF_STORE,null);return s?.source&&Number.isFinite(Number(s.value))?{source:s.source,value:Number(s.value)}:v25Vo2FromUi()}
function v25SaveVo2(){safeLocalSet(V25_VO2_REF_STORE,v25Vo2FromUi());v25RenderVo2()}
function v25RestoreVo2(){const s=safeLocalGet(V25_VO2_REF_STORE,null);if(s){$("externalVo2Source").value=s.source||"";$("externalVo2Value").value=s.value??""}v25RenderVo2()}
function v25RenderVo2(){
  const ref=v25CurrentVo2Ref(),g=latestWellnessValue(["vo2max"]);
  if($("vo2RefSummary")){$("vo2RefSummary").textContent=ref?.value?ref.source+" "+fmt.format(ref.value):"INGEN EXTERN";$("vo2RefSummary").className="training-status "+(ref?.value?"done":"idle")}
  if($("vo2RefNote"))$("vo2RefNote").textContent=ref?.value?"Garmin "+(g?fmt.format(g.value):"—")+" · "+ref.source+" "+fmt.format(ref.value)+". Skillnaden behandlas som skillnad mellan estimat/modeller – inte automatiskt som fitnessförändring. Trail Engine är separat.":"Ingen extern VO₂-referens sparad.";
  if($("vo2ContextNote"))$("vo2ContextNote").textContent="Garmin senaste "+(g?fmt.format(g.value):"—")+(ref?.value?" · "+ref.source+" "+fmt.format(ref.value):"")+". En enskild punktförändring i Garmin behandlas som möjlig estimatvariation. Trail Engine följs separat.";
}

// ---------- snapshot / coach rules ----------
const v25CoachSnapshotBase=coachSnapshot;
coachSnapshot=function(){
  const x=v25CoachSnapshotBase();
  x.training_preferences=v25PlanPrefs();
  x.temporary_constraint=v25Constraint();
  x.external_vo2_reference=v25CurrentVo2Ref();
  x.strength_28d=v25StrengthSummary(28);
  if(x.requested_coach_output_schema?.workouts?.[0]){
    x.requested_coach_output_schema.workouts[0].type="Run | TrailRun | WeightTraining | NordicSki | Yoga | Hike | Rowing | Ride";
    x.requested_coach_output_schema.workouts[0].strength_steps="REQUIRED for WeightTraining. Include complete steps for every planned Gymstyrka A, B and/or C.";
  }
  x.coach_rules={
    respect_training_preferences:true,
    yoga_role:"recovery_stretch_mobility",
    strength_load:"use kg_lifted + FIT sets/reps/weight + session RPE; do not judge strength from HR load alone",
    temporary_constraint:"If no_running, prescribe no running until expiry. If no_trail, avoid technical trail. Low-impact replacements must be pain-free.",
    vo2_interpretation:"Garmin and external VO2max are separate estimates. Trail Engine is the primary long-term sustainable aerobic index."
  };
  const arr=x.recent_activities_60d||x.recent_activities||[];
  for(const a of arr){if(a?.id&&v25StrengthCache[String(a.id)])a.strength_fit=v25StrengthCache[String(a.id)]}
  return x;
};
const v25ExportSnapshotBase=exportSnapshot;
exportSnapshot=async function(){await v25HydrateStrength(28).catch(()=>0);return v25ExportSnapshotBase()};
if($("exportSnapshot"))$("exportSnapshot").onclick=exportSnapshot;

copyCoachPrompt=async function(){
  const text="Analysera bifogad Trail Coach Snapshot. Respektera training_preferences för antal och valda dagar för Gym A/B/C och yoga. Yoga är primärt återhämtning/stretch. Respektera temporary_constraint strikt: no_running = inga löppass före slutdatum; no_trail = undvik teknisk trail. Ersätt vid behov med rodd/inomhuscykel endast om aktiviteten är smärtfri. Bedöm styrka med kg_lifted, FIT set/reps/vikt och session-RPE, inte enbart puls/HR-load. Behandla Garmin VO₂max och external_vo2_reference som separata estimat; använd Trail Engine för långsiktig hållbar aerob trend. Skapa CoachPlan enligt requested_coach_output_schema.";
  try{await navigator.clipboard.writeText(text);snapshotMessage("Coach-prompt kopierad.","ok")}catch{snapshotMessage("Kunde inte kopiera prompten.","err")}
};
if($("copyCoachPrompt"))$("copyCoachPrompt").onclick=copyCoachPrompt;

// ---------- bindings / restore ----------
v25RestorePrefs();
v25RestoreConstraint();
v25RestoreVo2();
["gymCount","gymDayA","gymDayB","gymDayC","yogaCount","yogaDay1","yogaDay2","yogaDay3"].forEach(id=>{
  if($(id))$(id).addEventListener("change",()=>{v25SavePrefs();if($("v25TemplateNote"))$("v25TemplateNote").textContent="Veckorytm sparad. Tillämpa på utkast eller bygg en ny plan."});
});
if($("applyWeeklyTemplate"))$("applyWeeklyTemplate").onclick=()=>v25ApplyWeeklyTemplate();
["runRestriction","replacementPrimary","replacementSecondary","constraintUntil","constraintNote"].forEach(id=>{if($(id))$(id).addEventListener("change",v25RenderConstraint)});
if($("saveConstraint"))$("saveConstraint").onclick=()=>{v25SaveConstraint();$("constraintMsg").textContent=v25ConstraintActive()?"Begränsning sparad. Tillämpa på lokalt utkast innan publicering.":"Normal träning sparad."};
if($("applyConstraint"))$("applyConstraint").onclick=()=>v25ApplyConstraint();
if($("clearConstraint"))$("clearConstraint").onclick=v25ClearConstraint;
if($("saveVo2Ref"))$("saveVo2Ref").onclick=v25SaveVo2;

const v25RenderAllBase=renderAll;
renderAll=function(){v25RenderAllBase();v25RenderConstraint();v25RenderVo2()};
renderStrengthReference();