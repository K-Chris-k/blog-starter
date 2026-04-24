/**
 * 图片注册脚本 —— 把图片文件信息写入数据库，生成 UUID 访问链接
 *
 * 使用场景：项目初始化或新增图片时运行一次
 * 运行命令：node scripts/register-images.mjs
 *
 * 流程：
 *   1. 先把图片放入 private-assets/ 对应目录
 *   2. 在下方 images 数组中添加文件信息
 *   3. 运行此脚本，数据库生成 UUID
 *   4. 把打印出的 UUID 填到 Markdown 文章的 frontmatter 中
 *      例如: picture: "/api/file/{uuid}"
 *
 * 注意：已注册过的图片要从数组中删除或注释掉，否则会重复插入
 *
 * 与 register-pdf.mjs 的区别：
 *   - 图片用 /api/file/{uuid} 访问（直接显示在页面中）
 *   - PDF 用 /api/download/{uuid} 访问（触发下载 + 记录日志）
 */

import { pool } from "./db-config.mjs";  // 从 .env.local 读取数据库配置
import { v4 as uuidv4 } from "uuid";    // 生成随机 UUID
import { statSync } from "fs";           // 读取文件大小
import { join } from "path";             // 拼接文件路径

/**
 * 待注册的图片列表
 * - filePath:    文件在 private-assets/ 下的相对路径
 * - displayName: 显示名称（管理后台中看到的名字）
 * - category:    分类标签（author = 作者头像，cover = 文章封面）
 */
const images = [
  { filePath: "blog/authors/jj.jpeg", displayName: "jj.jpeg", category: "author" },
  { filePath: "blog/authors/joe.jpeg", displayName: "joe.jpeg", category: "author" },
  { filePath: "blog/authors/tim.jpeg", displayName: "tim.jpeg", category: "author" },
  { filePath: "blog/dynamic-routing/cover.jpg", displayName: "dynamic-routing-cover.jpg", category: "cover" },
  { filePath: "blog/hello-world/cover.jpg", displayName: "hello-world-cover.jpg", category: "cover" },
  { filePath: "blog/preview/cover.jpg", displayName: "preview-cover.jpg", category: "cover" },
];

/**
 * 主函数 —— 遍历 images 数组，逐个注册到数据库，并输出 UUID 映射表
 *
 * 每张图片执行：
 *   1. uuidv4() 生成随机 UUID
 *   2. statSync() 读取文件大小
 *   3. INSERT INTO file_registry 写入数据库（file_type = 'image'）
 *   4. 记录 filePath → UUID 的映射关系
 *
 * 最后打印完整映射表，方便批量替换 Markdown 中的图片路径
 */
async function main() {
  // 存储 "文件路径 → UUID" 的映射，最后统一打印
  const mapping = {};

  for (const img of images) {
    const uuid = uuidv4();
    const fullPath = join(process.cwd(), "private-assets", img.filePath);
    let fileSize = null;
    try {
      fileSize = statSync(fullPath).size;
    } catch {}

    // 写入数据库：file_type 固定为 'image'，status 固定为 'published'
    await pool.execute(
      `INSERT INTO file_registry (uuid, file_path, display_name, file_type, category, file_size, status)
       VALUES (?, ?, ?, 'image', ?, ?, 'published')`,
      [uuid, img.filePath, img.displayName, img.category, fileSize],
      //file_registry 字段 file_path 文件路径 display_name 文件名称 file_type 
      // 文件类型 category 文件分类 file_size 文件大小 status 文件状态
    );

    mapping[img.filePath] = uuid;
    console.log(`${img.filePath} → /api/file/${uuid}`);
  }

  // 打印完整映射表（JSON 格式），方便复制到 Markdown 文件中
  console.log("\n=== UUID Mapping ===");
  console.log(JSON.stringify(mapping, null, 2));

  await pool.end();
}

main().catch(console.error);
