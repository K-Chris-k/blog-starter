import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // 全站安全响应头 —— 每个页面和 API 响应都会自动附带
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        // 禁止被 iframe 嵌入（防止点击劫持攻击）
        { key: "X-Frame-Options", value: "DENY" },
        // 禁止浏览器猜测文件类型（防止 MIME 类型混淆攻击）
        { key: "X-Content-Type-Options", value: "nosniff" },
        // 启用 XSS 过滤器
        { key: "X-XSS-Protection", value: "1; mode=block" },
        // 控制 Referer 泄露范围：只发送同源 referer
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // 禁止浏览器使用摄像头、麦克风、地理位置等敏感 API
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        // 强制 HTTPS（部署到生产环境后启用）
        // { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      ],
    },
    {
      // 禁止访问 private-assets 目录（即使 Nginx 配置错误也能兜底）
      source: "/private-assets/:path*",
      headers: [
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    },
  ],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
