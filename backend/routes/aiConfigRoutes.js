// AI配置管理路由
const express = require('express');
const router = express.Router();
const { requireAuth } = require('./authRoutes');
const {
  getAllAIConfigs,
  getActiveAIConfig,
  updateAIConfig,
  switchActiveProvider,
  createAIConfig,
  deleteAIConfig,
  testAIConfig
} = require('../aiConfigService');

// 所有AI配置路由都需要管理员认证
router.use(requireAuth);

/**
 * 获取所有AI配置
 * GET /api/admin/ai-config
 */
router.get('/', async (req, res) => {
  try {
    const result = await getAllAIConfigs();
    res.json(result);
  } catch (error) {
    console.error('获取AI配置列表错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取当前激活的AI配置
 * GET /api/admin/ai-config/active
 */
router.get('/active', async (req, res) => {
  try {
    const result = await getActiveAIConfig();
    res.json(result);
  } catch (error) {
    console.error('获取激活的AI配置错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 创建新的AI配置
 * POST /api/admin/ai-config
 */
router.post('/', async (req, res) => {
  try {
    const result = await createAIConfig(req.body);
    res.json(result);
  } catch (error) {
    console.error('创建AI配置错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 更新AI配置
 * PUT /api/admin/ai-config/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateAIConfig(parseInt(id), req.body);
    res.json(result);
  } catch (error) {
    console.error('更新AI配置错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 切换激活的AI供应商
 * POST /api/admin/ai-config/:id/activate
 */
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await switchActiveProvider(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('切换AI供应商错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 删除AI配置
 * DELETE /api/admin/ai-config/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteAIConfig(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('删除AI配置错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 测试AI配置
 * POST /api/admin/ai-config/test
 */
router.post('/test', async (req, res) => {
  try {
    const result = await testAIConfig(req.body);
    res.json(result);
  } catch (error) {
    console.error('测试AI配置错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

