// 2K Pro-Am Ekstraklasa — service worker
// Strona zawsze pobierana z sieci (świeże dane i aktualizacje); kopia w pamięci tylko na wypadek braku internetu.
const CACHE = 'ekstraklasa-v3';
const SW_VERSION = 3; // wersja z obsługą powiadomień push
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // API ligi, czcionki, Discord — bez pośrednictwa
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res.ok && /\/icons\//.test(url.pathname)) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});

// ── 🔔 Powiadomienia push: serwer wysyła sygnał, treść pobieramy z Workera ligi ──
const LEAGUE_API = 'https://kw5-elite-proxy.igor-bernakiewicz.workers.dev';
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let msgs = [];
    try {
      const sub = await self.registration.pushManager.getSubscription();
      const r = await fetch(LEAGUE_API + '/push/inbox', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub && sub.endpoint }) });
      msgs = (await r.json()).messages || [];
    } catch (err) {}
    if (!msgs.length) msgs = [{ id: 'x', title: '🏀 2K Ekstraklasa', body: 'Nowości w lidze — zajrzyj na stronę', url: './' }];
    for (const m of msgs.slice(-3)) {
      await self.registration.showNotification(m.title, { body: m.body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: m.id, data: { url: m.url || './' } });
    }
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(c => c.url.startsWith(self.registration.scope));
    if (open) { open.focus(); return open.navigate(url).catch(() => {}); }
    return self.clients.openWindow(url);
  }));
});

// diagnostyka: strona pyta o wersję działającego service workera
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'version' && e.ports && e.ports[0]) e.ports[0].postMessage({ version: SW_VERSION, push: true });
});
