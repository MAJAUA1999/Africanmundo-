/* ==========================================
   AFRICANMUNDO — APP.JS
   CARREGAMENTO DAS NOTÍCIAS
========================================== */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";


/* ==========================================
   CRIAR CLIENTE SUPABASE
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

function escaparHTML(valor) {

  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==========================================
   CRIAR CARTÃO DA NOTÍCIA
========================================== */

function criarCartao(noticia) {

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

  const imagem =
    noticia.imagem ||
    noticia.imagem_url ||
    noticia.image ||
    noticia.image_url ||
    noticia.url_imagem ||
    "";

  const id =
    noticia.id;


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
            src="${escaparHTML(imagem)}"
            alt="${escaparHTML(titulo)}"
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
          <div style="
            height:150px;
            display:grid;
            place-items:center;
            background:var(--bg);
            font-size:45px;
          ">
            🌍
          </div>
        `
      }

      <div style="padding:13px">

        <div style="
          color:var(--p);
          font-size:10px;
          font-weight:900;
          text-transform:uppercase;
          margin-bottom:6px;
        ">
          ${escaparHTML(noticia.categoria || "Notícias")}
        </div>

        <div style="
          font-size:17px;
          font-weight:900;
          line-height:1.3;
        ">
          ${escaparHTML(titulo)}
        </div>

        ${
          texto
          ?
          `
            <div style="
              margin-top:7px;
              color:var(--muted);
              font-size:12px;
              line-height:1.5;
            ">
              ${escaparHTML(texto)}
            </div>
          `
          :
          ""
        }

        <div style="
          margin-top:10px;
          color:var(--p);
          font-size:11px;
          font-weight:900;
        ">
          LER NOTÍCIA →
        </div>

      </div>

    </a>
  `;

            }
/* ==========================================
   MOSTRAR LISTA DE NOTÍCIAS
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


  elemento.innerHTML =
    lista
      .slice(0, 6)
      .map(criarCartao)
      .join("");

}


/* ==========================================
   MOSTRAR DESTAQUE
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
    criarCartao(noticias[0]);

}


/* ==========================================
   CARREGAR NOTÍCIAS DO SUPABASE
========================================== */

async function carregarNoticias() {

  console.log(
    "🔄 AfricanMundo: carregando notícias..."
  );


  if (!supabaseClient) {

    console.error(
      "❌ Cliente Supabase não disponível."
    );

    document
      .querySelectorAll(".loading")
      .forEach(elemento => {

        elemento.innerHTML = `
          ❌ Não foi possível conectar ao servidor.
        `;

      });

    return;
  }


  try {

    const resultado =
      await supabaseClient
        .from("noticias")
        .select("*")
        .order("id", {
          ascending: false
        });


    if (resultado.error) {

      console.error(
        "❌ Erro Supabase:",
        resultado.error
      );

      document
        .querySelectorAll(".loading")
        .forEach(elemento => {

          elemento.innerHTML = `
            ❌ Erro ao carregar notícias.
            <br>
            <small>
              ${escaparHTML(
                resultado.error.message
              )}
            </small>
          `;

        });

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
       ÚLTIMAS NOTÍCIAS
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


    console.log(
      "🎉 AfricanMundo: carregamento concluído."
    );

  }

  catch (erro) {

    console.error(
      "❌ Erro inesperado:",
      erro
    );


    document
      .querySelectorAll(".loading")
      .forEach(elemento => {

        elemento.innerHTML = `
          ❌ Não foi possível carregar as notícias.
          <br>
          <small>
            ${escaparHTML(
              erro.message
            )}
          </small>
        `;

      });

  }

}
/* ==========================================
   INICIAR AFRICANMUNDO
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "🚀 AfricanMundo: página carregada."
    );

    carregarNoticias();

  }
);


/* ==========================================
   DISPONIBILIZAR FUNÇÃO GLOBAL
========================================== */

window.carregarNoticias =
  carregarNoticias;


/* ==========================================
   DISPONIBILIZAR NOTÍCIAS GLOBALMENTE
========================================== */

window.__noticias =
  window.__noticias || [];


/* ==========================================
   FIM DO APP.JS
========================================== */

console.log(
  "✅ AfricanMundo app.js carregado."
);
