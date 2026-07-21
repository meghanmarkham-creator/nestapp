/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The design-handoff prototype bundle lives alongside the app for reference;
  // it is not part of the build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
