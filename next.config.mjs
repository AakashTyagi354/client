/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
      },
      {
        hostname: "firebasestorage.googleapis.com",
      },
      {
        hostname: "randomuser.me",
      },
      {
        hostname: "doc-app-7im8.onrender.com",
      },
    ],
  },
};

export default nextConfig;
