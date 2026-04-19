function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTextNode(node) {
  let txt = escapeHtml(node.value || "");
  const marks = node.marks || [];

  for (const m of marks) {
    if (m.type === "bold") txt = `<strong>${txt}</strong>`;
    if (m.type === "italic") txt = `<em>${txt}</em>`;
    if (m.type === "code") txt = `<code>${txt}</code>`;
    if (m.type === "underline") txt = `<u>${txt}</u>`;
  }

  return txt;
}

function renderChildren(node) {
  return (node.content || []).map(renderNode).join("");
}

function renderEmbeddedAsset(node) {
  const target = node?.data?.target;
  const fields = target?.fields || {};
  const file = fields.file;

  if (!file?.url) return "";

  const title = fields.title || "";
  const description = fields.description || title || "";

  const imageUrl = file.url.startsWith("//")
    ? `https:${file.url}`
    : file.url;

  return `
    <figure class="blog-image">
      <img src="${imageUrl}" alt="${escapeHtml(description)}" loading="lazy" />
      ${description ? `<figcaption>${escapeHtml(description)}</figcaption>` : ""}
    </figure>
  `;
}

function renderNode(node) {
  switch (node.nodeType) {
    case "document":
      return renderChildren(node);

    case "paragraph":
      return `<p>${renderChildren(node)}</p>`;

    case "heading-1":
      return `<h1>${renderChildren(node)}</h1>`;

    case "heading-2":
      return `<h2>${renderChildren(node)}</h2>`;

    case "heading-3":
      return `<h3>${renderChildren(node)}</h3>`;

    case "heading-4":
      return `<h4>${renderChildren(node)}</h4>`;

    case "unordered-list":
      return `<ul>${renderChildren(node)}</ul>`;

    case "ordered-list":
      return `<ol>${renderChildren(node)}</ol>`;

    case "list-item":
      return `<li>${renderChildren(node)}</li>`;

    case "blockquote":
      return `<blockquote>${renderChildren(node)}</blockquote>`;

    case "hr":
      return "<hr />";

    case "hyperlink": {
      const href = escapeHtml(node.data?.uri || "#");
      return `<a href="${href}" target="_blank" rel="noreferrer">${renderChildren(node)}</a>`;
    }

    case "embedded-asset-block":
      return renderEmbeddedAsset(node);

    case "text":
      return renderTextNode(node);

    default:
      return renderChildren(node);
  }
}

export function renderRichTextToHtml(doc) {
  if (!doc) return "";
  return renderNode(doc);
}