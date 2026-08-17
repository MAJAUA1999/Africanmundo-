function login(){
 const u=document.getElementById("user").value,p=document.getElementById("pass").value;
 if(u==="admin"&&p==="admin123"){sessionStorage.setItem("am_login","1");show();}
 else alert("Utilizador ou senha incorretos.");
}
function show(){document.getElementById("loginBox").classList.add("hidden");document.getElementById("dashboard").classList.remove("hidden");render();}
function logout(){sessionStorage.removeItem("am_login");location.reload();}
function publish(){
 const title=document.getElementById("title").value.trim(),cat=document.getElementById("category").value,body=document.getElementById("body").value.trim();
 if(!title||!body){alert("Preencha o título e o texto.");return}
 const posts=JSON.parse(localStorage.getItem("africanmundo_posts")||"null")||[];
 posts.push({title,cat,body});localStorage.setItem("africanmundo_posts",JSON.stringify(posts));
 document.getElementById("title").value="";document.getElementById("body").value="";render();alert("Notícia publicada no protótipo.");
}
function render(){
 const posts=JSON.parse(localStorage.getItem("africanmundo_posts")||"null")||[];
 document.getElementById("posts").innerHTML=posts.slice().reverse().map((p,i)=>`<div class="post-item"><b>${esc(p.title)}</b><br><small>${esc(p.cat)}</small><p>${esc(p.body)}</p></div>`).join("");
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
if(sessionStorage.getItem("am_login")==="1")show();