// 本地后端激活码API调用
import { getAuthHeaders } from './adminAuth'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

/**
 * 验证激活码
 */
export async function verifyActivationCode(code, deviceId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/activation/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, deviceId })
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('验证激活码失败:', error)
    return { valid: false, error: '网络错误，请检查后端服务是否启动' }
  }
}

/**
 * 记录使用次数
 */
export async function recordUsage(recordId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/activation/record-usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recordId })
    })
    
    const result = await response.json()
    return result
  } catch (error) {
    console.error('记录使用失败:', error)
    return { success: false, error: error.message }
  }
}

// ============================================
// 管理端API
// ============================================

/**
 * 列表激活码
 */
export async function listActivationCodes({ page = 1, pageSize = 20, status, q } = {}) {
  try {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('pageSize', pageSize)
    if (status) params.append('status', status)
    if (q) params.append('q', q)
    
    const response = await fetch(`${BACKEND_URL}/api/admin/codes?${params}`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return { list: result.list, total: result.total }
  } catch (error) {
    console.error('获取激活码列表失败:', error)
    throw error
  }
}

/**
 * 创建激活码
 */
export async function adminCreateCode(payload) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result
  } catch (error) {
    console.error('创建激活码失败:', error)
    throw error
  }
}

/**
 * 批量创建激活码
 */
export async function adminCreateCodesBulk(items) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/codes/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ items })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.data
  } catch (error) {
    console.error('批量创建激活码失败:', error)
    throw error
  }
}

/**
 * 更新激活码
 */
export async function adminUpdateCode(id, payload) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/codes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result
  } catch (error) {
    console.error('更新激活码失败:', error)
    throw error
  }
}

/**
 * 撤销激活码
 */
export async function adminRevokeCode(id) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/codes/${id}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result
  } catch (error) {
    console.error('撤销激活码失败:', error)
    throw error
  }
}

/**
 * 删除激活码
 */
export async function adminDeleteCode(id) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/codes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result
  } catch (error) {
    console.error('删除激活码失败:', error)
    throw error
  }
}

/**
 * 获取激活码统计
 */
export async function fetchActivationStats() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/stats`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    const data = result.data
    
    return {
      totalCodes: data.total_codes || 0,
      activeCodes: data.active_codes || 0,
      expiredCodes: data.expired_codes || 0,
      revokedCodes: data.revoked_codes || 0,
      totalActivations: data.total_activations || 0,
      totalUsageCount: data.total_usage_count || 0,
      byCode: data.byCode || []
    }
  } catch (error) {
    console.error('获取激活码统计失败:', error)
    throw error
  }
}

/**
 * 获取激活记录
 */
export async function listActivationRecordsByCode(code, limit = 30) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/admin/records/${code}?limit=${limit}`, {
      headers: getAuthHeaders()
    })
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    return result.list || []
  } catch (error) {
    console.error('获取激活记录失败:', error)
    throw error
  }
}

