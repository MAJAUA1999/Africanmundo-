/* ==========================================
🌍 AFRICANMUNDO — APP.JS
VERSÃO PROFISSIONAL — NOTÍCIAS
PARTE 1/5
========================================== */

const SUPABASE_URL =
"https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
"sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const VAPID_PUBLIC_KEY =
"BE5MvLpgL_DxACi7xsukJpfGwlK-z4PMzCfGxkn1L68d8gdfKg8Udfs7-GDHe4L6hRVBWadsQfqYMolTAEeJezQ";

let db = null;

window.__noticias = [];

let noticiasCarregadas = false;


/* ==========================================
SUPABASE
========================================== */

function iniciarSupabase(){

  try{

    if(
      typeof supabase !== "undefined" &&
      supabase.createClient
    ){

      db = supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

      return true;

    }

  }catch(erro){

    console.error(
      "❌ Erro Supabase:",
      erro
    );

  }

  return false;

}


/* ==========================================
SEGURANÇA HTML
========================================== */

function esc(valor){

  if(
    valor === null ||
    valor === undefined
  ){

    return "";

  }

  return String(valor)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#039;");

}


/* ==========================================
NORMALIZAR TEXTO
========================================== */

function normalizarTexto(valor){

  return String(
    valor || ""
  )
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .toLowerCase()
  .trim();

}


function normalizarCategoria(valor){

  return normalizarTexto(
    valor
  );

}


/* ==========================================
CAMPOS DAS NOTÍCIAS
========================================== */

function obterTitulo(n){

  return (
    n?.titulo ||
    n?.title ||
    "Sem título"
  );

}


function obterTexto(n){

  return (
    n?.texto ||
    n?.conteudo ||
    n?.content ||
    n?.descricao ||
    n?.description ||
    ""
  );

}


function obterImagem(n){

  return (
    n?.imagem ||
    n?.imagem_url ||
    n?.image ||
    n?.image_url ||
    n?.url_imagem ||
    n?.thumbnail ||
    ""
  );

}


function obterFonte(n){

  return (
    n?.fonte ||
    n?.source ||
    "AfricanMundo"
  );

}


/* ==========================================
DATA
========================================== */

function formatarData(valor){

  if(!valor){

    return "";

  }

  try{

    const data =
      new Date(valor);

    if(
      Number.isNaN(
        data.getTime()
      )
    ){

      return "";

    }

    return data.toLocaleDateString(
      "pt-MZ",
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


/* ==========================================
IDENTIFICAÇÃO DE PAÍSES — PARTE 1
========================================== */

const PAISES_AFRICA = [

  ["Moçambique",[
    "mocambique",
    "mozambique",
    "maputo",
    "matola",
    "beira",
    "nampula",
    "tete",
    "quelimane",
    "chimoio",
    "pemba",
    "inhambane",
    "xai-xai",
    "manhica",
    "chokwe"
  ]],

  ["África do Sul",[
    "south africa",
    "africa do sul",
    "johannesburg",
    "cape town",
    "durban",
    "pretoria"
  ]],

  ["Angola",[
    "angola",
    "luanda",
    "huambo",
    "benguela"
  ]],

  ["Zimbabwe",[
    "zimbabwe",
    "harare",
    "bulawayo"
  ]],

  ["Malawi",[
    "malawi",
    "lilongwe",
    "blantyre"
  ]],

  ["Tanzânia",[
    "tanzania",
    "dar es salaam",
    "dodoma",
    "zanzibar"
  ]],

  ["Zâmbia",[
    "zambia",
    "lusaka",
    "kitwe"
  ]],

  ["Quénia",[
    "kenya",
    "nairobi",
    "mombasa"
  ]],

  ["Nigéria",[
    "nigeria",
    "lagos",
    "abuja",
    "kano"
  ]],

  ["Gana",[
    "ghana",
    "accra",
    "kumasi"
  ]],

  ["Uganda",[
    "uganda",
    "kampala"
  ]],

  ["RDC",[
    "democratic republic of congo",
    "dr congo",
    "drc",
    "congo kinshasa",
    "kinshasa"
  ]],

  ["República do Congo",[
    "republic of congo",
    "congo brazzaville",
    "brazzaville"
  ]],

  ["Etiópia",[
    "ethiopia",
    "addis ababa"
  ]],

  ["Somália",[
    "somalia",
    "mogadishu"
  ]],

  ["Sudão",[
    "sudan",
    "khartoum"
  ]],

  ["Sudão do Sul",[
    "south sudan",
    "juba"
  ]],

  ["Egito",[
    "egypt",
    "cairo",
    "alexandria"
  ]],

  ["Marrocos",[
    "morocco",
    "maroc",
    "rabat",
    "casablanca"
  ]],

  ["Argélia",[
    "algeria",
    "algiers"
  ]]

];


/* ==========================================
DESCOBRIR PAÍS
========================================== */

function descobrirPais(n){

  const texto =
    normalizarTexto(

      obterTitulo(n) +
      " " +
      obterTexto(n) +
      " " +
      obterFonte(n)

    );


  for(
    const [pais, palavras]
    of PAISES_AFRICA
  ){

    for(
      const palavra
      of palavras
    ){

      if(
        texto.includes(
          normalizarTexto(
            palavra
          )
        )
      ){

        return pais;

      }

    }

  }

  return "";

}


/* ==========================================
É NOTÍCIA AFRICANA?
========================================== */

function ehAfricana(n){

  return !!descobrirPais(n);

}


/* ==========================================
CATEGORIA TEMÁTICA
========================================== */

function descobrirCategoria(n){

  const categoriaOriginal =
    String(
      n?.categoria || ""
    );


  const texto =
    normalizarTexto(

      obterTitulo(n) +
      " " +
      obterTexto(n) +
      " " +
      categoriaOriginal

    );


  if(
    /futebol|football|soccer|premier league|champions league|afcon|africa cup/.test(texto)
  ){

    return "Futebol";

  }


  if(
    /basquet|basketball|atletismo|tenis|ténis|rugby|cricket|boxe|desporto|sport/.test(texto)
  ){

    return "Desporto";

  }


  if(
    /eleicao|eleições|eleicoes|presidente|governo|ministro|parlamento|politica|político|politica|voto|partido/.test(texto)
  ){

    return "Política";

  }


  if(
    /economia|economy|negocio|negócio|business|empresa|empresas|mercado|investimento|finance|financas|finanças/.test(texto)
  ){

    return "Negócios e Economia";

  }


  if(
    /saude|saúde|hospital|doenca|doença|medicina|médico|medico|health|malaria|vacina/.test(texto)
  ){

    return "Saúde";

  }


  if(
    /educacao|educação|escola|universidade|estudante|professor|education|school/.test(texto)
  ){

    return "Educação";

  }


  if(
    /emprego|empregos|oportunidade|oportunidades|vaga|vagas|recrutamento|job|jobs|career/.test(texto)
  ){

    return "Emprego e Oportunidades";

  }


  if(
    /cultura|musica|música|cinema|artista|artistas|entretenimento|entertainment|celebridade|celebrity/.test(texto)
  ){

    return "Cultura e Entretenimento";

  }


  if(
    /ambiente|clima|climate|environment|seca|cheia|inundacao|inundação|ciclone|chuva/.test(texto)
  ){

    return "Ambiente";

  }


  if(
    /desenvolvimento|development|infraestrutura|infrastructure|estrada|ponte|energia|agua|água/.test(texto)
  ){

    return "Desenvolvimento";

  }


  if(
    /sociedade|comunidade|community|social|crime|acidente|policia|polícia|seguranca|segurança/.test(texto)
  ){

    return "Sociedade e Comunidade";

  }


  return categoriaOriginal ||
    "Atualidade";

      }
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 2/5 — CARDS, IMAGENS, DESTAQUE E LISTAGENS
========================================================= */


/* =========================================================
📰 ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(n){

  if(!n || !n.id) return;

  window.location.href =
    `noticia.html?id=${encodeURIComponent(n.id)}`;
}


function abrirNoticiaPorId(id){

  if(!id) return;

  window.location.href =
    `noticia.html?id=${encodeURIComponent(id)}`;
}


/* =========================================================
🖼️ IMAGEM FALLBACK
========================================================= */

function imagemFallback(img){

  if(!img) return;

  img.onerror = function(){

    this.onerror = null;

    this.src =
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80";
  };
}


/* =========================================================
🧹 TEXTO CURTO PARA OS CARDS
========================================================= */

function resumoTexto(texto, limite = 150){

  const t = normalizarTexto(texto);

  if(!t) return "";

  if(t.length <= limite){
    return t;
  }

  return t.substring(0, limite).trim() + "...";
}


/* =========================================================
🏷️ BADGE DE PAÍS
========================================================= */

function criarBadgePais(n){

  const pais = descobrirPais(n);

  if(!pais){
    return "";
  }

  return `
    <span class="pais-badge">
      🌍 ${esc(pais)}
    </span>
  `;
}


/* =========================================================
🏷️ BADGE DE CATEGORIA
========================================================= */

function criarBadgeCategoria(n){

  const categoria = descobrirCategoria(n);

  if(!categoria){
    return "";
  }

  return `
    <span class="categoria-badge">
      ${esc(categoria)}
    </span>
  `;
}


/* =========================================================
📰 CRIAR CARD PROFISSIONAL
========================================================= */

function criarCard(n){

  if(!n) return "";

  const id = n.id;

  const titulo =
    obterTitulo(n) ||
    "Notícia sem título";

  const texto =
    obterTexto(n);

  const imagem =
    obterImagem(n);

  const fonte =
    obterFonte(n);

  const categoria =
    descobrirCategoria(n);

  const pais =
    descobrirPais(n);

  const data =
    formatarData(n.data);

  const imagemHtml = imagem
    ? `
      <div class="card-imagem">

        <img
          src="${esc(imagem)}"
          alt="${esc(titulo)}"
          loading="lazy"
          onerror="imagemFallback(this)"
        >

        <div class="card-badges">
          ${criarBadgeCategoria(n)}
          ${criarBadgePais(n)}
        </div>

      </div>
    `
    : `
      <div class="card-imagem sem-imagem">

        <div class="imagem-placeholder">
          🌍
        </div>

        <div class="card-badges">
          ${criarBadgeCategoria(n)}
          ${criarBadgePais(n)}
        </div>

      </div>
    `;


  return `
    <article
      class="compact-card noticia-card"
      data-id="${esc(id)}"
      data-pais="${esc(pais)}"
      data-categoria="${esc(categoria)}"
      onclick="abrirNoticiaPorId('${esc(id)}')"
    >

      ${imagemHtml}

      <div class="card-conteudo">

        <h3 class="card-titulo">
          ${esc(titulo)}
        </h3>

        ${
          texto
            ? `
              <p class="card-resumo">
                ${esc(resumoTexto(texto))}
              </p>
            `
            : ""
        }

        <div class="card-meta">

          ${
            fonte
              ? `
                <span>
                  📰 ${esc(fonte)}
                </span>
              `
              : ""
          }

          ${
            data
              ? `
                <span>
                  🕒 ${esc(data)}
                </span>
              `
              : ""
          }

        </div>

      </div>

    </article>
  `;
}


/* =========================================================
📋 RENDERIZAR LISTA
========================================================= */

function renderizarLista(id, lista){

  const elemento =
    document.getElementById(id);

  if(!elemento) return;

  if(!Array.isArray(lista) || lista.length === 0){

    elemento.innerHTML = `
      <div class="sem-noticias">

        <div class="sem-noticias-icon">
          📰
        </div>

        <p>
          Ainda não existem notícias disponíveis
          nesta secção.
        </p>

      </div>
    `;

    return;
  }


  elemento.innerHTML =
    lista
      .map(n => criarCard(n))
      .join("");
}


/* =========================================================
⭐ RENDERIZAR DESTAQUE PRINCIPAL
========================================================= */

function renderizarDestaque(n){

  const elemento =
    document.getElementById("destaque");

  if(!elemento) return;

  if(!n){

    elemento.innerHTML = `
      <div class="sem-noticias">
        <div class="sem-noticias-icon">🌍</div>
        <p>Não foi possível carregar o destaque.</p>
      </div>
    `;

    return;
  }


  const titulo =
    obterTitulo(n) ||
    "Notícia em destaque";

  const texto =
    obterTexto(n);

  const imagem =
    obterImagem(n);

  const fonte =
    obterFonte(n);

  const categoria =
    descobrirCategoria(n);

  const pais =
    descobrirPais(n);

  const data =
    formatarData(n.data);


  const imagemHtml = imagem
    ? `
      <img
        src="${esc(imagem)}"
        alt="${esc(titulo)}"
        loading="eager"
        onerror="imagemFallback(this)"
      >
    `
    : `
      <div class="destaque-placeholder">
        🌍
      </div>
    `;


  elemento.innerHTML = `

    <article
      class="featured"
      onclick="abrirNoticiaPorId('${esc(n.id)}')"
    >

      <div class="featured-image">

        ${imagemHtml}

        <div class="featured-overlay"></div>

        <div class="featured-badges">

          ${criarBadgeCategoria(n)}
          ${criarBadgePais(n)}

        </div>

      </div>


      <div class="featured-content">

        <div class="featured-meta">

          ${
            fonte
              ? `<span>📰 ${esc(fonte)}</span>`
              : ""
          }

          ${
            data
              ? `<span>🕒 ${esc(data)}</span>`
              : ""
          }

        </div>


        <h2>
          ${esc(titulo)}
        </h2>


        ${
          texto
            ? `
              <p>
                ${esc(resumoTexto(texto, 230))}
              </p>
            `
            : ""
        }


        <button
          type="button"
          class="btn-ler-noticia"
          onclick="
            event.stopPropagation();
            abrirNoticiaPorId('${esc(n.id)}');
          "
        >
          Ler notícia →
        </button>

      </div>

    </article>

  `;
}


/* =========================================================
🔀 EMBARALHAR NOTÍCIAS
========================================================= */

function embaralhar(lista){

  if(!Array.isArray(lista)){
    return [];
  }

  return [...lista]
    .sort(() => Math.random() - 0.5);
}


/* =========================================================
🧹 REMOVER DUPLICADOS NO FRONT-END
========================================================= */

function removerDuplicados(lista){

  if(!Array.isArray(lista)){
    return [];
  }

  const vistos = new Set();

  return lista.filter(n => {

    const chave =
      n?.id ??
      n?.url_original ??
      n?.titulo;

    if(!chave){
      return true;
    }

    if(vistos.has(String(chave))){
      return false;
    }

    vistos.add(String(chave));

    return true;
  });
}


/* =========================================================
🌍 FILTRAR POR PAÍS
========================================================= */

function filtrarPorPais(lista, pais){

  if(!Array.isArray(lista) || !pais){
    return [];
  }

  return lista.filter(n => {

    return descobrirPais(n) === pais;

  });
}


/* =========================================================
🗂️ FILTRAR POR CATEGORIA
========================================================= */

function filtrarPorCategoria(lista, categoria){

  if(!Array.isArray(lista) || !categoria){
    return [];
  }

  return lista.filter(n => {

    return descobrirCategoria(n) === categoria;

  });
}


/* =========================================================
📊 ORGANIZAR NOTÍCIAS POR CATEGORIA
========================================================= */

function organizarPorCategoria(lista){

  const resultado = {};

  if(!Array.isArray(lista)){
    return resultado;
  }


  lista.forEach(n => {

    const categoria =
      descobrirCategoria(n) ||
      "Atualidade";


    if(!resultado[categoria]){
      resultado[categoria] = [];
    }


    resultado[categoria].push(n);

  });


  return resultado;
}


/* =========================================================
📊 ORGANIZAR NOTÍCIAS POR PAÍS
========================================================= */

function organizarPorPais(lista){

  const resultado = {};

  if(!Array.isArray(lista)){
    return resultado;
  }


  lista.forEach(n => {

    const pais =
      descobrirPais(n) ||
      "África";


    if(!resultado[pais]){
      resultado[pais] = [];
    }


    resultado[pais].push(n);

  });


  return resultado;
}


/* =========================================================
📰 FIM DA PARTE 2
========================================================= */
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 3/5 — CARREGAMENTO, ORGANIZAÇÃO E PESQUISA
========================================================= */


/* =========================================================
⏳ ESTADO DO SISTEMA
========================================================= */

let carregandoNoticias = false;

let noticiasCarregadas = false;

let ultimaAtualizacaoNoticias = null;


/* =========================================================
🔄 INDICADOR DE CARREGAMENTO
========================================================= */

function mostrarCarregamento(){

  const secoes = [
    "destaque",
    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"
  ];


  secoes.forEach(id => {

    const elemento =
      document.getElementById(id);

    if(!elemento) return;


    elemento.innerHTML = `
      <div class="carregando-noticias">

        <div class="spinner-noticias"></div>

        <p>
          A carregar notícias...
        </p>

      </div>
    `;

  });

}


/* =========================================================
❌ MOSTRAR ERRO
========================================================= */

function mostrarErroNoticias(mensagem){

  const destaque =
    document.getElementById("destaque");


  if(destaque){

    destaque.innerHTML = `
      <div class="erro-noticias">

        <div class="erro-icon">
          ⚠️
        </div>

        <h3>
          Não foi possível carregar as notícias
        </h3>

        <p>
          ${esc(
            mensagem ||
            "Verifique a ligação à internet e tente novamente."
          )}
        </p>

        <button
          type="button"
          onclick="carregarNoticias(true)"
        >
          🔄 Tentar novamente
        </button>

      </div>
    `;

  }


  const ids = [
    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"
  ];


  ids.forEach(id => {

    const elemento =
      document.getElementById(id);

    if(!elemento) return;

    elemento.innerHTML = `
      <div class="sem-noticias">
        <p>
          Notícias temporariamente indisponíveis.
        </p>
      </div>
    `;

  });

}


/* =========================================================
📰 CARREGAR NOTÍCIAS DO SUPABASE
========================================================= */

async function carregarNoticias(forcar = false){

  if(carregandoNoticias){
    return;
  }


  /*
   * Evita pedidos desnecessários.
   * Se já carregámos notícias nesta sessão,
   * não fazemos outro pedido automaticamente.
   */
  if(noticiasCarregadas && !forcar){
    return;
  }


  carregandoNoticias = true;


  mostrarCarregamento();


  try{

    if(!supabaseClient){

      iniciarSupabase();

    }


    if(!supabaseClient){

      throw new Error(
        "Supabase não foi inicializado."
      );

    }


    const { data, error } =
      await supabaseClient
        .from("noticias")
        .select(`
          id,
          titulo,
          texto,
          imagem,
          categoria,
          data,
          fonte,
          url_original,
          id_externo,
          visualizacoes
        `)
        .order("id", {
          ascending: false
        })
        .limit(100);


    if(error){

      console.error(
        "❌ Erro ao carregar notícias:",
        error
      );

      throw error;

    }


    if(!Array.isArray(data)){

      throw new Error(
        "Resposta inválida recebida do servidor."
      );

    }


    /*
     * Remove duplicados que eventualmente
     * tenham chegado da base de dados.
     */
    const listaLimpa =
      removerDuplicados(data);


    /*
     * Guarda globalmente.
     * Outras funções do site podem utilizar
     * esta lista sem fazer novo pedido.
     */
    window.__noticias =
      listaLimpa;


    noticiasCarregadas = true;

    ultimaAtualizacaoNoticias =
      new Date();


    console.log(
      `🌍 ${listaLimpa.length} notícias carregadas.`
    );


    if(listaLimpa.length === 0){

      renderizarDestaque(null);

      [
        "ultimas",
        "futebol",
        "mocambique",
        "africa",
        "negocios",
        "entretenimento",
        "desporto"
      ].forEach(id => {

        renderizarLista(id, []);

      });


      return;

    }


    renderizarPagina();


  }catch(error){

    console.error(
      "❌ Falha no carregamento das notícias:",
      error
    );


    mostrarErroNoticias(
      "O servidor de notícias não respondeu corretamente."
    );


  }finally{

    carregandoNoticias = false;

  }

}


/* =========================================================
🏠 RENDERIZAR PÁGINA PRINCIPAL
========================================================= */

function renderizarPagina(){

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];


  if(noticias.length === 0){

    renderizarDestaque(null);

    return;

  }


  /* =====================================================
  ⭐ DESTAQUE
  ===================================================== */

  /*
   * O primeiro artigo é usado como destaque.
   * Como o Supabase está ordenado pelo ID descendente,
   * normalmente corresponde a uma notícia recente.
   */

  const destaque =
    noticias[0];


  renderizarDestaque(
    destaque
  );


  /* =====================================================
  📰 ÚLTIMAS NOTÍCIAS
  ===================================================== */

  const ultimas =
    noticias.slice(0, 12);


  renderizarLista(
    "ultimas",
    ultimas
  );


  /* =====================================================
  ⚽ FUTEBOL
  ===================================================== */

  const futebol =
    embaralhar(
      filtrarPorCategoria(
        noticias,
        "Futebol"
      )
    );


  renderizarLista(
    "futebol",
    futebol.slice(0, 6)
  );


  /* =====================================================
  🇲🇿 MOÇAMBIQUE
  ===================================================== */

  const mocambique =
    embaralhar(
      filtrarPorPais(
        noticias,
        "Moçambique"
      )
    );


  renderizarLista(
    "mocambique",
    mocambique.slice(0, 6)
  );


  /* =====================================================
  🌍 ÁFRICA
  ===================================================== */

  /*
   * Aqui mostramos notícias africanas de vários países.
   * Notícias de Moçambique também fazem parte de África,
   * por isso não exigimos uma categoria chamada "África".
   */

  const africa =
    embaralhar(
      noticias.filter(n => {

        return ehAfricana(n);

      })
    );


  renderizarLista(
    "africa",
    africa.slice(0, 6)
  );


  /* =====================================================
  💼 NEGÓCIOS
  ===================================================== */

  const negocios =
    embaralhar(
      filtrarPorCategoria(
        noticias,
        "Negócios e Economia"
      )
    );


  renderizarLista(
    "negocios",
    negocios.slice(0, 6)
  );


  /* =====================================================
  🎭 ENTRETENIMENTO
  ===================================================== */

  const entretenimento =
    embaralhar(
      filtrarPorCategoria(
        noticias,
        "Cultura e Entretenimento"
      )
    );


  renderizarLista(
    "entretenimento",
    entretenimento.slice(0, 6)
  );


  /* =====================================================
  🏆 DESPORTO
  ===================================================== */

  const desporto =
    embaralhar(
      filtrarPorCategoria(
        noticias,
        "Desporto"
      )
    );


  renderizarLista(
    "desporto",
    desporto.slice(0, 6)
  );


  console.log(
    "✅ Página principal renderizada."
  );

}


/* =========================================================
🔎 PESQUISA DE NOTÍCIAS
========================================================= */

function pesquisar(event){

  if(event){

    event.preventDefault();

  }


  const campo =
    document.getElementById("searchInput") ||
    document.getElementById("pesquisa") ||
    document.querySelector(
      'input[type="search"]'
    );


  if(!campo){

    console.warn(
      "⚠️ Campo de pesquisa não encontrado."
    );

    return;

  }


  const termo =
    normalizarTexto(
      campo.value
    ).toLowerCase();


  if(!termo){

    renderizarPagina();

    return;

  }


  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];


  const resultados =
    noticias.filter(n => {

      const titulo =
        obterTitulo(n)
          .toLowerCase();

      const texto =
        obterTexto(n)
          .toLowerCase();

      const categoria =
        descobrirCategoria(n)
          .toLowerCase();

      const pais =
        descobrirPais(n)
          .toLowerCase();

      const fonte =
        obterFonte(n)
          .toLowerCase();


      return (

        titulo.includes(termo) ||

        texto.includes(termo) ||

        categoria.includes(termo) ||

        pais.includes(termo) ||

        fonte.includes(termo)

      );

    });


  mostrarResultadosPesquisa(
    resultados,
    termo
  );

}


/* =========================================================
🔎 MOSTRAR RESULTADOS DA PESQUISA
========================================================= */

function mostrarResultadosPesquisa(
  resultados,
  termo
){

  const container =
    document.getElementById("ultimas");


  if(!container) return;


  if(!resultados.length){

    container.innerHTML = `

      <div class="sem-noticias">

        <div class="sem-noticias-icon">
          🔎
        </div>

        <h3>
          Nenhuma notícia encontrada
        </h3>

        <p>
          Não encontramos resultados para
          "<strong>${esc(termo)}</strong>".
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML = `

    <div class="resultado-pesquisa">

      <h3>
        🔎 Resultados para
        "${esc(termo)}"
      </h3>

      <p>
        ${resultados.length}
        notícia(s) encontrada(s)
      </p>

    </div>

    ${resultados
      .map(n => criarCard(n))
      .join("")}

  `;


  /*
   * Leva o utilizador até aos resultados
   * quando a pesquisa foi feita a partir do topo.
   */

  container.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =========================================================
🔄 LIMPAR PESQUISA
========================================================= */

function limparPesquisa(){

  const campos = [
    document.getElementById("searchInput"),
    document.getElementById("pesquisa"),
    document.querySelector(
      'input[type="search"]'
    )
  ];


  campos.forEach(campo => {

    if(campo){
      campo.value = "";
    }

  });


  renderizarPagina();

}


/* =========================================================
📊 CONTADORES PARA DEBUG
========================================================= */

function mostrarEstatisticasNoticias(){

  const noticias =
    Array.isArray(window.__noticias)
      ? window.__noticias
      : [];


  const categorias =
    organizarPorCategoria(
      noticias
    );


  const paises =
    organizarPorPais(
      noticias
    );


  console.log(
    "🌍 AfricanMundo — Estatísticas"
  );


  console.log(
    "📰 Total:",
    noticias.length
  );


  console.log(
    "🗂️ Categorias:",
    categorias
  );


  console.log(
    "🌍 Países:",
    paises
  );

}


/* =========================================================
🔁 ATUALIZAR NOTÍCIAS MANUALMENTE
========================================================= */

async function atualizarNoticias(){

  noticiasCarregadas = false;

  await carregarNoticias(true);

}


/* =========================================================
📰 FIM DA PARTE 3
========================================================= */
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 4/5 — UTILIZADOR, FAVORITOS, TEMA, PARTILHA E ANÚNCIOS
========================================================= */


/* =========================================================
⭐ FAVORITOS
========================================================= */

const CHAVE_FAVORITOS =
  "africanmundo_favoritos";


function obterFavoritos(){

  try{

    const dados =
      localStorage.getItem(
        CHAVE_FAVORITOS
      );

    if(!dados){
      return [];
    }

    const lista =
      JSON.parse(dados);

    return Array.isArray(lista)
      ? lista
      : [];

  }catch(error){

    console.warn(
      "⚠️ Não foi possível ler favoritos.",
      error
    );

    return [];

  }

}


function guardarFavoritos(lista){

  try{

    localStorage.setItem(
      CHAVE_FAVORITOS,
      JSON.stringify(lista)
    );

  }catch(error){

    console.warn(
      "⚠️ Não foi possível guardar favoritos.",
      error
    );

  }

}


function noticiaFavorita(id){

  if(!id) return false;

  const favoritos =
    obterFavoritos();

  return favoritos.includes(
    String(id)
  );

}


function alternarFavorito(id){

  if(!id) return;

  const favoritos =
    obterFavoritos();

  const identificador =
    String(id);

  const posicao =
    favoritos.indexOf(
      identificador
    );


  if(posicao >= 0){

    favoritos.splice(
      posicao,
      1
    );

  }else{

    favoritos.push(
      identificador
    );

  }


  guardarFavoritos(
    favoritos
  );


  atualizarBotoesFavoritos();

}


function atualizarBotoesFavoritos(){

  document
    .querySelectorAll(
      "[data-favorito-id]"
    )
    .forEach(botao => {

      const id =
        botao.dataset.favoritoId;

      const ativo =
        noticiaFavorita(id);


      botao.classList.toggle(
        "ativo",
        ativo
      );


      botao.innerHTML =
        ativo
          ? "⭐"
          : "☆";

      botao.setAttribute(
        "aria-label",
        ativo
          ? "Remover dos favoritos"
          : "Adicionar aos favoritos"
      );

    });

}


/* =========================================================
⭐ LISTA DE FAVORITOS
========================================================= */

function mostrarFavoritos(){

  const container =
    document.getElementById(
      "ultimas"
    );


  if(!container) return;


  const favoritos =
    obterFavoritos();


  const noticias =
    Array.isArray(
      window.__noticias
    )
      ? window.__noticias
      : [];


  const lista =
    noticias.filter(n =>
      favoritos.includes(
        String(n.id)
      )
    );


  if(!lista.length){

    container.innerHTML = `

      <div class="sem-noticias">

        <div class="sem-noticias-icon">
          ☆
        </div>

        <h3>
          Ainda não tem favoritos
        </h3>

        <p>
          Guarde notícias para encontrá-las
          rapidamente aqui.
        </p>

      </div>

    `;

    return;

  }


  container.innerHTML =
    lista
      .map(n => criarCard(n))
      .join("");


  atualizarBotoesFavoritos();

}


/* =========================================================
🔔 NOTIFICAÇÕES
========================================================= */

async function solicitarNotificacoes(){

  if(!("Notification" in window)){

    alert(
      "O seu navegador não suporta notificações."
    );

    return;

  }


  try{

    const permissao =
      await Notification.requestPermission();


    if(permissao === "granted"){

      alert(
        "🔔 Notificações ativadas com sucesso!"
      );


      /*
       * Se existir a função do sistema de push,
       * utiliza-a.
       */

      if(
        typeof window.inscreverPush ===
        "function"
      ){

        await window.inscreverPush();

      }

    }else{

      alert(
        "As notificações não foram ativadas."
      );

    }

  }catch(error){

    console.error(
      "❌ Erro nas notificações:",
      error
    );

  }

}


/* =========================================================
🔔 VER ESTADO DAS NOTIFICAÇÕES
========================================================= */

function verificarNotificacoes(){

  if(!("Notification" in window)){
    return "indisponivel";
  }


  return Notification.permission;

}


/* =========================================================
🧰 ABRIR FERRAMENTAS
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

    modal.style.display =
      "flex";

    return;

  }


  /*
   * Compatibilidade com versões antigas
   * do HTML.
   */

  if(
    typeof abrirModal ===
    "function"
  ){

    abrirModal(
      "toolsModal"
    );

  }

}


/* =========================================================
👤 ABRIR ÁREA DO UTILIZADOR
========================================================= */

function abrirUtilizador(){

  const modal =
    document.getElementById(
      "userModal"
    ) ||
    document.getElementById(
      "utilizadorModal"
    );


  if(modal){

    modal.classList.add(
      "ativo"
    );

    modal.style.display =
      "flex";

    return;

  }


  if(
    typeof abrirModal ===
    "function"
  ){

    abrirModal(
      "userModal"
    );

  }

}


/* =========================================================
🔔 BOTÃO DE NOTIFICAÇÕES
========================================================= */

function abrirNotificacoes(){

  const permissao =
    verificarNotificacoes();


  if(permissao === "granted"){

    alert(
      "🔔 As notificações do AfricanMundo estão ativadas."
    );

    return;

  }


  solicitarNotificacoes();

}


/* =========================================================
📤 PARTILHAR NOTÍCIA
========================================================= */

async function partilharNoticia(n){

  if(!n) return;


  const titulo =
    obterTitulo(n) ||
    "AfricanMundo";


  const url =
    `${window.location.origin}${window.location.pathname.replace(
      /[^/]*$/,
      ""
    )}noticia.html?id=${encodeURIComponent(n.id)}`;


  const dados = {

    title:
      titulo,

    text:
      `${titulo} — AfricanMundo`,

    url:
      url

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


    await copiarTexto(
      url
    );


    alert(
      "🔗 Link copiado. Pode partilhar agora."
    );


  }catch(error){

    /*
     * O utilizador pode simplesmente
     * ter cancelado a partilha.
     */

    console.log(
      "Partilha cancelada ou indisponível."
    );

  }

}


/* =========================================================
📋 COPIAR TEXTO
========================================================= */

async function copiarTexto(texto){

  if(!texto) return false;


  try{

    if(
      navigator.clipboard &&
      window.isSecureContext
    ){

      await navigator.clipboard.writeText(
        texto
      );

      return true;

    }


    const area =
      document.createElement(
        "textarea"
      );


    area.value =
      texto;

    area.style.position =
      "fixed";

    area.style.opacity =
      "0";


    document.body.appendChild(
      area
    );


    area.select();

    document.execCommand(
      "copy"
    );


    area.remove();

    return true;

  }catch(error){

    console.error(
      "❌ Não foi possível copiar:",
      error
    );

    return false;

  }

}


/* =========================================================
🔗 COPIAR LINK DO SITE
========================================================= */

async function copiarLink(){

  const sucesso =
    await copiarTexto(
      window.location.href
    );


  if(sucesso){

    alert(
      "🔗 Link copiado com sucesso!"
    );

  }

}


/* =========================================================
📱 INSTALAR SITE / GUARDAR NO ECRÃ
========================================================= */

let eventoInstalacao = null;


window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    eventoInstalacao =
      event;


    console.log(
      "📱 AfricanMundo pode ser instalado."
    );

  }
);


async function instalarAfricanMundo(){

  if(!eventoInstalacao){

    alert(
      "📱 A opção de instalação ainda não está disponível. No navegador, abra o menu e escolha 'Adicionar ao ecrã inicial' se essa opção aparecer."
    );

    return;

  }


  try{

    eventoInstalacao.prompt();


    const resultado =
      await eventoInstalacao.userChoice;


    console.log(
      "📱 Instalação:",
      resultado.outcome
    );


    eventoInstalacao =
      null;

  }catch(error){

    console.error(
      "❌ Erro ao instalar:",
      error
    );

  }

}


/* =========================================================
🌙 TEMA ESCURO
========================================================= */

const CHAVE_TEMA =
  "africanmundo_tema";


function carregarTema(){

  const tema =
    localStorage.getItem(
      CHAVE_TEMA
    );


  if(
    tema === "dark"
  ){

    document.body.classList.add(
      "dark"
    );

  }else{

    document.body.classList.remove(
      "dark"
    );

  }


  atualizarBotaoTema();

}


function alternarTema(){

  const escuro =
    document.body.classList.toggle(
      "dark"
    );


  localStorage.setItem(
    CHAVE_TEMA,
    escuro
      ? "dark"
      : "light"
  );


  atualizarBotaoTema();

}


function atualizarBotaoTema(){

  const botoes =
    document.querySelectorAll(
      "#themeBtn, [data-theme-button]"
    );


  botoes.forEach(botao => {

    const escuro =
      document.body.classList.contains(
        "dark"
      );


    botao.innerHTML =
      escuro
        ? "☀️"
        : "🌙";


    botao.setAttribute(
      "aria-label",
      escuro
        ? "Ativar modo claro"
        : "Ativar modo escuro"
    );

  });

}


/* =========================================================
🎨 COR PRINCIPAL
========================================================= */

const CHAVE_COR =
  "africanmundo_cor";


function carregarCor(){

  const cor =
    localStorage.getItem(
      CHAVE_COR
    );


  if(!cor){
    return;
  }


  aplicarCor(
    cor
  );

}


function aplicarCor(cor){

  if(!cor){
    return;
  }


  document.documentElement
    .style
    .setProperty(
      "--p",
      cor
    );


  localStorage.setItem(
    CHAVE_COR,
    cor
  );

}


function escolherCor(){

  const cores = [

    "#168a45",

    "#1261a0",

    "#b91c1c",

    "#7c3aed",

    "#ea580c",

    "#0891b2"

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
    cores.indexOf(
      atual
    );


  indice =
    indice < 0
      ? 0
      : indice;


  const proxima =
    cores[
      (indice + 1) %
      cores.length
    ];


  aplicarCor(
    proxima
  );

}


/* =========================================================
📢 ANÚNCIOS ATIVOS
========================================================= */

async function carregarAnunciosAtivos(){

  const container =
    document.getElementById(
      "anunciosAtivos"
    );


  const section =
    document.getElementById(
      "anunciosAtivosSection"
    );


  if(!container){

    return;

  }


  try{

    if(!supabaseClient){

      iniciarSupabase();

    }


    if(!supabaseClient){

      return;

    }


    const agora =
      new Date()
        .toISOString();


    const { data, error } =
      await supabaseClient
        .from("anuncios")
        .select(`
          id,
          nome,
          empresa,
          tipo,
          mensagem,
          imagem,
          video,
          link,
          "data-inicio",
          "data-fim",
          ativo
        `)
        .eq(
          "ativo",
          true
        )
        .lte(
          "data-inicio",
          agora
        )
        .gte(
          "data-fim",
          agora
        )
        .order(
          "id",
          {
            ascending: false
          }
        );


    if(error){

      console.error(
        "❌ Erro nos anúncios:",
        error
      );

      return;

    }


    if(
      !Array.isArray(data) ||
      data.length === 0
    ){

      container.innerHTML =
        "";

      if(section){

        section.style.display =
          "none";

      }

      return;

    }


    if(section){

      section.style.display =
        "";

    }


    container.innerHTML =
      data
        .map(
          anuncio =>
            criarCardAnuncio(
              anuncio
            )
        )
        .join("");


  }catch(error){

    console.error(
      "❌ Falha ao carregar anúncios:",
      error
    );

  }

}


/* =========================================================
📢 CARD DE ANÚNCIO
========================================================= */

function criarCardAnuncio(anuncio){

  if(!anuncio){
    return "";
  }


  const nome =
    anuncio.empresa ||
    anuncio.nome ||
    "Publicidade";


  const mensagem =
    anuncio.mensagem ||
    "";


  const link =
    anuncio.link ||
    "";


  const imagem =
    anuncio.imagem ||
    "";


  const video =
    anuncio.video ||
    "";


  let media = "";


  if(video){

    media = `
      <video
        class="anuncio-video"
        controls
        preload="metadata"
        playsinline
      >
        <source
          src="${esc(video)}"
        >
        O seu navegador não suporta vídeo.
      </video>
    `;

  }else if(imagem){

    media = `
      <img
        class="anuncio-imagem"
        src="${esc(imagem)}"
        alt="${esc(nome)}"
        loading="lazy"
        onerror="this.style.display='none'"
      >
    `;

  }


  return `

    <article
      class="anuncio-card"
    >

      <div class="anuncio-label">
        📢 Publicidade
      </div>

      ${media}

      <div class="anuncio-conteudo">

        <h3>
          ${esc(nome)}
        </h3>

        ${
          mensagem
            ? `
              <p>
                ${esc(mensagem)}
              </p>
            `
            : ""
        }

        ${
          link
            ? `
              <a
                href="${esc(link)}"
                target="_blank"
                rel="noopener noreferrer sponsored"
                class="anuncio-botao"
              >
                Saber mais →
              </a>
            `
            : ""
        }

      </div>

    </article>

  `;

}


/* =========================================================
📂 MODAIS
========================================================= */

function abrirModal(id){

  if(!id) return;


  const modal =
    document.getElementById(
      id
    );


  if(!modal){

    console.warn(
      "⚠️ Modal não encontrado:",
      id
    );

    return;

  }


  modal.style.display =
    "flex";


  modal.classList.add(
    "ativo"
  );


  document.body.classList.add(
    "modal-aberto"
  );

}


function fecharModal(id){

  if(!id) return;


  const modal =
    document.getElementById(
      id
    );


  if(!modal) return;


  modal.classList.remove(
    "ativo"
  );


  modal.style.display =
    "none";


  document.body.classList.remove(
    "modal-aberto"
  );

}


/* =========================================================
❌ FECHAR MODAL AO CLICAR FORA
========================================================= */

document.addEventListener(
  "click",
  event => {

    if(
      !event.target.classList.contains(
        "modal"
      )
    ){

      return;

    }


    const modal =
      event.target;


    modal.classList.remove(
      "ativo"
    );


    modal.style.display =
      "none";


    document.body.classList.remove(
      "modal-aberto"
    );

  }
);


/* =========================================================
⌨️ FECHAR MODAIS COM ESC
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if(
      event.key !== "Escape"
    ){

      return;

    }


    document
      .querySelectorAll(
        ".modal.ativo"
      )
      .forEach(modal => {

        modal.classList.remove(
          "ativo"
        );

        modal.style.display =
          "none";

      });


    document.body.classList.remove(
      "modal-aberto"
    );

  }
);


/* =========================================================
🌐 REDES SOCIAIS
========================================================= */

function abrirRede(rede){

  const links = {

    google:
      "https://www.google.com/",

    facebook:
      "https://www.facebook.com/",

    youtube:
      "https://www.youtube.com/",

    whatsapp:
      "https://www.whatsapp.com/",

    instagram:
      "https://www.instagram.com/",

    tiktok:
      "https://www.tiktok.com/"

  };


  const url =
    links[
      String(rede)
        .toLowerCase()
    ];


  if(!url){

    console.warn(
      "Rede social desconhecida:",
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
📢 FIM DA PARTE 4
========================================================= */
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 5/5 — EVENTOS, INICIALIZAÇÃO E SERVICE WORKER
========================================================= */


/* =========================================================
🔎 LIGAR PESQUISA
========================================================= */

function iniciarPesquisa(){

  const campos = [
    document.getElementById("searchInput"),
    document.getElementById("pesquisa")
  ];


  campos.forEach(campo => {

    if(!campo) return;


    campo.addEventListener(
      "input",
      function(){

        const termo =
          normalizarTexto(
            this.value
          ).trim();


        /*
         * Pesquisa automática apenas quando
         * o utilizador já escreveu alguma coisa.
         */

        if(termo.length >= 2){

          pesquisar();

        }

      }
    );


    campo.addEventListener(
      "keydown",
      function(event){

        if(
          event.key === "Enter"
        ){

          event.preventDefault();

          pesquisar();

        }

      }
    );

  });

}


/* =========================================================
🎛️ INICIAR BOTÕES PRINCIPAIS
========================================================= */

function iniciarEventos(){

  /* ================================================
  🔔 NOTIFICAÇÕES
  ================================================ */

  const notificationBtn =
    document.getElementById(
      "notificationBtn"
    );


  if(notificationBtn){

    notificationBtn.addEventListener(
      "click",
      abrirNotificacoes
    );

  }


  /* ================================================
  🧰 FERRAMENTAS
  ================================================ */

  const toolsBtn =
    document.getElementById(
      "toolsBtn"
    );


  if(toolsBtn){

    toolsBtn.addEventListener(
      "click",
      abrirFerramentas
    );

  }


  /* ================================================
  👤 UTILIZADOR
  ================================================ */

  const userBtn =
    document.getElementById(
      "userBtn"
    );


  if(userBtn){

    userBtn.addEventListener(
      "click",
      abrirUtilizador
    );

  }


  /* ================================================
  🌙 TEMA
  ================================================ */

  const themeBtn =
    document.getElementById(
      "themeBtn"
    );


  if(themeBtn){

    themeBtn.addEventListener(
      "click",
      alternarTema
    );

  }


  /* ================================================
  🎨 COR
  ================================================ */

  const colorBtn =
    document.getElementById(
      "colorBtn"
    );


  if(colorBtn){

    colorBtn.addEventListener(
      "click",
      escolherCor
    );

  }


  /* ================================================
  🔎 PESQUISA
  ================================================ */

  const searchForm =
    document.getElementById(
      "searchForm"
    );


  if(searchForm){

    searchForm.addEventListener(
      "submit",
      pesquisar
    );

  }


  const searchBtn =
    document.getElementById(
      "searchBtn"
    );


  if(searchBtn){

    searchBtn.addEventListener(
      "click",
      pesquisar
    );

  }


  /* ================================================
  ⭐ FAVORITOS
  ================================================ */

  document.addEventListener(
    "click",
    event => {

      const botao =
        event.target.closest(
          "[data-favorito-id]"
        );


      if(!botao){
        return;
      }


      event.preventDefault();

      event.stopPropagation();


      const id =
        botao.dataset.favoritoId;


      alternarFavorito(id);

    }
  );


  /* ================================================
  📋 COPIAR LINK
  ================================================ */

  document
    .querySelectorAll(
      "[data-copiar-link]"
    )
    .forEach(botao => {

      botao.addEventListener(
        "click",
        copiarLink
      );

    });


  /* ================================================
  📱 INSTALAR APP
  ================================================ */

  document
    .querySelectorAll(
      "[data-instalar]"
    )
    .forEach(botao => {

      botao.addEventListener(
        "click",
        instalarAfricanMundo
      );

    });


  /* ================================================
  🔄 ATUALIZAR NOTÍCIAS
  ================================================ */

  document
    .querySelectorAll(
      "[data-atualizar-noticias]"
    )
    .forEach(botao => {

      botao.addEventListener(
        "click",
        atualizarNoticias
      );

    });


  /* ================================================
  ⭐ MOSTRAR FAVORITOS
  ================================================ */

  document
    .querySelectorAll(
      "[data-mostrar-favoritos]"
    )
    .forEach(botao => {

      botao.addEventListener(
        "click",
        mostrarFavoritos
      );

    });


  console.log(
    "🎛️ Eventos do AfricanMundo iniciados."
  );

}


/* =========================================================
📱 MENU MOBILE
========================================================= */

function iniciarMenuMobile(){

  const botoes =
    document.querySelectorAll(
      "[data-menu-toggle]"
    );


  botoes.forEach(botao => {

    botao.addEventListener(
      "click",
      () => {

        const alvoId =
          botao.dataset.menuToggle;


        const menu =
          document.getElementById(
            alvoId
          );


        if(!menu){
          return;
        }


        menu.classList.toggle(
          "ativo"
        );


        botao.classList.toggle(
          "ativo"
        );

      }
    );

  });

}


/* =========================================================
⬆️ BOTÃO VOLTAR AO TOPO
========================================================= */

function criarBotaoTopo(){

  if(
    document.getElementById(
      "btnTopo"
    )
  ){

    return;

  }


  const botao =
    document.createElement(
      "button"
    );


  botao.id =
    "btnTopo";


  botao.type =
    "button";


  botao.innerHTML =
    "↑";


  botao.setAttribute(
    "aria-label",
    "Voltar ao topo"
  );


  botao.title =
    "Voltar ao topo";


  botao.style.display =
    "none";


  botao.addEventListener(
    "click",
    () => {

      window.scrollTo({

        top: 0,

        behavior: "smooth"

      });

    }
  );


  document.body.appendChild(
    botao
  );


  window.addEventListener(
    "scroll",
    () => {

      if(
        window.scrollY > 500
      ){

        botao.style.display =
          "flex";

      }else{

        botao.style.display =
          "none";

      }

    },
    {
      passive: true
    }
  );

}


/* =========================================================
🖼️ MELHORAR COMPORTAMENTO DAS IMAGENS
========================================================= */

function prepararImagens(){

  document
    .querySelectorAll(
      "img"
    )
    .forEach(img => {

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

    });

}


/* =========================================================
🔗 SERVICE WORKER / PWA
========================================================= */

function registrarServiceWorker(){

  if(
    !("serviceWorker" in navigator)
  ){

    console.log(
      "ℹ️ Service Worker não suportado."
    );

    return;

  }


  /*
   * Mantemos o caminho compatível
   * com o GitHub Pages do AfricanMundo.
   */

  const caminhoSW =
    "/Africanmundo-/sw.js";


  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register(
          caminhoSW
        )
        .then(
          registro => {

            console.log(
              "✅ Service Worker registado:",
              registro.scope
            );

          }
        )
        .catch(
          erro => {

            console.warn(
              "⚠️ Service Worker não foi registado:",
              erro
            );

          }
        );

    }
  );

}


/* =========================================================
🌐 ATUALIZAR ANO DO RODAPÉ
========================================================= */

function atualizarAno(){

  const ano =
    new Date()
      .getFullYear();


  document
    .querySelectorAll(
      "[data-ano-atual]"
    )
    .forEach(elemento => {

      elemento.textContent =
        ano;

    });

}


/* =========================================================
📡 VERIFICAR INTERNET
========================================================= */

function iniciarMonitorInternet(){

  function atualizarEstado(){

    if(
      !navigator.onLine
    ){

      console.warn(
        "📡 AfricanMundo: sem ligação à internet."
      );

      return;

    }


    console.log(
      "📡 AfricanMundo: ligação à internet disponível."
    );

  }


  window.addEventListener(
    "online",
    atualizarEstado
  );


  window.addEventListener(
    "offline",
    atualizarEstado
  );

}


/* =========================================================
🛡️ EVITAR ERROS VISUAIS DE LINKS
========================================================= */

function verificarLinksInternos(){

  document
    .querySelectorAll(
      "a[href]"
    )
    .forEach(link => {

      const href =
        link.getAttribute(
          "href"
        );


      if(!href){
        return;
      }


      /*
       * Não alteramos links externos,
       * WhatsApp, telefone, email ou âncoras.
       */

      if(
        href.startsWith(
          "http"
        ) ||
        href.startsWith(
          "mailto:"
        ) ||
        href.startsWith(
          "tel:"
        ) ||
        href.startsWith(
          "#"
        )
      ){

        return;

      }


      link.addEventListener(
        "click",
        () => {

          console.log(
            "🔗 Abrindo:",
            href
          );

        }
      );

    });

}


/* =========================================================
🧹 LIMPEZA FINAL DO CARREGAMENTO
========================================================= */

function finalizarInicializacao(){

  prepararImagens();

  atualizarAno();

  criarBotaoTopo();

  iniciarMenuMobile();

  iniciarMonitorInternet();

  verificarLinksInternos();

  atualizarBotoesFavoritos();

}


/* =========================================================
🚀 INICIALIZAÇÃO PRINCIPAL
========================================================= */

async function iniciarAfricanMundo(){

  console.log(
    "🌍 AfricanMundo — a iniciar..."
  );


  /*
   * Primeiro carregamos as preferências
   * do utilizador para evitar alterações
   * visuais depois da página aparecer.
   */

  carregarTema();

  carregarCor();


  /*
   * Inicializa eventos.
   */

  iniciarEventos();

  iniciarPesquisa();


  /*
   * Inicializa funcionalidades auxiliares.
   */

  finalizarInicializacao();


  /*
   * Regista o PWA.
   */

  registrarServiceWorker();


  /*
   * Carrega anúncios e notícias
   * em paralelo.
   */

  await Promise.allSettled([

    carregarNoticias(),

    carregarAnunciosAtivos()

  ]);


  console.log(
    "✅ AfricanMundo totalmente iniciado."
  );

}


/* =========================================================
🚀 DOM READY
========================================================= */

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


/* =========================================================
🛡️ ERRO GLOBAL — NÃO DEIXAR A PÁGINA PARAR
========================================================= */

window.addEventListener(
  "error",
  event => {

    console.error(
      "❌ AfricanMundo — erro:",
      event.error ||
      event.message
    );

  }
);


/* =========================================================
🛡️ PROMISES NÃO TRATADAS
========================================================= */

window.addEventListener(
  "unhandledrejection",
  event => {

    console.error(
      "❌ AfricanMundo — erro assíncrono:",
      event.reason
    );

  }
);


/* =========================================================
🌍 AFRICANMUNDO — APP.JS
FIM DO ARQUIVO
========================================================= */

console.log(
  "🌍 AfricanMundo app.js carregado — versão profissional."
);
