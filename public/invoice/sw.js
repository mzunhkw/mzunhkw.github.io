// عمل التطبيق بدون إنترنت: الشبكة أولًا، والنسخة المحفوظة عند انقطاع الاتصال
const CACHE = 'mazuna-invoice-v1';
const ASSETS = ['/invoice/', '/invoice/app.js?v=1', '/invoice/invoice.css?v=1', '/invoice/codes.json', '/invoice/vendor/qrcode.js', '/invoice/vendor/html2canvas.min.js', '/invoice/vendor/jspdf.umd.min.js', '/logo.png', '/logo-header.webp'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
