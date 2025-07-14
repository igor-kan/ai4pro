/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/ai4pro', // Replace with your repository name
  output: 'export', // Enables static HTML export for GitHub Pages
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
