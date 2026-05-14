// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/elabram-workspace', // ต้องตรงกับชื่อ Repository ของคุณ
  images: {
    unoptimized: true, // GitHub Pages ไม่รองรับระบบแต่งรูปอัตโนมัติของ Next.js
  },
};

export default nextConfig;
