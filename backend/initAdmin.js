// 初始化管理员认证表和默认账号
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initAdminTables() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_NAME || 'shekong_ai'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 创建管理员账号表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
        username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
        password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
        nickname VARCHAR(100) DEFAULT NULL COMMENT '昵称',
        email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
        status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active-正常, disabled-禁用',
        last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
        last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_username (username),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员账号表'
    `);
    console.log('✅ admin_users 表创建成功');
    
    // 创建管理员会话表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
        admin_id INT NOT NULL COMMENT '管理员ID',
        token VARCHAR(64) UNIQUE NOT NULL COMMENT '会话令牌',
        ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
        user_agent TEXT DEFAULT NULL COMMENT '用户代理',
        expires_at DATETIME NOT NULL COMMENT '过期时间',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        
        INDEX idx_token (token),
        INDEX idx_admin_id (admin_id),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员会话表'
    `);
    console.log('✅ admin_sessions 表创建成功');
    
    // 检查是否已存在默认管理员
    const [existing] = await connection.query(
      'SELECT id FROM admin_users WHERE username = ?',
      ['admin']
    );
    
    if (existing.length === 0) {
      // 创建默认管理员账号
      // 密码: admin123
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('admin123', saltRounds);
      
      await connection.query(
        `INSERT INTO admin_users (username, password_hash, nickname, status)
         VALUES (?, ?, ?, ?)`,
        ['admin', passwordHash, '系统管理员', 'active']
      );
      
      console.log('✅ 默认管理员账号创建成功');
      console.log('');
      console.log('='.repeat(50));
      console.log('📝 默认管理员账号信息:');
      console.log('   用户名: admin');
      console.log('   密码: admin123');
      console.log('   ⚠️ 请务必登录后修改密码！');
      console.log('='.repeat(50));
    } else {
      console.log('ℹ️  默认管理员账号已存在，跳过创建');
    }
    
    console.log('');
    console.log('✅ 管理员认证系统初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 执行初始化
initAdminTables();

