/**
 * 注册 PDF 到数据库 —— 运行一次即可
 * 用法: node scripts/register-pdf.mjs
 */

import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import { statSync } from "fs";
import { join } from "path";

const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "Root@123456",
  database: "blog_starter",
});

const pdfs = [
  {
    filePath: "reports/sehk26022702274_c.pdf",
    displayName: "测试pdf 链接下载uuid",
    category: "report",
  },
];

async function main() {
  for (const pdf of pdfs) {
    const uuid = uuidv4();
    const fullPath = join(process.cwd(), "private-assets", pdf.filePath);
    let fileSize = null;
    try {
      fileSize = statSync(fullPath).size;
    } catch {}

    await pool.execute(
      `INSERT INTO file_registry (uuid, file_path, display_name, file_type, category, file_size, status)
       VALUES (?, ?, ?, 'pdf', ?, ?, 'published')`,
      [uuid, pdf.filePath, pdf.displayName, pdf.category, fileSize],
    );

    console.log(`${pdf.displayName}`);
    console.log(`  路径: ${pdf.filePath}`);
    console.log(`  UUID: ${uuid}`);
    console.log(`  下载链接: /api/download/${uuid}`);
    console.log();
    //终端运行命令
    //node scripts/register-pdf.mjs
    
  }

  await pool.end();
}

main().catch(console.error);
