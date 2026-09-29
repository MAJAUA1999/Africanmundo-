/* =========================================================
   AFRICANMUNDO — APP.JS
   Versão profissional
   Notícias + imagens + pesquisa + ferramentas + Realtime
========================================================= */


/* =========================================================
   SUPABASE
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
   ESTADO DA APLICAÇÃO
========================================================= */

let noticias = [];

let indiceDestaque = 0;

let timerDestaque = null;

let timerAtualizacao = null;

let canalNoticias = null;

let ultimaAtualizacaoRealtime = 0;

let pesquisaAberta = false;

let pesquisaTimer = null;


/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1200&q=75";


const LIMITE_ULTIMAS =
  10;


const LIMITE_CATEGORIA =
  6;


/* =========================================================
   NORMALIZAR TEXTO
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

  return String(valor || "")
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
   TEXTO / RESUMO
========================================================= */

function texto(noticia){

  return String(
    noticia?.texto ||
    noticia?.descricao ||
    noticia?.description ||
    ""
  )
  .replace(/<[^>]*>/g," ")
  .replace(/\s+/g," ")
  .trim();

}


/* =========================================================
   DATA NUMÉRICA
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


/* =========================================================
   DATA FORMATADA
========================================================= */

function data(noticia){

  const valor =
    noticia?.data ||
    noticia?.created_at ||
    noticia?.published_at ||
    "";

  if(!valor){
    return "";
  }

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
   IMAGEM ORIGINAL
========================================================= */

function imagem(noticia){

  const original =
    String(
      noticia?.imagem ||
      ""
    ).trim();

  if(original){

    return original;

  }

  return FALLBACK_IMG;

}


/* =========================================================
   VERIFICAR SE POSSUI IMAGEM ORIGINAL
========================================================= */

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
      noticia?.subcategoria ||
      ""
    ).trim();

  const cat =
    String(
      noticia?.categoria ||
      ""
    ).trim();

  return sub || cat || "Atualidades";

}


/* =========================================================
   RESUMO
========================================================= */

function resumo(noticia, limite = 180){

  let t =
    texto(noticia);

  if(!t){
    return "";
  }

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

  if(!id){
    return;
  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(id);

}


/* =========================================================
   CARTÃO DE NOTÍCIA
========================================================= */

function card(noticia){

  if(!noticia){
    return "";
  }

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

function lista(dados, elemento){

  const grid =
    document.getElementById(elemento);

  if(!grid){
    return;
  }

  if(!Array.isArray(dados) || !dados.length){

    grid.innerHTML = `
      <div class="sem-noticias">
        <span>📰</span>
        <p>Não há notícias disponíveis nesta secção.</p>
      </div>
    `;

    return;
  }


  grid.innerHTML =
    dados
      .map(card)
      .join("");


  // Evita que imagens muito grandes sejam carregadas
  // todas ao mesmo tempo em aparelhos mais lentos.

  const imagens =
    grid.querySelectorAll("img");

  imagens.forEach(function(img){

    img.loading = "lazy";

    img.decoding = "async";

  });

}


/* =========================================================
   MENSAGEM DE ERRO
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

  if(!area){
    return;
  }

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
   ROTAÇÃO DO DESTAQUE
========================================================= */

function iniciarDestaque(){

  if(timerDestaque){

    clearInterval(
      timerDestaque
    );

  }


  if(noticias.length < 2){
    return;
  }


  timerDestaque =
    setInterval(function(){

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
   BUSCAR UMA CATEGORIA
========================================================= */

async function buscarCategoria(
  categoria,
  elemento,
  limite = LIMITE_CATEGORIA
){

  const grid =
    document.getElementById(elemento);

  if(!grid){
    return [];
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


    let dados =
      resultado.data || [];


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


    const semImagem =
      dados.filter(
        n => !possuiImagem(n)
      ).length;


    if(semImagem){

      console.warn(
        `AfricanMundo — ${categoria}:`,
        semImagem,
        "notícia(s) sem imagem original."
      );

    }


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

    lista(
      [],
      elemento
    );

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
      todas.data || [];


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


    /*
      Cada categoria é independente.
      Se uma falhar, as outras continuam.
    */

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

async function pesquisar(){

  const campo =
    document.getElementById(
      "searchInput"
    ) ||
    document.getElementById(
      "pesquisa"
    ) ||
    document.querySelector(
      'input[type="search"]'
    );


  if(!campo){
    return;
  }


  const termo =
    String(
      campo.value || ""
    ).trim();


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
        .or(
          [
            `titulo.ilike.%${termo}%`,
            `texto.ilike.%${termo}%`,
            `categoria.ilike.%${termo}%`,
            `subcategoria.ilike.%${termo}%`,
            `pais.ilike.%${termo}%`,
            `fonte.ilike.%${termo}%`
          ].join(",")
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


    if(resposta.error){

      throw resposta.error;

    }


    let resultados =
      resposta.data || [];


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
   PESQUISA COM ENTER
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
   PESQUISA — ABRIR
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

    campo.focus();

    campo.select();

  }


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

}


/* =========================================================
   MOSTRAR RESULTADOS
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

        ${resultados
          .map(card)
          .join("")}

      </div>

    `;


    container.scrollIntoView({
      behavior:"smooth",
      block:"start"
    });


    return;

  }


  /*
    Se não existir uma área própria de pesquisa,
    mostramos uma janela profissional.
  */

  mostrarModal(
    `
      <div class="modal-header">

        <h2>🔎 Pesquisa</h2>

        <button
          onclick="fecharModal()"
          aria-label="Fechar"
        >
          ×
        </button>

      </div>

      <div class="modal-body">

        <p>
          Resultados para:
          <strong>${esc(termo)}</strong>
        </p>

        ${
          resultados.length
            ? `
              <div class="search-grid">
                ${resultados
                  .slice(0,30)
                  .map(card)
                  .join("")}
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
    `
  );

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

  }

}


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(
  mensagem
){

  mostrarModal(`

    <div class="modal-header">

      <h2>ℹ️ AfricanMundo</h2>

      <button
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
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

function atualizarNoticias(){

  console.log(
    "AfricanMundo — verificando novas notícias..."
  );


  carregarNoticias();

}


/* =========================================================
   TIMER DE ATUALIZAÇÃO
========================================================= */

function iniciarAtualizacaoAutomatica(){

  if(timerAtualizacao){

    clearInterval(
      timerAtualizacao
    );

  }


  /*
    Cinco minutos.
    O Realtime atualiza antes quando disponível.
  */

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


            /*
              Evita várias atualizações
              praticamente simultâneas.
            */

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
                "AfricanMundo — Realtime indisponível. O sistema continuará usando atualização automática.",
                erro
              );

            }

          }
        );


  }catch(e){

    console.warn(
      "AfricanMundo — não foi possível iniciar Realtime:",
      e
    );

  }

       }

/* =========================================================
   MODAL PROFISSIONAL
========================================================= */

function mostrarModal(conteudo){

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
            Dica
          </strong>

          <p>
            Ative as notificações do navegador
            quando essa função estiver disponível
            no seu dispositivo.
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
   "EU"
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
   ATALHOS
========================================================= */

function mostrarAtalhos(){

  mostrarModal(`

    <div class="modal-header">

      <h2>
        ⌨️ Atalhos
      </h2>

      <button
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>

    <div class="modal-body">

      <div class="atalho">
        <kbd>Ctrl</kbd>
        +
        <kbd>K</kbd>
        <span>Pesquisar</span>
      </div>

      <div class="atalho">
        <kbd>/</kbd>
        <span>Pesquisar</span>
      </div>

      <div class="atalho">
        <kbd>T</kbd>
        <span>Alternar tema</span>
      </div>

      <div class="atalho">
        <kbd>Esc</kbd>
        <span>Fechar janela</span>
      </div>

    </div>

  `);

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
      window.location.origin +
      window.location.pathname

  };


  if(
    navigator.share
  ){

    try{

      await navigator.share(
        dados
      );

    }catch(e){

      // Cancelamento pelo utilizador
      // não precisa mostrar erro.

    }

    return;

  }


  try{

    await navigator.clipboard.writeText(
      dados.url
    );


    mostrarMensagem(
      "Link do AfricanMundo copiado."
    );


  }catch(e){

    mostrarMensagem(
      dados.url
    );

  }

}


/* =========================================================
   PARTILHAR NOTÍCIA
========================================================= */

async function partilharNoticia(noticia){

  if(!noticia){
    return;
  }


  const url =
    window.location.origin +
    "/noticia.html?id=" +
    encodeURIComponent(
      noticia.id
    );


  const dados = {

    title:
      titulo(noticia),

    text:
      titulo(noticia),

    url:url

  };


  if(navigator.share){

    try{

      await navigator.share(
        dados
      );

    }catch(e){}

    return;

  }


  try{

    await navigator.clipboard.writeText(
      url
    );


    mostrarMensagem(
      "Link da notícia copiado."
    );


  }catch(e){

    mostrarMensagem(
      url
    );

  }

}


/* =========================================================
   TEMA
========================================================= */

function iniciarTema(){

  const salvo =
    localStorage.getItem(
      "africanmundo-tema"
    );


  if(
    salvo === "dark"
  ){

    document.documentElement
      .classList.add("dark");

    document.body
      .classList.add("dark");

    return;

  }


  if(
    salvo === "light"
  ){

    document.documentElement
      .classList.remove("dark");

    document.body
      .classList.remove("dark");

    return;

  }


  /*
    Segue a preferência do aparelho
    apenas quando o utilizador ainda
    não escolheu manualmente.
  */

  if(
    window.matchMedia &&
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
  ){

    document.documentElement
      .classList.add("dark");

    document.body
      .classList.add("dark");

  }

}


/* =========================================================
   ALTERNAR TEMA
========================================================= */

function alternarTema(){

  const html =
    document.documentElement;

  const body =
    document.body;


  const ativo =
    html.classList.contains(
      "dark"
    );


  if(ativo){

    html.classList.remove(
      "dark"
    );

    body.classList.remove(
      "dark"
    );

    localStorage.setItem(
      "africanmundo-tema",
      "light"
    );

  }else{

    html.classList.add(
      "dark"
    );

    body.classList.add(
      "dark"
    );

    localStorage.setItem(
      "africanmundo-tema",
      "dark"
    );

  }

}


/* =========================================================
   CORES
========================================================= */

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


/* =========================================================
   ALTERAR COR
========================================================= */

function alterarCor(){

  const cores = [

    {
      nome:"Verde",
      valor:"#168a45"
    },

    {
      nome:"Azul",
      valor:"#1565c0"
    },

    {
      nome:"Vermelho",
      valor:"#c62828"
    },

    {
      nome:"Roxo",
      valor:"#7b1fa2"
    },

    {
      nome:"Laranja",
      valor:"#ef6c00"
    }

  ];


  mostrarModal(`

    <div class="modal-header">

      <h2>
        🎨 Cor do AfricanMundo
      </h2>

      <button
        onclick="fecharModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-body">

      <div class="cores-grid">

        ${
          cores.map(function(cor){

            return `

              <button
                class="cor-opcao"
                style="--cor:${cor.valor}"
                onclick="selecionarCor('${cor.valor}')"
              >

                <span
                  style="
                    background:${cor.valor};
                  "
                ></span>

                ${cor.nome}

              </button>

            `;

          }).join("")
        }

      </div>

    </div>

  `);

}


/* =========================================================
   SELECIONAR COR
========================================================= */

function selecionarCor(cor){

  document.documentElement
    .style
    .setProperty(
      "--p",
      cor
    );


  localStorage.setItem(
    "africanmundo-cor",
    cor
  );


  fecharModal();

}


/* =========================================================
   BOTÕES
========================================================= */

function iniciarBotoes(){

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );

  if(notificationBtn){

    notificationBtn.onclick =
      mostrarNotificacoes;

  }


  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );

  if(toolsBtn){

    toolsBtn.onclick =
      mostrarFerramentas;

  }


  const themeBtn =
    document.getElementById(
      "themeBtn"
    );

  if(themeBtn){

    themeBtn.onclick =
      alternarTema;

  }


  const colorBtn =
    document.getElementById(
      "colorBtn"
    );

  if(colorBtn){

    colorBtn.onclick =
      alterarCor;

  }


  [
    "userBtn",
    "euBtn",
    "perfilBtn",
    "profileBtn"
  ].forEach(function(id){

    const btn =
      document.getElementById(id);

    if(btn){

      btn.onclick =
        mostrarEu;

    }

  });


  const campo =
    document.getElementById(
      "searchInput"
    ) ||
    document.querySelector(
      'input[type="search"]'
    );


  if(campo){

    campo.addEventListener(
      "keydown",
      pesquisarTecla
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

/* =========================================================
   MENU ATIVO
========================================================= */

function marcarMenuAtivo(){

  const pagina =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase();


  const links =
    document.querySelectorAll(
      "nav a, .menu a, .bottom-menu a, .nav-link"
    );


  links.forEach(function(link){

    const href =
      String(
        link.getAttribute("href") || ""
      )
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();


    link.classList.remove(
      "ativo",
      "active"
    );


    if(
      href &&
      (
        href === pagina ||
        (
          pagina === "" &&
          (
            href === "/" ||
            href === "index.html"
          )
        )
      )
    ){

      link.classList.add(
        "ativo"
      );

      link.classList.add(
        "active"
      );

    }

  });

}


/* =========================================================
   ATALHOS DO TECLADO
========================================================= */

function iniciarAtalhos(){

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


      /* ESC */

      if(
        event.key === "Escape"
      ){

        fecharModal();

        return;

      }


      /* CTRL + K */

      if(
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key.toLowerCase() === "k"
      ){

        event.preventDefault();

        abrirPesquisa();

        return;

      }


      /* "/" */

      if(
        event.key === "/" &&
        !digitando
      ){

        event.preventDefault();

        abrirPesquisa();

        return;

      }


      /* T */

      if(
        event.key.toLowerCase() === "t" &&
        !digitando
      ){

        alternarTema();

        return;

      }

    }
  );

}


/* =========================================================
   CLIQUE FORA / MODAL
========================================================= */

function iniciarModal(){

  document.addEventListener(
    "click",
    function(event){

      const modal =
        document.getElementById(
          "africanmundoModal"
        );


      if(!modal){
        return;
      }


      if(
        event.target === modal
      ){

        fecharModal();

      }

    }
  );

}


/* =========================================================
   BOTÃO DE PESQUISA
========================================================= */

function iniciarPesquisa(){

  const botoes =
    document.querySelectorAll(
      "[data-pesquisar], .search-btn, #searchBtn"
    );


  botoes.forEach(function(btn){

    btn.addEventListener(
      "click",
      function(event){

        /*
          Só impede comportamento
          padrão se o botão não for
          um link de navegação.
        */

        if(
          btn.tagName !== "A"
        ){

          event.preventDefault();

        }


        abrirPesquisa();

      }
    );

  });

}


/* =========================================================
   CORREÇÃO DE IMAGENS
========================================================= */

function prepararImagens(){

  document
    .querySelectorAll(
      "img"
    )
    .forEach(function(img){

      /*
        Não altera imagens que já
        possuem tratamento próprio.
      */

      if(
        !img.getAttribute(
          "loading"
        )
      ){

        img.setAttribute(
          "loading",
          "lazy"
        );

      }


      if(
        !img.getAttribute(
          "decoding"
        )
      ){

        img.setAttribute(
          "decoding",
          "async"
        );

      }


      img.addEventListener(
        "error",
        function(){

          /*
            Não substitui imediatamente
            imagens externas do site.
            Apenas impede erro visual.
          */

          if(
            !img.dataset.fallback &&
            img.src !== FALLBACK_IMG
          ){

            img.dataset.fallback =
              "1";

            img.src =
              FALLBACK_IMG;

          }

        },
        {
          once:true
        }
      );

    });

}


/* =========================================================
   ATUALIZAÇÃO QUANDO VOLTA PARA A ABA
========================================================= */

function iniciarAtualizacaoAoVoltar(){

  document.addEventListener(
    "visibilitychange",
    function(){

      if(
        document.visibilityState !==
        "visible"
      ){

        return;

      }


      /*
        Quando o utilizador volta
        ao AfricanMundo depois de
        algum tempo, verifica notícias.
      */

      const agora =
        Date.now();


      if(
        agora -
        ultimaAtualizacaoRealtime
        > 60000
      ){

        carregarNoticias();

      }

    }
  );

}


/* =========================================================
   DESTAQUE — PAUSAR QUANDO SAI DA ABA
========================================================= */

function controlarDestaque(){

  document.addEventListener(
    "visibilitychange",
    function(){

      if(
        document.visibilityState ===
        "hidden"
      ){

        if(timerDestaque){

          clearInterval(
            timerDestaque
          );

          timerDestaque =
            null;

        }

      }else{

        iniciarDestaque();

      }

    }
  );

}


/* =========================================================
   DESTRUIR REALTIME
========================================================= */

function pararRealtime(){

  if(
    canalNoticias &&
    db
  ){

    try{

      db.removeChannel(
        canalNoticias
      );

    }catch(e){}

    canalNoticias =
      null;

  }

}


/* =========================================================
   RECARREGAR MANUALMENTE
========================================================= */

window.recarregarAfricanMundo =
  function(){

    carregarNoticias();

  };


/* =========================================================
   INICIALIZAÇÃO PRINCIPAL
========================================================= */

async function iniciarAfricanMundo(){

  try{

    console.log(
      "🌍 AfricanMundo — iniciando..."
    );


    restaurarCor();

    iniciarTema();

    iniciarBotoes();

    iniciarAtalhos();

    iniciarModal();

    iniciarPesquisa();

    iniciarAtualizacaoAoVoltar();

    controlarDestaque();

    marcarMenuAtivo();

    prepararImagens();


    /*
      Realtime é iniciado antes
      do carregamento inicial.
    */

    iniciarRealtimeNoticias();


    /*
      Primeiro carregamento.
    */

    await carregarNoticias();


    /*
      Segurança:
      mesmo que Realtime não esteja
      disponível, a página continua
      atualizando.
    */

    iniciarAtualizacaoAutomatica();


    console.log(
      "✅ AfricanMundo iniciado com sucesso."
    );


  }catch(e){

    console.error(
      "❌ Erro ao iniciar AfricanMundo:",
      e
    );

  }

}


/* =========================================================
   INICIAR UMA ÚNICA VEZ
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
   LIMPEZA AO SAIR
========================================================= */

window.addEventListener(
  "beforeunload",
  function(){

    if(timerDestaque){

      clearInterval(
        timerDestaque
      );

    }


    if(timerAtualizacao){

      clearInterval(
        timerAtualizacao
      );

    }

  }
);
