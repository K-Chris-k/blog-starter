/**
 * 后台侧边栏导航组件 —— 左侧固定 240px 宽度
 *
 * 包含：8 个导航项（仪表盘、错误日志、文件管理等）、用户信息、退出按钮
 * 当前页面高亮显示，通过 usePathname 判断
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "./admin-guard";

/** NAV_ITEMS: 侧边栏导航菜单配置 */
const NAV_ITEMS = [
  { href: "/ir-dashboard", label: "仪表盘", icon: "📊" },
  { href: "/ir-dashboard/error-logs", label: "错误日志", icon: "🐛" },
  { href: "/ir-dashboard/files", label: "文件管理", icon: "📁" },
  { href: "/ir-dashboard/downloads", label: "下载记录", icon: "📥" },
  { href: "/ir-dashboard/subscriptions", label: "邮件订阅", icon: "📧" },
  { href: "/ir-dashboard/rss", label: "RSS 订阅", icon: "📡" },
  { href: "/ir-dashboard/contacts", label: "投资者联系", icon: "💬" },
  { href: "/ir-dashboard/accounts", label: "账户管理", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAdmin();

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col min-h-screen fixed left-0 top-0">
      <div className="px-5 py-6 border-b border-gray-700">
        <h2 className="text-lg font-bold">后台管理</h2>
        <p className="text-xs text-gray-400 mt-1">Tenways IR 管理系统</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            退出
          </button>
        </div>
      </div>
    </aside>
  );
}
