/* =========================================================
   🌍 AFRICANMUNDO — APP.JS PROFISSIONAL
   PARTE 1/6
========================================================= */


/* =========================================================
   CONFIGURAÇÃO SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";


let supabaseClient = null;


/* =========================================================
   INICIALIZAR SUPABASE
========================================================= */

function iniciarSupabase(){

  if(!window.supabase){

    console.error(
      "❌ Biblioteca Supabase não encontrada."
    );

    return false;
  }

  try{

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    console.log(
      "✅ Supabase conectado."
    );

    return true;

  }catch(error){

    console.error(
      "❌ Erro ao iniciar Supabase:",
      error
    );

    return false;
  }

}


/* =========================================================
   VARIÁVEL GLOBAL DE NOTÍCIAS
========================================================= */

window.__noticias = [];


/* =========================================================
   ESCAPAR HTML
========================================================= */

function esc(valor){

  return String(valor ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   NORMALIZAR CATEGORIA
========================================================= */

function normalizarCategoria(valor){

  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

}


/* =========================================================
   OBTER TÍTULO
========================================================= */

function obterTitulo(noticia){

  return (
    noticia?.titulo ||
    noticia?.title ||
    "Sem título"
  );

}


/* =========================================================
   OBTER TEXTO
========================================================= */

function obterTexto(noticia){

  return (
    noticia?.texto ||
    noticia?.conteudo ||
    noticia?.content ||
    noticia?.descricao ||
    ""
  );

}


/* =========================================================
   OBTER IMAGEM
========================================================= */

function obterImagem(noticia){

  return (
    noticia?.imagem ||
    noticia?.imagem_url ||
    noticia?.image ||
    noticia?.image_url ||
    noticia?.url_imagem ||
    ""
  );

}


/* =========================================================
   ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(noticia){

  if(!noticia || !noticia.id){

    alert(
      "Não foi possível identificar esta notícia."
    );

    return;
  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(noticia.id);

}


/* =========================================================
   ABRIR NOTÍCIA POR ID
========================================================= */

function abrirNoticiaPorId(id){

  if(!id) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}


/* =========================================================
   FORMATO DA DATA
========================================================= */

function formatarData(valor){

  if(!valor) return "";

  try{

    const data =
      new Date(valor);

    if(isNaN(data.getTime())){
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


/* =========================================================
   CRIAR CARTÃO DE NOTÍCIA
========================================================= */

function criarCard(noticia){

  const titulo =
    obterTitulo(noticia);

  const texto =
    obterTexto(noticia);

  const imagem =
    obterImagem(noticia);

  const categoria =
    noticia?.categoria ||
    noticia?.category ||
    "Notícias";

  const data =
    formatarData(
      noticia?.created_at ||
      noticia?.data ||
      noticia?.createdAt
    );


  const card =
    document.createElement("article");


  card.style.cssText = `
    background:var(--card);
    border:1px solid var(--border);
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 3px 12px #0000000b;
    transition:transform .2s ease, box-shadow .2s ease;
    cursor:pointer;
  `;


  card.onmouseenter = function(){

    card.style.transform =
      "translateY(-3px)";

    card.style.boxShadow =
      "0 7px 20px #00000014";

  };


  card.onmouseleave = function(){

    card.style.transform =
      "translateY(0)";

    card.style.boxShadow =
      "0 3px 12px #0000000b";

  };


  card.onclick = function(){

    abrirNoticia(noticia);

  };


  /* =====================================================
     IMAGEM
  ===================================================== */

  if(imagem){

    const img =
      document.createElement("img");

    img.src = imagem;

    img.alt = titulo;

    img.loading = "lazy";

    img.style.cssText = `
      width:100%;
      height:190px;
      object-fit:cover;
      display:block;
      background:var(--bg);
    `;

    img.onerror = function(){

      img.style.display =
        "none";

    };

    card.appendChild(img);

  }else{

    const semImagem =
      document.createElement("div");

    semImagem.style.cssText = `
      height:150px;
      display:grid;
      place-items:center;
      background:var(--bg);
      font-size:45px;
    `;

    semImagem.textContent =
      "🌍";

    card.appendChild(
      semImagem
    );

  }


  /* =====================================================
     CONTEÚDO
  ===================================================== */

  const conteudo =
    document.createElement("div");

  conteudo.style.cssText = `
    padding:14px;
  `;


  /* CATEGORIA */

  const cat =
    document.createElement("div");

  cat.textContent =
    categoria;

  cat.style.cssText = `
    color:var(--p);
    font-size:10px;
    font-weight:900;
    text-transform:uppercase;
    margin-bottom:6px;
  `;

  conteudo.appendChild(cat);


  /* TÍTULO */

  const h3 =
    document.createElement("div");

  h3.textContent =
    titulo;

  h3.style.cssText = `
    font-size:17px;
    font-weight:900;
    line-height:1.35;
  `;

  conteudo.appendChild(h3);


  /* TEXTO */

  if(texto){

    const resumo =
      document.createElement("div");

    resumo.textContent =
      texto.length > 120
        ? texto.substring(0,120) + "..."
        : texto;

    resumo.style.cssText = `
      margin-top:7px;
      color:var(--muted);
      font-size:12px;
      line-height:1.5;
    `;

    conteudo.appendChild(
      resumo
    );

  }


  /* DATA */

  if(data){

    const dataEl =
      document.createElement("div");

    dataEl.textContent =
      data;

    dataEl.style.cssText = `
      margin-top:9px;
      color:var(--muted);
      font-size:10px;
    `;

    conteudo.appendChild(
      dataEl
    );

  }


  /* LER */

  const ler =
    document.createElement("div");

  ler.textContent =
    "LER NOTÍCIA →";

  ler.style.cssText = `
    margin-top:10px;
    color:var(--p);
    font-size:11px;
    font-weight:900;
  `;

  conteudo.appendChild(
    ler
  );


  card.appendChild(
    conteudo
  );


  return card;

}


/* =========================================================
   RENDERIZAR LISTA
========================================================= */

function renderizarLista(id,lista){

  const elemento =
    document.getElementById(id);

  if(!elemento){

    console.warn(
      "⚠️ Área não encontrada:",
      id
    );

    return;
  }


  elemento.innerHTML = "";


  elemento.style.display =
    "grid";

  elemento.style.gap =
    "14px";


  if(!Array.isArray(lista) ||
     lista.length === 0){

    elemento.innerHTML = `
      <div style="
        grid-column:1/-1;
        padding:25px;
        text-align:center;
        background:var(--card);
        border:1px solid var(--border);
        border-radius:15px;
        color:var(--muted);
      ">
        Ainda não existem notícias
        nesta secção.
      </div>
    `;

    return;
  }


  lista
    .slice(0,8)
    .forEach(function(noticia){

      elemento.appendChild(
        criarCard(noticia)
      );

    });

}


/* =========================================================
   FIM DA PARTE 1
========================================================= */
/* =========================================================
   🌍 AFRICANMUNDO — APP.JS PROFISSIONAL
   PARTE 2/6
========================================================= */


/* =========================================================
   CARREGAR NOTÍCIAS DO SUPABASE
========================================================= */

async function carregarNoticias(){

  console.log(
    "🔄 AfricanMundo: carregando notícias..."
  );


  /* -------------------------------------------------------
     VERIFICAR SUPABASE
  ------------------------------------------------------- */

  if(!supabaseClient){

    const conectado =
      iniciarSupabase();

    if(!conectado){

      mostrarErroSupabase(
        "Não foi possível iniciar o Supabase."
      );

      return;
    }

  }


  try{

    /* -----------------------------------------------------
       BUSCAR NOTÍCIAS
    ----------------------------------------------------- */

    const resultado =
      await supabaseClient
        .from("noticias")
        .select("*")
        .order(
          "id",
          {
            ascending:false
          }
        );


    /* -----------------------------------------------------
       VERIFICAR ERRO
    ----------------------------------------------------- */

    if(resultado.error){

      console.error(
        "❌ Erro Supabase:",
        resultado.error
      );

      mostrarErroSupabase(
        resultado.error.message
      );

      return;
    }


    /* -----------------------------------------------------
       GUARDAR NOTÍCIAS
    ----------------------------------------------------- */

    const noticias =
      Array.isArray(resultado.data)
        ? resultado.data
        : [];


    window.__noticias =
      noticias;


    console.log(
      "✅ Notícias recebidas:",
      noticias.length
    );


    /* =====================================================
       DESTAQUE
    ===================================================== */

    renderizarDestaque(
      noticias
    );


    /* =====================================================
       ÚLTIMAS NOTÍCIAS
    ===================================================== */

    renderizarLista(
      "ultimas",
      noticias
    );


    /* =====================================================
       FUTEBOL
    ===================================================== */

    renderizarLista(
      "futebol",
      noticias.filter(function(noticia){

        return (
          normalizarCategoria(
            noticia.categoria
          ) === "futebol"
        );

      })
    );


    /* =====================================================
       MOÇAMBIQUE
    ===================================================== */

    renderizarLista(
      "mocambique",
      noticias.filter(function(noticia){

        return (
          normalizarCategoria(
            noticia.categoria
          ) === "mocambique"
        );

      })
    );


    /* =====================================================
       ÁFRICA
    ===================================================== */

    renderizarLista(
      "africa",
      noticias.filter(function(noticia){

        return (
          normalizarCategoria(
            noticia.categoria
          ) === "africa"
        );

      })
    );


    /* =====================================================
       NEGÓCIOS
    ===================================================== */

    renderizarLista(
      "negocios",
      noticias.filter(function(noticia){

        return (
          normalizarCategoria(
            noticia.categoria
          ) === "negocios"
        );

      })
    );


    /* =====================================================
       ENTRETENIMENTO
    ===================================================== */

    renderizarLista(
      "entretenimento",
      noticias.filter(function(noticia){

        return (
          normalizarCategoria(
            noticia.categoria
          ) === "entretenimento"
        );

      })
    );


    /* =====================================================
       DESPORTO
    ===================================================== */

    renderizarLista(
      "desporto",
      noticias.filter(function(noticia){

        return (
          normalizarCategoria(
            noticia.categoria
          ) === "desporto"
        );

      })
    );


    /* =====================================================
       NOTIFICAÇÕES
    ===================================================== */

    atualizarNotificacoes(
      noticias
    );


    console.log(
      "🎉 Todas as categorias foram processadas."
    );


  }catch(error){

    console.error(
      "❌ Falha ao carregar notícias:",
      error
    );


    mostrarErroSupabase(
      error.message ||
      "Erro desconhecido."
    );

  }

}


/* =========================================================
   RENDERIZAR DESTAQUE
========================================================= */

function renderizarDestaque(noticias){

  const elemento =
    document.getElementById(
      "destaque"
    );


  if(!elemento){

    console.warn(
      "⚠️ Área destaque não encontrada."
    );

    return;
  }


  elemento.innerHTML = "";


  if(
    !Array.isArray(noticias) ||
    noticias.length === 0
  ){

    elemento.innerHTML = `
      <div style="
        padding:28px;
        text-align:center;
        background:var(--card);
        border:1px solid var(--border);
        border-radius:16px;
        color:var(--muted);
      ">
        Ainda não existem notícias
        para destacar.
      </div>
    `;

    return;
  }


  const noticia =
    noticias[0];


  const card =
    criarCard(noticia);


  /* -------------------------------------------------------
     DESTAQUE MAIOR
  ------------------------------------------------------- */

  card.style.width =
    "100%";


  const imagem =
    card.querySelector("img");


  if(imagem){

    imagem.style.height =
      "280px";

  }


  const titulo =
    card.querySelector(
      "div div"
    );


  elemento.appendChild(
    card
  );

}


/* =========================================================
   MOSTRAR ERRO DO SUPABASE
========================================================= */

function mostrarErroSupabase(mensagem){

  const ids = [

    "destaque",
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


    if(!elemento){
      return;
    }


    elemento.innerHTML = `
      <div style="
        padding:22px;
        background:var(--card);
        border:1px solid var(--border);
        border-radius:15px;
        text-align:center;
      ">

        <div style="
          font-size:32px;
          margin-bottom:8px;
        ">
          ⚠️
        </div>

        <strong>
          Não foi possível carregar
          as notícias.
        </strong>

        <div style="
          margin-top:8px;
          color:var(--muted);
          font-size:12px;
          line-height:1.5;
        ">
          ${esc(
            mensagem ||
            "Verifique a ligação com o Supabase."
          )}
        </div>

      </div>
    `;

  });

}


/* =========================================================
   ATUALIZAR NOTIFICAÇÕES
========================================================= */

function atualizarNotificacoes(noticias){

  const botao =
    document.getElementById(
      "notificationBtn"
    );


  if(!botao){
    return;
  }


  const quantidade =
    Array.isArray(noticias)
      ? noticias.length
      : 0;


  let contador =
    botao.querySelector(
      ".notification-count"
    );


  if(!contador){

    contador =
      document.createElement(
        "span"
      );


    contador.className =
      "notification-count";


    contador.style.cssText = `
      position:absolute;
      top:-5px;
      right:-5px;
      min-width:18px;
      height:18px;
      padding:0 4px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#e53935;
      color:#fff;
      border-radius:50px;
      font-size:9px;
      font-weight:900;
      border:2px solid var(--card);
      z-index:50;
    `;


    botao.style.position =
      "relative";


    botao.appendChild(
      contador
    );

  }


  if(quantidade > 0){

    contador.textContent =
      quantidade > 99
        ? "99+"
        : quantidade;


    contador.style.display =
      "flex";

  }else{

    contador.style.display =
      "none";

  }

}


/* =========================================================
   FIM DA PARTE 2
========================================================= */
/* =========================================================
   🌍 AFRICANMUNDO — APP.JS PROFISSIONAL
   PARTE 3/6
========================================================= */


/* =========================================================
   FAVORITOS
========================================================= */

function obterFavoritos(){

  try{

    const dados =
      localStorage.getItem(
        "africanmundo_favoritos"
      );

    const favoritos =
      dados
        ? JSON.parse(dados)
        : [];

    return Array.isArray(favoritos)
      ? favoritos
      : [];

  }catch(error){

    console.error(
      "❌ Erro ao ler favoritos:",
      error
    );

    return [];

  }

}


/* =========================================================
   GUARDAR FAVORITO
========================================================= */

function guardarFavorito(noticia){

  if(!noticia || !noticia.id){

    alert(
      "Não foi possível guardar esta notícia."
    );

    return;
  }


  const favoritos =
    obterFavoritos();


  const existe =
    favoritos.some(function(item){

      return String(item.id) ===
             String(noticia.id);

    });


  if(existe){

    abrirModal(
      "❤️ Favoritos",
      `
        <div style="
          text-align:center;
          padding:15px;
        ">

          <div style="
            font-size:45px;
          ">
            ❤️
          </div>

          <h3>
            Já está nos favoritos
          </h3>

          <p style="
            color:var(--muted);
            line-height:1.5;
          ">
            Esta notícia já foi guardada.
          </p>

        </div>
      `
    );

    return;
  }


  favoritos.unshift(
    noticia
  );


  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );


  abrirModal(
    "❤️ Favoritos",
    `
      <div style="
        text-align:center;
        padding:15px;
      ">

        <div style="
          font-size:45px;
        ">
          ❤️
        </div>

        <h3>
          Notícia guardada!
        </h3>

        <p style="
          color:var(--muted);
          line-height:1.5;
        ">
          A notícia foi adicionada
          aos seus favoritos.
        </p>

      </div>
    `
  );

}


/* =========================================================
   REMOVER FAVORITO
========================================================= */

function removerFavorito(indice){

  const favoritos =
    obterFavoritos();


  indice =
    Number(indice);


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

}


/* =========================================================
   ABRIR FAVORITOS
========================================================= */

function abrirFavoritos(){

  const favoritos =
    obterFavoritos();


  if(!favoritos.length){

    abrirModal(
      "❤️ Meus favoritos",
      `
        <div style="
          text-align:center;
          padding:20px;
        ">

          <div style="
            font-size:50px;
          ">
            ❤️
          </div>

          <h3>
            Nenhuma notícia guardada
          </h3>

          <p style="
            color:var(--muted);
            line-height:1.6;
          ">
            As notícias que guardar
            aparecerão nesta área.
          </p>

        </div>
      `
    );

    return;
  }


  let html = `
    <div style="
      display:grid;
      gap:12px;
    ">
  `;


  favoritos.forEach(
    function(noticia,index){

      const titulo =
        obterTitulo(noticia);


      const categoria =
        noticia.categoria ||
        noticia.category ||
        "Notícias";


      const imagem =
        obterImagem(noticia);


      html += `

        <div style="
          background:var(--bg);
          border:1px solid var(--border);
          border-radius:14px;
          overflow:hidden;
        ">

          ${
            imagem
              ? `
                <img
                  src="${esc(imagem)}"
                  alt="${esc(titulo)}"
                  style="
                    width:100%;
                    height:140px;
                    object-fit:cover;
                    display:block;
                  "
                  onerror="
                    this.style.display='none';
                  "
                >
              `
              : `
                <div style="
                  height:100px;
                  display:grid;
                  place-items:center;
                  font-size:38px;
                ">
                  🌍
                </div>
              `
          }

          <div style="
            padding:12px;
          ">

            <div style="
              color:var(--p);
              font-size:10px;
              font-weight:900;
              text-transform:uppercase;
              margin-bottom:5px;
            ">
              ${esc(categoria)}
            </div>

            <div style="
              font-weight:900;
              line-height:1.4;
              margin-bottom:10px;
            ">
              ${esc(titulo)}
            </div>


            <div style="
              display:flex;
              gap:8px;
              flex-wrap:wrap;
            ">

              <button
                onclick="abrirNoticiaPorId('${String(noticia.id).replace(/'/g,"\\'")}')"
                style="
                  flex:1;
                  min-width:120px;
                  padding:10px;
                  border:0;
                  border-radius:10px;
                  background:var(--p);
                  color:#fff;
                  font-weight:900;
                  cursor:pointer;
                "
              >
                LER NOTÍCIA
              </button>


              <button
                onclick="removerFavorito(${index})"
                style="
                  padding:10px 13px;
                  border:0;
                  border-radius:10px;
                  background:#e53935;
                  color:#fff;
                  font-weight:900;
                  cursor:pointer;
                "
              >
                🗑️
              </button>

            </div>

          </div>

        </div>

      `;

    }
  );


  html += `
    </div>
  `;


  abrirModal(
    "❤️ Meus favoritos",
    html
  );

}


/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function abrirNotificacoes(){

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];


  if(!noticias.length){

    abrirModal(
      "🔔 Notificações",
      `
        <div style="
          text-align:center;
          padding:20px;
        ">

          <div style="
            font-size:50px;
          ">
            🔔
          </div>

          <h3>
            Nenhuma novidade
          </h3>

          <p style="
            color:var(--muted);
            line-height:1.6;
          ">
            As novas notícias aparecerão
            aqui quando forem publicadas.
          </p>

        </div>
      `
    );

    return;
  }


  let html = `
    <div style="
      display:grid;
      gap:9px;
    ">
  `;


  noticias
    .slice(0,10)
    .forEach(function(noticia){

      const titulo =
        obterTitulo(noticia);


      const categoria =
        noticia.categoria ||
        noticia.category ||
        "Notícias";


      html += `

        <button
          onclick="abrirNoticiaPorId('${String(noticia.id).replace(/'/g,"\\'")}')"
          style="
            width:100%;
            padding:13px;
            border:1px solid var(--border);
            border-radius:12px;
            background:var(--bg);
            color:var(--txt);
            text-align:left;
            cursor:pointer;
          "
        >

          <div style="
            color:var(--p);
            font-size:10px;
            font-weight:900;
            text-transform:uppercase;
            margin-bottom:5px;
          ">
            ${esc(categoria)}
          </div>

          <div style="
            font-weight:900;
            line-height:1.4;
          ">
            ${esc(titulo)}
          </div>

        </button>

      `;

    });


  html += `
    </div>
  `;


  abrirModal(
    "🔔 Últimas novidades",
    html
  );

}


/* =========================================================
   PARTILHAR AFRICANMUNDO
========================================================= */

async function compartilharSite(){

  const dados = {

    title:
      "AfricanMundo",

    text:
      "A informação que liga África ao mundo.",

    url:
      window.location.href

  };


  if(
    navigator.share
  ){

    try{

      await navigator.share(
        dados
      );

    }catch(error){

      console.log(
        "Partilha cancelada."
      );

    }

    return;
  }


  copiarLinkSite();

}


/* =========================================================
   COPIAR LINK
========================================================= */

async function copiarLinkSite(){

  const link =
    window.location.href;


  try{

    if(
      navigator.clipboard &&
      window.isSecureContext
    ){

      await navigator.clipboard.writeText(
        link
      );

      abrirModal(
        "🔗 Link copiado",
        `
          <div style="
            text-align:center;
            padding:15px;
          ">

            <div style="
              font-size:45px;
            ">
              🔗
            </div>

            <h3>
              Link copiado!
            </h3>

            <p style="
              color:var(--muted);
            ">
              Agora podes enviar o
              AfricanMundo para outras pessoas.
            </p>

          </div>
        `
      );

      return;

    }


    alert(
      "Link do AfricanMundo:\n\n" +
      link
    );


  }catch(error){

    alert(
      "Link do AfricanMundo:\n\n" +
      link
    );

  }

}


/* =========================================================
   GUARDAR SITE
========================================================= */

function salvarSite(){

  abrirModal(
    "⭐ Guardar AfricanMundo",
    `
      <div style="
        text-align:center;
        padding:15px;
      ">

        <div style="
          font-size:48px;
        ">
          ⭐
        </div>

        <h3>
          Guardar AfricanMundo
        </h3>

        <p style="
          color:var(--muted);
          line-height:1.6;
        ">
          No navegador do seu telemóvel,
          abra o menu e escolha
          <strong>
            Adicionar aos favoritos
          </strong>.
        </p>

      </div>
    `
  );

}


/* =========================================================
   FIM DA PARTE 3
========================================================= */
/* ==========================================
   AFRICANMUNDO — PARTE 4
   SISTEMA DE INTERAÇÃO
========================================== */


/* ==========================================
   ABRIR NOTÍCIA
========================================== */

function abrirNoticia(noticia){

  if(!noticia || !noticia.id){

    alert("Não foi possível identificar esta notícia.");
    return;

  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(noticia.id);

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


function guardarFavorito(noticia){

  if(!noticia || !noticia.id){

    return;

  }

  const favoritos =
    obterFavoritos();

  const existe =
    favoritos.some(
      n =>
        String(n.id) ===
        String(noticia.id)
    );

  if(existe){

    abrirModal(
      "❤️ Favoritos",
      `
      <div style="
        text-align:center;
        padding:15px;
      ">

        <div style="
          font-size:42px;
          margin-bottom:10px;
        ">
          ❤️
        </div>

        <h3>
          Já está nos favoritos
        </h3>

        <p style="
          color:var(--muted);
        ">
          Esta notícia já foi guardada.
        </p>

      </div>
      `
    );

    return;

  }

  favoritos.unshift(noticia);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  abrirModal(
    "❤️ Favoritos",
    `
    <div style="
      text-align:center;
      padding:15px;
    ">

      <div style="
        font-size:42px;
        margin-bottom:10px;
      ">
        ❤️
      </div>

      <h3>
        Notícia guardada!
      </h3>

      <p style="
        color:var(--muted);
      ">
        A notícia foi adicionada aos seus favoritos.
      </p>

    </div>
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
      "❤️ Meus favoritos",
      `
      <div style="
        text-align:center;
        padding:20px;
      ">

        <div style="
          font-size:45px;
        ">
          ❤️
        </div>

        <h3>
          Nenhuma notícia guardada
        </h3>

        <p style="
          color:var(--muted);
        ">
          As notícias que guardar aparecerão aqui.
        </p>

      </div>
      `
    );

    return;

  }

  let html = `
    <div style="
      display:grid;
      gap:12px;
    ">
  `;

  favoritos.forEach(
    function(noticia,index){

      const titulo =
        noticia.titulo ||
        noticia.title ||
        "Sem título";

      const categoria =
        noticia.categoria ||
        noticia.category ||
        "Notícias";

      const imagem =
        noticia.imagem ||
        noticia.imagem_url ||
        noticia.image ||
        noticia.image_url ||
        noticia.url_imagem ||
        "";

      html += `

        <div style="
          display:flex;
          gap:10px;
          align-items:center;
          padding:10px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
        ">

          ${
            imagem
            ?
            `
            <img
              src="${esc(imagem)}"
              style="
                width:70px;
                height:60px;
                object-fit:cover;
                border-radius:8px;
                flex-shrink:0;
              "
            >
            `
            :
            `
            <div style="
              width:70px;
              height:60px;
              display:grid;
              place-items:center;
              background:var(--card);
              border-radius:8px;
              font-size:28px;
              flex-shrink:0;
            ">
              🌍
            </div>
            `
          }

          <div style="
            flex:1;
            min-width:0;
          ">

            <div style="
              color:var(--p);
              font-size:10px;
              font-weight:900;
              text-transform:uppercase;
            ">
              ${esc(categoria)}
            </div>

            <div style="
              font-weight:900;
              font-size:13px;
              margin-top:4px;
            ">
              ${esc(titulo)}
            </div>

            <button
              onclick="abrirNoticiaPorId('${String(noticia.id).replace(/'/g,"\\'")}')"
              style="
                margin-top:7px;
                border:0;
                background:none;
                color:var(--p);
                font-weight:900;
                padding:0;
                cursor:pointer;
              "
            >
              LER →
            </button>

            <button
              onclick="removerFavorito(${index})"
              style="
                margin-left:10px;
                border:0;
                background:none;
                color:#e53935;
                font-weight:900;
                padding:0;
                cursor:pointer;
              "
            >
              🗑️
            </button>

          </div>

        </div>

      `;

    }
  );

  html += `
    </div>
  `;

  abrirModal(
    "❤️ Meus favoritos",
    html
  );

}


/* ==========================================
   REMOVER FAVORITO
========================================== */

function removerFavorito(index){

  const favoritos =
    obterFavoritos();

  if(
    index < 0 ||
    index >= favoritos.length
  ){

    return;

  }

  favoritos.splice(index,1);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  abrirFavoritos();

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
    encodeURIComponent(id);

}


/* ==========================================
   NOTIFICAÇÕES
========================================== */

function atualizarNotificacoes(noticias){

  const botao =
    document.getElementById(
      "notificationBtn"
    );

  if(!botao){

    return;

  }

  const quantidade =
    Array.isArray(noticias)
    ? noticias.length
    : 0;

  let contador =
    botao.querySelector(
      ".notification-count"
    );

  if(!contador){

    contador =
      document.createElement(
        "span"
      );

    contador.className =
      "notification-count";

    botao.style.position =
      "relative";

    botao.appendChild(
      contador
    );

  }

  if(quantidade > 0){

    contador.textContent =
      quantidade > 99
      ? "99+"
      : quantidade;

    contador.style.display =
      "flex";

  }else{

    contador.style.display =
      "none";

  }

}


/* ==========================================
   ABRIR NOTIFICAÇÕES
========================================== */

function abrirNotificacoes(){

  const noticias =
    Array.isArray(
      window.__noticias
    )
    ?
    window.__noticias
    :
    [];

  if(!noticias.length){

    abrirModal(
      "🔔 Notificações",
      `
      <div style="
        text-align:center;
        padding:20px;
      ">

        <div style="
          font-size:42px;
        ">
          🔔
        </div>

        <h3>
          Nenhuma novidade
        </h3>

        <p style="
          color:var(--muted);
        ">
          As novas notícias aparecerão aqui
          quando forem publicadas.
        </p>

      </div>
      `
    );

    return;

  }

  let html = `
    <div style="
      display:grid;
      gap:10px;
    ">
  `;

  noticias
    .slice(0,10)
    .forEach(
      function(noticia){

        const titulo =
          noticia.titulo ||
          noticia.title ||
          "Nova notícia";

        const categoria =
          noticia.categoria ||
          noticia.category ||
          "Notícias";

        html += `

          <button
            onclick="abrirNoticiaPorId('${String(noticia.id).replace(/'/g,"\\'")}')"
            style="
              text-align:left;
              width:100%;
              padding:13px;
              border:1px solid var(--border);
              border-radius:12px;
              background:var(--bg);
              color:var(--txt);
              cursor:pointer;
            "
          >

            <div style="
              color:var(--p);
              font-size:10px;
              font-weight:900;
              text-transform:uppercase;
              margin-bottom:5px;
            ">
              ${esc(categoria)}
            </div>

            <div style="
              font-weight:900;
              line-height:1.4;
            ">
              ${esc(titulo)}
            </div>

          </button>

        `;

      }
    );

  html += `
    </div>
  `;

  abrirModal(
    "🔔 Últimas novidades",
    html
  );

}


/* ==========================================
   MODO ESCURO
========================================== */

function alternarTema(){

  const ativo =
    document.body.classList.toggle(
      "dark"
    );

  localStorage.setItem(
    "africanmundo_dark",
    ativo
    ? "1"
    : "0"
  );

}


/* ==========================================
   CARREGAR MODO ESCURO
========================================== */

function carregarTema(){

  const tema =
    localStorage.getItem(
      "africanmundo_dark"
    );

  if(tema === "1"){

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
   TAMANHO DO TEXTO
========================================== */

function alterarTamanhoTexto(){

  const atual =
    Number(
      localStorage.getItem(
        "africanmundo_tamanho_texto"
      )
    ) || 100;

  let novo =
    atual + 10;

  if(novo > 130){

    novo = 80;

  }

  document.documentElement.style.fontSize =
    novo + "%";

  localStorage.setItem(
    "africanmundo_tamanho_texto",
    novo
  );

  abrirModal(
    "🔠 Tamanho do texto",
    `
    <div style="
      text-align:center;
      padding:15px;
    ">

      <div style="
        font-size:40px;
      ">
        🔠
      </div>

      <h3>
        Tamanho: ${novo}%
      </h3>

      <p style="
        color:var(--muted);
      ">
        O tamanho do texto foi alterado.
      </p>

    </div>
    `
  );

}


function carregarTamanhoTexto(){

  const tamanho =
    Number(
      localStorage.getItem(
        "africanmundo_tamanho_texto"
      )
    ) || 100;

  document.documentElement.style.fontSize =
    tamanho + "%";

}


/* ==========================================
   PARTILHAR AFRICANMUNDO
========================================== */

async function compartilharSite(){

  const dados = {

    title:
      "AfricanMundo",

    text:
      "A informação que liga África ao mundo.",

    url:
      window.location.href

  };

  if(navigator.share){

    try{

      await navigator.share(
        dados
      );

    }catch(e){

      console.log(
        "Partilha cancelada."
      );

    }

    return;

  }

  copiarLinkSite();

}


/* ==========================================
   COPIAR LINK
========================================== */

async function copiarLinkSite(){

  const link =
    window.location.href;

  try{

    await navigator.clipboard.writeText(
      link
    );

    abrirModal(
      "🔗 Link copiado",
      `
      <div style="
        text-align:center;
        padding:15px;
      ">

        <div style="
          font-size:42px;
        ">
          🔗
        </div>

        <h3>
          Link copiado!
        </h3>

        <p style="
          color:var(--muted);
        ">
          Agora podes enviar o AfricanMundo
          para outras pessoas.
        </p>

      </div>
      `
    );

  }catch(e){

    alert(
      "Link do AfricanMundo:\n" +
      link
    );

  }

             }
/* ==========================================
   AFRICANMUNDO — PARTE 5
   FERRAMENTAS • UTILIZADOR • CORES
========================================== */


/* ==========================================
   GUARDAR SITE
========================================== */

function salvarSite(){

  abrirModal(
    "⭐ Guardar AfricanMundo",
    `
    <div style="
      text-align:center;
      padding:15px;
    ">

      <div style="
        font-size:45px;
        margin-bottom:10px;
      ">
        ⭐
      </div>

      <h3>
        Guardar AfricanMundo
      </h3>

      <p style="
        color:var(--muted);
        line-height:1.6;
      ">
        Abra o menu do navegador e escolha
        <b>Adicionar aos favoritos</b>
        para guardar o AfricanMundo.
      </p>

    </div>
    `
  );

}


/* ==========================================
   INFORMAÇÕES DO SITE
========================================== */

function mostrarInfo(tipo){

  const textos = {

    "Quem Somos": `
      <div style="
        line-height:1.7;
        color:var(--muted);
      ">
        <h3 style="
          color:var(--txt);
          margin-top:0;
        ">
          🌍 Quem Somos
        </h3>

        <p>
          O AfricanMundo é um portal de informação
          dedicado a Moçambique, África e ao mundo.
        </p>

        <p>
          O nosso objetivo é aproximar os leitores
          das principais notícias e acontecimentos.
        </p>
      </div>
    `,

    "Anuncie": `
      <div style="
        text-align:center;
        padding:10px;
      ">

        <div style="
          font-size:42px;
        ">
          📢
        </div>

        <h3>
          Anuncie no AfricanMundo
        </h3>

        <p style="
          color:var(--muted);
          line-height:1.6;
        ">
          Divulgue a sua empresa, marca,
          produto, serviço ou evento através
          do AfricanMundo.
        </p>

        <button
          onclick="window.location.href='contacto.html'"
          style="
            border:0;
            padding:12px 20px;
            border-radius:10px;
            background:var(--p);
            color:#fff;
            font-weight:900;
            cursor:pointer;
          "
        >
          CONTACTAR →
        </button>

      </div>
    `,

    "Contacto": `
      <div style="
        text-align:center;
        padding:10px;
      ">

        <div style="
          font-size:42px;
        ">
          📩
        </div>

        <h3>
          Contacto
        </h3>

        <p style="
          color:var(--muted);
          line-height:1.6;
        ">
          Para informações, publicidade
          ou outras questões, entre em
          contacto com a equipa AfricanMundo.
        </p>

        <button
          onclick="window.location.href='contacto.html'"
          style="
            border:0;
            padding:12px 20px;
            border-radius:10px;
            background:var(--p);
            color:#fff;
            font-weight:900;
            cursor:pointer;
          "
        >
          ABRIR CONTACTO →
        </button>

      </div>
    `

  };

  abrirModal(
    tipo,
    textos[tipo] ||
    `
    <p style="
      text-align:center;
      color:var(--muted);
    ">
      Informação indisponível.
    </p>
    `
  );

}


/* ==========================================
   REDES SOCIAIS
========================================== */

function abrirRedes(){

  abrirModal(
    "🌐 AfricanMundo nas redes",
    `

    <div style="
      display:grid;
      gap:10px;
    ">

      <a
        href="https://www.google.com/search?q=AfricanMundo"
        target="_blank"
        rel="noopener"
        style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          text-decoration:none;
          font-weight:900;
          border:1px solid var(--border);
        "
      >
        <span style="font-size:22px">🔎</span>
        <span>Google</span>
      </a>


      <a
        href="https://www.facebook.com/"
        target="_blank"
        rel="noopener"
        style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          text-decoration:none;
          font-weight:900;
          border:1px solid var(--border);
        "
      >
        <span style="font-size:22px">🔵</span>
        <span>Facebook</span>
      </a>


      <a
        href="https://www.youtube.com/"
        target="_blank"
        rel="noopener"
        style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          text-decoration:none;
          font-weight:900;
          border:1px solid var(--border);
        "
      >
        <span style="font-size:22px">▶️</span>
        <span>YouTube</span>
      </a>


      <a
        href="https://wa.me/"
        target="_blank"
        rel="noopener"
        style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          text-decoration:none;
          font-weight:900;
          border:1px solid var(--border);
        "
      >
        <span style="font-size:22px">🟢</span>
        <span>WhatsApp</span>
      </a>


      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noopener"
        style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          text-decoration:none;
          font-weight:900;
          border:1px solid var(--border);
        "
      >
        <span style="font-size:22px">📷</span>
        <span>Instagram</span>
      </a>


      <a
        href="https://www.tiktok.com/"
        target="_blank"
        rel="noopener"
        style="
          display:flex;
          align-items:center;
          gap:12px;
          padding:14px;
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          text-decoration:none;
          font-weight:900;
          border:1px solid var(--border);
        "
      >
        <span style="font-size:22px">🎵</span>
        <span>TikTok</span>
      </a>

    </div>

    `
  );

}


/* ==========================================
   CORES
========================================== */

function abrirCores(){

  abrirModal(
    "🎨 Escolher cor",
    `

    <div style="
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
    ">

      <button
        onclick="mudarCor('green')"
        style="
          padding:16px;
          border:0;
          border-radius:12px;
          background:#198754;
          color:white;
          font-weight:900;
          cursor:pointer;
        "
      >
        🌿 Verde
      </button>


      <button
        onclick="mudarCor('blue')"
        style="
          padding:16px;
          border:0;
          border-radius:12px;
          background:#1976d2;
          color:white;
          font-weight:900;
          cursor:pointer;
        "
      >
        🔵 Azul
      </button>


      <button
        onclick="mudarCor('red')"
        style="
          padding:16px;
          border:0;
          border-radius:12px;
          background:#d32f2f;
          color:white;
          font-weight:900;
          cursor:pointer;
        "
      >
        🔴 Vermelho
      </button>


      <button
        onclick="mudarCor('purple')"
        style="
          padding:16px;
          border:0;
          border-radius:12px;
          background:#7b1fa2;
          color:white;
          font-weight:900;
          cursor:pointer;
        "
      >
        🟣 Roxo
      </button>


      <button
        onclick="mudarCor('orange')"
        style="
          grid-column:1/-1;
          padding:16px;
          border:0;
          border-radius:12px;
          background:#ef6c00;
          color:white;
          font-weight:900;
          cursor:pointer;
        "
      >
        🟠 Laranja
      </button>

    </div>

    `
  );

}


/* ==========================================
   ALTERAR COR
========================================== */

function mudarCor(cor){

  document.body.classList.remove(
    "color-blue",
    "color-red",
    "color-purple",
    "color-orange"
  );

  if(cor !== "green"){

    document.body.classList.add(
      "color-" + cor
    );

  }

  localStorage.setItem(
    "africanmundo_cor",
    cor
  );

  fecharModal();

}


/* ==========================================
   CARREGAR COR
========================================== */

function carregarCor(){

  const cor =
    localStorage.getItem(
      "africanmundo_cor"
    );

  document.body.classList.remove(
    "color-blue",
    "color-red",
    "color-purple",
    "color-orange"
  );

  if(
    cor &&
    cor !== "green"
  ){

    document.body.classList.add(
      "color-" + cor
    );

  }

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
        onclick="carregarNoticias(); fecharModal();"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        🔄 Atualizar notícias

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Verificar as notícias mais recentes
        </small>

      </button>


      <button
        onclick="alternarTema()"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        🌙 Modo escuro

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Alternar entre modo claro e escuro
        </small>

      </button>


      <button
        onclick="compartilharSite()"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        📤 Partilhar AfricanMundo

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Enviar o site para outras pessoas
        </small>

      </button>


      <button
        onclick="copiarLinkSite()"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        🔗 Copiar link

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Copiar o endereço do AfricanMundo
        </small>

      </button>


      <button
        onclick="salvarSite()"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        ⭐ Guardar AfricanMundo

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Guardar o site no navegador
        </small>

      </button>


      <button
        onclick="alterarTamanhoTexto()"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        🔠 Tamanho do texto

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Ajustar o tamanho das letras
        </small>

      </button>


      <button
        onclick="window.print()"
        style="
          text-align:left;
          padding:15px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >
        🖨️ Imprimir página

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Preparar a página para impressão
        </small>

      </button>


    </div>

    `
  );

}


/* ==========================================
   CONFIGURAÇÕES DO UTILIZADOR
========================================== */

function abrirConfiguracoesUsuario(){

  abrirModal(
    "⚙️ Configurações",
    `

    <div style="
      display:grid;
      gap:10px;
    ">

      <button
        onclick="alternarTema()"
        style="
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
        "
      >
        🌙 Aparência

        <small style="
          display:block;
          color:var(--muted);
          margin-top:4px;
          font-weight:500;
        ">
          Alternar entre modo claro e escuro
        </small>

      </button>


      <button
        onclick="alterarTamanhoTexto()"
        style="
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
        "
      >
        🔠 Tamanho do texto

        <small style="
          display:block;
          color:var(--muted);
          margin-top:4px;
          font-weight:500;
        ">
          Ajustar o tamanho das letras
        </small>

      </button>


      <button
        onclick="abrirFavoritos()"
        style="
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
        "
      >
        ❤️ Favoritos

        <small style="
          display:block;
          color:var(--muted);
          margin-top:4px;
          font-weight:500;
        ">
          Gerir as notícias guardadas
        </small>

      </button>

    </div>

    `
  );

     }
/* ==========================================
   AFRICANMUNDO — PARTE 6
   UTILIZADOR • BOTÕES • RESPONSIVIDADE
========================================== */


/* ==========================================
   PAINEL DO UTILIZADOR
========================================== */

function abrirUsuario(){

  abrirModal(
    "👤 Minha área",
    `

    <div style="
      text-align:center;
      padding:5px 0 15px;
    ">

      <div style="
        width:70px;
        height:70px;
        margin:0 auto 12px;
        border-radius:50%;
        display:grid;
        place-items:center;
        background:var(--p);
        color:#fff;
        font-size:34px;
      ">
        👤
      </div>

      <h3 style="
        margin:0 0 7px;
      ">
        Bem-vindo ao AfricanMundo
      </h3>

      <p style="
        color:var(--muted);
        line-height:1.5;
        margin:0 0 18px;
      ">
        Personalize a sua experiência
        e aceda rapidamente às suas notícias.
      </p>

    </div>


    <div style="
      display:grid;
      gap:10px;
    ">


      <button
        onclick="abrirFavoritos()"
        style="
          width:100%;
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >

        ❤️ Meus favoritos

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Notícias que guardaste
        </small>

      </button>


      <button
        onclick="abrirNotificacoes()"
        style="
          width:100%;
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >

        🔔 Minhas notificações

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Ver as últimas novidades
        </small>

      </button>


      <button
        onclick="abrirFerramentas()"
        style="
          width:100%;
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >

        🛠️ Ferramentas

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Opções e personalização
        </small>

      </button>


      <button
        onclick="abrirConfiguracoesUsuario()"
        style="
          width:100%;
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >

        ⚙️ Configurações

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Preferências do AfricanMundo
        </small>

      </button>


      <button
        onclick="abrirRedes()"
        style="
          width:100%;
          padding:15px;
          text-align:left;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          font-weight:900;
          cursor:pointer;
        "
      >

        🌐 Redes sociais

        <small style="
          display:block;
          margin-top:4px;
          color:var(--muted);
          font-weight:500;
        ">
          Facebook, YouTube, WhatsApp,
          Instagram, TikTok e Google
        </small>

      </button>

    </div>

    `
  );

}


/* ==========================================
   BOTÕES PRINCIPAIS
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    const userBtn =
      document.getElementById(
        "userBtn"
      );

    if(userBtn){

      userBtn.onclick =
        abrirUsuario;

    }


    const toolsBtn =
      document.getElementById(
        "toolsBtn"
      );

    if(toolsBtn){

      toolsBtn.onclick =
        abrirFerramentas;

    }


    const colorBtn =
      document.getElementById(
        "colorBtn"
      );

    if(colorBtn){

      colorBtn.onclick =
        abrirCores;

    }


    const notificationBtn =
      document.getElementById(
        "notificationBtn"
      );

    if(notificationBtn){

      notificationBtn.onclick =
        abrirNotificacoes;

    }


    const favoriteBtn =
      document.getElementById(
        "favoriteBtn"
      );

    if(favoriteBtn){

      favoriteBtn.onclick =
        abrirFavoritos;

    }


    const shareBtn =
      document.getElementById(
        "shareBtn"
      );

    if(shareBtn){

      shareBtn.onclick =
        compartilharSite;

    }


    const socialBtn =
      document.getElementById(
        "socialBtn"
      );

    if(socialBtn){

      socialBtn.onclick =
        abrirRedes;

    }


    const darkBtn =
      document.getElementById(
        "darkBtn"
      );

    if(darkBtn){

      darkBtn.onclick =
        alternarTema;

    }


    carregarTema();
    carregarCor();
    carregarTamanhoTexto();

  }
);


/* ==========================================
   RESPONSIVIDADE PROFISSIONAL
========================================== */

(function(){

  const style =
    document.createElement(
      "style"
    );

  style.textContent = `

    /* ==============================
       CONTADORES
    ============================== */

    .notification-count{

      position:absolute;

      top:-5px;
      right:-5px;

      min-width:18px;
      height:18px;

      padding:0 4px;

      display:flex;

      align-items:center;
      justify-content:center;

      background:#e53935;

      color:#fff;

      border-radius:20px;

      font-size:9px;

      font-weight:900;

      border:2px solid var(--card);

      z-index:20;

    }


    /* ==============================
       CARTÕES
    ============================== */

    #ultimas,
    #futebol,
    #mocambique,
    #africa,
    #negocios,
    #entretenimento,
    #desporto{

      display:grid;

      grid-template-columns:
      repeat(4,minmax(0,1fr));

      gap:14px;

      width:100%;

    }


    /* ==============================
       IMAGENS
    ============================== */

    #ultimas img,
    #futebol img,
    #mocambique img,
    #africa img,
    #negocios img,
    #entretenimento img,
    #desporto img{

      max-width:100%;

    }


    /* ==============================
       TABLET
    ============================== */

    @media(max-width:900px){

      #ultimas,
      #futebol,
      #mocambique,
      #africa,
      #negocios,
      #entretenimento,
      #desporto{

        grid-template-columns:
        repeat(3,minmax(0,1fr));

      }

    }


    /* ==============================
       TELEMÓVEL
    ============================== */

    @media(max-width:650px){

      #ultimas,
      #futebol,
      #mocambique,
      #africa,
      #negocios,
      #entretenimento,
      #desporto{

        grid-template-columns:
        repeat(2,minmax(0,1fr));

        gap:10px;

      }

    }


    /* ==============================
       TELEMÓVEL PEQUENO
    ============================== */

    @media(max-width:420px){

      #ultimas,
      #futebol,
      #mocambique,
      #africa,
      #negocios,
      #entretenimento,
      #desporto{

        grid-template-columns:1fr;

      }

    }


    /* ==============================
       BOTÕES
    ============================== */

    button,
    a{

      -webkit-tap-highlight-color:
      transparent;

    }


    button{

      font-family:inherit;

    }


    /* ==============================
       IMAGENS DOS CARTÕES
    ============================== */

    .noticia-card img{

      width:100%;

      height:190px;

      object-fit:cover;

      display:block;

    }


    /* ==============================
       MODAL
    ============================== */

    .modal-content{

      max-width:600px;

      width:calc(100% - 24px);

    }


    @media(max-width:500px){

      .modal-content{

        width:calc(100% - 16px);

      }

    }

  `;

  document.head.appendChild(
    style
  );

})();


/* ==========================================
   DISPONIBILIZAR FUNÇÕES GLOBALMENTE
========================================== */

window.abrirNoticia =
  abrirNoticia;

window.obterFavoritos =
  obterFavoritos;

window.guardarFavorito =
  guardarFavorito;

window.removerFavorito =
  removerFavorito;

window.abrirFavoritos =
  abrirFavoritos;

window.abrirNoticiaPorId =
  abrirNoticiaPorId;

window.abrirNotificacoes =
  abrirNotificacoes;

window.atualizarNotificacoes =
  atualizarNotificacoes;

window.abrirUsuario =
  abrirUsuario;

window.abrirFerramentas =
  abrirFerramentas;

window.abrirConfiguracoesUsuario =
  abrirConfiguracoesUsuario;

window.abrirCores =
  abrirCores;

window.mudarCor =
  mudarCor;

window.abrirRedes =
  abrirRedes;

window.mostrarInfo =
  mostrarInfo;

window.alternarTema =
  alternarTema;

window.carregarTema =
  carregarTema;

window.alterarTamanhoTexto =
  alterarTamanhoTexto;

window.compartilharSite =
  compartilharSite;

window.copiarLinkSite =
  copiarLinkSite;

window.salvarSite =
  salvarSite;


/* ==========================================
   INICIALIZAÇÃO FINAL
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    carregarTema();

    carregarCor();

    carregarTamanhoTexto();

    console.log(
      "🌍 AfricanMundo — sistema profissional ativo."
    );

  }
);


/* ==========================================
   FIM DO SISTEMA
========================================== */

console.log(
  "✅ AfricanMundo carregado sem duplicações."
);
