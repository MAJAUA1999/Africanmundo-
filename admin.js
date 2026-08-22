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
    document.getElementById("user").value.trim();

  const p =
    document.getElementById("pass").value;

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

  document
    .getElementById("loginBox")
    .classList.add("hidden");

  document
    .getElementById("dashboard")
    .classList.remove("hidden");

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


  /* =========================================
     GRAVAR NO SUPABASE

     O ID NÃO É ENVIADO.
     O SUPABASE DEVE GERAR O ID.
  ========================================= */

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


  /* =========================================
     LIMPAR FORMULÁRIO
  ========================================= */

  document
    .getElementById("title")
    .value = "";


  document
    .getElementById("image")
    .value = "";


  document
    .getElementById("body")
    .value = "";


  /* Atualizar lista */

  await render();


  alert(
    "✅ Notícia publicada com sucesso!"
  );

}


/* =========================================
   MOSTRAR NOTÍCIAS PUBLICADAS
========================================= */

async function render() {

  const posts =
    document.getElementById("posts");


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
    data.map(
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


          </div>

        `;

      }
    ).join("");

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

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#039;"

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
