/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  // Standalone output for resource-efficient container image on Hostinger KVM 1 VPS (1-2GB RAM)
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  // Allow HMR from LAN/network IPs during development
  allowedDevOrigins: ["192.168.56.1", "192.168.1.0/24"],
};

export default nextConfig;
