// 测试AI调用功能
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { generateAIAnalysis } = require('./aiService');

// 模拟测评数据
const mockReport = {
  totalScore: 68,
  level: {
    name: '中度社交焦虑',
    level: 'moderate'
  },
  type: {
    name: '社交回避型'
  },
  dimensions: [
    { name: '社交恐惧', score: 18, maxScore: 25, percentage: 72, level: { level: 'high' } },
    { name: '回避行为', score: 15, maxScore: 20, percentage: 75, level: { level: 'high' } },
    { name: '生理反应', score: 12, maxScore: 20, percentage: 60, level: { level: 'moderate' } }
  ]
};

const mockAnswers = {
  '1': 4, '2': 3, '3': 5, '4': 4, '5': 3,
  '10': 4, '15': 5, '20': 4, '25': 3, '30': 4
};

const mockBasicInfo = {
  age: 'young_adult',
  gender: 'female',
  occupation: 'student',
  social_frequency: 'regular',
  zodiac: 'libra',
  platform_usage: 'regular'
};

async function testAI() {
  console.log('🧪 开始测试AI调用...\n');
  
  try {
    const result = await generateAIAnalysis(mockReport, mockAnswers, mockBasicInfo);
    
    if (result.success) {
      console.log('✅ AI调用成功！\n');
      console.log('📊 生成结果:');
      console.log('类型名称:', result.data.name);
      console.log('英文名称:', result.data.englishName);
      console.log('核心特征:', result.data.features);
      console.log('心理根源:', result.data.rootCauses);
      console.log('正向重构:', result.data.positiveReframe);
      console.log('\n⏱️  响应时间:', result.responseTime, 'ms');
      console.log('🎯 Token消耗:', result.tokens);
    } else {
      console.log('❌ AI调用失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 测试出错:', error.message);
  }
  
  process.exit(0);
}

testAI();

