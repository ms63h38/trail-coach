const CACHE="trailcoach-2-v260-rowing2";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

const CUSTOM_TYPE_FROM='<select id="customType"><option value="Run">Löpning</option><option value="TrailRun">Trail</option><option value="WeightTraining">Styrka</option><option value="NordicSki">Längdskidor</option><option value="Yoga">Yoga</option><option value="Hike">Vandring</option></select>';
const CUSTOM_TYPE_TO='<select id="customType"><option value="Run">Löpning</option><option value="TrailRun">Trail</option><option value="WeightTraining">Styrka</option><option value="NordicSki">Längdskidor</option><option value="Yoga">Yoga</option><option value="Hike">Vandring</option><option value="Rowing">Roddmaskin</option></select>';

function patchHtml(text){
  // Patch only the manual workout type selector. Do not use a global Rowing check,
  // because Rowing already exists elsewhere in the Plan UI as a replacement activity.
  return text.includes(CUSTOM_TYPE_FROM) ? text.replace(CUSTOM_TYPE_FROM,CUSTOM_TYPE_TO) : text;
}

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));

self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;

  const isHtml=e.request.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("/index.html");
  if(isHtml){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request,{cache:"no-store"});
        const text=patchHtml(await r.text());
        const headers=new Headers(r.headers);
        headers.set("content-type","text/html; charset=utf-8");
        const patched=new Response(text,{status:r.status,statusText:r.statusText,headers});
        caches.open(CACHE).then(c=>c.put("./index.html",patched.clone()));
        return patched;
      }catch{
        const cached=await caches.match("./index.html");
        if(!cached)return Response.error();
        const text=patchHtml(await cached.text());
        return new Response(text,{headers:{"content-type":"text/html; charset=utf-8"}});
      }
    })());
    return;
  }

  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return r;
  }).catch(()=>caches.match(e.request)));
});