---
title: "Example new post"
date: "2026-04-19"
excerpt: "This is a sample Markdown post showing how future posts can be added without touching any JavaScript manifests."
slug: "example-new-post"
tags:
  - example
  - markdown
---

This is an example of what a **future post** looks like in the new setup.

You add a single Markdown file to the `/posts` folder, run the build step, and the site generates:

- the homepage latest posts list
- the full `/blog/` index
- the static post page
- the RSS feed

## Images are simple

Just point at a normal image path:

![Example image](/assets/Image/favicon.ico)

## Code blocks work too

```bash
npm run build
```

No Contentful fetches. No manual post manifest. The post file becomes the source of truth.
