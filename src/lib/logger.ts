/**
 * 错误日志写入模块 —— 将前端/后端错误写入数据库 error_logs 表
 *
 * 收集的信息：
 * - Source: 错误来源（frontend / backend）
 * - Message: 错误信息
 * - Page URL: 完整 URL（含域名）
 * - Page Path: 页面路径（不含域名）
 * - Referer: 来源页面
 * - Language: 浏览器语言
 * - Screen Resolution: 屏幕分辨率
 * - User Agent: 浏览器信息
 * - IP: 用户 IP 地址
 * - Log Time: 精确到毫秒的时间戳（由数据库自动生成）
 */

import { execute } from "./db";

type ErrorSource = "frontend" | "backend";
type ErrorLevel = "error" | "warn" | "info";

interface LogErrorParams {
  source: ErrorSource;
  level?: ErrorLevel;
  message: string;
  stack?: string;
  url?: string;
  pagePath?: string;
  referer?: string;
  language?: string;
  screenResolution?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export async function logError(params: LogErrorParams) {
  const {
    source,
    level = "error",
    message,
    stack,
    url,
    pagePath,
    referer,
    language,
    screenResolution,
    userAgent,
    ip,
    metadata,
  } = params;

  try {
    await execute(
      `INSERT INTO error_logs
        (source, level, message, stack, url, page_path, referer, language, screen_resolution, user_agent, ip, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        source,
        level,
        message,
        stack || null,
        url || null,
        pagePath || null,
        referer || null,
        language || null,
        screenResolution || null,
        userAgent || null,
        ip || null,
        metadata ? JSON.stringify(metadata) : null,
      ],
    );
  } catch (dbError) {
    console.error("[logger] Failed to write error log to DB:", dbError);
    console.error("[logger] Original error:", message);
  }
}
