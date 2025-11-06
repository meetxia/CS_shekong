# AI供应商配置功能说明

## 📋 功能概述

新增了AI供应商配置管理功能，允许管理员在后台界面动态切换和管理不同的AI服务供应商，无需修改代码或重启服务。

## 🎯 主要功能

### 1. 多供应商支持
- ✅ Claude (Anthropic)
- ✅ DeepSeek V3
- ✅ OpenAI
- ✅ 通义千问
- ✅ 其他自定义供应商

### 2. 配置管理
- 查看所有AI配置
- 添加新的AI供应商
- 编辑现有配置
- 切换激活的供应商
- 删除未使用的配置
- 测试连接功能

### 3. 配置参数
每个AI供应商可以配置：
- API密钥
- API地址
- 模型名称
- 最大Tokens
- 温度参数
- 超时时间
- 备注说明

## 🚀 使用指南

### 访问配置页面

1. 登录管理后台：`http://localhost:5173/admin/login`
2. 点击左侧导航栏的 **🤖 AI配置**
3. 进入AI供应商配置页面

### 添加新供应商

1. 点击右上角 **➕ 添加供应商** 按钮
2. 填写配置信息：
   - 选择供应商类型
   - 输入API密钥
   - 输入API地址
   - 输入模型名称
   - 设置参数（可选）
3. 点击 **保存** 按钮

### 切换供应商

1. 在配置列表中找到要切换的供应商
2. 点击 **切换使用** 按钮
3. 确认切换
4. 系统会自动将该供应商设为当前使用

### 测试连接

1. 点击配置卡片上的 **测试连接** 按钮
2. 系统会发送测试请求到AI API
3. 显示测试结果

### 编辑配置

1. 点击配置卡片上的 **编辑** 按钮
2. 修改配置信息
3. 点击 **保存** 按钮

### 删除配置

1. 点击配置卡片上的 **删除** 按钮
2. 确认删除
3. 注意：不能删除当前激活的配置

## 📊 数据库表结构

```sql
CREATE TABLE ai_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(50) NOT NULL,        -- AI供应商
  api_key VARCHAR(255) NOT NULL,        -- API密钥
  api_url VARCHAR(255) NOT NULL,        -- API地址
  model VARCHAR(100) NOT NULL,          -- 模型名称
  is_active TINYINT(1) DEFAULT 0,       -- 是否启用
  max_tokens INT DEFAULT 2000,          -- 最大token数
  temperature DECIMAL(3,2) DEFAULT 0.70,-- 温度参数
  timeout INT DEFAULT 30000,            -- 超时时间(ms)
  notes TEXT,                           -- 备注说明
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 API接口

### 获取所有AI配置
```
GET /api/admin/ai-config
```

### 获取当前激活的配置
```
GET /api/admin/ai-config/active
```

### 创建新配置
```
POST /api/admin/ai-config
Body: {
  provider: string,
  api_key: string,
  api_url: string,
  model: string,
  max_tokens: number,
  temperature: number,
  timeout: number,
  notes: string
}
```

### 更新配置
```
PUT /api/admin/ai-config/:id
Body: { ...配置参数 }
```

### 切换激活的供应商
```
POST /api/admin/ai-config/:id/activate
```

### 删除配置
```
DELETE /api/admin/ai-config/:id
```

### 测试连接
```
POST /api/admin/ai-config/test
Body: { ...配置参数 }
```

## 📝 配置示例

### DeepSeek V3 配置
```json
{
  "provider": "deepseek",
  "api_key": "sk-uhdblleyrmgibqawryriyhivpgiyxcdxgjeabewylmjswbkx",
  "api_url": "https://api.siliconflow.cn/v1/chat/completions",
  "model": "deepseek-ai/DeepSeek-V3",
  "max_tokens": 2000,
  "temperature": 0.7,
  "timeout": 30000,
  "notes": "DeepSeek V3 (通过SiliconFlow)"
}
```

### Claude 配置
```json
{
  "provider": "claude",
  "api_key": "sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657",
  "api_url": "https://dpapi.cn/v1/chat/completions",
  "model": "claude-4.5-sonnet",
  "max_tokens": 2000,
  "temperature": 0.7,
  "timeout": 30000,
  "notes": "Claude API (通过dpapi.cn中转)"
}
```

## ⚙️ 初始化

首次使用需要运行初始化脚本创建数据库表：

```bash
node backend/initAIConfig.js
```

这会自动创建 `ai_config` 表并插入默认配置（Claude 和 DeepSeek）。

## 🔒 权限说明

- 所有AI配置管理接口都需要管理员认证
- 需要先登录管理后台才能访问
- 使用 JWT Token 进行身份验证

## 💡 注意事项

1. **API密钥安全**：请妥善保管API密钥，不要泄露
2. **切换供应商**：切换后立即生效，下次AI分析会使用新的供应商
3. **测试连接**：建议在切换前先测试连接确保配置正确
4. **删除限制**：不能删除当前激活的配置
5. **参数调整**：temperature 和 max_tokens 会影响AI生成质量

## 🎨 界面特性

- 响应式设计，支持桌面端和移动端
- 当前使用的供应商会有特殊标识
- API密钥会自动脱敏显示
- 支持实时测试连接
- 友好的错误提示

## 🔄 工作流程

1. 管理员在后台添加/编辑AI供应商配置
2. 选择要使用的供应商并激活
3. 系统自动从数据库读取激活的配置
4. AI分析服务使用当前激活的配置调用API
5. 可随时切换供应商，无需重启服务

## 📞 技术支持

如有问题，请查看：
- 后端日志：查看 `backend/` 目录下的控制台输出
- 前端控制台：浏览器开发者工具
- 数据库：检查 `ai_config` 表数据

---

**版本**: 1.0.0  
**更新日期**: 2025-11-06

