# 使用 Supabase Edge Functions 实现 AI 接口

## 🎯 方案概述

使用 Supabase Edge Functions 作为中转，调用 Claude AI API，完美解决跨域问题！

## 📐 架构图

```
前端 (Vue)
    ↓ HTTP请求
Supabase Edge Function (云端，无跨域问题)
    ↓ 调用API
Claude AI API (dpapi.cn)
    ↓ 返回结果
前端接收AI生成的分析
```

## 🔧 实现步骤

### 1. 创建 Supabase Edge Function

在你的Supabase项目中创建Edge Function：

```bash
# 初始化 Supabase CLI（如果还没安装）
npm install -g supabase

# 登录
supabase login

# 关联你的项目
supabase link --project-ref your-project-ref

# 创建 Edge Function
supabase functions new generate-ai-analysis
```

### 2. Edge Function 代码

创建文件：`supabase/functions/generate-ai-analysis/index.ts`

```typescript
// supabase/functions/generate-ai-analysis/index.ts
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
    
    // 构建 AI 提示词
    const prompt = buildPrompt(report, answers, basicInfo)
    
    // 调用 Claude AI API
    const AI_API_KEY = Deno.env.get('CLAUDE_API_KEY')
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
      throw new Error(`AI API错误: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || ''
    
    // 解析 JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('AI返回格式错误')
    }

    const analysis = JSON.parse(jsonMatch[0])
    
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

  } catch (error) {
    console.error('Edge Function错误:', error)
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

// 构建提示词的函数（与前端相同）
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
2. 英文名称（体现专业性）
3. 核心特征（3-5条，每条20-30字）
4. 心理根源分析（2-3个维度，每个包含标题和详细说明）
5. 正向重构（60-80字）

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
```

### 3. CORS 配置文件

创建文件：`supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

### 4. 设置环境变量

在 Supabase Dashboard 中设置环境变量：

```bash
# 在 Project Settings -> Edge Functions -> Secrets 中添加：
CLAUDE_API_KEY=sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657
```

### 5. 部署 Edge Function

```bash
# 部署到 Supabase
supabase functions deploy generate-ai-analysis
```

部署成功后，你会得到一个 URL：
```
https://your-project-ref.supabase.co/functions/v1/generate-ai-analysis
```

### 6. 修改前端代码

修改 `src/utils/aiService.js`：

```javascript
/**
 * 调用Supabase Edge Function生成分析
 */
export async function generatePersonalizedAnalysis(report, answers, basicInfo) {
  // 获取Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    console.warn('未配置Supabase URL，使用本地规则')
    return null
  }

  try {
    console.log('🚀 调用Supabase Edge Function生成AI分析...')
    
    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-ai-analysis`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ report, answers, basicInfo })
      }
    )

    if (!response.ok) {
      throw new Error(`Edge Function错误: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Edge Function返回失败')
    }

    console.log('✅ AI分析生成成功')
    return result.data

  } catch (error) {
    console.error('AI生成失败:', error)
    return null
  }
}
```

### 7. 启用AI功能

修改 `src/utils/scoring.js`，取消注释AI生成代码：

```javascript
// 从
// 🤖 使用本地增强规则生成个性化分析（稳定可靠方案）
console.log('🎯 使用本地增强规则生成个性化分析...')
const enhancedType = generateEnhancedAnalysis(baseReport, answers, basicInfo)

// 改为
// 🤖 尝试使用AI生成，失败则使用本地规则
try {
  console.log('🤖 正在使用AI生成个性化社恐类型分析...')
  const aiType = await generatePersonalizedAnalysis(baseReport, answers, basicInfo)
  
  if (aiType) {
    console.log('✅ AI生成成功，使用AI个性化分析')
    type = aiType
    baseReport.type = aiType
    baseReport.aiGenerated = true
  } else {
    // AI失败，使用本地增强规则
    const enhancedType = generateEnhancedAnalysis(baseReport, answers, basicInfo)
    type = enhancedType
    baseReport.type = enhancedType
    baseReport.aiGenerated = false
  }
} catch (error) {
  console.error('AI生成异常:', error)
  const enhancedType = generateEnhancedAnalysis(baseReport, answers, basicInfo)
  type = enhancedType
  baseReport.type = enhancedType
  baseReport.aiGenerated = false
}
```

## ✅ 优势

1. **无跨域问题**：Edge Function在云端执行
2. **API Key安全**：不暴露在前端代码中
3. **零服务器维护**：Supabase自动管理
4. **全球分发**：Edge Function自动部署到全球节点
5. **免费额度**：Supabase提供免费的Edge Function调用

## 💰 成本

- **Supabase Edge Functions**：免费版每月50万次调用
- **Claude API**：按Token计费，约0.01元/次生成

## 🧪 测试

```bash
# 本地测试 Edge Function
supabase functions serve generate-ai-analysis

# 然后在前端调用 http://localhost:54321/functions/v1/generate-ai-analysis
```

## 📊 监控

在 Supabase Dashboard -> Edge Functions 中可以查看：
- 调用次数
- 成功率
- 响应时间
- 错误日志

## 🚀 总结

使用Supabase Edge Functions是最佳方案：
✅ 解决跨域问题
✅ API Key安全
✅ 无需维护服务器
✅ 自动扩展
✅ 全球分发
✅ 免费额度充足

**你不需要自己搭建后端服务器，Supabase已经提供了一切！**

