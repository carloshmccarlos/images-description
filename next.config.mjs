/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow R2-hosted images and our local proxy route with query strings
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image-description-image.loveyouall.qzz.io',
        pathname: '/**',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/image',
      },
    ],
  },
};

export default nextConfig;
