/* Forgecraft service worker — caches the game for offline play.
   Bump CACHE version whenever you upload a new index.html so devices fetch the update. */
var CACHE = 'forgecraft-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }).catch(function(){}));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  // network-first for the HTML so updates show up; cache-first for everything else
  if(e.request.mode === 'navigate' || e.request.url.indexOf('index.html')>-1){
    e.respondWith(fetch(e.request).then(function(r){
      var copy=r.clone(); caches.open(CACHE).then(function(c){ c.put(e.request, copy); }); return r;
    }).catch(function(){ return caches.match(e.request).then(function(m){ return m || caches.match('./index.html'); }); }));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(m){ return m || fetch(e.request); }));
});
