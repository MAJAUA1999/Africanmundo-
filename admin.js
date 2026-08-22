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

  const image =
    document
      .getElementById("image")
      .value
      .trim();

  const body =
    document
      .getElementById("body")
      .value
      .trim();


  if (!title || !body) {

    alert(
      "Preencha o título e o texto."
    );

    return;

  }


  const { data, error } =
    await supabaseClient
      .from("noticias")
      .insert([

        {
          titulo: title,

          categoria: cat,

          Imagem:
            image || null,

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


/* =========================================
   LIMPAR FORMULÁRIO
========================================= */

function limparFormulario() {

  const title =
    document.getElementById("title");

  const image =
    document.getElementById("image");

  const body =
    document.getElementById("body");


  if (title) {

    title.value = "";

  }

  if (image) {

    image.value = "";

  }

  if (body) {

    body.value = "";

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


  /* Buscar notícia atual */

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


  /* =========================================
     NOVO TÍTULO
  ========================================= */

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


  /* =========================================
     NOVO TEXTO
  ========================================= */

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


  /* =========================================
     NOVA CATEGORIA
  ========================================= */

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

      categorias.join(
        " | "
      ),

      categoriaAtual

    );


  if (novaCategoria === null) {

    return;

  }


  const categoriaDigitada =
    novaCategoria
      .trim();


  const categoriaFinal =
    categorias.find(

      function(categoria) {

        return (
          categoria.toLowerCase() ===
          categoriaDigitada.toLowerCase()
        );

      }

    ) || categoriaAtual;


  /* =========================================
     NOVA IMAGEM
  ========================================= */

  const imagemAtual =
    noticia.Imagem ??
    noticia.imagem ??
    "";


  const novaImagem =
    prompt(

      "URL da imagem (deixe vazio para remover):",

      imagemAtual

    );


  if (novaImagem === null) {

    return;

  }


  /* =========================================
     ATUALIZAR NO SUPABASE
  ========================================= */

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


  /* =========================================
     CONFIRMAR ATUALIZAÇÃO
  ========================================= */

  if (
    !atualizado ||
    atualizado.length === 0
  ) {

    alert(

      "⚠️ A atualização não alterou nenhuma notícia.\n\n" +

      "O ID " +
      id +
      " não foi atualizado no Supabase."

    );

    console.error(

      "Nenhuma linha atualizada para o ID:",

      id

    );

    return;

  }


  console.log(

    "Notícia realmente atualizada:",

    atualizado[0]

  );


  /* Atualizar painel */

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
