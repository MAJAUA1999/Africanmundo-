/* ==========================================
🌍 AFRICANMUNDO — APP.JS
VERSÃO ANTIGA RESTAURADA
========================================== */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const VAPID_PUBLIC_KEY =
"BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db = null;

window.__noticias = [];


/* ==========================================
   SUPABASE
========================================== */

function iniciarSupabase(){

  if(!window.supabase){

    console.error(
      "Supabase não carregou."
    );

    return false;
  }

  try{

    db =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    return true;

  }catch(e){

    console.error(
      "Erro Supabase:",
      e
    );

    return false;
  }
}


/* ==========================================
   ESCAPAR HTML
========================================== */

function esc(v){

  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


/* ==========================================
   NORMALIZAR CATEGORIA
========================================== */

function normalizarCategoria(v){

  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}


/* ==========================================
   OBTER TÍTULO
========================================== */

function obterTitulo(n){

  return (
    n?.titulo ||
    n?.title ||
    "Sem título"
  );
}


/* ==========================================
   OBTER TEXTO
========================================== */

function obterTexto(n){

  return (
    n?.texto ||
    n?.description ||
    n?.descricao ||
    ""
  );
}


/* ==========================================
   OBTER IMAGEM
========================================== */

function obterImagem(n){

  return (
    n?.imagem ||
    n?.image ||
    n?.urlToImage ||
    ""
  );
}


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarData(v){

  if(!v) return "";

  try{

    return new Date(v)
      .toLocaleDateString(
        "pt-MZ",
        {
          day:"2-digit",
          month:"2-digit",
          year:"numeric"
        }
      );

  }catch(e){

    return "";
  }
}


/* ==========================================
   ABRIR NOTÍCIA
========================================== */

function abrirNoticia(n){

  if(!n || !n.id) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(n.id);
}


/* ==========================================
   ABRIR NOTÍCIA POR ID
========================================== */

function abrirNoticiaPorId(id){

  if(!id) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);
}


/* ==========================================
   CRIAR CARD
========================================== */

function criarCard(n){

  const article =
    document.createElement("article");

  article.className =
    "compact-card";

  article.onclick = function(){

    abrirNoticia(n);

  };


  const titulo =
    esc(obterTitulo(n));

  const imagem =
    obterImagem(n);

  const categoria =
    esc(n?.categoria || "Notícias");


  let media = "";

  if(imagem){

    media = `
      <img
        src="${esc(imagem)}"
        alt="${titulo}"
        loading="lazy"
        decoding="async"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
      >

      <div
        class="compact-img"
        style="display:none"
      >
        🌍
      </div>
    `;

  }else{

    media = `
      <div class="compact-img">
        🌍
      </div>
    `;
  }


  article.innerHTML = `

    <div class="compact-media">

      ${media}

    </div>

    <div class="compact-body">

      <div class="compact-cat">
        ${categoria}
      </div>

      <div class="compact-title">
        ${titulo}
      </div>

    </div>

  `;

  return article;
}


/* ==========================================
   RENDERIZAR LISTA
========================================== */

function renderizarLista(
  id,
  lista
){

  const area =
    document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";


  if(
    !lista ||
    !lista.length
  ){

    area.innerHTML = `
      <p class="sem-noticias">
        Ainda não existem notícias nesta categoria.
      </p>
    `;

    return;
  }


  lista
    .slice(0,4)
    .forEach(function(n){

      area.appendChild(
        criarCard(n)
      );

    });
}


/* ==========================================
   DESTAQUE
========================================== */

function renderizarDestaque(n){

  const area =
    document.getElementById("destaque");

  if(!area) return;

  if(!n){

    area.innerHTML = "";

    return;
  }


  const titulo =
    esc(obterTitulo(n));

  const texto =
    esc(obterTexto(n));

  const imagem =
    obterImagem(n);

  const categoria =
    esc(n?.categoria || "Notícias");


  area.innerHTML = `

    <article
      class="featured"
      onclick="abrirNoticiaPorId('${esc(n.id)}')"
    >

      ${
        imagem
        ?
        `
        <img
          class="featured-image"
          src="${esc(imagem)}"
          alt="${titulo}"
          loading="eager"
          fetchpriority="high"
        >
        `
        :
        `
        <div class="featured-image">
          🌍
        </div>
        `
      }


      <div class="featured-content">

        <div class="featured-category">
          ${categoria}
        </div>

        <h2 class="featured-title">
          ${titulo}
        </h2>

        ${
          texto
          ?
          `
          <p class="featured-text">
            ${texto}
          </p>
          `
          :
          ""
        }

        <div class="featured-read">
          Ler notícia →
        </div>

      </div>

    </article>

  `;
}
/* ==========================================
   ANIMAÇÃO DAS NOTÍCIAS
========================================== */

(function(){

  const style =
    document.createElement("style");

  style.textContent = `

    #ultimas,
    #futebol,
    #mocambique,
    #africa,
    #negocios,
    #entretenimento,
    #desporto{

      transition:
        opacity .15s ease;

    }


    body.carregandoNoticias #ultimas,
    body.carregandoNoticias #futebol,
    body.carregandoNoticias #mocambique,
    body.carregandoNoticias #africa,
    body.carregandoNoticias #negocios,
    body.carregandoNoticias #entretenimento,
    body.carregandoNoticias #desporto{

      opacity:0;

    }


    .noticiasProntas{

      opacity:1 !important;

    }

  `;

  document.head.appendChild(style);

})();


/* ==========================================
   CARREGAR NOTÍCIAS
========================================== */

async function carregarNoticias(){

  document.body.classList.add(
    "carregandoNoticias"
  );


  try{

    if(!db){

      const iniciado =
        iniciarSupabase();

      if(!iniciado){

        throw new Error(
          "Não foi possível iniciar o Supabase."
        );

      }

    }


    let {

      data,
      error

    } = await db

      .from("noticias")

      .select(
        "id,titulo,texto,imagem,categoria,data,fonte,url_original"
      )

      .order(
        "id",
        {
          ascending:false
        }
      )

      .limit(100);


    if(error){

      throw error;

    }


    let noticias =
      Array.isArray(data)
      ? data
      : [];


    /* ======================================
       GARANTIR NOTÍCIAS DAS CATEGORIAS
    ====================================== */

    const categorias = [

      "futebol",
      "mocambique",
      "africa",
      "negocios",
      "entretenimento",
      "desporto"

    ];


    for(
      const categoria of categorias
    ){

      const categoriaNormalizada =
        normalizarCategoria(
          categoria
        );


      const existentes =
        noticias.filter(function(n){

          return (
            normalizarCategoria(
              n?.categoria
            ) ===
            categoriaNormalizada
          );

        });


      if(existentes.length >= 4){

        continue;

      }


      let condicoes = "";


      if(
        categoriaNormalizada ===
        "futebol"
      ){

        condicoes =
          "categoria.eq.Futebol,categoria.eq.futebol";

      }

      else if(
        categoriaNormalizada ===
        "mocambique"
      ){

        condicoes =
          "categoria.eq.Moçambique,categoria.eq.Mocambique,categoria.eq.moçambique,categoria.eq.mocambique";

      }

      else if(
        categoriaNormalizada ===
        "africa"
      ){

        condicoes =
          "categoria.eq.África,categoria.eq.Africa,categoria.eq.áfrica,categoria.eq.africa";

      }

      else if(
        categoriaNormalizada ===
        "negocios"
      ){

        condicoes =
          "categoria.eq.Negócios,categoria.eq.Negocios,categoria.eq.negócios,categoria.eq.negocios";

      }

      else if(
        categoriaNormalizada ===
        "entretenimento"
      ){

        condicoes =
          "categoria.eq.Entretenimento,categoria.eq.entretenimento";

      }

      else if(
        categoriaNormalizada ===
        "desporto"
      ){

        condicoes =
          "categoria.eq.Desporto,categoria.eq.desporto";

      }


      if(!condicoes){

        continue;

      }


      const resposta =
        await db

          .from("noticias")

          .select(
            "id,titulo,texto,imagem,categoria,data,fonte,url_original"
          )

          .or(condicoes)

          .order(
            "id",
            {
              ascending:false
            }
          )

          .limit(4);


      if(resposta.error){

        console.warn(
          "Erro ao carregar categoria:",
          categoria,
          resposta.error
        );

        continue;

      }


      const extras =
        Array.isArray(
          resposta.data
        )
        ?
        resposta.data
        :
        [];


      extras.forEach(function(n){

        const jaExiste =
          noticias.some(function(item){

            return (
              String(item.id) ===
              String(n.id)
            );

          });


        if(!jaExiste){

          noticias.push(n);

        }

      });

    }


    /* ======================================
       ORDENAR NOVAMENTE POR ID
    ====================================== */

    noticias.sort(function(a,b){

      return (
        Number(b?.id || 0) -
        Number(a?.id || 0)
      );

    });


    window.__noticias =
      noticias;


    /* ======================================
       RENDERIZAR PÁGINA
    ====================================== */

    renderizarPagina();


    document.body.classList.remove(
      "carregandoNoticias"
    );


    const ids = [

      "ultimas",
      "futebol",
      "mocambique",
      "africa",
      "negocios",
      "entretenimento",
      "desporto"

    ];


    ids.forEach(function(id){

      const elemento =
        document.getElementById(id);

      if(elemento){

        elemento.classList.add(
          "noticiasProntas"
        );

      }

    });


    console.log(
      "Notícias carregadas:",
      noticias.length
    );


    setTimeout(function(){

      if(
        typeof atualizarNotificacoes ===
        "function"
      ){

        atualizarNotificacoes(
          window.__noticias
        );

      }

    },50);


  }catch(e){

    console.error(
      "Erro ao carregar notícias:",
      e
    );


    document.body.classList.remove(
      "carregandoNoticias"
    );


    mostrarErro(
      e?.message ||
      "Não foi possível carregar as notícias."
    );

  }

}


/* ==========================================
   EMBARALHAR
========================================== */

function embaralhar(lista){

  return [...lista]
    .sort(
      () =>
        Math.random() - 0.5
    );

}


/* ==========================================
   RENDERIZAR PÁGINA
========================================== */

function renderizarPagina(){

  const noticias =
    Array.isArray(
      window.__noticias
    )
    ?
    [...window.__noticias]
    :
    [];


  if(!noticias.length){

    renderizarDestaque(null);

    renderizarLista(
      "ultimas",
      []
    );

    renderizarLista(
      "futebol",
      []
    );

    renderizarLista(
      "mocambique",
      []
    );

    renderizarLista(
      "africa",
      []
    );

    renderizarLista(
      "negocios",
      []
    );

    renderizarLista(
      "entretenimento",
      []
    );

    renderizarLista(
      "desporto",
      []
    );

    return;

  }


  /* ======================================
     DESTAQUE
  ====================================== */

  const selecionadas =
    embaralhar(
      noticias
    );


  const destaque =
    selecionadas[0];


  renderizarDestaque(
    destaque
  );


  /* ======================================
     ÚLTIMAS
  ====================================== */

  renderizarLista(
    "ultimas",
    noticias.slice(0,4)
  );


  /* ======================================
     CATEGORIAS
  ====================================== */

  const categorias = [

    {
      nome:"futebol",
      id:"futebol"
    },

    {
      nome:"mocambique",
      id:"mocambique"
    },

    {
      nome:"africa",
      id:"africa"
    },

    {
      nome:"negocios",
      id:"negocios"
    },

    {
      nome:"entretenimento",
      id:"entretenimento"
    },

    {
      nome:"desporto",
      id:"desporto"
    }

  ];


  categorias.forEach(function(item){

    const lista =
      noticias.filter(function(n){

        return (
          normalizarCategoria(
            n?.categoria
          ) ===
          item.nome
        );

      });


    renderizarLista(
      item.id,
      lista.slice(0,4)
    );

  });

}


/* ==========================================
   MOSTRAR ERRO
========================================== */

function mostrarErro(
  mensagem
){

  const ids = [

    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"

  ];


  ids.forEach(function(id){

    const area =
      document.getElementById(id);

    if(!area) return;


    area.innerHTML = `

      <p class="sem-noticias">

        ⚠️ ${esc(
          mensagem ||
          "Não foi possível carregar as notícias."
        )}

      </p>

    `;

  });


  const destaque =
    document.getElementById(
      "destaque"
    );


  if(destaque){

    destaque.innerHTML = `

      <div class="sem-noticias">

        ⚠️ Não foi possível carregar
        as notícias.

      </div>

    `;

  }

}
/* ==========================================
   PESQUISA
========================================== */

function pesquisar(e){

  if(e){

    e.preventDefault();

  }


  const input =
    document.getElementById(
      "searchInput"
    );

  const resultados =
    document.getElementById(
      "searchResults"
    );


  if(!input || !resultados){

    return;

  }


  const termo =
    String(
      input.value || ""
    )
    .trim()
    .toLowerCase();


  resultados.innerHTML = "";


  if(!termo){

    return;

  }


  const noticias =
    Array.isArray(
      window.__noticias
    )
    ?
    window.__noticias
    :
    [];


  const encontrados =
    noticias.filter(function(n){

      const titulo =
        obterTitulo(n)
          .toLowerCase();

      const texto =
        obterTexto(n)
          .toLowerCase();


      return (
        titulo.includes(termo) ||
        texto.includes(termo)
      );

    });


  if(!encontrados.length){

    resultados.innerHTML = `

      <p class="sem-noticias">

        🔎 Nenhuma notícia encontrada.

      </p>

    `;

    return;

  }


  const grid =
    document.createElement(
      "div"
    );

  grid.className =
    "news-grid";


  encontrados
    .slice(0,8)
    .forEach(function(n){

      grid.appendChild(
        criarCard(n)
      );

    });


  resultados.appendChild(
    grid
  );

}


/* ==========================================
   FAVORITOS
========================================== */

function obterFavoritos(){

  try{

    return JSON.parse(
      localStorage.getItem(
        "africanmundo_favoritos"
      ) || "[]"
    );

  }catch(e){

    return [];

  }

}


/* ==========================================
   GUARDAR FAVORITO
========================================== */

function guardarFavorito(n){

  if(!n || !n.id){

    return;

  }


  const favoritos =
    obterFavoritos();


  const existe =
    favoritos.some(function(item){

      return (
        String(item.id) ===
        String(n.id)
      );

    });


  if(!existe){

    favoritos.push(n);

  }


  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(
      favoritos
    )
  );


  abrirModal(
    "❤️ Favoritos",
    `
      <p>
        ${existe
          ? "Esta notícia já está nos seus favoritos."
          : "Notícia adicionada aos favoritos."
        }
      </p>
    `
  );

}


/* ==========================================
   ABRIR FAVORITOS
========================================== */

function abrirFavoritos(){

  const favoritos =
    obterFavoritos();


  if(!favoritos.length){

    abrirModal(
      "❤️ Favoritos",
      `
        <p>
          Ainda não existem notícias
          guardadas nos favoritos.
        </p>
      `
    );

    return;

  }


  let html = `

    <div class="favoritos-lista">

  `;


  favoritos.forEach(
    function(n,i){

      html += `

        <div
          class="favorito-item"
          style="
            padding:12px 0;
            border-bottom:1px solid #ddd;
          "
        >

          <strong
            style="
              display:block;
              cursor:pointer;
            "
            onclick="
              abrirNoticiaPorId('${esc(n.id)}')
            "
          >
            ${esc(
              obterTitulo(n)
            )}
          </strong>


          <button
            type="button"
            onclick="
              removerFavorito(${i})
            "
            style="
              margin-top:8px;
            "
          >
            🗑️ Remover
          </button>

        </div>

      `;

    }
  );


  html += `

    </div>

  `;


  abrirModal(
    "❤️ Favoritos",
    html
  );

}


/* ==========================================
   REMOVER FAVORITO
========================================== */

function removerFavorito(i){

  const favoritos =
    obterFavoritos();


  if(
    i < 0 ||
    i >= favoritos.length
  ){

    return;

  }


  favoritos.splice(
    i,
    1
  );


  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(
      favoritos
    )
  );


  abrirFavoritos();

}


/* ==========================================
   NOTIFICAÇÕES
========================================== */

function atualizarNotificacoes(){

  const botoes =
    document.querySelectorAll(
      ".notification-count"
    );


  botoes.forEach(function(el){

    el.remove();

  });

}


/* ==========================================
   ABRIR NOTIFICAÇÕES
========================================== */

async function abrirNotificacoes(){

  try{

    if(
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ){

      abrirModal(
        "🔔 Notificações",
        `
          <p>
            O seu dispositivo não suporta
            notificações push.
          </p>
        `
      );

      return;

    }


    const registro =
      await navigator
        .serviceWorker
        .ready;


    let subscription =
      await registro.pushManager
        .getSubscription();


    if(!subscription){

      abrirModal(
        "🔔 Ativar notificações",
        `
          <p>
            Ative as notificações para
            receber novidades do AfricanMundo.
          </p>

          <button
            type="button"
            onclick="
              ativarNotificacoesPush()
            "
          >
            🔔 Ativar notificações
          </button>
        `
      );

      return;

    }


    const dados =
      subscription.toJSON();


    try{

      const resposta =
        await fetch(
          SUPABASE_URL +
          "/functions/v1/salvar-push",
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

              endpoint:
                dados.endpoint,

              p256dh:
                dados.keys?.p256dh,

              auth:
                dados.keys?.auth

            })

          }
        );


      if(!resposta.ok){

        console.warn(
          "Não foi possível guardar a subscrição."
        );

      }

    }catch(e){

      console.warn(
        "Erro ao guardar push:",
        e
      );

    }


    const noticias =
      Array.isArray(
        window.__noticias
      )
      ?
      window.__noticias
      :
      [];


    let html = `

      <p>
        🔔 Notificações ativas.
      </p>

      <hr>

      <h3>
        Últimas notícias
      </h3>

    `;


    if(!noticias.length){

      html += `

        <p>
          Ainda não existem notícias.
        </p>

      `;

    }else{

      noticias
        .slice(0,10)
        .forEach(function(n){

          html += `

            <div
              style="
                padding:10px 0;
                border-bottom:1px solid #ddd;
                cursor:pointer;
              "
              onclick="
                abrirNoticiaPorId('${esc(n.id)}')
              "
            >

              <strong>
                ${esc(
                  obterTitulo(n)
                )}
              </strong>

              <small
                style="
                  display:block;
                  margin-top:4px;
                "
              >
                ${esc(
                  formatarData(n.data)
                )}
              </small>

            </div>

          `;

        });

    }


    abrirModal(
      "🔔 Notificações",
      html
    );


  }catch(e){

    console.error(
      "Erro nas notificações:",
      e
    );


    abrirModal(
      "🔔 Notificações",
      `
        <p>
          Não foi possível abrir
          as notificações.
        </p>
      `
    );

  }

}


/* ==========================================
   CONVERTER VAPID KEY
========================================== */

function urlBase64ToUint8Array(
  base64String
){

  const padding =
    "=".repeat(
      (4 -
        base64String.length % 4
      ) % 4
    );


  const base64 =
    (
      base64String +
      padding
    )
    .replace(
      /-/g,
      "+"
    )
    .replace(
      /_/g,
      "/"
    );


  const rawData =
    window.atob(
      base64
    );


  const outputArray =
    new Uint8Array(
      rawData.length
    );


  for(
    let i = 0;
    i < rawData.length;
    ++i
  ){

    outputArray[i] =
      rawData.charCodeAt(i);

  }


  return outputArray;

}


/* ==========================================
   ATIVAR NOTIFICAÇÕES PUSH
========================================== */

async function ativarNotificacoesPush(){

  try{

    if(
      !("Notification" in window)
    ){

      alert(
        "Este dispositivo não suporta notificações."
      );

      return;

    }


    const permissao =
      await Notification.requestPermission();


    if(
      permissao !== "granted"
    ){

      alert(
        "Permissão para notificações não concedida."
      );

      return;

    }


    const registro =
      await navigator
        .serviceWorker
        .ready;


    let subscription =
      await registro.pushManager
        .getSubscription();


    if(!subscription){

      subscription =
        await registro.pushManager
          .subscribe({

            userVisibleOnly:true,

            applicationServerKey:
              urlBase64ToUint8Array(
                VAPID_PUBLIC_KEY
              )

          });

    }


    const dados =
      subscription.toJSON();


    const resposta =
      await fetch(
        SUPABASE_URL +
        "/functions/v1/salvar-push",
        {
          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            endpoint:
              dados.endpoint,

            p256dh:
              dados.keys?.p256dh,

            auth:
              dados.keys?.auth

          })

        }
      );


    if(!resposta.ok){

      throw new Error(
        "Erro ao guardar subscrição."
      );

    }


    alert(
      "🔔 Notificações ativadas com sucesso!"
    );


    abrirNotificacoes();


  }catch(e){

    console.error(
      "Erro ao ativar notificações:",
      e
    );


    alert(
      "Não foi possível ativar as notificações."
    );

  }

}
/* ==========================================
   MODAL
========================================== */

function abrirModal(
  titulo,
  html
){

  let modal =
    document.getElementById(
      "amModal"
    );


  if(!modal){

    modal =
      document.createElement(
        "div"
      );

    modal.id =
      "amModal";

    modal.innerHTML = `

      <div
        class="am-back"
        onclick="fecharModal()"
      ></div>

      <div class="am-box">

        <div class="am-head">

          <strong id="amTitle">
          </strong>

          <button
            type="button"
            onclick="fecharModal()"
          >
            ✕
          </button>

        </div>

        <div id="amBody">
        </div>

      </div>

    `;


    document.body.appendChild(
      modal
    );


    const style =
      document.createElement(
        "style"
      );


    style.textContent = `

      #amModal{

        display:none;

        position:fixed;

        inset:0;

        z-index:99999;

      }


      #amModal .am-back{

        position:absolute;

        inset:0;

        background:
          rgba(0,0,0,.65);

      }


      #amModal .am-box{

        position:relative;

        width:
          min(92%,520px);

        max-height:85vh;

        overflow:auto;

        margin:
          7vh auto 0;

        background:
          var(--card-bg,#fff);

        color:
          var(--text,#222);

        border-radius:16px;

        box-shadow:
          0 10px 40px
          rgba(0,0,0,.25);

      }


      #amModal .am-head{

        display:flex;

        align-items:center;

        justify-content:space-between;

        gap:10px;

        padding:16px;

        border-bottom:
          1px solid
          rgba(0,0,0,.1);

      }


      #amModal .am-head button{

        border:0;

        background:transparent;

        font-size:20px;

        cursor:pointer;

      }


      #amModal #amBody{

        padding:16px;

      }


      #amModal button{

        cursor:pointer;

      }

    `;


    document.head.appendChild(
      style
    );

  }


  const titleElement =
    document.getElementById(
      "amTitle"
    );


  const bodyElement =
    document.getElementById(
      "amBody"
    );


  if(titleElement){

    titleElement.textContent =
      titulo || "";

  }


  if(bodyElement){

    bodyElement.innerHTML =
      html || "";

  }


  modal.style.display =
    "block";

}


/* ==========================================
   FECHAR MODAL
========================================== */

function fecharModal(){

  const modal =
    document.getElementById(
      "amModal"
    );


  if(modal){

    modal.style.display =
      "none";

  }

}


/* ==========================================
   FERRAMENTAS
========================================== */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `

      <div
        style="
          display:grid;
          gap:10px;
        "
      >

        <button
          type="button"
          onclick="abrirFavoritos()"
        >
          ❤️ Favoritos
        </button>


        <button
          type="button"
          onclick="compartilharSite()"
        >
          📤 Partilhar site
        </button>


        <button
          type="button"
          onclick="copiarLinkSite()"
        >
          🔗 Copiar link
        </button>


        <button
          type="button"
          onclick="salvarSite()"
        >
          ⭐ Guardar site
        </button>

      </div>

    `
  );

}


/* ==========================================
   UTILIZADOR
========================================== */

function abrirUsuario(){

  abrirModal(
    "👤 Eu",
    `

      <div>

        <h3>
          Bem-vindo ao AfricanMundo 🌍
        </h3>

        <p>
          A informação que liga África
          ao mundo.
        </p>


        <button
          type="button"
          onclick="abrirFavoritos()"
        >
          ❤️ Ver favoritos
        </button>

      </div>

    `
  );

}


/* ==========================================
   REDES SOCIAIS
========================================== */

function abrirRedes(){

  abrirModal(
    "🌐 Redes sociais",
    `

      <div
        style="
          display:grid;
          gap:10px;
        "
      >

        <button
          type="button"
          onclick="abrirRede('google')"
        >
          🔎 Google
        </button>


        <button
          type="button"
          onclick="abrirRede('facebook')"
        >
          📘 Facebook
        </button>


        <button
          type="button"
          onclick="abrirRede('youtube')"
        >
          ▶️ YouTube
        </button>


        <button
          type="button"
          onclick="abrirRede('whatsapp')"
        >
          💬 WhatsApp
        </button>


        <button
          type="button"
          onclick="abrirRede('instagram')"
        >
          📷 Instagram
        </button>


        <button
          type="button"
          onclick="abrirRede('tiktok')"
        >
          🎵 TikTok
        </button>

      </div>

    `
  );

}


/* ==========================================
   ABRIR LINK
========================================== */

function abrirLink(url){

  if(!url) return;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


/* ==========================================
   PARTILHAR SITE
========================================== */

async function compartilharSite(){

  const url =
    window.location.href;


  const dados = {

    title:
      "AfricanMundo",

    text:
      "A informação que liga África ao mundo 🌍",

    url:
      url

  };


  try{

    if(
      navigator.share
    ){

      await navigator.share(
        dados
      );

      return;

    }


    await navigator.clipboard.writeText(
      url
    );


    alert(
      "🔗 Link copiado com sucesso!"
    );


  }catch(e){

    console.log(
      "Partilha cancelada:",
      e
    );

  }

}


/* ==========================================
   COPIAR LINK
========================================== */

async function copiarLinkSite(){

  try{

    await navigator.clipboard.writeText(
      window.location.href
    );


    alert(
      "🔗 Link copiado!"
    );


  }catch(e){

    prompt(
      "Copie o link do AfricanMundo:",
      window.location.href
    );

  }

}


/* ==========================================
   GUARDAR SITE
========================================== */

function salvarSite(){

  abrirModal(
    "⭐ Guardar site",
    `

      <p>
        Para guardar o AfricanMundo,
        adicione esta página aos favoritos
        do seu navegador.
      </p>

    `
  );

}


/* ==========================================
   TEMA ESCURO
========================================== */

function alternarTema(){

  document.body.classList.toggle(
    "dark"
  );


  const ativo =
    document.body.classList.contains(
      "dark"
    );


  localStorage.setItem(
    "am_dark",
    ativo
      ? "1"
      : "0"
  );

}


/* ==========================================
   CARREGAR TEMA
========================================== */

function carregarTema(){

  const ativo =
    localStorage.getItem(
      "am_dark"
    );


  if(ativo === "1"){

    document.body.classList.add(
      "dark"
    );

  }

}


/* ==========================================
   CORES
========================================== */

function abrirCores(){

  abrirModal(
    "🎨 Cores",
    `

      <div
        style="
          display:grid;
          gap:10px;
        "
      >

        <button
          type="button"
          onclick="mudarCor('green')"
        >
          🟢 Verde
        </button>


        <button
          type="button"
          onclick="mudarCor('blue')"
        >
          🔵 Azul
        </button>


        <button
          type="button"
          onclick="mudarCor('red')"
        >
          🔴 Vermelho
        </button>


        <button
          type="button"
          onclick="mudarCor('purple')"
        >
          🟣 Roxo
        </button>


        <button
          type="button"
          onclick="mudarCor('orange')"
        >
          🟠 Laranja
        </button>

      </div>

    `
  );

}


/* ==========================================
   MUDAR COR
========================================== */

function mudarCor(cor){

  document.body.classList.remove(
    "color-blue",
    "color-red",
    "color-purple",
    "color-orange"
  );


  if(
    cor === "blue"
  ){

    document.body.classList.add(
      "color-blue"
    );

  }

  else if(
    cor === "red"
  ){

    document.body.classList.add(
      "color-red"
    );

  }

  else if(
    cor === "purple"
  ){

    document.body.classList.add(
      "color-purple"
    );

  }

  else if(
    cor === "orange"
  ){

    document.body.classList.add(
      "color-orange"
    );

  }


  localStorage.setItem(
    "am_color",
    cor
  );

}


/* ==========================================
   CARREGAR COR
========================================== */

function carregarCor(){

  const cor =
    localStorage.getItem(
      "am_color"
    );


  if(!cor){

    return;

  }


  mudarCor(cor);

}
/* ==========================================
   CARREGAR ANÚNCIOS ATIVOS
========================================== */

async function carregarAnunciosAtivos(){

  try{

    if(!db){

      const iniciado =
        iniciarSupabase();

      if(!iniciado){

        return;

      }

    }


    const area =
      document.getElementById(
        "anunciosAtivos"
      );

    const section =
      document.getElementById(
        "anunciosAtivosSection"
      );


    if(!area){

      return;

    }


    const resposta =
      await db

        .from("anuncios")

        .select(
          "id,empresa,mensagem,imagem,video,vídeo,link,data_inicio,data_fim,ativo"
        )

        .eq(
          "ativo",
          true
        )

        .order(
          "id",
          {
            ascending:false
          }
        )

        .limit(10);


    if(resposta.error){

      console.warn(
        "Erro ao carregar anúncios:",
        resposta.error
      );

      if(section){

        section.style.display =
          "none";

      }

      return;

    }


    const anuncios =
      Array.isArray(
        resposta.data
      )
      ?
      resposta.data
      :
      [];


    const agora =
      new Date();


    const ativos =
      anuncios.filter(
        function(anuncio){

          let inicioValido =
            true;

          let fimValido =
            true;


          if(
            anuncio.data_inicio
          ){

            inicioValido =
              agora >=
              new Date(
                anuncio.data_inicio
              );

          }


          if(
            anuncio.data_fim
          ){

            fimValido =
              agora <=
              new Date(
                anuncio.data_fim
              );

          }


          return (
            inicioValido &&
            fimValido
          );

        }
      );


    if(!ativos.length){

      area.innerHTML = "";

      if(section){

        section.style.display =
          "none";

      }

      return;

    }


    if(section){

      section.style.display =
        "";

    }


    area.innerHTML = "";


    const grid =
      document.createElement(
        "div"
      );


    grid.style.display =
      "grid";

    grid.style.gridTemplateColumns =
      "repeat(2,minmax(0,1fr))";

    grid.style.gap =
      "10px";


    ativos.forEach(
      function(anuncio){

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "anuncio-card";


        let media = "";


        const video =
          anuncio.video ||
          anuncio["vídeo"] ||
          "";


        if(video){

          media = `

            <video
              src="${esc(video)}"
              controls
              muted
              playsinline
              style="
                width:100%;
                height:60px;
                object-fit:cover;
                border-radius:8px;
              "
            ></video>

          `;

        }

        else if(anuncio.imagem){

          media = `

            <img
              src="${esc(anuncio.imagem)}"
              alt="${esc(
                anuncio.empresa ||
                "Anúncio"
              )}"
              loading="lazy"
              style="
                width:100%;
                height:60px;
                object-fit:cover;
                border-radius:8px;
              "
            >

          `;

        }


        card.innerHTML = `

          ${
            media
            ?
            `
              <div>
                ${media}
              </div>
            `
            :
            ""
          }


          <div
            style="
              padding-top:8px;
            "
          >

            ${
              anuncio.empresa
              ?
              `
                <strong>
                  ${esc(
                    anuncio.empresa
                  )}
                </strong>
              `
              :
              ""
            }


            ${
              anuncio.mensagem
              ?
              `
                <div
                  style="
                    margin-top:4px;
                  "
                >
                  ${esc(
                    anuncio.mensagem
                  )}
                </div>
              `
              :
              ""
            }


            ${
              anuncio.link
              ?
              `
                <div
                  style="
                    margin-top:6px;
                  "
                >

                  <a
                    href="${esc(anuncio.link)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver anúncio →
                  </a>

                </div>
              `
              :
              ""
            }

          </div>

        `;


        grid.appendChild(
          card
        );

      }
    );


    area.appendChild(
      grid
    );


  }catch(e){

    console.error(
      "Erro nos anúncios:",
      e
    );

  }

}


/* ==========================================
   EVENTOS
========================================== */

function iniciarEventos(){

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );


  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );


  const userBtn =
    document.getElementById(
      "userBtn"
    );


  const themeBtn =
    document.getElementById(
      "themeBtn"
    );


  const colorBtn =
    document.getElementById(
      "colorBtn"
    );


  const searchForm =
    document.getElementById(
      "searchForm"
    );


  if(notificationBtn){

    notificationBtn.addEventListener(
      "click",
      abrirNotificacoes
    );

  }


  if(toolsBtn){

    toolsBtn.addEventListener(
      "click",
      abrirFerramentas
    );

  }


  if(userBtn){

    userBtn.addEventListener(
      "click",
      abrirUsuario
    );

  }


  if(themeBtn){

    themeBtn.addEventListener(
      "click",
      alternarTema
    );

  }


  if(colorBtn){

    colorBtn.addEventListener(
      "click",
      abrirCores
    );

  }


  if(searchForm){

    searchForm.addEventListener(
      "submit",
      pesquisar
    );

  }

}


/* ==========================================
   INICIAR SITE
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    carregarTema();

    carregarCor();

    iniciarEventos();

    carregarNoticias();

    carregarAnunciosAtivos();

  }
);


/* ==========================================
   SERVICE WORKER
========================================== */

if(
  "serviceWorker" in navigator
){

  window.addEventListener(
    "load",
    function(){

      navigator.serviceWorker
        .register(
          "/Africanmundo-/sw.js"
        )
        .then(
          function(registro){

            console.log(
              "Service Worker registado:",
              registro.scope
            );

          }
        )
        .catch(
          function(e){

            console.warn(
              "Erro ao registar Service Worker:",
              e
            );

          }
        );

    }
  );

}


/* ==========================================
   REDES SOCIAIS
========================================== */

function abrirRede(rede){

  const links = {

    google:
      "https://www.google.com/",

    facebook:
      "https://www.facebook.com/",

    youtube:
      "https://www.youtube.com/",

    whatsapp:
      "https://www.whatsapp.com/",

    instagram:
      "https://www.instagram.com/",

    tiktok:
      "https://www.tiktok.com/"

  };


  const url =
    links[rede];


  if(!url){

    return;

  }


  abrirLink(url);

}


/* ==========================================
   FIM DO APP.JS
========================================== */
