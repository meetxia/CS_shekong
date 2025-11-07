/**
 * AI生成服务 - 根据用户答题生成个性化社恐类型分析
 */

/**
 * 调用后端AI API生成分析
 */
export async function generatePersonalizedAnalysis(report, answers, basicInfo) {
  const startTime = Date.now()

  try {
    // 生产环境使用空字符串（相对路径），开发环境使用完整地址
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

    console.log('🚀 [AI服务] 开始调用后端AI接口...')
    console.log(`📡 [AI服务] 后端地址: ${apiBaseUrl || '(相对路径)'}/api/ai/generate`)

    // 调用后端AI接口
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AI服务] 请求超时，正在中断...')
      controller.abort()
    }, 60000) // 60秒超时

    try {
      console.log('📤 [AI服务] 正在发送请求到后端...')

      const response = await fetch(`${apiBaseUrl}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report,
          answers,
          basicInfo,
          userId: null // 可以传入用户ID，如果有的话
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      console.log(`📥 [AI服务] 收到后端响应 (耗时: ${responseTime}ms)`)
      console.log(`📊 [AI服务] 响应状态: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '未知错误' }))
        console.error(`❌ [AI服务] 后端API错误: ${response.status}`)
        console.error(`📄 [AI服务] 错误详情:`, errorData)
        throw new Error(`后端AI API错误: ${response.status} - ${errorData.error || '未知错误'}`)
      }

      const data = await response.json()
      console.log('✅ [AI服务] JSON解析成功')

      if (!data.success) {
        console.error('❌ [AI服务] 后端返回失败')
        console.error(`📄 [AI服务] 错误信息:`, data.error)
        throw new Error(data.error || 'AI生成失败')
      }

      const analysis = data.data

      // 验证必要字段
      if (!analysis.name || !analysis.features || !analysis.rootCauses) {
        console.error('❌ [AI服务] 后端返回数据不完整')
        console.error('📄 [AI服务] 缺失字段:', {
          hasName: !!analysis.name,
          hasFeatures: !!analysis.features,
          hasRootCauses: !!analysis.rootCauses
        })
        throw new Error('后端返回数据不完整')
      }

      const totalTime = Date.now() - startTime
      console.log(`🎉 [AI服务] AI分析成功！ (总耗时: ${totalTime}ms)`)
      console.log(`📝 [AI服务] 生成的类型: ${analysis.name}`)
      console.log(`✨ [AI服务] 特征数量: ${analysis.features.length}`)

      return {
        id: analysis.id || 'ai_generated',
        name: analysis.name,
        englishName: analysis.englishName || 'AI Generated Type',
        features: analysis.features,
        rootCauses: analysis.rootCauses,
        positiveReframe: analysis.positiveReframe
      }
    } catch (fetchError) {
      clearTimeout(timeoutId)
      const errorTime = Date.now() - startTime
      console.error(`❌ [AI服务] 请求异常 (耗时: ${errorTime}ms)`)
      console.error(`📄 [AI服务] 错误详情:`, fetchError)
      throw fetchError
    }

  } catch (error) {
    const totalTime = Date.now() - startTime
    console.error(`❌ [AI服务] AI生成失败 (总耗时: ${totalTime}ms)`)
    console.error(`📄 [AI服务] 错误类型: ${error.name}`)
    console.error(`📄 [AI服务] 错误信息: ${error.message}`)
    console.error(`📄 [AI服务] 错误堆栈:`, error.stack)

    // 如果是超时错误，给出更友好的提示
    if (error.name === 'AbortError') {
      console.warn('⏰ [AI服务] AI生成超时，将使用本地增强规则')
    } else if (error.message.includes('Failed to fetch')) {
      console.warn('🌐 [AI服务] 网络请求失败，请检查后端服务是否运行')
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.warn('🔑 [AI服务] 认证失败')
    }

    console.log('🔄 [AI服务] 将使用本地增强规则生成报告')
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
  
export default {
  generatePersonalizedAnalysis,
  generateEnhancedAnalysis
}
  