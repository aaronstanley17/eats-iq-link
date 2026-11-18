// Cloudflare Pages Function: puts the person's or Topic's name into the link preview.
//
// iMessage, WhatsApp, etc. read the page's <meta property="og:..."> tags without running its
// JavaScript, so index.html alone can only say "Join me on Eats IQ". For /u/<username> and
// /t/<topicId>?n=<name> this rewrites those tags on the way out. It runs only for /u/* and
// /t/* (see _routes.json); every other address is served as a plain static file.
//
// The name comes from the link itself (the site has no database access), so anyone can
// type any name into a link. It is cleaned and length-capped below, and only ever written
// as text (never as HTML), so a link cannot inject markup or script into the page.

const ORIGIN = 'https://link.refluxiqapp.com';
const USERNAME_MAX = 30; // profiles_username_size (0071)
const TOPIC_MAX = 60; // Topic names allow 100 (0071); a preview title wants less

/** Decodes and tidies a name from the URL: no control or markup characters, single spaces, capped. */
function cleanName(raw, max) {
  if (!raw) return '';
  let s;
  try {
    s = decodeURIComponent(raw);
  } catch {
    s = raw;
  }
  s = s
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁦-⁩]/g, '') // control + bidi tricks
    .replace(/[<>"`]/g, '')
    .replace(/&/g, 'and')
    .replace(/\s+/g, ' ')
    .trim();
  const chars = Array.from(s); // count emoji as one character
  return chars.length > max ? chars.slice(0, max - 1).join('').trimEnd() + '…' : s;
}

/** Sets a <meta> tag's content attribute. */
class SetContent {
  constructor(value) {
    this.value = value;
  }
  element(el) {
    el.setAttribute('content', this.value);
  }
}

/** Replaces an element's text (escaped as text, never parsed as HTML). */
class SetText {
  constructor(value) {
    this.value = value;
  }
  element(el) {
    el.setInnerContent(this.value);
  }
}

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const profile = url.pathname.match(/^\/u\/([^/]+)\/?$/);
  const topic = url.pathname.match(/^\/t\/([^/]+)\/?$/);

  let title = '';
  let description = '';
  let canonical = '';
  if (profile) {
    const name = cleanName(profile[1], USERNAME_MAX);
    if (name) {
      title = `${name} is on Eats IQ`;
      description = `See what ${name} is eating and how it scores. Open the app to follow along.`;
      canonical = ORIGIN + url.pathname;
    }
  } else if (topic) {
    const name = cleanName(url.searchParams.get('n'), TOPIC_MAX);
    if (name) {
      title = `Join ${name} on Eats IQ`;
      description = 'A community sharing the meals that work for them. Open the app to see their posts.';
      canonical = ORIGIN + url.pathname;
    }
  }

  // The one page that answers every link, with HTTP 200.
  const page = await env.ASSETS.fetch(new URL('/', url));
  const headers = new Headers(page.headers);
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) headers.set(k, v);
  const base = new Response(page.body, { status: 200, headers });
  if (!title) return base;

  return new HTMLRewriter()
    .on('title', new SetText(title))
    .on('meta[property="og:title"]', new SetContent(title))
    .on('meta[property="og:description"]', new SetContent(description))
    .on('meta[name="description"]', new SetContent(description))
    .on('meta[property="og:url"]', new SetContent(canonical))
    .transform(base);
}
