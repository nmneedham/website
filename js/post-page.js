import { fetchPostBySlug, formatIsoDate, calculateReadingTime } from "./contentful-api.js";
import { renderRichTextToHtml } from "./richtext-renderer.js";

const titleEl = document.getElementById("postTitle");
const metaEl = document.getElementById("postMeta");
const bodyEl = document.getElementById("postBody");
const catEl = document.getElementById("postCategory");

function getSlug() {
  const url = new URL(window.location.href);
  return url.searchParams.get("slug");
}

(async function init(){
  const slug = getSlug();
  if (!slug) {
    titleEl.textContent = "Missing slug";
    metaEl.textContent = "No slug provided.";
    return;
  }

  try {
    const item = await fetchPostBySlug(slug, { include: 2 });
    if (!item) {
      titleEl.textContent = "Post not found";
      metaEl.textContent = `No post found for slug: ${slug}`;
      return;
    }

    const f = item.fields || {};
    const title = f.title || "Untitled";
    const dateIso = f.publishedDate || item.sys?.createdAt;
    const date = formatIsoDate(dateIso);
    const read = calculateReadingTime(f.content);

    document.title = `${title} — Nick Needham`;

    titleEl.textContent = title;
    catEl.textContent = (f.category || "blog").toString();
    metaEl.innerHTML = `<span>${date}</span> · <span>${read}</span>`;

    bodyEl.innerHTML = renderRichTextToHtml(f.content);
  } catch (e) {
    console.error(e);
    titleEl.textContent = "Error loading post";
    metaEl.textContent = "Check console for details.";
  }
})();
