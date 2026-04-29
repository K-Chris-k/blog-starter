/**
 * 账户管理 API
 * POST — 创建新管理员账户（仅 admin 角色可操作）
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createAdminAccount } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("ir_dashboard_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { username, password, displayName, role } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    await createAdminAccount(
      username,
      password,
      displayName || username,
      role || "viewer",
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}
