// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // สั่งให้ Export เป็น Static HTML
  basePath: '/elabram-workspace', // ต้องตรงกับชื่อ Repository ของคุณ
  images: {
    unoptimized: true, // GitHub Pages ไม่รองรับระบบแต่งรูปอัตโนมัติของ Next.js
  },
};

export default nextConfig;
