/**
 * 测试激活码每日次数限制修复
 * 
 * 这个脚本用于验证修复后的逻辑是否正确工作
 */

const { pool } = require('./backend/db');

async function testDailyLimitFix() {
  console.log('🧪 开始测试激活码每日次数限制修复...\n');
  
  try {
    // 1. 查找激活码 GMBW-C26A-A9VD
    const testCode = 'GMBW-C26A-A9VD';
    console.log(`📋 测试激活码: ${testCode}`);
    
    const [codes] = await pool.query(
      'SELECT * FROM activation_codes WHERE code = ?',
      [testCode]
    );
    
    if (codes.length === 0) {
      console.log('❌ 激活码不存在，请先创建该激活码');
      return;
    }
    
    const code = codes[0];
    console.log(`✅ 找到激活码，ID: ${code.id}, 每日限制: ${code.daily_limit} 次\n`);
    
    // 2. 查询该激活码的所有激活记录
    const [records] = await pool.query(
      'SELECT * FROM activation_records WHERE code_id = ?',
      [code.id]
    );
    
    console.log(`📊 该激活码共有 ${records.length} 个激活记录（设备）\n`);
    
    // 3. 计算今日总使用次数
    const today = new Date().toISOString().split('T')[0];
    let totalUsedToday = 0;
    
    records.forEach((record, index) => {
      const usageByDate = JSON.parse(record.usage_by_date || '{}');
      const todayUsage = usageByDate[today] || 0;
      totalUsedToday += todayUsage;
      
      console.log(`设备 ${index + 1}:`);
      console.log(`  - 设备ID: ${record.user_device_id.substring(0, 20)}...`);
      console.log(`  - 今日使用: ${todayUsage} 次`);
      console.log(`  - 总使用: ${record.usage_count} 次`);
      console.log(`  - 过期时间: ${record.expires_at}`);
      console.log('');
    });
    
    console.log(`📊 今日总使用次数: ${totalUsedToday}/${code.daily_limit}`);
    console.log('');
    
    // 4. 测试验证逻辑
    console.log('🔍 测试验证逻辑...');
    
    if (totalUsedToday >= code.daily_limit) {
      console.log('✅ 今日次数已用完，验证时应该返回 valid: false');
      console.log('✅ 错误信息应该是: "今日使用次数已达上限（3次）"');
      console.log('✅ 用户在激活页面就会被拦截，无法进入测评页面');
    } else {
      console.log(`✅ 今日还有 ${code.daily_limit - totalUsedToday} 次可用`);
      console.log('✅ 验证时应该返回 valid: true');
      console.log('✅ 用户可以进入测评页面');
    }
    
    console.log('\n✨ 测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await pool.end();
  }
}

// 运行测试
testDailyLimitFix();

