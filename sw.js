const CACHE_NAME = "africanmundo-v7";

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
========================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(chaves => {

        return Promise.all(

          chaves.map(chave => {

            if(chave !== CACHE_NAME){

              return caches.delete(chave);

            }

            return Promise.resolve();

          })

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

  try{

    dados = event.data
      ? event.data.json()
      : {};

  }catch(e){

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

        data:{
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
   NÃO INTERCEPTAR
   HTML / CSS / JS / IMAGENS
========================================= */

self.addEventListener(
  "fetch",
  event => {

    /*
      Deixamos o navegador buscar
      os arquivos normalmente.

      Isso evita que o Service Worker
      altere o carregamento visual
      do site.
    */

    return;

  }
);
