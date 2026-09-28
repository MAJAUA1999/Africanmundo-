/* =====================================================
   AFRICANMUNDO — APP.JS
   VERSÃO PROFISSIONAL
   PESQUISA + NOTIFICAÇÕES + FERRAMENTAS + EU
   SEM DUPLICAÇÃO
===================================================== */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db =
window.supabase?.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let noticias = [];
let indiceDestaque = 0;
let timerDestaque = null;
let timerAtualizacao = null;
let pesquisaAberta = false;

function norm(v){
  return String(v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .trim();
}

function esc(v){
  return String(v || "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");
}

function titulo(n){
  return n?.titulo || "Sem título";
}

function texto(n){
  return n?.texto || "";
}

function dataNumero(n){
  const d =
    new Date(n?.data || 0).getTime();

  return Number.isNaN(d)
    ? 0
    : d;
}

function data(n){
  if(!n?.data) return "";

  try{
    return new Date(n.data)
      .toLocaleDateString(
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

/* =====================================================
   IMAGEM PADRÃO
===================================================== */

const FALLBACK_IMG =
"data:image/svg+xml;charset=UTF-8," +
"<svg xmlns='http://www.w3.org/2000/svg' " +
"width='1200' height='675'>" +
"<rect width='100%' height='100%' fill='%23168a45'/>" +
"<text x='50%' y='50%' " +
"dominant-baseline='middle' " +
"text-anchor='middle' " +
"fill='white' font-size='42' " +
"font-family='Arial'>" +
"AfricanMundo" +
"</text></svg>";

function imagem(n){

  const campos = [
    n?.imagem,
    n?.image,
    n?.url_imagem,
    n?.imagem_url
  ];

  for(
    const valor of campos
  ){

    if(
      typeof valor === "string" &&
      valor.trim() !== ""
    ){
      return valor.trim();
    }

  }

  return FALLBACK_IMG;
}

/* =====================================================
   CARD DE NOTÍCIA
===================================================== */

function card(n){

  const el =
    document.createElement("article");

  el.className = "card";

  const img = imagem(n);
  const tit = titulo(n);

  const cat =
    n?.subcategoria ||
    n?.categoria ||
    "Notícias";

  el.innerHTML = `
    <img
      src="${esc(img)}"
      alt="${esc(tit)}"
      loading="lazy"
      decoding="async"
    >

    <div class="card-body">

      <div class="card-category">
        🌍 ${esc(cat)}
      </div>

      <h3 class="card-title">
        ${esc(tit)}
      </h3>

      <div class="card-date">
        🕒 ${esc(data(n))}
      </div>

    </div>
  `;

  el.onclick = function(){
    abrirNoticia(n.id);
  };

  const imgEl =
    el.querySelector("img");

  if(imgEl){

    imgEl.onerror =
      function(){

        this.onerror = null;
        this.src =
          FALLBACK_IMG;

      };

  }

  return el;
}

/* =====================================================
   MOSTRAR LISTA
===================================================== */

function lista(arr,id){

  const grid =
    document.getElementById(id);

  if(!grid) return;

  grid.innerHTML = "";

  if(
    !arr ||
    !arr.length
  ){

    grid.innerHTML = `
      <p class="sem-noticias">
        Nenhuma notícia encontrada.
      </p>
    `;

    return;
  }

  arr.forEach(
    n => {
      grid.appendChild(
        card(n)
      );
    }
  );
}

/* =====================================================
   DESTAQUE
===================================================== */

function mostrarDestaque(){

  const box =
    document.getElementById(
      "destaque"
    );

  if(
    !box ||
    !noticias.length
  ){
    return;
  }

  const n =
    noticias[indiceDestaque];

  const img =
    imagem(n);

  const resumo =
    String(
      n?.texto ||
      n?.descricao ||
      n?.resumo ||
      n?.description ||
      ""
    )
    .replace(/\s+/g," ")
    .trim()
    .slice(0,180);

  box.innerHTML = `
    <div
      class="destaque-card"
      onclick="abrirNoticia(${Number(n.id)})"
    >

      <img
        src="${esc(img)}"
        alt="${esc(titulo(n))}"
        loading="eager"
        decoding="async"
      >

      <div class="destaque-overlay">

        <div class="destaque-categoria">
          🌍 ${esc(
            n?.subcategoria ||
            n?.categoria ||
            "Notícias"
          )}
        </div>

        <h2>
          ${esc(titulo(n))}
        </h2>

        ${
          resumo
          ? `
            <p>
              ${esc(resumo)}...
            </p>
          `
          : ""
        }

        <div class="destaque-data">
          🕒 ${esc(data(n))}
        </div>

      </div>

    </div>
  `;

  const imagemEl =
    box.querySelector("img");

  if(imagemEl){

    imagemEl.onerror =
      function(){

        this.onerror = null;
        this.src =
          FALLBACK_IMG;

      };

  }
}

/* =====================================================
   ROTAÇÃO DO DESTAQUE
===================================================== */

function iniciarDestaque(){

  clearInterval(
    timerDestaque
  );

  if(
    noticias.length < 2
  ){
    return;
  }

  timerDestaque =
    setInterval(
      function(){

        indiceDestaque++;

        if(
          indiceDestaque >=
          noticias.length
        ){
          indiceDestaque = 0;
        }

        mostrarDestaque();

      },
      10000
    );
}

/* =====================================================
   FILTRO DE CATEGORIAS
===================================================== */

function filtrar(tipo){

  const t =
    norm(tipo);

  return noticias
    .filter(
      n => {

        const cat =
          norm(n?.categoria);

        const sub =
          norm(n?.subcategoria);

        const pais =
          norm(n?.pais);

        if(
          t === "mocambique"
        ){

          return (
            cat === "mocambique" ||
            pais === "mocambique" ||
            pais === "mozambique"
          );

        }

        if(
          t === "africa"
        ){

          return cat === "africa";

        }

        if(
          t === "futebol"
        ){

          return (
            cat === "futebol" ||
            sub === "futebol"
          );

        }

        if(
          t === "desporto"
        ){

          return (
            cat === "desporto" ||
            sub === "desporto"
          );

        }

        if(
          t === "negocios"
        ){

          return cat === "negocios";

        }

        if(
          t === "entretenimento"
        ){

          return cat === "entretenimento";

        }

        if(
          t === "noticias" ||
          t === "noticia"
        ){

          return true;

        }

        return false;

      }
    )
    .sort(
      (a,b) =>
        dataNumero(b) -
        dataNumero(a)
    );
}

/* =====================================================
   BUSCAR UMA CATEGORIA
===================================================== */

async function buscarCategoria(
  categoria,
  elemento,
  limite = 4
){

  const grid =
    document.getElementById(
      elemento
    );

  if(!grid) return [];

  try{

    const resultado =
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
        .eq(
          "categoria",
          categoria
        )
        .order(
          "data",
          {
            ascending:false
          }
        )
        .order(
          "id",
          {
            ascending:false
          }
        )
        .limit(limite);

    if(
      resultado.error
    ){

      console.error(
        `Erro em ${categoria}:`,
        resultado.error
      );

      lista(
        [],
        elemento
      );

      return [];

    }

    const dados =
      resultado.data || [];

    lista(
      dados,
      elemento
    );

    console.log(
      `AfricanMundo — ${categoria}:`,
      dados.length
    );

    return dados;

  }catch(e){

    console.error(
      `Erro ao buscar ${categoria}:`,
      e
    );

    lista(
      [],
      elemento
    );

    return [];

  }
       }

/* =====================================================
   CARREGAR NOTÍCIAS
   DESTAQUE COM TODAS AS NOTÍCIAS
===================================================== */

async function carregarNoticias(){

  if(!db){

    mostrarErroNoticias(
      "Supabase não inicializado."
    );

    return;
  }

  try{

    /*
      ==================================================
      1. BUSCAR TODAS AS NOTÍCIAS PARA O DESTAQUE
      ==================================================
    */

    const todas =
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
        .order(
          "data",
          {
            ascending:false
          }
        )
        .order(
          "id",
          {
            ascending:false
          }
        );

    if(todas.error)
      throw todas.error;

    /*
      Guardar TODAS as notícias.

      O Destaque vai usar esta lista.
    */

    noticias =
      todas.data || [];

    /*
      Sempre que atualizar a página,
      começa pela notícia mais recente.
    */

    indiceDestaque = 0;

    mostrarDestaque();

    iniciarDestaque();


    /*
      ==================================================
      2. ÚLTIMAS NOTÍCIAS
      ==================================================

      A página continua compacta.
      Mostramos apenas as 10 mais recentes.
    */

    lista(
      noticias.slice(0,10),
      "ultimas"
    );


    /*
      ==================================================
      3. CATEGORIAS
      ==================================================
    */

    await Promise.all([

      buscarCategoria(
        "Moçambique",
        "mocambique"
      ),

      buscarCategoria(
        "África",
        "africa"
      ),

      buscarCategoria(
        "Futebol",
        "futebol"
      ),

      buscarCategoria(
        "Desporto",
        "desporto"
      ),

      buscarCategoria(
        "Negócios",
        "negocios"
      ),

      buscarCategoria(
        "Entretenimento",
        "entretenimento"
      )

    ]);


    console.log(
      "AfricanMundo — página inicial carregada."
    );

    console.log(
      "Notícias disponíveis no Destaque:",
      noticias.length
    );

  }catch(e){

    console.error(
      "Erro ao carregar notícias:",
      e
    );

    mostrarErroNoticias(e);

  }
  }

/* =====================================================
   ABRIR NOTÍCIA
===================================================== */

function abrirNoticia(id){

  if(!id) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);
}

/* =====================================================
   PESQUISA PROFISSIONAL
===================================================== */

async function pesquisar(){

  const campo =
    document.getElementById(
      "searchInput"
    );

  if(!campo) return;

  const termo =
    campo.value.trim();

  if(!termo){

    carregarNoticias();

    return;
  }

  const termoNormalizado =
    norm(termo);

  const grid =
    document.getElementById(
      "ultimas"
    );

  if(grid){

    grid.innerHTML = `
      <p class="sem-noticias">
        🔎 A pesquisar...
      </p>
    `;

  }

  try{

    const resultado =
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
        .or(
          `titulo.ilike.%${termo}%,texto.ilike.%${termo}%,categoria.ilike.%${termo}%,subcategoria.ilike.%${termo}%,pais.ilike.%${termo}%`
        )
        .order(
          "data",
          {
            ascending:false
          }
        )
        .order(
          "id",
          {
            ascending:false
          }
        )
        .limit(50);

    if(resultado.error)
      throw resultado.error;

    let resultados =
      resultado.data || [];

    /*
      Segunda filtragem local.
      Ajuda a evitar resultados
      muito distantes da pesquisa.
    */

    resultados =
      resultados.filter(
        n => {

          const conteudo =
            norm(`
              ${n?.titulo || ""}
              ${n?.texto || ""}
              ${n?.categoria || ""}
              ${n?.subcategoria || ""}
              ${n?.pais || ""}
            `);

          return conteudo.includes(
            termoNormalizado
          );

        }
      );

    lista(
      resultados,
      "ultimas"
    );

    const resultadoBox =
      document.getElementById(
        "searchResults"
      );

    if(resultadoBox){

      resultadoBox.innerHTML = `
        <p style="
          font-size:12px;
          color:var(--muted);
          margin:7px 0;
        ">
          🔎 ${resultados.length}
          resultado(s) encontrado(s)
          para:
          <strong>${esc(termo)}</strong>
        </p>
      `;

    }

    pesquisaAberta = true;

    console.log(
      "Pesquisa:",
      termo,
      resultados.length
    );

  }catch(e){

    console.error(
      "Erro na pesquisa:",
      e
    );

    if(grid){

      grid.innerHTML = `
        <p class="sem-noticias">
          Não foi possível realizar
          a pesquisa.
        </p>
      `;

    }

  }
}

/* =====================================================
   ABRIR PESQUISA
===================================================== */

function focarPesquisa(){

  const campo =
    document.getElementById(
      "searchInput"
    );

  if(!campo) return;

  campo.focus();

  try{

    campo.select();

  }catch(e){}

  pesquisaAberta = true;
}

/* =====================================================
   MODAL
===================================================== */

function abrirModal(
  titulo,
  conteudo
){

  const modal =
    document.getElementById(
      "modal"
    );

  const modalTitle =
    document.getElementById(
      "modalTitle"
    );

  const modalBody =
    document.getElementById(
      "modalBody"
    );

  if(!modal) return;

  if(modalTitle){

    modalTitle.textContent =
      titulo;

  }

  if(modalBody){

    modalBody.innerHTML =
      conteudo;

  }

  modal.style.display =
    "flex";

  document.body.classList.add(
    "modal-aberto"
  );
}

/* =====================================================
   FECHAR MODAL
===================================================== */

function fecharModal(){

  const modal =
    document.getElementById(
      "modal"
    );

  if(!modal) return;

  modal.style.display =
    "none";

  document.body.classList.remove(
    "modal-aberto"
  );
}

/* =====================================================
   NOTIFICAÇÕES
===================================================== */

function mostrarNotificacoes(){

  abrirModal(
    "Notificações",
    `
      <div style="
        display:grid;
        gap:10px;
      ">

        <div style="
          padding:12px;
          border-radius:12px;
          background:var(--card,#fff);
          border:1px solid
            rgba(0,0,0,.08);
        ">
          <strong>
            🔔 Bem-vindo ao AfricanMundo
          </strong>

          <p style="
            margin:5px 0 0;
            font-size:13px;
          ">
            Notícias recentes de
            Moçambique, África
            e do mundo.
          </p>
        </div>

        <div style="
          padding:12px;
          border-radius:12px;
          background:var(--card,#fff);
          border:1px solid
            rgba(0,0,0,.08);
        ">
          <strong>
            📰 Atualizações
          </strong>

          <p style="
            margin:5px 0 0;
            font-size:13px;
          ">
            O AfricanMundo verifica
            novas notícias
            automaticamente.
          </p>
        </div>

        <div style="
          padding:12px;
          border-radius:12px;
          background:var(--card,#fff);
          border:1px solid
            rgba(0,0,0,.08);
        ">
          <strong>
            ⚡ Dica
          </strong>

          <p style="
            margin:5px 0 0;
            font-size:13px;
          ">
            Use a pesquisa para
            encontrar notícias
            antigas e recentes.
          </p>
        </div>

      </div>
    `
  );
}

/* =====================================================
   FERRAMENTAS
===================================================== */

function mostrarFerramentas(){

  abrirModal(
    "Ferramentas",
    `
      <div style="
        display:grid;
        gap:8px;
      ">

        <button
          type="button"
          onclick="focarPesquisa();fecharModal();"
          style="
            padding:12px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            text-align:left;
          "
        >
          🔎 Pesquisar notícias
        </button>

        <button
          type="button"
          onclick="alternarTema();"
          style="
            padding:12px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            text-align:left;
          "
        >
          🌙 Alterar tema
        </button>

        <button
          type="button"
          onclick="alterarCor();"
          style="
            padding:12px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            text-align:left;
          "
        >
          🎨 Alterar cor
        </button>

        <button
          type="button"
          onclick="partilharNoticia();"
          style="
            padding:12px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            text-align:left;
          "
        >
          📤 Partilhar
        </button>

        <button
          type="button"
          onclick="carregarNoticias();fecharModal();"
          style="
            padding:12px;
            border:0;
            border-radius:10px;
            cursor:pointer;
            text-align:left;
          "
        >
          🔄 Atualizar notícias
        </button>

      </div>

      <div style="
        margin-top:14px;
        padding:10px;
        border-radius:10px;
        font-size:12px;
        opacity:.8;
      ">
        <strong>Atalhos:</strong><br>
        / — pesquisar<br>
        Ctrl + K — pesquisar<br>
        T — tema<br>
        Esc — fechar janela
      </div>
    `
  );
}

/* =====================================================
   "EU" / PERFIL
===================================================== */

function mostrarEu(){

  abrirModal(
    "Eu",
    `
      <div style="
        text-align:center;
        padding:10px;
      ">

        <div style="
          width:64px;
          height:64px;
          margin:0 auto 10px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          background:var(--p,#168a45);
          color:white;
          font-size:30px;
        ">
          👤
        </div>

        <h3 style="
          margin:5px 0;
        ">
          AfricanMundo
        </h3>

        <p style="
          font-size:13px;
          opacity:.8;
        ">
          A informação que liga
          África ao mundo.
        </p>

        <div style="
          display:grid;
          gap:8px;
          margin-top:14px;
        ">

          <button
            type="button"
            onclick="focarPesquisa();fecharModal();"
            style="
              padding:11px;
              border:0;
              border-radius:10px;
              cursor:pointer;
            "
          >
            🔎 Pesquisar
          </button>

          <button
            type="button"
            onclick="mostrarNotificacoes();"
            style="
              padding:11px;
              border:0;
              border-radius:10px;
              cursor:pointer;
            "
          >
            🔔 Notificações
          </button>

          <button
            type="button"
            onclick="mostrarFerramentas();"
            style="
              padding:11px;
              border:0;
              border-radius:10px;
              cursor:pointer;
            "
          >
            🛠️ Ferramentas
          </button>

        </div>

      </div>
    `
  );
}

/* =====================================================
   TEMA
===================================================== */

function iniciarTema(){

  const tema =
    localStorage.getItem(
      "africanmundo-tema"
    );

  document.body.classList.toggle(
    "dark",
    tema === "dark"
  );
}

function alternarTema(){

  document.body.classList.toggle(
    "dark"
  );

  const ativo =
    document.body.classList.contains(
      "dark"
    );

  localStorage.setItem(
    "africanmundo-tema",
    ativo
      ? "dark"
      : "light"
  );
}

/* =====================================================
   CORES
===================================================== */

function restaurarCor(){

  const cor =
    localStorage.getItem(
      "africanmundo-cor"
    );

  if(cor){

    document.documentElement
      .style
      .setProperty(
        "--p",
        cor
      );

  }
}

function alterarCor(){

  const cores = [
    "#168a45",
    "#1976d2",
    "#8e24aa",
    "#e65100",
    "#c62828"
  ];

  const atual =
    getComputedStyle(
      document.documentElement
    )
    .getPropertyValue(
      "--p"
    )
    .trim();

  let indice =
    cores.indexOf(atual);

  indice++;

  if(
    indice >=
    cores.length
  ){
    indice = 0;
  }

  const novaCor =
    cores[indice];

  document.documentElement
    .style
    .setProperty(
      "--p",
      novaCor
    );

  localStorage.setItem(
    "africanmundo-cor",
    novaCor
  );
}

/* =====================================================
   REDES SOCIAIS
===================================================== */

const REDES_SOCIAIS = {

  google:
    "https://www.google.com/",

  facebook:
    "https://www.facebook.com/",

  instagram:
    "https://www.instagram.com/",

  youtube:
    "https://www.youtube.com/",

  whatsapp:
    "https://www.whatsapp.com/",

  tiktok:
    "https://www.tiktok.com/"

};

function abrirRede(rede){

  const nome =
    norm(rede);

  const url =
    REDES_SOCIAIS[nome];

  if(!url){

    console.warn(
      "Rede desconhecida:",
      rede
    );

    return false;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

  return true;
       }

/* =====================================================
   PARTILHAR
===================================================== */

async function partilharNoticia(){

  const dados = {

    title:
      document.title,

    text:
      "Confira esta notícia no AfricanMundo.",

    url:
      window.location.href

  };

  try{

    if(
      navigator.share
    ){

      await navigator.share(
        dados
      );

    }else{

      await navigator.clipboard
        .writeText(
          window.location.href
        );

      alert(
        "Link copiado com sucesso."
      );

    }

  }catch(e){

    console.log(
      "Partilha cancelada."
    );

  }
}

/* =====================================================
   BOTÕES
===================================================== */

function iniciarBotoes(){

  const notif =
    document.getElementById(
      "notificationBtn"
    );

  if(notif){

    notif.onclick =
      function(){

        mostrarNotificacoes();

      };

  }

  const tools =
    document.getElementById(
      "toolsBtn"
    );

  if(tools){

    tools.onclick =
      function(){

        mostrarFerramentas();

      };

  }

  const theme =
    document.getElementById(
      "themeBtn"
    );

  if(theme){

    theme.onclick =
      function(){

        alternarTema();

      };

  }

  const color =
    document.getElementById(
      "colorBtn"
    );

  if(color){

    color.onclick =
      function(){

        alterarCor();

      };

  }

  /*
    Compatibilidade com diferentes
    IDs usados no botão "Eu".
  */

  const idsEu = [
    "userBtn",
    "euBtn",
    "perfilBtn",
    "profileBtn"
  ];

  idsEu.forEach(
    id => {

      const botao =
        document.getElementById(id);

      if(botao){

        botao.onclick =
          function(){

            mostrarEu();

          };

      }

    }
  );

  const search =
    document.getElementById(
      "searchInput"
    );

  if(search){

    search.addEventListener(
      "keydown",
      function(e){

        if(
          e.key === "Enter"
        ){

          e.preventDefault();

          pesquisar();

        }

        if(
          e.key === "Escape"
        ){

          search.blur();

        }

      }
    );

  }

  const form =
    document.getElementById(
      "searchForm"
    );

  if(form){

    form.addEventListener(
      "submit",
      function(e){

        e.preventDefault();

        pesquisar();

      }
    );

  }
}

/* =====================================================
   ATALHOS DO TECLADO
===================================================== */

function iniciarAtalhos(){

  document.addEventListener(
    "keydown",
    function(e){

      /*
        ESC
      */

      if(
        e.key === "Escape"
      ){

        fecharModal();

        return;

      }

      /*
        CTRL + K
      */

      if(
        (e.ctrlKey ||
         e.metaKey) &&
        e.key.toLowerCase() === "k"
      ){

        e.preventDefault();

        focarPesquisa();

        return;

      }

      /*
        /
        Abrir pesquisa
      */

      if(
        e.key === "/" &&
        !["INPUT","TEXTAREA"]
          .includes(
            document.activeElement?.tagName
          )
      ){

        e.preventDefault();

        focarPesquisa();

        return;

      }

      /*
        T
        Alternar tema
      */

      if(
        e.key.toLowerCase() === "t" &&
        !["INPUT","TEXTAREA"]
          .includes(
            document.activeElement?.tagName
          )
      ){

        alternarTema();

      }

    }
  );
}

/* =====================================================
   MENU ATIVO
===================================================== */

function marcarMenuAtivo(){

  const links =
    document.querySelectorAll(
      "a[href]"
    );

  const atual =
    norm(
      new URLSearchParams(
        window.location.search
      ).get("categoria") ||
      "noticias"
    );

  links.forEach(
    link => {

      const href =
        link.getAttribute(
          "href"
        ) || "";

      const params =
        new URLSearchParams(
          href.split("?")[1] || ""
        );

      const categoria =
        norm(
          params.get(
            "categoria"
          ) || ""
        );

      if(
        categoria &&
        categoria === atual
      ){

        link.classList.add(
          "ativo"
        );

      }

    }
  );
}

/* =====================================================
   ATUALIZAÇÃO AUTOMÁTICA
===================================================== */

function atualizarNoticias(){

  carregarNoticias();

}

function iniciarAtualizacaoAutomatica(){

  if(timerAtualizacao){

    clearInterval(
      timerAtualizacao
    );

  }

  timerAtualizacao =
    setInterval(
      atualizarNoticias,
      3600000
    );
}

/* =====================================================
   ERRO
===================================================== */

function mostrarErroNoticias(
  erro
){

  console.error(
    "AfricanMundo:",
    erro
  );

  const ids = [

    "ultimas",
    "mocambique",
    "africa",
    "futebol",
    "desporto",
    "negocios",
    "entretenimento"

  ];

  ids.forEach(
    id => {

      const grid =
        document.getElementById(
          id
        );

      if(!grid) return;

      grid.innerHTML = `
        <p class="sem-noticias">
          Não foi possível carregar
          as notícias neste momento.
        </p>
      `;

    }
  );
}

/* =====================================================
   FECHAR MODAL AO CLICAR FORA
===================================================== */

document.addEventListener(
  "click",
  function(e){

    const modal =
      document.getElementById(
        "modal"
      );

    if(!modal) return;

    if(
      e.target === modal
    ){

      fecharModal();

    }

  }
);

/* =====================================================
   INICIAR AFRICANMUNDO
   ÚNICO PONTO DE INICIALIZAÇÃO
===================================================== */

async function iniciarAfricanMundo(){

  try{

    restaurarCor();

    iniciarTema();

    iniciarBotoes();

    iniciarAtalhos();

    marcarMenuAtivo();

    await carregarNoticias();

    iniciarAtualizacaoAutomatica();

    console.log(
      "AfricanMundo iniciado com sucesso."
    );

  }catch(e){

    console.error(
      "Erro ao iniciar AfricanMundo:",
      e
    );

  }
}

/* =====================================================
   INÍCIO
===================================================== */

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
