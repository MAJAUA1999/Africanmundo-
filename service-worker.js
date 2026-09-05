/* ==========================================
   AFRICANMUNDO — SERVICE WORKER
   NOTIFICAÇÕES PUSH
========================================== */

self.addEventListener("push", function(event){

  let dados = {};

  try{
    dados = event.data
      ? event.data.json()
      : {};
  }catch(e){
    dados = {
      titulo: "Nova notícia no AfricanMundo",
      texto: "Confira as últimas novidades."
    };
  }

  const titulo =
    dados.titulo ||
    "AfricanMundo";

  const texto =
    dados.texto ||
    "Confira a nova notícia.";

  const imagem =
    dados.imagem ||
    "";

  const url =
    dados.url ||
    "/Africanmundo-/";

  const opcoes = {

  body: texto,

  icon:
    "/Africanmundo-/favicon.ico",

  badge:
    "/Africanmundo-/favicon.ico",

  data: {
    url: url
  },

  vibrate: [
    200,
    100,
    200
  ],

  requireInteraction: false

};

  event.waitUntil(

    self.registration.showNotification(
      titulo,
      opcoes
    )

  );

});


/* ==========================================
   TOCAR NA NOTIFICAÇÃO
========================================== */

self.addEventListener(
  "notificationclick",
  function(event){

    event.notification.close();

    const destino =
      event.notification.data?.url ||
      "/Africanmundo-/";

    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      }).then(function(lista){

        for(const cliente of lista){

          if(
            cliente.url.includes(
              "majaua1999.github.io/Africanmundo-"
            )
          ){

            cliente.focus();

            return cliente.navigate(
              destino
            );

          }

        }

        return clients.openWindow(
          destino
        );

      })

    );

  }
);


/* ==========================================
   INSTALAÇÃO
========================================== */

self.addEventListener(
  "install",
  function(){

    self.skipWaiting();

  }
);


/* ==========================================
   ATIVAÇÃO
========================================== */

self.addEventListener(
  "activate",
  function(event){

    event.waitUntil(
      self.clients.claim()
    );

  }
);
