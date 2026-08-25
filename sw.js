const CACHE_NAME = "africanmundo-v3";

const ARQUIVOS = [
  "./index.html",
  "./manifest.json"
];


/* =========================================
   INSTALAÇÃO
========================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(ARQUIVOS);

      })

  );

  self.skipWaiting();

});


/* =========================================
   ATIVAÇÃO
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

  );

  self.clients.claim();

});


/* =========================================
   RECEBER NOTIFICAÇÃO
========================================= */

self.addEventListener(
  "push",
  event => {

    let dados = {};

    try {

      dados =
        event.data
          ? event.data.json()
          : {};

    } catch (erro) {

      console.error(
        "Erro ao ler notificação:",
        erro
      );

    }


    const titulo =
      dados.title ||
      "AfricanMundo";


    const opcoes = {

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

      },

      vibrate: [
        200,
        100,
        200
      ]

    };


    event.waitUntil(

      self.registration.showNotification(
        titulo,
        opcoes
      )

    );

  }
);
/* =========================================
   CLIQUE NA NOTIFICAÇÃO
========================================= */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();

    const url =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "./index.html";


    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(janelas => {

        for (const janela of janelas) {

          if (
            janela.url.includes(
              "index.html"
            ) &&
            "focus" in janela
          ) {

            return janela.focus();

          }

        }


        if (clients.openWindow) {

          return clients.openWindow(
            url
          );

        }

      })

    );

  }
);


/* =========================================
   FETCH / INTERNET + CACHE
========================================= */

self.addEventListener(
  "fetch",
  event => {

    const url =
      new URL(
        event.request.url
      );


    /* Não interferir no painel
       nem no Supabase */

    if (
      url.pathname.includes("admin") ||
      url.pathname.includes("painel") ||
      url.hostname.includes("supabase.co")
    ) {

      return;

    }


    event.respondWith(

      fetch(
        event.request
      )
      .then(resposta => {

        return resposta;

      })
      .catch(() => {

        return caches.match(
          event.request
        );

      })

    );

  }
);
