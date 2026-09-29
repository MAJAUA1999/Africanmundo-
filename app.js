/* =========================================================
   AFRICANMUNDO — APP.JS
   VERSÃO CORRIGIDA
========================================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db =
  window.supabase?.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   ESTADO
========================================================= */

let noticias = [];
let indiceDestaque = 0;
let timerDestaque = null;
let timerAtualizacao = null;
let canalNoticias = null;
let ultimaAtualizacaoRealtime = 0;
let pesquisaAberta = false;
let africanMundoIniciado = false;


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1200&q=75";

const LIMITE_ULTIMAS = 10;
const LIMITE_CATEGORIA = 6;


/* =========================================================
   NORMALIZAR
========================================================= */

function norm(valor){

  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim();

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function esc(valor){

  return String(valor ?? "")
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* =========================================================
   TÍTULO
========================================================= */

function titulo(noticia){

  return String(
    noticia?.titulo ||
    noticia?.title ||
    "Sem título"
  ).trim();

}


/* =========================================================
   TEXTO
========================================================= */

function texto(noticia){

  return String(
    noticia?.texto ||
    noticia?.descricao ||
    noticia?.description ||
    ""
  )
  .replace(/<[^>]*>/g," ")
  .replace(/&nbsp;/gi," ")
  .replace(/\s+/g," ")
  .trim();

}


/* =========================================================
   DATA
========================================================= */

function dataNumero(noticia){

  const valor =
    noticia?.data ||
    noticia?.created_at ||
    noticia?.published_at ||
    "";

  const numero =
    new Date(valor).getTime();

  return Number.isFinite(numero)
    ? numero
    : 0;

}


function data(noticia){

  const valor =
    noticia?.data ||
    noticia?.created_at ||
    noticia?.published_at ||
    "";

  if(!valor) return "";

  const d =
    new Date(valor);

  if(Number.isNaN(d.getTime())){
    return "";
  }

  try{

    return d.toLocaleDateString(
      "pt-MZ",
      {
        day:"2-digit",
        month:"2-digit",
        year:"numeric"
      }
    );

  }catch(e){

    return d.toLocaleDateString();

  }

}


/* =========================================================
   IMAGEM
========================================================= */

function imagem(noticia){

  const original =
    String(
      noticia?.imagem || ""
    ).trim();

  return original || FALLBACK_IMG;

}


function possuiImagem(noticia){

  return !!String(
    noticia?.imagem || ""
  ).trim();

}


/* =========================================================
   CATEGORIA
========================================================= */

function categoriaTexto(noticia){

  const sub =
    String(
      noticia?.subcategoria || ""
    ).trim();

  const cat =
    String(
      noticia?.categoria || ""
    ).trim();

  return sub || cat || "Atualidades";

}


/* =========================================================
   RESUMO
========================================================= */

function resumo(
  noticia,
  limite = 180
){

  const t =
    texto(noticia);

  if(!t) return "";

  if(t.length <= limite){
    return t;
  }

  return (
    t.substring(0,limite)
      .replace(/\s+\S*$/,"")
      .trim() +
    "..."
  );

}


/* =========================================================
   ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(id){

  if(!id) return;

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}


/* =========================================================
   CARTÃO
========================================================= */

function card(noticia){

  if(!noticia) return "";

  const id =
    noticia.id;

  const tituloNoticia =
    titulo(noticia);

  const img =
    imagem(noticia);

  const cat =
    categoriaTexto(noticia);

  const resumoNoticia =
    resumo(noticia,130);

  const dataNoticia =
    data(noticia);

  const fonte =
    String(
      noticia.fonte || ""
    ).trim();


  return `
    <article
      class="news-card"
      data-id="${esc(id)}"
      tabindex="0"
      role="article"
      onclick="abrirNoticia('${esc(id)}')"
      onkeydown="if(event.key==='Enter')abrirNoticia('${esc(id)}')"
    >

      <div class="news-card-image">

        <img
          src="${esc(img)}"
          alt="${esc(tituloNoticia)}"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null;this.src='${esc(FALLBACK_IMG)}';"
        >

      </div>

      <div class="news-card-body">

        <div class="news-card-meta">

          <span>
            ${esc(cat)}
          </span>

          ${
            dataNoticia
              ? `<time>${esc(dataNoticia)}</time>`
              : ""
          }

        </div>

        <h3>
          ${esc(tituloNoticia)}
        </h3>

        ${
          resumoNoticia
            ? `<p>${esc(resumoNoticia)}</p>`
            : ""
        }

        ${
          fonte
            ? `<small>${esc(fonte)}</small>`
            : ""
        }

      </div>

    </article>
  `;

}


/* =========================================================
   LISTA
========================================================= */

function lista(
  dados,
  elemento
){

  const grid =
    document.getElementById(
      elemento
    );

  if(!grid) return;


  if(
    !Array.isArray(dados) ||
    !dados.length
  ){

    grid.innerHTML = `
      <div class="sem-noticias">
        <span>📰</span>
        <p>Não há notícias disponíveis nesta secção.</p>
      </div>
    `;

    return;

  }


  grid.innerHTML =
    dados.map(card).join("");


  grid
    .querySelectorAll("img")
    .forEach(function(img){

      img.loading = "lazy";
      img.decoding = "async";

    });

}


/* =========================================================
   ERRO
========================================================= */

function mostrarErroNoticias(erro){

  console.error(
    "AfricanMundo — erro:",
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


  ids.forEach(function(id){

    const el =
      document.getElementById(id);

    if(
      el &&
      !el.innerHTML.trim()
    ){

      el.innerHTML = `
        <div class="sem-noticias">
          <span>⚠️</span>
          <p>Não foi possível carregar as notícias.</p>
          <button onclick="carregarNoticias()">
            Tentar novamente
          </button>
        </div>
      `;

    }

  });

}


/* =========================================================
   DESTAQUE
========================================================= */

function mostrarDestaque(){

  const area =
    document.getElementById(
      "destaque"
    );

  if(!area) return;


  if(!noticias.length){

    area.innerHTML = `
      <div class="sem-noticias">
        <p>Carregando notícias...</p>
      </div>
    `;

    return;

  }


  if(
    indiceDestaque < 0 ||
    indiceDestaque >= noticias.length
  ){

    indiceDestaque = 0;

  }


  const n =
    noticias[indiceDestaque];

  const img =
    imagem(n);

  const cat =
    categoriaTexto(n);

  const tit =
    titulo(n);

  const resumoNoticia =
    resumo(n,180);

  const dataNoticia =
    data(n);


  area.innerHTML = `
    <article
      class="destaque-card"
      onclick="abrirNoticia('${esc(n.id)}')"
      tabindex="0"
      role="article"
      onkeydown="if(event.key==='Enter')abrirNoticia('${esc(n.id)}')"
    >

      <img
        src="${esc(img)}"
        alt="${esc(tit)}"
        class="destaque-imagem"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        referrerpolicy="no-referrer"
        onerror="this.onerror=null;this.src='${esc(FALLBACK_IMG)}';"
      >

      <div class="destaque-overlay">

        <div class="destaque-categoria">
          ${esc(cat)}
        </div>

        <h2>
          ${esc(tit)}
        </h2>

        ${
          resumoNoticia
            ? `<p>${esc(resumoNoticia)}</p>`
            : ""
        }

        ${
          dataNoticia
            ? `<time>${esc(dataNoticia)}</time>`
            : ""
        }

      </div>

    </article>
  `;

}


/* =========================================================
   ROTAÇÃO
========================================================= */

function iniciarDestaque(){

  if(timerDestaque){

    clearInterval(
      timerDestaque
    );

    timerDestaque = null;

  }


  if(noticias.length < 2){
    return;
  }


  timerDestaque =
    setInterval(function(){

      if(
        document.visibilityState !==
        "visible"
      ){

        return;

      }


      indiceDestaque++;


      if(
        indiceDestaque >=
        noticias.length
      ){

        indiceDestaque = 0;

      }


      mostrarDestaque();

    },10000);

}


/* =========================================================
   BUSCAR CATEGORIA
========================================================= */

async function buscarCategoria(
  categoria,
  elemento,
  limite = LIMITE_CATEGORIA
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


    if(resultado.error){

      console.error(
        `Erro em ${categoria}:`,
        resultado.error
      );

      lista([],elemento);

      return [];

    }


    const dados =
      Array.isArray(resultado.data)
        ? resultado.data
        : [];


    dados.sort(function(a,b){

      const dataA =
        dataNumero(a);

      const dataB =
        dataNumero(b);


      if(dataA !== dataB){

        return dataB - dataA;

      }


      return (
        Number(b.id || 0) -
        Number(a.id || 0)
      );

    });


    lista(
      dados,
      elemento
    );


    console.log(
      `AfricanMundo — ${categoria}:`,
      dados.length,
      "notícias."
    );


    return dados;

  }catch(e){

    console.error(
      `Erro ao buscar ${categoria}:`,
      e
    );

    lista([],elemento);

    return [];

  }

}


/* =========================================================
   CARREGAR NOTÍCIAS
========================================================= */

async function carregarNoticias(){

  if(!db){

    mostrarErroNoticias(
      "Supabase não inicializado."
    );

    return;

  }


  try{

    console.log(
      "AfricanMundo — carregando notícias..."
    );


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


    if(todas.error){

      throw todas.error;

    }


    noticias =
      Array.isArray(todas.data)
        ? todas.data
        : [];


    noticias.sort(function(a,b){

      const dataA =
        dataNumero(a);

      const dataB =
        dataNumero(b);


      if(dataA !== dataB){

        return dataB - dataA;

      }


      return (
        Number(b.id || 0) -
        Number(a.id || 0)
      );

    });


    indiceDestaque = 0;

    mostrarDestaque();

    iniciarDestaque();


    lista(
      noticias.slice(
        0,
        LIMITE_ULTIMAS
      ),
      "ultimas"
    );


    await Promise.allSettled([

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
      "AfricanMundo — página inicial carregada:",
      noticias.length,
      "notícias."
    );


  }catch(e){

    mostrarErroNoticias(e);

  }

      }

/* =========================================================
   PESQUISA
========================================================= */

function prepararTermoPesquisa(valor){

  return String(valor || "")
    .trim()
    .replace(/\\/g," ")
    .replace(/,/g," ")
    .replace(/\(/g," ")
    .replace(/\)/g," ")
    .replace(/%/g," ")
    .replace(/_/g," ")
    .replace(/\s+/g," ")
    .trim();

}


async function pesquisar(){

  const campo =
    document.getElementById("searchInput") ||
    document.getElementById("pesquisa") ||
    document.querySelector('input[type="search"]');


  if(!campo) return;


  const termo =
    String(campo.value || "").trim();


  if(!termo){

    mostrarMensagem(
      "Digite algo para pesquisar."
    );

    return;

  }


  if(!db){

    mostrarMensagem(
      "Pesquisa temporariamente indisponível."
    );

    return;

  }


  mostrarPesquisaCarregando();


  try{

    const termoSeguro =
      prepararTermoPesquisa(termo);


    if(!termoSeguro){

      mostrarMensagem(
        "Digite um termo válido para pesquisar."
      );

      return;

    }


    const resposta =
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
          idioma,
          visualizacoes,
          pais
        `)
        .or([
          `titulo.ilike.%${termoSeguro}%`,
          `texto.ilike.%${termoSeguro}%`,
          `categoria.ilike.%${termoSeguro}%`,
          `subcategoria.ilike.%${termoSeguro}%`,
          `pais.ilike.%${termoSeguro}%`,
          `fonte.ilike.%${termoSeguro}%`
        ].join(","))
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


    if(resposta.error){

      throw resposta.error;

    }


    let resultados =
      Array.isArray(resposta.data)
        ? resposta.data
        : [];


    const termoNormalizado =
      norm(termo);


    resultados =
      resultados.filter(function(n){

        const textoBusca =
          norm([
            n.titulo,
            n.texto,
            n.categoria,
            n.subcategoria,
            n.pais,
            n.fonte
          ].join(" "));


        return textoBusca.includes(
          termoNormalizado
        );

      });


    mostrarResultadosPesquisa(
      resultados,
      termo
    );


  }catch(e){

    console.error(
      "AfricanMundo — erro na pesquisa:",
      e
    );


    mostrarMensagem(
      "Não foi possível realizar a pesquisa."
    );

  }

}


/* =========================================================
   PESQUISA — ENTER
========================================================= */

function pesquisarTecla(event){

  if(
    event &&
    event.key === "Enter"
  ){

    event.preventDefault();

    pesquisar();

  }

}


/* =========================================================
   ABRIR PESQUISA
========================================================= */

function abrirPesquisa(){

  pesquisaAberta = true;


  const campo =
    document.getElementById(
      "searchInput"
    ) ||
    document.querySelector(
      'input[type="search"]'
    );


  if(campo){

    window.scrollTo({
      top:0,
      behavior:"smooth"
    });


    setTimeout(function(){

      campo.focus();
      campo.select();

    },250);

  }else{

    mostrarMensagem(
      "Campo de pesquisa não encontrado."
    );

  }

}


/* =========================================================
   RESULTADOS DA PESQUISA
========================================================= */

function mostrarResultadosPesquisa(
  resultados,
  termo
){

  const container =
    document.getElementById(
      "searchResults"
    ) ||
    document.getElementById(
      "resultadosPesquisa"
    );


  if(container){

    if(!resultados.length){

      container.innerHTML = `

        <div class="sem-noticias">

          <span>🔎</span>

          <h3>
            Nenhum resultado
          </h3>

          <p>
            Não encontramos notícias para
            “${esc(termo)}”.
          </p>

        </div>

      `;


      container.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });


      return;

    }


    container.innerHTML = `

      <div class="search-header">

        <strong>
          ${resultados.length}
          resultado(s)
        </strong>

        <span>
          para “${esc(termo)}”
        </span>

      </div>

      <div class="search-grid">

        ${
          resultados
            .map(card)
            .join("")
        }

      </div>

    `;


    container.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });


    return;

  }


  mostrarModal(`

    <div class="modal-header">

      <h2>
        🔎 Pesquisa
      </h2>

      <button
        class="modal-close"
        onclick="fecharModal()"
        aria-label="Fechar"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <p>
        Resultados para:
        <strong>
          ${esc(termo)}
        </strong>
      </p>


      ${
        resultados.length
          ? `
            <div class="search-grid">
              ${
                resultados
                  .slice(0,30)
                  .map(card)
                  .join("")
              }
            </div>
          `
          : `
            <div class="sem-noticias">
              <span>🔎</span>
              <p>
                Nenhuma notícia encontrada.
              </p>
            </div>
          `
      }

    </div>

  `);

}


/* =========================================================
   PESQUISA CARREGANDO
========================================================= */

function mostrarPesquisaCarregando(){

  const container =
    document.getElementById(
      "searchResults"
    ) ||
    document.getElementById(
      "resultadosPesquisa"
    );


  if(container){

    container.innerHTML = `

      <div class="sem-noticias">

        <span>🔎</span>

        <p>
          Pesquisando notícias...
        </p>

      </div>

    `;

    return;

  }


  mostrarModal(`

    <div class="modal-header">

      <h2>
        🔎 Pesquisa
      </h2>

      <button
        class="modal-close"
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <div class="sem-noticias">

        <span>🔎</span>

        <p>
          Pesquisando notícias...
        </p>

      </div>

    </div>

  `);

}


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(
  mensagem
){

  mostrarModal(`

    <div class="modal-header">

      <h2>
        ℹ️ AfricanMundo
      </h2>

      <button
        class="modal-close"
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <p>
        ${esc(mensagem)}
      </p>

    </div>

  `);

}


/* =========================================================
   ATUALIZAÇÃO
========================================================= */

function atualizarNoticias(){

  console.log(
    "AfricanMundo — verificando novas notícias..."
  );

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
      300000
    );


  console.log(
    "AfricanMundo — atualização automática ativa."
  );

}


/* =========================================================
   REALTIME
========================================================= */

function iniciarRealtimeNoticias(){

  if(!db){

    console.warn(
      "AfricanMundo — Supabase indisponível."
    );

    return;

  }


  if(canalNoticias){

    return;

  }


  try{

    canalNoticias =
      db
        .channel(
          "africanmundo-noticias"
        )

        .on(
          "postgres_changes",
          {
            event:"INSERT",
            schema:"public",
            table:"noticias"
          },

          function(payload){

            console.log(
              "📰 AfricanMundo — nova notícia:",
              payload.new
            );


            const agora =
              Date.now();


            if(
              agora -
              ultimaAtualizacaoRealtime
              < 3000
            ){

              return;

            }


            ultimaAtualizacaoRealtime =
              agora;


            setTimeout(
              function(){

                carregarNoticias();

              },
              1200
            );

          }
        )

        .on(
          "postgres_changes",
          {
            event:"UPDATE",
            schema:"public",
            table:"noticias"
          },

          function(){

            console.log(
              "AfricanMundo — notícia atualizada."
            );

          }
        )

        .subscribe(
          function(status,erro){

            console.log(
              "AfricanMundo — Realtime:",
              status
            );


            if(
              status === "CHANNEL_ERROR" ||
              status === "TIMED_OUT"
            ){

              console.warn(
                "AfricanMundo — Realtime indisponível.",
                erro
              );

            }

          }
        );


  }catch(e){

    console.warn(
      "AfricanMundo — erro no Realtime:",
      e
    );

  }

}


/* =========================================================
   MODAL
========================================================= */

function mostrarModal(
  conteudo
){

  let modal =
    document.getElementById(
      "africanmundoModal"
    );


  if(!modal){

    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "africanmundoModal";


    modal.className =
      "africanmundo-modal";


    modal.innerHTML = `

      <div
        class="modal-backdrop"
        onclick="fecharModal()"
      ></div>

      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
      ></div>

    `;


    document.body.appendChild(
      modal
    );

  }


  const content =
    modal.querySelector(
      ".modal-content"
    );


  if(content){

    content.innerHTML =
      conteudo;

  }


  /*
    Força o painel para
    cima de toda a página.
  */

  modal.style.position =
    "fixed";

  modal.style.inset =
    "0";

  modal.style.width =
    "100%";

  modal.style.height =
    "100%";

  modal.style.zIndex =
    "99999";

  modal.style.display =
    "block";


  const backdrop =
    modal.querySelector(
      ".modal-backdrop"
    );


  if(backdrop){

    backdrop.style.position =
      "absolute";

    backdrop.style.inset =
      "0";

  }


  const modalContent =
    modal.querySelector(
      ".modal-content"
    );


  if(modalContent){

    modalContent.style.position =
      "relative";

    modalContent.style.zIndex =
      "2";

    modalContent.style.maxHeight =
      "90vh";

    modalContent.style.overflowY =
      "auto";

  }


  modal.classList.add(
    "ativo"
  );


  document.body.classList.add(
    "modal-aberto"
  );


  setTimeout(function(){

    const primeiro =
      modal.querySelector(
        "button,input"
      );


    if(primeiro){

      primeiro.focus();

    }

  },50);

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal(){

  const modal =
    document.getElementById(
      "africanmundoModal"
    );


  if(modal){

    modal.classList.remove(
      "ativo"
    );

    modal.style.display =
      "none";

  }


  document.body.classList.remove(
    "modal-aberto"
  );

}


/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function mostrarNotificacoes(){

  mostrarModal(`

    <div class="modal-header">

      <div>

        <span class="modal-kicker">
          AFRICANMUNDO
        </span>

        <h2>
          🔔 Notificações
        </h2>

      </div>


      <button
        class="modal-close"
        onclick="fecharModal()"
        aria-label="Fechar"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <div class="tool-item">

        <div class="tool-icon">
          📰
        </div>

        <div>

          <strong>
            Notícias atualizadas
          </strong>

          <p>
            O AfricanMundo verifica
            automaticamente novas notícias.
          </p>

        </div>

      </div>


      <div class="tool-item">

        <div class="tool-icon">
          ⚡
        </div>

        <div>

          <strong>
            Atualização automática
          </strong>

          <p>
            A página verifica novidades
            periodicamente e pode receber
            notícias em tempo real.
          </p>

        </div>

      </div>


      <div class="tool-item">

        <div class="tool-icon">
          🔔
        </div>

        <div>

          <strong>
            Notificações
          </strong>

          <p>
            O navegador pode solicitar
            permissão para receber novidades.
          </p>

        </div>

      </div>

    </div>

  `);

}


/* =========================================================
   FERRAMENTAS
========================================================= */

function mostrarFerramentas(){

  mostrarModal(`

    <div class="modal-header">

      <div>

        <span class="modal-kicker">
          AFRICANMUNDO
        </span>

        <h2>
          🛠️ Ferramentas
        </h2>

      </div>


      <button
        class="modal-close"
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body ferramentas-grid">


      <button
        class="tool-button"
        onclick="fecharModal();abrirPesquisa()"
      >

        <span>🔎</span>

        <strong>
          Pesquisar
        </strong>

        <small>
          Encontrar notícias
        </small>

      </button>


      <button
        class="tool-button"
        onclick="alternarTema();fecharModal()"
      >

        <span>🌙</span>

        <strong>
          Tema
        </strong>

        <small>
          Claro ou escuro
        </small>

      </button>


      <button
        class="tool-button"
        onclick="alterarCor()"
      >

        <span>🎨</span>

        <strong>
          Cor
        </strong>

        <small>
          Personalizar o site
        </small>

      </button>


      <button
        class="tool-button"
        onclick="atualizarNoticias();fecharModal()"
      >

        <span>🔄</span>

        <strong>
          Atualizar
        </strong>

        <small>
          Buscar notícias novas
        </small>

      </button>


      <button
        class="tool-button"
        onclick="partilharSite()"
      >

        <span>📤</span>

        <strong>
          Partilhar
        </strong>

        <small>
          Divulgar AfricanMundo
        </small>

      </button>


      <button
        class="tool-button"
        onclick="mostrarAtalhos()"
      >

        <span>⌨️</span>

        <strong>
          Atalhos
        </strong>

        <small>
          Comandos rápidos
        </small>

      </button>


    </div>

  `);

}


/* =========================================================
   EU
========================================================= */

function mostrarEu(){

  mostrarModal(`

    <div class="modal-header">

      <div>

        <span class="modal-kicker">
          AFRICANMUNDO
        </span>

        <h2>
          👤 Eu
        </h2>

      </div>


      <button
        class="modal-close"
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <div class="eu-card">

        <div class="eu-logo">
          🌍
        </div>

        <div>

          <h3>
            AfricanMundo
          </h3>

          <p>
            Notícias de África
          </p>

        </div>

      </div>


      <div class="eu-actions">

        <button
          onclick="fecharModal();abrirPesquisa()"
        >
          🔎
          <span>
            Pesquisar notícias
          </span>
        </button>


        <button
          onclick="mostrarNotificacoes()"
        >
          🔔
          <span>
            Notificações
          </span>
        </button>


        <button
          onclick="mostrarFerramentas()"
        >
          🛠️
          <span>
            Ferramentas
          </span>
        </button>


        <button
          onclick="partilharSite()"
        >
          📤
          <span>
            Partilhar AfricanMundo
          </span>
        </button>

      </div>


      <div class="eu-footer">

        <strong>
          A informação que liga África ao mundo
        </strong>

      </div>

    </div>

  `);

       }

/* =========================================================
   TEMA
========================================================= */

function temaAtual(){

  return (
    localStorage.getItem(
      "africanmundo-tema"
    ) || "claro"
  );

}


function aplicarTema(){

  const tema =
    temaAtual();


  if(tema === "escuro"){

    document.documentElement
      .classList.add("dark");

    document.body
      .classList.add("dark");

  }else{

    document.documentElement
      .classList.remove("dark");

    document.body
      .classList.remove("dark");

  }

}


function alternarTema(){

  const atual =
    temaAtual();


  const novo =
    atual === "escuro"
      ? "claro"
      : "escuro";


  localStorage.setItem(
    "africanmundo-tema",
    novo
  );


  aplicarTema();

}


/* =========================================================
   CORES
========================================================= */

const CORES =
  [
    "#168a45",
    "#1769aa",
    "#c62828",
    "#7b1fa2",
    "#ef6c00"
  ];


function corAtual(){

  return (
    localStorage.getItem(
      "africanmundo-cor"
    ) || CORES[0]
  );

}


function aplicarCor(){

  const cor =
    corAtual();


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


  document.documentElement
    .style.setProperty(
      "--cor-principal",
      cor
    );

}


function alterarCor(){

  let indice =
    CORES.indexOf(
      corAtual()
    );


  indice++;


  if(
    indice >=
    CORES.length
  ){

    indice = 0;

  }


  const cor =
    CORES[indice];


  localStorage.setItem(
    "africanmundo-cor",
    cor
  );


  aplicarCor();


  mostrarMensagem(
    "Cor principal alterada."
  );

}


/* =========================================================
   PAINEL DE CORES
========================================================= */

function mostrarCores(){

  const botoes =
    CORES.map(function(cor){

      const ativa =
        cor === corAtual();


      return `

        <button
          type="button"
          class="cor-opcao"
          title="Escolher cor"
          aria-label="Escolher cor"
          style="
            background:${esc(cor)};
          "
          onclick="
            escolherCor('${esc(cor)}')
          "
        >
          ${
            ativa
              ? "✓"
              : ""
          }
        </button>

      `;

    }).join("");


  mostrarModal(`

    <div class="modal-header">

      <div>

        <span class="modal-kicker">
          PERSONALIZAÇÃO
        </span>

        <h2>
          🎨 Cor do AfricanMundo
        </h2>

      </div>


      <button
        class="modal-close"
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <p>
        Escolha a cor principal do site.
      </p>


      <div class="cores-lista">

        ${botoes}

      </div>

    </div>

  `);

}


function escolherCor(cor){

  if(!cor) return;


  localStorage.setItem(
    "africanmundo-cor",
    cor
  );


  aplicarCor();


  fecharModal();

}


/* =========================================================
   PARTILHAR SITE
========================================================= */

async function partilharSite(){

  const dados = {

    title:
      "AfricanMundo — Notícias de África",

    text:
      "A informação que liga África ao mundo.",

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

      return;

    }


    if(
      navigator.clipboard &&
      window.isSecureContext
    ){

      await navigator.clipboard.writeText(
        window.location.href
      );


      mostrarMensagem(
        "Link do AfricanMundo copiado."
      );


      return;

    }


    mostrarModal(`

      <div class="modal-header">

        <h2>
          📤 Partilhar
        </h2>

        <button
          class="modal-close"
          onclick="fecharModal()"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        <p>
          Copie o endereço abaixo:
        </p>


        <input
          type="text"
          value="${esc(window.location.href)}"
          readonly
          onclick="this.select()"
        >

      </div>

    `);


  }catch(e){

    console.log(
      "Partilha cancelada:",
      e
    );

  }

}


/* =========================================================
   REDES SOCIAIS
========================================================= */

const REDES = {

  google:
    "https://www.google.com/search?q=AfricanMundo",

  facebook:
    "https://www.facebook.com/",

  youtube:
    "https://www.youtube.com/",

  whatsapp:
    "https://wa.me/?text=",

  instagram:
    "https://www.instagram.com/",

  tiktok:
    "https://www.tiktok.com/"

};


function abrirRede(
  rede
){

  const nome =
    norm(rede);


  if(
    nome === "whatsapp"
  ){

    const texto =
      encodeURIComponent(
        "AfricanMundo — Notícias de África " +
        window.location.href
      );


    window.open(
      REDES.whatsapp +
      texto,
      "_blank",
      "noopener,noreferrer"
    );


    return;

  }


  const url =
    REDES[nome];


  if(!url){

    console.warn(
      "Rede desconhecida:",
      rede
    );

    return;

  }


  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


/* =========================================================
   GOOGLE
========================================================= */

function abrirGoogle(){

  window.open(
    "https://www.google.com/search?q=" +
    encodeURIComponent(
      "AfricanMundo"
    ),
    "_blank",
    "noopener,noreferrer"
  );

}


/* =========================================================
   ATALHOS
========================================================= */

function mostrarAtalhos(){

  mostrarModal(`

    <div class="modal-header">

      <div>

        <span class="modal-kicker">
          AFRICANMUNDO
        </span>

        <h2>
          ⌨️ Atalhos
        </h2>

      </div>


      <button
        class="modal-close"
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body atalhos-lista">

      <div>

        <kbd>/</kbd>

        <span>
          Abrir pesquisa
        </span>

      </div>


      <div>

        <kbd>Esc</kbd>

        <span>
          Fechar painel
        </span>

      </div>


      <div>

        <kbd>T</kbd>

        <span>
          Alternar tema
        </span>

      </div>


      <div>

        <kbd>R</kbd>

        <span>
          Atualizar notícias
        </span>

      </div>

    </div>

  `);

}


/* =========================================================
   TECLADO
========================================================= */

function configurarTeclado(){

  document.addEventListener(
    "keydown",
    function(event){

      const alvo =
        event.target;


      const digitando =
        alvo &&
        (
          alvo.tagName === "INPUT" ||
          alvo.tagName === "TEXTAREA" ||
          alvo.isContentEditable
        );


      if(
        event.key === "Escape"
      ){

        fecharModal();

        return;

      }


      if(
        digitando
      ){

        return;

      }


      if(
        event.key === "/" ||
        event.key === "?"
      ){

        event.preventDefault();

        abrirPesquisa();

        return;

      }


      if(
        event.key.toLowerCase() === "t"
      ){

        alternarTema();

        return;

      }


      if(
        event.key.toLowerCase() === "r"
      ){

        atualizarNoticias();

        return;

      }

    }
  );

}


/* =========================================================
   BOTÕES DO CABEÇALHO
========================================================= */

function configurarBotoesTopo(){

  /*
    Usamos vários seletores para funcionar
    mesmo que o index.html tenha nomes
    diferentes nos botões.
  */


  const mapa = [

    {
      ids:[
        "btnNotificacao",
        "notificacaoBtn",
        "notificationBtn",
        "btn-notificacao"
      ],
      acao:
        mostrarNotificacoes
    },

    {
      ids:[
        "btnFerramentas",
        "ferramentasBtn",
        "toolsBtn",
        "btn-ferramentas"
      ],
      acao:
        mostrarFerramentas
    },

    {
      ids:[
        "btnEu",
        "euBtn",
        "userBtn",
        "btn-user"
      ],
      acao:
        mostrarEu
    },

    {
      ids:[
        "btnTema",
        "temaBtn",
        "themeBtn",
        "btn-tema"
      ],
      acao:
        alternarTema
    },

    {
      ids:[
        "btnCor",
        "corBtn",
        "colorBtn",
        "btn-cor"
      ],
      acao:
        mostrarCores
    },

    {
      ids:[
        "btnPesquisa",
        "pesquisaBtn",
        "searchBtn",
        "btn-pesquisa"
      ],
      acao:
        abrirPesquisa
    }

  ];


  mapa.forEach(function(item){

    item.ids.forEach(function(id){

      const elemento =
        document.getElementById(
          id
        );


      if(
        !elemento ||
        elemento.dataset.amConfigurado === "1"
      ){

        return;

      }


      elemento.dataset.amConfigurado =
        "1";


      elemento.addEventListener(
        "click",
        function(event){

          event.preventDefault();
          event.stopPropagation();

          item.acao();

        }
      );

    });

  });

}


/* =========================================================
   BOTÕES POR CLASSE / DATA
========================================================= */

function configurarBotoesData(){

  const elementos =
    document.querySelectorAll(
      "[data-am-action]"
    );


  elementos.forEach(function(el){

    if(
      el.dataset.amConfigurado === "1"
    ){

      return;

    }


    const acao =
      norm(
        el.dataset.amAction
      );


    let funcao =
      null;


    if(
      acao === "notificacao" ||
      acao === "notificacoes"
    ){

      funcao =
        mostrarNotificacoes;

    }

    else if(
      acao === "ferramenta" ||
      acao === "ferramentas"
    ){

      funcao =
        mostrarFerramentas;

    }

    else if(
      acao === "eu" ||
      acao === "usuario" ||
      acao === "user"
    ){

      funcao =
        mostrarEu;

    }

    else if(
      acao === "tema" ||
      acao === "theme"
    ){

      funcao =
        alternarTema;

    }

    else if(
      acao === "cor" ||
      acao === "color"
    ){

      funcao =
        mostrarCores;

    }

    else if(
      acao === "pesquisa" ||
      acao === "search"
    ){

      funcao =
        abrirPesquisa;

    }


    if(funcao){

      el.dataset.amConfigurado =
        "1";


      el.addEventListener(
        "click",
        function(event){

          event.preventDefault();
          event.stopPropagation();

          funcao();

        }
      );

    }

  });

}


/* =========================================================
   FORMULÁRIO DE PESQUISA
========================================================= */

function configurarPesquisa(){

  const campos =
    document.querySelectorAll(
      'input[type="search"],' +
      '#searchInput,' +
      '#pesquisa'
    );


  campos.forEach(function(campo){

    if(
      campo.dataset.amPesquisa === "1"
    ){

      return;

    }


    campo.dataset.amPesquisa =
      "1";


    campo.addEventListener(
      "keydown",
      pesquisarTecla
    );


    const formulario =
      campo.closest(
        "form"
      );


    if(formulario){

      formulario.addEventListener(
        "submit",
        function(event){

          event.preventDefault();

          pesquisar();

        }
      );

    }

  });


  const botoes =
    document.querySelectorAll(
      ".search-btn," +
      ".btn-search," +
      "[data-search-button]"
    );


  botoes.forEach(function(botao){

    if(
      botao.dataset.amPesquisaBotao === "1"
    ){

      return;

    }


    botao.dataset.amPesquisaBotao =
      "1";


    botao.addEventListener(
      "click",
      function(event){

        event.preventDefault();

        pesquisar();

      }
    );

  });

   }

/* =========================================================
   ANÚNCIOS ATIVOS
========================================================= */

async function carregarAnuncios(){

  const secao =
    document.getElementById(
      "anunciosAtivosSection"
    );

  const container =
    document.getElementById(
      "anunciosAtivos"
    );


  if(
    !secao ||
    !container ||
    !db
  ){

    return;

  }


  try{

    const agora =
      new Date().toISOString();


    const resposta =
      await db
        .from("pedidos_anuncios")
        .select("*")
        .eq(
          "status",
          "aprovado"
        )
        .lte(
          "data_inicio",
          agora
        )
        .gte(
          "data_fim",
          agora
        )
        .order(
          "id",
          {
            ascending:false
          }
        )
        .limit(20);


    if(resposta.error){

      console.warn(
        "AfricanMundo — anúncios:",
        resposta.error
      );

      return;

    }


    const anuncios =
      Array.isArray(
        resposta.data
      )
        ? resposta.data
        : [];


    if(!anuncios.length){

      container.innerHTML = "";

      secao.style.display =
        "none";

      return;

    }


    secao.style.display =
      "";


    container.innerHTML =
      anuncios
        .map(
          anuncioCard
        )
        .join("");


  }catch(e){

    console.warn(
      "AfricanMundo — erro nos anúncios:",
      e
    );

  }

}


/* =========================================================
   CARTÃO DE ANÚNCIO
========================================================= */

function anuncioCard(
  anuncio
){

  if(!anuncio) return "";


  const empresa =
    String(
      anuncio.empresa ||
      anuncio.responsavel ||
      "Anunciante"
    ).trim();


  const tipo =
    norm(
      anuncio.tipo ||
      anuncio.tipo_anuncio ||
      ""
    );


  const descricao =
    String(
      anuncio.descricao ||
      ""
    ).trim();


  const imagem =
    String(
      anuncio.imagem ||
      anuncio.imagem_url ||
      ""
    ).trim();


  const video =
    String(
      anuncio.video ||
      anuncio.video_url ||
      ""
    ).trim();


  const link =
    String(
      anuncio.url ||
      anuncio.link ||
      anuncio.url_destino ||
      ""
    ).trim();


  let conteudo =
    "";


  if(
    video
  ){

    conteudo = `

      <video
        class="anuncio-video"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
      >

        <source
          src="${esc(video)}"
        >

      </video>

    `;

  }

  else if(
    imagem
  ){

    conteudo = `

      <img
        class="anuncio-imagem"
        src="${esc(imagem)}"
        alt="${esc(empresa)}"
        loading="lazy"
        decoding="async"
        referrerpolicy="no-referrer"
      >

    `;

  }

  else{

    conteudo = `

      <div class="anuncio-sem-imagem">
        📢
      </div>

    `;

  }


  const corpo = `

    <div class="anuncio-media">

      ${conteudo}

    </div>


    <div class="anuncio-corpo">

      <small>
        PUBLICIDADE
      </small>

      <h3>
        ${esc(empresa)}
      </h3>

      ${
        descricao
          ? `
            <p>
              ${esc(
                resumo(
                  {
                    texto:
                      descricao
                  },
                  120
                )
              )}
            </p>
          `
          : ""
      }

      ${
        tipo
          ? `
            <span class="anuncio-tipo">
              ${esc(tipo)}
            </span>
          `
          : ""
      }

    </div>

  `;


  if(link){

    return `

      <a
        class="anuncio-card"
        href="${esc(link)}"
        target="_blank"
        rel="noopener noreferrer sponsored"
      >

        ${corpo}

      </a>

    `;

  }


  return `

    <article
      class="anuncio-card"
    >

      ${corpo}

    </article>

  `;

}


/* =========================================================
   PWA
========================================================= */

function iniciarPWA(){

  if(
    !("serviceWorker" in navigator)
  ){

    return;

  }


  window.addEventListener(
    "load",
    function(){

      navigator.serviceWorker
        .register(
          "./sw.js"
        )
        .then(
          function(registro){

            console.log(
              "AfricanMundo — Service Worker ativo:",
              registro.scope
            );

          }
        )
        .catch(
          function(erro){

            console.warn(
              "AfricanMundo — Service Worker:",
              erro
            );

          }
        );

    }
  );

}


/* =========================================================
   LINK DO MANIFEST
========================================================= */

function garantirManifest(){

  if(
    document.querySelector(
      'link[rel="manifest"]'
    )
  ){

    return;

  }


  const link =
    document.createElement(
      "link"
    );


  link.rel =
    "manifest";


  link.href =
    "./manifest.json";


  document.head.appendChild(
    link
  );

}


/* =========================================================
   META THEME COLOR
========================================================= */

function garantirThemeColor(){

  let meta =
    document.querySelector(
      'meta[name="theme-color"]'
    );


  if(!meta){

    meta =
      document.createElement(
        "meta"
      );


    meta.name =
      "theme-color";


    document.head.appendChild(
      meta
    );

  }


  meta.content =
    corAtual();

}


/* =========================================================
   CORRIGIR IMAGENS
========================================================= */

function protegerImagens(){

  document
    .querySelectorAll(
      "img"
    )
    .forEach(function(img){

      if(
        img.dataset.amProtegida === "1"
      ){

        return;

      }


      img.dataset.amProtegida =
        "1";


      img.addEventListener(
        "error",
        function(){

          if(
            this.dataset.amFallback === "1"
          ){

            return;

          }


          this.dataset.amFallback =
            "1";


          this.src =
            FALLBACK_IMG;

        }
      );

    });

}


/* =========================================================
   LIMPAR TEXTO SOLTO DA PÁGINA
========================================================= */

function protegerEstrutura(){

  /*
    Não removemos elementos do index.html.
    Apenas impedimos que textos soltos sejam
    transformados em blocos inesperados.
  */


  const corpo =
    document.body;


  if(!corpo){

    return;

  }


  corpo.classList.add(
    "africanmundo-app"
  );

}


/* =========================================================
   MENU MOBILE
========================================================= */

function configurarMenuMobile(){

  const botoes =
    document.querySelectorAll(
      "[data-menu-toggle]," +
      ".menu-toggle," +
      ".hamburger"
    );


  botoes.forEach(function(botao){

    if(
      botao.dataset.amMenu === "1"
    ){

      return;

    }


    botao.dataset.amMenu =
      "1";


    botao.addEventListener(
      "click",
      function(event){

        event.preventDefault();


        document.body.classList.toggle(
          "menu-aberto"
        );


        botao.classList.toggle(
          "ativo"
        );

      }
    );

  });


  document
    .querySelectorAll(
      "nav a, .menu a"
    )
    .forEach(function(link){

      link.addEventListener(
        "click",
        function(){

          document.body.classList.remove(
            "menu-aberto"
          );

        }
      );

    });

}


/* =========================================================
   FECHAR MENUS AO CLICAR FORA
========================================================= */

function configurarCliqueFora(){

  document.addEventListener(
    "click",
    function(event){

      if(
        !document.body.classList.contains(
          "menu-aberto"
        )
      ){

        return;

      }


      const menu =
        document.querySelector(
          "nav,.menu"
        );


      const botao =
        event.target.closest(
          ".menu-toggle," +
          ".hamburger," +
          "[data-menu-toggle]"
        );


      if(
        menu &&
        !menu.contains(event.target) &&
        !botao
      ){

        document.body.classList.remove(
          "menu-aberto"
        );

      }

    }
  );

}


/* =========================================================
   DESTAQUE — PAUSA AO PASSAR O DEDO/MOUSE
========================================================= */

function configurarDestaque(){

  const area =
    document.getElementById(
      "destaque"
    );


  if(!area){

    return;

  }


  area.addEventListener(
    "mouseenter",
    function(){

      if(timerDestaque){

        clearInterval(
          timerDestaque
        );

        timerDestaque =
          null;

      }

    }
  );


  area.addEventListener(
    "mouseleave",
    function(){

      iniciarDestaque();

    }
  );

}


/* =========================================================
   VISIBILIDADE DA PÁGINA
========================================================= */

function configurarVisibilidade(){

  document.addEventListener(
    "visibilitychange",
    function(){

      if(
        document.visibilityState ===
        "visible"
      ){

        if(
          noticias.length &&
          !timerDestaque
        ){

          iniciarDestaque();

        }

      }else{

        if(timerDestaque){

          clearInterval(
            timerDestaque
          );

          timerDestaque =
            null;

        }

      }

    }
  );

}


/* =========================================================
   BOTÃO VOLTAR AO TOPO
========================================================= */

function configurarTopo(){

  let botao =
    document.getElementById(
      "voltarTopo"
    );


  if(!botao){

    botao =
      document.createElement(
        "button"
      );


    botao.id =
      "voltarTopo";


    botao.type =
      "button";


    botao.setAttribute(
      "aria-label",
      "Voltar ao topo"
    );


    botao.textContent =
      "↑";


    botao.style.position =
      "fixed";


    botao.style.right =
      "18px";


    botao.style.bottom =
      "80px";


    botao.style.zIndex =
      "9990";


    botao.style.display =
      "none";


    botao.style.width =
      "42px";


    botao.style.height =
      "42px";


    botao.style.borderRadius =
      "50%";


    botao.style.border =
      "0";


    botao.style.cursor =
      "pointer";


    botao.style.fontSize =
      "22px";


    botao.style.background =
      "var(--p,#168a45)";


    botao.style.color =
      "#fff";


    document.body.appendChild(
      botao
    );

  }


  botao.onclick =
    function(){

      window.scrollTo({
        top:0,
        behavior:"smooth"
      });

    };


  window.addEventListener(
    "scroll",
    function(){

      botao.style.display =
        window.scrollY > 500
          ? "block"
          : "none";

    },
    {
      passive:true
    }
  );

}


/* =========================================================
   LINKS DE CATEGORIA
========================================================= */

function configurarCategorias(){

  document
    .querySelectorAll(
      "[data-categoria]"
    )
    .forEach(function(link){

      if(
        link.dataset.amCategoria === "1"
      ){

        return;

      }


      link.dataset.amCategoria =
        "1";


      link.addEventListener(
        "click",
        function(){

          const categoria =
            this.dataset.categoria;


          if(
            categoria
          ){

            localStorage.setItem(
              "africanmundo-categoria",
              categoria
            );

          }

        }
      );

    });

}


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarAfricanMundo(){

  if(
    africanMundoIniciado
  ){

    return;

  }


  africanMundoIniciado =
    true;


  console.log(
    "🌍 AfricanMundo — iniciando..."
  );


  aplicarTema();

  aplicarCor();

  garantirManifest();

  garantirThemeColor();

  protegerEstrutura();

  configurarTeclado();

  configurarBotoesTopo();

  configurarBotoesData();

  configurarPesquisa();

  configurarMenuMobile();

  configurarCliqueFora();

  configurarVisibilidade();

  configurarTopo();

  configurarCategorias();

  iniciarPWA();

  protegerImagens();


  await carregarNoticias();


  await carregarAnuncios();


  iniciarAtualizacaoAutomatica();

  iniciarRealtimeNoticias();


  configurarDestaque();


  setTimeout(
    protegerImagens,
    1500
  );


  console.log(
    "🌍 AfricanMundo — pronto."
  );

}


/* =========================================================
   EVENTOS INICIAIS
========================================================= */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    iniciarAfricanMundo,
    {
      once:true
    }
  );

}else{

  iniciarAfricanMundo();

}


/* =========================================================
   EXPORTAR FUNÇÕES
========================================================= */

window.abrirNoticia =
  abrirNoticia;

window.carregarNoticias =
  carregarNoticias;

window.pesquisar =
  pesquisar;

window.pesquisarTecla =
  pesquisarTecla;

window.abrirPesquisa =
  abrirPesquisa;

window.mostrarNotificacoes =
  mostrarNotificacoes;

window.mostrarFerramentas =
  mostrarFerramentas;

window.mostrarEu =
  mostrarEu;

window.alternarTema =
  alternarTema;

window.mostrarCores =
  mostrarCores;

window.alterarCor =
  alterarCor;

window.escolherCor =
  escolherCor;

window.partilharSite =
  partilharSite;

window.abrirRede =
  abrirRede;

window.abrirGoogle =
  abrirGoogle;

window.fecharModal =
  fecharModal;

window.mostrarAtalhos =
  mostrarAtalhos;

console.log(
  "AFRICANMUNDO APP.JS FOI CARREGADO"
);
