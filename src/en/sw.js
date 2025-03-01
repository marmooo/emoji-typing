const CACHE_NAME = "2025-03-02 00:00";
const urlsToCache = [
  "/emoji-typing/",
  "/emoji-typing/en/",
  "/emoji-typing/index.js",
  "/emoji-typing/data/en.csv",
  "/emoji-typing/mp3/bgm.mp3",
  "/emoji-typing/mp3/cat.mp3",
  "/emoji-typing/mp3/correct.mp3",
  "/emoji-typing/mp3/end.mp3",
  "/emoji-typing/mp3/keyboard.mp3",
  "/emoji-typing/favicon/favicon.svg",
  "https://marmooo.github.io/fonts/textar-light.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
