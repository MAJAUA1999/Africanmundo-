
"use strict";

/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 1/4: BASE, FUNÇÕES AUXILIARES E NOTÍCIAS
   ===================================================== */

const SUPABASE_URL = "https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY = "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const db = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

let noticias = [];
let indiceDestaque = 0;
let timerDestaque = null;
let timerAtualizacao = null;
let canalNoticias = null;
let ultimaAtualizacaoRealtime = 0;
let pesquisaAberta = false;
let africanMundoIniciado = false;
let timerRealtime = null;

const LIMITE_ULTIMAS = 10;
const LIMITE_CATEGORIA = 6;
const LIMITE_DESTAQUE = 100;

const FALLBACK_IMG =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#e9efeb"/><text x="400" y="215" font-family="Arial,sans-serif" font-size="36" text-anchor="middle" fill="#168a45">AfricanMundo</text><text x="400" y="265" font-family="Arial,sans-serif" font-size="20" text-anchor="middle" fill="#52645a">Imagem indisponível</text></svg>'
  );

/* ---------- FUNÇÕES AUXILIARES ---------- */

function esc(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function norm(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function titulo(noticia) {
  return String(noticia?.titulo ?? "Notícia sem título").trim();
}

function texto(noticia) {
  return String(noticia?.texto ?? noticia?.descricao ?? "").trim();
}

function dataNumero(valor) {
  if (!valor) return 0;
  const numero = new Date(valor).getTime();
  return Number.isFinite(numero) ? numero : 0;
}

function data(valor) {
  const numero = dataNumero(valor);
  if (!numero) return "";
  return new Date(numero).toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function imagemValida(url) {
  if (typeof url !== "string" || !url.trim()) return false;

  try {
    const endereco = new URL(url.trim());
    return endereco.protocol === "https:" || endereco.protocol === "http:";
  } catch (_) {
    return false;
  }
}

function imagem(noticia) {
  const original = String(noticia?.imagem ?? "").trim();
  return imagemValida(original) ? original : FALLBACK_IMG;
}

function possuiImagem(noticia) {
  return imagemValida(String(noticia?.imagem ?? "").trim());
}

function prepararImagens(raiz) {
  if (!raiz) return;

  raiz.querySelectorAll("img").forEach(function(img) {
    if (img.dataset.fallbackPreparado === "sim") return;

    img.dataset.fallbackPreparado = "sim";
    img.loading = "lazy";
    img.decoding = "async";

    img.addEventListener("error", function() {
      if (img.src !== FALLBACK_IMG) {
        img.src = FALLBACK_IMG;
      }
    }, { once: true });
  });
}

function categoriaTexto(noticia) {
  return String(noticia?.subcategoria || noticia?.categoria || "Notícias").trim();
}

function resumo(noticia, limite = 130) {
  const bruto = texto(noticia).replace(/<[^>]*>/g, " ");
  const limpo = bruto.replace(/\s+/g, " ").trim();

  if (limpo.length <= limite) return limpo;
  return limpo.slice(0, limite).trimEnd() + "…";
}

function urlNoticia(noticia) {
  const id = noticia?.id;
  return id != null
    ? "noticia.html?id=" + encodeURIComponent(String(id))
    : "#";
}

function abrirNoticia(id) {
  if (id == null || id === "") return;
  window.location.href = "noticia.html?id=" + encodeURIComponent(String(id));
}

function card(noticia, mostrarResumo = true) {
  const destino = urlNoticia(noticia);
  const tituloSeguro = esc(titulo(noticia));
  const categoria = esc(categoriaTexto(noticia));
  const dataSegura = esc(data(noticia.data));
  const urlImagem = esc(imagem(noticia));
  const descricao = resumo(noticia, 115);

  return `
    <article class="noticia-card">
      <a class="noticia-card-link" href="${esc(destino)}"
         aria-label="${tituloSeguro}">
        <img src="${urlImagem}"
             alt="${tituloSeguro}"
             loading="lazy"
             decoding="async">
        <div class="noticia-card-conteudo">
          <span class="noticia-categoria">${categoria}</span>
          <h3>${tituloSeguro}</h3>
          ${mostrarResumo && descricao
            ? `<p>${esc(descricao)}</p>`
            : ""}
          <time>${dataSegura}</time>
        </div>
      </a>
    </article>
  `;
}

function lista(items, mostrarResumo = true) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<p class="sem-noticias">Ainda não há notícias nesta secção.</p>';
  }

  return items.map(function(item) {
    return card(item, mostrarResumo);
  }).join("");
}

function ordenarPorData(items) {
  return [...(items || [])].sort(function(a, b) {
    return dataNumero(b.data) - dataNumero(a.data);
  });
}

function mostrarErroNoticias(erro) {
  console.error("AfricanMundo — erro ao carregar notícias:", erro);
}

/* ---------- DESTAQUE PRINCIPAL ---------- */

function mostrarDestaque(noticia) {
  if (!noticia) return;

  const possiveis = [
    "noticiaDestaque",
    "destaqueNoticia",
    "destaque",
    "heroDestaque"
  ];

  let elemento = null;

  for (const id of possiveis) {
    elemento = document.getElementById(id);
    if (elemento) break;
  }

  if (!elemento) return;

  const urlImagem = esc(imagem(noticia));
  const tituloSeguro = esc(titulo(noticia));
  const resumoSeguro = esc(resumo(noticia, 180));
  const categoria = esc(categoriaTexto(noticia));
  const destino = esc(urlNoticia(noticia));

  elemento.innerHTML = `
    <article class="destaque-noticia">
      <a href="${destino}" aria-label="${tituloSeguro}">
        <img src="${urlImagem}" alt="${tituloSeguro}"
             loading="eager" decoding="async">
        <div class="destaque-conteudo">
          <span class="noticia-categoria">${categoria}</span>
          <h2>${tituloSeguro}</h2>
          ${resumoSeguro ? `<p>${resumoSeguro}</p>` : ""}
          <time>${esc(data(noticia.data))}</time>
        </div>
      </a>
    </article>
  `;

  prepararImagens(elemento);
}

function iniciarDestaque(items) {
  if (timerDestaque) {
    clearInterval(timerDestaque);
    timerDestaque = null;
  }

  const recentes = ordenarPorData(items).slice(0, LIMITE_DESTAQUE);
  if (!recentes.length) return;

  indiceDestaque = 0;
  mostrarDestaque(recentes[indiceDestaque]);

  if (recentes.length < 2) return;

  timerDestaque = setInterval(function() {
    indiceDestaque = (indiceDestaque + 1) % recentes.length;
    mostrarDestaque(recentes[indiceDestaque]);
  }, 10000);
}

/* ---------- SECÇÕES DA PÁGINA INICIAL ---------- */

const CATEGORIAS_INICIO = [
  {
    nome: "Moçambique",
    variantes: ["mocambique"],
    ids: ["noticiasMocambique", "mocambiqueNoticias", "listaMocambique"]
  },
  {
    nome: "África",
    variantes: ["africa"],
    ids: ["noticiasAfrica", "africaNoticias", "listaAfrica"]
  },
  {
    nome: "Futebol",
    variantes: ["futebol"],
    ids: ["noticiasFutebol", "futebolNoticias", "listaFutebol"]
  },
  {
    nome: "Desporto",
    variantes: ["desporto", "esporte", "esportes"],
    ids: ["noticiasDesporto", "desportoNoticias", "listaDesporto"]
  },
  {
    nome: "Negócios",
    variantes: ["negocios"],
    ids: ["noticiasNegocios", "negociosNoticias", "listaNegocios"]
  },
  {
    nome: "Entretenimento",
    variantes: ["entretenimento"],
    ids: [
      "noticiasEntretenimento",
      "entretenimentoNoticias",
      "listaEntretenimento"
    ]
  }
];

function encontrarContainerCategoria(config) {
  for (const id of config.ids) {
    const elemento = document.getElementById(id);
    if (elemento) return elemento;
  }

  const secao = Array.from(
    document.querySelectorAll("[data-categoria]")
  ).find(function(elemento) {
    return norm(elemento.dataset.categoria) === norm(config.nome);
  });

  if (secao) {
    return secao.querySelector(
      ".noticias-lista, .lista-noticias, .noticias-grid, .categoria-lista"
    ) || secao;
  }

  return null;
}

async function buscarCategoria(config) {
  if (!db) return [];

  try {
    const resposta = await db
      .from("noticias")
      .select("id, titulo, imagem, categoria, subcategoria, texto, data, fonte, url_original, pais")
      .order("data", { ascending: false })
      .limit(250);

    if (resposta.error) throw resposta.error;

    const todas = Array.isArray(resposta.data) ? resposta.data : [];

    return ordenarPorData(
      todas.filter(function(noticia) {
        return config.variantes.includes(norm(noticia.categoria));
      })
    ).slice(0, LIMITE_CATEGORIA);
  } catch (erro) {
    mostrarErroNoticias(erro);
    return [];
  }
}

async function carregarNoticias() {
  if (!db) {
    console.error("AfricanMundo — cliente Supabase não está disponível.");
    return;
  }

  try {
    const resposta = await db
      .from("noticias")
      .select("id, titulo, imagem, categoria, subcategoria, texto, data, fonte, url_original, pais")
      .order("data", { ascending: false })
      .limit(LIMITE_DESTAQUE);

    if (resposta.error) throw resposta.error;

    noticias = ordenarPorData(
      Array.isArray(resposta.data) ? resposta.data : []
    );

    if (noticias.length) {
      iniciarDestaque(noticias);
    }

    for (const config of CATEGORIAS_INICIO) {
      const container = encontrarContainerCategoria(config);
      if (!container) continue;

      const items = noticias.filter(function(noticia) {
        return config.variantes.includes(norm(noticia.categoria));
      }).slice(0, LIMITE_CATEGORIA);

      container.innerHTML = lista(items, true);
      prepararImagens(container);
    }

    const recentesContainer =
      document.getElementById("ultimasNoticias") ||
      document.getElementById("listaUltimasNoticias") ||
      document.getElementById("noticiasRecentes");

    if (recentesContainer) {
      recentesContainer.innerHTML = lista(
        noticias.slice(0, LIMITE_ULTIMAS),
        true
      );
      prepararImagens(recentesContainer);
    }

    console.log("AfricanMundo — notícias carregadas:", noticias.length);
  } catch (erro) {
    mostrarErroNoticias(erro);
  }
     }



/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 2/4: PESQUISA E ATUALIZAÇÕES
   ===================================================== */

/* ---------- ATUALIZAR NOTÍCIAS ---------- */

async function atualizarNoticias() {
  if (!db) return;

  await carregarNoticias();

  if (typeof carregarAnuncios === "function") {
    await carregarAnuncios();
  }

  console.log("AfricanMundo — atualização concluída.");
}

/* ---------- ATUALIZAÇÃO AUTOMÁTICA ---------- */

function iniciarAtualizacaoAutomatica() {
  if (timerAtualizacao) {
    clearInterval(timerAtualizacao);
  }

  timerAtualizacao = setInterval(function() {
    if (document.visibilityState === "visible") {
      atualizarNoticias();
    }
  }, 5 * 60 * 1000);

  console.log("AfricanMundo — atualização automática a cada 5 minutos.");
}

/* ---------- SUPABASE REALTIME ---------- */

function agendarAtualizacaoRealtime() {
  const agora = Date.now();

  if (agora - ultimaAtualizacaoRealtime < 3000) return;

  ultimaAtualizacaoRealtime = agora;

  if (timerRealtime) {
    clearTimeout(timerRealtime);
  }

  timerRealtime = setTimeout(function() {
    if (document.visibilityState === "visible") {
      atualizarNoticias();
    }
  }, 1200);
}

function iniciarRealtimeNoticias() {
  if (!db) {
    console.warn("AfricanMundo — Supabase não está disponível.");
    return;
  }

  if (canalNoticias) return;

  try {
    canalNoticias = db
      .channel("africanmundo-noticias")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "noticias"
        },
        function(payload) {
          console.log(
            "AfricanMundo — nova notícia:",
            payload.new?.id
          );
          agendarAtualizacaoRealtime();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "noticias"
        },
        function(payload) {
          console.log(
            "AfricanMundo — notícia atualizada:",
            payload.new?.id
          );
          agendarAtualizacaoRealtime();
        }
      )
      .subscribe(function(status) {
        console.log("AfricanMundo — Realtime:", status);

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(
            "AfricanMundo — Realtime indisponível; a atualização automática continua ativa."
          );
        }
      });
  } catch (erro) {
    console.error("AfricanMundo — erro no Realtime:", erro);
    canalNoticias = null;
  }
}

/* ---------- PESQUISA DE NOTÍCIAS ---------- */

async function pesquisarNoticias(termo) {
  if (!db) return [];

  const pesquisa = String(termo || "").trim();

  if (pesquisa.length < 2) return [];

  try {
    const resposta = await db
      .from("noticias")
      .select(
        "id, titulo, imagem, categoria, subcategoria, texto, data, fonte, url_original, pais"
      )
      .or(
        "titulo.ilike.%" +
        pesquisa.replace(/[%_,]/g, " ") +
        "%,texto.ilike.%" +
        pesquisa.replace(/[%_,]/g, " ") +
        "%"
      )
      .order("data", { ascending: false })
      .limit(50);

    if (resposta.error) throw resposta.error;

    return ordenarPorData(
      Array.isArray(resposta.data) ? resposta.data : []
    );
  } catch (erro) {
    console.error("AfricanMundo — erro na pesquisa:", erro);
    return [];
  }
}

function configurarPesquisa() {
  const campos = document.querySelectorAll(
    "#pesquisa, #campoPesquisa, #searchInput, input[name='pesquisa']"
  );

  campos.forEach(function(campo) {
    if (campo.dataset.pesquisaPreparada === "sim") return;

    campo.dataset.pesquisaPreparada = "sim";

    campo.addEventListener("keydown", function(evento) {
      if (evento.key === "Enter") {
        evento.preventDefault();
        executarPesquisa(campo.value);
      }
    });
  });

  document.querySelectorAll(
    "#botaoPesquisa, #btnPesquisar, [data-am-search]"
  ).forEach(function(botao) {
    if (botao.dataset.pesquisaPreparada === "sim") return;

    botao.dataset.pesquisaPreparada = "sim";

    botao.addEventListener("click", function(evento) {
      evento.preventDefault();

      const campo = document.querySelector(
        "#pesquisa, #campoPesquisa, #searchInput, input[name='pesquisa']"
      );

      if (campo) executarPesquisa(campo.value);
    });
  });

  document.querySelectorAll("form").forEach(function(formulario) {
    const campo = formulario.querySelector(
      "#pesquisa, #campoPesquisa, #searchInput, input[name='pesquisa']"
    );

    if (!campo || formulario.dataset.pesquisaPreparada === "sim") return;

    formulario.dataset.pesquisaPreparada = "sim";

    formulario.addEventListener("submit", function(evento) {
      evento.preventDefault();
      executarPesquisa(campo.value);
    });
  });
}

async function executarPesquisa(termo) {
  const pesquisa = String(termo || "").trim();

  if (!pesquisa) {
    alert("Escreva uma palavra para pesquisar.");
    return;
  }

  const resultados = await pesquisarNoticias(pesquisa);

  const container =
    document.getElementById("resultadosPesquisa") ||
    document.getElementById("resultados-pesquisa") ||
    document.getElementById("listaResultados");

  if (container) {
    container.innerHTML = resultados.length
      ? lista(resultados, true)
      : '<p class="sem-noticias">Não foram encontradas notícias para esta pesquisa.</p>';

    prepararImagens(container);
    container.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    return;
  }

  const destino = "pesquisa.html?q=" + encodeURIComponent(pesquisa);
  window.location.href = destino;
}



/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 3/4: ANÚNCIOS, IMAGENS E INTERFACE
   ===================================================== */

/* ---------- ANÚNCIOS ATIVOS ---------- */

async function carregarAnuncios() {
  const secao = document.getElementById("anunciosAtivosSection");
  const container = document.getElementById("anunciosAtivos");

  if (!secao || !container || !db) return;

  try {
    const agora = new Date().toISOString();

    const resposta = await db
      .from("pedidos_anuncios")
      .select("*")
      .eq("estado", "aprovado")
      .order("id", { ascending: false })
      .limit(20);

    if (resposta.error) throw resposta.error;

    const anuncios = (Array.isArray(resposta.data) ? resposta.data : [])
      .filter(function(anuncio) {
        const inicio = anuncio.data_inicio
          ? new Date(anuncio.data_inicio).getTime()
          : 0;

        const fim = anuncio.data_fim
          ? new Date(anuncio.data_fim).getTime()
          : Number.MAX_SAFE_INTEGER;

        const instante = new Date(agora).getTime();

        return (
          (!inicio || Number.isFinite(inicio) && instante >= inicio) &&
          (!fim || Number.isFinite(fim) && instante <= fim)
        );
      });

    if (!anuncios.length) {
      container.innerHTML = "";
      secao.style.display = "none";
      return;
    }

    container.innerHTML = anuncios.map(anuncioCard).join("");
    secao.style.display = "";

    prepararImagens(container);

    container.querySelectorAll("video").forEach(function(video) {
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;

      const tentativa = video.play();

      if (tentativa && typeof tentativa.catch === "function") {
        tentativa.catch(function() {
          console.log("AfricanMundo — reprodução automática bloqueada pelo navegador.");
        });
      }
    });
  } catch (erro) {
    console.error("AfricanMundo — erro ao carregar anúncios:", erro);
    container.innerHTML = "";
    secao.style.display = "none";
  }
}

function anuncioCard(anuncio) {
  const arquivo = String(
    anuncio.arquivo_url ||
    anuncio.imagem ||
    anuncio.video_url ||
    ""
  ).trim();

  const tipoArquivo = norm(
    anuncio.arquivo_tipo ||
    anuncio.tipo_anuncio ||
    anuncio.tipo ||
    ""
  );

  const eVideo =
    tipoArquivo.includes("video") ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(arquivo);

  const empresa = esc(anuncio.empresa || "Anunciante");
  const descricao = esc(anuncio.descricao || "");
  const destinoOriginal = String(anuncio.link_destino || "").trim();

  let destino = "";

  if (destinoOriginal) {
    try {
      const endereco = new URL(destinoOriginal);

      if (
        endereco.protocol === "https:" ||
        endereco.protocol === "http:"
      ) {
        destino = endereco.href;
      }
    } catch (_) {
      destino = "";
    }
  }

  let conteudoArquivo = "";

  if (arquivo && imagemValida(arquivo) && eVideo) {
    conteudoArquivo = `
      <video src="${esc(arquivo)}"
             muted autoplay loop playsinline
             controls preload="metadata"
             aria-label="Anúncio de ${empresa}">
      </video>
    `;
  } else if (arquivo && imagemValida(arquivo)) {
    conteudoArquivo = `
      <img src="${esc(arquivo)}"
           alt="Anúncio de ${empresa}"
           loading="lazy">
    `;
  }

  const corpo = `
    <article class="anuncio-card">
      ${conteudoArquivo}
      <div class="anuncio-conteudo">
        <span class="anuncio-etiqueta">Publicidade</span>
        <h3>${empresa}</h3>
        ${descricao ? `<p>${descricao}</p>` : ""}
        ${destino
          ? `<a href="${esc(destino)}"
                target="_blank"
                rel="noopener noreferrer sponsored">
                Saber mais
             </a>`
          : ""}
      </div>
    </article>
  `;

  return corpo;
}

/* ---------- PROTEÇÃO DAS IMAGENS ---------- */

function protegerImagens() {
  document.querySelectorAll("img").forEach(function(img) {
    if (img.dataset.protecaoAtiva === "sim") return;

    img.dataset.protecaoAtiva = "sim";
    img.loading = img.loading || "lazy";
    img.decoding = "async";

    img.addEventListener("error", function() {
      if (img.src !== FALLBACK_IMG) {
        img.src = FALLBACK_IMG;
      }
    });
  });
}

/* ---------- ABRIR E FECHAR PAINÉIS ---------- */

function alternarPainel(id) {
  const painel = document.getElementById(id);
  if (!painel) return;

  const estavaAberto =
    painel.classList.contains("aberto") ||
    painel.style.display === "block";

  document.querySelectorAll(
    "#notificationPanel, #toolsPanel, #userPanel, #colorPanel"
  ).forEach(function(outro) {
    outro.classList.remove("aberto");
    outro.style.display = "none";
  });

  if (!estavaAberto) {
    painel.classList.add("aberto");
    painel.style.display = "block";
  }
}

function configurarBotoesTopo() {
  const botoes = [
    {
      ids: ["notificationButton", "btnNotificacoes", "botaoNotificacoes"],
      painel: "notificationPanel"
    },
    {
      ids: ["toolsButton", "btnFerramentas", "botaoFerramentas"],
      painel: "toolsPanel"
    },
    {
      ids: ["userButton", "btnUtilizador", "botaoUtilizador"],
      painel: "userPanel"
    },
    {
      ids: ["colorButton", "btnCores", "botaoCores"],
      painel: "colorPanel"
    }
  ];

  botoes.forEach(function(config) {
    config.ids.forEach(function(id) {
      const botao = document.getElementById(id);

      if (!botao || botao.dataset.topoPreparado === "sim") return;

      botao.dataset.topoPreparado = "sim";

      botao.addEventListener("click", function(evento) {
        evento.preventDefault();
        alternarPainel(config.painel);
      });
    });
  });
}

/* ---------- BOTÕES COM DATA-AM-ACTION ---------- */

function configurarBotoesData() {
  document.querySelectorAll("[data-am-action]").forEach(function(botao) {
    if (botao.dataset.amPreparado === "sim") return;

    botao.dataset.amPreparado = "sim";

    botao.addEventListener("click", function(evento) {
      const acao = norm(botao.dataset.amAction);

      const paineis = {
        notificacoes: "notificationPanel",
        ferramentas: "toolsPanel",
        utilizador: "userPanel",
        usuario: "userPanel",
        cores: "colorPanel",
        pesquisa: null
      };

      if (!(acao in paineis)) return;

      evento.preventDefault();

      if (acao === "pesquisa") {
        const campo = document.querySelector(
          "#pesquisa, #campoPesquisa, #searchInput, input[name='pesquisa']"
        );

        if (campo) {
          campo.focus();
          pesquisaAberta = true;
        }
        return;
      }

      alternarPainel(paineis[acao]);
    });
  });
}

/* ---------- FECHAR PAINÉIS AO CLICAR FORA ---------- */

function configurarFechoPaineis() {
  if (document.documentElement.dataset.fechoPaineis === "sim") return;

  document.documentElement.dataset.fechoPaineis = "sim";

  document.addEventListener("click", function(evento) {
    const dentroDePainel = evento.target.closest(
      "#notificationPanel, #toolsPanel, #userPanel, #colorPanel"
    );

    const dentroDeBotao = evento.target.closest(
      "#notificationButton, #btnNotificacoes, #botaoNotificacoes, " +
      "#toolsButton, #btnFerramentas, #botaoFerramentas, " +
      "#userButton, #btnUtilizador, #botaoUtilizador, " +
      "#colorButton, #btnCores, #botaoCores, [data-am-action]"
    );

    if (dentroDePainel || dentroDeBotao) return;

    document.querySelectorAll(
      "#notificationPanel, #toolsPanel, #userPanel, #colorPanel"
    ).forEach(function(painel) {
      painel.classList.remove("aberto");
      painel.style.display = "none";
    });
  });
}



/* =====================================================
   AFRICANMUNDO — APP.JS
   PARTE 4/4: INICIALIZAÇÃO E FINALIZAÇÃO
   ===================================================== */

/* ---------- CORES DO SITE ---------- */

function aplicarCor(cor) {
  const cores = {
    verde: "#168a45",
    azul: "#1769aa",
    vermelho: "#c62828",
    roxo: "#7542a6",
    laranja: "#d97706"
  };

  const escolhida = cores[norm(cor)] || cores.verde;

  document.documentElement.style.setProperty("--p", escolhida);

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) {
    meta.setAttribute("content", escolhida);
  }

  try {
    localStorage.setItem("africanmundo-cor", norm(cor) || "verde");
  } catch (_) {}
}

function iniciarCorGuardada() {
  try {
    const cor = localStorage.getItem("africanmundo-cor");

    if (cor) {
      aplicarCor(cor);
    }
  } catch (_) {}
}

function configurarSeletorCores() {
  document.querySelectorAll("[data-am-cor]").forEach(function(botao) {
    if (botao.dataset.corPreparada === "sim") return;

    botao.dataset.corPreparada = "sim";

    botao.addEventListener("click", function() {
      aplicarCor(botao.dataset.amCor);
    });
  });
}

/* ---------- MENU MÓVEL ---------- */

function configurarMenuMovel() {
  const botoes = document.querySelectorAll(
    "#menuToggle, #menuMobileButton, #btnMenuMobile, .menu-toggle, [data-menu-toggle]"
  );

  botoes.forEach(function(botao) {
    if (botao.dataset.menuPreparado === "sim") return;

    botao.dataset.menuPreparado = "sim";

    botao.addEventListener("click", function(evento) {
      evento.preventDefault();

      const menu =
        document.getElementById("menuMobile") ||
        document.getElementById("mobileMenu") ||
        document.querySelector(".menu-mobile") ||
        document.querySelector(".nav-links");

      if (!menu) return;

      const aberto =
        menu.classList.contains("aberto") ||
        menu.classList.contains("active");

      menu.classList.toggle("aberto", !aberto);
      menu.classList.toggle("active", !aberto);
      botao.setAttribute("aria-expanded", String(!aberto));
    });
  });

  document.querySelectorAll(
    "#menuMobile a, #mobileMenu a, .menu-mobile a"
  ).forEach(function(link) {
    if (link.dataset.menuLinkPreparado === "sim") return;

    link.dataset.menuLinkPreparado = "sim";

    link.addEventListener("click", function() {
      const menu = link.closest(
        "#menuMobile, #mobileMenu, .menu-mobile"
      );

      if (menu) {
        menu.classList.remove("aberto", "active");
      }
    });
  });
}

/* ---------- BOTÃO VOLTAR AO TOPO ---------- */

function configurarVoltarTopo() {
  const botoes = document.querySelectorAll(
    "#voltarTopo, #backToTop, .voltar-topo, [data-voltar-topo]"
  );

  botoes.forEach(function(botao) {
    if (botao.dataset.topoScrollPreparado === "sim") return;

    botao.dataset.topoScrollPreparado = "sim";

    botao.addEventListener("click", function(evento) {
      evento.preventDefault();

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });
}

/* ---------- VISIBILIDADE DA PÁGINA ---------- */

function configurarVisibilidade() {
  if (document.documentElement.dataset.visibilidadePreparada === "sim") {
    return;
  }

  document.documentElement.dataset.visibilidadePreparada = "sim";

  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") {
      atualizarNoticias();
    }
  });
}

/* ---------- PWA E SERVICE WORKER ---------- */

function configurarPWA() {
  const manifest = document.querySelector('link[rel="manifest"]');

  if (!manifest) {
    console.info(
      "AfricanMundo — nenhum manifest encontrado; PWA não alterado."
    );
  }

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("./sw.js")
        .then(function(registro) {
          console.log(
            "AfricanMundo — Service Worker ativo:",
            registro.scope
          );
        })
        .catch(function(erro) {
          console.warn(
            "AfricanMundo — não foi possível registar o Service Worker:",
            erro
          );
        });
    }, { once: true });
  }
}

/* ---------- LIGAÇÃO DOS BOTÕES ---------- */

function configurarInterface() {
  configurarBotoesTopo();
  configurarBotoesData();
  configurarPesquisa();
  configurarMenuMovel();
  configurarFechoPaineis();
  configurarVoltarTopo();
  configurarSeletorCores();
  configurarVisibilidade();
}

/* ---------- INICIALIZAÇÃO PRINCIPAL ---------- */

async function iniciarAfricanMundo() {
  if (africanMundoIniciado) return;

  africanMundoIniciado = true;

  try {
    iniciarCorGuardada();
    configurarInterface();
    protegerImagens();

    await carregarNoticias();
    await carregarAnuncios();

    iniciarAtualizacaoAutomatica();
    iniciarRealtimeNoticias();

    console.log("AfricanMundo — site inicializado.");
  } catch (erro) {
    console.error("AfricanMundo — erro na inicialização:", erro);
  }
}

/* ---------- DISPONIBILIZAR FUNÇÕES ---------- */

window.carregarNoticias = carregarNoticias;
window.atualizarNoticias = atualizarNoticias;
window.buscarCategoria = buscarCategoria;
window.pesquisarNoticias = pesquisarNoticias;
window.executarPesquisa = executarPesquisa;
window.abrirNoticia = abrirNoticia;
window.carregarAnuncios = carregarAnuncios;
window.iniciarDestaque = iniciarDestaque;
window.iniciarAtualizacaoAutomatica = iniciarAtualizacaoAutomatica;
window.iniciarRealtimeNoticias = iniciarRealtimeNoticias;
window.aplicarCor = aplicarCor;

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
