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
   LOGIN
========================================= */

function login() {

  const u =
    document
      .getElementById("user")
      .value
      .trim();

  const p =
    document
      .getElementById("pass")
      .value;

  if (
    u === "admin" &&
    p === "admin123"
  ) {

    sessionStorage.setItem(
      "am_login",
      "1"
    );

    show();

  } else {

    alert(
      "Utilizador ou senha incorretos."
    );

  }

}


/* =========================================
   MOSTRAR PAINEL
========================================= */

function show() {

  const loginBox =
    document.getElementById("loginBox");

  const dashboard =
    document.getElementById("dashboard");

  if (loginBox) {

    loginBox.classList.add("hidden");

  }

  if (dashboard) {

    dashboard.classList.remove("hidden");

  }

  render();

}


/* =========================================
   SAIR
========================================= */

function logout() {

  sessionStorage.removeItem(
    "am_login"
  );

  location.reload();

}


/* =========================================
   PREVISUALIZAR IMAGEM
========================================= */

const imageFileInput =
  document.getElementById("imageFile");

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

    const { data, error } =
      await supabaseClient
        .from("noticias")
        .insert([

          {
            titulo: title,

            categoria: cat,

            Imagem:
              imagemURL,

            texto: body

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

}


/* =========================================
   LIMPAR FORMULÁRIO
========================================= */

function limparFormulario() {

  const title =
    document.getElementById("title");

  const imageFile =
    document.getElementById(
      "imageFile"
    );

  const body =
    document.getElementById("body");

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
    document.getElementById("posts");


  if (!posts) {

    return;

  }


  posts.innerHTML =
    "<p>🔄 A carregar notícias...</p>";


  const { data, error } =
    await supabaseClient
      .from("noticias")
      .select("*")
      .order(
        "id",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Erro ao carregar:",
      error
    );

    posts.innerHTML = `
      <p>
        ❌ Não foi possível carregar as notícias.
        <br><br>
        <small>
          ${esc(error.message)}
        </small>
      </p>
    `;

    return;

  }


  if (!data || data.length === 0) {

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
      .eq("id", id)
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
   VERIFICAR LOGIN AO ABRIR
========================================= */

if (
  sessionStorage.getItem(
    "am_login"
  ) === "1"
) {

  show();

     }
