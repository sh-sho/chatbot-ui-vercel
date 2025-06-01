/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // output: "export",
  images: {
    domains: ["cdn.builder.io"],
  },
};

export default nextConfig;
