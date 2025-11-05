const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    console.log('连接到MySQL服务器...');
    
    // 先连接到MySQL服务器（不指定数据库）
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'mojz168168',
      multipleStatements: true
    });
    
    console.log('✅ MySQL连接成功');
    
    // 读取并执行SQL文件
    console.log('读取database.sql文件...');
    const sqlFile = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    
    // 执行SQL脚本
    console.log('执行SQL脚本...');
    await connection.query(sqlFile);
    
    console.log('✅ 数据库表创建成功');
    
    // 选择数据库并检查表
    await connection.query('USE shekong_ai');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('');
    console.log('📋 已创建的表:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`   ✓ ${tableName}`);
    });
    
    // 检查测试激活码
    const [codes] = await connection.query('SELECT code, notes FROM activation_codes');
    if (codes.length > 0) {
      console.log('');
      console.log('🎫 测试激活码:');
      codes.forEach(code => {
        console.log(`   ✓ ${code.code} - ${code.notes}`);
      });
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log('🎉 数据库初始化完成！');
    console.log('='.repeat(50));
    console.log('');
    console.log('现在可以启动服务器了：');
    console.log('  npm run dev   (开发模式，自动重启)');
    console.log('  npm start     (生产模式)');
    console.log('');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
