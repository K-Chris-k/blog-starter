# Tenways IR — 投资者关系网站

基于 Next.js App Router 构建的投资者关系（IR）网站，支持多语言、文件加密保护、PDF 下载、错误日志等企业级功能。

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | >= 20.x | 运行环境 |
| Next.js | 16.x (App Router) | 前端框架 |
| React | 19.x | UI 库 |
| TypeScript | 5.x | 类型检查 |
| next-intl | 4.x | 国际化（i18n） |
| Tailwind CSS | 3.x | 样式框架 |
| MySQL | 9.x | 数据库 |
| mysql2 | 3.x | Node.js MySQL 驱动 |
| bcryptjs | 3.x | 密码加密（后台管理） |

## 支持语言

- English (en) — 默认
- Nederlands (nl) — 荷兰语
- Italiano (it) — 意大利语

## 项目结构

```
├── _posts/{locale}/          # Markdown 文章（按语言分目录）
├── messages/                 # i18n 翻译文件（en.json / nl.json / it.json）
├── private-assets/           # 受保护的文件（图片、PDF，不对外暴露）
│   ├── blog/                 # 文章图片（作者头像、封面）
│   └── reports/              # 财报 PDF
├── public/favicon/           # 网站图标
├── scripts/                  # 数据库和文件注册脚本
│   ├── init-db.sql           # 初始化数据库（建库 + 3 张基础表）
│   ├── add-ir-tables.sql     # IR 功能扩展表（邮件订阅、RSS、联系表单）
│   ├── db-config.mjs         # 脚本共享数据库配置（读取 .env.development）
│   ├── register-images.mjs   # 注册图片到数据库（生成 UUID）
│   └── register-pdf.mjs      # 注册 PDF 到数据库（生成 UUID）
├── src/
│   ├── app/
│   │   ├── [locale]/         # 前台国际化页面
│   │   │   ├── page.tsx              # 首页
│   │   │   ├── posts/[slug]/page.tsx # 文章详情
│   │   │   ├── email-alerts/         # 邮件订阅页
│   │   │   ├── rss-feeds/            # RSS 订阅页
│   │   │   └── ir-contacts/          # 投资者联系页
│   │   ├── ir-dashboard/     # 后台管理系统（独立路由，不走 i18n）
│   │   │   ├── login/                # 登录页
│   │   │   ├── (dashboard)/          # 管理面板（Route Group，共享侧边栏）
│   │   │   │   ├── page.tsx          # 仪表盘
│   │   │   │   ├── error-logs/       # 错误日志管理
│   │   │   │   ├── files/            # 文件管理
│   │   │   │   ├── downloads/        # 下载记录
│   │   │   │   ├── subscriptions/    # 邮件订阅管理
│   │   │   │   ├── rss/              # RSS 管理
│   │   │   │   ├── contacts/         # 投资者联系管理
│   │   │   │   └── accounts/         # 账户管理
│   │   │   └── _components/          # 后台专用组件
│   │   ├── _components/      # 前台 UI 组件
│   │   └── api/              # API 路由
│   │       ├── ir-dashboard/         # 后台管理 API（登录、数据查询、账户管理）
│   │       ├── file/[uuid]/          # 通过 UUID 获取图片
│   │       ├── download/[uuid]/      # 通过 UUID 下载 PDF
│   │       ├── signed/[...path]/     # 签名 URL 文件服务
│   │       ├── email-subscribe/      # 邮件订阅 API
│   │       ├── ir-contact/           # 投资者联系表单 API
│   │       ├── rss/[type]/           # RSS Feed API
│   │       ├── errors/               # 错误日志 API
│   │       └── assets/[...path]/     # 备用资源 API
│   ├── i18n/                 # 国际化配置（routing + request）
│   └── lib/                  # 工具库
│       ├── db.ts             # 数据库连接池
│       ├── admin-auth.ts     # 后台认证（JWT 生成/验证、bcrypt 密码处理）
│       ├── files.ts          # 文件注册与查询
│       ├── signing.ts        # 签名 URL 生成与验证
│       ├── logger.ts         # 错误日志写入
│       └── api.ts            # Markdown 文章读取
└── .env.development          # 开发环境配置（不提交到 Git）
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.development` 文件：

```env
# MySQL 数据库配置
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=blog_starter
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here

# 签名 URL 密钥
SIGNING_SECRET=your_random_secret_here

# 后台管理 JWT 密钥
ADMIN_JWT_SECRET=your_admin_jwt_secret_here
```

### 3. 初始化数据库

确保 MySQL 服务已启动，然后执行：

```bash
# 创建数据库和基础表（error_logs、file_registry、download_logs）
mysql -u root -p < scripts/init-db.sql

# 创建 IR 扩展表（email_subscriptions、rss_feeds、ir_contact_messages）
mysql -u root -p < scripts/add-ir-tables.sql

# 创建后台管理员账户表
mysql -u root -p < scripts/add-admin-table.sql
```

### 4. 注册资源文件

```bash
# 注册图片到数据库（生成 UUID，用于文章中引用）
node scripts/register-images.mjs

# 注册 PDF 到数据库（生成 UUID，用于下载页面）
node scripts/register-pdf.mjs
```

### 5. 创建后台管理员

```bash
node scripts/create-admin.mjs admin your_password Administrator
```

### 6. 启动开发服务器

```bash
npm run dev
```

前台访问 http://localhost:3000
后台访问 http://localhost:3000/ir-dashboard/login

### 7. 构建与生产运行

```bash
npm run build
npm run start
```

## 数据库表结构

| 表名 | 用途 |
|------|------|
| `error_logs` | 前端/后端错误日志 |
| `file_registry` | 文件注册（图片、PDF 的 UUID 映射） |
| `download_logs` | 文件下载记录 |
| `email_subscriptions` | 邮件订阅 |
| `rss_feeds` | RSS 内容管理 |
| `ir_contact_messages` | 投资者联系表单 |
| `admin_accounts` | 后台管理员账户（用户名、bcrypt 密码、角色） |

## 主要功能

- **多语言支持**：基于 next-intl，URL 自动携带语言前缀（/en、/nl、/it）
- **文件加密保护**：图片和 PDF 通过 UUID 访问，真实路径不暴露
- **签名 URL 下载**：PDF 下载使用带时效和防重放的签名链接
- **错误日志系统**：自动捕获前端 JS 错误和后端 API 异常，写入数据库
- **投资者关系功能**：邮件订阅、RSS 订阅、IR 联系表单
- **安全防护**：三层目录保护（Nginx + Middleware + next.config.ts）、限速、文件名过滤
- **后台管理系统**（ir-dashboard）：
  - JWT + HttpOnly Cookie 认证，bcrypt 密码加密
  - 仪表盘：各表数据统计概览
  - 错误日志：可展开详情查看完整堆栈和上下文
  - 文件管理：查看所有受保护文件的 UUID、路径、状态
  - 下载记录、邮件订阅、RSS、投资者联系：分页 + 筛选查看
  - 账户管理：创建/启用/禁用管理员，支持 admin（完全权限）和 viewer（只读）角色

## 生产部署

生产环境需要：

1. 创建 `.env.production` 配置文件（替换数据库密码和签名密钥）
2. 配置 Nginx 反向代理（HTTPS、限流、敏感目录拦截、真实 IP 传递）
3. 使用 PM2 管理 Node.js 进程
