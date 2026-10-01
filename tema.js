/* =========================================================
   AFRICANMUNDO — TEMA GLOBAL
   Modo claro / modo escuro
   ========================================================= */

(function () {

  const CHAVE_TEMA = "africanmundo-tema";

  function aplicarTema(tema) {

    const html = document.documentElement;

    if (tema === "escuro") {
      html.classList.add("tema-escuro");
      html.classList.remove("tema-claro");
    } else {
      html.classList.add("tema-claro");
      html.classList.remove("tema-escuro");
    }

    // Atualiza o botão do tema
    document.querySelectorAll(
      "[data-tema], #temaBtn, #themeBtn, .tema-btn"
    ).forEach(function (botao) {

      if (tema === "escuro") {
        botao.textContent = "☀️";
        botao.setAttribute("aria-label", "Ativar modo claro");
        botao.setAttribute("title", "Modo claro");
      } else {
        botao.textContent = "🌙";
        botao.setAttribute("aria-label", "Ativar modo escuro");
        botao.setAttribute("title", "Modo escuro");
      }

    });

  }


  function obterTema() {

    try {

      const salvo = localStorage.getItem(CHAVE_TEMA);

      if (salvo === "escuro" || salvo === "claro") {
        return salvo;
      }

    } catch (erro) {
      console.warn("Não foi possível ler o tema:", erro);
    }

    // AfricanMundo começa sempre em modo claro
    return "claro";
  }


  function salvarTema(tema) {

    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch (erro) {
      console.warn("Não foi possível guardar o tema:", erro);
    }

  }


  function alternarTema() {

    const html = document.documentElement;

    const estaEscuro =
      html.classList.contains("tema-escuro");

    const novoTema =
      estaEscuro ? "claro" : "escuro";

    aplicarTema(novoTema);
    salvarTema(novoTema);

  }


  // Disponibiliza a função para os botões existentes
  window.alternarTema = alternarTema;

  window.aplicarTema = aplicarTema;


  // Aplica imediatamente ao carregar o arquivo
  aplicarTema(obterTema());


  // Garante que o botão funcione mesmo que
  // tenha sido criado depois pelo JavaScript
  document.addEventListener("click", function (evento) {

    const botao = evento.target.closest(
      "[data-tema], #temaBtn, #themeBtn, .tema-btn"
    );

    if (!botao) return;

    evento.preventDefault();

    alternarTema();

  });


  // Reaplica quando o DOM terminar de carregar
  document.addEventListener("DOMContentLoaded", function () {

    aplicarTema(obterTema());

  });

})();
