self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Activate immediately
});

self.addEventListener('fetch', (e) => {
  // Basic pass-through fetch handler for PWA requirements
  e.respondWith(fetch(e.request).catch(() => new Response("Offline")));
});
