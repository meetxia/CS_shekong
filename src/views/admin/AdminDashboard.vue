<template>
  <div class="card">
    <h3 class="text-title" style="margin-bottom: 12px">数据总览</h3>
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
        <div class="stat-label">总激活次数</div>
        <div class="stat-value">{{ overview.totalActivations }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">总使用次数</div>
        <div class="stat-value">{{ overview.totalUsageCount }}</div>
      </div>
    </div>

    <div class="table-wrap" style="margin-top: 16px">
      <h4 class="text-secondary" style="margin-bottom: 8px">按激活码统计</h4>
      <table class="table">
        <thead>
          <tr>
            <th>激活码</th>
            <th>状态</th>
            <th>最大使用</th>
            <th>当前使用</th>
            <th>过期时间</th>
            <th>激活次数</th>
            <th>总使用次数</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in byCode" :key="row.code">
            <td>{{ row.code }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.max_uses }}</td>
            <td>{{ row.current_uses }}</td>
            <td>{{ formatDate(row.expires_at) }}</td>
            <td>{{ row.total_activations }}</td>
            <td>{{ row.total_usage_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 使用本地后端API
import { fetchActivationStats } from '@/utils/backendActivation'

const overview = ref({
  totalCodes: 0,
  activeCodes: 0,
  expiredCodes: 0,
  revokedCodes: 0,
  totalActivations: 0,
  totalUsageCount: 0
})
const byCode = ref([])

onMounted(async () => {
  try {
    const stats = await fetchActivationStats()
    overview.value = {
      totalCodes: stats.totalCodes,
      activeCodes: stats.activeCodes,
      expiredCodes: stats.expiredCodes,
      revokedCodes: stats.revokedCodes,
      totalActivations: stats.totalActivations,
      totalUsageCount: stats.totalUsageCount
    }
    byCode.value = stats.byCode || []
  } catch (e) {
    console.error('加载统计失败', e)
  }
})

function formatDate(v) {
  if (!v) return '-'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleString()
}
</script>

<style scoped>
.table-wrap { overflow: auto; }
</style>


