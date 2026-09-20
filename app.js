/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 1/3
   CONFIGURAÇÃO + NOTÍCIAS + DESTAQUE + CATEGORIAS
========================================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const VAPID_PUBLIC_KEY =
  "BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db = null;
let atualizacaoEmAndamento = false;

let destaqueNoticias = [];
let destaqueIndice = 0;
let destaqueTimer = null;

window.__noticias = [];


/* =========================================================
   SUPABASE
========================================================= */

function iniciarSupabase(){

  if(db){
    return true;
  }

  if(!window.supabase){
    console.error("❌ Supabase não carregou.");
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
   SEGURANÇA
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
   DADOS DA NOTÍCIA
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
    valor === "undefined" ||
    valor === "false" ||
    valor === "0"
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

  if(!n || n.id == null){
    return;
  }

  abrirNoticiaPorId(n.id);
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
   IMAGEM FALLBACK
========================================================= */

function imagemFallback(n){

  const cat =
    normalizarTexto(
      n?.subcategoria ||
      n?.categoria ||
      ""
    );


  if(cat.includes("futebol")){
    return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1000";
  }


  if(cat.includes("desporto")){
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000";
  }


  if(
    cat.includes("economia") ||
    cat.includes("negocio")
  ){
    return "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1000";
  }


  if(
    cat.includes("cultura") ||
    cat.includes("entretenimento")
  ){
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000";
  }


  if(cat.includes("saude")){
    return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1000";
  }


  if(cat.includes("politica")){
    return "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1000";
  }


  if(
    cat.includes("mocambique") ||
    cat.includes("africa")
  ){
    return "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1000";
  }


  return "logo-africanmundo.png";
}


/* =========================================================
   CRIAR CARD
========================================================= */
function criarCard(noticia){

  const id=noticia.id;
  const titulo=obterTitulo(noticia);
  const texto=obterTexto(noticia);
  const imagem=obterImagem(noticia);
  const categoria=noticia.categoria||"Mundo";
  const pais=noticia.pais||"Internacional";
  const data=formatarData(noticia.data);

  const emojis={
    "Moçambique":"🇲🇿",
    "Portugal":"🇵🇹",
    "Brasil":"🇧🇷",
    "Angola":"🇦🇴",
    "Nigéria":"🇳🇬",
    "África do Sul":"🇿🇦",
    "Malawi":"🇲🇼",
    "Zimbabwe":"🇿🇼",
    "Zâmbia":"🇿🇲",
    "Tanzânia":"🇹🇿",
    "Quénia":"🇰🇪",
    "Egito":"🇪🇬",
    "Marrocos":"🇲🇦",
    "Etiópia":"🇪🇹",
    "China":"🇨🇳",
    "Rússia":"🇷🇺",
    "Espanha":"🇪🇸",
    "França":"🇫🇷",
    "Alemanha":"🇩🇪",
    "Estados Unidos":"🇺🇸",
    "Taiwan":"🇹🇼",
    "Internacional":"🌍"
  };

  const emoji=emojis[pais]||"🌍";

  const artigo=document.createElement("article");

  artigo.className="news-card compacto";

  artigo.innerHTML=`

    <div class="card-image">

      <img
        src="${esc(imagem||imagemFallback(noticia))}"
        alt="${esc(titulo)}"
        loading="lazy"
        onerror="this.onerror=null;this.src='${esc(imagemFallback(noticia))}'"
      >

    </div>

    <div class="card-content">

      <div class="news-category">
        ${esc(emoji+" "+pais+" · "+categoria)}
      </div>

      <h3>${esc(titulo)}</h3>

      ${
        texto
        ? `<p>${esc(texto).slice(0,120)}</p>`
        : ""
      }

      <div class="news-meta">
        📅 ${esc(data)}
        &nbsp; 👁️ ${Number(noticia.visualizacoes||0)}
      </div>

    </div>

  `;

  artigo.addEventListener(
    "click",
    ()=>abrirNoticiaPorId(id)
  );

  return artigo;
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
   ⭐ RENDERIZAR DESTAQUE
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


  const fallback =
    imagemFallback(n);


  const data =
    formatarData(
      n?.data
    );


  const media =
    imagem
    ?
    `
      <img
        class="featured-image"
        src="${esc(imagem)}"
        alt="${titulo}"
        loading="eager"
        fetchpriority="high"
        decoding="async"
        onerror="
          this.onerror=null;
          this.src='${esc(fallback)}';
        "
      >
    `
    :
    `
      <img
        class="featured-image"
        src="${esc(fallback)}"
        alt="${titulo}"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      >
    `;


  area.innerHTML = `

    <article
      class="featured"
      id="noticiaDestaque"
      role="button"
      tabindex="0"
    >

      <div class="featured-media">
        ${media}
      </div>

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


  if(!destaque){
    return;
  }


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


/* =========================================================
   ⭐ DESTAQUE ROTATIVO
========================================================= */

function iniciarDestaqueRotativo(lista){

  if(
    !Array.isArray(lista) ||
    !lista.length
  ){
    return;
  }


  destaqueNoticias =
    lista.slice(0,8);


  destaqueIndice = 0;


  renderizarDestaque(
    destaqueNoticias[
      destaqueIndice
    ]
  );


  if(destaqueTimer){

    clearInterval(
      destaqueTimer
    );

    destaqueTimer = null;
  }


  if(
    destaqueNoticias.length < 2
  ){
    return;
  }


  destaqueTimer =
    setInterval(
      function(){

        const area =
          document.getElementById(
            "destaque"
          );


        if(!area){
          return;
        }


        area.style.opacity =
          "0.35";


        setTimeout(
          function(){

            destaqueIndice++;


            if(
              destaqueIndice >=
              destaqueNoticias.length
            ){

              destaqueIndice = 0;

            }


            renderizarDestaque(
              destaqueNoticias[
                destaqueIndice
              ]
            );


            area.style.opacity =
              "1";

          },
          300
        );


      },
      10000
    );
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
   FILTROS
========================================================= */

function ehMocambique(n){

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );


  if(
    categoria === "mocambique"
  ){
    return true;
  }


  if(
    categoria === "africa" ||
    categoria === "mundo"
  ){
    return false;
  }


  return sub === "mocambique";
}


function ehAfrica(n){

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );


  if(
    categoria === "africa"
  ){
    return true;
  }


  if(
    categoria === "mocambique" ||
    categoria === "mundo"
  ){
    return false;
  }


  return sub === "africa";
}


function ehFutebol(n){

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );


  return (
    sub === "futebol" ||
    categoria === "futebol"
  );
}


function ehDesporto(n){

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );


  return (
    sub === "desporto" ||
    categoria === "desporto"
  );
}


/* =========================================================
   💼 NEGÓCIOS
========================================================= */

function ehNegocios(n){

  const conteudo =
    textoCompleto(n);

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );


  if(
    categoria === "negocios"
  ){
    return true;
  }


  if(
    sub === "oportunidades"
  ){
    return true;
  }


  if(
    sub !== "economia"
  ){
    return false;
  }


  const palavras = [

    "empresa",
    "empresas",
    "negocio",
    "negocios",
    "investimento",
    "investimentos",
    "mercado",
    "banco",
    "bancos",
    "financiamento",
    "empreendedor",
    "empreendedorismo",
    "industria",
    "comercio",
    "comercial",
    "lucro",
    "receita",
    "economia",
    "exportacao",
    "importacao",
    "preco",
    "precos",
    "emprego",
    "empregos",
    "salario",
    "salarios"

  ];


  return palavras.some(
    function(palavra){

      return conteudo.includes(
        palavra
      );

    }
  );
}


/* =========================================================
   🎬 ENTRETENIMENTO
========================================================= */

function ehEntretenimento(n){

  const conteudo =
    textoCompleto(n);

  const categoria =
    normalizarTexto(
      n?.categoria || ""
    );

  const sub =
    normalizarTexto(
      n?.subcategoria || ""
    );


  if(
    categoria === "entretenimento"
  ){
    return true;
  }


  if(
    sub !== "cultura"
  ){
    return false;
  }


  const palavras = [

    "musica",
    "cantor",
    "cantora",
    "artista",
    "ator",
    "atriz",
    "cinema",
    "filme",
    "televisao",
    "novela",
    "serie",
    "festival",
    "concerto",
    "show",
    "espetaculo",
    "teatro",
    "celebridade",
    "famoso",
    "famosa",
    "premio",
    "premios",
    "album",
    "cancao",
    "banda",
    "humor",
    "comedia",
    "cultura pop"

  ];


  return palavras.some(
    function(palavra){

      return conteudo.includes(
        palavra
      );

    }
  );
}


/* =========================================================
   📰 CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

  if(atualizacaoEmAndamento){
    return;
  }


  atualizacaoEmAndamento =
    true;


  try{

    if(!db){

      if(!iniciarSupabase()){

        mostrarErro(
          "Não foi possível ligar ao servidor de notícias."
        );

        return;
      }
    }


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


    if(resultado.error){

      console.error(
        "❌ Erro ao carregar notícias:",
        resultado.error
      );

      mostrarErro(
        "Não foi possível carregar as notícias."
      );

      return;
    }


    const dados =
      Array.isArray(
        resultado.data
      )
      ?
      resultado.data
      :
      [];


    const mapa =
      new Map();


    dados.forEach(
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

  }finally{

    atualizacaoEmAndamento =
      false;
  }
}


/* =========================================================
   📄 RENDERIZAR PÁGINA
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


  /* ⭐ DESTAQUE ROTATIVO */

  iniciarDestaqueRotativo(
    recentes
  );


  /* 📰 ÚLTIMAS */

  renderizarLista(
    "ultimas",
    recentes
  );


  /* ⚽ FUTEBOL */

  renderizarLista(
    "futebol",
    recentes.filter(
      ehFutebol
    )
  );


  /* 🇲🇿 MOÇAMBIQUE */

  renderizarLista(
    "mocambique",
    recentes.filter(
      ehMocambique
    )
  );


  /* 🌍 ÁFRICA */

  renderizarLista(
    "africa",
    recentes.filter(
      ehAfrica
    )
  );


  /* 💼 NEGÓCIOS */

  renderizarLista(
    "negocios",
    recentes.filter(
      ehNegocios
    )
  );


  /* 🎬 ENTRETENIMENTO */

  renderizarLista(
    "entretenimento",
    recentes.filter(
      ehEntretenimento
    )
  );


  /* 🏆 DESPORTO */

  renderizarLista(
    "desporto",
    recentes.filter(
      ehDesporto
    )
  );


  console.log(
    "📊 AfricanMundo:",
    {
      total:recentes.length,
      futebol:recentes.filter(ehFutebol).length,
      mocambique:recentes.filter(ehMocambique).length,
      africa:recentes.filter(ehAfrica).length,
      negocios:recentes.filter(ehNegocios).length,
      entretenimento:recentes.filter(ehEntretenimento).length,
      desporto:recentes.filter(ehDesporto).length
    }
  );
     }

/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 2/3
   PESQUISA + FAVORITOS + MODAIS + TEMA + CORES
========================================================= */


/* =========================================================
   🔎 PESQUISA
========================================================= */

function pesquisar(e){

  if(e && e.preventDefault){
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

        return textoCompleto(
          n
        ).includes(termo);

      }
    );


  resultados.innerHTML = "";


  if(!encontrados.length){

    resultados.innerHTML = `
      <p class="sem-noticias">
        Nenhuma notícia encontrada.
      </p>
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
   ❤️ FAVORITOS
========================================================= */

function obterFavoritos(){

  try{

    const dados =
      localStorage.getItem(
        "africanmundo_favoritos"
      );

    const lista =
      dados
      ?
      JSON.parse(dados)
      :
      [];


    return Array.isArray(
      lista
    )
    ?
    lista
    :
    [];

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

    console.error(
      "❌ Erro ao guardar favoritos:",
      e
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


  const existe =
    favoritos.some(
      function(item){

        return String(
          item.id
        ) === String(
          n.id
        );

      }
    );


  if(existe){

    abrirModal(
      "❤️ Favoritos",
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
    "❤️ Favoritos",
    "Notícia adicionada aos favoritos."
  );
}


function mostrarFavoritos(){

  const favoritos =
    obterFavoritos();


  if(!favoritos.length){

    abrirModal(
      "❤️ Favoritos",
      `
        <p>
          Ainda não existem notícias favoritas.
        </p>
      `
    );

    return;
  }


  let html = "";


  favoritos.forEach(
    function(n){

      html += `

        <div
          class="compact-card"
          style="cursor:pointer;margin-bottom:10px"
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
              ${esc(
                n.titulo ||
                "Sem título"
              )}
            </div>

          </div>

        </div>

      `;

    }
  );


  abrirModal(
    "❤️ Favoritos",
    html
  );
}


/* =========================================================
   🪟 MODAL
========================================================= */

function fecharModal(){

  const modal =
    document.getElementById(
      "amModal"
    );


  if(modal){
    modal.remove();
  }
}


function abrirModal(
  titulo,
  conteudo
){

  fecharModal();


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "amModal";


  modal.style.cssText = `
    position:fixed;
    inset:0;
    z-index:99999;
    pointer-events:none;
  `;


  const fundo =
    document.createElement(
      "div"
    );


  fundo.id =
    "amBack";


  fundo.style.cssText = `
    position:absolute;
    inset:0;
    background:rgba(0,0,0,.18);
    pointer-events:auto;
  `;


  const painel =
    document.createElement(
      "div"
    );


  painel.id =
    "amDropdown";


  painel.style.cssText = `
    position:fixed;
    width:240px;
    max-width:calc(100vw - 20px);
    max-height:55vh;
    overflow:auto;
    background:var(--card,#fff);
    color:var(--txt,#222);
    border:1px solid var(--border,#ddd);
    border-radius:16px;
    box-shadow:0 12px 35px rgba(0,0,0,.22);
    padding:14px;
    pointer-events:auto;
    z-index:100000;
  `;


  painel.innerHTML = `

    <div
      style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:12px;
      "
    >

      <strong>
        ${esc(titulo)}
      </strong>

      <button
        type="button"
        id="amFechar"
        style="
          border:0;
          background:transparent;
          font-size:20px;
          cursor:pointer;
        "
      >
        ×
      </button>

    </div>

    <div>
      ${conteudo || ""}
    </div>

  `;


  modal.appendChild(
    fundo
  );

  modal.appendChild(
    painel
  );

  document.body.appendChild(
    modal
  );


  const botoes = [

    "notificationBtn",
    "toolsBtn",
    "userBtn",
    "colorBtn"

  ];


  let origem = null;


  for(
    const id of botoes
  ){

    const botao =
      document.getElementById(
        id
      );


    if(
      botao &&
      (
        document.activeElement ===
        botao
      )
    ){

      origem = botao;
      break;
    }
  }


  if(origem){

    const rect =
      origem.getBoundingClientRect();


    let top =
      rect.bottom + 8;

    let left =
      rect.right - 240;


    if(left < 10){
      left = 10;
    }


    if(
      left + 240 >
      window.innerWidth - 10
    ){

      left =
        window.innerWidth -
        250;
    }


    if(
      top + painel.offsetHeight >
      window.innerHeight - 10
    ){

      top =
        rect.top -
        painel.offsetHeight -
        8;
    }


    if(top < 10){
      top = 10;
    }


    painel.style.top =
      top + "px";

    painel.style.left =
      left + "px";

  }else{

    painel.style.left =
      "50%";

    painel.style.top =
      "50%";

    painel.style.transform =
      "translate(-50%,-50%)";
  }


  const fechar =
    document.getElementById(
      "amFechar"
    );


  if(fechar){

    fechar.onclick =
      function(){

        fecharModal();

      };
  }


  fundo.onclick =
    function(){

      fecharModal();

    };
}


/* =========================================================
   🔔 NOTIFICAÇÕES
========================================================= */

function abrirNotificacoes(){

  abrirModal(
    "🔔 Notificações",
    `
      <p>
        Receba novidades do AfricanMundo.
      </p>

      <button
        type="button"
        id="ativarNotificacoesBtn"
        style="
          width:100%;
          padding:11px;
          border:0;
          border-radius:10px;
          cursor:pointer;
        "
      >
        🔔 Ativar notificações
      </button>
    `
  );


  const botao =
    document.getElementById(
      "ativarNotificacoesBtn"
    );


  if(botao){

    botao.onclick =
      ativarNotificacoes;
  }
}


async function ativarNotificacoes(){

  if(
    !("Notification" in window)
  ){

    abrirModal(
      "🔔 Notificações",
      "Este navegador não suporta notificações."
    );

    return;
  }


  try{

    const permissao =
      await Notification.requestPermission();


    if(
      permissao !== "granted"
    ){

      abrirModal(
        "🔔 Notificações",
        "As notificações não foram ativadas."
      );

      return;
    }


    abrirModal(
      "🔔 Notificações",
      "Notificações ativadas com sucesso."
    );


    tentarPush();

  }catch(e){

    console.error(
      "❌ Notificação:",
      e
    );
  }
}


/* =========================================================
   📲 PUSH
========================================================= */

async function tentarPush(){

  try{

    if(
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ){
      return;
    }


    const registro =
      await navigator.serviceWorker.ready;


    let subscription =
      await registro.pushManager.getSubscription();


    if(!subscription){

      const chave =
        urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY
        );


      subscription =
        await registro.pushManager.subscribe({

          userVisibleOnly:true,

          applicationServerKey:
            chave

        });
    }


    console.log(
      "🔔 Push ativo:",
      subscription
    );

  }catch(e){

    console.warn(
      "⚠️ Push não disponível:",
      e
    );
  }
}


function urlBase64ToUint8Array(base64String){

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
    let i=0;
    i<rawData.length;
    ++i
  ){

    outputArray[i] =
      rawData.charCodeAt(i);

  }


  return outputArray;
}


/* =========================================================
   🛠️ FERRAMENTAS
========================================================= */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `

      <div
        style="
          display:grid;
          gap:8px;
        "
      >

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
          onclick="mostrarFavoritos()"
        >
          ❤️ Favoritos
        </button>

        <button
          type="button"
          onclick="abrirCores()"
        >
          🎨 Cores
        </button>

      </div>

    `
  );
}


/* =========================================================
   👤 UTILIZADOR
========================================================= */

function abrirUsuario(){

  abrirModal(
    "👤 AfricanMundo",
    `

      <div style="text-align:center">

        <div
          style="
            font-size:42px;
            margin-bottom:8px;
          "
        >
          👤
        </div>

        <strong>
          Leitor AfricanMundo
        </strong>

        <p>
          Acompanhe as principais notícias
          de África e do mundo.
        </p>

        <button
          type="button"
          onclick="mostrarFavoritos()"
        >
          ❤️ Meus favoritos
        </button>

      </div>

    `
  );
}


/* =========================================================
   🌙 TEMA
========================================================= */

function ativarTemaClaro(){

  document.body.classList.remove(
    "dark"
  );


  localStorage.setItem(
    "africanmundo_tema",
    "claro"
  );


  fecharModal();
}


function ativarTemaEscuro(){

  document.body.classList.add(
    "dark"
  );


  localStorage.setItem(
    "africanmundo_tema",
    "escuro"
  );


  fecharModal();
}


function alternarTema(){

  if(
    document.body.classList.contains(
      "dark"
    )
  ){

    ativarTemaClaro();

  }else{

    ativarTemaEscuro();

  }
}


function restaurarTema(){

  const tema =
    localStorage.getItem(
      "africanmundo_tema"
    );


  if(
    tema === "escuro"
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
   🎨 CORES
========================================================= */

function abrirCores(){

  abrirModal(
    "🎨 Cor do AfricanMundo",
    `

      <div
        style="
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:8px;
        "
      >

        <button
          type="button"
          onclick="definirCor('#168a45')"
        >
          🟢 Verde
        </button>

        <button
          type="button"
          onclick="definirCor('#1976d2')"
        >
          🔵 Azul
        </button>

        <button
          type="button"
          onclick="definirCor('#d32f2f')"
        >
          🔴 Vermelho
        </button>

        <button
          type="button"
          onclick="definirCor('#7b1fa2')"
        >
          🟣 Roxo
        </button>

        <button
          type="button"
          onclick="definirCor('#ef6c00')"
        >
          🟠 Laranja
        </button>

      </div>

    `
  );
}


function definirCor(cor){

  if(!cor){
    return;
  }


  document.documentElement.style.setProperty(
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

    document.documentElement.style.setProperty(
      "--p",
      cor
    );
  }
}


/* =========================================================
   FIM DA PARTE 2/3
========================================================= */
/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 3/3
   REDES SOCIAIS + ANÚNCIOS + BOTÕES + INICIALIZAÇÃO
========================================================= */


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


function abrirRed(rede){

  return abrirRede(
    rede
  );
}


/* =========================================================
   📤 PARTILHAR SITE
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
        "📤 Partilhar",
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
   📌 MENU ATIVO
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
            link.getAttribute(
              "href"
            ) ||
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
   🔘 INICIAR BOTÕES
========================================================= */

function iniciarBotoes(){

  /* ========================================
     NOTIFICAÇÕES
  ======================================== */

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


  /* ========================================
     FERRAMENTAS
  ======================================== */

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


  /* ========================================
     UTILIZADOR
  ======================================== */

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


  /* ========================================
     TEMA
  ======================================== */

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


  /* ========================================
     CORES
  ======================================== */

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


  /* ========================================
     🔎 PESQUISA
  ======================================== */

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


  /* ========================================
     LIMPAR PESQUISA
  ======================================== */

  const clearSearch =
    document.getElementById(
      "clearSearch"
    );


  if(clearSearch){

    clearSearch.onclick =
      function(e){

        e.preventDefault();

        limparPesquisa();

      };
  }


  /* ========================================
     🌐 REDES SOCIAIS
  ======================================== */

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


  /* ========================================
     COMPATIBILIDADE
  ======================================== */

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
    document.getElementById(
      "anunciosAtivosSection"
    );

  const area =
    document.getElementById(
      "anunciosAtivos"
    );


  if(
    !secao ||
    !area
  ){
    return;
  }


  if(!db){

    if(!iniciarSupabase()){

      secao.style.display =
        "none";

      return;
    }
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
        .eq(
          "ativo",
          true
        )
        .lte(
          "data_inicio",
          hoje
        )
        .gte(
          "data_fim",
          hoje
        )
        .order(
          "id",
          {
            ascending:false
          }
        );


    if(resultado.error){

      console.error(
        "❌ Erro anúncios:",
        resultado.error
      );

      secao.style.display =
        "none";

      return;
    }


    const anuncios =
      Array.isArray(
        resultado.data
      )
      ?
      resultado.data
      :
      [];


    if(!anuncios.length){

      secao.style.display =
        "none";

      return;
    }


    area.innerHTML = "";


    anuncios
      .slice(0,4)
      .forEach(
        function(anuncio){

          const card =
            document.createElement(
              "div"
            );


          card.className =
            "anuncio-card";


          const empresa =
            esc(
              anuncio.empresa ||
              "Publicidade"
            );


          const texto =
            esc(
              anuncio.mensagem ||
              ""
            );


          const video =
            anuncio.video ||
            "";


          const imagem =
            anuncio.imagem ||
            "";


          const link =
            anuncio.link ||
            "";


          let media = "";


          if(video){

            media = `

              <video
                src="${esc(video)}"
                autoplay
                muted
                loop
                playsinline
                preload="metadata"
                ${
                  imagem
                  ?
                  `poster="${esc(imagem)}"`
                  :
                  ""
                }
              ></video>

            `;

          }else if(imagem){

            media = `

              <img
                src="${esc(imagem)}"
                alt="${empresa}"
                loading="lazy"
                decoding="async"
                onerror="this.style.display='none'"
              >

            `;

          }else{

            media = `

              <div
                style="
                  width:100%;
                  height:100%;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  font-size:24px;
                "
              >
                📢
              </div>

            `;
          }


          card.innerHTML = `

            <div class="anuncio-media">

              ${media}

            </div>


            <div class="anuncio-titulo">

              📢 ${empresa}

            </div>


            ${
              texto
              ?
              `
                <div class="anuncio-texto">
                  ${texto}
                </div>
              `
              :
              ""
            }


            ${
              link
              ?
              `
                <a
                  class="anuncio-botao"
                  href="${esc(link)}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver anúncio →
                </a>
              `
              :
              ""
            }

          `;


          area.appendChild(
            card
          );

        }
      );


    secao.style.display =
      "block";


    console.log(
      "📢 Anúncios exibidos:",
      anuncios.length
    );


  }catch(e){

    console.error(
      "❌ Falha nos anúncios:",
      e
    );


    secao.style.display =
      "none";
  }
}


/* =========================================================
   🚀 INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function(){

    try{

      /* ================================
         APARÊNCIA
      ================================= */

      restaurarCor();

      restaurarTema();


      /* ================================
         BOTÕES
      ================================= */

      iniciarBotoes();

      marcarMenuAtivo();


      /* ================================
         SUPABASE
      ================================= */

      if(
        !iniciarSupabase()
      ){

        mostrarErro(
          "Não foi possível ligar ao servidor de notícias."
        );

        return;
      }


      /* ================================
         NOTÍCIAS
      ================================= */

      await carregarNoticias();


      /* ================================
         ANÚNCIOS
      ================================= */

      await carregarAnunciosAtivos();


      console.log(
        "✅ AfricanMundo iniciado."
      );


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
   🌐 EXPOR FUNÇÕES PARA O HTML
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
   ⭐ FIM DO APP.JS
========================================================= */
