/**
 * 语言切换器组件 —— 显示 EN / NL / IT 按钮，点击切换网站语言
 *
 * 工作原理：
 *   - useLocale() 获取当前语言（如 "en"）
 *   - usePathname() 获取当前页面路径（不含语言前缀，如 "/posts/hello"）
 *   - router.replace(pathname, { locale: "nl" }) 跳转到同一页面的荷兰语版本
 *     即 /en/posts/hello → /nl/posts/hello，页面内容不变，语言切换
 */

"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

/** 各语言的显示标签 */
const localeLabels: Record<string, string> = {
  en: "EN",
  nl: "NL",
  it: "IT",
};

export function LocaleSwitcher() {
  const locale = useLocale();      // 当前语言
  const pathname = usePathname();  // 当前页面路径（不含 /en、/nl 前缀）
  const router = useRouter();      // 国际化路由器

  /** 切换语言：保持当前页面不变，只替换 URL 中的语言前缀 */
  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-2">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-2 py-1 text-sm rounded transition-colors ${
            locale === loc
              ? "bg-black text-white dark:bg-white dark:text-black font-bold"
              : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          }`}
        >
          {localeLabels[loc]}
        </button>
      ))}
    </div>
  );
}
