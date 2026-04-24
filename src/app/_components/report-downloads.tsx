/**
 * 财报下载区域组件 —— 从数据库读取已发布的 PDF 列表，渲染下载卡片
 *
 * 这是一个服务端组件（没有 "use client"），在服务端直接查询数据库：
 *   1. 调用 listFiles() 查询 file_registry 表中 status=published 且 category=report 的记录
 *   2. 渲染为卡片列表，每张卡片显示文件名、大小、日期和下载按钮
 *   3. 下载按钮链接到 /api/download/{uuid}，走签名 URL 流程
 *
 * 新增 PDF 后无需改此文件，组件自动从数据库读取最新列表
 */

import { listFiles } from "@/lib/files";
import { getTranslations } from "next-intl/server";

/** 格式化文件大小：字节 → 人类可读（如 7468594 → "7.1 MB"） */
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 格式化日期：ISO 字符串 → yyyy-MM-dd 格式 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA");
}

export async function ReportDownloads() {
  const t = await getTranslations("Reports");

  let reports: any[] = [];
  try {
    reports = await listFiles({ status: "published", category: "report" });
  } catch {
    return null;
  }

  if (reports.length === 0) return null;

  return (
    <section className="mb-32">
      <h2 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div
            key={report.uuid}
            className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 flex items-center justify-between hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate dark:text-slate-200">
                  {report.display_name}
                </h3>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 flex gap-4">
                  <span>{t("fileSize")}: {formatFileSize(report.file_size)}</span>
                  <span>{t("publishDate")}: {formatDate(report.created_at)}</span>
                </div>
              </div>
            </div>
            <a
              href={`/api/download/${report.uuid}`}
              className="flex-shrink-0 ml-4 inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-lg font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t("download")}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
