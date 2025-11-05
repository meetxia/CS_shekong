# Supabase AI 功能快速部署指南

## 🎯 目标

让你的AI功能通过Supabase Edge Function运行，完美解决跨域问题！

## ✅ 前置条件

1. 你已经有Supabase项目（✅ 你已经有了）
2. 已安装Node.js 16+
3. 已有API Key: `sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657`

## 📦 部署步骤

### 步骤1: 安装 Supabase CLI

```bash
npm install -g supabase
```

### 步骤2: 登录 Supabase

```bash
supabase login
```

会打开浏览器让你登录Supabase账号。

### 步骤3: 关联项目

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**如何找到 PROJECT_REF？**
- 登录 Supabase Dashboard
- 打开你的项目
- 在URL中找到，格式：`https://app.supabase.com/project/YOUR_PROJECT_REF`

### 步骤4: 设置环境变量

在 Supabase Dashboard 中：
1. 进入你的项目
2. 点击左侧 **Project Settings**
3. 点击 **Edge Functions**
4. 点击 **Secrets** 标签
5. 点击 **Add Secret**
6. 添加：
   - Name: `CLAUDE_API_KEY`
   - Value: `sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657`
7. 点击 Save

### 步骤5: 部署 Edge Function

```bash
# 在项目根目录执行
supabase functions deploy generate-ai-analysis
```

部署成功后会显示URL：
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-ai-analysis
```

### 步骤6: 测试 Edge Function

```bash
# 测试调用（替换YOUR_PROJECT_REF和YOUR_ANON_KEY）
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-ai-analysis \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "report": {
      "totalScore": 65,
      "level": {"name": "中度社交焦虑"},
      "type": {"name": "综合型社恐"},
      "dimensions": []
    },
    "answers": {},
    "basicInfo": {
      "age": "college",
      "gender": "female",
      "occupation": "student",
      "social_frequency": "occasional"
    }
  }'
```

### 步骤7: 修改前端代码

修改 `src/utils/aiService.js`，将整个 `generatePersonalizedAnalysis` 函数替换为：

```javascript
/**
 * 调用Supabase Edge Function生成分析
 */
export async function generatePersonalizedAnalysis(report, answers, basicInfo) {
  // 获取Supabase配置
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('未配置Supabase，使用本地规则')
    return null
  }

  try {
    console.log('🚀 调用Supabase Edge Function生成AI分析...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)
    
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/generate-ai-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ report, answers, basicInfo }),
          signal: controller.signal
        }
      )
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Edge Function错误: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Edge Function返回失败')
      }

      console.log('✅ AI分析生成成功')
      return result.data

    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }

  } catch (error) {
    console.error('AI生成失败:', error)
    if (error.name === 'AbortError') {
      console.warn('AI生成超时，将使用本地增强规则')
    }
    return null
  }
}
```

### 步骤8: 启用AI功能

修改 `src/utils/scoring.js`，找到这段代码并取消注释：

```javascript
// 🤖 使用本地增强规则生成个性化分析（稳定可靠方案）
console.log('🎯 使用本地增强规则生成个性化分析...')
const enhancedType = generateEnhancedAnalysis(baseReport, answers, basicInfo)
type = enhancedType
baseReport.type = enhancedType
baseReport.aiGenerated = false // 标记为本地生成

// 💡 如果你有后端服务，可以取消注释下面的代码启用AI生成
/*
try {
  console.log('🤖 正在使用AI生成个性化社恐类型分析...')
  const aiType = await generatePersonalizedAnalysis(baseReport, answers, basicInfo)
  
  if (aiType) {
    console.log('✅ AI生成成功，使用AI个性化分析')
    type = aiType
    baseReport.type = aiType
    baseReport.aiGenerated = true
  }
} catch (error) {
  console.error('AI生成异常:', error)
  // 保持使用本地增强规则
}
*/
```

**改为：**

```javascript
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
    console.log('⚠️ AI生成失败，使用本地增强规则')
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

### 步骤9: 更新报告页面标识

修改 `src/views/ReportPage.vue`，把：

```vue
<span class="enhanced-badge" title="基于答题模式深度分析">✨ 个性化分析</span>
```

改为：

```vue
<span v-if="report.aiGenerated" class="ai-badge" title="由AI深度分析生成">🤖 AI智能分析</span>
<span v-else class="enhanced-badge" title="基于答题模式深度分析">✨ 个性化分析</span>
```

### 步骤10: 测试

```bash
npm run dev
```

然后进行一次完整的测评，在第33题时观察控制台：

- 应该看到：`🚀 调用Supabase Edge Function生成AI分析...`
- 3-5秒后看到：`✅ AI分析生成成功`
- 提交后报告显示：`🤖 AI智能分析`

## 🎉 完成！

现在你的AI功能已经通过Supabase Edge Function运行了，再也不会有跨域问题！

## 📊 监控

在 Supabase Dashboard -> Edge Functions 中可以查看：
- 调用次数
- 成功率
- 响应时间
- 错误日志

## 💰 成本

- **Supabase Edge Functions**: 免费版每月50万次调用
- **Claude API**: 约0.01-0.02元/次

## ⚠️ 故障排查

### 问题1: 部署失败

```bash
# 确保已登录
supabase login

# 确保已关联项目
supabase link --project-ref YOUR_PROJECT_REF

# 查看日志
supabase functions logs generate-ai-analysis
```

### 问题2: 调用返回401

- 检查 `VITE_SUPABASE_ANON_KEY` 是否正确
- 检查Edge Function是否已部署

### 问题3: 调用返回500

- 在Supabase Dashboard查看Edge Function日志
- 检查是否设置了`CLAUDE_API_KEY`环境变量

### 问题4: AI返回格式错误

- 检查Claude API返回的内容
- 可能需要调整提示词

## 🚀 下一步

1. **监控性能**: 观察AI生成的成功率和响应时间
2. **优化提示词**: 根据用户反馈调整提示词
3. **成本控制**: 如果调用量大，考虑添加缓存机制

---

**恭喜！你的AI功能现在完全可用了！** 🎊

