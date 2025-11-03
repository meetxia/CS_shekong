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
  const now = Date.now()
  localStorage.setItem('activation_time', now)

  // 初始化用量追踪（7天有效，每天3次）
  const createdAt = new Date(now)
  const expiresAt = new Date(createdAt)
  expiresAt.setDate(createdAt.getDate() + 7)

  const usage = {
    code,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    dailyLimit: 3,
    usageByDate: {}
  }
  localStorage.setItem('activation_usage', JSON.stringify(usage))
}

// 检查是否已激活
export function checkActivation() {
  return localStorage.getItem('test_activated') === 'true'
}

// 读取用量对象（无则返回null）
function readUsage() {
  const raw = localStorage.getItem('activation_usage')
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

// 计算今日字符串（本地时区）
function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 获取激活状态（剩余天数、今日剩余次数）
export function getActivationStatus() {
  const usage = readUsage()
  if (!usage) return { daysLeft: 0, remainingToday: 0, expired: true }

  const now = new Date()
  const expiresAt = new Date(usage.expiresAt)
  const msLeft = expiresAt - now
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
  const expired = msLeft <= 0

  const usedToday = usage.usageByDate[todayStr()] || 0
  const remainingToday = Math.max(0, usage.dailyLimit - usedToday)

  return { daysLeft, remainingToday, expired, dailyLimit: usage.dailyLimit }
}

// 记录一次使用（返回更新后的状态）
export function recordOneUsage() {
  const usage = readUsage()
  if (!usage) return null

  const status = getActivationStatus()
  if (status.expired) return { ...status, recorded: false }

  const key = todayStr()
  const used = usage.usageByDate[key] || 0
  if (used >= usage.dailyLimit) {
    localStorage.setItem('activation_usage', JSON.stringify(usage))
    return { ...status, recorded: false }
  }

  usage.usageByDate[key] = used + 1
  localStorage.setItem('activation_usage', JSON.stringify(usage))

  const updated = getActivationStatus()
  return { ...updated, recorded: true }
}

// 重置到明日（仅用于调试/测试场景，可不暴露UI）
export function _devAdvanceOneDay() {
  const usage = readUsage()
  if (!usage) return
  const expiresAt = new Date(usage.expiresAt)
  expiresAt.setDate(expiresAt.getDate() + 1)
  usage.expiresAt = expiresAt.toISOString()
  localStorage.setItem('activation_usage', JSON.stringify(usage))
}

// 读取当前激活码
export function getActivationCode() {
  return localStorage.getItem('activation_code') || ''
}

// 生成带激活码的专属链接（/activation?code=XXXX-XXXX-XXXX）
export function generateActivationShareLink() {
  const code = getActivationCode()
  if (!code) return window.location.origin + '/activation'
  const url = new URL(window.location.origin + '/activation')
  url.searchParams.set('code', code)
  return url.toString()
}

