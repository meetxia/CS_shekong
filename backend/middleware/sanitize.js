/**
 * 输入净化中间件
 * 防止XSS攻击和SQL注入
 */

const sanitize = (req, res, next) => {
  // 清理字符串输入
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    
    // 移除危险字符
    return str
      .replace(/[<>]/g, '') // 移除尖括号（防XSS）
      .replace(/['"]/g, '') // 移除引号（防SQL注入）
      .trim();
  };

  // 递归清理对象
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
    return obj;
  };

  // 清理请求体
  if (req.body) {
    req.body = sanitizeObject({ ...req.body });
  }
  
  // 清理查询参数
  if (req.query) {
    req.query = sanitizeObject({ ...req.query });
  }
  
  next();
};

module.exports = sanitize;
