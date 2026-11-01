import { redirect } from 'next/navigation';

// Production redirects / at the edge (public/_redirects); this covers next dev.
export default function Home() {
  redirect('/docs');
}
