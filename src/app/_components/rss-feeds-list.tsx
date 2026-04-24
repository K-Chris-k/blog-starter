/**
 * RSS 订阅列表组件 —— 展示三种 RSS Feed 的订阅卡片
 * 每张卡片显示 Feed 类型名称、描述、订阅按钮和复制链接按钮
 */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const FEEDS = [
  { type: "announcements", titleKey: "announcements", descKey: "announcementsDesc" },
  { type: "news", titleKey: "news", descKey: "newsDesc" },
  { type: "financial", titleKey: "financial", descKey: "financialDesc" },
] as const;

export function RSSFeedsList() {
  const t = useTranslations("RSSFeeds");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyLink = async (type: string) => {
    const url = `${window.location.origin}/api/rss/${type}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <div className="space-y-6">
      {FEEDS.map((feed) => (
        <div
          key={feed.type}
          className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start gap-4">
            {/* RSS icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold dark:text-slate-200">
                {t(feed.titleKey)}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {t(feed.descKey)}
              </p>

              <div className="flex gap-3 mt-4">
                <a
                  href={`/api/rss/${feed.type}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                  {t("subscribe")}
                </a>

                <button
                  onClick={() => copyLink(feed.type)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copiedType === feed.type ? t("copied") : t("copyLink")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
