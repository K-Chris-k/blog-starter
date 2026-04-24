/**
 *
 * 四个图标按钮：
 *   1. Print Page → 调用浏览器打印
 *   2. Email Alerts → 跳转邮件订阅页面
 *   3. RSS Feeds → 跳转 RSS 订阅页面
 *   4. IR Contacts → 跳转投资者联系页面
 */
"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function FooterToolbar() {
  const t = useTranslations("FooterToolbar");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-5">
        <div className="py-10 flex justify-center items-center gap-12 md:gap-20">
          {/* Print Page */}
          <button
            onClick={handlePrint}
            className="flex flex-col items-center gap-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">{t("printPage")}</span>
          </button>

          {/* Email Alerts */}
          <Link
            href="/email-alerts"
            className="flex flex-col items-center gap-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">{t("emailAlerts")}</span>
          </Link>

          {/* RSS Feeds */}
          <Link
            href="/rss-feeds"
            className="flex flex-col items-center gap-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">{t("rssFeeds")}</span>
          </Link>

          {/* IR Contacts */}
          <Link
            href="/ir-contacts"
            className="flex flex-col items-center gap-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors group"
          >
            <div className="w-14 h-14 rounded-full border-2 border-neutral-300 dark:border-neutral-600 flex items-center justify-center group-hover:border-neutral-500 dark:group-hover:border-neutral-400 transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">{t("irContacts")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
