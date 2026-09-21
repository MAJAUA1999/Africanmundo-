/* =====================================================
   AFRICANMUNDO — APP.JS
   VERSÃO RÁPIDA E PROFISSIONAL
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

let noticias=[];
let indiceDestaque=0;
let timerDestaque=null;

const FALLBACK_IMG=
"data:image/svg+xml;charset=UTF-8,"+
"<svg xmlns='http://www.w3.org/2000/svg' "+
"width='1200' height='675'>"+
"<rect width='100%' height='100%' fill='%23168a45'/>"+
"<text x='50%' y='50%' "+
"dominant-baseline='middle' "+
"text-anchor='middle' "+
"fill='white' font-size='42' "+
"font-family='Arial'>"+
"AfricanMundo"+
"</text></svg>";

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

function imagem(n){

  const campos = [
    n?.imagem,
    n?.image,
    n?.url_imagem,
    n?.imagem_url
  ];

  for(const valor of campos){

    if(
      valor &&
      typeof valor === "string" &&
      valor.trim() !== ""
    ){

      return valor.trim();

    }

  }

  return FALLBACK_IMG;

}

function data(n){

if(!n?.data)return "";

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

function imagemGerada(){

return FALLBACK_IMG;

}


/* =====================================================
   CARD
===================================================== */
function card(n){

  const el =
    document.createElement("article");

  el.className = "card";

  const img =
    imagem(n);

  const tit =
    titulo(n);

  const cat =
    n?.subcategoria ||
    n?.categoria ||
    "Notícias";

  el.innerHTML = `

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

  el.onclick =
    function(){

      abrirNoticia(n.id);

    };

  const imgEl =
    el.querySelector("img");

  if(imgEl){

    imgEl.onerror =
      function(){

        this.onerror = null;

        this.src = FALLBACK_IMG;

      };

  }

  return el;

}

/* =====================================================
   LISTA
===================================================== */

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

grid.appendChild(
card(n)
);

});

}


/* =====================================================
   DESTAQUE
===================================================== */

function destacar(arr){

if(!arr||!arr.length)
return null;

if(indiceDestaque>=arr.length)
indiceDestaque=0;

return arr[indiceDestaque];

}

function mostrarDestaque(){

  const box =
    document.getElementById("destaque");

  if(!box || !noticias.length)
    return;


  const n =
    destacar(noticias);

  if(!n) return;


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
      >

      <div class="destaque-overlay">

        <div class="destaque-categoria">
          🌍 ${esc(
            n.subcategoria ||
            n.categoria ||
            "Notícias"
          )}
        </div>

        <h2>
          ${esc(titulo(n))}
        </h2>

        ${
          resumo
          ? `<p>${esc(resumo)}...</p>`
          : ""
        }

        <div class="destaque-data">
          ${esc(data(n))}
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

        this.src = FALLBACK_IMG;

      };

  }

}


/* =====================================================
   CARREGAR NOTÍCIAS
===================================================== */
async function carregarNoticias(){

  if(!db){

    mostrarErroNoticias(
      "Supabase não inicializado"
    );

    return;

  }

  try{

    const pedido =
      db
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
        {ascending:false}
      )
      .limit(200);


    const limite =
      new Promise((_,reject)=>{

        setTimeout(
          ()=>{

            reject(
              new Error(
                "Tempo de carregamento excedido"
              )
            );

          },
          8000
        );

      });


    const resultado =
      await Promise.race([
        pedido,
        limite
      ]);


    if(resultado.error){

      throw resultado.error;

    }


    noticias =
      resultado.data || [];


    if(!noticias.length){

      mostrarErroNoticias(
        "Nenhuma notícia encontrada"
      );

      return;

    }


    indiceDestaque =
      Math.floor(
        Math.random() *
        noticias.length
      );


    mostrarDestaque();


    lista(
      noticias.slice(0,4),
      "ultimas"
    );


    lista(
      filtrar("mocambique")
      .slice(0,4),
      "mocambique"
    );


    lista(
      filtrar("africa")
      .slice(0,4),
      "africa"
    );


    lista(
      filtrar("futebol")
      .slice(0,4),
      "futebol"
    );


    lista(
      filtrar("desporto")
      .slice(0,4),
      "desporto"
    );


    lista(
      filtrar("negocios")
      .slice(0,4),
      "negocios"
    );


    lista(
      filtrar("entretenimento")
      .slice(0,4),
      "entretenimento"
    );


    iniciarRotacaoDestaque();


  }catch(e){

    console.error(
      "Erro ao carregar notícias:",
      e
    );

    mostrarErroNoticias(e);

  }

       }

/* =========================================================
   FILTROS POR CATEGORIA
========================================================= */
function filtrar(tipo){

  const t = norm(tipo);

  return noticias.filter(n => {

    const cat =
      norm(n?.categoria);

    const sub =
      norm(n?.subcategoria);

    const pais =
      norm(n?.pais);


    /* =========================
       MOÇAMBIQUE
    ========================= */

    if(t === "mocambique"){

      return (
        cat === "mocambique" ||
        pais === "mocambique"
      );

    }


    /* =========================
       ÁFRICA
    ========================= */

    if(t === "africa"){

      return (
        cat === "africa" ||
        (
          pais &&
          pais !== "mocambique"
        )
      );

    }


    /* =========================
       FUTEBOL
    ========================= */

    if(t === "futebol"){

      return (
        cat === "futebol" ||
        sub === "futebol"
      );

    }


    /* =========================
       DESPORTO
    ========================= */

    if(t === "desporto"){

      if(
        cat === "futebol" ||
        sub === "futebol"
      ){

        return false;

      }

      return (
        cat === "desporto" ||
        sub === "desporto"
      );

    }


    /* =========================
       NEGÓCIOS
    ========================= */

    if(t === "negocios"){

      return (
        cat === "negocios" ||
        sub === "negocios" ||
        sub === "economia"
      );

    }


    /* =========================
       ENTRETENIMENTO
    ========================= */

    if(t === "entretenimento"){

      return (
        cat === "entretenimento" ||
        sub === "entretenimento" ||
        sub === "cultura"
      );

    }


    /* =========================
       NOTÍCIAS
    ========================= */

    if(
      t === "noticias" ||
      t === "noticia"
    ){

      return true;

    }


    return false;

  });

}

/* =========================================================
   DESTAQUE — ROTAÇÃO AUTOMÁTICA
========================================================= */

function iniciarRotacaoDestaque(){

  if(timerDestaque){

    clearInterval(timerDestaque);

  }


  timerDestaque = setInterval(function(){

    if(!noticias.length) return;


    indiceDestaque++;

    if(
      indiceDestaque >= noticias.length
    ){

      indiceDestaque = 0;

    }


    mostrarDestaque();

  },10000);

}


/* =========================================================
   ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(id){

  if(!id) return;

  window.location.href =
    `noticia.html?id=${encodeURIComponent(id)}`;

}


/* =========================================================
   PESQUISA
========================================================= */

function pesquisar(){

  const campo =
    document.getElementById("searchInput");

  if(!campo) return;


  const termo =
    norm(campo.value);

  if(!termo){

    carregarNoticias();

    return;

  }


  const resultados =
    noticias.filter(n => {

      const textoBusca =
        norm(
          `${n?.titulo || ""} ${n?.texto || ""} ${n?.categoria || ""} ${n?.subcategoria || ""}`
        );

      return textoBusca.includes(termo);

    });


  lista(
    resultados.slice(0,30),
    "ultimas"
  );


  const titulo =
    document.getElementById("categoryTitle");

  if(titulo){

    titulo.textContent =
      `Pesquisa: ${campo.value}`;

  }

         }

/* =========================================================
   MODAL
========================================================= */

function abrirModal(titulo,conteudo){

  const modal =
    document.getElementById("modal");

  const modalTitle =
    document.getElementById("modalTitle");

  const modalBody =
    document.getElementById("modalBody");

  if(!modal) return;

  if(modalTitle)
    modalTitle.textContent = titulo;

  if(modalBody)
    modalBody.innerHTML = conteudo;

  modal.classList.add("ativo");

  modal.style.display = "flex";
}


function fecharModal(){

  const modal =
    document.getElementById("modal");

  if(!modal) return;

  modal.classList.remove("ativo");

  modal.style.display = "none";
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
        Notícias recentes de Moçambique,
        África e do mundo.
      </p>

      <p>
        O conteúdo é atualizado
        automaticamente.
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
   TEMA
========================================================= */

function iniciarTema(){

  const tema =
    localStorage.getItem("africanmundo-tema");

  if(tema === "dark"){

    document.body.classList.add("dark");

  }else{

    document.body.classList.remove("dark");

  }

}


function alternarTema(){

  document.body.classList.toggle("dark");

  const ativo =
    document.body.classList.contains("dark");

  localStorage.setItem(
    "africanmundo-tema",
    ativo ? "dark" : "light"
  );

}


/* =========================================================
   CORES
========================================================= */

function restaurarCor(){

  const cor =
    localStorage.getItem("africanmundo-cor");

  if(cor){

    document.documentElement
      .style
      .setProperty("--p",cor);

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
    .getPropertyValue("--p")
    .trim();

  let indice =
    cores.indexOf(atual);

  indice++;

  if(indice >= cores.length)
    indice = 0;

  const novaCor =
    cores[indice];

  document.documentElement
    .style
    .setProperty("--p",novaCor);

  localStorage.setItem(
    "africanmundo-cor",
    novaCor
  );

}


/* =========================================================
   REDES SOCIAIS
========================================================= */

const REDES_SOCIAIS = {

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
      "Rede social desconhecida:",
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


/* =========================================================
   PARTILHAR
========================================================= */

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

      await navigator.share(dados);

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

/* =========================================================
   MENU / BOTÕES
========================================================= */

function iniciarBotoes(){

  const notif =
    document.getElementById(
      "notificationBtn"
    );

  if(notif){

    notif.onclick =
      mostrarNotificacoes;

  }


  const tools =
    document.getElementById(
      "toolsBtn"
    );

  if(tools){

    tools.onclick =
      mostrarFerramentas;

  }


  const theme =
    document.getElementById(
      "themeBtn"
    );

  if(theme){

    theme.onclick =
      alternarTema;

  }


  const color =
    document.getElementById(
      "colorBtn"
    );

  if(color){

    color.onclick =
      alterarCor;

  }


  const search =
    document.getElementById(
      "searchInput"
    );

  if(search){

    search.addEventListener(
      "keydown",
      function(e){

        if(e.key === "Enter"){

          pesquisar();

        }

      }
    );

  }

}


/* =========================================================
   MENU ATIVO
========================================================= */

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


  links.forEach(link => {

    const href =
      link.getAttribute("href") || "";

    const params =
      new URLSearchParams(
        href.split("?")[1] || ""
      );

    const categoria =
      norm(
        params.get("categoria") ||
        ""
      );


    if(categoria && categoria === atual){

      link.classList.add(
        "ativo"
      );

    }

  });

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

function atualizarNoticias(){

  carregarNoticias();

}


function iniciarAtualizacaoAutomatica(){

  setInterval(
    atualizarNoticias,
    3600000
  );

}


/* =========================================================
   ERRO DE NOTÍCIAS
========================================================= */

function mostrarErroNoticias(erro){

  console.error(
    "Erro:",
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


  ids.forEach(id => {

    const grid =
      document.getElementById(id);

    if(!grid) return;


    grid.innerHTML = `
      <p class="sem-noticias">
        Não foi possível carregar
        as notícias.
      </p>
    `;

  });

}


/* =========================================================
   FECHAR MODAL
========================================================= */

document.addEventListener(
  "click",
  function(e){

    const modal =
      document.getElementById("modal");

    if(!modal) return;


    if(
      e.target === modal
    ){

      fecharModal();

    }

  }
);


/* =========================================================
   INICIAR AFRICANMUNDO
========================================================= */

async function iniciarAfricanMundo(){

  try{

    restaurarCor();

    iniciarTema();

    iniciarBotoes();

    marcarMenuAtivo();

    carregarNoticias();

iniciarAtualizacaoAutomatica();
     
  }catch(e){

    console.error(
      "Erro ao iniciar AfricanMundo:",
      e
    );

  }

}


/* =========================================================
   INÍCIO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function(){

    iniciarAfricanMundo();

  }
);
