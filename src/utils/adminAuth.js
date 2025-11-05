// 管理员认证工具函数
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
const TOKEN_KEY = 'admin_token'
const ADMIN_INFO_KEY = 'admin_info'

/**
 * 管理员登录
 */
export async function adminLogin(username, password) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    
    const result = await response.json()
    
    if (result.success && result.token) {
      // 保存token和管理员信息
      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(result.admin))
    }
    
    return result
  } catch (error) {
    console.error('登录失败:', error)
    return { success: false, error: '网络错误，请检查后端服务是否启动' }
  }
}

/**
 * 管理员登出
 */
export async function adminLogout() {
  try {
    const token = getToken()
    
    if (token) {
      await fetch(`${BACKEND_URL}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    }
    
    // 清除本地存储
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_INFO_KEY)
    
    return { success: true }
  } catch (error) {
    console.error('登出失败:', error)
    // 即使接口失败也清除本地存储
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ADMIN_INFO_KEY)
    return { success: true }
  }
}

/**
 * 获取当前管理员信息
 */
export async function getCurrentAdmin() {
  try {
    const token = getToken()
    
    if (!token) {
      return { success: false, error: '未登录' }
    }
    
    const response = await fetch(`${BACKEND_URL}/api/admin/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 更新本地存储的管理员信息
      localStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(result.admin))
    } else {
      // token无效，清除本地存储
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ADMIN_INFO_KEY)
    }
    
    return result
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 修改密码
 */
export async function changePassword(oldPassword, newPassword) {
  try {
    const token = getToken()
    
    if (!token) {
      return { success: false, error: '未登录' }
    }
    
    const response = await fetch(`${BACKEND_URL}/api/admin/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    })
    
    const result = await response.json()
    
    if (result.success) {
      // 修改密码成功，清除token（需要重新登录）
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ADMIN_INFO_KEY)
    }
    
    return result
  } catch (error) {
    console.error('修改密码失败:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 获取token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 获取本地存储的管理员信息
 */
export function getAdminInfo() {
  const info = localStorage.getItem(ADMIN_INFO_KEY)
  return info ? JSON.parse(info) : null
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  return !!getToken()
}

/**
 * 为API请求添加认证头
 */
export function getAuthHeaders() {
  const token = getToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

