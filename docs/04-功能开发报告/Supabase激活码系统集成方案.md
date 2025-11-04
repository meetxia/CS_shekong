# Supabase 激活码系统集成方案

## 概述

本方案将现有的前端模拟激活码验证系统迁移到 Supabase 后端，实现真正的激活码验证、使用次数追踪和过期管理。

## 方案优势

1. **无需自建服务器**：Supabase 提供完整的后端服务
2. **实时数据库**：PostgreSQL 数据库，支持实时查询
3. **安全可靠**：Row Level Security (RLS) 保护数据安全
4. **易于部署**：前端可以直接调用 Supabase API
5. **成本可控**：免费 tier 足够 MVP 使用

## 架构设计

```
前端 (Vue.js)
    ↓
Supabase Client SDK
    ↓
Supabase API (REST)
    ↓
PostgreSQL 数据库
    ├── activation_codes (激活码表)
    └── activation_records (激活记录表)
```

## 实施步骤

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取项目 URL 和 API Key（anon key）

### 2. 执行数据库脚本

在 Supabase SQL Editor 中执行 `supabase_activation_setup.sql`

### 3. 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

### 4. 配置环境变量

创建 `.env` 文件（不要提交到 Git）：

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. 修改前端代码

参考 `src/utils/supabaseClient.js` 和更新后的 `src/utils/activation.js`

## 功能特性

### 激活码验证
- ✅ 格式验证（XXXX-XXXX-XXXX）
- ✅ 状态检查（active/used/expired/revoked）
- ✅ 过期时间检查
- ✅ 使用次数限制

### 使用追踪
- ✅ 每日使用次数限制（默认3次）
- ✅ 有效期管理（默认7天）
- ✅ 按日期记录使用情况
- ✅ 总使用次数统计

### 安全特性
- ✅ Row Level Security (RLS)
- ✅ 数据库函数权限控制
- ✅ 防止重复激活（可选）

## 数据库表结构

### activation_codes
激活码主表，存储所有激活码信息。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code | VARCHAR(14) | 激活码（唯一） |
| status | VARCHAR(20) | 状态：active/used/expired/revoked |
| max_uses | INTEGER | 最大使用次数 |
| current_uses | INTEGER | 当前使用次数 |
| expires_at | TIMESTAMPTZ | 过期时间 |
| daily_limit | INTEGER | 每天使用次数限制 |
| validity_days | INTEGER | 有效期天数 |

### activation_records
激活记录表，追踪每次激活和使用情况。

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| code_id | UUID | 关联激活码ID |
| activation_code | VARCHAR(14) | 激活码 |
| user_device_id | TEXT | 设备标识（可选） |
| expires_at | TIMESTAMPTZ | 本次激活过期时间 |
| usage_count | INTEGER | 已使用次数 |
| usage_by_date | JSONB | 按日期记录使用次数 |

## API 函数

### verify_activation_code(code, device_id?)
验证激活码并创建/更新激活记录。

**返回值：**
```json
{
  "valid": true,
  "record_id": "uuid",
  "expires_at": "2024-01-08T00:00:00Z",
  "remaining_today": 2,
  "days_left": 7
}
```

### get_activation_status(code)
获取激活码的当前状态。

**返回值：**
```json
{
  "expired": false,
  "days_left": 6,
  "remaining_today": 2,
  "daily_limit": 3,
  "total_usage": 5,
  "expires_at": "2024-01-08T00:00:00Z"
}
```

## 使用示例

### 前端验证激活码

```javascript
import { verifyActivationCode } from '@/utils/activation'

const result = await verifyActivationCode('TEST-2024-ABCD')
if (result.valid) {
  console.log('激活成功！')
  console.log(`剩余天数：${result.days_left}`)
  console.log(`今日剩余次数：${result.remaining_today}`)
}
```

### 检查激活状态

```javascript
import { getActivationStatus } from '@/utils/activation'

const status = await getActivationStatus('TEST-2024-ABCD')
console.log(`剩余天数：${status.days_left}`)
console.log(`今日剩余次数：${status.remaining_today}`)
```

## 管理后台功能（可选）

可以通过 Supabase Dashboard 或创建管理界面来：

1. **生成激活码**
   - 批量生成
   - 设置使用限制
   - 设置过期时间

2. **查看统计**
   - 激活码使用情况
   - 用户使用统计
   - 过期激活码列表

3. **管理激活码**
   - 启用/禁用激活码
   - 修改使用限制
   - 删除激活码

## 成本估算

**Supabase Free Tier：**
- 500MB 数据库空间
- 2GB 带宽/月
- 50,000 月度活跃用户
- 足够 MVP 使用

**如果超出免费额度：**
- Pro Plan: $25/月
- 支持更大规模的使用

## 安全建议

1. **使用 Service Role Key**（仅后端）
   - 不要在前端暴露 Service Role Key
   - 使用 Anon Key 进行前端调用

2. **启用 RLS 策略**
   - 限制用户只能读取/更新自己的记录
   - 使用 device_id 或 session 标识用户

3. **IP 限制（可选）**
   - 记录 IP 地址
   - 防止恶意刷激活

4. **速率限制**
   - 在 Supabase Edge Functions 中添加
   - 或在 API Gateway 层面限制

## 后续优化

1. **Edge Functions**
   - 将复杂逻辑移到 Edge Functions
   - 更好的错误处理和日志

2. **实时通知**
   - 使用 Supabase Realtime
   - 通知激活码状态变化

3. **分析报表**
   - 使用 Supabase Analytics
   - 生成使用报表

## 注意事项

1. **环境变量**
   - 不要将 `.env` 文件提交到 Git
   - 使用 `.env.example` 作为模板

2. **数据库迁移**
   - 使用 Supabase Migration 管理数据库变更
   - 保持版本控制

3. **备份**
   - 定期备份数据库
   - Supabase 提供自动备份

## 部署清单

- [ ] 创建 Supabase 项目
- [ ] 执行数据库脚本
- [ ] 配置环境变量
- [ ] 安装 Supabase 客户端
- [ ] 更新前端代码
- [ ] 测试激活码验证
- [ ] 测试使用次数限制
- [ ] 测试过期时间
- [ ] 部署到生产环境

