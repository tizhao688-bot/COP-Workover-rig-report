var CACHE='wrr-v8';
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
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request).then(function(r){
    return r||fetch(e.request).then(function(resp){
      var copy=resp.clone();caches.open(CACHE).then(function(c){try{c.put(e.request,copy);}catch(_){}});
      return resp;
    }).catch(function(){return caches.match('./index.html');});
  }));
});
