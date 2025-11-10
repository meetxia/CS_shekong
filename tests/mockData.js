/**
 * 测试用的模拟数据
 */

// 模拟答案数据
export const mockAnswers = {
  // 全部高分（社恐严重）
  highScoreAnswers: (() => {
    const answers = {}
    for (let i = 1; i <= 33; i++) {
      answers[i] = 5
    }
    answers[34] = 3 // 效度题
    answers[35] = 3 // 效度题
    return answers
  })(),
  
  // 全部低分（社恐轻微）
  lowScoreAnswers: (() => {
    const answers = {}
    for (let i = 1; i <= 33; i++) {
      answers[i] = 1
    }
    answers[34] = 3
    answers[35] = 3
    return answers
  })(),
  
  // 中等分数
  mediumScoreAnswers: (() => {
    const answers = {}
    for (let i = 1; i <= 33; i++) {
      answers[i] = 3
    }
    answers[34] = 3
    answers[35] = 3
    return answers
  })(),
  
  // 预演型社恐特征
  rehearsalTypeAnswers: {
    // 预期焦虑高（Q10-13）
    10: 5, 11: 5, 12: 5, 13: 5,
    // 社交反刍高（Q19-22）
    19: 5, 20: 5, 21: 4, 22: 5,
    // 其他维度中等
    1: 3, 2: 3, 3: 3, 4: 3, 5: 3,
    6: 3, 7: 3, 8: 3, 9: 3,
    14: 3, 15: 3, 16: 3, 17: 3, 18: 3,
    23: 3, 24: 3, 25: 3,
    26: 3, 27: 3, 28: 3, 29: 3,
    30: 2, 31: 2, 32: 2, 33: 2,
    34: 3, 35: 3
  },
  
  // 无效答案（效度检验不通过）
  invalidAnswers: {
    1: 3, 2: 3, 3: 3, 4: 3, 5: 3,
    6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
    11: 3, 12: 3, 13: 3, 14: 3, 15: 3,
    16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
    21: 3, 22: 3, 23: 3, 24: 3, 25: 3,
    26: 3, 27: 3, 28: 3, 29: 3, 30: 3,
    31: 3, 32: 3, 33: 3,
    34: -999, // "从未紧张"，无效
    35: 3
  }
}

// 模拟基础信息
export const mockBasicInfo = {
  default: {
    age: 'young_adult',
    gender: 'other',
    occupation: 'other',
    social_frequency: 'regular'
  },
  
  college: {
    age: 'college',
    gender: 'female',
    occupation: 'student',
    social_frequency: 'occasional'
  },
  
  mature: {
    age: 'mature',
    gender: 'male',
    occupation: 'employee',
    social_frequency: 'regular'
  }
}

// 模拟激活码数据
export const mockActivationCodes = {
  valid: 'TEST-2024-ABCD',
  valid2: '1234-5678-9ABC',
  invalid: 'INVALID-CODE',
  expired: 'EXPI-RED-CODE',
  used: 'USED-CODE-1234',
  wrongFormat: 'test-2024',
  withSpaces: ' TEST 2024 ABCD ',
  lowercase: 'test-2024-abcd'
}

// 模拟激活码响应
export const mockActivationResponse = {
  success: {
    valid: true,
    isActivated: false,
    recordId: 1,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    todayUsage: 0,
    dailyLimit: 3
  },
  
  alreadyActivated: {
    valid: true,
    isActivated: true,
    recordId: 1,
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    todayUsage: 1,
    dailyLimit: 3
  },
  
  limitReached: {
    valid: false,
    error: '今日使用次数已达上限（3次）',
    remainingToday: 0,
    dailyLimit: 3
  },
  
  expired: {
    valid: false,
    error: '激活码已过期'
  },
  
  notFound: {
    valid: false,
    error: '激活码不存在'
  }
}

// 模拟管理员数据
export const mockAdminData = {
  credentials: {
    username: 'admin',
    password: 'admin123'
  },
  
  token: 'mock-jwt-token-12345',
  
  stats: {
    total_codes: 100,
    active_codes: 80,
    expired_codes: 15,
    revoked_codes: 5,
    total_records: 250,
    total_usage_count: 1500,
    today_usage_count: 50
  }
}

// 模拟AI响应
export const mockAIResponse = {
  success: {
    type: {
      id: 'rehearsal',
      name: '脑内彩排一百遍星人',
      englishName: 'Anticipatory Catastrophizer',
      features: [
        '事前过度担心，脑补各种糟糕场景',
        '反复预演对话，准备"完美"表现',
        '实际社交时反而还好',
        '事后又开始反刍和懊悔'
      ],
      rootCauses: [
        { title: '完美主义倾向', desc: '害怕在他人面前展现"不完美"的自己' },
        { title: '低自我接纳', desc: '对自己要求过高，容错率太低' }
      ],
      positiveReframe: '预演型社恐者往往共情能力强、善于观察细节、内心细腻敏感。'
    }
  },
  
  error: {
    error: 'AI服务暂时不可用',
    fallback: true
  }
}

// 模拟维度分数
export const mockDimensionScores = {
  scene_fear: 18,
  avoidance: 12,
  anticipation: 16,
  fear_of_negative_evaluation: 20,
  rumination: 14,
  physical: 10,
  functional_impairment: 11,
  self_efficacy: 9
}

// 模拟题目数据
export const mockQuestions = [
  {
    id: 1,
    text: '在多人聚会或社交场合，我会感到紧张不安',
    dimension: 'scene_fear'
  },
  {
    id: 2,
    text: '我在社交场合中常常感到格格不入',
    dimension: 'scene_fear'
  },
  {
    id: 6,
    text: '我会尽可能避免参加社交活动',
    dimension: 'avoidance'
  },
  {
    id: 10,
    text: '在社交活动开始前，我会提前很久就开始担心',
    dimension: 'anticipation'
  }
]

export default {
  mockAnswers,
  mockBasicInfo,
  mockActivationCodes,
  mockActivationResponse,
  mockAdminData,
  mockAIResponse,
  mockDimensionScores,
  mockQuestions
}
