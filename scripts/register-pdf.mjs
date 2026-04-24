/**
 * PDF 注册脚本 —— 把 PDF 文件信息写入数据库，生成 UUID 访问链接
 *
 * 使用场景：每次有新的 PDF（如季度财报）需要上线时运行
 * 运行命令：node scripts/register-pdf.mjs
 *
 * 流程：
 *   1. 先把 PDF 文件放入 private-assets/reports/ 目录
 *   2. 在下方 pdfs 数组中添加文件信息
 *   3. 运行此脚本，数据库生成 UUID
 *   4. 页面自动从数据库读取并展示下载卡片，无需改页面代码
 *
 * 注意：已注册过的 PDF 要从数组中删除或注释掉，否则会重复插入
 */

import { pool } from "./db-config.mjs";  // 从 .env.local 读取数据库配置
import { v4 as uuidv4 } from "uuid";    // 生成随机 UUID
import { statSync } from "fs";           // 读取文件大小
import { join } from "path";             // 拼接文件路径

/**
 * 待注册的 PDF 列表
 * - filePath:    文件在 private-assets/ 下的相对路径
 * - displayName: 显示名称（页面上和下载时用户看到的名字）
 * - category:    分类标签（report = 财报，用于页面筛选）
 */
const pdfs = [
  {
    filePath: "reports/sehk26022702274_c.pdf",
    displayName: "测试pdf 链接下载uuid",
    category: "report",
  },
];

/**
 * 主函数 —— 遍历 pdfs 数组，逐个注册到数据库
 *
 * 每个 PDF 执行：
 *   1. uuidv4() 生成随机 UUID（如 d30117f5-f9fe-41b5-...）
 *   2. statSync() 读取文件大小（字节数）
 *   3. INSERT INTO file_registry 写入数据库
 *   4. 打印 UUID 和下载链接供参考
 */
async function main() {
  for (const pdf of pdfs) {
    // 生成唯一标识符，每次运行都不同
    const uuid = uuidv4();

    // 拼接完整路径，读取文件大小
    const fullPath = join(process.cwd(), "private-assets", pdf.filePath);
    let fileSize = null;
    try {
      fileSize = statSync(fullPath).size;
    } catch {} // 文件不存在时跳过，不影响注册

    // 写入数据库：file_type 固定为 'pdf'，status 固定为 'published'（直接可下载）
    await pool.execute(
      `INSERT INTO file_registry (uuid, file_path, display_name, file_type, category, file_size, status)
       VALUES (?, ?, ?, 'pdf', ?, ?, 'published')`,
      [uuid, pdf.filePath, pdf.displayName, pdf.category, fileSize],
    );

    // 打印注册结果
    console.log(`${pdf.displayName}`);
    console.log(`  路径: ${pdf.filePath}`);
    console.log(`  UUID: ${uuid}`);
    console.log(`  下载链接: /api/download/${uuid}`);
    console.log();
    //终端运行命令
    //node scripts/register-pdf.mjs
  }

  // 关闭数据库连接
  await pool.end();
}

main().catch(console.error);
