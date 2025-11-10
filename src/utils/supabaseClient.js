/**
 * Supabase 客户端配置
 * 
 * 使用说明：
 * 1. 在 Supabase Dashboard 创建项目
 * 2. 获取项目 URL 和 anon key
 * 3. 在项目根目录创建 .env 文件：
 *    VITE_SUPABASE_URL=your-project-url
 *    VITE_SUPABASE_ANON_KEY=your-anon-key
 * 4. 重启开发服务器
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 只在开发模式下显示一次警告
if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  const warned = sessionStorage.getItem('supabase_warning_shown')
  if (!warned) {
    console.warn('⚠️ Supabase 配置缺失，如果使用本地后端可忽略此警告')
    sessionStorage.setItem('supabase_warning_shown', 'true')
  }
}

// 创建 Supabase 客户端
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // 激活码系统不需要认证
      autoRefreshToken: false
    }
  }
)

/**
 * 获取设备 ID（用于追踪）
 * 优先使用 localStorage，如果没有则生成一个
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

export default supabase

