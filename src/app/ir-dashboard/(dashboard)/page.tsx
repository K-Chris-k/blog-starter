/**
 * 后台仪表盘首页 —— /ir-dashboard
 *
 * 功能：从 /api/ir-dashboard/stats 获取各表统计数据，
 * 以卡片形式展示（错误日志数、文件数、下载数、订阅数等），
 * 点击卡片跳转到对应的管理页面
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  error_logs: number;
  file_registry: number;
  download_logs: number;
  email_subscriptions: { total: number; active: number };
  rss_feeds: number;
  ir_contact_messages: { total: number; unread: number };
  admin_accounts: number;
}

const CARDS = [
  {
    key: "error_logs" as const,
    label: "错误日志",
    href: "/ir-dashboard/error-logs",
    icon: "🐛",
    color: "bg-red-50 border-red-200",
  },
  {
    key: "file_registry" as const,
    label: "文件管理",
    href: "/ir-dashboard/files",
    icon: "📁",
    color: "bg-blue-50 border-blue-200",
  },
  {
    key: "download_logs" as const,
    label: "下载记录",
    href: "/ir-dashboard/downloads",
    icon: "📥",
    color: "bg-green-50 border-green-200",
  },
  {
    key: "email_subscriptions" as const,
    label: "邮件订阅",
    href: "/ir-dashboard/subscriptions",
    icon: "📧",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    key: "rss_feeds" as const,
    label: "RSS 订阅",
    href: "/ir-dashboard/rss",
    icon: "📡",
    color: "bg-purple-50 border-purple-200",
  },
  {
    key: "ir_contact_messages" as const,
    label: "投资者联系",
    href: "/ir-dashboard/contacts",
    icon: "💬",
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    key: "admin_accounts" as const,
    label: "账户管理",
    href: "/ir-dashboard/accounts",
    icon: "👤",
    color: "bg-gray-100 border-gray-200",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/ir-dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const getCount = (key: string) => {
    if (!stats) return "—";
    const val = stats[key as keyof Stats];
    if (typeof val === "number") return val;
    if (typeof val === "object" && val !== null) return val.total;
    return "—";
  };

  const getSubtext = (key: string) => {
    if (!stats) return "";
    if (key === "email_subscriptions") {
      const v = stats.email_subscriptions;
      return `${v.active} 个活跃`;
    }
    if (key === "ir_contact_messages") {
      const v = stats.ir_contact_messages;
      return v.unread > 0 ? `${v.unread} 条未读` : "全部已读";
    }
    return "";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={`block rounded-xl border p-5 transition-shadow hover:shadow-md ${card.color}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{getCount(card.key)}</p>
                {getSubtext(card.key) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getSubtext(card.key)}
                  </p>
                )}
              </div>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
