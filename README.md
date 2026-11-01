# CodeOtter Docs

Source for [docs.codeotter.io](https://docs.codeotter.io), the documentation for
[CodeOtter](https://github.com/dharmeshgurnani/CodeOtter), the self-hosted AI pull request reviewer.

Built with [Fumadocs](https://fumadocs.dev) (Next.js, Fumadocs MDX) as a
[static export](https://nextjs.org/docs/app/guides/static-exports), served from Cloudflare Workers static assets.

## Writing docs

Pages are MDX files in [`content/docs`](content/docs). Sidebar order and section headings are in
[`content/docs/meta.json`](content/docs/meta.json). Images go in `public/images`.

```bash
npm install
npm run dev        # http://localhost:3000
```

Every page has an **Edit on GitHub** link, and pull requests are welcome. Keep the existing slugs stable:
`codeotter.io/docs/*` redirects here by slug.

## Checks

```bash
npm run lint
npm run types:check
npm run build      # writes the static site to out/
```

CI runs all three on every pull request.

## Deploy

Pushes to `main` deploy through Cloudflare Workers Builds (build command `npm run build`, deploy command
`npx wrangler deploy`). [`wrangler.jsonc`](wrangler.jsonc) uploads `out/` and binds the `docs.codeotter.io`
custom domain. To deploy by hand:

```bash
npm run build && npm run deploy
```

## Project layout

| Path | Purpose |
| --- | --- |
| `content/docs` | Documentation pages (MDX) |
| `app/(home)` | Landing page |
| `app/docs` | Docs layout and page renderer |
| `app/api/search/route.ts` | Static Orama search index |
| `app/llms.txt`, `app/llms-full.txt`, `app/llms.mdx` | Markdown versions of the docs for LLMs |
| `app/og` | Generated Open Graph images |
| `lib/shared.ts` | Site name, URLs and GitHub repositories |
| `lib/layout.shared.tsx` | Navigation shared by all layouts |
