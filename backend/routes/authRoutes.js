// 管理员认证路由
const express = require('express');
const router = express.Router();
const {
  adminLogin,
  verifyToken,
  adminLogout,
  changePassword
} = require('../authService');

/**
 * 认证中间件
 */
async function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未登录'
      });
    }
    
    const result = await verifyToken(token);
    
    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: result.error || '会话已失效'
      });
    }
    
    req.admin = result.admin;
    next();
    
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      error: '认证失败'
    });
  }
}

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: '请提供用户名和密码'
      });
    }
    
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    const result = await adminLogin(username, password, ipAddress, userAgent);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
    
  } catch (error) {
    console.error('登录接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 管理员登出
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await adminLogout(token);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('登出接口错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 验证会话（获取当前管理员信息）
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '未提供令牌'
      });
    }
    
    const result = await verifyToken(token);
    
    if (result.valid) {
      res.json({
        success: true,
        admin: result.admin
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('验证会话错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 修改密码
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '请提供原密码和新密码'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: '新密码长度至少6位'
      });
    }
    
    const result = await changePassword(req.admin.id, oldPassword, newPassword);
    res.json(result);
    
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = { router, requireAuth };

