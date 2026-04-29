/**
 * 初始管理员创建脚本 —— 首次部署时运行，创建第一个 admin 账户
 *
 * 使用方式：
 *   node scripts/create-admin.mjs <username> <password> [displayName]
 *
 * 示例：
 *   node scripts/create-admin.mjs admin Admin@123 Administrator
 */
import { pool } from "./db-config.mjs";
import bcrypt from "bcryptjs";

const [, , username, password, displayName] = process.argv;

if (!username || !password) {
  console.error("用法: node scripts/create-admin.mjs <username> <password> [displayName]");
  console.error("示例: node scripts/create-admin.mjs admin Admin@123 Administrator");
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    "INSERT INTO admin_accounts (username, password_hash, display_name, role, is_active) VALUES (?, ?, ?, 'admin', 1)",
    [username, hash, displayName || username],
  );
  console.log(`管理员账户创建成功：${username} (role: admin)`);
} catch (err) {
  if (err.code === "ER_DUP_ENTRY") {
    console.error(`错误：用户名 "${username}" 已存在`);
  } else {
    console.error("创建失败:", err.message);
  }
  process.exit(1);
} finally {
  await pool.end();
}
