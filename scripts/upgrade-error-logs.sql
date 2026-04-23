-- 升级 error_logs 表 —— 新增更多错误上下文字段
USE blog_starter;

-- 新增字段：页面路径（不含域名，如 /en/posts/hello-world）
ALTER TABLE error_logs ADD COLUMN page_path VARCHAR(2048) AFTER url;

-- 新增字段：来源页面（从哪个页面跳转过来的）
ALTER TABLE error_logs ADD COLUMN referer VARCHAR(2048) AFTER page_path;

-- 新增字段：浏览器语言（如 zh-CN、en-US）
ALTER TABLE error_logs ADD COLUMN language VARCHAR(20) AFTER referer;

-- 新增字段：屏幕分辨率（如 1920x1080）
ALTER TABLE error_logs ADD COLUMN screen_resolution VARCHAR(20) AFTER language;

-- 升级时间精度：从秒级改为毫秒级
ALTER TABLE error_logs MODIFY COLUMN created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3);
