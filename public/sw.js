/**
 * This file was copied from library-simplified-webpub-viewer
 * and should be removed once we transition to the new web-reader.
 */

const CACHE_NAME = "webpub-viewer";
self.addEventListener("activate", () => {
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  // Response from the cache immediately if possible, but also fetch an update.
  const cachedOrFetchedResponse = self.caches.open(CACHE_NAME).then(cache => {
    return self.caches.match(event.request).then(cacheResponse => {
      const fetchPromise = self.fetch(event.request).then(fetchResponse => {
        cache.put(event.request, fetchResponse.clone());
        return fetchResponse;
      });
      return cacheResponse || fetchPromise;
    });
  });
  event.respondWith(cachedOrFetchedResponse);
});
