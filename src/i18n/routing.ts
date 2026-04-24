/**
 * 国际化路由配置 —— 定义支持的语言和导航工具
 *
 * 这是整个 i18n 系统的核心入口：
 *   - 定义支持哪些语言（locales）和默认语言
 *   - 导出国际化版本的 Link、useRouter 等导航工具
 *     这些工具会自动在 URL 中添加语言前缀（如 /en/posts/hello → /nl/posts/hello）
 */

import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/** 语言配置：支持英语、荷兰语、意大利语，默认英语 */
export const routing = defineRouting({
  locales: ["en", "nl", "it"],
  defaultLocale: "en",
});

/** 语言类型：用于 TypeScript 类型检查，值为 "en" | "nl" | "it" */
export type Locale = (typeof routing.locales)[number];

/** 国际化导航工具 —— 替代 next/link 和 next/navigation 的对应组件 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
