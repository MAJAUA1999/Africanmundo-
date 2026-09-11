const CACHE_NAME = "africanmundo-v4";

const ARQUIVOS = [
  "./index.html",
  "./manifest.json",
  "./estilo.css",
  "./app.js"
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
            .filter(
              chave =>
                chave !== CACHE_NAME
            )
            .map(
              chave =>
                caches.delete(chave)
            )

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
   FETCH / CACHE
========================================= */

self.addEventListener(
  "fetch",
  event => {

    const url =
      new URL(
        event.request.url
      );


    /*
      Não interferir no painel,
      Supabase ou outros pedidos
      externos.
    */

    if (
      url.pathname.includes("admin") ||
      url.pathname.includes("painel") ||
      url.hostname.includes("supabase.co")
    ) {

      return;

    }


    /*
      Só tratar pedidos GET.
    */

    if (
      event.request.method !== "GET"
    ) {

      return;

    }


    /*
      Para ficheiros do próprio site:
      tenta Internet primeiro.
      Se funcionar, actualiza o cache.
      Se não houver Internet,
      usa o cache.
    */

    event.respondWith(

      fetch(event.request)
        .then(resposta => {

          if (
            resposta &&
            resposta.status === 200 &&
            url.origin === location.origin
          ) {

            const copia =
              resposta.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  copia
                );

              });

          }


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
