/**
 * 下载记录页 —— /ir-dashboard/downloads
 *
 * 展示 download_logs 表数据，记录每一次文件下载行为（文件UUID、IP、UA、时间）
 */
"use client";

import DataTable from "../../_components/data-table";

export default function DownloadsPage() {
  return <DataTable table="download_logs" title="下载记录" />;
}
