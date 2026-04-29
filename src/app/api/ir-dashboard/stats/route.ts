/**
 * 后台统计 API —— 返回各表的总数统计，用于 Dashboard 仪表盘
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("ir_dashboard_token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      errors,
      files,
      downloads,
      subscriptions,
      feeds,
      contacts,
      accounts,
    ] = await Promise.all([
      query("SELECT COUNT(*) as count FROM error_logs"),
      query("SELECT COUNT(*) as count FROM file_registry"),
      query("SELECT COUNT(*) as count FROM download_logs"),
      query("SELECT COUNT(*) as count, SUM(is_active = 1) as active FROM email_subscriptions"),
      query("SELECT COUNT(*) as count FROM rss_feeds"),
      query("SELECT COUNT(*) as count, SUM(status = 'new') as unread FROM ir_contact_messages"),
      query("SELECT COUNT(*) as count FROM admin_accounts"),
    ]);

    return NextResponse.json({
      error_logs: errors[0]?.count || 0,
      file_registry: files[0]?.count || 0,
      download_logs: downloads[0]?.count || 0,
      email_subscriptions: {
        total: subscriptions[0]?.count || 0,
        active: Number(subscriptions[0]?.active) || 0,
      },
      rss_feeds: feeds[0]?.count || 0,
      ir_contact_messages: {
        total: contacts[0]?.count || 0,
        unread: Number(contacts[0]?.unread) || 0,
      },
      admin_accounts: accounts[0]?.count || 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
