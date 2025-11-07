# 部署修改记录

**日期**: 2025-11-07
**部署服务器**: 阿里云 Linux + 宝塔面板
**域名**: http://sk.momofx.cn

---

## 📋 修改总结

### 1. 数据库配置修复

**问题**: MySQL 不支持 JSON 字段设置默认值
**修改文件**:
- `backend/database_complete.sql`
- `shekong_ai.sql`

**修改内容**:
```sql
-- 修改前
`usage_by_date` JSON DEFAULT '{}' COMMENT '...'

-- 修改后
`usage_by_date` JSON COMMENT '...'
```

**影响**: 数据库可以正常导入，激活记录表创建成功

---

### 2. 后端 Express 配置

**问题**: Nginx 代理后 Express 无法正确获取客户端 IP
**修改文件**: `backend/server.js`

**修改内容**:
```javascript
// 在创建 app 后添加
app.set('trust proxy', true);
```

**代码位置**: server.js:25-26

**影响**:
- 修复 Nginx 反向代理问题
- 解决 rate-limit 中间件报错
- 正确处理 X-Forwarded-For 头

---

### 3. 前端 API 地址配置

**问题**: 前端硬编码了开发环境的 API 地址，导致生产环境无法访问
**修改文件**:
- `src/utils/adminAuth.js`
- `src/utils/backendActivation.js`
- `src/utils/aiConfigApi.js`
- `src/utils/aiService.js`
- `.env.production`

**修改内容**:

**adminAuth.js**:
```javascript
// 修改前
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// 修改后
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
```

**backendActivation.js**:
```javascript
// 修改前
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// 修改后
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''
```

**aiConfigApi.js**:
```javascript
// 修改前
const API_BASE = 'http://localhost:3001/api/admin/ai-config'

// 修改后
const API_BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api/admin/ai-config`
  : '/api/admin/ai-config'
```

**aiService.js**:
```javascript
// 修改前
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 修改后
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''
```

**.env.production**:
```env
# 修改前
VITE_BACKEND_URL=https://your-domain.com
VITE_API_BASE_URL=https://your-domain.com/api

# 修改后
VITE_BACKEND_URL=
VITE_API_BASE_URL=
```

**影响**:
- 生产环境使用相对路径，通过 Nginx 代理访问后端
- 开发环境可以通过环境变量配置完整地址
- 解决了 "Failed to fetch" 错误

---

### 4. Vite 构建配置优化

**问题**: 服务器内存不足，构建使用 terser 导致 OOM
**修改文件**: `vite.config.js`

**修改内容**:
```javascript
// 修改前
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  }
}

// 修改后
build: {
  minify: 'esbuild',  // 使用更轻量的 esbuild
  chunkSizeWarningLimit: 1000
}
```

**影响**:
- 减少构建时内存占用
- 构建速度更快
- 解决服务器内存不足问题

---

### 5. UI 优化 - 移除默认密码提示

**问题**: 登录页面显示默认密码，存在安全隐患
**修改文件**: `src/views/admin/AdminLogin.vue`

**修改内容**:
```vue
<!-- 删除了以下代码块 -->
<div class="default-account-tip">
  <p class="text-secondary">默认账号：admin / admin123</p>
  <p class="text-secondary" style="font-size: 12px; margin-top: 4px;">
    ⚠️ 首次登录请及时修改密码
  </p>
</div>

<!-- 删除了相关 CSS -->
.default-account-tip {
  margin-top: 24px;
  padding: 16px;
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  text-align: center;
}
```

**影响**: 提高安全性，登录页不再显示默认密码

---

### 6. Nginx 配置

**新增文件**: `/www/server/panel/vhost/nginx/sk.momofx.cn.conf`

**配置内容**:
```nginx
server {
    listen 80;
    server_name sk.momofx.cn;
    root /www/wwwroot/sk.moomofx.cn/CS_shekong/dist;

    # API 反向代理到后端 (端口 3001)
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        ...
    }

    # Vue Router History 模式
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**影响**:
- 前端静态文件服务
- API 请求代理到后端
- 支持 Vue Router History 模式

---

### 7. 数据库数据导入

**导入文件**: `shekong_ai.sql` (本地开发数据)

**导入内容**:
- 13 个激活码
- 1 个管理员账号 (admin/admin123)
- 2 个 AI 配置
- 7 条激活记录
- 1 条 AI 生成日志

**备份文件**: `backup_before_import.sql`

---

### 8. PM2 进程管理

**配置**:
```bash
pm2 start backend/server.js --name shekong-backend
pm2 save
pm2 startup
```

**影响**:
- 后端服务持久化运行
- 服务器重启自动启动
- 日志管理和监控

---

## 🔧 技术细节

### 前端构建
- **构建工具**: Vite 5.0
- **压缩方式**: esbuild (优化内存占用)
- **产物路径**: `/www/wwwroot/sk.moomofx.cn/CS_shekong/dist`

### 后端服务
- **运行方式**: PM2 (fork mode)
- **端口**: 3001
- **进程名**: shekong-backend
- **日志路径**: `/root/.pm2/logs/`

### Nginx 代理
- **监听端口**: 80
- **静态文件**: `/www/wwwroot/sk.moomofx.cn/CS_shekong/dist`
- **API 代理**: http://127.0.0.1:3001

---

## 📝 配置文件路径

| 配置项 | 文件路径 |
|--------|---------|
| 后端环境变量 | `/www/wwwroot/sk.moomofx.cn/CS_shekong/backend/.env` |
| 前端环境变量 | `/www/wwwroot/sk.moomofx.cn/CS_shekong/.env.production` |
| Nginx 配置 | `/www/server/panel/vhost/nginx/sk.momofx.cn.conf` |
| PM2 配置 | `/www/wwwroot/sk.moomofx.cn/CS_shekong/backend/ecosystem.config.js` |

---

## ✅ 验证测试

### 1. 后端 API 测试
```bash
# 直接测试
curl -X POST http://127.0.0.1:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 通过 Nginx 测试
curl -X POST http://sk.momofx.cn/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 前端访问测试
- 主页: http://sk.momofx.cn
- 管理后台: http://sk.momofx.cn/admin-login
- API 测试页: http://sk.momofx.cn/api-test.html

### 3. 服务状态检查
```bash
# 查看 PM2 进程
pm2 list

# 查看后端日志
pm2 logs shekong-backend

# 测试 Nginx
nginx -t
```

---

## 🐛 遇到的问题及解决

### 问题 1: 数据库导入失败
**错误**: `BLOB, TEXT, GEOMETRY or JSON column can't have a default value`
**原因**: MySQL 不支持 JSON 字段默认值
**解决**: 删除 JSON 字段的 DEFAULT 子句

### 问题 2: 前端登录失败 "Failed to fetch"
**错误**: `TypeError: Failed to fetch`
**原因**:
1. `.env.production` 中使用了占位符域名 `https://your-domain.com`
2. 前端代码中硬编码 `http://localhost:3001`

**解决**:
1. 修改环境变量为空字符串（使用相对路径）
2. 修改所有 API 调用文件使用相对路径

### 问题 3: Express rate-limit 警告
**错误**: `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR`
**原因**: Nginx 设置了 X-Forwarded-For 头，但 Express trust proxy 未启用
**解决**: 添加 `app.set('trust proxy', true)`

### 问题 4: 构建内存不足
**错误**: 构建进程被 kill (OOM)
**原因**: terser 压缩消耗大量内存，服务器内存不足 (1.8GB)
**解决**:
1. 使用 esbuild 替代 terser
2. 构建时暂停其他服务释放内存
3. 限制 Node.js 内存: `NODE_OPTIONS="--max-old-space-size=600"`

---

## 📊 部署成果

- ✅ 前端成功构建并部署
- ✅ 后端服务稳定运行
- ✅ 数据库数据完整导入
- ✅ Nginx 代理配置正确
- ✅ PM2 进程管理配置
- ✅ API 访问正常
- ✅ 管理后台登录成功
- ✅ 域名访问正常

---

## 🔐 安全建议

1. **修改管理员密码**: 首次登录后立即修改默认密码 `admin123`
2. **配置 SSL 证书**: 在宝塔面板申请免费 HTTPS 证书
3. **定期备份数据库**: 建议每日备份数据库
4. **监控服务状态**: 使用 PM2 监控后端服务
5. **更新依赖包**: 定期更新 npm 依赖包

---

## 📞 运维命令

### 服务管理
```bash
# 重启后端
pm2 restart shekong-backend

# 查看日志
pm2 logs shekong-backend

# 重新加载 Nginx
nginx -s reload
```

### 更新代码
```bash
cd /www/wwwroot/sk.moomofx.cn/CS_shekong
git pull
npm install
npm run build
pm2 restart shekong-backend
```

### 数据库备份
```bash
mysqldump -uroot -p shekong_ai > backup_$(date +%Y%m%d).sql
```

---

**修改人**: Claude AI
**最后更新**: 2025-11-07 12:30
