// Trail Coach 2.5.1 — robust planner module
// Deliberately avoids the base app's $ helper during bootstrap.
(function(){
  'use strict';
  const q=id=>document.getElementById(id);
  const STORE_PREF='trailcoach_plan_preferences_v2';
  const STORE_CONSTRAINT='trailcoach_temp_constraint_v1';
  const days=['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
  const shortDays=['mån','tis','ons','tor','fre','lör','sön'];
  const getJSON=(k,fallback)=>{try{const x=localStorage.getItem(k);return x?JSON.parse(x):fallback}catch{return fallback}};
  const setJSON=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  const isoLocal=d=>{const x=new Date(d);x.setHours(12,0,0,0);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')};
  const parseLocal=s=>{const [y,m,d]=String(s).slice(0,10).split('-').map(Number);return new Date(y,m-1,d,12)};
  const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
  const monday=d=>{const x=new Date(d);x.setHours(12,0,0,0);const w=(x.getDay()+6)%7;x.setDate(x.getDate()-w);return x};
  const dayOptions=selected=>days.map((x,i)=>`<option value="${i}" ${i===selected?'selected':''}>${x}</option>`).join('');

  function injectWeeklyTemplate(){
    if(q('gymCount')) return true;
    const sm=q('strengthMode');
    if(!sm) return false;
    q('flexStrengthDay')?.closest('.field')?.remove();
    const host=sm.closest('.field');
    if(!host) return false;
    const el=document.createElement('div');
    el.className='v25-week-template';
    el.innerHTML=`
      <div class="field"><label>Gympass / vecka</label><select id="gymCount"><option value="0">0</option><option value="1">1 · Gym A</option><option value="2" selected>2 · Gym A + B</option><option value="3">3 · Gym A + B + C</option></select></div>
      <div class="field v25-slot" data-gym-slot="1"><label>Gym A · dag</label><select id="gymDayA">${dayOptions(1)}</select></div>
      <div class="field v25-slot" data-gym-slot="2"><label>Gym B · dag</label><select id="gymDayB">${dayOptions(4)}</select></div>
      <div class="field v25-slot" data-gym-slot="3"><label>Gym C · dag</label><select id="gymDayC">${dayOptions(2)}</select></div>
      <div class="field"><label>Yoga / vecka</label><select id="yogaCount"><option value="0">0</option><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select></div>
      <div class="field v25-slot" data-yoga-slot="1"><label>Yoga 1 · dag</label><select id="yogaDay1">${dayOptions(0)}</select></div>
      <div class="field v25-slot" data-yoga-slot="2"><label>Yoga 2 · dag</label><select id="yogaDay2">${dayOptions(5)}</select></div>
      <div class="field v25-slot" data-yoga-slot="3"><label>Yoga 3 · dag</label><select id="yogaDay3">${dayOptions(2)}</select></div>
      <div class="field v25-template-actions"><button id="applyWeeklyTemplate" class="secondary" type="button">Tillämpa veckorytm på utkast</button></div>
      <div id="v25TemplateNote" class="small v25-template-note">Yoga behandlas som återhämtning/stretch. Valen sparas lokalt.</div>`;
    host.insertAdjacentElement('afterend',el);
    return true;
  }

  function injectConstraint(){
    if(q('runRestriction')) return true;
    const anchor=document.querySelector('.schedule-overview-panel');
    if(!anchor) return false;
    const el=document.createElement('section');
    el.className='panel full v25-constraint-panel';
    el.innerHTML=`
      <div class="v25-constraint-head"><div><h2>Tillfällig omprioritering</h2><div class="small">Ändrar endast lokalt utkast. Publicering till Intervals är fortsatt separat.</div></div><div id="v25ConstraintBadge" class="training-status idle v25-constraint-badge">NORMAL</div></div>
      <div class="v25-constraint-grid">
        <div class="field"><label>Löprestriktion</label><select id="runRestriction"><option value="normal">Normal träning</option><option value="no_trail">Undvik teknisk trail · platt/löpband</option><option value="no_running">Pausa all löpning · låg impact</option></select></div>
        <div class="field"><label>Primär ersättning</label><select id="replacementPrimary"><option value="Rowing">Roddmaskin</option><option value="Ride">Inomhuscykel</option></select></div>
        <div class="field"><label>Alternativ</label><select id="replacementSecondary"><option value="Ride">Inomhuscykel</option><option value="Rowing">Roddmaskin</option></select></div>
        <div class="field"><label>Gäller till och med</label><input id="constraintUntil" type="date"></div>
      </div>
      <div class="field"><label>Notering till Coach</label><input id="constraintNote" type="text" placeholder="Ex. öm tå – använd endast smärtfria alternativ"></div>
      <div class="v25-constraint-actions"><button id="saveConstraint" class="secondary" type="button">Spara</button><button id="applyConstraint" class="good" type="button">Tillämpa på utkast</button><button id="clearConstraint" class="secondary" type="button">Återställ normal</button></div>
      <div id="constraintMsg" class="notice">Ingen tillfällig begränsning aktiv.</div>`;
    anchor.insertAdjacentElement('beforebegin',el);
    return true;
  }

  function prefs(){
    return {
      gym_count:Math.max(0,Math.min(3,Number(q('gymCount')?.value||2))),
      gym_days:{A:Number(q('gymDayA')?.value||1),B:Number(q('gymDayB')?.value||4),C:Number(q('gymDayC')?.value||2)},
      yoga_count:Math.max(0,Math.min(3,Number(q('yogaCount')?.value||2))),
      yoga_days:[Number(q('yogaDay1')?.value||0),Number(q('yogaDay2')?.value||5),Number(q('yogaDay3')?.value||2)]
    };
  }
  function syncSlots(){
    const p=prefs();
    document.querySelectorAll('[data-gym-slot]').forEach(el=>{const off=Number(el.dataset.gymSlot)>p.gym_count;el.classList.toggle('slot-disabled',off);const s=el.querySelector('select');if(s)s.disabled=off});
    document.querySelectorAll('[data-yoga-slot]').forEach(el=>{const off=Number(el.dataset.yogaSlot)>p.yoga_count;el.classList.toggle('slot-disabled',off);const s=el.querySelector('select');if(s)s.disabled=off});
  }
  function savePrefs(){const p=prefs();setJSON(STORE_PREF,p);syncSlots();return p}
  function restorePrefs(){
    const p=getJSON(STORE_PREF,null);if(p){
      q('gymCount').value=String(p.gym_count??2);q('gymDayA').value=String(p.gym_days?.A??1);q('gymDayB').value=String(p.gym_days?.B??4);q('gymDayC').value=String(p.gym_days?.C??2);
      q('yogaCount').value=String(p.yoga_count??2);q('yogaDay1').value=String(p.yoga_days?.[0]??0);q('yogaDay2').value=String(p.yoga_days?.[1]??5);q('yogaDay3').value=String(p.yoga_days?.[2]??2);
    }syncSlots();
  }

  function strengthLetter(p,i){const n=String(p?.name||'').toLowerCase();if(n.includes('styrka a'))return'A';if(n.includes('styrka b'))return'B';if(n.includes('styrka c'))return'C';return ['A','B','C'][i]||'C'}
  function isStrength(p){const t=String(p?.type||'').toLowerCase();return t.includes('weight')||t.includes('strength')}
  function isYoga(p){return String(p?.type||'').toLowerCase().includes('yoga')}
  function isRun(p){const t=String(p?.type||'').toLowerCase();return t.includes('run')}
  function markDraft(p,reason){if(p.id!=null&&p.event_id==null)p.event_id=p.id;p.status='READY';p.source='Trail Coach · '+reason;return p}

  function makeStrengthC(start,slot,template){
    if(typeof makePlanEvent!=='function') return null;
    const mode=q('strengthMode')?.value||'gym',name='Trail Coach · '+(mode==='gym'?'Gymstyrka':'Hemstyrka')+' C';
    const ev=makePlanEvent(add(start,slot.offset),'strengthC',mode==='gym'?40:25,name,typeof resolveMode==='function'?resolveMode(start):'trail',template?.week||1,'Coach');
    ev.strength_mode=mode;
    if(typeof canonicalStrengthSteps==='function')ev.strength_steps=canonicalStrengthSteps('strengthC',mode,3);
    if(typeof strengthStepsToGarminDescription==='function'&&ev.strength_steps)ev.description=strengthStepsToGarminDescription(name,ev.strength_steps);
    return ev;
  }

  function applyWeeklyTemplate({quiet=false}={}){
    if(typeof localPlan==='undefined'||!Array.isArray(localPlan)||!localPlan.length){if(!quiet&&q('v25TemplateNote'))q('v25TemplateNote').textContent='Inget lokalt utkast att ändra.';return 0}
    const p=savePrefs(), groups=new Map(), remove=new Set();let changed=0;
    for(const item of localPlan){const ws=isoLocal(monday(parseLocal(item.date)));if(!groups.has(ws))groups.set(ws,[]);groups.get(ws).push(item)}
    for(const [ws,list] of groups){
      const start=parseLocal(ws), strength=list.filter(isStrength), selected=['A','B','C'].slice(0,p.gym_count).map(letter=>({letter,offset:Number(p.gym_days[letter])}));
      const by={};strength.forEach((x,i)=>by[strengthLetter(x,i)]=x);
      for(const slot of selected){let item=by[slot.letter];if(!item&&slot.letter==='C'){item=makeStrengthC(start,slot,strength[0]);if(item){localPlan.push(item);by.C=item;changed++}}if(item){const nd=isoLocal(add(start,slot.offset));if(item.date!==nd){item.date=nd;markDraft(item,'veckorytm');changed++}}}
      strength.forEach((x,i)=>{const l=strengthLetter(x,i);if(!selected.some(s=>s.letter===l)){remove.add(x);changed++}});
      const yoga=list.filter(isYoga);for(let i=0;i<yoga.length;i++){if(i>=p.yoga_count){remove.add(yoga[i]);changed++;continue}const nd=isoLocal(add(start,p.yoga_days[i]));if(yoga[i].date!==nd){yoga[i].date=nd;markDraft(yoga[i],'veckorytm');changed++}}
    }
    localPlan=localPlan.filter(x=>!remove.has(x)).sort((a,b)=>a.date.localeCompare(b.date));
    if(typeof renderPlan==='function')renderPlan();if(typeof renderPlanCommandCenter==='function')renderPlanCommandCenter();
    if(!quiet&&q('v25TemplateNote'))q('v25TemplateNote').textContent=changed?changed+' planposter ändrade. Granska innan publicering.':'Veckorytmen matchar redan utkastet.';
    return changed;
  }

  function constraint(){return{run_restriction:q('runRestriction')?.value||'normal',replacement_primary:q('replacementPrimary')?.value||'Rowing',replacement_secondary:q('replacementSecondary')?.value||'Ride',until:q('constraintUntil')?.value||'',note:q('constraintNote')?.value?.trim()||''}}
  function active(c=constraint()){return c.run_restriction!=='normal'&&(!c.until||c.until>=isoLocal(new Date()))}
  function renderConstraint(){const c=constraint(),a=active(c);if(q('v25ConstraintBadge')){q('v25ConstraintBadge').textContent=a?(c.run_restriction==='no_running'?'PAUSA LÖPNING':'INGEN TEKNISK TRAIL'):'NORMAL';q('v25ConstraintBadge').className='training-status '+(a?'candidate':'idle')+' v25-constraint-badge'}document.querySelector('.v25-constraint-panel')?.classList.toggle('active',a);if(q('constraintMsg'))q('constraintMsg').textContent=a?`Aktiv${c.until?' till '+c.until:''} · primärt ${c.replacement_primary==='Rowing'?'roddmaskin':'inomhuscykel'}. Använd endast smärtfria alternativ.`:'Ingen tillfällig begränsning aktiv.'}
  function saveConstraint(){const c=constraint();setJSON(STORE_CONSTRAINT,c);renderConstraint();return c}
  function restoreConstraint(){const c=getJSON(STORE_CONSTRAINT,null);if(c){q('runRestriction').value=c.run_restriction||'normal';q('replacementPrimary').value=c.replacement_primary||'Rowing';q('replacementSecondary').value=c.replacement_secondary||'Ride';q('constraintUntil').value=c.until||'';q('constraintNote').value=c.note||''}renderConstraint()}
  function applyConstraint({quiet=false}={}){
    const c=constraint();if(!active(c)||typeof localPlan==='undefined'||!Array.isArray(localPlan)){if(!quiet&&q('constraintMsg'))q('constraintMsg').textContent='Ingen aktiv begränsning att tillämpa.';return 0}
    let changed=0;for(const p of localPlan){if(!isRun(p))continue;if(p.id!=null&&p.event_id==null)p.event_id=p.id;p.original_name=p.original_name||p.name;p.original_type=p.original_type||p.type;if(c.run_restriction==='no_trail'){p.type='Run';p.name=String(p.name||'').replace(/trail/ig,'platt/löpband').replace(/Backuthållighet/ig,'Löpband · kontrollerat');p.description='Undvik teknisk trail tillfälligt.\n\n'+(p.description||'');p.target='HR · platt/löpband';markDraft(p,'omprioritering');changed++}else if(c.run_restriction==='no_running'){const primary=c.replacement_primary||'Rowing';p.type=primary;p.name='Trail Coach · '+(primary==='Rowing'?'Rodd':'Inomhuscykel')+' · ersätter '+(p.kind||'löpning');p.mins=primary==='Rowing'?Math.min(Number(p.mins)||45,p.kind==='long'?60:50):Math.min(Number(p.mins)||45,p.kind==='long'?90:60);p.description=`Tillfällig låg-impact-ersättning för ${p.original_name}.\nAlternativ: ${c.replacement_secondary==='Rowing'?'roddmaskin':'inomhuscykel'}.\nByt/avbryt om smärta ökar.\n\n- ${Math.round(p.mins)}m Z1-Z2 HR intensity=active`;p.target='Z1–Z2 HR · låg impact';p.planned_load=null;markDraft(p,'omprioritering');changed++}}
    if(typeof renderPlan==='function')renderPlan();if(typeof renderPlanCommandCenter==='function')renderPlanCommandCenter();if(!quiet&&q('constraintMsg'))q('constraintMsg').textContent=changed?changed+' löppass omprioriterade i lokalt utkast. Granska innan publicering.':'Inga löppass behövde ändras.';renderConstraint();return changed
  }

  function init(){
    const ok1=injectWeeklyTemplate(),ok2=injectConstraint();
    if(!ok1||!ok2){window.__tc25PlanError='DOM anchor missing';return}
    restorePrefs();restoreConstraint();
    ['gymCount','gymDayA','gymDayB','gymDayC','yogaCount','yogaDay1','yogaDay2','yogaDay3'].forEach(id=>q(id)?.addEventListener('change',()=>{savePrefs()}));
    q('applyWeeklyTemplate')?.addEventListener('click',()=>applyWeeklyTemplate());
    ['runRestriction','replacementPrimary','replacementSecondary','constraintUntil','constraintNote'].forEach(id=>q(id)?.addEventListener('change',renderConstraint));
    q('saveConstraint')?.addEventListener('click',saveConstraint);q('applyConstraint')?.addEventListener('click',()=>applyConstraint());q('clearConstraint')?.addEventListener('click',()=>{q('runRestriction').value='normal';q('constraintUntil').value='';q('constraintNote').value='';saveConstraint();if(q('constraintMsg'))q('constraintMsg').textContent='Normal träning återställd. Bygg/hämta utkastet igen om du vill återställa redan konverterade pass.'});
    // Wrap plan creation/import so preferences and constraints are applied automatically.
    if(typeof buildPlan==='function'){const baseBuild=buildPlan;buildPlan=function(){const r=baseBuild.apply(this,arguments);applyWeeklyTemplate({quiet:true});applyConstraint({quiet:true});return r};if(q('generatePlan'))q('generatePlan').onclick=buildPlan}
    if(typeof importCoachPlan==='function'){const baseImport=importCoachPlan;importCoachPlan=async function(){const r=await baseImport.apply(this,arguments);applyWeeklyTemplate({quiet:true});applyConstraint({quiet:true});return r};if(q('importCoachPlan'))q('importCoachPlan').onclick=importCoachPlan}
    window.tc25Plan={prefs,applyWeeklyTemplate,constraint,applyConstraint};window.__tc25PlanReady=true;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();