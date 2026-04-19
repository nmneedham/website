import { POSTS } from "./posts-data.js";

const list = document.getElementById("blogIndexList");
const loading = document.getElementById("blogIndexLoading");

function sortByDateDesc(a, b) {
  const da = a.date ? Date.parse(a.date) : 0;
  const db = b.date ? Date.parse(b.date) : 0;
  return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
}

function cardFor(p) {
  const article = document.createElement("article");
  article.className = "post-card";
  article.innerHTML = `
    <a href="${p.href}">
      <h3 class="post-title">${p.title}</h3>
    </a>
    <div class="post-meta">
      <span>${p.date || ""}</span> · <span>${p.read || ""}</span>
    </div>
    <p class="post-excerpt">${p.excerpt || ""}</p>
  `;
  return article;
}

(function init(){
  const posts = [...(POSTS || [])].sort(sortByDateDesc);
  if (loading) loading.remove();

  if (!posts.length) {
    const empty = document.createElement("article");
    empty.className = "post-card";
    empty.innerHTML = `<p class="post-excerpt">No posts found.</p>`;
    list.appendChild(empty);
    return;
  }

  posts.forEach((p) => list.appendChild(cardFor(p)));
})();
