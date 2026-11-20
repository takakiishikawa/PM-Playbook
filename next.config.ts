import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 実行時に content/ を読むルートに、ファイルを確実に含める
  outputFileTracingIncludes: {
    "/templates/[id]": ["./content/templates/**/*"],
  },
  transpilePackages: ["@atlaskit/icon"],
  // 図は内容が変わったらファイル名を変える前提で、ブラウザに長く持たせる（ログインが必要なので private）
  async headers() {
    return [{ source: "/figures/:path*", headers: [{ key: "Cache-Control", value: "private, max-age=2592000, immutable" }] }];
  },
};

export default nextConfig;
