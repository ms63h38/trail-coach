// ===== Trail Coach v2.5 runtime patch =====
const V25_PLAN_PREFS_STORE="trailcoach_plan_preferences_v2";
const V25_CONSTRAINT_STORE="trailcoach_temp_constraint_v1";
const V25_VO2_REF_STORE="trailcoach_external_vo2_ref_v1";
const V25_STRENGTH_STORE="trailcoach_strength_fit_cache_v1";
let v25StrengthCache=safeLocalGet(V25_STRENGTH_STORE,{})||{};

try{
  const p=document.querySelector(".version-pill");if(p)p.textContent="v2.5";
  const vb=document.querySelector(".version-big");if(vb)vb.textContent="v2.5";
  if($("appVersion"))$("appVersion").textContent="2.5.0";
  if($("appBuild"))$("appBuild").textContent="2026-09-06";
  const about=document.querySelector(".about-card .notice");
  if(about)about.textContent="v2.5 · flexibel Gym A/B/C + yoga, tillfällig omprioritering och separata VO₂-referenser.";
}catch{}

// ---------- canvas/iPhone fix ----------
prepCanvas=function(canvas,cssHeight){
  if(!canvas)return null;
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||rect.width<80)return null;
  const dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
  const w=Math.round(rect.width),h=Math.round(cssHeight||Math.max(10,rect.height));
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.height=h+"px";
  const ctx=canvas.getContext("2d");ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w,h};
};
const v25ActivateTabBase=activateTab;
activateTab=function(id,opts={}){
  v25ActivateTabBase(id,opts);
  requestAnimationFrame(()=>{if(id==="trends")renderTrends();if(id==="dashboard"){renderTrailEngine();drawTodayTrailEngineChart();}});
};