/* ─── AutoCare Service Worker ─────────────────────────────────────── */
const CACHE = 'autocare-v1';
const ASSETS = [
  './',
  './index.html',
  './vehiculo.html',
  './mantenimiento.html',
  './historial.html',
  './gastos.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/storage.js',
  './js/dashboard.js',
  './js/vehiculo.js',
  './js/mantenimiento.js',
  './js/historial.js',
  './js/gastos.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/favicon.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => cached)
    )
  );
});

// Recordatorio periódico (cuando el SW se activa con clientes)
self.addEventListener('message', e => {
  if (e.data?.type === 'CHECK_ALERTS') {
    // Los clientes manejan la lógica; aquí solo respondemos
    self.clients.matchAll().then(clients => {
      clients.forEach(c => c.postMessage({ type: 'ALERT_CHECK_OK' }));
    });
  }
});
