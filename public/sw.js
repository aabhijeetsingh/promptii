const STATIC_CACHE_NAME = 'promptii-static-v1';
const DYNAMIC_CACHE_NAME = 'promptii-dynamic-v1';

// URLs for the "app shell" that should be cached on install
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  // Because the dependencies are loaded via importmap from a CDN,
  // caching them explicitly is complex and can be brittle if versions change.
  // The dynamic cache will handle them as they are requested.
  'https://cdn.tailwindcss.com',
];

// On install, cache the app shell
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precaching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('[SW] App Shell caching failed', err);
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
          console.log('[SW] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

// On fetch, use different strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // For API calls (e.g., to Google GenAI or Firebase), always go to the network.
  // Do not cache these requests as they are dynamic and require authentication.
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebase')) {
    event.respondWith(fetch(request));
    return;
  }
  
  // For other requests (app shell, assets), use a cache-first strategy.
  // It first checks the cache, and if not found, fetches from the network
  // and adds the response to the dynamic cache.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return from cache
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then(networkResponse => {
            // If we got a valid response, cache it in the dynamic cache
            if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(DYNAMIC_CACHE_NAME)
                    .then(cache => {
                        cache.put(request, responseToCache);
                    });
            }
            return networkResponse;
          })
          .catch(error => {
            // This is where you could return a fallback offline page if you had one.
            console.error('[SW] Fetch failed; returning offline fallback if available.', error);
          });
      })
  );
});