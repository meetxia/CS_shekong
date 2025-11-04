# Supabase 部署方案说明

## 📌 核心概念

**Supabase 本身就是云服务，不需要你自己部署服务器！**

有两种理解方式：

### 方式 1：使用 Supabase 云服务（推荐）⭐

- **无需部署服务器**：Supabase 提供托管服务
- **无需维护**：数据库、API、认证都由 Supabase 管理
- **免费额度**：有免费 tier，足够 MVP 使用
- **自动备份**：数据自动备份
- **全球 CDN**：自动分发，访问速度快

**你的项目只需要部署前端代码即可！**

### 方式 2：自托管 Supabase（高级）

如果你有特殊需求（如数据合规、私有部署），可以自己部署 Supabase：

- 使用 Docker Compose 部署
- 需要自己的服务器（VPS/云服务器）
- 需要维护数据库和基础设施
- 适合企业级需求

## 🚀 推荐方案：仅部署前端 + Supabase 云服务

### 架构图

```
用户浏览器
    ↓
前端应用（Vercel/Netlify/你的服务器）
    ↓
Supabase 云服务（自动托管）
    ├── PostgreSQL 数据库
    ├── REST API
    ├── 实时订阅
    └── 存储服务
```

### 部署步骤

#### 1. 前端部署（三选一）

**选项 A：Vercel（推荐，免费）**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

**选项 B：Netlify（免费）**

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod
```

**选项 C：你自己的服务器**

```bash
# 构建生产版本
npm run build

# 将 dist 目录部署到服务器（Nginx/Apache）
```

#### 2. 配置环境变量

在部署平台（Vercel/Netlify）或你的服务器上配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Vercel 配置：**
1. 项目设置 → Environment Variables
2. 添加 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
3. 重新部署

**Netlify 配置：**
1. Site settings → Environment variables
2. 添加环境变量
3. 重新部署

#### 3. Supabase 配置（无需额外操作）

- Supabase 项目已经运行在云端
- 数据库脚本已执行
- API 自动可用
- 无需维护

## 💰 成本对比

### 使用 Supabase 云服务

| 方案 | 成本 | 说明 |
|------|------|------|
| **免费 tier** | $0/月 | 500MB 数据库，50K MAU，适合 MVP |
| **Pro** | $25/月 | 8GB 数据库，100K MAU，适合生产 |
| **Team** | $599/月 | 更大规模，团队协作 |

### 自托管 Supabase

| 项目 | 成本 | 说明 |
|------|------|------|
| **服务器** | $5-50/月 | VPS/云服务器 |
| **维护时间** | 每周几小时 | 更新、备份、监控 |
| **总成本** | 较高 | 人力 + 服务器成本 |

## 🎯 推荐方案：Supabase 云服务

### 优势

1. **零维护成本**
   - 无需管理服务器
   - 无需配置数据库
   - 自动更新和备份

2. **免费额度充足**
   - 500MB 数据库空间
   - 50,000 月度活跃用户
   - 2GB 带宽/月
   - **足够 MVP 使用**

3. **全球加速**
   - 自动 CDN 分发
   - 多区域部署
   - 低延迟访问

4. **安全可靠**
   - 自动 SSL 证书
   - 数据加密
   - 定期备份
   - 99.9% 可用性 SLA（付费版）

5. **易于扩展**
   - 按需升级
   - 无需迁移数据
   - 平滑扩展

### 适用场景

✅ **适合使用 Supabase 云服务：**
- MVP 产品
- 中小型应用
- 快速开发
- 无特殊合规要求

❌ **考虑自托管：**
- 严格的数据合规要求
- 需要完全控制数据
- 有大量并发（10万+）
- 企业内部部署

## 📦 完整部署清单

### 前端部署

- [ ] 构建生产版本：`npm run build`
- [ ] 选择部署平台（Vercel/Netlify/自建服务器）
- [ ] 配置环境变量
- [ ] 部署前端代码
- [ ] 测试激活码功能

### Supabase 配置

- [ ] 创建 Supabase 项目
- [ ] 执行数据库脚本
- [ ] 获取 API 密钥
- [ ] 配置 RLS 策略（已包含在脚本中）
- [ ] 生成测试激活码

### 生产环境检查

- [ ] 测试激活码验证
- [ ] 测试使用次数限制
- [ ] 测试过期时间
- [ ] 检查错误日志
- [ ] 配置监控（可选）

## 🔒 安全建议

### 使用 Supabase 云服务时

1. **使用 Anon Key（前端）**
   - 只能读取公开数据
   - 受 RLS 策略保护
   - 安全用于前端

2. **使用 Service Role Key（仅后端）**
   - 拥有完整权限
   - **不要暴露在前端代码中**
   - 仅用于服务器端脚本

3. **启用 RLS**
   - 限制数据访问
   - 保护用户隐私
   - 防止未授权访问

4. **定期备份**
   - Supabase 自动备份（付费版）
   - 免费版建议手动导出

## 📚 相关资源

### 官方文档

- [Supabase 部署指南](https://supabase.com/docs/guides/deployment)
- [Supabase 自托管文档](https://supabase.com/docs/guides/self-hosting)
- [Supabase 定价](https://supabase.com/pricing)

### 前端部署

- [Vercel 部署指南](https://vercel.com/docs)
- [Netlify 部署指南](https://docs.netlify.com/)

## 🎉 总结

**对于你的项目：**

1. ✅ **推荐使用 Supabase 云服务**（免费 tier）
2. ✅ **只需部署前端代码**（Vercel/Netlify）
3. ✅ **无需部署服务器**
4. ✅ **零维护成本**

**部署流程：**
```
前端代码 → Vercel/Netlify → 用户访问
                ↓
        Supabase 云服务（自动托管）
```

**成本：**
- 前端部署：$0（Vercel/Netlify 免费）
- 后端服务：$0（Supabase 免费 tier）
- **总成本：$0/月** 🎉

