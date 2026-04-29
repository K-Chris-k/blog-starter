/**
 * 错误日志管理页 —— /ir-dashboard/error-logs
 *
 * 功能：展示前端/后端错误日志，支持按来源和级别筛选
 * 特色：点击行展开详情面板，显示完整的错误信息、堆栈、metadata、UA 等
 * 数据来源：/api/ir-dashboard/data/error_logs（服务端分页）
 */
"use client";

import { useState, useEffect, useCallback, ReactNode } from "react";

interface ErrorLog {
  id: number;
  source: string;
  level: string;
  message: string;
  stack: string | null;
  url: string | null;
  page_path: string | null;
  referer: string | null;
  language: string | null;
  screen_resolution: string | null;
  ip: string | null;
  user_agent: string | null;
  metadata: any;
  created_at: string;
}

const LEVEL_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  error: { bg: "bg-red-100", text: "text-red-700", label: "错误" },
  warn: { bg: "bg-yellow-100", text: "text-yellow-700", label: "警告" },
  info: { bg: "bg-blue-100", text: "text-blue-700", label: "信息" },
};

const SOURCE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  frontend: { bg: "bg-cyan-100", text: "text-cyan-700", label: "前端" },
  backend: { bg: "bg-orange-100", text: "text-orange-700", label: "后端" },
};

const PAGE_SIZES = [10, 20, 50, 100];

function Badge({ bg, text, label }: { bg: string; text: string; label: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  );
}

export default function ErrorLogsPage() {
  const [data, setData] = useState<ErrorLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterSource, setFilterSource] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(pageSize));
    params.set("offset", String(page * pageSize));
    if (filterSource) params.set("source", filterSource);
    if (filterLevel) params.set("level", filterLevel);

    try {
      const res = await fetch(`/api/ir-dashboard/data/error_logs?${params}`);
      const json = await res.json();
      setData(json.data || []);
      setTotal(json.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterSource, filterLevel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">错误日志</h1>
        <span className="text-sm text-gray-500">共 {total} 条记录</span>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select
          value={filterSource}
          onChange={(e) => { setFilterSource(e.target.value); setPage(0); }}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">来源: 全部</option>
          <option value="frontend">前端</option>
          <option value="backend">后端</option>
        </select>
        <select
          value={filterLevel}
          onChange={(e) => { setFilterLevel(e.target.value); setPage(0); }}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
        >
          <option value="">级别: 全部</option>
          <option value="error">错误</option>
          <option value="warn">警告</option>
          <option value="info">信息</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="w-8 px-3 py-3"></th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">来源</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">级别</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">错误信息</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">页面 URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">时间</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">加载中...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                </tr>
              ) : (
                data.map((row) => {
                  const isExpanded = expandedId === row.id;
                  const levelStyle = LEVEL_STYLE[row.level] || LEVEL_STYLE.error;
                  const sourceStyle = SOURCE_STYLE[row.source] || SOURCE_STYLE.frontend;

                  return (
                    <>
                      <tr
                        key={row.id}
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className={`border-b cursor-pointer transition-colors ${
                          isExpanded ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-3 text-gray-400 text-center">
                          {isExpanded ? "▼" : "▶"}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{row.id}</td>
                        <td className="px-4 py-3">
                          <Badge {...sourceStyle} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge {...levelStyle} />
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate" title={row.message}>
                          {row.message}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-gray-500" title={row.url || ""}>
                          {row.page_path || row.url || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row.ip || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString("zh-CN")}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${row.id}-detail`} className="bg-gray-50">
                          <td colSpan={8} className="px-6 py-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <DetailItem label="Message" value={row.message} full />
                              {row.stack && <DetailItem label="Stack" value={row.stack} full mono />}
                              {row.metadata && (
                                <DetailItem
                                  label="Data"
                                  value={typeof row.metadata === "object" ? JSON.stringify(row.metadata, null, 2) : String(row.metadata)}
                                  full
                                  mono
                                />
                              )}
                              <DetailItem label="页面 URL" value={row.url} />
                              <DetailItem label="页面路径" value={row.page_path} />
                              <DetailItem label="来源页面 (Referer)" value={row.referer} />
                              <DetailItem label="IP 地址" value={row.ip} />
                              <DetailItem label="浏览器语言" value={row.language} />
                              <DetailItem label="屏幕分辨率" value={row.screen_resolution} />
                              <DetailItem label="User Agent" value={row.user_agent} full />
                              <DetailItem
                                label="记录时间"
                                value={new Date(row.created_at).toLocaleString("zh-CN", {
                                  year: "numeric", month: "2-digit", day: "2-digit",
                                  hour: "2-digit", minute: "2-digit", second: "2-digit",
                                  fractionalSecondDigits: 3,
                                })}
                              />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">每页</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="px-2 py-1 border rounded text-sm bg-white"
            >
              {PAGE_SIZES.map((s) => (
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

          <div className="text-sm text-gray-500">
            共 {total} 条
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  full = false,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  full?: boolean;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}:</p>
      <div
        className={`bg-white border rounded-lg px-3 py-2 text-gray-800 break-all ${
          mono ? "font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
