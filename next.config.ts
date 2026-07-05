import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // SQLite(prisma/dev.db) 쓰기가 dev 파일 감시에 걸려 Fast Refresh를 유발하지 않도록 제외.
      // (퀴즈 답 저장 → 서버 컴포넌트 재렌더 → 진행 중 세션이 섞이던 문제의 원인)
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules/**", "**/prisma/*.db*", "**/.git/**"],
      };
    }
    return config;
  },
};

export default nextConfig;
