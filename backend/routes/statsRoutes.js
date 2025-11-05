// 统计数据路由
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 获取AI统计数据接口
router.get('/', async (req, res) => {
  try {
    // 获取今日统计
    const today = new Date().toISOString().split('T')[0];
    const [todayStats] = await pool.query(
      'SELECT * FROM ai_stats WHERE date = ?',
      [today]
    );
    
    // 获取总统计
    const [totalStats] = await pool.query(`
      SELECT 
        SUM(total_calls) as total_calls,
        SUM(success_calls) as success_calls,
        SUM(failed_calls) as failed_calls,
        AVG(avg_response_time) as avg_response_time,
        SUM(total_tokens) as total_tokens
      FROM ai_stats
    `);
    
    // 获取最近的生成记录
    const [recentLogs] = await pool.query(`
      SELECT 
        id, user_id, total_score, level_name, type_name, english_name, 
        created_at, success
      FROM ai_generation_logs
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      data: {
        today: todayStats[0] || {},
        total: totalStats[0] || {},
        recent: recentLogs
      }
    });
    
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

