importScripts('/prox/uv/uv.bundle.js');
importScripts('/prox/uv/uv.config.js');
importScripts('/prox/uv/uv.sw.js');

const sw = new UVServiceWorker();

self.addEventListener('fetch', (event) => event.respondWith(sw.fetch(event)));
