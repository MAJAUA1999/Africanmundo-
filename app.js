/* ==================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 1/4
================================================== */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let db = null;
window.__noticias = [];


/* SUPABASE */

function iniciarSupabase(){
  if(!window.supabase) return false;

  try{
    db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}


/* UTILITÁRIOS */

function esc(v){
  return String(v ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function categoria(n){
  return String(
    n?.categoria || n?.category || "Notícias"
  );
}

function titulo(n){
  return n?.titulo || n?.title || "Sem título";
}

function texto(n){
  return n?.texto ||
         n?.conteudo ||
         n?.content ||
         n?.descricao || "";
}

function imagem(n){
  return n?.imagem ||
         n?.imagem_url ||
         n?.image ||
         n?.image_url ||
         n?.url_imagem || "";
}

function data(n){
  const v = n?.created_at || n?.data;
  if(!v) return "";

  const d = new Date(v);
  return isNaN(d) ? "" :
    d.toLocaleDateString("pt-MZ");
}

function normalizar(v){
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();
}


/* ABRIR NOTÍCIA */

function abrirNoticia(n){
  if(!n?.id) return;

  location.href =
    "noticia.html?id=" +
    encodeURIComponent(n.id);
}

function abrirNoticiaPorId(id){
  if(id) abrirNoticia({id});
}


/* CARTÃO */

function criarCard(n){

  const card = document.createElement("article");
  card.className = "card";

  const img = imagem(n);

  card.innerHTML = `
    ${
      img
      ? `<img src="${esc(img)}"
          alt="${esc(titulo(n))}"
          loading="lazy"
          onerror="this.style.display='none'">`
      : `<div style="
          height:145px;
          display:grid;
          place-items:center;
          background:var(--bg);
          font-size:40px">🌍</div>`
    }

    <div class="card-body">
      <div class="cat">${esc(categoria(n))}</div>

      <h3>${esc(titulo(n))}</h3>

      ${
        texto(n)
        ? `<div style="
            margin-top:6px;
            color:var(--muted);
            font-size:11px;
            line-height:1.4">
            ${esc(texto(n).slice(0,90))}
          </div>`
        : ""
      }

      ${
        data(n)
        ? `<div style="
            margin-top:8px;
            color:var(--muted);
            font-size:9px">
            ${data(n)}
          </div>`
        : ""
      }
    </div>
  `;

  card.onclick = () => abrirNoticia(n);

  return card;
}


/* RENDERIZAR */

function renderizar(id, lista, limite=4){

  const el = document.getElementById(id);
  if(!el) return;

  el.innerHTML = "";

  if(!lista.length){
    el.innerHTML =
      `<div class="empty">
        Ainda não existem notícias nesta secção.
      </div>`;
    return;
  }

  lista.slice(0,limite).forEach(n =>
    el.appendChild(criarCard(n))
  );
                       }
/* ==================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 2/4
================================================== */


/* CARREGAR NOTÍCIAS */

async function carregarNoticias(){

  const ids = [
    "destaque","ultimas","futebol","mocambique",
    "africa","negocios","entretenimento","desporto"
  ];

  if(!db && !iniciarSupabase()){
    mostrarErro("Supabase não disponível.");
    return;
  }

  try{

    const {data: noticias,error} =
      await db
        .from("noticias")
        .select("*")
        .order("id",{ascending:false});

    if(error) throw error;

    window.__noticias =
      Array.isArray(noticias) ? noticias : [];

    /* DESTAQUE */

    renderizarDestaque(
      window.__noticias[0]
    );

    /* ÚLTIMAS */

    renderizar(
      "ultimas",
      window.__noticias
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
        window.__noticias.filter(n =>
          normalizar(n.categoria) === cat
        );

      renderizar(cat,lista);

    });

    atualizarNotificacoes();

  }catch(error){

    console.error(
      "Erro ao carregar notícias:",
      error
    );

    mostrarErro(
      error.message ||
      "Não foi possível carregar as notícias."
    );
  }
}


/* DESTAQUE */

function renderizarDestaque(n){

  const el =
    document.getElementById("destaque");

  if(!el) return;

  if(!n){

    el.innerHTML =
      `<div class="empty">
        Ainda não existem notícias.
      </div>`;

    return;
  }

  const img = imagem(n);

  el.innerHTML = `
    <article class="featured"
      onclick="abrirNoticiaPorId(${Number(n.id)})">

      ${
        img
        ? `<img src="${esc(img)}"
            alt="${esc(titulo(n))}"
            onerror="this.style.display='none'">`
        : `<div style="
            height:220px;
            display:grid;
            place-items:center;
            background:var(--bg);
            font-size:55px">🌍</div>`
      }

      <div class="featured-body">

        <div class="cat">
          ${esc(categoria(n))}
        </div>

        <h1>
          ${esc(titulo(n))}
        </h1>

        <p>
          ${esc(texto(n).slice(0,180))}
          ${texto(n).length > 180 ? "..." : ""}
        </p>

        <div style="
          margin-top:12px;
          color:var(--p);
          font-size:11px;
          font-weight:900">
          LER NOTÍCIA →
        </div>

      </div>
    </article>
  `;
}


/* ERROS */

function mostrarErro(mensagem){

  const ids = [
    "destaque","ultimas","futebol","mocambique",
    "africa","negocios","entretenimento","desporto"
  ];

  ids.forEach(id => {

    const el =
      document.getElementById(id);

    if(!el) return;

    el.innerHTML =
      `<div class="empty">
        ⚠️ ${esc(mensagem)}
      </div>`;
  });
}


/* NOTIFICAÇÕES */

function atualizarNotificacoes(){

  const btn =
    document.getElementById("notificationBtn");

  if(!btn) return;

  const total =
    window.__noticias.length;

  if(total)
    btn.title =
      `${total} notícias disponíveis`;
}
/* ==================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 3/4
================================================== */


/* FAVORITOS */

function obterFavoritos(){

  try{
    const f = JSON.parse(
      localStorage.getItem("africanmundo_favoritos") || "[]"
    );

    return Array.isArray(f) ? f : [];

  }catch(e){
    return [];
  }
}


function guardarFavorito(n){

  if(!n?.id) return;

  const favoritos = obterFavoritos();

  if(favoritos.some(x =>
    String(x.id) === String(n.id)
  )){
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


function removerFavorito(i){

  const favoritos = obterFavoritos();

  favoritos.splice(Number(i),1);

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  abrirFavoritos();
}


function abrirFavoritos(){

  const favoritos = obterFavoritos();

  if(!favoritos.length){
    abrirModal(
      "❤️ Meus favoritos",
      "<p>Nenhuma notícia guardada.</p>"
    );
    return;
  }

  const html = favoritos.map((n,i) => `
    <div style="
      padding:10px;
      margin-bottom:8px;
      border:1px solid var(--border);
      border-radius:10px;
      background:var(--bg)">

      <strong>${esc(titulo(n))}</strong>

      <div style="
        margin-top:8px;
        display:flex;
        gap:8px">

        <button
          onclick="abrirNoticiaPorId(${Number(n.id)})"
          style="
            flex:1;
            padding:8px;
            border:0;
            border-radius:8px;
            background:var(--p);
            color:white">
          LER
        </button>

        <button
          onclick="removerFavorito(${i})"
          style="
            padding:8px;
            border:0;
            border-radius:8px;
            background:#e53935;
            color:white">
          🗑️
        </button>

      </div>
    </div>
  `).join("");

  abrirModal("❤️ Meus favoritos",html);
}


/* PESQUISA */

function pesquisarNoticias(){

  const input =
    document.getElementById("searchInput");

  const area =
    document.getElementById("searchResults");

  if(!input || !area) return;

  const termo =
    normalizar(input.value);

  if(!termo){
    area.innerHTML = "";
    return;
  }

  const resultados =
    window.__noticias.filter(n => {

      const textoBusca =
        normalizar(
          titulo(n) + " " +
          texto(n) + " " +
          categoria(n)
        );

      return textoBusca.includes(termo);
    });

  area.innerHTML = `
    <div style="
      margin:8px 0;
      font-weight:900">
      🔎 RESULTADOS: ${resultados.length}
    </div>

    <div class="grid">
      ${
        resultados.length
        ? ""
        : `<div class="empty">Nenhuma notícia encontrada.</div>`
      }
    </div>
  `;

  const grid =
    area.querySelector(".grid");

  if(grid){
    resultados.slice(0,8).forEach(n =>
      grid.appendChild(criarCard(n))
    );
  }
}


/* MODAL */

function abrirModal(tituloModal,conteudo){

  const modal =
    document.getElementById("modal");

  const title =
    document.getElementById("modalTitle");

  const body =
    document.getElementById("modalBody");

  if(!modal || !title || !body) return;

  title.textContent = tituloModal;
  body.innerHTML = conteudo;

  modal.style.display = "flex";
}


function fecharModal(){

  const modal =
    document.getElementById("modal");

  if(modal)
    modal.style.display = "none";
                   }
/* ==================================================
   🌍 AFRICANMUNDO — APP.JS
   PARTE 4/4
================================================== */


/* FERRAMENTAS */

function abrirFerramentas(){

  abrirModal(
    "🛠️ Ferramentas",
    `
      <button class="modal-option"
        onclick="abrirFavoritos()">
        ❤️ <strong>Meus favoritos</strong>
        <small>Notícias que guardaste.</small>
      </button>

      <button class="modal-option"
        onclick="compartilharSite()">
        📤 <strong>Partilhar AfricanMundo</strong>
        <small>Enviar o site para outras pessoas.</small>
      </button>

      <button class="modal-option"
        onclick="salvarSite()">
        ⭐ <strong>Guardar AfricanMundo</strong>
        <small>Adicionar o site aos favoritos.</small>
      </button>
    `
  );
}


/* MINHA ÁREA */

function abrirUsuario(){

  abrirModal(
    "👤 Minha área",
    `
      <div style="text-align:center;padding:12px">

        <div style="font-size:45px">👤</div>

        <h3>Bem-vindo ao AfricanMundo</h3>

        <p style="color:var(--muted)">
          Aqui podes encontrar os teus favoritos
          e utilizar as ferramentas do site.
        </p>

        <button
          onclick="abrirFavoritos()"
          style="
            width:100%;
            padding:11px;
            border:0;
            border-radius:10px;
            background:var(--p);
            color:white;
            font-weight:900">
          ❤️ MEUS FAVORITOS
        </button>

      </div>
    `
  );
}


/* MODO ESCURO */

function alternarTema(){

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "africanmundo_tema",
    document.body.classList.contains("dark")
      ? "dark"
      : "light"
  );
}


/* CORES */

function escolherCor(){

  abrirModal(
    "🎨 Escolher cor",
    `
      <div style="display:grid;gap:8px">

        <button class="modal-option"
          onclick="mudarCor('')">
          🟢 Verde
        </button>

        <button class="modal-option"
          onclick="mudarCor('blue')">
          🔵 Azul
        </button>

        <button class="modal-option"
          onclick="mudarCor('red')">
          🔴 Vermelho
        </button>

        <button class="modal-option"
          onclick="mudarCor('purple')">
          🟣 Roxo
        </button>

        <button class="modal-option"
          onclick="mudarCor('orange')">
          🟠 Laranja
        </button>

      </div>
    `
  );
}


function mudarCor(cor){

  document.body.classList.remove(
    "blue","red","purple","orange"
  );

  if(cor)
    document.body.classList.add(cor);

  localStorage.setItem(
    "africanmundo_cor",
    cor
  );

  fecharModal();
}


/* PARTILHAR */

async function compartilharSite(){

  const dados = {
    title:"AfricanMundo",
    text:"A informação que liga África ao mundo.",
    url:location.href
  };

  if(navigator.share){

    try{
      await navigator.share(dados);
      return;
    }catch(e){}
  }

  try{

    await navigator.clipboard.writeText(location.href);

    abrirModal(
      "🔗 Link copiado",
      "<p>O link do AfricanMundo foi copiado.</p>"
    );

  }catch(e){

    alert(location.href);

  }
}


/* GUARDAR SITE */

function salvarSite(){

  abrirModal(
    "⭐ Guardar AfricanMundo",
    `
      <div style="text-align:center;padding:10px">
        <div style="font-size:45px">⭐</div>
        <p>
          Usa o menu do navegador para
          adicionar o AfricanMundo aos favoritos.
        </p>
      </div>
    `
  );
}


/* EVENTOS */

document.addEventListener("DOMContentLoaded",()=>{

  /* Preferências */

  if(localStorage.getItem("africanmundo_tema")==="dark")
    document.body.classList.add("dark");

  const cor =
    localStorage.getItem("africanmundo_cor");

  if(cor)
    document.body.classList.add(cor);


  /* Botões */

  document.getElementById("notificationBtn")
    ?.addEventListener("click",abrirNotificacoes);

  document.getElementById("toolsBtn")
    ?.addEventListener("click",abrirFerramentas);

  document.getElementById("userBtn")
    ?.addEventListener("click",abrirUsuario);

  document.getElementById("themeBtn")
    ?.addEventListener("click",alternarTema);

  document.getElementById("colorBtn")
    ?.addEventListener("click",escolherCor);


  /* Pesquisa */

  document.getElementById("searchForm")
    ?.addEventListener("submit",e=>{
      e.preventDefault();
      pesquisarNoticias();
    });


  /* Fechar modal ao clicar fora */

  document.getElementById("modal")
    ?.addEventListener("click",e=>{
      if(e.target.id==="modal")
        fecharModal();
    });


  /* Notícias */

  iniciarSupabase();
  carregarNoticias();

});
