/**
 * 激活码验证工具
 */

// 验证激活码格式
export function validateActivationCode(code) {
  // 格式：4位-4位-4位（数字+大写字母）
  const pattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  return pattern.test(code)
}

// 自动格式化激活码
export function formatActivationCode(input) {
  // 移除非字母数字字符
  let cleaned = input.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  
  // 限制12个字符
  cleaned = cleaned.slice(0, 12)
  
  // 添加连字符
  let formatted = ''
  for (let i = 0; i < cleaned.length; i++) {
    if (i > 0 && i % 4 === 0) formatted += '-'
    formatted += cleaned[i]
  }
  
  return formatted
}

// 验证激活码（模拟API调用）
// 在实际项目中，这应该是一个真实的API调用
export async function verifyActivationCode(code) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 测试激活码（实际项目中应该调用后端API）
  const validCodes = [
    'TEST-2024-ABCD',
    'DEMO-1234-5678',
    'MVPX-XXXX-YYYY'
  ]
  
  // 简单验证：格式正确即可通过（开发阶段）
  return validateActivationCode(code)
}

// 保存激活状态
export function saveActivation(code) {
  localStorage.setItem('test_activated', 'true')
  localStorage.setItem('activation_code', code)
  localStorage.setItem('activation_time', Date.now())
}

// 检查是否已激活
export function checkActivation() {
  return localStorage.getItem('test_activated') === 'true'
}

