/**
 * 错误日志查询 API —— 支持按来源、级别、时间范围、页面路径筛选
 *
 * GET /api/errors/list?source=frontend&level=error&from=2025-04-01&to=2025-04-20&pagePath=/en&limit=50&offset=0
 */

import { NextRequest } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const level = searchParams.get("level");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const pagePath = searchParams.get("pagePath");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;

  const conditions: string[] = [];
  const params: any[] = [];

  if (source && ["frontend", "backend"].includes(source)) {
    conditions.push("source = ?");
    params.push(source);
  }

  if (level && ["error", "warn", "info"].includes(level)) {
    conditions.push("level = ?");
    params.push(level);
  }

  if (from) {
    conditions.push("created_at >= ?");
    params.push(from);
  }

  if (to) {
    conditions.push("created_at <= ?");
    params.push(to + " 23:59:59.999");
  }

  if (pagePath) {
    conditions.push("page_path LIKE ?");
    params.push(`${pagePath}%`);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const rows = await query(
      `SELECT
         id,
         source,
         level,
         message,
         stack,
         url           AS page_url,
         page_path,
         referer,
         language,
         screen_resolution,
         user_agent,
         ip,
         metadata,
         created_at
       FROM error_logs ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const formatted = rows.map((row: any) => {
      const d = new Date(row.created_at);
      const pad = (n: number, len = 2) => String(n).padStart(len, "0");
      const logTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
      return { ...row, log_time: logTime };
    });

    const [countResult] = await query(
      `SELECT COUNT(*) as total FROM error_logs ${where}`,
      params,
    );

    return Response.json({
      data: formatted,
      total: (countResult as any).total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("[api/errors/list] Query failed:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
