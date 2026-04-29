/**
 * Session 验证 API —— 前端页面加载时检查是否已登录
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("ir_dashboard_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    },
  });
}
