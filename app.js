"use strict";

/* =====================================================
   AFRICANMUNDO — APP.JS
   NOVA VERSÃO — PARTE 1/6
   CONFIGURAÇÃO E FUNÇÕES AUXILIARES
===================================================== */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db = window.supabase?.createClient
  ? window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    )
  : null;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1200&q=75";

const LIMITE_ULTIMAS = 10;
const LIMITE_CATEGORIA = 4;
const LIMITE_PESQUISA = 50;

const INTERVALO_ATUALIZACAO = 5 * 60 * 1000;
const INTERVALO_DESTAQUE = 10 * 1000;

let noticias = [];
let anuncios = [];

let indiceDestaque = 0;
let timerDestaque = null;
let timerAtualizacao = null;
let canalNoticias = null;

let carregandoNoticias = false;
let carregandoAnuncios = false;
let africanMundoIniciado = false;

let ultimaPesquisa = "";

/* =====================================================
   FUNÇÕES AUXILIARES
===================================================== */

function norm(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function esc(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    function (caractere) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[caractere];
    }
  );
}

function elemento(id) {
  return document.getElementById(id);
}

function primeiroElemento(ids) {
  for (const id of ids) {
    const encontrado = elemento(id);

    if (encontrado) return encontrado;
  }

  return null;
}

function obterTitulo(n) {
  return (
    n?.titulo ||
    n?.title ||
    n?.nome ||
    "Notícia sem título"
  );
}

function obterTexto(n) {
  return (
    n?.texto ||
    n?.conteudo ||
    n?.descricao ||
    n?.resumo ||
    n?.description ||
    ""
  );
}

function obterImagem(n) {
  const imagem =
    n?.imagem ||
    n?.image ||
    n?.imagem_url ||
    n?.image_url ||
    n?.thumbnail ||
    "";

  if (
    typeof imagem === "string" &&
    /^https?:\/\//i.test(imagem)
  ) {
    return imagem;
  }

  return FALLBACK_IMG;
}

function obterCategoria(n) {
  return n?.categoria || n?.category || "Atualidades";
}

function obterData(n) {
  return (
    n?.data ||
    n?.created_at ||
    n?.published_at ||
    ""
  );
}

function formatarData(valor) {
  if (!valor) return "";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-MZ", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(data);
}

function resumo(texto, limite = 145) {
  const limpo = String(texto || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (limpo.length <= limite) {
    return limpo;
  }

  return limpo.slice(0, limite).trimEnd() + "…";
}

function ordenarPorData(lista) {
  return [...lista].sort(function (a, b) {
    const dataA =
      new Date(obterData(a) || 0).getTime() || 0;

    const dataB =
      new Date(obterData(b) || 0).getTime() || 0;

    if (dataB !== dataA) {
      return dataB - dataA;
    }

    return Number(b.id || 0) - Number(a.id || 0);
  });
}

function obterNoticiasUnicas(lista) {
  const vistos = new Set();

  return ordenarPorData(lista).filter(function (noticia) {
    const chave = String(
      noticia.id ||
      noticia.url_original ||
      noticia.id_externo ||
      norm(obterTitulo(noticia))
    );

    if (vistos.has(chave)) return false;

    vistos.add(chave);

    return true;
  });
}

function definirMensagem(destino, mensagem) {
  if (!destino) return;

  destino.innerHTML = `
    <p class="am-mensagem">
      ${esc(mensagem)}
    </p>
  `;
}

function abrirNoticia(id) {
  if (
    id === undefined ||
    id === null ||
    id === ""
  ) {
    return;
  }

  window.location.href =
    "noticia.html?id=" +
    encodeURIComponent(String(id));
}

/* =====================================================
   FIM DA PARTE 1/6
===================================================== */


/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 2/6 — CARTÕES E CATEGORIAS
===================================================== */

/* ---------- CRIAR CARTÃO DE NOTÍCIA ---------- */

function criarCard(n) {
  const titulo = esc(obterTitulo(n));
  const imagem = esc(obterImagem(n));
  const categoria = esc(obterCategoria(n));
  const data = esc(formatarData(obterData(n)));
  const descricao = esc(resumo(obterTexto(n), 115));

  const url =
    "noticia.html?id=" +
    encodeURIComponent(String(n.id ?? ""));

  return `
    <article class="am-news-card">

      <a
        class="am-news-image-link"
        href="${url}"
        aria-label="${titulo}"
      >
        <img
          class="am-news-image"
          src="${imagem}"
          alt="${titulo}"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >
      </a>

      <div class="am-news-content">

        <span class="am-news-category">
          ${categoria}
        </span>

        <h3 class="am-news-title">
          <a href="${url}">
            ${titulo}
          </a>
        </h3>

        ${
          descricao
            ? `<p class="am-news-summary">${descricao}</p>`
            : ""
        }

        <div class="am-news-meta">
          ${data}
        </div>

      </div>
    </article>
  `;
}

/* ---------- RENDERIZAR LISTAS ---------- */

function renderizarLista(
  destino,
  lista,
  limite = LIMITE_CATEGORIA
) {
  if (!destino) return;

  const quantidade = Math.max(
    0,
    Number(limite) || LIMITE_CATEGORIA
  );

  const itens = lista.slice(0, quantidade);

  if (!itens.length) {
    definirMensagem(
      destino,
      "Ainda não existem notícias nesta secção."
    );
    return;
  }

  destino.innerHTML = itens
    .map(criarCard)
    .join("");
}

function renderizarListaPorId(
  ids,
  lista,
  limite = LIMITE_CATEGORIA
) {
  const destino = primeiroElemento(ids);

  if (destino) {
    renderizarLista(destino, lista, limite);
  }
}

/* ---------- IDENTIFICAR CATEGORIAS ---------- */

function noticiaDaCategoria(n, categoria) {
  const cat = norm(categoria);

  const categoriaNoticia = norm(n.categoria);
  const subcategoria = norm(n.subcategoria);
  const pais = norm(n.pais);
  const titulo = norm(obterTitulo(n));
  const texto = norm(obterTexto(n));

  if (
    cat === "mocambique" ||
    cat === "mozambique"
  ) {
    return (
      categoriaNoticia.includes("mocambique") ||
      categoriaNoticia.includes("mozambique") ||
      pais.includes("mocambique") ||
      pais.includes("mozambique")
    );
  }

  if (cat === "africa") {
    return (
      categoriaNoticia === "africa" ||
      categoriaNoticia.startsWith("africa ") ||
      categoriaNoticia.startsWith("africa/") ||
      categoriaNoticia.startsWith("africa -") ||
      subcategoria.includes("africa") ||
      pais === "africa"
    );
  }

  if (cat === "futebol") {
    return (
      categoriaNoticia.includes("futebol") ||
      subcategoria.includes("futebol")
    );
  }

  if (
    cat === "desporto" ||
    cat === "esporte"
  ) {
    return (
      categoriaNoticia.includes("desporto") ||
      categoriaNoticia.includes("esporte") ||
      categoriaNoticia.includes("futebol") ||
      subcategoria.includes("desporto") ||
      subcategoria.includes("esporte") ||
      subcategoria.includes("futebol")
    );
  }

  if (
    cat === "negocios" ||
    cat === "economia"
  ) {
    return (
      categoriaNoticia.includes("negocio") ||
      categoriaNoticia.includes("economia") ||
      categoriaNoticia.includes("emprego") ||
      subcategoria.includes("economia") ||
      subcategoria.includes("negocio")
    );
  }

  if (
    cat === "entretenimento" ||
    cat === "cultura"
  ) {
    return (
      categoriaNoticia.includes("entretenimento") ||
      categoriaNoticia.includes("cultura") ||
      categoriaNoticia.includes("musica") ||
      subcategoria.includes("entretenimento") ||
      subcategoria.includes("cultura")
    );
  }

  return (
    categoriaNoticia.includes(cat) ||
    subcategoria.includes(cat) ||
    titulo.includes(cat) ||
    texto.includes(cat)
  );
}

/* ---------- RENDERIZAR TODAS AS CATEGORIAS ---------- */

function renderizarCategorias() {

  const categorias = [
    {
      categoria: "mocambique",
      ids: [
        "mocambique",
        "mocambiqueNoticias",
        "listaMocambique",
        "noticiasMocambique"
      ]
    },

    {
      categoria: "africa",
      ids: [
        "africa",
        "africaNoticias",
        "listaAfrica",
        "noticiasAfrica"
      ]
    },

    {
      categoria: "futebol",
      ids: [
        "futebol",
        "futebolNoticias",
        "listaFutebol",
        "noticiasFutebol"
      ]
    },

    {
      categoria: "desporto",
      ids: [
        "desporto",
        "desportoNoticias",
        "listaDesporto",
        "noticiasDesporto"
      ]
    },

    {
      categoria: "negocios",
      ids: [
        "negocios",
        "negociosNoticias",
        "listaNegocios",
        "noticiasNegocios"
      ]
    },

    {
      categoria: "entretenimento",
      ids: [
        "entretenimento",
        "entretenimentoNoticias",
        "listaEntretenimento",
        "noticiasEntretenimento"
      ]
    }
  ];

  categorias.forEach(function (item) {

    const destino = primeiroElemento(item.ids);

    if (!destino) return;

    const lista = noticias.filter(function (n) {
      return noticiaDaCategoria(
        n,
        item.categoria
      );
    });

    renderizarLista(
      destino,
      lista,
      LIMITE_CATEGORIA
    );

  });

  /* ---------- ÚLTIMAS NOTÍCIAS ---------- */

  const listaGeral = primeiroElemento([
    "ultimas",
    "ultimasNoticias",
    "listaNoticias",
    "noticiasRecentes",
    "ultimas-noticias",
    "newsGrid"
  ]);

  if (listaGeral) {
    renderizarLista(
      listaGeral,
      noticias,
      LIMITE_ULTIMAS
    );
  }
}

/* =====================================================
   FIM DA PARTE 2/6
===================================================== */


/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 3/6 — DESTAQUE E SUPABASE
===================================================== */

/* ---------- NOTÍCIA EM DESTAQUE ---------- */

function mostrarDestaque() {
  const area = elemento("destaque");

  if (!area) return;

  if (!noticias.length) {
    definirMensagem(
      area,
      "Ainda não há notícias para destacar."
    );
    return;
  }

  if (indiceDestaque >= noticias.length) {
    indiceDestaque = 0;
  }

  const n = noticias[indiceDestaque];

  const titulo = esc(obterTitulo(n));
  const imagem = esc(obterImagem(n));
  const categoria = esc(obterCategoria(n));
  const data = esc(formatarData(obterData(n)));
  const descricao = esc(
    resumo(obterTexto(n), 180)
  );

  const url =
    "noticia.html?id=" +
    encodeURIComponent(String(n.id ?? ""));

  area.innerHTML = `
    <article class="am-destaque-card">

      <a
        href="${url}"
        class="am-destaque-imagem-link"
        aria-label="${titulo}"
      >
        <img
          class="am-destaque-imagem"
          src="${imagem}"
          alt="${titulo}"
          fetchpriority="high"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >
      </a>

      <div class="am-destaque-conteudo">

        <span class="am-news-category">
          ${categoria}
        </span>

        <h2 class="am-destaque-titulo">
          <a href="${url}">
            ${titulo}
          </a>
        </h2>

        ${
          descricao
            ? `<p class="am-destaque-resumo">${descricao}</p>`
            : ""
        }

        <div class="am-news-meta">
          ${data}
        </div>

        <a
          href="${url}"
          class="am-destaque-link"
        >
          Ler notícia
        </a>

      </div>
    </article>
  `;
}

/* ---------- ROTAÇÃO DO DESTAQUE ---------- */

function iniciarDestaque() {
  if (timerDestaque) {
    clearInterval(timerDestaque);
  }

  timerDestaque = null;

  if (
    noticias.length < 2 ||
    document.hidden
  ) {
    return;
  }

  timerDestaque = setInterval(() => {
    indiceDestaque =
      (indiceDestaque + 1) % noticias.length;

    mostrarDestaque();

  }, INTERVALO_DESTAQUE);
}

/* ---------- CONFIGURAR DESTAQUE ---------- */

function configurarDestaque() {
  const area = elemento("destaque");

  if (
    !area ||
    area.dataset.amDestaque === "1"
  ) {
    return;
  }

  area.dataset.amDestaque = "1";

  area.addEventListener("mouseenter", () => {
    if (timerDestaque) {
      clearInterval(timerDestaque);
    }

    timerDestaque = null;
  });

  area.addEventListener(
    "mouseleave",
    iniciarDestaque
  );

  area.addEventListener("focusin", () => {
    if (timerDestaque) {
      clearInterval(timerDestaque);
    }

    timerDestaque = null;
  });

  area.addEventListener(
    "focusout",
    iniciarDestaque
  );

  iniciarDestaque();
}

/* ---------- CARREGAR NOTÍCIAS DO SUPABASE ---------- */

async function carregarNoticias() {

  if (!db || carregandoNoticias) {
    if (!db) {
      console.error(
        "AfricanMundo: cliente Supabase indisponível."
      );
    }

    return;
  }

  carregandoNoticias = true;

  try {

    const resposta = await db
      .from("noticias")
      .select(
        "id,titulo,imagem,categoria,subcategoria,texto,data,fonte,url_original,id_externo,idioma,visualizacoes,pais"
      )
      .order("data", {
        ascending: false
      })
      .order("id", {
        ascending: false
      })
      .limit(500);

    if (resposta.error) {
      throw resposta.error;
    }

    const dados = resposta.data || [];

    noticias = obterNoticiasUnicas(dados);

    indiceDestaque = noticias.length
      ? indiceDestaque % noticias.length
      : 0;

    /* Atualizar secções e destaque */

    renderizarCategorias();

    mostrarDestaque();

    /* Atualizar pesquisa, se estiver em utilização */

    if (ultimaPesquisa) {
      pesquisar(ultimaPesquisa, false);
    }

    console.log(
      "AfricanMundo: notícias carregadas:",
      noticias.length
    );

  } catch (erro) {

    console.error(
      "AfricanMundo: erro ao carregar notícias:",
      erro
    );

    const area = elemento("destaque");

    if (area && !noticias.length) {
      definirMensagem(
        area,
        "Não foi possível carregar as notícias. Verifica a ligação e tenta novamente."
      );
    }

  } finally {

    carregandoNoticias = false;

  }
}

/* =====================================================
   FIM DA PARTE 3/6
===================================================== */



/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 4/6 — PESQUISA, ANÚNCIOS E PAINÉIS
===================================================== */

/* ---------- PESQUISA DE NOTÍCIAS ---------- */

function pesquisar(termo, deslocar = true) {
  const campo = primeiroElemento([
    "searchInput",
    "pesquisaInput",
    "campoPesquisa",
    "search",
    "pesquisarInput"
  ]);

  const consulta = String(
    termo !== undefined
      ? termo
      : campo?.value || ""
  ).trim();

  ultimaPesquisa = consulta;

  const destino = primeiroElemento([
    "resultadosPesquisa",
    "resultados-pesquisa",
    "searchResults",
    "pesquisaResultados",
    "resultadosNoticias"
  ]);

  if (!consulta) {
    if (destino) {
      definirMensagem(
        destino,
        "Escreva uma palavra para pesquisar notícias."
      );
      destino.hidden = false;
    }
    return;
  }

  const palavras = norm(consulta)
    .split(/\s+/)
    .filter(Boolean);

  const resultados = obterNoticiasUnicas(noticias)
    .filter((n) => {
      const texto = norm([
        obterTitulo(n),
        obterTexto(n),
        obterCategoria(n),
        n.subcategoria || "",
        n.pais || "",
        n.fonte || ""
      ].join(" "));

      return palavras.every(
        palavra => texto.includes(palavra)
      );
    });

  if (destino) {
    destino.innerHTML = "";

    const cabecalho = document.createElement("div");
    cabecalho.className = "am-pesquisa-cabecalho";
    cabecalho.textContent =
      resultados.length +
      (resultados.length === 1
        ? " resultado para "
        : " resultados para ") +
      "“" + consulta + "”";

    destino.appendChild(cabecalho);

    if (!resultados.length) {
      const vazio = document.createElement("p");
      vazio.className = "am-mensagem";
      vazio.textContent =
        "Não foram encontradas notícias com essas palavras.";

      destino.appendChild(vazio);
    } else {
      const lista = document.createElement("div");
      lista.className = "am-pesquisa-lista";

      lista.innerHTML = resultados
        .slice(0, LIMITE_PESQUISA)
        .map(criarCard)
        .join("");

      destino.appendChild(lista);
    }

    destino.hidden = false;

    if (deslocar) {
      destino.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    return;
  }

  const url = new URL(
    "categoria.html",
    window.location.href
  );

  url.searchParams.set("pesquisa", consulta);
  window.location.href = url.href;
}

/* ---------- PESQUISA PELO TECLADO ---------- */

function pesquisarTecla(evento) {
  if (evento?.key === "Enter") {
    evento.preventDefault();
    pesquisar();
  }
}

/* ---------- ABRIR PESQUISA ---------- */

function abrirPesquisa() {
  const campo = primeiroElemento([
    "searchInput",
    "pesquisaInput",
    "campoPesquisa",
    "search",
    "pesquisarInput"
  ]);

  if (campo) {
    campo.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    campo.focus();
    return;
  }

  const painel = elemento("searchPanel");

  if (painel) {
    painel.hidden = false;
    painel.classList.add("aberto");
    painel.setAttribute("aria-hidden", "false");
    return;
  }

  const destino = new URL(
    "categoria.html",
    window.location.href
  );

  destino.searchParams.set("pesquisa", "");
  window.location.href = destino.href;
}

/* =====================================================
   ANÚNCIOS
===================================================== */

function anuncioEstaAtivo(anuncio) {
  if (!anuncio) return false;

  const agora = new Date();

  const inicio = anuncio.data_inicio
    ? new Date(anuncio.data_inicio)
    : null;

  const fim = anuncio.data_fim
    ? new Date(anuncio.data_fim)
    : null;

  const estado = norm(
    anuncio.estado || anuncio.status || ""
  );

  if (
    anuncio.ativo === false ||
    anuncio.ativo === 0 ||
    estado === "inativo" ||
    estado === "rejeitado" ||
    estado === "expirado" ||
    estado === "cancelado"
  ) {
    return false;
  }

  if (
    inicio &&
    !Number.isNaN(inicio.getTime()) &&
    agora < inicio
  ) {
    return false;
  }

  if (
    fim &&
    !Number.isNaN(fim.getTime()) &&
    agora > fim
  ) {
    return false;
  }

  return true;
}

/* ---------- CRIAR CARTÃO DE ANÚNCIO ---------- */

function criarCardAnuncio(anuncio) {
  const card = document.createElement("article");
  card.className = "am-anuncio-card";

  const link = document.createElement("a");
  link.className = "am-anuncio-link";

  const destino =
    anuncio.url ||
    anuncio.link ||
    anuncio.url_destino ||
    "";

  if (
    destino &&
    /^https?:\/\//i.test(String(destino))
  ) {
    link.href = destino;
    link.target = "_blank";
    link.rel = "noopener noreferrer sponsored";
  } else {
    link.href = "#";

    link.addEventListener("click", evento => {
      evento.preventDefault();
    });
  }

  const imagemUrl =
    anuncio.imagem ||
    anuncio.imagem_url ||
    anuncio.banner ||
    anuncio.video_thumbnail ||
    "";

  if (
    typeof imagemUrl === "string" &&
    /^https?:\/\//i.test(imagemUrl)
  ) {
    const imagem = document.createElement("img");

    imagem.src = imagemUrl;
    imagem.alt =
      anuncio.titulo ||
      anuncio.empresa ||
      "Publicidade";

    imagem.loading = "lazy";
    imagem.onerror = () => imagem.remove();

    link.appendChild(imagem);
  }

  const conteudo = document.createElement("div");
  conteudo.className = "am-anuncio-conteudo";

  const etiqueta = document.createElement("span");
  etiqueta.className = "am-anuncio-etiqueta";
  etiqueta.textContent = "PUBLICIDADE";

  const titulo = document.createElement("h3");
  titulo.textContent =
    anuncio.titulo ||
    anuncio.empresa ||
    anuncio.nome ||
    "Anúncio";

  conteudo.append(etiqueta, titulo);

  if (anuncio.descricao || anuncio.texto) {
    const descricao = document.createElement("p");

    descricao.textContent =
      anuncio.descricao || anuncio.texto;

    conteudo.appendChild(descricao);
  }

  link.appendChild(conteudo);
  card.appendChild(link);

  return card;
}

/* ---------- CARREGAR ANÚNCIOS ---------- */

async function carregarAnuncios() {
  if (!db || carregandoAnuncios) return;

  carregandoAnuncios = true;

  try {
    const { data, error } = await db
      .from("anuncios")
      .select("*")
      .limit(100);

    if (error) throw error;

    anuncios = (data || []).filter(anuncioEstaAtivo);

    const secao = elemento("anunciosAtivosSection");

    const destino = elemento("anunciosAtivos");

    if (!secao || !destino) return;

    destino.innerHTML = "";

    if (!anuncios.length) {
      secao.hidden = true;
      return;
    }

    secao.hidden = false;

    anuncios.forEach(anuncio => {
      destino.appendChild(
        criarCardAnuncio(anuncio)
      );
    });

  } catch (erro) {
    console.error(
      "AfricanMundo: erro ao carregar anúncios:",
      erro
    );
  } finally {
    carregandoAnuncios = false;
  }
}

/* =====================================================
   PAINÉIS DO CABEÇALHO
===================================================== */

function fecharPainel(id) {
  const painel = elemento(id);

  if (!painel) return;

  painel.classList.remove(
    "aberto",
    "ativo",
    "mostrar"
  );

  painel.hidden = true;
  painel.setAttribute("aria-hidden", "true");
}

function abrirPainel(id) {
  const painel = elemento(id);

  if (!painel) return;

  const estavaAberto =
    !painel.hidden &&
    (
      painel.classList.contains("aberto") ||
      painel.classList.contains("ativo") ||
      painel.classList.contains("mostrar")
    );

  [
    "notificationPanel",
    "toolsPanel",
    "userPanel",
    "colorPanel"
  ].forEach(outroId => {
    if (outroId !== id) {
      fecharPainel(outroId);
    }
  });

  if (estavaAberto) {
    fecharPainel(id);
    return;
  }

  painel.hidden = false;
  painel.classList.add("aberto");
  painel.setAttribute("aria-hidden", "false");
}

function mostrarNotificacoes() {
  abrirPainel("notificationPanel");
}

function mostrarFerramentas() {
  abrirPainel("toolsPanel");
}

function mostrarEu() {
  abrirPainel("userPanel");
}

function mostrarCores() {
  abrirPainel("colorPanel");
}

/* =====================================================
   CORES DO SITE
===================================================== */

function alterarCor(cor) {
  const cores = {
    verde: "#168a45",
    azul: "#1769aa",
    vermelho: "#c62828",
    roxo: "#7137a8",
    laranja: "#e87516"
  };

  const nome = norm(cor);

  const selecionada = cores[nome]
    ? nome
    : "verde";

  const principal = cores[selecionada];

  document.documentElement.style.setProperty(
    "--p",
    principal
  );

  document.documentElement.style.setProperty(
    "--cor-principal",
    principal
  );

  document.documentElement.style.setProperty(
    "--p2",
    principal
  );

  try {
    localStorage.setItem(
      "africanmundo-cor",
      selecionada
    );
  } catch (_) {}

  document.querySelectorAll("[data-cor]").forEach(botao => {
    botao.classList.toggle(
      "selecionado",
      norm(botao.dataset.cor) === selecionada
    );
  });

  return selecionada;
}

function escolherCor(cor) {
  return alterarCor(cor);
}

function aplicarCor(cor) {
  return alterarCor(cor);
}

/* =====================================================
   FIM DA PARTE 4/6
===================================================== */


/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 5/6 — ESTILOS E CONFIGURAÇÕES
===================================================== */

/* ---------- ESTILOS COMPLEMENTARES ---------- */

function garantirEstilosApp() {
  if (elemento("am-estilos-app")) return;

  const estilo = document.createElement("style");
  estilo.id = "am-estilos-app";

  estilo.textContent = `
    .news-grid,
    .am-pesquisa-lista {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      align-items: start;
    }

    .am-news-card {
      min-width: 0;
      overflow: hidden;
      background: var(--card, #fff);
      border: 1px solid var(--border, #e5e9e6);
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,.045);
    }

    .am-news-image-link {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: #e8eeea;
    }

    .am-news-image {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .am-news-content {
      padding: 10px;
    }

    .am-news-category,
    .am-anuncio-etiqueta {
      display: inline-block;
      color: var(--p, #168a45);
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .am-news-title {
      font-size: 15px;
      line-height: 1.35;
      margin: 0 0 7px;
      font-weight: 750;
    }

    .am-news-title a {
      color: inherit;
      text-decoration: none;
    }

    .am-news-summary {
      font-size: 12px;
      line-height: 1.5;
      margin: 0 0 8px;
      color: var(--muted, #68736d);
    }

    .am-news-meta {
      font-size: 10px;
      color: var(--muted, #7b8580);
    }

    .am-destaque-card {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
      gap: 16px;
      overflow: hidden;
      border-radius: 12px;
      background: var(--card, #fff);
      border: 1px solid var(--border, #e5e9e6);
    }

    .am-destaque-imagem-link {
      display: block;
      min-width: 0;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: #e8eeea;
    }

    .am-destaque-imagem {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .am-destaque-conteudo {
      padding: 16px;
      align-self: center;
      min-width: 0;
    }

    .am-destaque-titulo {
      font-size: clamp(18px, 2.2vw, 27px);
      line-height: 1.25;
      margin: 5px 0 10px;
    }

    .am-destaque-resumo {
      font-size: 13px;
      line-height: 1.6;
      color: var(--muted, #68736d);
    }

    .am-destaque-link {
      display: inline-block;
      margin-top: 10px;
      color: var(--p, #168a45);
      font-weight: 700;
      text-decoration: none;
    }

    .am-anuncio-card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid var(--border, #e5e9e6);
      border-radius: 10px;
      background: var(--card, #fff);
    }

    .am-anuncio-link {
      display: block;
      color: inherit;
      text-decoration: none;
    }

    .am-anuncio-link img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: cover;
    }

    .am-anuncio-conteudo {
      padding: 10px;
    }

    .am-anuncio-conteudo h3 {
      font-size: 14px;
      margin: 4px 0;
    }

    .am-anuncio-conteudo p {
      font-size: 12px;
      line-height: 1.5;
      color: var(--muted, #68736d);
    }

    .am-mensagem {
      padding: 14px;
      color: var(--muted, #68736d);
      font-size: 13px;
    }

    .am-pesquisa-cabecalho {
      grid-column: 1 / -1;
      font-size: 14px;
      font-weight: 700;
      padding: 10px 0;
    }

    @media (max-width: 900px) {
      .news-grid,
      .am-pesquisa-lista {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 11px;
      }
    }

    @media (max-width: 600px) {
      .news-grid,
      .am-pesquisa-lista {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
      }

      .am-news-content {
        padding: 8px;
      }

      .am-news-title {
        font-size: 13px;
        line-height: 1.3;
      }

      .am-news-summary {
        font-size: 11px;
      }

      .am-destaque-card {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .am-destaque-imagem-link {
        aspect-ratio: 16 / 9;
      }

      .am-destaque-conteudo {
        padding: 12px;
      }

      .am-destaque-titulo {
        font-size: 18px;
      }

      .am-anuncio-conteudo {
        padding: 8px;
      }
    }

    @media (max-width: 360px) {
      .news-grid,
      .am-pesquisa-lista {
        gap: 7px;
      }

      .am-news-title {
        font-size: 12px;
      }
    }
  `;

  document.head.appendChild(estilo);
}

/* ---------- BOTÕES DO CABEÇALHO ---------- */

function configurarBotoesTopo() {
  const botoes = [
    {
      ids: ["notificationBtn", "notificacoesBtn"],
      acao: mostrarNotificacoes
    },
    {
      ids: ["toolsBtn", "ferramentasBtn"],
      acao: mostrarFerramentas
    },
    {
      ids: ["userBtn", "usuarioBtn"],
      acao: mostrarEu
    },
    {
      ids: ["colorBtn", "coresBtn"],
      acao: mostrarCores
    }
  ];

  botoes.forEach(item => {
    const botao = primeiroElemento(item.ids);

    if (!botao || botao.dataset.amConfigurado === "1") {
      return;
    }

    botao.dataset.amConfigurado = "1";

    botao.addEventListener("click", evento => {
      evento.preventDefault();
      item.acao();
    });
  });

  const partilhar = primeiroElemento([
    "shareBtn",
    "partilharBtn"
  ]);

  if (
    partilhar &&
    partilhar.dataset.amConfigurado !== "1"
  ) {
    partilhar.dataset.amConfigurado = "1";
    partilhar.addEventListener("click", partilharSite);
  }
}

/* ---------- BOTÕES DE DATA ---------- */

function configurarBotoesData() {
  document.querySelectorAll("[data-cor]").forEach(botao => {
    if (botao.dataset.amCorConfigurada === "1") return;

    botao.dataset.amCorConfigurada = "1";

    botao.addEventListener("click", () => {
      alterarCor(botao.dataset.cor);
    });
  });
}

/* ---------- FORMULÁRIO DE PESQUISA ---------- */

function configurarPesquisa() {
  const formulario = primeiroElemento([
    "searchForm",
    "formPesquisa",
    "pesquisaForm"
  ]);

  const campo = primeiroElemento([
    "searchInput",
    "pesquisaInput",
    "campoPesquisa",
    "search",
    "pesquisarInput"
  ]);

  if (
    formulario &&
    formulario.dataset.amConfigurado !== "1"
  ) {
    formulario.dataset.amConfigurado = "1";

    formulario.addEventListener("submit", evento => {
      evento.preventDefault();
      pesquisar(campo?.value || "");
    });
  }

  if (
    campo &&
    campo.dataset.amConfigurado !== "1"
  ) {
    campo.dataset.amConfigurado = "1";

    campo.addEventListener("keydown", pesquisarTecla);
  }
}

/* ---------- TECLADO E ATALHOS ---------- */

function configurarTeclado() {
  if (document.documentElement.dataset.amTeclado === "1") {
    return;
  }

  document.documentElement.dataset.amTeclado = "1";

  document.addEventListener("keydown", evento => {
    if (
      evento.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(
        document.activeElement?.tagName
      )
    ) {
      evento.preventDefault();
      abrirPesquisa();
    }

    if (evento.key === "Escape") {
      [
        "notificationPanel",
        "toolsPanel",
        "userPanel",
        "colorPanel"
      ].forEach(fecharPainel);
    }
  });
}

/* ---------- MENU MOBILE ---------- */

function configurarMenuMobile() {
  const menu = primeiroElemento([
    "mobileMenuBtn",
    "menuMobileBtn",
    "hamburgerBtn"
  ]);

  const navegacao = primeiroElemento([
    "mainNav",
    "navMenu",
    "mobileMenu"
  ]);

  if (
    !menu ||
    !navegacao ||
    menu.dataset.amConfigurado === "1"
  ) {
    return;
  }

  menu.dataset.amConfigurado = "1";

  menu.addEventListener("click", () => {
    const aberto =
      navegacao.classList.toggle("aberto");

    menu.setAttribute(
      "aria-expanded",
      String(aberto)
    );
  });
}

/* ---------- BOTÃO VOLTAR AO TOPO ---------- */

function configurarTopo() {
  const botao = primeiroElemento([
    "backToTop",
    "voltarTopo",
    "btnTopo",
    "scrollTopBtn"
  ]);

  if (
    !botao ||
    botao.dataset.amTopoConfigurado === "1"
  ) {
    return;
  }

  botao.dataset.amTopoConfigurado = "1";

  botao.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  const atualizar = () => {
    botao.hidden = window.scrollY < 350;
  };

  window.addEventListener("scroll", atualizar, {
    passive: true
  });

  atualizar();
}

/* ---------- PROTEGER IMAGENS ---------- */

function protegerImagens() {
  document.addEventListener("error", evento => {
    const imagem = evento.target;

    if (
      !(imagem instanceof HTMLImageElement) ||
      imagem.dataset.amFallback === "1"
    ) {
      return;
    }

    imagem.dataset.amFallback = "1";
    imagem.src = FALLBACK_IMG;
  }, true);
}

/* ---------- RESTAURAR COR ---------- */

function restaurarCor() {
  let cor = "verde";

  try {
    cor =
      localStorage.getItem("africanmundo-cor") ||
      "verde";
  } catch (_) {}

  alterarCor(cor);
}

/* ---------- ATUALIZAÇÃO AUTOMÁTICA ---------- */

function iniciarAtualizacaoAutomatica() {
  if (timerAtualizacao) {
    clearInterval(timerAtualizacao);
  }

  timerAtualizacao = setInterval(() => {
    if (document.hidden) return;

    carregarNoticias();
    carregarAnuncios();
  }, INTERVALO_ATUALIZACAO);
}

/* ---------- SUPABASE REALTIME ---------- */

function iniciarRealtimeNoticias() {
  if (
    !db ||
    canalNoticias ||
    typeof db.channel !== "function"
  ) {
    return;
  }

  try {
    canalNoticias = db
      .channel("africanmundo-noticias-publicas")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "noticias"
        },
        () => {
          carregarNoticias();
        }
      )
      .subscribe();

  } catch (erro) {
    console.warn(
      "AfricanMundo: Realtime indisponível:",
      erro
    );
  }
}

/* ---------- VISIBILIDADE DA PÁGINA ---------- */

function configurarVisibilidade() {
  if (
    document.documentElement.dataset.amVisibilidade === "1"
  ) {
    return;
  }

  document.documentElement.dataset.amVisibilidade = "1";

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      carregarNoticias();
      carregarAnuncios();
    }
  });
}

/* ---------- PARTILHAR SITE ---------- */

async function partilharSite() {
  const dados = {
    title: "AfricanMundo — Notícias de África",
    text: "A informação que liga África ao mundo.",
    url: window.location.origin +
      window.location.pathname
  };

  try {
    if (navigator.share) {
      await navigator.share(dados);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(dados.url);
      alert("Link do AfricanMundo copiado.");
    } else {
      window.prompt("Copie o link:", dados.url);
    }
  } catch (erro) {
    if (erro?.name !== "AbortError") {
      console.warn("Não foi possível partilhar:", erro);
    }
  }
}

/* ---------- ABRIR REDES SOCIAIS ---------- */

function abrirRede(rede) {
  const links = {
    facebook: "https://www.facebook.com/",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: "https://www.whatsapp.com/",
    tiktok: "https://www.tiktok.com/",
    google: "https://www.google.com/"
  };

  const url = links[norm(rede)];

  if (url) {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  }
}

function abrirGoogle() {
  window.open(
    "https://www.google.com/",
    "_blank",
    "noopener,noreferrer"
  );
}

/* =====================================================
   FIM DA PARTE 5/6
===================================================== */


/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 6/6 — INICIALIZAÇÃO E FINALIZAÇÃO
===================================================== */

/* ---------- CONFIGURAR CATEGORIAS ---------- */

function configurarCategorias() {
  const categorias = document.querySelectorAll(
    "[data-categoria], .categoria-link, .main-nav a"
  );

  categorias.forEach(link => {
    if (link.dataset.amCategoriaConfigurada === "1") {
      return;
    }

    link.dataset.amCategoriaConfigurada = "1";

    link.addEventListener("click", () => {
      const categoria =
        link.dataset.categoria ||
        link.textContent.trim();

      if (!categoria) return;

      try {
        sessionStorage.setItem(
          "africanmundo-categoria",
          categoria
        );
      } catch (_) {}
    });
  });
}

/* ---------- MANIFEST PWA ---------- */

function garantirManifest() {
  let manifest = document.querySelector(
    'link[rel="manifest"]'
  );

  if (manifest) return;

  manifest = document.createElement("link");
  manifest.rel = "manifest";
  manifest.href = "manifest.json";

  document.head.appendChild(manifest);
}

/* ---------- SERVICE WORKER ---------- */

function iniciarPWA() {
  garantirManifest();

  if (!("serviceWorker" in navigator)) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(registro => {
        console.log(
          "AfricanMundo: PWA activo.",
          registro.scope
        );
      })
      .catch(erro => {
        console.warn(
          "AfricanMundo: erro no Service Worker:",
          erro
        );
      });
  });
}

/* ---------- EXPORTAR FUNÇÕES ---------- */

function disponibilizarFuncoes() {
  window.pesquisar = pesquisar;
  window.pesquisarTecla = pesquisarTecla;
  window.abrirPesquisa = abrirPesquisa;

  window.carregarNoticias = carregarNoticias;
  window.carregarAnuncios = carregarAnuncios;

  window.mostrarDestaque = mostrarDestaque;
  window.iniciarDestaque = iniciarDestaque;

  window.mostrarNotificacoes = mostrarNotificacoes;
  window.mostrarFerramentas = mostrarFerramentas;
  window.mostrarEu = mostrarEu;
  window.mostrarCores = mostrarCores;

  window.alterarCor = alterarCor;
  window.escolherCor = escolherCor;
  window.aplicarCor = aplicarCor;

  window.abrirPainel = abrirPainel;
  window.fecharPainel = fecharPainel;

  window.partilharSite = partilharSite;
  window.abrirRede = abrirRede;
  window.abrirGoogle = abrirGoogle;

  window.configurarTopo = configurarTopo;
  window.restaurarCor = restaurarCor;

  window.anuncioEstaAtivo = anuncioEstaAtivo;
  window.abrirNoticia = abrirNoticia;
}

/* ---------- INICIALIZAÇÃO PRINCIPAL ---------- */

async function iniciarAfricanMundo() {
  if (africanMundoIniciado) return;

  africanMundoIniciado = true;

  console.log(
    "AfricanMundo: a iniciar aplicação..."
  );

  garantirEstilosApp();
  disponibilizarFuncoes();

  restaurarCor();

  configurarBotoesTopo();
  configurarBotoesData();
  configurarPesquisa();
  configurarTeclado();
  configurarMenuMobile();
  configurarTopo();
  configurarDestaque();
  configurarCategorias();
  configurarVisibilidade();
  protegerImagens();

  iniciarPWA();

  const resultados = await Promise.allSettled([
    carregarNoticias(),
    carregarAnuncios()
  ]);

  resultados.forEach((resultado, indice) => {
    if (resultado.status === "rejected") {
      console.error(
        indice === 0
          ? "AfricanMundo: falha ao carregar notícias."
          : "AfricanMundo: falha ao carregar anúncios.",
        resultado.reason
      );
    }
  });

  iniciarDestaque();
  iniciarAtualizacaoAutomatica();
  iniciarRealtimeNoticias();

  console.log(
    "AfricanMundo: aplicação iniciada com sucesso."
  );
}

/* ---------- INICIAR QUANDO O HTML ESTIVER PRONTO ---------- */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    iniciarAfricanMundo,
    { once: true }
  );
} else {
  iniciarAfricanMundo();
}

/* =====================================================
   FIM DA PARTE 6/6
   FIM DO APP.JS
===================================================== */
       
