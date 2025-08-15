// Service Worker for caching and performance optimization

const CACHE_NAME = 'slide-show-nexus-v1';
const API_CACHE_NAME = 'api-cache-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Add other static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/comprehensive-reports',
  '/api/shops',
  '/api/employees',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with different strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with cache-first strategy for reports
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network first
  event.respondWith(fetch(request));
});

// Helper functions
function isApiRequest(url) {
  return url.pathname.includes('/api/') || 
         url.pathname.includes('/rest/v1/') ||
         url.hostname.includes('supabase');
}

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/);
}

async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Only cache GET requests for reports
  if (request.method === 'GET' && shouldCacheApiRequest(url)) {
    return cacheFirst(request, API_CACHE_NAME, 5 * 60 * 1000); // 5 minutes TTL
  }
  
  // For other API requests, go network first
  return networkFirst(request);
}

function shouldCacheApiRequest(url) {
  return API_ENDPOINTS.some(endpoint => url.pathname.includes(endpoint)) ||
         url.pathname.includes('comprehensive_reports');
}

async function handleStaticAsset(request) {
  return cacheFirst(request, CACHE_NAME);
}

async function handleNavigation(request) {
  return networkFirst(request, CACHE_NAME);
}

// Caching strategies
async function cacheFirst(request, cacheName, ttl = null) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // If we have cached response, check if it's still valid
    if (cachedResponse) {
      if (ttl) {
        const cachedTime = cachedResponse.headers.get('cached-time');
        if (cachedTime && Date.now() - parseInt(cachedTime) < ttl) {
          return cachedResponse;
        }
      } else {
        return cachedResponse;
      }
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      
      // Add timestamp for TTL checking
      if (ttl) {
        const headers = new Headers(responseClone.headers);
        headers.set('cached-time', Date.now().toString());
        const modifiedResponse = new Response(await responseClone.blob(), {
          status: responseClone.status,
          statusText: responseClone.statusText,
          headers: headers
        });
        cache.put(request, modifiedResponse);
      } else {
        cache.put(request, responseClone);
      }
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache anyway
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

async function networkFirst(request, cacheName = CACHE_NAME) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && cacheName) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    if (cacheName) {
      const cache = await caches.open(cacheName);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    throw error;
  }
}

// Background sync for offline actions (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when back online
  // This can be used for queuing API calls made while offline
}

// Push notification handling (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        badge: '/favicon.ico'
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('Service Worker loaded and ready!');