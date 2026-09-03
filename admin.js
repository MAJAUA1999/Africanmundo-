console.log("✅ ADMIN.JS FOI CARREGADO");

/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "https://sonzwfhepjfvzltuxxne.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================
   LOGIN COM SUPABASE AUTH
========================================= */

async function login() {

  const email =
    document
      .getElementById("user")
      .value
      .trim();

  const senha =
    document
      .getElementById("pass")
      .value;


  if (!email || !senha) {

    alert(
      "Digite o email e a senha."
    );

    return;

  }


  const botao =
    document.querySelector(
      "#loginBox .btn"
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "A entrar...";

  }


  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .signInWithPassword({

          email: email,

          password: senha

        });


    if (error) {

      console.error(
        "Erro de login:",
        error
      );

      alert(
        "❌ Email ou senha incorretos."
      );

      return;

    }


    if (!data || !data.user) {

      alert(
        "❌ Não foi possível iniciar a sessão."
      );

      return;

    }


    await show();

  }

  catch (erro) {

    console.error(
      "Erro inesperado:",
      erro
    );

    alert(
      "❌ Ocorreu um erro ao entrar."
    );

  }

  finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "Entrar";

    }

  }

}


/* =========================================
   MOSTRAR PAINEL
========================================= */

async function show() {

  const loginBox =
    document.getElementById(
      "loginBox"
    );

  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (loginBox) {

    loginBox.classList.add(
      "hidden"
    );

  }


  if (dashboard) {

    dashboard.classList.remove(
      "hidden"
    );

  }


  /* =====================================
     CARREGAR NOTÍCIAS
  ===================================== */

  await render();

   await carregarMetricas();


  /* =====================================
     CARREGAR PEDIDOS DE PUBLICIDADE
  ===================================== */

  await carregarPedidosAnuncios();

}

/* =========================================
   VERIFICAR SESSÃO
========================================= */

async function verificarSessao() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getSession();


  if (error) {

    console.error(
      "Erro ao verificar sessão:",
      error
    );

    return;

  }


  if (
    data &&
    data.session &&
    data.session.user
  ) {

    await show();

  }

}


/* =========================================
   SAIR
========================================= */

async function logout() {

  try {

    await supabaseClient
      .auth
      .signOut();

  }

  catch (erro) {

    console.error(
      "Erro ao sair:",
      erro
    );

  }


  location.reload();

}


/* =========================================
   OBSERVAR ALTERAÇÕES DE SESSÃO
========================================= */

supabaseClient
  .auth
  .onAuthStateChange(
    function(event, session) {

      console.log(
        "Estado de autenticação:",
        event
      );

    }
  );


/* =========================================
   PREVISUALIZAR IMAGEM
========================================= */

const imageFileInput =
  document.getElementById(
    "imageFile"
  );


if (imageFileInput) {

  imageFileInput.addEventListener(
    "change",
    function() {

      const arquivo =
        this.files &&
        this.files[0];


      const preview =
        document.getElementById(
          "imagePreview"
        );


      if (!preview) {

        return;

      }


      if (!arquivo) {

        preview.innerHTML = "";

        return;

      }


      const url =
        URL.createObjectURL(
          arquivo
        );


      preview.innerHTML = `

        <img
          src="${url}"
          alt="Pré-visualização"
          style="
            width:100%;
            max-width:400px;
            max-height:250px;
            object-fit:cover;
            border-radius:10px;
            display:block;
          "
        >

      `;

    }
  );

}


/* =========================================
   ENVIAR IMAGEM PARA O STORAGE
========================================= */

async function enviarImagem(arquivo) {

  if (!arquivo) {

    return null;

  }


  if (
    !arquivo.type ||
    !arquivo.type.startsWith("image/")
  ) {

    throw new Error(
      "Escolha um arquivo de imagem."
    );

  }


  const extensao =
    arquivo.name
      .split(".")
      .pop()
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        ""
      ) || "jpg";


  const nomeArquivo =
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 10) +
    "." +
    extensao;


  const caminho =
    "noticias/" +
    nomeArquivo;


  const resultado =
    await supabaseClient
      .storage
      .from("noticias")
      .upload(
        caminho,
        arquivo,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: arquivo.type
        }
      );


  if (resultado.error) {

    throw resultado.error;

  }


  const url =
    supabaseClient
      .storage
      .from("noticias")
      .getPublicUrl(
        caminho
      );


  return url.data.publicUrl;

}
/* =========================================
   PUBLICAR NOTÍCIA
========================================= */

async function publish() {

  /* =====================================
     CONFIRMAR LOGIN
  ===================================== */

  const {
    data: sessaoData
  } =
    await supabaseClient
      .auth
      .getSession();


  if (
    !sessaoData ||
    !sessaoData.session ||
    !sessaoData.session.user
  ) {

    alert(
      "🔐 A sua sessão terminou. Entre novamente."
    );

    location.reload();

    return;

  }


  const title =
    document
      .getElementById("title")
      .value
      .trim();


  const cat =
    document
      .getElementById("category")
      .value
      .trim();


  const body =
    document
      .getElementById("body")
      .value
      .trim();


  const imageFile =
    document
      .getElementById("imageFile")
      .files[0];


  if (!title || !body) {

    alert(
      "Preencha o título e o texto."
    );

    return;

  }


  const botao =
    document.querySelector(
      'button[onclick="publish()"]'
    );


  if (botao) {

    botao.disabled = true;

    botao.textContent =
      "⏳ A publicar...";

  }


  try {

    let imagemURL = null;


    /* =====================================
       ENVIAR IMAGEM
    ===================================== */

    if (imageFile) {

      imagemURL =
        await enviarImagem(
          imageFile
        );

    }


    /* =====================================
       GUARDAR NOTÍCIA
    ===================================== */

    const {
      data,
      error
    } =
      await supabaseClient
        .from("noticias")
        .insert([

          {
            titulo:
              title,

            categoria:
              cat,

            imagem:
              imagemURL,

            texto:
              body

          }

        ])
        .select();


    if (error) {

      console.error(
        "Erro ao publicar:",
        error
      );

      alert(
        "❌ Erro ao publicar:\n\n" +
        error.message
      );

      return;

    }


    console.log(
      "Notícia publicada:",
      data
    );


    limparFormulario();


    await render();


    alert(
      "✅ Notícia publicada com sucesso!"
    );

  }

  catch (erro) {

    console.error(
      "Erro no upload:",
      erro
    );

    alert(
      "❌ Não foi possível enviar a imagem.\n\n" +
      erro.message
    );

  }

  finally {

    if (botao) {

      botao.disabled = false;

      botao.textContent =
        "📰 Publicar notícia";

    }

  }

}


/* =========================================
   LIMPAR FORMULÁRIO
========================================= */

function limparFormulario() {

  const title =
    document.getElementById(
      "title"
    );


  const imageFile =
    document.getElementById(
      "imageFile"
    );


  const body =
    document.getElementById(
      "body"
    );


  const preview =
    document.getElementById(
      "imagePreview"
    );


  if (title) {

    title.value = "";

  }


  if (imageFile) {

    imageFile.value = "";

  }


  if (body) {

    body.value = "";

  }


  if (preview) {

    preview.innerHTML = "";

  }

}
/* =========================================
   CARREGAR NOTÍCIAS
========================================= */

async function render() {

  const posts =
    document.getElementById(
      "posts"
    );


  if (!posts) {

    return;

  }


  posts.innerHTML =
    "<p>🔄 A carregar notícias...</p>";


  try {

    const tempoLimite =
      new Promise(
        (_, reject) => {

          setTimeout(
            () => {

              reject(
                new Error(
                  "O Supabase demorou demasiado tempo para responder."
                )
              );

            },
            10000
          );

        }
      );


    const consulta =
      supabaseClient
        .from("noticias")
        .select("*")
        .order(
          "id",
          {
            ascending: false
          }
        );


    const resultado =
      await Promise.race([
        consulta,
        tempoLimite
      ]);


    const data =
      resultado.data;


    const error =
      resultado.error;


    if (error) {

      console.error(
        "Erro Supabase:",
        error
      );


      posts.innerHTML = `

        <div
          style="
            padding:15px;
            border-radius:10px;
            background:#fff3f3;
            border:1px solid #e57373;
          "
        >

          <strong>
            ❌ Não foi possível carregar as notícias.
          </strong>

          <br><br>

          <small>
            ${esc(error.message)}
          </small>

        </div>

      `;


      return;

    }


    if (
      !data ||
      data.length === 0
    ) {

      posts.innerHTML =
        "<p>📰 Ainda não existem notícias publicadas.</p>";


      return;

    }


    posts.innerHTML =
      data
        .map(
          function(p) {

            const imagem =
              p.imagem ??
              "";


            return `

              <div
                class="post-item"
                style="
                  margin-bottom:20px;
                  padding:15px;
                  border:1px solid #ddd;
                  border-radius:10px;
                "
              >

                ${
                  imagem
                  ? `
                    <img
                      src="${esc(imagem)}"
                      alt="${esc(p.titulo)}"
                      style="
                        width:100%;
                        max-width:500px;
                        border-radius:10px;
                        margin-bottom:10px;
                        display:block;
                      "
                    >
                  `
                  : ""
                }


                <b>
                  ${esc(
                    p.titulo ||
                    "Sem título"
                  )}
                </b>


                <br>


                <small>
                  🏷️ ${esc(
                    p.categoria ||
                    "Notícias"
                  )}
                </small>


                <p>
                  ${esc(
                    p.texto ||
                    ""
                  )}
                </p>


                <small>
                  🆔 ID:
                  ${esc(p.id)}
                </small>


                <div
                  style="
                    margin-top:12px;
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                  "
                >

                  <button
                    onclick="editarNoticia(${Number(p.id)})"
                    style="
                      padding:9px 14px;
                      border:0;
                      border-radius:7px;
                      background:#1976d2;
                      color:#fff;
                      font-weight:700;
                      cursor:pointer;
                    "
                  >
                    ✏️ Editar
                  </button>


                  <button
                    onclick="excluirNoticia(${Number(p.id)})"
                    style="
                      padding:9px 14px;
                      border:0;
                      border-radius:7px;
                      background:#d32f2f;
                      color:#fff;
                      font-weight:700;
                      cursor:pointer;
                    "
                  >
                    🗑️ Excluir
                  </button>

                </div>

              </div>

            `;

          }
        )
        .join("");


  }

  catch (erro) {

    console.error(
      "Erro ao carregar notícias:",
      erro
    );


    posts.innerHTML = `

      <div
        style="
          padding:15px;
          border-radius:10px;
          background:#fff3f3;
          border:1px solid #e57373;
        "
      >

        <strong>
          ❌ Erro ao carregar notícias.
        </strong>

        <br><br>

        <small>
          ${esc(
            erro.message ||
            "Erro desconhecido."
          )}
        </small>

      </div>

    `;

  }

       }
/* =========================================
   EDITAR NOTÍCIA
========================================= */

async function editarNoticia(id) {

  id = Number(id);


  if (!Number.isFinite(id)) {

    alert(
      "❌ ID da notícia inválido."
    );

    return;

  }


  const {
    data: noticia,
    error: buscarError
  } =
    await supabaseClient
      .from("noticias")
      .select("*")
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (buscarError) {

    console.error(
      "Erro ao buscar notícia:",
      buscarError
    );


    alert(
      "❌ Erro ao carregar a notícia:\n\n" +
      buscarError.message
    );


    return;

  }


  if (!noticia) {

    alert(
      "❌ Notícia não encontrada."
    );


    return;

  }


  const novoTitulo =
    prompt(
      "Título da notícia:",
      noticia.titulo || ""
    );


  if (novoTitulo === null) {

    return;

  }


  if (!novoTitulo.trim()) {

    alert(
      "❌ O título não pode ficar vazio."
    );


    return;

  }


  const novoTexto =
    prompt(
      "Texto da notícia:",
      noticia.texto || ""
    );


  if (novoTexto === null) {

    return;

  }


  if (!novoTexto.trim()) {

    alert(
      "❌ O texto não pode ficar vazio."
    );


    return;

  }


  const categorias = [

    "Notícias",
    "Futebol",
    "Moçambique",
    "África",
    "Negócios",
    "Entretenimento",
    "Desporto"

  ];


  const categoriaAtual =
    noticia.categoria ||
    "Notícias";


  const novaCategoria =
    prompt(

      "Categoria:\n\n" +
      categorias.join(" | "),

      categoriaAtual

    );


  if (novaCategoria === null) {

    return;

  }


  const categoriaDigitada =
    novaCategoria.trim();


  const categoriaFinal =
    categorias.find(
      function(categoria) {

        return (
          categoria.toLowerCase() ===
          categoriaDigitada.toLowerCase()
        );

      }
    ) || categoriaAtual;


  const imagemAtual =
    noticia.imagem ??
    "";


  const novaImagem =
    prompt(
      "URL da imagem atual:",
      imagemAtual
    );


  if (novaImagem === null) {

    return;

  }


  const {
    data: atualizado,
    error: updateError
  } =
    await supabaseClient
      .from("noticias")
      .update({

        titulo:
          novoTitulo.trim(),

        texto:
          novoTexto.trim(),

        categoria:
          categoriaFinal,

        imagem:
          novaImagem.trim() || null

      })
      .eq(
        "id",
        id
      )
      .select("*");


  if (updateError) {

    console.error(
      "Erro ao editar:",
      updateError
    );


    alert(
      "❌ Erro ao editar:\n\n" +
      updateError.message
    );


    return;

  }


  if (
    !atualizado ||
    atualizado.length === 0
  ) {

    alert(
      "⚠️ A atualização não alterou nenhuma notícia."
    );


    return;

  }


  console.log(
    "Notícia realmente atualizada:",
    atualizado[0]
  );


  await render();


  alert(
    "✅ Notícia atualizada com sucesso!"
  );

}


/* =========================================
   EXCLUIR NOTÍCIA
========================================= */

async function excluirNoticia(id) {

  id = Number(id);

  if (!confirm("⚠️ Tem certeza que deseja excluir esta notícia?")) {
    return;
  }

  try {

    const {
      error
    } = await supabaseClient
      .from("noticias")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    await render();

    alert(
      "✅ Notícia excluída com sucesso!"
    );

  } catch (erro) {

    console.error(
      "Erro ao excluir notícia:",
      erro
    );

    alert(
      "❌ Não foi possível excluir a notícia:\n\n" +
      (
        erro.message ||
        "Erro desconhecido."
      )
    );

  }

}


/* =========================================
   PROTEGER HTML
========================================= */

function esc(s) {

  return String(
    s ?? ""
  ).replace(

    /[&<>"']/g,

    function(m) {

      return {

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      }[m];

    }

  );

}


/* =========================================
   INICIALIZAR PAINEL
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    verificarSessao();

  }
);


/* =========================================
   PROTEGER O PAINEL CONTRA SESSÃO EXPIRADA
========================================= */

supabaseClient
  .auth
  .onAuthStateChange(
    function(event, session) {

      if (
        event === "SIGNED_OUT" ||
        (
          event === "TOKEN_REFRESHED" &&
          !session
        )
      ) {

        const dashboard =
          document.getElementById(
            "dashboard"
          );

        const loginBox =
          document.getElementById(
            "loginBox"
          );


        if (dashboard) {

          dashboard.classList.add(
            "hidden"
          );

        }


        if (loginBox) {

          loginBox.classList.remove(
            "hidden"
          );

        }

      }

    }
  );

/* =========================================
   MÉTRICAS
========================================= */

async function carregarMetricas() {

  const area =
    document.getElementById("metricas");

  if (!area) return;

  area.innerHTML =
    "<p>⏳ A carregar métricas...</p>";

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("noticias")
        .select("id,titulo,categoria,visualizacoes")
        .order(
          "visualizacoes",
          {
            ascending: false
          }
        );

    if (error)
      throw error;

    const noticias =
      data || [];

    const totalNoticias =
      noticias.length;

    const totalVisualizacoes =
      noticias.reduce(
        function(total, noticia) {

          return total +
            Number(
              noticia.visualizacoes || 0
            );

        },
        0
      );

     const mediaVisualizacoes =
  totalNoticias > 0
    ? (totalVisualizacoes / totalNoticias).toFixed(1)
    : "0";
     
    const maisLidas =
      noticias.slice(0,5);

    area.innerHTML = `

      <div style="
        display:grid;
        grid-template-columns:
          repeat(
            auto-fit,
            minmax(180px,1fr)
          );
        gap:12px;
        margin-top:15px;
      ">

        <div style="
          padding:18px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--card);
        ">
          <div style="font-size:25px;">
            📰
          </div>

          <strong style="font-size:24px;">
            ${totalNoticias}
          </strong>

          <div style="color:var(--muted);">
            Notícias
          </div>
        </div>

        <div style="
          padding:18px;
          border:1px solid var(--border);
          border-radius:12px;
          background:var(--card);
        ">
  <div style="font-size:25px;">
    👁️
  </div>

  <strong style="font-size:24px;">
    ${totalVisualizacoes}
  </strong>

  <div style="color:var(--muted);">
    Visualizações
  </div>
</div>

<div style="
  padding:18px;
  border:1px solid var(--border);
  border-radius:12px;
  background:var(--card);
">
  <div style="font-size:25px;">
    📈
  </div>

  <strong style="font-size:24px;">
    ${mediaVisualizacoes}
  </strong>

  <div style="color:var(--muted);">
    Média por notícia
  </div>
</div>

</div>

<div style="margin-top:20px;">

  <h3>
    🔥 Notícias mais lidas
  </h3>

        ${
          maisLidas.length
          ? maisLidas.map(
              function(n, i) {

                return `
                  <div style="
                    padding:12px 0;
                    border-bottom:
                      1px solid var(--border);
                  ">

                    <strong>
                      ${i + 1}. 
                      ${esc(n.titulo)}
                    </strong>

                    <br>

                    <small
                      style="
                        color:var(--muted);
                      "
                    >
                      🏷️ ${esc(
                        n.categoria ||
                        "Notícias"
                      )}
                      &nbsp; • &nbsp;
                      👁️ ${
                        Number(
                          n.visualizacoes || 0
                        )
                      } visualizações
                    </small>

                  </div>
                `;

              }
            ).join("")
          : "<p>Nenhuma notícia encontrada.</p>"
        }

      </div>

    `;

  }

  catch (erro) {

    console.error(
      "Erro nas métricas:",
      erro
    );

    area.innerHTML = `
      <div style="
        padding:15px;
        border-radius:10px;
        border:1px solid #e57373;
      ">
        ❌ Não foi possível carregar as métricas.
        <br><br>
        <small>
          ${esc(
            erro.message ||
            "Erro desconhecido."
          )}
        </small>
      </div>
    `;

  }

}

/* =========================================
   PEDIDOS DE PUBLICIDADE
========================================= */

async function carregarPedidosAnuncios() {

  const area =
    document.getElementById("pedidosAnuncios");

  if (!area) {
    console.log("Área pedidosAnuncios não encontrada.");
    return;
  }

  area.innerHTML =
    "<p>⏳ A carregar pedidos...</p>";

  try {

    /* ================================
       VERIFICAR SESSÃO
    ================================= */

    const {
      data: sessao,
      error: erroSessao
    } =
      await supabaseClient
        .auth
        .getSession();

    if (erroSessao) {
      throw erroSessao;
    }

    if (
      !sessao ||
      !sessao.session ||
      !sessao.session.user
    ) {

      area.innerHTML = `
        <div style="
          padding:15px;
          border-radius:10px;
          background:#fff3f3;
          border:1px solid #e57373;
        ">
          🔐 Sessão de administrador não encontrada.
        </div>
      `;

      return;
    }


    /* ================================
       BUSCAR ANÚNCIOS
    ================================= */

    const consulta =
      supabaseClient
        .from("anuncios")
        .select("*")
        .order("id", {
          ascending:false
        })
        .limit(50);


    const limite =
      new Promise(function(_, reject) {

        setTimeout(function() {

          reject(
            new Error(
              "O Supabase demorou demasiado tempo para responder."
            )
          );

        }, 10000);

      });


    const resultado =
      await Promise.race([
        consulta,
        limite
      ]);


    const data =
      resultado.data;

    const error =
      resultado.error;


    console.log(
      "PEDIDOS:",
      data
    );

    console.log(
      "ERRO:",
      error
    );


    if (error) {
      throw error;
    }


    /* ================================
       SEM PEDIDOS
    ================================= */

    if (
      !data ||
      data.length === 0
    ) {

      area.innerHTML = `
        <div style="
          padding:15px;
          border-radius:10px;
          background:var(--card);
          border:1px solid var(--border);
        ">
          📭 Ainda não existem pedidos de publicidade.
        </div>
      `;

      return;
    }


    /* ================================
       MOSTRAR PEDIDOS
    ================================= */

    area.innerHTML =
      data.map(function(p) {


        const ativo =
          p.ativo === true ||
          p.ativo === "true" ||
          p.ativo === 1 ||
          p.ativo === "1";


        return `

          <div style="
            margin-bottom:18px;
            padding:18px;
            border:1px solid var(--border);
            border-radius:12px;
            background:var(--card);
          ">


            <h3 style="
              margin-top:0;
            ">
              📢 ${esc(
                p.empresa ||
                "Publicidade"
              )}
            </h3>


            <p>
              👤 <strong>Nome:</strong><br>
              ${esc(
                p.nome ||
                "Não informado"
              )}
            </p>


            <p>
              📧 <strong>Email:</strong><br>
              ${esc(
                p.email ||
                "Não informado"
              )}
            </p>


            <p>
              📞 <strong>Telefone:</strong><br>
              ${esc(
                p.telefone ||
                "Não informado"
              )}
            </p>


            <p>
              📝 <strong>Mensagem:</strong><br>
              ${esc(
                p.mensagem ||
                "Sem mensagem"
              )}
            </p>


            <p>
  📌 <strong>Estado:</strong>

  <button
    type="button"
    onclick="marcarAnuncio(${Number(p.id)}, ${!ativo})"
    style="
      margin-left:6px;
      padding:8px 14px;
      border:0;
      border-radius:8px;
      background:${ativo ? "#168a45" : "#c62828"};
      color:#fff;
      font-weight:700;
      cursor:pointer;
    "
  >
    ${ativo ? "🟢 Ativo" : "🔴 Inativo"}
  </button>

</p>


            <button
              type="button"
              onclick="
                marcarAnuncio(
                  ${Number(p.id)},
                  ${!ativo}
                )
              "
              style="
                padding:10px 16px;
                border:0;
                border-radius:8px;
                background:#168a45;
                color:white;
                font-weight:700;
                cursor:pointer;
              "
            >

              ${
                ativo
                ? "🔴 Desativar"
                : "🟢 Ativar"
              }

            </button>


          </div>

        `;

      }).join("");


  }

  catch (erro) {

    console.error(
      "ERRO FINAL DOS ANÚNCIOS:",
      erro
    );


    area.innerHTML = `
      <div style="
        padding:15px;
        border-radius:10px;
        background:#fff3f3;
        border:1px solid #e57373;
      ">

        ❌ <strong>Erro ao carregar pedidos.</strong>

        <br><br>

        <small>
          ${esc(
            erro.message ||
            "Erro desconhecido."
          )}
        </small>

      </div>
    `;

  }

}


/* =========================================
   ATIVAR / DESATIVAR ANÚNCIO
========================================= */

async function marcarAnuncio(
  id,
  novoEstado
) {

  id = Number(id);


  novoEstado =
    novoEstado === true ||
    novoEstado === "true" ||
    novoEstado === 1 ||
    novoEstado === "1";


  try {

    const {
      data: sessao,
      error: erroSessao
    } =
      await supabaseClient
        .auth
        .getSession();


    if (erroSessao) {
      throw erroSessao;
    }


    if (
      !sessao ||
      !sessao.session
    ) {

      alert(
        "🔐 A sessão terminou. Entre novamente."
      );

      location.reload();

      return;
    }


    const {
      error
    } =
      await supabaseClient
        .from("anuncios")
        .update({
          ativo: novoEstado
        })
        .eq("id", id);


    if (error) {
      throw error;
    }


    await carregarPedidosAnuncios();


    alert(
      novoEstado
      ? "✅ Anúncio ativado."
      : "🔴 Anúncio desativado."
    );


  }

  catch (erro) {

    console.error(
      "Erro ao alterar anúncio:",
      erro
    );


    alert(
      "❌ Não foi possível alterar o anúncio.\n\n" +
      (
        erro.message ||
        "Erro desconhecido."
      )
    );

  }

             }
