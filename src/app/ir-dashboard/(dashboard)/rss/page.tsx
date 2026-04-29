/**
 * RSS 订阅管理页 —— /ir-dashboard/rss
 *
 * 展示 rss_feeds 表数据，支持按类型（公告/新闻/财报）和发布状态筛选
 */
"use client";

import DataTable from "../../_components/data-table";

export default function RSSFeedsPage() {
  return (
    <DataTable
      table="rss_feeds"
      title="RSS 订阅"
      filters={[
        {
          key: "feed_type",
          label: "类型",
          options: [
            { value: "announcements", label: "公告" },
            { value: "news", label: "新闻" },
            { value: "financial", label: "财报" },
          ],
        },
        {
          key: "is_published",
          label: "发布状态",
          options: [
            { value: "1", label: "已发布" },
            { value: "0", label: "草稿" },
          ],
        },
      ]}
    />
  );
}
