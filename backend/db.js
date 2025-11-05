// 数据库连接配置
const mysql = require('mysql2/promise');
require('dotenv').config();

// 创建数据库连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 初始化数据库表
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // 创建AI生成日志表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_generation_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) DEFAULT NULL,
        total_score INT NOT NULL,
        level_name VARCHAR(100),
        type_name VARCHAR(100),
        english_name VARCHAR(200),
        features TEXT,
        root_causes TEXT,
        positive_reframe TEXT,
        basic_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT,
        INDEX idx_created_at (created_at),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // 创建统计表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ai_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total_calls INT DEFAULT 0,
        success_calls INT DEFAULT 0,
        failed_calls INT DEFAULT 0,
        avg_response_time FLOAT DEFAULT 0,
        total_tokens INT DEFAULT 0,
        INDEX idx_date (date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ 数据库表初始化完成');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

// 保存AI生成日志
async function saveGenerationLog(data) {
  try {
    const [result] = await pool.query(
      `INSERT INTO ai_generation_logs 
       (user_id, total_score, level_name, type_name, english_name, features, root_causes, positive_reframe, basic_info, success, error_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId || null,
        data.totalScore,
        data.levelName,
        data.typeName,
        data.englishName,
        JSON.stringify(data.features),
        JSON.stringify(data.rootCauses),
        data.positiveReframe,
        JSON.stringify(data.basicInfo),
        data.success,
        data.errorMessage || null
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error('保存日志失败:', error);
    return null;
  }
}

// 更新统计数据
async function updateStats(success, responseTime, tokens) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    await pool.query(`
      INSERT INTO ai_stats (date, total_calls, success_calls, failed_calls, avg_response_time, total_tokens)
      VALUES (?, 1, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_calls = total_calls + 1,
        success_calls = success_calls + ?,
        failed_calls = failed_calls + ?,
        avg_response_time = (avg_response_time * total_calls + ?) / (total_calls + 1),
        total_tokens = total_tokens + ?
    `, [
      today,
      success ? 1 : 0,
      success ? 0 : 1,
      responseTime,
      tokens,
      success ? 1 : 0,
      success ? 0 : 1,
      responseTime,
      tokens
    ]);
  } catch (error) {
    console.error('更新统计失败:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  initDatabase,
  saveGenerationLog,
  updateStats
};

