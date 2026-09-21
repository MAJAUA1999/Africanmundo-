const SUPABASE_URL="https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY="sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

let db=null;
let noticias=[];

const FALLBACK_IMG=
"https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=85";


/* =========================================================
   FUNÇÕES BASE
========================================================= */

function norm(v){
return String(v||"")
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.trim();
}


function esc(v){
return String(v||"")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#039;");
}


function titulo(n){
return n?.titulo||"Sem título";
}


function texto(n){
return n?.texto||"";
}


function data(n){

if(!n?.data)return "";

try{

return new Date(n.data).toLocaleDateString(
"pt-PT",
{
day:"2-digit",
month:"2-digit",
year:"numeric"
}
);

}catch(e){

return "";

}

}


function imagemGerada(n){

const textoImg=
encodeURIComponent(
titulo(n).slice(0,80)
);

return `
data:image/svg+xml;charset=UTF-8,
<svg xmlns="http://www.w3.org/2000/svg"
width="1200" height="675">
<rect width="100%" height="100%"
fill="#168a45"/>
<text x="50%" y="50%"
dominant-baseline="middle"
text-anchor="middle"
fill="white"
font-size="42"
font-family="Arial">
AfricanMundo
</text>
</svg>
`.replace(/\n/g,"");

}


function imagem(n){

return n?.imagem||
n?.image||
n?.url_imagem||
FALLBACK_IMG;

}


/* =========================================================
   SUPABASE
========================================================= */

function iniciarSupabase(){

try{

if(
window.supabase &&
typeof window.supabase.createClient==="function"
){

db=
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

return true;

}

console.error("Supabase não disponível.");
return false;

}catch(e){

console.error("Erro Supabase:",e);
return false;

}


/* =========================================================
   CARTÃO DE NOTÍCIA
========================================================= */

function card(n){

const el=
document.createElement("article");

el.className="card";

const img=imagem(n);
const tit=titulo(n);
const cat=
n?.subcategoria||
n?.categoria||
"Notícias";

el.innerHTML=`

<img
src="${esc(img)}"
alt="${esc(tit)}"
loading="lazy"
>

<div class="card-body">

<div class="card-category">
🌍 ${esc(cat)}
</div>

<h3 class="card-title">
${esc(tit)}
</h3>

<div class="card-date">
${esc(data(n))}
</div>

</div>
`;

el.onclick=function(){

abrirNoticia(n.id);

};

const imgEl=
el.querySelector("img");

if(imgEl){

imgEl.onerror=function(){

this.onerror=null;
this.src=imagemGerada(n);

};

}

return el;

}


/* =========================================================
   LISTA
========================================================= */

function lista(arr,id){

const grid=
document.getElementById(id);

if(!grid)return;

grid.innerHTML="";

if(!arr||!arr.length){

grid.innerHTML=
`<p class="sem-noticias">
Nenhuma notícia encontrada.
</p>`;

return;

}

arr.forEach(n=>{

grid.appendChild(card(n));

});

}


/* =========================================================
   TEXTO COMPLETO
========================================================= */

function textoCompleto(n){

return texto(n)
.replace(/\r\n/g,"\n")
.replace(/\n{3,}/g,"\n\n")
.trim();

  }

/* =========================================================
   FILTRO DE NOTÍCIAS
========================================================= */

function filtrar(tipo){

const t=norm(tipo);

return noticias.filter(n=>{

const cat=norm(n?.categoria);
const sub=norm(n?.subcategoria);
const pais=norm(n?.pais);

const x=norm(
`${n?.titulo||""} ${n?.texto||""}`
);


/* =========================
   MOÇAMBIQUE
========================= */

if(t==="mocambique"){

if(
cat==="mocambique" ||
pais==="mocambique"
)return true;

if(
cat==="africa" ||
pais==="africa"
)return false;

return /mocambique|mozambique|maputo|matola|gaza|inhambane|sofala|beira|manica|tete|zambezia|nampula|pemba|cabo delgado|niassa/.test(x);

}


/* =========================
   ÁFRICA
========================= */

if(t==="africa"){

if(
cat==="mocambique" ||
pais==="mocambique" ||
/mocambique|mozambique/.test(x)
)return false;

if(
cat==="africa" ||
pais==="africa"
)return true;

return /angola|malawi|zimbabwe|zambia|tanzania|nigeria|kenya|quenia|ghana|marrocos|egito|etiopia|africa do sul|rwanda|uganda|senegal|camaroes|namibia|botswana|tunisia|argelia|libia|somalia|sudao/.test(x);

}


/* =========================
   FUTEBOL
========================= */

if(t==="futebol"){

if(
sub==="futebol" ||
cat==="futebol"
)return true;

if(
cat==="desporto" &&
!/futebol|football|golo|gol|jogador|clube|campeonato|liga|uefa|champions|premier league|mundial de clubes/.test(x)
)return false;

return /futebol|football|golo|gol|jogador|clube|campeonato|liga|uefa|champions|premier league|mundial de clubes/.test(x);

}


/* =========================
   DESPORTO
========================= */

if(t==="desporto"){

if(
cat==="futebol" ||
sub==="futebol"
)return false;

if(
cat==="desporto" ||
sub==="desporto"
)return true;

return /desporto|atletismo|basquete|basquetebol|boxe|olimpi|natacao|tenis|voleibol|ciclismo/.test(x);

}


/* =========================
   NEGÓCIOS
========================= */

if(t==="negocios"){

if(
cat==="negocios" ||
sub==="negocios"
)return true;

return /negocio|economia|empresa|mercado|investimento|comercio|financas|banco|emprego|energia/.test(x);

}


/* =========================
   ENTRETENIMENTO
========================= */

if(t==="entretenimento"){

if(
cat==="entretenimento" ||
sub==="entretenimento"
)return true;

return /entretenimento|cultura|musica|cinema|artista|festival|teatro|televisao|celebridade/.test(x);

}


/* =========================
   NOTÍCIAS
========================= */

if(
t==="noticias" ||
t==="noticia"
){

return true;

}

return false;

}


/* =========================================================
   DESTAQUE
========================================================= */

function destacar(arr){

if(!arr||!arr.length)return null;

return arr[0];

}


function mostrarDestaque(){

const box=
document.getElementById("destaque");

if(!box)return;

const n=
destacar(noticias);

if(!n){

box.innerHTML="";

return;

}

box.innerHTML=`

<div class="destaque-card"
onclick="abrirNoticia(${Number(n.id)})">

<img
src="${esc(imagem(n))}"
alt="${esc(titulo(n))}"
>

<div class="destaque-body">

<div class="card-category">
🌍 ${esc(
n.subcategoria||
n.categoria||
"Notícias"
)}
</div>

<h2>
${esc(titulo(n))}
</h2>

<p>
${esc(texto(n).slice(0,220))}
</p>

<div class="card-date">
${esc(data(n))}
</div>

</div>

</div>
`;

}


/* =========================================================
   CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

if(!db){

console.error(
"Supabase não inicializado."
);

return;

}

try{

const {data,error}=

await db
.from("noticias")
.select(`
id,
titulo,
imagem,
categoria,
subcategoria,
texto,
data,
fonte,
url_original,
id_externo,
idioma,
visualizacoes,
pais
`)
.order("data",{ascending:false})
.limit(300);

if(error)throw error;

noticias=data||[];

mostrarDestaque();

lista(
filtrar("futebol").slice(0,4),
"futebol"
);

lista(
filtrar("mocambique").slice(0,4),
"mocambique"
);

lista(
filtrar("africa").slice(0,4),
"africa"
);

lista(
filtrar("negocios").slice(0,4),
"negocios"
);

lista(
filtrar("entretenimento").slice(0,4),
"entretenimento"
);

lista(
filtrar("desporto").slice(0,4),
"desporto"
);

}catch(e){

console.error(
"Erro ao carregar notícias:",
e
);

mostrarErroNoticias(e);

}

}


/* =========================================================
   ERRO DE NOTÍCIAS
========================================================= */

function mostrarErroNoticias(e){

const grids=[
"futebol",
"mocambique",
"africa",
"negocios",
"entretenimento",
"desporto"
];

grids.forEach(id=>{

const el=
document.getElementById(id);

if(el){

el.innerHTML=`
<p class="sem-noticias">
Não foi possível carregar as notícias.
</p>
`;

}

});

}


/* =========================================================
   ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(id){

if(!id)return;

window.location.href=
"noticia.html?id="+
encodeURIComponent(id);

}


/* =========================================================
   PESQUISA
========================================================= */

function pesquisar(){

const input=
document.getElementById("searchInput");

if(!input)return;

const termo=
norm(input.value);

if(!termo){

lista(noticias.slice(0,4),"newsGrid");

return;

}

const resultados=
noticias.filter(n=>{

const textoBusca=norm(`
${n?.titulo||""}
${n?.texto||""}
${n?.categoria||""}
${n?.subcategoria||""}
`);

return textoBusca.includes(termo);

});

lista(
resultados.slice(0,30),
"newsGrid"
);

}

  /* =========================================================
   TEMA
========================================================= */

function iniciarTema(){

const tema=
localStorage.getItem("temaAfricanMundo");

if(tema==="dark")
document.body.classList.add("dark");
else
document.body.classList.remove("dark");

}


function alternarTema(){

document.body.classList.toggle("dark");

localStorage.setItem(
"temaAfricanMundo",
document.body.classList.contains("dark")
?"dark"
:"light"
);

}


function restaurarCor(){

const cor=
localStorage.getItem("corAfricanMundo");

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
"#6a1b9a",
"#ef6c00"
];

const atual=
getComputedStyle(
document.documentElement
)
.getPropertyValue("--p")
.trim();

const pos=
cores.indexOf(atual);

const proxima=
cores[(pos+1)%cores.length];

document.documentElement.style.setProperty(
"--p",
proxima
);

localStorage.setItem(
"corAfricanMundo",
proxima
);

}


/* =========================================================
   REDES SOCIAIS
========================================================= */

const REDES_SOCIAIS={

google:"https://www.google.com",
facebook:"https://www.facebook.com",
youtube:"https://www.youtube.com",
whatsapp:"https://wa.me",
instagram:"https://www.instagram.com",
tiktok:"https://www.tiktok.com"

};


function abrirRede(rede){

const nome=
norm(rede);

const url=
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

window.location.href=url;

return false;

}

}


/* =========================================================
   PARTILHAR
========================================================= */

function partilharNoticia(n){

if(!n)return;

const url=
window.location.origin+
window.location.pathname+
"?id="+
encodeURIComponent(n.id);

const tituloNoticia=
titulo(n);

if(navigator.share){

navigator.share({

title:tituloNoticia,
text:tituloNoticia,
url:url

}).catch(()=>{});

return;

}

if(navigator.clipboard){

navigator.clipboard
.writeText(url)
.then(()=>{

alert(
"Link da notícia copiado."
);

})
.catch(()=>{});

}

}


/* =========================================================
   MODAL
========================================================= */

function abrirModal(
tituloModal,
conteudo
){

let modal=
document.getElementById(
"globalModal"
);

if(!modal){

modal=
document.createElement("div");

modal.id=
"globalModal";

modal.innerHTML=`

<div class="modal-overlay"
onclick="fecharModal()">

<div class="modal-box"
onclick="event.stopPropagation()">

<button
class="modal-close"
onclick="fecharModal()">
×
</button>

<h2 id="modalTitulo"></h2>

<div id="modalConteudo"></div>

</div>

</div>
`;

document.body.appendChild(modal);

}

document.getElementById(
"modalTitulo"
).textContent=
tituloModal||"";

document.getElementById(
"modalConteudo"
).innerHTML=
conteudo||"";

modal.style.display=
"block";

}


function fecharModal(){

const modal=
document.getElementById(
"globalModal"
);

if(modal)
modal.style.display=
"none";

}


/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function mostrarNotificacoes(){

abrirModal(
"Notificações",
`
<p>🔔 Bem-vindo ao AfricanMundo.</p>

<p>
Notícias recentes de Moçambique
e de África num só lugar.
</p>
`
);

}


/* =========================================================
   FERRAMENTAS
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
   UTILIZADOR
========================================================= */

function mostrarUtilizador(){

abrirModal(
"Utilizador",
`
<p>👤 Bem-vindo ao AfricanMundo.</p>

<p>
Explore as notícias e acompanhe
as principais informações de África.
</p>
`
);

}


/* =========================================================
   MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

const atual=
window.location.pathname
.split("/")
.pop();

document
.querySelectorAll("nav a")
.forEach(link=>{

const href=
link.getAttribute("href")||"";

if(
href.includes(atual)
){

link.classList.add("active");

}

});

}


/* =========================================================
   LINKS DE CATEGORIAS
========================================================= */

function ligarLinksCategorias(){

document
.querySelectorAll("[data-categoria]")
.forEach(el=>{

el.onclick=function(){

const categoria=
this.dataset.categoria;

if(!categoria)return;

window.location.href=
"categoria.html?categoria="+
encodeURIComponent(categoria);

};

});

}


/* =========================================================
   ANÚNCIOS
========================================================= */

async function carregarAnuncios(){

const section=
document.getElementById(
"anunciosAtivosSection"
);

const container=
document.getElementById(
"anunciosAtivos"
);

if(!section||
!container||
!db)return;

try{

const {data,error}=
await db
.from("anuncios")
.select("*")
.order("id",{ascending:false})
.limit(10);

if(error)throw error;

if(!data||!data.length){

section.style.display=
"none";

return;

}

container.innerHTML="";

data.forEach(a=>{

const div=
document.createElement("div");

div.className=
"anuncio-card";

div.innerHTML=`

<h3>
${esc(
a.titulo||
a.nome||
"Anuncie aqui"
)}
</h3>

<p>
${esc(
a.texto||
a.descricao||
""
)}
</p>
`;

container.appendChild(div);

});

section.style.display="";

}catch(e){

console.warn(
"Anúncios indisponíveis:",
e
);

section.style.display=
"none";

}

}


/* =========================================================
   ANUNCIE AQUI
========================================================= */

function prepararAnuncieAqui(){

document
.querySelectorAll("a,button")
.forEach(el=>{

if(
norm(el.textContent)==="anuncie aqui" &&
el.tagName!=="A"
){

el.onclick=function(){

window.location.href=
"contacto.html";

};

}

});

}


/* =========================================================
   FAVORITOS
========================================================= */

function obterFavoritos(){

try{

return JSON.parse(
localStorage.getItem(
"africanmundo_favoritos"
)||"[]"
);

}catch(e){

return [];

}

}


function alternarFavorito(id){

if(!id)return;

let favoritos=
obterFavoritos();

id=Number(id);

if(favoritos.includes(id)){

favoritos=
favoritos.filter(
x=>x!==id
);

}else{

favoritos.push(id);

}

localStorage.setItem(
"africanmundo_favoritos",
JSON.stringify(favoritos)
);

}


function eFavorito(id){

return obterFavoritos()
.includes(Number(id));

}

  /* =========================================================
   MENU
========================================================= */

function abrirMenu(){

const menu=
document.querySelector(
".menu-mobile"
);

if(!menu)return;

menu.classList.toggle("open");

}


/* =========================================================
   BOTÕES DO CABEÇALHO
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

const tema=
document.getElementById(
"themeBtn"
);

const cor=
document.getElementById(
"colorBtn"
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

if(tema)
tema.onclick=
alternarTema;

if(cor)
cor.onclick=
escolherCor;

}


/* =========================================================
   PESQUISA
========================================================= */

function ligarPesquisa(){

const input=
document.getElementById(
"searchInput"
);

if(!input)return;

input.addEventListener(
"input",
pesquisar
);

input.addEventListener(
"keydown",
function(e){

if(e.key==="Enter")
pesquisar();

});

}


/* =========================================================
   TESTAR SUPABASE
========================================================= */

async function testarSupabase(){

if(!db)return false;

try{

const {error}=
await db
.from("noticias")
.select("id")
.limit(1);

if(error){

console.warn(
"Supabase:",
error.message
);

return false;

}

return true;

}catch(e){

console.warn(
"Erro ao testar Supabase:",
e
);

return false;

}

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

async function atualizarNoticias(){

try{

await carregarNoticias();

}catch(e){

console.warn(
"Erro na atualização:",
e
);

}

}


function iniciarAtualizacaoAutomatica(){

setInterval(
atualizarNoticias,
3600000
);

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function iniciarFechoModal(){

document.addEventListener(
"keydown",
function(e){

if(e.key==="Escape")
fecharModal();

});

}


/* =========================================================
   PROTEÇÃO DAS IMAGENS
========================================================= */

function iniciarProtecaoImagens(){

document.addEventListener(
"error",
function(e){

const el=e.target;

if(
el &&
el.tagName==="IMG"
){

if(
el.dataset.fallback==="1"
)return;

el.dataset.fallback="1";

el.src=
imagemGerada({

titulo:
el.alt||
"AfricanMundo"

});

}

},
true
);

}


/* =========================================================
   INICIAR BOTÕES
========================================================= */

function iniciarBotoes(){

ligarBotoesCabecalho();

ligarPesquisa();

ligarLinksCategorias();

prepararAnuncieAqui();

}


/* =========================================================
   INICIAR AFRICANMUNDO
========================================================= */

async function iniciarAfricanMundo(){

restaurarCor();

iniciarTema();

iniciarBotoes();

marcarMenuAtivo();

iniciarProtecaoImagens();

if(!iniciarSupabase()){

mostrarErroNoticias();

return;

}

await carregarNoticias();

carregarAnuncios();

iniciarAtualizacaoAutomatica();

iniciarFechoModal();

}


/* =========================================================
   INICIAR PÁGINA
========================================================= */

document.addEventListener(
"DOMContentLoaded",
function(){

iniciarAfricanMundo();

});
