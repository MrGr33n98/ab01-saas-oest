// Service Worker for OEST SaaS Platform / DroneHub (PWA Progressive Enhancement)
const CACHE_NAME = "oest-v1.0.1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Network-only / pass-through during development
self.addEventListener("fetch", (event) => {
  // Let browser fetch normally
  return;
});
