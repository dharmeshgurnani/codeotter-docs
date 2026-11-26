import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { getPageUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...source.getPages().map((page) => ({
      url: getPageUrl(page),
      changeFrequency: 'weekly' as const,
      priority: page.url === '/docs' ? 1 : 0.8,
    })),
  ];
}
