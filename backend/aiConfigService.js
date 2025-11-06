// AI配置服务
const { pool } = require('./db');

// 辅助函数：执行查询
async function query(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 获取所有AI配置
 */
async function getAllAIConfigs() {
  try {
    const sql = `
      SELECT id, provider, api_key, api_url, model, is_active, 
             max_tokens, temperature, timeout, notes, 
             created_at, updated_at
      FROM ai_config
      ORDER BY is_active DESC, provider ASC
    `;
    
    const configs = await query(sql);
    
    return {
      success: true,
      data: configs
    };
  } catch (error) {
    console.error('获取AI配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取当前激活的AI配置
 */
async function getActiveAIConfig() {
  try {
    const sql = `
      SELECT id, provider, api_key, api_url, model, is_active,
             max_tokens, temperature, timeout, notes
      FROM ai_config
      WHERE is_active = 1
      LIMIT 1
    `;
    
    const configs = await query(sql);
    
    if (configs.length === 0) {
      // 如果没有激活的配置，返回默认配置
      return {
        success: true,
        data: {
          provider: 'claude',
          api_key: process.env.CLAUDE_API_KEY || '',
          api_url: process.env.CLAUDE_API_URL || 'https://dpapi.cn/v1/chat/completions',
          model: process.env.CLAUDE_MODEL || 'claude-4.5-sonnet',
          max_tokens: 2000,
          temperature: 0.7,
          timeout: 30000
        }
      };
    }
    
    return {
      success: true,
      data: configs[0]
    };
  } catch (error) {
    console.error('获取激活的AI配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 更新AI配置
 */
async function updateAIConfig(id, configData) {
  try {
    const { api_key, api_url, model, max_tokens, temperature, timeout, notes } = configData;
    
    const sql = `
      UPDATE ai_config
      SET api_key = ?, api_url = ?, model = ?, 
          max_tokens = ?, temperature = ?, timeout = ?, notes = ?
      WHERE id = ?
    `;
    
    await query(sql, [api_key, api_url, model, max_tokens, temperature, timeout, notes, id]);
    
    return {
      success: true,
      message: '配置更新成功'
    };
  } catch (error) {
    console.error('更新AI配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 切换激活的AI供应商
 */
async function switchActiveProvider(id) {
  try {
    // 先将所有配置设为未激活
    await query('UPDATE ai_config SET is_active = 0');
    
    // 激活指定的配置
    await query('UPDATE ai_config SET is_active = 1 WHERE id = ?', [id]);
    
    return {
      success: true,
      message: 'AI供应商切换成功'
    };
  } catch (error) {
    console.error('切换AI供应商失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 创建新的AI配置
 */
async function createAIConfig(configData) {
  try {
    const { provider, api_key, api_url, model, max_tokens, temperature, timeout, notes } = configData;
    
    const sql = `
      INSERT INTO ai_config (provider, api_key, api_url, model, max_tokens, temperature, timeout, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [provider, api_key, api_url, model, max_tokens || 2000, temperature || 0.7, timeout || 30000, notes || '']);
    
    return {
      success: true,
      data: { id: result.insertId },
      message: 'AI配置创建成功'
    };
  } catch (error) {
    console.error('创建AI配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 删除AI配置
 */
async function deleteAIConfig(id) {
  try {
    // 检查是否是激活的配置
    const checkSql = 'SELECT is_active FROM ai_config WHERE id = ?';
    const configs = await query(checkSql, [id]);
    
    if (configs.length === 0) {
      return {
        success: false,
        error: '配置不存在'
      };
    }
    
    if (configs[0].is_active === 1) {
      return {
        success: false,
        error: '不能删除当前激活的配置'
      };
    }
    
    await query('DELETE FROM ai_config WHERE id = ?', [id]);
    
    return {
      success: true,
      message: 'AI配置删除成功'
    };
  } catch (error) {
    console.error('删除AI配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 测试AI配置
 */
async function testAIConfig(configData) {
  const fetch = require('node-fetch');
  const AbortController = require('abort-controller');

  try {
    const { api_key, api_url, model, max_tokens, temperature, timeout } = configData;

    console.log('🧪 测试AI配置:', { api_url, model });

    // 创建超时控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout || 30000);

    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_key}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: '你好，请回复"测试成功"'
            }
          ],
          temperature: parseFloat(temperature) || 0.7,
          max_tokens: 50
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API错误: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        message: '测试成功',
        response: content
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('测试AI配置失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  getAllAIConfigs,
  getActiveAIConfig,
  updateAIConfig,
  switchActiveProvider,
  createAIConfig,
  deleteAIConfig,
  testAIConfig
};

