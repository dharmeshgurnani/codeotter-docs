import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, productRepo, websiteUrl } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={24} height={24} />
          <span className="font-semibold">{appName} Docs</span>
        </>
      ),
    },
    githubUrl: productRepo,
    links: [
      { text: 'Website', url: websiteUrl, external: true },
      { text: 'Blog', url: `${websiteUrl}/blog/`, external: true },
    ],
  };
}
