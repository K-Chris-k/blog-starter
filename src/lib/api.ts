import { Post } from "@/interfaces/post";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

function getPostsDirectory(locale: string) {
  return join(process.cwd(), "_posts", locale);
}

export function getPostSlugs(locale: string) {
  return fs.readdirSync(getPostsDirectory(locale));
}

export function getPostBySlug(slug: string, locale: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(getPostsDirectory(locale), `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(locale: string): Post[] {
  const slugs = getPostSlugs(locale);
  const posts = slugs
    .map((slug) => getPostBySlug(slug, locale))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
