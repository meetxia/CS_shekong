/**
 * 演示实际发送给AI的提示词
 */

// 模拟用户数据
const mockBasicInfo = {
  age: 'college',          // 18-22岁
  gender: 'female',        // 女
  occupation: 'student',   // 学生
  social_frequency: 'occasional'  // 1-2次/周
};

const mockAnswers = {
  1: 4, 2: 3, 3: 5, 4: 4, 5: 3, 6: 4, 7: 5, 8: 3, 9: 4, 10: 4,
  11: 3, 12: 4, 13: 5, 14: 3, 15: 4, 16: 4, 17: 3, 18: 5, 19: 4, 20: 3,
  21: 4, 22: 3, 23: 4, 24: 5, 25: 3, 26: 4, 27: 3, 28: 4, 29: 3, 30: 4,
  31: 3, 32: 4, 33: 3
};

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

// 标签转换函数
function getAgeLabel(age) {
  const map = {
    'teen': '12-17岁（青少年）',
    'college': '18-22岁（大学生）',
    'young_adult': '23-29岁（青年）',
    'adult': '30-39岁（中年）',
    'mature': '40岁以上（成熟期）'
  };
  return map[age] || '未知';
}

function getGenderLabel(gender) {
  const map = { 'male': '男', 'female': '女', 'other': '其他' };
  return map[gender] || '未知';
}

function getOccupationLabel(occupation) {
  const map = {
    'student': '学生',
    'employee': '职场人',
    'freelancer': '自由职业',
    'entrepreneur': '创业者',
    'unemployed': '待业',
    'other': '其他'
  };
  return map[occupation] || '未知';
}

function getFrequencyLabel(freq) {
  const map = {
    'rarely': '几乎不参加',
    'occasional': '1-2次/周',
    'regular': '3-4次/周',
    'frequent': '5次以上/周'
  };
  return map[freq] || '未知';
}

// 构建提示词
function buildPrompt(report, answers, basicInfo) {
  const { totalScore, dimensions, type } = report;
  
  const dimensionDesc = dimensions.map(d => 
    `${d.name}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.level.level}`
  ).join('\n');
  
  const highScoreQuestions = Object.entries(answers)
    .filter(([id, score]) => score >= 4 && parseInt(id) <= 33)
    .map(([id]) => `Q${id}`)
    .join(', ');
  
  const prompt = `你是一位专业的心理咨询师，擅长社交焦虑障碍的评估。请根据以下测评数据，为用户生成一份深度个性化的社恐类型分析报告。

【用户基本信息】
年龄段: ${getAgeLabel(basicInfo.age)}
性别: ${getGenderLabel(basicInfo.gender)}
职业: ${getOccupationLabel(basicInfo.occupation)}
社交频率: ${getFrequencyLabel(basicInfo.social_frequency)}

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

1. **个性化社恐类型名称**（15字以内，要新颖、精准、有共鸣感）
   - 不要用常规词汇，要根据用户的具体表现创造一个独特的类型名
   - 示例："脑内彩排型社恐"、"完美主义表演者"、"情绪雷达过载型"

2. **英文名称**（体现专业性）

3. **核心特征**（3-5条，每条20-30字）
   - 要具体、形象，让用户有"这说的就是我"的感觉
   - 基于维度得分的具体表现

4. **心理根源分析**（2-3个维度，每个包含标题和详细说明）
   - 标题：8-12字，点出根本原因
   - 说明：40-60字，结合心理学理论深入分析
   - 要有深度，但不要过于学术化

5. **正向重构**（60-80字）
   - 将社恐特质转化为潜在优势
   - 给予希望和力量
   - 温暖而不敷衍

【注意事项】
- 语言要温暖、共情、专业，但不要说教
- 避免模板化表达，要针对这个用户的独特模式
- 不要过度强调"病态"，而是理解和接纳
- 如果总分较高（>70），要更关注功能损害和专业建议

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
  
  return prompt;
}

// 输出实际发送的数据
console.log('═'.repeat(100));
console.log('📤 实际发送给AI的完整提示词');
console.log('═'.repeat(100));
console.log('');

const prompt = buildPrompt(mockReport, mockAnswers, mockBasicInfo);
console.log(prompt);

console.log('');
console.log('═'.repeat(100));
console.log('📊 隐私分析');
console.log('═'.repeat(100));
console.log('');

console.log('✅ 包含的信息（已脱敏）:');
console.log('  - 年龄段: 18-22岁（不是具体年龄）');
console.log('  - 性别: 女（只是性别分类）');
console.log('  - 职业类别: 学生（不是学校名称或专业）');
console.log('  - 社交频率: 1-2次/周（只是频率等级）');
console.log('  - 测评分数: 65/100（统计数据）');
console.log('  - 维度得分: 各维度分数和百分比（统计数据）');
console.log('  - 高分题号: Q1, Q3, Q6...（只有编号，没有内容）');
console.log('');

console.log('❌ 不包含的信息:');
console.log('  - 姓名、手机号、邮箱等任何身份信息');
console.log('  - 具体的答题内容（只发送题号和分数）');
console.log('  - IP地址、设备信息');
console.log('  - 地理位置');
console.log('  - 任何可追溯到个人的信息');
console.log('');

console.log('🔒 隐私保护级别: ★★★★★ (5/5星)');
console.log('');

console.log('═'.repeat(100));
console.log('提示词字符数:', prompt.length);
console.log('═'.repeat(100));

