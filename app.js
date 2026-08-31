/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 1/5
========================================== */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let supabaseClient = null;

window.__noticias = [];


/* ==========================================
   SUPABASE
========================================== */

function iniciarSupabase(){

  if(!window.supabase) return false;

  try{

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    return true;

  }catch(e){

    console.error(e);
    return false;

  }

}


/* ==========================================
   UTILITÁRIOS
========================================== */

function esc(v){

  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function categoria(v){

  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

}


function titulo(n){

  return n?.titulo ||
         n?.title ||
         "Sem título";

}


function texto(n){

  return n?.texto ||
         n?.conteudo ||
         n?.content ||
         n?.descricao ||
         "";

}


function imagem(n){

  return n?.imagem ||
         n?.imagem_url ||
         n?.image ||
         n?.image_url ||
         n?.url_imagem ||
         "";

}


function data(n){

  const valor =
    n?.created_at ||
    n?.data ||
    n?.createdAt;

  if(!valor) return "";

  const d = new Date(valor);

  return isNaN(d)
    ? ""
    : d.toLocaleDateString(
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

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(n.id);

}


function abrirNoticiaPorId(id){

  if(!id) return;

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

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


function guardarFavorito(n){

  if(!n?.id) return;

  const lista =
    obterFavoritos();

  if(
    lista.some(
      x => String(x.id) === String(n.id)
    )
  ){

    abrirModal(
      "❤️ Favoritos",
      "<p>Esta notícia já está guardada.</p>"
    );

    return;

  }

  lista.unshift(n);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(lista)
  );

  abrirModal(
    "❤️ Favoritos",
    "<p>Notícia guardada com sucesso!</p>"
  );

}


/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 2/5
========================================== */


/* ==========================================
   CRIAR CARD
========================================== */

function criarCard(n){

  const card =
    document.createElement("article");

  card.className = "news-card";

  const img = imagem(n);

  card.innerHTML = `
    ${
      img
      ? `<img class="news-image"
          src="${esc(img)}"
          alt="${esc(titulo(n))}"
          loading="lazy">`
      : `<div class="news-no-image">🌍</div>`
    }

    <div class="news-content">

      <div class="news-category">
        ${esc(n.categoria || "Notícias")}
      </div>

      <h3 class="news-title">
        ${esc(titulo(n))}
      </h3>

      ${
        texto(n)
        ? `<p class="news-description">
            ${esc(texto(n).slice(0,120))}
           </p>`
        : ""
      }

      <div class="news-footer">
        <span>${data(n)}</span>

        <button
          class="favorite-btn"
          type="button"
          onclick="event.stopPropagation();guardarFavorito(window.__noticias.find(x=>String(x.id)===String('${esc(n.id)}')))">
          ♡
        </button>
      </div>

    </div>
  `;

  card.onclick = () =>
    abrirNoticia(n);

  return card;
}


/* ==========================================
   RENDERIZAR LISTA
========================================== */

function renderizarLista(id, lista){

  const area =
    document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";

  if(!lista.length){

    area.innerHTML = `
      <div class="loading">
        Ainda não existem notícias.
      </div>
    `;

    return;
  }

  lista.slice(0,4).forEach(n => {

    area.appendChild(
      criarCard(n)
    );

  });

}


/* ==========================================
   DESTAQUE
========================================== */

function renderizarDestaque(lista){

  const area =
    document.getElementById("destaque");

  if(!area) return;

  if(!lista.length){

    area.innerHTML = `
      <div class="loading">
        Ainda não existem notícias.
      </div>
    `;

    return;
  }

  const n = lista[0];

  area.innerHTML = `
    <article class="featured"
      onclick="abrirNoticiaPorId('${esc(n.id)}')">

      ${
        imagem(n)
        ? `<img class="featured-image"
            src="${esc(imagem(n))}"
            alt="${esc(titulo(n))}">`
        : `<div class="featured-image"
            style="display:grid;place-items:center;font-size:60px">
            🌍
           </div>`
      }

      <div class="featured-content">

        <div class="featured-category">
          ${esc(n.categoria || "Notícias")}
        </div>

        <h1 class="featured-title">
          ${esc(titulo(n))}
        </h1>

        <p class="featured-text">
          ${esc(texto(n).slice(0,220))}
        </p>

        <div style="
          margin-top:12px;
          color:var(--p);
          font-weight:900;
          font-size:12px;
        ">
          LER NOTÍCIA →
        </div>

      </div>

    </article>
  `;

}


/* ==========================================
   CARREGAR NOTÍCIAS
========================================== */

async function carregarNoticias(){

  if(!supabaseClient &&
     !iniciarSupabase()){

    mostrarErro("Supabase não disponível.");
    return;
  }

  try{

    const {data,error} =
      await supabaseClient
        .from("noticias")
        .select("*")
        .order("id",{ascending:false});

    if(error){

      console.error(error);
      mostrarErro(error.message);
      return;

    }

    window.__noticias =
      Array.isArray(data)
      ? data
      : [];

    renderizarDestaque(
      window.__noticias
    );

    renderizarLista(
      "ultimas",
      window.__noticias
    );

    const categorias = [
      "futebol",
      "mocambique",
      "africa",
      "negocios",
      "entretenimento",
      "desporto"
    ];

    categorias.forEach(cat => {

      renderizarLista(
        cat,
        window.__noticias.filter(
          n =>
            categoria(n.categoria) === cat
        )
      );

    });

    atualizarNotificacoes(
      window.__noticias
    );

  }catch(e){

    console.error(e);
    mostrarErro(e.message);

  }

}


/* ==========================================
   ERRO
========================================== */

function mostrarErro(msg){

  document
    .querySelectorAll(
      ".loading"
    )
    .forEach(el => {

      el.innerHTML =
        "⚠️ Não foi possível carregar as notícias.";

    });

  console.error(
    "AfricanMundo:",
    msg
  );

}


/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 3/5
========================================== */


/* ==========================================
   NOTIFICAÇÕES
========================================== */

function atualizarNotificacoes(lista){

  const btn =
    document.getElementById(
      "notificationBtn"
    );

  if(!btn) return;

  let badge =
    btn.querySelector(
      ".notification-count"
    );

  if(!badge){

    badge =
      document.createElement("span");

    badge.className =
      "notification-count";

    btn.appendChild(badge);

  }

  const total =
    Array.isArray(lista)
      ? lista.length
      : 0;

  badge.textContent =
    total > 99 ? "99+" : total;

  badge.style.display =
    total ? "flex" : "none";

}


/* ==========================================
   ABRIR NOTIFICAÇÕES
========================================== */

function abrirNotificacoes(){

  const lista =
    window.__noticias || [];

  if(!lista.length){

    abrirModal(
      "🔔 Notificações",
      "<p>Nenhuma novidade no momento.</p>"
    );

    return;
  }

  const html = `
    <div style="
      display:grid;
      gap:10px;
    ">
      ${lista.slice(0,10).map(n => `
        <button
          type="button"
          onclick="abrirNoticiaPorId('${esc(n.id)}')"
          style="
            text-align:left;
            padding:12px;
            border:1px solid var(--border);
            border-radius:12px;
            background:var(--bg);
            color:var(--txt);
          "
        >
          <strong>
            ${esc(titulo(n))}
          </strong>

          <small style="
            display:block;
            margin-top:4px;
            color:var(--muted);
          ">
            ${esc(n.categoria || "Notícias")}
          </small>
        </button>
      `).join("")}
    </div>
  `;

  abrirModal(
    "🔔 Últimas notícias",
    html
  );

}


/* ==========================================
   FERRAMENTAS
========================================== */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `
      <button
        class="modal-option"
        onclick="abrirFavoritos()"
      >
        <strong>❤️ Favoritos</strong>
        <small>Ver notícias guardadas</small>
      </button>

      <button
        class="modal-option"
        onclick="compartilharSite()"
      >
        <strong>📤 Partilhar</strong>
        <small>Partilhar o AfricanMundo</small>
      </button>

      <button
        class="modal-option"
        onclick="salvarSite()"
      >
        <strong>⭐ Guardar site</strong>
        <small>Adicionar aos favoritos do navegador</small>
      </button>

      <button
        class="modal-option"
        onclick="alterarTamanhoTexto()"
      >
        <strong>🔤 Tamanho do texto</strong>
        <small>Aumentar ou diminuir o texto</small>
      </button>
    `
  );

}


/* ==========================================
   MINHA ÁREA
========================================== */

function abrirUsuario(){

  abrirModal(
    "👤 Minha área",
    `
      <div style="text-align:center">

        <div style="font-size:50px">
          👤
        </div>

        <h3>Bem-vindo ao AfricanMundo</h3>

        <p style="
          color:var(--muted);
          line-height:1.5;
        ">
          Aqui podes acessar os teus
          favoritos e personalizar a experiência.
        </p>

        <button
          class="modal-option"
          onclick="abrirFavoritos()"
        >
          <strong>❤️ Meus favoritos</strong>
          <small>Notícias que guardaste</small>
        </button>

      </div>
    `
  );

}


/* ==========================================
   MODO ESCURO
========================================== */

function alternarTema(){

  document.body.classList.toggle(
    "dark"
  );

  localStorage.setItem(
    "africanmundo_tema",
    document.body.classList.contains("dark")
      ? "dark"
      : "light"
  );

}


/* ==========================================
   CARREGAR TEMA
========================================== */

function carregarTema(){

  if(
    localStorage.getItem(
      "africanmundo_tema"
    ) === "dark"
  ){

    document.body.classList.add(
      "dark"
    );

  }

}


/* ==========================================
   CORES
========================================== */

function abrirCores(){

  abrirModal(
    "🎨 Cores",
    `
      <button
        class="modal-option"
        onclick="mudarCor('green')"
      >
        🟢 Verde
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('blue')"
      >
        🔵 Azul
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('red')"
      >
        🔴 Vermelho
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('purple')"
      >
        🟣 Roxo
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('orange')"
      >
        🟠 Laranja
      </button>
    `
  );

}


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

}


/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 4/5
========================================== */


/* ==========================================
   PESQUISA
========================================== */

function pesquisarNoticias(){

  const input =
    document.getElementById(
      "searchInput"
    );

  const area =
    document.getElementById(
      "searchResults"
    );

  if(!input || !area) return;

  const termo =
    input.value
      .trim()
      .toLowerCase();

  if(!termo){

    area.innerHTML = "";
    return;

  }

  const resultados =
    (window.__noticias || [])
      .filter(n => {

        const textoBusca = `
          ${titulo(n)}
          ${texto(n)}
          ${n.categoria || ""}
        `.toLowerCase();

        return textoBusca.includes(
          termo
        );

      });

  if(!resultados.length){

    area.innerHTML = `
      <div class="loading">
        🔎 Nenhuma notícia encontrada.
      </div>
    `;

    return;
  }

  area.innerHTML = `
    <div style="
      margin:15px 0 10px;
      font-weight:900;
    ">
      🔎 Resultados da pesquisa
    </div>

    <div class="news-grid"></div>
  `;

  const grid =
    area.querySelector(
      ".news-grid"
    );

  resultados
    .slice(0,12)
    .forEach(n =>
      grid.appendChild(
        criarCard(n)
      )
    );

}


/* ==========================================
   REDES SOCIAIS
========================================== */

function abrirRedes(){

  abrirModal(
    "🌐 Redes sociais",
    `
      <div style="
        display:grid;
        gap:9px;
      ">

        <a
          class="modal-option"
          href="https://www.google.com"
          target="_blank"
        >
          🌐 Google
        </a>

        <a
          class="modal-option"
          href="https://www.facebook.com"
          target="_blank"
        >
          🔵 Facebook
        </a>

        <a
          class="modal-option"
          href="https://www.youtube.com"
          target="_blank"
        >
          ▶️ YouTube
        </a>

        <a
          class="modal-option"
          href="https://www.whatsapp.com"
          target="_blank"
        >
          🟢 WhatsApp
        </a>

        <a
          class="modal-option"
          href="https://www.instagram.com"
          target="_blank"
        >
          📷 Instagram
        </a>

        <a
          class="modal-option"
          href="https://www.tiktok.com"
          target="_blank"
        >
          🎵 TikTok
        </a>

      </div>
    `
  );

}


/* ==========================================
   COMPARTILHAR
========================================== */

async function compartilharSite(){

  const dados = {
    title:"AfricanMundo",
    text:"A informação que liga África ao mundo.",
    url:location.href
  };

  if(navigator.share){

    try{
      await navigator.share(dados);
    }catch(e){}

    return;
  }

  try{

    await navigator.clipboard.writeText(
      location.href
    );

    abrirModal(
      "🔗 Partilhar",
      "<p>Link copiado com sucesso!</p>"
    );

  }catch(e){

    alert(location.href);

  }

}


/* ==========================================
   GUARDAR SITE
========================================== */

function salvarSite(){

  abrirModal(
    "⭐ Guardar AfricanMundo",
    `
      <div style="
        text-align:center;
        padding:10px;
      ">

        <div style="font-size:45px">
          ⭐
        </div>

        <p>
          Usa o menu do navegador para
          adicionar o AfricanMundo aos favoritos.
        </p>

      </div>
    `
  );

}


/* ==========================================
   TAMANHO DO TEXTO
========================================== */

function alterarTamanhoTexto(){

  const atual =
    Number(
      localStorage.getItem(
        "africanmundo_texto"
      ) || 100
    );

  const novo =
    atual >= 120
      ? 90
      : atual + 10;

  document.documentElement.style.fontSize =
    novo + "%";

  localStorage.setItem(
    "africanmundo_texto",
    novo
  );

}


/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 5/5
========================================== */


/* ==========================================
   MODAL
========================================== */

function abrirModal(titulo,conteudo){

  let modal =
    document.getElementById(
      "amModal"
    );

  if(!modal){

    modal =
      document.createElement("div");

    modal.id = "amModal";

    modal.className =
      "modal-overlay";

    modal.innerHTML = `
      <div class="modal">

        <div class="modal-header">

          <div class="modal-title"></div>

          <button
            class="modal-close"
            type="button"
          >
            ✕
          </button>

        </div>

        <div class="modal-body"></div>

      </div>
    `;

    document.body.appendChild(
      modal
    );

    modal.querySelector(
      ".modal-close"
    ).onclick = () =>
      modal.classList.remove(
        "active"
      );

    modal.onclick = e => {

      if(e.target === modal){

        modal.classList.remove(
          "active"
        );

      }

    };

  }

  modal.querySelector(
    ".modal-title"
  ).textContent = titulo;

  modal.querySelector(
    ".modal-body"
  ).innerHTML = conteudo;

  modal.classList.add(
    "active"
  );

}


/* ==========================================
   LIGAR BOTÕES
========================================== */

function configurarBotoes(){

  const eventos = {

    notificationBtn:
      abrirNotificacoes,

    toolsBtn:
      abrirFerramentas,

    userBtn:
      abrirUsuario,

    themeBtn:
      alternarTema,

    colorBtn:
      abrirCores

  };

  Object.keys(eventos)
    .forEach(id => {

      const botao =
        document.getElementById(id);

      if(botao){

        botao.onclick =
          eventos[id];

      }

    });


  const form =
    document.getElementById(
      "searchForm"
    );

  if(form){

    form.addEventListener(
      "submit",
      e => {

        e.preventDefault();
        pesquisarNoticias();

      }
    );

  }

}


/* ==========================================
   CARREGAR CONFIGURAÇÕES
========================================== */

function carregarConfiguracoes(){

  carregarTema();

  const cor =
    localStorage.getItem(
      "africanmundo_cor"
    );

  if(cor){

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

  }

  const tamanho =
    localStorage.getItem(
      "africanmundo_texto"
    );

  if(tamanho){

    document.documentElement.style.fontSize =
      tamanho + "%";

  }

}


/* ==========================================
   INICIAR SITE
========================================== */

function iniciarAfricanMundo(){

  carregarConfiguracoes();

  configurarBotoes();

  carregarNoticias();

}


/* ==========================================
   INICIAR QUANDO A PÁGINA ESTIVER PRONTA
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
   FIM DO APP.JS
========================================== */
