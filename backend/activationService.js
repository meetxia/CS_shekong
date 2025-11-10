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

    // 检查设备数是否已达上限
    if (code.current_uses >= code.max_uses) {
      return { valid: false, error: '激活码使用次数已达上限' };
    }
    
    // 🔒 【重要】先检查这个激活码在所有设备上今日使用次数是否已达上限
    const today = new Date().toISOString().split('T')[0];
    const [allRecordsForCode] = await pool.query(
      'SELECT usage_by_date, expires_at FROM activation_records WHERE code_id = ?',
      [code.id]
    );

    let totalUsedToday = 0;
    let earliestExpiresAt = null; // 找到最早的过期时间（第一个激活的设备）

    for (const rec of allRecordsForCode) {
      const usageByDate = JSON.parse(rec.usage_by_date || '{}');
      totalUsedToday += (usageByDate[today] || 0);

      // 记录最早的过期时间
      if (rec.expires_at) {
        const expiresAt = new Date(rec.expires_at);
        if (!earliestExpiresAt || expiresAt < earliestExpiresAt) {
          earliestExpiresAt = expiresAt;
        }
      }
    }

    // 记录今日使用情况（仅当达到限制时输出）

    // 计算剩余天数（基于最早的激活记录）
    let daysLeft = code.validity_days;
    if (earliestExpiresAt) {
      const msLeft = earliestExpiresAt.getTime() - Date.now();
      daysLeft = Math.max(0, Math.floor(msLeft / (24 * 60 * 60 * 1000)));
    }

    // 如果今日使用次数已达上限，返回详细信息
    if (totalUsedToday >= code.daily_limit) {
      return {
        valid: false,
        error: `今日使用次数已达上限（${code.daily_limit}次）`,
        remainingToday: 0,
        dailyLimit: code.daily_limit,
        daysLeft: daysLeft, // 返回剩余天数，用于前端显示更友好的提示
        isActivated: allRecordsForCode.length > 0 // 是否已经激活过
      };
    }

    // 查找当前设备的激活记录
    let [records] = await pool.query(
      'SELECT * FROM activation_records WHERE activation_code = ? AND user_device_id = ?',
      [inputCode, deviceId]
    );

    if (records.length > 0) {
      // 当前设备已激活，检查是否过期（基于最早的激活记录）
      const record = records[0];
      if (earliestExpiresAt && earliestExpiresAt < new Date()) {
        return { valid: false, error: '您的激活已过期' };
      }

      return {
        valid: true,
        isActivated: true,
        recordId: record.id,
        expiresAt: earliestExpiresAt, // 🔧 返回最早的过期时间，而不是当前设备的
        todayUsage: totalUsedToday, // 返回所有设备的总使用次数
        dailyLimit: code.daily_limit
      };
    }

    // 当前设备未激活，创建新记录
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

    // 🔧 如果是第一个设备激活，earliestExpiresAt 就是刚创建的 expiresAt
    // 否则，使用之前找到的 earliestExpiresAt
    const finalExpiresAt = earliestExpiresAt || expiresAt;

    return {
      valid: true,
      isActivated: false,
      recordId: result.insertId,
      expiresAt: finalExpiresAt, // 🔧 返回最早的过期时间
      todayUsage: totalUsedToday, // 返回所有设备的总使用次数
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
    
    // 获取当前记录和激活码信息
    const [records] = await pool.query(
      `SELECT ar.*, ac.daily_limit 
       FROM activation_records ar 
       JOIN activation_codes ac ON ar.code_id = ac.id 
       WHERE ar.id = ?`,
      [recordId]
    );
    
    if (records.length === 0) {
      return { success: false, error: '记录不存在' };
    }
    
    const record = records[0];
    const dailyLimit = record.daily_limit || 3;

    // 🔧 【重要修复】查找该激活码所有设备中最早的 expires_at
    const [earliestRecord] = await pool.query(
      'SELECT expires_at FROM activation_records WHERE code_id = ? ORDER BY expires_at ASC LIMIT 1',
      [record.code_id]
    );

    // 检查激活是否过期（基于最早的激活记录）
    const now = new Date();
    const expiresAt = earliestRecord[0]?.expires_at ? new Date(earliestRecord[0].expires_at) : null;
    const msLeft = expiresAt ? (expiresAt - now) : 0;
    const expired = msLeft <= 0;
    
    if (expired) {
      return { 
        success: false, 
        error: '激活已过期',
        expired: true
      };
    }
    
    // 🔒 【重要】检查这个激活码在所有设备上今日使用次数是否已达上限
    const [allRecordsForCode] = await pool.query(
      'SELECT usage_by_date FROM activation_records WHERE code_id = ?',
      [record.code_id]
    );
    
    let totalUsedToday = 0;
    for (const rec of allRecordsForCode) {
      const usageByDate = JSON.parse(rec.usage_by_date || '{}');
      totalUsedToday += (usageByDate[today] || 0);
    }
    
    // 检查今日使用情况
    
    if (totalUsedToday >= dailyLimit) {
      return { 
        success: false, 
        error: `今日使用次数已达上限（${dailyLimit}次）`,
        remainingToday: 0,
        dailyLimit
      };
    }
    
    // 获取当前设备的使用记录
    const usageByDate = JSON.parse(record.usage_by_date || '{}');
    const currentDeviceUsedToday = usageByDate[today] || 0;
    
    // 通过检查，记录使用（在当前设备的记录上+1）
    usageByDate[today] = currentDeviceUsedToday + 1;

    // 更新记录 (只更新 usage_by_date)
    await pool.query(
      `UPDATE activation_records
       SET usage_by_date = ?
       WHERE id = ?`,
      [JSON.stringify(usageByDate), recordId]
    );

    // 计算剩余天数和次数（基于所有设备的总使用次数）
    const daysLeft = Math.max(0, Math.floor(msLeft / (24 * 60 * 60 * 1000)));
    const newTotalUsedToday = totalUsedToday + 1; // 加上刚才记录的这一次
    const remainingToday = Math.max(0, dailyLimit - newTotalUsedToday);

    return {
      success: true,
      daysLeft,
      remainingToday,
      expired,
      expiresAt: expiresAt, // 🔧 返回最早的过期时间
      recorded: true
    };

  } catch (error) {
    console.error('记录使用失败:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取当前设备下指定激活码的状态
 */
async function getActivationStatusByCode(codeWithHyphen, deviceId) {
  try {
    // 规范化 code
    const code = (codeWithHyphen || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (code.length !== 12) {
      return { success: false, error: '激活码格式错误' }
    }
    const norm = `${code.slice(0,4)}-${code.slice(4,8)}-${code.slice(8,12)}`

    // 读取激活码与设备记录
    const [codes] = await pool.query('SELECT * FROM activation_codes WHERE code = ?', [norm])
    if (codes.length === 0) return { success: false, error: '激活码不存在' }
    const ac = codes[0]

    const [records] = await pool.query(
      'SELECT * FROM activation_records WHERE activation_code = ? AND user_device_id = ? LIMIT 1',
      [norm, deviceId]
    )
    if (records.length === 0) {
      return { success: false, error: '尚未在该设备激活' }
    }

    // 🔧 【重要修复】查找该激活码所有设备中最早的 expires_at，避免清除缓存后时间被刷新
    const [allRecordsForCode] = await pool.query(
      'SELECT expires_at FROM activation_records WHERE activation_code = ? ORDER BY expires_at ASC LIMIT 1',
      [norm]
    )

    const now = new Date()
    const earliestExpiresAt = allRecordsForCode[0]?.expires_at ? new Date(allRecordsForCode[0].expires_at) : null
    const msLeft = earliestExpiresAt ? (earliestExpiresAt - now) : 0
    const daysLeft = Math.max(0, Math.floor(msLeft / (24 * 60 * 60 * 1000)))
    const expired = msLeft <= 0

    // 计算剩余天数

    const today = new Date().toISOString().split('T')[0]
    
    // 🔧 【重要】统计这个激活码在所有设备上今天的总使用次数
    const [allRecords] = await pool.query(
      'SELECT usage_by_date FROM activation_records WHERE activation_code = ?',
      [norm]
    )
    
    let totalUsedToday = 0
    for (const record of allRecords) {
      const usageByDate = JSON.parse(record.usage_by_date || '{}')
      totalUsedToday += (usageByDate[today] || 0)
    }
    
    // 统计今日使用情况
    
    const dailyLimit = ac.daily_limit || 3
    const remainingToday = Math.max(0, dailyLimit - totalUsedToday)

    return {
      success: true,
      daysLeft,
      remainingToday,
      expired,
      dailyLimit,
      expiresAt: earliestExpiresAt,
      totalUsage: records[0].usage_count || 0
    }
  } catch (error) {
    console.error('获取激活状态失败:', error)
    return { success: false, error: error.message }
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

    // 为每个激活码计算今日已用次数和剩余时间
    const today = new Date().toISOString().split('T')[0];
    const enrichedList = await Promise.all(list.map(async (code) => {
      // 获取该激活码的所有激活记录
      const [records] = await pool.query(
        'SELECT usage_by_date, expires_at FROM activation_records WHERE code_id = ?',
        [code.id]
      );

      // 计算今日所有设备的总使用次数
      let todayUsed = 0;
      let earliestExpiresAt = null;

      for (const rec of records) {
        const usageByDate = JSON.parse(rec.usage_by_date || '{}');
        todayUsed += (usageByDate[today] || 0);

        // 找到最早的过期时间
        if (rec.expires_at) {
          const expiresAt = new Date(rec.expires_at);
          if (!earliestExpiresAt || expiresAt < earliestExpiresAt) {
            earliestExpiresAt = expiresAt;
          }
        }
      }

      // 计算剩余时间 (精确到分钟)
      let timeRemaining = null;
      if (earliestExpiresAt) {
        const msLeft = earliestExpiresAt.getTime() - Date.now();
        if (msLeft > 0) {
          const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
          const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
          timeRemaining = { days, hours, minutes, text: `${days}天${hours}小时${minutes}分钟` };
        } else {
          timeRemaining = { days: 0, hours: 0, minutes: 0, text: '已过期' };
        }
      }

      return {
        ...code,
        todayUsed,           // 今日已用次数
        todayRemaining: Math.max(0, code.daily_limit - todayUsed), // 今日剩余次数
        timeRemaining,       // 剩余时间对象
        activatedDevices: records.length  // 已激活设备数
      };
    }));

    return { success: true, list: enrichedList, total };
    
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
       (code, max_uses, daily_limit, validity_days, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [
        code,
        data.max_uses || 21,
        data.daily_limit || 3,
        data.validity_days || 7,
        data.notes || ''
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
        SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used_codes
      FROM activation_codes
    `);

    // 激活记录统计
    const [recordStats] = await pool.query(`
      SELECT
        COUNT(*) as total_records
      FROM activation_records
    `);

    // 计算总使用次数 (从 usage_by_date JSON 字段统计)
    const [allRecords] = await pool.query('SELECT usage_by_date FROM activation_records');
    let totalUsageCount = 0;
    for (const record of allRecords) {
      const usageByDate = JSON.parse(record.usage_by_date || '{}');
      for (const date in usageByDate) {
        totalUsageCount += usageByDate[date];
      }
    }

    // 计算今日使用次数
    const today = new Date().toISOString().split('T')[0];
    let todayUsageCount = 0;
    for (const record of allRecords) {
      const usageByDate = JSON.parse(record.usage_by_date || '{}');
      todayUsageCount += (usageByDate[today] || 0);
    }

    // 按激活码统计
    const [codes] = await pool.query(`
      SELECT
        ac.id,
        ac.code,
        ac.status,
        ac.max_uses,
        ac.daily_limit,
        ac.validity_days,
        ac.notes
      FROM activation_codes ac
      ORDER BY ac.created_at DESC
      LIMIT 20
    `);

    // 为每个激活码计算详细统计
    const byCodeStats = await Promise.all(codes.map(async (code) => {
      const [records] = await pool.query(
        'SELECT usage_by_date, expires_at FROM activation_records WHERE code_id = ?',
        [code.id]
      );

      // 计算总使用次数
      let totalUsages = 0;
      let todayUsed = 0;
      let earliestExpiresAt = null;

      for (const rec of records) {
        const usageByDate = JSON.parse(rec.usage_by_date || '{}');

        // 累计所有日期的使用次数
        for (const date in usageByDate) {
          totalUsages += usageByDate[date];
        }

        // 今日使用次数
        todayUsed += (usageByDate[today] || 0);

        // 找到最早的过期时间
        if (rec.expires_at) {
          const expiresAt = new Date(rec.expires_at);
          if (!earliestExpiresAt || expiresAt < earliestExpiresAt) {
            earliestExpiresAt = expiresAt;
          }
        }
      }

      // 计算剩余时间
      let timeRemaining = null;
      if (earliestExpiresAt) {
        const msLeft = earliestExpiresAt.getTime() - Date.now();
        if (msLeft > 0) {
          const days = Math.floor(msLeft / (24 * 60 * 60 * 1000));
          const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
          timeRemaining = `${days}天${hours}小时${minutes}分钟`;
        } else {
          timeRemaining = '已过期';
        }
      }

      return {
        code: code.code,
        status: code.status,
        max_uses: code.max_uses,
        daily_limit: code.daily_limit,
        validity_days: code.validity_days,
        activated_devices: records.length,  // 已激活设备数
        total_usages: totalUsages,          // 总使用次数
        today_used: todayUsed,              // 今日使用次数
        time_remaining: timeRemaining,      // 剩余时间
        notes: code.notes
      };
    }));

    return {
      success: true,
      data: {
        total_codes: codeStats[0].total_codes || 0,
        active_codes: codeStats[0].active_codes || 0,
        expired_codes: codeStats[0].expired_codes || 0,
        revoked_codes: codeStats[0].revoked_codes || 0,
        used_codes: codeStats[0].used_codes || 0,
        total_records: recordStats[0].total_records || 0,
        total_usage_count: totalUsageCount,
        today_usage_count: todayUsageCount,
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
  getActivationStatusByCode,
  listActivationCodes,
  createActivationCode,
  createActivationCodesBulk,
  updateActivationCode,
  revokeActivationCode,
  deleteActivationCode,
  getActivationStats,
  listActivationRecords
};

