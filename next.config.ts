import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 実行時に content/ を読むルートに、ファイルを確実に含める
  outputFileTracingIncludes: {
    "/api/search": ["./content/**/*"],
    "/templates/[id]": ["./content/templates/**/*"],
  },
  transpilePackages: ["@atlaskit/icon"],
};

export default nextConfig;
