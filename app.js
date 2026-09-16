/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 1/5 — CONFIGURAÇÃO E BASE
========================================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";


/* =========================================================
⚙️ ESTADO GLOBAL
========================================================= */

let db = null;
let supabaseClient = null;

let carregandoNoticias = false;
let noticiasCarregadas = false;
let ultimaAtualizacaoNoticias = null;

window.__noticias = [];

let paginaAtual = 1;
const quantidadeNoticiasPorPagina = 6;


/* =========================================================
🌍 PAÍSES DE ÁFRICA
========================================================= */

const PAISES_AFRICA = {

  "Moçambique": [
    "moçambique",
    "mocambique",
    "mozambique",
    "maputo",
    "matola",
    "beira",
    "nampula",
    "quelimane",
    "tete",
    "chimoio",
    "pemba",
    "inhambane",
    "xai-xai",
    "niassa",
    "cabo delgado",
    "gaza",
    "manica",
    "zambezia",
    "sofala"
  ],

  "África do Sul": [
    "áfrica do sul",
    "africa do sul",
    "south africa",
    "johannesburg",
    "cape town",
    "pretoria",
    "durban",
    "soweto"
  ],

  "Angola": [
    "angola",
    "luanda",
    "huambo",
    "benguela",
    "cabinda",
    "lubango"
  ],

  "Zimbabwe": [
    "zimbabwe",
    "harare",
    "bulawayo"
  ],

  "Malawi": [
    "malawi",
    "lilongwe",
    "blantyre",
    "mzuzu"
  ],

  "Tanzânia": [
    "tanzania",
    "tanzânia",
    "dar es salaam",
    "dodoma",
    "zanzibar"
  ],

  "Zâmbia": [
    "zambia",
    "zâmbia",
    "lusaka",
    "kitwe",
    "ndola"
  ],

  "Quénia": [
    "kenya",
    "quénia",
    "nairobi",
    "mombasa",
    "kisumu"
  ],

  "Nigéria": [
    "nigeria",
    "nigéria",
    "lagos",
    "abuja",
    "kano",
    "ibadan"
  ],

  "Gana": [
    "ghana",
    "accra",
    "kumasi"
  ],

  "Uganda": [
    "uganda",
    "kampala",
    "entebbe"
  ],

  "RDC": [
    "democratic republic of the congo",
    "democratic republic of congo",
    "dr congo",
    "drc",
    "república democrática do congo",
    "kinshasa",
    "goma"
  ],

  "República do Congo": [
    "republic of congo",
    "congo-brazzaville",
    "brazzaville"
  ],

  "Etiópia": [
    "ethiopia",
    "etiópia",
    "addis ababa"
  ],

  "Somália": [
    "somalia",
    "somália",
    "mogadishu"
  ],

  "Sudão": [
    "sudan",
    "sudão",
    "khartoum"
  ],

  "Sudão do Sul": [
    "south sudan",
    "sudão do sul",
    "juba"
  ],

  "Egito": [
    "egypt",
    "egito",
    "cairo",
    "alexandria"
  ],

  "Marrocos": [
    "morocco",
    "marrocos",
    "rabat",
    "casablanca",
    "marrakech"
  ],

  "Argélia": [
    "algeria",
    "argélia",
    "algiers"
  ],

  "Tunísia": [
    "tunisia",
    "tunísia",
    "tunis"
  ],

  "Senegal": [
    "senegal",
    "dakar"
  ],

  "Costa do Marfim": [
    "ivory coast",
    "côte d'ivoire",
    "costa do marfim",
    "abidjan"
  ],

  "Camarões": [
    "cameroon",
    "camarões",
    "yaoundé",
    "douala"
  ],

  "Ruanda": [
    "rwanda",
    "ruanda",
    "kigali"
  ],

  "Botswana": [
    "botswana",
    "gaborone"
  ],

  "Namíbia": [
    "namibia",
    "namíbia",
    "windhoek"
  ],

  "Lesoto": [
    "lesotho",
    "maseru"
  ],

  "Eswatini": [
    "eswatini",
    "mbabane"
  ],

  "Madagáscar": [
    "madagascar",
    "madagáscar",
    "antananarivo"
  ]

};


/* =========================================================
🧰 FUNÇÕES BÁSICAS
========================================================= */

function normalizarTexto(texto){

  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

}


function esc(valor){

  return String(valor || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function obterTitulo(n){

  return String(
    n?.titulo ||
    n?.title ||
    "Sem título"
  ).trim();

}


function obterTexto(n){

  return String(
    n?.texto ||
    n?.description ||
    n?.content ||
    ""
  ).trim();

}


function obterImagem(n){

  return String(
    n?.imagem ||
    n?.image ||
    n?.image_url ||
    n?.thumbnail ||
    ""
  ).trim();

}


function obterData(n){

  return (
    n?.data ||
    n?.published ||
    n?.published_at ||
    ""
  );

}


function resumoTexto(texto, limite = 150){

  const limpo =
    String(texto || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

  if(!limpo){

    return "Leia esta notícia no AfricanMundo.";

  }

  if(limpo.length <= limite){

    return limpo;

  }

  return (
    limpo.substring(0, limite).trim() +
    "..."
  );

}


/* =========================================================
🗄️ SUPABASE
========================================================= */

function iniciarSupabase(){

  try{

    if(
      typeof supabase === "undefined"
    ){

      console.error(
        "❌ Biblioteca Supabase não encontrada."
      );

      return false;

    }

    db =
      supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    supabaseClient = db;

    console.log(
      "✅ Supabase inicializado."
    );

    return true;

  }catch(error){

    console.error(
      "❌ Erro ao inicializar Supabase:",
      error
    );

    return false;

  }

}


/* =========================================================
🌍 IDENTIFICAR PAÍS
========================================================= */

function descobrirPais(n){

  const texto =
    normalizarTexto(
      [
        obterTitulo(n),
        obterTexto(n),
        n?.fonte || "",
        n?.categoria || ""
      ].join(" ")
    );

  for(
    const [pais, palavras]
    of Object.entries(PAISES_AFRICA)
  ){

    for(
      const palavra
      of palavras
    ){

      if(
        texto.includes(
          normalizarTexto(palavra)
        )
      ){

        return pais;

      }

    }

  }

  return "";

}


function ehAfricana(n){

  return Boolean(
    descobrirPais(n)
  );

}


/* =========================================================
🗂️ CATEGORIAS
========================================================= */

function descobrirCategoria(n){

  const texto =
    normalizarTexto(
      [
        obterTitulo(n),
        obterTexto(n),
        n?.categoria || ""
      ].join(" ")
    );


  if(
    /futebol|football|soccer|premier league|champions|afcon/.test(texto)
  ){

    return "Futebol";

  }


  if(
    /desporto|esporte|sport|olimpi|atleta|basquete|basketball|rugby|tennis/.test(texto)
  ){

    return "Desporto";

  }


  if(
    /politica|presidente|governo|eleicao|eleições|parlamento|ministro|partido/.test(texto)
  ){

    return "Política";

  }


  if(
    /economia|economy|business|negocio|negócio|empresa|mercado|investimento|financas|finanças|banco/.test(texto)
  ){

    return "Negócios e Economia";

  }


  if(
    /saude|saúde|health|hospital|medico|médico|doenca|doença|vacina|medicine/.test(texto)
  ){

    return "Saúde";

  }


  if(
    /educacao|educação|education|escola|universidade|estudante|professor|ensino/.test(texto)
  ){

    return "Educação";

  }


  if(
    /emprego|job|jobs|employment|oportunidade|oportunidades|vaga|trabalho|career|carreira/.test(texto)
  ){

    return "Emprego e Oportunidades";

  }


  if(
    /cultura|culture|musica|música|cinema|filme|arte|artista|celebridade|entertainment|entretenimento/.test(texto)
  ){

    return "Cultura e Entretenimento";

  }


  if(
    /ambiente|environment|clima|climate|seca|secas|chuva|inundacao|inundação|poluicao|poluição/.test(texto)
  ){

    return "Ambiente";

  }


  if(
    /desenvolvimento|development|infraestrutura|estrada|energia|agua|água|construcao|construção/.test(texto)
  ){

    return "Desenvolvimento";

  }


  if(
    /sociedade|community|comunidade|social|crime|acidente|protesto|familia|família|local/.test(texto)
  ){

    return "Sociedade e Comunidade";

  }


  return (
    n?.categoria ||
    "Atualidade"
  );

}


/* =========================================================
🏷️ BADGES
========================================================= */

function criarBadgePais(n){

  const pais =
    descobrirPais(n);

  if(!pais){

    return "";

  }

  return `
    <span class="badge-pais">
      🌍 ${esc(pais)}
    </span>
  `;

}


function criarBadgeCategoria(n){

  const categoria =
    descobrirCategoria(n);

  return `
    <span class="badge-categoria">
      ${esc(categoria)}
    </span>
  `;

    }
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 2/5 — CARDS, IMAGENS E ORGANIZAÇÃO
========================================================= */


/* =========================================================
🖼️ IMAGEM FALLBACK
========================================================= */

function imagemFallback(img){

  if(!img){

    return `
      <div
        class="imagem-fallback"
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          min-height:180px;
          background:linear-gradient(135deg,#168a45,#0b5d32);
          color:white;
          font-size:48px;
        "
      >
        🌍
      </div>
    `;

  }


  return `
    <img
      src="${esc(img)}"
      alt="AfricanMundo"
      loading="lazy"
      decoding="async"
      onerror="
        this.onerror=null;
        this.style.display='none';
        if(this.nextElementSibling){
          this.nextElementSibling.style.display='flex';
        }
      "
    >

    <div
      class="imagem-fallback"
      style="
        display:none;
        align-items:center;
        justify-content:center;
        min-height:180px;
        background:linear-gradient(135deg,#168a45,#0b5d32);
        color:white;
        font-size:48px;
      "
    >
      🌍
    </div>
  `;

}


/* =========================================================
📰 ABRIR NOTÍCIA
========================================================= */

function abrirNoticia(id){

  if(
    id === undefined ||
    id === null
  ){

    return;

  }


  window.location.href =
    `noticia.html?id=${encodeURIComponent(id)}`;

}


function abrirNoticiaPorId(id){

  abrirNoticia(id);

}


/* =========================================================
📰 CRIAR CARD DE NOTÍCIA
========================================================= */

function criarCard(
  n,
  destaque = false
){

  if(!n){

    return "";

  }


  const id =
    n.id;


  const titulo =
    obterTitulo(n);


  const texto =
    resumoTexto(
      obterTexto(n),
      destaque
        ? 230
        : 145
    );


  const imagem =
    obterImagem(n);


  const fonte =
    n.fonte ||
    "AfricanMundo";


  const data =
    obterData(n);


  const favorito =
    isFavorito(id);


  return `

    <article
      class="
        compact-card
        ${destaque ? "featured" : ""}
      "
      data-noticia-id="${esc(id)}"
    >

      <div
        class="compact-card-image"
        style="
          position:relative;
          overflow:hidden;
        "
      >

        ${imagemFallback(imagem)}

      </div>


      <div class="compact-card-content">

        <div class="card-badges">

          ${criarBadgePais(n)}

          ${criarBadgeCategoria(n)}

        </div>


        <h3>

          <a
            href="noticia.html?id=${encodeURIComponent(id)}"
          >
            ${esc(titulo)}
          </a>

        </h3>


        <p>
          ${esc(texto)}
        </p>


        <div class="card-meta">

          <span>
            ${esc(fonte)}
          </span>

          ${
            data
              ? `
                <span>
                  ${formatarData(data)}
                </span>
              `
              : ""
          }

        </div>


        <div class="card-acoes">

          <button
            type="button"
            class="favorito-btn"
            data-favorito-id="${esc(id)}"
            aria-label="${
              favorito
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
            }"
          >
            ${favorito ? "⭐" : "☆"}
          </button>


          <button
            type="button"
            class="partilhar-btn"
            data-partilhar-id="${esc(id)}"
            aria-label="Partilhar notícia"
          >
            🔗
          </button>

        </div>

      </div>

    </article>

  `;

}


/* =========================================================
📰 RENDERIZAR LISTA
========================================================= */

function renderizarLista(
  container,
  lista,
  limite = 0
){

  if(!container){

    return;

  }


  if(!Array.isArray(lista)){

    lista = [];

  }


  const dados =
    limite > 0
      ? lista.slice(0, limite)
      : lista;


  if(!dados.length){

    container.innerHTML = `
      <div class="sem-noticias">
        📰 Ainda não existem notícias nesta secção.
      </div>
    `;

    return;

  }


  container.innerHTML =
    dados
      .map(
        n =>
          criarCard(n)
      )
      .join("");

}


/* =========================================================
⭐ DESTAQUE
========================================================= */

function renderizarDestaque(lista){

  const container =
    document.getElementById(
      "destaque"
    );


  if(!container){

    return;

  }


  if(
    !Array.isArray(lista) ||
    !lista.length
  ){

    container.innerHTML = `
      <div class="sem-noticias">
        📰 Nenhuma notícia em destaque.
      </div>
    `;

    return;

  }


  container.innerHTML =
    criarCard(
      lista[0],
      true
    );

}


/* =========================================================
🔀 EMBARALHAR
========================================================= */

function embaralhar(lista){

  return [
    ...(lista || [])
  ].sort(
    () =>
      Math.random() - 0.5
  );

}


/* =========================================================
🧹 REMOVER DUPLICADOS
========================================================= */

function removerDuplicados(lista){

  const vistos =
    new Set();


  if(!Array.isArray(lista)){

    return [];

  }


  return lista.filter(
    n => {

      const chave =
        n.id ||
        n.url_original ||
        n.id_externo ||
        obterTitulo(n);


      if(vistos.has(chave)){

        return false;

      }


      vistos.add(chave);

      return true;

    }
  );

}


/* =========================================================
🌍 FILTRAR POR PAÍS
========================================================= */

function filtrarPorPais(
  lista,
  pais
){

  return (
    lista || []
  ).filter(
    n =>
      descobrirPais(n) === pais
  );

}


/* =========================================================
🗂️ FILTRAR POR CATEGORIA
========================================================= */

function filtrarPorCategoria(
  lista,
  categoria
){

  return (
    lista || []
  ).filter(
    n =>
      descobrirCategoria(n) === categoria
  );

}


/* =========================================================
📂 ORGANIZAR POR CATEGORIA
========================================================= */

function organizarPorCategoria(lista){

  const resultado = {};


  if(!Array.isArray(lista)){

    return resultado;

  }


  lista.forEach(
    n => {

      const categoria =
        descobrirCategoria(n);


      if(!resultado[categoria]){

        resultado[categoria] = [];

      }


      resultado[categoria].push(n);

    }
  );


  return resultado;

}


/* =========================================================
🌍 ORGANIZAR POR PAÍS
========================================================= */

function organizarPorPais(lista){

  const resultado = {};


  if(!Array.isArray(lista)){

    return resultado;

  }


  lista.forEach(
    n => {

      const pais =
        descobrirPais(n) ||
        "África";


      if(!resultado[pais]){

        resultado[pais] = [];

      }


      resultado[pais].push(n);

    }
  );


  return resultado;

}


/* =========================================================
📅 FORMATAR DATA
========================================================= */

function formatarData(data){

  if(!data){

    return "";

  }


  try{

    const d =
      new Date(data);


    if(
      Number.isNaN(
        d.getTime()
      )
    ){

      return "";

    }


    return d.toLocaleDateString(
      "pt-PT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }
    );

  }catch{

    return "";

  }

}


/* =========================================================
⏳ INDICADOR DE CARREGAMENTO
========================================================= */

function mostrarCarregamento(){

  const ids = [

    "destaque",
    "ultimas",
    "futebol",
    "mocambique",
    "africa",
    "negocios",
    "entretenimento",
    "desporto"

  ];


  ids.forEach(
    id => {

      const elemento =
        document.getElementById(
          id
        );


      if(!elemento){

        return;

      }


      elemento.innerHTML = `

        <div class="carregando">

          <div class="spinner"></div>

          <p>
            ⏳ A carregar notícias...
          </p>

        </div>

      `;

    }
  );

}


/* =========================================================
⚠️ ERRO DE NOTÍCIAS
========================================================= */

function mostrarErroNoticias(
  mensagem
){

  const ids = [

    "destaque",
    "ultimas"

  ];


  ids.forEach(
    id => {

      const elemento =
        document.getElementById(
          id
        );


      if(!elemento){

        return;

      }


      elemento.innerHTML = `

        <div class="erro-noticias">

          <strong>
            ⚠️ Não foi possível carregar as notícias.
          </strong>

          <p>
            ${esc(
              mensagem ||
              "Tente novamente."
            )}
          </p>

          <button
            type="button"
            onclick="atualizarNoticias()"
          >
            🔄 Tentar novamente
          </button>

        </div>

      `;

    }
  );

}


/* =========================================================
📊 FIM DA PARTE 2
========================================================= */
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 3/5 — CARREGAMENTO E RENDERIZAÇÃO DAS NOTÍCIAS
========================================================= */


/* =========================================================
📰 CARREGAR NOTÍCIAS DO SUPABASE
========================================================= */

async function carregarNoticias(){

  if(carregandoNoticias){

    console.log(
      "⏳ Já existe um carregamento em andamento."
    );

    return window.__noticias || [];

  }


  carregandoNoticias = true;

  mostrarCarregamento();


  try{

    if(!supabaseClient){

      const iniciado =
        iniciarSupabase();


      if(!iniciado){

        throw new Error(
          "Supabase não foi inicializado."
        );

      }

    }


    console.log(
      "📰 A procurar notícias no Supabase..."
    );


    const {
      data,
      error
    } =
      await supabaseClient
        .from("noticias")
        .select(`
          id,
          titulo,
          imagem,
          categoria,
          texto,
          data,
          fonte,
          url_original,
          id_externo,
          visualizacoes
        `)
        .order(
          "data",
          {
            ascending: false
          }
        )
        .limit(100);


    if(error){

      console.error(
        "❌ Erro Supabase:",
        error
      );

      throw error;

    }


    let noticias =
      Array.isArray(data)
        ? data
        : [];


    console.log(
      `📰 ${noticias.length} notícias recebidas.`
    );


    /* =====================================================
    🧹 LIMPAR DUPLICADOS
    ===================================================== */

    noticias =
      removerDuplicados(
        noticias
      );


    /* =====================================================
    📅 GARANTIR ORDEM POR DATA
    ===================================================== */

    noticias.sort(
      (a,b) => {

        const da =
          new Date(
            a?.data || 0
          ).getTime();


        const dbData =
          new Date(
            b?.data || 0
          ).getTime();


        return dbData - da;

      }
    );


    /* =====================================================
    💾 GUARDAR GLOBALMENTE
    ===================================================== */

    window.__noticias =
      noticias;


    noticiasCarregadas =
      true;


    ultimaAtualizacaoNoticias =
      new Date();


    console.log(
      `✅ ${noticias.length} notícias prontas.`
    );


    /* =====================================================
    🎨 RENDERIZAR
    ===================================================== */

    renderizarPagina(
      noticias
    );


    return noticias;


  }catch(error){

    console.error(
      "❌ Falha ao carregar notícias:",
      error
    );


    window.__noticias =
      [];


    noticiasCarregadas =
      false;


    mostrarErroNoticias(
      error?.message ||
      "Erro ao carregar notícias."
    );


    return [];


  }finally{

    carregandoNoticias =
      false;

  }

}


/* =========================================================
🎨 RENDERIZAR TODA A PÁGINA
========================================================= */

function renderizarPagina(
  noticias
){

  if(!Array.isArray(noticias)){

    noticias = [];

  }


  console.log(
    "🎨 A renderizar página..."
  );


  /* =====================================================
  ⭐ DESTAQUE
  ===================================================== */

  const destaque =
    noticias.slice(
      0,
      1
    );


  renderizarDestaque(
    destaque
  );


  /* =====================================================
  📰 ÚLTIMAS
  ===================================================== */

  const ultimas =
    noticias.slice(
      1,
      7
    );


  renderizarLista(
    document.getElementById(
      "ultimas"
    ),
    ultimas
  );


  /* =====================================================
  ⚽ FUTEBOL
  ===================================================== */

  const futebol =
    noticias.filter(
      n => {

        const texto =
          normalizarTexto(
            `${n?.categoria || ""} ${n?.titulo || ""} ${n?.texto || ""}`
          );


        return (
          texto.includes("futebol") ||
          texto.includes("football") ||
          texto.includes("soccer") ||
          texto.includes("champions") ||
          texto.includes("premier league") ||
          texto.includes("liga") ||
          texto.includes("afcon")
        );

      }
    );


  renderizarLista(
    document.getElementById(
      "futebol"
    ),
    embaralhar(
      futebol
    ).slice(
      0,
      4
    )
  );


  /* =====================================================
  🇲🇿 MOÇAMBIQUE
  ===================================================== */

  const mocambique =
    filtrarPorPais(
      noticias,
      "Moçambique"
    );


  renderizarLista(
    document.getElementById(
      "mocambique"
    ),
    embaralhar(
      mocambique
    ).slice(
      0,
      4
    )
  );


  /* =====================================================
  🌍 ÁFRICA
  ===================================================== */

  const africa =
    noticias.filter(
      n =>
        ehAfricana(n)
    );


  renderizarLista(
    document.getElementById(
      "africa"
    ),
    embaralhar(
      africa
    ).slice(
      0,
      4
    )
  );


  /* =====================================================
  💼 NEGÓCIOS
  ===================================================== */

  const negocios =
    noticias.filter(
      n => {

        const texto =
          normalizarTexto(
            `${n?.categoria || ""} ${n?.titulo || ""} ${n?.texto || ""}`
          );


        return (
          texto.includes("negócio") ||
          texto.includes("negocios") ||
          texto.includes("economia") ||
          texto.includes("business") ||
          texto.includes("finance") ||
          texto.includes("mercado") ||
          texto.includes("investimento") ||
          texto.includes("emprego") ||
          texto.includes("trabalho")
        );

      }
    );


  renderizarLista(
    document.getElementById(
      "negocios"
    ),
    embaralhar(
      negocios
    ).slice(
      0,
      4
    )
  );


  /* =====================================================
  🎬 ENTRETENIMENTO
  ===================================================== */

  const entretenimento =
    noticias.filter(
      n => {

        const texto =
          normalizarTexto(
            `${n?.categoria || ""} ${n?.titulo || ""} ${n?.texto || ""}`
          );


        return (
          texto.includes("entretenimento") ||
          texto.includes("entertainment") ||
          texto.includes("cinema") ||
          texto.includes("filme") ||
          texto.includes("música") ||
          texto.includes("musica") ||
          texto.includes("celebridade") ||
          texto.includes("celebrity") ||
          texto.includes("artista") ||
          texto.includes("art")
        );

      }
    );


  renderizarLista(
    document.getElementById(
      "entretenimento"
    ),
    embaralhar(
      entretenimento
    ).slice(
      0,
      4
    )
  );


  /* =====================================================
  🏅 DESPORTO
  ===================================================== */

  const desporto =
    noticias.filter(
      n => {

        const texto =
          normalizarTexto(
            `${n?.categoria || ""} ${n?.titulo || ""} ${n?.texto || ""}`
          );


        return (
          texto.includes("desporto") ||
          texto.includes("desporto") ||
          texto.includes("sport") ||
          texto.includes("sports") ||
          texto.includes("atleta") ||
          texto.includes("olímpico") ||
          texto.includes("olimpico") ||
          texto.includes("rugby") ||
          texto.includes("basquetebol") ||
          texto.includes("basketball") ||
          texto.includes("ténis") ||
          texto.includes("tennis")
        );

      }
    );


  renderizarLista(
    document.getElementById(
      "desporto"
    ),
    embaralhar(
      desporto
    ).slice(
      0,
      4
    )
  );


  /* =====================================================
  📢 ANÚNCIOS
  ===================================================== */

  if(
    typeof carregarAnunciosAtivos ===
    "function"
  ){

    carregarAnunciosAtivos();

  }


  console.log(
    "✅ Página renderizada."
  );

}


/* =========================================================
🔄 ATUALIZAR NOTÍCIAS
========================================================= */

async function atualizarNoticias(){

  console.log(
    "🔄 A atualizar notícias..."
  );


  noticiasCarregadas =
    false;


  const noticias =
    await carregarNoticias();


  if(
    noticias &&
    noticias.length
  ){

    console.log(
      "✅ Notícias atualizadas."
    );

  }

}


/* =========================================================
🔎 PESQUISA DE NOTÍCIAS
========================================================= */

function pesquisarNoticias(
  termo
){

  termo =
    normalizarTexto(
      termo
    );


  if(!termo){

    renderizarPagina(
      window.__noticias || []
    );

    return;

  }


  const resultado =
    (
      window.__noticias || []
    ).filter(
      n => {

        const texto =
          normalizarTexto(
            [
              n?.titulo,
              n?.texto,
              n?.categoria,
              n?.fonte,
              descobrirPais(n)
            ]
              .filter(Boolean)
              .join(" ")
          );


        return texto.includes(
          termo
        );

      }
    );


  console.log(
    `🔎 Pesquisa "${termo}": ${resultado.length} resultados.`
  );


  const container =
    document.getElementById(
      "ultimas"
    );


  if(!container){

    return;

  }


  if(!resultado.length){

    container.innerHTML = `

      <div class="sem-noticias">

        🔎 Nenhuma notícia encontrada
        para "<strong>${esc(termo)}</strong>".

      </div>

    `;

    return;

  }


  renderizarLista(
    container,
    resultado
  );

}


/* =========================================================
🔎 PESQUISA — ALIAS
========================================================= */

function pesquisar(
  termo
){

  pesquisarNoticias(
    termo
  );

}


/* =========================================================
⭐ FAVORITOS
========================================================= */

function obterFavoritos(){

  try{

    return JSON.parse(
      localStorage.getItem(
        "africanmundo_favoritos"
      ) || "[]"
    );

  }catch{

    return [];

  }

}


function salvarFavoritos(
  favoritos
){

  try{

    localStorage.setItem(
      "africanmundo_favoritos",
      JSON.stringify(
        favoritos
      )
    );

  }catch(error){

    console.warn(
      "⚠️ Não foi possível guardar favoritos:",
      error
    );

  }

}


function isFavorito(
  id
){

  const favoritos =
    obterFavoritos();


  return favoritos.some(
    favorito =>
      String(favorito) ===
      String(id)
  );

}


function alternarFavorito(
  id
){

  if(
    id === undefined ||
    id === null
  ){

    return;

  }


  let favoritos =
    obterFavoritos();


  const indice =
    favoritos.findIndex(
      favorito =>
        String(favorito) ===
        String(id)
    );


  if(indice >= 0){

    favoritos.splice(
      indice,
      1
    );

    console.log(
      "⭐ Removido dos favoritos."
    );

  }else{

    favoritos.push(
      id
    );

    console.log(
      "⭐ Adicionado aos favoritos."
    );

  }


  salvarFavoritos(
    favoritos
  );


  /* Atualizar visual dos botões */

  document
    .querySelectorAll(
      `[data-favorito-id="${CSS.escape(String(id))}"]`
    )
    .forEach(
      botao => {

        const ativo =
          isFavorito(id);


        botao.textContent =
          ativo
            ? "⭐"
            : "☆";


        botao.setAttribute(
          "aria-label",
          ativo
            ? "Remover dos favoritos"
            : "Adicionar aos favoritos"
        );

      }
    );

}


/* =========================================================
⭐ MOSTRAR FAVORITOS
========================================================= */

function mostrarFavoritos(){

  const favoritos =
    obterFavoritos();


  const noticias =
    (
      window.__noticias || []
    ).filter(
      n =>
        favoritos.some(
          id =>
            String(id) ===
            String(n.id)
        )
    );


  const container =
    document.getElementById(
      "ultimas"
    );


  if(!container){

    return;

  }


  if(!noticias.length){

    container.innerHTML = `

      <div class="sem-noticias">

        ⭐ Ainda não existem notícias
        guardadas nos favoritos.

      </div>

    `;

    return;

  }


  renderizarLista(
    container,
    noticias
  );

}


/* =========================================================
🖱️ EVENTOS DOS CARDS
========================================================= */

document.addEventListener(
  "click",
  function(event){

    const favorito =
      event.target.closest(
        "[data-favorito-id]"
      );


    if(favorito){

      event.preventDefault();
      event.stopPropagation();


      alternarFavorito(
        favorito.dataset.favoritoId
      );


      return;

    }


    const partilhar =
      event.target.closest(
        "[data-partilhar-id]"
      );


    if(partilhar){

      event.preventDefault();
      event.stopPropagation();


      const id =
        partilhar.dataset.partilharId;


      if(
        typeof partilharNoticia ===
        "function"
      ){

        partilharNoticia(
          id
        );

      }


      return;

    }

  }
);


/* =========================================================
📊 FIM DA PARTE 3
========================================================= */
/* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 4/5 — PARTILHA, PWA, TEMA, CORES E ANÚNCIOS
========================================================= */


/* =========================================================
🔗 PARTILHAR NOTÍCIA
========================================================= */

async function partilharNoticia(id){

  const noticia =
    (window.__noticias || [])
      .find(
        n =>
          String(n.id) ===
          String(id)
      );


  if(!noticia){

    return;

  }


  const titulo =
    obterTitulo(noticia);


  const url =
    `${window.location.origin}${window.location.pathname.replace(
      /index\.html$/,
      ""
    )}noticia.html?id=${encodeURIComponent(id)}`;


  const texto =
    `${titulo} — AfricanMundo`;


  try{

    if(
      navigator.share
    ){

      await navigator.share({
        title: titulo,
        text: texto,
        url: url
      });


      return;

    }


    await navigator.clipboard.writeText(
      url
    );


    alert(
      "🔗 Link da notícia copiado."
    );


  }catch(error){

    console.warn(
      "Partilha cancelada ou indisponível:",
      error
    );

  }

}


/* =========================================================
📋 COPIAR TEXTO
========================================================= */

async function copiarTexto(
  texto
){

  if(!texto){

    return;

  }


  try{

    await navigator.clipboard.writeText(
      texto
    );


    alert(
      "✅ Texto copiado."
    );

  }catch(error){

    console.error(
      "Erro ao copiar texto:",
      error
    );

  }

}


/* =========================================================
🔗 COPIAR LINK
========================================================= */

async function copiarLink(
  url
){

  if(!url){

    return;

  }


  try{

    await navigator.clipboard.writeText(
      url
    );


    alert(
      "✅ Link copiado."
    );

  }catch(error){

    console.error(
      "Erro ao copiar link:",
      error
    );

  }

}


/* =========================================================
📲 INSTALAÇÃO PWA
========================================================= */

let eventoInstalacao =
  null;


window.addEventListener(
  "beforeinstallprompt",
  function(event){

    event.preventDefault();

    eventoInstalacao =
      event;


    console.log(
      "📲 Instalação do AfricanMundo disponível."
    );


    const botao =
      document.getElementById(
        "installBtn"
      );


    if(botao){

      botao.style.display =
        "inline-flex";

    }

  }
);


/* =========================================================
📲 INSTALAR AFRICANMUNDO
========================================================= */

async function instalarAfricanMundo(){

  if(!eventoInstalacao){

    alert(
      "📱 A instalação não está disponível neste momento. No navegador, procure a opção 'Adicionar ao ecrã inicial'."
    );

    return;

  }


  try{

    eventoInstalacao.prompt();


    const resultado =
      await eventoInstalacao.userChoice;


    console.log(
      "📲 Resultado da instalação:",
      resultado
    );


    eventoInstalacao =
      null;


    const botao =
      document.getElementById(
        "installBtn"
      );


    if(botao){

      botao.style.display =
        "none";

    }

  }catch(error){

    console.error(
      "Erro ao instalar:",
      error
    );

  }

}


/* =========================================================
🌙 TEMA
========================================================= */

function aplicarTema(
  tema
){

  const body =
    document.body;


  if(!body){

    return;

  }


  body.classList.remove(
    "dark",
    "light"
  );


  if(
    tema === "dark"
  ){

    body.classList.add(
      "dark"
    );

  }else{

    body.classList.add(
      "light"
    );

  }


  try{

    localStorage.setItem(
      "africanmundo_tema",
      tema
    );

  }catch{

    // Sem ação.
  }

}


function alternarTema(){

  const atual =
    document.body.classList.contains(
      "dark"
    )
      ? "dark"
      : "light";


  aplicarTema(
    atual === "dark"
      ? "light"
      : "dark"
  );

}


function carregarTema(){

  let tema =
    "light";


  try{

    tema =
      localStorage.getItem(
        "africanmundo_tema"
      ) ||
      "light";

  }catch{

    tema = "light";

  }


  aplicarTema(
    tema
  );

}


/* =========================================================
🎨 CORES DO SITE
========================================================= */

const CORES_AFRICANMUNDO = [

  "#168a45",
  "#1261a0",
  "#b91c1c",
  "#7c3aed",
  "#ea580c",
  "#0891b2"

];


function aplicarCor(
  cor
){

  if(
    !CORES_AFRICANMUNDO.includes(
      cor
    )
  ){

    cor =
      CORES_AFRICANMUNDO[0];

  }


  document.documentElement
    .style
    .setProperty(
      "--p",
      cor
    );


  document.documentElement
    .style
    .setProperty(
      "--primary",
      cor
    );


  try{

    localStorage.setItem(
      "africanmundo_cor",
      cor
    );

  }catch{

    // Sem ação.
  }

}


function carregarCor(){

  let cor =
    CORES_AFRICANMUNDO[0];


  try{

    cor =
      localStorage.getItem(
        "africanmundo_cor"
      ) ||
      cor;

  }catch{

    // Mantém a cor padrão.
  }


  aplicarCor(
    cor
  );

}


function escolherCor(
  cor
){

  aplicarCor(
    cor
  );

}


/* =========================================================
📢 CARREGAR ANÚNCIOS ATIVOS
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


    const agora =
      new Date().toISOString();


    const {
      data,
      error
    } =
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

      console.warn(
        "⚠️ Não foi possível carregar anúncios:",
        error
      );


      if(section){

        section.style.display =
          "none";

      }


      return;

    }


    if(
      !data ||
      !data.length
    ){

      if(section){

        section.style.display =
          "none";

      }


      return;

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


    if(section){

      section.style.display =
        "";

    }


    console.log(
      `📢 ${data.length} anúncio(s) ativo(s).`
    );


  }catch(error){

    console.warn(
      "⚠️ Erro ao carregar anúncios:",
      error
    );


    if(section){

      section.style.display =
        "none";

    }

  }

}


/* =========================================================
📢 CARD DE ANÚNCIO
========================================================= */

function criarCardAnuncio(
  anuncio
){

  if(!anuncio){

    return "";

  }


  const nome =
    anuncio.empresa ||
    anuncio.nome ||
    "Anunciante";


  const mensagem =
    anuncio.mensagem ||
    "";


  const link =
    anuncio.link ||
    "";


  let media =
    "";


  if(
    anuncio.video
  ){

    media = `

      <video
        src="${esc(anuncio.video)}"
        controls
        preload="metadata"
        style="
          width:100%;
          max-height:320px;
          border-radius:12px;
        "
      ></video>

    `;

  }else if(
    anuncio.imagem
  ){

    media = `

      <img
        src="${esc(anuncio.imagem)}"
        alt="${esc(nome)}"
        loading="lazy"
        style="
          width:100%;
          max-height:320px;
          object-fit:cover;
          border-radius:12px;
        "
        onerror="this.style.display='none'"
      >

    `;

  }


  const conteudo = `

    <article class="anuncio-card">

      ${media}

      <div class="anuncio-card-content">

        <span class="anuncio-label">
          📢 ANÚNCIO
        </span>

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
                rel="noopener noreferrer"
              >
                🔗 Ver anúncio
              </a>
            `
            : ""
        }

      </div>

    </article>

  `;


  return conteudo;

}


/* =========================================================
🪟 MODAIS
========================================================= */

function abrirModal(
  id
){

  const modal =
    document.getElementById(
      id
    );


  if(!modal){

    return;

  }


  modal.classList.add(
    "ativo"
  );


  modal.style.display =
    "flex";


  document.body.classList.add(
    "modal-aberto"
  );

}


function fecharModal(
  id
){

  const modal =
    document.getElementById(
      id
    );


  if(!modal){

    return;

  }


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
🪟 FECHAR MODAL AO CLICAR FORA
========================================================= */

document.addEventListener(
  "click",
  function(event){

    if(
      event.target.classList &&
      event.target.classList.contains(
        "modal"
      )
    ){

      event.target.classList.remove(
        "ativo"
      );


      event.target.style.display =
        "none";

    }

  }
);


/* =========================================================
⌨️ ESC FECHA MODAL
========================================================= */

document.addEventListener(
  "keydown",
  function(event){

    if(
      event.key ===
      "Escape"
    ){

      document
        .querySelectorAll(
          ".modal.ativo"
        )
        .forEach(
          modal => {

            modal.classList.remove(
              "ativo"
            );


            modal.style.display =
              "none";

          }
        );


      document.body.classList.remove(
        "modal-aberto"
      );

    }

  }
);


/* =========================================================
🌐 REDES SOCIAIS
========================================================= */

function abrirRede(
  rede
){

  const urls = {

    google:
      "https://www.google.com/",

    facebook:
      "https://www.facebook.com/",

    youtube:
      "https://www.youtube.com/",

    whatsapp:
      "https://wa.me/",

    instagram:
      "https://www.instagram.com/",

    tiktok:
      "https://www.tiktok.com/"

  };


  const url =
    urls[rede];


  if(!url){

    return;

  }


  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


/* =========================================================
📊 FIM DA PARTE 4
========================================================= */
 /* =========================================================
🌍 AFRICANMUNDO — APP.JS
PARTE 5/5 — EVENTOS, MENU, PWA E INICIALIZAÇÃO
========================================================= */


/* =========================================================
🔎 PESQUISA
========================================================= */

function iniciarPesquisa(){

  const input =
    document.getElementById(
      "searchInput"
    );


  if(!input){

    return;

  }


  let timer = null;


  input.addEventListener(
    "input",
    function(){

      clearTimeout(timer);


      timer = setTimeout(
        () => {

          pesquisarNoticias(
            input.value
          );

        },
        250
      );

    }
  );


  console.log(
    "🔎 Pesquisa ativada."
  );

}


/* =========================================================
⚙️ BOTÃO FERRAMENTAS
========================================================= */

function iniciarBotaoFerramentas(){

  const botao =
    document.getElementById(
      "toolsBtn"
    );


  if(!botao){

    return;

  }


  botao.addEventListener(
    "click",
    function(){

      const modal =
        document.getElementById(
          "toolsModal"
        );


      if(modal){

        abrirModal(
          "toolsModal"
        );

        return;

      }


      console.log(
        "⚙️ Ferramentas clicado."
      );

    }
  );

}


/* =========================================================
👤 BOTÃO UTILIZADOR
========================================================= */

function iniciarBotaoUtilizador(){

  const botao =
    document.getElementById(
      "userBtn"
    );


  if(!botao){

    return;

  }


  botao.addEventListener(
    "click",
    function(){

      const modal =
        document.getElementById(
          "userModal"
        );


      if(modal){

        abrirModal(
          "userModal"
        );

        return;

      }


      console.log(
        "👤 Área do utilizador."
      );

    }
  );

}


/* =========================================================
🔔 NOTIFICAÇÕES
========================================================= */

function iniciarNotificacoes(){

  const botao =
    document.getElementById(
      "notificationBtn"
    );


  if(!botao){

    return;

  }


  botao.addEventListener(
    "click",
    async function(){

      if(
        !("Notification" in window)
      ){

        alert(
          "🔔 O seu navegador não suporta notificações."
        );

        return;

      }


      if(
        Notification.permission ===
        "granted"
      ){

        alert(
          "🔔 As notificações do AfricanMundo estão ativadas."
        );

        return;

      }


      if(
        Notification.permission ===
        "denied"
      ){

        alert(
          "🔔 As notificações foram bloqueadas no navegador. Ative-as nas definições do navegador."
        );

        return;

      }


      try{

        const permissao =
          await Notification.requestPermission();


        if(
          permissao ===
          "granted"
        ){

          alert(
            "✅ Notificações ativadas."
          );

        }

      }catch(error){

        console.warn(
          "Erro nas notificações:",
          error
        );

      }

    }
  );

}


/* =========================================================
🌙 BOTÃO TEMA
========================================================= */

function iniciarBotaoTema(){

  const botao =
    document.getElementById(
      "themeBtn"
    );


  if(!botao){

    return;

  }


  botao.addEventListener(
    "click",
    function(){

      alternarTema();

    }
  );

}


/* =========================================================
🎨 BOTÃO DE COR
========================================================= */

function iniciarBotaoCor(){

  const botao =
    document.getElementById(
      "colorBtn"
    );


  if(!botao){

    return;

  }


  botao.addEventListener(
    "click",
    function(){

      const atual =
        getComputedStyle(
          document.documentElement
        )
          .getPropertyValue(
            "--p"
          )
          .trim();


      let indice =
        CORES_AFRICANMUNDO.indexOf(
          atual
        );


      indice =
        indice < 0
          ? 0
          : indice + 1;


      if(
        indice >=
        CORES_AFRICANMUNDO.length
      ){

        indice = 0;

      }


      aplicarCor(
        CORES_AFRICANMUNDO[
          indice
        ]
      );

    }
  );

}


/* =========================================================
⭐ BOTÃO FAVORITOS
========================================================= */

function iniciarBotaoFavoritos(){

  const botoes =
    document.querySelectorAll(
      "[data-abrir-favoritos]"
    );


  botoes.forEach(
    botao => {

      botao.addEventListener(
        "click",
        function(){

          mostrarFavoritos();

        }
      );

    }
  );

}


/* =========================================================
📱 MENU MOBILE
========================================================= */

function iniciarMenuMobile(){

  const botao =
    document.getElementById(
      "menuBtn"
    );


  const menu =
    document.getElementById(
      "mobileMenu"
    );


  if(
    !botao ||
    !menu
  ){

    return;

  }


  botao.addEventListener(
    "click",
    function(){

      const aberto =
        menu.classList.toggle(
          "ativo"
        );


      botao.setAttribute(
        "aria-expanded",
        aberto
          ? "true"
          : "false"
      );

    }
  );


  menu
    .querySelectorAll(
      "a"
    )
    .forEach(
      link => {

        link.addEventListener(
          "click",
          function(){

            menu.classList.remove(
              "ativo"
            );


            botao.setAttribute(
              "aria-expanded",
              "false"
            );

          }
        );

      }
    );

}


/* =========================================================
⬆️ BOTÃO VOLTAR AO TOPO
========================================================= */

function criarBotaoTopo(){

  let botao =
    document.getElementById(
      "topBtn"
    );


  if(!botao){

    botao =
      document.createElement(
        "button"
      );


    botao.id =
      "topBtn";


    botao.type =
      "button";


    botao.innerHTML =
      "↑";


    botao.title =
      "Voltar ao topo";


    botao.setAttribute(
      "aria-label",
      "Voltar ao topo"
    );


    botao.style.cssText = `

      position:fixed;
      right:18px;
      bottom:80px;
      width:44px;
      height:44px;
      border:0;
      border-radius:50%;
      background:var(--p,#168a45);
      color:#fff;
      font-size:24px;
      font-weight:bold;
      cursor:pointer;
      z-index:999;
      display:none;
      box-shadow:0 4px 15px rgba(0,0,0,.25);

    `;


    document.body.appendChild(
      botao
    );

  }


  window.addEventListener(
    "scroll",
    function(){

      botao.style.display =
        window.scrollY > 500
          ? "flex"
          : "none";

      botao.style.alignItems =
        "center";

      botao.style.justifyContent =
        "center";

    },
    {
      passive:true
    }
  );


  botao.addEventListener(
    "click",
    function(){

      window.scrollTo({
        top:0,
        behavior:"smooth"
      });

    }
  );

}


/* =========================================================
🖼️ PREPARAR IMAGENS
========================================================= */

function prepararImagens(){

  document
    .querySelectorAll(
      "img"
    )
    .forEach(
      img => {

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

            this.dataset.erro =
              "true";

          },
          {
            once:true
          }
        );

      }
    );

}


/* =========================================================
📲 SERVICE WORKER
========================================================= */

function registrarServiceWorker(){

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
          "/Africanmundo-/sw.js"
        )
        .then(
          registro => {

            console.log(
              "✅ Service Worker ativo:",
              registro.scope
            );

          }
        )
        .catch(
          error => {

            console.warn(
              "⚠️ Service Worker não registado:",
              error
            );

          }
        );

    }
  );

}


/* =========================================================
📅 ANO ATUAL
========================================================= */

function atualizarAno(){

  const elementos =
    document.querySelectorAll(
      "#anoAtual, .anoAtual"
    );


  const ano =
    new Date()
      .getFullYear();


  elementos.forEach(
    elemento => {

      elemento.textContent =
        ano;

    }
  );

}


/* =========================================================
🌐 INTERNET
========================================================= */

function iniciarMonitorInternet(){

  function atualizarEstado(){

    if(
      navigator.onLine
    ){

      document.body.classList.remove(
        "sem-internet"
      );

      console.log(
        "🌐 Internet disponível."
      );

    }else{

      document.body.classList.add(
        "sem-internet"
      );

      console.warn(
        "⚠️ Sem ligação à Internet."
      );

    }

  }


  window.addEventListener(
    "online",
    atualizarEstado
  );


  window.addEventListener(
    "offline",
    atualizarEstado
  );


  atualizarEstado();

}


/* =========================================================
🔗 VERIFICAR LINKS INTERNOS
========================================================= */

function verificarLinksInternos(){

  document
    .querySelectorAll(
      "a[href]"
    )
    .forEach(
      link => {

        const href =
          link.getAttribute(
            "href"
          );


        if(
          !href ||
          href.startsWith("#") ||
          href.startsWith("http") ||
          href.startsWith("mailto:") ||
          href.startsWith("tel:")
        ){

          return;

        }


        link.addEventListener(
          "click",
          function(){

            console.log(
              "🔗 Abrindo:",
              href
            );

          }
        );

      }
    );

}


/* =========================================================
⚙️ EVENTOS GERAIS
========================================================= */

function iniciarEventos(){

  iniciarPesquisa();

  iniciarBotaoFerramentas();

  iniciarBotaoUtilizador();

  iniciarNotificacoes();

  iniciarBotaoTema();

  iniciarBotaoCor();

  iniciarBotaoFavoritos();

  iniciarMenuMobile();

  criarBotaoTopo();

  prepararImagens();

  atualizarAno();

  iniciarMonitorInternet();

  verificarLinksInternos();


  console.log(
    "✅ Eventos do AfricanMundo iniciados."
  );

}


/* =========================================================
🚀 INICIALIZAÇÃO FINAL
========================================================= */

async function finalizarInicializacao(){

  console.log(
    "🚀 A finalizar inicialização..."
  );


  carregarTema();

  carregarCor();


  if(
    typeof iniciarEventos ===
    "function"
  ){

    iniciarEventos();

  }


  registrarServiceWorker();


  await carregarNoticias();


  setTimeout(
    prepararImagens,
    300
  );


  console.log(
    "🌍 AfricanMundo pronto."
  );

}


/* =========================================================
🚀 INICIAR AFRICANMUNDO
========================================================= */

async function iniciarAfricanMundo(){

  console.log(
    "🌍 A iniciar AfricanMundo..."
  );


  const supabaseOK =
    iniciarSupabase();


  if(!supabaseOK){

    mostrarErroNoticias(
      "Não foi possível iniciar a ligação com o servidor."
    );

    return;

  }


  await finalizarInicializacao();

}


/* =========================================================
📄 DOM READY
========================================================= */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    function(){

      iniciarAfricanMundo();

    },
    {
      once:true
    }
  );

}else{

  iniciarAfricanMundo();

}


/* =========================================================
🚨 ERROS GLOBAIS
========================================================= */

window.addEventListener(
  "error",
  function(event){

    console.error(
      "🚨 Erro JavaScript:",
      event.error ||
      event.message
    );

  }
);


window.addEventListener(
  "unhandledrejection",
  function(event){

    console.error(
      "🚨 Promise rejeitada:",
      event.reason
    );

  }
);


/* =========================================================
🌍 AFRICANMUNDO — APP.JS COMPLETO
========================================================= */

console.log(
  "🌍 AFRICANMUNDO APP.JS FOI CARREGADO."
);
