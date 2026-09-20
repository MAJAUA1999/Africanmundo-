/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 1/4 — BASE + NOTÍCIAS
========================================================= */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let db = null;
let noticias = [];

const FALLBACK_IMG =
"https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=85";

/* =========================================================
🔧 FUNÇÕES BÁSICAS
========================================================= */

function norm(v){

  return String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim();

}

function esc(v){

  return String(v || "")
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

    return new Date(n.data).toLocaleDateString(
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
🖼️ IMAGEM AUTOMÁTICA
========================================================= */

function imagemGerada(n){

  const assunto =
    titulo(n).slice(0,55);

  const categoria =
    n?.categoria || "Notícias";

  const textoSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="1200"
         height="700"
         viewBox="0 0 1200 700">

      <defs>

        <linearGradient
          id="g"
          x1="0"
          y1="0"
          x2="1"
          y2="1">

          <stop
            offset="0%"
            stop-color="#168a45"/>

          <stop
            offset="100%"
            stop-color="#073b20"/>

        </linearGradient>

      </defs>

      <rect
        width="1200"
        height="700"
        fill="url(#g)"/>

      <circle
        cx="1030"
        cy="110"
        r="170"
        fill="rgba(255,255,255,.08)"/>

      <circle
        cx="150"
        cy="600"
        r="240"
        fill="rgba(255,255,255,.05)"/>

      <text
        x="70"
        y="100"
        fill="#ffffff"
        font-family="Arial"
        font-size="32"
        font-weight="bold">
        AFRICANMUNDO
      </text>

      <text
        x="70"
        y="175"
        fill="#d8ffe8"
        font-family="Arial"
        font-size="25">
        ${esc(categoria)}
      </text>

      <foreignObject
        x="70"
        y="230"
        width="1060"
        height="280">

        <div xmlns="http://www.w3.org/1999/xhtml"
          style="
            color:white;
            font-family:Arial,sans-serif;
            font-size:48px;
            font-weight:bold;
            line-height:1.15;
          ">

          ${esc(assunto)}

        </div>

      </foreignObject>

      <text
        x="70"
        y="635"
        fill="#ffffff"
        font-family="Arial"
        font-size="24">
        A informação que liga África ao mundo
      </text>

    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(textoSvg);

}

function imagem(n){

  const img =
    n?.imagem ||
    n?.imagem_url ||
    n?.image ||
    n?.image_url ||
    "";

  if(
    img &&
    /^https?:\/\//i.test(img)
  ){

    return img;

  }

  return imagemGerada(n);

}

/* =========================================================
🔌 SUPABASE
========================================================= */

function iniciarSupabase(){

  if(typeof supabase === "undefined"){

    console.error(
      "❌ Biblioteca Supabase não encontrada."
    );

    return false;

  }

  try{

    db = supabase.createClient(
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
📰 CARD
========================================================= */

function card(n){

  const el =
    document.createElement("article");

  el.className = "news-card";

  el.style.cssText = `
    display:flex;
    width:100%;
    min-height:135px;
    overflow:hidden;
    border-radius:14px;
    margin-bottom:12px;
    background:var(--card,#fff);
    box-shadow:0 2px 10px rgba(0,0,0,.08);
    cursor:pointer;
  `;

  const img = imagem(n);

  el.innerHTML = `

    <img
      src="${esc(img)}"
      alt="${esc(titulo(n))}"
      style="
        width:180px;
        min-width:180px;
        height:135px;
        object-fit:cover;
        display:block;
      "
    >

    <div style="
      padding:10px 12px;
      overflow:hidden;
      flex:1;
    ">

      <small style="
        color:var(--p,#168a45);
        font-weight:bold;
      ">
        🌍 ${esc(
          n.pais ||
          n.categoria ||
          "Notícias"
        )}
      </small>

      <h3 style="
        margin:5px 0;
        font-size:15px;
        line-height:1.25;
      ">
        ${esc(titulo(n))}
      </h3>

      <p style="
        margin:0 0 4px;
        font-size:12px;
        line-height:1.35;
        opacity:.75;
        display:-webkit-box;
        -webkit-line-clamp:2;
        -webkit-box-orient:vertical;
        overflow:hidden;
      ">
        ${esc(texto(n))}
      </p>

      <small>${esc(data(n))}</small>

    </div>

  `;

  el.onclick = function(){

    abrirNoticia(n.id);

  };

  const imgEl =
    el.querySelector("img");

  if(imgEl){

    imgEl.onerror = function(){

      if(
        !this.src.startsWith("data:image/svg")
      ){

        this.src = imagemGerada(n);

      }

    };

  }

  return el;

}

/* =========================================================
📋 LISTA
========================================================= */

function lista(arr,id){

  const area =
    document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";

  if(!arr || !arr.length){

    area.innerHTML = `
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
🔎 FILTROS
========================================================= */

function textoCompleto(n){

  return norm(
    [
      n?.categoria,
      n?.subcategoria,
      n?.pais,
      n?.titulo,
      n?.texto,
      n?.fonte
    ].join(" ")
  );

}

function filtrar(tipo){

  return noticias.filter(function(n){

    const x =
      textoCompleto(n);

    if(tipo === "mocambique"){

      return (
        norm(n?.categoria) === "mocambique" ||
        norm(n?.pais) === "mocambique" ||
        /mocambique|mozambique|maputo|matola|gaza|inhambane|sofala|beira|manica|tete|zambezia|nampula|pemba|cabo delgado|niassa/.test(x)
      );

    }

    if(tipo === "africa"){

      return (
        norm(n?.categoria) === "africa" ||
        /angola|malawi|zimbabwe|zambia|tanzania|nigeria|kenya|quenia|ghana|marrocos|egito|etiopia|africa do sul|rwanda|uganda|senegal|camaroes|namibia|botswana|tunisia|argelia|libia|somalia|sudao/.test(x)
      );

    }

    if(tipo === "futebol"){

      return /futebol|football|golo|gol|jogador|clube|campeonato|liga|uefa|champions|premier league|mundial de clubes/.test(x);

    }

    if(tipo === "desporto"){

      return /desporto|atletismo|basquete|basquetebol|boxe|olimpi|natação|tenis|ténis|voleibol|ciclismo/.test(x);

    }

    if(tipo === "negocios"){

      return /negocio|negócio|economia|empresa|mercado|investimento|comercio|comércio|financas|finanças|banco|emprego|energia/.test(x);

    }

    if(tipo === "entretenimento"){

      return /entretenimento|cultura|musica|música|cinema|artista|festival|teatro|televisao|televisão|celebridade/.test(x);

    }

    return true;

  });

}

/* =========================================================
🌟 DESTAQUE ALEATÓRIO ENTRE NOTÍCIAS RECENTES
========================================================= */

function destacar(){

  const area =
    document.getElementById("destaque");

  if(!area) return;

  if(!noticias.length){

    area.innerHTML = `
      <div class="loading">
        Ainda não existem notícias em destaque.
      </div>
    `;

    return;

  }

  const limite =
    Math.min(
      noticias.length,
      10
    );

  const indice =
    Math.floor(
      Math.random() * limite
    );

  const n =
    noticias[indice];

  area.innerHTML = `

    <article
      class="featured-card"
      style="
        cursor:pointer;
        overflow:hidden;
        border-radius:16px;
        background:var(--card,#fff);
        box-shadow:0 3px 14px rgba(0,0,0,.10);
      "
    >

      <img
        src="${esc(imagem(n))}"
        alt="${esc(titulo(n))}"
        style="
          width:100%;
          height:240px;
          object-fit:cover;
          display:block;
        "
      >

      <div style="
        padding:14px;
      ">

        <small style="
          color:var(--p,#168a45);
          font-weight:bold;
        ">
          🌍 ${esc(
            n.pais ||
            n.categoria ||
            "Notícias"
          )}
        </small>

        <h2 style="
          margin:7px 0;
          font-size:20px;
          line-height:1.25;
        ">
          ${esc(titulo(n))}
        </h2>

        <p style="
          margin:0 0 6px;
          opacity:.75;
          line-height:1.4;
        ">
          ${esc(texto(n)).slice(0,220)}
        </p>

        <small>
          ${esc(data(n))}
        </small>

      </div>

    </article>

  `;

  const article =
    area.querySelector("article");

  if(article){

    article.onclick =
      function(){

        abrirNoticia(n.id);

      };

  }

  const img =
    area.querySelector("img");

  if(img){

    img.onerror =
      function(){

        this.src =
          imagemGerada(n);

      };

  }

}

/* =========================================================
📥 CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

  if(!db){

    if(!iniciarSupabase()){

      mostrarErroNoticias(
        "Supabase não está disponível."
      );

      return;

    }

  }

  const areas = [
    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"
  ];

  areas.forEach(function(id){

    const el =
      document.getElementById(id);

    if(el){

      el.innerHTML = `
        <div class="loading">
          ⏳ A preparar notícias...
        </div>
      `;

    }

  });

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
      .limit(300);

    const r =
      await Promise.race([

        consulta,

        new Promise(function(_,reject){

          setTimeout(
            function(){

              reject(
                new Error(
                  "Tempo de ligação ao Supabase excedido."
                )
              );

            },
            15000
          );

        })

      ]);

    if(r.error)
      throw r.error;

    noticias =
      Array.isArray(r.data)
      ? r.data
      : [];

    window.__noticias =
      noticias;

    lista(
      noticias.slice(0,10),
      "ultimas"
    );

    lista(
      filtrar("futebol").slice(0,6),
      "futebol"
    );

    lista(
      filtrar("mocambique").slice(0,6),
      "mocambique"
    );

    lista(
      filtrar("africa").slice(0,6),
      "africa"
    );

    lista(
      filtrar("negocios").slice(0,6),
      "negocios"
    );

    lista(
      filtrar("entretenimento").slice(0,6),
      "entretenimento"
    );

    lista(
      filtrar("desporto").slice(0,6),
      "desporto"
    );

    destacar();

    ligarLinksCategorias();

    console.log(
      "✅ AfricanMundo:",
      noticias.length,
      "notícias carregadas."
    );

  }catch(e){

    console.error(
      "❌ Erro ao carregar notícias:",
      e
    );

    mostrarErroNoticias(
      "Não foi possível carregar as notícias agora."
    );

  }

}

function mostrarErroNoticias(mensagem){

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

    const el =
      document.getElementById(id);

    if(el){

      el.innerHTML = `
        <div class="loading">
          ⚠️ ${esc(mensagem)}
          <br>
          <button
            onclick="atualizarNoticias()"
            style="
              margin-top:10px;
              padding:8px 14px;
              border:0;
              border-radius:8px;
              cursor:pointer;
            "
          >
            🔄 Tentar novamente
          </button>
        </div>
      `;

    }

  });

  const destaque =
    document.getElementById(
      "destaque"
    );

  if(destaque){

    destaque.innerHTML = `
      <div class="loading">
        ⚠️ ${esc(mensagem)}
      </div>
    `;

  }

     }

/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 2/4 — PESQUISA + REDES + TEMA
========================================================= */

function abrirNoticia(id){

  if(id === undefined || id === null) return;

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}

/* =========================================================
🔎 PESQUISA
========================================================= */

function pesquisar(){

  const input =
    document.getElementById("searchInput");

  const area =
    document.getElementById("searchResults");

  if(!input || !area) return;

  const termo =
    norm(input.value);

  area.innerHTML = "";

  if(!termo){

    area.style.display = "none";
    return;

  }

  const resultados =
    noticias
    .filter(function(n){

      return textoCompleto(n)
        .includes(termo);

    })
    .slice(0,20);

  area.style.display = "block";

  if(!resultados.length){

    area.innerHTML = `
      <div class="loading">
        Nenhuma notícia encontrada.
      </div>
    `;

    return;

  }

  resultados.forEach(function(n){

    area.appendChild(
      card(n)
    );

  });

}

/* =========================================================
🌙 TEMA
========================================================= */

function iniciarTema(){

  try{

    const salvo =
      localStorage.getItem(
        "africanmundo_tema"
      );

    if(salvo === "dark"){

      document.body.classList.add("dark");

    }

  }catch(e){}

}

function alternarTema(){

  document.body.classList.toggle("dark");

  try{

    localStorage.setItem(
      "africanmundo_tema",
      document.body.classList.contains("dark")
        ? "dark"
        : "light"
    );

  }catch(e){}

}

/* =========================================================
🎨 CORES
========================================================= */

function restaurarCor(){

  try{

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

  }catch(e){}

}

function escolherCor(){

  const cores = [
    "#168a45",
    "#1565c0",
    "#c62828",
    "#7b1fa2",
    "#ef6c00"
  ];

  const atual =
    getComputedStyle(
      document.documentElement
    )
    .getPropertyValue("--p")
    .trim();

  let i =
    cores.indexOf(atual);

  if(i < 0) i = 0;

  const proxima =
    cores[(i + 1) % cores.length];

  document.documentElement
    .style
    .setProperty(
      "--p",
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

const REDES_SOCIAIS = {

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

  const nome =
    norm(rede);

  const url =
    REDES_SOCIAIS[nome];

  if(!url){

    console.warn(
      "Rede social desconhecida:",
      rede
    );

    return false;

  }

  try{

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }catch(e){

    location.href = url;

  }

  return true;

}

/* =========================================================
📤 PARTILHAR
========================================================= */

async function partilharNoticia(id){

  const base =
    location.origin +
    location.pathname
      .replace(
        /[^/]+$/,
        ""
      );

  const url =
    base +
    "noticia.html?id=" +
    encodeURIComponent(id);

  const n =
    noticias.find(function(x){

      return String(x.id) ===
        String(id);

    });

  const dados = {

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

      await navigator.share(dados);

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
      `
        <p>Copie o link:</p>
        <p>${esc(url)}</p>
      `
    );

  }catch(e){

    console.log(
      "Partilha cancelada."
    );

  }

}

/* =========================================================
🔔 MODAL
========================================================= */

function abrirModal(
  tituloModal,
  conteudo
){

  const modal =
    document.getElementById("modal");

  const mt =
    document.getElementById("modalTitle");

  const mb =
    document.getElementById("modalBody");

  if(!modal) return;

  if(mt)
    mt.textContent =
      tituloModal ||
      "AfricanMundo";

  if(mb)
    mb.innerHTML =
      conteudo || "";

  modal.style.display = "flex";

}

function fecharModal(){

  const modal =
    document.getElementById("modal");

  if(modal){

    modal.style.display = "none";

  }

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
        Aqui encontrará notícias recentes
        de Moçambique, África e do mundo.
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

  const pagina =
    norm(location.pathname);

  document
    .querySelectorAll(
      "nav a,.menu a,.bottom-menu a"
    )
    .forEach(function(link){

      link.classList.remove("ativo");

      const href =
        link.getAttribute("href");

      if(!href) return;

      const caminho =
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
🔗 VER TODAS — CATEGORIAS
========================================================= */

function ligarLinksCategorias(){

  const mapa = {

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

      const area =
        document.getElementById(id);

      if(!area) return;

      const secao =
        area.closest("section");

      if(!secao) return;

      secao
        .querySelectorAll("a")
        .forEach(function(link){

          const textoLink =
            norm(link.textContent);

          if(
            textoLink.includes("ver todas")
          ){

            link.href = mapa[id];

            link.onclick =
              function(){

                location.href =
                  mapa[id];

              };

          }

        });

    });

}

/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 3/4 — ANÚNCIOS + FAVORITOS + BOTÕES
========================================================= */

/* =========================================================
📢 ANÚNCIOS ATIVOS
========================================================= */

async function carregarAnuncios(){

  const sec =
    document.getElementById(
      "anunciosAtivosSection"
    );

  const area =
    document.getElementById(
      "anunciosAtivos"
    );

  if(!sec || !area)
    return;

  if(!db){

    if(!iniciarSupabase()){

      sec.style.display = "none";

      return;

    }

  }

  try{

    const r =
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

    const dados =
      r.data || [];

    if(!dados.length){

      sec.style.display = "none";

      return;

    }

    sec.style.display = "block";

    area.innerHTML = "";

    dados.forEach(function(a){

      const el =
        document.createElement("div");

      el.className = "card";

      const tituloAnuncio =
        a.titulo ||
        "Anuncie no AfricanMundo";

      const textoAnuncio =
        a.texto ||
        "Divulgue a sua empresa, marca, produto ou serviço.";

      const imagemAnuncio =
        a.imagem ||
        a.imagem_url ||
        "";

      const linkAnuncio =
        a.url ||
        a.link ||
        a.url_original ||
        "";

      el.style.cssText = `
        overflow:hidden;
        border-radius:14px;
        margin-bottom:12px;
        background:var(--card,#fff);
        box-shadow:0 2px 10px rgba(0,0,0,.08);
        cursor:pointer;
      `;

      el.innerHTML = `

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

        <div style="
          padding:14px;
        ">

          <h3 style="
            margin:0 0 6px;
          ">
            📢 ${esc(tituloAnuncio)}
          </h3>

          <p style="
            margin:0;
            opacity:.75;
          ">
            ${esc(textoAnuncio)}
          </p>

        </div>
      `;

      if(linkAnuncio){

        el.onclick =
          function(){

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

    sec.style.display = "none";

  }

}

/* =========================================================
📢 GARANTIR ANUNCIE AQUI
========================================================= */

function prepararAnuncieAqui(){

  document
    .querySelectorAll("a,button,div")
    .forEach(function(el){

      const texto =
        norm(el.textContent);

      if(texto === "anuncie aqui"){

        el.style.cursor = "pointer";

        if(
          el.tagName !== "A" ||
          !el.getAttribute("href")
        ){

          el.onclick =
            function(){

              location.href =
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

  let favoritos =
    obterFavoritos();

  id = String(id);

  if(
    favoritos.includes(id)
  ){

    favoritos =
      favoritos.filter(
        function(x){

          return x !== id;

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

  const menu =
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

  const notificacao =
    document.getElementById(
      "notificationBtn"
    );

  const ferramentas =
    document.getElementById(
      "toolsBtn"
    );

  const utilizador =
    document.getElementById(
      "userBtn"
    );

  const tema =
    document.getElementById(
      "themeBtn"
    );

  const cor =
    document.getElementById(
      "colorBtn"
    );

  if(notificacao){

    notificacao.onclick =
      mostrarNotificacoes;

  }

  if(ferramentas){

    ferramentas.onclick =
      mostrarFerramentas;

  }

  if(utilizador){

    utilizador.onclick =
      mostrarUtilizador;

  }

  if(tema){

    tema.onclick =
      alternarTema;

  }

  if(cor){

    cor.onclick =
      escolherCor;

  }

}

/* =========================================================
🔎 PESQUISA
========================================================= */

function ligarPesquisa(){

  const form =
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

  const input =
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
📡 TESTAR SUPABASE
========================================================= */

async function testarSupabase(){

  if(!db){

    if(!iniciarSupabase())
      return false;

  }

  try{

    const r =
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

  const botoes =
    document.querySelectorAll(
      "[data-atualizar]"
    );

  botoes.forEach(function(b){

    b.disabled = true;

  });

  await carregarNoticias();

  botoes.forEach(function(b){

    b.disabled = false;

  });

}

/* =========================================================
🔄 ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

function iniciarAtualizacaoAutomatica(){

  setInterval(function(){

    if(document.visibilityState==="visible"){

      carregarNoticias();
      carregarAnuncios();

    }

  },5*60*1000);

}

/* =========================================================
🧹 FECHAR MODAL
========================================================= */

function iniciarFechoModal(){

  document.addEventListener("click",function(e){

    const m=document.getElementById("modal");

    if(m && e.target===m)
      fecharModal();

  });

  document.addEventListener("keydown",function(e){

    if(e.key==="Escape")
      fecharModal();

  });

}

/* =========================================================
🖼️ PROTEGER IMAGENS
========================================================= */

function iniciarProtecaoImagens(){

  document.addEventListener("error",function(e){

    const img=e.target;

    if(!img || img.tagName!=="IMG")
      return;

    if(
      (img.src||"")
      .startsWith("data:image/svg")
    )
      return;

    const svg=`
      <svg xmlns="http://www.w3.org/2000/svg"
        width="1200" height="700">

        <rect width="1200" height="700"
          fill="#168a45"/>

        <text x="60" y="110"
          fill="white"
          font-family="Arial"
          font-size="42"
          font-weight="bold">
          AFRICANMUNDO
        </text>

        <text x="60" y="350"
          fill="white"
          font-family="Arial"
          font-size="42"
          font-weight="bold">
          ${esc(
            img.alt ||
            "Notícia AfricanMundo"
          ).slice(0,55)}
        </text>

        <text x="60" y="620"
          fill="white"
          font-family="Arial"
          font-size="24">
          A informação que liga África ao mundo
        </text>

      </svg>
    `;

    img.src=
      "data:image/svg+xml;charset=UTF-8,"+
      encodeURIComponent(svg);

  },true);

}

/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 4/4 — INICIALIZAÇÃO FINAL
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
📱 INICIAR QUANDO A PÁGINA ESTIVER PRONTA
========================================================= */

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
     
