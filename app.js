/* =========================================================
 🌍 AFRICANMUNDO — APP.JS
 PARTE 1/3 — NOTÍCIAS + IMAGENS + DESTAQUE
========================================================= */

const SUPABASE_URL="https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY="sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";
const VAPID_PUBLIC_KEY="BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db=null;
let atualizacaoEmAndamento=false;
let destaqueNoticias=[];
let destaqueIndice=0;
let destaqueTimer=null;

window.__noticias=[];


/* =========================================================
 🔌 SUPABASE
========================================================= */

function iniciarSupabase(){

  if(db)return true;

  try{

    if(
      typeof supabase==="undefined"||
      !supabase.createClient
    ){
      console.error("Supabase não encontrado.");
      return false;
    }

    db=supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    return true;

  }catch(e){

    console.error("Supabase:",e);
    return false;
  }
}


/* =========================================================
 🧹 UTILITÁRIOS
========================================================= */

function esc(v){

  return String(v??"")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}


function normalizarTexto(v){

  return String(v??"")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim();
}


function obterTitulo(n){

  return String(
    n?.titulo||
    n?.title||
    "Sem título"
  ).trim();
}


function obterTexto(n){

  return String(
    n?.texto||
    n?.description||
    ""
  ).trim();
}


function obterImagem(n){

  const url=String(
    n?.imagem||
    n?.image||
    n?.url_imagem||
    ""
  ).trim();

  return /^https?:\/\//i.test(url)
    ?url
    :"";
}


function formatarData(data){

  if(!data)return"";

  const d=new Date(data);

  if(isNaN(d.getTime()))return"";

  return d.toLocaleDateString(
    "pt-PT",
    {
      day:"2-digit",
      month:"2-digit",
      year:"numeric"
    }
  );
}


function abrirNoticia(id){

  if(id==null)return;

  location.href=
    "noticia.html?id="+
    encodeURIComponent(id);
}


function abrirNoticiaPorId(id){

  abrirNoticia(id);
}


/* =========================================================
 🎨 IMAGEM PROFISSIONAL DE FALLBACK
========================================================= */

function imagemFallback(n){

  const texto=normalizarTexto(`
    ${n?.titulo||""}
    ${n?.texto||""}
    ${n?.subcategoria||""}
    ${n?.categoria||""}
  `);

  let url="";


  /* FUTEBOL */

  if(
    /futebol|gol|golo|jogador|clube|liga|campeonato|uefa|fifa/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80";

  }


  /* DESPORTO */

  else if(
    /desporto|atletismo|basquete|basquetebol|boxe|olimpi|corrida|maratona/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80";

  }


  /* ECONOMIA / NEGÓCIOS */

  else if(
    /economia|empresa|mercado|banco|investimento|negocio|comercio|financeiro|dinheiro/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80";

  }


  /* SAÚDE */

  else if(
    /saude|hospital|doenca|medico|medicina|paciente|vacina|epidemia/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80";

  }


  /* EDUCAÇÃO */

  else if(
    /educacao|escola|universidade|estudante|professor|ensino|aluno/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80";

  }


  /* CULTURA / ENTRETENIMENTO */

  else if(
    /cultura|musica|cinema|artista|festival|teatro|celebridade|entretenimento/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80";

  }


  /* POLÍTICA */

  else if(
    /politica|presidente|ministro|governo|parlamento|eleicao|eleicoes|partido/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80";

  }


  /* AGRICULTURA */

  else if(
    /agricultura|agricultor|cultivo|colheita|milho|campo|pecuaria|gado/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80";

  }


  /* AMBIENTE */

  else if(
    /ambiente|clima|seca|cheia|inundacao|floresta|natureza|el nino/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80";

  }


  /* MOÇAMBIQUE */

  else if(
    /mocambique|mozambique|maputo|matola|sofala|manica|tete|zambezia|nampula|niassa|inhambane|gaza|cabo delgado/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80";

  }


  /* ÁFRICA */

  else if(
    /africa|africano|angola|malawi|zimbabwe|zambia|nigeria|quenia|kenya|tanzania|etiopia|egito|marrocos/.test(texto)
  ){

    url=
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200&q=80";

  }


  /* MUNDO */

  else{

    url=
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200&q=80";

  }

  return url;
}


/* =========================================================
 🖼️ IMAGEM SEGURA
========================================================= */

function imagemFinal(n){

  return obterImagem(n)||
         imagemFallback(n);
}


/* =========================================================
 📰 CARTÃO DE NOTÍCIA
========================================================= */

function criarCard(n){

  const id=n.id;
  const titulo=obterTitulo(n);
  const texto=obterTexto(n);

  const categoria=
    n.categoria||
    "Mundo";

  const pais=
    n.pais||
    "Internacional";

  const data=
    formatarData(n.data);

  const imagem=
    imagemFinal(n);

  const emojis={
    "Moçambique":"🇲🇿",
    "Portugal":"🇵🇹",
    "Brasil":"🇧🇷",
    "Angola":"🇦🇴",
    "Nigéria":"🇳🇬",
    "África do Sul":"🇿🇦",
    "Malawi":"🇲🇼",
    "Zimbabwe":"🇿🇼",
    "Zâmbia":"🇿🇲",
    "Tanzânia":"🇹🇿",
    "Quénia":"🇰🇪",
    "Egito":"🇪🇬",
    "Marrocos":"🇲🇦",
    "Etiópia":"🇪🇹",
    "China":"🇨🇳",
    "Rússia":"🇷🇺",
    "Espanha":"🇪🇸",
    "França":"🇫🇷",
    "Alemanha":"🇩🇪",
    "Estados Unidos":"🇺🇸",
    "Taiwan":"🇹🇼",
    "Palestina/Israel":"🇵🇸",
    "Internacional":"🌍"
  };

  const emoji=
    emojis[pais]||"🌍";

  const card=
    document.createElement("article");

  card.className="news-card";

  card.style.cssText=`
    width:100%;
    height:112px;
    display:flex;
    overflow:hidden;
    box-sizing:border-box;
    cursor:pointer;
    border-radius:12px;
    background:var(--card,#fff);
    margin-bottom:12px;
  `;

  card.onclick=()=>{
    abrirNoticia(id);
  };

  card.innerHTML=`

    <div
      class="card-image"
      style="
        width:125px;
        min-width:125px;
        height:112px;
        overflow:hidden;
        background:#e8eee9;
      "
    >

      <img
        src="${esc(imagem)}"
        alt="${esc(titulo)}"
        loading="lazy"
        decoding="async"
        style="
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        "
      >

    </div>

    <div
      class="card-content"
      style="
        flex:1;
        min-width:0;
        padding:9px 11px;
        overflow:hidden;
      "
    >

      <div
        style="
          font-size:10px;
          line-height:1.2;
          opacity:.72;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
          margin-bottom:4px;
        "
      >
        ${emoji} ${esc(pais)}
        · ${esc(categoria)}
      </div>

      <h3
        style="
          margin:0 0 4px;
          font-size:14px;
          line-height:1.25;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        "
      >
        ${esc(titulo)}
      </h3>

      <p
        style="
          margin:0;
          font-size:10px;
          line-height:1.25;
          opacity:.68;
          display:-webkit-box;
          -webkit-line-clamp:2;
          -webkit-box-orient:vertical;
          overflow:hidden;
        "
      >
        ${esc(texto)}
      </p>

      <div
        style="
          margin-top:3px;
          font-size:9px;
          opacity:.55;
        "
      >
        ${esc(data)}
        ${
          n.visualizacoes!=null
          ?" · 👁 "+esc(n.visualizacoes)
          :""
        }
      </div>

    </div>
  `;


  const img=
    card.querySelector("img");

  if(img){

    img.onerror=()=>{

      if(img.dataset.fallback==="1")
        return;

      img.dataset.fallback="1";

      img.src=
        imagemFallback(n);

    };

  }

  return card;
}


/* =========================================================
 📰 RENDERIZAR LISTA
========================================================= */

function renderizarLista(lista,container){

  if(!container)return;

  container.innerHTML="";

  if(!lista?.length){

    container.innerHTML=`
      <p class="sem-noticias">
        Ainda não existem notícias nesta categoria.
      </p>
    `;

    return;
  }

  const fragment=
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

  const area=
    document.getElementById("destaque");

  if(!area)return;

  if(!destaqueNoticias.length){

    area.innerHTML="";

    return;
  }

  const n=
    destaqueNoticias[
      destaqueIndice%
      destaqueNoticias.length
    ];

  const titulo=
    obterTitulo(n);

  const texto=
    obterTexto(n);

  const imagem=
    imagemFinal(n);

  area.innerHTML=`

    <article
      class="destaque-card"
      style="
        position:relative;
        width:100%;
        overflow:hidden;
        border-radius:16px;
        cursor:pointer;
      "
      onclick="abrirNoticia(${Number(n.id)})"
    >

      <img
        src="${esc(imagem)}"
        alt="${esc(titulo)}"
        fetchpriority="high"
        decoding="async"
        style="
          width:100%;
          height:240px;
          object-fit:cover;
          display:block;
        "
      >

      <div
        style="
          position:absolute;
          inset:0;
          display:flex;
          flex-direction:column;
          justify-content:flex-end;
          padding:18px;
          color:#fff;
          background:linear-gradient(
            transparent 25%,
            rgba(0,0,0,.88)
          );
        "
      >

        <div
          style="
            font-size:11px;
            font-weight:700;
            margin-bottom:5px;
          "
        >
          ⭐ DESTAQUE
        </div>

        <h2
          style="
            margin:0 0 6px;
            font-size:21px;
            line-height:1.18;
          "
        >
          ${esc(titulo)}
        </h2>

        <p
          style="
            margin:0;
            font-size:12px;
            line-height:1.3;
            opacity:.92;
            display:-webkit-box;
            -webkit-line-clamp:2;
            -webkit-box-orient:vertical;
            overflow:hidden;
          "
        >
          ${esc(texto)}
        </p>

      </div>

    </article>
  `;

  const img=
    area.querySelector("img");

  if(img){

    img.onerror=()=>{

      if(img.dataset.fallback==="1")
        return;

      img.dataset.fallback="1";
      img.src=imagemFallback(n);

    };

  }
}


function iniciarDestaqueRotativo(){

  clearInterval(destaqueTimer);

  if(destaqueNoticias.length<2)
    return;

  destaqueTimer=
    setInterval(()=>{

      destaqueIndice++;

      renderizarDestaque();

    },8000);
}


/* =========================================================
 🔎 FILTROS
========================================================= */

function ehMocambique(n){

  const s=normalizarTexto(`
    ${n.categoria}
    ${n.pais}
    ${n.titulo}
    ${n.texto}
  `);

  return(
    normalizarTexto(n.categoria)==="mocambique"||
    normalizarTexto(n.pais)==="mocambique"||
    /mocambique|mozambique|maputo|matola|sofala|manica|tete|zambezia|nampula|niassa|inhambane|cabo delgado/.test(s)
  );
}


function ehAfrica(n){

  const s=normalizarTexto(`
    ${n.categoria}
    ${n.pais}
    ${n.titulo}
  `);

  return(
    normalizarTexto(n.categoria)==="africa"||
    /angola|malawi|zimbabwe|zambia|nigeria|quenia|kenya|tanzania|etiopia|egito|marrocos|africa do sul/.test(s)
  );
}


function ehFutebol(n){

  return/futebol/.test(
    normalizarTexto(`
      ${n.subcategoria}
      ${n.categoria}
      ${n.titulo}
    `)
  );
}


function ehDesporto(n){

  return/desporto|atletismo|basquete|boxe|olimpi/.test(
    normalizarTexto(`
      ${n.subcategoria}
      ${n.categoria}
      ${n.titulo}
    `)
  );
}


function ehNegocios(n){

  return/negocio|economia/.test(
    normalizarTexto(`
      ${n.subcategoria}
      ${n.categoria}
      ${n.titulo}
    `)
  );
}


function ehEntretenimento(n){

  return/entretenimento/.test(
    normalizarTexto(`
      ${n.subcategoria}
      ${n.categoria}
      ${n.titulo}
    `)
  );
}


/* =========================================================
 📰 CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

  if(atualizacaoEmAndamento)return;

  if(!iniciarSupabase())return;

  atualizacaoEmAndamento=true;

  try{

    const{data,error}=await db
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
      .order("data",{ascending:false})
      .limit(100);

    if(error){

      console.error(
        "Erro ao carregar notícias:",
        error
      );

      return;
    }

    window.__noticias=
      Array.isArray(data)
      ?data
      :[];

    renderizarPagina(
      window.__noticias
    );

  }catch(e){

    console.error(
      "carregarNoticias:",
      e
    );

  }finally{

    atualizacaoEmAndamento=false;

  }
}


/* =========================================================
 🏠 RENDERIZAR PÁGINA
========================================================= */

function renderizarPagina(lista){

  const noticias=
    Array.isArray(lista)
    ?lista
    :[];


  destaqueNoticias=
    noticias.slice(0,5);

  destaqueIndice=0;

  renderizarDestaque();

  iniciarDestaqueRotativo();


  const grid=
    document.getElementById("newsGrid");

  if(grid){

    renderizarLista(
      noticias.slice(0,10),
      grid
    );

  }


  const futebolGrid=
    document.getElementById("futebolGrid");

  if(futebolGrid){

    renderizarLista(
      noticias.filter(ehFutebol).slice(0,6),
      futebolGrid
    );

  }


  const mocambiqueGrid=
    document.getElementById("mocambiqueGrid");

  if(mocambiqueGrid){

    renderizarLista(
      noticias.filter(ehMocambique).slice(0,6),
      mocambiqueGrid
    );

  }


  const africaGrid=
    document.getElementById("africaGrid");

  if(africaGrid){

    renderizarLista(
      noticias.filter(ehAfrica).slice(0,6),
      africaGrid
    );

  }


  const negociosGrid=
    document.getElementById("negociosGrid");

  if(negociosGrid){

    renderizarLista(
      noticias.filter(ehNegocios).slice(0,6),
      negociosGrid
    );

  }


  const entretenimentoGrid=
    document.getElementById("entretenimentoGrid");

  if(entretenimentoGrid){

    renderizarLista(
      noticias.filter(ehEntretenimento).slice(0,6),
      entretenimentoGrid
    );

  }


  const desportoGrid=
    document.getElementById("desportoGrid");

  if(desportoGrid){

    renderizarLista(
      noticias.filter(ehDesporto).slice(0,6),
      desportoGrid
    );

  }

   }

 /* =========================================================
 🔎 PESQUISA
========================================================= */

function pesquisar(){

  const campo=
    document.getElementById("searchInput")||
    document.getElementById("pesquisa");

  if(!campo)return;

  const termo=
    normalizarTexto(campo.value);

  if(!termo){

    renderizarPagina(
      window.__noticias||[]
    );

    return;
  }

  const resultados=
    (window.__noticias||[]).filter(n=>{

      const texto=normalizarTexto(`
        ${n.titulo||""}
        ${n.texto||""}
        ${n.categoria||""}
        ${n.subcategoria||""}
        ${n.pais||""}
        ${n.fonte||""}
      `);

      return texto.includes(termo);

    });

  renderizarPagina(resultados);
}


function limparPesquisa(){

  const campo=
    document.getElementById("searchInput")||
    document.getElementById("pesquisa");

  if(campo)campo.value="";

  renderizarPagina(
    window.__noticias||[]
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
      )||"[]"
    );

  }catch{

    return[];
  }
}


function guardarFavoritos(lista){

  localStorage.setItem(
    "africanmundo_favoritos",
    JSON.stringify(lista)
  );
}


function adicionarFavorito(id){

  const lista=
    obterFavoritos();

  id=String(id);

  if(!lista.includes(id)){

    lista.push(id);

    guardarFavoritos(lista);

  }

  return true;
}


function removerFavorito(id){

  id=String(id);

  const lista=
    obterFavoritos().filter(
      x=>String(x)!==id
    );

  guardarFavoritos(lista);

  return true;
}


function mostrarFavoritos(){

  const ids=
    obterFavoritos()
      .map(String);

  const noticias=
    (window.__noticias||[])
      .filter(n=>
        ids.includes(String(n.id))
      );

  renderizarPagina(noticias);

}


/* =========================================================
 🪟 MODAL
========================================================= */

function fecharModal(){

  const modal=
    document.getElementById("modal");

  if(modal)
    modal.classList.remove("ativo");

  document
    .querySelectorAll(
      ".modal.ativo"
    )
    .forEach(m=>
      m.classList.remove("ativo")
    );
}


function abrirModal(id){

  const modal=
    document.getElementById(id);

  if(!modal)return;

  modal.classList.add("ativo");
}


/* =========================================================
 🔔 NOTIFICAÇÕES
========================================================= */

function abrirNotificacoes(){

  const modal=
    document.getElementById(
      "notificationModal"
    )||
    document.getElementById(
      "notificacoesModal"
    );

  if(modal){

    modal.classList.add("ativo");
    return;

  }

  alert(
    "🔔 As notificações do AfricanMundo estão disponíveis."
  );
}


async function ativarNotificacoes(){

  if(
    !("Notification" in window)
  ){

    alert(
      "Este navegador não suporta notificações."
    );

    return false;
  }

  try{

    const permissao=
      await Notification.requestPermission();

    if(permissao==="granted"){

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
    !("serviceWorker" in navigator)||
    !("PushManager" in window)
  ){
    return false;
  }

  try{

    const registration=
      await navigator.serviceWorker.ready;

    const permissao=
      await Notification.requestPermission();

    if(permissao!=="granted")
      return false;

    const existente=
      await registration.pushManager.getSubscription();

    if(existente)return true;

    if(!VAPID_PUBLIC_KEY)
      return false;

    const subscription=
      await registration.pushManager.subscribe({
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

  const padding=
    "=".repeat(
      (4-base64.length%4)%4
    );

  const base64url=
    (
      base64+
      padding
    )
      .replace(/-/g,"+")
      .replace(/_/g,"/");

  const rawData=
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

  document.body.classList.remove(
    "dark"
  );

  document.documentElement
    .classList.remove("dark");

  localStorage.setItem(
    "africanmundo_tema",
    "claro"
  );
}


function ativarTemaEscuro(){

  document.body.classList.add(
    "dark"
  );

  document.documentElement
    .classList.add("dark");

  localStorage.setItem(
    "africanmundo_tema",
    "escuro"
  );
}


function alternarTema(){

  const escuro=
    document.body.classList.contains(
      "dark"
    );

  if(escuro)
    ativarTemaClaro();
  else
    ativarTemaEscuro();
}


function restaurarTema(){

  const tema=
    localStorage.getItem(
      "africanmundo_tema"
    );

  if(tema==="escuro"){

    ativarTemaEscuro();

    return;
  }

  if(tema==="claro"){

    ativarTemaClaro();

    return;
  }

  if(
    window.matchMedia&&
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

  const modal=
    document.getElementById(
      "colorModal"
    )||
    document.getElementById(
      "coresModal"
    );

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

  const cor=
    localStorage.getItem(
      "africanmundo_cor"
    );

  if(cor)
    definirCor(cor);
}


/* =========================================================
 🖱️ FECHAR MODAIS AO CLICAR FORA
========================================================= */

document.addEventListener(
  "click",
  function(e){

    if(
      e.target.classList.contains(
        "modal"
      )
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

const REDES_SOCIAIS={

  facebook:"https://www.facebook.com/",
  instagram:"https://www.instagram.com/",
  youtube:"https://www.youtube.com/",
  whatsapp:"https://wa.me/",
  tiktok:"https://www.tiktok.com/"

};


function abrirRede(rede){

  const nome=
    normalizarTexto(rede);

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

    console.error(
      "Rede social:",
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

  const dados={
    title:"AfricanMundo — Notícias de África",
    text:"A informação que liga África ao mundo.",
    url:window.location.href
  };

  try{

    if(
      navigator.share
    ){

      await navigator.share(
        dados
      );

      return true;
    }

    await copiarLinkSite();

    return true;

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

    await navigator.clipboard.writeText(
      window.location.href
    );

    alert(
      "🔗 Link copiado com sucesso."
    );

    return true;

  }catch{

    return false;
  }
}


/* =========================================================
 🧭 MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

  const pagina=
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

      const href=
        normalizarTexto(
          link.getAttribute("href")||""
        );

      if(
        href&&
        pagina.includes(href.replace(
          ".html",
          ""
        ))
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

  const busca=
    document.getElementById(
      "searchInput"
    )||
    document.getElementById(
      "pesquisa"
    );

  if(busca){

    busca.addEventListener(
      "keydown",
      e=>{

        if(e.key==="Enter")
          pesquisar();

      }
    );

  }


  const searchBtn=
    document.getElementById(
      "searchBtn"
    );

  if(searchBtn){

    searchBtn.onclick=
      pesquisar;

  }


  const themeBtn=
    document.getElementById(
      "themeBtn"
    );

  if(themeBtn){

    themeBtn.onclick=
      alternarTema;

  }


  const colorBtn=
    document.getElementById(
      "colorBtn"
    );

  if(colorBtn){

    colorBtn.onclick=
      abrirCores;

  }


  const notificationBtn=
    document.getElementById(
      "notificationBtn"
    );

  if(notificationBtn){

    notificationBtn.onclick=
      abrirNotificacoes;

  }


  const toolsBtn=
    document.getElementById(
      "toolsBtn"
    );

  if(toolsBtn){

    toolsBtn.onclick=
      abrirFerramentas;

  }


  const userBtn=
    document.getElementById(
      "userBtn"
    );

  if(userBtn){

    userBtn.onclick=
      abrirUsuario;

  }


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

  const modal=
    document.getElementById(
      "toolsModal"
    )||
    document.getElementById(
      "ferramentasModal"
    );

  if(modal){

    modal.classList.add(
      "ativo"
    );

    return;
  }

  const opcoes=
    document.getElementById(
      "toolsMenu"
    );

  if(opcoes){

    opcoes.classList.toggle(
      "ativo"
    );

  }

}


/* =========================================================
 👤 UTILIZADOR
========================================================= */

function abrirUsuario(){

  const modal=
    document.getElementById(
      "userModal"
    )||
    document.getElementById(
      "usuarioModal"
    );

  if(modal){

    modal.classList.add(
      "ativo"
    );

    return;
  }

  location.href=
    "admin.html";
}


/* =========================================================
 📢 ANÚNCIOS
========================================================= */

async function carregarAnunciosAtivos(){

  if(!db)return;

  const area=
    document.getElementById(
      "anunciosAtivos"
    );

  const section=
    document.getElementById(
      "anunciosAtivosSection"
    );

  if(!area)return;

  try{

    const agora=
      new Date().toISOString();

    const{data,error}=
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
        .eq("ativo",true)
        .order(
          "id",
          {ascending:false}
        );

    if(error){

      console.warn(
        "Anúncios:",
        error
      );

      return;
    }

    const anuncios=
      (data||[]).filter(a=>{

        if(
          a.data_inicio&&
          a.data_inicio>agora
        )
          return false;

        if(
          a.data_fim&&
          a.data_fim<agora
        )
          return false;

        return true;

      });

    if(!anuncios.length){

      area.innerHTML="";

      if(section)
        section.style.display="none";

      return;
    }

    if(section)
      section.style.display="block";

    area.innerHTML="";

    const fragment=
      document.createDocumentFragment();

    anuncios.forEach(a=>{

      const card=
        document.createElement("article");

      card.className=
        "anuncio-card";

      const imagem=
        a.imagem||
        "";

      card.innerHTML=`

        ${
          imagem
          ?`
            <img
              src="${esc(imagem)}"
              alt="${esc(a.empresa||"Publicidade")}"
              loading="lazy"
              style="
                width:100%;
                max-height:220px;
                object-fit:cover;
                display:block;
              "
            >
          `
          :""
        }

        <div
          style="
            padding:12px;
          "
        >

          <strong>
            ${esc(
              a.empresa||
              "ANUNCIE AQUI"
            )}
          </strong>

          ${
            a.mensagem
            ?`
              <p>
                ${esc(a.mensagem)}
              </p>
            `
            :""
          }

          ${
            a.link
            ?`
              <a
                href="${esc(a.link)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Saber mais →
              </a>
            `
            :""
          }

        </div>
      `;

      fragment.appendChild(card);

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

        return;
      }

      await carregarNoticias();

      await carregarAnunciosAtivos();

    }catch(e){

      console.error(
        "Inicialização:",
        e
      );

    }

  }
);


/* =========================================================
 🌍 EXPORTAR FUNÇÕES
========================================================= */

window.abrirRede=
  abrirRede;

window.abrirRed=
  abrirRed;

window.abrirNoticia=
  abrirNoticia;

window.abrirNoticiaPorId=
  abrirNoticiaPorId;

window.pesquisar=
  pesquisar;

window.limparPesquisa=
  limparPesquisa;

window.abrirNotificacoes=
  abrirNotificacoes;

window.ativarNotificacoes=
  ativarNotificacoes;

window.abrirFerramentas=
  abrirFerramentas;

window.abrirUsuario=
  abrirUsuario;

window.alternarTema=
  alternarTema;

window.ativarTemaClaro=
  ativarTemaClaro;

window.ativarTemaEscuro=
  ativarTemaEscuro;

window.abrirCores=
  abrirCores;

window.definirCor=
  definirCor;

window.mostrarFavoritos=
  mostrarFavoritos;

window.adicionarFavorito=
  adicionarFavorito;

window.removerFavorito=
  removerFavorito;

window.compartilharSite=
  compartilharSite;

window.copiarLinkSite=
  copiarLinkSite;

window.fecharModal=
  fecharModal;

window.abrirModal=
  abrirModal;

window.carregarNoticias=
  carregarNoticias;
