/* ==========================================
🌍 AFRICANMUNDO — APP.JS
PARTE 1/4
ESTRUTURA PRINCIPAL
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
    console.error("Supabase não carregou.");
    return false;
  }

  try{

    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    return true;

  }catch(e){

    console.error("Erro Supabase:",e);
    return false;

  }

}


/* ==========================================
SEGURANÇA HTML
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
DADOS DA NOTÍCIA
========================================== */

function obterTitulo(n){

  return n?.titulo ||
         n?.title ||
         n?.nome ||
         "Sem título";

}


function obterTexto(n){

  return n?.texto ||
         n?.description ||
         n?.descricao ||
         n?.resumo ||
         "";

}


function obterImagem(n){

  const img =
    n?.imagem ||
    n?.image ||
    n?.urlToImage ||
    "";

  if(!img) return "";

  const valor = String(img).trim();

  if(
    valor === "None" ||
    valor === "null" ||
    valor === "undefined"
  ){

    return "";

  }

  return valor;

}


/* ==========================================
DATA
========================================== */

function formatarData(v){

  if(!v) return "";

  const d = new Date(v);

  if(Number.isNaN(d.getTime())){
    return "";
  }

  return d.toLocaleDateString(
    "pt-MZ",
    {
      day:"2-digit",
      month:"2-digit",
      year:"numeric"
    }
  );

}


/* ==========================================
ABRIR NOTÍCIA
========================================== */

function abrirNoticia(n){

  if(!n?.id) return;

  abrirNoticiaPorId(n.id);

}


function abrirNoticiaPorId(id){

  if(id == null) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}


/* ==========================================
CARD DE NOTÍCIA
========================================== */

function criarCard(n){

  const article =
    document.createElement("article");

  article.className =
    "compact-card";

  article.style.cursor =
    "pointer";

  article.addEventListener(
    "click",
    function(){

      abrirNoticia(n);

    }
  );

  const titulo =
    esc(obterTitulo(n));

  const categoria =
    esc(n?.categoria || "Notícias");

  const imagem =
    obterImagem(n);

  let media = "";

  if(imagem){

    media = `
      <img
        src="${esc(imagem)}"
        alt="${titulo}"
        loading="lazy"
        decoding="async"
        onerror="this.style.display='none'"
      >
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

function renderizarLista(id,lista){

  const area =
    document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";

  if(!Array.isArray(lista) || !lista.length){

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

  const categoria =
    esc(n?.categoria || "Notícias");

  const imagem =
    obterImagem(n);

  area.innerHTML = `

    <article
      class="featured"
      id="noticiaDestaque"
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

  const destaque =
    document.getElementById(
      "noticiaDestaque"
    );

  if(destaque){

    destaque.onclick =
      function(){

        abrirNoticia(n);

      };

  }

}


/* ==========================================
ERRO
========================================== */

function mostrarErro(mensagem){

  const area =
    document.getElementById("destaque");

  if(area){

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

}


/* ==========================================
FIM DA PARTE 1
========================================== */
/* ==========================================
🌍 AFRICANMUNDO — APP.JS
PARTE 2/4
NOTÍCIAS + CATEGORIAS + PESQUISA
========================================== */


/* ==========================================
TEXTO COMPLETO DA NOTÍCIA
========================================== */

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


/* ==========================================
VERIFICAR MOÇAMBIQUE
========================================== */

function ehMocambique(n){

  const texto = textoCompleto(n);

  const palavras = [

    "mocambique",
    "mozambique",
    "maputo",
    "matola",
    "beira",
    "nampula",
    "chimoio",
    "tete",
    "quelimane",
    "pemba",
    "nacala",
    "xai xai",
    "inhambane",
    "gaza",
    "sofala",
    "manica",
    "zambezia",
    "cabo delgado",
    "niassa",
    "maputo cidade",
    "provincia de maputo"

  ];

  return palavras.some(
    palavra => texto.includes(palavra)
  );

}


/* ==========================================
VERIFICAR ÁFRICA
========================================== */

function ehAfrica(n){

  const texto = textoCompleto(n);

  const palavras = [

    "africa",
    "africano",
    "africana",

    "angola",
    "argelia",
    "benim",
    "botswana",
    "burkina faso",
    "burundi",
    "camaroes",
    "cabo verde",
    "republica centro africana",
    "chade",
    "comores",
    "costa do marfim",
    "djibouti",
    "egipto",
    "egito",
    "eritrea",
    "eswatini",
    "etiopia",
    "gabon",
    "gambia",
    "gana",
    "guine",
    "guine bissau",
    "guine equatorial",
    "lesoto",
    "liberia",
    "libia",
    "madagascar",
    "malawi",
    "mali",
    "marrocos",
    "mauritania",
    "mauricio",
    "namibia",
    "nigeria",
    "quenia",
    "republica democratica do congo",
    "ruanda",
    "sao tome",
    "senegal",
    "seicheles",
    "serra leoa",
    "somalia",
    "africa do sul",
    "sudao",
    "sudao do sul",
    "tanzania",
    "togo",
    "tunisia",
    "uganda",
    "zambia",
    "zimbabwe"

  ];

  return palavras.some(
    palavra => texto.includes(palavra)
  );

}


/* ==========================================
FUTEBOL
========================================== */

function ehFutebol(n){

  const texto = textoCompleto(n);

  const palavras = [

    "futebol",
    "football",
    "soccer",
    "liga dos campeoes",
    "champions league",
    "premier league",
    "la liga",
    "serie a",
    "bundesliga",
    "mundial de clubes",
    "copa do mundo",
    "campeonato",
    "jogador",
    "jogadores",
    "treinador",
    "golo",
    "gol",
    "golos",
    "gols",
    "partida",
    "jogo",
    "clube",
    "clubes",
    "seleccao",
    "selecao",
    "transferencia",
    "transferencias"

  ];

  return palavras.some(
    palavra => texto.includes(palavra)
  );

}


/* ==========================================
DESPORTO
========================================== */

function ehDesporto(n){

  const texto = textoCompleto(n);

  const palavras = [

    "desporto",
    "esporte",
    "sports",
    "basquetebol",
    "basquete",
    "basketball",
    "atletismo",
    "tenis",
    "ténis",
    "voleibol",
    "volleyball",
    "boxe",
    "boxing",
    "natacao",
    "natação",
    "ciclismo",
    "corrida",
    "formula 1",
    "formula1",
    "motogp",
    "luta",
    "judo",
    "karate",
    "olimpiadas",
    "olimpicos",
    "medalha",
    "campeonato",
    "competicao",
    "competição"

  ];

  return palavras.some(
    palavra => texto.includes(
      normalizarTexto(palavra)
    )
  );

}


/* ==========================================
NEGÓCIOS
========================================== */

function ehNegocios(n){

  const texto = textoCompleto(n);

  const palavras = [

    "negocios",
    "negócios",
    "economia",
    "economico",
    "económico",
    "empresa",
    "empresas",
    "mercado",
    "mercados",
    "financas",
    "finanças",
    "banco",
    "bancos",
    "investimento",
    "investimentos",
    "empreendedor",
    "empreendedorismo",
    "comercio",
    "comércio",
    "industria",
    "indústria",
    "negocio",
    "business",
    "finance",
    "economy",
    "emprego",
    "empregos",
    "trabalho",
    "oportunidade",
    "oportunidades"

  ];

  return palavras.some(
    palavra => texto.includes(
      normalizarTexto(palavra)
    )
  );

}


/* ==========================================
ENTRETENIMENTO
========================================== */

function ehEntretenimento(n){

  const texto = textoCompleto(n);

  const palavras = [

    "entretenimento",
    "cultura",
    "celebridade",
    "celebridades",
    "musica",
    "música",
    "cantor",
    "cantora",
    "artista",
    "cinema",
    "filme",
    "filmes",
    "televisao",
    "televisão",
    "novela",
    "festival",
    "show",
    "concerto",
    "ator",
    "atriz",
    "famoso",
    "famosa",
    "lazer"

  ];

  return palavras.some(
    palavra => texto.includes(
      normalizarTexto(palavra)
    )
  );

}


/* ==========================================
CARREGAR NOTÍCIAS DO SUPABASE
========================================== */

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

    const { data, error } =

      await db
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
        .limit(500);


    if(error){

      console.error(
        "Erro ao carregar notícias:",
        error
      );

      mostrarErro(
        "Não foi possível carregar as notícias."
      );

      return;

    }


    if(!Array.isArray(data)){

      mostrarErro(
        "Nenhuma notícia encontrada."
      );

      return;

    }


    /* ======================================
    REMOVER APENAS DUPLICADOS
    NÃO APAGA NOTÍCIAS DO SUPABASE
    ====================================== */

    const mapa =
      new Map();

    data.forEach(function(n){

      if(n && n.id != null){

        mapa.set(
          String(n.id),
          n
        );

      }

    });


    window.__noticias =
      Array.from(mapa.values());


    console.log(
      "📰 Notícias carregadas:",
      window.__noticias.length
    );


    renderizarPagina();


  }catch(e){

    console.error(
      "Falha geral ao carregar notícias:",
      e
    );

    mostrarErro(
      "Erro ao carregar as notícias."
    );

  }

}


/* ==========================================
RENDERIZAR TODA A PÁGINA
========================================== */

function renderizarPagina(){

  const noticias =
    Array.isArray(window.__noticias)
    ? window.__noticias
    : [];


  if(!noticias.length){

    mostrarErro(
      "Ainda não existem notícias."
    );

    return;

  }


  /* ======================================
  DESTAQUE
  ====================================== */

  renderizarDestaque(
    noticias[0]
  );


  /* ======================================
  ÚLTIMAS
  ====================================== */

  renderizarLista(
    "ultimas",
    noticias
  );


  /* ======================================
  FUTEBOL
  ====================================== */

  const futebol =
    noticias.filter(ehFutebol);


  renderizarLista(
    "futebol",
    futebol
  );


  /* ======================================
  MOÇAMBIQUE
  ====================================== */

  const mocambique =
    noticias.filter(ehMocambique);


  renderizarLista(
    "mocambique",
    mocambique
  );


  /* ======================================
  ÁFRICA
  ====================================== */

  const africa =
    noticias.filter(ehAfrica);


  renderizarLista(
    "africa",
    africa
  );


  /* ======================================
  NEGÓCIOS
  ====================================== */

  const negocios =
    noticias.filter(ehNegocios);


  renderizarLista(
    "negocios",
    negocios
  );


  /* ======================================
  ENTRETENIMENTO
  ====================================== */

  const entretenimento =
    noticias.filter(ehEntretenimento);


  renderizarLista(
    "entretenimento",
    entretenimento
  );


  /* ======================================
  DESPORTO
  ====================================== */

  const desporto =
    noticias.filter(function(n){

      return ehDesporto(n) ||
             ehFutebol(n);

    });


  renderizarLista(
    "desporto",
    desporto
  );


  console.log(
    "📊 Categorias:",
    {
      futebol:futebol.length,
      mocambique:mocambique.length,
      africa:africa.length,
      negocios:negocios.length,
      entretenimento:entretenimento.length,
      desporto:desporto.length
    }
  );

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


  if(!encontrados.length){

    resultados.innerHTML = `
      <div class="sem-noticias">
        Nenhuma notícia encontrada.
      </div>
    `;

    resultados.style.display =
      "block";

    return;

  }


  /*
  IMPORTANTE:

  NÃO usar:
  .map(...).join("")

  porque criarCard() devolve
  um elemento HTML.

  Aqui adicionamos os elementos
  diretamente ao resultado.
  */

  encontrados
    .slice(0,8)
    .forEach(function(n){

      resultados.appendChild(
        criarCard(n)
      );

    });


  resultados.style.display =
    "block";

}


/* ==========================================
LIMPAR PESQUISA
========================================== */

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


/* ==========================================
FIM DA PARTE 2
========================================== */
 /* ==========================================
🌍 AFRICANMUNDO — APP.JS
PARTE 3/4
BOTÕES + MODAIS + REDES SOCIAIS
========================================== */


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


function guardarFavoritos(lista){

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(lista)
  );

}


function adicionarFavorito(n){

  if(!n || n.id == null) return;

  const favoritos =
    obterFavoritos();

  const id =
    String(n.id);

  if(
    favoritos.some(
      x => String(x.id) === id
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
    titulo:obterTitulo(n),
    imagem:obterImagem(n),
    categoria:n.categoria || "",
    data:n.data || ""

  });

  guardarFavoritos(
    favoritos
  );

  abrirModal(
    "Favoritos",
    "⭐ Notícia guardada nos favoritos."
  );

}


/* ==========================================
MOSTRAR FAVORITOS
========================================== */

function mostrarFavoritos(){

  const favoritos =
    obterFavoritos();


  if(!favoritos.length){

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
      .map(function(n){

        return `
          <div
            class="compact-card"
            style="margin-bottom:10px"
            onclick="abrirNoticiaPorId(${Number(n.id)})"
          >

            <div class="compact-body">

              <div class="compact-cat">
                ${esc(n.categoria || "Notícias")}
              </div>

              <div class="compact-title">
                ${esc(n.titulo)}
              </div>

            </div>

          </div>
        `;

      })
      .join("");


  abrirModal(
    "⭐ Favoritos",
    html
  );

}


/* ==========================================
NOTIFICAÇÕES
========================================== */

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


/* ==========================================
ATIVAR NOTIFICAÇÕES
========================================== */

async function ativarNotificacoes(){

  if(!("Notification" in window)){

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


/* ==========================================
PUSH
========================================== */

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
      "Push ativado:",
      subscription
    );


  }catch(e){

    console.warn(
      "Push não disponível:",
      e
    );

  }

}


/* ==========================================
CONVERTER CHAVE VAPID
========================================== */

function urlBase64ToUint8Array(base64String){

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
      char => char.charCodeAt(0)
    )
  );

}


/* ==========================================
MODAL PRINCIPAL
========================================== */

function abrirModal(titulo,conteudo){

  fecharModal();

  const modal = document.createElement("div");

  modal.id = "amModal";

  /* FORÇA O MODAL A FICAR POR CIMA DA PÁGINA */
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.right = "0";
  modal.style.bottom = "0";

  modal.style.width = "100vw";
  modal.style.height = "100vh";

  modal.style.zIndex = "2147483647";

  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";

  modal.style.padding = "15px";
  modal.style.margin = "0";

  modal.innerHTML = `

    <div
      class="am-back"
      id="amBack"
      style="
        position:fixed;
        top:0;
        left:0;
        right:0;
        bottom:0;
        width:100vw;
        height:100vh;
        background:rgba(0,0,0,.65);
        z-index:1;
      "
    ></div>

    <div
      class="am-box"
      style="
        position:relative;
        z-index:2;
        width:min(430px,100%);
        max-height:85vh;
        overflow-y:auto;
        background:#fff;
        color:#151515;
        border-radius:16px;
        box-shadow:0 15px 50px rgba(0,0,0,.4);
        margin:auto;
      "
    >

      <div class="am-head">

        <strong>
          ${esc(titulo)}
        </strong>

        <button
          id="amClose"
          type="button"
        >
          ✕
        </button>

      </div>

      <div id="amBody">

        ${conteudo}

      </div>

    </div>

  `;

  /* COLOCA O MODAL DIRETAMENTE NO BODY */
  document.body.appendChild(modal);

  /* BLOQUEIA A ROLAGEM DA PÁGINA */
  document.body.style.overflow = "hidden";

  const fechar =
    document.getElementById("amClose");

  const fundo =
    document.getElementById("amBack");

  if(fechar){

    fechar.onclick =
      fecharModal;

  }

  if(fundo){

    fundo.onclick =
      fecharModal;

  }

}


function fecharModal(){

  const modal =
    document.getElementById("amModal");

  if(modal){

    modal.remove();

  }

  /* DEVOLVE A ROLAGEM NORMAL */
  document.body.style.overflow = "";

}


/* ==========================================
FERRAMENTAS
========================================== */

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


/* ==========================================
ÁREA DO UTILIZADOR
========================================== */

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


/* ==========================================
APARÊNCIA
========================================== */

function abrirAparencia(){

  abrirModal(
    "🌙 Aparência",
    `
      <div>

        <button
          class="am-action"
          onclick="ativarTemaClaro()"
        >
          ☀️ Modo claro
        </button>

        <button
          class="am-action"
          onclick="ativarTemaEscuro()"
        >
          🌙 Modo escuro
        </button>

      </div>
    `
  );

}


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
      ? "dark"
      : "light"
  );

}


/* ==========================================
CORES
========================================== */

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


/* ==========================================
REDES SOCIAIS
========================================== */

function abrirRed(rede){

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

    console.warn(
      "Rede desconhecida:",
      rede
    );

    return;

  }


  /*
  No telemóvel usamos location.href
  para evitar que o navegador bloqueie
  window.open().
  */

  window.location.href =
    url;

}


/* ==========================================
PARTILHAR SITE
========================================== */

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

    }else{

      await navigator.clipboard.writeText(
        window.location.href
      );

      abrirModal(
        "Partilhar",
        "🔗 Link copiado com sucesso."
      );

    }

  }catch(e){

    console.log(
      "Partilha cancelada."
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


    abrirModal(
      "🔗 Link",
      "Link do AfricanMundo copiado."
    );


  }catch(e){

    prompt(
      "Copie o link:",
      window.location.href
    );

  }

}


/* ==========================================
FIM DA PARTE 3
========================================== */
 /* ==========================================
🌍 AFRICANMUNDO — APP.JS
PARTE 4/4
EVENTOS + ANÚNCIOS + PWA + INICIALIZAÇÃO
========================================== */


/* ==========================================
CARREGAR ANÚNCIOS
========================================== */

async function carregarAnuncios(){

  const section =
    document.getElementById(
      "anunciosAtivosSection"
    );

  const area =
    document.getElementById(
      "anunciosAtivos"
    );


  if(!section || !area || !db){

    return;

  }


  try{

    const hoje =
      new Date()
        .toISOString()
        .split("T")[0];


    const { data,error } =
      await db
        .from("anuncios")
        .select("*")
        .eq("ativo",true)
        .lte("data_inicio",hoje)
        .gte("data_fim",hoje)
        .order("id",{
          ascending:false
        });


    if(error){

      console.warn(
        "Erro nos anúncios:",
        error
      );

      section.style.display =
        "none";

      return;

    }


    if(!data || !data.length){

      section.style.display =
        "none";

      area.innerHTML = "";

      return;

    }


    area.innerHTML = "";


    data.forEach(function(anuncio){

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "compact-card";


      const titulo =
        esc(
          anuncio.titulo ||
          anuncio.texto ||
          "Anunciante"
        );


      const imagem =
        anuncio.imagem ||
        "";


      card.innerHTML = `

        ${
          imagem
          ?
          `
          <div class="compact-media">

            <img
              src="${esc(imagem)}"
              alt="${titulo}"
              loading="lazy"
              onerror="this.style.display='none'"
            >

          </div>
          `
          :
          ""
        }

        <div class="compact-body">

          <div class="compact-cat">
            ANÚNCIO
          </div>

          <div class="compact-title">
            ${titulo}
          </div>

          ${
            anuncio.texto
            ?
            `
            <div>
              ${esc(anuncio.texto)}
            </div>
            `
            :
            ""
          }

        </div>

      `;


      if(anuncio.url){

        card.onclick =
          function(){

            abrirLink(
              anuncio.url
            );

          };

      }


      area.appendChild(
        card
      );

    });


    section.style.display =
      "block";


  }catch(e){

    console.warn(
      "Falha nos anúncios:",
      e
    );

    section.style.display =
      "none";

  }

}


/* ==========================================
ABRIR LINK
========================================== */

function abrirLink(url){

  if(!url) return;


  try{

    window.location.href =
      url;

  }catch(e){

    console.error(
      "Erro ao abrir link:",
      e
    );

  }

}


/* ==========================================
RESTAURAR TEMA
========================================== */

function restaurarTema(){

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

}


/* ==========================================
RESTAURAR COR
========================================== */

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


/* ==========================================
INICIAR EVENTOS
========================================== */

function iniciarEventos(){

  console.log(
    "🌍 Iniciando eventos AfricanMundo..."
  );


  /* ======================================
  NOTIFICAÇÕES
  ====================================== */

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );


  if(notificationBtn){

    notificationBtn.onclick =
      function(e){

        e.preventDefault();
        e.stopPropagation();

        abrirNotificacoes();

      };

  }


  /* ======================================
  FERRAMENTAS
  ====================================== */

  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );


  if(toolsBtn){

    toolsBtn.onclick =
      function(e){

        e.preventDefault();
        e.stopPropagation();

        abrirFerramentas();

      };

  }


  /* ======================================
  UTILIZADOR
  ====================================== */

  const userBtn =
    document.getElementById(
      "userBtn"
    );


  if(userBtn){

    userBtn.onclick =
      function(e){

        e.preventDefault();
        e.stopPropagation();

        abrirUsuario();

      };

  }


  /* ======================================
  TEMA
  ====================================== */

  const themeBtn =
    document.getElementById(
      "themeBtn"
    );


  if(themeBtn){

    themeBtn.onclick =
      function(e){

        e.preventDefault();
        e.stopPropagation();

        alternarTema();

      };

  }


  /* ======================================
  CORES
  ====================================== */

  const colorBtn =
    document.getElementById(
      "colorBtn"
    );


  if(colorBtn){

    colorBtn.onclick =
      function(e){

        e.preventDefault();
        e.stopPropagation();

        abrirCores();

      };

  }


  /* ======================================
  PESQUISA
  ====================================== */

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


  const searchInput =
    document.getElementById(
      "searchInput"
    );


  if(searchInput){

    let timer = null;


    searchInput.addEventListener(
      "input",
      function(){

        clearTimeout(timer);


        timer =
          setTimeout(
            function(){

              pesquisar();

            },
            250
          );

      }
    );

  }


  /* ======================================
  BOTÃO PESQUISAR
  ====================================== */

  const searchBtn =
    document.getElementById(
      "searchBtn"
    );


  if(searchBtn){

    searchBtn.onclick =
      function(e){

        e.preventDefault();

        pesquisar();

      };

  }


  console.log(
    "✅ Eventos AfricanMundo ativados."
  );

}


/* ==========================================
SERVICE WORKER / PWA
========================================== */

function iniciarPWA(){

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
          function(registration){

            console.log(
              "✅ Service Worker ativo:",
              registration.scope
            );

          }
        )
        .catch(
          function(error){

            console.warn(
              "Service Worker:",
              error
            );

          }
        );

    }
  );

}


/* ==========================================
INSTALAÇÃO PWA
========================================== */

let deferredPrompt = null;


window.addEventListener(
  "beforeinstallprompt",
  function(e){

    e.preventDefault();

    deferredPrompt = e;

    console.log(
      "📱 PWA disponível para instalação."
    );

  }
);


async function instalarAplicacao(){

  if(!deferredPrompt){

    abrirModal(
      "📱 Instalar AfricanMundo",
      `
        <p>
          Se a opção de instalação não
          aparecer automaticamente, abra
          o menu do navegador e escolha
          <strong>Adicionar ao ecrã inicial</strong>.
        </p>
      `
    );

    return;

  }


  deferredPrompt.prompt();

  await deferredPrompt.userChoice;

  deferredPrompt = null;

}


/* ==========================================
INICIAR AFRICANMUNDO
========================================== */

async function iniciarAfricanMundo(){

  console.log(
    "🌍 AFRICANMUNDO INICIANDO..."
  );


  restaurarTema();

  restaurarCor();


  const conectado =
    iniciarSupabase();


  if(!conectado){

    mostrarErro(
      "Não foi possível ligar ao servidor."
    );

    return;

  }


  iniciarEventos();

  iniciarPWA();


  await carregarNoticias();

  await carregarAnuncios();


  console.log(
    "✅ AFRICANMUNDO PRONTO."
  );

}


/* ==========================================
GARANTIR INICIALIZAÇÃO
========================================== */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    iniciarAfricanMundo
  );

}else{

  iniciarAfricanMundo();

}


/* ==========================================
ATUALIZAÇÃO AUTOMÁTICA
========================================== */

let atualizacaoEmAndamento =
  false;


async function atualizarNoticiasAutomaticamente(){

  if(atualizacaoEmAndamento){

    return;

  }


  atualizacaoEmAndamento =
    true;


  try{

    await carregarNoticias();

    await carregarAnuncios();

  }catch(e){

    console.warn(
      "Atualização automática:",
      e
    );

  }


  atualizacaoEmAndamento =
    false;

}


/* ==========================================
ATUALIZAR A CADA 15 MINUTOS
========================================== */

setInterval(
  atualizarNoticiasAutomaticamente,
  15 * 60 * 1000
);


/* ==========================================
QUANDO VOLTA PARA O SITE
========================================== */

document.addEventListener(
  "visibilitychange",
  function(){

    if(
      document.visibilityState ===
      "visible"
    ){

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
ERROS GLOBAIS
========================================== */

window.addEventListener(
  "error",
  function(e){

    console.error(
      "Erro AfricanMundo:",
      e.message
    );

  }
);


window.addEventListener(
  "unhandledrejection",
  function(e){

    console.error(
      "Erro de promessa AfricanMundo:",
      e.reason
    );

  }
);


/* ==========================================
TORNAR FUNÇÕES DISPONÍVEIS AO HTML
========================================== */

window.abrirNoticia =
  abrirNoticia;

window.abrirNoticiaPorId =
  abrirNoticiaPorId;

window.pesquisar =
  pesquisar;

window.limparPesquisa =
  limparPesquisa;

window.abrirRed =
  abrirRed;

window.abrirModal =
  abrirModal;

window.fecharModal =
  fecharModal;

window.abrirNotificacoes =
  abrirNotificacoes;

window.abrirFerramentas =
  abrirFerramentas;

window.abrirUsuario =
  abrirUsuario;

window.abrirAparencia =
  abrirAparencia;

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

window.instalarAplicacao =
  instalarAplicacao;

window.abrirLink =
  abrirLink;


/* ==========================================
FIM DA PARTE 4/4
🌍 AFRICANMUNDO
========================================== */
