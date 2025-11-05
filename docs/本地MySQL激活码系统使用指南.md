# 本地MySQL激活码系统使用指南

## 🎯 系统概述

社恐测评系统已成功迁移到本地MySQL数据库，包含完整的激活码管理功能和AI分析功能。

---

## 📦 系统架构

### 前端
- **框架**: Vue 3 + Vite
- **管理后台**: `/admin` 路由
- **API调用**: `src/utils/backendActivation.js`

### 后端
- **框架**: Node.js + Express
- **数据库**: MySQL 8.0
- **端口**: 3001

### 数据库
- **名称**: `shekong_ai`
- **表结构**: 5张表
  - `reports` - 测评报告
  - `activation_codes` - 激活码
  - `activation_records` - 激活记录
  - `ai_generation_logs` - AI生成日志
  - `ai_stats` - AI统计

---

## 🚀 快速启动

### 1. 启动后端服务

```bash
cd backend
npm run dev
```

服务将运行在 `http://localhost:3001`

### 2. 启动前端

```bash
npm run dev
```

前端将运行在 `http://localhost:5173`

### 3. 访问管理后台

```
http://localhost:5173/#/admin
```

---

## 🎫 测试激活码

系统已预置3个测试激活码：

| 激活码 | 最大使用次数 | 每日限制 | 有效期 | 备注 |
|--------|------------|---------|--------|------|
| `TEST-2024-0001` | 100 | 10 | 365天 | 测试激活码 |
| `DEMO-2024-0001` | 10 | 3 | 7天 | 演示激活码 |
| `VIP1-2024-0001` | 1000 | 50 | 365天 | VIP激活码 |

---

## 🔐 后端API接口

### 用户端接口

#### 验证激活码
```http
POST /api/activation/verify
Content-Type: application/json

{
  "code": "TEST-2024-0001",
  "deviceId": "user_device_id"
}
```

#### 记录使用次数
```http
POST /api/activation/record-usage
Content-Type: application/json

{
  "recordId": 123
}
```

#### AI生成分析
```http
POST /api/ai/generate
Content-Type: application/json

{
  "report": {...},
  "answers": {...},
  "basicInfo": {...},
  "userId": "device_id"
}
```

### 管理端接口

#### 列表激活码
```http
GET /api/admin/codes?page=1&pageSize=20&status=active&q=TEST
```

#### 创建激活码
```http
POST /api/admin/codes
Content-Type: application/json

{
  "code": "XXXX-XXXX-XXXX",  // 可选，不传则自动生成
  "max_uses": 100,
  "daily_limit": 10,
  "validity_days": 30,
  "expires_at": "2025-12-31 23:59:59",  // 可选
  "notes": "备注信息"
}
```

#### 批量创建激活码
```http
POST /api/admin/codes/bulk
Content-Type: application/json

{
  "items": [
    {
      "max_uses": 100,
      "daily_limit": 10,
      "validity_days": 30,
      "notes": "批量测试码"
    }
  ]
}
```

#### 更新激活码
```http
PUT /api/admin/codes/:id
Content-Type: application/json

{
  "max_uses": 200,
  "notes": "更新后的备注"
}
```

#### 撤销激活码
```http
POST /api/admin/codes/:id/revoke
```

#### 删除激活码
```http
DELETE /api/admin/codes/:id
```

#### 获取统计数据
```http
GET /api/admin/stats
```

#### 获取激活记录
```http
GET /api/admin/records/:code?limit=30
```

---

## 📊 数据库表结构

### 1. activation_codes（激活码表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| code | VARCHAR(14) | 激活码（XXXX-XXXX-XXXX） |
| status | VARCHAR(20) | 状态（active/used/expired/revoked） |
| max_uses | INT | 最大使用次数 |
| current_uses | INT | 当前使用次数 |
| daily_limit | INT | 每日使用限制 |
| validity_days | INT | 有效期天数 |
| expires_at | DATETIME | 过期时间 |
| notes | TEXT | 备注 |
| created_by | VARCHAR(50) | 创建者 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 2. activation_records（激活记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| code_id | INT | 激活码ID |
| activation_code | VARCHAR(14) | 激活码 |
| user_device_id | VARCHAR(255) | 设备ID |
| ip_address | VARCHAR(45) | IP地址 |
| activated_at | DATETIME | 激活时间 |
| expires_at | DATETIME | 本次激活过期时间 |
| usage_count | INT | 总使用次数 |
| last_used_at | DATETIME | 最后使用时间 |
| usage_by_date | JSON | 按日期统计 |

### 3. reports（测评报告表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | VARCHAR(255) | 用户设备ID |
| activation_code | VARCHAR(14) | 使用的激活码 |
| total_score | INT | 总分 |
| level_name | VARCHAR(255) | 等级名称 |
| type_name | VARCHAR(255) | 类型名称 |
| ai_generated | BOOLEAN | 是否AI生成 |
| report_data | JSON | 完整报告数据 |
| created_at | TIMESTAMP | 创建时间 |

### 4. ai_generation_logs（AI生成日志表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | VARCHAR(255) | 用户ID |
| report_id | INT | 关联报告ID |
| success | BOOLEAN | 是否成功 |
| error_message | TEXT | 错误信息 |
| response_time | INT | 响应时间(ms) |
| created_at | DATETIME | 创建时间 |

---

## 💡 使用示例

### 前端调用示例

```javascript
import { verifyActivationCode, recordUsage } from '@/utils/backendActivation'

// 验证激活码
const result = await verifyActivationCode('TEST-2024-0001', 'device_123')
if (result.valid) {
  console.log('激活成功！')
  console.log('过期时间:', result.expiresAt)
  console.log('今日已用:', result.todayUsage)
  console.log('每日限制:', result.dailyLimit)
  
  // 记录使用
  await recordUsage(result.recordId)
}
```

### 管理端调用示例

```javascript
import { listActivationCodes, adminCreateCode, fetchActivationStats } from '@/utils/backendActivation'

// 获取激活码列表
const { list, total } = await listActivationCodes({
  page: 1,
  pageSize: 20,
  status: 'active',
  q: 'TEST'
})

// 创建激活码
const result = await adminCreateCode({
  max_uses: 100,
  daily_limit: 10,
  validity_days: 30,
  notes: '测试激活码'
})

// 获取统计
const stats = await fetchActivationStats()
console.log('总激活码数:', stats.totalCodes)
console.log('总激活次数:', stats.totalActivations)
```

---

## 🔧 环境配置

### 前端 `.env`

```env
VITE_BACKEND_URL=http://localhost:3001
```

### 后端 `.env`

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mojz168168
DB_NAME=shekong_ai

# AI配置
CLAUDE_API_KEY=sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657
CLAUDE_API_URL=https://dpapi.cn/v1/chat/completions
CLAUDE_MODEL=claude-4.5-sonnet

# 服务配置
PORT=3001
NODE_ENV=development
```

---

## 📈 部署到阿里云

### 1. 准备工作

- 确保服务器已安装 Node.js 18+
- 确保服务器已安装 MySQL 8.0
- 开放端口 3001

### 2. 上传代码

```bash
# 上传backend目录到服务器
scp -r backend/* user@your-server:/path/to/backend
```

### 3. 配置环境

```bash
# 在服务器上
cd /path/to/backend
npm install --production
```

### 4. 修改 `.env`

```env
DB_HOST=localhost  # 或你的MySQL地址
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=shekong_ai

PORT=3001
NODE_ENV=production
```

### 5. 初始化数据库

```bash
node initDb.js
```

### 6. 使用PM2启动

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name shekong-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 7. 配置Nginx反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8. 更新前端配置

```env
# 前端 .env.production
VITE_BACKEND_URL=http://your-domain.com
```

---

## ❓ 常见问题

### Q: 后端启动失败？
A: 检查MySQL是否运行，端口是否被占用，`.env`配置是否正确

### Q: 前端无法连接后端？
A: 检查后端是否启动，CORS是否配置，`VITE_BACKEND_URL`是否正确

### Q: 激活码验证失败？
A: 检查激活码格式（XXXX-XXXX-XXXX），状态是否为active，是否过期

### Q: AI生成失败？
A: 检查API Key是否有效，网络是否通畅，是否有额度

---

## 📞 技术支持

如有问题，请查看：
- 后端日志：`npm run dev` 的控制台输出
- MySQL日志：检查数据库连接和查询
- 网络请求：浏览器开发者工具 Network 面板

---

## 🎉 完成！

现在你的社恐测评系统已经完全运行在本地MySQL上，包含：

✅ AI智能分析（Claude 4.5 Sonnet）
✅ 激活码系统（验证、使用限制、统计）
✅ 管理后台（激活码CRUD、数据统计）
✅ 完整的API接口
✅ 测评报告持久化

祝使用愉快！🎊

