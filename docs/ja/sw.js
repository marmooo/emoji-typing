const CACHE_NAME="2024-07-12 09:30",urlsToCache=["/emoji-typing/","/emoji-typing/ja/","/emoji-typing/ja/index.yomi","/emoji-typing/index.js","/emoji-typing/data/ja.csv","/emoji-typing/mp3/bgm.mp3","/emoji-typing/mp3/cat.mp3","/emoji-typing/mp3/correct.mp3","/emoji-typing/mp3/end.mp3","/emoji-typing/mp3/keyboard.mp3","/emoji-typing/favicon/favicon.svg","https://marmooo.github.io/yomico/yomico.min.js","https://marmooo.github.io/fonts/textar-light.woff2"];self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(e=>e.addAll(urlsToCache)))}),self.addEventListener("fetch",e=>{e.respondWith(caches.match(e.request).then(t=>t||fetch(e.request)))}),self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(e=>Promise.all(e.filter(e=>e!==CACHE_NAME).map(e=>caches.delete(e)))))})