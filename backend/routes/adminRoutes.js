// 管理后台路由
const express = require('express');
const router = express.Router();
const { requireAuth } = require('./authRoutes');
const {
  listActivationCodes,
  createActivationCode,
  createActivationCodesBulk,
  updateActivationCode,
  revokeActivationCode,
  deleteActivationCode,
  getActivationStats,
  listActivationRecords
} = require('../activationService');

// 所有管理后台路由都需要认证
router.use(requireAuth);

// 列表激活码
router.get('/codes', async (req, res) => {
  try {
    const { page, pageSize, status, q } = req.query;
    
    const result = await listActivationCodes({
      page: parseInt(page) || 1,
      pageSize: parseInt(pageSize) || 20,
      status,
      q
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('获取激活码列表错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 创建激活码
router.post('/codes', async (req, res) => {
  try {
    const result = await createActivationCode(req.body);
    res.json(result);
  } catch (error) {
    console.error('创建激活码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 批量创建激活码
router.post('/codes/bulk', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: '参数格式错误'
      });
    }
    
    const result = await createActivationCodesBulk(items);
    res.json(result);
    
  } catch (error) {
    console.error('批量创建激活码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 更新激活码
router.put('/codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateActivationCode(parseInt(id), req.body);
    res.json(result);
  } catch (error) {
    console.error('更新激活码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 撤销激活码
router.post('/codes/:id/revoke', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await revokeActivationCode(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('撤销激活码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 删除激活码
router.delete('/codes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteActivationCode(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('删除激活码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取激活码统计
router.get('/stats', async (req, res) => {
  try {
    const result = await getActivationStats();
    res.json(result);
  } catch (error) {
    console.error('获取激活码统计错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取激活记录
router.get('/records/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { limit } = req.query;
    
    const result = await listActivationRecords(code, parseInt(limit) || 30);
    res.json(result);
    
  } catch (error) {
    console.error('获取激活记录错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

