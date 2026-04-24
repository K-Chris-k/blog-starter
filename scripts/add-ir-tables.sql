-- ============================================================
-- IR 功能扩展表 —— Email 订阅、RSS 订阅、投资者联系表单
-- 运行方式：在 MySQL Workbench 中执行此文件
-- ============================================================
USE blog_starter;

-- ============================================================
-- 表4: 邮件订阅表 —— 记录用户订阅的邮件提醒类型
-- ============================================================
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,               -- 自增主键
  email VARCHAR(255) NOT NULL,                      -- 订阅者邮箱
  name VARCHAR(100),                                -- 订阅者姓名（可选）
  alert_types JSON NOT NULL,                        -- 订阅类型（JSON 数组，如 ["stock_quote","event","weekly_summary"]）
  is_active TINYINT(1) DEFAULT 1,                   -- 是否激活（1=有效，0=已退订）
  unsubscribe_token CHAR(36) NOT NULL,              -- 退订令牌（UUID），用于一键退订链接
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- 订阅时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 最后更新时间
  UNIQUE INDEX idx_email (email),                   -- 唯一索引：同一邮箱只能订阅一次
  INDEX idx_active (is_active)                      -- 索引：快速查询有效订阅
);

-- ============================================================
-- 表5: RSS 订阅记录表 —— 记录 RSS 订阅的内容类型
-- 用于生成不同类型的 RSS Feed（公告、新闻、财报等）
-- ============================================================
CREATE TABLE IF NOT EXISTS rss_feeds (
  id INT AUTO_INCREMENT PRIMARY KEY,               -- 自增主键
  feed_type VARCHAR(50) NOT NULL,                   -- Feed 类型（announcements / news / financial）
  title VARCHAR(255) NOT NULL,                      -- 条目标题
  description TEXT,                                 -- 条目摘要
  link VARCHAR(2048) NOT NULL,                      -- 条目链接
  pub_date DATETIME NOT NULL,                       -- 发布时间
  is_published TINYINT(1) DEFAULT 1,                -- 是否已发布
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- 创建时间
  INDEX idx_feed_type (feed_type),                  -- 索引：按类型查询
  INDEX idx_pub_date (pub_date),                    -- 索引：按发布时间排序
  INDEX idx_published (is_published)                -- 索引：筛选已发布
);

-- ============================================================
-- 表6: 投资者联系表单 —— 记录投资者通过网站提交的咨询信息
-- ============================================================
CREATE TABLE IF NOT EXISTS ir_contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,               -- 自增主键
  name VARCHAR(100) NOT NULL,                       -- 联系人姓名
  email VARCHAR(255) NOT NULL,                      -- 联系人邮箱
  company VARCHAR(200),                             -- 公司名称（可选）
  phone VARCHAR(50),                                -- 电话号码（可选）
  subject VARCHAR(255) NOT NULL,                    -- 咨询主题
  message TEXT NOT NULL,                            -- 咨询内容
  status ENUM('new', 'read', 'replied', 'closed') DEFAULT 'new', -- 处理状态
  ip VARCHAR(45),                                   -- 提交者 IP
  user_agent VARCHAR(1024),                         -- 提交者浏览器信息
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- 提交时间
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),                        -- 索引：按状态筛选
  INDEX idx_email (email),                          -- 索引：按邮箱查询
  INDEX idx_created_at (created_at)                 -- 索引：按时间排序
);
