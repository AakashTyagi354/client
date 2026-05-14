/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "delma-product-images.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "delma-patient-documents.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;