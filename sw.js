const CACHE="trailcoach-2-v232";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];

const V232_PATCH=`<style id="tc-v232-mobile-kpi-fix">
.trail-engine-mini-head{min-width:0}
.trail-engine-mini-head h3{white-space:nowrap;min-width:0}
.trail-engine-mini-delta{flex:0 0 auto;white-space:nowrap;margin-left:8px}
@media(max-width:560px){
  #dashboard > .grid > .metric{grid-column:span 6!important;min-height:116px;padding:14px}
  #dashboard > .grid > .metric h3{font-size:10px;letter-spacing:.075em;white-space:nowrap}
  #dashboard > .grid > .metric .value{font-size:30px;margin-top:8px}
  #dashboard > .grid > .metric .sub{font-size:10px;line-height:1.35;max-width:100%}
  .trail-engine-mini-head{display:block}
  .trail-engine-mini-delta{display:block;margin:4px 0 0;font-size:9px;line-height:1.2}
  .trail-engine-metric .value{margin-top:6px!important}
}
@media(max-width:360px){
  #dashboard > .grid > .metric{min-height:112px;padding:12px}
  #dashboard > .grid > .metric .value{font-size:27px}
}
</style>`;

function patchHtml(text){
  let out=text.replaceAll("2.3.1","2.3.2");
  if(!out.includes('tc-v232-mobile-kpi-fix'))out=out.replace("</head>",V232_PATCH+"</head>");
  return out;
}

self.addEventListener("install",e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>e.waitUntil(
  Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ])
));

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
        const headers=new Headers(r.headers);headers.set("content-type","text/html; charset=utf-8");
        const patched=new Response(text,{status:r.status,statusText:r.statusText,headers});
        caches.open(CACHE).then(c=>c.put(e.request,patched.clone()));
        return patched;
      }catch{
        const cached=await caches.match(e.request)||await caches.match("./index.html");
        if(!cached)return Response.error();
        const text=patchHtml(await cached.text());
        return new Response(text,{headers:{"content-type":"text/html; charset=utf-8"}});
      }
    })());
    return;
  }

  e.respondWith(fetch(e.request).then(r=>{
    const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;
  }).catch(()=>caches.match(e.request)));
});