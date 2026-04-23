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

const images = [
  { filePath: "blog/authors/jj.jpeg", displayName: "jj.jpeg", category: "author" },
  { filePath: "blog/authors/joe.jpeg", displayName: "joe.jpeg", category: "author" },
  { filePath: "blog/authors/tim.jpeg", displayName: "tim.jpeg", category: "author" },
  { filePath: "blog/dynamic-routing/cover.jpg", displayName: "dynamic-routing-cover.jpg", category: "cover" },
  { filePath: "blog/hello-world/cover.jpg", displayName: "hello-world-cover.jpg", category: "cover" },
  { filePath: "blog/preview/cover.jpg", displayName: "preview-cover.jpg", category: "cover" },
];

async function main() {
  const mapping = {};

  for (const img of images) {
    const uuid = uuidv4();
    const fullPath = join(process.cwd(), "private-assets", img.filePath);
    let fileSize = null;
    try {
      fileSize = statSync(fullPath).size;
    } catch {}

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

  console.log("\n=== UUID Mapping ===");
  console.log(JSON.stringify(mapping, null, 2));

  await pool.end();
}

main().catch(console.error);
