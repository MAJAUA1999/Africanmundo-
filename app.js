/* ==========================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 1 — SUPABASE + NOTÍCIAS
========================================== */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let db = null;

window.__noticias = [];


/* SUPABASE */

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


/* SEGURANÇA */

function esc(v){

  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* CATEGORIA */

function categoria(v){

  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();

}


/* CAMPOS DA NOTÍCIA */

function titulo(n){
  return n?.titulo || n?.title || "Sem título";
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


/* ABRIR NOTÍCIA */

function abrirNoticia(n){

  if(!n?.id) return;

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(n.id);

}


/* CARREGAR NOTÍCIAS */

async function carregarNoticias(){

  if(!db && !iniciarSupabase()){

    mostrarErro("Supabase não disponível.");
    return;

  }

  try{

    const {data,error} =
      await db
        .from("noticias")
        .select("*")
        .order("id",{ascending:false});

    if(error) throw error;

    window.__noticias =
      Array.isArray(data) ? data : [];

    renderizarTudo();

    console.log(
      "✅ Notícias:",
      window.__noticias.length
    );

  }catch(e){

    console.error(e);

    mostrarErro(
      e.message ||
      "Não foi possível carregar as notícias."
    );

  }

}


/* ==========================================
   RENDERIZAR TODA A PÁGINA
========================================== */

function renderizarTudo(){

  const n = window.__noticias;

  renderizarDestaque(n[0]);

  renderizarLista(
    "ultimas",
    n.slice(0,4)
  );

  renderizarLista(
    "futebol",
    filtrar("futebol")
  );

  renderizarLista(
    "mocambique",
    filtrar("mocambique")
  );

  renderizarLista(
    "africa",
    filtrar("africa")
  );

  renderizarLista(
    "negocios",
    filtrar("negocios")
  );

  renderizarLista(
    "entretenimento",
    filtrar("entretenimento")
  );

  renderizarLista(
    "desporto",
    filtrar("desporto")
  );

}


/* FILTRAR */

function filtrar(cat){

  return window.__noticias.filter(
    n =>
      categoria(n.categoria) === cat
  );

}
/* ==========================================
   PARTE 2 — DESTAQUE + CARDS
========================================== */

function renderizarDestaque(n){

  const area =
    document.getElementById("destaque");

  if(!area) return;

  if(!n){

    area.innerHTML =
      `<div class="loading">
        Nenhuma notícia disponível.
      </div>`;

    return;
  }

  area.innerHTML = `
    <article class="featured" onclick="abrirNoticiaPorId('${esc(n.id)}')">

      ${
        imagem(n)
        ? `<img
            class="featured-image"
            src="${esc(imagem(n))}"
            alt="${esc(titulo(n))}"
            loading="eager"
            onerror="this.style.display='none'">`
        : `<div class="featured-image news-no-image">🌍</div>`
      }

      <div class="featured-content">

        <div class="featured-category">
          ${esc(n.categoria || "Notícias")}
        </div>

        <h1 class="featured-title">
          ${esc(titulo(n))}
        </h1>

        <p class="featured-text">
          ${esc(texto(n).slice(0,180))}
          ${texto(n).length > 180 ? "..." : ""}
        </p>

        <div class="featured-read">
          LER NOTÍCIA →
        </div>

      </div>

    </article>
  `;
}


/* ==========================================
   CARDS
========================================== */

function criarCard(n){

  const img = imagem(n);
  const cat = n.categoria || "Notícias";

  const card =
    document.createElement("article");

  card.className = "news-card";

  card.onclick = () =>
    abrirNoticia(n);

  card.innerHTML = `

    ${
      img
      ? `<img
          class="news-image"
          src="${esc(img)}"
          alt="${esc(titulo(n))}"
          loading="lazy"
          onerror="this.style.display='none'">`
      : `<div class="news-no-image">🌍</div>`
    }

    <div class="news-content">

      <div class="news-category">
        ${esc(cat)}
      </div>

      <h3 class="news-title">
        ${esc(titulo(n))}
      </h3>

      ${
        texto(n)
        ? `<p class="news-description">
            ${esc(texto(n).slice(0,100))}
            ${texto(n).length > 100 ? "..." : ""}
           </p>`
        : ""
      }

      <div class="news-footer">
        <span>${formatarData(n.created_at || n.data)}</span>
        <span>LER →</span>
      </div>

    </div>
  `;

  return card;
}


/* ==========================================
   LISTA DE NOTÍCIAS
========================================== */

function renderizarLista(id,lista){

  const area =
    document.getElementById(id);

  if(!area) return;

  area.innerHTML = "";

  if(!lista.length){

    area.innerHTML = `
      <div class="loading">
        Ainda não existem notícias nesta categoria.
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
   DATA
========================================== */

function formatarData(v){

  if(!v) return "";

  const d = new Date(v);

  if(isNaN(d.getTime()))
    return "";

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
   ABRIR POR ID
========================================== */

function abrirNoticiaPorId(id){

  if(!id) return;

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

               }
/* ==========================================
   PARTE 3 — CARREGAR NOTÍCIAS
========================================== */

async function carregarNoticias(){

  const areas = [
    "destaque",
    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"
  ];

  try{

    if(!db)
      throw new Error("Supabase não iniciado.");

    const {data,error} =
      await db
        .from("noticias")
        .select("*")
        .order("id",{ascending:false});

    if(error) throw error;

    window.__noticias =
      Array.isArray(data) ? data : [];

    const noticias =
      window.__noticias;

    /* DESTAQUE */

    renderizarDestaque(
      noticias[0]
    );

    /* ÚLTIMAS */

    renderizarLista(
      "ultimas",
      noticias.slice(0,4)
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

    categorias.forEach(cat => {

      const lista =
        noticias.filter(n =>
          normalizarCategoria(
            n.categoria
          ) === cat
        );

      renderizarLista(
        cat,
        lista
      );

    });

    console.log(
      "✅ Notícias carregadas:",
      noticias.length
    );

  }catch(error){

    console.error(
      "❌ Erro ao carregar notícias:",
      error
    );

    areas.forEach(id => {

      const area =
        document.getElementById(id);

      if(area){

        area.innerHTML = `
          <div class="loading">
            ⚠️ Não foi possível
            carregar as notícias.
          </div>
        `;

      }

    });

  }

}


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
    window.__noticias.filter(n => {

      const t =
        titulo(n).toLowerCase();

      const x =
        texto(n).toLowerCase();

      return (
        t.includes(termo) ||
        x.includes(termo)
      );

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

  resultados
    .slice(0,8)
    .forEach(n =>
      area.appendChild(
        criarCard(n)
      )
    );

}


/* ==========================================
   EVENTO DA PESQUISA
========================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

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

    carregarNoticias();

  }
);
/* ==========================================
   AFRICANMUNDO — APP.JS
   PARTE 4/4
   INTERAÇÕES + INICIALIZAÇÃO
========================================== */

/* MODAL */
function abrirModal(titulo,html){
  let modal=document.getElementById("amModal");

  if(!modal){
    modal=document.createElement("div");
    modal.id="amModal";
    modal.innerHTML=`
      <div class="am-back" onclick="fecharModal()">
        <div class="am-box" onclick="event.stopPropagation()">
          <div class="am-head">
            <strong id="amTitle"></strong>
            <button onclick="fecharModal()">✕</button>
          </div>
          <div id="amBody"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const s=document.createElement("style");
    s.textContent=`
      .am-back{position:fixed;inset:0;z-index:9999;
        background:#0008;display:flex;align-items:center;
        justify-content:center;padding:15px}
      .am-box{width:min(520px,100%);max-height:90vh;
        overflow:auto;background:var(--card);color:var(--txt);
        border-radius:18px}
      .am-head{display:flex;justify-content:space-between;
        align-items:center;padding:14px 16px;
        border-bottom:1px solid var(--border)}
      .am-head button{border:0;background:var(--bg);
        color:var(--txt);border-radius:9px;padding:7px 10px}
      #amBody{padding:16px}
    `;
    document.head.appendChild(s);
  }

  document.getElementById("amTitle").textContent=titulo;
  document.getElementById("amBody").innerHTML=html;
  modal.style.display="block";
}

function fecharModal(){
  const m=document.getElementById("amModal");
  if(m)m.style.display="none";
}


/* FERRAMENTAS */
function abrirFerramentas(){
  abrirModal("🛠️ Ferramentas",`
    <div style="display:grid;gap:9px">
      <button onclick="abrirFavoritos()">❤️ Meus favoritos</button>
      <button onclick="compartilharSite()">📤 Partilhar AfricanMundo</button>
      <button onclick="copiarLinkSite()">🔗 Copiar link</button>
      <button onclick="salvarSite()">⭐ Guardar site</button>
    </div>
  `);
}


/* UTILIZADOR */
function abrirUsuario(){
  abrirModal("👤 Minha área",`
    <div style="text-align:center;padding:15px">
      <div style="font-size:45px">👤</div>
      <h3>Bem-vindo ao AfricanMundo</h3>
      <p style="color:var(--muted)">
        Aqui podes guardar notícias favoritas
        e personalizar a tua experiência.
      </p>
      <button onclick="abrirFavoritos()">❤️ Ver favoritos</button>
    </div>
  `);
}


/* REDES SOCIAIS */
function abrirRedes(){
  abrirModal("🌐 Redes sociais",`
    <div style="display:grid;gap:8px">
      <button onclick="abrirLink('https://www.google.com')">🌐 Google</button>
      <button onclick="abrirLink('https://www.facebook.com')">🔵 Facebook</button>
      <button onclick="abrirLink('https://www.youtube.com')">▶️ YouTube</button>
      <button onclick="abrirLink('https://www.whatsapp.com')">💬 WhatsApp</button>
      <button onclick="abrirLink('https://www.instagram.com')">📷 Instagram</button>
      <button onclick="abrirLink('https://www.tiktok.com')">🎵 TikTok</button>
    </div>
  `);
}

function abrirLink(url){
  window.open(url,"_blank","noopener");
}


/* MODO ESCURO */
function alternarTema(){
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "am_dark",
    document.body.classList.contains("dark")
  );
}

function carregarTema(){
  if(localStorage.getItem("am_dark")==="true"){
    document.body.classList.add("dark");
  }
}


/* CORES */
function abrirCores(){
  abrirModal("🎨 Escolher cor",`
    <div style="display:grid;gap:8px">
      <button onclick="mudarCor('green')">🟢 Verde</button>
      <button onclick="mudarCor('blue')">🔵 Azul</button>
      <button onclick="mudarCor('red')">🔴 Vermelho</button>
      <button onclick="mudarCor('purple')">🟣 Roxo</button>
      <button onclick="mudarCor('orange')">🟠 Laranja</button>
    </div>
  `);
}

function mudarCor(cor){
  document.body.classList.remove(
    "color-blue",
    "color-red",
    "color-purple",
    "color-orange"
  );

  if(cor!=="green"){
    document.body.classList.add("color-"+cor);
  }

  localStorage.setItem("am_color",cor);
  fecharModal();
}

function carregarCor(){
  const cor=localStorage.getItem("am_color");
  if(cor) mudarCor(cor);
}


/* PESQUISA */
function pesquisar(e){
  e.preventDefault();

  const input=document.getElementById("searchInput");
  const area=document.getElementById("searchResults");

  if(!input || !area)return;

  const termo=normalizarCategoria(input.value);

  if(!termo){
    area.innerHTML="";
    return;
  }

  const resultados=window.__noticias.filter(n=>{
    const texto=normalizarCategoria(
      obterTitulo(n)+" "+obterTexto(n)
    );
    return texto.includes(termo);
  });

  area.innerHTML="";

  if(!resultados.length){
    area.innerHTML=`
      <div class="loading">
        Nenhuma notícia encontrada.
      </div>`;
    return;
  }

  const box=document.createElement("div");
  box.className="news-grid";

  resultados.slice(0,8).forEach(n=>{
    box.appendChild(criarCard(n));
  });

  area.appendChild(box);
}


/* EVENTOS */
function iniciarEventos(){

  document.getElementById("notificationBtn")
    ?.addEventListener("click",abrirNotificacoes);

  document.getElementById("toolsBtn")
    ?.addEventListener("click",abrirFerramentas);

  document.getElementById("userBtn")
    ?.addEventListener("click",abrirUsuario);

  document.getElementById("themeBtn")
    ?.addEventListener("click",alternarTema);

  document.getElementById("colorBtn")
    ?.addEventListener("click",abrirCores);

  document.getElementById("searchForm")
    ?.addEventListener("submit",pesquisar);
}


/* INICIAR */
document.addEventListener("DOMContentLoaded",()=>{
  carregarTema();

  const cor=localStorage.getItem("am_color");
  if(cor && cor!=="green"){
    document.body.classList.add("color-"+cor);
  }

  iniciarEventos();
  carregarNoticias();
});
