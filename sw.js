const CACHE_NAME = "africanmundo-v2";

const ARQUIVOS = [
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS))
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(chaves =>
      Promise.all(
        chaves
          .filter(chave => chave !== CACHE_NAME)
          .map(chave => caches.delete(chave))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // Não interferir no painel de administração
  if (
    url.pathname.includes("admin") ||
    url.pathname.includes("painel") ||
    url.pathname.includes("supabase")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
