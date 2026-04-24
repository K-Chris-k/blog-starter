/**
 * 数据库连接模块 —— 提供 MySQL 连接池和两个查询方法
 *
 * 连接池（Pool）：预先创建多个数据库连接复用，避免每次请求都建立/关闭连接
 * 所有配置从环境变量读取（.env.development），不在代码中硬编码任何敏感信息
 *
 * 必须在 .env.development 中配置以下变量：
 *   MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
 */

import mysql from "mysql2/promise";

let pool: mysql.Pool;

function getPool(): mysql.Pool {
  if (!pool) {
    if (!process.env.MYSQL_PASSWORD) {
      throw new Error(
        "Missing MYSQL_PASSWORD environment variable. Check .env.development",
      );
    }
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "127.0.0.1",
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || "blog_starter",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * 查询数据 —— 用于 SELECT 语句，返回行数组
 * 使用 pool.query()（非 prepared statement），支持 LIMIT/OFFSET 参数
 *
 * @example const users = await query("SELECT * FROM users WHERE id = ?", [1]);
 */
export async function query<T = any>(
  sql: string,
  params?: any[],
): Promise<T[]> {
  const [rows] = await getPool().query(sql, params);
  return rows as T[];
}

/**
 * 执行写操作 —— 用于 INSERT / UPDATE / DELETE 语句
 * 使用 pool.execute()（prepared statement），更安全
 * 返回 ResultSetHeader，包含 insertId、affectedRows 等信息
 *
 * @example const result = await execute("INSERT INTO users (name) VALUES (?)", ["Tom"]);
 *          console.log(result.insertId); // 新插入行的 ID
 */
export async function execute(sql: string, params?: any[]) {
  const [result] = await getPool().execute(sql, params);
  return result as mysql.ResultSetHeader;
}

export { getPool as getDbPool };
