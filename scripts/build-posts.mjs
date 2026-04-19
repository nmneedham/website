import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "posts");
const OUTPUT_POSTS_DIR = path.join(ROOT, "blog", "posts");
const POSTS_DATA_PATH = path.join(ROOT, "js", "posts-data.js");
const RSS_PATH = path.join(ROOT, "rss.xml");

const SITE = {
  url: process.env.SITE_URL || "https://nmneedham.dev",
  title: "Nick Needham — Blog",
  description: "Notes, build logs, and development work by Nick Needham.",
  blurb: "Hello, I'm Nick, a student in software development and electronics enthusiast. I enjoy programming and learning new things about electronics. I'm currently learning the Java programming language in school, so this is a blog to follow me on my journey and other projects.",
};

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(s = "") {
  return escapeHtml(s).replaceAll("&#039;", "&apos;");
}

function estimateReadTime(markdown) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_\-\n]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function buildPostHtml(post) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(post.title)} — Nick Needham</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../styles.css" />
  <link rel="alternate" type="application/rss+xml" title="Nick Needham RSS" href="../../rss.xml" />
</head>
<body>
  <div class="page">
    <aside class="sidebar">
      <div class="sidebar-top">
        <a href="../../index.html" class="site-title">Nick Needham</a>
        <nav class="sidebar-nav">
          <a href="../../index.html#work">work</a>
          <a href="../index.html">blog</a>
          <a href="../../index.html#about">about</a>
          <a href="../../rss.xml">rss feed</a>
        </nav>
        <p class="sidebar-desc">${escapeHtml(SITE.blurb)}</p>
      </div>

      <div class="sidebar-bottom">
        <button id="themeToggle" class="theme-toggle" type="button">dark mode</button>
        <div class="social-links">
          <a href="https://github.com/nmneedham" target="_blank" rel="noreferrer">github</a>
          <a href="mailto:you@example.com">email</a>
        </div>
      </div>
    </aside>

    <main class="main">
      <div class="post-wrapper">
        <article class="post-article">
          <header class="post-header">
            <div class="post-kicker">${escapeHtml((post.tags && post.tags[0]) || "blog")}</div>
            <h1 class="post-title-main">${escapeHtml(post.title)}</h1>
            <div class="post-meta-line"><span>${escapeHtml(post.date)}</span> · <span>${escapeHtml(post.read)}</span></div>
          </header>

          <div class="post-body">
            ${post.html}
          </div>

          <footer class="post-footer">
            <a href="../index.html">← Back to all posts</a>
          </footer>
        </article>
      </div>
    </main>
  </div>

  <script src="../../theme.js"></script>
</body>
</html>
`;
}

async function main() {
  await fs.mkdir(OUTPUT_POSTS_DIR, { recursive: true });

  const entries = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".md"));
  const posts = [];

  for (const filename of entries) {
    const filePath = path.join(POSTS_DIR, filename);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = matter(raw);

    const slug = parsed.data.slug || slugify(path.basename(filename, ".md"));
    const title = parsed.data.title || slug;
    const date = parsed.data.date || "1970-01-01";
    const excerpt = parsed.data.excerpt || "";
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
    const read = estimateReadTime(parsed.content);
    const html = marked.parse(parsed.content, { async: false });

    const href = `blog/posts/${slug}.html`;
    const post = { slug, title, date, excerpt, tags, read, href, html };
    posts.push(post);

    await fs.writeFile(path.join(OUTPUT_POSTS_DIR, `${slug}.html`), buildPostHtml(post), "utf8");
  }

  posts.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const postsData = posts.map(({ slug, title, date, excerpt, tags, read, href }) => ({
    slug, title, date, excerpt, tags, read, href
  }));

  await fs.writeFile(
    POSTS_DATA_PATH,
    `export const POSTS = ${JSON.stringify(postsData, null, 2)};\n`,
    "utf8"
  );

  const items = posts.map((post) => {
    const link = `${SITE.url}/blog/posts/${encodeURIComponent(post.slug)}.html`;
    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid>${escapeXml(link)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.title)}</title>
    <link>${escapeXml(SITE.url)}/</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  await fs.writeFile(RSS_PATH, rss, "utf8");

  console.log(`Built ${posts.length} Markdown posts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
