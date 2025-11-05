/**
 * AI API 测试脚本
 * 用于测试AI分析功能是否正常工作
 */

// Node.js 18+ 原生支持 fetch，无需导入

// AI配置
const AI_CONFIG = {
  apiKey: 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657',
  apiUrl: 'https://dpapi.cn/v1/chat/completions',
  model: 'claude-4.5-sonnet',
  timeout: 30000
};

// 测试数据
const mockReport = {
  totalScore: 65,
  level: { name: '中度社交焦虑' },
  type: { name: '预演型社恐' },
  dimensions: [
    { name: '社交场景恐惧', score: 18, maxScore: 25, percentage: 72, level: { level: '偏高' } },
    { name: '回避行为程度', score: 15, maxScore: 25, percentage: 60, level: { level: '中高' } },
    { name: '预期焦虑强度', score: 20, maxScore: 25, percentage: 80, level: { level: '偏高' } },
    { name: '负面评价恐惧', score: 17, maxScore: 25, percentage: 68, level: { level: '中高' } },
    { name: '社交后反刍', score: 19, maxScore: 25, percentage: 76, level: { level: '偏高' } },
    { name: '功能损害程度', score: 14, maxScore: 25, percentage: 56, level: { level: '中等' } }
  ]
};

const mockAnswers = {
  1: 4, 2: 3, 3: 5, 4: 4, 5: 3, 6: 4, 7: 5, 8: 3, 9: 4, 10: 4,
  11: 3, 12: 4, 13: 5, 14: 3, 15: 4, 16: 4, 17: 3, 18: 5, 19: 4, 20: 3,
  21: 4, 22: 3, 23: 4, 24: 5, 25: 3, 26: 4, 27: 3, 28: 4, 29: 3, 30: 4,
  31: 3, 32: 4, 33: 3
};

const mockBasicInfo = {
  age: 'college',
  gender: 'female',
  occupation: 'student',
  social_frequency: 'occasional'
};

// 构建AI提示词
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
  
  return `你是一位专业的心理咨询师，擅长社交焦虑障碍的评估。请根据以下测评数据，为用户生成一份深度个性化的社恐类型分析报告。

【用户基本信息】
年龄段: ${ageMap[basicInfo.age] || '未知'}
性别: ${basicInfo.gender === 'male' ? '男' : '女'}
职业: ${basicInfo.occupation === 'student' ? '学生' : '其他'}
社交频率: ${basicInfo.social_frequency === 'occasional' ? '1-2次/周' : '其他'}

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

1. 个性化社恐类型名称（15字以内）
2. 英文名称
3. 核心特征（3-5条）
4. 心理根源分析（2-3个维度）
5. 正向重构（60-80字）

【输出格式】
请严格按照以下JSON格式输出，不要有任何其他文字：

{
  "typeName": "脑内彩排型社恐",
  "englishName": "Mental Rehearsal Social Anxiety",
  "features": [
    "核心特征1",
    "核心特征2",
    "核心特征3"
  ],
  "rootCauses": [
    {
      "title": "根源1标题",
      "desc": "根源1详细说明"
    }
  ],
  "positiveReframe": "正向重构内容"
}`;
}

// 测试AI API
async function testAIAPI() {
  console.log('🤖 开始测试AI API...\n');
  console.log('配置信息:');
  console.log(`  API URL: ${AI_CONFIG.apiUrl}`);
  console.log(`  模型: ${AI_CONFIG.model}`);
  console.log(`  API Key: ${AI_CONFIG.apiKey.substring(0, 20)}...`);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const prompt = buildPrompt(mockReport, mockAnswers, mockBasicInfo);
    
    console.log('📤 发送请求...');
    console.log('提示词长度:', prompt.length, '字符');
    console.log('');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);
    
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
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
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  响应时间: ${duration}ms`);
    console.log('');
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API返回错误:');
      console.error(`状态码: ${response.status}`);
      console.error(`错误信息: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API调用成功！');
    console.log('');
    console.log('📊 使用情况:');
    console.log(`  Tokens: ${data.usage?.total_tokens || 0}`);
    console.log(`  提示Tokens: ${data.usage?.prompt_tokens || 0}`);
    console.log(`  完成Tokens: ${data.usage?.completion_tokens || 0}`);
    console.log('');
    
    const aiResponse = data.choices?.[0]?.message?.content || '';
    console.log('📝 AI原始响应:');
    console.log('─'.repeat(80));
    console.log(aiResponse);
    console.log('─'.repeat(80));
    console.log('');
    
    // 解析JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ 无法从响应中提取JSON');
      return;
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    console.log('✅ JSON解析成功！');
    console.log('');
    console.log('🎯 生成的分析结果:');
    console.log('─'.repeat(80));
    console.log('类型名称:', analysis.typeName);
    console.log('英文名称:', analysis.englishName);
    console.log('');
    console.log('核心特征:');
    analysis.features.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f}`);
    });
    console.log('');
    console.log('心理根源:');
    analysis.rootCauses.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.title}`);
      console.log(`     ${c.desc}`);
    });
    console.log('');
    console.log('正向重构:');
    console.log(`  ${analysis.positiveReframe}`);
    console.log('─'.repeat(80));
    console.log('');
    
    // 验证数据完整性
    if (!analysis.typeName || !analysis.features || !analysis.rootCauses) {
      console.warn('⚠️  数据不完整！');
    } else {
      console.log('✅ 所有必要字段都存在');
    }
    
    console.log('');
    console.log('🎉 测试完成！AI分析功能正常工作。');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('');
    console.error('❌ 测试失败！');
    console.error(`耗时: ${duration}ms`);
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
    
    if (error.name === 'AbortError') {
      console.error('原因: 请求超时（超过30秒）');
    } else if (error.message.includes('fetch')) {
      console.error('原因: 网络连接失败');
    }
    
    console.error('');
    console.error('💡 建议:');
    console.error('  1. 检查网络连接');
    console.error('  2. 确认API Key是否有效');
    console.error('  3. 检查API URL是否正确');
  }
}

// 运行测试
testAIAPI();

