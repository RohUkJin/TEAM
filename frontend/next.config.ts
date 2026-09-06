import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker 이미지에 필요한 최소 산출물만 포함
  output: "standalone",
};

export default nextConfig;
