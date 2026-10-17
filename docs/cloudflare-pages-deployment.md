# Cloudflare Pages deployment and indexing

Project: datacenter-twin-lab. Account: 6aeaea77d967e029f75b0f66107c507b.
Production: https://khanlab.co.technology/ . Production branch: main.

This project uses Direct Upload. Git pushes alone do not deploy it. Keep the
existing Pages project; use the validated build and pinned Wrangler 4.149.0.

## Build

From the repository root in PowerShell:

```powershell
.\.venv\Scripts\python.exe scripts\prepare_browser_demo.py
$env:VITE_PUBLIC_SOURCE_REVISION = (git rev-parse HEAD).Trim()
npm.cmd --prefix apps/web run build:demo
```

Run the search-page checks before deploying:

```powershell
cd apps/web
npx.cmd playwright test --config playwright.demo.config.ts search-pages.spec.ts
```

## Deploy

Authenticated Wrangler:

```powershell
node .local/deployment-tools/node_modules/wrangler/bin/wrangler.js login
python C:\Users\MRK\Documents\misce\deploy_khanlab_pages.py --site-dir .local/browser-demo-site
```

For a Pages Edit API token, set CLOUDFLARE_API_TOKEN securely in the process
environment or use the hidden prompt (never paste it into chat):

```powershell
python C:\Users\MRK\Documents\misce\deploy_khanlab_pages.py --prompt-token --site-dir .local/browser-demo-site
```

The API path gets the short-lived token using GET, uploads assets, submits
multipart manifest plus _headers and _redirects, and polls deployment completion.
Do not substitute JSON for the multipart deployment request. Do not blindly
retry an ambiguous creation timeout; inspect deployment history first.

For Dashboard upload, select the complete validated site folder, including
_headers, _redirects and 404.html. The original outputs/releases/v2.0.0/site
folder is a historical build, not automatically refreshed by the build command.

## Robots and Search Console

A separate ecosystem-robots-policy Worker owns the exact custom-domain route
khanlab.co.technology/robots.txt. Pages uploads do not replace this response.
Its current policy permits crawling. Local source and generated robots files
also permit crawling, so Google can see canonical and noindex directives.

Do not block /404 or query-string variants just to remove them from indexing
reports. Keep genuine missing pages as HTTP 404. The dedicated 404 template
has noindex and is excluded from the sitemap. An intentional noindex exclusion
or alternate URL with the correct canonical does not need a fix.

After a successful deployment, use the authenticated Search Console property:
- Submit https://khanlab.co.technology/sitemap.xml.
- Inspect affected real pages and compare user-declared and Google-selected
  canonicals. Request indexing of corrected canonical pages where appropriate.
- Validate duplicate-canonical or unintended 404 issues only after reviewing
  their affected URLs. Do not validate all exclusions indiscriminately.
- Use the robots.txt report and live URL inspection for actual affected pages
  to confirm crawl access. Indexing reports can lag deployment and recrawling.

References:
https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
https://developers.google.com/search/docs/crawling-indexing/block-indexing
https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
