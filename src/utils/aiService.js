/**
 * AI生成服务 - 根据用户答题生成个性化社恐类型分析
 */

// 使用国内可用的AI API（可以选择：通义千问、文心一言、Kimi等）
// 这里提供通用的实现框架

const AI_CONFIG = {
    // 优先使用环境变量，如果没有则使用默认值
    apiKey: import.meta.env.VITE_AI_API_KEY || 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657',
    apiUrl: import.meta.env.VITE_AI_API_URL || 'https://dpapi.cn/v1/chat/completions',
    model: import.meta.env.VITE_AI_MODEL || 'claude-4.5-sonnet',
    timeout: 30000
  }
  
  /**
   * 生成AI提示词
   */
  function buildPrompt(report, answers, basicInfo) {
    const { totalScore, dimensions, type } = report
    
    // 构建维度描述
    const dimensionDesc = dimensions.map(d => 
      `${d.name}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.level.level}`
    ).join('\n')
    
    // 构建答题模式分析
    const highScoreQuestions = Object.entries(answers)
      .filter(([id, score]) => score >= 4 && id <= 33)
      .map(([id]) => `Q${id}`)
      .join(', ')
    
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
  }`
  
    return prompt
  }
  
  /**
   * 调用AI API生成分析
   */
  export async function generatePersonalizedAnalysis(report, answers, basicInfo) {
    // 如果没有配置API Key，返回默认分析
    if (!AI_CONFIG.apiKey) {
      console.warn('未配置AI API Key，使用默认分析')
      return null
    }
  
    try {
      const prompt = buildPrompt(report, answers, basicInfo)
      
      // 调用Claude API（通过dpapi.cn中转）
      // 创建超时控制器（兼容性更好）
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout)
      
      try {
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
        })
        
        clearTimeout(timeoutId)
  
        if (!response.ok) {
          throw new Error(`AI API错误: ${response.status}`)
        }
    
        const data = await response.json()
        
        // 解析AI返回的JSON（Claude API格式）
        const aiResponse = data.choices?.[0]?.message?.content || ''
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        
        if (!jsonMatch) {
          throw new Error('AI返回格式错误')
        }
    
        const analysis = JSON.parse(jsonMatch[0])
        
        // 验证必要字段
        if (!analysis.typeName || !analysis.features || !analysis.rootCauses) {
          throw new Error('AI返回数据不完整')
        }
    
        return {
          id: 'ai_generated',
          name: analysis.typeName,
          englishName: analysis.englishName || 'AI Generated Type',
          features: analysis.features,
          rootCauses: analysis.rootCauses,
          positiveReframe: analysis.positiveReframe
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        throw fetchError
      }
  
    } catch (error) {
      console.error('AI生成失败:', error)
      // 如果是超时错误，给出更友好的提示
      if (error.name === 'AbortError') {
        console.warn('AI生成超时，将使用本地增强规则')
      }
      return null // 失败时返回null，使用原有的规则判断
    }
  }
  
  /**
   * 使用本地增强规则生成分析（不依赖AI API）
   * 这个方案更稳定，可以作为主要方案或降级方案
   */
  export function generateEnhancedAnalysis(report, answers, basicInfo) {
    const { totalScore, dimensions, type } = report
    
    // 分析用户的独特模式
    const pattern = analyzeUserPattern(dimensions, answers, basicInfo)
    
    // 基于模式生成个性化内容
    const typeName = generateTypeName(pattern, type)
    const features = generateFeatures(pattern, dimensions)
    const rootCauses = generateRootCauses(pattern, basicInfo)
    const positiveReframe = generatePositiveReframe(pattern, basicInfo)
    
    return {
      id: 'enhanced_local',
      name: typeName,
      englishName: generateEnglishName(typeName),
      features,
      rootCauses,
      positiveReframe
    }
  }
  
  /**
   * 分析用户的独特模式
   */
  function analyzeUserPattern(dimensions, answers, basicInfo) {
    // 找出最高的3个维度
    const sortedDims = [...dimensions].sort((a, b) => b.percentage - a.percentage)
    const topDims = sortedDims.slice(0, 3)
    
    // 判断是否有极端维度
    const hasExtreme = topDims[0].percentage >= 80
    
    // 判断分布类型
    const isUniform = Math.abs(topDims[0].percentage - topDims[2].percentage) <= 15
    const isSkewed = topDims[0].percentage - topDims[1].percentage >= 20
    
    // 分析情绪模式
    const emotionPattern = analyzeEmotionPattern(answers)
    
    return {
      topDimensions: topDims,
      hasExtreme,
      isUniform,
      isSkewed,
      dominantDim: topDims[0],
      emotionPattern,
      basicInfo
    }
  }
  
  /**
   * 分析情绪模式
   */
  function analyzeEmotionPattern(answers) {
    // 分析答题的一致性和极端性
    const scores = Object.values(answers).filter(s => s > 0 && s <= 5)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const hasMany5s = scores.filter(s => s === 5).length >= 8
    const hasMany1s = scores.filter(s => s === 1).length >= 8
    
    return {
      average: avgScore,
      isExtreme: hasMany5s,
      isBalanced: hasMany1s,
      variance: calculateVariance(scores)
    }
  }
  
  /**
   * 计算方差
   */
  function calculateVariance(arr) {
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length
    return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length
  }
  
  /**
   * 生成个性化类型名称
   */
  function generateTypeName(pattern, originalType) {
    const { dominantDim, isUniform, hasExtreme, emotionPattern, basicInfo } = pattern
    
    // 基于主导维度的特殊命名
    const typeTemplates = {
      '社交场景恐惧': {
        high: ['场景敏感型社恐', '环境警觉型社恐', '情境过载型社恐'],
        extreme: ['全场景恐惧型社恐', '社交环境高敏型']
      },
      '回避行为程度': {
        high: ['主动回避型社恐', '防御性退缩型社恐', '安全岛型社恐'],
        extreme: ['社交隔离型社恐', '极度回避型社恐']
      },
      '预期焦虑强度': {
        high: ['预演型社恐', '提前焦虑型社恐', '脑内彩排型社恐'],
        extreme: ['过度预期型社恐', '焦虑提前爆发型']
      },
      '负面评价恐惧': {
        high: ['评价敏感型社恐', '他人眼光型社恐', '完美主义表演型社恐'],
        extreme: ['评价恐慌型社恐', '自我审查型社恐']
      },
      '社交后反刍': {
        high: ['事后反刍型社恐', '回忆循环型社恐', '自我批判型社恐'],
        extreme: ['过度反刍型社恐', '后悔沉浸型社恐']
      },
      '功能损害程度': {
        high: ['功能受限型社恐', '生活受阻型社恐', '机会流失型社恐'],
        extreme: ['严重损害型社恐', '全面受限型社恐']
      }
    }
    
    const dimName = dominantDim.name
    const templates = typeTemplates[dimName] || { high: [originalType.name], extreme: [originalType.name] }
    
    const pool = hasExtreme ? templates.extreme : templates.high
    
    // 根据用户信息选择最合适的一个
    const index = hashBasicInfo(basicInfo) % pool.length
    return pool[index]
  }
  
  /**
   * 生成英文名称
   */
  function generateEnglishName(chineseName) {
    const mapping = {
      '场景敏感型社恐': 'Context-Sensitive Social Anxiety',
      '环境警觉型社恐': 'Environment-Alert Social Anxiety',
      '情境过载型社恐': 'Situation-Overload Social Anxiety',
      '全场景恐惧型社恐': 'Pan-Situational Social Phobia',
      '社交环境高敏型': 'Hyper-Sensitive Environmental Type',
      '主动回避型社恐': 'Active-Avoidant Social Anxiety',
      '防御性退缩型社恐': 'Defensive-Withdrawal Social Anxiety',
      '安全岛型社恐': 'Safe-Island Social Anxiety',
      '社交隔离型社恐': 'Social-Isolation Type',
      '极度回避型社恐': 'Extreme-Avoidance Social Anxiety',
      '预演型社恐': 'Rehearsal-Type Social Anxiety',
      '提前焦虑型社恐': 'Anticipatory-Anxiety Type',
      '脑内彩排型社恐': 'Mental-Rehearsal Social Anxiety',
      '过度预期型社恐': 'Hyper-Anticipatory Type',
      '焦虑提前爆发型': 'Pre-Event Anxiety Surge Type',
      '评价敏感型社恐': 'Evaluation-Sensitive Type',
      '他人眼光型社恐': 'Others-Gaze Social Anxiety',
      '完美主义表演型社恐': 'Perfectionist-Performance Type',
      '评价恐慌型社恐': 'Evaluation-Panic Social Anxiety',
      '自我审查型社恐': 'Self-Monitoring Type',
      '事后反刍型社恐': 'Post-Event Rumination Type',
      '回忆循环型社恐': 'Memory-Loop Social Anxiety',
      '自我批判型社恐': 'Self-Critical Type',
      '过度反刍型社恐': 'Excessive-Rumination Type',
      '后悔沉浸型社恐': 'Regret-Immersion Type',
      '功能受限型社恐': 'Functionally-Impaired Type',
      '生活受阻型社恐': 'Life-Blocked Social Anxiety',
      '机会流失型社恐': 'Opportunity-Loss Type',
      '严重损害型社恐': 'Severely-Impaired Type',
      '全面受限型社恐': 'Comprehensively-Limited Type'
    }
    
    return mapping[chineseName] || 'Personalized Social Anxiety Type'
  }
  
  /**
   * 生成核心特征
   */
  function generateFeatures(pattern, dimensions) {
    const { topDimensions, emotionPattern, basicInfo } = pattern
    const features = []
    
    // 基于前3个最高维度生成特征
    topDimensions.forEach((dim, index) => {
      const featureMap = {
        '社交场景恐惧': [
          `在${basicInfo.occupation === 'student' ? '课堂' : '会议'}、聚会等多种场景都会感到强烈不适`,
          '对人群密集的环境有明显的警觉和回避',
          '即使是熟悉的社交场合也难以完全放松'
        ],
        '回避行为程度': [
          '经常找各种理由推脱社交邀约',
          '宁愿独自承受孤独，也不愿面对社交焦虑',
          '生活圈越来越小，活动范围逐渐受限'
        ],
        '预期焦虑强度': [
          '社交前几天就开始焦虑，脑海中反复预演各种"糟糕"场景',
          '越临近社交时刻，焦虑感越强烈，甚至影响睡眠',
          '花大量时间准备对话内容，追求"完美"表现'
        ],
        '负面评价恐惧': [
          '极度在意他人的眼光，总觉得自己被评判',
          '一个微小的负面反馈都会反复回想，放大解读',
          '为了避免被差评，宁愿不表达真实的自己'
        ],
        '社交后反刍': [
          '社交结束后会长时间回想细节，自我批判',
          '对自己说过的每句话都进行"复盘"和懊悔',
          '即使社交客观上很成功，也难以摆脱负面回忆'
        ],
        '功能损害程度': [
          `社交焦虑已明显影响${basicInfo.occupation === 'student' ? '学业' : '工作'}和人际关系`,
          '因为回避社交，错过了很多重要机会',
          '生活质量明显下降，感到孤立和无助'
        ]
      }
      
      const pool = featureMap[dim.name] || []
      if (pool[index]) {
        features.push(pool[index])
      }
    })
    
    // 如果情绪模式极端，添加特殊特征
    if (emotionPattern.isExtreme) {
      features.push('在多数社交场景中都体验到极高强度的焦虑')
    }
    
    return features.slice(0, 5) // 最多5条
  }
  
  /**
   * 生成心理根源分析
   */
  function generateRootCauses(pattern, basicInfo) {
    const { dominantDim, emotionPattern } = pattern
    
    const causesMap = {
      '社交场景恐惧': [
        { 
          title: '泛化的恐惧条件反射', 
          desc: '可能源于过往某次负面社交经历，大脑将这种恐惧泛化到了更多场景，形成了"社交=危险"的错误关联。' 
        },
        { 
          title: '安全感阈值过低', 
          desc: '在成长过程中缺乏足够的安全依恋，导致对环境变化和他人反应异常敏感，始终处于高度警觉状态。' 
        }
      ],
      '回避行为程度': [
        { 
          title: '负强化的恶性循环', 
          desc: '每次回避社交后短期内焦虑下降，这种"解脱感"强化了回避行为，但长期却让恐惧更加根深蒂固。' 
        },
        { 
          title: '自我保护的过度防御', 
          desc: '内心深处害怕被拒绝和伤害，用回避构建了一道"安全墙"，但也切断了与外界的连接。' 
        }
      ],
      '预期焦虑强度': [
        { 
          title: '完美主义与控制欲', 
          desc: '希望通过充分准备控制社交的每个细节，但社交本质上是不可控的，这种矛盾产生巨大焦虑。' 
        },
        { 
          title: '对不确定性的不耐受', 
          desc: '无法接受"不知道会发生什么"的状态，大脑通过预演来制造"确定感"，但反而加剧了焦虑。' 
        }
      ],
      '负面评价恐惧': [
        { 
          title: '自我价值外化', 
          desc: '将自我价值完全建立在他人的评价之上，缺乏稳定的内在价值感，导致对外部评价极度敏感。' 
        },
        { 
          title: '童年批判性环境', 
          desc: `可能在${basicInfo.age === 'teen' || basicInfo.age === 'college' ? '成长' : '童年'}过程中经历过严苛的批评或嘲笑，形成了"我不够好"的核心信念。` 
        }
      ],
      '社交后反刍': [
        { 
          title: '自我苛责的思维模式', 
          desc: '习惯用放大镜看自己的缺点，对自己的要求远高于对他人，无法原谅自己的不完美。' 
        },
        { 
          title: '未完成的情绪加工', 
          desc: '社交中的焦虑没有得到充分释放，事后通过反刍来"消化"，但这种方式反而让焦虑持续存在。' 
        }
      ],
      '功能损害程度': [
        { 
          title: '长期回避的累积效应', 
          desc: '长期的社交回避导致社交技能退化，信心下降，形成"越回避越不会→越不会越回避"的恶性循环。' 
        },
        { 
          title: '支持系统的缺失', 
          desc: '缺乏有效的社会支持网络，在面对困难时无人倾诉，孤独感和无助感不断累积。' 
        }
      ]
    }
    
    const causes = causesMap[dominantDim.name] || [
      { title: '多因素综合作用', desc: '社交焦虑往往是性格、成长环境、生活经历等多方面因素共同作用的结果。' }
    ]
    
    // 根据情绪模式添加额外原因
    if (emotionPattern.isExtreme) {
      causes.push({
        title: '神经系统高敏感性',
        desc: '你可能天生具有更敏感的神经系统，对环境刺激的反应更强烈，这不是缺陷，而是一种特质。'
      })
    }
    
    return causes.slice(0, 3) // 最多3条
  }
  
  /**
   * 生成正向重构
   */
  function generatePositiveReframe(pattern, basicInfo) {
    const { dominantDim } = pattern
    
    const reframeMap = {
      '社交场景恐惧': `你对环境的高度敏感意味着你具有敏锐的观察力和共情能力。这种特质在合适的环境下，能让你成为更体贴、更善解人意的${basicInfo.occupation === 'student' ? '同学' : '伙伴'}。学会接纳这份敏感，它会成为你的优势。`,
      '回避行为程度': '懂得保护自己不是软弱，而是自我关怀的表现。现在需要的是在保护和探索之间找到平衡，从最小的一步开始，你会发现社交没有想象中那么可怕。',
      '预期焦虑强度': '你的预演能力说明你有很强的计划性和责任心。将这种能力用对地方——不是预想灾难，而是准备应对策略，你会发现自己其实很有掌控力。',
      '负面评价恐惧': '对他人感受的敏感让你拥有高度的同理心和人际洞察力。当你学会将这份关注从"他们怎么看我"转向"我们如何连接"时，这会成为建立深度关系的宝贵资源。',
      '社交后反刍': '你的反思能力说明你追求成长和进步。试着将事后的反刍转化为建设性的总结，记录做得好的部分而非只盯着错误，你会看到真实的进步。',
      '功能损害程度': '意识到问题本身就是改变的开始。你的情况需要专业支持，但这不代表失败——寻求帮助是勇气的体现。很多人通过系统的干预，重新找回了生活的掌控感。'
    }
    
    return reframeMap[dominantDim.name] || '每个人都有自己的节奏，社交焦虑不是性格缺陷，而是可以改善的困扰。温柔地对待自己，一点点地往前走，你会看到变化。'
  }
  
  /**
   * 哈希基本信息（用于生成稳定的随机选择）
   */
  function hashBasicInfo(basicInfo) {
    const str = JSON.stringify(basicInfo)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i)
      hash = hash & hash
    }
    return Math.abs(hash)
  }
  
  /**
   * 辅助函数：标签转换
   */
  function getAgeLabel(age) {
    const map = {
      'teen': '12-17岁（青少年）',
      'college': '18-22岁（大学生）',
      'young_adult': '23-29岁（青年）',
      'adult': '30-39岁（中年）',
      'mature': '40岁以上（成熟期）'
    }
    return map[age] || '未知'
  }
  
  function getGenderLabel(gender) {
    const map = { 'male': '男', 'female': '女', 'other': '其他' }
    return map[gender] || '未知'
  }
  
  function getOccupationLabel(occupation) {
    const map = {
      'student': '学生',
      'employee': '职场人',
      'freelancer': '自由职业',
      'entrepreneur': '创业者',
      'unemployed': '待业',
      'other': '其他'
    }
    return map[occupation] || '未知'
  }
  
  function getFrequencyLabel(freq) {
    const map = {
      'rarely': '几乎不参加',
      'occasional': '1-2次/周',
      'regular': '3-4次/周',
      'frequent': '5次以上/周'
    }
    return map[freq] || '未知'
  }
  
  export default {
    generatePersonalizedAnalysis,
    generateEnhancedAnalysis
  }
  