# Nick Needham Site (Markdown + Generated Posts)

This version switches the blog away from Contentful/manual post manifests.

## How it works
- Write posts in `/posts/*.md`
- Run:

```bash
npm install
npm run build
```

That single build step generates:
- `blog/posts/*.html`
- `js/posts-data.js`
- `rss.xml`

The homepage and `/blog/` index read from the generated `js/posts-data.js`, so new posts automatically show up in the list after a build.

## Writing a post

Create a file like:

```md
---
title: "My New Post"
date: "2026-04-19"
excerpt: "Quick summary for cards and RSS."
slug: "my-new-post"
tags:
  - hardware
  - blog
---

# Heading

Post content here.

![Image alt](/assets/Image/example.jpg)
```

## Deploy flow
Before pushing/deploying, run:

```bash
npm run build
```

Then commit the generated files and deploy.

## Migrated Contentful-era posts
Three older posts that had been living in the public Contentful-backed blog were migrated into `/posts` so they stay in the generated blog even after Contentful is removed.
