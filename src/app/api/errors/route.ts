import { NextRequest } from "next/server";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message, stack, url, pagePath, referer,
      language, screenResolution, level, metadata,
    } = body;

    if (!message || typeof message !== "string") {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    await logError({
      source: "frontend",
      level: level || "error",
      message,
      stack,
      url,
      pagePath,
      referer,
      language,
      screenResolution,
      userAgent: request.headers.get("user-agent") || undefined,
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        undefined,
      metadata,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("[api/errors] Failed to process error report:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
