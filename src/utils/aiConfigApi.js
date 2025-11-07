/**
 * AI配置管理API
 */

// 生产环境使用相对路径，开发环境使用完整地址
const API_BASE = import.meta.env.VITE_BACKEND_URL
  ? `${import.meta.env.VITE_BACKEND_URL}/api/admin/ai-config`
  : '/api/admin/ai-config'

/**
 * 获取认证token
 */
function getAuthToken() {
  return localStorage.getItem('admin_token')
}

/**
 * 获取所有AI配置
 */
export async function getAIConfigs() {
  try {
    const response = await fetch(API_BASE, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    return await response.json()
  } catch (error) {
    console.error('获取AI配置失败:', error)
    throw error
  }
}

/**
 * 获取当前激活的AI配置
 */
export async function getActiveAIConfig() {
  try {
    const response = await fetch(`${API_BASE}/active`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    return await response.json()
  } catch (error) {
    console.error('获取激活的AI配置失败:', error)
    throw error
  }
}

/**
 * 创建新的AI配置
 */
export async function createAIConfig(configData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(configData)
    })
    
    return await response.json()
  } catch (error) {
    console.error('创建AI配置失败:', error)
    throw error
  }
}

/**
 * 更新AI配置
 */
export async function updateAIConfig(id, configData) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(configData)
    })
    
    return await response.json()
  } catch (error) {
    console.error('更新AI配置失败:', error)
    throw error
  }
}

/**
 * 激活AI配置
 */
export async function activateAIConfig(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}/activate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    return await response.json()
  } catch (error) {
    console.error('激活AI配置失败:', error)
    throw error
  }
}

/**
 * 删除AI配置
 */
export async function deleteAIConfig(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    
    return await response.json()
  } catch (error) {
    console.error('删除AI配置失败:', error)
    throw error
  }
}

/**
 * 测试AI配置连接
 */
export async function testAIConnection(configData) {
  try {
    const response = await fetch(`${API_BASE}/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(configData)
    })
    
    return await response.json()
  } catch (error) {
    console.error('测试AI配置失败:', error)
    throw error
  }
}

