/* WORD QUEST 5-region release 2026-10-16. Always request current code from network. */
const VERSION='wordquest-five-regions-20261016';
self.addEventListener('install', event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('wordquest')&&key!==VERSION)await caches.delete(key);}await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin||event.request.method!=='GET')return;
 if(event.request.mode==='navigate'||/\.(?:js|html|css|webmanifest)$/.test(url.pathname)){
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(async()=>{
   const cached=await caches.match(event.request);
   return cached||Response.error();
  }));
 }
});
