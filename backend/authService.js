// 管理员认证服务
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { pool } = require('./db');

/**
 * 生成会话令牌
 */
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 管理员登录
 */
async function adminLogin(username, password, ipAddress = null, userAgent = null) {
  try {
    // 查询管理员
    const [admins] = await pool.query(
      'SELECT * FROM admin_users WHERE username = ? AND status = ?',
      [username, 'active']
    );
    
    if (admins.length === 0) {
      return { success: false, error: '用户名或密码错误' };
    }
    
    const admin = admins[0];
    
    // 验证密码
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return { success: false, error: '用户名或密码错误' };
    }
    
    // 生成会话令牌
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天有效期
    
    // 创建会话
    await pool.query(
      `INSERT INTO admin_sessions (admin_id, token, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [admin.id, token, ipAddress, userAgent, expiresAt]
    );
    
    // 更新最后登录信息
    await pool.query(
      'UPDATE admin_users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?',
      [ipAddress, admin.id]
    );
    
    return {
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        email: admin.email
      }
    };
    
  } catch (error) {
    console.error('登录失败:', error);
    return { success: false, error: '系统错误' };
  }
}

/**
 * 验证会话令牌
 */
async function verifyToken(token) {
  try {
    if (!token) {
      return { valid: false, error: '未提供令牌' };
    }
    
    // 查询会话
    const [sessions] = await pool.query(
      `SELECT s.*, a.id as admin_id, a.username, a.nickname, a.email, a.status
       FROM admin_sessions s
       JOIN admin_users a ON s.admin_id = a.id
       WHERE s.token = ?`,
      [token]
    );
    
    if (sessions.length === 0) {
      return { valid: false, error: '无效的令牌' };
    }
    
    const session = sessions[0];
    
    // 检查会话是否过期
    if (new Date(session.expires_at) < new Date()) {
      await pool.query('DELETE FROM admin_sessions WHERE id = ?', [session.id]);
      return { valid: false, error: '会话已过期' };
    }
    
    // 检查管理员状态
    if (session.status !== 'active') {
      return { valid: false, error: '账号已被禁用' };
    }
    
    return {
      valid: true,
      admin: {
        id: session.admin_id,
        username: session.username,
        nickname: session.nickname,
        email: session.email
      }
    };
    
  } catch (error) {
    console.error('验证令牌失败:', error);
    return { valid: false, error: '系统错误' };
  }
}

/**
 * 管理员登出
 */
async function adminLogout(token) {
  try {
    await pool.query('DELETE FROM admin_sessions WHERE token = ?', [token]);
    return { success: true };
  } catch (error) {
    console.error('登出失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 清理过期会话
 */
async function cleanupExpiredSessions() {
  try {
    const [result] = await pool.query(
      'DELETE FROM admin_sessions WHERE expires_at < NOW()'
    );
    console.log(`🧹 清理了 ${result.affectedRows} 个过期会话`);
  } catch (error) {
    console.error('清理过期会话失败:', error);
  }
}

/**
 * 修改密码
 */
async function changePassword(adminId, oldPassword, newPassword) {
  try {
    // 查询管理员
    const [admins] = await pool.query(
      'SELECT * FROM admin_users WHERE id = ?',
      [adminId]
    );
    
    if (admins.length === 0) {
      return { success: false, error: '管理员不存在' };
    }
    
    const admin = admins[0];
    
    // 验证旧密码
    const passwordMatch = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!passwordMatch) {
      return { success: false, error: '原密码错误' };
    }
    
    // 加密新密码
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // 更新密码
    await pool.query(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, adminId]
    );
    
    // 清除该管理员的所有会话（强制重新登录）
    await pool.query('DELETE FROM admin_sessions WHERE admin_id = ?', [adminId]);
    
    return { success: true };
    
  } catch (error) {
    console.error('修改密码失败:', error);
    return { success: false, error: '系统错误' };
  }
}

/**
 * 创建管理员账号
 */
async function createAdminUser(username, password, nickname = null, email = null) {
  try {
    // 检查用户名是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      return { success: false, error: '用户名已存在' };
    }
    
    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // 创建账号
    const [result] = await pool.query(
      `INSERT INTO admin_users (username, password_hash, nickname, email)
       VALUES (?, ?, ?, ?)`,
      [username, passwordHash, nickname, email]
    );
    
    return { success: true, id: result.insertId };
    
  } catch (error) {
    console.error('创建管理员失败:', error);
    return { success: false, error: '系统错误' };
  }
}

// 定期清理过期会话（每小时执行一次）
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

module.exports = {
  adminLogin,
  verifyToken,
  adminLogout,
  changePassword,
  createAdminUser,
  cleanupExpiredSessions
};

