// 小红书文案生成路由
const express = require('express');
const router = express.Router();
const { requireAuth } = require('./authRoutes');
const { generateXiaohongshuContent } = require('../xiaohongshuService');

// 所有路由都需要管理员认证
router.use(requireAuth);

// 生成小红书文案
router.post('/generate', async (req, res) => {
  try {
    const { userPrompt, contentType, aiConfigId } = req.body;
    
    console.log(`📝 [小红书API] 开始生成文案，类型: ${contentType}, AI配置ID: ${aiConfigId}`);
    
    // 调用文案生成服务
    const result = await generateXiaohongshuContent(userPrompt, contentType, aiConfigId);
    
    if (result.success) {
      console.log(`✅ [小红书API] 文案生成成功 (${result.responseTime}ms)`);
      res.json({
        success: true,
        data: result.data,
        meta: {
          responseTime: result.responseTime,
          aiProvider: result.aiProvider,
          aiModel: result.aiModel
        }
      });
    } else {
      console.error(`❌ [小红书API] 文案生成失败: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ [小红书API] 请求处理失败:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取预设模板
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'story',
        name: '故事向',
        description: '通过真实社恐瞬间引发共鸣',
        prompt: '请生成一篇"故事向"笔记：分享一个真实的社恐经历（如开会前胃疼、加微信犹豫、被点名大脑空白），然后通过测评找到原因（如预期焦虑、负面评价恐惧），最后展示具体的小步建议。要让读者有"这说的就是我"的感觉。'
      },
      {
        id: 'review',
        name: '测评实录',
        description: '展示完整测评体验过程',
        prompt: '请生成一篇"测评实录"笔记：详细展示从打开网站到获得报告的全过程。重点突出：5分钟完成35题、问题很生活化、第33题就开始预生成、提交后秒出雷达图、类型名很准确、建议可执行。适合转化用户。'
      },
      {
        id: 'tutorial',
        name: '干货教育',
        description: '科普知识+自测引导',
        prompt: '请生成一篇"干货教育"笔记：科普一个社交焦虑相关知识点（如：社恐vs内向的区别、什么是社交反刍、预期焦虑的3个信号、负面评价恐惧如何应对等），然后自然引导到自测工具。要有知识含量，能破圈传播。'
      },
      {
        id: 'faq',
        name: 'FAQ答疑',
        description: '常见问题解答',
        prompt: '请生成一篇"FAQ"笔记：回答用户最关心的问题（需要多久？要付费吗？隐私安全吗？会诊断病吗？能多次做吗？），语气亲和专业，消除顾虑，引导尝试。'
      },
      {
        id: 'ugc',
        name: 'UGC征集',
        description: '征集真实社恐瞬间',
        prompt: '请生成一篇"UGC征集"笔记：邀请大家在评论区分享自己的真实社恐瞬间，承诺给每个人提供个性化小建议。要有互动性和参与感，能带动评论区氛围。'
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('获取模板失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
