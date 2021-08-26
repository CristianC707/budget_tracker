const cache_name = "my-sight-cache-v1"
const data_cache_name = "data_cache_v1"



const Cache_Url = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/db.js',
    '/index.js',
    '/serviceworker/.js',
    '/styles.css'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches
        .open(cache_name)
        .then((cache) => cache.addAll(Cache_Url))
        .then(self.skipWaiting())
    );
  });

  self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api/')) {
      event.respondWith(
        caches.open(data_cache_name).then((cachedResponse) => {
            return fetch(event.request)
            .then(response => {
                if (response.status === 200) {
                    cache.put(event.request.url, response.clone());
                }
                return response
            })
            .catch(err => {
                return cache.match(event.request);
            })
            .catch(err => {
                console.log(err);
            });
        })
      );
    }
  });

  Event.respondWith(
      fetch(Event.request)
      .catch(function(){
          return caches.match(Event.request)
          .then(function(response){
              if (response) {
                  return response
              }
              else if (Event.request.headers.get("accept").includes("text/html")) {
                  return caches.match("/");
              }
              return response
          });
      })
  );