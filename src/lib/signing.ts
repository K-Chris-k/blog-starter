/**
 * 签名 URL 模块 —— 生成和验证带有 HMAC-SHA256 签名的临时访问链接
 *
 * 安全机制：
 *   1. HMAC-SHA256 签名 → 无法伪造或篡改
 *   2. 过期时间 → 链接有时效性
 *   3. nonce 随机数 → 每次生成的 URL 都不同，防止重放攻击（同一链接只能用一次）
 *   4. timingSafeEqual → 防止时序攻击
 *
 * 签名 = HMAC-SHA256(密钥, "文件路径:过期时间戳:nonce随机数")
 */

import crypto from "crypto";

/** 签名密钥：从 .env.development 读取，生产环境必须设置为随机强密码 */
function getSecret(): string {
  if (!process.env.SIGNING_SECRET) {
    throw new Error(
      "Missing SIGNING_SECRET environment variable. Check .env.development",
    );
  }
  return process.env.SIGNING_SECRET;
}

/**
 * 已使用过的 nonce 集合 —— 防重放攻击
 * 同一个签名 URL 只能被使用一次，用过的 nonce 记录在这里
 * 生产环境应改用 Redis 存储（支持多实例 + 自动过期）
 */
const usedNonces = new Set<string>();

/** 定期清理过期的 nonce，防止内存泄漏（每 10 分钟清空） */
setInterval(() => {
  usedNonces.clear();
}, 10 * 60 * 1000);

/**
 * 生成签名 URL —— 给文件创建一个有时间限制的一次性访问链接
 *
 * @param filePath - 文件在 private-assets/ 下的相对路径
 * @param expiresInSeconds - 有效期（秒），默认 3600 秒，PDF 下载一般传 300 秒 = 5 分钟
 * @returns 带签名的 URL，如 /api/signed/reports/xxx.pdf?expires=...&nonce=...&signature=...
 */
export function generateSignedUrl(
  filePath: string,
  expiresInSeconds = 3600,
): string {
  // 计算过期时间：当前时间 + 有效秒数 → Unix 时间戳（秒）
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // 生成 16 字节随机数（nonce），每次不同，防止链接被转发重复使用
  const nonce = crypto.randomBytes(16).toString("hex");

  // 待签名的数据：文件路径 + 过期时间 + nonce，用冒号拼接
  const data = `${filePath}:${expires}:${nonce}`;

  // 用 HMAC-SHA256 算法 + SECRET 密钥 生成签名
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("hex");

  return `/api/signed/${filePath}?expires=${expires}&nonce=${nonce}&signature=${signature}`;
}

/**
 * 验证签名 URL —— 检查签名是否有效、未过期、未被使用过
 *
 * @returns true = 签名有效且未过期且首次使用，false = 无效/过期/已被用过
 */
export function verifySignature(
  filePath: string,
  expires: number,
  nonce: string,
  signature: string,
): boolean {
  // 检查 1：是否已过期
  if (Date.now() / 1000 > expires) return false;

  // 检查 2：nonce 是否已被使用过（防重放攻击）
  // 同一个链接被转发给别人，第二次使用时会被拒绝
  const nonceKey = `${signature}`;
  if (usedNonces.has(nonceKey)) return false;

  // 检查 3：用同样的方式重新计算签名
  const data = `${filePath}:${expires}:${nonce}`;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("hex");

  // 检查 4：用 timingSafeEqual 比较，防止时序攻击
  let valid: boolean;
  try {
    valid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    );
  } catch {
    return false;
  }

  // 签名有效，标记 nonce 为已使用
  if (valid) {
    usedNonces.add(nonceKey);
  }

  return valid;
}
