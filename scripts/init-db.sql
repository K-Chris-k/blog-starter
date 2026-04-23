-- 创建数据库（如果不存在），使用 utf8mb4 字符集以支持中文和 emoji
CREATE DATABASE IF NOT EXISTS blog_starter CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog_starter;

-- ============================================================
-- 表1: 错误日志表 —— 记录前端和后端的错误信息，用于监控和排查问题
-- ============================================================
CREATE TABLE IF NOT EXISTS error_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,              -- 自增主键
  source ENUM('frontend', 'backend') NOT NULL,    -- 错误来源：前端浏览器 / 后端服务器
  level ENUM('error', 'warn', 'info') DEFAULT 'error', -- 严重级别
  message TEXT NOT NULL,                           -- 错误信息（Data / Message）
  stack TEXT,                                      -- 错误堆栈（方便定位代码位置）
  url VARCHAR(2048),                               -- 发生错误时的完整 URL
  page_path VARCHAR(2048),                         -- 页面路径（不含域名，如 /en/posts/hello-world）
  referer VARCHAR(2048),                           -- 来源页面（从哪个页面跳转过来触发错误的）
  language VARCHAR(20),                            -- 浏览器语言（如 zh-CN、en-US）
  screen_resolution VARCHAR(20),                   -- 屏幕分辨率（如 1920x1080）
  user_agent VARCHAR(1024),                        -- 浏览器信息（判断是哪个设备/浏览器）
  ip VARCHAR(45),                                  -- 用户 IP 地址（IPv4 或 IPv6）
  metadata JSON,                                   -- 额外信息（灵活的 JSON 字段）
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3), -- 记录时间，精确到毫秒
  INDEX idx_source (source),                       -- 索引：按来源快速查询
  INDEX idx_level (level),                         -- 索引：按级别快速查询
  INDEX idx_created_at (created_at)                -- 索引：按时间快速查询
);

-- 表2: 文件注册表 —— 所有受保护文件（图片、PDF等）的元数据

CREATE TABLE IF NOT EXISTS file_registry (
  uuid CHAR(36) PRIMARY KEY,                       -- UUID 主键，对外暴露的唯一标识
  file_path VARCHAR(512) NOT NULL,                 -- 文件在 private-assets/ 下的真实路径（对外不可见）
  display_name VARCHAR(255) NOT NULL,              -- 人类可读的文件名（管理后台或下载时显示）
  file_type ENUM('pdf', 'image', 'other') DEFAULT 'other', -- 文件类型
  category VARCHAR(100),                           -- 自定义分类（如 author、cover、report）
  file_size BIGINT,                                -- 文件大小（字节）
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft', -- 发布状态：草稿/已发布/已归档，API 只返回 published
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 创建时间
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 最后更新时间（自动更新）
  INDEX idx_status (status),                       -- 索引：按状态筛选
  INDEX idx_category (category)                    -- 索引：按分类筛选
);

-- 表3: 下载日志表 —— 记录每一次文件下载行为，用于统计和审计
CREATE TABLE IF NOT EXISTS download_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,               -- 自增主键
  file_uuid CHAR(36) NOT NULL,                     -- 关联 file_registry 表的 UUID（下载了哪个文件）
  ip VARCHAR(45),                                  -- 下载者的 IP 地址
  user_agent VARCHAR(1024),                        -- 下载者的浏览器信息
  referer VARCHAR(2048),                           -- 从哪个页面发起的下载
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 下载时间
  INDEX idx_file_uuid (file_uuid),                 -- 索引：按文件查询下载记录
  INDEX idx_downloaded_at (downloaded_at),          -- 索引：按时间查询
  FOREIGN KEY (file_uuid) REFERENCES file_registry(uuid) -- 外键约束：必须是已注册的文件
);
