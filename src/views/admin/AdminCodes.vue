<template>
  <div class="card">
    <h3 class="text-title" style="margin-bottom: 12px">激活码管理</h3>

    <div class="toolbar">
      <input class="input" v-model="q" placeholder="搜索 code/备注..." @keyup.enter="reload" />
      <select class="select" v-model="status" @change="reload">
        <option value="all">全部状态</option>
        <option value="active">active</option>
        <option value="expired">expired</option>
        <option value="revoked">revoked</option>
        <option value="used">used</option>
      </select>
      <button class="btn-primary" @click="openCreate">新建激活码</button>
      <button class="btn" @click="openBatch">批量新建</button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>激活码</th><th>状态</th><th>当前/最大</th><th>有效天数</th><th>每日上限</th><th>过期时间</th><th>备注</th><th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.code }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.current_uses }}/{{ item.max_uses }}</td>
          <td>{{ item.validity_days }}</td>
          <td>{{ item.daily_limit }}</td>
          <td>{{ formatDate(item.expires_at) }}</td>
          <td>{{ item.notes }}</td>
          <td>
            <button class="btn" @click="openEdit(item)">编辑</button>
            <button class="btn" @click="revoke(item)" :disabled="item.status==='revoked'">撤销</button>
            <button class="btn btn-danger" @click="remove(item)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pager">
      <button class="btn" @click="prev" :disabled="page===1">上一页</button>
      <span>第 {{ page }} 页 / 共 {{ totalPages }} 页</span>
      <button class="btn" @click="next" :disabled="page>=totalPages">下一页</button>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-body card" style="padding:16px">
        <h4 class="text-title" style="margin-bottom: 8px">{{ editing? '编辑激活码' : '新建激活码' }}</h4>
        <div class="form">
          <label>激活码</label>
          <input class="input" v-model="form.code" placeholder="XXXX-XXXX-XXXX" />
          <label>最大使用次数</label>
          <input class="input" type="number" v-model.number="form.max_uses" />
          <label>有效天数</label>
          <input class="input" type="number" v-model.number="form.validity_days" />
          <label>每日上限</label>
          <input class="input" type="number" v-model.number="form.daily_limit" />
          <label>过期时间（可选）</label>
          <input class="input" v-model="form.expires_at" type="datetime-local" />
          <label>备注</label>
          <input class="input" v-model="form.notes" />
        </div>
        <div class="actions">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn-primary" @click="save" :disabled="saving">保存</button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
    </div>

    <!-- 批量新建 -->
    <div v-if="showBatch" class="modal">
      <div class="modal-body card" style="padding:16px">
        <h4 class="text-title" style="margin-bottom: 8px">批量新建激活码</h4>
        <div class="form">
          <label>批量参数（默认值）</label>
          <div style="display:flex; gap:8px; flex-wrap: wrap;">
            <input class="input" type="number" v-model.number="batchDefaults.max_uses" placeholder="最大使用" />
            <input class="input" type="number" v-model.number="batchDefaults.validity_days" placeholder="有效天数" />
            <input class="input" type="number" v-model.number="batchDefaults.daily_limit" placeholder="每日上限" />
          </div>
          <label>自动生成数量</label>
          <div style="display:flex; gap:8px; align-items:center;">
            <input class="input" type="number" v-model.number="autoCount" min="1" style="width:120px" />
            <button class="btn" @click="generateCodes">生成并填入</button>
          </div>
          <label>激活码列表（每行一个，如 XXXX-XXXX-XXXX）</label>
          <textarea class="input" v-model="codesText" rows="8" style="padding:10px; resize:vertical"></textarea>
        </div>
        <div class="actions">
          <button class="btn" @click="closeBatch">取消</button>
          <button class="btn-primary" @click="saveBatch" :disabled="savingBatch">提交创建</button>
        </div>
        <p v-if="batchError" class="error">{{ batchError }}</p>
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
  form.value = { code: '', max_uses: 21, validity_days: 7, daily_limit: 3, expires_at: '', notes: '' }
  error.value = ''
  showModal.value = true
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
</script>

<style scoped>
.pager { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
</style>


