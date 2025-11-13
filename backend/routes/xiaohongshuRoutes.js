// 小红书文案生成路由
const express = require('express');
const router = express.Router();
const { requireAuth } = require('./authRoutes');
const axios = require('axios');

// 所有路由都需要管理员认证
router.use(requireAuth);

// 内置系统提示词
const SYSTEM_PROMPT = `你是一位专业的小红书运营总监和市场经理。你需要为"社恐程度专业测评系统"这个产品生成推广文案。

产品信息：
- 名称：社恐程度专业测评系统
- 定位：基于SAS社交焦虑量表改良的专业心理测评Web应用
- 核心功能：35题/8维度专业测评，Claude 4.5 Sonnet AI驱动个性化分析，1秒出雷达图报告
- 目标用户：18-30岁有社交焦虑困扰的年轻人（大学生、职场新人）
- 核心卖点：
  1. 专业可信：35题8维度心理学支撑
  2. AI个性化：秒出专属社恐类型名+画像+建议
  3. 轻量快速：5分钟完成，移动端友好
  4. 情绪价值：被理解、被看见，提供可行动建议

文案要求：
- 风格：真实、接地气、有共鸣感（小红书爆款风格）
- 避免：医疗化用语，使用"自我评估/参考/建议"
- 结构完整：包含标题、首屏三行、正文、CTA、话题标签

请以JSON格式输出，格式如下：
{
  "title": "标题（吸引眼球，15-30字）",
  "opening": "首屏三行（数组，每行一句话，直击痛点）",
  "content": "正文内容（300-500字，分段清晰）",
  "cta": "行动号召（引导评论/收藏）",
  "tags": "话题标签（数组，8-12个）",
  "imageIdea": "首图建议（简短描述）"
}`;

// 生成小红书文案
router.post('/generate', async (req, res) => {
  try {
    const { userPrompt, contentType } = req.body;
    
    // 构建用户提示词
    let finalUserPrompt = '';
    
    if (userPrompt && userPrompt.trim()) {
      // 用户有自定义提示词
      finalUserPrompt = userPrompt.trim();
    } else {
      // 使用默认提示词，根据类型生成不同文案
      const typePrompts = {
        story: '请生成一篇"故事向"笔记：通过真实社恐瞬间引发共鸣，展示测评如何帮助理解自己。',
        review: '请生成一篇"测评实录"笔记：展示从打开到出报告的完整体验过程，突出秒出结果的特点。',
        tutorial: '请生成一篇"干货教育"笔记：科普社恐vs内向的区别，或某个维度（如社交反刍）的知识+自测引导。',
        default: '请生成一篇适合小红书的推广笔记，类型不限，要有共鸣感和传播性。'
      };
      
      finalUserPrompt = typePrompts[contentType] || typePrompts.default;
    }

    // 调用Claude API
    const apiKey = process.env.CLAUDE_API_KEY;
    const apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';

    console.log('开始生成小红书文案...');
    console.log('用户提示词:', finalUserPrompt);

    const response = await axios.post(
      apiUrl,
      {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.8,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: finalUserPrompt
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        timeout: 30000
      }
    );

    // 解析响应
    const aiContent = response.data.content[0].text;
    console.log('AI返回内容:', aiContent);

    // 尝试提取JSON
    let parsedContent;
    try {
      // 尝试直接解析
      parsedContent = JSON.parse(aiContent);
    } catch (e) {
      // 如果失败，尝试从markdown代码块中提取
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1]);
      } else {
        // 尝试提取大括号内容
        const bracketMatch = aiContent.match(/\{[\s\S]*\}/);
        if (bracketMatch) {
          parsedContent = JSON.parse(bracketMatch[0]);
        } else {
          throw new Error('无法解析AI返回的JSON格式');
        }
      }
    }

    res.json({
      success: true,
      data: parsedContent,
      rawContent: aiContent
    });

  } catch (error) {
    console.error('生成文案失败:', error.message);
    
    // 返回详细错误信息
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
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
