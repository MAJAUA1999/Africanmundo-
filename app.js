/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 1/4 — BASE + CARDS + FILTROS
========================================================= */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let db=null;
let noticias=[];

const FALLBACK_IMG =
"https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=85";


/* =========================================================
🔧 BASE
========================================================= */

function norm(v){

  return String(v||"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim();

}

function esc(v){

  return String(v||"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}

function titulo(n){

  return n?.titulo || "Sem título";

}

function texto(n){

  return n?.texto || "";

}

function data(n){

  if(!n?.data) return "";

  try{

    return new Date(n.data)
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


/* =========================================================
🖼️ IMAGEM
========================================================= */

function imagem(n){

  const campos=[
    n?.imagem,
    n?.imagem_url,
    n?.image,
    n?.image_url,
    n?.url_imagem,
    n?.foto
  ];

  for(const img of campos){

    if(
      img &&
      /^https?:\/\//i.test(
        String(img).trim()
      )
    ){

      return String(img).trim();

    }

  }

  return FALLBACK_IMG;

}


/* =========================================================
🔌 SUPABASE
========================================================= */

function iniciarSupabase(){

  if(typeof supabase==="undefined"){

    console.error(
      "❌ Supabase não encontrado."
    );

    return false;

  }

  try{

    db=supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    return true;

  }catch(e){

    console.error(
      "❌ Erro Supabase:",
      e
    );

    return false;

  }

}


/* =========================================================
📰 CARD PROFISSIONAL
========================================================= */

function card(n){

  const el=
    document.createElement("article");

  el.className="card";

  const tit=titulo(n);

  const cat=
    n?.subcategoria ||
    n?.categoria ||
    "Notícias";

  el.innerHTML=`

    <img
      src="${esc(imagem(n))}"
      alt="${esc(tit)}"
      loading="lazy"
    >

    <div class="card-body">

      <span class="card-category">
        ${esc(cat)}
      </span>

      <h3 class="card-title">
        ${esc(tit)}
      </h3>

      <div class="card-date">
        ${esc(data(n))}
      </div>

    </div>

  `;

  el.onclick=function(){

    abrirNoticia(n.id);

  };

  const img=
    el.querySelector("img");

  if(img){

    img.onerror=function(){

      this.onerror=null;
      this.src=FALLBACK_IMG;

    };

  }

  return el;

}


/* =========================================================
📋 LISTA
========================================================= */

function lista(arr,id){

  const area=
    document.getElementById(id);

  if(!area) return;

  area.innerHTML="";

  if(!arr || !arr.length){

    area.innerHTML=`
      <div class="loading">
        Ainda não existem notícias nesta categoria.
      </div>
    `;

    return;

  }

  arr.forEach(function(n){

    area.appendChild(
      card(n)
    );

  });

}


/* =========================================================
🔎 TEXTO PARA PESQUISA/FILTRO
========================================================= */

function textoCompleto(n){

  return norm([
    n?.categoria,
    n?.subcategoria,
    n?.pais,
    n?.titulo,
    n?.texto,
    n?.fonte
  ].join(" "));

}


/* =========================================================
🇲🇿 IDENTIFICAR MOÇAMBIQUE
========================================================= */

function ehMocambique(n){

  const categoria=
    norm(n?.categoria);

  const pais=
    norm(n?.pais);

  const sub=
    norm(n?.subcategoria);

  if(
    categoria==="mocambique" ||
    pais==="mocambique"
  ){

    return true;

  }

  if(
    sub.includes("mocambique")
  ){

    return true;

  }

  const x=
    textoCompleto(n);

  return /(^|[\s,.-])(
    mocambique|
    mozambique|
    maputo|
    matola|
    gaza|
    inhambane|
    sofala|
    beira|
    manica|
    tete|
    zambezia|
    nampula|
    pemba|
    niassa|
    "cabo delgado"
  )([\s,.-]|$)/x.test(x);

}


/* =========================================================
🌍 IDENTIFICAR ÁFRICA
========================================================= */

function ehAfrica(n){

  if(ehMocambique(n))
    return false;

  const categoria=
    norm(n?.categoria);

  if(categoria==="africa")
    return true;

  const x=
    textoCompleto(n);

  return /angola|malawi|zimbabwe|zambia|tanzania|nigeria|kenya|quenia|ghana|marrocos|egito|etiopia|africa do sul|rwanda|uganda|senegal|camaroes|namibia|botswana|tunisia|argelia|libia|somalia|sudao/.test(x);

}


/* =========================================================
⚽ IDENTIFICAR FUTEBOL
========================================================= */

function ehFutebol(n){

  const categoria=
    norm(n?.categoria);

  const sub=
    norm(n?.subcategoria);

  if(
    categoria==="futebol" ||
    sub==="futebol"
  ){

    return true;

  }

  const x=
    textoCompleto(n);

  return /futebol|football|golo|gol|campeonato de futebol|liga de futebol|uefa|champions league|premier league|mundial de clubes/.test(x);

}


/* =========================================================
🏆 IDENTIFICAR DESPORTO
========================================================= */

function ehDesporto(n){

  if(ehFutebol(n))
    return false;

  const categoria=
    norm(n?.categoria);

  const sub=
    norm(n?.subcategoria);

  if(
    categoria==="desporto" ||
    sub==="desporto"
  ){

    return true;

  }

  const x=
    textoCompleto(n);

  return /desporto|atletismo|basquete|basquetebol|boxe|olimpi|natacao|tenis|voleibol|ciclismo/.test(x);

}


/* =========================================================
💼 IDENTIFICAR NEGÓCIOS
========================================================= */

function ehNegocios(n){

  const categoria=
    norm(n?.categoria);

  const sub=
    norm(n?.subcategoria);

  if(
    categoria==="negocios" ||
    sub==="negocios"
  ){

    return true;

  }

  const x=
    textoCompleto(n);

  return /negocio|economia|empresa|mercado|investimento|comercio|financas|banco|emprego|energia/.test(x);

}


/* =========================================================
🎭 IDENTIFICAR ENTRETENIMENTO
========================================================= */

function ehEntretenimento(n){

  const categoria=
    norm(n?.categoria);

  const sub=
    norm(n?.subcategoria);

  if(
    categoria==="entretenimento" ||
    sub==="entretenimento"
  ){

    return true;

  }

  const x=
    textoCompleto(n);

  return /entretenimento|cultura|musica|cinema|artista|festival|teatro|televisao|celebridade/.test(x);

}


/* =========================================================
🔎 FILTRAR
========================================================= */

function filtrar(tipo){

  return noticias.filter(function(n){

    if(tipo==="mocambique")
      return ehMocambique(n);

    if(tipo==="africa")
      return ehAfrica(n);

    if(tipo==="futebol")
      return ehFutebol(n);

    if(tipo==="desporto")
      return ehDesporto(n);

    if(tipo==="negocios")
      return ehNegocios(n);

    if(tipo==="entretenimento")
      return ehEntretenimento(n);

    return true;

  });

}

/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 2/4 — CARREGAMENTO + DESTAQUE + PESQUISA
========================================================= */


/* =========================================================
📰 MOSTRAR NOTÍCIAS
========================================================= */

function mostrarNoticias(){

  lista(
    noticias.slice(0,10),
    "ultimas"
  );

  lista(
    filtrar("mocambique").slice(0,4),
    "mocambique"
  );

  lista(
    filtrar("africa").slice(0,4),
    "africa"
  );

  lista(
    filtrar("futebol").slice(0,4),
    "futebol"
  );

  lista(
    filtrar("desporto").slice(0,4),
    "desporto"
  );

  lista(
    filtrar("negocios").slice(0,4),
    "negocios"
  );

  lista(
    filtrar("entretenimento").slice(0,4),
    "entretenimento"
  );

}


/* =========================================================
⏳ CARREGAMENTO
========================================================= */

function mostrarCarregando(){

  const ids=[
    "ultimas",
    "mocambique",
    "africa",
    "futebol",
    "desporto",
    "negocios",
    "entretenimento"
  ];

  ids.forEach(function(id){

    const area=
      document.getElementById(id);

    if(area){

      area.innerHTML=`
        <div class="loading">
          ⏳ A preparar notícias...
        </div>
      `;

    }

  });

}


/* =========================================================
❌ ERRO
========================================================= */

function mostrarErroNoticias(erro){

  console.error(
    "❌ Erro ao carregar notícias:",
    erro
  );

  const ids=[
    "ultimas",
    "mocambique",
    "africa",
    "futebol",
    "desporto",
    "negocios",
    "entretenimento"
  ];

  ids.forEach(function(id){

    const area=
      document.getElementById(id);

    if(!area) return;

    area.innerHTML=`
      <div class="loading">
        ⚠️ Não foi possível carregar
        as notícias.
        <br><br>
        <button
          onclick="carregarNoticias()"
          style="
            padding:9px 14px;
            border:0;
            border-radius:9px;
            background:#168a45;
            color:white;
            cursor:pointer;
          "
        >
          🔄 Tentar novamente
        </button>
      </div>
    `;

  });

}


/* =========================================================
📰 CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

  mostrarCarregando();

  if(!db){

    if(!iniciarSupabase()){

      mostrarErroNoticias(
        "Supabase não disponível"
      );

      return;

    }

  }

  try{

    const consulta =
      db
      .from("noticias")
      .select(`
        id,
        titulo,
        texto,
        imagem,
        categoria,
        subcategoria,
        pais,
        visualizacoes,
        data,
        fonte,
        url_original
      `)
      .order(
        "data",
        {
          ascending:false
        }
      )
      .limit(500);

    const resultado =
      await Promise.race([

        consulta,

        new Promise(function(_,reject){

          setTimeout(
            function(){

              reject(
                new Error(
                  "Tempo limite excedido."
                )
              );

            },
            15000
          );

        })

      ]);

    if(resultado.error){

      throw resultado.error;

    }

    noticias =
      Array.isArray(resultado.data)
      ? resultado.data
      : [];

    console.log(
      "📰 Notícias carregadas:",
      noticias.length
    );

    if(!noticias.length){

      mostrarErroNoticias(
        "Nenhuma notícia encontrada."
      );

      return;

    }

    mostrarNoticias();

    destacar();

    ligarLinksCategorias();

    console.log(
      "🇲🇿 Moçambique:",
      filtrar("mocambique").length
    );

    console.log(
      "🌍 África:",
      filtrar("africa").length
    );

    console.log(
      "⚽ Futebol:",
      filtrar("futebol").length
    );

    console.log(
      "🏆 Desporto:",
      filtrar("desporto").length
    );

    console.log(
      "💼 Negócios:",
      filtrar("negocios").length
    );

    console.log(
      "🎭 Entretenimento:",
      filtrar("entretenimento").length
    );

  }catch(e){

    mostrarErroNoticias(e);

  }

}


/* =========================================================
⭐ DESTAQUE
========================================================= */

function destacar(){

  const area=
    document.getElementById("destaque");

  if(!area || !noticias.length)
    return;

  const n=noticias[0];

  mostrarDestaque(n);

}


/* =========================================================
⭐ MOSTRAR DESTAQUE
========================================================= */

function mostrarDestaque(n){

  const area=
    document.getElementById("destaque");

  if(!area) return;

  const img=
    imagem(n);

  const tit=
    titulo(n);

  const cat=
    n?.subcategoria ||
    n?.categoria ||
    "Destaque";

  area.innerHTML=`

    <article
      class="featured-card"
      onclick="abrirNoticia(${Number(n.id)})"
      style="
        position:relative;
        overflow:hidden;
        min-height:330px;
        border-radius:16px;
        cursor:pointer;
        background:#111;
      "
    >

      <img
        src="${esc(img)}"
        alt="${esc(tit)}"
        style="
          width:100%;
          height:330px;
          object-fit:cover;
          display:block;
        "
      >

      <div style="
        position:absolute;
        inset:0;
        display:flex;
        flex-direction:column;
        justify-content:flex-end;
        padding:24px;
        color:white;
        background:
          linear-gradient(
            transparent 25%,
            rgba(0,0,0,.85)
          );
      ">

        <div style="
          font-size:11px;
          font-weight:800;
          margin-bottom:7px;
          text-transform:uppercase;
        ">
          ${esc(cat)}
        </div>

        <h2 style="
          margin:0;
          font-size:clamp(21px,3vw,34px);
          line-height:1.15;
          font-weight:900;
        ">
          ${esc(tit)}
        </h2>

        <div style="
          margin-top:9px;
          font-size:11px;
          opacity:.85;
        ">
          ${esc(data(n))}
        </div>

      </div>

    </article>

  `;

}


/* =========================================================
📰 ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(id){

  if(
    id===undefined ||
    id===null
  )
    return;

  location.href=
    "noticia.html?id="+
    encodeURIComponent(id);

}


/* =========================================================
🔎 PESQUISA
========================================================= */

function pesquisar(){

  const input=
    document.getElementById(
      "searchInput"
    );

  const resultados=
    document.getElementById(
      "searchResults"
    );

  if(!input || !resultados)
    return;

  const termo=
    norm(input.value);

  if(!termo){

    resultados.innerHTML="";
    resultados.style.display="none";

    return;

  }

  const encontrados=
    noticias
      .filter(function(n){

        return textoCompleto(n)
          .includes(termo);

      })
      .slice(0,20);

  resultados.innerHTML="";

  resultados.style.display=
    "grid";

  if(!encontrados.length){

    resultados.innerHTML=`
      <div class="loading">
        Nenhuma notícia encontrada.
      </div>
    `;

    return;

  }

  encontrados.forEach(function(n){

    resultados.appendChild(
      card(n)
    );

  });

}


/* =========================================================
🔗 PARTILHAR NOTÍCIA
========================================================= */

async function partilharNoticia(id){

  const url=
    location.origin+
    location.pathname
      .replace(
        /[^/]+$/,
        ""
      )+
    "noticia.html?id="+
    encodeURIComponent(id);

  const n=
    noticias.find(function(x){

      return String(x.id)===
        String(id);

    });

  const dados={

    title:
      n?.titulo ||
      "AfricanMundo",

    text:
      n?.titulo ||
      "Notícia AfricanMundo",

    url:url

  };

  try{

    if(navigator.share){

      await navigator.share(
        dados
      );

      return;

    }

    if(navigator.clipboard){

      await navigator.clipboard
        .writeText(url);

      abrirModal(
        "Link copiado",
        "<p>O link da notícia foi copiado.</p>"
      );

      return;

    }

    abrirModal(
      "Partilhar",
      "<p>"+esc(url)+"</p>"
    );

  }catch(e){

    console.log(
      "Partilha cancelada."
    );

  }

}

/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 3/4 — MODAL + ANÚNCIOS + BOTÕES
========================================================= */


/* =========================================================
🔔 MODAL
========================================================= */

function abrirModal(
  tituloModal,
  conteudo
){

  const modal=
    document.getElementById("modal");

  const mt=
    document.getElementById("modalTitle");

  const mb=
    document.getElementById("modalBody");

  if(!modal) return;

  if(mt)
    mt.textContent=
      tituloModal ||
      "AfricanMundo";

  if(mb)
    mb.innerHTML=
      conteudo || "";

  modal.style.display="flex";

}


function fecharModal(){

  const modal=
    document.getElementById("modal");

  if(modal)
    modal.style.display="none";

}


/* =========================================================
🔔 NOTIFICAÇÕES
========================================================= */

function mostrarNotificacoes(){

  abrirModal(
    "Notificações",
    `
      <p>🔔 Bem-vindo ao AfricanMundo.</p>

      <p>
        Notícias recentes de Moçambique,
        África e do mundo.
      </p>
    `
  );

}


/* =========================================================
🛠️ FERRAMENTAS
========================================================= */

function mostrarFerramentas(){

  abrirModal(
    "Ferramentas",
    `
      <p>🌙 Alterar tema</p>
      <p>🎨 Alterar cor</p>
      <p>🔎 Pesquisar notícias</p>
      <p>📤 Partilhar notícias</p>
    `
  );

}


/* =========================================================
👤 UTILIZADOR
========================================================= */

function mostrarUtilizador(){

  abrirModal(
    "AfricanMundo",
    `
      <p>
        <strong>
          Bem-vindo ao AfricanMundo.
        </strong>
      </p>

      <p>
        Notícias de Moçambique,
        África e do mundo.
      </p>
    `
  );

}


/* =========================================================
🧭 MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

  const pagina=
    norm(location.pathname);

  document
    .querySelectorAll(
      "nav a,.menu a,.bottom-menu a"
    )
    .forEach(function(link){

      link.classList.remove("ativo");

      const href=
        link.getAttribute("href");

      if(!href) return;

      const caminho=
        norm(
          href.split("?")[0]
        );

      if(
        caminho &&
        pagina.endsWith(caminho)
      ){

        link.classList.add("ativo");

      }

    });

}


/* =========================================================
🔗 VER TODAS
========================================================= */

function ligarLinksCategorias(){

  const mapa={

    futebol:
      "futebol.html",

    mocambique:
      "categoria.html?categoria=mocambique",

    africa:
      "categoria.html?categoria=africa",

    negocios:
      "categoria.html?categoria=negocios",

    entretenimento:
      "categoria.html?categoria=entretenimento",

    desporto:
      "categoria.html?categoria=desporto",

    ultimas:
      "categoria.html?categoria=noticias"

  };

  Object.keys(mapa)
    .forEach(function(id){

      const area=
        document.getElementById(id);

      if(!area) return;

      const secao=
        area.closest("section");

      if(!secao) return;

      secao
        .querySelectorAll("a")
        .forEach(function(link){

          const textoLink=
            norm(
              link.textContent
            );

          if(
            textoLink.includes(
              "ver todas"
            )
          ){

            link.href=
              mapa[id];

          }

        });

    });

}


/* =========================================================
📢 ANÚNCIOS ATIVOS
========================================================= */

async function carregarAnuncios(){

  const sec=
    document.getElementById(
      "anunciosAtivosSection"
    );

  const area=
    document.getElementById(
      "anunciosAtivos"
    );

  if(!sec || !area)
    return;

  if(!db){

    if(!iniciarSupabase()){

      sec.style.display="none";

      return;

    }

  }

  try{

    const r=
      await db
      .from("anuncios")
      .select("*")
      .order(
        "id",
        {
          ascending:false
        }
      )
      .limit(10);

    if(r.error)
      throw r.error;

    const dados=
      r.data || [];

    if(!dados.length){

      sec.style.display="none";

      return;

    }

    sec.style.display="block";

    area.innerHTML="";

    dados.forEach(function(a){

      const el=
        document.createElement("div");

      el.className="card";

      const tituloAnuncio=
        a.titulo ||
        "Anuncie no AfricanMundo";

      const textoAnuncio=
        a.texto ||
        "Divulgue a sua empresa, marca, produto ou serviço.";

      const imagemAnuncio=
        a.imagem ||
        a.imagem_url ||
        "";

      const linkAnuncio=
        a.url ||
        a.link ||
        a.url_original ||
        "";

      el.innerHTML=`

        ${
          imagemAnuncio
          ? `
            <img
              src="${esc(imagemAnuncio)}"
              alt="${esc(tituloAnuncio)}"
              style="
                width:100%;
                max-height:220px;
                object-fit:cover;
                display:block;
              "
            >
          `
          : ""
        }

        <div class="card-body">

          <h3>
            📢 ${esc(tituloAnuncio)}
          </h3>

          <p>
            ${esc(textoAnuncio)}
          </p>

        </div>

      `;

      if(linkAnuncio){

        el.onclick=function(){

          window.open(
            linkAnuncio,
            "_blank",
            "noopener,noreferrer"
          );

        };

      }

      area.appendChild(el);

    });

  }catch(e){

    console.log(
      "Anúncios indisponíveis:",
      e
    );

    sec.style.display="none";

  }

}


/* =========================================================
📢 ANUNCIE AQUI
========================================================= */

function prepararAnuncieAqui(){

  document
    .querySelectorAll("a,button,div")
    .forEach(function(el){

      const texto=
        norm(el.textContent);

      if(
        texto==="anuncie aqui"
      ){

        el.style.cursor="pointer";

        if(
          el.tagName!=="A" ||
          !el.getAttribute("href")
        ){

          el.onclick=function(){

            location.href=
              "contacto.html";

          };

        }

      }

    });

}


/* =========================================================
❤️ FAVORITOS
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


function alternarFavorito(id){

  let favoritos=
    obterFavoritos();

  id=String(id);

  if(
    favoritos.includes(id)
  ){

    favoritos=
      favoritos.filter(
        function(x){

          return x!==id;

        }
      );

  }else{

    favoritos.push(id);

  }

  try{

    localStorage.setItem(
      "africanmundo_favoritos",
      JSON.stringify(
        favoritos
      )
    );

  }catch(e){}

  return favoritos.includes(id);

}


/* =========================================================
📱 MENU MOBILE
========================================================= */

function abrirMenu(){

  const menu=
    document.querySelector(
      ".bottom-menu,.mobile-menu"
    );

  if(menu){

    menu.classList.toggle(
      "ativo"
    );

  }

}


/* =========================================================
🖱️ BOTÕES DO CABEÇALHO
========================================================= */

function ligarBotoesCabecalho(){

  const notificacao=
    document.getElementById(
      "notificationBtn"
    );

  const ferramentas=
    document.getElementById(
      "toolsBtn"
    );

  const utilizador=
    document.getElementById(
      "userBtn"
    );

  const tema=
    document.getElementById(
      "themeBtn"
    );

  const cor=
    document.getElementById(
      "colorBtn"
    );


  if(notificacao){

    notificacao.onclick=
      mostrarNotificacoes;

  }


  if(ferramentas){

    ferramentas.onclick=
      mostrarFerramentas;

  }


  if(utilizador){

    utilizador.onclick=
      mostrarUtilizador;

  }


  if(tema){

    tema.onclick=
      alternarTema;

  }


  if(cor){

    cor.onclick=
      escolherCor;

  }

}


/* =========================================================
🔎 PESQUISA
========================================================= */

function ligarPesquisa(){

  const form=
    document.getElementById(
      "searchForm"
    );

  if(form){

    form.addEventListener(
      "submit",
      function(e){

        e.preventDefault();

        pesquisar();

      }
    );

  }


  const input=
    document.getElementById(
      "searchInput"
    );

  if(input){

    input.addEventListener(
      "input",
      pesquisar
    );

  }

            }

/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 4/4 — FINAL + INICIALIZAÇÃO
========================================================= */


/* =========================================================
📡 TESTAR SUPABASE
========================================================= */

async function testarSupabase(){

  if(!db){

    if(!iniciarSupabase())
      return false;

  }

  try{

    const r=
      await db
      .from("noticias")
      .select("id")
      .limit(1);

    if(r.error){

      console.error(
        "❌ Supabase:",
        r.error
      );

      return false;

    }

    console.log(
      "✅ Supabase conectado."
    );

    return true;

  }catch(e){

    console.error(
      "❌ Supabase:",
      e
    );

    return false;

  }

}


/* =========================================================
🔄 ATUALIZAR NOTÍCIAS
========================================================= */

async function atualizarNoticias(){

  const botoes=
    document.querySelectorAll(
      "[data-atualizar]"
    );

  botoes.forEach(function(b){

    b.disabled=true;

  });

  try{

    await carregarNoticias();

  }finally{

    botoes.forEach(function(b){

      b.disabled=false;

    });

  }

}


/* =========================================================
🔄 ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

function iniciarAtualizacaoAutomatica(){

  setInterval(
    function(){

      if(
        document.visibilityState===
        "visible"
      ){

        carregarNoticias();
        carregarAnuncios();

      }

    },
    5*60*1000
  );

}


/* =========================================================
🧹 FECHAR MODAL
========================================================= */

function iniciarFechoModal(){

  document.addEventListener(
    "click",
    function(e){

      const m=
        document.getElementById(
          "modal"
        );

      if(
        m &&
        e.target===m
      ){

        fecharModal();

      }

    }
  );


  document.addEventListener(
    "keydown",
    function(e){

      if(e.key==="Escape"){

        fecharModal();

      }

    }
  );

}


/* =========================================================
🖼️ PROTEGER IMAGENS
========================================================= */

function iniciarProtecaoImagens(){

  document.addEventListener(
    "error",
    function(e){

      const img=e.target;

      if(
        !img ||
        img.tagName!=="IMG"
      )
        return;

      if(
        (img.src||"")
          .startsWith(
            "data:image/svg"
          )
      )
        return;

      img.onerror=null;

      img.src=FALLBACK_IMG;

    },
    true
  );

}


/* =========================================================
🎨 TEMA
========================================================= */

function iniciarTema(){

  try{

    const tema=
      localStorage.getItem(
        "africanmundo_tema"
      );

    if(tema==="dark"){

      document.body.classList.add(
        "dark"
      );

    }else{

      document.body.classList.remove(
        "dark"
      );

    }

  }catch(e){}

}


function alternarTema(){

  document.body.classList.toggle(
    "dark"
  );

  try{

    localStorage.setItem(
      "africanmundo_tema",
      document.body.classList.contains(
        "dark"
      )
      ? "dark"
      : "light"
    );

  }catch(e){}

}


/* =========================================================
🎨 COR
========================================================= */

function restaurarCor(){

  try{

    const cor=
      localStorage.getItem(
        "africanmundo_cor"
      );

    if(cor){

      document.documentElement
        .setAttribute(
          "data-cor",
          cor
        );

    }

  }catch(e){}

}


function escolherCor(){

  const cores=[
    "verde",
    "azul",
    "vermelho",
    "roxo",
    "laranja"
  ];

  const atual=
    document.documentElement
      .getAttribute("data-cor") ||
    "verde";

  const indice=
    cores.indexOf(atual);

  const proxima=
    cores[
      (indice+1)%
      cores.length
    ];

  document.documentElement
    .setAttribute(
      "data-cor",
      proxima
    );

  try{

    localStorage.setItem(
      "africanmundo_cor",
      proxima
    );

  }catch(e){}

}


/* =========================================================
🌐 REDES SOCIAIS
========================================================= */

const REDES_SOCIAIS={

  google:
    "https://www.google.com",

  facebook:
    "https://www.facebook.com",

  youtube:
    "https://www.youtube.com",

  whatsapp:
    "https://wa.me/",

  instagram:
    "https://www.instagram.com",

  tiktok:
    "https://www.tiktok.com"

};


function abrirRede(rede){

  const nome=
    norm(rede);

  const url=
    REDES_SOCIAIS[nome];

  if(!url){

    console.warn(
      "⚠️ Rede desconhecida:",
      rede
    );

    return false;

  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  return true;

}


/* =========================================================
🚀 INICIAR BOTÕES
========================================================= */

function iniciarBotoes(){

  ligarBotoesCabecalho();

  ligarPesquisa();

  iniciarFechoModal();

  prepararAnuncieAqui();

}


/* =========================================================
🚀 INICIAR AFRICANMUNDO
========================================================= */

async function iniciarAfricanMundo(){

  console.log(
    "🌍 AFRICANMUNDO INICIANDO..."
  );

  restaurarCor();

  iniciarTema();

  iniciarBotoes();

  marcarMenuAtivo();

  iniciarProtecaoImagens();

  iniciarSupabase();

  await carregarNoticias();

  carregarAnuncios();

  iniciarAtualizacaoAutomatica();

  console.log(
    "✅ AFRICANMUNDO PRONTO."
  );

}


/* =========================================================
📱 INICIAR PÁGINA
========================================================= */

if(
  document.readyState===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    iniciarAfricanMundo
  );

}else{

  iniciarAfricanMundo();

        }
