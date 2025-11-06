<template>
  <div class="card">
    <div class="page-header">
      <div>
        <h3 class="text-title" style="margin-bottom: 4px">🎫 激活码管理</h3>
        <p class="page-subtitle">管理和监控所有激活码的使用情况</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreate">
          <span class="btn-icon">➕</span>
          <span class="btn-text">新建激活码</span>
        </button>
        <button class="btn btn-secondary" @click="openBatch">
          <span class="btn-icon">📦</span>
          <span class="btn-text">批量新建</span>
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
      <button v-if="selectedCodes.length > 0" class="btn-export" @click="exportSelected" title="导出选中的激活码">
        📥 导出选中 ({{ selectedCodes.length }})
      </button>
    </div>

    <!-- 桌面端表格视图 -->
    <div class="table-wrapper desktop-only">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 40px;">
              <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" />
            </th>
            <th>激活码</th>
            <th>状态</th>
            <th>设备使用情况</th>
            <th>有效天数</th>
            <th>每日上限</th>
            <th>今日已用</th>
            <th>剩余时间</th>
            <th>备注</th>
            <th style="text-align: right;">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>
              <input type="checkbox" :value="item.code" v-model="selectedCodes" />
            </td>
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
                <strong>{{ item.activatedDevices || 0 }}</strong> / {{ item.max_uses }}
                <span class="usage-percent" :style="{ color: getUsageColor(item.activatedDevices || 0, item.max_uses) }">
                  ({{ Math.round((item.activatedDevices || 0) / item.max_uses * 100) }}%)
                </span>
              </span>
            </td>
            <td>{{ item.validity_days }} 天</td>
            <td>{{ item.daily_limit }} 次/天</td>
            <td>
              <span class="today-usage" :class="getTodayUsageClass(item.todayUsed, item.daily_limit)">
                {{ item.todayUsed || 0 }} / {{ item.daily_limit }}
              </span>
            </td>
            <td>
              <span class="time-remaining" :class="getTimeRemainingClass(item.timeRemaining)">
                {{ formatTimeRemaining(item.timeRemaining) }}
              </span>
            </td>
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
            <td colspan="10" class="empty-state">
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

    <!-- 移动端卡片视图 -->
    <div class="mobile-cards mobile-only">
      <div v-if="!list.length" class="empty-state-mobile">
        <div class="empty-icon">📭</div>
        <p class="empty-text">暂无激活码</p>
        <p class="empty-hint">点击上方按钮创建</p>
      </div>

      <div v-for="item in list" :key="item.id" class="code-card">
        <!-- 卡片头部 -->
        <div class="card-header-mobile">
          <div class="code-info">
            <code class="code-badge-mobile">{{ item.code }}</code>
            <span :class="['status-badge-mobile', `status-${item.status}`]">
              {{ getStatusText(item.status) }}
            </span>
          </div>
          <div class="card-actions">
            <button class="btn-action" @click="openEdit(item)" title="编辑">
              ✏️
            </button>
            <button class="btn-action" @click="revoke(item)"
                    :disabled="item.status==='revoked'" title="撤销">
              🚫
            </button>
            <button class="btn-action btn-danger" @click="remove(item)" title="删除">
              🗑️
            </button>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content-mobile">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">设备使用</span>
              <span class="info-value">
                <strong>{{ item.activatedDevices || 0 }}</strong> / {{ item.max_uses }}
                <span class="usage-percent-mobile" :style="{ color: getUsageColor(item.activatedDevices || 0, item.max_uses) }">
                  {{ Math.round((item.activatedDevices || 0) / item.max_uses * 100) }}%
                </span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">今日已用</span>
              <span :class="['info-value', getTodayUsageClass(item.todayUsed, item.daily_limit)]">
                {{ item.todayUsed || 0 }} / {{ item.daily_limit }}
              </span>
            </div>
          </div>

          <div class="info-row">
            <div class="info-item">
              <span class="info-label">有效期</span>
              <span class="info-value">{{ item.validity_days }} 天</span>
            </div>
            <div class="info-item">
              <span class="info-label">剩余时间</span>
              <span :class="['info-value', getTimeRemainingClass(item.timeRemaining)]">
                {{ formatTimeRemaining(item.timeRemaining) }}
              </span>
            </div>
          </div>

          <div v-if="item.notes" class="info-row-full">
            <span class="info-label">备注</span>
            <span class="info-value notes-mobile">{{ item.notes }}</span>
          </div>
        </div>
      </div>
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

    <!-- 新建/编辑激活码弹窗 -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">{{ editing ? '✏️' : '➕' }}</span>
            <h3>{{ editing ? '编辑激活码' : '新建激活码' }}</h3>
          </div>
          <button class="modal-close" @click="closeModal" title="关闭">✕</button>
        </div>

        <div class="modal-content">
          <div class="form-modern">
            <!-- 激活码 -->
            <div class="form-field">
              <label class="field-label">
                <span class="label-icon">🎫</span>
                <span class="label-text">激活码</span>
                <span class="label-required">*</span>
              </label>
              <div class="input-group">
                <input
                  class="input-modern"
                  v-model="form.code"
                  placeholder="XXXX-XXXX-XXXX"
                  :readonly="editing"
                />
                <button
                  v-if="!editing"
                  class="btn-icon-action"
                  @click="generateNewCode"
                  type="button"
                  title="随机生成激活码"
                >
                  <span class="icon">🔄</span>
                  <span class="text">随机生成</span>
                </button>
              </div>
              <p class="field-description">格式：4位-4位-4位，如 AB12-CD34-EF56</p>
            </div>

            <!-- 参数配置区域 -->
            <div class="params-section">
              <div class="section-header">
                <span class="section-icon">⚙️</span>
                <span class="section-title">参数配置</span>
              </div>

              <div class="params-grid-mobile">
                <!-- 第一行：最大使用次数 + 有效天数 -->
                <div class="form-row-mobile">
                  <div class="form-field form-field-half">
                    <label class="field-label field-label-compact">
                      <span class="label-text">最大使用次数</span>
                      <span class="label-required">*</span>
                    </label>
                    <input
                      class="input-modern"
                      type="number"
                      v-model.number="form.max_uses"
                      placeholder="21"
                      min="1"
                    />
                    <p class="field-description">最多使用次数</p>
                  </div>

                  <div class="form-field form-field-half">
                    <label class="field-label field-label-compact">
                      <span class="label-text">有效天数</span>
                      <span class="label-required">*</span>
                    </label>
                    <input
                      class="input-modern"
                      type="number"
                      v-model.number="form.validity_days"
                      placeholder="7"
                      min="1"
                    />
                    <p class="field-description">激活后有效期</p>
                  </div>
                </div>

                <!-- 第二行：每日上限 -->
                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">每日使用上限</span>
                    <span class="label-required">*</span>
                  </label>
                  <input
                    class="input-modern"
                    type="number"
                    v-model.number="form.daily_limit"
                    placeholder="3"
                    min="1"
                  />
                  <p class="field-description">所有设备每天总共最多可使用几次</p>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div class="form-field">
              <label class="field-label">
                <span class="label-icon">📝</span>
                <span class="label-text">备注说明</span>
                <span class="label-optional">（可选）</span>
              </label>
              <input
                class="input-modern"
                v-model="form.notes"
                placeholder="例如：推广活动专用码"
              />
              <p class="field-description">用于标记该激活码的用途或来源</p>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="error" class="error-message">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ error }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeModal">
            <span>取消</span>
          </button>
          <button class="btn btn-primary" @click="save" :disabled="saving">
            <span v-if="!saving">{{ editing ? '💾 保存修改' : '✨ 创建激活码' }}</span>
            <span v-else>
              <span class="loading-spinner"></span>
              <span>保存中...</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 批量新建激活码弹窗 -->
    <div v-if="showBatch" class="modal" @click.self="closeBatch">
      <div class="modal-container modal-large">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">📦</span>
            <h3>批量新建激活码</h3>
          </div>
          <button class="modal-close" @click="closeBatch" title="关闭">✕</button>
        </div>

        <div class="modal-content">
          <div class="form-modern">
            <!-- 批量参数配置 -->
            <div class="params-section">
              <div class="section-header">
                <span class="section-icon">⚙️</span>
                <span class="section-title">批量参数（默认值）</span>
                <span class="section-badge">所有激活码将使用以下参数</span>
              </div>

              <div class="params-grid-mobile">
                <!-- 第一行：最大使用次数 + 有效天数 -->
                <div class="form-row-mobile">
                  <div class="form-field form-field-half">
                    <label class="field-label field-label-compact">
                      <span class="label-text">最大使用次数</span>
                      <span class="label-required">*</span>
                    </label>
                    <input
                      class="input-modern"
                      type="number"
                      v-model.number="batchDefaults.max_uses"
                      placeholder="21"
                      min="1"
                    />
                  </div>

                  <div class="form-field form-field-half">
                    <label class="field-label field-label-compact">
                      <span class="label-text">有效天数</span>
                      <span class="label-required">*</span>
                    </label>
                    <input
                      class="input-modern"
                      type="number"
                      v-model.number="batchDefaults.validity_days"
                      placeholder="7"
                      min="1"
                    />
                  </div>
                </div>

                <!-- 第二行：每日上限 -->
                <div class="form-field">
                  <label class="field-label">
                    <span class="label-text">每日上限</span>
                    <span class="label-required">*</span>
                  </label>
                  <input
                    class="input-modern"
                    type="number"
                    v-model.number="batchDefaults.daily_limit"
                    placeholder="3"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <!-- 快速生成 -->
            <div class="generate-section">
              <div class="section-header">
                <span class="section-icon">🎲</span>
                <span class="section-title">快速生成</span>
              </div>

              <div class="generate-box">
                <div class="generate-input-group">
                  <input
                    class="input-modern input-count"
                    type="number"
                    v-model.number="autoCount"
                    min="1"
                    max="1000"
                    placeholder="输入数量"
                  />
                  <span class="generate-text">个激活码</span>
                </div>
                <button class="btn-generate-action" @click="generateCodes" type="button">
                  <span class="btn-icon">✨</span>
                  <span class="btn-text">一键生成</span>
                </button>
              </div>
              <p class="field-description">系统将自动生成指定数量的随机激活码</p>
            </div>

            <!-- 激活码列表 -->
            <div class="form-field">
              <label class="field-label">
                <span class="label-icon">📝</span>
                <span class="label-text">激活码列表</span>
                <span class="label-required">*</span>
                <span class="codes-count">当前 {{ codesCount }} 个</span>
              </label>
              <textarea
                class="input-modern textarea-codes"
                v-model="codesText"
                rows="12"
                placeholder="AB12-CD34-EF56&#10;GH78-IJ90-KL12&#10;MN34-OP56-QR78&#10;...&#10;&#10;或点击上方【一键生成】按钮自动填充"
              ></textarea>
              <p class="field-description">每行一个激活码，格式：XXXX-XXXX-XXXX</p>
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="batchError" class="error-message">
            <span class="error-icon">⚠️</span>
            <span class="error-text">{{ batchError }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeBatch">
            <span>取消</span>
          </button>
          <button class="btn btn-primary" @click="saveBatch" :disabled="savingBatch || !codesCount">
            <span v-if="!savingBatch">🚀 批量创建 {{ codesCount }} 个激活码</span>
            <span v-else>
              <span class="loading-spinner"></span>
              <span>创建中...</span>
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- 导出对话框 -->
    <div v-if="showExportDialog" class="modal" @click.self="closeExportDialog">
      <div class="modal-container export-dialog">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">📥</span>
            <h3>导出激活码</h3>
          </div>
          <button class="modal-close" @click="closeExportDialog">✕</button>
        </div>

        <div class="modal-content">
          <div class="export-info">
            <div class="info-card">
              <span class="info-icon">✅</span>
              <div class="info-text">
                <div class="info-title">成功创建</div>
                <div class="info-value">{{ exportCodes.length }} 个激活码</div>
              </div>
            </div>

            <p class="export-hint">选择导出格式，将激活码保存到本地文件</p>
          </div>

          <div class="form-field">
            <label class="field-label">
              <span class="label-icon">📄</span>
              <span class="label-text">导出格式</span>
            </label>
            <div class="format-options">
              <label class="format-option">
                <input type="radio" v-model="exportFormat" value="txt" />
                <div class="option-content">
                  <span class="option-icon">📝</span>
                  <div class="option-info">
                    <div class="option-title">TXT 文本</div>
                    <div class="option-desc">每行一个激活码，简洁明了</div>
                  </div>
                </div>
              </label>

              <label class="format-option">
                <input type="radio" v-model="exportFormat" value="csv" />
                <div class="option-content">
                  <span class="option-icon">📊</span>
                  <div class="option-info">
                    <div class="option-title">CSV 表格</div>
                    <div class="option-desc">包含详细参数，可用Excel打开</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeExportDialog">
            <span>稍后导出</span>
          </button>
          <button class="btn btn-primary" @click="exportCodesFile">
            <span class="btn-icon">💾</span>
            <span>立即导出</span>
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
const form = ref({ code: '', max_uses: 21, validity_days: 7, daily_limit: 3, notes: '' })

// 批量新建
const showBatch = ref(false)
const savingBatch = ref(false)
const batchError = ref('')
const codesText = ref('')
const autoCount = ref(10)
const batchDefaults = ref({ max_uses: 21, validity_days: 7, daily_limit: 3 })

// 导出功能
const showExportDialog = ref(false)
const exportCodes = ref([])
const exportFormat = ref('txt')
const selectedCodes = ref([])

const isAllSelected = computed(() => {
  return list.value.length > 0 && selectedCodes.value.length === list.value.length
})

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
  form.value = { code: genCode(), max_uses: 21, validity_days: 7, daily_limit: 3, notes: '' }
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

// 批量验证
function validateBatchParams() {
  // 验证最大使用次数
  if (!batchDefaults.value.max_uses || batchDefaults.value.max_uses < 1) {
    return '最大使用次数必须大于0'
  }

  if (batchDefaults.value.max_uses > 10000) {
    return '最大使用次数不能超过10000'
  }

  // 验证有效天数
  if (!batchDefaults.value.validity_days || batchDefaults.value.validity_days < 1) {
    return '有效天数必须大于0'
  }

  if (batchDefaults.value.validity_days > 3650) {
    return '有效天数不能超过3650天（10年）'
  }

  // 验证每日上限
  if (!batchDefaults.value.daily_limit || batchDefaults.value.daily_limit < 1) {
    return '每日使用上限必须大于0'
  }

  if (batchDefaults.value.daily_limit > 1000) {
    return '每日使用上限不能超过1000'
  }

  return null
}

async function saveBatch() {
  savingBatch.value = true
  batchError.value = ''

  try {
    // 验证批量参数
    const paramError = validateBatchParams()
    if (paramError) {
      batchError.value = paramError
      savingBatch.value = false
      return
    }

    // 获取并验证激活码列表
    const lines = (codesText.value || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)

    if (!lines.length) {
      batchError.value = '请先填入或生成激活码'
      savingBatch.value = false
      return
    }

    if (lines.length > 1000) {
      batchError.value = '单次最多创建1000个激活码'
      savingBatch.value = false
      return
    }

    // 验证激活码格式
    const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    const invalidCodes = lines.filter(code => !codePattern.test(code))

    if (invalidCodes.length > 0) {
      batchError.value = `发现 ${invalidCodes.length} 个格式不正确的激活码，请检查格式（应为：XXXX-XXXX-XXXX）`
      savingBatch.value = false
      return
    }

    // 检查重复
    const uniqueCodes = new Set(lines)
    if (uniqueCodes.size !== lines.length) {
      batchError.value = `发现重复的激活码，请检查并删除重复项`
      savingBatch.value = false
      return
    }

    // 创建激活码
    const items = lines.map(code => ({ code, ...batchDefaults.value }))
    const res = await adminCreateCodesBulk(items)

    if (res?.failed && res.failed.length) {
      if (res.created > 0) {
        batchError.value = `成功创建 ${res.created} 个，失败 ${res.failed.length} 个`
        // 保存成功创建的激活码用于导出
        const successCodes = lines.filter(code =>
          !res.failed.some(f => f.code === code)
        )
        exportCodes.value = successCodes

        // 3秒后提示导出
        setTimeout(() => {
          showBatch.value = false
          if (successCodes.length > 0) {
            showExportDialog.value = true
          }
          reload()
        }, 2000)
      } else {
        batchError.value = `全部失败：${res.failed[0]?.error || '未知错误'}`
      }
    } else {
      // 全部成功
      exportCodes.value = lines
      showBatch.value = false
      showExportDialog.value = true
      await reload()
    }
  } catch (e) {
    batchError.value = e?.message || '批量创建失败'
  } finally {
    savingBatch.value = false
  }
}

// 导出激活码
function exportCodesFile() {
  if (!exportCodes.value || exportCodes.value.length === 0) {
    alert('没有可导出的激活码')
    return
  }

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  let content = ''
  let filename = ''
  let mimeType = ''

  if (exportFormat.value === 'txt') {
    // TXT格式：每行一个激活码
    content = exportCodes.value.join('\n')
    filename = `activation_codes_${timestamp}.txt`
    mimeType = 'text/plain'
  } else if (exportFormat.value === 'csv') {
    // CSV格式：包含表头
    const header = '激活码,最大使用次数,有效天数,每日上限,创建时间\n'
    const rows = exportCodes.value.map(code => {
      const params = batchDefaults.value
      return `${code},${params.max_uses},${params.validity_days},${params.daily_limit},${new Date().toLocaleString('zh-CN')}`
    }).join('\n')
    content = header + rows
    filename = `activation_codes_${timestamp}.csv`
    mimeType = 'text/csv;charset=utf-8;'
  }

  // 创建下载
  const blob = new Blob(['\ufeff' + content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  showExportDialog.value = false
}

function closeExportDialog() {
  showExportDialog.value = false
  exportCodes.value = []
}

// 全选/取消全选
function toggleSelectAll(e) {
  if (e.target.checked) {
    selectedCodes.value = list.value.map(item => item.code)
  } else {
    selectedCodes.value = []
  }
}

// 导出选中的激活码
function exportSelected() {
  if (selectedCodes.value.length === 0) {
    alert('请先选择要导出的激活码')
    return
  }
  exportCodes.value = selectedCodes.value
  showExportDialog.value = true
}

function openEdit(item) {
  editing.value = true
  currentId.value = item.id
  form.value = {
    code: item.code || '',
    max_uses: item.max_uses || 21,
    validity_days: item.validity_days || 7,
    daily_limit: item.daily_limit || 3,
    notes: item.notes || ''
  }
  error.value = ''
  showModal.value = true
}

function closeModal() { showModal.value = false }

// 表单验证
function validateForm() {
  // 验证激活码格式
  if (!form.value.code || !form.value.code.trim()) {
    return '请输入激活码'
  }

  const codePattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  if (!codePattern.test(form.value.code)) {
    return '激活码格式不正确，应为：XXXX-XXXX-XXXX（大写字母和数字）'
  }

  // 验证最大使用次数
  if (!form.value.max_uses || form.value.max_uses < 1) {
    return '最大使用次数必须大于0'
  }

  if (form.value.max_uses > 10000) {
    return '最大使用次数不能超过10000'
  }

  // 验证有效天数
  if (!form.value.validity_days || form.value.validity_days < 1) {
    return '有效天数必须大于0'
  }

  if (form.value.validity_days > 3650) {
    return '有效天数不能超过3650天（10年）'
  }

  // 验证每日上限
  if (!form.value.daily_limit || form.value.daily_limit < 1) {
    return '每日使用上限必须大于0'
  }

  if (form.value.daily_limit > 1000) {
    return '每日使用上限不能超过1000'
  }

  return null
}

async function save() {
  saving.value = true
  error.value = ''

  try {
    // 表单验证
    const validationError = validateForm()
    if (validationError) {
      error.value = validationError
      saving.value = false
      return
    }

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
  if (item.status === 'revoked') {
    return
  }

  if (!confirm(`确认撤销激活码 ${item.code}？\n撤销后该激活码将无法使用。`)) {
    return
  }

  try {
    await adminRevokeCode(item.id)
    await reload()
    // 可以添加成功提示
    showToast('撤销成功', 'success')
  } catch (e) {
    showToast(e?.message || '撤销失败', 'error')
  }
}

async function remove(item) {
  if (!confirm(`确认删除激活码 ${item.code}？\n\n⚠️ 此操作不可恢复！\n如果该激活码已被使用，删除后可能影响用户使用。`)) {
    return
  }

  try {
    await adminDeleteCode(item.id)
    await reload()
    showToast('删除成功', 'success')
  } catch (e) {
    showToast(e?.message || '删除失败', 'error')
  }
}

// 简单的Toast提示函数
function showToast(message, type = 'info') {
  // 这里可以集成更完善的Toast组件
  // 暂时使用alert作为fallback
  if (type === 'error') {
    alert('❌ ' + message)
  } else if (type === 'success') {
    // 成功提示可以不显示alert，因为列表会自动刷新
    console.log('✅ ' + message)
  } else {
    alert('ℹ️ ' + message)
  }
}

function normalizePayload(v) {
  return { ...v }
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

// 格式化剩余时间
function formatTimeRemaining(timeRemaining) {
  if (!timeRemaining) return '-'
  return timeRemaining.text || '-'
}

// 获取剩余时间的样式类
function getTimeRemainingClass(timeRemaining) {
  if (!timeRemaining) return ''
  if (timeRemaining.days === 0 && timeRemaining.hours === 0 && timeRemaining.minutes === 0) {
    return 'time-expired'
  }
  if (timeRemaining.days === 0) return 'time-urgent'
  if (timeRemaining.days <= 1) return 'time-warning'
  return 'time-normal'
}

// 获取今日使用次数的样式类
function getTodayUsageClass(used, limit) {
  if (used >= limit) return 'usage-full'
  if (used >= limit * 0.8) return 'usage-high'
  return 'usage-normal'
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

/* 移动端/桌面端显示控制 */
.desktop-only {
  display: block !important;
}

.mobile-only {
  display: none !important;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 按钮基础样式增强 */
.header-actions .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.header-actions .btn-icon {
  font-size: 16px;
  line-height: 1;
}

.header-actions .btn-text {
  line-height: 1;
}

/* 主要按钮样式 */
.header-actions .btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, #5a67d8 100%);
  color: white;
  border: none;
}

.header-actions .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  filter: brightness(1.05);
}

.header-actions .btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

/* 次要按钮样式 */
.header-actions .btn-secondary {
  background: white;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.header-actions .btn-secondary:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.header-actions .btn-secondary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
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

.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.btn-export:active {
  transform: translateY(0);
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

/* 今日使用次数样式 */
.today-usage {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.usage-normal {
  color: #22543d;
  background: #c6f6d5;
}

.usage-high {
  color: #744210;
  background: #feebc8;
}

.usage-full {
  color: #742a2a;
  background: #fed7d7;
}

/* 剩余时间样式 */
.time-remaining {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
}

.time-normal {
  color: #22543d;
  background: #c6f6d5;
}

.time-warning {
  color: #744210;
  background: #feebc8;
}

.time-urgent {
  color: #c05621;
  background: #fbd38d;
}

.time-expired {
  color: #742a2a;
  background: #fed7d7;
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

/* ========== 现代化弹窗样式 ========== */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2200;
  padding: 20px;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-container {
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: modalSlideUp 0.3s ease-out;
  overflow: hidden;
}

.modal-large {
  max-width: 800px;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 2px solid var(--border);
  background: linear-gradient(to bottom, var(--bg-card), var(--bg-section));
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 24px;
  line-height: 1;
}

.modal-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-title);
  line-height: 1;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--bg-section);
  color: var(--text-title);
  transform: rotate(90deg);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 2px solid var(--border);
  background: var(--bg-section);
}

/* ========== 现代化表单样式 ========== */
.form-modern {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-title);
}

.label-icon {
  font-size: 16px;
  line-height: 1;
}

.label-text {
  color: var(--text-title);
}

.label-required {
  color: #ef4444;
  font-size: 16px;
  line-height: 1;
}

.label-optional {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 400;
  margin-left: 4px;
}

.codes-count {
  margin-left: auto;
  padding: 4px 10px;
  background: linear-gradient(135deg, var(--primary) 0%, #5a67d8 100%);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.field-description {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* 现代化输入框 */
.input-modern {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-body);
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  outline: none;
}

.input-modern:hover {
  border-color: var(--primary);
  background: var(--bg-section);
}

.input-modern:focus {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.input-modern::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
}

.input-modern:read-only {
  background: var(--bg-section);
  cursor: not-allowed;
  opacity: 0.7;
}

/* 输入框组合 */
.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-group .input-modern {
  flex: 1;
}

/* 图标按钮 */
.btn-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-icon-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-icon-action:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.btn-icon-action .icon {
  font-size: 16px;
  line-height: 1;
}

.btn-icon-action .text {
  line-height: 1;
}

/* ========== 参数配置区域 ========== */
.params-section {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 2px solid #e0e7ff;
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 18px;
  line-height: 1;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-title);
}

.section-badge {
  margin-left: auto;
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

/* 移动端响应式表单布局 */
.params-grid-mobile {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row-mobile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-field-half {
  min-width: 0;
}

.field-label-compact {
  font-size: 12px;
}

.field-label-compact .label-text {
  font-size: 12px;
}

/* ========== 快速生成区域 ========== */
.generate-section {
  padding: 20px;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 2px solid #fed7aa;
  border-radius: 12px;
}

.generate-box {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.generate-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-count {
  width: 140px !important;
}

.generate-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-body);
  white-space: nowrap;
}

.btn-generate-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-generate-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.btn-generate-action:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-generate-action .btn-icon {
  font-size: 16px;
  line-height: 1;
}

.btn-generate-action .btn-text {
  line-height: 1;
}

/* ========== 文本域样式 ========== */
.textarea-codes {
  min-height: 280px;
  padding: 16px !important;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  resize: vertical;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-body);
  transition: all 0.2s;
}

.textarea-codes:hover {
  border-color: var(--primary);
  background: var(--bg-section);
}

.textarea-codes:focus {
  border-color: var(--primary);
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

.textarea-codes::placeholder {
  color: var(--text-secondary);
  opacity: 0.6;
  line-height: 1.8;
}

/* ========== 按钮样式 ========== */
.modal-footer .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-cancel {
  background: var(--bg-section);
  color: var(--text-body);
  border: 2px solid var(--border);
}

.btn-cancel:hover {
  background: var(--bg-card);
  border-color: var(--text-secondary);
  transform: translateY(-1px);
}

.modal-footer .btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, #5a67d8 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.modal-footer .btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
}

.modal-footer .btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.modal-footer .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* ========== 错误提示 ========== */
.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fca5a5;
  border-radius: 10px;
  margin-top: 16px;
}

.error-icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #dc2626;
  line-height: 1.5;
}

/* ========== 加载动画 ========== */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 导出对话框样式 ========== */
.export-dialog {
  max-width: 500px;
}

.export-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 1px solid var(--primary);
  border-radius: 12px;
}

.info-icon {
  font-size: 32px;
  line-height: 1;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.info-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.export-hint {
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
  margin: 0;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-card);
}

.format-option:hover {
  border-color: var(--primary);
  background: var(--bg-section);
}

.format-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
}

.format-option input[type="radio"]:checked ~ .option-content {
  color: var(--primary);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.option-icon {
  font-size: 24px;
  line-height: 1;
}

.option-info {
  flex: 1;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.option-desc {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ========== 移动端卡片样式 ========== */
.mobile-cards {
  display: none;
  flex-direction: column;
  gap: 12px;
}

.code-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.2s;
}

.code-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-header-mobile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: linear-gradient(to bottom, var(--bg-section), var(--bg-card));
  border-bottom: 1px solid var(--border);
}

.code-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.code-badge-mobile {
  display: inline-block;
  padding: 6px 10px;
  background: var(--bg-card);
  border: 1px solid var(--primary);
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.5px;
  align-self: flex-start;
}

.status-badge-mobile {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  align-self: flex-start;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.btn-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: var(--bg-section);
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-action:active {
  transform: scale(0.9);
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-action.btn-danger:active {
  background: #fee2e2;
}

.card-content-mobile {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.info-row-full {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
  border-top: 1px dashed var(--border);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.info-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-title);
  word-break: break-word;
}

.usage-percent-mobile {
  font-size: 11px;
  font-weight: 700;
  margin-left: 4px;
}

.notes-mobile {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
  line-height: 1.5;
}

.empty-state-mobile {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-section);
  border-radius: 12px;
  border: 2px dashed var(--border);
}

.empty-state-mobile .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state-mobile .empty-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  margin: 0 0 6px 0;
}

.empty-state-mobile .empty-hint {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

/* ========== 响应式优化 ========== */
@media (max-width: 768px) {
  /* 切换到移动端布局 */
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .mobile-cards {
    display: flex !important;
  }

  /* 页面头部优化 */
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .page-header h3 {
    font-size: 18px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .header-actions {
    width: 100%;
    gap: 8px;
  }

  .header-actions .btn {
    flex: 1;
    min-width: 0;
    height: 52px;
    font-size: 15px;
    padding: 0 16px;
    font-weight: 600;
  }

  .header-actions .btn-icon {
    font-size: 18px;
  }

  .header-actions .btn-text {
    font-size: 15px;
    font-weight: 600;
  }

  /* 工具栏优化 */
  .toolbar {
    gap: 8px;
    margin-bottom: 12px;
  }

  .search-box {
    max-width: 100%;
    min-width: 100%;
  }

  .search-input {
    height: 40px;
    font-size: 14px;
  }

  .status-select {
    height: 40px;
    font-size: 13px;
    min-width: 120px;
  }

  .btn-refresh {
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
  }

  /* 分页优化 */
  .pager {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
  }

  .btn-pager {
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
  }

  .page-info {
    font-size: 12px;
    gap: 6px;
  }

  .page-count {
    display: none;
  }

  /* 弹窗优化 */
  .modal {
    padding: 0;
    align-items: flex-start;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-container {
    max-width: 100vw;
    width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 16px;
    flex-shrink: 0;
  }

  .modal-title h3 {
    font-size: 17px;
  }

  .modal-icon {
    font-size: 20px;
  }

  .modal-content {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .modal-footer {
    padding: 14px 16px;
    flex-shrink: 0;
  }

  .params-grid {
    grid-template-columns: 1fr;
  }

  .form-modern {
    gap: 18px;
  }

  .input-modern {
    height: 44px;
    font-size: 15px;
  }

  .field-label {
    font-size: 13px;
  }

  .field-description {
    font-size: 10px;
    line-height: 1.3;
  }

  .form-field-half .field-description {
    font-size: 10px;
  }
}

@media (max-width: 640px) {
  /* 页面整体间距 */
  .card {
    padding: 12px;
  }

  /* 头部按钮 */
  .header-actions {
    flex-direction: column;
  }

  .header-actions .btn {
    width: 100%;
    height: 54px;
    font-size: 16px;
  }

  .header-actions .btn-icon {
    font-size: 20px;
  }

  .header-actions .btn-text {
    font-size: 16px;
  }

  /* 工具栏 */
  .toolbar {
    flex-direction: column;
  }

  .search-box {
    width: 100%;
  }

  .status-select {
    width: 100%;
  }

  .btn-refresh {
    width: 100%;
  }

  /* 移动端卡片间距 */
  .mobile-cards {
    gap: 10px;
  }

  .code-card {
    border-radius: 10px;
  }

  .card-header-mobile {
    padding: 10px;
  }

  .card-content-mobile {
    padding: 10px;
    gap: 8px;
  }

  .code-badge-mobile {
    font-size: 12px;
    padding: 5px 8px;
  }

  .status-badge-mobile {
    font-size: 10px;
    padding: 3px 8px;
  }

  .btn-action {
    width: 34px;
    height: 34px;
    font-size: 15px;
  }

  .info-label {
    font-size: 10px;
  }

  .info-value {
    font-size: 12px;
  }

  /* 分页 */
  .pager {
    padding: 8px;
  }

  .btn-pager {
    flex: 1;
    min-width: 0;
  }

  .page-info {
    width: 100%;
    justify-content: center;
    order: -1;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }

  /* 弹窗 */
  .modal {
    padding: 0;
  }

  .modal-container {
    max-width: 100%;
    width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .modal-header {
    padding: 14px;
  }

  .modal-title {
    gap: 10px;
  }

  .modal-title h3 {
    font-size: 16px;
  }

  .modal-icon {
    font-size: 18px;
  }

  .modal-close {
    width: 30px;
    height: 30px;
    font-size: 18px;
  }

  .modal-content {
    padding: 14px;
  }

  .modal-footer {
    flex-direction: column-reverse;
    padding: 12px 14px;
    gap: 10px;
  }

  .modal-footer .btn {
    width: 100%;
    height: 48px;
  }

  /* 表单 */
  .form-modern {
    gap: 16px;
  }

  .input-modern {
    height: 46px;
    font-size: 16px;
    padding: 0 14px;
  }

  .input-group {
    flex-direction: column;
  }

  .btn-icon-action {
    width: 100%;
    height: 46px;
  }

  .field-label {
    font-size: 12px;
  }

  .label-icon {
    font-size: 14px;
  }

  .field-description {
    font-size: 11px;
  }

  /* 参数配置区域 */
  .params-section,
  .generate-section {
    padding: 14px;
    border-radius: 10px;
  }

  .section-header {
    margin-bottom: 12px;
  }

  .section-icon {
    font-size: 16px;
  }

  .section-title {
    font-size: 13px;
  }

  .section-badge {
    font-size: 10px;
    padding: 3px 8px;
  }

  .params-grid {
    gap: 12px;
  }

  /* 快速生成 */
  .generate-box {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .generate-input-group {
    width: 100%;
  }

  .input-count {
    flex: 1;
    width: 100% !important;
  }

  .generate-text {
    font-size: 13px;
  }

  .btn-generate-action {
    width: 100%;
    height: 46px;
  }

  /* 文本域 */
  .textarea-codes {
    min-height: 200px;
    padding: 12px !important;
    font-size: 12px;
  }

  /* 激活码数量标签 */
  .codes-count {
    margin-left: 0;
    margin-top: 6px;
    align-self: flex-start;
    font-size: 11px;
    padding: 3px 8px;
  }

  /* 错误提示 */
  .error-message {
    padding: 12px 14px;
    gap: 8px;
  }

  .error-icon {
    font-size: 18px;
  }

  .error-text {
    font-size: 13px;
  }
}

/* 超小屏幕优化 (iPhone SE 等) */
@media (max-width: 375px) {
  .page-header h3 {
    font-size: 16px;
  }

  .header-actions .btn {
    height: 44px;
    font-size: 12px;
    padding: 0 10px;
  }

  .code-badge-mobile {
    font-size: 11px;
  }

  .btn-action {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .info-row {
    gap: 8px;
  }

  .modal-footer .btn {
    height: 44px;
  }

  /* 表单优化 */
  .form-row-mobile {
    gap: 10px;
  }

  .field-label-compact {
    font-size: 11px;
  }

  .field-label-compact .label-text {
    font-size: 11px;
  }

  .form-field-half .input-modern {
    font-size: 14px;
    padding: 0 10px;
  }

  .form-field-half .field-description {
    font-size: 9px;
  }
}
</style>


