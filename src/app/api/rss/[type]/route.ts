/**
 * RSS Feed API —— 根据类型返回 RSS XML 格式的订阅源
 *
 * GET /api/rss/announcements  → 公告 RSS
 * GET /api/rss/news           → 新闻 RSS
 * GET /api/rss/financial      → 财报 RSS
 *
 * 从 rss_feeds 表中查询已发布的条目，生成标准 RSS 2.0 XML
 */
import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { logError } from "@/lib/logger";

const VALID_TYPES = ["announcements", "news", "financial"];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params;

    if (!VALID_TYPES.includes(type)) {
      return new Response("Not Found", { status: 404 });
    }

    const items = await query(
      `SELECT title, description, link, pub_date 
       FROM rss_feeds 
       WHERE feed_type = ? AND is_published = 1 
       ORDER BY pub_date DESC 
       LIMIT 50`,
      [type],
    );

    const titleMap: Record<string, string> = {
      announcements: "Announcements",
      news: "News Releases",
      financial: "Financial Information",
    };

    const origin = new URL(request.url).origin;

    const rssItems = items
      .map(
        (item: any) => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description || "")}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${new Date(item.pub_date).toUTCString()}</pubDate>
    </item>`,
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(titleMap[type])} - Tenways IR</title>
    <link>${origin}</link>
    <description>${escapeXml(titleMap[type])} RSS Feed</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    await logError({
      source: "backend",
      message: `RSS feed error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
