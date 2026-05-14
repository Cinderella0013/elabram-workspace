// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // สำคัญ: เพื่อให้ build ออกมาเป็นไฟล์ static
  basePath: '/elabram-workspace', // ใส่ชื่อ repo ของคุณ
  images: {
    unoptimized: true, // GitHub Pages ไม่รองรับ Image Optimization ของ Next.js
  },
};

export default nextConfig;
