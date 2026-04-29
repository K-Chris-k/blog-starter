-- ============================================================
-- 管理后台账户表 —— 用于后台登录认证和权限管理
-- 运行方式：mysql -u root -p < scripts/add-admin-table.sql
-- ============================================================
USE blog_starter;

CREATE TABLE IF NOT EXISTS admin_accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,                     -- 登录用户名
  password_hash VARCHAR(255) NOT NULL,               -- bcrypt 加密后的密码
  display_name VARCHAR(100),                         -- 显示名称
  role ENUM('admin', 'viewer') DEFAULT 'viewer',     -- 角色：admin 可管理，viewer 只读
  is_active TINYINT(1) DEFAULT 1,                    -- 是否启用
  last_login_at DATETIME,                            -- 最后登录时间
  last_login_ip VARCHAR(45),                         -- 最后登录 IP
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_username (username),
  INDEX idx_active (is_active)
);
