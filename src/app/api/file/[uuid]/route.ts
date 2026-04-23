/**
 * 文件访问 API —— 通过 UUID 返回受保护的文件（图片等）
 *
 * 路径: GET /api/file/{uuid}
 * 流程: 浏览器请求 UUID → 查数据库获取真实路径 → 从 private-assets 读取 → 返回文件内容
 * 用途: 页面中嵌入的图片（<img>、next/image）直接通过此接口显示
 */

import { NextRequest } from "next/server";
import { getFileByUUID } from "@/lib/files";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import { logError } from "@/lib/logger";

/** 文件扩展名 → HTTP Content-Type 的映射 */
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  try {
    const { uuid } = await params;

    // 步骤1: 用 UUID 查询数据库，获取文件元数据
    const record = await getFileByUUID(uuid);
    if (!record || record.status !== "published") {
      return new Response("Not Found", { status: 404 });
    }

    // 步骤2: 拼接 private-assets 下的真实文件路径
    const fullPath = join(process.cwd(), "private-assets", record.file_path);

    if (!existsSync(fullPath)) {
      return new Response("Not Found", { status: 404 });
    }

    // 步骤3: 读取文件并返回，设置正确的 Content-Type 和缓存策略
    const ext = extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await readFile(fullPath);

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // 长期缓存，文件内容不变
        "X-Content-Type-Options": "nosniff", // 防止浏览器猜测文件类型
      },
    });
  } catch (err) {
    // 异常写入错误日志表
    await logError({
      source: "backend",
      message: `File API error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
