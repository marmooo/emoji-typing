var CACHE_NAME="2022-06-11 00:00",urlsToCache=["/emoji-typing/","/emoji-typing/en/","/emoji-typing/index.js","/emoji-typing/data/en.csv","/emoji-typing/mp3/bgm.mp3","/emoji-typing/mp3/cat.mp3","/emoji-typing/mp3/correct.mp3","/emoji-typing/mp3/end.mp3","/emoji-typing/mp3/keyboard.mp3","/emoji-typing/favicon/favicon.svg","https://marmooo.github.io/fonts/textar-light.woff2","https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css","https://cdn.jsdelivr.net/npm/simple-keyboard@3.4.52/build/index.min.js"];self.addEventListener("install",function(e){e.waitUntil(caches.open(CACHE_NAME).then(function(e){return e.addAll(urlsToCache)}))}),self.addEventListener("fetch",function(e){e.respondWith(caches.match(e.request).then(function(t){return t||fetch(e.request)}))}),self.addEventListener("activate",function(e){var t=[CACHE_NAME];e.waitUntil(caches.keys().then(function(e){return Promise.all(e.map(function(e){if(t.indexOf(e)===-1)return caches.delete(e)}))}))})