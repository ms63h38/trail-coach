// Trail Coach 2.6.1 hotfix: manual workouts publish directly to Intervals.
(function(){
  'use strict';
  const q=id=>document.getElementById(id);

  function ensureManualTypes(){
    const sel=q('customType');
    if(!sel)return;
    if(![...sel.options].some(o=>o.value==='Rowing'))sel.add(new Option('Roddmaskin','Rowing'));
    if(![...sel.options].some(o=>o.value==='Ride'))sel.add(new Option('Inomhuscykel','Ride'));
  }

  async function publishOne(p){
    if(!apiKey)return{ok:false,reason:'Inte ansluten till Intervals'};
    preparePlanItemForPublish(p);
    const oldest=p.date,newest=p.date;
    try{
      const current=await icu(`/athlete/0/events?oldest=${oldest}&newest=${newest}`);
      const existing=Array.isArray(current.data)?current.data.filter(isWorkoutEvent):[];
      const ex=resolveExistingPlannedEvent(existing,p);
      let response;
      if(ex){
        const ext=s(ex,['external_id'],'')||stablePlanExternalId(p);
        response=await icu(`/athlete/0/events/${encodeURIComponent(ex.id)}`,{method:'PUT',body:plannedEventPayload(p,ext)});
      }else{
        p.external_id=stablePlanExternalId(p);
        response=await icu('/athlete/0/events',{method:'POST',body:plannedEventPayload(p,p.external_id)});
      }
      const written=response?.data&&typeof response.data==='object'?response.data:null;
      if(written){
        p.event_id=written.id??p.event_id;
        p.external_id=s(written,['external_id'],'')||p.external_id;
      }

      const verify=await icu(`/athlete/0/events?oldest=${oldest}&newest=${newest}`);
      const server=Array.isArray(verify.data)?verify.data.filter(isWorkoutEvent):[];
      let ev=null;
      if(p.event_id!=null)ev=server.find(x=>String(x.id)===String(p.event_id));
      if(!ev&&p.external_id)ev=server.find(x=>s(x,['external_id'],'')===p.external_id);
      if(!ev)ev=resolveExistingPlannedEvent(server,p);
      const check=verifyPlanItemAgainstEvent(p,ev);
      if(!check.ok){
        p.status='READY';
        return{ok:false,reason:check.reason||'Verifiering misslyckades'};
      }

      p.status='PUBLISHED';
      p.event_id=ev.id??p.event_id;
      p.external_id=s(ev,['external_id'],'')||p.external_id;
      await fetchScheduleOverview({quiet:true});
      renderPlan();
      renderPlanCommandCenter();
      renderPlanCockpit();
      renderNextUp();
      return{ok:true};
    }catch(e){
      p.status='READY';
      return{ok:false,reason:`HTTP ${e?.status||'?'} ${e?.body||e?.message||''}`};
    }
  }

  async function addAndPublish(){
    const d=q('customDate')?.value;
    const name=q('customName')?.value?.trim();
    const mins=Number(q('customMins')?.value);
    const type=q('customType')?.value;
    if(!d||!name||!mins)return planMsg('Fyll i datum, namn och minuter för eget pass.','warn');

    const item={
      date:d,kind:'custom',mins,name,type,
      target:type==='Rowing'?'Z1–Z2 HR':'Eget',
      description:type==='Rowing'?`Roddmaskin · ${mins} min\n- ${mins}m Z1-Z2 HR intensity=active`:`${mins} min ${name}`,
      week:1,source:'Eget',status:'READY',
      external_id:`tc2-${d}-${sportFamily(type)}-${tinyHash(`${d}|${type}|${name}`)}`
    };

    localPlan.push(item);
    localPlan.sort((a,b)=>a.date.localeCompare(b.date));
    const ws=iso(weekStart(parseDate(d)));
    setSelectedPlanWeek(ws);
    renderPlan();renderPlanCommandCenter();renderPlanCockpit();

    if(!apiKey){
      planMsg('Passet är sparat lokalt. Anslut till Intervals för att publicera.','warn');
      return;
    }

    const btn=q('addCustom');
    if(btn){btn.disabled=true;btn.textContent='Publicerar …';}
    planMsg(`Publicerar ${name} till Intervals …`,'');
    try{
      const r=await publishOne(item);
      if(r.ok)planMsg(`${name} publicerad och verifierad i Intervals.`,'ok');
      else planMsg(`${name} ligger kvar som lokalt utkast. Intervals: ${r.reason}`,'err');
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Lägg till & publicera';}
    }
  }

  function init(){
    ensureManualTypes();
    const btn=q('addCustom');
    if(!btn)return;
    btn.textContent='Lägg till & publicera';
    btn.onclick=addAndPublish;
    const pill=document.querySelector('.version-pill');if(pill)pill.textContent='v2.6.1';
    if(q('appVersion'))q('appVersion').textContent='2.6.1';
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();