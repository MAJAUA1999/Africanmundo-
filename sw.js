const CACHE_NAME = "africanmundo-v6";

const ARQUIVOS = [
  "./index.html",
  "./manifest.json",
  "./estilo.css",
  "./app.js"
];


/* =========================================
   INSTALAR
========================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARQUIVOS))

  );

  self.skipWaiting();

});


/* =========================================
   ACTIVAR
   LIMPA TODOS OS CACHES ANTIGOS
========================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(chaves => {

        return Promise.all(

          chaves
            .filter(chave => chave !== CACHE_NAME)
            .map(chave => caches.delete(chave))

        );

      })
      .then(() => self.clients.claim())

  );

});


/* =========================================
   NOTIFICAÇÕES PUSH
========================================= */

self.addEventListener("push", event => {

  let dados = {};

  try {

    dados = event.data
      ? event.data.json()
      : {};

  } catch (e) {

    dados = {};

  }


  event.waitUntil(

    self.registration.showNotification(

      dados.title || "AfricanMundo",

      {

        body:
          dados.body ||
          "Nova notícia publicada no AfricanMundo.",

        icon:
          dados.icon ||
          "./icon-192.png",

        badge:
          dados.badge ||
          "./icon-192.png",

        data: {

          url:
            dados.url ||
            "./index.html"

        }

      }

    )

  );

});


/* =========================================
   CLIQUE NA NOTIFICAÇÃO
========================================= */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const url =
      event.notification.data?.url ||
      "./index.html";


    event.waitUntil(

      clients.openWindow(url)

    );

  }
);


/* =========================================
   FETCH
========================================= */

self.addEventListener(
  "fetch",
  event => {

    const req = event.request;

    if(req.method !== "GET") return;


    const url = new URL(req.url);


    /*
      SUPABASE E APIs EXTERNAS
      NÃO ENTRAM NO CACHE
    */

    if(
      url.hostname.includes("supabase.co")
    ){

      return;

    }


    /*
      ADMIN / PAINEL
      NÃO ENTRA NO CACHE
    */

    if(
      url.pathname.includes("admin") ||
      url.pathname.includes("painel")
    ){

      return;

    }


    /*
      SOMENTE ARQUIVOS DO AFRICANMUNDO
    */

    if(
      url.origin !== location.origin
    ){

      return;

    }


    /*
      APP.JS / HTML / CSS / MANIFEST
      INTERNET PRIMEIRO
      CACHE COMO RESERVA
    */

    event.respondWith(

      fetch(req)

        .then(res => {

          if(res && res.ok){

            const copia = res.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(req, copia);

              });

          }

          return res;

        })

        .catch(() => {

          return caches.match(req);

        })

    );

  }
);
