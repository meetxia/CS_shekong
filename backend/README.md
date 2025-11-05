# 社恐测评 AI 分析后端服务

## 📋 功能说明

提供AI个性化分析接口，解决前端跨域问题，支持数据统计和日志记录。

## 🚀 本地部署

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
# 数据库配置（已配置好）
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mojz168168
DB_NAME=shekong_ai

# Claude API配置（已配置好）
CLAUDE_API_KEY=sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657
CLAUDE_API_URL=https://dpapi.cn/v1/chat/completions
CLAUDE_MODEL=claude-4.5-sonnet

# 服务器配置
PORT=3001
NODE_ENV=development
```

### 3. 初始化数据库

```bash
npm run init-db
```

这会自动创建数据库和表结构。

### 4. 启动服务

```bash
npm start
```

服务会在 `http://localhost:3001` 启动。

## 📡 API 接口

### 1. 健康检查

```
GET /health
```

返回：
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T03:00:00.000Z",
  "uptime": 123.45
}
```

### 2. AI分析生成

```
POST /api/ai/generate
Content-Type: application/json
```

请求体：
```json
{
  "report": {
    "totalScore": 65,
    "level": { "name": "中度社交焦虑" },
    "type": { "name": "综合型社恐" },
    "dimensions": [...]
  },
  "answers": {},
  "basicInfo": {
    "age": "college",
    "gender": "female",
    "occupation": "student",
    "social_frequency": "occasional"
  },
  "userId": "user_123" // 可选
}
```

返回（成功）：
```json
{
  "success": true,
  "data": {
    "id": "ai_generated",
    "name": "情绪雷达过载型社恐",
    "englishName": "Emotional-Radar Overload Type",
    "features": ["特征1", "特征2", "特征3"],
    "rootCauses": [
      { "title": "根源1", "desc": "说明1" },
      { "title": "根源2", "desc": "说明2" }
    ],
    "positiveReframe": "正向重构内容"
  }
}
```

返回（失败）：
```json
{
  "success": false,
  "error": "错误信息"
}
```

### 3. 获取统计数据

```
GET /api/stats
```

返回：
```json
{
  "success": true,
  "data": {
    "today": {
      "total_calls": 10,
      "success_calls": 9,
      "failed_calls": 1,
      "avg_response_time": 3500,
      "total_tokens": 15000
    },
    "total": {
      "total_calls": 100,
      "success_calls": 95,
      "failed_calls": 5,
      "avg_response_time": 3200,
      "total_tokens": 150000
    },
    "recent": [...]
  }
}
```

## 🗄️ 数据库表结构

### ai_generation_logs（AI生成日志表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | VARCHAR(255) | 用户ID（可选） |
| total_score | INT | 总分 |
| level_name | VARCHAR(100) | 等级名称 |
| type_name | VARCHAR(100) | 类型名称 |
| english_name | VARCHAR(200) | 英文名称 |
| features | TEXT | 核心特征（JSON） |
| root_causes | TEXT | 心理根源（JSON） |
| positive_reframe | TEXT | 正向重构 |
| basic_info | TEXT | 基础信息（JSON） |
| created_at | TIMESTAMP | 创建时间 |
| success | BOOLEAN | 是否成功 |
| error_message | TEXT | 错误信息 |

### ai_stats（统计表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| date | DATE | 日期 |
| total_calls | INT | 总调用次数 |
| success_calls | INT | 成功次数 |
| failed_calls | INT | 失败次数 |
| avg_response_time | FLOAT | 平均响应时间(ms) |
| total_tokens | INT | 总Token消耗 |

## 🌐 服务器部署（阿里云+宝塔面板）

### 1. 上传代码到服务器

```bash
# 打包backend文件夹
tar -czf backend.tar.gz backend/

# 上传到服务器（使用SCP或宝塔面板上传）
scp backend.tar.gz root@your-server-ip:/www/wwwroot/
```

### 2. 在服务器上解压

```bash
cd /www/wwwroot/
tar -xzf backend.tar.gz
cd backend
```

### 3. 安装依赖

```bash
npm install --production
```

### 4. 修改.env配置

```bash
# 在服务器上修改.env文件，改为服务器数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的服务器MySQL密码
DB_NAME=shekong_ai

# 其他配置保持不变
PORT=3001
```

### 5. 初始化数据库

```bash
npm run init-db
```

### 6. 使用PM2启动服务（推荐）

```bash
# 安装PM2（如果还没安装）
npm install -g pm2

# 启动服务
pm2 start server.js --name shekong-ai-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs shekong-ai-backend
```

### 7. 配置Nginx反向代理（可选）

在宝塔面板中配置：

```nginx
# 在你的网站配置中添加
location /api/ {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 8. 防火墙配置

在宝塔面板 -> 安全 中放行端口 3001。

## 🔧 前端配置

修改前端 `src/utils/aiService.js`：

```javascript
export async function generatePersonalizedAnalysis(report, answers, basicInfo) {
  // 使用你的后端API地址
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://你的域名.com/api/ai/generate'  // 生产环境
    : 'http://localhost:3001/api/ai/generate';  // 开发环境
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ report, answers, basicInfo })
    });

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('AI生成失败:', error);
    return null;
  }
}
```

## 📊 监控和维护

### 查看日志

```bash
# 查看服务日志
pm2 logs shekong-ai-backend

# 查看MySQL日志（在宝塔面板中）
# 数据库 -> 日志
```

### 查看统计

访问：`http://your-server:3001/api/stats`

### 重启服务

```bash
pm2 restart shekong-ai-backend
```

## 💰 成本估算

- **服务器**: 阿里云轻量应用服务器 60元/月起
- **Claude API**: 约0.01-0.02元/次调用
- **MySQL**: 包含在服务器中，无额外费用

## ⚠️ 注意事项

1. **API Key安全**: 不要将.env文件提交到Git
2. **数据库密码**: 服务器上使用强密码
3. **定期备份**: 定期备份数据库数据
4. **监控调用量**: 关注API调用次数，避免超额
5. **日志管理**: 定期清理旧日志，避免占用太多空间

## 🎉 完成！

现在你的AI后端服务已经部署完成，可以正常使用了！

```


