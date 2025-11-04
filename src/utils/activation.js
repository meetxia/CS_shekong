/**
 * 激活码验证工具
 * 
 * 支持两种模式：
 * 1. Supabase 模式（推荐）：使用 Supabase 后端验证
 * 2. 本地模式：模拟验证（开发/测试用）
 */

import { supabase, getDeviceId } from './supabaseClient'

// 检查是否启用 Supabase
const USE_SUPABASE = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

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

// 验证激活码（使用 Supabase 或本地模拟）
// 返回格式：{ valid: boolean, error: string, message: string, data: object }
export async function verifyActivationCode(code) {
  // 格式验证
  if (!validateActivationCode(code)) {
    return {
      valid: false,
      error: 'INVALID_FORMAT',
      message: '激活码格式错误，请检查后重试',
      tip: '正确格式：XXXX-XXXX-XXXX（12位数字和大写字母）'
    }
  }

  // 如果配置了 Supabase，使用 Supabase 验证
  if (USE_SUPABASE) {
    try {
      const deviceId = getDeviceId()
      
      // 调用 Supabase 数据库函数验证激活码
      const { data, error } = await supabase.rpc('verify_activation_code', {
        input_code: code,
        device_id: deviceId
      })

      if (error) {
        console.error('激活码验证错误:', error)
        return {
          valid: false,
          error: 'SERVER_ERROR',
          message: '验证服务暂时不可用，请稍后重试',
          tip: '如果问题持续，请联系客服'
        }
      }

      if (data && data.valid) {
        // 验证成功，保存激活信息到本地
        saveActivationFromSupabase(code, data)
        return {
          valid: true,
          data: {
            daysLeft: data.days_left,
            remainingToday: data.remaining_today
          }
        }
      } else {
        // 根据错误类型返回不同的提示
        const errorMsg = data?.error || '未知错误'
        return parseActivationError(errorMsg, data)
      }
    } catch (err) {
      console.error('激活码验证异常:', err)
      return {
        valid: false,
        error: 'NETWORK_ERROR',
        message: '网络连接失败，请检查网络后重试',
        tip: '请确保网络畅通'
      }
    }
  }

  // 本地模拟模式（开发/测试用）
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 简单验证：格式正确即可通过（开发阶段）
  return {
    valid: true,
    data: {
      daysLeft: 7,
      remainingToday: 3
    }
  }
}

// 解析激活码错误信息，返回友好提示
function parseActivationError(errorMsg, data) {
  const msg = errorMsg.toLowerCase()
  
  // 激活码不存在
  if (msg.includes('不存在') || msg.includes('not found')) {
    return {
      valid: false,
      error: 'CODE_NOT_FOUND',
      message: '激活码不存在，请检查后重试',
      tip: '请确认激活码是否输入正确，或联系客服获取激活码'
    }
  }
  
  // 激活码已失效/被撤销
  if (msg.includes('已失效') || msg.includes('revoked')) {
    return {
      valid: false,
      error: 'CODE_REVOKED',
      message: '该激活码已失效，无法继续使用',
      tip: '请联系客服了解详情或获取新的激活码'
    }
  }
  
  // 激活码已过期
  if (msg.includes('已过期') || msg.includes('expired')) {
    return {
      valid: false,
      error: 'CODE_EXPIRED',
      message: '激活码已过期，有效期已结束',
      tip: '激活码有效期为 7 天，请联系客服获取新的激活码'
    }
  }
  
  // 使用次数已达上限（总次数）
  if (msg.includes('使用次数已达上限') || msg.includes('max uses')) {
    return {
      valid: false,
      error: 'MAX_USES_REACHED',
      message: '该激活码使用次数已用完',
      tip: '每个激活码最多可使用 21 次（7天×3次/天），请联系客服获取新码'
    }
  }
  
  // 今日使用次数已达上限
  if (msg.includes('今日使用次数') || msg.includes('daily limit')) {
    return {
      valid: false,
      error: 'DAILY_LIMIT_REACHED',
      message: '今日测评次数已用完，明天再来吧～',
      tip: '每天可测评 3 次，明天 00:00 自动恢复',
      icon: '😊'
    }
  }
  
  // 激活码状态异常
  if (msg.includes('状态') || msg.includes('status')) {
    return {
      valid: false,
      error: 'INVALID_STATUS',
      message: '激活码状态异常，请联系客服',
      tip: '请提供激活码以便客服帮您查询'
    }
  }
  
  // 默认错误
  return {
    valid: false,
    error: 'UNKNOWN_ERROR',
    message: '激活失败，请稍后重试',
    tip: errorMsg || '如果问题持续，请联系客服'
  }
}

// 保存激活状态（从 Supabase 数据保存）
function saveActivationFromSupabase(code, supabaseData) {
  localStorage.setItem('test_activated', 'true')
  localStorage.setItem('activation_code', code)
  const now = Date.now()
  localStorage.setItem('activation_time', now)

  // 使用 Supabase 返回的数据
  const expiresAt = new Date(supabaseData.expires_at)
  
  const usage = {
    code,
    createdAt: new Date(now).toISOString(),
    expiresAt: expiresAt.toISOString(),
    dailyLimit: 3, // 从数据库获取，这里先用默认值
    usageByDate: {},
    recordId: supabaseData.record_id, // 保存记录 ID，用于后续更新
    daysLeft: supabaseData.days_left,
    remainingToday: supabaseData.remaining_today
  }
  localStorage.setItem('activation_usage', JSON.stringify(usage))
}

// 保存激活状态（兼容旧版本）
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
export async function getActivationStatus() {
  const code = getActivationCode()
  
  // 如果配置了 Supabase 且有激活码，从服务器获取最新状态
  if (USE_SUPABASE && code) {
    try {
      const { data, error } = await supabase.rpc('get_activation_status', {
        input_code: code
      })

      if (!error && data && !data.error) {
        // 更新本地缓存
        const usage = readUsage()
        if (usage) {
          usage.daysLeft = data.days_left
          usage.remainingToday = data.remaining_today
          usage.expired = data.expired
          localStorage.setItem('activation_usage', JSON.stringify(usage))
        }
        
        return {
          daysLeft: data.days_left,
          remainingToday: data.remaining_today,
          expired: data.expired,
          dailyLimit: data.daily_limit,
          totalUsage: data.total_usage
        }
      }
    } catch (err) {
      console.error('获取激活状态失败:', err)
      // 失败时回退到本地检查
    }
  }

  // 本地模式或 Supabase 失败时，使用本地数据
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
export async function recordOneUsage() {
  const code = getActivationCode()
  const usage = readUsage()
  if (!usage || !code) return null

  // 如果使用 Supabase，通过验证函数来更新使用次数
  if (USE_SUPABASE && code) {
    try {
      const deviceId = getDeviceId()
      const { data, error } = await supabase.rpc('verify_activation_code', {
        input_code: code,
        device_id: deviceId
      })

      if (error || !data || !data.valid) {
        return {
          daysLeft: 0,
          remainingToday: 0,
          expired: true,
          recorded: false,
          error: data?.error || error?.message
        }
      }

      // 更新本地缓存
      if (usage) {
        usage.remainingToday = data.remaining_today
        usage.daysLeft = data.days_left
        usage.expiresAt = new Date(data.expires_at).toISOString()
        localStorage.setItem('activation_usage', JSON.stringify(usage))
      }

      return {
        daysLeft: data.days_left,
        remainingToday: data.remaining_today,
        expired: false,
        recorded: true
      }
    } catch (err) {
      console.error('记录使用次数失败:', err)
      // 失败时回退到本地模式
    }
  }

  // 本地模式
  const status = await getActivationStatus()
  if (status.expired) return { ...status, recorded: false }

  const key = todayStr()
  const used = usage.usageByDate[key] || 0
  if (used >= usage.dailyLimit) {
    localStorage.setItem('activation_usage', JSON.stringify(usage))
    return { ...status, recorded: false }
  }

  usage.usageByDate[key] = used + 1
  localStorage.setItem('activation_usage', JSON.stringify(usage))

  const updated = await getActivationStatus()
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

