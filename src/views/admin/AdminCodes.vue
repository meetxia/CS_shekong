<template>
  <div class="card">
    <div class="page-header">
      <div>
        <h3 class="text-title" style="margin-bottom: 4px">🎫 激活码管理</h3>
        <p class="page-subtitle">管理和监控所有激活码的使用情况</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openCreate">
          ➕ 新建激活码
        </button>
        <button class="btn-batch" @click="openBatch">
          📦 批量新建
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input class="input search-input" v-model="q" placeholder="搜索激活码或备注..." @keyup.enter="reload" />
      </div>
      <select class="select status-select" v-model="status" @change="reload">
        <option value="all">📊 全部状态</option>
        <option value="active">✅ 可用</option>
        <option value="expired">⏰ 已过期</option>
        <option value="revoked">🚫 已撤销</option>
        <option value="used">✔️ 已用完</option>
      </select>
      <button class="btn-refresh" @click="reload" title="刷新列表">
        🔄 刷新
      </button>
    </div>

    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>激活码</th>
            <th>状态</th>
            <th>使用情况</th>
            <th>有效天数</th>
            <th>每日上限</th>
            <th>过期时间</th>
            <th>备注</th>
            <th style="text-align: right;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>
              <code class="code-badge">{{ item.code }}</code>
            </td>
            <td>
              <span :class="['status-badge', `status-${item.status}`]">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td>
              <span class="usage-info">
                <strong>{{ item.current_uses }}</strong> / {{ item.max_uses }}
                <span class="usage-percent" :style="{ color: getUsageColor(item.current_uses, item.max_uses) }">
                  ({{ Math.round(item.current_uses / item.max_uses * 100) }}%)
                </span>
              </span>
            </td>
            <td>{{ item.validity_days }} 天</td>
            <td>{{ item.daily_limit }} 次/天</td>
            <td>{{ formatDate(item.expires_at) }}</td>
            <td>
              <span class="notes-text">{{ item.notes || '-' }}</span>
            </td>
            <td class="action-cell">
              <button class="btn-sm btn-edit" @click="openEdit(item)" title="编辑">
                ✏️
              </button>
              <button class="btn-sm btn-revoke" @click="revoke(item)" 
                      :disabled="item.status==='revoked'" title="撤销">
                🚫
              </button>
              <button class="btn-sm btn-delete" @click="remove(item)" title="删除">
                🗑️
              </button>
            </td>
          </tr>
          <tr v-if="!list.length">
            <td colspan="8" class="empty-state">
              <div class="empty-content">
                <div class="empty-icon">📭</div>
                <p class="empty-text">暂无激活码</p>
                <p class="empty-hint">点击上方按钮创建新的激活码</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pager">
      <button class="btn-pager" @click="prev" :disabled="page===1">
        ← 上一页
      </button>
      <div class="page-info">
        <span class="page-current">第 {{ page }} 页</span>
        <span class="page-separator">/</span>
        <span class="page-total">共 {{ totalPages }} 页</span>
        <span class="page-count">（{{ total }} 条记录）</span>
      </div>
      <button class="btn-pager" @click="next" :disabled="page>=totalPages">
        下一页 →
      </button>
    </div>

    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-body card" style="padding:24px; max-height: 90vh; overflow-y: auto;">
        <h4 class="text-title" style="margin-bottom: 20px; font-size: 18px;">
          {{ editing? '✏️ 编辑激活码' : '➕ 新建激活码' }}
        </h4>
        <div class="form">
          <!-- 激活码 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">激活码</span>
              <span class="label-required">*</span>
            </label>
            <div class="input-with-btn">
              <input class="input" v-model="form.code" placeholder="XXXX-XXXX-XXXX" />
              <button class="btn-generate" @click="generateNewCode" type="button" title="生成新激活码">
                🔄 随机生成
              </button>
            </div>
            <p class="field-hint">格式：4位-4位-4位，如 AB12-CD34-EF56</p>
          </div>

          <!-- 最大使用次数 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">最大使用次数</span>
              <span class="label-required">*</span>
            </label>
            <input class="input" type="number" v-model.number="form.max_uses" placeholder="例如：21" />
            <p class="field-hint">该激活码最多可以被使用多少次</p>
          </div>

          <!-- 有效天数 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">有效天数</span>
              <span class="label-required">*</span>
            </label>
            <input class="input" type="number" v-model.number="form.validity_days" placeholder="例如：7" />
            <p class="field-hint">激活后可使用的天数（从首次激活算起）</p>
          </div>

          <!-- 每日上限 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">每日使用上限</span>
              <span class="label-required">*</span>
            </label>
            <input class="input" type="number" v-model.number="form.daily_limit" placeholder="例如：3" />
            <p class="field-hint">每个用户每天最多可以使用该激活码几次</p>
          </div>

          <!-- 过期时间 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">过期时间</span>
              <span class="label-optional">（可选）</span>
            </label>
            <input class="input" v-model="form.expires_at" type="datetime-local" />
            <p class="field-hint">不填则永久有效，填写后到期自动失效</p>
          </div>

          <!-- 备注 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">备注说明</span>
              <span class="label-optional">（可选）</span>
            </label>
            <input class="input" v-model="form.notes" placeholder="例如：推广活动专用码" />
            <p class="field-hint">用于标记该激活码的用途或来源</p>
          </div>
        </div>
        <p v-if="error" class="error" style="margin-top: 12px;">❌ {{ error }}</p>
        <div class="actions" style="margin-top: 20px;">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn-primary" @click="save" :disabled="saving">
            {{ saving ? '保存中...' : '💾 保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 批量新建 -->
    <div v-if="showBatch" class="modal" @click.self="closeBatch">
      <div class="modal-body card" style="padding:24px; max-height: 90vh; overflow-y: auto;">
        <h4 class="text-title" style="margin-bottom: 20px; font-size: 18px;">
          📦 批量新建激活码
        </h4>
        <div class="form">
          <!-- 批量参数 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">📋 批量参数（默认值）</span>
              <span class="label-required">*</span>
            </label>
            <p class="field-hint" style="margin-bottom: 8px;">所有生成的激活码将使用以下参数</p>
            <div class="batch-params">
              <div class="param-item">
                <label class="param-label">最大使用次数</label>
                <input class="input" type="number" v-model.number="batchDefaults.max_uses" placeholder="21" />
              </div>
              <div class="param-item">
                <label class="param-label">有效天数</label>
                <input class="input" type="number" v-model.number="batchDefaults.validity_days" placeholder="7" />
              </div>
              <div class="param-item">
                <label class="param-label">每日上限</label>
                <input class="input" type="number" v-model.number="batchDefaults.daily_limit" placeholder="3" />
              </div>
            </div>
          </div>

          <!-- 自动生成 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">🎲 快速生成</span>
            </label>
            <div class="auto-generate-box">
              <input class="input" type="number" v-model.number="autoCount" min="1" max="1000" 
                     placeholder="输入数量" style="width:120px" />
              <span class="auto-text">个激活码</span>
              <button class="btn-generate" @click="generateCodes" type="button">
                ✨ 一键生成
              </button>
            </div>
            <p class="field-hint">系统将自动生成指定数量的随机激活码</p>
          </div>

          <!-- 激活码列表 -->
          <div class="form-group">
            <label class="form-label">
              <span class="label-text">📝 激活码列表</span>
              <span class="label-required">*</span>
            </label>
            <p class="field-hint" style="margin-bottom: 8px;">
              每行一个激活码，格式：XXXX-XXXX-XXXX
              <span style="color: var(--text-secondary); margin-left: 8px;">
                当前 {{ codesCount }} 个
              </span>
            </p>
            <textarea class="input code-textarea" v-model="codesText" rows="10" 
                      placeholder="AB12-CD34-EF56&#10;GH78-IJ90-KL12&#10;MN34-OP56-QR78&#10;...&#10;&#10;或点击上方【一键生成】按钮自动填充"></textarea>
          </div>
        </div>
        <p v-if="batchError" class="error" style="margin-top: 12px;">❌ {{ batchError }}</p>
        <div class="actions" style="margin-top: 20px;">
          <button class="btn" @click="closeBatch">取消</button>
          <button class="btn-primary" @click="saveBatch" :disabled="savingBatch || !codesCount">
            {{ savingBatch ? '创建中...' : `🚀 批量创建 ${codesCount} 个激活码` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// 使用本地后端API
import { listActivationCodes, adminCreateCode, adminUpdateCode, adminRevokeCode, adminDeleteCode, adminCreateCodesBulk } from '@/utils/backendActivation'

const q = ref('')
const status = ref('all')
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)
const list = ref([])

const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const error = ref('')
const currentId = ref(null)
const form = ref({ code: '', max_uses: 21, validity_days: 7, daily_limit: 3, expires_at: '', notes: '' })

// 批量新建
const showBatch = ref(false)
const savingBatch = ref(false)
const batchError = ref('')
const codesText = ref('')
const autoCount = ref(10)
const batchDefaults = ref({ max_uses: 21, validity_days: 7, daily_limit: 3 })

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

// 计算批量激活码数量
const codesCount = computed(() => {
  const lines = (codesText.value || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  return lines.length
})

onMounted(reload)

async function reload() {
  const res = await listActivationCodes({ page: page.value, pageSize: pageSize.value, status: status.value, q: q.value })
  list.value = res.list
  total.value = res.total
}

function prev() { if (page.value > 1) { page.value--; reload() } }
function next() { if (page.value < totalPages.value) { page.value++; reload() } }

function openCreate() {
  editing.value = false
  currentId.value = null
  // 自动生成一个随机激活码
  form.value = { code: genCode(), max_uses: 21, validity_days: 7, daily_limit: 3, expires_at: '', notes: '' }
  error.value = ''
  showModal.value = true
}

// 生成新激活码（用于刷新按钮）
function generateNewCode() {
  form.value.code = genCode()
}

function openBatch() {
  showBatch.value = true
  codesText.value = ''
  batchError.value = ''
}

function closeBatch() { showBatch.value = false }

function generateCodes() {
  const count = Math.max(1, Number(autoCount.value) || 1)
  const arr = []
  for (let i = 0; i < count; i++) arr.push(genCode())
  codesText.value = arr.join('\n')
}

async function saveBatch() {
  savingBatch.value = true
  batchError.value = ''
  try {
    const lines = (codesText.value || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
    if (!lines.length) throw new Error('请先填入或生成激活码')
    const items = lines.map(code => ({ code, ...batchDefaults.value }))
    const res = await adminCreateCodesBulk(items)
    if (res?.failed && res.failed.length) {
      batchError.value = `部分失败：${res.failed.length} 条。`
    }
    showBatch.value = false
    await reload()
  } catch (e) {
    batchError.value = e?.message || '批量创建失败'
  } finally {
    savingBatch.value = false
  }
}

function openEdit(item) {
  editing.value = true
  currentId.value = item.id
  form.value = {
    code: item.code || '',
    max_uses: item.max_uses || 21,
    validity_days: item.validity_days || 7,
    daily_limit: item.daily_limit || 3,
    expires_at: item.expires_at ? toLocalInput(item.expires_at) : '',
    notes: item.notes || ''
  }
  error.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

async function save() {
  saving.value = true
  error.value = ''
  try {
    if (editing.value && currentId.value) {
      await adminUpdateCode(currentId.value, normalizePayload(form.value))
    } else {
      await adminCreateCode(normalizePayload(form.value))
    }
    showModal.value = false
    await reload()
  } catch (e) {
    error.value = e?.message || '保存失败'
  } finally {
    saving.value = false
  }
}

async function revoke(item) {
  try {
    await adminRevokeCode(item.id)
    await reload()
  } catch (e) {
    alert(e?.message || '撤销失败')
  }
}

async function remove(item) {
  if (!confirm('确认删除该激活码？此操作不可恢复')) return
  try {
    await adminDeleteCode(item.id)
    await reload()
  } catch (e) {
    alert(e?.message || '删除失败')
  }
}

function normalizePayload(v) {
  const payload = { ...v }
  if (!payload.expires_at) delete payload.expires_at
  return payload
}

function toLocalInput(v) {
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  const y = d.getFullYear()
  const m = pad(d.getMonth() + 1)
  const day = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  return `${y}-${m}-${day}T${hh}:${mm}`
}

function formatDate(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let raw = ''
  for (let i = 0; i < 12; i++) raw += chars[Math.floor(Math.random() * chars.length)]
  return raw.slice(0,4) + '-' + raw.slice(4,8) + '-' + raw.slice(8,12)
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'active': '✅ 可用',
    'expired': '⏰ 已过期',
    'revoked': '🚫 已撤销',
    'used': '✔️ 已用完'
  }
  return statusMap[status] || status
}

// 获取使用率颜色
function getUsageColor(current, max) {
  const percent = current / max
  if (percent >= 0.9) return '#f56565' // 红色：90%以上
  if (percent >= 0.7) return '#ed8936' // 橙色：70-90%
  if (percent >= 0.5) return '#ecc94b' // 黄色：50-70%
  return '#48bb78' // 绿色：50%以下
}
</script>

<style scoped>
/* ========== 页面头部 ========== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border);
}

.page-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-batch {
  height: 36px;
  padding: 0 16px;
  border: 2px solid var(--primary);
  border-radius: 8px;
  background: white;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-batch:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* ========== 工具栏 ========== */
.toolbar { 
  display: flex; 
  gap: 10px; 
  flex-wrap: wrap; 
  margin-bottom: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
}

.search-input {
  padding-left: 36px !important;
  width: 100%;
}

.status-select {
  min-width: 140px;
}

.btn-refresh {
  height: 36px;
  padding: 0 14px;
  border: var(--admin-border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-body);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: translateY(-1px);
}

/* ========== 表格样式 ========== */
.table-wrapper {
  overflow-x: auto;
  border: var(--admin-border);
  border-radius: 8px;
  margin-bottom: 16px;
}

.code-badge {
  display: inline-block;
  padding: 4px 8px;
  background: var(--bg-section);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--primary);
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-active {
  background: #c6f6d5;
  color: #22543d;
}

.status-expired {
  background: #fed7d7;
  color: #742a2a;
}

.status-revoked {
  background: #e2e8f0;
  color: #4a5568;
}

.status-used {
  background: #bee3f8;
  color: #2c5282;
}

.usage-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.usage-percent {
  font-size: 11px;
  font-weight: 600;
}

.notes-text {
  color: var(--text-secondary);
  font-size: 13px;
}

.action-cell {
  text-align: right;
  white-space: nowrap;
}

.btn-sm {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  margin-left: 4px;
}

.btn-edit {
  background: #ebf8ff;
}

.btn-edit:hover {
  background: #bee3f8;
  transform: scale(1.1);
}

.btn-revoke {
  background: #fef5e7;
}

.btn-revoke:hover:not(:disabled) {
  background: #fbd38d;
  transform: scale(1.1);
}

.btn-revoke:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-delete {
  background: #fff5f5;
}

.btn-delete:hover {
  background: #fed7d7;
  transform: scale(1.1);
}

/* 空状态 */
.empty-state {
  padding: 60px 20px !important;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* ========== 分页 ========== */
.pager { 
  display: flex; 
  justify-content: space-between;
  align-items: center; 
  gap: 12px; 
  margin-top: 16px;
  padding: 12px;
  background: var(--bg-section);
  border-radius: 8px;
}

.btn-pager {
  height: 36px;
  padding: 0 16px;
  border: var(--admin-border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-body);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pager:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: translateX(2px);
}

.btn-pager:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.page-current {
  font-weight: 700;
  color: var(--primary);
}

.page-separator {
  color: var(--text-secondary);
}

.page-total {
  color: var(--text-body);
}

.page-count {
  color: var(--text-secondary);
  font-size: 12px;
}

.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }

/* ========== 表单组样式 ========== */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-title);
}

.label-text {
  color: var(--text-title);
}

.label-required {
  color: #f56565;
  font-weight: bold;
}

.label-optional {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: normal;
}

.field-hint {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
  line-height: 1.5;
}

/* 输入框与按钮组合 */
.input-with-btn {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-with-btn .input {
  flex: 1;
}

.btn-generate {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-generate:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-generate:active {
  transform: translateY(0);
}

/* 批量参数布局 */
.batch-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  padding: 12px;
  background: var(--bg-section);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 自动生成框 */
.auto-generate-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-section);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.auto-text {
  font-size: 14px;
  color: var(--text-body);
  white-space: nowrap;
}

/* 代码文本框 */
.code-textarea {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical;
  padding: 12px !important;
}

/* 模态框优化 */
.modal {
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal-body {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式优化 */
@media (max-width: 640px) {
  .batch-params {
    grid-template-columns: 1fr;
  }
  
  .auto-generate-box {
    flex-wrap: wrap;
  }
  
  .input-with-btn {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-generate {
    width: 100%;
  }
}
</style>


