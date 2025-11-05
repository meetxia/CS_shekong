<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-brand">社恐测评 Console</div>
      
      <div class="admin-user-info">
        <div class="user-avatar">{{ adminInitial }}</div>
        <div class="user-details">
          <div class="user-name">{{ adminInfo?.nickname || adminInfo?.username || '管理员' }}</div>
          <div class="user-role">@{{ adminInfo?.username }}</div>
        </div>
      </div>
      
      <div class="admin-section">导航</div>
      <nav class="admin-nav">
        <router-link class="admin-link" :to="{ name: 'AdminDashboard' }">
          <span>📊 数据总览</span>
        </router-link>
        <router-link class="admin-link" :to="{ name: 'AdminCodes' }">
          <span>🎫 激活码管理</span>
        </router-link>
      </nav>
    </aside>
    <section>
      <header class="admin-topbar">
        <h2 class="text-title">激活码后台</h2>
        <div class="admin-actions">
          <router-link class="btn" to="/">返回前台</router-link>
          <button class="btn btn-danger" @click="handleLogout">退出登录</button>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </section>
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminInfo, adminLogout, getCurrentAdmin } from '@/utils/adminAuth'

const router = useRouter()
const adminInfo = ref(null)

// 获取管理员首字母
const adminInitial = computed(() => {
  const name = adminInfo.value?.nickname || adminInfo.value?.username || 'A'
  return name.charAt(0).toUpperCase()
})

onMounted(async () => {
  // 先从本地获取
  adminInfo.value = getAdminInfo()
  
  // 再从服务器验证和更新
  try {
    const result = await getCurrentAdmin()
    if (result.success) {
      adminInfo.value = result.admin
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error)
  }
})

async function handleLogout() {
  if (!confirm('确认退出登录？')) return
  
  try {
    await adminLogout()
    router.push('/admin/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.admin-content { min-height: 50vh; }

.admin-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-actions {
  display: flex;
  gap: 8px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}
</style>


