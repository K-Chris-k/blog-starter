/**
 * 后台数据查询 API —— 通用的表数据查询接口
 *
 * GET /api/ir-dashboard/data/{table}?limit=20&offset=0&status=new
 * 支持的表：error_logs, file_registry, download_logs,
 *          email_subscriptions, rss_feeds, ir_contact_messages, admin_accounts
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { query } from "@/lib/db";

const ALLOWED_TABLES: Record<string, { columns: string; filters: string[] }> = {
  error_logs: {
    columns: "id, source, level, message, stack, url, page_path, referer, language, screen_resolution, ip, user_agent, metadata, created_at",
    filters: ["source", "level"],
  },
  file_registry: {
    columns: "uuid, file_path, display_name, file_type, category, file_size, status, created_at",
    filters: ["status", "category", "file_type"],
  },
  download_logs: {
    columns: "id, file_uuid, ip, user_agent, referer, downloaded_at",
    filters: [],
  },
  email_subscriptions: {
    columns: "id, email, name, alert_types, is_active, created_at, updated_at",
    filters: ["is_active"],
  },
  rss_feeds: {
    columns: "id, feed_type, title, description, link, pub_date, is_published, created_at",
    filters: ["feed_type", "is_published"],
  },
  ir_contact_messages: {
    columns: "id, name, email, company, phone, subject, message, status, ip, created_at",
    filters: ["status"],
  },
  admin_accounts: {
    columns: "id, username, display_name, role, is_active, last_login_at, last_login_ip, created_at",
    filters: ["role", "is_active"],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> },
) {
  const token = request.cookies.get("ir_dashboard_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { table } = await params;
  const config = ALLOWED_TABLES[table];
  if (!config) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    const conditions: string[] = [];
    const values: any[] = [];

    for (const filter of config.filters) {
      const val = searchParams.get(filter);
      if (val) {
        conditions.push(`${filter} = ?`);
        values.push(val);
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const orderCol = table === "file_registry" ? "created_at" : "id";

    const [data, countResult] = await Promise.all([
      query(
        `SELECT ${config.columns} FROM ${table} ${where} ORDER BY ${orderCol} DESC LIMIT ${limit} OFFSET ${offset}`,
        values,
      ),
      query(
        `SELECT COUNT(*) as total FROM ${table} ${where}`,
        values,
      ),
    ]);

    return NextResponse.json({
      data,
      total: countResult[0]?.total || 0,
      limit,
      offset,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 500 },
    );
  }
}
