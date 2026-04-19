import { fetchPosts, formatIsoDate, calculateReadingTime } from "./contentful-api.js";
import { STATIC_POSTS } from "./static-posts.js";

const list = document.getElementById("homePostList");
const loading = document.getElementById("homePostsLoading");

function normalizeContentful(item) {
  const f = item.fields || {};
  const title = f.title || "Untitled";
  const slug = f.slug || item.sys?.id;
  const dateIso = f.publishedDate || item.sys?.createdAt;
  const date = formatIsoDate(dateIso);
  const read = calculateReadingTime(f.content);
  const href = `blog/post.html?slug=${encodeURIComponent(slug)}`;
  return { title, href, date, read, excerpt: f.excerpt || "No excerpt yet." };
}

function normalizeStatic(p) {
  return { 
    title: p.title, 
    href: `blog/static/${encodeURIComponent(p.slug)}.html`, 
    date: p.date || "", 
    read: "static", 
    excerpt: p.excerpt || "" 
  };
}

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
      <span>${p.date || ""}</span> · <span>${p.read}</span>
    </div>
    <p class="post-excerpt">${p.excerpt || ""}</p>
  `;
  return article;
}

(async function init() {
  const out = [];

  try { (STATIC_POSTS || []).forEach(p => out.push(normalizeStatic(p))); }
  catch (e) { console.error("Failed to load static posts:", e); }

  try {
    const data = await fetchPosts({ limit: 12, order: "-fields.publishedDate", include: 2 });
    (data.items || []).forEach(it => out.push(normalizeContentful(it)));
  } catch (e) {
    console.warn("Contentful not loaded (OK if not configured):", e);
  }

  out.sort(sortByDateDesc);
  const top = out.slice(0, 6);

  if (loading) loading.remove();
  if (!top.length) {
    const empty = document.createElement("article");
    empty.className = "post-card";
    empty.innerHTML = `<p class="post-excerpt">No posts found.</p>`;
    list.appendChild(empty);
    return;
  }

  top.forEach(p => list.appendChild(cardFor(p)));
})();
