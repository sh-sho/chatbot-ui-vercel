/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["cdn.builder.io"],
  },
};

export default nextConfig;
