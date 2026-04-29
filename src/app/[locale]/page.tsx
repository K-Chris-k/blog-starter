/**
 * 前台首页 —— /[locale]
 *
 * 展示内容：Hero 文章（最新一篇）、更多文章列表、PDF 财报下载区域
 * 数据来源：从 Markdown 文件读取文章，从数据库读取 PDF 列表
 */
import Container from "@/app/_components/container";
import { HeroPost } from "@/app/_components/hero-post";
import { Intro } from "@/app/_components/intro";
import { MoreStories } from "@/app/_components/more-stories";
import { ReportDownloads } from "@/app/_components/report-downloads";
import { getAllPosts } from "@/lib/api";
import { getLocale } from "next-intl/server";

export default async function Index() {
  const locale = await getLocale();
  const allPosts = getAllPosts(locale);

  const heroPost = allPosts[0];
  const morePosts = allPosts.slice(1);

  return (
    <main>
      <Container>
        <Intro />
        <HeroPost
          title={heroPost.title}
          coverImage={heroPost.coverImage}
          date={heroPost.date}
          author={heroPost.author}
          slug={heroPost.slug}
          excerpt={heroPost.excerpt}
        />
        {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        <ReportDownloads />
      </Container>
    </main>
  );
}
