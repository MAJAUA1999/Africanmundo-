/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 1/3
   CONFIGURAÇÃO + NOTÍCIAS + CATEGORIAS
========================================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const VAPID_PUBLIC_KEY =
  "BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db = null;

window.__noticias = [];

let atualizacaoEmAndamento = false;


/* =========================================================
   SUPABASE
========================================================= */

function iniciarSupabase(){

  if(!window.supabase){

    console.error(
      "❌ Supabase não carregou."
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
      "❌ Erro ao iniciar Supabase:",
      e
    );

    return false;
  }
}


/* =========================================================
   SEGURANÇA / TEXTO
========================================================= */

function esc(valor){

  return String(valor ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


function normalizarTexto(valor){

  return String(valor ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"");
}


/* =========================================================
   DADOS DAS NOTÍCIAS
========================================================= */

function obterTitulo(n){

  return (
    n?.titulo ||
    n?.title ||
    n?.nome ||
    "Sem título"
  );
}


function obterTexto(n){

  return (
    n?.texto ||
    n?.description ||
    n?.descricao ||
    n?.resumo ||
    ""
  );
}


function obterImagem(n){

  const imagem =
    n?.imagem ||
    n?.image ||
    n?.urlToImage ||
    "";

  if(!imagem){

    return "";
  }

  const valor =
    String(imagem).trim();

  if(
    valor === "None" ||
    valor === "null" ||
    valor === "undefined"
  ){

    return "";
  }

  return valor;
}


function formatarData(valor){

  if(!valor){

    return "";
  }

  const data =
    new Date(valor);

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
}


/* =========================================================
   ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(n){

  if(!n?.id){

    return;
  }

  abrirNoticiaPorId(
    n.id
  );
}


function abrirNoticiaPorId(id){

  if(id == null){

    return;
  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);
}


/* =========================================================
   CRIAR CARD
========================================================= */

function criarCard(n){

  const article =
    document.createElement("article");

  article.className =
    "compact-card";

  article.style.cursor="pointer";

  article.setAttribute("role","button");
  article.setAttribute("tabindex","0");

  const titulo =
    esc(obterTitulo(n));

  const categoria =
    esc(n?.categoria || "Notícias");

  const imagem =
    obterImagem(n);

  let media="";

  if(imagem){

    media=`
      <img
        src="${esc(imagem)}"
        alt="${titulo}"
        loading="lazy"
        decoding="async"
        onerror="this.style.display='none'"
      >
    `;

  }else{

    const cat =
      normalizarTexto(
        n?.subcategoria ||
        n?.categoria ||
        ""
      );

    let fallback =
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900";

    if(
      cat.includes("futebol") ||
      cat.includes("football")
    ){

      fallback =
        "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900";

    }else if(
      cat.includes("desporto") ||
      cat.includes("esporte")
    ){

      fallback =
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900";

    }else if(
      cat.includes("economia") ||
      cat.includes("negocio")
    ){

      fallback =
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=900";

    }else if(
      cat.includes("cultura") ||
      cat.includes("entretenimento")
    ){

      fallback =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900";

    }else if(
      cat.includes("saude")
    ){

      fallback =
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900";

    }else if(
      cat.includes("politica")
    ){

      fallback =
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900";

    }else if(
      cat.includes("mocambique")
    ){

      fallback =
        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900";

    }else if(
      cat.includes("africa")
    ){

      fallback =
        "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=900";
    }

    media=`
      <img
        src="${fallback}"
        alt="${categoria}"
        loading="lazy"
        decoding="async"
      >
    `;
  }

  article.innerHTML=`

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

  article.addEventListener(
    "click",
    function(e){

      if(e.target.closest("a,button")){
        return;
      }

      abrirNoticia(n);
    }
  );

  article.addEventListener(
    "keydown",
    function(e){

      if(
        e.key==="Enter" ||
        e.key===" "
      ){

        e.preventDefault();

        abrirNoticia(n);
      }
    }
  );

  return article;
}

/* =========================================================
   RENDERIZAR LISTA
========================================================= */

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
        Ainda não existem notícias nesta categoria.
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


/* =========================================================
   DESTAQUE
========================================================= */

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

  const categoria =
    esc(
      n?.categoria ||
      "Notícias"
    );

  const imagem =
    obterImagem(n);

  const data =
    formatarData(
      n?.data
    );


  area.innerHTML = `

    <article
      class="featured"
      id="noticiaDestaque"
      role="button"
      tabindex="0"
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

        ${
          data
          ?
          `
          <div class="featured-date">
            ${esc(data)}
          </div>
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


  const destaque =
    document.getElementById(
      "noticiaDestaque"
    );


  if(destaque){

    destaque.addEventListener(
      "click",
      function(){

        abrirNoticia(n);

      }
    );


    destaque.addEventListener(
      "keydown",
      function(e){

        if(
          e.key === "Enter" ||
          e.key === " "
        ){

          e.preventDefault();

          abrirNoticia(n);
        }

      }
    );
  }
}


/* =========================================================
   ERRO
========================================================= */

function mostrarErro(mensagem){

  const area =
    document.getElementById(
      "destaque"
    );

  if(!area){

    return;
  }


  area.innerHTML = `

    <div class="featured">

      <div class="featured-content">

        <div class="featured-title">
          ${esc(mensagem)}
        </div>

      </div>

    </div>

  `;
}


/* =========================================================
   TEXTO COMPLETO
========================================================= */

function textoCompleto(n){

  return normalizarTexto(

    [
      n?.titulo,
      n?.texto,
      n?.categoria,
      n?.fonte
    ]

    .filter(Boolean)

    .join(" ")

  );
}


/* =========================================================
   MOÇAMBIQUE
========================================================= */
function ehMocambique(n){

  const categoria =
    normalizarTexto(n?.categoria || "");

  const sub =
    normalizarTexto(n?.subcategoria || "");

  if(categoria === "mocambique") return true;

  if(
    categoria === "africa" ||
    categoria === "mundo"
  ){
    return false;
  }

  return sub === "mocambique";
}


/* =========================================================
   ÁFRICA
========================================================= */

function ehAfrica(n){

  const categoria =
    normalizarTexto(n?.categoria || "");

  if(categoria === "africa") return true;

  if(
    categoria === "mocambique" ||
    categoria === "mundo"
  ){
    return false;
  }

  return false;
}


/* =========================================================
   FUTEBOL
========================================================= */

function ehFutebol(n){

  const sub =
    normalizarTexto(n?.subcategoria || "");

  const categoria =
    normalizarTexto(n?.categoria || "");

  if(sub === "futebol") return true;

  if(categoria === "futebol") return true;

  return false;
}


/* =========================================================
   DESPORTO
========================================================= */

function ehDesporto(n){

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );

  if(sub === "desporto"){
    return true;
  }

  if(categoria === "desporto"){
    return true;
  }

  return false;
}


/* =========================================================
   NEGÓCIOS
========================================================= */

function ehNegocios(n){

  const sub =
    normalizarTexto(n?.subcategoria || "");

  const categoria =
    normalizarTexto(n?.categoria || "");

  if(
    sub === "economia" ||
    sub === "negocios" ||
    sub === "oportunidades"
  ){
    return true;
  }

  if(
    categoria === "negocios"
  ){
    return true;
  }

  return false;
}


/* =========================================================
   ENTRETENIMENTO
========================================================= */

function ehEntretenimento(n){

  const sub =
    normalizarTexto(n?.subcategoria || "");

  const categoria =
    normalizarTexto(n?.categoria || "");

  if(
    sub === "cultura" ||
    sub === "entretenimento"
  ){
    return true;
  }

  if(
    categoria === "entretenimento"
  ){
    return true;
  }

  return false;
}

/* =========================================================
   CARREGAR NOTÍCIAS
========================================================= */
async function carregarNoticias(){

  console.log(
    "🌍 AfricanMundo: carregando notícias..."
  );


  if(!db){

    const iniciou =
      iniciarSupabase();

    if(!iniciou){

      mostrarErro(
        "Não foi possível ligar ao servidor de notícias."
      );

      return;
    }
  }


  try{

    const resultado =
      await db
        .from("noticias")
        .select(`
          id,
          titulo,
          texto,
          imagem,
          categoria,
          subcategoria,
          data,
          fonte,
          url_original
        `)
        .order(
          "id",
          {
            ascending:false
          }
        )
        .limit(1000);


    const data =
      resultado.data;

    const error =
      resultado.error;


    if(error){

      console.error(
        "❌ Erro ao carregar notícias:",
        error
      );

      mostrarErro(
        "Não foi possível carregar as notícias."
      );

      return;
    }


    if(
      !Array.isArray(data)
    ){

      mostrarErro(
        "Nenhuma notícia encontrada."
      );

      return;
    }


    const mapa =
      new Map();


    data.forEach(
      function(n){

        if(
          n &&
          n.id != null
        ){

          mapa.set(
            String(n.id),
            n
          );

        }

      }
    );


    window.__noticias =
      Array.from(
        mapa.values()
      );


    console.log(
      "📰 Notícias carregadas:",
      window.__noticias.length
    );


    renderizarPagina();


  }catch(e){

    console.error(
      "❌ Falha geral:",
      e
    );

    mostrarErro(
      "Erro ao carregar as notícias."
    );

  }
}


/* =========================================================
   RENDERIZAR PÁGINA INICIAL
========================================================= */

function renderizarPagina(){

  const noticias =
    Array.isArray(
      window.__noticias
    )
    ?
    window.__noticias
    :
    [];


  if(!noticias.length){

    mostrarErro(
      "Ainda não existem notícias."
    );

    return;
  }


  /* ==========================================
     📰 ORDENAR DAS MAIS NOVAS PARA AS MAIS ANTIGAS
  ========================================== */

  const recentes =
    [...noticias].sort(
      function(a,b){

        const dataA =
          new Date(
            a?.data || 0
          ).getTime();

        const dataB =
          new Date(
            b?.data || 0
          ).getTime();

        if(
          dataB !== dataA
        ){

          return dataB - dataA;

        }

        return (
          Number(b?.id || 0) -
          Number(a?.id || 0)
        );

      }
    );


  /* ==========================================
     ⭐ DESTAQUE
  ========================================== */

  const quantidadeDestaques =
    Math.min(
      5,
      recentes.length
    );


  const indiceDestaque =
    Math.floor(
      Math.random() *
      quantidadeDestaques
    );


  renderizarDestaque(
    recentes[
      indiceDestaque
    ]
  );


  /* ==========================================
     📰 ÚLTIMAS NOTÍCIAS
  ========================================== */

  renderizarLista(
    "ultimas",
    recentes
  );


  /* ==========================================
     ⚽ FUTEBOL
  ========================================== */

  const futebol =
    recentes.filter(
      ehFutebol
    );

  renderizarLista(
    "futebol",
    futebol
  );


  /* ==========================================
     🇲🇿 MOÇAMBIQUE
  ========================================== */

  const mocambique =
    recentes.filter(
      ehMocambique
    );

  renderizarLista(
    "mocambique",
    mocambique
  );


  /* ==========================================
     🌍 ÁFRICA
  ========================================== */

  const africa =
    recentes.filter(
      ehAfrica
    );

  renderizarLista(
    "africa",
    africa
  );


  /* ==========================================
     💼 NEGÓCIOS
  ========================================== */

  const negocios =
    recentes.filter(
      ehNegocios
    );

  renderizarLista(
    "negocios",
    negocios
  );


  /* ==========================================
     🎬 ENTRETENIMENTO
  ========================================== */

  const entretenimento =
    recentes.filter(
      ehEntretenimento
    );

  renderizarLista(
    "entretenimento",
    entretenimento
  );


  /* ==========================================
     🏆 DESPORTO
  ========================================== */

  const desporto =
  recentes.filter(
    ehDesporto
  );


  renderizarLista(
    "desporto",
    desporto
  );


  /* ==========================================
     📊 DEBUG
  ========================================== */

  console.log(
    "📊 Categorias recentes:",
    {
      total:recentes.length,
      destaque:recentes[
        indiceDestaque
      ]?.id,

      futebol:futebol.length,
      mocambique:mocambique.length,
      africa:africa.length,
      negocios:negocios.length,
      entretenimento:entretenimento.length,
      desporto:desporto.length
    }
  );

}

/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 2/3
   PESQUISA + FAVORITOS + MODAIS + TEMA + REDES SOCIAIS
========================================================= */


/* =========================================================
   PESQUISA
========================================================= */

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


  if(
    !input ||
    !resultados
  ){

    return;
  }


  const termo =
    normalizarTexto(
      input.value
    );


  if(!termo){

    resultados.innerHTML = "";

    resultados.style.display =
      "none";

    return;
  }


  const encontrados =
    window.__noticias.filter(
      function(n){

        const conteudo =
          normalizarTexto(

            [
              n?.titulo,
              n?.texto,
              n?.categoria,
              n?.fonte
            ]

            .filter(Boolean)

            .join(" ")

          );


        return conteudo.includes(
          termo
        );
      }
    );


  resultados.innerHTML = "";


  if(
    !encontrados.length
  ){

    resultados.innerHTML = `

      <div class="sem-noticias">

        Nenhuma notícia encontrada.

      </div>

    `;

    resultados.style.display =
      "block";

    return;
  }


  encontrados
    .slice(0,8)
    .forEach(
      function(n){

        resultados.appendChild(
          criarCard(n)
        );

      }
    );


  resultados.style.display =
    "block";
}


function limparPesquisa(){

  const input =
    document.getElementById(
      "searchInput"
    );

  const resultados =
    document.getElementById(
      "searchResults"
    );


  if(input){

    input.value = "";
  }


  if(resultados){

    resultados.innerHTML = "";

    resultados.style.display =
      "none";
  }
}


/* =========================================================
   FAVORITOS
========================================================= */

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


function guardarFavoritos(lista){

  try{

    localStorage.setItem(
      "africanmundo_favoritos",
      JSON.stringify(lista)
    );

  }catch(e){

    console.warn(
      "Não foi possível guardar favoritos."
    );
  }
}


function adicionarFavorito(n){

  if(
    !n ||
    n.id == null
  ){

    return;
  }


  const favoritos =
    obterFavoritos();


  const id =
    String(n.id);


  if(
    favoritos.some(
      x =>
        String(x.id) === id
    )
  ){

    abrirModal(
      "Favoritos",
      "Esta notícia já está nos seus favoritos."
    );

    return;
  }


  favoritos.push({

    id:n.id,

    titulo:
      obterTitulo(n),

    imagem:
      obterImagem(n),

    categoria:
      n.categoria || "",

    data:
      n.data || ""

  });


  guardarFavoritos(
    favoritos
  );


  abrirModal(
    "Favoritos",
    "⭐ Notícia guardada nos favoritos."
  );
}


function mostrarFavoritos(){

  const favoritos =
    obterFavoritos();


  if(
    !favoritos.length
  ){

    abrirModal(
      "⭐ Favoritos",
      `
        <p>
          Ainda não existem notícias
          guardadas nos favoritos.
        </p>
      `
    );

    return;
  }


  const html =
    favoritos
      .map(
        function(n){

          return `

            <div
              class="compact-card"
              style="margin-bottom:10px"
              onclick="abrirNoticiaPorId(${Number(n.id)})"
            >

              <div class="compact-body">

                <div class="compact-cat">
                  ${esc(
                    n.categoria ||
                    "Notícias"
                  )}
                </div>

                <div class="compact-title">
                  ${esc(n.titulo)}
                </div>

              </div>

            </div>

          `;

        }
      )
      .join("");


  abrirModal(
    "⭐ Favoritos",
    html
  );
}


/* =========================================================
   MODAL
========================================================= */
function abrirModal(titulo,conteudo){

  fecharModal();

  const modal =
    document.createElement("div");

  modal.id="amModal";

  Object.assign(modal.style,{
    position:"fixed",
    inset:"0",
    zIndex:"999999",
    pointerEvents:"none"
  });

  modal.innerHTML=`

    <div
      id="amBack"
      style="
        position:fixed;
        inset:0;
        background:transparent;
        pointer-events:auto;
      "
    ></div>

    <div
      id="amDropdown"
      style="
        position:fixed;
        width:240px;
        max-width:calc(100vw - 20px);
        max-height:35vh;
        overflow-y:auto;
        background:var(--card,#fff);
        color:var(--txt,#172026);
        border:1px solid var(--border,#e2e7ea);
        border-radius:12px;
        box-shadow:0 8px 28px rgba(0,0,0,.16);
        pointer-events:auto;
        animation:amDropdown .18s ease-out;
      "
    >

      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:8px 10px;
          border-bottom:1px solid var(--border,#e2e7ea);
          font-size:13px;
          font-weight:800;
        "
      >

        <strong>${esc(titulo)}</strong>

        <button
          id="amClose"
          type="button"
          style="
            border:0;
            background:var(--bg,#f5f7f8);
            color:var(--txt,#172026);
            width:27px;
            height:27px;
            border-radius:7px;
            font-size:13px;
          "
        >
          ✕
        </button>

      </div>

      <div
        style="
          padding:8px 10px;
          font-size:12px;
          line-height:1.4;
        "
      >
        ${conteudo}
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const painel =
    document.getElementById("amDropdown");

  const fechar =
    document.getElementById("amClose");

  const fundo =
    document.getElementById("amBack");

  /*
    Descobre qual botão abriu o painel
  */

  const botoes = [
    "notificationBtn",
    "toolsBtn",
    "userBtn",
    "colorBtn"
  ];

  let origem=null;

  botoes.some(function(id){

    const botao =
      document.getElementById(id);

    if(
      botao &&
      document.activeElement === botao
    ){

      origem=botao;

      return true;
    }

    return false;
  });

  /*
    Posiciona o painel junto ao botão
  */

  if(painel && origem){

    const rect =
      origem.getBoundingClientRect();

    let esquerda =
      rect.left;

    const largura =
      280;

    if(
      esquerda + largura >
      window.innerWidth - 10
    ){

      esquerda =
        window.innerWidth -
        largura -
        10;
    }

    if(esquerda < 10){
      esquerda=10;
    }

    painel.style.top =
      (rect.bottom + 8) + "px";

    painel.style.left =
      esquerda + "px";
  }

  if(fechar){
    fechar.onclick=fecharModal;
  }

  if(fundo){
    fundo.onclick=fecharModal;
  }
}


function fecharModal(){

  const modal =
    document.getElementById("amModal");

  if(modal){
    modal.remove();
  }
         }

/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function abrirNotificacoes(){

  abrirModal(

    "🔔 Notificações",

    `

      <div style="text-align:center">

        <div style="font-size:42px">
          🔔
        </div>

        <h3>
          Notificações AfricanMundo
        </h3>

        <p>
          Ative as notificações para
          receber novidades do AfricanMundo.
        </p>

        <button
          id="ativarNotificacoesBtn"
          class="am-action"
        >
          🔔 Ativar notificações
        </button>

      </div>

    `
  );


  const btn =
    document.getElementById(
      "ativarNotificacoesBtn"
    );


  if(btn){

    btn.onclick =
      ativarNotificacoes;
  }
}


async function ativarNotificacoes(){

  if(
    !("Notification" in window)
  ){

    abrirModal(
      "Notificações",
      "Este navegador não suporta notificações."
    );

    return;
  }


  try{

    const permissao =
      await Notification.requestPermission();


    if(
      permissao === "granted"
    ){

      abrirModal(
        "Notificações",
        "✅ Notificações ativadas com sucesso."
      );

      tentarPush();

    }else{

      abrirModal(
        "Notificações",
        "As notificações não foram autorizadas."
      );
    }

  }catch(e){

    console.error(
      "Erro nas notificações:",
      e
    );
  }
}


async function tentarPush(){

  if(
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ){

    return;
  }


  try{

    const registration =
      await navigator.serviceWorker.ready;


    let subscription =
      await registration.pushManager
        .getSubscription();


    if(!subscription){

      subscription =
        await registration.pushManager.subscribe({

          userVisibleOnly:true,

          applicationServerKey:
            urlBase64ToUint8Array(
              VAPID_PUBLIC_KEY
            )

        });
    }


    console.log(
      "🔔 Push ativado:",
      subscription
    );


  }catch(e){

    console.warn(
      "Push não disponível:",
      e
    );
  }
}


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
    .replace(/-/g,"+")
    .replace(/_/g,"/");


  const rawData =
    window.atob(
      base64
    );


  return Uint8Array.from(
    [...rawData].map(
      char =>
        char.charCodeAt(0)
    )
  );
}


/* =========================================================
   FERRAMENTAS
========================================================= */

function abrirFerramentas(){

  abrirModal(

    "🛠️ Ferramentas",

    `

      <div class="am-tools">

        <button
          class="am-action"
          onclick="compartilharSite()"
        >
          📤 Partilhar AfricanMundo
        </button>


        <button
          class="am-action"
          onclick="copiarLinkSite()"
        >
          🔗 Copiar link do site
        </button>


        <button
          class="am-action"
          onclick="mostrarFavoritos()"
        >
          ⭐ Meus favoritos
        </button>


        <button
          class="am-action"
          onclick="abrirCores()"
        >
          🎨 Cor do site
        </button>

      </div>

    `
  );
}


/* =========================================================
   UTILIZADOR
========================================================= */

function abrirUsuario(){

  abrirModal(

    "👤 Eu",

    `

      <div style="text-align:center">

        <div style="font-size:50px">
          👤
        </div>

        <h3>
          Área do leitor
        </h3>

        <p>
          Guarde notícias, altere o
          visual e partilhe conteúdos
          do AfricanMundo.
        </p>

        <button
          class="am-action"
          onclick="mostrarFavoritos()"
        >
          ⭐ Meus favoritos
        </button>

      </div>

    `
  );
}


/* =========================================================
   TEMA
========================================================= */

function ativarTemaClaro(){

  document.body.classList.remove(
    "dark"
  );


  localStorage.setItem(
    "africanmundo_tema",
    "light"
  );


  fecharModal();
}


function ativarTemaEscuro(){

  document.body.classList.add(
    "dark"
  );


  localStorage.setItem(
    "africanmundo_tema",
    "dark"
  );


  fecharModal();
}


function alternarTema(){

  const escuro =
    document.body.classList.toggle(
      "dark"
    );


  localStorage.setItem(
    "africanmundo_tema",
    escuro
    ?
    "dark"
    :
    "light"
  );
}


function restaurarTema(){

  const tema =
    localStorage.getItem(
      "africanmundo_tema"
    );


  if(
    tema === "dark"
  ){

    document.body.classList.add(
      "dark"
    );

  }else{

    document.body.classList.remove(
      "dark"
    );
  }
}


/* =========================================================
   CORES
========================================================= */

function abrirCores(){

  abrirModal(

    "🎨 Cor do AfricanMundo",

    `

      <div>

        <button
          class="am-color"
          onclick="definirCor('#168a45')"
        >
          🟢 Verde
        </button>


        <button
          class="am-color"
          onclick="definirCor('#1565c0')"
        >
          🔵 Azul
        </button>


        <button
          class="am-color"
          onclick="definirCor('#c62828')"
        >
          🔴 Vermelho
        </button>


        <button
          class="am-color"
          onclick="definirCor('#7b1fa2')"
        >
          🟣 Roxo
        </button>


        <button
          class="am-color"
          onclick="definirCor('#ef6c00')"
        >
          🟠 Laranja
        </button>

      </div>

    `
  );
}


function definirCor(cor){

  document.documentElement
    .style
    .setProperty(
      "--p",
      cor
    );


  localStorage.setItem(
    "africanmundo_cor",
    cor
  );


  fecharModal();
}


function restaurarCor(){

  const cor =
    localStorage.getItem(
      "africanmundo_cor"
    );


  if(cor){

    document.documentElement
      .style
      .setProperty(
        "--p",
        cor
      );
  }
}


/* =========================================================
   🌐 REDES SOCIAIS
========================================================= */

const REDES_SOCIAIS = {

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


/* =========================================================
   ABRIR REDE SOCIAL
========================================================= */

function abrirRede(rede){

  const nome =
    normalizarTexto(
      rede
    );


  const url =
    REDES_SOCIAIS[nome];


  if(!url){

    console.warn(
      "⚠️ Rede social desconhecida:",
      rede
    );

    return false;
  }


  try{

    window.location.assign(
      url
    );

    return true;

  }catch(e){

    console.error(
      "❌ Erro ao abrir rede:",
      e
    );

    return false;
  }
}


/* =========================================================
   COMPATIBILIDADE ANTIGA
========================================================= */

function abrirRed(rede){

  return abrirRede(
    rede
  );
}


/* =========================================================
   PARTILHAR SITE
========================================================= */

async function compartilharSite(){

  const dados = {

    title:
      "AfricanMundo",

    text:
      "A informação que liga África ao mundo",

    url:
      window.location.href

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


    if(
      navigator.clipboard
    ){

      await navigator.clipboard.writeText(
        window.location.href
      );


      abrirModal(
        "Partilhar",
        "🔗 Link copiado com sucesso."
      );

      return;
    }


    prompt(
      "Copie o link:",
      window.location.href
    );


  }catch(e){

    console.log(
      "Partilha cancelada."
    );
  }
}


async function copiarLinkSite(){

  try{

    if(
      navigator.clipboard
    ){

      await navigator.clipboard.writeText(
        window.location.href
      );


      abrirModal(
        "🔗 Link",
        "Link do AfricanMundo copiado."
      );

      return;
    }


    prompt(
      "Copie o link:",
      window.location.href
    );


  }catch(e){

    prompt(
      "Copie o link:",
      window.location.href
    );
  }
}


/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 3/3
   INICIALIZAÇÃO + BOTÕES + CARREGAMENTO
========================================================= */


/* =========================================================
   MARCAR MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

  const pagina =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  document
    .querySelectorAll(
      "nav a, .bottom-menu a, .menu a"
    )
    .forEach(
      function(link){

        const href =
          (
            link.getAttribute("href") ||
            ""
          )
          .split("?")[0]
          .split("#")[0]
          .split("/")
          .pop()
          .toLowerCase();


        if(
          href &&
          href === pagina
        ){

          link.classList.add(
            "active"
          );

        }

      }
    );
}


/* =========================================================
   INICIAR BOTÕES
========================================================= */

function iniciarBotoes(){

  /* -----------------------------------------
     NOTIFICAÇÕES
  ----------------------------------------- */

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );


  if(notificationBtn){

    notificationBtn.onclick =
      function(e){

        if(e){

          e.preventDefault();

          e.stopPropagation();

        }

        abrirNotificacoes();

      };

  }


  /* -----------------------------------------
     FERRAMENTAS
  ----------------------------------------- */

  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );


  if(toolsBtn){

    toolsBtn.onclick =
      function(e){

        if(e){

          e.preventDefault();

          e.stopPropagation();

        }

        abrirFerramentas();

      };

  }


  /* -----------------------------------------
     UTILIZADOR
  ----------------------------------------- */

  const userBtn =
    document.getElementById(
      "userBtn"
    );


  if(userBtn){

    userBtn.onclick =
      function(e){

        if(e){

          e.preventDefault();

          e.stopPropagation();

        }

        abrirUsuario();

      };

  }


  /* -----------------------------------------
     TEMA
  ----------------------------------------- */

  const themeBtn =
    document.getElementById(
      "themeBtn"
    );


  if(themeBtn){

    themeBtn.onclick =
      function(e){

        if(e){

          e.preventDefault();

          e.stopPropagation();

        }

        alternarTema();

      };

  }


  /* -----------------------------------------
     COR
  ----------------------------------------- */

  const colorBtn =
    document.getElementById(
      "colorBtn"
    );


  if(colorBtn){

    colorBtn.onclick =
      function(e){

        if(e){

          e.preventDefault();

          e.stopPropagation();

        }

        abrirCores();

      };

  }


  /* -----------------------------------------
     PESQUISA
  ----------------------------------------- */

  const searchForm =
    document.querySelector(
      "#searchForm"
    );


  if(searchForm){

    searchForm.addEventListener(
      "submit",
      pesquisar
    );

  }


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if(searchInput){

    searchInput.addEventListener(
      "input",
      function(){

        if(
          !this.value.trim()
        ){

          limparPesquisa();

        }else{

          pesquisar();

        }

      }
    );

  }


  /* -----------------------------------------
     BOTÃO LIMPAR PESQUISA
  ----------------------------------------- */

  const clearSearch =
    document.getElementById(
      "clearSearch"
    );


  if(clearSearch){

    clearSearch.onclick =
      function(e){

        if(e){

          e.preventDefault();

        }

        limparPesquisa();

      };

  }


  /* -----------------------------------------
     REDES SOCIAIS
  ----------------------------------------- */

  document
    .querySelectorAll(
      "[data-rede]"
    )
    .forEach(
      function(botao){

        botao.addEventListener(
          "click",
          function(e){

            e.preventDefault();

            e.stopPropagation();


            const rede =
              this.getAttribute(
                "data-rede"
              );


            abrirRede(
              rede
            );

          }
        );

      }
    );


  /* -----------------------------------------
     LINKS COM CLASS REDE-SOCIAL
  ----------------------------------------- */

  document
    .querySelectorAll(
      ".rede-social"
    )
    .forEach(
      function(botao){

        if(
          botao.dataset.rede
        ){

          return;

        }


        botao.addEventListener(
          "click",
          function(e){

            const rede =
              this.getAttribute(
                "data-social"
              ) ||
              this.getAttribute(
                "data-network"
              );


            if(rede){

              e.preventDefault();

              e.stopPropagation();

              abrirRede(
                rede
              );

            }

          }
        );

      }
    );

}

/* =========================================================
   📢 ANÚNCIOS ATIVOS
========================================================= */

async function carregarAnunciosAtivos(){

  const secao =
    document.getElementById("anunciosAtivosSection");

  const area =
    document.getElementById("anunciosAtivos");

  if(!secao || !area) return;

  if(!db){
    if(!iniciarSupabase()) return;
  }

  try{

    const hoje =
      new Date()
        .toISOString()
        .slice(0,10);

    const resultado =
      await db
        .from("anuncios")
        .select(
          "id,empresa,video,imagem,mensagem,link,ativo,data_inicio,data_fim"
        )
        .eq("ativo",true)
        .lte("data_inicio",hoje)
        .gte("data_fim",hoje)
        .order("id",{ascending:false});

    if(resultado.error){
      console.error(
        "❌ ERRO ANÚNCIOS:",
        resultado.error
      );
      secao.style.display="none";
      return;
    }

    const anuncios =
      Array.isArray(resultado.data)
      ? resultado.data
      : [];

    if(!anuncios.length){
      secao.style.display="none";
      return;
    }

    area.innerHTML="";

    anuncios
      .slice(0,4)
      .forEach(function(anuncio){

        const card =
          document.createElement("div");

        card.className="anuncio-card";

        const empresa =
          esc(anuncio.empresa || "Publicidade");

        const texto =
          esc(anuncio.mensagem || "");

        const video =
          anuncio.video || "";

        const imagem =
          anuncio.imagem || "";

        const link =
          anuncio.link || "";

        let media="";

        if(video){

          media=`
            <video
              src="${esc(video)}"
              autoplay
              muted
              loop
              playsinline
              preload="auto"
              ${imagem ? `poster="${esc(imagem)}"` : ""}
            ></video>
          `;

        }else if(imagem){

          media=`
            <img
              src="${esc(imagem)}"
              alt="${empresa}"
              loading="lazy"
            >
          `;

        }else{

          media=`
            <div style="
              width:100%;
              height:100%;
              display:flex;
              align-items:center;
              justify-content:center;
              font-size:24px;
            ">
              📢
            </div>
          `;

        }

        card.innerHTML=`

          <div class="anuncio-media">
            ${media}
          </div>

          <div class="anuncio-titulo">
            📢 ${empresa}
          </div>

          ${
            texto
            ? `
              <div class="anuncio-texto">
                ${texto}
              </div>
            `
            : ""
          }

          ${
            link
            ? `
              <a
                class="anuncio-botao"
                href="${esc(link)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver anúncio →
              </a>
            `
            : ""
          }

        `;

        area.appendChild(card);

      });

    secao.style.display="block";

    console.log(
      "📢 Anúncios exibidos:",
      anuncios.length
    );

  }catch(e){

    console.error(
      "❌ Falha nos anúncios:",
      e
    );

    secao.style.display="none";
  }

}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function(){

    try{

      restaurarCor();

      restaurarTema();

      iniciarBotoes();

      marcarMenuAtivo();

      await iniciarSupabase();

      await carregarNoticias();

       console.log("📢 INICIANDO ANÚNCIOS...");
await carregarAnunciosAtivos();
console.log("📢 FIM DOS ANÚNCIOS...");

    }catch(e){

      console.error(
        "❌ Erro ao iniciar AfricanMundo:",
        e
      );


      mostrarErro(
        "Não foi possível carregar as notícias. Tente novamente."
      );

    }

  }
);


/* =========================================================
   EXPOR FUNÇÕES PARA O HTML
========================================================= */

window.abrirRede =
  abrirRede;

window.abrirRed =
  abrirRed;

window.abrirNoticia =
  abrirNoticia;

window.abrirNoticiaPorId =
  abrirNoticiaPorId;

window.pesquisar =
  pesquisar;

window.limparPesquisa =
  limparPesquisa;

window.abrirNotificacoes =
  abrirNotificacoes;

window.abrirFerramentas =
  abrirFerramentas;

window.abrirUsuario =
  abrirUsuario;

window.alternarTema =
  alternarTema;

window.abrirCores =
  abrirCores;

window.definirCor =
  definirCor;

window.mostrarFavoritos =
  mostrarFavoritos;

window.adicionarFavorito =
  adicionarFavorito;

window.compartilharSite =
  compartilharSite;

window.copiarLinkSite =
  copiarLinkSite;


/* =========================================================
   FIM DO APP.JS
========================================================= */
