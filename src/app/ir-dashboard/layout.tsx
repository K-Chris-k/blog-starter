/**
 * 后台管理根布局 —— ir-dashboard 模块的最外层 Layout
 *
 * 职责：
 *   - 设置 html lang="zh-CN"，后台固定中文
 *   - 引入 AdminGuard 认证保护，未登录自动跳转到登录页
 *   - 不走国际化（next-intl），与前台 [locale] 完全独立
 */
import { Inter } from "next/font/google";
import AdminGuard from "./_components/admin-guard";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "后台管理 - Tenways IR",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <AdminGuard>{children}</AdminGuard>
      </body>
    </html>
  );
}
