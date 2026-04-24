/**
 * 文章读取模块 —— 从 _posts/{locale}/ 目录读取 Markdown 文件
 *
 * 文件结构：
 *   _posts/en/hello-world.md   ← 英文文章
 *   _posts/nl/hello-world.md   ← 荷兰语文章
 *   _posts/it/hello-world.md   ← 意大利语文章
 *
 * 每篇 Markdown 文件用 gray-matter 解析：
 *   - frontmatter（---之间的部分）→ 标题、日期、作者、封面图等元数据
 *   - content（---之后的部分）→ 文章正文内容
 */

import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

/** 根据语言获取文章目录路径 */
function getPostsDirectory(locale: string) {
  return join(process.cwd(), "_posts", locale);
}

/** 获取指定语言下所有文章的文件名列表（如 ["hello-world.md", "preview.md"]） */
export function getPostSlugs(locale: string) {
  return fs.readdirSync(getPostsDirectory(locale));
}

/**
 * 根据 slug 和语言读取单篇文章
 * @param slug - 文章标识（如 "hello-world"，不含 .md 后缀）
 * @param locale - 语言代码（如 "en"、"nl"、"it"）
 * @returns Post 对象，包含 frontmatter 元数据 + content 正文
 */
export function getPostBySlug(slug: string, locale: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(getPostsDirectory(locale), `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

/**
 * 获取指定语言的所有文章，按日期倒序排列（最新的在前）
 * @param locale - 语言代码
 * @returns 排序后的 Post 数组
 */
export function getAllPosts(locale: string): Post[] {
  const slugs = getPostSlugs(locale);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
