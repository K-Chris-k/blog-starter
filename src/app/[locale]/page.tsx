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
