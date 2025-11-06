/**
 * 初始化AI配置表
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function initAIConfig() {
  let connection;
  
  try {
    console.log('🔧 开始初始化AI配置表...');
    
    // 连接数据库
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'migrations', 'create_ai_config_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // 执行SQL语句
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }
    
    console.log('✅ AI配置表创建成功');
    console.log('');
    console.log('📋 默认配置已插入:');
    console.log('  - Claude (已激活)');
    console.log('  - DeepSeek');
    console.log('');
    console.log('🎉 初始化完成！');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 运行初始化
initAIConfig();

