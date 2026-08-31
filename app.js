/* =========================================================
   🌍 AFRICANMUNDO
   APP.JS — PARTE 1
   SISTEMA BASE + SUPABASE + UTILITÁRIOS
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
   INICIAR SUPABASE
========================================================= */

function iniciarSupabase() {

  try {

    if (!window.supabase) {

      console.error(
        "❌ Biblioteca Supabase não encontrada."
      );

      return false;
    }


    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );


    console.log(
      "✅ Supabase conectado."
    );


    return true;

  } catch (erro) {

    console.error(
      "❌ Erro ao iniciar Supabase:",
      erro
    );

    return false;
  }
}


/* =========================================================
   NOTÍCIAS GLOBAIS
========================================================= */

window.__noticias = [];


/* =========================================================
   ESCAPAR HTML
========================================================= */

function esc(valor) {

  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   NORMALIZAR CATEGORIA
========================================================= */

function normalizarCategoria(valor) {

  return String(valor ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-");

}


/* =========================================================
   FORMATAR DATA
========================================================= */

function formatarData(valor) {

  if (!valor) return "";

  const data = new Date(valor);

  if (isNaN(data.getTime())) {
    return "";
  }

  return data.toLocaleDateString(
    "pt-MZ",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


/* =========================================================
   OBTER TÍTULO
========================================================= */

function obterTitulo(noticia) {

  return (
    noticia?.titulo ||
    noticia?.title ||
    "Sem título"
  );

}


/* =========================================================
   OBTER TEXTO
========================================================= */

function obterTexto(noticia) {

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

function obterImagem(noticia) {

  return (
    noticia?.imagem ||
    noticia?.imagem_url ||
    noticia?.image ||
    noticia?.image_url ||
    noticia?.url_imagem ||
    noticia?.foto ||
    ""
  );

}


/* =========================================================
   OBTER CATEGORIA
========================================================= */

function obterCategoria(noticia) {

  return (
    noticia?.categoria ||
    noticia?.category ||
    "Notícias"
  );

}


/* =========================================================
   ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(noticia) {

  if (!noticia || !noticia.id) {

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

function abrirNoticiaPorId(id) {

  if (!id) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}


/* =========================================================
   VER TODAS AS NOTÍCIAS
========================================================= */

function verTodasNoticias() {

  window.location.href =
    "categoria.html?categoria=noticias";

}


/* =========================================================
   ERRO PADRÃO
========================================================= */

function mostrarErro(mensagem) {

  console.error(
    "❌ AfricanMundo:",
    mensagem
  );


  document
    .querySelectorAll(".loading")
    .forEach(function(elemento) {

      elemento.innerHTML = `
        <div style="
          padding:20px;
          text-align:center;
          color:var(--muted);
        ">
          ❌ Não foi possível carregar as notícias.
          <br>
          <small>
            ${esc(mensagem || "Erro desconhecido")}
          </small>
        </div>
      `;

    });

}


/* =========================================================
   INICIAR APLICAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "🌍 AfricanMundo: iniciando aplicação..."
    );


    iniciarSupabase();

  }
);


/* =========================================================
   FIM DA PARTE 1
========================================================= */
/* =========================================================
   🌍 AFRICANMUNDO
   APP.JS — PARTE 2
   CARTÕES + DESTAQUE + LISTAS
========================================================= */


/* =========================================================
   CRIAR CARTÃO DE NOTÍCIA
========================================================= */

function criarCard(noticia) {

  if (!noticia) return null;


  const id =
    noticia.id;

  const titulo =
    obterTitulo(noticia);

  const texto =
    obterTexto(noticia);

  const imagem =
    obterImagem(noticia);

  const categoria =
    obterCategoria(noticia);

  const data =
    formatarData(
      noticia.created_at ||
      noticia.data ||
      noticia.published_at
    );


  const card =
    document.createElement("article");


  card.style.cssText = `
    background:var(--card);
    border:1px solid var(--border);
    border-radius:15px;
    overflow:hidden;
    box-shadow:0 4px 15px #0000000a;
    cursor:pointer;
    transition:transform .2s, box-shadow .2s;
  `;


  card.addEventListener(
    "mouseenter",
    function() {

      card.style.transform =
        "translateY(-3px)";

      card.style.boxShadow =
        "0 9px 25px #00000018";

    }
  );


  card.addEventListener(
    "mouseleave",
    function() {

      card.style.transform = "";

      card.style.boxShadow =
        "0 4px 15px #0000000a";

    }
  );


  card.addEventListener(
    "click",
    function(event) {

      if (
        event.target.closest(
          ".btn-favorito"
        )
      ) {
        return;
      }

      abrirNoticia(noticia);

    }
  );


  const imagemHTML =
    imagem
      ? `
        <img
          src="${esc(imagem)}"
          alt="${esc(titulo)}"
          loading="lazy"
          onerror="this.style.display='none';"
          style="
            width:100%;
            height:175px;
            object-fit:cover;
            display:block;
          "
        >
      `
      : `
        <div style="
          width:100%;
          height:175px;
          display:grid;
          place-items:center;
          background:var(--bg);
          font-size:42px;
        ">
          🌍
        </div>
      `;


  const resumo =
    texto.length > 150
      ? texto.substring(0,150) + "..."
      : texto;


  card.innerHTML = `

    <div style="
      width:100%;
      overflow:hidden;
      background:var(--bg);
    ">
      ${imagemHTML}
    </div>


    <div style="
      padding:13px;
    ">

      <div style="
        color:var(--p);
        font-size:10px;
        font-weight:900;
        text-transform:uppercase;
        margin-bottom:6px;
      ">
        ${esc(categoria)}
      </div>


      <h3 style="
        margin:0 0 7px;
        font-size:16px;
        line-height:1.3;
      ">
        ${esc(titulo)}
      </h3>


      ${
        resumo
          ? `
            <p style="
              margin:0;
              color:var(--muted);
              font-size:12px;
              line-height:1.5;
              display:-webkit-box;
              -webkit-line-clamp:2;
              -webkit-box-orient:vertical;
              overflow:hidden;
            ">
              ${esc(resumo)}
            </p>
          `
          : ""
      }


      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-top:11px;
      ">

        <span style="
          color:var(--muted);
          font-size:10px;
        ">
          ${esc(data)}
        </span>


        <button
          type="button"
          class="btn-favorito"
          aria-label="Guardar notícia"
          style="
            border:0;
            background:none;
            cursor:pointer;
            font-size:19px;
            padding:4px;
            line-height:1;
          "
        >
          ❤️
        </button>

      </div>


      <div style="
        margin-top:7px;
        color:var(--p);
        font-size:11px;
        font-weight:900;
      ">
        LER NOTÍCIA →
      </div>

    </div>

  `;


  const botaoFavorito =
    card.querySelector(
      ".btn-favorito"
    );


  if (botaoFavorito) {

    botaoFavorito.addEventListener(
      "click",
      function(event) {

        event.preventDefault();

        event.stopPropagation();

        guardarFavorito(noticia);

      }
    );

  }


  return card;

}


/* =========================================================
   RENDERIZAR LISTA
========================================================= */

function renderizarLista(
  id,
  lista,
  limite = 8
) {

  const elemento =
    document.getElementById(id);


  if (!elemento) {

    console.warn(
      "⚠️ Área não encontrada:",
      id
    );

    return;

  }


  elemento.innerHTML = "";


  elemento.style.display =
    "grid";

  elemento.style.gridTemplateColumns =
    "repeat(4,minmax(0,1fr))";

  elemento.style.gap =
    "14px";


  if (
    !Array.isArray(lista) ||
    !lista.length
  ) {

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
    .slice(0, limite)
    .forEach(function(noticia) {

      const card =
        criarCard(noticia);

      if (card) {

        elemento.appendChild(card);

      }

    });

}


/* =========================================================
   RENDERIZAR DESTAQUE
========================================================= */

function renderizarDestaque(
  noticias
) {

  const elemento =
    document.getElementById(
      "destaque"
    );


  if (!elemento) return;


  elemento.innerHTML = "";


  if (
    !Array.isArray(noticias) ||
    !noticias.length
  ) {

    elemento.innerHTML = `
      <div class="loading">
        Ainda não há notícias
        para destacar.
      </div>
    `;

    return;

  }


  const noticia =
    noticias[0];


  const card =
    criarCard(noticia);


  if (!card) return;


  card.style.width =
    "100%";


  card.style.maxWidth =
    "100%";


  const imagem =
    obterImagem(noticia);


  if (imagem) {

    const img =
      card.querySelector("img");

    if (img) {

      img.style.height =
        "300px";

    }

  }


  elemento.appendChild(card);

}


/* =========================================================
   FILTRAR POR CATEGORIA
========================================================= */

function noticiasDaCategoria(
  noticias,
  categoria
) {

  if (
    !Array.isArray(noticias)
  ) {

    return [];

  }


  const categoriaNormalizada =
    normalizarCategoria(
      categoria
    );


  return noticias.filter(
    function(noticia) {

      return (
        normalizarCategoria(
          obterCategoria(noticia)
        ) === categoriaNormalizada
      );

    }
  );

}


/* =========================================================
   RENDERIZAR TODAS AS CATEGORIAS
========================================================= */

function renderizarCategorias(
  noticias
) {

  renderizarLista(
    "ultimas",
    noticias,
    8
  );


  renderizarLista(
    "futebol",
    noticiasDaCategoria(
      noticias,
      "futebol"
    ),
    8
  );


  renderizarLista(
    "mocambique",
    noticiasDaCategoria(
      noticias,
      "mocambique"
    ),
    8
  );


  renderizarLista(
    "africa",
    noticiasDaCategoria(
      noticias,
      "africa"
    ),
    8
  );


  renderizarLista(
    "negocios",
    noticiasDaCategoria(
      noticias,
      "negocios"
    ),
    8
  );


  renderizarLista(
    "entretenimento",
    noticiasDaCategoria(
      noticias,
      "entretenimento"
    ),
    8
  );


  renderizarLista(
    "desporto",
    noticiasDaCategoria(
      noticias,
      "desporto"
    ),
    8
  );

}


/* =========================================================
   FIM DA PARTE 2
========================================================= */
/* =========================================================
   🌍 AFRICANMUNDO
   APP.JS — PARTE 3
   SUPABASE + CARREGAMENTO DAS NOTÍCIAS
========================================================= */


/* =========================================================
   CARREGAR NOTÍCIAS DO SUPABASE
========================================================= */

async function carregarNoticias() {

  console.log(
    "🔄 AfricanMundo: a carregar notícias..."
  );


  /* =======================================================
     VERIFICAR CLIENTE SUPABASE
  ======================================================= */

  if (!supabaseClient) {

    const conectado =
      iniciarSupabase();

    if (!conectado) {

      mostrarErro(
        "Não foi possível ligar ao Supabase."
      );

      return;

    }

  }


  try {

    /* =====================================================
       CONSULTAR TABELA NOTICIAS
    ===================================================== */

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


    /* =====================================================
       VERIFICAR ERRO
    ===================================================== */

    if (resultado.error) {

      console.error(
        "❌ Erro Supabase:",
        resultado.error
      );


      mostrarErro(
        resultado.error.message
      );


      return;

    }


    /* =====================================================
       GARANTIR ARRAY
    ===================================================== */

    const noticias =
      Array.isArray(
        resultado.data
      )
        ? resultado.data
        : [];


    /* =====================================================
       GUARDAR GLOBALMENTE
    ===================================================== */

    window.__noticias =
      noticias;


    console.log(
      "✅ Notícias recebidas:",
      noticias.length
    );


    /* =====================================================
       RENDERIZAR DESTAQUE
    ===================================================== */

    renderizarDestaque(
      noticias
    );


    /* =====================================================
       RENDERIZAR CATEGORIAS
    ===================================================== */

    renderizarCategorias(
      noticias
    );


    /* =====================================================
       ATUALIZAR NOTIFICAÇÕES
    ===================================================== */

    if (
      typeof atualizarNotificacoes ===
      "function"
    ) {

      atualizarNotificacoes(
        noticias
      );

    }


    /* =====================================================
       REMOVER INDICADORES DE CARREGAMENTO
    ===================================================== */

    document
      .querySelectorAll(
        ".loading"
      )
      .forEach(
        function(elemento) {

          /*
             Só removemos elementos que
             ainda estejam com mensagem
             de carregamento.
          */

          const texto =
            elemento.textContent
              .toLowerCase();


          if (
            texto.includes(
              "carregar"
            ) ||
            texto.includes(
              "carregando"
            )
          ) {

            /*
               Se o elemento estiver dentro
               de uma área já renderizada,
               a renderização anterior
               já cuidou dele.
            */

          }

        }
      );


    console.log(
      "🎉 AfricanMundo: notícias carregadas com sucesso."
    );


  } catch (erro) {

    console.error(
      "❌ Falha ao carregar notícias:",
      erro
    );


    mostrarErro(
      erro.message ||
      "Erro desconhecido."
    );

  }

}


/* =========================================================
   RECARREGAR NOTÍCIAS
========================================================= */

async function recarregarNoticias() {

  console.log(
    "🔄 A atualizar notícias..."
  );


  const botoes =
    document.querySelectorAll(
      "[data-recarregar]"
    );


  botoes.forEach(
    function(botao) {

      botao.disabled = true;

      botao.style.opacity =
        "0.6";

    }
  );


  await carregarNoticias();


  botoes.forEach(
    function(botao) {

      botao.disabled = false;

      botao.style.opacity =
        "1";

    }
  );

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

let intervaloNoticias = null;


function iniciarAtualizacaoAutomatica() {

  if (
    intervaloNoticias
  ) {

    clearInterval(
      intervaloNoticias
    );

  }


  /*
     Atualiza a cada 5 minutos.
  */

  intervaloNoticias =
    setInterval(
      function() {

        carregarNoticias();

      },
      5 * 60 * 1000
    );

}


/* =========================================================
   INICIALIZAÇÃO DAS NOTÍCIAS
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    console.log(
      "🚀 AfricanMundo: sistema iniciado."
    );


    /*
       Pequena espera para garantir
       que o Supabase esteja disponível.
    */

    if (
      !window.supabase
    ) {

      console.error(
        "❌ Biblioteca Supabase não encontrada."
      );

      mostrarErro(
        "Biblioteca Supabase não foi carregada."
      );

      return;

    }


    iniciarSupabase();


    await carregarNoticias();


    iniciarAtualizacaoAutomatica();

  }
);


/* =========================================================
   EXPOR FUNÇÕES IMPORTANTES
========================================================= */

window.carregarNoticias =
  carregarNoticias;

window.recarregarNoticias =
  recarregarNoticias;

window.renderizarLista =
  renderizarLista;

window.renderizarDestaque =
  renderizarDestaque;

window.criarCard =
  criarCard;


/* =========================================================
   FIM DA PARTE 3
========================================================= */
/* =========================================================
   🌍 AFRICANMUNDO
   APP.JS — PARTE 4
   PESQUISA + FAVORITOS + FERRAMENTAS
========================================================= */


/* =========================================================
   FAVORITOS — OBTER
========================================================= */

function obterFavoritos() {

  try {

    const dados =
      localStorage.getItem(
        "africanmundo_favoritos"
      );


    const favoritos =
      dados
        ? JSON.parse(dados)
        : [];


    return Array.isArray(
      favoritos
    )
      ? favoritos
      : [];


  } catch (erro) {

    console.error(
      "❌ Erro ao obter favoritos:",
      erro
    );


    return [];

  }

}


/* =========================================================
   FAVORITOS — GUARDAR
========================================================= */

function guardarFavorito(
  noticia
) {

  if (
    !noticia ||
    !noticia.id
  ) {

    return;

  }


  const favoritos =
    obterFavoritos();


  const existe =
    favoritos.some(
      function(item) {

        return (
          String(item.id) ===
          String(noticia.id)
        );

      }
    );


  if (existe) {

    abrirModal(
      "❤️ Favoritos",
      `
        <div style="
          text-align:center;
          padding:10px;
        ">

          <div style="
            font-size:40px;
            margin-bottom:10px;
          ">
            ❤️
          </div>

          <strong>
            Já está nos favoritos
          </strong>

          <p style="
            color:var(--muted);
            font-size:13px;
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
    JSON.stringify(
      favoritos
    )
  );


  abrirModal(
    "❤️ Favoritos",
    `
      <div style="
        text-align:center;
        padding:10px;
      ">

        <div style="
          font-size:40px;
          margin-bottom:10px;
        ">
          ❤️
        </div>

        <strong>
          Notícia guardada!
        </strong>

        <p style="
          color:var(--muted);
          font-size:13px;
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

function removerFavorito(
  indice
) {

  const favoritos =
    obterFavoritos();


  if (
    indice < 0 ||
    indice >= favoritos.length
  ) {

    return;

  }


  favoritos.splice(
    indice,
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


/* =========================================================
   ABRIR FAVORITOS
========================================================= */

function abrirFavoritos() {

  const favoritos =
    obterFavoritos();


  if (!favoritos.length) {

    abrirModal(
      "❤️ Meus favoritos",
      `
        <div style="
          text-align:center;
          padding:15px;
        ">

          <div style="
            font-size:45px;
            margin-bottom:10px;
          ">
            ❤️
          </div>

          <strong>
            Nenhuma notícia guardada
          </strong>

          <p style="
            color:var(--muted);
            font-size:13px;
            line-height:1.5;
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
      gap:10px;
    ">
  `;


  favoritos.forEach(
    function(noticia,index) {

      const titulo =
        obterTitulo(
          noticia
        );

      const categoria =
        obterCategoria(
          noticia
        );

      const imagem =
        obterImagem(
          noticia
        );


      html += `

        <div style="
          display:flex;
          gap:10px;
          align-items:center;
          padding:10px;
          background:var(--bg);
          border:1px solid var(--border);
          border-radius:12px;
        ">

          ${
            imagem
              ? `
                <img
                  src="${esc(imagem)}"
                  alt="${esc(titulo)}"
                  style="
                    width:70px;
                    height:55px;
                    object-fit:cover;
                    border-radius:8px;
                  "
                >
              `
              : `
                <div style="
                  width:70px;
                  height:55px;
                  display:grid;
                  place-items:center;
                  background:var(--card);
                  border-radius:8px;
                  font-size:25px;
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
              font-size:9px;
              font-weight:900;
              text-transform:uppercase;
              margin-bottom:3px;
            ">
              ${esc(categoria)}
            </div>

            <div style="
              font-size:13px;
              font-weight:800;
              line-height:1.3;
            ">
              ${esc(titulo)}
            </div>

          </div>


          <button
            type="button"
            onclick="abrirNoticiaPorId('${esc(
              noticia.id
            )}')"
            style="
              border:0;
              background:var(--p);
              color:#fff;
              border-radius:8px;
              padding:7px;
              cursor:pointer;
            "
          >
            →
          </button>


          <button
            type="button"
            onclick="removerFavorito(${index})"
            style="
              border:0;
              background:none;
              font-size:18px;
              cursor:pointer;
              padding:5px;
            "
            aria-label="Remover favorito"
          >
            🗑️
          </button>

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
   PESQUISA
========================================================= */

function pesquisarNoticias(
  termo
) {

  const resultados =
    document.getElementById(
      "resultadoPesquisa"
    );


  if (!resultados) {

    console.warn(
      "⚠️ Área resultadoPesquisa não encontrada."
    );

    return;

  }


  const pesquisa =
    String(
      termo || ""
    )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );


  if (!pesquisa) {

    resultados.innerHTML = "";

    return;

  }


  const noticias =
    Array.isArray(
      window.__noticias
    )
      ? window.__noticias
      : [];


  if (!noticias.length) {

    resultados.innerHTML = `
      <div style="
        padding:20px;
        text-align:center;
        color:var(--muted);
      ">
        ⏳ As notícias ainda estão
        a carregar...
      </div>
    `;

    return;

  }


  const encontrados =
    noticias.filter(
      function(noticia) {

        const conteudo = (

          obterTitulo(noticia) +
          " " +
          obterTexto(noticia) +
          " " +
          obterCategoria(noticia)

        )
        .toLowerCase()
        .normalize("NFD")
        .replace(
          /[\u0300-\u036f]/g,
          ""
        );


        return conteudo.includes(
          pesquisa
        );

      }
    );


  if (!encontrados.length) {

    resultados.innerHTML = `

      <div style="
        background:var(--card);
        border:1px solid var(--border);
        border-radius:15px;
        padding:20px;
        text-align:center;
      ">

        <div style="
          font-size:35px;
          margin-bottom:8px;
        ">
          🔎
        </div>

        <strong>
          Nenhuma notícia encontrada
        </strong>

        <p style="
          color:var(--muted);
          font-size:13px;
        ">
          Não encontramos resultados
          para
          <strong>
            "${esc(termo)}"
          </strong>.
        </p>

      </div>

    `;


    return;

  }


  resultados.innerHTML = `

    <div style="
      margin-bottom:12px;
    ">

      <strong style="
        font-size:19px;
      ">
        🔎 Resultados da pesquisa
      </strong>

      <div style="
        color:var(--muted);
        font-size:12px;
        margin-top:4px;
      ">
        ${encontrados.length}
        notícia(s) encontrada(s)
      </div>

    </div>

  `;


  encontrados
    .slice(0,20)
    .forEach(
      function(noticia) {

        const card =
          criarCard(
            noticia
          );


        if (card) {

          resultados.appendChild(
            card
          );

        }

      }
    );


  resultados.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}


/* =========================================================
   FORMULÁRIO DE PESQUISA
========================================================= */

function iniciarPesquisa() {

  const formulario =
    document.getElementById(
      "searchForm"
    );


  const input =
    document.getElementById(
      "searchInput"
    );


  if (
    !formulario ||
    !input
  ) {

    return;

  }


  formulario.addEventListener(
    "submit",
    function(event) {

      event.preventDefault();

      pesquisarNoticias(
        input.value
      );

    }
  );

}


/* =========================================================
   PARTILHAR SITE
========================================================= */

async function compartilharSite() {

  const dados = {

    title:
      "AfricanMundo",

    text:
      "A informação que liga África ao mundo.",

    url:
      window.location.href

  };


  if (
    navigator.share
  ) {

    try {

      await navigator.share(
        dados
      );

    } catch (erro) {

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

async function copiarLinkSite() {

  const link =
    window.location.href;


  try {

    await navigator.clipboard.writeText(
      link
    );


    abrirModal(
      "🔗 Link copiado",
      `
        <div style="
          text-align:center;
          padding:10px;
        ">

          <div style="
            font-size:40px;
          ">
            🔗
          </div>

          <p>
            O link do AfricanMundo
            foi copiado com sucesso.
          </p>

        </div>
      `
    );


  } catch (erro) {

    alert(
      "Link do AfricanMundo:\n" +
      link
    );

  }

}


/* =========================================================
   FIM DA PARTE 4
========================================================= */
