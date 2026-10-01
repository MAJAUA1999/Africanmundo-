/* =========================================================
   AFRICANMUNDO — MODO ESCURO PERMANENTE
   ========================================================= */

(function () {
  "use strict";

  function aplicarModoEscuro() {
    const html = document.documentElement;

    html.classList.add("tema-escuro");
    html.classList.remove("tema-claro");

    html.style.colorScheme = "dark";

    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.setAttribute("content", "#0d1113");
    }

    document
      .querySelectorAll("[data-tema], #temaBtn, #themeBtn, .tema-btn")
      .forEach(function (botao) {
        botao.textContent = "🌙";
        botao.setAttribute("aria-label", "Modo escuro");
        botao.setAttribute("title", "Modo escuro");
      });
  }

  /* Disponível globalmente caso alguma parte do site chame a função */
  window.aplicarTema = aplicarModoEscuro;

  /* Mantém compatibilidade com o app.js */
  window.alternarTema = function () {
    aplicarModoEscuro();
  };

  /* Aplica imediatamente */
  aplicarModoEscuro();

  /* Aplica novamente quando o DOM estiver pronto */
  document.addEventListener("DOMContentLoaded", function () {
    aplicarModoEscuro();
  });

})();
