/**
 * 文件管理页 —— /ir-dashboard/files
 *
 * 展示 file_registry 表数据，支持按状态、类型、分类筛选
 * 管理所有受保护文件（图片、PDF）的元数据和发布状态
 */
"use client";

import DataTable from "../../_components/data-table";

export default function FilesPage() {
  return (
    <DataTable
      table="file_registry"
      title="文件管理"
      filters={[
        {
          key: "status",
          label: "状态",
          options: [
            { value: "draft", label: "草稿" },
            { value: "published", label: "已发布" },
            { value: "archived", label: "已归档" },
          ],
        },
        {
          key: "file_type",
          label: "类型",
          options: [
            { value: "pdf", label: "PDF" },
            { value: "image", label: "图片" },
            { value: "other", label: "其他" },
          ],
        },
        {
          key: "category",
          label: "分类",
          options: [
            { value: "author", label: "作者头像" },
            { value: "cover", label: "封面图" },
            { value: "report", label: "报告" },
          ],
        },
      ]}
    />
  );
}
