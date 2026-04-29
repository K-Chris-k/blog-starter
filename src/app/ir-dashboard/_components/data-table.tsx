"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";

interface DataTableProps {
  table: string;
  title: string;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  pageSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/**
 * 状态标签颜色映射 —— 根据字段名和值渲染不同颜色的 Badge
 */
const STATUS_STYLES: Record<string, Record<string, { bg: string; text: string; label: string }>> = {
  level: {
    error: { bg: "bg-red-100", text: "text-red-700", label: "错误" },
    warn: { bg: "bg-yellow-100", text: "text-yellow-700", label: "警告" },
    info: { bg: "bg-blue-100", text: "text-blue-700", label: "信息" },
  },
  source: {
    frontend: { bg: "bg-cyan-100", text: "text-cyan-700", label: "前端" },
    backend: { bg: "bg-orange-100", text: "text-orange-700", label: "后端" },
  },
  status: {
    draft: { bg: "bg-gray-100", text: "text-gray-600", label: "草稿" },
    published: { bg: "bg-green-100", text: "text-green-700", label: "已发布" },
    archived: { bg: "bg-gray-200", text: "text-gray-500", label: "已归档" },
    new: { bg: "bg-blue-100", text: "text-blue-700", label: "新消息" },
    read: { bg: "bg-gray-100", text: "text-gray-600", label: "已读" },
    replied: { bg: "bg-green-100", text: "text-green-700", label: "已回复" },
    closed: { bg: "bg-gray-200", text: "text-gray-500", label: "已关闭" },
  },
  is_active: {
    "1": { bg: "bg-green-100", text: "text-green-700", label: "活跃" },
    "0": { bg: "bg-red-100", text: "text-red-700", label: "已停用" },
  },
  is_published: {
    "1": { bg: "bg-green-100", text: "text-green-700", label: "已发布" },
    "0": { bg: "bg-gray-100", text: "text-gray-600", label: "草稿" },
  },
  file_type: {
    pdf: { bg: "bg-red-50", text: "text-red-600", label: "PDF" },
    image: { bg: "bg-blue-50", text: "text-blue-600", label: "图片" },
    other: { bg: "bg-gray-100", text: "text-gray-600", label: "其他" },
  },
  role: {
    admin: { bg: "bg-purple-100", text: "text-purple-700", label: "管理员" },
    viewer: { bg: "bg-gray-100", text: "text-gray-700", label: "查看者" },
  },
};

const COLUMN_LABELS: Record<string, string> = {
  id: "ID",
  uuid: "UUID",
  source: "来源",
  level: "级别",
  message: "信息",
  url: "URL",
  page_path: "页面路径",
  ip: "IP 地址",
  user_agent: "浏览器",
  created_at: "创建时间",
  updated_at: "更新时间",
  file_path: "文件路径",
  display_name: "显示名称",
  file_type: "文件类型",
  category: "分类",
  file_size: "文件大小",
  status: "状态",
  file_uuid: "文件 UUID",
  referer: "来源页面",
  downloaded_at: "下载时间",
  email: "邮箱",
  name: "姓名",
  alert_types: "订阅类型",
  is_active: "状态",
  feed_type: "Feed 类型",
  title: "标题",
  description: "描述",
  link: "链接",
  pub_date: "发布日期",
  is_published: "发布状态",
  company: "公司",
  phone: "电话",
  subject: "主题",
  username: "用户名",
  role: "角色",
  last_login_at: "最后登录",
  last_login_ip: "最后登录 IP",
};

export default function DataTable({
  table,
  title,
  filters = [],
  pageSize: defaultPageSize = 20,
}: DataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [loading, setLoading] = useState(true);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [jumpPage, setJumpPage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    params.set("offset", String(page * pageSize));
    for (const [k, v] of Object.entries(filterValues)) {
      if (v) params.set(k, v);
    }
    try {
      const res = await fetch(`/api/ir-dashboard/data/${table}?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, page, pageSize, filterValues]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const totalPages = Math.ceil(total / pageSize);

  const handleJump = () => {
    const target = Number(jumpPage) - 1;
    if (target >= 0 && target < totalPages) {
      setPage(target);
    }
    setJumpPage("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <span className="text-sm text-gray-500">共 {total} 条记录</span>
      </div>

      {filters.length > 0 && (
        <div className="flex gap-3 mb-4 flex-wrap">
          {filters.map((f) => (
            <select
              key={f.key}
              value={filterValues[f.key] || ""}
              onChange={(e) => {
                setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }));
                setPage(0);
              }}
              className="px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="">{f.label}: 全部</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap"
                  >
                    {COLUMN_LABELS[col] || col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length || 1} className="px-4 py-12 text-center text-gray-400">
                    加载中...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length || 1} className="px-4 py-12 text-center text-gray-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 max-w-xs truncate whitespace-nowrap">
                        {renderCell(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">每页</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 border rounded text-sm bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s} 条</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(0)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-white"
            >
              首页
            </button>
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-white"
            >
              上一页
            </button>
            <span className="text-sm text-gray-600 px-2">
              第 {page + 1} / {totalPages || 1} 页
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-white"
            >
              下一页
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(totalPages - 1)}
              className="px-2 py-1 text-sm border rounded disabled:opacity-30 hover:bg-white"
            >
              末页
            </button>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJump()}
              className="w-14 px-2 py-1 border rounded text-center text-sm"
            />
            <span className="text-gray-500">页</span>
            <button
              onClick={handleJump}
              className="px-2 py-1 text-sm border rounded hover:bg-white"
            >
              确定
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCell(col: string, value: any): ReactNode {
  if (value === null || value === undefined) return "—";

  const styleMap = STATUS_STYLES[col];
  if (styleMap) {
    const style = styleMap[String(value)];
    if (style) {
      return (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      );
    }
  }

  if (col === "file_size") {
    const num = Number(value);
    if (num === 0) return "—";
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (col.endsWith("_at") || col === "pub_date" || col === "downloaded_at") {
    try {
      return new Date(value).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return String(value);
    }
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
