const SUPABASE_URL = "https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY = "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === "admin" && p === "admin123") {
    sessionStorage.setItem("am_login", "1");
    show();
  } else {
    alert("Utilizador ou senha incorretos.");
  }
}

function show() {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  render();
}

function logout() {
  sessionStorage.removeItem("am_login");
  location.reload();
}

async function publish() {
  const title = document.getElementById("title").value.trim();
  const cat = document.getElementById("category").value;
  const body = document.getElementById("body").value.trim();

  if (!title || !body) {
    alert("Preencha o título e o texto.");
    return;
  }

  const { error } = await supabaseClient
    .from("noticias")
    .insert([{
      titulo: title,
      texto: body,
      categoria: cat
    }]);

  if (error) {
    alert("Erro ao publicar: " + error.message);
    return;
  }

  document.getElementById("title").value = "";
  document.getElementById("body").value = "";

  await render();
  alert("Notícia publicada com sucesso!");
}

async function render() {
  const { data, error } = await supabaseClient
    .from("noticias")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("posts").innerHTML =
    data.map(p => `
      <div class="post-item">
        <b>${esc(p.titulo)}</b><br>
        <small>${esc(p.categoria || "")}</small>
        <p>${esc(p.texto)}</p>
      </div>
    `).join("");
}

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

if (sessionStorage.getItem("am_login") === "1") show();
