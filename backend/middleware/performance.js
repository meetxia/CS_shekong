/**
 * 性能监控中间件
 * 记录接口响应时间，识别慢请求
 */

const performance = (req, res, next) => {
  const startTime = Date.now();
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // 记录慢请求（超过1秒）
    if (duration > 1000) {
      console.warn(`⚠️  慢请求: ${req.method} ${req.path} - ${duration}ms`);
    }
    
    // 开发环境记录所有请求
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log(`⏱️  ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

module.exports = performance;
