# Supabase 激活码系统快速启动指南

## 📋 概述

本指南将帮助你在 10 分钟内完成 Supabase 激活码系统的部署。

## 🚀 步骤 1：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - **Project Name**: 社恐测试激活系统（或其他名称）
   - **Database Password**: 设置一个强密码（保存好，后续会用到）
   - **Region**: 选择离你最近的区域（如 `Southeast Asia (Singapore)`）
5. 等待项目创建完成（约 2-3 分钟）

## 🔑 步骤 2：获取 API 密钥

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Settings** → **API**
2. 找到以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (很长的字符串)
3. 复制这两个值，稍后会用到

## 💾 步骤 3：执行数据库脚本

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New Query**
3. 打开项目中的 `docs/06-数据库脚本/supabase_activation_setup.sql`
4. 复制整个 SQL 脚本内容
5. 粘贴到 SQL Editor 中
6. 点击 **Run** 或按 `Ctrl+Enter` 执行
7. 看到 "Success. No rows returned" 表示执行成功

## ⚙️ 步骤 4：配置环境变量

1. 在项目根目录创建 `.env` 文件（如果不存在）
2. 添加以下内容：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. 将 `your-project-id` 和 `your-anon-key-here` 替换为步骤 2 中获取的值

**⚠️ 重要：不要将 `.env` 文件提交到 Git！**

## 📦 步骤 5：安装依赖

在项目根目录执行：

```bash
npm install
```

这将安装 `@supabase/supabase-js` 包。

## ✅ 步骤 6：测试验证

1. 启动开发服务器（如果还没启动）：
   ```bash
   npm run dev
   ```

2. 访问激活页面：`http://localhost:5173/activation`

3. 输入测试激活码：
   - `TEST-2024-ABCD`
   - `DEMO-1234-5678`
   - `MVPX-XXXX-YYYY`

4. 点击 "开始测评"，应该能成功激活

## 🔍 验证步骤

### 检查数据库

1. 在 Supabase Dashboard 中，点击 **Table Editor**
2. 你应该能看到两个表：
   - `activation_codes` - 激活码表
   - `activation_records` - 激活记录表

3. 查看 `activation_codes` 表，应该能看到 3 条测试数据

### 检查激活记录

1. 在激活页面输入激活码并激活
2. 在 `activation_records` 表中应该能看到新的记录

## 🎯 功能说明

### 激活码验证流程

1. 用户输入激活码
2. 前端调用 `verify_activation_code` 数据库函数
3. 函数检查：
   - 激活码是否存在
   - 激活码状态（active/used/expired）
   - 是否过期
   - 使用次数是否超限
   - 今日使用次数是否超限
4. 验证通过后创建激活记录
5. 返回激活信息（有效期、剩余次数等）

### 使用次数追踪

- **每日限制**：默认每天 3 次（可在数据库配置）
- **有效期**：默认 7 天（可在数据库配置）
- **自动过期**：到期后自动失效

## 📝 管理激活码

### 通过 SQL Editor 添加激活码

```sql
INSERT INTO activation_codes (
  code, 
  status, 
  max_uses, 
  validity_days, 
  daily_limit,
  notes
) VALUES (
  'YOUR-CODE-HERE',  -- 激活码
  'active',           -- 状态
  100,                -- 最大使用次数
  7,                  -- 有效期（天）
  3,                  -- 每天限制
  '备注信息'          -- 备注
);
```

### 批量生成激活码（示例）

```sql
-- 生成 10 个激活码
DO $$
DECLARE
  i INTEGER;
  new_code VARCHAR(14);
BEGIN
  FOR i IN 1..10 LOOP
    -- 生成随机激活码（格式：XXXX-XXXX-XXXX）
    new_code := 
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    INSERT INTO activation_codes (
      code, status, max_uses, validity_days, daily_limit, notes
    ) VALUES (
      new_code, 'active', 100, 7, 3, '批量生成'
    ) ON CONFLICT (code) DO NOTHING;
  END LOOP;
END $$;
```

## 🛠️ 故障排查

### 问题 1：激活码验证失败

**可能原因：**
- 环境变量未配置
- Supabase URL 或 Key 错误
- 数据库函数未创建

**解决方法：**
1. 检查 `.env` 文件是否正确配置
2. 重启开发服务器
3. 检查浏览器控制台错误信息
4. 确认 SQL 脚本已执行成功

### 问题 2：找不到数据库函数

**解决方法：**
1. 在 Supabase SQL Editor 中执行：
   ```sql
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name IN ('verify_activation_code', 'get_activation_status');
   ```
2. 如果查询结果为空，重新执行 `supabase_activation_setup.sql`

### 问题 3：激活码格式错误

**检查：**
- 激活码格式必须是 `XXXX-XXXX-XXXX`（12 位字符，3 个连字符）
- 只能包含大写字母和数字

## 📚 相关文档

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JS 客户端文档](https://supabase.com/docs/reference/javascript/introduction)
- [完整集成方案文档](../04-功能开发报告/Supabase激活码系统集成方案.md)

## 🎉 完成！

现在你的激活码系统已经可以使用了！

**下一步：**
- 生成你的激活码
- 配置激活码的使用限制
- 部署到生产环境

