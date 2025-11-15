// 小红书文案生成服务
const axios = require('axios');
const { getActiveAIConfig, getAllAIConfigs } = require('./aiConfigService');

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

/**
 * 生成小红书文案
 */
async function generateXiaohongshuContent(userPrompt, contentType, aiConfigId) {
  const startTime = Date.now();

  try {
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
        faq: '请生成一篇"FAQ"笔记：回答用户最关心的问题（需要多久？要付费吗？隐私安全吗？会诊断病吗？能多次做吗？），语气亲和专业，消除顾虑，引导尝试。',
        ugc: '请生成一篇"UGC征集"笔记：邀请大家在评论区分享自己的真实社恐瞬间，承诺给每个人提供个性化小建议。要有互动性和参与感，能带动评论区氛围。',
        default: '请生成一篇适合小红书的推广笔记，类型不限，要有共鸣感和传播性。'
      };
      
      finalUserPrompt = typePrompts[contentType] || typePrompts.default;
    }

    // 获取AI配置
    let aiConfig;
    if (aiConfigId) {
      // 如果指定了配置ID，获取所有配置并找到对应的
      const allConfigsResult = await getAllAIConfigs();
      if (!allConfigsResult.success) {
        throw new Error('获取AI配置失败: ' + allConfigsResult.error);
      }
      aiConfig = allConfigsResult.data.find(config => config.id === parseInt(aiConfigId));
      if (!aiConfig) {
        throw new Error('指定的AI配置不存在');
      }
    } else {
      // 使用当前激活的配置
      const configResult = await getActiveAIConfig();
      if (!configResult.success) {
        throw new Error('获取AI配置失败: ' + configResult.error);
      }
      aiConfig = configResult.data;
    }

    console.log(`🤖 [小红书文案] 使用AI配置: ${aiConfig.provider} - ${aiConfig.model}`);
    console.log(`📝 [小红书文案] 用户提示词: ${finalUserPrompt.substring(0, 100)}...`);

    // 调用AI API生成文案
    const aiResponse = await callAIAPI(aiConfig, finalUserPrompt);
    
    // 解析JSON内容
    const parsedContent = parseAIResponse(aiResponse);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ [小红书文案] 生成成功 (${responseTime}ms)`);
    
    return {
      success: true,
      data: parsedContent,
      responseTime,
      aiProvider: aiConfig.provider,
      aiModel: aiConfig.model
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ [小红书文案] 生成失败 (${responseTime}ms):`, error.message);
    
    return {
      success: false,
      error: error.message,
      responseTime
    };
  }
}

/**
 * 调用AI API
 */
async function callAIAPI(aiConfig, userPrompt) {
  // 根据不同的AI供应商构建请求
  let requestConfig;
  
  if (aiConfig.provider === 'claude' || aiConfig.provider === 'anthropic') {
    // Claude API格式
    requestConfig = {
      url: aiConfig.api_url,
      data: {
        model: aiConfig.model,
        max_tokens: parseInt(aiConfig.max_tokens) || 2000,
        temperature: parseFloat(aiConfig.temperature) || 0.8,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.api_key}`,
        'anthropic-version': '2023-06-01'
      }
    };
  } else if (aiConfig.provider === 'aliyun_bailian') {
    // 阿里云百炼格式
    requestConfig = {
      url: aiConfig.api_url,
      data: {
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: parseFloat(aiConfig.temperature) || 0.8,
        max_tokens: parseInt(aiConfig.max_tokens) || 2000
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.api_key}`
      }
    };
  } else {
    // OpenAI兼容格式（适用于大多数其他供应商）
    requestConfig = {
      url: aiConfig.api_url,
      data: {
        model: aiConfig.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: parseFloat(aiConfig.temperature) || 0.8,
        max_tokens: parseInt(aiConfig.max_tokens) || 2000
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.api_key}`
      }
    };
  }

  console.log(`📤 [小红书文案] 发送请求到: ${requestConfig.url}`);

  const response = await axios.post(
    requestConfig.url,
    requestConfig.data,
    {
      headers: requestConfig.headers,
      timeout: parseInt(aiConfig.timeout) || 30000
    }
  );

  if (!response.data) {
    throw new Error('AI API返回空响应');
  }

  // 解析响应 - 根据不同供应商格式
  let aiContent;
  if (aiConfig.provider === 'claude' || aiConfig.provider === 'anthropic') {
    // Claude API格式
    if (!response.data.content || !response.data.content[0]) {
      throw new Error('Claude API返回格式错误');
    }
    aiContent = response.data.content[0].text;
  } else {
    // OpenAI兼容格式
    if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('OpenAI兼容API返回格式错误');
    }
    aiContent = response.data.choices[0].message.content;
  }

  console.log(`📥 [小红书文案] AI返回内容长度: ${aiContent.length}字符`);
  return aiContent;
}

/**
 * 解析AI响应内容
 */
function parseAIResponse(aiContent) {
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

  // 验证必要字段
  if (!parsedContent.title) {
    throw new Error('AI返回内容缺少标题字段');
  }
  if (!parsedContent.content) {
    throw new Error('AI返回内容缺少正文字段');
  }

  console.log(`✅ [小红书文案] JSON解析成功，标题: ${parsedContent.title}`);
  return parsedContent;
}

module.exports = {
  generateXiaohongshuContent
};
