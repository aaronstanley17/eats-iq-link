# Profile link site

The page behind `https://link.refluxiqapp.com/u/<username>`, the links the app's
"Share profile" button sends (`lib/share-profile.ts`), and `/t/<topicId>?n=<name>`, the
links a Topic page's share button sends (`lib/share-topic.ts`).

Hosted on **Cloudflare Pages** (repo `aaronstanley17/eats-iq-link`, no build command,
output directory `/`). It moved off GitHub Pages because GitHub Pages could only answer
`/u/*` and `/t/*` with `404.html` and HTTP 404, and iOS shows no link preview for a 404.

- `index.html`: names the person or Topic and offers "Open in Eats IQ"
  (`gerdapp://u/<username>` / `gerdapp://t/<id>`) or "Get Eats IQ". Its Open Graph tags
  give iMessage and other apps the preview title and the `icon.png` image.
- `_redirects`: rewrites `/u/*` and `/t/*` to `index.html` with HTTP 200 (not a redirect).
- `_headers`: serves `.well-known/apple-app-site-association` as `application/json`.
- `.well-known/apple-app-site-association`: lets iOS open these links straight in the
  app (Universal Links); `app.json` lists `applinks:link.refluxiqapp.com`.
- `404.html`: an identical copy of `index.html`, shown for any other unknown address.
- `CNAME` and `.nojekyll`: leftovers from GitHub Pages; harmless on Cloudflare.

DNS is in Squarespace: CNAME, host `link`, value = the `<project>.pages.dev` address
Cloudflare shows under the project's Custom domains.
