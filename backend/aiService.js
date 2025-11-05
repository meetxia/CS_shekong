// AI服务 - 调用Claude API
const fetch = require('node-fetch');
require('dotenv').config();

/**
 * 构建AI提示词
 */
function buildPrompt(report, answers, basicInfo) {
  const { totalScore, dimensions, type } = report;
  
  const dimensionDesc = dimensions.map(d => 
    `${d.name}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.level.level}`
  ).join('\n');
  
  const highScoreQuestions = Object.entries(answers)
    .filter(([id, score]) => score >= 4 && parseInt(id) <= 33)
    .map(([id]) => `Q${id}`)
    .join(', ');
  
  const ageMap = {
    'teen': '12-17岁（青少年）',
    'college': '18-22岁（大学生）',
    'young_adult': '23-29岁（青年）',
    'adult': '30-39岁（中年）',
    'mature': '40岁以上（成熟期）'
  };
  
  const genderMap = { 'male': '男', 'female': '女', 'other': '其他' };
  
  const occupationMap = {
    'student': '学生',
    'employee': '职场人',
    'freelancer': '自由职业',
    'entrepreneur': '创业者',
    'unemployed': '待业',
    'other': '其他'
  };
  
  const frequencyMap = {
    'rarely': '几乎不参加',
    'occasional': '1-2次/周',
    'regular': '3-4次/周',
    'frequent': '5次以上/周'
  };
  
  return `你是一位专业的心理咨询师，擅长社交焦虑障碍的评估。请根据以下测评数据，为用户生成一份深度个性化的社恐类型分析报告。

【用户基本信息】
年龄段: ${ageMap[basicInfo.age] || '未知'}
性别: ${genderMap[basicInfo.gender] || '未知'}
职业: ${occupationMap[basicInfo.occupation] || '未知'}
社交频率: ${frequencyMap[basicInfo.social_frequency] || '未知'}

【测评结果】
总分: ${totalScore}/100
等级: ${report.level.name}
初步类型: ${type.name}

【维度得分详情】
${dimensionDesc}

【高焦虑题目】
${highScoreQuestions}

【任务要求】
请生成以下内容（JSON格式）：

1. 个性化社恐类型名称（15字以内，要新颖、精准、有共鸣感）
2. 英文名称（体现专业性）
3. 核心特征（3-5条，每条20-30字）
4. 心理根源分析（2-3个维度，每个包含标题和详细说明）
5. 正向重构（60-80字）

【输出格式】
请严格按照以下JSON格式输出，不要有任何其他文字：

{
  "typeName": "你的个性化类型名称",
  "englishName": "Personalized Type Name",
  "features": [
    "核心特征1",
    "核心特征2",
    "核心特征3"
  ],
  "rootCauses": [
    {
      "title": "根源1标题",
      "desc": "根源1详细说明"
    },
    {
      "title": "根源2标题",
      "desc": "根源2详细说明"
    }
  ],
  "positiveReframe": "正向重构内容"
}`;
}

/**
 * 调用Claude API生成分析
 */
async function generateAIAnalysis(report, answers, basicInfo) {
  const startTime = Date.now();
  
  try {
    const prompt = buildPrompt(report, answers, basicInfo);
    
    console.log('🤖 调用Claude AI API...');
    
    const response = await fetch(process.env.CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL,
        messages: [
          {
            role: 'system',
            content: '你是一位专业且温暖的心理咨询师，擅长社交焦虑障碍的评估和分析。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
      timeout: 30000
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';
    
    // 解析JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI返回格式错误，无法提取JSON');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // 验证必要字段
    if (!analysis.typeName || !analysis.features || !analysis.rootCauses) {
      throw new Error('AI返回数据不完整');
    }

    const responseTime = Date.now() - startTime;
    const tokens = data.usage?.total_tokens || 0;
    
    console.log(`✅ AI生成成功 (${responseTime}ms, ${tokens} tokens)`);
    
    return {
      success: true,
      data: {
        id: 'ai_generated',
        name: analysis.typeName,
        englishName: analysis.englishName || 'AI Generated Type',
        features: analysis.features,
        rootCauses: analysis.rootCauses,
        positiveReframe: analysis.positiveReframe
      },
      responseTime,
      tokens
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ AI生成失败:', error.message);
    
    return {
      success: false,
      error: error.message,
      responseTime,
      tokens: 0
    };
  }
}

module.exports = {
  generateAIAnalysis
};

