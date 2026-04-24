/**
 * 静态资源 API（备用） —— 通过路径从 private-assets 提供文件
 *
 * 路径: GET /api/assets/{path}
 * 用途: 作为 /api/file/[uuid] 的备用方案，通过路径而非 UUID 访问文件
 *
 * 安全措施：
 *   - Referer 检查：只允许来自本站的请求，防止外站盗链
 *   - 路径穿越防护：检查路径不超出 private-assets 目录
 *   - 错误日志：异常写入数据库
 *
 * 注意：推荐优先使用 /api/file/[uuid]（更安全），此接口作为兼容保留
 */

import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import { logError } from "@/lib/logger";

/** 文件扩展名 → HTTP Content-Type 映射 */
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

/** 允许访问的来源域名（生产环境需要添加正式域名） */
const ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
];

/**
 * 检查 Referer 请求头 —— 防止外站盗链
 * 只允许来自 ALLOWED_HOSTS 的请求，无 Referer 的直接访问也放行
 */
function isAllowedReferer(referer: string | null): boolean {
  if (!referer) return true;
  try {
    const url = new URL(referer);
    return ALLOWED_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const referer = request.headers.get("referer");
    if (!isAllowedReferer(referer)) {
      return new Response("Forbidden - Hotlink not allowed", { status: 403 });
    }

    const { path } = await params;
    const filePath = join(process.cwd(), "private-assets", ...path);

    const privateDir = join(process.cwd(), "private-assets");
    if (!filePath.startsWith(privateDir)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!existsSync(filePath)) {
      return new Response("Not Found", { status: 404 });
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    await logError({
      source: "backend",
      message: `Assets API error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
