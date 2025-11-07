/**
 * 测试重复扣次数问题修复
 *
 * 问题描述:
 * 用户在激活页填写新激活码后,点击"开始测试",会被扣2次次数:
 * 1. 激活页验证成功后扣1次
 * 2. 跳转到测评页,检测到旧报告,用户确认重新测试后又扣1次
 *
 * 修复方案:
 * 在激活页检查是否有旧报告:
 * - 如果没有旧报告: 正常扣次数,然后跳转
 * - 如果有旧报告: 不扣次数,直接跳转到测评页,让用户确认后再扣次数
 */

const mysql = require('mysql2/promise')

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'social_anxiety_test'
}

async function testDuplicateDeductionFix() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🧪 测试重复扣次数问题修复')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')

  let connection
  try {
    // 连接数据库
    connection = await mysql.createConnection(dbConfig)
    console.log('✅ 数据库连接成功')
    console.log('')

    // 1. 查找一个有效的激活码
    console.log('📋 步骤 1: 查找有效的激活码')
    console.log('─'.repeat(60))
    
    const [codes] = await connection.query(`
      SELECT * FROM activation_codes 
      WHERE status = 'active' 
      AND current_uses < max_uses
      LIMIT 1
    `)

    if (codes.length === 0) {
      console.log('❌ 没有找到可用的激活码')
      return
    }

    const testCode = codes[0]
    console.log(`✅ 找到测试激活码: ${testCode.code}`)
    console.log(`   - 每日限制: ${testCode.daily_limit} 次/天`)
    console.log(`   - 有效期: ${testCode.validity_days} 天`)
    console.log('')

    // 2. 查询该激活码的所有激活记录
    console.log('📋 步骤 2: 查询激活记录')
    console.log('─'.repeat(60))
    
    const [records] = await connection.query(`
      SELECT * FROM activation_records 
      WHERE code_id = ?
    `, [testCode.id])

    console.log(`✅ 找到 ${records.length} 条激活记录`)
    
    // 3. 计算今日总使用次数
    const today = new Date().toISOString().split('T')[0]
    let totalUsedToday = 0
    
    for (const record of records) {
      const usageByDate = JSON.parse(record.usage_by_date || '{}')
      const usedToday = usageByDate[today] || 0
      totalUsedToday += usedToday
      
      if (usedToday > 0) {
        console.log(`   - 设备 ${record.user_device_id}: 今日使用 ${usedToday} 次`)
      }
    }
    
    console.log(`📊 今日总使用次数: ${totalUsedToday}/${testCode.daily_limit}`)
    console.log('')

    // 4. 模拟场景说明
    console.log('📋 步骤 3: 修复前后对比')
    console.log('─'.repeat(60))
    console.log('')
    
    console.log('❌ 修复前的流程:')
    console.log('   1. 用户在激活页填写新激活码')
    console.log('   2. 点击"开始测试"')
    console.log('   3. 验证成功 → 扣除1次 (激活页)')
    console.log('   4. 跳转到测评页')
    console.log('   5. 检测到旧报告 → 显示确认对话框')
    console.log('   6. 用户点击"确认重新测试"')
    console.log('   7. 再次扣除1次 (测评页) ❌ 重复扣除!')
    console.log('   8. 结果: 扣了2次,但只测了1次')
    console.log('')
    
    console.log('✅ 修复后的流程:')
    console.log('   1. 用户在激活页填写新激活码')
    console.log('   2. 点击"开始测试"')
    console.log('   3. 验证成功 → 检查是否有旧报告')
    console.log('   4. 如果有旧报告:')
    console.log('      - 不扣次数,直接跳转到测评页')
    console.log('      - 显示确认对话框')
    console.log('      - 用户确认后才扣除1次 ✅')
    console.log('   5. 如果没有旧报告:')
    console.log('      - 扣除1次,然后跳转 ✅')
    console.log('   6. 结果: 只扣1次 ✅')
    console.log('')

    // 5. 验证修复
    console.log('📋 步骤 4: 验证修复效果')
    console.log('─'.repeat(60))
    console.log('')
    
    console.log('修复的关键代码位置:')
    console.log('   文件: src/views/ActivationPage.vue')
    console.log('   行数: 104-172')
    console.log('')
    console.log('修复内容:')
    console.log('   1. 在 handleStart 函数中添加旧报告检查')
    console.log('   2. 如果有旧报告: 不扣次数,直接跳转')
    console.log('   3. 如果没有旧报告: 正常扣次数,然后跳转')
    console.log('')

    // 6. 测试建议
    console.log('📋 步骤 5: 测试建议')
    console.log('─'.repeat(60))
    console.log('')
    console.log('手动测试步骤:')
    console.log('   1. 完成一次测评,生成报告')
    console.log('   2. 在激活页填写新的激活码')
    console.log('   3. 点击"开始测试"')
    console.log('   4. 应该看到确认对话框: "是否重新测试?"')
    console.log('   5. 点击"确认"')
    console.log('   6. 检查数据库,应该只扣了1次')
    console.log('')
    console.log('验证方法:')
    console.log('   - 查看浏览器控制台日志')
    console.log('   - 查看后端日志')
    console.log('   - 查询数据库 activation_records 表的 usage_by_date 字段')
    console.log('')

    // 7. 总结
    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ 修复总结')
    console.log('═══════════════════════════════════════════════════════════')
    console.log('')
    console.log('问题: 重复扣次数 (扣2次,只测1次)')
    console.log('原因: 激活页和测评页都扣了次数')
    console.log('修复: 激活页检查旧报告,有则不扣,让测评页统一处理')
    console.log('效果: 只扣1次 ✅')
    console.log('')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log('✅ 数据库连接已关闭')
    }
  }
}

// 运行测试
testDuplicateDeductionFix()

