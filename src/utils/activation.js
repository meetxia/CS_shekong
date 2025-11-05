/**
 * 激活码验证工具
 * 
 * 支持两种模式：
 * 1. 本地后端模式（推荐）：使用本地后端 API 验证
 * 2. Supabase 模式：使用 Supabase 后端验证（已废弃）
 * 3. 本地模拟模式：模拟验证（开发/测试用）
 */

import { supabase, getDeviceId } from './supabaseClient'
import { verifyActivationCode as verifyWithBackend, recordUsage, fetchActivationStatus } from './backendActivation'

// 检查是否启用本地后端
const USE_LOCAL_BACKEND = true // 优先使用本地后端
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

// 检查是否启用 Supabase（备用）
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

// 验证激活码（使用本地后端、Supabase 或本地模拟）
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

  // 优先使用本地后端验证
  if (USE_LOCAL_BACKEND) {
    try {
      const deviceId = getDeviceId()
      const result = await verifyWithBackend(code, deviceId)
      
      if (result.valid) {
        // 验证成功，保存激活信息
        saveActivationFromBackend(code, result)
        // 计算剩余天数
        const expiresAt = result.expiresAt ? new Date(result.expiresAt) : null
        let daysLeft = 7
        if (expiresAt) {
          const msLeft = expiresAt.getTime() - Date.now()
          daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
        }
        
        // 计算今日剩余次数
        const todayUsage = result.todayUsage || 0
        const dailyLimit = result.dailyLimit || 3
        const remainingToday = Math.max(0, dailyLimit - todayUsage)
        
        return {
          valid: true,
          data: {
            daysLeft: daysLeft,
            remainingToday: remainingToday,
            recordId: result.recordId,
            expiresAt: result.expiresAt
          }
        }
      } else {
        // 验证失败，返回错误信息（传入额外数据，如剩余天数）
        return parseBackendError(result.error || '验证失败', {
          daysLeft: result.daysLeft,
          remainingToday: result.remainingToday,
          dailyLimit: result.dailyLimit,
          isActivated: result.isActivated
        })
      }
    } catch (err) {
      console.error('激活码验证异常（本地后端）:', err)
      
      // 如果本地后端失败，尝试使用 Supabase（如果配置了）
      if (USE_SUPABASE) {
        console.log('本地后端失败，尝试使用 Supabase...')
        // 继续执行下面的 Supabase 验证逻辑
      } else {
        // 没有 Supabase，返回网络错误
        return {
          valid: false,
          error: 'NETWORK_ERROR',
          message: '验证服务暂时不可用，请稍后重试',
          tip: '请确保后端服务运行在 ' + BACKEND_URL
        }
      }
    }
  }

  // 如果配置了 Supabase，使用 Supabase 验证（备用）
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

// 保存激活状态（从本地后端数据保存）
function saveActivationFromBackend(code, backendData) {
  localStorage.setItem('test_activated', 'true')
  localStorage.setItem('activation_code', code)
  const now = Date.now()
  localStorage.setItem('activation_time', now)

  // 计算过期时间
  let expiresAt
  if (backendData.expiresAt) {
    expiresAt = new Date(backendData.expiresAt)
  } else {
    expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + 7)
  }
  
  // 计算剩余天数
  const msLeft = expiresAt.getTime() - now
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
  
  // 计算今日剩余次数
  const todayUsage = backendData.todayUsage || 0
  const dailyLimit = backendData.dailyLimit || 3
  const remainingToday = Math.max(0, dailyLimit - todayUsage)
  
  const usage = {
    code,
    createdAt: new Date(now).toISOString(),
    expiresAt: expiresAt.toISOString(),
    dailyLimit: dailyLimit,
    usageByDate: {},
    recordId: backendData.recordId, // 保存记录 ID，用于后续更新
    daysLeft: daysLeft,
    remainingToday: remainingToday,
    syncedDate: todayStr(),
    usageCount: backendData.usageCount || 0
  }
  localStorage.setItem('activation_usage', JSON.stringify(usage))
}

// 解析后端错误信息，返回友好提示
function parseBackendError(errorMsg, extraData = {}) {
  if (!errorMsg) {
    return {
      valid: false,
      error: 'UNKNOWN_ERROR',
      message: '验证失败，请稍后重试',
      tip: '如果问题持续，请联系客服'
    }
  }

  const msg = errorMsg.toLowerCase()

  // 激活码不存在
  if (msg.includes('不存在') || msg.includes('not found') || msg.includes('不存在')) {
    return {
      valid: false,
      error: 'CODE_NOT_FOUND',
      message: '激活码不存在，请检查后重试',
      tip: '请确认激活码是否输入正确，或联系客服获取激活码'
    }
  }

  // 激活码已失效/被撤销
  if (msg.includes('已失效') || msg.includes('revoked') || msg.includes('已撤销')) {
    return {
      valid: false,
      error: 'CODE_REVOKED',
      message: '该激活码已失效，无法继续使用',
      tip: '请联系客服了解详情或获取新的激活码'
    }
  }

  // 激活码已过期（7天有效期已结束）
  if (msg.includes('已过期') || msg.includes('expired') || msg.includes('过期')) {
    return {
      valid: false,
      error: 'CODE_EXPIRED',
      message: '激活码已过期，有效期已结束',
      tip: '激活码有效期为 7 天，请联系客服获取新的激活码',
      icon: '⏰'
    }
  }

  // ⚠️ 重要：今日使用次数的判断必须在总次数判断之前，因为错误信息可能包含"使用次数已达上限"
  // 今日使用次数已达上限（每天 3 次）
  if (msg.includes('今日使用次数') || msg.includes('daily limit') || msg.includes('今日次数')) {
    // 从 extraData 中获取剩余天数
    const daysLeft = extraData.daysLeft !== undefined ? extraData.daysLeft : null

    let message = '今日测评次数已用完，明天再来吧～'
    let tip = '每天可测评 3 次，明天 00:00 自动恢复'
    let icon = '😊'

    // 根据剩余天数显示不同的提示
    if (daysLeft !== null) {
      if (daysLeft === 0) {
        // 今天是最后一天，但今日次数已用完
        message = '今日测评次数已用完，激活码今天到期'
        tip = '该激活码今天到期，明天将无法使用。如需继续测评，请联系客服获取新码'
        icon = '⏰'
      } else if (daysLeft === 1) {
        // 还剩 1 天
        message = '今日测评次数已用完，明天再来吧～'
        tip = `激活码还剩 1 天有效期，明天 00:00 恢复 3 次测评机会`
        icon = '😊'
      } else if (daysLeft <= 3) {
        // 还剩 2-3 天
        message = '今日测评次数已用完，明天再来吧～'
        tip = `激活码还剩 ${daysLeft} 天有效期，明天 00:00 恢复 3 次测评机会`
        icon = '😊'
      } else {
        // 还剩 4-7 天
        message = '今日测评次数已用完，明天再来吧～'
        tip = `激活码还剩 ${daysLeft} 天有效期，每天可测评 3 次`
        icon = '😊'
      }
    }

    return {
      valid: false,
      error: 'DAILY_LIMIT_REACHED',
      message,
      tip,
      icon,
      daysLeft
    }
  }

  // 使用次数已达上限（总次数 21 次）
  // ⚠️ 这个判断必须在"今日使用次数"判断之后，避免误判
  if (msg.includes('使用次数已达上限') || msg.includes('max uses') || msg.includes('次数已达上限')) {
    return {
      valid: false,
      error: 'MAX_USES_REACHED',
      message: '该激活码总使用次数已用完',
      tip: '每个激活码最多可使用 21 次（7天×3次/天），请联系客服获取新码',
      icon: '🔒'
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
    message: errorMsg || '验证失败，请稍后重试',
    tip: '如果问题持续，请联系客服'
  }
}

// 解析激活码错误信息，返回友好提示（Supabase 模式）
function parseActivationError(errorMsg, data = {}) {
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

  // 激活码已过期（7天有效期已结束）
  if (msg.includes('已过期') || msg.includes('expired')) {
    return {
      valid: false,
      error: 'CODE_EXPIRED',
      message: '激活码已过期，有效期已结束',
      tip: '激活码有效期为 7 天，请联系客服获取新的激活码',
      icon: '⏰'
    }
  }

  // ⚠️ 重要：今日使用次数的判断必须在总次数判断之前，因为错误信息可能包含"使用次数已达上限"
  // 今日使用次数已达上限（每天 3 次）
  if (msg.includes('今日使用次数') || msg.includes('daily limit')) {
    // 从 data 中获取剩余天数
    const daysLeft = data.days_left !== undefined ? data.days_left : null

    let message = '今日测评次数已用完，明天再来吧～'
    let tip = '每天可测评 3 次，明天 00:00 自动恢复'
    let icon = '😊'

    // 根据剩余天数显示不同的提示
    if (daysLeft !== null) {
      if (daysLeft === 0) {
        // 今天是最后一天，但今日次数已用完
        message = '今日测评次数已用完，激活码今天到期'
        tip = '该激活码今天到期，明天将无法使用。如需继续测评，请联系客服获取新码'
        icon = '⏰'
      } else if (daysLeft === 1) {
        // 还剩 1 天
        message = '今日测评次数已用完，明天再来吧～'
        tip = `激活码还剩 1 天有效期，明天 00:00 恢复 3 次测评机会`
        icon = '😊'
      } else if (daysLeft <= 3) {
        // 还剩 2-3 天
        message = '今日测评次数已用完，明天再来吧～'
        tip = `激活码还剩 ${daysLeft} 天有效期，明天 00:00 恢复 3 次测评机会`
        icon = '😊'
      } else {
        // 还剩 4-7 天
        message = '今日测评次数已用完，明天再来吧～'
        tip = `激活码还剩 ${daysLeft} 天有效期，每天可测评 3 次`
        icon = '😊'
      }
    }

    return {
      valid: false,
      error: 'DAILY_LIMIT_REACHED',
      message,
      tip,
      icon,
      daysLeft
    }
  }

  // 使用次数已达上限（总次数 21 次）
  // ⚠️ 这个判断必须在"今日使用次数"判断之后，避免误判
  if (msg.includes('使用次数已达上限') || msg.includes('max uses')) {
    return {
      valid: false,
      error: 'MAX_USES_REACHED',
      message: '该激活码总使用次数已用完',
      tip: '每个激活码最多可使用 21 次（7天×3次/天），请联系客服获取新码',
      icon: '🔒'
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
  console.log('[getActivationStatus] 开始获取状态, code:', code)
  
  // 本地后端：直接向后端查询最新状态，确保与数据库对齐
  if (USE_LOCAL_BACKEND && code) {
    try {
      const deviceId = getDeviceId()
      console.log('[getActivationStatus] 调用本地后端, deviceId:', deviceId)
      const result = await fetchActivationStatus(code, deviceId)
      console.log('[getActivationStatus] 后端返回:', result)
      if (result && result.success) {
        // 更新本地缓存
        let usage = readUsage()
        if (usage) {
          usage.daysLeft = result.daysLeft
          usage.remainingToday = result.remainingToday
          usage.expired = result.expired
          usage.dailyLimit = result.dailyLimit || usage.dailyLimit || 3
          if (result.expiresAt) usage.expiresAt = new Date(result.expiresAt).toISOString()
          usage.syncedDate = todayStr()
          localStorage.setItem('activation_usage', JSON.stringify(usage))
          console.log('[getActivationStatus] 已更新本地缓存')
        } else {
          console.warn('[getActivationStatus] 本地无usage缓存，直接使用后端数据')
        }
        
        // 返回后端数据（即使本地没有缓存也要返回）
        const statusData = {
          daysLeft: result.daysLeft,
          remainingToday: result.remainingToday,
          expired: result.expired,
          dailyLimit: result.dailyLimit || 3
        }
        console.log('[getActivationStatus] 返回状态数据:', statusData)
        return statusData
      } else {
        console.warn('[getActivationStatus] 后端返回失败或无数据:', result)
      }
    } catch (err) {
      console.error('[getActivationStatus] 本地后端获取激活状态失败:', err)
    }
  }

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
  if (!usage) return { daysLeft: 0, remainingToday: 0, expired: true, dailyLimit: 3 }

  const now = new Date()
  const expiresAt = new Date(usage.expiresAt)
  const msLeft = expiresAt - now
  const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)))
  const expired = msLeft <= 0

  const today = todayStr()
  const dailyLimit = usage.dailyLimit || 3
  // 如果刚从后端同步过今日剩余次数，则优先使用它，避免与本地 usageByDate 不一致
  let remainingToday
  if (typeof usage.remainingToday === 'number' && usage.syncedDate === today) {
    remainingToday = Math.max(0, usage.remainingToday)
  } else {
    const usedToday = usage.usageByDate[today] || 0
    remainingToday = Math.max(0, dailyLimit - usedToday)
  }

  return { daysLeft, remainingToday, expired, dailyLimit }
}

// 记录一次使用（返回更新后的状态）
export async function recordOneUsage() {
  const code = getActivationCode()
  const usage = readUsage()
  if (!usage || !code) return null

  // 🔧 优先使用本地后端记录使用次数
  if (USE_LOCAL_BACKEND && usage.recordId) {
    try {
      console.log('📊 [扣次数] 调用本地后端记录使用次数...')
      const result = await recordUsage(usage.recordId)
      
      if (result.success) {
        console.log(`✅ [扣次数] 成功！剩余 ${result.remainingToday} 次/今日，${result.daysLeft} 天`)
        
        // 更新本地缓存
        usage.remainingToday = result.remainingToday
        usage.daysLeft = result.daysLeft
        if (result.expiresAt) {
          usage.expiresAt = new Date(result.expiresAt).toISOString()
        }
        localStorage.setItem('activation_usage', JSON.stringify(usage))
        
        return {
          daysLeft: result.daysLeft,
          remainingToday: result.remainingToday,
          expired: result.expired || false,
          recorded: true
        }
      } else {
        console.warn('⚠️ [扣次数] 后端返回失败:', result.message)
        return {
          daysLeft: usage.daysLeft || 0,
          remainingToday: usage.remainingToday || 0,
          expired: true,
          recorded: false,
          error: result.message
        }
      }
    } catch (err) {
      console.error('❌ [扣次数] 本地后端调用失败:', err)
      // 失败时回退到 Supabase 或本地模式
    }
  }

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

  // 本地模式（仅用于开发/测试）
  console.log('⚠️ [扣次数] 使用本地LocalStorage模式（开发模式）')
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

