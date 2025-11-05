// Supabase Edge Function: AI个性化分析生成
// Deploy: supabase functions deploy generate-ai-analysis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 获取请求数据
    const { report, answers, basicInfo } = await req.json()
    
    console.log('收到AI分析请求，总分:', report.totalScore)
    
    // 构建 AI 提示词
    const prompt = buildPrompt(report, answers, basicInfo)
    
    // 调用 Claude AI API
    const AI_API_KEY = Deno.env.get('CLAUDE_API_KEY')
    if (!AI_API_KEY) {
      throw new Error('未配置CLAUDE_API_KEY环境变量')
    }
    
    console.log('调用Claude AI API...')
    const response = await fetch('https://dpapi.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-4.5-sonnet',
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
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API错误:', response.status, errorText)
      throw new Error(`AI API错误: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || ''
    
    console.log('AI返回内容长度:', aiResponse.length)
    
    // 解析 JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('AI返回格式错误，无法提取JSON')
      throw new Error('AI返回格式错误')
    }

    const analysis = JSON.parse(jsonMatch[0])
    
    // 验证必要字段
    if (!analysis.typeName || !analysis.features || !analysis.rootCauses) {
      console.error('AI返回数据不完整')
      throw new Error('AI返回数据不完整')
    }
    
    console.log('AI分析生成成功，类型:', analysis.typeName)
    
    // 返回结果
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          id: 'ai_generated',
          name: analysis.typeName,
          englishName: analysis.englishName || 'AI Generated Type',
          features: analysis.features,
          rootCauses: analysis.rootCauses,
          positiveReframe: analysis.positiveReframe
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Edge Function错误:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// ==================== 辅助函数 ====================

function buildPrompt(report: any, answers: any, basicInfo: any) {
  const { totalScore, dimensions, type } = report
  
  const dimensionDesc = dimensions.map((d: any) => 
    `${d.name}: ${d.score}/${d.maxScore} (${d.percentage}%) - ${d.level.level}`
  ).join('\n')
  
  const highScoreQuestions = Object.entries(answers)
    .filter(([id, score]: [string, any]) => score >= 4 && Number(id) <= 33)
    .map(([id]) => `Q${id}`)
    .join(', ')
  
  return `你是一位专业的心理咨询师，擅长社交焦虑障碍的评估。请根据以下测评数据，为用户生成一份深度个性化的社恐类型分析报告。

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

1. 个性化社恐类型名称（15字以内，要新颖、精准、有共鸣感）
   - 不要用常规词汇，要根据用户的具体表现创造一个独特的类型名
   - 示例："脑内彩排型社恐"、"完美主义表演者"、"情绪雷达过载型"

2. 英文名称（体现专业性）

3. 核心特征（3-5条，每条20-30字）
   - 要具体、形象，让用户有"这说的就是我"的感觉
   - 基于维度得分的具体表现

4. 心理根源分析（2-3个维度，每个包含标题和详细说明）
   - 标题：8-12字，点出根本原因
   - 说明：40-60字，结合心理学理论深入分析
   - 要有深度，但不要过于学术化

5. 正向重构（60-80字）
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
}

function getAgeLabel(age: string) {
  const map: any = {
    'teen': '12-17岁（青少年）',
    'college': '18-22岁（大学生）',
    'young_adult': '23-29岁（青年）',
    'adult': '30-39岁（中年）',
    'mature': '40岁以上（成熟期）'
  }
  return map[age] || '未知'
}

function getGenderLabel(gender: string) {
  const map: any = { 'male': '男', 'female': '女', 'other': '其他' }
  return map[gender] || '未知'
}

function getOccupationLabel(occupation: string) {
  const map: any = {
    'student': '学生',
    'employee': '职场人',
    'freelancer': '自由职业',
    'entrepreneur': '创业者',
    'unemployed': '待业',
    'other': '其他'
  }
  return map[occupation] || '未知'
}

function getFrequencyLabel(freq: string) {
  const map: any = {
    'rarely': '几乎不参加',
    'occasional': '1-2次/周',
    'regular': '3-4次/周',
    'frequent': '5次以上/周'
  }
  return map[freq] || '未知'
}

