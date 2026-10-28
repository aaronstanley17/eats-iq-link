# Profile link site

The page behind `https://link.refluxiqapp.com/u/<username>`, the links the app's
"Share profile" button sends (`lib/share-profile.ts`).

- `404.html`: GitHub Pages serves it for every `/u/<username>` address. It names the
  person and offers "Open in Eats IQ" (`gerdapp://u/<username>`) or "Get Eats IQ".
  `index.html` is an identical copy.
- `.well-known/apple-app-site-association`: lets iOS open these links straight in the
  app (Universal Links), once a build ships with `associatedDomains` in `app.json`.
- `.nojekyll`: without it, GitHub Pages hides the `.well-known` folder.
- `CNAME`: the custom domain.

Publish it as its own GitHub Pages repo, then add a DNS record in Squarespace:
CNAME, host `link`, value `aaronstanley17.github.io`.
