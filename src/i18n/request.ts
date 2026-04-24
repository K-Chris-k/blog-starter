/**
 * 国际化请求配置 —— 每次请求时加载对应语言的翻译文件
 *
 * 工作流程：
 *   1. 用户访问 /nl/posts/hello
 *   2. next-intl 从 URL 中提取 locale = "nl"
 *   3. 此文件加载 messages/nl.json 作为翻译字典
 *   4. 页面中的 useTranslations("Intro") 就能读到荷兰语翻译
 *
 * 如果 locale 无效或缺失，回退到默认语言（en）
 */

import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // 语言无效时回退到默认语言
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // 动态导入对应语言的 JSON 翻译文件（如 messages/nl.json）
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
