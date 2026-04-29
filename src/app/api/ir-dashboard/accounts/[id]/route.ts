/**
 * 单个账户管理 API
 * PATCH — 修改账户状态/角色（仅 admin 可操作）
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { execute } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = request.cookies.get("ir_dashboard_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.is_active !== undefined) {
    updates.push("is_active = ?");
    values.push(body.is_active ? 1 : 0);
  }
  if (body.role) {
    updates.push("role = ?");
    values.push(body.role);
  }
  if (body.display_name) {
    updates.push("display_name = ?");
    values.push(body.display_name);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  values.push(Number(id));

  try {
    await execute(
      `UPDATE admin_accounts SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
