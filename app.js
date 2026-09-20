/* 🌍 AFRICANMUNDO — APP.JS | PARTE 1/4 */

const SUPABASE_URL="https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY="sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let db=null;
let noticias=[];

const norm=v=>String(v||"")
.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
.toLowerCase().trim();

const esc=v=>String(v||"")
.replace(/&/g,"&")
.replace(/</g,"<")
.replace(/>/g,">")
.replace(/"/g,""");

function iniciarSupabase(){

if(typeof supabase==="undefined"){
console.error("Supabase não carregado.");
return false;
}

db=supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

return true;
}

function titulo(n){
return n?.titulo||"Sem título";
}

function texto(n){
return n?.texto||"";
}

function imagem(n){

return n?.imagem||
"https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";
}

function data(n){

if(!n?.data)return "";

return new Date(n.data).toLocaleDateString(
"pt-MZ"
);
}

function abrirNoticia(id){

location.href=
"noticia.html?id="+
encodeURIComponent(id);

}

function card(n){

const el=document.createElement("article");

el.className="news-card";

el.style.cssText=
"display:flex;width:100%;height:135px;"+
"overflow:hidden;border-radius:14px;"+
"margin-bottom:12px;background:var(--card,#fff);"+
"box-shadow:0 2px 10px rgba(0,0,0,.08);"+
"cursor:pointer";

el.innerHTML=`

<img
  src="${esc(imagem(n))}"
  alt="${esc(titulo(n))}"
  style="
    width:180px;
    min-width:180px;
    height:135px;
    object-fit:cover;
  "
>

<div style="
  padding:10px 12px;
  overflow:hidden;
">

  <small style="
    color:var(--p,#168a45);
    font-weight:bold;
  ">
    🌍 ${esc(n.pais||n.categoria||"Notícias")}
  </small>

  <h3 style="
    margin:5px 0;
    font-size:15px;
    line-height:1.25;
  ">
    ${esc(titulo(n))}
  </h3>

  <p style="
    margin:0;
    font-size:12px;
    opacity:.75;
  ">
    ${esc(texto(n))}
  </p>

  <small>${data(n)}</small>

</div>

`;

el.onclick=()=>abrirNoticia(n.id);

return el;
}

function lista(arr,id){

const area=document.getElementById(id);

if(!area)return;

area.innerHTML="";

if(!arr.length){

area.innerHTML=
'<div class="loading">Ainda não existem notícias nesta categoria.</div>';

return;

}

arr.forEach(n=>{
area.appendChild(card(n));
});
}

function filtrar(tipo){

const s=n=>{
const x=norm(
"${n.categoria} ${n.subcategoria} ${n.pais} ${titulo(n)} ${texto(n)}"
);

if(tipo==="mocambique")
  return n.categoria==="Moçambique"||
  norm(n.pais)==="moçambique"||
  /mocambique|mozambique|maputo|matola|inhambane|sofala|beira|manica|tete|zambezia|nampula|pemba|niassa/.test(x);

if(tipo==="africa")
  return n.categoria==="África"||
  /angola|malawi|zimbabwe|zambia|tanzania|nigeria|kenya|quenia|ghana|marrocos|egito|etiopia|africa do sul/.test(x);

if(tipo==="futebol")
  return /futebol|golo|gol|jogador|clube|campeonato|liga|uefa|champions/.test(x);

if(tipo==="desporto")
  return /desporto|atletismo|basquete|boxe|olimpi/.test(x);

if(tipo==="negocios")
  return /negocio|economia|empresa|mercado|investimento|comercio/.test(x);

if(tipo==="entretenimento")
  return /entretenimento|cultura|musica|cinema|artista|festival|teatro/.test(x);

return true;

};

return noticias.filter(s);
}

async function carregarNoticias(){

if(!db)iniciarSupabase();

try{

const r=await db
.from("noticias")
.select(`
  id,titulo,texto,imagem,
  categoria,subcategoria,pais,
  visualizacoes,data,fonte,url_original
`)
.order("data",{ascending:false})
.limit(100);

if(r.error)throw r.error;

noticias=r.data||[];

window.__noticias=noticias;

document.getElementById("destaque").innerHTML="";

lista(noticias.slice(0,10),"ultimas");
lista(filtrar("futebol").slice(0,6),"futebol");
lista(filtrar("mocambique").slice(0,6),"mocambique");
lista(filtrar("africa").slice(0,6),"africa");
lista(filtrar("negocios").slice(0,6),"negocios");
lista(filtrar("entretenimento").slice(0,6),"entretenimento");
lista(filtrar("desporto").slice(0,6),"desporto");

destacar();

console.log(
  "✅ Notícias carregadas:",
  noticias.length
);

}catch(e){

console.error(
  "❌ Erro notícias:",
  e
);

[
  "ultimas",
  "futebol",
  "mocambique",
  "africa",
  "negocios",
  "entretenimento",
  "desporto"
].forEach(id=>{

  const el=document.getElementById(id);

  if(el)
    el.innerHTML=
    '<div class="loading">⚠️ Erro ao carregar notícias.</div>';

});

}
  }

/* =========================================================
⭐ DESTAQUE
========================================================= */

function destacar(){

  const area=document.getElementById("destaque");

  if(!area)return;

  const n=noticias[0];

  if(!n){
    area.innerHTML=
    '<div class="loading">Ainda não existem notícias em destaque.</div>';
    return;
  }

  area.innerHTML=`

    <article
      class="featured-card"
      onclick="abrirNoticia(${Number(n.id)})"
      style="
        cursor:pointer;
        overflow:hidden;
        border-radius:16px;
        background:var(--card,#fff);
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

      <div style="padding:14px">

        <small style="
          color:var(--p,#168a45);
          font-weight:bold;
        ">
          🌍 ${esc(n.pais||n.categoria||"Notícias")}
        </small>

        <h2 style="
          margin:7px 0;
          font-size:20px;
          line-height:1.25;
        ">
          ${esc(titulo(n))}
        </h2>

        <p style="
          margin:0;
          opacity:.75;
        ">
          ${esc(texto(n)).slice(0,180)}
        </p>

        <small>${data(n)}</small>

      </div>

    </article>
  `;
}


/* =========================================================
🔎 PESQUISA
========================================================= */

function pesquisar(){

  const input=document.getElementById("searchInput");
  const area=document.getElementById("searchResults");

  if(!input||!area)return;

  const termo=norm(input.value);

  area.innerHTML="";

  if(!termo){
    area.style.display="none";
    return;
  }

  const resultados=noticias.filter(n=>{

    const textoBusca=norm(
      `${titulo(n)} ${texto(n)} ${n.categoria} ${n.subcategoria} ${n.pais}`
    );

    return textoBusca.includes(termo);
  }).slice(0,20);

  area.style.display="block";

  if(!resultados.length){

    area.innerHTML=
    '<div class="loading">Nenhuma notícia encontrada.</div>';

    return;
  }

  resultados.forEach(n=>{
    area.appendChild(card(n));
  });
}


/* =========================================================
🔔 MODAL
========================================================= */

function abrirModal(tituloModal,conteudo){

  const modal=document.getElementById("modal");
  const mt=document.getElementById("modalTitle");
  const mb=document.getElementById("modalBody");

  if(!modal)return;

  if(mt)mt.textContent=tituloModal||"AfricanMundo";
  if(mb)mb.innerHTML=conteudo||"";

  modal.style.display="flex";
}

function fecharModal(){

  const modal=document.getElementById("modal");

  if(modal)
    modal.style.display="none";
}


/* =========================================================
🌙 TEMA
========================================================= */

function iniciarTema(){

  const salvo=localStorage.getItem("africanmundo_tema");

  if(salvo==="dark")
    document.body.classList.add("dark");
}

function alternarTema(){

  document.body.classList.toggle("dark");

  localStorage.setItem(
    "africanmundo_tema",
    document.body.classList.contains("dark")
      ?"dark"
      :"light"
  );
}


/* =========================================================
🎨 COR
========================================================= */

function restaurarCor(){

  const cor=localStorage.getItem(
    "africanmundo_cor"
  );

  if(cor)
    document.documentElement.style.setProperty(
      "--p",
      cor
    );
}

function escolherCor(){

  const cores=[
    "#168a45",
    "#1565c0",
    "#c62828",
    "#7b1fa2",
    "#ef6c00"
  ];

  const atual=
    getComputedStyle(document.documentElement)
    .getPropertyValue("--p")
    .trim();

  const i=cores.indexOf(atual);

  const proxima=
    cores[(i+1)%cores.length];

  document.documentElement.style.setProperty(
    "--p",
    proxima
  );

  localStorage.setItem(
    "africanmundo_cor",
    proxima
  );
}


/* =========================================================
🌐 REDES SOCIAIS
========================================================= */

const REDES_SOCIAIS={

  google:"https://www.google.com",
  facebook:"https://www.facebook.com",
  youtube:"https://www.youtube.com",
  whatsapp:"https://wa.me/",
  instagram:"https://www.instagram.com",
  tiktok:"https://www.tiktok.com"

};

function abrirRede(rede){

  const nome=norm(rede);

  const url=REDES_SOCIAIS[nome];

  if(!url)return false;

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  return true;
}


/* =========================================================
📤 PARTILHAR
========================================================= */

async function partilharNoticia(id){

  const url=
    location.origin+
    "/Africanmundo-/noticia.html?id="+
    encodeURIComponent(id);

  const n=
    noticias.find(x=>String(x.id)===String(id));

  const dados={
    title:n?.titulo||"AfricanMundo",
    text:n?.titulo||"Notícia AfricanMundo",
    url
  };

  try{

    if(navigator.share)
      await navigator.share(dados);

    else{

      await navigator.clipboard.writeText(url);

      abrirModal(
        "Link copiado",
        "O link da notícia foi copiado."
      );
    }

  }catch(e){
    console.log("Partilha cancelada.");
  }
}


/* =========================================================
⭐ INICIALIZAÇÃO DOS BOTÕES
========================================================= */

function iniciarBotoes(){

  const theme=
    document.getElementById("themeBtn");

  const color=
    document.getElementById("colorBtn");

  if(theme)
    theme.onclick=alternarTema;

  if(color)
    color.onclick=escolherCor;

  const form=
    document.getElementById("searchForm");

  if(form)
    form.addEventListener(
      "submit",
      function(e){
        e.preventDefault();
        pesquisar();
      }
    );

  const input=
    document.getElementById("searchInput");

  if(input)
    input.addEventListener(
      "input",
      pesquisar
    );
}


/* =========================================================
🌍 FUNÇÕES GLOBAIS
========================================================= */

window.abrirNoticia=abrirNoticia;
window.abrirRede=abrirRede;
window.fecharModal=fecharModal;
window.abrirModal=abrirModal;
window.partilharNoticia=partilharNoticia;
window.alternarTema=alternarTema;
window.escolherCor=escolherCor;

/* =========================================================
🧭 MENU
========================================================= */

function marcarMenuAtivo(){

  const pagina=norm(
    location.pathname
  );

  document
    .querySelectorAll("nav a,.menu a,.bottom-menu a")
    .forEach(link=>{

      link.classList.remove("ativo");

      const href=norm(
        link.getAttribute("href")
      );

      if(
        href &&
        pagina.endsWith(
          href.split("?")[0]
        )
      ){
        link.classList.add("ativo");
      }

    });
}


/* =========================================================
🔔 NOTIFICAÇÕES
========================================================= */

function mostrarNotificacoes(){

  abrirModal(
    "Notificações",
    `
      <p>🔔 As notificações do AfricanMundo estão activas.</p>
      <p>Receba novidades e notícias recentes do site.</p>
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
      <p><strong>Bem-vindo ao AfricanMundo.</strong></p>
      <p>Notícias de Moçambique, África e do mundo.</p>
    `
  );
}


/* =========================================================
📢 ANÚNCIOS
========================================================= */

async function carregarAnuncios(){

  const sec=document.getElementById(
    "anunciosAtivosSection"
  );

  const area=document.getElementById(
    "anunciosAtivos"
  );

  if(!sec||!area||!db)return;

  try{

    const r=await db
      .from("anuncios")
      .select("*")
      .order("id",{ascending:false})
      .limit(10);

    if(r.error)throw r.error;

    const dados=r.data||[];

    if(!dados.length){
      sec.style.display="none";
      return;
    }

    sec.style.display="block";
    area.innerHTML="";

    dados.forEach(a=>{

      const el=document.createElement("div");

      el.className="card";

      el.innerHTML=`
        <h3>${esc(a.titulo||"Anúncio")}</h3>
        <p>${esc(a.texto||"")}</p>
      `;

      area.appendChild(el);

    });

  }catch(e){

    console.log(
      "Anúncios indisponíveis:",
      e
    );

    sec.style.display="none";
  }
}


/* =========================================================
❤️ FAVORITOS
========================================================= */

function alternarFavorito(id){

  let favoritos=
    JSON.parse(
      localStorage.getItem(
        "africanmundo_favoritos"
      )||"[]"
    );

  id=String(id);

  if(favoritos.includes(id)){

    favoritos=
      favoritos.filter(x=>x!==id);

  }else{

    favoritos.push(id);

  }

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(favoritos)
  );

  return favoritos.includes(id);
}


/* =========================================================
📱 MENU MOBILE
========================================================= */

function abrirMenu(){

  const menu=
    document.querySelector(
      ".bottom-menu,.mobile-menu"
    );

  if(menu)
    menu.classList.toggle("ativo");
}


/* =========================================================
🖱️ BOTÕES DO CABEÇALHO
========================================================= */

function ligarBotoesCabecalho(){

  const notificacao=
    document.getElementById(
      "notificationBtn"
    );

  const ferramentas=
    document.getElementById(
      "toolsBtn"
    );

  const utilizador=
    document.getElementById(
      "userBtn"
    );

  if(notificacao)
    notificacao.onclick=
      mostrarNotificacoes;

  if(ferramentas)
    ferramentas.onclick=
      mostrarFerramentas;

  if(utilizador)
    utilizador.onclick=
      mostrarUtilizador;
}


/* =========================================================
🚀 INICIAR AFRICANMUNDO
========================================================= */

async function iniciarAfricanMundo(){

  iniciarSupabase();

  restaurarCor();

  iniciarTema();

  iniciarBotoes();

  ligarBotoesCabecalho();

  marcarMenuAtivo();

  await carregarNoticias();

  carregarAnuncios();

  console.log(
    "🌍 AfricanMundo iniciado."
  );
}


/* =========================================================
▶️ DOM READY
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  iniciarAfricanMundo
);


/* =========================================================
🌐 EXPORTAR FUNÇÕES
========================================================= */

window.pesquisar=pesquisar;
window.alternarFavorito=alternarFavorito;
window.mostrarNotificacoes=mostrarNotificacoes;
window.mostrarFerramentas=mostrarFerramentas;
window.mostrarUtilizador=mostrarUtilizador;
window.abrirMenu=abrirMenu;
window.marcarMenuAtivo=marcarMenuAtivo;

/* =========================================================
🧹 SEGURANÇA — FECHAR MODAL
========================================================= */

document.addEventListener(
  "click",
  function(e){

    const modal=
      document.getElementById("modal");

    if(
      modal &&
      e.target===modal
    ){
      fecharModal();
    }

  }
);


/* =========================================================
⌨️ ESC — FECHAR MODAL
========================================================= */

document.addEventListener(
  "keydown",
  function(e){

    if(e.key==="Escape"){
      fecharModal();
    }

  }
);


/* =========================================================
🖼️ ERRO DE IMAGEM
========================================================= */

document.addEventListener(
  "error",
  function(e){

    if(
      e.target &&
      e.target.tagName==="IMG"
    ){

      e.target.src=
      "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";

    }

  },
  true
);


/* =========================================================
📡 VERIFICAÇÃO SUPABASE
========================================================= */

async function testarSupabase(){

  if(!db)return false;

  try{

    const r=await db
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
🔄 RECARREGAR NOTÍCIAS
========================================================= */

async function atualizarNoticias(){

  const botoes=
    document.querySelectorAll(
      "[data-atualizar]"
    );

  botoes.forEach(b=>{
    b.disabled=true;
  });

  await carregarNoticias();

  botoes.forEach(b=>{
    b.disabled=false;
  });
}


/* =========================================================
🌐 EXPORTAÇÕES FINAIS
========================================================= */

window.carregarNoticias=
  carregarNoticias;

window.atualizarNoticias=
  atualizarNoticias;

window.testarSupabase=
  testarSupabase;

window.carregarAnuncios=
  carregarAnuncios;

window.destacar=
  destacar;


/* =========================================================
✅ APP.JS PRONTO
========================================================= */

console.log(
  "✅ AfricanMundo app.js carregado correctamente."
);
