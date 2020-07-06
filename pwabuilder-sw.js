// modified from https://www.pwabuilder.com/serviceworker
// StaleWhileRevalidate strategy
// bigger maxEntries
//This is the service worker with the Advanced caching

// for json files, we will use a regex instead of a destination
// a request.destination must be one of the following:
// (https://fetch.spec.whatwg.org/#concept-request-destination)
// empty string, "audio", "audioworklet", "document", "embed", "font", "frame", "iframe", "image", "manifest", 
// "object", "paintworklet", "report", "script", "serviceworker", "sharedworker", "style", "track", "video", "worker", or "xslt"

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

const HTML_CACHE = "html";
const JS_CACHE = "javascript";
const STYLE_CACHE = "stylesheets";
const IMAGE_CACHE = "images";
const FONT_CACHE = "fonts";
const JSON_CACHE = "json";

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

workbox.routing.registerRoute(
    ({ event }) => event.request.destination === 'document',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: HTML_CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 20,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ event }) => event.request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: JS_CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ event }) => event.request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: STYLE_CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ event }) => event.request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: IMAGE_CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    ({ event }) => event.request.destination === 'font',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: FONT_CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 15,
            }),
        ],
    })
);

workbox.routing.registerRoute(
    new RegExp('.+\\.json$'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: JSON_CACHE,
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 100,
            }),
        ],
    })
);



