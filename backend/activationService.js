// 激活码服务
const { pool } = require('./db');

/**
 * 生成激活码（格式：XXXX-XXXX-XXXX）
 */
function generateActivationCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除容易混淆的字符
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) {
      code += '-';
    }
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * 验证激活码
 */
async function verifyActivationCode(inputCode, deviceId = null) {
  try {
    // 格式化激活码
    inputCode = inputCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (inputCode.length !== 12) {
      return { valid: false, error: '激活码格式错误' };
    }
    
    // 重新添加连字符
    inputCode = `${inputCode.slice(0, 4)}-${inputCode.slice(4, 8)}-${inputCode.slice(8, 12)}`;
    
    // 查询激活码
    const [codes] = await pool.query(
      'SELECT * FROM activation_codes WHERE code = ?',
      [inputCode]
    );
    
    if (codes.length === 0) {
      return { valid: false, error: '激活码不存在' };
    }
    
    const code = codes[0];
    
    // 检查状态
    if (code.status !== 'active') {
      return { valid: false, error: '激活码已失效' };
    }
    
    // 检查是否过期
    if (code.expires_at && new Date(code.expires_at) < new Date()) {
      await pool.query('UPDATE activation_codes SET status = ? WHERE id = ?', ['expired', code.id]);
      return { valid: false, error: '激活码已过期' };
    }
    
    // 检查使用次数
    if (code.current_uses >= code.max_uses) {
      await pool.query('UPDATE activation_codes SET status = ? WHERE id = ?', ['used', code.id]);
      return { valid: false, error: '激活码使用次数已达上限' };
    }
    
    // 查找激活记录
    let [records] = await pool.query(
      'SELECT * FROM activation_records WHERE activation_code = ? AND user_device_id = ?',
      [inputCode, deviceId]
    );
    
    if (records.length > 0) {
      // 已激活，检查是否过期
      const record = records[0];
      if (record.expires_at && new Date(record.expires_at) < new Date()) {
        return { valid: false, error: '您的激活已过期' };
      }
      
      // 检查今日使用次数
      const today = new Date().toISOString().split('T')[0];
      const usageByDate = JSON.parse(record.usage_by_date || '{}');
      const todayUsage = usageByDate[today] || 0;
      
      if (todayUsage >= code.daily_limit) {
        return {
          valid: false,
          error: `今日使用次数已达上限（${code.daily_limit}次）`,
          isActivated: true,
          expiresAt: record.expires_at
        };
      }
      
      return {
        valid: true,
        isActivated: true,
        recordId: record.id,
        expiresAt: record.expires_at,
        usageCount: record.usage_count,
        todayUsage,
        dailyLimit: code.daily_limit
      };
    }
    
    // 未激活，创建新记录
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + code.validity_days);
    
    const [result] = await pool.query(
      `INSERT INTO activation_records 
       (code_id, activation_code, user_device_id, expires_at, usage_by_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [code.id, inputCode, deviceId, expiresAt, JSON.stringify({})]
    );
    
    // 更新激活码使用次数
    await pool.query(
      'UPDATE activation_codes SET current_uses = current_uses + 1 WHERE id = ?',
      [code.id]
    );
    
    return {
      valid: true,
      isActivated: false,
      recordId: result.insertId,
      expiresAt,
      usageCount: 0,
      todayUsage: 0,
      dailyLimit: code.daily_limit
    };
    
  } catch (error) {
    console.error('验证激活码失败:', error);
    return { valid: false, error: '系统错误，请稍后重试' };
  }
}

/**
 * 记录使用次数
 */
async function recordUsage(recordId) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取当前记录
    const [records] = await pool.query(
      'SELECT * FROM activation_records WHERE id = ?',
      [recordId]
    );
    
    if (records.length === 0) {
      return { success: false, error: '记录不存在' };
    }
    
    const record = records[0];
    const usageByDate = JSON.parse(record.usage_by_date || '{}');
    usageByDate[today] = (usageByDate[today] || 0) + 1;
    
    // 更新记录
    await pool.query(
      `UPDATE activation_records 
       SET usage_count = usage_count + 1, 
           last_used_at = NOW(), 
           usage_by_date = ? 
       WHERE id = ?`,
      [JSON.stringify(usageByDate), recordId]
    );
    
    return { success: true };
    
  } catch (error) {
    console.error('记录使用失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 列表激活码（分页+筛选）
 */
async function listActivationCodes({ page = 1, pageSize = 20, status, q } = {}) {
  try {
    const offset = (page - 1) * pageSize;
    
    let whereClause = [];
    let params = [];
    
    if (status && status !== 'all') {
      whereClause.push('status = ?');
      params.push(status);
    }
    
    if (q && q.trim()) {
      whereClause.push('(code LIKE ? OR notes LIKE ?)');
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }
    
    const where = whereClause.length > 0 ? 'WHERE ' + whereClause.join(' AND ') : '';
    
    // 获取总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM activation_codes ${where}`,
      params
    );
    const total = countResult[0].total;
    
    // 获取列表
    const [list] = await pool.query(
      `SELECT * FROM activation_codes ${where} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, pageSize, offset]
    );
    
    return { success: true, list, total };
    
  } catch (error) {
    console.error('获取激活码列表失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 创建激活码
 */
async function createActivationCode(data) {
  try {
    const code = data.code || generateActivationCode();
    
    // 检查code是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM activation_codes WHERE code = ?',
      [code]
    );
    
    if (existing.length > 0) {
      return { success: false, error: '激活码已存在' };
    }
    
    const [result] = await pool.query(
      `INSERT INTO activation_codes 
       (code, max_uses, daily_limit, validity_days, expires_at, notes, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        data.max_uses || 1,
        data.daily_limit || 3,
        data.validity_days || 7,
        data.expires_at || null,
        data.notes || '',
        data.created_by || 'admin'
      ]
    );
    
    return { success: true, id: result.insertId, code };
    
  } catch (error) {
    console.error('创建激活码失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 批量创建激活码
 */
async function createActivationCodesBulk(items) {
  const results = { created: 0, failed: [] };
  
  for (const item of items) {
    const result = await createActivationCode(item);
    if (result.success) {
      results.created++;
    } else {
      results.failed.push({ code: item.code, error: result.error });
    }
  }
  
  return { success: true, data: results };
}

/**
 * 更新激活码
 */
async function updateActivationCode(id, data) {
  try {
    const updates = [];
    const params = [];
    
    if (data.code !== undefined) {
      updates.push('code = ?');
      params.push(data.code);
    }
    if (data.max_uses !== undefined) {
      updates.push('max_uses = ?');
      params.push(data.max_uses);
    }
    if (data.daily_limit !== undefined) {
      updates.push('daily_limit = ?');
      params.push(data.daily_limit);
    }
    if (data.validity_days !== undefined) {
      updates.push('validity_days = ?');
      params.push(data.validity_days);
    }
    if (data.expires_at !== undefined) {
      updates.push('expires_at = ?');
      params.push(data.expires_at);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes);
    }
    
    if (updates.length === 0) {
      return { success: true };
    }
    
    params.push(id);
    
    await pool.query(
      `UPDATE activation_codes SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    return { success: true };
    
  } catch (error) {
    console.error('更新激活码失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 撤销激活码
 */
async function revokeActivationCode(id) {
  try {
    await pool.query(
      'UPDATE activation_codes SET status = ? WHERE id = ?',
      ['revoked', id]
    );
    return { success: true };
  } catch (error) {
    console.error('撤销激活码失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 删除激活码
 */
async function deleteActivationCode(id) {
  try {
    await pool.query('DELETE FROM activation_codes WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('删除激活码失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取激活码统计
 */
async function getActivationStats() {
  try {
    // 激活码统计
    const [codeStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_codes,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_codes,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_codes,
        SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) as revoked_codes,
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used_codes,
        SUM(current_uses) as total_activations
      FROM activation_codes
    `);
    
    // 使用记录统计
    const [recordStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(usage_count) as total_usage_count
      FROM activation_records
    `);
    
    // 按激活码统计
    const [byCodeStats] = await pool.query(`
      SELECT 
        ac.code,
        ac.status,
        ac.current_uses,
        ac.max_uses,
        COUNT(ar.id) as total_activations,
        SUM(ar.usage_count) as total_usages
      FROM activation_codes ac
      LEFT JOIN activation_records ar ON ac.id = ar.code_id
      GROUP BY ac.id, ac.code, ac.status, ac.current_uses, ac.max_uses
      ORDER BY total_usages DESC
      LIMIT 20
    `);
    
    return {
      success: true,
      data: {
        ...codeStats[0],
        ...recordStats[0],
        byCode: byCodeStats
      }
    };
    
  } catch (error) {
    console.error('获取统计失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取激活记录
 */
async function listActivationRecords(code, limit = 30) {
  try {
    const [records] = await pool.query(
      `SELECT * FROM activation_records 
       WHERE activation_code = ? 
       ORDER BY activated_at DESC 
       LIMIT ?`,
      [code, limit]
    );
    
    return { success: true, list: records };
    
  } catch (error) {
    console.error('获取激活记录失败:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateActivationCode,
  verifyActivationCode,
  recordUsage,
  listActivationCodes,
  createActivationCode,
  createActivationCodesBulk,
  updateActivationCode,
  revokeActivationCode,
  deleteActivationCode,
  getActivationStats,
  listActivationRecords
};

