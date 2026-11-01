import Link from 'next/link';
import { productRepo } from '@/lib/shared';

const guides = [
  { title: 'Quickstart', href: '/docs/quickstart', text: 'Run CodeOtter locally with Node 22 and pnpm.' },
  { title: 'Docker', href: '/docs/docker-quickstart', text: 'One-click VPS install, Compose and automatic updates.' },
  { title: 'Model providers', href: '/docs/byok-config', text: 'Bring your own Claude, OpenAI, MiniMax or OpenRouter key.' },
  { title: 'Offline mode', href: '/docs/local-gguf-sidecar', text: 'Local GGUF models with zero outbound traffic.' },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 md:py-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" width={64} height={64} className="mb-6" />
      <h1 className="mb-4 text-center text-3xl font-bold md:text-4xl">CodeOtter Documentation</h1>
      <p className="mb-8 max-w-xl text-center text-fd-muted-foreground">
        Set up the self-hosted AI pull request reviewer: deploy it, connect a model, and gate merges with calibrated
        scores.
      </p>
      <div className="mb-12 flex flex-wrap justify-center gap-3">
        <Link
          href="/docs"
          className="rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
        >
          Read the docs
        </Link>
        <a href={productRepo} className="rounded-md border px-4 py-2 text-sm font-medium">
          GitHub
        </a>
      </div>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <Link
            key={g.href}
            href={g.href}
            className="rounded-lg border bg-fd-card p-4 transition-colors hover:bg-fd-accent"
          >
            <p className="mb-1 font-medium">{g.title}</p>
            <p className="text-sm text-fd-muted-foreground">{g.text}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
