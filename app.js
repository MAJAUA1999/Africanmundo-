/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 1/6 — CONFIGURAÇÃO E FUNÇÕES BASE
========================================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let supabaseClient = null;

window.__noticias = [];


/* ==============================
   SUPABASE
============================== */

function iniciarSupabase(){

  if(!window.supabase){
    console.error("Supabase não carregado.");
    return false;
  }

  try{

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    return true;

  }catch(error){

    console.error("Erro Supabase:",error);
    return false;

  }

}


/* ==============================
   SEGURANÇA HTML
============================== */

function esc(valor){

  return String(valor ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* ==============================
   CATEGORIA
============================== */

function normalizarCategoria(valor){

  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

}


/* ==============================
   CAMPOS DA NOTÍCIA
============================== */

function tituloNoticia(n){

  return n?.titulo ||
         n?.title ||
         "Sem título";

}


function textoNoticia(n){

  return n?.texto ||
         n?.conteudo ||
         n?.content ||
         n?.descricao ||
         "";

}


function imagemNoticia(n){

  return n?.imagem ||
         n?.imagem_url ||
         n?.image ||
         n?.image_url ||
         n?.url_imagem ||
         "";

}


function categoriaNoticia(n){

  return n?.categoria ||
         n?.category ||
         "Notícias";

}


function dataNoticia(n){

  return n?.created_at ||
         n?.data ||
         n?.createdAt ||
         "";

}


/* ==============================
   DATA
============================== */

function formatarData(valor){

  if(!valor) return "";

  const data = new Date(valor);

  if(isNaN(data.getTime())) return "";

  return data.toLocaleDateString(
    "pt-MZ",
    {
      day:"2-digit",
      month:"2-digit",
      year:"numeric"
    }
  );

}


/* ==============================
   ABRIR NOTÍCIA
============================== */

function abrirNoticia(noticia){

  if(!noticia?.id){
    alert("Notícia não encontrada.");
    return;
  }

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(noticia.id);

}


function abrirNoticiaPorId(id){

  if(!id) return;

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}


/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 2/6 — NOTÍCIAS E CARDS
========================================================= */


/* ==============================
   CRIAR CARD
============================== */

function criarCard(noticia){

  const card = document.createElement("article");
  card.className = "news-card";

  const imagem = imagemNoticia(noticia);
  const titulo = tituloNoticia(noticia);
  const texto = textoNoticia(noticia);
  const categoria = categoriaNoticia(noticia);
  const data = formatarData(dataNoticia(noticia));

  card.onclick = () => abrirNoticia(noticia);

  card.innerHTML = `

    ${
      imagem
      ? `
        <img
          class="news-image"
          src="${esc(imagem)}"
          alt="${esc(titulo)}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
      `
      : `
        <div class="news-no-image">
          🌍
        </div>
      `
    }

    <div class="news-content">

      <div class="news-category">
        ${esc(categoria)}
      </div>

      <h3 class="news-title">
        ${esc(titulo)}
      </h3>

      ${
        texto
        ? `
          <p class="news-description">
            ${esc(
              texto.length > 140
                ? texto.substring(0,140) + "..."
                : texto
            )}
          </p>
        `
        : ""
      }

      <div class="news-footer">

        <span>
          ${esc(data)}
        </span>

        <button
          class="favorite-btn"
          type="button"
          onclick="event.stopPropagation(); guardarFavorito(window.__noticias.find(n => String(n.id) === String(${JSON.stringify(noticia.id)})))"
          aria-label="Guardar favorito"
        >
          ♡
        </button>

      </div>

    </div>
  `;

  return card;
}


/* ==============================
   RENDERIZAR LISTA
============================== */

function renderizarLista(id, lista){

  const area = document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";

  if(!Array.isArray(lista) || !lista.length){

    area.innerHTML = `
      <div class="loading">
        📰 Ainda não existem notícias
        nesta categoria.
      </div>
    `;

    return;
  }

  lista
    .slice(0,8)
    .forEach(noticia => {

      area.appendChild(
        criarCard(noticia)
      );

    });

}


/* ==============================
   DESTAQUE
============================== */

function renderizarDestaque(noticias){

  const area =
    document.getElementById("destaque");

  if(!area) return;

  area.innerHTML = "";

  if(!noticias.length){

    area.innerHTML = `
      <div class="loading">
        📰 Ainda não existem notícias.
      </div>
    `;

    return;
  }

  const noticia = noticias[0];

  const card = criarCard(noticia);

  const imagem =
    card.querySelector(".news-image");

  if(imagem){

    imagem.style.height = "300px";

  }

  area.appendChild(card);

}


/* ==============================
   CARREGAR NOTÍCIAS
============================== */

async function carregarNoticias(){

  console.log("🔄 Carregando notícias...");

  if(!supabaseClient &&
     !iniciarSupabase()){

    mostrarErro(
      "Não foi possível iniciar o Supabase."
    );

    return;
  }

  try{

    const { data, error } =
      await supabaseClient
        .from("noticias")
        .select("*")
        .order("id",{ascending:false});

    if(error){

      console.error(
        "Erro Supabase:",
        error
      );

      mostrarErro(
        error.message
      );

      return;
    }

    window.__noticias =
      Array.isArray(data)
        ? data
        : [];

    const noticias =
      window.__noticias;

    console.log(
      "✅ Notícias:",
      noticias.length
    );


    /* DESTAQUE */

    renderizarDestaque(
      noticias
    );


    /* ÚLTIMAS */

    renderizarLista(
      "ultimas",
      noticias
    );


    /* CATEGORIAS */

    const categorias = [
      "futebol",
      "mocambique",
      "africa",
      "negocios",
      "entretenimento",
      "desporto"
    ];


    categorias.forEach(categoria => {

      renderizarLista(
        categoria,
        noticias.filter(n =>
          normalizarCategoria(
            categoriaNoticia(n)
          ) === categoria
        )
      );

    });


    atualizarNotificacoes(
      noticias
    );

  }catch(error){

    console.error(
      "❌ Erro ao carregar:",
      error
    );

    mostrarErro(
      error.message ||
      "Erro ao carregar notícias."
    );

  }

}


/* ==============================
   ERRO
============================== */

function mostrarErro(mensagem){

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

    const area =
      document.getElementById(id);

    if(!area) return;

    area.innerHTML = `
      <div class="loading">
        ⚠️ Não foi possível carregar
        as notícias.
        <br><br>
        <small>
          ${esc(mensagem)}
        </small>
      </div>
    `;

  });

}


/* ==============================
   NOTIFICAÇÕES
============================== */

function atualizarNotificacoes(noticias){

  const botao =
    document.getElementById(
      "notificationBtn"
    );

  if(!botao) return;

  let contador =
    botao.querySelector(
      ".notification-count"
    );

  if(!contador){

    contador =
      document.createElement("span");

    contador.className =
      "notification-count";

    botao.appendChild(
      contador
    );

  }

  const total =
    Array.isArray(noticias)
      ? noticias.length
      : 0;

  contador.textContent =
    total > 99 ? "99+" : total;

  contador.style.display =
    total ? "flex" : "none";

}


 /* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 3/6 — FAVORITOS E PARTILHA
========================================================= */


/* ==============================
   FAVORITOS
============================== */

function obterFavoritos(){

  try{

    const dados =
      localStorage.getItem(
        "africanmundo_favoritos"
      );

    const lista =
      dados ? JSON.parse(dados) : [];

    return Array.isArray(lista)
      ? lista
      : [];

  }catch(e){

    return [];

  }

}


function guardarFavorito(noticia){

  if(!noticia?.id) return;

  const favoritos =
    obterFavoritos();

  const existe =
    favoritos.some(n =>
      String(n.id) ===
      String(noticia.id)
    );

  if(existe){

    abrirModal(
      "❤️ Favoritos",
      `
        <div style="text-align:center;padding:15px">
          <div style="font-size:42px">❤️</div>
          <h3>Já está nos favoritos</h3>
          <p style="color:var(--muted)">
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
      <div style="text-align:center;padding:15px">
        <div style="font-size:42px">❤️</div>
        <h3>Notícia guardada!</h3>
        <p style="color:var(--muted)">
          A notícia foi adicionada aos favoritos.
        </p>
      </div>
    `
  );

}


function removerFavorito(index){

  const favoritos =
    obterFavoritos();

  if(index < 0 ||
     index >= favoritos.length){

    return;
  }

  favoritos.splice(index,1);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  abrirFavoritos();

}


/* ==============================
   ABRIR FAVORITOS
============================== */

function abrirFavoritos(){

  const favoritos =
    obterFavoritos();

  if(!favoritos.length){

    abrirModal(
      "❤️ Meus favoritos",
      `
        <div style="text-align:center;padding:20px">
          <div style="font-size:45px">❤️</div>

          <h3>
            Nenhuma notícia guardada
          </h3>

          <p style="color:var(--muted)">
            As notícias que guardar aparecerão aqui.
          </p>
        </div>
      `
    );

    return;
  }

  const html = favoritos
    .map((n,index) => {

      const titulo =
        tituloNoticia(n);

      const categoria =
        categoriaNoticia(n);

      const imagem =
        imagemNoticia(n);

      return `

        <div style="
          display:flex;
          gap:10px;
          align-items:center;
          padding:10px;
          margin-bottom:8px;
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
                  height:60px;
                  object-fit:cover;
                  border-radius:8px;
                "
              >
            `
            : `
              <div style="
                width:70px;
                height:60px;
                display:grid;
                place-items:center;
                background:var(--card);
                border-radius:8px;
                font-size:28px;
              ">
                🌍
              </div>
            `
          }

          <div style="flex:1;min-width:0">

            <div style="
              color:var(--p);
              font-size:9px;
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

            <div style="
              margin-top:7px;
              display:flex;
              gap:10px;
            ">

              <button
                type="button"
                onclick="abrirNoticiaPorId('${esc(n.id)}')"
                style="
                  border:0;
                  background:none;
                  color:var(--p);
                  font-weight:900;
                  padding:0;
                "
              >
                LER →
              </button>

              <button
                type="button"
                onclick="removerFavorito(${index})"
                style="
                  border:0;
                  background:none;
                  color:#e53935;
                  padding:0;
                "
              >
                🗑️
              </button>

            </div>

          </div>

        </div>

      `;

    })
    .join("");

  abrirModal(
    "❤️ Meus favoritos",
    html
  );

}


/* ==============================
   PARTILHAR
============================== */

async function compartilharSite(){

  const dados = {
    title:"AfricanMundo",
    text:"A informação que liga África ao mundo.",
    url:location.href
  };

  if(navigator.share){

    try{

      await navigator.share(dados);

    }catch(e){

      console.log("Partilha cancelada.");

    }

    return;
  }

  copiarLinkSite();

}


async function copiarLinkSite(){

  try{

    if(
      navigator.clipboard &&
      window.isSecureContext
    ){

      await navigator.clipboard.writeText(
        location.href
      );

      abrirModal(
        "🔗 Link copiado",
        `
          <div style="
            text-align:center;
            padding:15px;
          ">
            <div style="font-size:42px">🔗</div>

            <h3>Link copiado!</h3>

            <p style="color:var(--muted)">
              Agora podes partilhar o AfricanMundo.
            </p>
          </div>
        `
      );

      return;
    }

  }catch(e){}

  alert(
    "Link do AfricanMundo:\n\n" +
    location.href
  );

}


/* ==============================
   GUARDAR SITE
============================== */

function salvarSite(){

  abrirModal(
    "⭐ Guardar AfricanMundo",
    `
      <div style="
        text-align:center;
        padding:15px;
      ">

        <div style="font-size:45px">⭐</div>

        <h3>
          Guardar AfricanMundo
        </h3>

        <p style="color:var(--muted);line-height:1.6">
          Usa o menu do navegador e escolha
          <strong>Adicionar aos favoritos</strong>.
        </p>

      </div>
    `
  );

}


/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 4/6 — INTERFACE E FERRAMENTAS
========================================================= */


/* ==============================
   MODAL
============================== */

function abrirModal(titulo, conteudo){

  let overlay =
    document.getElementById("appModal");

  if(!overlay){

    overlay =
      document.createElement("div");

    overlay.id = "appModal";
    overlay.className = "modal-overlay";

    overlay.innerHTML = `
      <div class="modal">

        <div class="modal-header">

          <div class="modal-title"
               id="appModalTitle">
          </div>

          <button
            class="modal-close"
            type="button"
            onclick="fecharModal()">
            ✕
          </button>

        </div>

        <div
          class="modal-body"
          id="appModalBody">
        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener(
      "click",
      function(e){

        if(e.target === overlay){
          fecharModal();
        }

      }
    );

  }

  document.getElementById(
    "appModalTitle"
  ).textContent = titulo;

  document.getElementById(
    "appModalBody"
  ).innerHTML = conteudo;

  overlay.classList.add("active");

}


function fecharModal(){

  const modal =
    document.getElementById("appModal");

  if(modal){

    modal.classList.remove("active");

  }

}


/* ==============================
   NOTIFICAÇÕES
============================== */

function abrirNotificacoes(){

  const noticias =
    window.__noticias || [];

  if(!noticias.length){

    abrirModal(
      "🔔 Notificações",
      `
        <div style="text-align:center;padding:20px">
          <div style="font-size:45px">🔔</div>

          <h3>Nenhuma novidade</h3>

          <p style="color:var(--muted)">
            As novas notícias aparecerão aqui.
          </p>
        </div>
      `
    );

    return;
  }

  const html = noticias
    .slice(0,10)
    .map(n => `

      <button
        type="button"
        onclick="abrirNoticiaPorId('${esc(n.id)}')"
        class="modal-option">

        <strong>
          ${esc(tituloNoticia(n))}
        </strong>

        <small>
          ${esc(categoriaNoticia(n))}
        </small>

      </button>

    `)
    .join("");

  abrirModal(
    "🔔 Últimas notícias",
    html
  );

}


/* ==============================
   FERRAMENTAS
============================== */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `

      <button
        class="modal-option"
        onclick="abrirFavoritos()"
        type="button">

        <strong>❤️ Meus favoritos</strong>

        <small>
          Ver notícias que guardaste.
        </small>

      </button>


      <button
        class="modal-option"
        onclick="compartilharSite()"
        type="button">

        <strong>📤 Partilhar AfricanMundo</strong>

        <small>
          Enviar o site para outras pessoas.
        </small>

      </button>


      <button
        class="modal-option"
        onclick="salvarSite()"
        type="button">

        <strong>⭐ Guardar site</strong>

        <small>
          Guardar o AfricanMundo no navegador.
        </small>

      </button>

    `
  );

}


/* ==============================
   MINHA ÁREA
============================== */

function abrirUsuario(){

  abrirModal(
    "👤 Minha área",
    `

      <div style="
        text-align:center;
        padding:10px;
      ">

        <div style="font-size:50px">
          👤
        </div>

        <h3>
          Minha área
        </h3>

        <p style="
          color:var(--muted);
          line-height:1.6;
        ">
          Aqui podes aceder aos teus
          favoritos e personalizar
          a experiência no AfricanMundo.
        </p>

      </div>


      <button
        class="modal-option"
        onclick="abrirFavoritos()"
        type="button">

        <strong>❤️ Meus favoritos</strong>

        <small>
          Ver notícias guardadas.
        </small>

      </button>

    `
  );

}


/* ==============================
   MODO ESCURO
============================== */

function alterarTema(){

  document.body.classList.toggle("dark");

  const escuro =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "africanmundo_tema",
    escuro ? "dark" : "light"
  );

  atualizarBotaoTema();

}


function atualizarBotaoTema(){

  const botao =
    document.getElementById("themeBtn");

  if(!botao) return;

  botao.textContent =
    document.body.classList.contains("dark")
      ? "☀️"
      : "🌙";

}


function carregarTema(){

  if(
    localStorage.getItem(
      "africanmundo_tema"
    ) === "dark"
  ){

    document.body.classList.add("dark");

  }

  atualizarBotaoTema();

}


/* ==============================
   CORES
============================== */

function abrirCores(){

  abrirModal(
    "🎨 Escolher cor",
    `

      <button
        class="modal-option"
        onclick="mudarCor('green')"
        type="button">

        <strong>🟢 Verde</strong>
        <small>Cor original do AfricanMundo.</small>

      </button>


      <button
        class="modal-option"
        onclick="mudarCor('blue')"
        type="button">

        <strong>🔵 Azul</strong>
        <small>Visual azul.</small>

      </button>


      <button
        class="modal-option"
        onclick="mudarCor('red')"
        type="button">

        <strong>🔴 Vermelho</strong>
        <small>Visual vermelho.</small>

      </button>


      <button
        class="modal-option"
        onclick="mudarCor('purple')"
        type="button">

        <strong>🟣 Roxo</strong>
        <small>Visual roxo.</small>

      </button>


      <button
        class="modal-option"
        onclick="mudarCor('orange')"
        type="button">

        <strong>🟠 Laranja</strong>
        <small>Visual laranja.</small>

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

  fecharModal();

}


function carregarCor(){

  const cor =
    localStorage.getItem(
      "africanmundo_cor"
    );

  if(!cor || cor === "green") return;

  document.body.classList.add(
    "color-" + cor
  );

}


/* ==============================
   REDES SOCIAIS
============================== */

function abrirRedes(){

  abrirModal(
    "🌐 Redes sociais",
    `

      <a
        href="https://www.google.com"
        target="_blank"
        class="modal-option"
        style="text-decoration:none">

        <strong>🔵 Google</strong>
        <small>Aceder ao Google.</small>

      </a>


      <a
        href="https://www.facebook.com"
        target="_blank"
        class="modal-option"
        style="text-decoration:none">

        <strong>🔵 Facebook</strong>
        <small>Aceder ao Facebook.</small>

      </a>


      <a
        href="https://www.youtube.com"
        target="_blank"
        class="modal-option"
        style="text-decoration:none">

        <strong>▶️ YouTube</strong>
        <small>Aceder ao YouTube.</small>

      </a>


      <a
        href="https://www.whatsapp.com"
        target="_blank"
        class="modal-option"
        style="text-decoration:none">

        <strong>🟢 WhatsApp</strong>
        <small>Aceder ao WhatsApp.</small>

      </a>


      <a
        href="https://www.instagram.com"
        target="_blank"
        class="modal-option"
        style="text-decoration:none">

        <strong>📷 Instagram</strong>
        <small>Aceder ao Instagram.</small>

      </a>


      <a
        href="https://www.tiktok.com"
        target="_blank"
        class="modal-option"
        style="text-decoration:none">

        <strong>🎵 TikTok</strong>
        <small>Aceder ao TikTok.</small>

      </a>

    `
  );

}


/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 5/6 — FERRAMENTAS, TEMA, CORES E REDES
========================================================= */

/* =========================================================
   MODAL
========================================================= */

function abrirModal(titulo, conteudo){

  let overlay = document.getElementById("appModal");

  if(!overlay){

    overlay = document.createElement("div");

    overlay.id = "appModal";

    overlay.className = "modal-overlay";

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title" id="modalTitulo"></div>

          <button
            class="modal-close"
            type="button"
            onclick="fecharModal()"
          >
            ✕
          </button>
        </div>

        <div
          class="modal-body"
          id="modalConteudo"
        ></div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener("click", function(e){

      if(e.target === overlay){
        fecharModal();
      }

    });

  }

  document.getElementById("modalTitulo").textContent =
    titulo || "AfricanMundo";

  document.getElementById("modalConteudo").innerHTML =
    conteudo || "";

  overlay.classList.add("active");

}


function fecharModal(){

  const modal =
    document.getElementById("appModal");

  if(modal){
    modal.classList.remove("active");
  }

}


/* =========================================================
   FERRAMENTAS
========================================================= */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `
      <button
        class="modal-option"
        onclick="abrirFavoritos()"
      >
        <strong>❤️ Meus favoritos</strong>
        <small>Veja as notícias que guardou.</small>
      </button>

      <button
        class="modal-option"
        onclick="salvarSite()"
      >
        <strong>⭐ Guardar AfricanMundo</strong>
        <small>Adicione o site aos favoritos do navegador.</small>
      </button>

      <button
        class="modal-option"
        onclick="compartilharSite()"
      >
        <strong>📤 Partilhar</strong>
        <small>Envie o AfricanMundo para outras pessoas.</small>
      </button>

      <button
        class="modal-option"
        onclick="copiarLinkSite()"
      >
        <strong>🔗 Copiar link</strong>
        <small>Copie o endereço desta página.</small>
      </button>

      <button
        class="modal-option"
        onclick="alterarTamanhoTexto()"
      >
        <strong>🔤 Tamanho do texto</strong>
        <small>Aumente ou diminua o texto do site.</small>
      </button>
    `
  );

}


/* =========================================================
   MINHA ÁREA
========================================================= */

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
          line-height:1.6;
        ">
          Aqui podes acessar os teus
          favoritos, notificações e
          ferramentas do site.
        </p>

        <button
          class="modal-option"
          onclick="abrirFavoritos()"
        >
          <strong>❤️ Meus favoritos</strong>
          <small>Notícias guardadas neste dispositivo.</small>
        </button>

        <button
          class="modal-option"
          onclick="abrirNotificacoes()"
        >
          <strong>🔔 Notificações</strong>
          <small>Veja as notícias mais recentes.</small>
        </button>

      </div>
    `
  );

}


/* =========================================================
   MODO ESCURO / CLARO
========================================================= */

function alternarTema(){

  document.body.classList.toggle("dark");

  const escuro =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "africanmundo_tema",
    escuro ? "dark" : "light"
  );

  const botao =
    document.getElementById("themeBtn");

  if(botao){

    botao.textContent =
      escuro ? "☀️" : "🌙";

    botao.setAttribute(
      "aria-label",
      escuro
        ? "Modo claro"
        : "Modo escuro"
    );

  }

}


/* =========================================================
   CARREGAR TEMA
========================================================= */

function carregarTema(){

  const tema =
    localStorage.getItem(
      "africanmundo_tema"
    );

  if(tema === "dark"){

    document.body.classList.add("dark");

  }

  const botao =
    document.getElementById("themeBtn");

  if(botao){

    botao.textContent =
      document.body.classList.contains("dark")
        ? "☀️"
        : "🌙";

  }

}


/* =========================================================
   ESCOLHER CORES
========================================================= */

function abrirCores(){

  abrirModal(
    "🎨 Cores",
    `
      <button
        class="modal-option"
        onclick="mudarCor('green')"
      >
        <strong>🟢 Verde</strong>
        <small>Cor principal do AfricanMundo.</small>
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('blue')"
      >
        <strong>🔵 Azul</strong>
        <small>Visual azul profissional.</small>
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('red')"
      >
        <strong>🔴 Vermelho</strong>
        <small>Visual vermelho.</small>
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('purple')"
      >
        <strong>🟣 Roxo</strong>
        <small>Visual roxo.</small>
      </button>

      <button
        class="modal-option"
        onclick="mudarCor('orange')"
      >
        <strong>🟠 Laranja</strong>
        <small>Visual laranja.</small>
      </button>
    `
  );

}


/* =========================================================
   MUDAR COR
========================================================= */

function mudarCor(cor){

  document.body.classList.remove(
    "color-blue",
    "color-red",
    "color-purple",
    "color-orange"
  );

  if(
    ["blue","red","purple","orange"]
      .includes(cor)
  ){

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


/* =========================================================
   CARREGAR COR
========================================================= */

function carregarCor(){

  const cor =
    localStorage.getItem(
      "africanmundo_cor"
    );

  if(cor){

    mudarCorSilencioso(cor);

  }

}


function mudarCorSilencioso(cor){

  document.body.classList.remove(
    "color-blue",
    "color-red",
    "color-purple",
    "color-orange"
  );

  if(
    ["blue","red","purple","orange"]
      .includes(cor)
  ){

    document.body.classList.add(
      "color-" + cor
    );

  }

}


/* =========================================================
   TAMANHO DO TEXTO
========================================================= */

function alterarTamanhoTexto(){

  const atual =
    Number(
      localStorage.getItem(
        "africanmundo_texto"
      ) || "100"
    );

  let novo = atual + 10;

  if(novo > 130){
    novo = 90;
  }

  document.documentElement.style.fontSize =
    novo + "%";

  localStorage.setItem(
    "africanmundo_texto",
    novo
  );

  abrirModal(
    "🔤 Tamanho do texto",
    `
      <div style="
        text-align:center;
        padding:15px;
      ">

        <div style="font-size:40px">
          🔤
        </div>

        <h3>
          Texto ajustado
        </h3>

        <p style="
          color:var(--muted);
          line-height:1.6;
        ">
          Tamanho atual: <strong>${novo}%</strong>
        </p>

        <button
          class="modal-option"
          onclick="alterarTamanhoTexto()"
        >
          🔄 Alterar novamente
        </button>

      </div>
    `
  );

}


/* =========================================================
   CARREGAR TAMANHO
========================================================= */

function carregarTamanhoTexto(){

  const tamanho =
    Number(
      localStorage.getItem(
        "africanmundo_texto"
      ) || "100"
    );

  document.documentElement.style.fontSize =
    tamanho + "%";

}


/* =========================================================
   REDES SOCIAIS
========================================================= */

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
          href="https://www.google.com/"
          target="_blank"
          rel="noopener"
          style="text-decoration:none"
        >
          <strong>🔵 Google</strong>
          <small>Pesquisar no Google.</small>
        </a>

        <a
          class="modal-option"
          href="https://www.facebook.com/"
          target="_blank"
          rel="noopener"
          style="text-decoration:none"
        >
          <strong>🔵 Facebook</strong>
          <small>Acesse o Facebook.</small>
        </a>

        <a
          class="modal-option"
          href="https://www.youtube.com/"
          target="_blank"
          rel="noopener"
          style="text-decoration:none"
        >
          <strong>▶️ YouTube</strong>
          <small>Acesse o YouTube.</small>
        </a>

        <a
          class="modal-option"
          href="https://www.whatsapp.com/"
          target="_blank"
          rel="noopener"
          style="text-decoration:none"
        >
          <strong>🟢 WhatsApp</strong>
          <small>Acesse o WhatsApp.</small>
        </a>

        <a
          class="modal-option"
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener"
          style="text-decoration:none"
        >
          <strong>📷 Instagram</strong>
          <small>Acesse o Instagram.</small>
        </a>

        <a
          class="modal-option"
          href="https://www.tiktok.com/"
          target="_blank"
          rel="noopener"
          style="text-decoration:none"
        >
          <strong>🎵 TikTok</strong>
          <small>Acesse o TikTok.</small>
        </a>

      </div>
    `
  );

}


/* =========================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 6/6 — INICIALIZAÇÃO
========================================================= */


/* =========================================================
   PESQUISA
========================================================= */

function pesquisarNoticias(){

  const input =
    document.getElementById("searchInput");

  const area =
    document.getElementById("searchResults");

  if(!input || !area) return;

  const termo =
    input.value.trim().toLowerCase();

  if(!termo){

    area.innerHTML = "";

    return;
  }

  const resultados =
    window.__noticias.filter(function(noticia){

      const titulo =
        obterTitulo(noticia).toLowerCase();

      const texto =
        obterTexto(noticia).toLowerCase();

      const categoria =
        String(
          noticia.categoria ||
          noticia.category ||
          ""
        ).toLowerCase();

      return (
        titulo.includes(termo) ||
        texto.includes(termo) ||
        categoria.includes(termo)
      );

    });


  area.innerHTML = "";

  area.style.display = "grid";
  area.style.gap = "14px";
  area.style.marginTop = "14px";


  if(!resultados.length){

    area.innerHTML = `
      <div class="loading">
        🔎 Nenhuma notícia encontrada.
      </div>
    `;

    return;
  }


  resultados
    .slice(0,8)
    .forEach(function(noticia){

      area.appendChild(
        criarCard(noticia)
      );

    });

}


/* =========================================================
   LIGAR BOTÕES
========================================================= */

function configurarBotoes(){

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );

  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );

  const userBtn =
    document.getElementById(
      "userBtn"
    );

  const themeBtn =
    document.getElementById(
      "themeBtn"
    );

  const colorBtn =
    document.getElementById(
      "colorBtn"
    );


  if(notificationBtn){

    notificationBtn.onclick =
      abrirNotificacoes;

  }


  if(toolsBtn){

    toolsBtn.onclick =
      abrirFerramentas;

  }


  if(userBtn){

    userBtn.onclick =
      abrirUsuario;

  }


  if(themeBtn){

    themeBtn.onclick =
      alternarTema;

  }


  if(colorBtn){

    colorBtn.onclick =
      abrirCores;

  }


  /* -------------------------------------------------------
     PESQUISA
  ------------------------------------------------------- */

  const searchForm =
    document.getElementById(
      "searchForm"
    );


  if(searchForm){

    searchForm.addEventListener(
      "submit",
      function(event){

        event.preventDefault();

        pesquisarNoticias();

      }
    );

  }

}


/* =========================================================
   INICIALIZAR SITE
========================================================= */

async function iniciarAfricanMundo(){

  console.log(
    "🌍 AfricanMundo iniciando..."
  );


  /* -------------------------------------------------------
     CONFIGURAÇÕES
  ------------------------------------------------------- */

  carregarTema();

  carregarCor();

  carregarTamanhoTexto();


  /* -------------------------------------------------------
     BOTÕES
  ------------------------------------------------------- */

  configurarBotoes();


  /* -------------------------------------------------------
     SUPABASE
  ------------------------------------------------------- */

  if(
    !iniciarSupabase()
  ){

    mostrarErroSupabase(
      "Não foi possível conectar ao Supabase."
    );

    return;
  }


  /* -------------------------------------------------------
     NOTÍCIAS
  ------------------------------------------------------- */

  await carregarNoticias();


  console.log(
    "✅ AfricanMundo pronto."
  );

}


/* =========================================================
   INICIAR QUANDO A PÁGINA ESTIVER PRONTA
========================================================= */

if(
  document.readyState === "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    iniciarAfricanMundo
  );

}else{

  iniciarAfricanMundo();

}


/* =========================================================
   PROTEÇÃO GLOBAL CONTRA ERROS
========================================================= */

window.addEventListener(
  "error",
  function(event){

    console.error(
      "❌ Erro no AfricanMundo:",
      event.error || event.message
    );

  }
);


/* =========================================================
   FUNÇÕES DISPONÍVEIS GLOBALMENTE
========================================================= */

window.abrirNoticia =
  abrirNoticia;

window.abrirNoticiaPorId =
  abrirNoticiaPorId;

window.guardarFavorito =
  guardarFavorito;

window.abrirFavoritos =
  abrirFavoritos;

window.abrirNotificacoes =
  abrirNotificacoes;

window.abrirFerramentas =
  abrirFerramentas;

window.abrirUsuario =
  abrirUsuario;

window.abrirRedes =
  abrirRedes;

window.abrirCores =
  abrirCores;

window.alternarTema =
  alternarTema;

window.salvarSite =
  salvarSite;

window.compartilharSite =
  compartilharSite;

window.copiarLinkSite =
  copiarLinkSite;

window.alterarTamanhoTexto =
  alterarTamanhoTexto;

window.fecharModal =
  fecharModal;

window.removerFavorito =
  removerFavorito;


/* =========================================================
   FIM DO APP.JS
   🌍 AFRICANMUNDO
========================================================= */
