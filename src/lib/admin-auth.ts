/**
 * 后台认证模块 —— JWT Token 生成与验证
 *
 * 登录流程：
 *   1. 用户提交用户名密码 → /api/ir-dashboard/login
 *   2. 验证密码（bcrypt）→ 生成 JWT Token
 *   3. Token 存储在 HttpOnly Cookie 中（防 XSS）
 *   4. 后续请求自动携带 Cookie，服务端验证 Token
 */
import crypto from "crypto";
import { query, execute } from "./db";
import bcrypt from "bcryptjs";

interface AdminPayload {
  id: number;
  username: string;
  role: string;
}

function getJwtSecret(): string {
  if (!process.env.ADMIN_JWT_SECRET) {
    throw new Error("Missing ADMIN_JWT_SECRET environment variable");
  }
  return process.env.ADMIN_JWT_SECRET;
}

/**
 * 简易 JWT 实现 —— 使用 HMAC-SHA256 签名
 * 不引入第三方 JWT 库，减少依赖
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString();
}

export function generateToken(payload: AdminPayload, expiresInHours = 24): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const body = base64UrlEncode(JSON.stringify({ ...payload, exp }));
  const signature = crypto
    .createHmac("sha256", getJwtSecret())
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): AdminPayload | null {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expected = crypto
      .createHmac("sha256", getJwtSecret())
      .update(`${header}.${body}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expected) return null;

    const payload = JSON.parse(base64UrlDecode(body));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return { id: payload.id, username: payload.username, role: payload.role };
  } catch {
    return null;
  }
}

export async function validateLogin(
  username: string,
  password: string,
  ip?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  const rows = await query(
    "SELECT id, username, password_hash, display_name, role, is_active FROM admin_accounts WHERE username = ?",
    [username],
  );

  if (rows.length === 0) {
    return { success: false, error: "Invalid credentials" };
  }

  const user = rows[0];
  if (!user.is_active) {
    return { success: false, error: "Account disabled" };
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return { success: false, error: "Invalid credentials" };
  }

  await execute(
    "UPDATE admin_accounts SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?",
    [ip || null, user.id],
  );

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  return { success: true, token };
}

export async function createAdminAccount(
  username: string,
  password: string,
  displayName: string,
  role: "admin" | "viewer" = "admin",
) {
  const hash = await bcrypt.hash(password, 12);
  await execute(
    "INSERT INTO admin_accounts (username, password_hash, display_name, role, is_active) VALUES (?, ?, ?, ?, 1)",
    [username, hash, displayName, role],
  );
}
