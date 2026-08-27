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


  await render();

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

            Imagem:
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
            ascending:false
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
              p.Imagem ??
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
    noticia.Imagem ??
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

        Imagem:
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


  if (!Number.isFinite(id)) {

    alert(
      "❌ ID da notícia inválido."
    );

    return;

  }


  const confirmar =
    confirm(

      "⚠️ Tem certeza que deseja excluir esta notícia?\n\n" +
      "Esta ação não pode ser desfeita."

    );


  if (!confirmar) {

    return;

  }


  /* =====================================
     CONFIRMAR SESSÃO
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


  const { error } =
    await supabaseClient
      .from("noticias")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    console.error(
      "Erro ao excluir:",
      error
    );


    alert(
      "❌ Não foi possível excluir a notícia:\n\n" +
      error.message
    );


    return;

  }


  await render();


  alert(
    "✅ Notícia excluída com sucesso!"
  );

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
