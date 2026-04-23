/**
 * 文件下载 API —— 通过 UUID 生成签名 URL 并重定向，用于 PDF 等文件下载
 *
 * 路径: GET /api/download/{uuid}
 * 流程: 请求 UUID → 查数据库 → 生成 5 分钟有效的签名 URL → 记录下载日志 → 302 重定向到签名 URL
 * 与 /api/file/[uuid] 的区别: 此接口会记录下载日志，并通过签名 URL 限时访问（适合 PDF 下载场景）
 */

import { NextRequest } from "next/server";
import { getFileByUUID, logDownload } from "@/lib/files";
import { generateSignedUrl } from "@/lib/signing";
import { logError } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> },
) {
  try {
    const { uuid } = await params;

    // 步骤1: 用 UUID 查询数据库
    const record = await getFileByUUID(uuid);
    if (!record) {
      return new Response("Not Found", { status: 404 });
    }

    // 步骤2: 检查发布状态，未发布的文件禁止下载
    if (record.status !== "published") {
      return new Response("Forbidden", { status: 403 });
    }

    // 步骤3: 生成带签名的临时 URL（有效期 300 秒 = 5 分钟）
    const signedUrl = generateSignedUrl(record.file_path, 300);

    // 步骤4: 记录下载行为（IP、浏览器、来源页面）
    await logDownload(
      uuid,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        undefined,
      request.headers.get("user-agent") || undefined,
      request.headers.get("referer") || undefined,
    );

    // 步骤5: 302 重定向到签名 URL，浏览器自动跳转去下载
    return Response.redirect(new URL(signedUrl, request.url), 302);
  } catch (err) {
    await logError({
      source: "backend",
      message: `Download API error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
