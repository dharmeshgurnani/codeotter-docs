import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'CodeOtter';
export const siteUrl = 'https://docs.codeotter.io';
export const websiteUrl = 'https://codeotter.io';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// The product repository (header GitHub link).
export const productRepo = 'https://github.com/dharmeshgurnani/CodeOtter';

// This docs repository ("Edit on GitHub" links).
export const gitConfig = {
  user: 'dharmeshgurnani',
  repo: 'codeotter-docs',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
