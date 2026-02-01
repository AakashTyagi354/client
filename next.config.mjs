/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'delma-ecom-product-images.s3.amazonaws.com',
        port: '',
        pathname: '/**', // This allows all images from this bucket
      },
    ],
  },
};

export default nextConfig;
