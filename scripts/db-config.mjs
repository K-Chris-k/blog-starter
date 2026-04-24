/**
 * 脚本共享的数据库配置 —— 从 .env.development 读取数据库连接信息
 *
 * 所有脚本（register-images.mjs、register-pdf.mjs 等）统一引用此模块，
 * 避免在各脚本中硬编码数据库密码和连接参数。
 *
 * 使用方式：
 *   import { pool } from "./db-config.mjs";
 */
import dotenv from "dotenv";
import { resolve } from "path";
import mysql from "mysql2/promise";

// 加载项目根目录的 .env.development 文件
dotenv.config({ path: resolve(process.cwd(), ".env.development") });

if (!process.env.MYSQL_PASSWORD) {
  console.error(
    "错误：未找到 MYSQL_PASSWORD 环境变量，请检查 .env.development 文件",
  );
  process.exit(1);
}

export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "127.0.0.1",
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || "blog_starter",
});
