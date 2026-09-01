function abrirRede(rede) {

  const links = {

    Google:
      "https://www.google.com/",

    Facebook:
      "https://www.facebook.com/",

    YouTube:
      "https://www.youtube.com/",

    WhatsApp:
      "https://www.whatsapp.com/",

    Instagram:
      "https://www.instagram.com/",

    TikTok:
      "https://www.tiktok.com/"

  };

  const url = links[rede];

  if (!url) {

    alert("❌ Rede social não encontrada.");

    return;

  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

    }
