/**
 * 文件管理模块 —— 负责文件的注册、查询、状态管理和下载日志
 *
 * 所有受保护的文件（图片、PDF 等）都通过此模块与数据库交互，
 * 外部只能通过 UUID 访问，真实文件路径对外不可见。
 */

import { v4 as uuidv4 } from "uuid";
import { query, execute } from "./db";
import { statSync } from "fs";
import { join } from "path";

interface RegisterFileParams {
  filePath: string;       // 文件在 private-assets/ 下的相对路径
  displayName: string;    // 可读的文件名
  fileType?: "pdf" | "image" | "other";
  category?: string;      // 自定义分类（如 author、cover、report）
  status?: "draft" | "published" | "archived";
}

/**
 * 注册新文件 —— 生成 UUID 并将文件元数据写入数据库
 * @returns 生成的 UUID，后续用这个 UUID 构建访问路径 /api/file/{uuid}
 */
export async function registerFile(params: RegisterFileParams) {
  const {
    filePath,
    displayName,
    fileType = "other",
    category,
    status = "draft",
  } = params;

  const uuid = uuidv4();
  const fullPath = join(process.cwd(), "private-assets", filePath);

  let fileSize: number | null = null;
  try {
    fileSize = statSync(fullPath).size;
  } catch {
    /* 文件可能尚未上传 */
  }

  await execute(
    `INSERT INTO file_registry (uuid, file_path, display_name, file_type, category, file_size, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuid, filePath, displayName, fileType, category || null, fileSize, status],
  );

  return uuid;
}

/**
 * 根据 UUID 查询文件信息 —— API Route 收到请求时用此函数查找真实路径
 * @returns 文件记录对象，不存在则返回 null
 */
export async function getFileByUUID(uuid: string) {
  const rows = await query(
    `SELECT uuid, file_path, display_name, file_type, category, file_size, status, created_at
     FROM file_registry WHERE uuid = ?`,
    [uuid],
  );
  return rows[0] || null;
}

/**
 * 查询文件列表 —— 支持按状态和分类筛选，用于管理后台展示
 * @example listFiles({ status: "published", category: "report" })
 */
export async function listFiles(options?: {
  status?: string;
  category?: string;
}) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (options?.status) {
    conditions.push("status = ?");
    params.push(options.status);
  }
  if (options?.category) {
    conditions.push("category = ?");
    params.push(options.category);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return query(
    `SELECT uuid, file_path, display_name, file_type, category, file_size, status, created_at
     FROM file_registry ${where}
     ORDER BY created_at DESC`,
    params,
  );
}

/**
 * 更新文件发布状态 —— 控制文件是否可被外部访问
 * - draft: 草稿，API 不返回
 * - published: 已发布，API 正常返回
 * - archived: 已归档，API 不返回
 */
export async function updateFileStatus(
  uuid: string,
  status: "draft" | "published" | "archived",
) {
  await execute(`UPDATE file_registry SET status = ? WHERE uuid = ?`, [
    status,
    uuid,
  ]);
}

/**
 * 记录一次下载行为 —— 写入 download_logs 表，用于统计和审计
 * 记录下载者的 IP、浏览器信息和来源页面
 */
export async function logDownload(
  fileUUID: string,
  ip?: string,
  userAgent?: string,
  referer?: string,
) {
  await execute(
    `INSERT INTO download_logs (file_uuid, ip, user_agent, referer)
     VALUES (?, ?, ?, ?)`,
    [fileUUID, ip || null, userAgent || null, referer || null],
  );
}
