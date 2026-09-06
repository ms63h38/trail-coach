// Trail Coach 2.5.2 — snapshot + strength duration hotfix
(function(){
  'use strict';

  const PLAN_PREFS_STORE='trailcoach_plan_preferences_v2';
  const CONSTRAINT_STORE='trailcoach_temp_constraint_v1';
  const VO2_REF_STORE='trailcoach_external_vo2_ref_v1';

  const getJSON=(k,fallback)=>{try{const s=localStorage.getItem(k);return s?JSON.parse(s):fallback}catch{return fallback}};
  const isStrengthPlan=p=>String(p?.type||'').toLowerCase().includes('weight')||String(p?.type||'').toLowerCase().includes('strength');
  const stepSeconds=st=>Math.max(10,Number(st?.seconds)||45)+Math.max(0,Number(st?.rest_seconds)||0);
  const totalStepSeconds=steps=>(Array.isArray(steps)?steps.reduce((q,st)=>q+stepSeconds(st),0):0);

  try{
    document.title='Trail Coach 2.5.2';
    const p=document.querySelector('.version-pill');if(p)p.textContent='v2.5.2';
    const vb=document.querySelector('.version-big');if(vb)vb.textContent='v2.5.2';
    const av=document.getElementById('appVersion');if(av)av.textContent='2.5.2';
    const ab=document.getElementById('appBuild');if(ab)ab.textContent='2026-09-06';
  }catch{}

  function normalizeStrengthPlan(p){
    if(!p||!isStrengthPlan(p)||!Array.isArray(p.strength_steps)||!p.strength_steps.length)return p;
    const target=Math.max(1,Math.round(Number(p.mins)||Number(p.minutes)||0))*60;
    if(!target)return p;
    const current=totalStepSeconds(p.strength_steps);
    if(!current)return p;

    if(Math.abs(current-target)<=120){
      p.description=(typeof strengthStepsToGarminDescription==='function')
        ? (strengthStepsToGarminDescription(p.name,p.strength_steps)||p.description)
        : p.description;
      p._tc_strength_duration_normalized=true;
      return p;
    }

    if(current<target-120){
      const original=p.strength_steps.map(x=>({...x}));
      let repeats=Math.max(1,Math.min(4,Math.round((target*0.88)/current)));
      while(repeats>1 && current*repeats>target-30)repeats--;
      if(repeats<1)repeats=1;

      const expanded=[];
      for(let set=1;set<=repeats;set++){
        for(const st of original){
          expanded.push({
            ...st,
            notes:[`set ${set}/${repeats}`,String(st.notes||'').replace(/set\s+\d+\/\d+/ig,'').trim()].filter(Boolean).join(' · ')
          });
        }
      }

      const used=totalStepSeconds(expanded);
      const padding=Math.max(0,target-used);
      if(padding>=20){
        expanded.unshift({
          exercise:'Lätt uppvärmning / teknik',reps:0,reps_per_side:false,
          seconds:padding,rest_seconds:0,notes:'tidsanpassning till planerad passtid'
        });
      }

      p.strength_steps=expanded;
      if(typeof strengthStepsToGarminDescription==='function'){
        p.description=strengthStepsToGarminDescription(p.name,expanded)||p.description;
      }
      p._tc_strength_duration_normalized=true;
      p._tc_strength_original_step_count=original.length;
      p._tc_strength_expanded_step_count=expanded.length;
    }
    return p;
  }

  function normalizeCurrentDraft(){
    try{
      if(!Array.isArray(localPlan))return 0;
      let n=0;
      for(const p of localPlan){
        if(isStrengthPlan(p)){
          const before=JSON.stringify(p.strength_steps||[]);
          normalizeStrengthPlan(p);
          if(JSON.stringify(p.strength_steps||[])!==before)n++;
        }
      }
      if(n&&typeof renderPlan==='function')renderPlan();
      return n;
    }catch{return 0}
  }

  if(typeof plannedEventPayload==='function'){
    const basePlannedEventPayload=plannedEventPayload;
    plannedEventPayload=function(p,externalId=null){
      normalizeStrengthPlan(p);
      return basePlannedEventPayload(p,externalId);
    };
  }

  if(typeof importCoachPlan==='function'){
    const baseImportCoachPlan=importCoachPlan;
    importCoachPlan=async function(){
      const r=await baseImportCoachPlan();
      normalizeCurrentDraft();
      return r;
    };
    const btn=document.getElementById('importCoachPlan');if(btn)btn.onclick=importCoachPlan;
  }

  if(typeof verifyPlanItemAgainstEvent==='function'){
    const baseVerify=verifyPlanItemAgainstEvent;
    verifyPlanItemAgainstEvent=function(p,e){
      const r=baseVerify(p,e);
      if(r.ok||!isStrengthPlan(p)||!e)return r;
      const reasons=String(r.reason||'').split(', ').filter(Boolean);
      const nonTime=reasons.filter(x=>!x.startsWith('tid '));
      const pm=Math.round(Number(p.mins)||0),em=(typeof scheduleEventMinutes==='function'?scheduleEventMinutes(e):0);
      const structured=(typeof strengthWorkoutStructured==='function')?strengthWorkoutStructured(e):true;
      if(nonTime.length===0&&structured&&pm&&em&&Math.abs(pm-em)<=3)return{ok:true,reason:'',event:e};
      return r;
    };
  }

  function planPrefs(){
    try{if(window.trailCoach25?.planPreferences)return window.trailCoach25.planPreferences()}catch{}
    return getJSON(PLAN_PREFS_STORE,{gym_count:2,gym_days:{A:1,B:4,C:2},yoga_count:2,yoga_days:[0,5,2]});
  }
  function constraint(){
    try{if(window.trailCoach25?.constraint)return window.trailCoach25.constraint()}catch{}
    return getJSON(CONSTRAINT_STORE,{run_restriction:'normal',replacement_primary:'Rowing',replacement_secondary:'Ride',until:'',note:''});
  }
  function externalVo2(){
    try{if(typeof v25CurrentVo2Ref==='function')return v25CurrentVo2Ref()}catch{}
    return getJSON(VO2_REF_STORE,{source:'',value:null});
  }
  function strengthSummary(){
    try{if(typeof v25StrengthSummary==='function')return v25StrengthSummary(28)}catch{}
    return null;
  }

  if(typeof coachSnapshot==='function'){
    const baseSnapshot=coachSnapshot;
    coachSnapshot=function(){
      const x=baseSnapshot();
      x.training_preferences=planPrefs();
      x.temporary_constraint=constraint();
      x.external_vo2_reference=externalVo2();
      x.strength_28d=strengthSummary();
      x.app_version='2.5.2';

      if(x.requested_coach_output_schema?.workouts?.[0]){
        x.requested_coach_output_schema.workouts[0].type='Run | TrailRun | WeightTraining | NordicSki | Yoga | Hike | Rowing | Ride';
        x.requested_coach_output_schema.workouts[0].strength_steps='REQUIRED for WeightTraining. Include complete exercise steps for each selected Gym A/B/C workout. One circuit may be expanded by the app to match planned minutes.';
      }
      x.coach_rules={
        ...(x.coach_rules||{}),
        respect_training_preferences:true,
        yoga_role:'recovery_stretch_mobility',
        strength_load:'use kg_lifted + FIT sets/reps/weight + session RPE; do not judge strength from HR load alone',
        temporary_constraint:'If no_running, prescribe no running until expiry. If no_trail, avoid technical trail. Low-impact replacements must be pain-free.',
        vo2_interpretation:'Garmin and external VO2max are separate estimates. Trail Engine is the primary long-term sustainable aerobic index.',
        strength_duration:'WeightTraining strength_steps must describe the exercise sequence; Trail Coach expands underspecified circuits so Intervals/Garmin duration matches workout.minutes.'
      };
      return x;
    };
  }

  exportSnapshot=async function(){
    if(!activities?.length)return snapshotMessage('Ingen data laddad.','err');
    try{if(typeof v25HydrateStrength==='function')await v25HydrateStrength(28)}catch{}
    const payload=coachSnapshot();
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    const shortDate=(typeof iso==='function'?iso(new Date()):new Date().toISOString().slice(0,10)).replaceAll('-','').slice(2);
    a.href=url;a.download=`TC_Snap_${shortDate}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    snapshotMessage('Coach Snapshot v2.5.2 skapad med planpreferenser, omprioritering, VO₂-referens och styrkedata.','ok');
  };
  const exportBtn=document.getElementById('exportSnapshot');if(exportBtn)exportBtn.onclick=exportSnapshot;

  copyCoachPrompt=async function(){
    const text='Analysera bifogad Trail Coach Snapshot. Respektera training_preferences för antal och valda dagar för Gym A/B/C och yoga. Yoga är återhämtning/stretch. Respektera temporary_constraint strikt: no_running = inga löppass före slutdatum; no_trail = undvik teknisk trail. Ersätt vid behov med rodd/inomhuscykel endast om smärtfritt. Bedöm styrka med kg_lifted, FIT set/reps/vikt och session-RPE, inte enbart puls/HR-load. Garmin VO₂max och external_vo2_reference är separata estimat; använd Trail Engine för långsiktig hållbar aerob trend. För WeightTraining ska strength_steps finnas; appen kan expandera ett angivet cirkelvarv så att Intervals/Garmin-passets struktur motsvarar workout.minutes. Skapa CoachPlan enligt requested_coach_output_schema.';
    try{await navigator.clipboard.writeText(text);snapshotMessage('Coach-prompt kopierad.','ok')}catch{snapshotMessage(text,'warn')}
  };
  const promptBtn=document.getElementById('copyCoachPrompt');if(promptBtn)promptBtn.onclick=copyCoachPrompt;

  const changed=normalizeCurrentDraft();
  if(changed){
    const about=document.querySelector('.about-card .notice');
    if(about)about.textContent+=' · styrkepassens strukturtid normaliserad';
  }

  window.__tc252Ready=true;
})();