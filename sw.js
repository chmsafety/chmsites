// CHM 사업장 관리 — 서비스 워커 (앱 설치용)
// 화면 파일과 아이콘만 저장한다. 사업장 데이터·사진·로그인(Supabase)은 절대 저장하지 않는다.
const CACHE = 'chmsites-shell-v8';
const SHELL = ['./', './index.html', './manifest.json', './chmsites-192.png', './chmsites-512.png', './chmsites-maskable-512.png', './chmsites-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('chmsites-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/chmsites/')) return; // 서버 통신은 손대지 않음
  if (req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    // 화면은 항상 최신본을 먼저 받고, 연결이 끊겼을 때만 저장본 사용
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
