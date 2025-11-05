// AI分析后端服务
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection, initDatabase } = require('./db');

// 导入路由模块
const { router: authRouter } = require('./routes/authRoutes');
const adminRouter = require('./routes/adminRoutes');
const activationRouter = require('./routes/activationRoutes');
const aiRouter = require('./routes/aiRoutes');
const statsRouter = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// 中间件配置
// ============================================
app.use(cors()); // 允许跨域
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// 请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// 健康检查接口
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// 路由注册
// ============================================
app.use('/api/admin', authRouter);      // 管理员认证路由: /api/admin/login, /api/admin/logout 等
app.use('/api/admin', adminRouter);     // 管理后台路由: /api/admin/codes, /api/admin/stats 等
app.use('/api/activation', activationRouter); // 激活码验证路由
app.use('/api/ai', aiRouter);           // AI分析路由
app.use('/api/stats', statsRouter);     // 统计数据路由

// ============================================
// 错误处理
// ============================================

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// ============================================
// 启动服务器
// ============================================
async function startServer() {
  try {
    // 测试数据库连接
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ 无法连接到数据库，请检查配置');
      process.exit(1);
    }
    
    // 初始化数据库表
    await initDatabase();
    
    // 启动HTTP服务
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log('🚀 AI分析后端服务启动成功！');
      console.log('='.repeat(50));
      console.log(`📡 服务地址: http://localhost:${PORT}`);
      console.log(`🔗 健康检查: http://localhost:${PORT}/health`);
      console.log('');
      console.log('📚 API接口:');
      console.log(`  🔐 管理员登录: POST ${PORT}/api/admin/login`);
      console.log(`  🔐 管理员登出: POST ${PORT}/api/admin/logout`);
      console.log(`  👤 当前用户信息: GET ${PORT}/api/admin/me`);
      console.log(`  🎫 激活码验证: POST ${PORT}/api/activation/verify`);
      console.log(`  🤖 AI生成接口: POST ${PORT}/api/ai/generate`);
      console.log(`  📊 统计接口: GET ${PORT}/api/stats`);
      console.log('');
      console.log('🔐 管理后台接口（需认证）:');
      console.log(`  📋 激活码列表: GET ${PORT}/api/admin/codes`);
      console.log(`  ➕ 创建激活码: POST ${PORT}/api/admin/codes`);
      console.log(`  📦 批量创建: POST ${PORT}/api/admin/codes/bulk`);
      console.log(`  ✏️ 更新激活码: PUT ${PORT}/api/admin/codes/:id`);
      console.log(`  🚫 撤销激活码: POST ${PORT}/api/admin/codes/:id/revoke`);
      console.log(`  🗑️ 删除激活码: DELETE ${PORT}/api/admin/codes/:id`);
      console.log(`  📊 激活码统计: GET ${PORT}/api/admin/stats`);
      console.log(`  📜 激活记录: GET ${PORT}/api/admin/records/:code`);
      console.log('='.repeat(50));
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ 服务启动失败:', error);
    process.exit(1);
  }
}

// ============================================
// 优雅关闭
// ============================================
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

// 启动服务
startServer();
