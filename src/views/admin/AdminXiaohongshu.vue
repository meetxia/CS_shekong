<template>
  <div class="xiaohongshu-generator">
    <div class="page-header">
      <h2>📝 小红书文案生成器</h2>
      <p class="page-desc">使用AI快速生成社恐测评网站的推广文案</p>
    </div>

    <div class="generator-container">
      <!-- 左侧：输入区 -->
      <div class="input-section">
        <div class="card">
          <h3 class="section-title">生成设置</h3>
          
          <!-- 快捷模板 -->
          <div class="form-group">
            <label>📑 快捷模板</label>
            <div class="template-grid">
              <button
                v-for="template in templates"
                :key="template.id"
                class="template-btn"
                :class="{ active: selectedTemplate === template.id }"
                @click="selectTemplate(template)"
                :title="template.description"
              >
                {{ template.name }}
              </button>
            </div>
          </div>

          <!-- 自定义提示词 -->
          <div class="form-group">
            <label>✏️ 自定义提示词（可选）</label>
            <textarea
              v-model="userPrompt"
              class="prompt-input"
              rows="6"
              placeholder="留空则使用内置提示词。&#10;&#10;你也可以输入自定义要求，例如：&#10;- 生成一篇关于开学季的故事向笔记&#10;- 重点突出AI个性化分析功能&#10;- 面向大学新生群体"
            ></textarea>
            <div class="input-hint">💡 留空将使用选中模板的内置提示词</div>
          </div>

          <!-- 生成按钮 -->
          <button
            class="btn-generate"
            @click="generateContent"
            :disabled="isGenerating"
          >
            <span v-if="!isGenerating">✨ 生成文案</span>
            <span v-else>⏳ 生成中...</span>
          </button>

          <div v-if="errorMessage" class="error-message">
            ⚠️ {{ errorMessage }}
          </div>
        </div>

        <!-- 使用说明 -->
        <div class="card help-card">
          <h4>📖 使用说明</h4>
          <ul class="help-list">
            <li>1. 选择快捷模板或输入自定义提示词</li>
            <li>2. 点击"生成文案"按钮</li>
            <li>3. 等待AI生成（约10-30秒）</li>
            <li>4. 在右侧查看结果并一键复制</li>
            <li>5. 直接粘贴到小红书发布</li>
          </ul>
        </div>
      </div>

      <!-- 右侧：结果展示区 -->
      <div class="result-section">
        <div v-if="!generatedContent" class="empty-state">
          <div class="empty-icon">📝</div>
          <p>还没有生成内容</p>
          <p class="empty-hint">选择模板或输入提示词，然后点击生成按钮</p>
        </div>

        <div v-else class="result-content">
          <!-- 标题 -->
          <div class="result-item">
            <div class="result-header">
              <h4>📌 标题</h4>
              <button class="btn-copy" @click="copyToClipboard(generatedContent.title, 'title')">
                <span v-if="copiedField !== 'title'">📋 复制标题</span>
                <span v-else>✅ 已复制</span>
              </button>
            </div>
            <div class="result-box">
              {{ generatedContent.title }}
            </div>
          </div>

          <!-- 首屏三行 -->
          <div class="result-item" v-if="generatedContent.opening">
            <div class="result-header">
              <h4>🎯 首屏三行</h4>
              <button class="btn-copy" @click="copyToClipboard(formatOpening(generatedContent.opening), 'opening')">
                <span v-if="copiedField !== 'opening'">📋 复制</span>
                <span v-else>✅ 已复制</span>
              </button>
            </div>
            <div class="result-box">
              <div v-for="(line, index) in generatedContent.opening" :key="index" class="opening-line">
                {{ line }}
              </div>
            </div>
          </div>

          <!-- 正文 -->
          <div class="result-item">
            <div class="result-header">
              <h4>📄 正文内容</h4>
              <button class="btn-copy" @click="copyToClipboard(generatedContent.content, 'content')">
                <span v-if="copiedField !== 'content'">📋 复制正文</span>
                <span v-else>✅ 已复制</span>
              </button>
            </div>
            <div class="result-box content-box">
              {{ generatedContent.content }}
            </div>
          </div>

          <!-- CTA -->
          <div class="result-item" v-if="generatedContent.cta">
            <div class="result-header">
              <h4>📢 行动号召</h4>
              <button class="btn-copy" @click="copyToClipboard(generatedContent.cta, 'cta')">
                <span v-if="copiedField !== 'cta'">📋 复制</span>
                <span v-else>✅ 已复制</span>
              </button>
            </div>
            <div class="result-box">
              {{ generatedContent.cta }}
            </div>
          </div>

          <!-- 标签 -->
          <div class="result-item" v-if="generatedContent.tags">
            <div class="result-header">
              <h4>🏷️ 话题标签</h4>
              <button class="btn-copy" @click="copyToClipboard(formatTags(generatedContent.tags), 'tags')">
                <span v-if="copiedField !== 'tags'">📋 复制标签</span>
                <span v-else>✅ 已复制</span>
              </button>
            </div>
            <div class="result-box">
              <div class="tags-container">
                <span v-for="(tag, index) in generatedContent.tags" :key="index" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <!-- 首图建议 -->
          <div class="result-item" v-if="generatedContent.imageIdea">
            <div class="result-header">
              <h4>🎨 首图建议</h4>
            </div>
            <div class="result-box image-idea-box">
              {{ generatedContent.imageIdea }}
            </div>
          </div>

          <!-- 一键复制全部 -->
          <div class="result-item">
            <button class="btn-copy-all" @click="copyFullContent">
              <span v-if="copiedField !== 'full'">📑 一键复制完整文案</span>
              <span v-else>✅ 已复制完整文案</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// 状态
const templates = ref([])
const selectedTemplate = ref(null)
const userPrompt = ref('')
const isGenerating = ref(false)
const generatedContent = ref(null)
const errorMessage = ref('')
const copiedField = ref(null)

// 获取模板列表
onMounted(async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_BASE}/api/admin/xiaohongshu/templates`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    if (response.data.success) {
      templates.value = response.data.data
    }
  } catch (error) {
    console.error('获取模板失败:', error)
  }
})

// 选择模板
function selectTemplate(template) {
  selectedTemplate.value = template.id
  userPrompt.value = template.prompt
}

// 生成文案
async function generateContent() {
  if (isGenerating.value) return
  
  errorMessage.value = ''
  isGenerating.value = true
  generatedContent.value = null
  
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.post(
      `${API_BASE}/api/admin/xiaohongshu/generate`,
      {
        userPrompt: userPrompt.value.trim(),
        contentType: selectedTemplate.value
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 60000 // 60秒超时
      }
    )
    
    if (response.data.success) {
      generatedContent.value = response.data.data
    } else {
      errorMessage.value = response.data.error || '生成失败'
    }
  } catch (error) {
    console.error('生成文案失败:', error)
    if (error.response) {
      errorMessage.value = `生成失败: ${error.response.data?.error || error.message}`
    } else if (error.request) {
      errorMessage.value = '请求超时或网络错误，请检查后端服务是否正常'
    } else {
      errorMessage.value = error.message
    }
  } finally {
    isGenerating.value = false
  }
}

// 格式化首屏三行
function formatOpening(opening) {
  if (Array.isArray(opening)) {
    return opening.join('\n')
  }
  return opening
}

// 格式化标签
function formatTags(tags) {
  if (Array.isArray(tags)) {
    return tags.join(' ')
  }
  return tags
}

// 复制到剪贴板
async function copyToClipboard(text, field) {
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = field
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copiedField.value = field
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  }
}

// 复制完整文案
function copyFullContent() {
  const parts = []
  
  // 标题
  if (generatedContent.value.title) {
    parts.push('【标题】')
    parts.push(generatedContent.value.title)
    parts.push('')
  }
  
  // 首屏三行
  if (generatedContent.value.opening) {
    parts.push('【首屏三行】')
    parts.push(formatOpening(generatedContent.value.opening))
    parts.push('')
  }
  
  // 正文
  if (generatedContent.value.content) {
    parts.push('【正文】')
    parts.push(generatedContent.value.content)
    parts.push('')
  }
  
  // CTA
  if (generatedContent.value.cta) {
    parts.push('【行动号召】')
    parts.push(generatedContent.value.cta)
    parts.push('')
  }
  
  // 标签
  if (generatedContent.value.tags) {
    parts.push('【话题标签】')
    parts.push(formatTags(generatedContent.value.tags))
    parts.push('')
  }
  
  // 首图建议
  if (generatedContent.value.imageIdea) {
    parts.push('【首图建议】')
    parts.push(generatedContent.value.imageIdea)
  }
  
  const fullText = parts.join('\n')
  copyToClipboard(fullText, 'full')
}
</script>

<style scoped>
.xiaohongshu-generator {
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 8px;
}

.page-desc {
  color: var(--text-secondary);
  font-size: 14px;
}

.generator-container {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  align-items: start;
}

/* 左侧输入区 */
.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-title);
  margin-bottom: 12px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.template-btn {
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--bg-section);
  color: var(--text-title);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.template-btn:hover {
  border-color: var(--primary);
  background: var(--bg-card);
}

.template-btn.active {
  border-color: var(--primary);
  background: var(--primary);
  color: white;
}

.prompt-input {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  background: var(--bg-section);
  color: var(--text-title);
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.prompt-input:focus {
  outline: none;
  border-color: var(--primary);
}

.input-hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.btn-generate {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 14px;
}

.help-card h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 12px;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.help-list li {
  margin-bottom: 4px;
}

/* 右侧结果展示区 */
.result-section {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-height: 600px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 500px;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-hint {
  font-size: 14px;
  margin-top: 8px;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  border-bottom: 1px solid var(--border);
  padding-bottom: 20px;
}

.result-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.result-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-title);
  margin: 0;
}

.btn-copy {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-section);
  color: var(--text-title);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.result-box {
  padding: 12px 16px;
  background: var(--bg-section);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-title);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.content-box {
  max-height: 400px;
  overflow-y: auto;
}

.opening-line {
  margin-bottom: 8px;
}

.opening-line:last-child {
  margin-bottom: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  border-radius: 16px;
  font-size: 13px;
}

.image-idea-box {
  background: #fef3c7;
  color: #92400e;
  font-style: italic;
}

.btn-copy-all {
  width: 100%;
  padding: 14px;
  border: 2px solid var(--primary);
  border-radius: 8px;
  background: white;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-all:hover {
  background: var(--primary);
  color: white;
}

/* 响应式 */
@media (max-width: 1200px) {
  .generator-container {
    grid-template-columns: 1fr;
  }
  
  .result-section {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 20px;
  }
  
  .card {
    padding: 16px;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
  
  .result-section {
    padding: 16px;
  }
}
</style>
