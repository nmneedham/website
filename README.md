# Nick Needham Site (Static + Contentful)

This bundle includes:
- Focusrite-inspired layout (IBM Plex Sans)
- Dark mode toggle
- Home page + Blog index + Blog post page
- Contentful CDA fetch for post lists and post-by-slug
- Rich Text renderer (no extra SDK)
- RSS generator script (run locally and commit rss.xml)

## Configure Contentful
Edit: `/js/contentful-config.js`

Set:
- SPACE_ID
- ACCESS_TOKEN (Content Delivery API token)

Assumed Contentful fields for `blogPost`:
- title
- slug
- publishedDate
- category (optional)
- excerpt (optional)
- content (Rich Text)

## RSS Generation
```bash
npm install
CONTENTFUL_SPACE_ID="..." CONTENTFUL_DELIVERY_TOKEN="..." SITE_URL="https://nmneedham.dev" npm run rss
```

## Local testing
Use a simple static server (ES modules):
```bash
python -m http.server 8080
```


## RSS includes static posts
The RSS generator merges your `/blog/static/*.html` posts with Contentful posts (if configured).
