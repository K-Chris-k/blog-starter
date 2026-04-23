/**
 * 签名 URL 文件服务 —— 验证签名后以流的方式返回文件
 *
 * 路径: GET /api/signed/{path}?expires=xxx&nonce=xxx&signature=xxx
 *
 * 安全修复：
 * 1. 流式读取（ReadableStream） → 大文件不会一次性占满服务器内存
 * 2. nonce 防重放 → 同一签名 URL 只能使用一次，转发无效
 * 3. 文件名过滤 → 去除换行符/回车符，防止 HTTP Header Injection
 * 4. IP 限速 → 同一 IP 短时间内最多下载 N 次，防止带宽被打满
 */

import { NextRequest } from "next/server";
import { verifySignature } from "@/lib/signing";
import { join, extname } from "path";
import { existsSync, statSync, createReadStream } from "fs";
import { logError } from "@/lib/logger";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

// ============================================================
// 限速器：每个 IP 在 WINDOW_MS 时间窗口内最多 MAX_DOWNLOADS 次下载
// 生产环境应使用 Redis + 滑动窗口，这里用内存 Map 做简易版
// ============================================================
const WINDOW_MS = 60 * 1000;   // 时间窗口：60 秒
const MAX_DOWNLOADS = 10;       // 每个 IP 每分钟最多 10 次下载

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/** 定期清理过期的限速记录，防止内存泄漏 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap) {
    if (now > record.resetAt) rateLimitMap.delete(ip);
  }
}, 60 * 1000);

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_DOWNLOADS) return false;

  record.count++;
  return true;
}

// ============================================================
// 文件名过滤：防止 HTTP Header Injection 攻击
// 攻击者可能构造含 \r\n 的文件名注入额外 HTTP 头
// ============================================================
function sanitizeFileName(name: string): string {
  return name
    .replace(/[\r\n\0]/g, "")    // 去除回车、换行、空字节
    .replace(/[^\w.\-\u4e00-\u9fff]/g, "_"); // 只保留字母数字、点、横线、中文，其余替换为下划线
}

// ============================================================
// 流式读取：将 Node.js ReadStream 转为 Web ReadableStream
// 避免 readFile() 把整个文件一次性读入内存
// 100MB 的 PDF 用 readFile 会占用 100MB 内存，流式只需要几十 KB 缓冲区
// ============================================================
function nodeStreamToWeb(
  filePath: string,
  start?: number,
  end?: number,
): ReadableStream<Uint8Array> {
  const nodeStream = createReadStream(filePath, { start, end });

  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk: Buffer | string) => {
        const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        controller.enqueue(new Uint8Array(buf));
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    // --- 限速检查 ---
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (!checkRateLimit(clientIp)) {
      return new Response("Too Many Requests - Please try again later", {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(WINDOW_MS / 1000)) },
      });
    }

    const { path } = await params;
    const filePath = path.join("/");

    // --- 签名验证（含 nonce 防重放） ---
    const { searchParams } = new URL(request.url);
    const expires = Number(searchParams.get("expires"));
    const nonce = searchParams.get("nonce") || "";
    const signature = searchParams.get("signature");

    if (!expires || !signature) {
      return new Response("Bad Request", { status: 400 });
    }

    if (!verifySignature(filePath, expires, nonce, signature)) {
      return new Response("Forbidden - Invalid, expired, or already used", {
        status: 403,
      });
    }

    // --- 路径安全检查：防止 ../../../ 路径穿越攻击 ---
    const fullPath = join(process.cwd(), "private-assets", filePath);
    const privateDir = join(process.cwd(), "private-assets");
    if (!fullPath.startsWith(privateDir)) {
      return new Response("Forbidden", { status: 403 });
    }

    if (!existsSync(fullPath)) {
      return new Response("Not Found", { status: 404 });
    }

    const ext = extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileSize = statSync(fullPath).size;
    const isPDF = ext === ".pdf";

    // --- 文件名过滤：防止 Header Injection ---
    const rawName = filePath.split("/").pop() || "download";
    const safeName = sanitizeFileName(rawName);
    const encodedName = encodeURIComponent(safeName);

    // --- 安全响应头 ---
    const securityHeaders: Record<string, string> = {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cache-Control": "private, no-store",
    };

    if (isPDF) {
      securityHeaders["Content-Security-Policy"] = "sandbox";
    }

    // --- 断点续传：处理 Range 请求（流式读取，不读全文件） ---
    const rangeHeader = request.headers.get("range");
    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize || start > end) {
          return new Response("Range Not Satisfiable", {
            status: 416,
            headers: { "Content-Range": `bytes */${fileSize}` },
          });
        }

        const chunkSize = end - start + 1;
        const stream = nodeStreamToWeb(fullPath, start, end);

        return new Response(stream, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(chunkSize),
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            ...securityHeaders,
          },
        });
      }
    }

    // --- 正常完整下载（流式返回，不一次性读入内存） ---
    const stream = nodeStreamToWeb(fullPath);
    const disposition = isPDF
      ? `attachment; filename="${safeName}"; filename*=UTF-8''${encodedName}`
      : "inline";

    return new Response(stream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileSize),
        "Content-Disposition": disposition,
        "Accept-Ranges": "bytes",
        ...securityHeaders,
      },
    });
  } catch (err) {
    await logError({
      source: "backend",
      message: `Signed URL error: ${err instanceof Error ? err.message : String(err)}`,
      stack: err instanceof Error ? err.stack : undefined,
      url: request.url,
    });
    return new Response("Internal Server Error", { status: 500 });
  }
}
