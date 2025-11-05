/**
 * AI生成服务 - 根据用户答题生成个性化社恐类型分析
 */

// 导入题目数据
import { questions } from '@/data/questions.js'

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
  
  // 构建答题模式分析（包含题目内容和用户选择）
  const highScoreQuestions = Object.entries(answers)
    .filter(([id, score]) => score >= 4 && Number(id) <= 33)
    .map(([id]) => `Q${id}`)
    .join(', ')
  
  // 构建详细答题记录（包含题目和用户选择的选项）
  const answerDetails = buildAnswerDetails(answers)
  
  const prompt = `你是一位温暖、善解人意的心理陪伴者，就像用户最信任的朋友或贴心的心理咨询师。你的任务是用最温暖、最通俗的语言，帮助用户理解自己的社交焦虑模式。

【重要：语言风格要求】
🎯 **核心原则：像朋友聊天，不是写专业报告**
- 想象你正在和一位好朋友面对面聊天，用日常对话的语气
- 完全避免心理学术语（如"障碍"、"症状"、"病理"、"认知偏差"等）
- 用生活化的比喻和场景来解释，而不是理论概念
- 让用户感到"被看见"、"被理解"，而不是"被诊断"
- 语气要温柔、接纳、充满希望，像在说"我懂你的感受"

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

【用户答题详情】
以下是用户在关键题目上的具体选择，请深入理解这些具体场景：

${answerDetails}

【任务要求】
请生成以下内容（JSON格式）：

1. **个性化类型名称**（15字以内，要新颖、精准、让人一看就有共鸣）
   - 用生动的比喻或形象的描述，不要用专业术语
   - 示例："脑内彩排一百遍星人"、"社交电池秒没电型"、"人群中的隐形人"
   - 要让用户看到后会心一笑，觉得"这就是我啊！"

2. **英文名称**（简洁优雅即可）

3. **核心特征**（3-5条，每条用最日常的语言描述）
   ✨ **语言风格示例：**
   - ❌ 不要写："在社交场景中表现出显著的预期焦虑"
   - ✅ 要写："还没到聚会现场，你就已经在脑子里把可能发生的尴尬场景演了一遍又一遍"

   - ❌ 不要写："对负面评价具有高度敏感性"
   - ✅ 要写："别人一个不经意的眼神，你都能脑补出一部'他是不是觉得我很奇怪'的连续剧"

   - 每条特征要像在对朋友说"我发现你有个特点..."
   - 用具体的场景和细节，而不是抽象的概念
   - 让用户读完会想"天哪，你怎么这么懂我！"

4. **为什么会这样**（2-3个原因，每个包含标题和说明）
   ⚠️ **注意：不要叫"心理根源"，这太专业了！**

   ✨ **标题要求**（8-12字）：
   - 用温柔、理解的语气，像在说"我理解你为什么会这样"
   - 示例："你只是太想做到完美"、"小时候的经历在影响你"、"你的大脑太善于保护你了"

   ✨ **说明要求**（50-80字）：
   - 完全不要用心理学术语！
   - 用生活化的比喻来解释
   - 示例：
     ❌ 不要写："这源于负强化机制导致的回避行为固化"
     ✅ 要写："就像你小时候被狗吓过一次，之后见到狗都会绕道走。每次你逃避社交，短期内确实轻松了，但大脑就记住了'逃避=安全'这个公式，下次就更想逃了。"

   - 让用户感到被理解，而不是被分析
   - 语气要像朋友在说"其实啊，你会这样是因为..."

5. **换个角度看自己**（60-80字）
   ⚠️ **不要叫"正向重构"，太专业！**

   ✨ **语言风格要求：**
   - 像朋友在鼓励你："你知道吗，你这个特点其实也有好的一面"
   - 真诚地指出这些特质的积极面，不要空洞的鸡汤
   - 给予具体的希望，而不是泛泛的安慰
   - 示例：
     ❌ 不要写："你的高敏感性可以转化为共情能力优势"
     ✅ 要写："你对别人情绪的敏感，其实说明你是个很细腻、很会照顾别人感受的人。这种特质用对地方，会让你成为朋友圈里最温暖、最懂人心的那个人。"

【语言风格总结 - 请务必遵守】
✅ 要用的表达：
- "你是不是经常..."、"每次...的时候"
- "就像..."（用比喻）
- "其实啊..."、"你知道吗..."
- "我懂那种感觉..."
- 具体的场景描述

❌ 绝对不要用的词汇：
- 障碍、症状、病理、疾病
- 认知偏差、负强化、泛化
- 功能损害、临床表现
- 任何教科书式的专业术语

【特殊情况处理】
- 如果总分很高（>80），要温柔地建议寻求专业帮助，但不要吓唬用户
- 用"找个专业的心理咨询师聊聊，可能会帮到你"，而不是"需要临床干预"

【输出格式】
请严格按照以下JSON格式输出，不要有任何其他文字：

{
  "typeName": "你的个性化类型名称",
  "englishName": "Personalized Type Name",
  "features": [
    "核心特征1（用日常语言，像朋友在说话）",
    "核心特征2",
    "核心特征3"
  ],
  "rootCauses": [
    {
      "title": "原因1标题（温柔、理解的语气）",
      "desc": "原因1说明（生活化的比喻，完全不用术语）"
    },
    {
      "title": "原因2标题",
      "desc": "原因2说明"
    }
  ],
  "positiveReframe": "换个角度看自己的内容（像朋友在鼓励你）"
}`
  
    return prompt
  }
  
/**
 * 调用AI API生成分析
 */
export async function generatePersonalizedAnalysis(report, answers, basicInfo) {
  const startTime = Date.now()
  
  // 如果没有配置API Key，返回默认分析
  if (!AI_CONFIG.apiKey) {
    console.log('📝 [AI服务] 未配置API Key，将使用本地增强规则')
    return null
  }

  try {
    console.log('🚀 [AI服务] 开始调用AI API...')
    console.log(`📡 [AI服务] API地址: ${AI_CONFIG.apiUrl}`)
    console.log(`🤖 [AI服务] 模型: ${AI_CONFIG.model}`)
    console.log(`⏱️  [AI服务] 超时设置: ${AI_CONFIG.timeout}ms`)
    
    const prompt = buildPrompt(report, answers, basicInfo)
    console.log(`📝 [AI服务] 提示词长度: ${prompt.length} 字符`)
    console.log(`📊 [AI服务] 用户答题详情: ${Object.keys(answers).length} 个答案`)
    
    // 调用Claude API（通过dpapi.cn中转）
    // 创建超时控制器（兼容性更好）
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log('⏰ [AI服务] 请求超时，正在中断...')
      controller.abort()
    }, AI_CONFIG.timeout)
    
    try {
      console.log('📤 [AI服务] 正在发送请求...')
      console.log(`🔑 [AI服务] API Key (前10位): ${AI_CONFIG.apiKey.substring(0, 10)}...`)
      
      const response = await fetch(AI_CONFIG.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_CONFIG.apiKey}`  // ✅ 使用完整的API Key
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: '你是一位温暖、善解人意的心理陪伴者，像用户最信任的朋友。你用最通俗易懂、最有温度的语言帮助人们理解自己，从不使用冰冷的专业术语，而是用生活化的比喻和真诚的共情让人感到被理解、被接纳。'
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
      const responseTime = Date.now() - startTime
      
      console.log(`📥 [AI服务] 收到响应 (耗时: ${responseTime}ms)`)
      console.log(`📊 [AI服务] 响应状态: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ [AI服务] API错误: ${response.status}`)
        console.error(`📄 [AI服务] 错误详情: ${errorText}`)
        throw new Error(`AI API错误: ${response.status} - ${errorText}`)
      }
  
      const data = await response.json()
      console.log('✅ [AI服务] JSON解析成功')
      console.log(`📦 [AI服务] 返回数据:`, JSON.stringify(data).substring(0, 200) + '...')
      
      // 解析AI返回的JSON（Claude API格式）
      const aiResponse = data.choices?.[0]?.message?.content || ''
      console.log(`💬 [AI服务] AI回复长度: ${aiResponse.length} 字符`)
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        console.error('❌ [AI服务] AI返回格式错误，无法提取JSON')
        console.error(`📄 [AI服务] AI原始回复:`, aiResponse.substring(0, 500))
        throw new Error('AI返回格式错误')
      }
      
      console.log('🔍 [AI服务] 正在解析AI返回的JSON...')
      const analysis = JSON.parse(jsonMatch[0])
      
      // 验证必要字段
      if (!analysis.typeName || !analysis.features || !analysis.rootCauses) {
        console.error('❌ [AI服务] AI返回数据不完整')
        console.error('📄 [AI服务] 缺失字段:', {
          hasTypeName: !!analysis.typeName,
          hasFeatures: !!analysis.features,
          hasRootCauses: !!analysis.rootCauses
        })
        throw new Error('AI返回数据不完整')
      }
      
      const totalTime = Date.now() - startTime
      console.log(`🎉 [AI服务] AI分析成功！ (总耗时: ${totalTime}ms)`)
      console.log(`📝 [AI服务] 生成的类型: ${analysis.typeName}`)
      console.log(`✨ [AI服务] 特征数量: ${analysis.features.length}`)
  
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
      console.warn('🌐 [AI服务] 网络请求失败，请检查网络连接')
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.warn('🔑 [AI服务] API Key无效或权限不足')
    } else if (error.message.includes('429')) {
      console.warn('⚠️ [AI服务] API调用频率超限或额度不足')
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
  
/**
 * 构建详细答题记录
 */
function buildAnswerDetails(answers) {
  console.log('📝 [AI服务] 构建答题详情...')
  console.log(`📊 [AI服务] 原始答案数量: ${Object.keys(answers).length}`)
  
  // 只选择分数较高（>=3）的题目，避免信息过载
  const significantAnswers = Object.entries(answers)
    .filter(([id, score]) => {
      const qid = Number(id)
      return score >= 3 && qid >= 1 && qid <= 33  // 只看测评题，不看基础信息题
    })
    .map(([id, score]) => {
      const qid = Number(id)
      const question = questions.find(q => q.id === qid)
      
      if (!question) {
        console.warn(`⚠️ [AI服务] 找不到题目 Q${qid}`)
        return null
      }
      
      // 找到用户选择的选项
      const selectedOption = question.options.find(opt => opt.score === score)
      
      return {
        id: qid,
        question: question.question,
        userChoice: selectedOption ? selectedOption.text : '未知选项',
        score
      }
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score) // 按分数从高到低排序
    .slice(0, 12)  // 最多显示12个最有代表性的题目，避免token过多
  
  console.log(`📊 [AI服务] 筛选后的高焦虑题目: ${significantAnswers.length} 个`)
  
  if (significantAnswers.length === 0) {
    console.log('ℹ️ [AI服务] 用户所有题目焦虑程度都较低')
    return '用户在所有题目上的焦虑程度都较低。'
  }
  
  const result = significantAnswers
    .map(item => `Q${item.id}. ${item.question}\n   用户选择：${item.userChoice} (焦虑程度: ${item.score}/5)`)
    .join('\n\n')
  
  console.log(`✅ [AI服务] 答题详情构建完成，包含 ${significantAnswers.length} 个题目`)
  
  return result
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
  