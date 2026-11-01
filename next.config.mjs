import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  // Static export has no server for /_next/image, so serve image files as-is.
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default withMDX(config);
