import { writeFile, readFile } from "node:fs/promises";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ENV_ID = process.env.CONTENTFUL_ENVIRONMENT || "master";
const TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN;
const SITE_URL = process.env.SITE_URL || "https://nmneedham.dev";

async function fetchContentfulPosts() {
  if (!SPACE_ID || !TOKEN) return { items: [] };

  const qs = new URLSearchParams({
    content_type: "blogPost",
    order: "-fields.publishedDate",
    limit: "50",
  });

  const url = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENV_ID}/entries?${qs}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function escapeXml(s = "") {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toUtcString(dateLike) {
  const d = dateLike ? new Date(dateLike) : new Date();
  return d.toUTCString();
}

function parseIsoOrZero(s) {
  const t = s ? Date.parse(s) : NaN;
  return Number.isFinite(t) ? t : 0;
}

function buildItem({ title, link, pubDate, description }) {
  return `
    <item>
      <title>${escapeXml(title || "Untitled")}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <description>${escapeXml(description || "")}</description>
    </item>`;
}

(async () => {
  const staticRaw = await readFile(new URL("./static-posts.json", import.meta.url), "utf8");
  const staticPosts = JSON.parse(staticRaw);

  const contentful = await fetchContentfulPosts();
  const items = contentful.items || [];

  const merged = [];

  for (const p of staticPosts) {
    const link = `${SITE_URL}/blog/static/${encodeURIComponent(p.slug)}.html`;
    merged.push({
      dateSort: parseIsoOrZero(p.date),
      xml: buildItem({
        title: p.title,
        link,
        pubDate: toUtcString(p.date || undefined),
        description: p.excerpt || "",
      }),
    });
  }

  for (const it of items) {
    const f = it.fields || {};
    const slug = encodeURIComponent(f.slug || it.sys.id);
    const link = `${SITE_URL}/blog/post.html?slug=${slug}`;
    const pub = f.publishedDate || it.sys.createdAt;
    merged.push({
      dateSort: parseIsoOrZero(pub),
      xml: buildItem({
        title: f.title || "Untitled",
        link,
        pubDate: toUtcString(pub),
        description: f.excerpt || "",
      }),
    });
  }

  merged.sort((a, b) => b.dateSort - a.dateSort);
  const rssItems = merged.map((x) => x.xml).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Nick Needham — Blog</title>
    <link>${SITE_URL}/</link>
    <description>Notes, build logs, and development work by Nick Needham.</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>
`;

  await writeFile(new URL("../rss.xml", import.meta.url), rss, "utf8");
  console.log(\`Wrote rss.xml with \${merged.length} items (\${staticPosts.length} static, \${items.length} contentful)\`);
})();
