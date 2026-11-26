import { getPageUrl, productRepo, websiteUrl } from './shared';

const founderUrl = 'https://github.com/dharmeshgurnani';

// Emitted on every docs page, next to that page's TechArticle.
export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CodeOtter',
  alternateName: ['Code Otter'],
  url: websiteUrl,
  logo: `${websiteUrl}/assets/android-chrome-512x512.png`,
  founder: {
    '@type': 'Person',
    name: 'Dharmesh Gurnani',
    url: founderUrl,
    sameAs: [founderUrl],
  },
  sameAs: [productRepo, founderUrl],
};

// No datePublished / dateModified: the MDX frontmatter carries no dates, so any
// value here would be invented.
export function getTechArticleJsonLd(page: {
  url: string;
  data: { title: string; description?: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.data.title,
    description: page.data.description,
    url: getPageUrl(page),
    author: {
      '@type': 'Person',
      name: 'Dharmesh Gurnani',
      url: founderUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CodeOtter',
      url: websiteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${websiteUrl}/assets/codeotter-icon.svg`,
        width: 512,
        height: 512,
      },
    },
  };
}
