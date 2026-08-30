/* ==========================================
   AFRICANMUNDO — APP.JS
   SISTEMA PRINCIPAL DE NOTÍCIAS
========================================== */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";


/* ==========================================
   CLIENTE SUPABASE
========================================== */

let supabaseClient = null;

try {

  if (
    window.supabase &&
    typeof window.supabase.createClient === "function"
  ) {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    console.log(
      "✅ AfricanMundo: Supabase conectado."
    );

  } else {

    console.error(
      "❌ Biblioteca Supabase não encontrada."
    );

  }

} catch (erro) {

  console.error(
    "❌ Erro ao iniciar Supabase:",
    erro
  );

}


/* ==========================================
   NORMALIZAR CATEGORIA
========================================== */

function normalizarCategoria(valor) {

  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

}


/* ==========================================
   ESCAPAR HTML
========================================== */

function esc(valor) {

  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==========================================
   FORMATAR DATA
========================================== */

function formatarData(valor) {

  if (!valor) return "";

  try {

    const data = new Date(valor);

    if (isNaN(data.getTime())) {
      return "";
    }

    return data.toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

  } catch (erro) {

    return "";

  }

}


/* ==========================================
   OBTER IMAGEM
========================================== */

function obterImagem(noticia) {

  return (
    noticia.imagem ||
    noticia.imagem_url ||
    noticia.image ||
    noticia.image_url ||
    noticia.url_imagem ||
    noticia.urlImagem ||
    noticia.foto ||
    noticia.foto_url ||
    noticia.capa ||
    noticia.capa_url ||
    ""
  );

}


/* ==========================================
   CRIAR CARTÃO
========================================== */

function criarCartao(noticia) {

  const id =
    noticia.id;

  const titulo =
    noticia.titulo ||
    noticia.title ||
    "Sem título";

  const texto =
    noticia.texto ||
    noticia.conteudo ||
    noticia.content ||
    noticia.descricao ||
    "";

  const categoria =
    noticia.categoria ||
    noticia.category ||
    "Notícias";

  const imagem =
    obterImagem(noticia);


  return `
    <a
      href="noticia.html?id=${encodeURIComponent(id)}"
      style="
        display:block;
        background:var(--card);
        border:1px solid var(--border);
        border-radius:15px;
        overflow:hidden;
        margin-bottom:12px;
        box-shadow:0 2px 8px #00000008;
        text-decoration:none;
        color:inherit;
      "
    >

      ${
        imagem
        ?
        `
        <img
          src="${esc(imagem)}"
          alt="${esc(titulo)}"
          style="
            width:100%;
            height:190px;
            object-fit:cover;
            display:block;
          "
        >
        `
        :
        `
        <div
          style="
            height:150px;
            display:grid;
            place-items:center;
            background:var(--bg);
            font-size:45px;
          "
        >
          🌍
        </div>
        `
      }

      <div style="padding:13px">

        <div
          style="
            color:var(--p);
            font-size:10px;
            font-weight:900;
            text-transform:uppercase;
            margin-bottom:6px;
          "
        >
          ${esc(categoria)}
        </div>

        <div
          style="
            font-size:17px;
            font-weight:900;
            line-height:1.3;
          "
        >
          ${esc(titulo)}
        </div>

        ${
          texto
          ?
          `
          <div
            style="
              margin-top:7px;
              color:var(--muted);
              font-size:12px;
              line-height:1.5;
            "
          >
            ${esc(texto)}
          </div>
          `
          :
          ""
        }

        <div
          style="
            margin-top:10px;
            color:var(--p);
            font-size:11px;
            font-weight:900;
          "
        >
          LER NOTÍCIA →
        </div>

      </div>

    </a>
  `;

}


/* ==========================================
   PAGINAÇÃO
========================================== */

const quantidadeNoticiasPorPagina = 6;

const paginasNoticias = {};


/* ==========================================
   MOSTRAR LISTA
========================================== */

function mostrarLista(id, lista) {

  const elemento =
    document.getElementById(id);

  if (!elemento) {

    console.warn(
      "⚠️ Área não encontrada:",
      id
    );

    return;
  }


  if (!lista || !lista.length) {

    elemento.innerHTML = `
      <div class="loading">
        Ainda não há notícias nesta categoria.
      </div>
    `;

    return;

  }


  paginasNoticias[id] = 1;

  renderizarListaNoticias(
    id,
    lista
  );

}


/* ==========================================
   RENDERIZAR LISTA
========================================== */

function renderizarListaNoticias(id, lista) {

  const elemento =
    document.getElementById(id);

  if (!elemento) return;


  const pagina =
    paginasNoticias[id] || 1;


  const quantidade =
    pagina *
    quantidadeNoticiasPorPagina;


  const noticiasVisiveis =
    lista.slice(
      0,
      quantidade
    );


  elemento.innerHTML =
    noticiasVisiveis
      .map(criarCartao)
      .join("");


  /* ======================================
     MAIS NOTÍCIAS
  ====================================== */

  if (
    noticiasVisiveis.length <
    lista.length
  ) {

    const botao =
      document.createElement("button");

    botao.type =
      "button";

    botao.textContent =
      "➕ MAIS NOTÍCIAS";


    botao.style.cssText = `
      display:block;
      width:100%;
      margin:18px 0 8px;
      padding:14px;
      border:0;
      border-radius:12px;
      background:var(--p);
      color:#fff;
      font-size:13px;
      font-weight:900;
      cursor:pointer;
    `;


    botao.onclick =
      function () {

        paginasNoticias[id] =
          (paginasNoticias[id] || 1) + 1;


        renderizarListaNoticias(
          id,
          lista
        );

      };


    elemento.appendChild(
      botao
    );

  }

}


/* ==========================================
   DESTAQUE
========================================== */

function mostrarDestaque(noticias) {

  const elemento =
    document.getElementById("destaque");

  if (!elemento) return;


  if (!noticias || !noticias.length) {

    elemento.innerHTML = `
      <div class="loading">
        Ainda não há notícias.
      </div>
    `;

    return;

  }


  elemento.innerHTML =
    criarCartao(
      noticias[0]
    );

}


/* ==========================================
   CARREGAR NOTÍCIAS
========================================== */

async function carregarNoticias() {

  console.log(
    "🔄 AfricanMundo: carregando notícias..."
  );


  if (!supabaseClient) {

    console.error(
      "❌ Cliente Supabase não disponível."
    );

    mostrarErroSupabase(
      "Supabase não disponível."
    );

    return;

  }


  try {

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


    if (resultado.error) {

      console.error(
        "❌ Erro Supabase:",
        resultado.error
      );

      mostrarErroSupabase(
        resultado.error.message
      );

      return;

    }


    const noticias =
      Array.isArray(resultado.data)
        ? resultado.data
        : [];


    console.log(
      "✅ Notícias recebidas:",
      noticias.length
    );


    window.__noticias =
      noticias;


    /* ======================================
       DESTAQUE
    ====================================== */

    mostrarDestaque(
      noticias
    );


    /* ======================================
       ÚLTIMAS
    ====================================== */

    mostrarLista(
      "ultimas",
      noticias
    );


    /* ======================================
       FUTEBOL
    ====================================== */

    mostrarLista(
      "futebol",
      noticias.filter(n =>
        normalizarCategoria(
          n.categoria
        ) === "futebol"
      )
    );


    /* ======================================
       MOÇAMBIQUE
    ====================================== */

    mostrarLista(
      "mocambique",
      noticias.filter(n =>
        normalizarCategoria(
          n.categoria
        ) === "mocambique"
      )
    );


    /* ======================================
       ÁFRICA
    ====================================== */

    mostrarLista(
      "africa",
      noticias.filter(n =>
        normalizarCategoria(
          n.categoria
        ) === "africa"
      )
    );


    /* ======================================
       NEGÓCIOS
    ====================================== */

    mostrarLista(
      "negocios",
      noticias.filter(n =>
        normalizarCategoria(
          n.categoria
        ) === "negocios"
      )
    );


    /* ======================================
       ENTRETENIMENTO
    ====================================== */

    mostrarLista(
      "entretenimento",
      noticias.filter(n =>
        normalizarCategoria(
          n.categoria
        ) === "entretenimento"
      )
    );


    /* ======================================
       DESPORTO
    ====================================== */

    mostrarLista(
      "desporto",
      noticias.filter(n =>
        normalizarCategoria(
          n.categoria
        ) === "desporto"
      )
    );


    /* ======================================
       NOTIFICAÇÕES
    ====================================== */

    atualizarNotificacoes(
      noticias
    );


    console.log(
      "🎉 AfricanMundo: carregamento concluído."
    );

  }

  catch (erro) {

    console.error(
      "❌ Erro inesperado:",
      erro
    );

    mostrarErroSupabase(
      erro.message
    );

  }

}


/* ==========================================
   ERRO SUPABASE
========================================== */

function mostrarErroSupabase(msg) {

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


  ids.forEach(id => {

    const elemento =
      document.getElementById(id);

    if (!elemento) return;


    elemento.innerHTML = `
      <div
        style="
          padding:20px;
          background:var(--card);
          border:1px solid var(--border);
          border-radius:14px;
          text-align:center;
          color:var(--muted);
        "
      >
        ❌ Não foi possível carregar as notícias.
      </div>
    `;

  });

}


/* ==========================================
   PESQUISA
========================================== */

function iniciarPesquisa() {

  const formulario =
    document.getElementById(
      "searchForm"
    );

  if (!formulario) return;


  formulario.addEventListener(
    "submit",
    function(e) {

      e.preventDefault();


      const campo =
        document.getElementById(
          "searchInput"
        );

      const box =
        document.getElementById(
          "searchResults"
        );


      if (!campo || !box) return;


      const termo =
        campo.value
          .trim()
          .toLowerCase();


      if (!termo) {

        box.innerHTML = `
          <p
            style="
              color:var(--muted);
              margin-top:10px;
            "
          >
            Digite algo para pesquisar.
          </p>
        `;

        return;

      }


      const noticias =
        window.__noticias || [];


      const resultados =
        noticias.filter(n => {

          const texto = `
            ${n.titulo || ""}
            ${n.texto || ""}
            ${n.categoria || ""}
          `.toLowerCase();


          return texto.includes(
            termo
          );

        });


      if (!resultados.length) {

        box.innerHTML = `
          <p
            style="
              margin-top:10px;
              color:var(--muted);
            "
          >
            Nenhuma notícia encontrada.
          </p>
        `;

        return;

      }


      box.innerHTML = `

        <div
          style="
            margin:12px 0;
            font-weight:bold;
          "
        >
          ${resultados.length}
          resultado(s)
        </div>

        <div
          style="
            display:grid;
            gap:8px;
          "
        >

          ${resultados
            .slice(0,10)
            .map(n => `

              <a
                href="noticia.html?id=${encodeURIComponent(n.id)}"
                style="
                  display:block;
                  text-align:left;
                  padding:11px;
                  border:1px solid var(--border);
                  border-radius:10px;
                  background:var(--bg);
                  color:var(--txt);
                  text-decoration:none;
                "
              >

                <b>
                  ${esc(
                    n.titulo ||
                    "Sem título"
                  )}
                </b>

                <small
                  style="
                    display:block;
                    margin-top:4px;
                    color:var(--muted);
                  "
                >
                  ${esc(
                    n.categoria ||
                    "Notícias"
                  )}
                </small>

              </a>

            `)
            .join("")
          }

        </div>

      `;

    }
  );

}


/* ==========================================
   NOTIFICAÇÕES
========================================== */

function atualizarNotificacoes(noticias) {

  const botao =
    document.getElementById(
      "notificationBtn"
    );

  if (!botao) return;


  const quantidade =
    Array.isArray(noticias)
      ? noticias.length
      : 0;


  let contador =
    botao.querySelector(
      ".notification-count"
    );


  if (!contador) {

    contador =
      document.createElement(
        "span"
      );

    contador.className =
      "notification-count";


    contador.style.cssText = `
      position:absolute;
      top:-4px;
      right:-4px;
      min-width:17px;
      height:17px;
      padding:0 4px;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#e53935;
      color:white;
      border-radius:50px;
      font-size:9px;
      font-weight:900;
      border:2px solid var(--card);
    `;


    botao.style.position =
      "relative";


    botao.appendChild(
      contador
    );

  }


  if (quantidade > 0) {

    contador.textContent =
      quantidade > 99
        ? "99+"
        : quantidade;


    contador.style.display =
      "flex";

  } else {

    contador.style.display =
      "none";

  }

}


/* ==========================================
   INICIAR
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "🚀 AfricanMundo iniciado."
    );


    iniciarPesquisa();


    carregarNoticias();

  }
);


/* ==========================================
   FUNÇÕES GLOBAIS
========================================== */

window.carregarNoticias =
  carregarNoticias;

window.mostrarLista =
  mostrarLista;

window.criarCartao =
  criarCartao;

window.formatarData =
  formatarData;

window.esc =
  esc;


/* ==========================================
   FIM
========================================== */

console.log(
  "✅ AfricanMundo app.js carregado."
);
