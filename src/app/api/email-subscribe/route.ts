/**
 * 邮件订阅 API —— 处理用户的邮件提醒订阅请求
 *
 * POST /api/email-subscribe  → 新增 / 更新订阅
 * 流程：收到邮箱 + 订阅类型 → 生成退订令牌 → 写入 email_subscriptions 表
 *       如果邮箱已存在，则更新订阅类型并重新激活
 */
import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { logError } from "@/lib/logger";
import { v4 as uuidv4 } from "uuid";

const VALID_ALERT_TYPES = [
  "stock_quote",
  "event",
  "weekly_summary",
  "announcement",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, alertTypes } = body;

    if (!email || !alertTypes || !Array.isArray(alertTypes)) {
      return NextResponse.json(
        { error: "Email and alertTypes are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    const filtered = alertTypes.filter((t: string) =>
      VALID_ALERT_TYPES.includes(t),
    );
    if (filtered.length === 0) {
      return NextResponse.json(
        { error: "At least one valid alert type is required" },
        { status: 400 },
      );
    }

    const existing = await query(
      "SELECT id FROM email_subscriptions WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      await execute(
        `UPDATE email_subscriptions 
         SET alert_types = ?, name = ?, is_active = 1 
         WHERE email = ?`,
        [JSON.stringify(filtered), name || null, email],
      );
    } else {
      const unsubscribeToken = uuidv4();
      await execute(
        `INSERT INTO email_subscriptions (email, name, alert_types, unsubscribe_token)
         VALUES (?, ?, ?, ?)`,
        [email, name || null, JSON.stringify(filtered), unsubscribeToken],
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    await logError({
      source: "backend",
      message: `Email subscribe error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
