const CACHE = 'cnf-v1';

// App shell — files to pre-cache on install
const PRECACHE = [
  '/login.html',
  '/signup.html',
  '/dashboard.html',
  '/styles.css',
  '/images/logo.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      // allSettled so a missing icon file doesn't break the whole install
      Promise.allSettled(PRECACHE.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Activate: delete any old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: smart routing strategy
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Always go straight to network for Firebase, Google APIs, fonts, analytics
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googleapis.com') ||
    url.includes('gstatic.com') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('google-analytics.com')
  ) {
    return; // browser handles it normally
  }

  // Network-first for HTML pages (picks up deploys quickly, falls back to cache)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for CSS, images, and other static assets
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
