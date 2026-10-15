"use strict";

/* =========================================
   AFRICANMUNDO — CONFIGURAÇÃO
========================================= */

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
let indiceDestaque = 0;
let timerDestaque = null;
let timerAtualizacao = null;
let canalNoticias = null;
let carregandoNoticias = false;
let africanMundoIniciado = false;
let ultimaPesquisa = "";

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

function norm(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function esc(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[caractere];
  });
}

function obterTitulo(noticia) {
  return noticia?.titulo || noticia?.title || "Notícia";
}

function obterTexto(noticia) {
  return noticia?.texto || noticia?.descricao ||
    noticia?.description || noticia?.resumo || "";
}

function obterImagem(noticia) {
  return noticia?.imagem || noticia?.image ||
    noticia?.url_imagem || FALLBACK_IMG;
}

function obterCategoria(noticia) {
  return noticia?.categoria || noticia?.subcategoria || "Notícias";
}

function obterData(noticia) {
  const data = noticia?.data || noticia?.created_at || noticia?.published_at;
  const numero = data ? new Date(data).getTime() : 0;
  return Number.isFinite(numero) ? numero : 0;
}

function formatarData(noticia) {
  const data = obterData(noticia);
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function resumo(texto, limite = 150) {
  const limpo = String(texto || "").replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ").trim();

  return limpo.length > limite
    ? limpo.slice(0, limite).trim() + "…"
    : limpo;
}

function ordenarPorData(lista) {
  return [...(lista || [])].sort(function (a, b) {
    return obterData(b) - obterData(a) ||
      Number(b.id || 0) - Number(a.id || 0);
  });
}

function abrirNoticia(id) {
  if (id === undefined || id === null || id === "") return;
  window.location.href = "noticia.html?id=" + encodeURIComponent(id);
}

/* =========================================
   CARTÕES DE NOTÍCIAS
========================================= */

function criarCard(noticia) {
  const id = esc(noticia.id);
  const titulo = esc(obterTitulo(noticia));
  const imagem = esc(obterImagem(noticia));
  const categoria = esc(obterCategoria(noticia));
  const data = esc(formatarData(noticia));
  const descricao = esc(resumo(obterTexto(noticia), 115));

  return `
    <article class="card news-card" data-noticia-id="${id}">
      <a class="card-link" href="noticia.html?id=${encodeURIComponent(noticia.id)}">
        <img
          src="${imagem}"
          alt="${titulo}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >
      </a>
      <div class="card-body news-card-body">
        <span class="card-category">${categoria}</span>
        <h3 class="card-title">
          <a href="noticia.html?id=${encodeURIComponent(noticia.id)}">${titulo}</a>
        </h3>
        ${descricao ? `<p>${descricao}</p>` : ""}
        <time>${data}</time>
      </div>
    </article>`;
}

function renderizarLista(elemento, lista, mensagem) {
  if (!elemento) return;

  if (!lista || lista.length === 0) {
    elemento.innerHTML = `
      <p class="am-mensagem-vazia">
        ${esc(mensagem || "Ainda não há notícias disponíveis nesta secção.")}
      </p>`;
    return;
  }

  elemento.innerHTML = lista.map(criarCard).join("");
}

function renderizarListaPorId(ids, lista, mensagem) {
  for (const id of ids) {
    const elemento = document.getElementById(id);
    if (elemento) {
      renderizarLista(elemento, lista, mensagem);
      return true;
    }
  }
  return false;
}

/* =========================================
   LOCALIZAR SECÇÕES
========================================= */

function encontrarElemento(ids) {
  for (const id of ids) {
    const elemento = document.getElementById(id);
    if (elemento) return elemento;
  }
  return null;
}

function encontrarSecaoCategoria(categoria) {
  const mapa = {
    mocambique: ["mocambiqueNoticias", "listaMocambique", "noticiasMocambique"],
    africa: ["africaNoticias", "listaAfrica", "noticiasAfrica"],
    futebol: ["futebolNoticias", "listaFutebol", "noticiasFutebol"],
    desporto: ["desportoNoticias", "listaDesporto", "noticiasDesporto"],
    negocios: ["negociosNoticias", "listaNegocios", "noticiasNegocios"],
    entretenimento: [
      "entretenimentoNoticias",
      "listaEntretenimento",
      "noticiasEntretenimento"
    ]
  };

  return encontrarElemento(mapa[categoria] || []);
}

function noticiaDaCategoria(noticia, categoria) {
  const cat = norm(noticia.categoria);
  const sub = norm(noticia.subcategoria);
  const pais = norm(noticia.pais);
  const titulo = norm(obterTitulo(noticia));

  if (categoria === "mocambique") {
    return pais.includes("mocambique") ||
      cat.includes("mocambique") ||
      cat.includes("moçambique") ||
      sub.includes("mocambique");
  }

  if (categoria === "africa") {
    return cat.includes("africa") || sub.includes("africa");
  }

  if (categoria === "futebol") {
    return cat.includes("futebol") ||
      sub.includes("futebol") ||
      titulo.includes("futebol");
  }

  if (categoria === "desporto") {
    return cat.includes("desporto") ||
      sub.includes("desporto") ||
      cat.includes("esporte");
  }

  if (categoria === "negocios") {
    return cat.includes("negocio") ||
      cat.includes("economia") ||
      cat.includes("negócio") ||
      sub.includes("economia");
  }

  if (categoria === "entretenimento") {
    return cat.includes("entretenimento") ||
      cat.includes("cultura") ||
      cat.includes("musica") ||
      sub.includes("entretenimento");
  }

  return false;
}

/* =========================================
   CARREGAR NOTÍCIAS DO SUPABASE
========================================= */

async function carregarNoticias() {
  if (!db || carregandoNoticias) return;

  carregandoNoticias = true;

  try {
    const resposta = await db
      .from("noticias")
      .select(
        "id,titulo,imagem,categoria,subcategoria,texto,data,fonte,url_original,id_externo,idioma,visualizacoes,pais"
      )
      .order("data", { ascending: false })
      .order("id", { ascending: false })
      .limit(500);

    if (resposta.error) throw resposta.error;

    noticias = ordenarPorData(resposta.data || []);

    renderizarListaPorId(
      ["ultimas", "ultimasNoticias", "listaNoticias", "noticiasRecentes"],
      noticias.slice(0, LIMITE_ULTIMAS),
      "Ainda não há notícias recentes para apresentar."
    );

    [
      "mocambique",
      "africa",
      "futebol",
      "desporto",
      "negocios",
      "entretenimento"
    ].forEach(function (categoria) {
      const secao = encontrarSecaoCategoria(categoria);
      if (!secao) return;

      const filtradas = noticias
        .filter(n => noticiaDaCategoria(n, categoria))
        .slice(0, LIMITE_CATEGORIA);

      renderizarLista(secao, filtradas, "Ainda não há notícias nesta categoria.");
    });

    mostrarDestaque();
    console.log("AfricanMundo: notícias carregadas:", noticias.length);
  } catch (erro) {
    console.error("AfricanMundo — erro ao carregar notícias:", erro);
  } finally {
    carregandoNoticias = false;
  }
}


/* =========================================
   DESTAQUE AUTOMÁTICO
========================================= */
function mostrarDestaque() {
  const area = document.getElementById("destaque");
  if (!area || !noticias.length) return;

  indiceDestaque =
    ((indiceDestaque % noticias.length) + noticias.length) %
    noticias.length;

  const noticia = noticias[indiceDestaque];
  const id = encodeURIComponent(noticia.id);
  const titulo = esc(obterTitulo(noticia));
  const imagem = esc(obterImagem(noticia));
  const categoria = esc(obterCategoria(noticia));
  const data = esc(formatarData(noticia));
  const descricao = esc(resumo(obterTexto(noticia), 180));
  const link = `noticia.html?id=${id}`;

  area.innerHTML = `
    <article class="am-destaque-card destaque-card">

      <a class="am-destaque-imagem-link"
         href="${link}"
         aria-label="Ler notícia: ${titulo}">
        <img
          class="am-destaque-imagem"
          src="${imagem}"
          alt="${titulo}"
          loading="eager"
          decoding="async"
          onerror="this.onerror=null;this.src='${FALLBACK_IMG}'"
        >
      </a>

      <div class="am-destaque-overlay destaque-overlay">

        <span class="card-category">${categoria}</span>

        <h2 class="am-destaque-titulo">
          <a href="${link}">${titulo}</a>
        </h2>

        <p class="am-destaque-resumo destaque-resumo">
          ${descricao}
        </p>

        <div class="am-destaque-meta">
          <time>${data}</time>
          <a class="am-destaque-link" href="${link}">
            Ler notícia completa →
          </a>
        </div>

      </div>
    </article>`;
}

function iniciarDestaque() {
  if (timerDestaque) {
    clearInterval(timerDestaque);
  }

  timerDestaque = null;

  if (noticias.length < 2) return;
  if (document.visibilityState !== "visible") return;

  timerDestaque = setInterval(function () {
    indiceDestaque = (indiceDestaque + 1) % noticias.length;
    mostrarDestaque();
  }, 15000);
}

/* =========================================
   PESQUISA DE NOTÍCIAS
========================================= */

function abrirPesquisa() {
  const campo = document.getElementById("searchInput") ||
    document.getElementById("pesquisa") ||
    document.querySelector('input[type="search"]');

  if (campo) {
    campo.scrollIntoView({ behavior: "smooth", block: "center" });
    campo.focus();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function pesquisarTecla(evento) {
  if (evento.key === "Enter") {
    evento.preventDefault();
    pesquisar();
  }
}

function pesquisar() {
  const campo = document.getElementById("searchInput") ||
    document.getElementById("pesquisa") ||
    document.querySelector('input[type="search"]');

  const resultados = document.getElementById("resultadosPesquisa");
  const termo = norm(campo?.value || "");

  if (!resultados) {
    if (termo) alert("Não foi encontrada a área de resultados da pesquisa.");
    return;
  }

  ultimaPesquisa = termo;

  if (!termo) {
    resultados.innerHTML = "<p>Escreve uma palavra para pesquisar notícias.</p>";
    return;
  }

  const palavras = termo.split(/\s+/).filter(Boolean);

  const encontrados = noticias.filter(function (noticia) {
    const texto = norm([
      obterTitulo(noticia),
      obterTexto(noticia),
      noticia.categoria,
      noticia.subcategoria,
      noticia.pais,
      noticia.fonte
    ].join(" "));

    return palavras.every(palavra => texto.includes(palavra));
  }).slice(0, 50);

  if (!encontrados.length) {
    resultados.innerHTML = `
      <p>Não encontrámos notícias para
      <strong>${esc(campo.value)}</strong>.</p>
      <p>Tenta outras palavras ou consulta as últimas notícias.</p>`;
    resultados.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  resultados.innerHTML = `
    <div class="am-resultados-cabecalho">
      <h2>Resultados da pesquisa</h2>
      <p>${encontrados.length} resultado(s) para
      “${esc(campo.value)}”</p>
      <button type="button" id="limparPesquisa">Limpar pesquisa ×</button>
    </div>
    <div class="news-grid">
      ${encontrados.map(criarCard).join("")}
    </div>`;

  document.getElementById("limparPesquisa")?.addEventListener("click", function () {
    if (campo) campo.value = "";
    resultados.innerHTML = "";
    ultimaPesquisa = "";
  });

  resultados.scrollIntoView({ behavior: "smooth", block: "start" });
}


<!-- NOTÍCIAS POR PROVÍNCIA E PAÍS -->
<section class="news-section am-localidades" aria-labelledby="titulo-localidades">
  <div class="section-heading">
    <div>
      <span class="section-kicker">EXPLORAR POR LOCALIZAÇÃO</span>
      <h2 id="titulo-localidades">🌍 Notícias por província e país</h2>
    </div>
  </div>

  <h3 class="am-localidades-subtitulo">🇲🇿 Províncias de Moçambique</h3>

  <div class="am-localidades-grelha">
    <a href="categoria.html?categoria=mocambique&localidade=Maputo" class="am-localidade">
      <span>🏙️</span><strong>Maputo</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Gaza" class="am-localidade">
      <span>🌴</span><strong>Gaza</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Inhambane" class="am-localidade">
      <span>🏖️</span><strong>Inhambane</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Sofala" class="am-localidade">
      <span>⚓</span><strong>Sofala</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Manica" class="am-localidade">
      <span>⛰️</span><strong>Manica</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Tete" class="am-localidade">
      <span>🌄</span><strong>Tete</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Zambézia" class="am-localidade">
      <span>🌾</span><strong>Zambézia</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Nampula" class="am-localidade">
      <span>🏘️</span><strong>Nampula</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Cabo Delgado" class="am-localidade">
      <span>🌊</span><strong>Cabo Delgado</strong>
    </a>
    <a href="categoria.html?categoria=mocambique&localidade=Niassa" class="am-localidade">
      <span>🌳</span><strong>Niassa</strong>
    </a>
  </div>

  <h3 class="am-localidades-subtitulo">🌍 Notícias dos países africanos</h3>

  <div class="am-localidades-grelha am-paises">
    <a href="categoria.html?categoria=africa&pais=Angola" class="am-localidade">
      <span>🇦🇴</span><strong>Angola</strong>
    </a>
    <a href="categoria.html?categoria=africa&pais=África do Sul" class="am-localidade">
      <span>🇿🇦</span><strong>África do Sul</strong>
    </a>
    <a href="categoria.html?categoria=africa&pais=Zimbabwe" class="am-localidade">
      <span>🇿🇼</span><strong>Zimbabwe</strong>
    </a>
    <a href="categoria.html?categoria=africa&pais=Quénia" class="am-localidade">
      <span>🇰🇪</span><strong>Quénia</strong>
    </a>
    <a href="categoria.html?categoria=africa&pais=Nigéria" class="am-localidade">
      <span>🇳🇬</span><strong>Nigéria</strong>
    </a>
    <a href="categoria.html?categoria=africa&pais=RDC" class="am-localidade">
      <span>🇨🇩</span><strong>R. Dem. do Congo</strong>
    </a>
    <a href="categoria.html?categoria=africa&pais=Gana" class="am-localidade">
      <span>🇬🇭</span><strong>Gana</strong>
    </a>
    <a href="categoria.html?categoria=africa" class="am-localidade">
      <span>🌍</span><strong>Todos os países</strong>
    </a>
  </div>
</section>


/* =========================================
   ANÚNCIOS
========================================= */

function anuncioEstaAtivo(anuncio) {
  const estado = norm(
    anuncio.status || anuncio.estado || anuncio.situacao || ""
  );

  const ativo = anuncio.ativo ??
    anuncio.publicado ??
    anuncio.is_active;

  if (ativo === false || ativo === 0) return false;
  if (["inativo", "cancelado", "rejeitado", "expirado", "rascunho"].includes(estado)) {
    return false;
  }

  if (ativo === true || ativo === 1) return true;

  return ["ativo", "publicado", "aprovado"].includes(estado);
}

function carregarAnuncios() {
  const area = document.getElementById("anunciosAtivos");
  const secao = document.getElementById("anunciosAtivosSection");

  if (!area) return Promise.resolve();

  area.innerHTML = "";
  if (secao) secao.hidden = true;

  if (!db) return Promise.resolve();

  return db.from("anuncios").select("*").limit(50)
    .then(function (resposta) {
      if (resposta.error) {
        console.warn("AfricanMundo — anúncios indisponíveis:", resposta.error.message);
        return;
      }

      const ativos = (resposta.data || []).filter(anuncioEstaAtivo);

      if (!ativos.length) {
        area.innerHTML = "";
        if (secao) secao.hidden = true;
        console.log("AfricanMundo: não existem anúncios ativos.");
        return;
      }

      area.innerHTML = ativos.map(function (anuncio) {
        const titulo = esc(
          anuncio.titulo || anuncio.empresa || anuncio.nome || "Anúncio"
        );

        const imagem = anuncio.imagem || anuncio.url_imagem ||
          anuncio.banner || "";

        const destino = anuncio.url || anuncio.link ||
          anuncio.url_destino || "";

        const descricao = anuncio.descricao ||
          anuncio.texto || anuncio.mensagem || "";

        const conteudo = `
          ${imagem ? `<img src="${esc(imagem)}" alt="${titulo}" loading="lazy">` : ""}
          <div class="card-body">
            <span class="card-category">Publicidade</span>
            <h3>${titulo}</h3>
            ${descricao ? `<p>${esc(resumo(descricao, 160))}</p>` : ""}
          </div>`;

        return destino && /^https?:\/\//i.test(destino)
          ? `<article class="card anuncio-card">
               <a href="${esc(destino)}" target="_blank"
                  rel="noopener noreferrer">${conteudo}</a>
             </article>`
          : `<article class="card anuncio-card">${conteudo}</article>`;
      }).join("");

      if (secao) secao.hidden = false;
    })
    .catch(function (erro) {
      console.warn("AfricanMundo — não foi possível carregar anúncios:", erro);
    });
}

/* =========================================
   PAINÉIS DE NOTIFICAÇÕES E FERRAMENTAS
========================================= */

function fecharPainel(id) {
  const painel = document.getElementById(id);
  if (painel) {
    painel.hidden = true;
    painel.style.display = "none";
  }
}

function abrirPainel(id, titulo) {
  const ids = ["notificationPanel", "toolsPanel", "userPanel"];

  ids.forEach(function (outroId) {
    if (outroId !== id) fecharPainel(outroId);
  });

  let painel = document.getElementById(id);

  if (painel && !painel.hidden && painel.style.display !== "none") {
    fecharPainel(id);
    return;
  }

  if (!painel) {
    painel = document.createElement("section");
    painel.id = id;
    painel.className = "am-painel";
    painel.setAttribute("role", "dialog");
    painel.setAttribute("aria-label", titulo);

    painel.style.cssText =
      "position:fixed;right:12px;top:70px;z-index:10000;" +
      "width:min(360px,calc(100vw - 24px));" +
      "max-height:calc(100vh - 90px);overflow:auto;" +
      "box-sizing:border-box;padding:18px;" +
      "background:var(--card,#fff);color:var(--txt,#222);" +
      "border:1px solid var(--border,#ddd);border-radius:16px;" +
      "box-shadow:0 12px 36px #0003;";

    document.body.appendChild(painel);
  }

  let conteudo = "";

  if (id === "notificationPanel") {
    conteudo = `
      <p>Fica a par das novidades do AfricanMundo.</p>
      <div id="amListaNotificacoes">
        <p>Consulta as últimas notícias na página inicial.</p>
      </div>
      <button type="button" class="am-acao-painel"
        onclick="window.carregarNoticias?.()">
        Atualizar notícias
      </button>`;
  } else if (id === "toolsPanel") {
    conteudo = `
      <p>Acesso rápido às funcionalidades do portal.</p>
      <button type="button" class="am-acao-painel"
        onclick="window.abrirPesquisa?.()">
        🔎 Pesquisar notícias
      </button>
      <button type="button" class="am-acao-painel"
        onclick="window.partilharSite?.()">
        🔗 Partilhar AfricanMundo
      </button>
      <button type="button" class="am-acao-painel"
        onclick="window.scrollTo({top:0,behavior:'smooth'})">
        ⬆ Voltar ao topo
      </button>`;
  } else {
    conteudo = `
      <p>Bem-vindo ao AfricanMundo.</p>
      <button type="button" class="am-acao-painel"
        onclick="window.mostrarFavoritos?.()">
        ★ Os meus favoritos
      </button>
      <p>As opções de conta poderão ser ligadas à autenticação do portal.</p>`;
  }

  painel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
      <h3 style="margin:0;font-size:19px">${esc(titulo)}</h3>
      <button type="button" aria-label="Fechar painel"
        onclick="window.fecharPainel('${id}')"
        style="border:0;background:transparent;color:inherit;font-size:22px;cursor:pointer">
        ×
      </button>
    </div>
    <div style="margin-top:12px">${conteudo}</div>`;

  painel.hidden = false;
  painel.style.display = "block";
}

function mostrarNotificacoes() {
  abrirPainel("notificationPanel", "Notificações");
}

function mostrarFerramentas() {
  abrirPainel("toolsPanel", "Ferramentas");
}

function mostrarEu() {
  abrirPainel("userPanel", "Área do utilizador");
       }

/* =========================================
   CORRIGIR ÁREAS DAS LISTAS
   Preserva os títulos das secções
========================================= */

function obterAreaNoticias(elemento) {
  if (!elemento) return null;

  if (elemento.matches(
    ".news-grid,.grid,.news-list,.cards,.lista-noticias"
  )) {
    return elemento;
  }

  const seletores = [
    "#ultimasNoticias",
    "#listaNoticias",
    "#noticiasRecentes",
    ".news-grid",
    ".news-list",
    ".lista-noticias",
    ".cards",
    ".grid"
  ];

  for (const seletor of seletores) {
    const interior = elemento.querySelector(seletor);
    if (interior) return interior;
  }

  let area = elemento.querySelector(".am-lista-noticias");

  if (!area) {
    area = document.createElement("div");
    area.className = "news-grid am-lista-noticias";
    elemento.appendChild(area);
  }

  return area;
}

function renderizarListaPorId(ids, lista, mensagem) {
  for (const id of ids) {
    const elemento = document.getElementById(id);

    if (elemento) {
      renderizarLista(
        obterAreaNoticias(elemento),
        lista,
        mensagem
      );
      return true;
    }
  }

  return false;
}

function encontrarSecaoCategoria(categoria) {
  const mapa = {
    mocambique: ["mocambiqueNoticias", "listaMocambique", "noticiasMocambique", "mocambique"],
    africa: ["africaNoticias", "listaAfrica", "noticiasAfrica", "africa"],
    futebol: ["futebolNoticias", "listaFutebol", "noticiasFutebol", "futebol"],
    desporto: ["desportoNoticias", "listaDesporto", "noticiasDesporto", "desporto"],
    negocios: ["negociosNoticias", "listaNegocios", "noticiasNegocios", "negocios"],
    entretenimento: [
      "entretenimentoNoticias",
      "listaEntretenimento",
      "noticiasEntretenimento",
      "entretenimento"
    ]
  };

  for (const id of mapa[categoria] || []) {
    const elemento = document.getElementById(id);
    if (elemento) return obterAreaNoticias(elemento);
  }

  return null;
}

/* =========================================
   CORES DO SITE
========================================= */

const CORES = {
  verde: "#168a45",
  azul: "#1769aa",
  vermelho: "#c62828",
  roxo: "#7138a8",
  laranja: "#d96b16"
};

function corAtual() {
  try {
    return localStorage.getItem("africanmundo-cor") || CORES.verde;
  } catch (erro) {
    return CORES.verde;
  }
}

function aplicarCor(cor) {
  const escolhida = cor || corAtual();
  const valida = Object.values(CORES).includes(escolhida)
    ? escolhida
    : CORES.verde;

  document.documentElement.style.setProperty("--p", valida);
  document.documentElement.style.setProperty("--p2", valida);

  try {
    localStorage.setItem("africanmundo-cor", valida);
  } catch (erro) {}

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta && !document.documentElement.classList.contains("tema-escuro")) {
    meta.content = valida;
  }
}

function alterarCor(cor) {
  aplicarCor(cor);
}

function escolherCor(cor) {
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
    "padding:12px;display:flex;flex-wrap:wrap;gap:6px;" +
    "max-width:calc(100vw - 24px);" +
    "background:var(--card,#fff);" +
    "border:1px solid var(--border,#ddd);border-radius:12px";

  painel.innerHTML = Object.entries(CORES).map(function (item) {
    return `
      <button type="button"
        data-cor="${item[1]}"
        aria-label="Usar cor ${item[0]}"
        title="${item[0]}"
        style="width:36px;height:36px;border:2px solid #fff;
        border-radius:50%;background:${item[1]};cursor:pointer">
      </button>`;
  }).join("");

  painel.addEventListener("click", function (evento) {
    const botao = evento.target.closest("[data-cor]");
    if (!botao) return;

    aplicarCor(botao.dataset.cor);
    painel.remove();
  });

  document.body.appendChild(painel);
}

/* =========================================
   PARTILHAR E REDES SOCIAIS
========================================= */

async function partilharSite() {
  const dados = {
    title: "AfricanMundo — Notícias de África",
    text: "A informação que liga África ao mundo.",
    url: window.location.origin + window.location.pathname
  };

  if (navigator.share) {
    try {
      await navigator.share(dados);
      return;
    } catch (erro) {
      if (erro.name === "AbortError") return;
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(dados.url);
      alert("Link do AfricanMundo copiado.");
      return;
    }
  } catch (erro) {}

  window.prompt("Copia o link do AfricanMundo:", dados.url);
}

function abrirRede(url) {
  if (/^https?:\/\//i.test(String(url || ""))) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function abrirGoogle() {
  abrirRede("https://www.google.com/");
}

/* =========================================
   BOTÕES DO CABEÇALHO
========================================= */

function configurarBotoesTopo() {
  const botoes = [
    [["notificationBtn", "btnNotificacao", "notificacaoBtn"], mostrarNotificacoes],
    [["toolsBtn", "btnFerramentas", "ferramentasBtn"], mostrarFerramentas],
    [["userBtn", "btnUsuario", "btnUser"], mostrarEu],
    [["colorBtn", "btnCores", "btnColor"], mostrarCores],
    [["searchBtn", "btnPesquisa", "btnSearch"], abrirPesquisa],
    [["shareBtn", "btnPartilhar", "btnShare"], partilharSite]
  ];

  botoes.forEach(function (item) {
    item[0].forEach(function (id) {
      const botao = document.getElementById(id);

      if (!botao || botao.dataset.amConfigurado === "1") return;

      botao.dataset.amConfigurado = "1";

      botao.addEventListener("click", function (evento) {
        evento.preventDefault();
        item[1]();
      });
    });
  });
}

function configurarBotoesData() {
  const acoes = {
    notificacao: mostrarNotificacoes,
    notificacoes: mostrarNotificacoes,
    notification: mostrarNotificacoes,
    ferramenta: mostrarFerramentas,
    ferramentas: mostrarFerramentas,
    tools: mostrarFerramentas,
    eu: mostrarEu,
    usuario: mostrarEu,
    user: mostrarEu,
    cor: mostrarCores,
    cores: mostrarCores,
    color: mostrarCores,
    pesquisa: abrirPesquisa,
    pesquisar: abrirPesquisa,
    search: abrirPesquisa,
    partilhar: partilharSite,
    compartilhar: partilharSite,
    share: partilharSite
  };

  document.querySelectorAll("[data-am-action]").forEach(function (botao) {
    if (botao.dataset.amConfigurado === "1") return;

    const acao = norm(botao.dataset.amAction);
    const funcao = acoes[acao];

    if (!funcao) return;

    botao.dataset.amConfigurado = "1";

    botao.addEventListener("click", function (evento) {
      evento.preventDefault();
      funcao();
    });
  });
}

/* =========================================
   PESQUISA E TECLADO
========================================= */

function configurarPesquisa() {
  document.querySelectorAll(
    'input[type="search"],#searchInput,#pesquisa'
  ).forEach(function (campo) {
    if (campo.dataset.amPesquisa === "1") return;

    campo.dataset.amPesquisa = "1";
    campo.addEventListener("keydown", pesquisarTecla);
  });

  const formulario = document.getElementById("searchForm");

  if (formulario && formulario.dataset.amFormulario !== "1") {
    formulario.dataset.amFormulario = "1";

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
      pesquisar();
    });
  }

  document.querySelectorAll(
    ".search-btn,.btn-search,[data-search-button]"
  ).forEach(function (botao) {
    if (botao.dataset.amPesquisaBotao === "1") return;

    botao.dataset.amPesquisaBotao = "1";

    botao.addEventListener("click", function (evento) {
      evento.preventDefault();
      pesquisar();
    });
  });
}

function configurarTeclado() {
  document.addEventListener("keydown", function (evento) {
    const elemento = evento.target;
    const aEscrever = elemento &&
      (elemento.matches("input,textarea,select") ||
       elemento.isContentEditable);

    if (evento.key === "Escape") {
      document.querySelectorAll(
        ".am-painel,#painelCores"
      ).forEach(el => el.remove());

      document.body.classList.remove("menu-aberto");
      return;
    }

    if (aEscrever) return;

    if (evento.key === "/") {
      evento.preventDefault();
      abrirPesquisa();
    }
  });
}

/* =========================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================= */

function iniciarAtualizacaoAutomatica() {
  if (timerAtualizacao) clearInterval(timerAtualizacao);

  timerAtualizacao = setInterval(function () {
    if (document.visibilityState === "visible") {
      carregarNoticias();
      carregarAnuncios();
    }
  }, INTERVALO_ATUALIZACAO);
}

/* =========================================
   SUPABASE — NOTÍCIAS EM TEMPO REAL
========================================= */

function iniciarRealtimeNoticias() {
  if (!db || canalNoticias) return;

  try {
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
          carregarNoticias();
        }
      )
      .subscribe(function (estado) {
        console.log("AfricanMundo — Realtime:", estado);
      });
  } catch (erro) {
    console.warn("AfricanMundo — Realtime indisponível:", erro);
  }
}

/* =========================================
   DESTAQUE E VISIBILIDADE
========================================= */

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

/* =========================================
   MENU MÓVEL
========================================= */

function configurarMenuMobile() {
  document.querySelectorAll(
    "[data-menu-toggle],.menu-toggle,.hamburger"
  ).forEach(function (botao) {
    if (botao.dataset.amMenu === "1") return;

    botao.dataset.amMenu = "1";

    botao.addEventListener("click", function (evento) {
      evento.preventDefault();
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

/* =========================================
   BOTÃO VOLTAR AO TOPO
========================================= */

function configurarTopo() {
  const botao = document.getElementById("voltarTopo");
  if (!botao) return;

  botao.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function atualizarBotao() {
    botao.style.display = window.scrollY > 500 ? "block" : "none";
  }

  window.addEventListener("scroll", atualizarBotao, { passive: true });
  atualizarBotao();
}

/* =========================================
   PROTEÇÃO DE IMAGENS E PWA
========================================= */

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

function garantirManifest() {
  if (document.querySelector('link[rel="manifest"]')) return;

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = "./manifest.json";
  document.head.appendChild(link);
}

function iniciarPWA() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("./sw.js")
      .catch(function (erro) {
        console.warn("AfricanMundo — Service Worker:", erro);
      });
  });
}

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

/* =========================================
   INICIALIZAÇÃO DO AFRICANMUNDO
========================================= */

async function iniciarAfricanMundo() {
  if (africanMundoIniciado) return;
  africanMundoIniciado = true;

  console.log("AfricanMundo — a iniciar.");

  aplicarCor();
  garantirManifest();
  configurarTeclado();
  configurarBotoesTopo();
  configurarBotoesData();
  configurarPesquisa();
  configurarMenuMobile();
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

/* =========================================
   FUNÇÕES DISPONÍVEIS NO HTML
========================================= */

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarAfricanMundo, {
    once: true
  });
} else {
  iniciarAfricanMundo();
}

console.log("AFRICANMUNDO APP.JS FOI CARREGADO");
