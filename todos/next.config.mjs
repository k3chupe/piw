/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "szandala.github.io",
        pathname: "/piwo-api/**",
      },
    ],
  },
};

export default nextConfig;
