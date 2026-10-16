
"use strict";

/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 1/6 — CONFIGURAÇÃO E FUNÇÕES AUXILIARES
===================================================== */

const SUPABASE_URL = "https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY = "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1200&q=75";

const LIMITE_ULTIMAS = 10;
const LIMITE_CATEGORIA = 4;
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
  return String(valor ?? "").replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c];
  });
}

function obterTitulo(n) {
  return n?.titulo || n?.title || n?.nome || "Notícia sem título";
}

function obterTexto(n) {
  return n?.texto || n?.conteudo || n?.descricao ||
    n?.resumo || n?.description || "";
}

function obterImagem(n) {
  const imagem = n?.imagem || n?.image || n?.imagem_url ||
    n?.image_url || n?.thumbnail || "";

  return typeof imagem === "string" &&
    /^https?:\/\//i.test(imagem)
      ? imagem
      : FALLBACK_IMG;
}

function obterCategoria(n) {
  return n?.categoria || n?.category || "Atualidades";
}

function obterData(n) {
  return n?.data || n?.created_at || n?.published_at || "";
}

function formatarData(valor) {
  if (!valor) return "";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";

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

  return limpo.length <= limite
    ? limpo
    : limpo.slice(0, limite).trimEnd() + "…";
}

function ordenarPorData(lista) {
  return [...lista].sort(function (a, b) {
    const dataA = new Date(obterData(a) || 0).getTime() || 0;
    const dataB = new Date(obterData(b) || 0).getTime() || 0;

    if (dataB !== dataA) return dataB - dataA;

    return Number(b.id || 0) - Number(a.id || 0);
  });
}

function obterNoticiasUnicas(lista) {
  const vistos = new Set();

  return ordenarPorData(lista).filter(function (n) {
    const chave = String(
      n.id || n.url_original || n.id_externo || obterTitulo(n)
    );

    if (vistos.has(chave)) return false;

    vistos.add(chave);
    return true;
  });
}

function elemento(id) {
  return document.getElementById(id);
}

function primeiroElemento(ids) {
  for (const id of ids) {
    const el = elemento(id);
    if (el) return el;
  }

  return null;
}

function definirMensagem(el, mensagem) {
  if (!el) return;

  el.innerHTML =
    `<p class="am-mensagem">${esc(mensagem)}</p>`;
}

function abrirNoticia(id) {
  if (id === undefined || id === null || id === "") return;

  window.location.href =
    "noticia.html?id=" + encodeURIComponent(String(id));
}



/* =====================================================
   PARTE 2/6 — CARTÕES E CATEGORIAS
===================================================== */

function criarCard(n) {
  const titulo = esc(obterTitulo(n));
  const imagem = esc(obterImagem(n));
  const categoria = esc(obterCategoria(n));
  const data = esc(formatarData(obterData(n)));
  const descricao = esc(resumo(obterTexto(n), 125));
  const url = "noticia.html?id=" +
    encodeURIComponent(String(n.id ?? ""));

  return `
    <article class="am-news-card">
      <a class="am-news-image-link"
         href="${url}" aria-label="${titulo}">
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
        <span class="am-news-category">${categoria}</span>

        <h3 class="am-news-title">
          <a href="${url}">${titulo}</a>
        </h3>

        ${descricao
          ? `<p class="am-news-summary">${descricao}</p>`
          : ""}

        <div class="am-news-meta">${data}</div>
      </div>
    </article>
  `;
}

function renderizarLista(el, lista, limite = LIMITE_CATEGORIA) {
  if (!el) return;

  const itens = lista.slice(0, limite);

  if (!itens.length) {
    definirMensagem(
      el,
      "Ainda não existem notícias nesta secção."
    );
    return;
  }

  el.innerHTML = itens.map(criarCard).join("");
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

function procurarSecaoCategoria(ids) {
  const lista = primeiroElemento(ids);

  if (!lista) return null;

  if (lista.matches("section,article")) return lista;

  return lista.closest(
    "section,article,.news-section,.categoria-section"
  ) || lista.parentElement;
}

/* =====================================================
   FILTROS DAS CATEGORIAS
===================================================== */

function noticiaDaCategoria(n, categoria) {
  const cat = norm(categoria);
  const categoriaNoticia = norm(n.categoria);
  const subcategoria = norm(n.subcategoria);
  const pais = norm(n.pais);

  if (cat === "mocambique" || cat === "mozambique") {
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
      categoriaNoticia.startsWith("internacional") ||
      pais === "africa" ||
      subcategoria.includes("africa")
    );
  }

  if (cat === "futebol") {
    return (
      categoriaNoticia.includes("futebol") ||
      subcategoria.includes("futebol")
    );
  }

  if (cat === "desporto" || cat === "esporte") {
    return (
      categoriaNoticia.includes("desporto") ||
      categoriaNoticia.includes("esporte") ||
      categoriaNoticia.includes("futebol") ||
      subcategoria.includes("desporto") ||
      subcategoria.includes("esporte")
    );
  }

  if (cat === "negocios" || cat === "economia") {
    return (
      categoriaNoticia.includes("negocio") ||
      categoriaNoticia.includes("economia") ||
      categoriaNoticia.includes("emprego") ||
      subcategoria.includes("economia") ||
      subcategoria.includes("negocio")
    );
  }

  if (cat === "entretenimento" || cat === "cultura") {
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
    subcategoria.includes(cat)
  );
}

function renderizarCategorias() {
  const categorias = [
    {
      categoria: "mocambique",
      ids: [
        "mocambiqueNoticias",
        "listaMocambique",
        "noticiasMocambique"
      ]
    },
    {
      categoria: "africa",
      ids: [
        "africaNoticias",
        "listaAfrica",
        "noticiasAfrica"
      ]
    },
    {
      categoria: "futebol",
      ids: [
        "futebolNoticias",
        "listaFutebol",
        "noticiasFutebol"
      ]
    },
    {
      categoria: "desporto",
      ids: [
        "desportoNoticias",
        "listaDesporto",
        "noticiasDesporto"
      ]
    },
    {
      categoria: "negocios",
      ids: [
        "negociosNoticias",
        "listaNegocios",
        "noticiasNegocios"
      ]
    },
    {
      categoria: "entretenimento",
      ids: [
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
      return noticiaDaCategoria(n, item.categoria);
    });

    renderizarLista(destino, lista, LIMITE_CATEGORIA);
  });

  const listaGeral = primeiroElemento([
    "ultimasNoticias",
    "listaNoticias",
    "noticiasRecentes",
    "ultimas-noticias",
    "newsGrid"
  ]);

  if (listaGeral) {
    renderizarLista(listaGeral, noticias, LIMITE_ULTIMAS);
  }
}



/* =====================================================
   PARTE 3/6 — DESTAQUE E SUPABASE
===================================================== */

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
  const descricao = esc(resumo(obterTexto(n), 220));

  const url = "noticia.html?id=" +
    encodeURIComponent(String(n.id ?? ""));

  area.innerHTML = `
    <article class="am-destaque-card">
      <a href="${url}" class="am-destaque-imagem">
        <img
          src="${imagem}"
          alt="${titulo}"
          fetchpriority="high"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >
      </a>

      <div class="am-destaque-conteudo">
        <span class="am-news-category">${categoria}</span>

        <h2>
          <a href="${url}">${titulo}</a>
        </h2>

        ${descricao
          ? `<p>${descricao}</p>`
          : ""}

        <div class="am-news-meta">${data}</div>

        <a href="${url}" class="am-ler-noticia">
          Ler notícia →
        </a>
      </div>
    </article>
  `;
}

function iniciarDestaque() {
  if (timerDestaque) {
    clearInterval(timerDestaque);
  }

  timerDestaque = null;

  if (noticias.length < 2 || document.hidden) return;

  timerDestaque = setInterval(function () {
    indiceDestaque =
      (indiceDestaque + 1) % noticias.length;

    mostrarDestaque();
  }, INTERVALO_DESTAQUE);
}

function configurarDestaque() {
  const area = elemento("destaque");

  if (!area || area.dataset.amDestaque === "1") return;

  area.dataset.amDestaque = "1";

  area.addEventListener("mouseenter", function () {
    if (timerDestaque) {
      clearInterval(timerDestaque);
    }

    timerDestaque = null;
  });

  area.addEventListener("mouseleave", iniciarDestaque);

  iniciarDestaque();
}

/* =====================================================
   CARREGAMENTO DAS NOTÍCIAS
===================================================== */

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
        "id,titulo,imagem,categoria,subcategoria,texto,data,fonte,url_original,id_externo,idioma,visualizacoes,pais,provincia"
      )
      .order("data", { ascending: false })
      .order("id", { ascending: false })
      .limit(500);

    if (resposta.error) {
      throw resposta.error;
    }

    noticias = obterNoticiasUnicas(
      resposta.data || []
    );

    indiceDestaque = noticias.length
      ? indiceDestaque % noticias.length
      : 0;

    renderizarCategorias();
    mostrarDestaque();

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



/* =========================================
   AFRICANMUNDO — APP.JS PARTE 4/6
   PESQUISA, ANÚNCIOS E PAINÉIS
========================================= */

/* ---------- PESQUISA DE NOTÍCIAS ---------- */

function pesquisar(termo) {
  const campo = primeiroElemento([
    "searchInput",
    "pesquisaInput",
    "campoPesquisa",
    "search",
    "pesquisarInput"
  ]);

  const consulta = String(
    termo !== undefined ? termo : campo?.value || ""
  ).trim();

  ultimaPesquisa = consulta;

  if (!consulta) {
    definirMensagem(
      ["resultadosPesquisa", "resultados-pesquisa", "searchResults"],
      "Escreva uma palavra para pesquisar notícias."
    );
    return;
  }

  const palavras = norm(consulta)
    .split(/\s+/)
    .filter(Boolean);

  const resultados = obterNoticiasUnicas(noticias).filter((n) => {
    const texto = norm([
      obterTitulo(n),
      obterTexto(n),
      obterCategoria(n),
      n.subcategoria || "",
      n.pais || "",
      n.provincia || "",
      n.fonte || ""
    ].join(" "));

    return palavras.every((palavra) => texto.includes(palavra));
  });

  const destino = primeiroElemento([
    "resultadosPesquisa",
    "resultados-pesquisa",
    "searchResults",
    "pesquisaResultados",
    "resultadosNoticias"
  ]);

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
      destino.hidden = false;
      destino.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      return;
    }

    renderizarLista(
      destino,
      resultados.slice(0, 50),
      "Não existem resultados."
    );

    destino.hidden = false;
    destino.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    return;
  }

  const url = new URL("categoria.html", window.location.href);
  url.searchParams.set("pesquisa", consulta);
  window.location.href = url.href;
}

function pesquisarTecla(evento) {
  if (evento && evento.key === "Enter") {
    evento.preventDefault();
    pesquisar();
  }
}

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

  const destino = new URL("categoria.html", window.location.href);
  destino.searchParams.set("pesquisa", "");
  window.location.href = destino.href;
}

/* ---------- ANÚNCIOS ---------- */

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

  if (inicio && !Number.isNaN(inicio.getTime()) && agora < inicio) {
    return false;
  }

  if (fim && !Number.isNaN(fim.getTime()) && agora > fim) {
    return false;
  }

  return true;
}

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
    link.addEventListener("click", (evento) => {
      evento.preventDefault();
    });
  }

  const imagemUrl =
    anuncio.imagem ||
    anuncio.imagem_url ||
    anuncio.banner ||
    anuncio.video_thumbnail ||
    "";

  if (imagemUrl) {
    const imagem = document.createElement("img");
    imagem.src = imagemUrl;
    imagem.alt = anuncio.titulo || anuncio.empresa || "Anúncio";
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

    const secoes = [
      "anunciosAtivosSection",
      "anunciosAtivos",
      "listaAnuncios",
      "anuncios-container"
    ];

    const secao = primeiroElemento(secoes);
    if (!secao) return;

    secao.innerHTML = "";

    if (!anuncios.length) {
      secao.hidden = true;
      return;
    }

    secao.hidden = false;

    anuncios.forEach((anuncio) => {
      secao.appendChild(criarCardAnuncio(anuncio));
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

/* ---------- PAINÉIS DO CABEÇALHO ---------- */

function fecharPainel(id) {
  const painel = elemento(id);
  if (!painel) return;

  painel.classList.remove("aberto", "ativo", "mostrar");
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
  ].forEach((outroId) => {
    if (outroId !== id) fecharPainel(outroId);
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

/* ---------- CORES DO SITE ---------- */

function alterarCor(cor) {
  const cores = {
    verde: "#168a45",
    azul: "#1769aa",
    vermelho: "#c62828",
    roxo: "#7137a8",
    laranja: "#e87516"
  };

  const nome = norm(cor);
  const selecionada = cores[nome] ? nome : "verde";
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

  document.querySelectorAll("[data-cor]").forEach((botao) => {
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

/* FIM DA PARTE 4/6 */



/* =========================================
   AFRICANMUNDO — APP.JS PARTE 5/6
   MENU, BOTÕES, ATUALIZAÇÃO E ESTILOS
========================================= */

/* ---------- ESTILOS RESPONSIVOS ---------- */

function garantirEstilosApp() {
  if (elemento("africanmundo-app-estilos")) return;

  const estilo = document.createElement("style");
  estilo.id = "africanmundo-app-estilos";

  estilo.textContent = `
    .am-news-card,
    .am-anuncio-card {
      min-width: 0;
      overflow: hidden;
      background: var(--card, #fff);
      color: var(--txt, #202522);
      border: 1px solid var(--border, #e1e7e3);
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,.045);
    }

    .am-news-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform .18s ease, box-shadow .18s ease;
    }

    .am-news-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,.09);
    }

    .am-news-image {
      display: block;
      width: 100%;
      height: 155px;
      object-fit: cover;
      background: #e9eeeb;
    }

    .am-news-content {
      padding: 11px;
      min-width: 0;
    }

    .am-news-title {
      margin: 0 0 7px;
      font-size: 15px;
      line-height: 1.4;
      font-weight: 750;
      overflow-wrap: anywhere;
    }

    .am-news-summary {
      margin: 0 0 8px;
      font-size: 13px;
      line-height: 1.5;
      color: var(--muted, #5e6963);
      overflow-wrap: anywhere;
    }

    .am-news-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 5px 9px;
      font-size: 11px;
      color: var(--muted, #68736d);
    }

    .am-news-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .am-destaque-card {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 0;
      overflow: hidden;
      border-radius: 14px;
      background: var(--card, #fff);
      border: 1px solid var(--border, #e1e7e3);
      color: var(--txt, #202522);
    }

    .am-destaque-imagem {
      display: block;
      width: 100%;
      height: 280px;
      object-fit: cover;
      background: #e9eeeb;
    }

    .am-destaque-conteudo {
      padding: 20px;
      align-self: center;
      min-width: 0;
    }

    .am-destaque-etiqueta,
    .am-anuncio-etiqueta {
      display: inline-block;
      margin-bottom: 8px;
      color: var(--p, #168a45);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .04em;
    }

    .am-destaque-titulo {
      margin: 0 0 10px;
      font-size: clamp(20px, 2.4vw, 30px);
      line-height: 1.25;
      overflow-wrap: anywhere;
    }

    .am-destaque-resumo {
      margin: 0 0 12px;
      font-size: 14px;
      line-height: 1.6;
      color: var(--muted, #5e6963);
    }

    .am-destaque-link {
      display: inline-flex;
      padding: 9px 14px;
      border-radius: 8px;
      background: var(--p, #168a45);
      color: #fff;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
    }

    .am-mensagem {
      padding: 14px;
      border-radius: 10px;
      color: var(--muted, #65716a);
      background: var(--card, #fff);
      font-size: 14px;
    }

    .am-pesquisa-cabecalho {
      margin: 12px 0;
      font-weight: 750;
      overflow-wrap: anywhere;
    }

    .am-anuncio-link {
      display: block;
      color: inherit;
      text-decoration: none;
    }

    .am-anuncio-link img {
      display: block;
      width: 100%;
      max-height: 220px;
      object-fit: cover;
    }

    .am-anuncio-conteudo {
      padding: 12px;
    }

    .am-anuncio-conteudo h3 {
      margin: 0 0 7px;
      font-size: 15px;
    }

    .am-anuncio-conteudo p {
      margin: 0;
      font-size: 13px;
      line-height: 1.5;
    }

    [id$="Panel"].aberto,
    [id$="Panel"].ativo,
    [id$="Panel"].mostrar {
      display: block;
    }

    [hidden] {
      display: none !important;
    }

    @media (max-width: 900px) {
      .am-news-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      .am-news-image {
        height: 140px;
      }

      .am-destaque-imagem {
        height: 245px;
      }
    }

    @media (max-width: 650px) {
      .am-news-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 9px;
      }

      .am-news-image {
        height: 112px;
      }

      .am-news-content {
        padding: 9px;
      }

      .am-news-title {
        font-size: 13px;
        line-height: 1.35;
      }

      .am-news-summary {
        font-size: 12px;
        line-height: 1.4;
      }

      .am-news-meta {
        font-size: 10px;
      }

      .am-destaque-card {
        grid-template-columns: minmax(0, 1fr);
      }

      .am-destaque-imagem {
        height: 190px;
        max-height: 48vw;
      }

      .am-destaque-conteudo {
        padding: 12px;
      }

      .am-destaque-titulo {
        font-size: 19px;
        line-height: 1.3;
      }

      .am-destaque-resumo {
        font-size: 13px;
        line-height: 1.45;
      }

      .am-anuncio-link img {
        max-height: 160px;
      }

      .am-news-card:hover {
        transform: none;
      }
    }

    @media (max-width: 360px) {
      .am-news-grid {
        gap: 7px;
      }

      .am-news-image {
        height: 98px;
      }

      .am-news-content {
        padding: 8px;
      }

      .am-news-title {
        font-size: 12px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .am-news-card {
        transition: none;
      }
    }
  `;

  document.head.appendChild(estilo);
}

/* ---------- BOTÕES DO CABEÇALHO ---------- */

function configurarBotoesTopo() {
  const grupos = [
    {
      ids: ["notificationBtn", "btnNotificacao", "notificacaoBtn"],
      acao: mostrarNotificacoes
    },
    {
      ids: ["toolsBtn", "btnFerramentas", "ferramentasBtn"],
      acao: mostrarFerramentas
    },
    {
      ids: ["userBtn", "btnUsuario", "btnUser"],
      acao: mostrarEu
    },
    {
      ids: ["colorBtn", "btnCores", "btnColor"],
      acao: mostrarCores
    },
    {
      ids: ["searchBtn", "btnPesquisa", "btnSearch"],
      acao: abrirPesquisa
    },
    {
      ids: ["shareBtn", "btnPartilhar", "btnShare"],
      acao: partilharSite
    }
  ];

  grupos.forEach((grupo) => {
    grupo.ids.forEach((id) => {
      const botao = elemento(id);
      if (!botao || botao.dataset.amConfigurado === "1") return;

      botao.dataset.amConfigurado = "1";
      botao.addEventListener("click", (evento) => {
        evento.preventDefault();
        grupo.acao();
      });
    });
  });

  document.querySelectorAll("[data-am-action]").forEach((botao) => {
    if (botao.dataset.amConfigurado === "1") return;

    const acoes = {
      notificacoes: mostrarNotificacoes,
      notificacao: mostrarNotificacoes,
      ferramentas: mostrarFerramentas,
      usuario: mostrarEu,
      utilizador: mostrarEu,
      cores: mostrarCores,
      pesquisa: abrirPesquisa,
      pesquisar: abrirPesquisa,
      partilhar: partilharSite
    };

    const nome = norm(botao.dataset.amAction);
    if (!acoes[nome]) return;

    botao.dataset.amConfigurado = "1";
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      acoes[nome]();
    });
  });
}

function configurarBotoesData() {
  document.querySelectorAll("[data-cor]").forEach((botao) => {
    if (botao.dataset.amCorConfigurada === "1") return;

    botao.dataset.amCorConfigurada = "1";
    botao.addEventListener("click", () => {
      alterarCor(botao.dataset.cor);
    });
  });

  document.querySelectorAll("[data-fechar-painel]").forEach((botao) => {
    if (botao.dataset.amFecharConfigurado === "1") return;

    botao.dataset.amFecharConfigurado = "1";
    botao.addEventListener("click", () => {
      fecharPainel(botao.dataset.fecharPainel);
    });
  });
}

/* ---------- PESQUISA E TECLADO ---------- */

function configurarPesquisa() {
  const campo = primeiroElemento([
    "searchInput",
    "pesquisaInput",
    "campoPesquisa",
    "search",
    "pesquisarInput"
  ]);

  if (campo && campo.dataset.amPesquisaConfigurada !== "1") {
    campo.dataset.amPesquisaConfigurada = "1";

    campo.addEventListener("keydown", pesquisarTecla);

    const formulario = campo.closest("form");
    if (formulario && formulario.dataset.amFormularioPesquisa !== "1") {
      formulario.dataset.amFormularioPesquisa = "1";

      formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        pesquisar();
      });
    }
  }

  const botao = primeiroElemento([
    "searchBtn",
    "btnPesquisa",
    "btnSearch"
  ]);

  if (botao && !botao.dataset.amPesquisaBotaoConfigurado) {
    botao.dataset.amPesquisaBotaoConfigurado = "1";
    botao.addEventListener("click", (evento) => {
      if (campo && campo.value.trim()) {
        evento.preventDefault();
        pesquisar();
      }
    });
  }
}

function configurarTeclado() {
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      [
        "notificationPanel",
        "toolsPanel",
        "userPanel",
        "colorPanel"
      ].forEach(fecharPainel);
    }

    if (
      evento.key === "/" &&
      !evento.ctrlKey &&
      !evento.altKey &&
      !evento.metaKey
    ) {
      const alvo = evento.target;
      const tag = alvo?.tagName?.toLowerCase();

      if (
        tag !== "input" &&
        tag !== "textarea" &&
        !alvo?.isContentEditable
      ) {
        evento.preventDefault();
        abrirPesquisa();
      }
    }
  });
}

/* ---------- MENU MÓVEL ---------- */

function configurarMenuMobile() {
  const botoes = [
    "menuBtn",
    "menuToggle",
    "mobileMenuBtn",
    "btnMenu",
    "hamburgerBtn"
  ];

  const menus = [
    "mobileMenu",
    "menuMobile",
    "navMenu",
    "mainNav",
    "menuPrincipal"
  ];

  const botao = primeiroElemento(botoes);
  const menu = primeiroElemento(menus);

  if (botao && menu && botao.dataset.amMenuConfigurado !== "1") {
    botao.dataset.amMenuConfigurado = "1";

    botao.setAttribute("aria-expanded", "false");

    botao.addEventListener("click", () => {
      const aberto =
        menu.classList.contains("aberto") ||
        menu.classList.contains("ativo");

      menu.classList.toggle("aberto", !aberto);
      menu.classList.toggle("ativo", !aberto);
      menu.hidden = false;

      botao.setAttribute("aria-expanded", String(!aberto));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("aberto", "ativo");
        botao.setAttribute("aria-expanded", "false");
      });
    });
  }

  document.querySelectorAll(".mobile-bottom-nav a").forEach((link) => {
    const destino = link.getAttribute("href");
    if (!destino) return;

    try {
      const urlLink = new URL(destino, window.location.href);
      const urlAtual = new URL(window.location.href);

      if (
        urlLink.pathname === urlAtual.pathname &&
        urlLink.search === urlAtual.search
      ) {
        link.classList.add("ativo");
        link.setAttribute("aria-current", "page");
      }
    } catch (_) {}
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

  if (!botao || botao.dataset.amTopoConfigurado === "1") return;

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

  window.addEventListener("scroll", atualizar, { passive: true });
  atualizar();
}

/* ---------- PROTEÇÃO DAS IMAGENS ---------- */

function protegerImagens() {
  document.querySelectorAll("img").forEach((imagem) => {
    if (imagem.dataset.amProtegida === "1") return;

    imagem.dataset.amProtegida = "1";

    imagem.addEventListener("error", () => {
      if (imagem.dataset.amFallbackUsado === "1") {
        imagem.style.visibility = "hidden";
        return;
      }

      imagem.dataset.amFallbackUsado = "1";
      imagem.src = FALLBACK_IMG;
    });
  });
}

/* ---------- COR GUARDADA ---------- */

function restaurarCor() {
  try {
    const cor = localStorage.getItem("africanmundo-cor");
    if (cor) alterarCor(cor);
  } catch (_) {}
}

/* ---------- ATUALIZAÇÃO AUTOMÁTICA ---------- */

function iniciarAtualizacaoAutomatica() {
  if (timerAtualizacao) {
    clearInterval(timerAtualizacao);
  }

  timerAtualizacao = setInterval(() => {
    if (document.visibilityState === "visible") {
      carregarNoticias();
      carregarAnuncios();
    }
  }, INTERVALO_ATUALIZACAO);
}

/* ---------- SUPABASE REALTIME ---------- */

function iniciarRealtimeNoticias() {
  if (!db || canalNoticias) return;

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
      .subscribe((estado) => {
        if (estado === "CHANNEL_ERROR") {
          console.warn(
            "AfricanMundo: atualização em tempo real indisponível; será usada a atualização automática."
          );
        }
      });
  } catch (erro) {
    console.warn(
      "AfricanMundo: não foi possível iniciar atualizações em tempo real.",
      erro
    );
  }
}

/* ---------- VISIBILIDADE DA PÁGINA ---------- */

function configurarVisibilidade() {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      carregarNoticias();
      carregarAnuncios();
    }
  });
}

/* ---------- PARTILHAR E REDES SOCIAIS ---------- */

async function partilharSite() {
  const dados = {
    title: "AfricanMundo — Notícias de África",
    text: "A informação que liga África ao mundo.",
    url: window.location.href
  };

  if (navigator.share) {
    try {
      await navigator.share(dados);
      return;
    } catch (erro) {
      if (erro?.name === "AbortError") return;
    }
  }

  const texto = dados.title + "\n" + dados.text + "\n" + dados.url;

  try {
    await navigator.clipboard.writeText(texto);
    alert("Ligação copiada. Já pode partilhá-la.");
  } catch (_) {
    window.prompt("Copie esta ligação para partilhar:", dados.url);
  }
}

function abrirRede(rede) {
  const enderecos = {
    google: "https://www.google.com/",
    facebook: "https://www.facebook.com/",
    youtube: "https://www.youtube.com/",
    whatsapp: "https://wa.me/",
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/"
  };

  const destino = enderecos[norm(rede)];

  if (destino) {
    window.open(destino, "_blank", "noopener,noreferrer");
  }
}

function abrirGoogle() {
  abrirRede("google");
}

/* FIM DA PARTE 5/6 */



/* =========================================
   AFRICANMUNDO — APP.JS PARTE 6/6
   INICIALIZAÇÃO E FINALIZAÇÃO
========================================= */

/* ---------- PWA: MANIFESTO ---------- */

function garantirManifest() {
  if (document.querySelector('link[rel="manifest"]')) return;

  const manifesto = document.createElement("link");
  manifesto.rel = "manifest";
  manifesto.href = "manifest.json";

  document.head.appendChild(manifesto);
}

/* ---------- PWA: SERVICE WORKER ---------- */

function iniciarPWA() {
  garantirManifest();

  if (!("serviceWorker" in navigator)) return;

  if (location.protocol !== "https:" && location.hostname !== "localhost") {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => {
        console.log("AfricanMundo: PWA preparado.");
      })
      .catch((erro) => {
        console.warn(
          "AfricanMundo: não foi possível registar o Service Worker.",
          erro
        );
      });
  }, { once: true });
}

/* ---------- MEMÓRIA DA CATEGORIA ---------- */

function configurarCategorias() {
  const parametros = new URLSearchParams(window.location.search);
  const categoriaUrl = parametros.get("categoria");

  if (categoriaUrl) {
    try {
      sessionStorage.setItem(
        "africanmundo-categoria",
        categoriaUrl
      );
    } catch (_) {}
  }

  document.querySelectorAll("[data-categoria]").forEach((botao) => {
    if (botao.dataset.amCategoriaConfigurada === "1") return;

    botao.dataset.amCategoriaConfigurada = "1";

    botao.addEventListener("click", () => {
      const categoria = botao.dataset.categoria;
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

/* ---------- ARRANQUE PRINCIPAL ---------- */

async function iniciarAfricanMundo() {
  if (africanMundoIniciado) return;

  africanMundoIniciado = true;

  garantirEstilosApp();
  restaurarCor();

  configurarBotoesTopo();
  configurarBotoesData();
  configurarPesquisa();
  configurarTeclado();
  configurarMenuMobile();
  configurarTopo();
  configurarCategorias();
  configurarVisibilidade();

  protegerImagens();

  document.addEventListener("load", protegerImagens, true);

  await Promise.allSettled([
    carregarNoticias(),
    carregarAnuncios()
  ]);

  configurarDestaque();
  iniciarAtualizacaoAutomatica();
  iniciarRealtimeNoticias();
  iniciarPWA();

  console.log("AFRICANMUNDO APP.JS FOI CARREGADO");
}

/* ---------- FUNÇÕES DISPONÍVEIS NO HTML ---------- */

window.abrirNoticia = abrirNoticia;
window.carregarNoticias = carregarNoticias;
window.carregarAnuncios = carregarAnuncios;

window.pesquisar = pesquisar;
window.pesquisarTecla = pesquisarTecla;
window.abrirPesquisa = abrirPesquisa;

window.mostrarNotificacoes = mostrarNotificacoes;
window.mostrarFerramentas = mostrarFerramentas;
window.mostrarEu = mostrarEu;
window.mostrarCores = mostrarCores;

window.alterarCor = alterarCor;
window.escolherCor = escolherCor;
window.aplicarCor = aplicarCor;

window.partilharSite = partilharSite;
window.abrirRede = abrirRede;
window.abrirGoogle = abrirGoogle;

window.fecharPainel = fecharPainel;
window.abrirPainel = abrirPainel;

window.configurarMenuMobile = configurarMenuMobile;
window.iniciarAfricanMundo = iniciarAfricanMundo;

/* ---------- INICIALIZAÇÃO SEGURA ---------- */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    iniciarAfricanMundo,
    { once: true }
  );
} else {
  iniciarAfricanMundo();
}

/* FIM DO APP.JS — AFRICANMUNDO */
