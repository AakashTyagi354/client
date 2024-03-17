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
    ],
  },
 

};

export default nextConfig;
