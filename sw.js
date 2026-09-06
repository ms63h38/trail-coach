const CACHE="trailcoach-2-v250";
const ASSETS=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png",
  "./app-2.5.css","./v25-core.js","./v25-strength.js","./v25-plan.js","./v25-vo2.js"];

function patchHtml(text){
  let out=text
    .replaceAll("Trail Coach 2.3.1","Trail Coach 2.5")
    .replaceAll('APP_VERSION="2.3.1"','APP_VERSION="2.5.0"')
    .replaceAll('APP_BUILD="2026-09-03"','APP_BUILD="2026-09-06"')
    .replaceAll('>v2.3.1<','>v2.5<')
    .replaceAll('>2.3.1<','>2.5.0<');
  if(!out.includes("app-2.5.css"))out=out.replace("</head>",'<link rel="stylesheet" href="./app-2.5.css"></head>');
  if(!out.includes("v25-core.js")){
    const scripts='<script src="./v25-core.js"></script><script src="./v25-strength.js"></script><script src="./v25-plan.js"></script><script src="./v25-vo2.js"></script>';
    out=out.replace("</body>",scripts+"</body>");
  }
  return out;
}

self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);if(u.origin!==self.location.origin)return;
  const isHtml=e.request.mode==="navigate"||u.pathname.endsWith("/")||u.pathname.endsWith("/index.html");
  if(isHtml){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request,{cache:"no-store"});
        const text=patchHtml(await r.text());
        const h=new Headers(r.headers);h.set("content-type","text/html; charset=utf-8");
        const p=new Response(text,{status:r.status,statusText:r.statusText,headers:h});
        caches.open(CACHE).then(c=>c.put(e.request,p.clone()));return p;
      }catch{
        const c=await caches.match(e.request)||await caches.match("./index.html");if(!c)return Response.error();
        return new Response(patchHtml(await c.text()),{headers:{"content-type":"text/html; charset=utf-8"}});
      }
    })());return;
  }
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});