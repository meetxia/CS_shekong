// AI分析路由
const express = require('express');
const router = express.Router();
const { saveGenerationLog, updateStats } = require('../db');
const { generateAIAnalysis } = require('../aiService');

// AI分析生成接口
router.post('/generate', async (req, res) => {
  try {
    const { report, answers, basicInfo, userId } = req.body;
    
    // 验证请求数据
    if (!report || !answers || !basicInfo) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数'
      });
    }
    
    console.log(`🎯 收到AI生成请求 - 用户${userId || '匿名'}, 总分: ${report.totalScore}`);
    
    // 调用AI生成
    const result = await generateAIAnalysis(report, answers, basicInfo);
    
    // 保存日志
    if (result.success) {
      await saveGenerationLog({
        userId: userId || null,
        totalScore: report.totalScore,
        levelName: report.level.name,
        typeName: result.data.name,
        englishName: result.data.englishName,
        features: result.data.features,
        rootCauses: result.data.rootCauses,
        positiveReframe: result.data.positiveReframe,
        basicInfo: basicInfo,
        success: true,
        errorMessage: null
      });
      
      // 更新统计
      await updateStats(true, result.responseTime, result.tokens);
      
      res.json({
        success: true,
        data: result.data
      });
    } else {
      // 保存失败日志
      await saveGenerationLog({
        userId: userId || null,
        totalScore: report.totalScore,
        levelName: report.level.name,
        typeName: null,
        englishName: null,
        features: [],
        rootCauses: [],
        positiveReframe: null,
        basicInfo: basicInfo,
        success: false,
        errorMessage: result.error
      });
      
      // 更新统计
      await updateStats(false, result.responseTime, 0);
      
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('❌ 接口处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

