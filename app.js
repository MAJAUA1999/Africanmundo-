/*
==========================================
🌍 AFRICANMUNDO — APP.JS
VERSÃO RESTAURADA + MELHORADA
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
      "AfricanMundo: Supabase não carregou."
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
      "AfricanMundo: erro ao iniciar Supabase:",
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
   NORMALIZAR TEXTO
========================================== */

function normalizarTexto(v){

  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");

}


/* ==========================================
   NORMALIZAR CATEGORIA
========================================== */

function normalizarCategoria(v){

  return normalizarTexto(v);

}


/* ==========================================
   OBTER TÍTULO
========================================== */

function obterTitulo(n){

  return (
    n?.titulo ||
    n?.title ||
    n?.nome ||
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
    n?.resumo ||
    ""
  );

}


/* ==========================================
   OBTER IMAGEM
========================================== */

function obterImagem(n){

  const imagem =
    n?.imagem ||
    n?.image ||
    n?.urlToImage ||
    "";

  if(
    !imagem ||
    String(imagem).trim() === "None" ||
    String(imagem).trim() === "null" ||
    String(imagem).trim() === "undefined"
  ){

    return "";

  }

  return String(imagem).trim();

}


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarData(v){

  if(!v){

    return "";

  }

  try{

    const data =
      new Date(v);

    if(
      Number.isNaN(
        data.getTime()
      )
    ){

      return "";

    }

    return data.toLocaleDateString(
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

  if(
    !n ||
    !n.id
  ){

    return;

  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(
      n.id
    );

}


/* ==========================================
   ABRIR NOTÍCIA POR ID
========================================== */

function abrirNoticiaPorId(id){

  if(!id){

    return;

  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(
      id
    );

}


/* ==========================================
   CRIAR CARD
========================================== */

function criarCard(n){

  const article =
    document.createElement(
      "article"
    );

  article.className =
    "compact-card";


  article.onclick =
    function(){

      abrirNoticia(n);

    };


  const titulo =
    esc(
      obterTitulo(n)
    );


  const imagem =
    obterImagem(n);


  const categoria =
    esc(
      n?.categoria ||
      "Notícias"
    );


  let media = "";


  if(imagem){

    media = `

      <img
        src="${esc(imagem)}"
        alt="${titulo}"
        loading="lazy"
        decoding="async"
        onerror="
          this.style.display='none';
          this.nextElementSibling.style.display='flex';
        "
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


  if(!area){

    return;

  }


  area.innerHTML = "";


  if(
    !Array.isArray(lista) ||
    !lista.length
  ){

    area.innerHTML = `

      <p class="sem-noticias">

        Ainda não existem notícias
        nesta categoria.

      </p>

    `;

    return;

  }


  lista
    .slice(0,4)
    .forEach(
      function(n){

        area.appendChild(
          criarCard(n)
        );

      }
    );

}


/* ==========================================
   DESTAQUE
========================================== */

function renderizarDestaque(n){

  const area =
    document.getElementById(
      "destaque"
    );


  if(!area){

    return;

  }


  if(!n){

    area.innerHTML = "";

    return;

  }


  const titulo =
    esc(
      obterTitulo(n)
    );


  const texto =
    esc(
      obterTexto(n)
    );


  const imagem =
    obterImagem(n);


  const categoria =
    esc(
      n?.categoria ||
      "Notícias"
    );


  area.innerHTML = `

    <article
      class="featured"
      onclick="
        abrirNoticiaPorId('${esc(n.id)}')
      "
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
🌍 AFRICANMUNDO
PARTE 2/8 — NOTÍCIAS + CATEGORIAS
========================================== */

async function carregarNoticias(){

  const secoes = [
    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"
  ];

  secoes.forEach(id => {

    const el = document.getElementById(id);

    if(el){
      el.classList.remove("noticiasProntas");
    }

  });

  document.body.classList.add("carregandoNoticias");

  if(!db){

    const iniciado = iniciarSupabase();

    if(!iniciado){

      mostrarErro(
        "Não foi possível ligar ao sistema de notícias."
      );

      document.body.classList.remove(
        "carregandoNoticias"
      );

      return;
    }
  }

  try{

    console.log(
      "🌍 AfricanMundo: a carregar notícias..."
    );

    /*
    ==========================================
    BUSCA PRINCIPAL
    ==========================================
    */

    const { data, error } = await db
      .from("noticias")
      .select(`
        id,
        titulo,
        texto,
        imagem,
        categoria,
        data,
        fonte,
        url_original
      `)
      .order("id", {
        ascending:false
      })
      .limit(100);

    if(error){
      throw error;
    }

    let todasNoticias = Array.isArray(data)
      ? data
      : [];

    /*
    ==========================================
    LIMPEZA E SEGURANÇA
    ==========================================
    */

    todasNoticias = todasNoticias
      .filter(n => n && n.id != null)
      .map(n => {

        return {

          ...n,

          titulo:
            obterTitulo(n),

          texto:
            obterTexto(n),

          imagem:
            obterImagem(n),

          categoria:
            normalizarCategoria(
              n.categoria
            )

        };

      });

    /*
    ==========================================
    REMOVE DUPLICADOS
    ==========================================
    */

    const mapaNoticias = new Map();

    todasNoticias.forEach(n => {

      const chave = String(n.id);

      if(!mapaNoticias.has(chave)){
        mapaNoticias.set(
          chave,
          n
        );
      }

    });

    todasNoticias =
      Array.from(
        mapaNoticias.values()
      );

    /*
    ==========================================
    ORDENAÇÃO
    ==========================================
    */

    todasNoticias.sort(
      (a,b) =>
        Number(b.id) -
        Number(a.id)
    );

    /*
    ==========================================
    GUARDA GLOBALMENTE
    ==========================================
    */

    window.__noticias =
      todasNoticias;

    console.log(
      "📰 Notícias carregadas:",
      todasNoticias.length
    );

    /*
    ==========================================
    CATEGORIAS
    ==========================================
    */

    const categorias = {

      futebol: [
        "futebol",
        "football",
        "soccer"
      ],

      mocambique: [
        "moçambique",
        "mocambique",
        "mozambique"
      ],

      africa: [
        "áfrica",
        "africa",
        "africano",
        "africana"
      ],

      negocios: [
        "negócios",
        "negocios",
        "economia",
        "business",
        "finance",
        "finanças"
      ],

      entretenimento: [
        "entretenimento",
        "cultura",
        "celebridades",
        "cinema",
        "música",
        "musica"
      ],

      desporto: [
        "desporto",
        "esporte",
        "sports",
        "basquetebol",
        "atletismo",
        "ténis",
        "tenis"
      ]

    };

    /*
    ==========================================
    FUNÇÃO PARA ENCONTRAR CATEGORIAS
    ==========================================
    */

    function pertenceCategoria(
      noticia,
      nomes
    ){

      const categoria =
        normalizarTexto(
          noticia.categoria
        );

      return nomes.some(nome =>
        categoria ===
        normalizarTexto(nome)
      );

    }

    /*
    ==========================================
    CONSTRÓI AS LISTAS
    ==========================================
    */

    const listas = {

      futebol:
        todasNoticias.filter(n =>
          pertenceCategoria(
            n,
            categorias.futebol
          )
        ),

      mocambique:
        todasNoticias.filter(n =>
          pertenceCategoria(
            n,
            categorias.mocambique
          )
        ),

      africa:
        todasNoticias.filter(n =>
          pertenceCategoria(
            n,
            categorias.africa
          )
        ),

      negocios:
        todasNoticias.filter(n =>
          pertenceCategoria(
            n,
            categorias.negocios
          )
        ),

      entretenimento:
        todasNoticias.filter(n =>
          pertenceCategoria(
            n,
            categorias.entretenimento
          )
        ),

      desporto:
        todasNoticias.filter(n =>
          pertenceCategoria(
            n,
            categorias.desporto
          )
        )

    };

    /*
    ==========================================
    RENDERIZAÇÃO
    ==========================================
    */

    renderizarPagina();

    /*
    ==========================================
    MOSTRAR QUANTIDADE NO CONSOLE
    ==========================================
    */

    console.log(
      "⚽ Futebol:",
      listas.futebol.length
    );

    console.log(
      "🇲🇿 Moçambique:",
      listas.mocambique.length
    );

    console.log(
      "🌍 África:",
      listas.africa.length
    );

    console.log(
      "💼 Negócios:",
      listas.negocios.length
    );

    console.log(
      "🎬 Entretenimento:",
      listas.entretenimento.length
    );

    console.log(
      "🏆 Desporto:",
      listas.desporto.length
    );

    /*
    ==========================================
    FINALIZA CARREGAMENTO
    ==========================================
    */

    document.body.classList.remove(
      "carregandoNoticias"
    );

    secoes.forEach(id => {

      const el =
        document.getElementById(id);

      if(el){

        el.classList.add(
          "noticiasProntas"
        );

      }

    });

    /*
    ==========================================
    NOTIFICAÇÕES
    ==========================================
    */

    setTimeout(() => {

      try{

        if(
          typeof atualizarNotificacoes ===
          "function"
        ){

          atualizarNotificacoes(
            window.__noticias
          );

        }

      }catch(e){

        console.warn(
          "Aviso notificações:",
          e
        );

      }

    }, 100);

  }catch(error){

    console.error(
      "❌ Erro ao carregar notícias:",
      error
    );

    mostrarErro(
      "Não foi possível carregar as notícias neste momento."
    );

    document.body.classList.remove(
      "carregandoNoticias"
    );

  }

}


/* ==========================================
RENDERIZAR PÁGINA
========================================== */

function renderizarPagina(){

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];

  if(!noticias.length){

    mostrarErro(
      "Ainda não existem notícias disponíveis."
    );

    return;
  }

  /*
  ==========================================
  EMBARALHAR SEM ALTERAR A LISTA ORIGINAL
  ==========================================
  */

  const embaralhar = lista => {

    return [...lista]
      .sort(
        () => Math.random() - 0.5
      );

  };

  /*
  ==========================================
  DESTAQUE
  ==========================================
  */

  const destaques =
    embaralhar(
      noticias
    );

  if(destaques.length){

    renderizarDestaque(
      destaques[0]
    );

  }

  /*
  ==========================================
  ÚLTIMAS NOTÍCIAS
  ==========================================
  */

  renderizarLista(
    "ultimas",
    noticias.slice(0,4)
  );

  /*
  ==========================================
  CATEGORIA — FUTEBOL
  ==========================================
  */

  renderizarLista(
    "futebol",
    noticias
      .filter(n =>
        ["futebol","football","soccer"]
          .includes(
            normalizarTexto(
              n.categoria
            )
          )
      )
      .slice(0,4)
  );

  /*
  ==========================================
  CATEGORIA — MOÇAMBIQUE
  ==========================================
  */

  renderizarLista(
    "mocambique",
    noticias
      .filter(n => {

        const cat =
          normalizarTexto(
            n.categoria
          );

        return (
          cat === "mocambique" ||
          cat === "moçambique" ||
          cat.includes("mocambique") ||
          cat.includes("moçambique")
        );

      })
      .slice(0,4)
  );

  /*
  ==========================================
  CATEGORIA — ÁFRICA
  ==========================================
  */

  renderizarLista(
    "africa",
    noticias
      .filter(n => {

        const cat =
          normalizarTexto(
            n.categoria
          );

        return (
          cat === "africa" ||
          cat === "áfrica" ||
          cat.includes("africa") ||
          cat.includes("áfrica")
        );

      })
      .slice(0,4)
  );

  /*
  ==========================================
  CATEGORIA — NEGÓCIOS
  ==========================================
  */

  renderizarLista(
    "negocios",
    noticias
      .filter(n => {

        const cat =
          normalizarTexto(
            n.categoria
          );

        return (
          cat.includes("negocio") ||
          cat.includes("economia") ||
          cat.includes("business") ||
          cat.includes("finance")
        );

      })
      .slice(0,4)
  );

  /*
  ==========================================
  CATEGORIA — ENTRETENIMENTO
  ==========================================
  */

  renderizarLista(
    "entretenimento",
    noticias
      .filter(n => {

        const cat =
          normalizarTexto(
            n.categoria
          );

        return (
          cat.includes("entretenimento") ||
          cat.includes("cultura") ||
          cat.includes("cinema") ||
          cat.includes("musica") ||
          cat.includes("celebr")
        );

      })
      .slice(0,4)
  );

  /*
  ==========================================
  CATEGORIA — DESPORTO
  ==========================================
  */

    renderizarLista(
    "desporto",
    noticias
      .filter(n => {

        const cat =
          normalizarTexto(
            n.categoria
          );

        return (
          cat.includes("desporto") ||
          cat.includes("esporte") ||
          cat.includes("sports") ||
          cat.includes("basquet") ||
          cat.includes("atlet")
        );

      })
      .slice(0,4)
  );

}

/* ==========================================
ERRO DE NOTÍCIAS
========================================== */

function mostrarErro(mensagem){

const secoes = [
"destaque",
"ultimas",
"futebol",
"mocambique",
"africa",
"negocios",
"entretenimento",
"desporto"
];

secoes.forEach(id => {

const el =
  document.getElementById(id);

if(!el)return;

if(id === "destaque"){

  el.innerHTML = `
    <div class="featured">
      <div class="featured-content">
        <div class="featured-title">
          ${esc(mensagem)}
        </div>
      </div>
    </div>
  `;

}else{

  el.innerHTML = `
    <div class="compact-card">
      <div class="compact-body">
        <div class="compact-title">
          ${esc(mensagem)}
        </div>
      </div>
    </div>
  `;

}

});

           }
/* ==========================================
🌍 AFRICANMUNDO
PARTE 3/8 — PESQUISA + FAVORITOS
========================================== */


/* ==========================================
PESQUISA DE NOTÍCIAS
========================================== */

function pesquisar(e){

  if(e){
    e.preventDefault();
  }

  const input =
    document.getElementById("searchInput");

  const resultados =
    document.getElementById("searchResults");

  if(!input || !resultados){
    return;
  }

  const termo =
    normalizarTexto(
      input.value
    ).trim();

  if(!termo){

    resultados.innerHTML = "";

    return;
  }

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];

  const encontrados =
    noticias.filter(n => {

      const titulo =
        normalizarTexto(
          obterTitulo(n)
        );

      const texto =
        normalizarTexto(
          obterTexto(n)
        );

      const categoria =
        normalizarTexto(
          n.categoria
        );

      return (
        titulo.includes(termo) ||
        texto.includes(termo) ||
        categoria.includes(termo)
      );

    });

  if(!encontrados.length){

    resultados.innerHTML = `
      <div class="compact-card">
        <div class="compact-body">
          <div class="compact-title">
            Nenhuma notícia encontrada.
          </div>
        </div>
      </div>
    `;

    return;
  }

  resultados.innerHTML =
    encontrados
      .slice(0,8)
      .map(n => criarCard(n))
      .join("");

}


/* ==========================================
LIMPAR PESQUISA
========================================== */

function limparPesquisa(){

  const input =
    document.getElementById("searchInput");

  const resultados =
    document.getElementById("searchResults");

  if(input){
    input.value = "";
  }

  if(resultados){
    resultados.innerHTML = "";
  }

}


/* ==========================================
FAVORITOS
========================================== */

function obterFavoritos(){

  try{

    const dados =
      localStorage.getItem(
        "africanmundo_favoritos"
      );

    if(!dados){
      return [];
    }

    const favoritos =
      JSON.parse(dados);

    return Array.isArray(favoritos)
      ? favoritos
      : [];

  }catch(e){

    console.warn(
      "Erro ao ler favoritos:",
      e
    );

    return [];
  }

}


/* ==========================================
GUARDAR FAVORITO
========================================== */

function guardarFavorito(noticia){

  if(!noticia || noticia.id == null){
    return;
  }

  try{

    let favoritos =
      obterFavoritos();

    const id =
      String(noticia.id);

    const existe =
      favoritos.some(
        item =>
          String(item.id) === id
      );

    if(existe){

      favoritos =
        favoritos.filter(
          item =>
            String(item.id) !== id
        );

      localStorage.setItem(
        "africanmundo_favoritos",
        JSON.stringify(favoritos)
      );

      return false;

    }

    favoritos.unshift({

      id: noticia.id,

      titulo:
        obterTitulo(noticia),

      texto:
        obterTexto(noticia),

      imagem:
        obterImagem(noticia),

      categoria:
        noticia.categoria || "",

      data:
        noticia.data || "",

      fonte:
        noticia.fonte || "",

      url_original:
        noticia.url_original || ""

    });

    /*
    Mantém apenas os 50 favoritos
    mais recentes.
    */

    favoritos =
      favoritos.slice(0,50);

    localStorage.setItem(
      "africanmundo_favoritos",
      JSON.stringify(favoritos)
    );

    return true;

  }catch(e){

    console.error(
      "Erro ao guardar favorito:",
      e
    );

    return false;
  }

}


/* ==========================================
ABRIR FAVORITOS
========================================== */

function abrirFavoritos(){

  const favoritos =
    obterFavoritos();

  if(!favoritos.length){

    abrirModal(
      "⭐ Favoritos",
      `
        <div style="
          padding:20px;
          text-align:center;
        ">
          <div style="
            font-size:42px;
            margin-bottom:10px;
          ">
            ⭐
          </div>

          <strong>
            Ainda não tens notícias favoritas.
          </strong>

          <p>
            Guarda uma notícia para encontrá-la
            facilmente aqui.
          </p>
        </div>
      `
    );

    return;
  }

  const html =
    favoritos.map((n,index) => {

      return `
        <div
          class="compact-card"
          style="margin-bottom:12px;"
        >

          ${
            obterImagem(n)
              ? `
                <img
                  src="${esc(obterImagem(n))}"
                  alt="${esc(obterTitulo(n))}"
                  class="compact-media"
                  loading="lazy"
                >
              `
              : ""
          }

          <div class="compact-body">

            <div class="compact-cat">
              ${esc(n.categoria || "Notícia")}
            </div>

            <div class="compact-title">
              ${esc(obterTitulo(n))}
            </div>

            <button
              type="button"
              onclick="abrirNoticiaPorId('${esc(n.id)}')"
            >
              Ler notícia
            </button>

            <button
              type="button"
              onclick="removerFavorito(${index})"
            >
              Remover
            </button>

          </div>

        </div>
      `;

    }).join("");

  abrirModal(
    "⭐ Favoritos",
    html
  );

}


/* ==========================================
REMOVER FAVORITO
========================================== */

function removerFavorito(indice){

  try{

    const favoritos =
      obterFavoritos();

    if(
      indice < 0 ||
      indice >= favoritos.length
    ){
      return;
    }

    favoritos.splice(
      indice,
      1
    );

    localStorage.setItem(
      "africanmundo_favoritos",
      JSON.stringify(favoritos)
    );

    abrirFavoritos();

  }catch(e){

    console.error(
      "Erro ao remover favorito:",
      e
    );

  }

     }
/* ==========================================
🌍 AFRICANMUNDO
PARTE 4/8 — NOTIFICAÇÕES
========================================== */


/* ==========================================
ATUALIZAR NOTIFICAÇÕES
========================================== */

function atualizarNotificacoes(noticias){

  try{

    if(!Array.isArray(noticias)){
      noticias = [];
    }

    const ultimaVista =
      Number(
        localStorage.getItem(
          "africanmundo_ultima_noticia"
        ) || 0
      );

    const novas =
      noticias.filter(n =>
        Number(n.id) > ultimaVista
      );

    const botao =
      document.getElementById(
        "notificationBtn"
      );

    if(!botao){
      return;
    }

    /*
    Remove indicador anterior.
    */

    const antigo =
      botao.querySelector(
        ".am-notification-badge"
      );

    if(antigo){
      antigo.remove();
    }

    /*
    Cria contador quando existem
    notícias novas.
    */

    if(novas.length){

      const badge =
        document.createElement("span");

      badge.className =
        "am-notification-badge";

      badge.textContent =
        novas.length > 99
          ? "99+"
          : String(novas.length);

      badge.style.cssText = `
        position:absolute;
        top:-4px;
        right:-4px;
        min-width:18px;
        height:18px;
        padding:0 4px;
        border-radius:20px;
        background:#e53935;
        color:#fff;
        font-size:10px;
        font-weight:700;
        display:flex;
        align-items:center;
        justify-content:center;
        line-height:1;
        z-index:10;
      `;

      const posicao =
        getComputedStyle(botao)
          .position;

      if(posicao === "static"){
        botao.style.position =
          "relative";
      }

      botao.appendChild(badge);
    }

  }catch(e){

    console.warn(
      "Erro nas notificações:",
      e
    );

  }

}


/* ==========================================
ABRIR NOTIFICAÇÕES
========================================== */

function abrirNotificacoes(){

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];

  /*
  Marca a notícia mais recente
  como vista.
  */

  if(noticias.length){

    const maiorId =
      noticias.reduce(
        (maior,n) =>
          Number(n.id) > maior
            ? Number(n.id)
            : maior,
        0
      );

    if(maiorId){

      localStorage.setItem(
        "africanmundo_ultima_noticia",
        String(maiorId)
      );

    }

  }

  /*
  Remove o contador.
  */

  const botao =
    document.getElementById(
      "notificationBtn"
    );

  if(botao){

    const badge =
      botao.querySelector(
        ".am-notification-badge"
      );

    if(badge){
      badge.remove();
    }

  }

  /*
  Sem notícias.
  */

  if(!noticias.length){

    abrirModal(
      "🔔 Notificações",
      `
        <div style="
          padding:20px;
          text-align:center;
        ">

          <div style="
            font-size:42px;
            margin-bottom:10px;
          ">
            🔔
          </div>

          <strong>
            Não existem notificações novas.
          </strong>

          <p>
            Quando houver novas notícias,
            elas aparecerão aqui.
          </p>

        </div>
      `
    );

    return;
  }

  /*
  Mostra as notícias mais recentes.
  */

  const html =
    noticias
      .slice(0,8)
      .map(n => {

        const imagem =
          obterImagem(n);

        return `
          <div
            class="compact-card"
            style="
              margin-bottom:12px;
              cursor:pointer;
            "
            onclick="abrirNoticiaPorId('${esc(n.id)}')"
          >

            ${
              imagem
                ? `
                  <img
                    src="${esc(imagem)}"
                    alt="${esc(obterTitulo(n))}"
                    class="compact-media"
                    loading="lazy"
                  >
                `
                : ""
            }

            <div class="compact-body">

              <div class="compact-cat">
                ${esc(
                  n.categoria ||
                  "Nova notícia"
                )}
              </div>

              <div class="compact-title">
                ${esc(
                  obterTitulo(n)
                )}
              </div>

              <small>
                ${esc(
                  formatarData(n.data)
                )}
              </small>

            </div>

          </div>
        `;

      })
      .join("");

  abrirModal(
    "🔔 Últimas notificações",
    html
  );

}


/* ==========================================
BASE64 → UINT8ARRAY
========================================== */

function urlBase64ToUint8Array(
  base64String
){

  try{

    const padding =
      "=".repeat(
        (4 - base64String.length % 4) % 4
      );

    const base64 =
      (
        base64String +
        padding
      )
      .replace(/-/g,"+")
      .replace(/_/g,"/");

    const rawData =
      window.atob(base64);

    return Uint8Array.from(
      [...rawData].map(
        char =>
          char.charCodeAt(0)
      )
    );

  }catch(e){

    console.error(
      "Erro VAPID:",
      e
    );

    return null;
  }

}


/* ==========================================
ATIVAR NOTIFICAÇÕES PUSH
========================================== */

async function ativarNotificacoesPush(){

  try{

    /*
    Verifica suporte.
    */

    if(
      !("serviceWorker" in navigator)
    ){

      alert(
        "Este navegador não suporta notificações push."
      );

      return;
    }

    if(
      !("PushManager" in window)
    ){

      alert(
        "As notificações push não são suportadas neste navegador."
      );

      return;
    }

    /*
    Pede permissão.
    */

    const permissao =
      await Notification.requestPermission();

    if(permissao !== "granted"){

      alert(
        "As notificações foram bloqueadas."
      );

      return;
    }

    /*
    Regista o Service Worker.
    */

    const registro =
      await navigator.serviceWorker.register(
        "/Africanmundo-/sw.js"
      );

    /*
    Obtém subscrição existente.
    */

    let subscription =
      await registro.pushManager
        .getSubscription();

    /*
    Cria nova subscrição.
    */

    if(!subscription){

      const chave =
        urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY
        );

      if(!chave){

        alert(
          "Não foi possível configurar as notificações."
        );

        return;
      }

      subscription =
        await registro.pushManager.subscribe({

          userVisibleOnly:true,

          applicationServerKey:
            chave

        });

    }

    const dados =
      subscription.toJSON();

    /*
    Guarda a subscrição no Supabase.
    */

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
        "Não foi possível guardar o push no servidor."
      );

    }

    alert(
      "🔔 Notificações ativadas com sucesso!"
    );

  }catch(e){

    console.error(
      "Erro ao ativar notificações:",
      e
    );

    alert(
      "Não foi possível ativar as notificações neste momento."
    );

  }

           }
/* ==========================================
🌍 AFRICANMUNDO
PARTE 5/8 — MODAL + FERRAMENTAS + EU
========================================== */


/* ==========================================
MODAL PRINCIPAL
========================================== */

function abrirModal(titulo, html){

  let modal =
    document.getElementById("amModal");

  /*
  Cria o modal apenas se ainda
  não existir.
  */

  if(!modal){

    modal =
      document.createElement("div");

    modal.id =
      "amModal";

    modal.innerHTML = `
      <div class="am-back"></div>

      <div class="am-box">

        <div class="am-head">

          <strong id="amTitle">
            AfricanMundo
          </strong>

          <button
            type="button"
            id="amClose"
            aria-label="Fechar"
          >
            ✕
          </button>

        </div>

        <div id="amBody"></div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    const fundo =
      modal.querySelector(
        ".am-back"
      );

    const fechar =
      modal.querySelector(
        "#amClose"
      );

    if(fundo){

      fundo.onclick =
        fecharModal;

    }

    if(fechar){

      fechar.onclick =
        fecharModal;

    }

  }

  const tituloEl =
    document.getElementById(
      "amTitle"
    );

  const corpoEl =
    document.getElementById(
      "amBody"
    );

  if(tituloEl){

    tituloEl.textContent =
      titulo || "AfricanMundo";

  }

  if(corpoEl){

    corpoEl.innerHTML =
      html || "";

  }

  modal.style.display =
    "flex";

  document.body.style.overflow =
    "hidden";

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

  document.body.style.overflow =
    "";

}


/* ==========================================
FERRAMENTAS
========================================== */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `
      <div style="
        display:grid;
        gap:10px;
      ">

        <button
          type="button"
          onclick="
            compartilharSite();
          "
        >
          📤 Partilhar AfricanMundo
        </button>

        <button
          type="button"
          onclick="
            copiarLinkSite();
          "
        >
          🔗 Copiar endereço do site
        </button>

        <button
          type="button"
          onclick="
            salvarSite();
          "
        >
          ⭐ Guardar site
        </button>

        <button
          type="button"
          onclick="
            abrirFavoritos();
          "
        >
          ❤️ Meus favoritos
        </button>

        <button
          type="button"
          onclick="
            ativarNotificacoesPush();
          "
        >
          🔔 Ativar notificações
        </button>

        <button
          type="button"
          onclick="
            fecharModal();
            abrirCores();
          "
        >
          🎨 Personalizar aparência
        </button>

      </div>
    `
  );

}


/* ==========================================
ÁREA "EU"
========================================== */

function abrirUsuario(){

  const favoritos =
    obterFavoritos();

  abrirModal(
    "👤 Eu",
    `
      <div style="
        text-align:center;
        padding:10px 0 20px;
      ">

        <div style="
          font-size:52px;
          margin-bottom:8px;
        ">
          👤
        </div>

        <h3 style="
          margin:5px 0;
        ">
          Bem-vindo ao AfricanMundo
        </h3>

        <p style="
          opacity:.8;
        ">
          Personalize a sua experiência
          e acompanhe as notícias de África
          e do mundo.
        </p>

      </div>

      <div style="
        display:grid;
        gap:10px;
      ">

        <button
          type="button"
          onclick="
            abrirFavoritos();
          "
        >
          ⭐ Favoritos
          (${favoritos.length})
        </button>

        <button
          type="button"
          onclick="
            fecharModal();
            abrirFerramentas();
          "
        >
          🛠️ Ferramentas
        </button>

        <button
          type="button"
          onclick="
            fecharModal();
            abrirCores();
          "
        >
          🎨 Aparência
        </button>

        <button
          type="button"
          onclick="
            fecharModal();
            alternarTema();
          "
        >
          🌙 Modo escuro / claro
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
      <div style="
        display:grid;
        grid-template-columns:
          repeat(2,1fr);
        gap:10px;
      ">

        <button
          type="button"
          onclick="
            abrirRede('facebook');
          "
        >
          📘 Facebook
        </button>

        <button
          type="button"
          onclick="
            abrirRede('youtube');
          "
        >
          ▶️ YouTube
        </button>

        <button
          type="button"
          onclick="
            abrirRede('whatsapp');
          "
        >
          💬 WhatsApp
        </button>

        <button
          type="button"
          onclick="
            abrirRede('instagram');
          "
        >
          📸 Instagram
        </button>

        <button
          type="button"
          onclick="
            abrirRede('tiktok');
          "
        >
          🎵 TikTok
        </button>

        <button
          type="button"
          onclick="
            abrirRede('google');
          "
        >
          🌐 Google
        </button>

      </div>
    `
  );

}


/* ==========================================
ABRIR REDE SOCIAL
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

  /*
  Fecha o modal antes de abrir
  o endereço.
  */

  fecharModal();

  /*
  Usa nova janela quando possível.
  */

  const nova =
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  /*
  Alguns navegadores móveis
  podem bloquear window.open.
  */

  if(!nova){

    window.location.href =
      url;

  }

     }
/* ==========================================
🌍 AFRICANMUNDO
PARTE 6/8 — TEMA + CORES + PARTILHA
========================================== */


/* ==========================================
ALTERNAR TEMA
========================================== */

function alternarTema(){

  const body =
    document.body;

  if(!body){
    return;
  }

  const escuro =
    body.classList.toggle(
      "dark"
    );

  localStorage.setItem(
    "africanmundo_tema",
    escuro
      ? "dark"
      : "light"
  );

}


/* ==========================================
CARREGAR TEMA
========================================== */

function carregarTema(){

  try{

    const tema =
      localStorage.getItem(
        "africanmundo_tema"
      );

    if(tema === "dark"){

      document.body.classList.add(
        "dark"
      );

    }else{

      document.body.classList.remove(
        "dark"
      );

    }

  }catch(e){

    console.warn(
      "Erro ao carregar tema:",
      e
    );

  }

}


/* ==========================================
ABRIR CORES
========================================== */

function abrirCores(){

  abrirModal(
    "🎨 Personalizar aparência",
    `
      <div style="
        display:grid;
        gap:10px;
      ">

        <p>
          Escolha a cor principal do
          AfricanMundo:
        </p>

        <button
          type="button"
          onclick="mudarCor('#168a45')"
        >
          🟢 Verde
        </button>

        <button
          type="button"
          onclick="mudarCor('#1976d2')"
        >
          🔵 Azul
        </button>

        <button
          type="button"
          onclick="mudarCor('#d32f2f')"
        >
          🔴 Vermelho
        </button>

        <button
          type="button"
          onclick="mudarCor('#7b1fa2')"
        >
          🟣 Roxo
        </button>

        <button
          type="button"
          onclick="mudarCor('#ef6c00')"
        >
          🟠 Laranja
        </button>

      </div>
    `
  );

}


/* ==========================================
MUDAR COR PRINCIPAL
========================================== */

function mudarCor(cor){

  if(!cor){
    return;
  }

  /*
  Mantém a cor dentro de um
  conjunto seguro.
  */

  const coresPermitidas = [

    "#168a45",
    "#1976d2",
    "#d32f2f",
    "#7b1fa2",
    "#ef6c00"

  ];

  if(
    !coresPermitidas.includes(cor)
  ){

    console.warn(
      "Cor não permitida:",
      cor
    );

    return;
  }

  document.documentElement.style
    .setProperty(
      "--p",
      cor
    );

  localStorage.setItem(
    "africanmundo_cor",
    cor
  );

}


/* ==========================================
CARREGAR COR
========================================== */

function carregarCor(){

  try{

    const cor =
      localStorage.getItem(
        "africanmundo_cor"
      );

    if(!cor){
      return;
    }

    const coresPermitidas = [

      "#168a45",
      "#1976d2",
      "#d32f2f",
      "#7b1fa2",
      "#ef6c00"

    ];

    if(
      coresPermitidas.includes(cor)
    ){

      document.documentElement.style
        .setProperty(
          "--p",
          cor
        );

    }

  }catch(e){

    console.warn(
      "Erro ao carregar cor:",
      e
    );

  }

}


/* ==========================================
PARTILHAR SITE
========================================== */

async function compartilharSite(){

  const url =
    window.location.href;

  const titulo =
    "AfricanMundo — Notícias de África";

  const texto =
    "A informação que liga África ao mundo.";

  try{

    if(
      navigator.share
    ){

      await navigator.share({

        title: titulo,

        text: texto,

        url: url

      });

      return;

    }

    /*
    Fallback para navegadores
    sem Web Share API.
    */

    await navigator.clipboard.writeText(
      url
    );

    alert(
      "🔗 Endereço copiado. Pode partilhar agora."
    );

  }catch(e){

    console.warn(
      "Partilha cancelada ou indisponível:",
      e
    );

  }

}


/* ==========================================
COPIAR LINK
========================================== */

async function copiarLinkSite(){

  const url =
    window.location.href;

  try{

    if(
      navigator.clipboard &&
      window.isSecureContext
    ){

      await navigator.clipboard.writeText(
        url
      );

      alert(
        "🔗 Endereço copiado com sucesso!"
      );

      return;
    }

    /*
    Fallback para alguns
    navegadores móveis.
    */

    const area =
      document.createElement(
        "textarea"
      );

    area.value =
      url;

    area.style.position =
      "fixed";

    area.style.left =
      "-9999px";

    document.body.appendChild(
      area
    );

    area.focus();

    area.select();

    document.execCommand(
      "copy"
    );

    area.remove();

    alert(
      "🔗 Endereço copiado!"
    );

  }catch(e){

    console.error(
      "Erro ao copiar:",
      e
    );

    alert(
      "Não foi possível copiar o endereço."
    );

  }

}


/* ==========================================
GUARDAR SITE
========================================== */

function salvarSite(){

  /*
  Tenta instalar como aplicação
  quando o navegador disponibilizar
  o evento beforeinstallprompt.
  */

  if(
    window.__deferredInstallPrompt
  ){

    window.__deferredInstallPrompt
      .prompt();

    window.__deferredInstallPrompt
      .userChoice
      .then(resultado => {

        console.log(
          "Instalação:",
          resultado.outcome
        );

        window.__deferredInstallPrompt =
          null;

      });

    return;

  }

  /*
  Caso o navegador não disponibilize
  instalação automática.
  */

  alert(
    "📱 Para guardar o AfricanMundo, use a opção 'Adicionar ao ecrã inicial' do navegador."
  );

}


/* ==========================================
INSTALAÇÃO PWA
========================================== */

window.addEventListener(
  "beforeinstallprompt",
  function(e){

    e.preventDefault();

    window.__deferredInstallPrompt =
      e;

    console.log(
      "📱 Instalação do AfricanMundo disponível."
    );

  }
);


/* ==========================================
QUANDO A APP É INSTALADA
========================================== */

window.addEventListener(
  "appinstalled",
  function(){

    console.log(
      "✅ AfricanMundo instalado."
    );

    window.__deferredInstallPrompt =
      null;

  }
);
/* ==========================================
🌍 AFRICANMUNDO
PARTE 7/8 — ANÚNCIOS + EVENTOS + PWA
========================================== */


/* ==========================================
CARREGAR ANÚNCIOS ATIVOS
========================================== */

async function carregarAnunciosAtivos(){

  const secao =
    document.getElementById(
      "anunciosAtivosSection"
    );

  const container =
    document.getElementById(
      "anunciosAtivos"
    );

  if(!secao || !container){
    return;
  }

  try{

    if(!db){

      const iniciado =
        iniciarSupabase();

      if(!iniciado){
        return;
      }

    }

    const agora =
      new Date().toISOString();

    const { data, error } =
      await db
        .from("anuncios")
        .select(`
          id,
          empresa,
          mensagem,
          imagem,
          video,
          link,
          data_inicio,
          data_fim,
          ativo
        `)
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

    if(error){

      console.warn(
        "Erro ao carregar anúncios:",
        error
      );

      return;
    }

    let anuncios =
      Array.isArray(data)
        ? data
        : [];

    /*
    Verifica datas localmente.
    */

    anuncios =
      anuncios.filter(anuncio => {

        if(!anuncio){
          return false;
        }

        const inicio =
          anuncio.data_inicio
            ? new Date(
                anuncio.data_inicio
              )
            : null;

        const fim =
          anuncio.data_fim
            ? new Date(
                anuncio.data_fim
              )
            : null;

        const momento =
          new Date(agora);

        if(
          inicio &&
          !isNaN(inicio) &&
          momento < inicio
        ){

          return false;
        }

        if(
          fim &&
          !isNaN(fim) &&
          momento > fim
        ){

          return false;
        }

        return true;

      });

    if(!anuncios.length){

      secao.style.display =
        "none";

      container.innerHTML =
        "";

      return;
    }

    secao.style.display =
      "";

    container.innerHTML =
      anuncios
        .map(anuncio => {

          const imagem =
            anuncio.imagem || "";

          const video =
            anuncio.video || "";

          const link =
            anuncio.link || "";

          return `
            <article
              class="compact-card"
              style="cursor:pointer;"
              ${
                link
                  ? `
                    onclick="
                      abrirLink(
                        '${esc(link)}'
                      );
                    "
                  `
                  : ""
              }
            >

              ${
                imagem
                  ? `
                    <img
                      src="${esc(imagem)}"
                      alt="${esc(
                        anuncio.empresa ||
                        "Publicidade"
                      )}"
                      class="compact-media"
                      loading="lazy"
                    >
                  `
                  : ""
              }

              ${
                video
                  ? `
                    <video
                      src="${esc(video)}"
                      controls
                      preload="metadata"
                      style="
                        width:100%;
                        display:block;
                      "
                      onclick="event.stopPropagation();"
                    ></video>
                  `
                  : ""
              }

              <div class="compact-body">

                <div class="compact-cat">
                  PUBLICIDADE
                </div>

                <div class="compact-title">
                  ${esc(
                    anuncio.empresa ||
                    "Anunciante"
                  )}
                </div>

                ${
                  anuncio.mensagem
                    ? `
                      <div>
                        ${esc(
                          anuncio.mensagem
                        )}
                      </div>
                    `
                    : ""
                }

              </div>

            </article>
          `;

        })
        .join("");

  }catch(e){

    console.warn(
      "Erro anúncios:",
      e
    );

  }

}


/* ==========================================
ABRIR LINK EXTERNO
========================================== */

function abrirLink(url){

  if(!url){
    return;
  }

  try{

    const endereco =
      String(url).trim();

    if(
      !/^https?:\/\//i.test(
        endereco
      )
    ){

      console.warn(
        "Link inválido:",
        endereco
      );

      return;
    }

    const nova =
      window.open(
        endereco,
        "_blank",
        "noopener,noreferrer"
      );

    if(!nova){

      window.location.href =
        endereco;

    }

  }catch(e){

    console.error(
      "Erro ao abrir link:",
      e
    );

  }

}


/* ==========================================
EVENTOS DOS BOTÕES
========================================== */

function iniciarEventos(){

  /*
  NOTIFICAÇÕES
  */

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );

  if(notificationBtn){

    notificationBtn.onclick =
      function(e){

        e.preventDefault();

        abrirNotificacoes();

      };

  }


  /*
  FERRAMENTAS
  */

  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );

  if(toolsBtn){

    toolsBtn.onclick =
      function(e){

        e.preventDefault();

        abrirFerramentas();

      };

  }


  /*
  ÁREA EU
  */

  const userBtn =
    document.getElementById(
      "userBtn"
    );

  if(userBtn){

    userBtn.onclick =
      function(e){

        e.preventDefault();

        abrirUsuario();

      };

  }


  /*
  TEMA
  */

  const themeBtn =
    document.getElementById(
      "themeBtn"
    );

  if(themeBtn){

    themeBtn.onclick =
      function(e){

        e.preventDefault();

        alternarTema();

      };

  }


  /*
  CORES
  */

  const colorBtn =
    document.getElementById(
      "colorBtn"
    );

  if(colorBtn){

    colorBtn.onclick =
      function(e){

        e.preventDefault();

        abrirCores();

      };

  }


  /*
  PESQUISA
  */

  const searchForm =
    document.getElementById(
      "searchForm"
    );

  if(searchForm){

    searchForm.addEventListener(
      "submit",
      pesquisar
    );

  }


  /*
  PESQUISA EM TEMPO REAL
  */

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  if(searchInput){

    let temporizador = null;

    searchInput.addEventListener(
      "input",
      function(){

        clearTimeout(
          temporizador
        );

        temporizador =
          setTimeout(
            function(){

              if(
                searchInput.value
                  .trim()
                  .length >= 2
              ){

                pesquisar();

              }else{

                limparPesquisa();

              }

            },
            250
          );

      }
    );

  }


  /*
  FECHAR MODAL COM ESC
  */

  document.addEventListener(
    "keydown",
    function(e){

      if(
        e.key === "Escape"
      ){

        fecharModal();

      }

    }
  );

}


/* ==========================================
SERVICE WORKER
========================================== */

function registrarServiceWorker(){

  if(
    !("serviceWorker" in navigator)
  ){

    return;
  }

  window.addEventListener(
    "load",
    function(){

      navigator.serviceWorker
        .register(
          "/Africanmundo-/sw.js"
        )
        .then(
          registro => {

            console.log(
              "✅ Service Worker ativo:",
              registro.scope
            );

          }
        )
        .catch(
          erro => {

            console.warn(
              "⚠️ Service Worker:",
              erro
            );

          }
        );

    }
  );

}


/* ==========================================
INICIALIZAÇÃO PRINCIPAL
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    console.log(
      "🌍 AfricanMundo iniciado."
    );

    carregarTema();

    carregarCor();

    iniciarEventos();

    registrarServiceWorker();

    carregarNoticias();

    carregarAnunciosAtivos();

  }
);
/* ==========================================
🌍 AFRICANMUNDO
PARTE 8/8 — PROTEÇÃO FINAL + ATUALIZAÇÃO
========================================== */


/* ==========================================
GARANTIR FUNÇÕES GLOBAIS
========================================== */

window.abrirNoticia =
  abrirNoticia;

window.abrirNoticiaPorId =
  abrirNoticiaPorId;

window.abrirFavoritos =
  abrirFavoritos;

window.guardarFavorito =
  guardarFavorito;

window.removerFavorito =
  removerFavorito;

window.abrirNotificacoes =
  abrirNotificacoes;

window.ativarNotificacoesPush =
  ativarNotificacoesPush;

window.abrirFerramentas =
  abrirFerramentas;

window.abrirUsuario =
  abrirUsuario;

window.abrirRedes =
  abrirRedes;

window.abrirRede =
  abrirRede;

window.abrirCores =
  abrirCores;

window.mudarCor =
  mudarCor;

window.alternarTema =
  alternarTema;

window.compartilharSite =
  compartilharSite;

window.copiarLinkSite =
  copiarLinkSite;

window.salvarSite =
  salvarSite;

window.fecharModal =
  fecharModal;

window.abrirLink =
  abrirLink;


/* ==========================================
PROTEÇÃO CONTRA ERROS DE IMAGEM
========================================== */

document.addEventListener(
  "error",
  function(e){

    const elemento =
      e.target;

    if(
      elemento &&
      elemento.tagName === "IMG"
    ){

      /*
      Evita que imagens quebradas
      apareçam como "None" ou ícone
      de imagem inválida.
      */

      elemento.style.display =
        "none";

    }

  },
  true
);


/* ==========================================
ATUALIZAÇÃO AUTOMÁTICA
========================================== */

let atualizacaoNoticiasEmAndamento =
  false;


async function atualizarNoticiasAutomaticamente(){

  /*
  Evita duas atualizações
  simultâneas.
  */

  if(
    atualizacaoNoticiasEmAndamento
  ){

    return;

  }

  if(
    document.hidden
  ){

    return;

  }

  atualizacaoNoticiasEmAndamento =
    true;

  try{

    console.log(
      "🔄 AfricanMundo: verificando novas notícias..."
    );

    await carregarNoticias();

  }catch(e){

    console.warn(
      "⚠️ Atualização automática:",
      e
    );

  }finally{

    atualizacaoNoticiasEmAndamento =
      false;

  }

}


/* ==========================================
ATUALIZAR A CADA 15 MINUTOS
========================================== */

setInterval(
  function(){

    atualizarNoticiasAutomaticamente();

  },
  15 * 60 * 1000
);


/* ==========================================
QUANDO O UTILIZADOR VOLTA AO SITE
========================================== */

document.addEventListener(
  "visibilitychange",
  function(){

    if(
      !document.hidden
    ){

      /*
      Pequeno atraso para evitar
      chamadas imediatas repetidas.
      */

      setTimeout(
        function(){

          atualizarNoticiasAutomaticamente();

        },
        1000
      );

    }

  }
);


/* ==========================================
RECARREGAR NOTÍCIAS SEM RECARREGAR
A PÁGINA
========================================== */

window.atualizarNoticias =
  atualizarNoticiasAutomaticamente;


/* ==========================================
TRATAMENTO GLOBAL DE PROMESSAS
========================================== */

window.addEventListener(
  "unhandledrejection",
  function(e){

    console.warn(
      "⚠️ AfricanMundo:",
      e.reason
    );

  }
);


/* ==========================================
TRATAMENTO GLOBAL DE ERROS
========================================== */

window.addEventListener(
  "error",
  function(e){

    console.warn(
      "⚠️ AfricanMundo — erro controlado:",
      e.message
    );

  }
);


/* ==========================================
MENSAGEM DE ARRANQUE
========================================== */

console.log(
  "🌍 AfricanMundo — sistema profissional carregado."
);

console.log(
  "📰 Notícias:",
  Array.isArray(window.__noticias)
    ? window.__noticias.length
    : 0
);

console.log(
  "📱 PWA:",
  "serviceWorker" in navigator
    ? "suportado"
    : "não suportado"
);

console.log(
  "🔔 Push:",
  "PushManager" in window
    ? "suportado"
    : "não suportado"
);
