import { CONTENTFUL } from "./contentful-config.js";

function baseUrl() {
  return `https://cdn.contentful.com/spaces/${CONTENTFUL.SPACE_ID}/environments/${CONTENTFUL.ENVIRONMENT_ID}`;
}

async function contentfulFetch(pathWithQuery) {
  const url = `${baseUrl()}${pathWithQuery}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${CONTENTFUL.ACCESS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Contentful HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchPosts({ limit, order = "-fields.publishedDate", include = 2 } = {}) {
  const qs = new URLSearchParams({
    content_type: CONTENTFUL.CONTENT_TYPE,
    order,
    include: String(include),
  });
  if (limit) qs.set("limit", String(limit));
  return contentfulFetch(`/entries?${qs.toString()}`);
}

export async function fetchPostBySlug(slug, { include = 2 } = {}) {
  const qs = new URLSearchParams({
    content_type: CONTENTFUL.CONTENT_TYPE,
    "fields.slug": slug,
    include: String(include),
    limit: "1",
  });
  const data = await contentfulFetch(`/entries?${qs.toString()}`);
  return (data.items && data.items[0]) || null;
}

export function formatIsoDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export function calculateReadingTime(richTextDocument) {
  if (!richTextDocument || !richTextDocument.content) return "1 min read";
  let wordCount = 0;
  function countWordsInNode(node) {
    if (node.nodeType === "text" && node.value) {
      wordCount += node.value.trim().split(/\s+/).filter(Boolean).length;
    }
    if (node.content && Array.isArray(node.content)) node.content.forEach(countWordsInNode);
  }
  richTextDocument.content.forEach(countWordsInNode);
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
}
