const defaults=[
 {title:"AfricanMundo está no ar: informação que liga África ao mundo",cat:"Notícias",body:"Este é o primeiro conteúdo do nosso portal africano."},
 {title:"Futebol africano em destaque",cat:"Futebol",body:"Acompanhe resultados, análises e grandes competições."},
 {title:"Moçambique em destaque",cat:"Moçambique",body:"Notícias e informações de interesse nacional."}
];
const posts=JSON.parse(localStorage.getItem("africanmundo_posts")||"null")||defaults;
const grid=document.getElementById("newsGrid");
posts.slice().reverse().forEach(p=>{grid.innerHTML+=`<article class="news"><div class="thumb">🌍</div><small>${p.cat}</small><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.body)}</p></article>`});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}