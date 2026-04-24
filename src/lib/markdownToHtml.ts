/**
 * Markdown 转 HTML —— 将文章正文从 Markdown 格式转换为 HTML
 *
 * 使用 remark（Markdown 解析器）+ remark-html（HTML 渲染器）
 * 输入: "## Hello\nThis is **bold**"
 * 输出: "<h2>Hello</h2><p>This is <strong>bold</strong></p>"
 */

import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}
