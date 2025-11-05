// 激活码验证路由（用户端）
const express = require('express');
const router = express.Router();
const {
  verifyActivationCode,
  recordUsage
} = require('../activationService');

// 验证激活码
router.post('/verify', async (req, res) => {
  try {
    const { code, deviceId } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        error: '请提供激活码'
      });
    }
    
    const result = await verifyActivationCode(code, deviceId);
    res.json(result);
    
  } catch (error) {
    console.error('验证激活码错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 记录使用次数
router.post('/record-usage', async (req, res) => {
  try {
    const { recordId } = req.body;
    
    if (!recordId) {
      return res.status(400).json({
        success: false,
        error: '缺少recordId'
      });
    }
    
    const result = await recordUsage(recordId);
    res.json(result);
    
  } catch (error) {
    console.error('记录使用错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

