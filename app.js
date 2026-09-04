/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   VERSÃO LIMPA E PROFISSIONAL
========================================== */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const VAPID_PUBLIC_KEY =
  "BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db = null;

window.__noticias = [];


/* ==========================================
   SUPABASE
========================================== */

function iniciarSupabase(){

  if(!window.supabase){
    console.error("Supabase não carregou.");
    return false;
  }

  try{

    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    return true;

  }catch(e){

    console.error("Erro Supabase:",e);
    return false;

  }
}


/* ==========================================
   FUNÇÕES BÁSICAS
========================================== */

function esc(v){

  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


function normalizarCategoria(v){

  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

}


function obterTitulo(n){

  return n?.titulo ||
         n?.title ||
         "Sem título";

}


function obterTexto(n){

  return n?.texto ||
         n?.conteudo ||
         n?.content ||
         n?.descricao ||
         "";

}


function obterImagem(n){

  return n?.imagem ||
         n?.imagem_url ||
         n?.image ||
         n?.image_url ||
         n?.url_imagem ||
         "";

}


function formatarData(v){

  if(!v) return "";

  const d = new Date(v);

  if(isNaN(d.getTime())) return "";

  return d.toLocaleDateString(
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
    "noticia.html?id="+
    encodeURIComponent(n.id);

}


function abrirNoticiaPorId(id){

  if(!id) return;

  location.href =
    "noticia.html?id="+
    encodeURIComponent(id);

}


/* ==========================================
   CARD COMPACTO — PÁGINA INICIAL
========================================== */

function criarCard(n){

  const card = document.createElement("article");

  card.className = "compact-card";

  card.onclick = () => abrirNoticia(n);

  const img = obterImagem(n);
  const tit = obterTitulo(n);
  const cat = n?.categoria || "Notícias";

  card.innerHTML = `

    ${
      img
      ? `
        <img
          src="${esc(img)}"
          alt="${esc(tit)}"
          loading="lazy"
          onerror="this.style.display='none'"
        >
      `
      : `
        <div class="compact-img">
          🌍
        </div>
      `
    }

    <div class="compact-body">

      <div class="compact-cat">
        ${esc(cat)}
      </div>

      <div class="compact-title">
        ${esc(tit)}
      </div>

    </div>

  `;

  return card;
}

/* ==========================================
   RENDERIZAR LISTA
========================================== */

function renderizarLista(id,lista){

  const area =
    document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";

  if(!Array.isArray(lista) || !lista.length){

    area.innerHTML = `
      <div class="loading">
        Ainda não existem notícias
        nesta categoria.
      </div>
    `;

    return;
  }

  lista
    .slice(0,4)
    .forEach(n =>
      area.appendChild(
        criarCard(n)
      )
    );

}


/* ==========================================
   DESTAQUE
========================================== */

function renderizarDestaque(n){

  const area =
    document.getElementById("destaque");

  if(!area) return;

  if(!n){

    area.innerHTML = `
      <div class="loading">
        Nenhuma notícia disponível.
      </div>
    `;

    return;
  }

  const img = obterImagem(n);
  const titulo = obterTitulo(n);
  const texto = obterTexto(n);

  area.innerHTML = `

    <article
      class="featured"
      onclick="abrirNoticiaPorId('${esc(n.id)}')"
    >

      ${
        img
        ? `
          <img
            class="featured-image"
            src="${esc(img)}"
            alt="${esc(titulo)}"
          >
        `
        : `
          <div class="featured-image news-no-image">
            🌍
          </div>
        `
      }

      <div class="featured-content">

        <div class="featured-category">
          ${esc(n.categoria || "Notícias")}
        </div>

        <h1 class="featured-title">
          ${esc(titulo)}
        </h1>

        <p class="featured-text">
          ${esc(texto.slice(0,180))}
          ${texto.length>180 ? "..." : ""}
        </p>

        <div class="featured-read">
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

  if(!db && !iniciarSupabase()){

    mostrarErro(
      "Supabase não disponível."
    );

    return;
  }

  try{

    const resultado =
      await db
        .from("noticias")
        .select("*")
        .order(
          "id",
          {ascending:false}
        );

    if(resultado.error){

      throw resultado.error;

    }

    window.__noticias =
      Array.isArray(resultado.data)
      ? resultado.data
      : [];

    renderizarPagina();

    atualizarNotificacoes(
      window.__noticias
    );

    console.log(
      "✅ Notícias carregadas:",
      window.__noticias.length
    );

  }catch(e){

    console.error(
      "❌ Erro ao carregar notícias:",
      e
    );

    mostrarErro(
      e.message ||
      "Não foi possível carregar as notícias."
    );

  }

}


function renderizarPagina(){

  const noticias = Array.isArray(window.__noticias)
    ? [...window.__noticias]
    : [];

  if(!noticias.length) return;

  // Embaralhar notícias
  function embaralhar(lista){

    return lista
      .map(n => ({ n, ordem: Math.random() }))
      .sort((a,b) => a.ordem - b.ordem)
      .map(x => x.n);

  }

  // 🌟 Destaque aleatório
  const destaque =
    noticias[Math.floor(Math.random() * noticias.length)];

  renderizarDestaque(destaque);

  // 📰 Últimas notícias continuam recentes
  renderizarLista(
    "ultimas",
    noticias.slice(0,4)
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

    const listaCategoria =
      noticias.filter(n =>
        normalizarCategoria(n.categoria) === cat
      );

    // 🔀 Mudar a seleção a cada atualização
    const selecionadas =
      embaralhar(listaCategoria);

    renderizarLista(
      cat,
      selecionadas
    );

  });

}

/* ==========================================
   ERRO
========================================== */

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

        ⚠️ Não foi possível
        carregar as notícias.

        <small style="
          display:block;
          margin-top:8px;
          color:var(--muted);
        ">
          ${esc(mensagem)}
        </small>

      </div>
    `;

  });

}


/* ==========================================
   PESQUISA
========================================== */

function pesquisar(e){

  if(e) e.preventDefault();

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
    normalizarCategoria(
      input.value
    );

  if(!termo){

    area.innerHTML = "";

    return;
  }

  const resultados =
    window.__noticias.filter(n => {

      const texto =
        normalizarCategoria(
          obterTitulo(n) +
          " " +
          obterTexto(n)
        );

      return texto.includes(termo);

    });

  area.innerHTML = "";

  if(!resultados.length){

    area.innerHTML = `
      <div class="loading">
        🔎 Nenhuma notícia encontrada.
      </div>
    `;

    return;
  }

  const titulo =
    document.createElement("h3");

  titulo.textContent =
    "🔎 Resultados da pesquisa";

  area.appendChild(titulo);

  const grid =
    document.createElement("div");

  grid.className =
    "news-grid";

  resultados
    .slice(0,8)
    .forEach(n =>
      grid.appendChild(
        criarCard(n)
      )
    );

  area.appendChild(grid);

}


/* ==========================================
   FAVORITOS
========================================== */

function obterFavoritos(){

  try{

    const dados =
      JSON.parse(
        localStorage.getItem(
          "africanmundo_favoritos"
        ) || "[]"
      );

    return Array.isArray(dados)
      ? dados
      : [];

  }catch(e){

    return [];

  }

}


function guardarFavorito(n){

  if(!n?.id) return;

  const favoritos =
    obterFavoritos();

  if(
    favoritos.some(
      x =>
        String(x.id) ===
        String(n.id)
    )
  ){

    abrirModal(
      "❤️ Favoritos",
      "<p>Esta notícia já está nos favoritos.</p>"
    );

    return;
  }

  favoritos.unshift(n);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  abrirModal(
    "❤️ Favoritos",
    "<p>Notícia guardada com sucesso!</p>"
  );

}


function abrirFavoritos(){

  const favoritos =
    obterFavoritos();

  if(!favoritos.length){

    abrirModal(
      "❤️ Meus favoritos",
      `
        <div style="text-align:center">
          <div style="font-size:45px">❤️</div>
          <h3>Nenhuma notícia guardada</h3>
          <p style="color:var(--muted)">
            As notícias favoritas aparecerão aqui.
          </p>
        </div>
      `
    );

    return;
  }

  const html =
    favoritos.map((n,i) => `

      <div style="
        padding:12px;
        margin-bottom:8px;
        border:1px solid var(--border);
        border-radius:12px;
        background:var(--bg);
      ">

        <strong>
          ${esc(obterTitulo(n))}
        </strong>

        <br>

        <button
          onclick="abrirNoticiaPorId('${esc(n.id)}')"
          style="margin-top:8px"
        >
          LER →
        </button>

        <button
          onclick="removerFavorito(${i})"
          style="margin-top:8px"
        >
          🗑️
        </button>

      </div>

    `).join("");

  abrirModal(
    "❤️ Meus favoritos",
    html
  );

}


function removerFavorito(i){

  const favoritos =
    obterFavoritos();

  favoritos.splice(i,1);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  abrirFavoritos();

}

/* ==========================================
   NOTIFICAÇÕES
========================================== */

function atualizarNotificacoes(){

  const btn =
    document.getElementById(
      "notificationBtn"
    );

  if(!btn) return;

  const contador =
    btn.querySelector(
      ".notification-count"
    );

  if(contador){
    contador.remove();
  }

}


/* ==========================================
   🔔 NOTIFICAÇÕES
========================================== */

function abrirNotificacoes(){

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias.slice(0,10)
      : [];


  let botaoPush = "";

  if(
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  ){

    if(
      Notification.permission !== "granted"
    ){

      botaoPush = `

        <button
          onclick="ativarNotificacoesPush()"
          style="
            width:100%;
            margin-bottom:14px;
            padding:13px;
            border:0;
            border-radius:12px;
            background:var(--primary);
            color:white;
            font-weight:bold;
            cursor:pointer;
          "
        >
          🔔 Ativar notificações
        </button>

      `;

    }else{

      botaoPush = `

        <div style="
          margin-bottom:14px;
          padding:12px;
          border-radius:12px;
          background:var(--card);
          border:1px solid var(--border);
          text-align:center;
        ">
          🟢 Notificações ativadas
        </div>

      `;

    }

  }


  if(!noticias.length){

    abrirModal(
      "🔔 Notificações",
      botaoPush +
      "<p>Nenhuma novidade.</p>"
    );

    return;
  }


  const html =
    noticias.map(n => `

      <button
        onclick="abrirNoticiaPorId('${esc(n.id)}')"
        style="
          width:100%;
          text-align:left;
          margin-bottom:8px;
          padding:12px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--bg);
          color:var(--txt);
          cursor:pointer;
        "
      >
        <strong>
          ${esc(obterTitulo(n))}
        </strong>
      </button>

    `).join("");


  abrirModal(
    "🔔 Últimas novidades",
    botaoPush + html
  );

}

/* ==========================================
   🔔 ATIVAR NOTIFICAÇÕES PUSH
========================================== */

async function ativarNotificacoesPush(){

  try{

    if(!("Notification" in window)){
      alert("❌ Este navegador não suporta notificações.");
      return;
    }

    if(!("serviceWorker" in navigator)){
      alert("❌ Service Worker não disponível.");
      return;
    }

    if(!("PushManager" in window)){
      alert("❌ Push não disponível neste navegador.");
      return;
    }


    const permissao =
      await Notification.requestPermission();


    if(permissao !== "granted"){

      alert(
        "⚠️ As notificações não foram autorizadas."
      );

      return;
    }


    const registro =
      await navigator.serviceWorker.ready;


    let subscription =
      await registro.pushManager.getSubscription();


    if(!subscription){

      subscription =
        await registro.pushManager.subscribe({

          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToUint8Array(
              VAPID_PUBLIC_KEY
            )

        });

    }


    const dados =
      subscription.toJSON();


    if(
      !dados.endpoint ||
      !dados.keys?.p256dh ||
      !dados.keys?.auth
    ){

      throw new Error(
        "Inscrição push incompleta."
      );

    }


    const resposta =
      await fetch(
        "https://sonzwfhepjfvzltuxxne.supabase.co/functions/v1/salvar-push",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            endpoint:
              dados.endpoint,

            p256dh:
              dados.keys.p256dh,

            auth:
              dados.keys.auth

          })

        }
      );


    const resultado =
      await resposta.json();


    if(
      !resposta.ok ||
      !resultado.sucesso
    ){

      throw new Error(
        resultado.erro ||
        "Erro ao guardar inscrição."
      );

    }


    alert(
      "🟢 Notificações ativadas com sucesso!"
    );


    abrirNotificacoes();


  }catch(erro){

    console.error(
      "❌ Erro nas notificações:",
      erro
    );

    alert(
      "❌ Não foi possível ativar as notificações."
    );

  }

}


/* ==========================================
   CONVERTER CHAVE VAPID
========================================== */

function urlBase64ToUint8Array(base64String){

  const padding =
    "=".repeat(
      (4 - base64String.length % 4) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      char => char.charCodeAt(0)
    )
  );

}

/* ==========================================
   MODAL
========================================== */

function abrirModal(titulo,html){

  let modal =
    document.getElementById(
      "amModal"
    );

  if(!modal){

    modal =
      document.createElement("div");

    modal.id="amModal";

    modal.innerHTML=`

      <div
        class="am-back"
        onclick="fecharModal()"
      >

        <div
          class="am-box"
          onclick="event.stopPropagation()"
        >

          <div class="am-head">

            <strong id="amTitle"></strong>

            <button
              onclick="fecharModal()"
            >
              ✕
            </button>

          </div>

          <div id="amBody"></div>

        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const style =
      document.createElement("style");

    style.textContent=`

      .am-back{
        position:fixed;
        inset:0;
        z-index:9999;
        background:#0008;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:15px;
      }

      .am-box{
        width:min(520px,100%);
        max-height:90vh;
        overflow:auto;
        background:var(--card);
        color:var(--txt);
        border-radius:18px;
      }

      .am-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:14px 16px;
        border-bottom:1px solid var(--border);
      }

      .am-head button{
        border:0;
        background:var(--bg);
        color:var(--txt);
        border-radius:9px;
        padding:7px 10px;
      }

      #amBody{
        padding:16px;
      }

    `;

    document.head.appendChild(style);

  }

  document.getElementById(
    "amTitle"
  ).textContent=titulo;

  document.getElementById(
    "amBody"
  ).innerHTML=html;

  modal.style.display="block";

}


function fecharModal(){

  const modal =
    document.getElementById(
      "amModal"
    );

  if(modal)
    modal.style.display="none";

}


/* ==========================================
   FERRAMENTAS
========================================== */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `
      <div style="display:grid;gap:8px">

        <button onclick="abrirFavoritos()">
          ❤️ Meus favoritos
        </button>

        <button onclick="compartilharSite()">
          📤 Partilhar AfricanMundo
        </button>

        <button onclick="copiarLinkSite()">
          🔗 Copiar link
        </button>

        <button onclick="salvarSite()">
          ⭐ Guardar site
        </button>

      </div>
    `
  );

}


/* ==========================================
   UTILIZADOR
========================================== */

function abrirUsuario(){

  abrirModal(
    "👤 Minha área",
    `
      <div style="text-align:center">

        <div style="font-size:45px">
          👤
        </div>

        <h3>
          Bem-vindo ao AfricanMundo
        </h3>

        <p style="color:var(--muted)">
          Guarda notícias favoritas
          e personaliza a tua experiência.
        </p>

        <button onclick="abrirFavoritos()">
          ❤️ Meus favoritos
        </button>

      </div>
    `
  );

}


/* ==========================================
   REDES SOCIAIS
========================================== */

function abrirRedes(){

  abrirModal(
    "🌐 Redes sociais",
    `
      <div style="display:grid;gap:8px">

        <button onclick="abrirLink('https://www.google.com')">
          🌐 Google
        </button>

        <button onclick="abrirLink('https://www.facebook.com')">
          🔵 Facebook
        </button>

        <button onclick="abrirLink('https://www.youtube.com')">
          ▶️ YouTube
        </button>

        <button onclick="abrirLink('https://www.whatsapp.com')">
          💬 WhatsApp
        </button>

        <button onclick="abrirLink('https://www.instagram.com')">
          📷 Instagram
        </button>

        <button onclick="abrirLink('https://www.tiktok.com')">
          🎵 TikTok
        </button>

      </div>
    `
  );

}


function abrirLink(url){

  window.open(
    url,
    "_blank",
    "noopener"
  );

}


/* ==========================================
   PARTILHAR
========================================== */

async function compartilharSite(){

  const dados={
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

  copiarLinkSite();

}


async function copiarLinkSite(){

  try{

    await navigator.clipboard.writeText(
      location.href
    );

    abrirModal(
      "🔗 Link copiado",
      "<p>O link do AfricanMundo foi copiado.</p>"
    );

  }catch(e){

    alert(
      "Link do AfricanMundo:\n\n"+
      location.href
    );

  }

}


/* ==========================================
   GUARDAR SITE
========================================== */

function salvarSite(){

  abrirModal(
    "⭐ Guardar AfricanMundo",
    `
      <div style="text-align:center">

        <div style="font-size:45px">
          ⭐
        </div>

        <h3>
          Guardar AfricanMundo
        </h3>

        <p style="color:var(--muted)">
          Usa o menu do navegador e escolhe
          "Adicionar aos favoritos".
        </p>

      </div>
    `
  );

}


/* ==========================================
   MODO ESCURO
========================================== */

function alternarTema(){

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "am_dark",
    document.body.classList.contains("dark")
  );

}


function carregarTema(){

  if(
    localStorage.getItem("am_dark")
    === "true"
  ){

    document.body.classList.add("dark");

  }

}


/* ==========================================
   CORES
========================================== */

function abrirCores(){

  abrirModal(
    "🎨 Escolher cor",
    `
      <div style="display:grid;gap:8px">

        <button onclick="mudarCor('green')">
          🟢 Verde
        </button>

        <button onclick="mudarCor('blue')">
          🔵 Azul
        </button>

        <button onclick="mudarCor('red')">
          🔴 Vermelho
        </button>

        <button onclick="mudarCor('purple')">
          🟣 Roxo
        </button>

        <button onclick="mudarCor('orange')">
          🟠 Laranja
        </button>

      </div>
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
      "color-"+cor
    );

  }

  localStorage.setItem(
    "am_color",
    cor
  );

  fecharModal();

}


function carregarCor(){

  const cor =
    localStorage.getItem(
      "am_color"
    );

  if(
    cor &&
    cor !== "green"
  ){

    document.body.classList.add(
      "color-"+cor
    );

  }

}

/* =========================================
   📢 ANÚNCIOS ATIVOS — GRADE COMPACTA
========================================= */

async function carregarAnunciosAtivos() {

  if (!db && !iniciarSupabase()) return;

  const area = document.getElementById("anunciosAtivos");
  const secao = document.getElementById("anunciosAtivosSection");

  if (!area || !secao) return;

  try {

    const { data, error } = await db
      .from("anuncios")
      .select("*")
      .eq("ativo", true)
      .order("id", { ascending: false });

    if (error) throw error;

    const agora = new Date();

    const anunciosValidos = (data || []).filter(anuncio => {

      const inicio = anuncio.data_inicio
        ? new Date(anuncio.data_inicio + "T00:00:00")
        : null;

      const fim = anuncio.data_fim
        ? new Date(anuncio.data_fim + "T23:59:59")
        : null;

      if (inicio && agora < inicio) return false;
      if (fim && agora > fim) return false;

      return true;
    });

    if (!anunciosValidos.length) {
      secao.style.display = "none";
      return;
    }

    secao.style.display = "block";

    area.innerHTML = `
      <div style="
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  width:100%;
">

        ${anunciosValidos.map(anuncio => {

          const empresa = esc(anuncio.empresa || "Publicidade");
          const mensagem = esc(anuncio.mensagem || "");
          const imagem = anuncio.imagem ? esc(anuncio.imagem) : "";
          const video = esc(
            anuncio.video ||
            anuncio["vídeo"] ||
            ""
          );
          const link = anuncio.link ? esc(anuncio.link) : "";

          const conteudo = video
            ? `
              <video
                autoplay
                muted
                loop
                playsinline
                preload="auto"
                style="
                  display:block;
                  width:100%;
                  height:60px;
                  object-fit:cover;
                  background:#000;
                  pointer-events:none;
                "
              >
                <source src="${video}" type="video/mp4">
              </video>
            `
            : imagem
              ? `
                <img
                  src="${imagem}"
                  alt="${empresa}"
                  loading="lazy"
                  style="
                    display:block;
                    width:100%;
                    height:60px;
                    object-fit:cover;
                  "
                >
              `
              : "";

          return `
            <article style="
              overflow:hidden;
              border:1px solid var(--border);
              border-radius:12px;
              background:var(--card);
              box-shadow:0 3px 10px rgba(0,0,0,.08);
            ">

              ${link
                ? `<a href="${link}" target="_blank"
                     rel="noopener noreferrer"
                     style="display:block;">
                     ${conteudo}
                   </a>`
                : conteudo
              }

              <div style="
                padding:5px 6px;
              ">

                <div style="
                  font-size:11px;
                  font-weight:700;
                  white-space:nowrap;
                  overflow:hidden;
                  text-overflow:ellipsis;
                ">
                  📢 ${empresa}
                </div>

                ${
                  mensagem
                  ? `
                    <div style="
                      margin-top:3px;
                      font-size:11px;
                      line-height:1.3;
                      color:var(--muted);
                      display:-webkit-box;
                      -webkit-line-clamp:2;
                      -webkit-box-orient:vertical;
                      overflow:hidden;
                    ">
                      ${mensagem}
                    </div>
                  `
                  : ""
                }

              </div>

            </article>
          `;

        }).join("")}

      </div>
    `;

  } catch (erro) {

    console.error(
      "❌ Erro ao carregar anúncios:",
      erro
    );

    secao.style.display = "none";
  }
}

/* ==========================================
   EVENTOS + INICIALIZAÇÃO
========================================== */

function iniciarEventos(){

  document.getElementById("notificationBtn")
    ?.addEventListener("click", abrirNotificacoes);

  document.getElementById("toolsBtn")
    ?.addEventListener("click", abrirFerramentas);

  document.getElementById("userBtn")
    ?.addEventListener("click", abrirUsuario);

  document.getElementById("themeBtn")
    ?.addEventListener("click", alternarTema);

  document.getElementById("colorBtn")
    ?.addEventListener("click", abrirCores);

  document.getElementById("searchForm")
    ?.addEventListener("submit", pesquisar);

}


/* ==========================================
   INICIAR AFRICANMUNDO
========================================== */

document.addEventListener("DOMContentLoaded", () => {

  carregarTema();

  const cor =
    localStorage.getItem("am_color");

  if(cor && cor !== "green"){
    document.body.classList.add(
      "color-" + cor
    );
  }

    iniciarEventos();

  carregarNoticias();

  carregarAnunciosAtivos();

});

/* ==========================================
   REGISTAR SERVICE WORKER
========================================== */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("/Africanmundo-/service-worker.js")
      .then(() => {

        console.log(
          "✅ Service Worker registado."
        );

      })
      .catch((erro) => {

        console.error(
          "❌ Erro ao registar Service Worker:",
          erro
        );

      });

  });

}

function abrirRede(rede) {

  const links = {
    Google: "https://www.google.com/",
    Facebook: "https://www.facebook.com/",
    YouTube: "https://www.youtube.com/",
    WhatsApp: "https://www.whatsapp.com/",
    Instagram: "https://www.instagram.com/",
    TikTok: "https://www.tiktok.com/"
  };

  const url = links[rede];

  if (!url) {
    alert("❌ Rede social não encontrada.");
    return;
  }

  window.open(url, "_blank");

}

