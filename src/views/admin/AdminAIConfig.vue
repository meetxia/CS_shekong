<template>
  <div class="card">
    <div class="page-header">
      <div>
        <h3 class="text-title" style="margin-bottom: 4px">🤖 AI供应商配置</h3>
        <p class="page-subtitle">管理和切换AI服务供应商</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreate">
          <span class="btn-icon">➕</span>
          <span class="btn-text">添加供应商</span>
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 配置列表 -->
    <div v-else class="config-list">
      <div v-for="config in configs" :key="config.id" class="config-card" :class="{ active: config.is_active }">
        <div class="config-header">
          <div class="config-info">
            <div class="provider-name">
              <span class="provider-icon">{{ getProviderIcon(config.provider) }}</span>
              <span class="provider-text">{{ getProviderName(config.provider) }}</span>
              <span v-if="config.is_active" class="active-badge">当前使用</span>
            </div>
            <div class="model-name">{{ config.model }}</div>
          </div>
          <div class="config-actions">
            <button v-if="!config.is_active" class="btn btn-sm btn-primary" @click="activate(config)">
              切换使用
            </button>
            <button class="btn btn-sm btn-secondary" @click="testConfig(config)">
              测试连接
            </button>
            <button class="btn btn-sm btn-secondary" @click="openEdit(config)">
              编辑
            </button>
            <button v-if="!config.is_active" class="btn btn-sm btn-danger" @click="remove(config)">
              删除
            </button>
          </div>
        </div>
        
        <div class="config-details">
          <div class="detail-item">
            <span class="detail-label">API地址:</span>
            <span class="detail-value">{{ config.api_url }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">API密钥:</span>
            <span class="detail-value">{{ maskApiKey(config.api_key) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">参数配置:</span>
            <span class="detail-value">
              max_tokens: {{ config.max_tokens }}, 
              temperature: {{ config.temperature }}, 
              timeout: {{ config.timeout }}ms
            </span>
          </div>
          <div v-if="config.notes" class="detail-item">
            <span class="detail-label">备注:</span>
            <span class="detail-value">{{ config.notes }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑/创建模态框 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h4>{{ editing ? '编辑AI配置' : '添加AI供应商' }}</h4>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body">
          <div class="form-field">
            <label class="field-label">供应商</label>
            <select v-model="form.provider" class="input-modern" :disabled="editing">
              <option value="claude">Claude (Anthropic)</option>
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
              <option value="qwen">通义千问</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div class="form-field">
            <label class="field-label">API密钥</label>
            <input v-model="form.api_key" type="text" class="input-modern" placeholder="sk-..." />
          </div>

          <div class="form-field">
            <label class="field-label">API地址</label>
            <input v-model="form.api_url" type="text" class="input-modern" placeholder="https://..." />
          </div>

          <div class="form-field">
            <label class="field-label">模型名称</label>
            <input v-model="form.model" type="text" class="input-modern" placeholder="例如: claude-4.5-sonnet" />
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="field-label">最大Tokens</label>
              <input v-model.number="form.max_tokens" type="number" class="input-modern" />
            </div>
            <div class="form-field">
              <label class="field-label">温度参数</label>
              <input v-model.number="form.temperature" type="number" step="0.1" class="input-modern" />
            </div>
            <div class="form-field">
              <label class="field-label">超时(ms)</label>
              <input v-model.number="form.timeout" type="number" class="input-modern" />
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">备注</label>
            <textarea v-model="form.notes" class="input-modern" rows="3" placeholder="可选"></textarea>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAIConfigs, createAIConfig, updateAIConfig, activateAIConfig, deleteAIConfig, testAIConnection } from '@/utils/aiConfigApi'

const loading = ref(false)
const configs = ref([])
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const error = ref('')
const currentId = ref(null)

const form = ref({
  provider: 'deepseek',
  api_key: '',
  api_url: '',
  model: '',
  max_tokens: 2000,
  temperature: 0.7,
  timeout: 30000,
  notes: ''
})

onMounted(() => {
  loadConfigs()
})

async function loadConfigs() {
  loading.value = true
  try {
    const result = await getAIConfigs()
    if (result.success) {
      configs.value = result.data
    }
  } catch (err) {
    console.error('加载配置失败:', err)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = false
  currentId.value = null
  form.value = {
    provider: 'deepseek',
    api_key: '',
    api_url: 'https://api.siliconflow.cn/v1/chat/completions',
    model: 'deepseek-ai/DeepSeek-V3',
    max_tokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    notes: ''
  }
  error.value = ''
  showModal.value = true
}

function openEdit(config) {
  editing.value = true
  currentId.value = config.id
  form.value = {
    provider: config.provider,
    api_key: config.api_key,
    api_url: config.api_url,
    model: config.model,
    max_tokens: config.max_tokens,
    temperature: config.temperature,
    timeout: config.timeout,
    notes: config.notes || ''
  }
  error.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function save() {
  if (!form.value.api_key || !form.value.api_url || !form.value.model) {
    error.value = '请填写必填项'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const result = editing.value
      ? await updateAIConfig(currentId.value, form.value)
      : await createAIConfig(form.value)

    if (result.success) {
      closeModal()
      loadConfigs()
    } else {
      error.value = result.error || '保存失败'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

async function activate(config) {
  if (!confirm(`确认切换到 ${getProviderName(config.provider)} 吗？`)) return

  try {
    const result = await activateAIConfig(config.id)
    if (result.success) {
      loadConfigs()
    } else {
      alert('切换失败: ' + result.error)
    }
  } catch (err) {
    alert('切换失败: ' + err.message)
  }
}

async function remove(config) {
  if (!confirm(`确认删除 ${getProviderName(config.provider)} 配置吗？`)) return

  try {
    const result = await deleteAIConfig(config.id)
    if (result.success) {
      loadConfigs()
    } else {
      alert('删除失败: ' + result.error)
    }
  } catch (err) {
    alert('删除失败: ' + err.message)
  }
}

async function testConfig(config) {
  const btn = event.target
  btn.disabled = true
  btn.textContent = '测试中...'

  try {
    const result = await testAIConnection(config)
    if (result.success) {
      alert('✅ 测试成功！\n\nAI回复: ' + result.response)
    } else {
      alert('❌ 测试失败: ' + result.error)
    }
  } catch (err) {
    alert('❌ 测试失败: ' + err.message)
  } finally {
    btn.disabled = false
    btn.textContent = '测试连接'
  }
}

function getProviderName(provider) {
  const names = {
    claude: 'Claude (Anthropic)',
    deepseek: 'DeepSeek',
    openai: 'OpenAI',
    qwen: '通义千问',
    other: '其他'
  }
  return names[provider] || provider
}

function getProviderIcon(provider) {
  const icons = {
    claude: '🧠',
    deepseek: '🔮',
    openai: '🤖',
    qwen: '💬',
    other: '⚙️'
  }
  return icons[provider] || '🤖'
}

function maskApiKey(key) {
  if (!key) return ''
  if (key.length <= 10) return '***'
  return key.substring(0, 10) + '...' + key.substring(key.length - 4)
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-card {
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  background: var(--bg-section);
  transition: all 0.2s;
}

.config-card.active {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.config-info {
  flex: 1;
}

.provider-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.provider-icon {
  font-size: 24px;
}

.provider-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-title);
}

.active-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--primary);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.model-name {
  color: var(--text-secondary);
  font-size: 14px;
  font-family: 'Courier New', monospace;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.config-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.detail-item {
  display: flex;
  gap: 12px;
  font-size: 14px;
}

.detail-label {
  color: var(--text-secondary);
  min-width: 80px;
  font-weight: 500;
}

.detail-value {
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.error-message {
  padding: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions button {
    flex: 1;
  }

  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .config-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .config-actions button {
    flex: 1;
    min-width: 80px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

