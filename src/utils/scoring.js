/**
 * 测评计分和报告生成逻辑
 */

// 计算各维度得分
export function calculateScores(answers) {
  const dimensions = {
    scene_fear: [1, 2, 3, 4, 5],           // 社交场景恐惧
    avoidance: [6, 7, 8, 9, 10],           // 回避行为程度
    anticipation: [11, 12, 13, 14, 15],    // 预期焦虑强度
    rumination: [16, 17, 18, 19, 20],      // 社交后反刍
    physical: [21, 22, 23, 24, 25],        // 生理反应强度
    self_efficacy: [26, 27, 28, 29, 30]    // 社交自我效能
  }
  
  let totalScore = 0
  let dimensionScores = {}
  
  Object.entries(dimensions).forEach(([key, questionIds]) => {
    let sum = 0
    questionIds.forEach(id => {
      sum += parseInt(answers[id] || 0)
    })
    dimensionScores[key] = sum
    totalScore += sum
  })
  
  return {
    total: totalScore,
    dimensions: dimensionScores
  }
}

// 判断等级
export function getLevel(score) {
  if (score <= 60) return { name: '轻度', color: '#91A88E', desc: '轻度社交焦虑' }
  if (score <= 90) return { name: '中度', color: '#D4A574', desc: '中度社交焦虑' }
  if (score <= 120) return { name: '重度', color: '#C8837B', desc: '重度社交焦虑' }
  return { name: '极重度', color: '#C8837B', desc: '极重度社交焦虑' }
}

// 计算百分位
export function calculatePercentile(score) {
  // 基于正态分布的简化计算
  // 假设平均分75，标准差20
  const mean = 75
  const std = 20
  const z = (score - mean) / std
  
  // 简化的百分位计算
  let percentile = 50 + Math.round(z * 34)
  percentile = Math.max(1, Math.min(99, percentile))
  
  return percentile
}

// 判断社恐类型
export function getType(dimensions) {
  const types = []
  
  // 预演型：预期焦虑高 + 社交反刍高
  if (dimensions.anticipation >= 18 && dimensions.rumination >= 15) {
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
  if (dimensions.avoidance >= 18 && dimensions.scene_fear >= 18) {
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
  
  // 表演型：生理反应高 + 自我效能低
  if (dimensions.physical >= 18 && dimensions.self_efficacy <= 10) {
    return {
      id: 'performance',
      name: '表演型社恐',
      englishName: 'Performance-Type Social Anxiety',
      features: [
        '在需要表现的场合特别紧张',
        '身体反应强烈（心跳、出汗等）',
        '担心别人注意到自己的紧张',
        '对自己的表现没有信心'
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

// 获取维度级别
export function getDimensionLevel(score, maxScore = 25) {
  const percentage = (score / maxScore) * 100
  if (percentage <= 40) return { level: '较低', icon: '✓' }
  if (percentage <= 60) return { level: '中等', icon: '' }
  if (percentage <= 80) return { level: '中高', icon: '' }
  return { level: '偏高', icon: '⚠' }
}

// 获取维度解读
export function getDimensionInterpretation(dimension, score) {
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
    self_efficacy: {
      low: '不太相信自己能处理好社交情境',
      medium: '对自己的社交能力信心一般',
      high: '在大多数情况下相信自己',
      veryHigh: '对自己的社交能力很有信心'
    }
  }
  
  let level = 'medium'
  if (score <= 10) level = 'low'
  else if (score <= 15) level = 'medium'
  else if (score <= 20) level = 'high'
  else level = 'veryHigh'
  
  // 自我效能分数越低越不好，所以反转
  if (dimension === 'self_efficacy') {
    if (score <= 8) level = 'low'
    else if (score <= 12) level = 'medium'
    else if (score <= 18) level = 'high'
    else level = 'veryHigh'
  }
  
  return interpretations[dimension]?.[level] || ''
}

// 生成完整报告
export function generateReport(answers) {
  const scores = calculateScores(answers)
  const level = getLevel(scores.total)
  const type = getType(scores.dimensions)
  const percentile = calculatePercentile(scores.total)
  
  const dimensionNames = {
    scene_fear: '社交场景恐惧',
    avoidance: '回避行为程度',
    anticipation: '预期焦虑强度',
    rumination: '社交后反刍',
    physical: '生理反应强度',
    self_efficacy: '社交自我效能'
  }
  
  const dimensions = Object.entries(scores.dimensions).map(([key, score]) => ({
    key,
    name: dimensionNames[key],
    score,
    maxScore: 25,
    percentage: Math.round((score / 25) * 100),
    level: getDimensionLevel(score),
    interpretation: getDimensionInterpretation(key, score)
  }))
  
  return {
    testDate: new Date().toISOString(),
    totalScore: scores.total,
    level,
    percentile,
    type,
    dimensions,
    suggestions: getSuggestions(type, scores)
  }
}

// 获取改善建议
function getSuggestions(type, scores) {
  const suggestions = {
    immediate: [],
    weekly: {},
    longTerm: {
      books: [
        { title: '《社交焦虑自助手册》', author: '吉莉恩·巴特勒' },
        { title: '《被讨厌的勇气》', author: '岸见一郎' }
      ],
      practices: [
        '正念冥想（降低预期焦虑）',
        '认知行为疗法CBT（改变思维模式）'
      ],
      note: '改善需要时间，一般需要3-6个月持续练习。每一小步都是进步。'
    },
    warning: {
      title: '何时需要专业帮助？',
      conditions: [
        '严重影响工作/学习',
        '导致完全的社交隔离',
        '伴随抑郁、惊恐发作'
      ],
      advice: '建议咨询心理咨询师或精神科医生'
    }
  }
  
  // 根据类型提供即时建议
  if (type.id === 'rehearsal') {
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
  }
  
  // 4周渐进计划
  suggestions.weekly = {
    week1: {
      title: '线上语音练习',
      tasks: [
        '微信语音聊天（vs文字）',
        '每天至少1次，3分钟以上'
      ]
    },
    week2: {
      title: '陌生人电话',
      tasks: [
        '给不熟的人打电话（快递、外卖、客服）',
        '提前准备要说的话'
      ]
    },
    week3: {
      title: '熟人单独见面',
      tasks: [
        '主动约1个熟人',
        '选轻松场所（咖啡厅）',
        '控制在1-2小时'
      ]
    },
    week4: {
      title: '小规模聚会',
      tasks: [
        '参加3-5人小聚',
        '可带熟人同去',
        '允许自己提前离开'
      ]
    },
    principle: '从舒适区边缘开始，逐步扩展，不要一下子跳到最难的。'
  }
  
  return suggestions
}

