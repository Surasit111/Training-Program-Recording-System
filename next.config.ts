import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // อนุญาตให้ Image Optimization ใช้ไฟล์ local จากโฟลเดอร์ uploads
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
    // อนุญาตให้โหลดรูปจาก remote hosts
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "10.190.7.42",
        port: "81",
        pathname: "/api/uploads/**",
      },
    ],
  },
};

export default nextConfig;

