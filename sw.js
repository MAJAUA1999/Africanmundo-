const CACHE_NAME="africanmundo-v5";

const ARQUIVOS=[
  "./index.html",
  "./manifest.json",
  "./estilo.css",
  "./app.js"
];


/* =========================================
   INSTALAR
========================================= */

self.addEventListener("install",event=>{

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(ARQUIVOS))

  );

  self.skipWaiting();

});


/* =========================================
   ACTIVAR E LIMPAR CACHE ANTIGO
========================================= */

self.addEventListener("activate",event=>{

  event.waitUntil(

    caches.keys().then(chaves=>{

      return Promise.all(

        chaves
          .filter(chave=>chave!==CACHE_NAME)
          .map(chave=>caches.delete(chave))

      );

    })

  );

  self.clients.claim();

});


/* =========================================
   NOTIFICAÇÕES
========================================= */

self.addEventListener("push",event=>{

  let dados={};

  try{

    dados=event.data
      ? event.data.json()
      : {};

  }catch(e){}


  event.waitUntil(

    self.registration.showNotification(
      dados.title||"AfricanMundo",
      {
        body:
          dados.body||
          "Nova notícia publicada no AfricanMundo.",

        icon:
          dados.icon||
          "./icon-192.png",

        badge:
          dados.badge||
          "./icon-192.png",

        data:{
          url:
            dados.url||
            "./index.html"
        }
      }
    )

  );

});


/* =========================================
   CLIQUE NOTIFICAÇÃO
========================================= */

self.addEventListener(
  "notificationclick",
  event=>{

    event.notification.close();

    const url=
      event.notification.data?.url||
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
  event=>{

    const req=event.request;
    const url=new URL(req.url);

    if(req.method!=="GET")return;

    /*
      Supabase e pedidos externos
      ficam fora do cache.
    */

    if(
      url.hostname.includes("supabase.co")||
      url.pathname.includes("admin")||
      url.pathname.includes("painel")
    ){

      return;

    }

    /*
      APP.JS, HTML e CSS:
      Internet primeiro.
      Cache somente como reserva.
    */

    if(
      url.origin===location.origin
    ){

      event.respondWith(

        fetch(req)
          .then(res=>{

            if(res.ok){

              const copia=res.clone();

              caches.open(CACHE_NAME)
                .then(cache=>{
                  cache.put(req,copia);
                });

            }

            return res;

          })
          .catch(()=>{

            return caches.match(req);

          })

      );

    }

  }
);
