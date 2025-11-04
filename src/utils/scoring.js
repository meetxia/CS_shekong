/**
 * 测评计分和报告生成逻辑 - 专业优化版
 * 支持35题 + 9维度 + 效度检验
 */

// ==================== 效度检验 ====================
function checkValidity(answers) {
  const q34 = answers[34]
  const q35 = answers[35]
  
  let isValid = true
  let warnings = []
  
  // 检查Q34：从未紧张过（不符合实际，score为-999）
  if (q34 === -999) {
    warnings.push('检测到疑似无效作答（Q34选择了"从未紧张"）')
    isValid = false
  }
  
  // 检查Q35：随便选的（低质量作答，score为-888）
  if (q35 === -888) {
    warnings.push('检测到低质量作答（Q35承认随意作答）')
    isValid = false
  }
  
  return { isValid, warnings }
}

// ==================== 计算各维度得分 ====================
export function calculateScores(answers) {
  const dimensions = {
    scene_fear: [1, 2, 3, 4, 5],                    // 社交场景恐惧（5题）
    avoidance: [6, 7, 8, 9],                        // 回避行为程度（4题）
    anticipation: [10, 11, 12, 13],                 // 预期焦虑强度（4题）
    fear_of_negative_evaluation: [14, 15, 16, 17, 18], // 负面评价恐惧（5题）⭐新增
    rumination: [19, 20, 21, 22],                   // 社交后反刍（4题）
    physical: [23, 24, 25],                         // 生理反应强度（3题）
    functional_impairment: [26, 27, 28, 29],        // 功能损害程度（4题）⭐新增
    self_efficacy: [30, 31, 32, 33]                 // 社交自我效能（4题）
  }
  
  let totalScore = 0
  let dimensionScores = {}
  
  Object.entries(dimensions).forEach(([key, questionIds]) => {
    let sum = 0
    questionIds.forEach(id => {
      const score = parseInt(answers[id] || 0)
      // 排除效度题的负分
      if (score > 0) {
        sum += score
      }
    })
    dimensionScores[key] = sum
    totalScore += sum
  })
  
  return {
    total: totalScore,
    dimensions: dimensionScores
  }
}

// ==================== 基于基础信息的个性化等级判断 ====================
export function getLevel(score, basicInfo = {}) {
  // 基础阈值：100分制（从165分制转换而来）
  // 原165分制：normal: 49, mild: 82, moderate: 115, severe: 148
  // 转换为100分制：normal: 30, mild: 50, moderate: 70, severe: 90
  let thresholds = {
    normal: 30,    // 社交自如型（约29.7分，四舍五入为30）
    mild: 50,      // 轻度（约49.7分，四舍五入为50）
    moderate: 70,  // 中度（约69.7分，四舍五入为70）
    severe: 90     // 重度（约89.7分，四舍五入为90）
  }
  
  // ========== 年龄段校正因子 ==========
  // 心理学研究：年轻人的社交焦虑更常见，阈值可以适当放宽
  // 中年人社交焦虑更值得关注，阈值可以更严格
  const ageFactor = {
    teen: 0.95,        // 12-17岁：阈值放宽5%（更宽容）
    college: 0.92,     // 18-22岁：阈值放宽8%（大学生社恐很常见）
    young_adult: 1.0,  // 23-29岁：基准值
    adult: 1.05,       // 30-39岁：阈值收紧5%（需要更关注）
    mature: 1.08       // 40+岁：阈值收紧8%（更需要关注）
  }
  
  const age = basicInfo.age || 'young_adult'
  const ageMultiplier = ageFactor[age] || 1.0
  
  // ========== 性别校正因子 ==========
  // 心理学研究：女性在社交焦虑的某些维度可能更敏感
  // 但这不是说女性更严重，而是表现方式不同
  const genderFactor = {
    female: 1.02,  // 女性：轻微收紧（2%）
    male: 1.0,     // 男性：基准值
    other: 1.0     // 其他：基准值
  }
  
  const gender = basicInfo.gender || 'other'
  const genderMultiplier = genderFactor[gender] || 1.0
  
  // ========== 社交频率校正因子 ==========
  // 社交频率越低，说明回避越严重，需要更严格的阈值
  const frequencyFactor = {
    rarely: 1.10,      // 几乎不参加：阈值收紧10%（更严重）
    occasional: 1.05,  // 1-2次/周：阈值收紧5%
    regular: 1.0,     // 3-4次/周：基准值
    frequent: 0.98     // 5次以上：阈值放宽2%（更活跃）
  }
  
  const freq = basicInfo.social_frequency || 'regular'
  const freqMultiplier = frequencyFactor[freq] || 1.0
  
  // ========== 综合校正 ==========
  // 取平均值，避免过度校正
  const totalMultiplier = (ageMultiplier + genderMultiplier + freqMultiplier) / 3
  
  // 应用校正后的阈值
  thresholds = {
    normal: Math.round(thresholds.normal * totalMultiplier),
    mild: Math.round(thresholds.mild * totalMultiplier),
    moderate: Math.round(thresholds.moderate * totalMultiplier),
    severe: Math.round(thresholds.severe * totalMultiplier)
  }
  
  // ========== 判断等级 ==========
  if (score <= thresholds.normal) {
    return { 
      name: '社交自如型', 
      color: '#10b981', 
      desc: '你在社交场合表现自然，很少感到焦虑。' 
    }
  }
  
  if (score <= thresholds.mild) {
    return { 
      name: '轻度社交焦虑', 
      color: '#3b82f6', 
      desc: '某些社交场景会让你紧张，但总体可控。' 
    }
  }
  
  if (score <= thresholds.moderate) {
    return { 
      name: '中度社交焦虑', 
      color: '#f59e0b', 
      desc: '社交焦虑已明显影响日常生活，建议系统性练习改善。' 
    }
  }
  
  if (score <= thresholds.severe) {
    return { 
      name: '重度社交焦虑', 
      color: '#ef4444', 
      desc: '社交焦虑严重影响生活质量，建议寻求专业帮助。' 
    }
  }
  
  return { 
    name: '极重度社交焦虑', 
    color: '#991b1b', 
    desc: '正在经历严重社交困扰，强烈建议尽快咨询专业心理医生。' 
  }
}

// ==================== 计算百分位（已移除，不再使用） ====================
// 不再计算百分位，避免"击败全国"的表述

// ==================== 基于基础信息的个性化类型判断 ====================
export function getType(dimensions, basicInfo = {}) {
  // 负面评价恐惧型（新增）：核心特征是害怕被评价
  // 根据年龄和性别调整阈值
  const age = basicInfo.age || 'young_adult'
  const gender = basicInfo.gender || 'other'
  
  // 年轻女性更容易出现负面评价恐惧
  let fearThreshold = 20
  let ruminationThreshold = 15
  
  if (age === 'teen' || age === 'college') {
    fearThreshold = 18  // 年轻人阈值降低
    ruminationThreshold = 14
  }
  
  if (gender === 'female') {
    fearThreshold = 19  // 女性可能更敏感
  }
  
  if (dimensions.fear_of_negative_evaluation >= fearThreshold && dimensions.rumination >= ruminationThreshold) {
    return {
      id: 'fear_evaluation',
      name: '负面评价恐惧型社恐',
      englishName: 'Fear of Negative Evaluation Type',
      features: [
        '极度在意别人的眼光和评价',
        '总觉得别人在审视和批评自己',
        '事后反复回想"他们怎么看我"',
        '为了避免被负面评价而回避社交'
      ],
      rootCauses: [
        { title: '低自我价值感', desc: '内心深处不相信自己是值得被喜欢的' },
        { title: '过往创伤经历', desc: '曾经被嘲笑、批评或排斥的痛苦记忆' },
        { title: '完美主义倾向', desc: '对自己要求过高，无法接受不完美的表现' }
      ],
      positiveReframe: '你对他人情绪的敏感度很高，这意味着你有很强的共情能力。学会接纳"不完美"的自己，你会发现大多数人其实没那么在意你的表现。'
    }
  }

  // 功能损害型（新增）：社恐已严重影响生活
  // 根据职业和社交频率调整阈值
  const occupation = basicInfo.occupation || 'other'
  const socialFreq = basicInfo.social_frequency || 'regular'
  
  let impairmentThreshold = 16
  let avoidanceThreshold = 15
  
  // 学生和职场人对功能损害的感受不同
  if (occupation === 'student') {
    impairmentThreshold = 15  // 学生更敏感
  } else if (occupation === 'employee' || occupation === 'entrepreneur') {
    impairmentThreshold = 17  // 职场人可能需要更高阈值
  }
  
  // 社交频率越低，说明回避越严重
  if (socialFreq === 'rarely') {
    avoidanceThreshold = 14  // 几乎不参加，阈值降低
  }
  
  if (dimensions.functional_impairment >= impairmentThreshold && dimensions.avoidance >= avoidanceThreshold) {
    return {
      id: 'functional_impairment',
      name: '功能损害型社恐',
      englishName: 'Functional Impairment Type',
      features: [
        '因社交焦虑错过了很多重要机会',
        '工作/学习受到明显影响',
        '人际关系质量严重下降',
        '生活质量明显降低'
      ],
      rootCauses: [
        { title: '长期回避的恶性循环', desc: '越回避越焦虑，越焦虑越回避' },
        { title: '社交技能严重欠缺', desc: '缺乏足够的社交练习和经验' },
        { title: '自我隔离的防御机制', desc: '用回避来保护自己免受伤害' }
      ],
      positiveReframe: '意识到问题本身就是改变的第一步。从最小的社交开始，逐步重建信心。专业帮助（心理咨询）会让这个过程更顺利。'
    }
  }
  
  // 预演型：预期焦虑高 + 社交反刍高
  if (dimensions.anticipation >= 16 && dimensions.rumination >= 14) {
    return {
      id: 'rehearsal',
      name: '预演型社恐',
      englishName: 'Rehearsal-Type Social Anxiety',
      features: [
        '事前过度担心，脑补各种糟糕场景',
        '反复预演对话，准备"完美"表现',
        '实际社交时反而还好',
        '事后又开始反刍和懊悔'
      ],
      rootCauses: [
        { title: '完美主义倾向', desc: '害怕在他人面前展现"不完美"的自己' },
        { title: '低自我接纳', desc: '对自己要求过高，容错率太低' },
        { title: '过度关注他人评价', desc: '"他们会怎么看我"成为最大压力源' }
      ],
      positiveReframe: '预演型社恐者往往共情能力强、善于观察细节、内心细腻敏感。这不是缺陷，而是特质。关键是学会接纳"不完美"的社交，而非追求"完美"表现。'
    }
  }
  
  // 回避型：回避行为高 + 社交场景恐惧高
  if (dimensions.avoidance >= 15 && dimensions.scene_fear >= 18) {
    return {
      id: 'avoidant',
      name: '回避型社恐',
      englishName: 'Avoidant-Type Social Anxiety',
      features: [
        '主动避免社交场合',
        '能不参加就不参加',
        '对社交有强烈的恐惧感',
        '更倾向独处和安全环境'
      ],
      rootCauses: [
        { title: '恐惧被拒绝', desc: '害怕被他人否定和排斥' },
        { title: '低自我价值感', desc: '不相信自己值得被喜欢' },
        { title: '过往负面经历', desc: '曾经的社交创伤形成防御机制' }
      ],
      positiveReframe: '回避型社恐者往往更加独立、善于自我相处。学会在独处和社交之间找到平衡，逐步扩展舒适区，而非完全回避。'
    }
  }
  
  // 表演型：生理反应高 + 负面评价恐惧高
  if (dimensions.physical >= 12 && dimensions.fear_of_negative_evaluation >= 18) {
    return {
      id: 'performance',
      name: '表演型社恐',
      englishName: 'Performance-Type Social Anxiety',
      features: [
        '在需要表现的场合特别紧张',
        '身体反应强烈（心跳、出汗等）',
        '担心别人注意到自己的紧张',
        '害怕在众人面前出丑'
      ],
      rootCauses: [
        { title: '害怕被评判', desc: '过度在意他人的眼光和评价' },
        { title: '缺乏自信', desc: '不相信自己能做好' },
        { title: '身心连接敏感', desc: '情绪容易引发明显的生理反应' }
      ],
      positiveReframe: '表演型社恐者往往对自己要求较高、追求卓越。学会接纳不完美的表现，理解紧张是正常反应，而非失败的信号。'
    }
  }
  
  // 默认：综合型或轻度社恐
  return {
    id: 'general',
    name: '综合型社恐',
    englishName: 'General Social Anxiety',
    features: [
      '在多种社交情境中都会感到不适',
      '焦虑程度因场合而异',
      '既有预期焦虑也有回避行为',
      '各方面都有轻度到中度的表现'
    ],
    rootCauses: [
      { title: '多因素综合', desc: '性格、成长环境、经历等多方面影响' },
      { title: '适应性焦虑', desc: '对不确定社交情境的自然反应' },
      { title: '社交技能欠缺', desc: '缺乏足够的社交经验和技巧' }
    ],
    positiveReframe: '综合型社恐意味着没有特别突出的问题点，这反而更容易全面改善。通过系统性的练习和认知调整，可以获得显著进步。'
  }
}

// ==================== 获取维度级别 ====================
export function getDimensionLevel(score, maxScore = 25) {
  const percentage = (score / maxScore) * 100
  if (percentage <= 40) return { level: '较低', icon: '✓' }
  if (percentage <= 60) return { level: '中等', icon: '' }
  if (percentage <= 80) return { level: '中高', icon: '' }
  return { level: '偏高', icon: '⚠' }
}

// ==================== 获取维度解读 ====================
export function getDimensionInterpretation(dimension, score, maxScore) {
  const interpretations = {
    scene_fear: {
      low: '你在大多数社交场合都能保持相对自然',
      medium: '在某些社交场合会感到紧张',
      high: '在多人聚会、公开场合容易感到紧张',
      veryHigh: '对大部分社交场景都有明显的恐惧感'
    },
    avoidance: {
      low: '你很少因为焦虑而回避社交',
      medium: '会选择性参加社交活动',
      high: '经常找理由避免参加社交活动',
      veryHigh: '会主动避免几乎所有社交场合'
    },
    anticipation: {
      low: '对即将到来的社交不会过度担心',
      medium: '会提前有一些担心和准备',
      high: '事前过度担心是你的痛点',
      veryHigh: '会长时间提前焦虑，严重影响心情'
    },
    fear_of_negative_evaluation: {
      low: '不太在意别人的评价',
      medium: '有时会担心别人的看法',
      high: '非常在意别人怎么看自己',
      veryHigh: '极度害怕被负面评价，这是最大的恐惧源'
    },
    rumination: {
      low: '社交后不会过度反思',
      medium: '有时会回想社交中的细节',
      high: '事后经常后悔说错话',
      veryHigh: '会长时间反复回想和懊悔'
    },
    physical: {
      low: '身体反应不算严重',
      medium: '有一定的生理反应',
      high: '会出现明显的生理反应',
      veryHigh: '生理反应强烈，影响正常表现'
    },
    functional_impairment: {
      low: '社交焦虑对生活影响很小',
      medium: '有一些影响，但还能应对',
      high: '明显影响工作、学习或人际关系',
      veryHigh: '严重影响生活质量，错过很多机会'
    },
    self_efficacy: {
      low: '不太相信自己能处理好社交情境',
      medium: '对自己的社交能力信心一般',
      high: '在大多数情况下相信自己',
      veryHigh: '对自己的社交能力很有信心'
    }
  }
  
  const percentage = (score / maxScore) * 100
  let level = 'medium'
  
  if (percentage <= 40) level = 'low'
  else if (percentage <= 60) level = 'medium'
  else if (percentage <= 80) level = 'high'
  else level = 'veryHigh'
  
  return interpretations[dimension]?.[level] || ''
}

// ==================== 生成完整报告 ====================
export function generateReport(answers, basicInfo = {}) {
  // 先检查效度
  const validity = checkValidity(answers)
  
  if (!validity.isValid) {
    return {
      isValid: false,
      warnings: validity.warnings,
      message: '检测到作答质量问题，建议重新认真作答。这不会影响你的任何记录，请放心重新测评。'
    }
  }
  
  // 计算分数
  const scores = calculateScores(answers)
  
  // 使用基础信息进行个性化类型判断
  const type = getType(scores.dimensions, basicInfo)
  
  // 维度配置（包含最高分）- 只显示6大核心维度
  const dimensionConfig = {
    scene_fear: { name: '社交场景恐惧', maxScore: 25, icon: '😰' },
    avoidance: { name: '回避行为程度', maxScore: 20, icon: '🚪' },
    anticipation: { name: '预期焦虑强度', maxScore: 20, icon: '⏰' },
    fear_of_negative_evaluation: { name: '负面评价恐惧', maxScore: 25, icon: '👀' },
    rumination: { name: '社交后反刍', maxScore: 20, icon: '🔄' },
    functional_impairment: { name: '功能损害程度', maxScore: 20, icon: '📉' }
  }
  
  // 只处理6大核心维度（排除physical和self_efficacy）
  const coreDimensionKeys = Object.keys(dimensionConfig)
  const dimensions = coreDimensionKeys.map(key => {
    const score = scores.dimensions[key] || 0
    const config = dimensionConfig[key]
    return {
      key,
      name: config.name,
      score,
      maxScore: config.maxScore,
      percentage: Math.round((score / config.maxScore) * 100),
      level: getDimensionLevel(score, config.maxScore),
      interpretation: getDimensionInterpretation(key, score, config.maxScore),
      icon: config.icon
    }
  })
  
  // 将总分转换为100分制（原始分/165*100）
  const totalScore100 = Math.round((scores.total / 165) * 100)
  
  // 使用100分制进行等级判断
  const level100 = getLevel(totalScore100, basicInfo)
  
  return {
    isValid: true,
    testDate: new Date().toISOString(),
    basicInfo, // 包含用户的基础信息（用于算法，不在前端显示）
    totalScore: totalScore100,
    maxScore: 100, // 100分制
    level: level100,
    type,
    dimensions,
    suggestions: getSuggestions(type, scores, basicInfo)
  }
}

// ==================== 获取改善建议 ====================
function getSuggestions(type, scores, basicInfo) {
  const suggestions = {
    immediate: [],
    weekly: {},
    longTerm: {
      books: [
        { title: '《社交焦虑自助手册》', author: '吉莉恩·巴特勒' },
        { title: '《被讨厌的勇气》', author: '岸见一郎' },
        { title: '《蛤蟆先生去看心理医生》', author: '罗伯特·戴博德' }
      ],
      practices: [
        '正念冥想（降低预期焦虑）',
        '认知行为疗法CBT（改变思维模式）',
        '暴露疗法（逐步面对恐惧场景）'
      ],
      note: '改善需要时间，一般需要3-6个月持续练习。每一小步都是进步。'
    },
    warning: {
      title: '何时需要专业帮助？',
      conditions: [
        '严重影响工作/学习',
        '导致完全的社交隔离',
        '伴随抑郁、惊恐发作',
        '持续时间超过6个月且无好转'
      ],
      advice: '建议咨询专业心理咨询师或精神科医生。全国心理援助热线：12355'
    }
  }
  
  // 根据类型提供针对性建议
  if (type.id === 'fear_evaluation') {
    // 负面评价恐惧型
    suggestions.immediate = [
      {
        title: '记住"聚光灯效应"',
        content: `心理学研究发现，我们总是高估别人对自己的关注度。

实验证明：
· 你觉得100%的人注意到你的尴尬
· 实际上只有不到20%的人注意到
· 而且他们很快就忘了

下次担心"别人怎么看我"时，问自己：
"我还记得上周某个陌生人的尴尬瞬间吗？"
答案通常是"不记得"——别人对你也一样。`
      },
      {
        title: '练习"自我肯定语句"',
        steps: [
          '每天早上对镜子说："我不需要所有人都喜欢我"',
          '社交前默念："做不完美的自己也没关系"',
          '被批评时告诉自己："一个人的评价不代表我的全部"',
          '事后提醒："我尽力了，这就够了"'
        ],
        reason: '重复的积极暗示可以重塑大脑的思维模式，降低对负面评价的过度敏感。'
      }
    ]
  } else if (type.id === 'functional_impairment') {
    // 功能损害型
    suggestions.immediate = [
      {
        title: '🆘 优先事项：寻求专业帮助',
        content: `你的社交焦虑已经严重影响生活质量，这不是"性格内向"，而是需要干预的心理困扰。

强烈建议：
✅ 预约心理咨询师（CBT认知行为疗法最有效）
✅ 如有条件，考虑正规医院精神心理科
✅ 告诉信任的朋友/家人，寻求支持

这不是软弱，而是对自己负责的勇气。`
      },
      {
        title: '从"最小社交单元"开始重建',
        steps: [
          '第1周：每天和1个熟人发语音（不是文字）',
          '第2周：去超市问店员1个问题',
          '第3周：主动给1个朋友打电话',
          '第4周：和1个人单独见面30分钟'
        ],
        reason: '长期回避导致社交肌肉萎缩，需要从极小的步骤重新训练。专业帮助可以让这个过程更有效。'
      }
    ]
  } else if (type.id === 'rehearsal') {
    // 预演型
    suggestions.immediate = [
      {
        title: '使用"5秒法则"打断焦虑',
        steps: [
          '当你开始脑补糟糕场景时',
          '数5个数(5-4-3-2-1)',
          '立即转移注意力（做别的事）',
          '不给大脑"预演"的机会'
        ],
        reason: '大脑的预期焦虑需要时间累积，快速打断可以防止陷入恶性循环。'
      },
      {
        title: '准备3个"万能话题"',
        content: `话题清单：
· 最近看的剧/书/综艺 - "你最近在追什么剧?"
· 询问对方近况 - "你最近忙什么呢?"
· 分享轻松小事 - "今天遇到个好玩的事..."

技巧：使用开放式问题（不能yes/no回答），让对方多说，你就轻松了。`
      }
    ]
  } else if (type.id === 'avoidant') {
    // 回避型
    suggestions.immediate = [
      {
        title: '建立"社交暴露阶梯"',
        content: `把恐惧场景按难度排序（1-10分）：
1分：给快递员说"谢谢"
3分：超市问店员位置
5分：和同事闲聊5分钟
7分：参加3人小聚
10分：参加陌生人聚会

规则：从1分开始，每个等级重复3-5次后再升级。
不要跳级，稳扎稳打。`
      },
      {
        title: '设置"社交配额"',
        steps: [
          '每周至少1次小社交（不能取消）',
          '可以提前离开，但必须去',
          '完成后奖励自己（看剧、美食等）',
          '记录感受：实际焦虑 vs 预期焦虑'
        ],
        reason: '回避只会强化恐惧，逐步暴露才能打破循环。'
      }
    ]
  } else if (type.id === 'performance') {
    // 表演型
    suggestions.immediate = [
      {
        title: '接纳你的身体反应',
        content: `心跳加速、出汗、脸红——这些都是正常的！

改变认知：
❌ "糟了，我在发抖，别人肯定觉得我很奇怪"
✅ "我的身体在帮我准备应对挑战，这是正常反应"

研究表明：
· 你觉得自己的紧张非常明显
· 实际上别人几乎注意不到
· 即使注意到，也不会因此否定你`
      },
      {
        title: '使用"深呼吸+肌肉放松"',
        steps: [
          '吸气4秒 → 憋气4秒 → 呼气6秒',
          '重复3-5次，激活副交感神经',
          '同时绷紧拳头3秒，然后完全放松',
          '想象紧张像水一样从指尖流走'
        ],
        reason: '生理放松会反向影响心理状态，降低焦虑感。'
      }
    ]
  } else {
    // 综合型
    suggestions.immediate = [
      {
        title: '建立"社交日记"',
        content: `每次社交后记录：
1. 预期焦虑（1-10分）
2. 实际焦虑（1-10分）
3. 发生的"糟糕"事情
4. 实际后果

你会发现：
→ 实际焦虑通常低于预期
→ "糟糕"的事情很少发生
→ 即使发生，后果没那么严重`
      },
      {
        title: '每天做1件"微社交"',
        content: `不需要参加聚会，从小事开始：
· 和便利店店员说"辛苦了"
· 给同事/同学发个表情包
· 在群里回复1条消息
· 电梯里和人微笑点头

积累小成功，建立信心。`
      }
    ]
  }
  
  // 4周渐进计划（根据年龄和职业调整）
  const age = basicInfo.age || 'young_adult'
  const isStudent = basicInfo.occupation === 'student'
  
  suggestions.weekly = {
    week1: {
      title: isStudent ? '第1周：线上语音练习' : '第1周：低压力社交',
      tasks: isStudent ? [
        '微信语音聊天（vs文字）',
        '每天至少1次，3分钟以上',
        '可以先找最熟的朋友'
      ] : [
        '和同事闲聊5分钟',
        '主动问候至少3个人',
        '参加1次线上会议并发言1次'
      ]
    },
    week2: {
      title: '第2周：陌生人简短互动',
      tasks: [
        '给不熟的人打电话（快递、外卖、客服）',
        '超市问店员问题',
        '提前准备要说的话'
      ]
    },
    week3: {
      title: '第3周：熟人单独见面',
      tasks: [
        '主动约1个熟人',
        '选轻松场所（咖啡厅、公园）',
        '控制在1-2小时'
      ]
    },
    week4: {
      title: '第4周：小规模群体社交',
      tasks: [
        '参加3-5人小聚',
        '可带熟人同去',
        '允许自己提前离开（但必须去）'
      ]
    },
    principle: '从舒适区边缘开始，逐步扩展。每周至少完成1个任务，不要一次性全做完。'
  }
  
  return suggestions
}

export default {
  calculateScores,
  getLevel,
  getType,
  getDimensionLevel,
  getDimensionInterpretation,
  generateReport
}
