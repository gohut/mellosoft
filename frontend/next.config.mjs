/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  // Allow HMR from LAN/network IPs during development
  allowedDevOrigins: ["192.168.56.1", "192.168.1.0/24"],
};

export default nextConfig;
