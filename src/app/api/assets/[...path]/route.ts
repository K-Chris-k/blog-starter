import { NextRequest } from "next/server";
import { readFile } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
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

const ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  // Add your production domain here:
  // "ir.yourcompany.com",
];

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
