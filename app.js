const SUPABASE_URL = "https://sonzwfhepjfvzltuxxne.supabase.co";
const SUPABASE_KEY = "sb_publishable_aGutLscN7IAKVqH9onnnkw_22Tl8PZf";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function carregarNoticias() {
  const grid = document.getElementById("newsGrid");

  if (!grid) return;

  grid.innerHTML = "<p>Carregando notícias...</p>";

  const { data, error } = await supabaseClient
    .from("noticias")
    .select("id, titulo, texto, categoria")
    .order("id", { ascending: false });

  if (error) {
    console.error("Erro Supabase:", error);
    grid.innerHTML = "<p>Não foi possível carregar as notícias.</p>";
    return;
  }

  if (!data || data.length === 0) {
    grid.innerHTML = "<p>Ainda não existem notícias publicadas.</p>";
    return;
  }

  grid.innerHTML = data.map(p => `
    <article class="news">
      <div class="thumb">🌍</div>
      <small>${escapeHtml(p.categoria || "Notícias")}</small>
      <h3>${escapeHtml(p.titulo || "")}</h3>
      <p>${escapeHtml(p.texto || "")}</p>
    </article>
  `).join("");
}

function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

carregarNoticias();
