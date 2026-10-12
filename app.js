
/* =========================================================
   AFRICANMUNDO — APP.JS MELHORADO
   PARTE 1/3 — CONFIGURAÇÃO, SEGURANÇA E CARTÕES
   ========================================================= */

"use strict";

/* SUPABASE */
const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/* CONFIGURAÇÕES GERAIS */
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=1200&q=75";

const LIMITE_ULTIMAS = 10;
const LIMITE_CATEGORIA = 4;
const INTERVALO_ATUALIZACAO = 5 * 60 * 1000;
const INTERVALO_DESTAQUE = 10 * 1000;

let noticias = [];
let indiceDestaque = 0;
let timerDestaque = null;
let timerAtualizacao = null;
let timerRealtime = null;
let canalNoticias = null;
let carregandoNoticias = false;
let africanMundoIniciado = false;
let ultimaPesquisa = "";

/* NORMALIZAR TEXTO */
function norm(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/* ESCAPAR TEXTO HTML */
function esc(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* OBTER DATA */
function obterData(noticia) {
  const valor = noticia?.data || noticia?.created_at || "";
  if (!valor) return null;

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

/* FORMATAR DATA */
function formatarData(valor) {
  if (!valor) return "Data não disponível";

  const data = valor instanceof Date
    ? valor
    : new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return "Data não disponível";
  }

  return data.toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* OBTER IMAGEM */
function obterImagem(noticia) {
  const imagem = String(
    noticia?.imagem ||
    noticia?.image ||
    noticia?.imagem_url ||
    ""
  ).trim();

  return imagem || FALLBACK_IMG;
}

/* OBTER TÍTULO */
function obterTitulo(noticia) {
  return String(
    noticia?.titulo ||
    noticia?.title ||
    "Notícia sem título"
  ).trim();
}

/* OBTER TEXTO DA NOTÍCIA */
function obterTexto(noticia) {
  return String(
    noticia?.texto ||
    noticia?.descricao ||
    noticia?.description ||
    noticia?.resumo ||
    ""
  ).trim();
}

/* CRIAR RESUMO */
function resumo(noticia, limite = 130) {
  const texto = obterTexto(noticia)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (texto.length <= limite) return texto;

  return texto.slice(0, limite).trimEnd() + "…";
}

/* OBTER CATEGORIA */
function obterCategoria(noticia) {
  return String(
    noticia?.subcategoria ||
    noticia?.categoria ||
    "Notícias"
  ).trim();
}

/* ABRIR NOTÍCIA */
function abrirNoticia(id) {
  if (id === undefined || id === null || id === "") return;

  window.location.href =
    "noticia.html?id=" + encodeURIComponent(String(id));
}

/* ORDENAR NOTÍCIAS DA MAIS RECENTE PARA A MAIS ANTIGA */
function ordenarPorData(lista) {
  return [...(Array.isArray(lista) ? lista : [])].sort(
    function (a, b) {
      const dataA = obterData(a)?.getTime() || 0;
      const dataB = obterData(b)?.getTime() || 0;

      if (dataA !== dataB) return dataB - dataA;

      return Number(b?.id || 0) - Number(a?.id || 0);
    }
  );
}

/* CARTÃO COMPACTO — COMPATÍVEL COM O CSS ANTIGO */
function criarCard(noticia) {
  if (!noticia) return "";

  const id = esc(noticia.id ?? "");
  const titulo = esc(obterTitulo(noticia));
  const imagem = esc(obterImagem(noticia));
  const categoria = esc(obterCategoria(noticia));
  const data = esc(formatarData(obterData(noticia)));
  const textoResumo = resumo(noticia, 115);
  const fonte = String(noticia.fonte || "").trim();

  return `
    <article class="card" data-noticia-id="${id}">
      <a
        href="noticia.html?id=${encodeURIComponent(String(noticia.id ?? ""))}"
        class="card-link"
        aria-label="${titulo}"
      >
        <img
          src="${imagem}"
          alt="${titulo}"
          loading="lazy"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >

        <div class="card-body">
          <span class="card-category">${categoria}</span>

          <h3 class="card-title">${titulo}</h3>

          ${
            textoResumo
              ? `<p class="card-text">${esc(textoResumo)}</p>`
              : ""
          }

          <div class="card-date">
            ${data}
            ${fonte ? ` · ${esc(fonte)}` : ""}
          </div>
        </div>
      </a>
    </article>
  `;
}

/* MOSTRAR LISTA DE NOTÍCIAS */
function renderizarLista(elementoOuId, lista, limite = LIMITE_CATEGORIA) {
  const container = typeof elementoOuId === "string"
    ? document.getElementById(elementoOuId)
    : elementoOuId;

  if (!container) return;

  const items = ordenarPorData(lista).slice(0, limite);

  if (!items.length) {
    container.innerHTML =
      '<p class="sem-noticias">Ainda não há notícias nesta secção.</p>';
    return;
  }

  container.innerHTML = items.map(criarCard).join("");
}

/* COMPATIBILIDADE COM NOMES USADOS ANTERIORMENTE */
function renderizarListaPorId(id, lista, limite) {
  renderizarLista(id, lista, limite);
}

/* ABRIR NOTÍCIA AO CLICAR NO CARTÃO */
document.addEventListener("click", function (event) {
  const cartao = event.target.closest("[data-noticia-id]");
  if (!cartao) return;

  if (event.target.closest("a")) return;

  abrirNoticia(cartao.dataset.noticiaId);
});



/* =========================================================
   AFRICANMUNDO — PARTE 2/3
   NOTÍCIAS, CATEGORIAS, DESTAQUE E PESQUISA
   ========================================================= */

/* DESCOBRIR O PRIMEIRO ELEMENTO DISPONÍVEL */
function encontrarElemento(ids) {
  for (const id of ids) {
    const elemento = document.getElementById(id);
    if (elemento) return elemento;
  }
  return null;
}

/* LOCALIZAR A SECÇÃO DE UMA CATEGORIA */
function encontrarSecaoCategoria(categoria) {
  const nomes = {
    mocambique: [
      "noticiasMocambique",
      "mocambique",
      "secaoMocambique",
      "listaMocambique",
      "gridMocambique"
    ],
    africa: [
      "noticiasAfrica",
      "africa",
      "secaoAfrica",
      "listaAfrica",
      "gridAfrica"
    ],
    futebol: [
      "noticiasFutebol",
      "futebol",
      "secaoFutebol",
      "listaFutebol",
      "gridFutebol"
    ],
    desporto: [
      "noticiasDesporto",
      "desporto",
      "secaoDesporto",
      "listaDesporto",
      "gridDesporto"
    ],
    negocios: [
      "noticiasNegocios",
      "negocios",
      "secaoNegocios",
      "listaNegocios",
      "gridNegocios"
    ],
    entretenimento: [
      "noticiasEntretenimento",
      "entretenimento",
      "secaoEntretenimento",
      "listaEntretenimento",
      "gridEntretenimento"
    ]
  };

  return encontrarElemento(nomes[categoria] || []);
}

/* VERIFICAR A CATEGORIA DE UMA NOTÍCIA */
function noticiaDaCategoria(noticia, categoria) {
  const cat = norm(noticia.categoria);
  const sub = norm(noticia.subcategoria);
  const pais = norm(noticia.pais);
  const titulo = norm(noticia.titulo);
  const texto = norm(noticia.texto);
  const alvo = norm(categoria);

  if (alvo === "mocambique") {
    return (
      cat.includes("mocambique") ||
      sub.includes("mocambique") ||
      pais === "mocambique" ||
      pais === "mozambique" ||
      pais === "mz"
    );
  }

  if (alvo === "africa") {
    return (
      cat === "africa" ||
      cat.startsWith("africa ") ||
      sub === "africa" ||
      sub.startsWith("africa ")
    );
  }

  if (alvo === "futebol") {
    return (
      cat.includes("futebol") ||
      sub.includes("futebol")
    );
  }

  if (alvo === "desporto") {
    return (
      cat.includes("desporto") ||
      sub.includes("desporto") ||
      cat.includes("esporte") ||
      sub.includes("esporte")
    );
  }

  if (alvo === "negocios") {
    return (
      cat.includes("negocio") ||
      sub.includes("negocio") ||
      cat.includes("economia") ||
      sub.includes("economia")
    );
  }

  if (alvo === "entretenimento") {
    return (
      cat.includes("entretenimento") ||
      sub.includes("entretenimento") ||
      cat.includes("cultura") ||
      sub.includes("cultura") ||
      cat.includes("musica") ||
      sub.includes("musica")
    );
  }

  return cat.includes(alvo) || sub.includes(alvo);
}

/* CARREGAR UMA CATEGORIA */
async function buscarCategoria(categoria, chave) {
  const chaveNormalizada = norm(chave || categoria);

  const lista = noticias.filter(function (noticia) {
    return noticiaDaCategoria(noticia, chaveNormalizada);
  });

  const container = encontrarSecaoCategoria(chaveNormalizada);

  if (container) {
    renderizarLista(container, lista, LIMITE_CATEGORIA);
  }

  return lista;
}

/* CARREGAR AS NOTÍCIAS DA BASE DE DADOS */
async function carregarNoticias() {
  if (!db || carregandoNoticias) return;

  carregandoNoticias = true;

  try {
    const resposta = await db
      .from("noticias")
      .select(
        "id, titulo, imagem, categoria, subcategoria, texto, data, fonte, url_original, id_externo, idioma, visualizacoes, pais"
      )
      .order("data", { ascending: false })
      .order("id", { ascending: false })
      .limit(500);

    if (resposta.error) {
      console.error(
        "AfricanMundo — erro ao carregar notícias:",
        resposta.error.message
      );
      return;
    }

    noticias = ordenarPorData(resposta.data || []);

    /* ÚLTIMAS NOTÍCIAS */
    const containerUltimas = encontrarElemento([
      "ultimasNoticias",
      "listaNoticias",
      "noticiasRecentes",
      "ultimas-noticias",
      "noticias",
      "newsList"
    ]);

    if (containerUltimas) {
      renderizarLista(
        containerUltimas,
        noticias,
        LIMITE_ULTIMAS
      );
    }

    /* CATEGORIAS DA PÁGINA INICIAL */
    await Promise.all([
      buscarCategoria("Moçambique", "mocambique"),
      buscarCategoria("África", "africa"),
      buscarCategoria("Futebol", "futebol"),
      buscarCategoria("Desporto", "desporto"),
      buscarCategoria("Negócios", "negocios"),
      buscarCategoria("Entretenimento", "entretenimento")
    ]);

    /* ATUALIZAR DESTAQUE */
    mostrarDestaque();

    console.log(
      "AfricanMundo — notícias carregadas:",
      noticias.length
    );
  } catch (erro) {
    console.error(
      "AfricanMundo — falha ao carregar notícias:",
      erro
    );
  } finally {
    carregandoNoticias = false;
  }
}

/* MOSTRAR NOTÍCIA EM DESTAQUE */
function mostrarDestaque() {
  const area = document.getElementById("destaque");
  if (!area || !noticias.length) return;

  const lista = ordenarPorData(noticias).slice(0, 10);
  if (!lista.length) return;

  if (indiceDestaque >= lista.length) {
    indiceDestaque = 0;
  }

  const noticia = lista[indiceDestaque];
  const titulo = esc(obterTitulo(noticia));
  const imagem = esc(obterImagem(noticia));
  const categoria = esc(obterCategoria(noticia));
  const data = esc(formatarData(obterData(noticia)));
  const id = esc(noticia.id ?? "");
  const textoResumo = resumo(noticia, 160);

  area.innerHTML = `
    <article
      class="destaque-card"
      data-noticia-id="${id}"
      style="
        position:relative;
        width:100%;
        max-width:100%;
        overflow:hidden;
      "
    >
      <a
        href="noticia.html?id=${encodeURIComponent(String(noticia.id ?? ""))}"
        aria-label="${titulo}"
        style="display:block;position:relative;"
      >
        <img
          src="${imagem}"
          alt="${titulo}"
          loading="eager"
          decoding="async"
          style="
            display:block;
            width:100%;
            height:330px;
            object-fit:cover;
          "
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >

        <div class="destaque-overlay">
          <span>${categoria}</span>
          <h2>${titulo}</h2>
          ${
            textoResumo
              ? `<p>${esc(textoResumo)}</p>`
              : ""
          }
          <small>${data}</small>
        </div>
      </a>
    </article>
  `;

  const imagemDestaque = area.querySelector("img");

  if (imagemDestaque && window.matchMedia("(max-width: 700px)").matches) {
    imagemDestaque.style.height = "210px";
  }
}

/* INICIAR ROTAÇÃO DO DESTAQUE */
function iniciarDestaque() {
  if (timerDestaque) {
    clearInterval(timerDestaque);
  }

  if (noticias.length < 2) return;

  timerDestaque = setInterval(function () {
    if (document.visibilityState !== "visible") return;

    indiceDestaque =
      (indiceDestaque + 1) % Math.min(noticias.length, 10);

    mostrarDestaque();
  }, INTERVALO_DESTAQUE);
}

/* PESQUISAR AO PRESSIONAR ENTER */
function pesquisarTecla(evento) {
  if (evento.key === "Enter") {
    evento.preventDefault();
    pesquisar();
  }
}

/* ABRIR A PESQUISA */
function abrirPesquisa() {
  const campo = encontrarElemento([
    "searchInput",
    "pesquisa",
    "campoPesquisa"
  ]);

  if (campo) {
    campo.focus();
    campo.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  const termo = window.prompt("O que deseja encontrar no AfricanMundo?");
  if (termo && termo.trim()) {
    pesquisar(termo.trim());
  }
}

/* EXECUTAR PESQUISA */
function pesquisar(termoRecebido) {
  const campo = encontrarElemento([
    "searchInput",
    "pesquisa",
    "campoPesquisa"
  ]);

  const termo = String(
    termoRecebido ??
    campo?.value ??
    ""
  ).trim();

  if (!termo) {
    campo?.focus();
    return;
  }

  ultimaPesquisa = termo;

  const alvo = norm(termo);

  const resultados = noticias.filter(function (noticia) {
    const texto = norm([
      noticia.titulo,
      noticia.texto,
      noticia.categoria,
      noticia.subcategoria,
      noticia.pais,
      noticia.fonte
    ].join(" "));

    return texto.includes(alvo);
  });

  let container = encontrarElemento([
    "resultadosPesquisa",
    "resultados-pesquisa",
    "pesquisaResultados",
    "listaResultados"
  ]);

  if (!container) {
    container = document.createElement("section");
    container.id = "resultadosPesquisa";
    container.className = "section";

    const principal = document.querySelector("main") || document.body;
    principal.prepend(container);
  }

  container.innerHTML = `
    <div class="section-header">
      <h2>Resultados da pesquisa</h2>
      <p>
        ${resultados.length}
        resultado(s) para “${esc(termo)}”
      </p>
    </div>
    <div class="grid">
      ${
        resultados.length
          ? resultados.slice(0, 50).map(criarCard).join("")
          : '<p class="sem-noticias">Não foram encontradas notícias com esse termo.</p>'
      }
    </div>
  `;

  container.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
     }



/* =========================================================
   AFRICANMUNDO — PARTE 3/3
   ANÚNCIOS, ATUALIZAÇÃO, MENU E INICIALIZAÇÃO
   ========================================================= */

/* ATUALIZAÇÃO AUTOMÁTICA */
function iniciarAtualizacaoAutomatica() {
  if (timerAtualizacao) {
    clearInterval(timerAtualizacao);
  }

  timerAtualizacao = setInterval(function () {
    if (document.visibilityState === "visible") {
      carregarNoticias();
      carregarAnuncios();
    }
  }, INTERVALO_ATUALIZACAO);
}

/* ATUALIZAÇÃO EM TEMPO REAL DO SUPABASE */

function iniciarRealtimeNoticias() {
  if (!db || canalNoticias) return;

  canalNoticias = db
    .channel("africanmundo-noticias-tempo-real")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "noticias"
      },
      function () {
        if (timerRealtime) {
          clearTimeout(timerRealtime);
        }

        timerRealtime = setTimeout(function () {
          timerRealtime = null;
          carregarNoticias();
        }, 2000);
      }
    )
    .subscribe(function (estado) {
      console.log(
        "AfricanMundo — Realtime:",
        estado
      );
    });
}

/* ANÚNCIOS ATIVOS */
async function carregarAnuncios() {
  const secao = document.getElementById("anunciosAtivosSection");
  const container = document.getElementById("anunciosAtivos");

  if (!secao || !container || !db) return;

  try {
    const agora = new Date().toISOString();

    const resposta = await db
      .from("pedidos_anuncios")
      .select(
        "id, empresa, responsavel, tipo_anuncio, local_anuncio, data_inicio, data_fim, descricao, arquivo_url, arquivo_tipo, link_destino, estado"
      )
      .eq("estado", "aprovado")
      .lte("data_inicio", agora)
      .gte("data_fim", agora)
      .order("id", { ascending: false })
      .limit(20);

    if (resposta.error) {
      console.warn("AfricanMundo — anúncios:", resposta.error.message);
      return;
    }

    const anuncios = resposta.data || [];

    if (!anuncios.length) {
      container.innerHTML = "";
      secao.style.display = "none";
      return;
    }

    container.innerHTML = anuncios.map(anuncioCard).join("");
    secao.style.display = "";

    container.querySelectorAll("video").forEach(function (video) {
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.play().catch(function () {});
    });
  } catch (erro) {
    console.warn("AfricanMundo — falha nos anúncios:", erro);
  }
}

/* CARTÃO DE ANÚNCIO */
function anuncioCard(anuncio) {
  const empresa = String(
    anuncio.empresa || anuncio.responsavel || "Anunciante"
  ).trim();

  const ficheiro = String(anuncio.arquivo_url || "").trim();
  const tipoFicheiro = norm(anuncio.arquivo_tipo || "");
  const descricao = String(anuncio.descricao || "").trim();
  const destino = String(anuncio.link_destino || "").trim();

  let media = "";

  if (ficheiro && (
    tipoFicheiro.includes("video") ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(ficheiro)
  )) {
    media = `
      <video class="anuncio-video"
        muted autoplay loop playsinline preload="metadata"
        aria-label="Publicidade de ${esc(empresa)}">
        <source src="${esc(ficheiro)}">
      </video>`;
  } else if (ficheiro) {
    media = `
      <img class="anuncio-imagem"
        src="${esc(ficheiro)}"
        alt="Publicidade de ${esc(empresa)}"
        loading="lazy" decoding="async">`;
  } else {
    media = '<div class="anuncio-sem-imagem" aria-hidden="true">📢</div>';
  }

  const corpo = `
    <div class="anuncio-media">${media}</div>
    <div class="anuncio-corpo">
      <small>PUBLICIDADE</small>
      <h3>${esc(empresa)}</h3>
      ${descricao ? `<p>${esc(descricao.slice(0, 120))}${descricao.length > 120 ? "…" : ""}</p>` : ""}
    </div>`;

  if (destino && /^https?:\/\//i.test(destino)) {
    return `
      <a class="anuncio-card"
        href="${esc(destino)}"
        target="_blank"
        rel="noopener noreferrer sponsored">${corpo}</a>`;
  }

  return `<article class="anuncio-card">${corpo}</article>`;
}

/* NOTIFICAÇÕES */
function mostrarNotificacoes() {
  abrirPainel("notificationPanel", "Notificações");
}

/* FERRAMENTAS */
function mostrarFerramentas() {
  abrirPainel("toolsPanel", "Ferramentas");
}

/* PAINEL DO UTILIZADOR */
function mostrarEu() {
  abrirPainel("userPanel", "Utilizador");
}

/* MOSTRAR UM PAINEL EXISTENTE OU CRIAR UM SIMPLES */
function abrirPainel(id, titulo) {
  let painel = document.getElementById(id);

  if (painel) {
    painel.hidden = !painel.hidden;
    painel.style.display = painel.hidden ? "none" : "block";
    return;
  }

  painel = document.createElement("div");
  painel.id = id;
  painel.className = "am-painel";
  painel.style.cssText =
    "position:fixed;right:12px;top:70px;z-index:10000;" +
    "width:min(320px,calc(100vw - 24px));padding:16px;" +
    "background:var(--card,#fff);color:var(--txt,#222);" +
    "border:1px solid var(--border,#ddd);border-radius:12px;" +
    "box-shadow:0 8px 28px #0002";

  painel.innerHTML = `
    <button type="button" aria-label="Fechar"
      style="float:right" onclick="this.parentElement.remove()">✕</button>
    <h3>${esc(titulo)}</h3>
    <p>Consulte as notícias mais recentes do AfricanMundo.</p>`;

  document.body.appendChild(painel);
}

/* CORES DO SITE */
const CORES = {
  verde: "#168a45",
  azul: "#1769aa",
  vermelho: "#c62828",
  roxo: "#7138a8",
  laranja: "#d96b16"
};

function corAtual() {
  return localStorage.getItem("africanmundo-cor") || CORES.verde;
}

function aplicarCor(cor) {
  const escolhida = cor || corAtual();
  const valida = Object.values(CORES).includes(escolhida)
    ? escolhida
    : CORES.verde;

  document.documentElement.style.setProperty("--p", valida);
  localStorage.setItem("africanmundo-cor", valida);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && !document.documentElement.classList.contains("tema-escuro")) {
    meta.content = valida;
  }
}

function alterarCor(cor) {
  aplicarCor(cor);
}

function mostrarCores() {
  let painel = document.getElementById("painelCores");

  if (painel) {
    painel.remove();
    return;
  }

  painel = document.createElement("div");
  painel.id = "painelCores";
  painel.style.cssText =
    "position:fixed;right:12px;top:70px;z-index:10001;" +
    "padding:12px;background:var(--card,#fff);" +
    "border:1px solid var(--border,#ddd);border-radius:12px";

  painel.innerHTML = Object.entries(CORES).map(function (item) {
    return `
      <button type="button"
        data-cor="${item[1]}"
        style="margin:4px;padding:8px;border:0;border-radius:8px;
        background:${item[1]};color:#fff">
        ${esc(item[0])}
      </button>`;
  }).join("");

  painel.addEventListener("click", function (event) {
    const botao = event.target.closest("[data-cor]");
    if (!botao) return;
    aplicarCor(botao.dataset.cor);
    painel.remove();
  });

  document.body.appendChild(painel);
}

function escolherCor(cor) {
  aplicarCor(cor);
}

/* PARTILHAR SITE */
async function partilharSite() {
  const dados = {
    title: "AfricanMundo — Notícias de África",
    text: "A informação que liga África ao mundo.",
    url: window.location.origin + window.location.pathname
  };

  if (navigator.share) {
    try {
      await navigator.share(dados);
    } catch (erro) {
      if (erro.name !== "AbortError") console.warn(erro);
    }
  } else if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(dados.url);
    alert("Link do AfricanMundo copiado.");
  } else {
    window.prompt("Copia o link do AfricanMundo:", dados.url);
  }
}

/* ABRIR REDES SOCIAIS */
function abrirRede(url) {
  if (/^https?:\/\//i.test(String(url || ""))) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function abrirGoogle() {
  window.open("https://www.google.com/", "_blank", "noopener,noreferrer");
}

/* ATALHOS DE TECLADO */
function configurarTeclado() {
  document.addEventListener("keydown", function (event) {
    const elemento = event.target;
    const aEscrever =
      elemento &&
      (elemento.matches("input,textarea,select") || elemento.isContentEditable);

    if (aEscrever) return;

    if (event.key === "/" ) {
      event.preventDefault();
      abrirPesquisa();
    }

    if (event.key === "Escape") {
      document.querySelectorAll(".am-painel,#painelCores").forEach(function (el) {
        el.remove();
      });
      document.body.classList.remove("menu-aberto");
    }
  });
}

function mostrarAtalhos() {
  alert("Atalho: pressione / para abrir a pesquisa. Pressione Esc para fechar painéis.");
}

/* BOTÕES DO TOPO */
function configurarBotoesTopo() {
  const mapa = [
    [["btnNotificacao", "notificacaoBtn"], mostrarNotificacoes],
    [["btnFerramentas", "ferramentasBtn"], mostrarFerramentas],
    [["btnUsuario", "userBtn"], mostrarEu],
    [["btnCores", "colorBtn"], mostrarCores],
    [["btnPesquisa", "searchBtn"], abrirPesquisa],
    [["btnPartilhar", "shareBtn"], partilharSite]
  ];

  mapa.forEach(function (item) {
    item[0].forEach(function (id) {
      const elemento = document.getElementById(id);
      if (!elemento || elemento.dataset.amConfigurado === "1") return;

      elemento.dataset.amConfigurado = "1";
      elemento.addEventListener("click", function (event) {
        event.preventDefault();
        item[1]();
      });
    });
  });
}

/* BOTÕES COM data-am-action */
function configurarBotoesData() {
  document.querySelectorAll("[data-am-action]").forEach(function (el) {
    if (el.dataset.amConfigurado === "1") return;

    const acao = norm(el.dataset.amAction);
    const funcoes = {
      notificacao: mostrarNotificacoes,
      notificacoes: mostrarNotificacoes,
      ferramenta: mostrarFerramentas,
      ferramentas: mostrarFerramentas,
      eu: mostrarEu,
      usuario: mostrarEu,
      user: mostrarEu,
      cor: mostrarCores,
      color: mostrarCores,
      pesquisa: abrirPesquisa,
      search: abrirPesquisa,
      partilhar: partilharSite,
      compartilhar: partilharSite
    };

    const funcao = funcoes[acao];
    if (typeof funcao !== "function") return;

    el.dataset.amConfigurado = "1";
    el.addEventListener("click", function (event) {
      event.preventDefault();
      funcao();
    });
  });
}

/* PESQUISA */
function configurarPesquisa() {
  document.querySelectorAll(
    'input[type="search"],#searchInput,#pesquisa'
  ).forEach(function (campo) {
    if (campo.dataset.amPesquisa === "1") return;

    campo.dataset.amPesquisa = "1";
    campo.addEventListener("keydown", pesquisarTecla);

    const formulario = campo.closest("form");
    if (formulario) {
      formulario.addEventListener("submit", function (event) {
        event.preventDefault();
        pesquisar();
      });
    }
  });

  document.querySelectorAll(
    ".search-btn,.btn-search,[data-search-button]"
  ).forEach(function (botao) {
    if (botao.dataset.amPesquisaBotao === "1") return;

    botao.dataset.amPesquisaBotao = "1";
    botao.addEventListener("click", function (event) {
      event.preventDefault();
      pesquisar();
    });
  });
}

/* MENU MÓVEL */
function configurarMenuMobile() {
  document.querySelectorAll(
    "[data-menu-toggle],.menu-toggle,.hamburger"
  ).forEach(function (botao) {
    if (botao.dataset.amMenu === "1") return;

    botao.dataset.amMenu = "1";
    botao.addEventListener("click", function (event) {
      event.preventDefault();
      document.body.classList.toggle("menu-aberto");
      botao.classList.toggle("ativo");
    });
  });

  document.querySelectorAll("nav a,.menu a").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("menu-aberto");
    });
  });
}

function configurarCliqueFora() {
  document.addEventListener("click", function (event) {
    if (!document.body.classList.contains("menu-aberto")) return;

    const menu = document.querySelector("nav,.menu");
    const botao = event.target.closest(
      ".menu-toggle,.hamburger,[data-menu-toggle]"
    );

    if (menu && !menu.contains(event.target) && !botao) {
      document.body.classList.remove("menu-aberto");
    }
  });
}

/* PAUSAR DESTAQUE QUANDO O RATO ESTÁ SOBRE ELE */
function configurarDestaque() {
  const area = document.getElementById("destaque");
  if (!area) return;

  area.addEventListener("mouseenter", function () {
    if (timerDestaque) clearInterval(timerDestaque);
    timerDestaque = null;
  });

  area.addEventListener("mouseleave", iniciarDestaque);
  iniciarDestaque();
}

/* PAUSAR ANIMAÇÃO QUANDO O SEPARADOR NÃO ESTÁ VISÍVEL */
function configurarVisibilidade() {
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      if (noticias.length && !timerDestaque) iniciarDestaque();
    } else {
      if (timerDestaque) clearInterval(timerDestaque);
      timerDestaque = null;
    }
  });
}

/* BOTÃO VOLTAR AO TOPO */
function configurarTopo() {
  let botao = document.getElementById("voltarTopo");
  if (!botao) {
    botao = document.createElement("button");
    botao.id = "voltarTopo";
    botao.type = "button";
    botao.textContent = "↑";
    botao.setAttribute("aria-label", "Voltar ao topo");
    botao.style.cssText =
      "position:fixed;right:18px;bottom:80px;z-index:9990;" +
      "display:none;width:42px;height:42px;border:0;border-radius:50%;" +
      "background:var(--p,#168a45);color:#fff;font-size:22px;cursor:pointer";
    document.body.appendChild(botao);
  }

  botao.onclick = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.addEventListener("scroll", function () {
    botao.style.display = window.scrollY > 500 ? "block" : "none";
  }, { passive: true });
}

/* GUARDAR ÚLTIMA CATEGORIA VISITADA */
function configurarCategorias() {
  document.querySelectorAll("[data-categoria]").forEach(function (link) {
    if (link.dataset.amCategoria === "1") return;

    link.dataset.amCategoria = "1";
    link.addEventListener("click", function () {
      try {
        localStorage.setItem(
          "africanmundo-categoria",
          link.dataset.categoria || ""
        );
      } catch (erro) {}
    });
  });
}

/* PWA */
function iniciarPWA() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js").catch(function (erro) {
      console.warn("AfricanMundo — Service Worker:", erro);
    });
  });
}

/* GARANTIR MANIFEST */
function garantirManifest() {
  if (document.querySelector('link[rel="manifest"]')) return;

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = "./manifest.json";
  document.head.appendChild(link);
}

/* PROTEGER IMAGENS */
function protegerImagens() {
  document.querySelectorAll("img").forEach(function (img) {
    if (img.dataset.amProtegida === "1") return;

    img.dataset.amProtegida = "1";
    img.addEventListener("error", function () {
      if (this.dataset.amFallback === "1") return;

      this.dataset.amFallback = "1";
      this.src = FALLBACK_IMG;
    });
  });
}

/* IDENTIFICAR A APLICAÇÃO */
function protegerEstrutura() {
  document.body?.classList.add("africanmundo-app");
}

/* INICIALIZAR */
async function iniciarAfricanMundo() {
  if (africanMundoIniciado) return;
  africanMundoIniciado = true;

  console.log("AfricanMundo — a iniciar.");

  aplicarCor();
  garantirManifest();
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

  await carregarNoticias();
  await carregarAnuncios();

  iniciarAtualizacaoAutomatica();
  iniciarRealtimeNoticias();
  configurarDestaque();
  protegerImagens();

  console.log("AfricanMundo — inicialização concluída.");
}

/* ARRANQUE */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarAfricanMundo, {
    once: true
  });
} else {
  iniciarAfricanMundo();
}

/* FUNÇÕES DISPONÍVEIS PARA O HTML */
window.abrirNoticia = abrirNoticia;
window.carregarNoticias = carregarNoticias;
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
window.mostrarAtalhos = mostrarAtalhos;

console.log("AFRICANMUNDO APP.JS FOI CARREGADO");
   
