<template>
  <div class="card">
    <h3 class="text-title dashboard-title">数据总览</h3>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">激活码总数</div>
        <div class="stat-value">{{ overview.totalCodes }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">启用中</div>
        <div class="stat-value">{{ overview.activeCodes }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已过期</div>
        <div class="stat-value">{{ overview.expiredCodes }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已撤销</div>
        <div class="stat-value">{{ overview.revokedCodes }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总激活设备数</div>
        <div class="stat-value">{{ overview.totalRecords }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总使用次数</div>
        <div class="stat-value">{{ overview.totalUsageCount }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日使用次数</div>
        <div class="stat-value">{{ overview.todayUsageCount }}</div>
      </div>
    </div>

    <!-- 桌面端表格 -->
    <div class="table-wrap desktop-table">
      <h4 class="text-secondary table-title">按激活码统计</h4>
      <table class="table">
        <thead>
          <tr>
            <th>激活码</th>
            <th>状态</th>
            <th>已激活设备</th>
            <th>今日使用</th>
            <th>总使用次数</th>
            <th>剩余时间</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedByCode" :key="row.code">
            <td><code class="code-badge">{{ row.code }}</code></td>
            <td>
              <span :class="['status-badge', `status-${row.status}`]">
                {{ getStatusText(row.status) }}
              </span>
            </td>
            <td>
              <span class="device-count">
                {{ row.activated_devices || 0 }} / {{ row.max_uses }}
                <span class="device-percent">
                  ({{ Math.round(((row.activated_devices || 0) / row.max_uses) * 100) }}%)
                </span>
              </span>
            </td>
            <td>
              <span :class="getTodayUsageClass(row.today_used || 0, row.daily_limit || 3)">
                {{ row.today_used || 0 }} / {{ row.daily_limit || 3 }}
              </span>
            </td>
            <td>
              <strong>{{ row.total_usages || 0 }}</strong>
            </td>
            <td>
              <span :class="getTimeRemainingClass(row.time_remaining)">
                {{ row.time_remaining || '-' }}
              </span>
            </td>
            <td class="notes-cell">{{ row.notes || '-' }}</td>
          </tr>
          <tr v-if="!paginatedByCode.length">
            <td colspan="7" style="text-align: center; color: #999; padding: 20px;">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pager">
      <button class="btn-pager" @click="prev" :disabled="page===1">
        ← 上一页
      </button>
      <div class="page-info">
        <span class="page-current">第 {{ page }} 页</span>
        <span class="page-separator">/</span>
        <span class="page-total">共 {{ totalPages }} 页</span>
        <span class="page-count">（{{ totalItems }} 条记录）</span>
      </div>
      <button class="btn-pager" @click="next" :disabled="page>=totalPages">
        下一页 →
      </button>
      <div class="page-size-selector">
        <label class="page-size-label">每页显示：</label>
        <select class="page-size-select" v-model.number="pageSize" @change="changePageSize">
          <option :value="20">20 条</option>
          <option :value="50">50 条</option>
          <option :value="100">100 条</option>
        </select>
      </div>
    </div>

    <!-- 移动端卡片列表 -->
    <div class="mobile-code-list">
      <h4 class="text-secondary table-title">按激活码统计</h4>
      <div class="code-stats-cards">
        <div v-for="row in paginatedByCode" :key="row.code" class="code-stat-card">
          <div class="card-header">
            <code class="code-badge-mobile">{{ row.code }}</code>
            <span :class="['status-badge-mobile', `status-${row.status}`]">
              {{ getStatusText(row.status) }}
            </span>
          </div>
          <div class="card-stats">
            <div class="stat-item">
              <span class="stat-item-label">设备</span>
              <span class="stat-item-value">
                {{ row.activated_devices || 0 }}/{{ row.max_uses }}
                <span class="stat-percent">({{ Math.round(((row.activated_devices || 0) / row.max_uses) * 100) }}%)</span>
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-item-label">今日</span>
              <span :class="['stat-item-value', getTodayUsageClass(row.today_used || 0, row.daily_limit || 3)]">
                {{ row.today_used || 0 }}/{{ row.daily_limit || 3 }}
              </span>
            </div>
            <div class="stat-item">
              <span class="stat-item-label">总次数</span>
              <span class="stat-item-value">{{ row.total_usages || 0 }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item-label">剩余</span>
              <span :class="['stat-item-value', getTimeRemainingClass(row.time_remaining)]">
                {{ row.time_remaining || '-' }}
              </span>
            </div>
          </div>
          <div v-if="row.notes" class="card-notes">
            <span class="notes-label">备注：</span>
            <span class="notes-text">{{ row.notes }}</span>
          </div>
        </div>
        <div v-if="!paginatedByCode.length" class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-text">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// 使用本地后端API
import { fetchActivationStats } from '@/utils/backendActivation'

const overview = ref({
  totalCodes: 0,
  activeCodes: 0,
  expiredCodes: 0,
  revokedCodes: 0,
  totalRecords: 0,
  totalUsageCount: 0,
  todayUsageCount: 0
})
const byCode = ref([])

// 分页相关
const page = ref(1)
const pageSize = ref(20)

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(byCode.value.length / pageSize.value) || 1
})

// 计算总条数
const totalItems = computed(() => {
  return byCode.value.length
})

// 计算当前页的数据
const paginatedByCode = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return byCode.value.slice(start, end)
})

onMounted(async () => {
  try {
    const stats = await fetchActivationStats()
    console.log('统计数据:', stats)
    overview.value = {
      totalCodes: stats.totalCodes,
      activeCodes: stats.activeCodes,
      expiredCodes: stats.expiredCodes,
      revokedCodes: stats.revokedCodes,
      totalRecords: stats.totalRecords,
      totalUsageCount: stats.totalUsageCount,
      todayUsageCount: stats.todayUsageCount
    }
    byCode.value = stats.byCode || []
    console.log('按激活码统计:', byCode.value)
  } catch (e) {
    console.error('加载统计失败', e)
  }
})

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

// 获取今日使用次数的样式类
function getTodayUsageClass(used, limit) {
  if (used >= limit) return 'usage-full'
  if (used >= limit * 0.8) return 'usage-high'
  return 'usage-normal'
}

// 分页控制函数
function prev() {
  if (page.value > 1) {
    page.value--
  }
}

function next() {
  if (page.value < totalPages.value) {
    page.value++
  }
}

function changePageSize() {
  page.value = 1 // 重置到第一页
}

// 获取剩余时间的样式类
function getTimeRemainingClass(timeRemaining) {
  if (!timeRemaining || timeRemaining === '-') return ''
  if (timeRemaining === '已过期') return 'time-expired'

  // 解析时间字符串
  const match = timeRemaining.match(/(\d+)天/)
  if (match) {
    const days = parseInt(match[1])
    if (days === 0) return 'time-urgent'
    if (days <= 1) return 'time-warning'
  }

  return 'time-normal'
}
</script>

<style scoped>
.dashboard-title {
  margin-bottom: 16px;
}

.table-title {
  margin-bottom: 12px;
  margin-top: 20px;
}

.table-wrap {
  overflow: auto;
  margin-top: 16px;
}

.mobile-code-list {
  display: none;
}

.code-badge {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #333;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
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
  background: #feebc8;
  color: #744210;
}

.status-used {
  background: #bee3f8;
  color: #2c5282;
}

.device-count {
  font-weight: 600;
}

.device-percent {
  color: #666;
  font-size: 12px;
  margin-left: 4px;
}

.usage-normal {
  color: #22543d;
  font-weight: 600;
}

.usage-high {
  color: #d69e2e;
  font-weight: 600;
}

.usage-full {
  color: #c53030;
  font-weight: 600;
}

.time-normal {
  color: #22543d;
}

.time-warning {
  color: #d69e2e;
  font-weight: 600;
}

.time-urgent {
  color: #dd6b20;
  font-weight: 600;
}

.time-expired {
  color: #c53030;
  font-weight: 600;
}

.notes-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
  font-size: 13px;
}

/* ========== 分页样式 ========== */
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

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-size-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.page-size-select {
  height: 36px;
  padding: 0 12px;
  border: var(--admin-border);
  border-radius: 8px;
  background: var(--bg-card);
  color: var(--text-body);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
}

.page-size-select:hover {
  border-color: var(--primary);
  background: var(--bg-section);
}

.page-size-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* 移动端样式 */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 18px;
    margin-bottom: 14px;
  }

  .desktop-table {
    display: none;
  }

  .mobile-code-list {
    display: block;
    margin-top: 16px;
  }

  .table-title {
    font-size: 14px;
    margin-top: 16px;
    margin-bottom: 10px;
  }

  .code-stats-cards {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .code-stat-card {
    background: var(--bg-section);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--border);
  }

  .code-badge-mobile {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 8px;
    background: var(--bg-card);
    border: 1px solid var(--primary);
    border-radius: 6px;
    color: var(--primary);
  }

  .status-badge-mobile {
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
  }

  .card-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-item-label {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-item-value {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-title);
  }

  .stat-percent {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .card-notes {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--border);
    font-size: 12px;
  }

  .notes-label {
    color: var(--text-secondary);
    font-weight: 600;
  }

  .notes-text {
    color: var(--text-body);
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    background: var(--bg-section);
    border-radius: 10px;
    border: 2px dashed var(--border);
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 10px;
  }

  .empty-text {
    font-size: 14px;
    color: var(--text-secondary);
  }

  /* 分页优化 */
  .pager {
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px;
    justify-content: center;
  }

  .btn-pager {
    height: 40px;
    padding: 0 12px;
    font-size: 13px;
    flex: 1;
    min-width: 100px;
  }

  .page-info {
    font-size: 12px;
    gap: 6px;
    width: 100%;
    justify-content: center;
    order: -1;
  }

  .page-count {
    display: none;
  }

  .page-size-selector {
    width: 100%;
    justify-content: center;
    padding: 8px 0;
    border-top: 1px solid var(--border);
  }

  .page-size-label {
    font-size: 12px;
  }

  .page-size-select {
    height: 36px;
    font-size: 13px;
  }
}

@media (max-width: 375px) {
  .dashboard-title {
    font-size: 16px;
  }

  .code-badge-mobile {
    font-size: 11px;
  }

  .stat-item-value {
    font-size: 13px;
  }

  /* 分页优化 */
  .btn-pager {
    font-size: 12px;
    padding: 0 10px;
    min-width: 90px;
  }

  .page-info {
    font-size: 11px;
  }

  .page-size-label {
    font-size: 11px;
  }

  .page-size-select {
    height: 34px;
    font-size: 12px;
    padding: 0 8px;
  }
}
</style>


