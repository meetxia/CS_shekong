/**
 * Supabase 连接测试脚本
 * 用于验证配置是否正确
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// 手动读取 .env 文件
let supabaseUrl = ''
let supabaseAnonKey = ''

try {
  const envContent = readFileSync('.env', 'utf-8')
  const lines = envContent.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
        supabaseUrl = trimmed.split('=')[1].trim()
      }
      if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
        supabaseAnonKey = trimmed.split('=')[1].trim()
      }
    }
  }
} catch (error) {
  console.error('❌ 读取 .env 文件失败:', error.message)
  console.error('请确保项目根目录有 .env 文件')
  process.exit(1)
}

console.log('='.repeat(60))
console.log('🔍 Supabase 连接测试')
console.log('='.repeat(60))
console.log()

// 1. 检查环境变量
console.log('📋 步骤 1: 检查环境变量')
console.log('-'.repeat(60))
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置')
if (supabaseUrl) {
  console.log('  URL:', supabaseUrl)
}
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 已配置' : '❌ 未配置')
if (supabaseAnonKey) {
  console.log('  Key 长度:', supabaseAnonKey.length, '字符')
  console.log('  Key 前缀:', supabaseAnonKey.substring(0, 20) + '...')
}
console.log()

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 环境变量配置不完整！')
  console.log('请检查 .env 文件是否正确配置')
  process.exit(1)
}

// 2. 创建 Supabase 客户端
console.log('📋 步骤 2: 创建 Supabase 客户端')
console.log('-'.repeat(60))
let supabase
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase 客户端创建成功')
  console.log()
} catch (error) {
  console.log('❌ 创建失败:', error.message)
  process.exit(1)
}

// 3. 测试数据库连接
console.log('📋 步骤 3: 测试数据库连接')
console.log('-'.repeat(60))
try {
  const { data, error } = await supabase
    .from('activation_codes')
    .select('count')
    .limit(1)
  
  if (error) {
    console.log('❌ 数据库连接失败:', error.message)
    console.log('提示: 请检查表是否已创建')
  } else {
    console.log('✅ 数据库连接成功')
  }
  console.log()
} catch (error) {
  console.log('❌ 数据库连接异常:', error.message)
  console.log()
}

// 4. 检查表是否存在
console.log('📋 步骤 4: 检查数据表')
console.log('-'.repeat(60))
try {
  const { data: codes, error: codesError } = await supabase
    .from('activation_codes')
    .select('code, status')
    .limit(5)
  
  if (codesError) {
    console.log('❌ activation_codes 表:', codesError.message)
  } else {
    console.log('✅ activation_codes 表: 存在')
    console.log('   记录数:', codes.length)
    if (codes.length > 0) {
      console.log('   示例激活码:')
      codes.forEach(code => {
        console.log(`   - ${code.code} (${code.status})`)
      })
    }
  }
  console.log()

  const { data: records, error: recordsError } = await supabase
    .from('activation_records')
    .select('id')
    .limit(1)
  
  if (recordsError) {
    console.log('❌ activation_records 表:', recordsError.message)
  } else {
    console.log('✅ activation_records 表: 存在')
  }
  console.log()
} catch (error) {
  console.log('❌ 检查表失败:', error.message)
  console.log()
}

// 5. 检查数据库函数
console.log('📋 步骤 5: 检查数据库函数')
console.log('-'.repeat(60))
try {
  // 测试 verify_activation_code 函数
  const { data, error } = await supabase.rpc('verify_activation_code', {
    input_code: 'TEST-0000-0000', // 使用一个不存在的测试码
    device_id: 'test_device'
  })
  
  if (error) {
    console.log('❌ verify_activation_code 函数:', error.message)
    console.log('提示: 请执行数据库脚本创建函数')
  } else {
    console.log('✅ verify_activation_code 函数: 存在且可调用')
    console.log('   测试返回:', JSON.stringify(data, null, 2))
  }
  console.log()
} catch (error) {
  console.log('❌ 函数调用失败:', error.message)
  console.log()
}

// 6. 测试激活码验证
console.log('📋 步骤 6: 测试激活码验证')
console.log('-'.repeat(60))
const testCodes = ['TEST-2024-ABCD', 'DEMO-1234-5678', 'MVPX-XXXX-YYYY']
for (const code of testCodes) {
  try {
    const { data, error } = await supabase.rpc('verify_activation_code', {
      input_code: code,
      device_id: 'test_device_' + Date.now()
    })
    
    if (error) {
      console.log(`   ${code}: ❌ ${error.message}`)
    } else {
      if (data.valid) {
        console.log(`   ${code}: ✅ 有效`)
        console.log(`      - 剩余天数: ${data.days_left} 天`)
        console.log(`      - 今日剩余: ${data.remaining_today} 次`)
      } else {
        console.log(`   ${code}: ⚠️  ${data.error || '无效'}`)
      }
    }
  } catch (error) {
    console.log(`   ${code}: ❌ ${error.message}`)
  }
}
console.log()

// 总结
console.log('='.repeat(60))
console.log('✅ 测试完成！')
console.log('='.repeat(60))
console.log()
console.log('💡 下一步:')
console.log('   1. 如果所有测试都通过，可以启动开发服务器测试')
console.log('   2. 如果有错误，请按照提示修复')
console.log('   3. 访问 http://localhost:5173/activation 测试前端功能')
console.log()

