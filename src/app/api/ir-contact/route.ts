/**
 * 投资者关系联系表单 API —— 处理投资者提交的咨询信息
 *
 * POST /api/ir-contact  → 接收联系表单数据并写入数据库
 * 流程：验证必填字段 → 记录 IP / UA → 写入 ir_contact_messages 表
 */
import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
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

    if (name.length > 100 || subject.length > 255 || message.length > 5000) {
      return NextResponse.json(
        { error: "Field length exceeds limit" },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
    const userAgent = request.headers.get("user-agent") || null;

    await execute(
      `INSERT INTO ir_contact_messages (name, email, company, phone, subject, message, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        company || null,
        phone || null,
        subject,
        message,
        ip,
        userAgent,
      ],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    await logError({
      source: "backend",
      message: `IR contact error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
