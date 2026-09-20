/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 1/3 — BASE + NOTÍCIAS + IMAGENS + FILTROS
========================================================= */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const VAPID_PUBLIC_KEY =
"BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db = null;
let atualizacaoEmAndamento = false;
let destaqueNoticias = [];
let destaqueIndice = 0;
let destaqueTimer = null;

window.__noticias = [];

/* =========================================================
🔗 SUPABASE
========================================================= */

function iniciarSupabase(){

if(typeof supabase === "undefined"){
console.error("Supabase CDN não carregado.");
return false;
}

try{
db = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

return true;

}catch(e){

console.error("Erro Supabase:",e);
return false;

}
}

/* =========================================================
🧹 TEXTO
========================================================= */

function esc(valor){

return String(valor ?? "")
.replace(/&/g,"&")
.replace(/</g,"<")
.replace(/>/g,">")
.replace(/"/g,""")
.replace(/'/g,"'");
}

function normalizarTexto(valor){

return String(valor ?? "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase()
.trim();
}

function obterTitulo(n){

return n?.titulo ||
n?.title ||
"Sem título";
}

function obterTexto(n){

return n?.texto ||
n?.descricao ||
n?.description ||
"";
}

function obterImagem(n){

return n?.imagem ||
n?.image ||
n?.url_imagem ||
"";
}

function formatarData(data){

if(!data)return "";

try{

return new Date(data).toLocaleDateString(
  "pt-MZ",
  {
    day:"2-digit",
    month:"2-digit",
    year:"numeric"
  }
);

}catch{

return "";

}
}

/* =========================================================
🖼️ IMAGENS FALLBACK
========================================================= */

function imagemFallback(n){

const s = normalizarTexto(
"${obterTitulo(n)} ${obterTexto(n)} ${n?.categoria||""} ${n?.subcategoria||""}"
);

if(/futebol|golo|jogador|clube|campeonato/.test(s))
return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80";

if(/desporto|atletismo|basquete|boxe|olimpi/.test(s))
return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80";

if(/economia|negocio|empresa|mercado|investimento/.test(s))
return "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80";

if(/saude|hospital|medico|doenca|paciente/.test(s))
return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80";

if(/educacao|escola|universidade|estudante|professor/.test(s))
return "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80";

if(/cultura|musica|cinema|artista|festival|teatro|entretenimento/.test(s))
return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80";

if(/politica|governo|presidente|parlamento|ministro/.test(s))
return "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80";

if(/agricultura|agricultor|cultivo|colheita|milho/.test(s))
return "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80";

if(/ambiente|clima|seca|cheia|inundacao|el nino/.test(s))
return "https://images.unsplash.com/photo-1561470508-fd4df1ed90b2?auto=format&fit=crop&w=900&q=80";

if(/mocambique|mozambique|maputo|matola|inhambane|sofala|manica|tete|zambezia|nampula|pemba|niassa/.test(s))
return "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80";

if(/africa|nigeria|angola|malawi|zimbabwe|kenya|quenia|marrocos|egito|etiopia/.test(s))
return "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=900&q=80";

return "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80";
}

function imagemFinal(n){

return obterImagem(n) || imagemFallback(n);
}

/* =========================================================
📰 ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(id){

if(id === undefined || id === null)return;

location.href =
"noticia.html?id=${encodeURIComponent(id)}";
}

function abrirNoticiaPorId(id){

abrirNoticia(id);
}

/* =========================================================
📰 CARD DE NOTÍCIA
========================================================= */

function criarCard(n){

const card =
document.createElement("article");

card.className = "news-card";

const titulo = esc(obterTitulo(n));
const texto = esc(obterTexto(n));
const imagem = imagemFinal(n);

const pais =
n?.pais
? "🌍 ${esc(n.pais)}"
: "🌍 África";

const categoria =
n?.subcategoria ||
n?.categoria ||
"Notícias";

card.style.cssText = "width:100%; min-height:135px; height:135px; display:flex; overflow:hidden; border-radius:14px; background:var(--card,#fff); margin-bottom:12px; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,.08);";

card.innerHTML = `

<div style="
  width:180px;
  min-width:180px;
  height:135px;
  overflow:hidden;
  background:#e9eceb;
">

  <img
    src="${esc(imagem)}"
    alt="${titulo}"
    loading="lazy"
    style="
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    "
  >

</div>

<div style="
  flex:1;
  min-width:0;
  padding:10px 12px;
  overflow:hidden;
">

  <div style="
    font-size:11px;
    font-weight:700;
    color:var(--p,#168a45);
    margin-bottom:4px;
  ">
    ${pais} · ${esc(categoria)}
  </div>

  <h3 style="
    margin:0 0 5px;
    font-size:15px;
    line-height:1.25;
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
  ">
    ${titulo}
  </h3>

  <p style="
    margin:0 0 5px;
    font-size:12px;
    line-height:1.35;
    opacity:.78;
    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;
  ">
    ${texto}
  </p>

  <small style="
    font-size:10px;
    opacity:.65;
  ">
    ${formatarData(n?.data)}
    ${n?.visualizacoes
      ? ` · 👁️ ${n.visualizacoes}`
      : ""}
  </small>

</div>

`;

card.addEventListener(
"click",
()=>abrirNoticia(n.id)
);

const img = card.querySelector("img");

if(img){

img.addEventListener(
  "error",
  ()=>{
    img.src = imagemFallback(n);
  },
  {once:true}
);

}

return card;
}

/* =========================================================
📋 RENDERIZAR LISTA
========================================================= */

function renderizarLista(lista,container){

if(!container)return;

container.innerHTML = "";

if(!lista?.length){

container.innerHTML = `
  <div class="loading">
    Ainda não existem notícias nesta categoria.
  </div>
`;

return;

}

const fragment =
document.createDocumentFragment();

lista.forEach(n=>{
fragment.appendChild(
criarCard(n)
);
});

container.appendChild(fragment);
}

/* =========================================================
⭐ DESTAQUE
========================================================= */

function renderizarDestaque(){

const area =
document.getElementById("destaque");

if(!area)return;

if(!destaqueNoticias.length){

area.innerHTML = "";
return;

}

const n =
destaqueNoticias[destaqueIndice %
destaqueNoticias.length];

const imagem =
imagemFinal(n);

area.innerHTML = `

<article
  style="
    position:relative;
    width:100%;
    min-height:240px;
    border-radius:16px;
    overflow:hidden;
    cursor:pointer;
    background:#111;
  "
  onclick="abrirNoticia(${Number(n.id)})"
>

  <img
    src="${esc(imagem)}"
    alt="${esc(obterTitulo(n))}"
    style="
      width:100%;
      height:240px;
      object-fit:cover;
      display:block;
    "
  >

  <div style="
    position:absolute;
    inset:0;
    background:linear-gradient(
      transparent 30%,
      rgba(0,0,0,.82)
    );
  "></div>

  <div style="
    position:absolute;
    left:16px;
    right:16px;
    bottom:15px;
    color:#fff;
  ">

    <div style="
      font-size:11px;
      margin-bottom:5px;
      opacity:.9;
    ">
      ${esc(n?.categoria||"Notícias")}
    </div>

    <h2 style="
      margin:0;
      font-size:20px;
      line-height:1.2;
    ">
      ${esc(obterTitulo(n))}
    </h2>

  </div>

</article>

`;

const img =
area.querySelector("img");

if(img){

img.onerror = ()=>{
  img.src = imagemFallback(n);
};

}
}

function iniciarDestaqueRotativo(){

clearInterval(destaqueTimer);

destaqueTimer =
setInterval(
()=>{
if(destaqueNoticias.length < 2)
return;

    destaqueIndice =
      (destaqueIndice+1) %
      destaqueNoticias.length;

    renderizarDestaque();

  },
  8000
);

}

/* =========================================================
🔎 FILTROS
========================================================= */

function ehMocambique(n){

const s = normalizarTexto(
"${n?.categoria||""} ${n?.subcategoria||""} ${n?.pais||""} ${obterTitulo(n)} ${obterTexto(n)}"
);

return (
normalizarTexto(n?.categoria)==="mocambique" ||
normalizarTexto(n?.pais)==="mocambique" ||
/mocambique|mozambique|maputo|matola|inhambane|vilanculos|maxixe|sofala|beira|manica|chimoio|tete|zambezia|quelimane|nampula|pemba|cabo delgado|niassa|lichinga/.test(s)
);
}

function ehAfrica(n){

const s = normalizarTexto(
"${n?.categoria||""} ${n?.pais||""} ${obterTitulo(n)} ${obterTexto(n)}"
);

return (
normalizarTexto(n?.categoria)==="africa" ||
/angola|malawi|zimbabwe|zambia|tanzania|nigeria|quenia|kenya|ghana|namibia|botswana|rwanda|uganda|etiopia|egito|marrocos|tunisia|argelia|sudao|senegal|camaroes|congo|africa do sul|south africa/.test(s)
);
}

function ehFutebol(n){

const s = normalizarTexto(
"${n?.categoria||""} ${n?.subcategoria||""} ${obterTitulo(n)} ${obterTexto(n)}"
);

return /futebol|golo|gol|jogador|clube|campeonato|liga|champions league|premier league|uefa/.test(s);
}

function ehDesporto(n){

const s = normalizarTexto(
"${n?.categoria||""} ${n?.subcategoria||""} ${obterTitulo(n)} ${obterTexto(n)}"
);

return (
normalizarTexto(n?.subcategoria)==="desporto" ||
/desporto|atletismo|basquete|boxe|olimpi/.test(s)
);
}

function ehNegocios(n){

const s = normalizarTexto(
"${n?.categoria||""} ${n?.subcategoria||""} ${obterTitulo(n)} ${obterTexto(n)}"
);

return /negocio|economia|empresa|mercado|investimento|comercio|financeiro/.test(s);
}

function ehEntretenimento(n){

const s = normalizarTexto(
"${n?.categoria||""} ${n?.subcategoria||""} ${obterTitulo(n)} ${obterTexto(n)}"
);

return /entretenimento|cultura|musica|cinema|artista|festival|teatro/.test(s);
}

/* =========================================================
📰 CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

if(atualizacaoEmAndamento)return;

atualizacaoEmAndamento = true;

try{

if(!db){

  if(!iniciarSupabase())
    throw new Error("Supabase indisponível.");

}

const {data,error} =
  await db
    .from("noticias")
    .select(`
      id,
      titulo,
      texto,
      imagem,
      categoria,
      subcategoria,
      pais,
      visualizacoes,
      data,
      fonte,
      url_original
    `)
    .order(
      "data",
      {ascending:false}
    )
    .limit(100);

if(error)
  throw error;

window.__noticias =
  Array.isArray(data)
    ? data
    : [];

renderizarPagina(
  window.__noticias
);

return window.__noticias;

}catch(e){

console.error(
  "Erro ao carregar notícias:",
  e
);

mostrarErroNoticias();

return [];

}finally{

atualizacaoEmAndamento = false;

}
}

/* =========================================================
⚠️ ERRO DE NOTÍCIAS
========================================================= */

function mostrarErroNoticias(){

const ids = [
"ultimas",
"futebol",
"mocambique",
"africa",
"negocios",
"entretenimento",
"desporto"
];

ids.forEach(id=>{

const el =
  document.getElementById(id);

if(el){

  el.innerHTML = `
    <div class="loading">
      ⚠️ Não foi possível carregar as notícias.
    </div>
  `;

}

});
}

/* =========================================================
🏠 RENDERIZAR PÁGINA
========================================================= */

function renderizarPagina(lista){

const noticias =
Array.isArray(lista)
? lista
: [];

const ultimas =
document.getElementById("ultimas");

const futebol =
document.getElementById("futebol");

const mocambique =
document.getElementById("mocambique");

const africa =
document.getElementById("africa");

const negocios =
document.getElementById("negocios");

const entretenimento =
document.getElementById("entretenimento");

const desporto =
document.getElementById("desporto");

/* DESTAQUE */

destaqueNoticias =
noticias.slice(0,5);

destaqueIndice = 0;

renderizarDestaque();

iniciarDestaqueRotativo();

/* ÚLTIMAS */

renderizarLista(
noticias.slice(0,10),
ultimas
);

/* FUTEBOL */

renderizarLista(
noticias.filter(ehFutebol).slice(0,6),
futebol
);

/* MOÇAMBIQUE */

renderizarLista(
noticias.filter(ehMocambique).slice(0,6),
mocambique
);

/* ÁFRICA */

renderizarLista(
noticias.filter(ehAfrica).slice(0,6),
africa
);

/* NEGÓCIOS */

renderizarLista(
noticias.filter(ehNegocios).slice(0,6),
negocios
);

/* ENTRETENIMENTO */

renderizarLista(
noticias.filter(ehEntretenimento).slice(0,6),
entretenimento
);

/* DESPORTO */

renderizarLista(
noticias.filter(ehDesporto).slice(0,6),
desporto
);
 }

/* =========================================================
🔎 PESQUISA
========================================================= */

function pesquisar(){

const input =
document.getElementById("searchInput") ||
document.getElementById("pesquisa");

const area =
document.getElementById("searchResults");

if(!input)return;

const termo =
normalizarTexto(input.value);

if(!termo){

if(area)
  area.innerHTML = "";

renderizarPagina(
  window.__noticias || []
);

return;

}

const resultados =
(window.__noticias || []).filter(n=>{

  const texto =
    normalizarTexto(`
      ${obterTitulo(n)}
      ${obterTexto(n)}
      ${n?.categoria||""}
      ${n?.subcategoria||""}
      ${n?.pais||""}
      ${n?.fonte||""}
    `);

  return texto.includes(termo);
});

if(area){

area.innerHTML = `
  <div style="
    margin:12px 0;
    font-weight:700;
  ">
    🔎 ${resultados.length}
    resultado(s) encontrado(s)
  </div>
`;

resultados
  .slice(0,20)
  .forEach(n=>{
    area.appendChild(
      criarCard(n)
    );
  });

}

renderizarPagina(resultados);
}

function limparPesquisa(){

const input =
document.getElementById("searchInput") ||
document.getElementById("pesquisa");

const area =
document.getElementById("searchResults");

if(input)
input.value = "";

if(area)
area.innerHTML = "";

renderizarPagina(
window.__noticias || []
);
}

/* =========================================================
❤️ FAVORITOS
========================================================= */

function obterFavoritos(){

try{

return JSON.parse(
  localStorage.getItem(
    "africanmundo_favoritos"
  )
) || [];

}catch{

return [];

}
}

function guardarFavoritos(lista){

localStorage.setItem(
"africanmundo_favoritos",
JSON.stringify(lista)
);
}

function adicionarFavorito(id){

const lista =
obterFavoritos();

if(!lista.includes(id)){

lista.push(id);

guardarFavoritos(lista);

alert(
  "❤️ Notícia adicionada aos favoritos."
);

}
}

function removerFavorito(id){

const lista =
obterFavoritos()
.filter(x=>x!==id);

guardarFavoritos(lista);

alert(
"🗑️ Notícia removida dos favoritos."
);
}

function mostrarFavoritos(){

const favoritos =
obterFavoritos();

const noticias =
(window.__noticias || [])
.filter(n=>favoritos.includes(n.id));

renderizarPagina(noticias);
}

/* =========================================================
🪟 MODAL
========================================================= */

function fecharModal(){

const modal =
document.getElementById("modal");

if(modal)
modal.classList.remove("ativo");

document
.querySelectorAll(".modal.ativo")
.forEach(m=>{
m.classList.remove("ativo");
});
}

function abrirModal(id){

const modal =
document.getElementById(id);

if(!modal)return;

modal.classList.add("ativo");
}

/* =========================================================
🔔 NOTIFICAÇÕES
========================================================= */

function abrirNotificacoes(){

const modal =
document.getElementById("notificationModal") ||
document.getElementById("notificacoesModal");

if(modal){

modal.classList.add("ativo");
return;

}

alert(
"🔔 As notificações do AfricanMundo estão disponíveis."
);
}

async function ativarNotificacoes(){

if(!("Notification" in window)){

alert(
  "Este navegador não suporta notificações."
);

return false;

}

try{

const permissao =
  await Notification.requestPermission();

if(permissao === "granted"){

  localStorage.setItem(
    "africanmundo_notificacoes",
    "1"
  );

  alert(
    "🔔 Notificações ativadas com sucesso."
  );

  return true;
}

}catch(e){

console.error(
  "Notificações:",
  e
);

}

return false;
}

/* =========================================================
📲 PUSH
========================================================= */

async function tentarPush(){

if(
!("serviceWorker" in navigator) ||
!("PushManager" in window)
)
return false;

try{

const registration =
  await navigator.serviceWorker.ready;

const permissao =
  await Notification.requestPermission();

if(permissao !== "granted")
  return false;

const existente =
  await registration
    .pushManager
    .getSubscription();

if(existente)
  return true;

if(!VAPID_PUBLIC_KEY)
  return false;

const subscription =
  await registration
    .pushManager
    .subscribe({
      userVisibleOnly:true,
      applicationServerKey:
        urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY
        )
    });

localStorage.setItem(
  "africanmundo_push",
  JSON.stringify(subscription)
);

return true;

}catch(e){

console.warn(
  "Push indisponível:",
  e
);

return false;

}
}

function urlBase64ToUint8Array(base64){

const padding =
"=".repeat(
(4-base64.length%4)%4
);

const base64url =
(
base64 + padding
)
.replace(/-/g,"+")
.replace(/_/g,"/");

const rawData =
atob(base64url);

return Uint8Array.from(
[...rawData].map(
char=>char.charCodeAt(0)
)
);
}

/* =========================================================
🌙 TEMA
========================================================= */

function ativarTemaClaro(){

document.body.classList.remove("dark");

document.documentElement
.classList.remove("dark");

localStorage.setItem(
"africanmundo_tema",
"claro"
);
}

function ativarTemaEscuro(){

document.body.classList.add("dark");

document.documentElement
.classList.add("dark");

localStorage.setItem(
"africanmundo_tema",
"escuro"
);
}

function alternarTema(){

const escuro =
document.body.classList.contains("dark");

if(escuro)
ativarTemaClaro();
else
ativarTemaEscuro();
}

function restaurarTema(){

const tema =
localStorage.getItem(
"africanmundo_tema"
);

if(tema === "escuro"){

ativarTemaEscuro();
return;

}

if(tema === "claro"){

ativarTemaClaro();
return;

}

if(
window.matchMedia &&
window.matchMedia(
"(prefers-color-scheme:dark)"
).matches
){

ativarTemaEscuro();

}else{

ativarTemaClaro();

}
}

/* =========================================================
🎨 CORES
========================================================= */

function abrirCores(){

const modal =
document.getElementById("colorModal") ||
document.getElementById("coresModal");

if(modal)
modal.classList.add("ativo");
}

function definirCor(cor){

if(!cor)return;

document.documentElement
.style.setProperty(
"--p",
cor
);

document.documentElement
.style.setProperty(
"--primary",
cor
);

localStorage.setItem(
"africanmundo_cor",
cor
);
}

function restaurarCor(){

const cor =
localStorage.getItem(
"africanmundo_cor"
);

if(cor)
definirCor(cor);
}

/* =========================================================
🖱️ FECHAR MODAIS
========================================================= */

document.addEventListener(
"click",
e=>{

if(
  e.target.classList &&
  e.target.classList.contains("modal")
){

  e.target.classList.remove(
    "ativo"
  );
}

}
);

/* =========================================================
🌐 REDES SOCIAIS
========================================================= */

const REDES_SOCIAIS = {

facebook:"https://www.facebook.com/",
instagram:"https://www.instagram.com/",
youtube:"https://www.youtube.com/",
whatsapp:"https://wa.me/",
tiktok:"https://www.tiktok.com/"

};

function abrirRede(rede){

const nome =
normalizarTexto(rede);

const url =
REDES_SOCIAIS[nome];

if(!url){

console.warn(
  "Rede social desconhecida:",
  rede
);

return false;

}

try{

window.open(
  url,
  "_blank",
  "noopener,noreferrer"
);

return true;

}catch(e){

console.error(
  "Erro rede social:",
  e
);

return false;

}
}

function abrirRed(rede){

return abrirRede(rede);
}

/* =========================================================
📤 PARTILHAR
========================================================= */

async function compartilharSite(){

const dados = {

title:
  "AfricanMundo — Notícias de África",

text:
  "A informação que liga África ao mundo.",

url:
  window.location.href

};

try{

if(navigator.share){

  await navigator.share(
    dados
  );

  return true;
}

return await copiarLinkSite();

}catch(e){

console.warn(
  "Partilha cancelada:",
  e
);

return false;

}
}

async function copiarLinkSite(){

try{

if(
  navigator.clipboard &&
  navigator.clipboard.writeText
){

  await navigator.clipboard.writeText(
    window.location.href
  );

  alert(
    "🔗 Link copiado com sucesso."
  );

  return true;
}

return false;

}catch(e){

console.warn(
  "Erro ao copiar:",
  e
);

return false;

}
}

/* =========================================================
🧭 MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

const pagina =
normalizarTexto(
location.pathname
);

document
.querySelectorAll(
"nav a,.menu a,.bottom-menu a"
)
.forEach(link=>{

  link.classList.remove(
    "ativo"
  );

  const href =
    normalizarTexto(
      link.getAttribute("href") || ""
    );

  if(!href)return;

  const arquivo =
    href
      .split("?")[0]
      .replace(".html","");

  if(
    arquivo &&
    pagina.includes(arquivo)
  ){

    link.classList.add(
      "ativo"
    );
  }

});

}

/* =========================================================
🔘 BOTÕES
========================================================= */

function iniciarBotoes(){

const busca =
document.getElementById(
"searchInput"
) ||
document.getElementById(
"pesquisa"
);

if(busca){

busca.addEventListener(
  "keydown",
  e=>{

    if(e.key === "Enter"){

      e.preventDefault();

      pesquisar();
    }

  }
);

}

const searchBtn =
document.getElementById(
"searchBtn"
);

if(searchBtn)
searchBtn.onclick =
pesquisar;

const themeBtn =
document.getElementById(
"themeBtn"
);

if(themeBtn)
themeBtn.onclick =
alternarTema;

const colorBtn =
document.getElementById(
"colorBtn"
);

if(colorBtn)
colorBtn.onclick =
abrirCores;

const notificationBtn =
document.getElementById(
"notificationBtn"
);

if(notificationBtn)
notificationBtn.onclick =
abrirNotificacoes;

const toolsBtn =
document.getElementById(
"toolsBtn"
);

if(toolsBtn)
toolsBtn.onclick =
abrirFerramentas;

const userBtn =
document.getElementById(
"userBtn"
);

if(userBtn)
userBtn.onclick =
abrirUsuario;

document
.querySelectorAll(
"[data-social]"
)
.forEach(btn=>{

  btn.addEventListener(
    "click",
    e=>{

      e.preventDefault();

      abrirRede(
        btn.dataset.social
      );

    }
  );

});

}

/* =========================================================
🛠️ FERRAMENTAS
========================================================= */

function abrirFerramentas(){

const modal =
document.getElementById(
"toolsModal"
) ||
document.getElementById(
"ferramentasModal"
);

if(modal){

modal.classList.add(
  "ativo"
);

return;

}

const menu =
document.getElementById(
"toolsMenu"
);

if(menu){

menu.classList.toggle(
  "ativo"
);

return;

}

alert(
"🛠️ Ferramentas do AfricanMundo."
);
}

/* =========================================================
👤 UTILIZADOR
========================================================= */

function abrirUsuario(){

const modal =
document.getElementById(
"userModal"
) ||
document.getElementById(
"usuarioModal"
);

if(modal){

modal.classList.add(
  "ativo"
);

return;

}

location.href =
"admin.html";
}

/* =========================================================
📢 ANÚNCIOS
========================================================= */

async function carregarAnunciosAtivos(){

if(!db)return;

const area =
document.getElementById(
"anunciosAtivos"
);

const section =
document.getElementById(
"anunciosAtivosSection"
);

if(!area)return;

try{

const agora =
  new Date().toISOString();

const {data,error} =
  await db
    .from("anuncios")
    .select(`
      id,
      empresa,
      video,
      imagem,
      mensagem,
      link,
      ativo,
      data_inicio,
      data_fim
    `)
    .eq(
      "ativo",
      true
    )
    .order(
      "id",
      {ascending:false}
    );

if(error){

  console.warn(
    "Anúncios:",
    error
  );

  if(section)
    section.style.display =
      "none";

  return;
}

const anuncios =
  (data || []).filter(a=>{

    if(
      a.data_inicio &&
      a.data_inicio > agora
    )
      return false;

    if(
      a.data_fim &&
      a.data_fim < agora
    )
      return false;

    return true;
  });


if(!anuncios.length){

  area.innerHTML = "";

  if(section)
    section.style.display =
      "none";

  return;
}


if(section)
  section.style.display =
    "block";

area.innerHTML = "";


const fragment =
  document.createDocumentFragment();


anuncios.forEach(a=>{

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "anuncio-card";


  const imagem =
    a.imagem || "";


  card.innerHTML = `

    ${
      imagem
      ? `
        <img
          src="${esc(imagem)}"
          alt="${esc(
            a.empresa ||
            "Publicidade"
          )}"
          loading="lazy"
          style="
            width:100%;
            max-height:220px;
            object-fit:cover;
            display:block;
          "
        >
      `
      : ""
    }


    <div style="
      padding:12px;
    ">

      <strong>
        ${esc(
          a.empresa ||
          "ANUNCIE AQUI"
        )}
      </strong>


      ${
        a.mensagem
        ? `
          <p>
            ${esc(a.mensagem)}
          </p>
        `
        : ""
      }


      ${
        a.link
        ? `
          <a
            href="${esc(a.link)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Saber mais →
          </a>
        `
        : ""
      }

    </div>
  `;


  fragment.appendChild(
    card
  );

});


area.appendChild(
  fragment
);

}catch(e){

console.warn(
  "Erro anúncios:",
  e
);

}
}

/* =========================================================
🚀 INICIAR AFRICANMUNDO
========================================================= */

document.addEventListener(
"DOMContentLoaded",
async()=>{

try{

  restaurarCor();

  restaurarTema();

  iniciarBotoes();

  marcarMenuAtivo();


  if(!iniciarSupabase()){

    console.error(
      "Supabase não iniciou."
    );

    mostrarErroNoticias();

    return;
  }


  await carregarNoticias();

  await carregarAnunciosAtivos();


}catch(e){

  console.error(
    "Inicialização:",
    e
  );

  mostrarErroNoticias();

}

}
);

/* =========================================================
🌍 EXPORTAR FUNÇÕES
========================================================= */

window.abrirRede =
abrirRede;

window.abrirRed =
abrirRed;

window.abrirNoticia =
abrirNoticia;

window.abrirNoticiaPorId =
abrirNoticiaPorId;

window.pesquisar =
pesquisar;

window.limparPesquisa =
limparPesquisa;

window.abrirNotificacoes =
abrirNotificacoes;

window.ativarNotificacoes =
ativarNotificacoes;

window.tentarPush =
tentarPush;

window.abrirFerramentas =
abrirFerramentas;

window.abrirUsuario =
abrirUsuario;

window.alternarTema =
alternarTema;

window.ativarTemaClaro =
ativarTemaClaro;

window.ativarTemaEscuro =
ativarTemaEscuro;

window.abrirCores =
abrirCores;

window.definirCor =
definirCor;

window.restaurarCor =
restaurarCor;

window.mostrarFavoritos =
mostrarFavoritos;

window.adicionarFavorito =
adicionarFavorito;

window.removerFavorito =
removerFavorito;

window.compartilharSite =
compartilharSite;

window.copiarLinkSite =
copiarLinkSite;

window.fecharModal =
fecharModal;

window.abrirModal =
abrirModal;

window.carregarNoticias =
carregarNoticias;

window.carregarAnunciosAtivos =
carregarAnunciosAtivos;
