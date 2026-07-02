var CACHE='wrr-v13';
var ASSETS=['./','./index.html','./manifest.webmanifest','./docx.umd.js',
  './apple-touch-icon.png','./icon-152.png','./icon-167.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var isHTML=req.mode==='navigate'||((req.headers.get('accept')||'').indexOf('text/html')!==-1);
  if(isHTML){
    // NETWORK-FIRST for the page itself: always get the latest, fall back to cache only when offline.
    e.respondWith(
      fetch(req).then(function(resp){
        var copy=resp.clone();caches.open(CACHE).then(function(c){try{c.put('./index.html',copy);}catch(_){}});
        return resp;
      }).catch(function(){return caches.match('./index.html').then(function(r){return r||caches.match('./');});})
    );
    return;
  }
  // CACHE-FIRST for static assets (they change only when the cache version bumps).
  e.respondWith(caches.match(req).then(function(r){
    return r||fetch(req).then(function(resp){
      var copy=resp.clone();caches.open(CACHE).then(function(c){try{c.put(req,copy);}catch(_){}});
      return resp;
    });
  }));
});
