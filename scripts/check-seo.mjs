// Every page listed in sitemap.xml must carry exactly one canonical link equal
// to its sitemap URL, an og:url equal to it, and one TechArticle plus one
// Organization JSON-LD block.
//
//   node scripts/check-seo.mjs [outDir]          built site, default "out"
//   node scripts/check-seo.mjs --live <origin>   deployed site
//
// Prints one "FAIL <url>: <assertion>" line per failure, then a summary. Exits 1
// on any failure.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const FOUNDER_URL = 'https://github.com/dharmeshgurnani';
const CANONICAL = '<link rel="canonical">';
const OG_URL = '<meta property="og:url">';

const SCRIPT = /<script\b((?:"[^"]*"|'[^']*'|[^'">])*)>([\s\S]*?)<\/script\s*>/gi;
const TAG = /<(link|meta)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
const ATTR = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function decodeEntities(text) {
  const fromCode = (match, code) => (code <= 0x10ffff ? String.fromCodePoint(code) : match);
  return text
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) => fromCode(match, parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (match, dec) => fromCode(match, Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// Attribute order and quoting style do not matter; the first duplicate wins, as in browsers.
function parseAttrs(raw) {
  const attrs = new Map();
  for (const match of raw.matchAll(ATTR)) {
    const name = match[1].toLowerCase();
    if (!attrs.has(name)) attrs.set(name, decodeEntities(match[2] ?? match[3] ?? match[4] ?? ''));
  }
  return attrs;
}

function extractSeo(html) {
  const ldBlocks = [];
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(SCRIPT, (_, rawAttrs, body) => {
    const type = (parseAttrs(rawAttrs).get('type') ?? '').trim().toLowerCase();
    if (type === 'application/ld+json') ldBlocks.push(body);
    return '';
  });

  const canonicals = [];
  const ogUrls = [];
  for (const [, tag, rawAttrs] of markup.matchAll(TAG)) {
    const attrs = parseAttrs(rawAttrs);
    if (tag.toLowerCase() === 'link') {
      const rel = (attrs.get('rel') ?? '').toLowerCase().split(/\s+/);
      if (rel.includes('canonical')) canonicals.push(attrs.get('href') ?? '');
    } else if ((attrs.get('property') ?? '').toLowerCase() === 'og:url') {
      ogUrls.push(attrs.get('content') ?? '');
    }
  }
  return { canonicals, ogUrls, ldBlocks };
}

// Top-level JSON-LD nodes of a block, looking inside arrays and @graph.
function ldNodes(value) {
  if (Array.isArray(value)) return value.flatMap(ldNodes);
  if (value === null || typeof value !== 'object') return [];
  const graph = Array.isArray(value['@graph']) ? value['@graph'].flatMap(ldNodes) : [];
  return '@type' in value ? [value, ...graph] : graph;
}

const hasType = (node, type) => [node['@type']].flat().includes(type);

function expectOne(failures, label, values, loc) {
  if (values.length === 0) failures.push(`no ${label}`);
  else if (values.length > 1) failures.push(`${values.length} ${label} tags, expected exactly 1`);
  else if (values[0] !== loc) failures.push(`${label} is "${values[0]}", expected "${loc}"`);
}

function checkPage(loc, html) {
  const failures = [];
  const { canonicals, ogUrls, ldBlocks } = extractSeo(html);

  expectOne(failures, CANONICAL, canonicals, loc);
  expectOne(failures, OG_URL, ogUrls, loc);

  const nodes = [];
  ldBlocks.forEach((body, index) => {
    try {
      nodes.push(...ldNodes(JSON.parse(body)));
    } catch (error) {
      failures.push(`JSON-LD block ${index + 1} is not valid JSON (${error.message})`);
    }
  });

  const articles = nodes.filter((node) => hasType(node, 'TechArticle'));
  if (articles.length !== 1) {
    failures.push(`${articles.length} TechArticle JSON-LD blocks, expected exactly 1`);
  } else {
    const [article] = articles;
    if (typeof article.headline !== 'string' || article.headline.trim() === '') {
      failures.push('TechArticle headline is missing or empty');
    }
    if (article.url !== loc) {
      failures.push(`TechArticle url is "${article.url}", expected "${loc}"`);
    }
    const authorUrls = [article.author].flat().filter((author) => author != null).map((author) => author.url);
    if (authorUrls.length === 0 || authorUrls.some((url) => url !== FOUNDER_URL)) {
      failures.push(`TechArticle author.url is ${JSON.stringify(authorUrls)}, expected "${FOUNDER_URL}"`);
    }
  }

  const organizations = nodes.filter((node) => hasType(node, 'Organization'));
  if (organizations.length !== 1) {
    failures.push(`${organizations.length} Organization JSON-LD blocks, expected exactly 1`);
  }

  return failures;
}

function readBuilt(outDir, pathname) {
  const base = pathname.replace(/\/+$/, '') || '/index';
  for (const candidate of [`${base}.html`, `${base}/index.html`]) {
    const file = join(outDir, candidate);
    if (existsSync(file)) return { text: readFileSync(file, 'utf8') };
  }
  return { error: `page not found in ${outDir} (looked for ${base}.html)` };
}

async function fetchLive(url) {
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30_000) });
    if (response.status !== 200) return { error: `HTTP ${response.status}, expected 200` };
    return { text: await response.text() };
  } catch (error) {
    return { error: `fetch failed (${error.message})` };
  }
}

function usage() {
  console.error('usage: node scripts/check-seo.mjs [outDir] | --live <origin>');
  process.exit(2);
}

async function main() {
  const args = process.argv.slice(2);
  let origin = null;
  let outDir = 'out';
  if (args[0] === '--live') {
    if (args.length !== 2) usage();
    origin = args[1].replace(/\/+$/, '');
  } else if (args.length > 1 || args[0]?.startsWith('-')) {
    usage();
  } else if (args.length === 1) {
    outDir = args[0];
  }

  const sitemapName = origin ? `${origin}/sitemap.xml` : join(outDir, 'sitemap.xml');
  const sitemap = origin
    ? await fetchLive(sitemapName)
    : existsSync(sitemapName)
      ? { text: readFileSync(sitemapName, 'utf8') }
      : { error: 'file not found' };

  let pages = 0;
  let failures = 0;
  const fail = (subject, assertion) => {
    failures += 1;
    console.log(`FAIL ${subject}: ${assertion}`);
  };

  const locs = sitemap.error
    ? []
    : [...sitemap.text.matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map((match) => decodeEntities(match[1]));
  if (sitemap.error) fail(sitemapName, sitemap.error);
  else if (locs.length === 0) fail(sitemapName, 'no <loc> entries');

  for (const loc of locs) {
    pages += 1;
    let pathname;
    try {
      pathname = new URL(loc).pathname;
    } catch {
      fail(loc, 'sitemap <loc> is not a valid URL');
      continue;
    }

    const page = origin ? await fetchLive(loc) : readBuilt(outDir, pathname);
    if (page.error) {
      fail(loc, page.error);
      continue;
    }
    for (const assertion of checkPage(loc, page.text)) fail(loc, assertion);
  }

  console.log(`${pages} pages checked, ${failures} failures`);
  process.exitCode = failures > 0 ? 1 : 0;
}

await main();
