/* =====================================================
   AFRICANMUNDO — APP.JS
   VERSÃO PROFISSIONAL
===================================================== */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db =
window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let noticias = [];
let indiceDestaque = 0;
let timerDestaque = null;


/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function norm(v){

  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

}


/* =====================================================
   ESCAPAR HTML
===================================================== */

function esc(v){

  return String(v || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =====================================================
   DADOS DA NOTÍCIA
===================================================== */

function titulo(n){

  return n?.titulo ||
         "Sem título";

}


function texto(n){

  return n?.texto || "";

}


function data(n){

  if(!n?.data) return "";

  try{

    return new Date(n.data)
      .toLocaleDateString(
        "pt-PT",
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


/* =====================================================
   DATA EM MILISSEGUNDOS
===================================================== */

function dataNumero(n){

  const d =
    new Date(n?.data || 0)
    .getTime();

  return Number.isNaN(d) ? 0 : d;

}


/* =====================================================
   IMAGEM AUTOMÁTICA
===================================================== */

function imagemGerada(n){

  const tit =
    titulo(n)
      .slice(0,70);

  const cat =
    n?.subcategoria ||
    n?.categoria ||
    "Notícias";

  const cor =
    norm(cat) === "futebol"
      ? "#168a45"
      : norm(cat) === "desporto"
      ? "#1976d2"
      : norm(cat) === "negocios"
      ? "#8e24aa"
      : norm(cat) === "entretenimento"
      ? "#e65100"
      : "#168a45";


  const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="1200"
     height="675"
     viewBox="0 0 1200 675">

  <defs>

    <linearGradient
      id="g"
      x1="0"
      y1="0"
      x2="1"
      y2="1">

      <stop
        offset="0%"
        stop-color="${cor}"/>

      <stop
        offset="100%"
        stop-color="#071b12"/>

    </linearGradient>

  </defs>

  <rect
    width="1200"
    height="675"
    fill="url(#g)"/>

  <circle
    cx="1030"
    cy="120"
    r="190"
    fill="white"
    opacity=".08"/>

  <circle
    cx="110"
    cy="600"
    r="260"
    fill="white"
    opacity=".06"/>

  <text
    x="70"
    y="95"
    fill="white"
    font-family="Arial"
    font-size="34"
    font-weight="bold">
    AFRICANMUNDO
  </text>

  <text
    x="70"
    y="145"
    fill="white"
    opacity=".8"
    font-family="Arial"
    font-size="24">
    ${esc(cat)}
  </text>

  <foreignObject
    x="70"
    y="205"
    width="1060"
    height="300">

    <div
      xmlns="http://www.w3.org/1999/xhtml"
      style="
        color:white;
        font-family:Arial;
        font-size:46px;
        font-weight:bold;
        line-height:1.15;
      ">

      ${esc(tit)}

    </div>

  </foreignObject>

  <text
    x="70"
    y="620"
    fill="white"
    opacity=".75"
    font-family="Arial"
    font-size="22">
    A informação que liga África ao mundo
  </text>

</svg>`;


  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);

}


/* =====================================================
   IMAGEM DA NOTÍCIA
   ORIGINAL PRIMEIRO
===================================================== */

function imagem(n){

  const campos = [

    n?.imagem,
    n?.image,
    n?.url_imagem,
    n?.imagem_url

  ];


  for(const valor of campos){

    if(
      typeof valor === "string" &&
      valor.trim() !== ""
    ){

      return valor.trim();

    }

  }


  return imagemGerada(n);

}


/* =====================================================
   FALLBACK DE IMAGEM
===================================================== */

function imagemFallback(n){

  return imagemGerada(n);

}


/* =====================================================
   RESUMO
===================================================== */

function resumoNoticia(n){

  const textoBase =
    n?.texto ||
    n?.descricao ||
    n?.resumo ||
    n?.description ||
    "";

  return String(textoBase)
    .replace(/\s+/g," ")
    .trim()
    .slice(0,180);

}


/* =====================================================
   CARD PROFISSIONAL
===================================================== */

function card(n){

  const el =
    document.createElement("article");

  el.className =
    "card noticia-card";


  const img =
    imagem(n);

  const tit =
    titulo(n);

  const cat =
    n?.subcategoria ||
    n?.categoria ||
    "Notícias";

  const resumo =
    resumoNoticia(n);


  el.innerHTML = `

    <div class="card-image">

      <img
        src="${esc(img)}"
        alt="${esc(tit)}"
        loading="lazy"
      >

      <span class="card-badge">
        ${esc(cat)}
      </span>

    </div>

    <div class="card-body">

      <h3 class="card-title">
        ${esc(tit)}
      </h3>

      ${
        resumo
        ? `
          <p class="card-resumo">
            ${esc(resumo)}
          </p>
        `
        : ""
      }

      <div class="card-meta">

        <span>
          🕒 ${esc(data(n))}
        </span>

        <span>
          Ler notícia →
        </span>

      </div>

    </div>

  `;


  el.onclick =
    function(){

      abrirNoticia(n.id);

    };


  const imgEl =
    el.querySelector("img");


  if(imgEl){

    imgEl.onerror =
      function(){

        this.onerror = null;

        this.src =
          imagemFallback(n);

      };

  }


  return el;

}


/* =====================================================
   LISTA
===================================================== */

function lista(arr,id){

  const grid =
    document.getElementById(id);

  if(!grid) return;


  grid.innerHTML = "";


  if(!arr || !arr.length){

    grid.innerHTML = `
      <p class="sem-noticias">
        Nenhuma notícia encontrada.
      </p>
    `;

    return;

  }


  arr.forEach(n => {

    grid.appendChild(
      card(n)
    );

  });

}


/* =====================================================
   DESTAQUE
===================================================== */

function destacar(arr){

  if(!arr || !arr.length)
    return null;


  if(indiceDestaque >= arr.length)
    indiceDestaque = 0;


  return arr[indiceDestaque];

}


/* =====================================================
   MOSTRAR DESTAQUE
===================================================== */

function mostrarDestaque(){

  const box =
    document.getElementById("destaque");


  if(!box || !noticias.length)
    return;


  const recentes =
    noticias
      .slice()
      .sort(
        (a,b) =>
          dataNumero(b) -
          dataNumero(a)
      )
      .slice(0,10);


  const n =
    destacar(recentes);


  if(!n) return;


  const img =
    imagem(n);


  const resumo =
    resumoNoticia(n);


  box.innerHTML = `

    <div
      class="destaque-card"
      onclick="abrirNoticia(${Number(n.id)})">

      <div class="destaque-image">

        <img
          src="${esc(img)}"
          alt="${esc(titulo(n))}"
          loading="eager"
        >

      </div>

      <div class="destaque-overlay">

        <div class="destaque-categoria">
          🌍 ${esc(
            n?.subcategoria ||
            n?.categoria ||
            "Notícias"
          )}
        </div>

        <h2>
          ${esc(titulo(n))}
        </h2>

        ${
          resumo
          ? `
            <p>
              ${esc(resumo)}...
            </p>
          `
          : ""
        }

        <div class="destaque-data">
          🕒 ${esc(data(n))}
        </div>

      </div>

    </div>

  `;


  const imagemEl =
    box.querySelector("img");


  if(imagemEl){

    imagemEl.onerror =
      function(){

        this.onerror = null;

        this.src =
          imagemFallback(n);

      };

  }

}


/* =====================================================
   PAÍSES DE ÁFRICA
===================================================== */

const PAISES_AFRICA = [

  "angola","argelia","algeria","benin","botswana",
  "burkina faso","burundi","cabo verde","cape verde",
  "camaroes","cameroon","chade","chad",
  "comores","comoros","congo",
  "costa do marfim","cote d ivoire","ivory coast",
  "djibouti","egito","egypt","eritrea",
  "eswatini","swaziland","etiopia","ethiopia",
  "gabon","gambia","gana","ghana",
  "guine","guinea","guine bissau",
  "guine equatorial","equatorial guinea",
  "lesoto","lesotho","liberia","libia","libya",
  "madagascar","malawi","mali","marrocos","morocco",
  "mauritania","mauricio","mauritius",
  "mocambique","mozambique","namibia","niger",
  "nigeria","quenia","kenya","ruanda","rwanda",
  "senegal","seychelles","serra leoa",
  "sierra leone","somalia",
  "africa do sul","south africa",
  "sudao","sudan","sudao do sul",
  "south sudan","tanzania","togo","tunisia",
  "uganda","zambia","zimbabwe"
];


/* =====================================================
   CARREGAR NOTÍCIAS
===================================================== */
async function carregarNoticias(){

  if(!db){

    mostrarErroNoticias(
      "Supabase não inicializado."
    );

    return;

  }

  try{

    const pedido =
      db
        .from("noticias")
        .select(`
          id,
          titulo,
          imagem,
          categoria,
          subcategoria,
          texto,
          data,
          fonte,
          url_original,
          id_externo,
          idioma,
          visualizacoes,
          pais
        `)
        .order(
          "data",
          { ascending:false }
        )
        .limit(1000);


    const limite =
      new Promise(function(_,reject){

        setTimeout(function(){

          reject(
            new Error(
              "Tempo limite ao carregar notícias."
            )
          );

        },8000);

      });


    const resultado =
      await Promise.race([
        pedido,
        limite
      ]);


    if(resultado.error){

      throw resultado.error;

    }


    noticias =
      (resultado.data || [])
        .filter(function(n){

          return n && n.id;

        })
        .sort(function(a,b){

          return dataNumero(b) -
                 dataNumero(a);

        });


    if(!noticias.length){

      mostrarErroNoticias(
        "Nenhuma notícia encontrada."
      );

      return;

    }


    indiceDestaque = 0;


    mostrarDestaque();


    lista(
      noticias.slice(0,4),
      "ultimas"
    );


    lista(
      filtrar("mocambique")
        .slice(0,4),
      "mocambique"
    );


    lista(
      filtrar("africa")
        .slice(0,4),
      "africa"
    );


    lista(
      filtrar("futebol")
        .slice(0,4),
      "futebol"
    );


    lista(
      filtrar("desporto")
        .slice(0,4),
      "desporto"
    );


    lista(
      filtrar("negocios")
        .slice(0,4),
      "negocios"
    );


    lista(
      filtrar("entretenimento")
        .slice(0,4),
      "entretenimento"
    );


    iniciarRotacaoDestaque();


  }catch(e){

    console.error(
      "❌ ERRO AO CARREGAR:",
      e
    );

    mostrarErroNoticias(e);

  }

       }


/* =====================================================
   FILTRAR CATEGORIAS
===================================================== */

function filtrar(tipo){

  const resultado =
    noticias.filter(n => {

      const cat =
        norm(n?.categoria);

      const sub =
        norm(n?.subcategoria);

      const pais =
        norm(n?.pais);


      /* =========================
         MOÇAMBIQUE
      ========================= */

      if(tipo === "mocambique"){

        return (
          cat === "mocambique" ||
          pais.includes("mozambique") ||
          pais.includes("mocambique")
        );

      }


      /* =========================
         ÁFRICA
      ========================= */

      if(tipo === "africa"){

        const eMocambique =
          pais.includes("mozambique") ||
          pais.includes("mocambique") ||
          cat === "mocambique";


        if(eMocambique){

          return false;

        }


        return (
          cat === "africa" ||
          PAISES_AFRICA.includes(pais)
        );

      }


      /* =========================
         FUTEBOL
      ========================= */

      if(tipo === "futebol"){

        return (
          cat === "futebol" ||
          sub === "futebol"
        );

      }


      /* =========================
         DESPORTO
      ========================= */

      if(tipo === "desporto"){

        const esportes = [

          "desporto",
          "basquetebol",
          "atletismo",
          "boxe",
          "tenis",
          "voleibol",
          "ciclismo",
          "motorizado",
          "formula 1",
          "olimpiadas"

        ];


        return (
          esportes.includes(cat) ||
          esportes.includes(sub)
        );

      }


      /* =========================
         NEGÓCIOS
      ========================= */

      if(tipo === "negocios"){

        const negocios = [

          "negocios",
          "economia",
          "financas",
          "empresas",
          "investimento",
          "mercado",
          "emprego",
          "oportunidades",
          "energia",
          "agricultura"

        ];


        return (
          negocios.includes(cat) ||
          negocios.includes(sub)
        );

      }


      /* =========================
         ENTRETENIMENTO
      ========================= */

      if(tipo === "entretenimento"){

        const entretenimento = [

          "entretenimento",
          "cultura",
          "musica",
          "cinema",
          "televisao",
          "famosos",
          "artes",
          "lazer"

        ];


        return (
          entretenimento.includes(cat) ||
          entretenimento.includes(sub)
        );

      }


      return false;

    });


  return resultado.sort(
    (a,b) =>
      dataNumero(b) -
      dataNumero(a)
  );

}


/* =====================================================
   ROTAÇÃO DO DESTAQUE
===================================================== */

function iniciarRotacaoDestaque(){

  if(timerDestaque){

    clearInterval(
      timerDestaque
    );

  }


  timerDestaque =
    setInterval(

      function(){

        if(!noticias.length)
          return;


        const total =
          Math.min(
            noticias.length,
            10
          );


        indiceDestaque++;


        if(
          indiceDestaque >= total
        ){

          indiceDestaque = 0;

        }


        mostrarDestaque();

      },

      10000

    );

       }


/* =========================================================
   MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

  const links =
    document.querySelectorAll("a[href]");

  const atual =
    norm(
      new URLSearchParams(
        window.location.search
      ).get("categoria") ||
      "noticias"
    );


  links.forEach(link => {

    const href =
      link.getAttribute("href") || "";

    const partes =
      href.split("?");

    const params =
      new URLSearchParams(
        partes[1] || ""
      );

    const categoria =
      norm(
        params.get("categoria") || ""
      );


    if(
      categoria &&
      categoria === atual
    ){

      link.classList.add("ativo");

    }

  });

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

function atualizarNoticias(){

  carregarNoticias();

}


function iniciarAtualizacaoAutomatica(){

  if(
    window._timerAtualizacaoNoticias
  ){

    clearInterval(
      window._timerAtualizacaoNoticias
    );

  }


  window._timerAtualizacaoNoticias =
    setInterval(

      atualizarNoticias,

      3600000

    );

}


/* =========================================================
   ERRO DE NOTÍCIAS
========================================================= */

function mostrarErroNoticias(erro){

  console.error(
    "Erro ao carregar notícias:",
    erro
  );


  const ids = [

    "ultimas",
    "mocambique",
    "africa",
    "futebol",
    "desporto",
    "negocios",
    "entretenimento"

  ];


  ids.forEach(id => {

    const grid =
      document.getElementById(id);

    if(!grid) return;


    grid.innerHTML = `
      <p class="sem-noticias">
        Não foi possível carregar
        as notícias neste momento.
      </p>
    `;

  });

}


/* =========================================================
   FECHAR MODAL AO CLICAR FORA
========================================================= */

document.addEventListener(
  "click",
  function(e){

    const modal =
      document.getElementById("modal");

    if(!modal) return;


    if(e.target === modal){

      fecharModal();

    }

  }
);


/* =========================================================
   INICIAR AFRICANMUNDO
========================================================= */
async function iniciarAfricanMundo(){

  try{

    console.log("🟢 AfricanMundo iniciou");


    try{
      restaurarCor();
    }catch(e){
      console.error("Erro restaurarCor:",e);
    }


    try{
      iniciarTema();
    }catch(e){
      console.error("Erro iniciarTema:",e);
    }


    try{
      iniciarBotoes();
    }catch(e){
      console.error("Erro iniciarBotoes:",e);
    }


    try{
      marcarMenuAtivo();
    }catch(e){
      console.error("Erro marcarMenuAtivo:",e);
    }


    console.log(
      "🟢 A iniciar carregamento das notícias"
    );


    await carregarNoticias();


    console.log(
      "🟢 Notícias carregadas"
    );


    iniciarAtualizacaoAutomatica();

}catch(e){

  console.error(
    "❌ ERRO AFRICANMUNDO:",
    e
  );

  const aviso =
    document.getElementById("ultimas");

  if(aviso){

    aviso.innerHTML = `
      <div style="
        padding:15px;
        background:#fff3f3;
        border:1px solid #ffcccc;
        border-radius:12px;
        color:#b00020;
        font-size:13px;
      ">
        ❌ Erro ao carregar as notícias.
        <br><br>
        ${esc(
          e?.message ||
          String(e)
        )}
      </div>
    `;

  }

  }


/* =========================================================
   INÍCIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    iniciarAfricanMundo();

  }
);
