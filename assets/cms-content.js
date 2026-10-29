/* Read-only visual content layer. Pages CMS edits JSON on GitHub, never stores credentials on the public site. */
(function(){
 "use strict";
 function string(v){return typeof v==="string"?v.trim():"";}
 function assetUrl(raw){
  if(!raw||typeof raw!=="string")return null;
  try {
   var u=new URL(raw,document.baseURI);
   var prefix=new URL("assets/",document.baseURI).pathname;
   if(u.origin!==location.origin||!u.pathname.startsWith(prefix))return null;
   if(!/\.(?:png|jpe?g|webp|svg)$/i.test(u.pathname))return null;
   return u.href;
  }catch(_){return null;}
 }
 function fetchJSON(path){return fetch(new URL(path,document.baseURI),{cache:"no-store"}).then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json();});}
 fetchJSON("content/site.json").then(function(data){
  if(!data||typeof data!=="object"||Array.isArray(data))return;
  document.querySelectorAll("[data-site-text]").forEach(function(node){
    var key=node.getAttribute("data-site-text"),value=string(data[key]);
    if(value)node.textContent=value;
  });
  var email=string(data.contact_email);
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
   document.querySelectorAll("[data-site-email]").forEach(function(node){node.textContent=email;node.setAttribute("href","mailto:"+email);});
   document.querySelectorAll("[data-site-email-text]").forEach(function(node){node.textContent=email;});
  }
  var url=assetUrl(data.hero_image);
  var img=document.getElementById("hero-manageable-image");
  if(url&&img){img.src=url;}
 }).catch(function(){/* Static text remains if JSON is unavailable. */});
 var container=document.getElementById("news-on-home");
 if(!container)return;
 fetchJSON("content/news.json").then(function(data){
  if(!Array.isArray(data))return;
  var posts=data.filter(function(item){return item&&item.published===true&&string(item.title)&&/^[a-z0-9-]+$/.test(string(item.id));});
  posts.sort(function(a,b){return string(b.date).localeCompare(string(a.date));});
  container.replaceChildren();
  if(!posts.length){var info=document.createElement("p");info.textContent="Новые публикации появятся здесь.";container.append(info);return;}
  posts.slice(0,2).forEach(function(post){
   var art=document.createElement("article");
   var date=document.createElement("div");date.className="news-date";date.textContent=string(post.date);art.append(date);
   var h=document.createElement("h3");h.textContent=string(post.title);art.append(h);
   var p=document.createElement("p");p.textContent=string(post.summary);art.append(p);
   var a=document.createElement("a");a.href="news.html#"+encodeURIComponent(post.id);a.textContent="Читать статью ↗";art.append(a);container.append(art);
  });
 }).catch(function(){/* Keep static placeholder. */});
})();