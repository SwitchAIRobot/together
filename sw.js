const V='together-v1',FILES=['./','index.html','styles.css','app.js','manifest.webmanifest','icon-192.png','icon-512.png','icon.svg','community.json','videos.json','socialmedia.json','fuse.min.js','leaflet.js','leaflet.css'];
self.addEventListener('install',e=>e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('index.html'))))});
