<template>
  <div class="admin-shell">
    <!-- 桌面端侧边栏 -->
    <aside class="admin-sidebar desktop-sidebar">
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
        <router-link class="admin-link" :to="{ name: 'AdminAIConfig' }">
          <span>🤖 AI配置</span>
        </router-link>
        <router-link class="admin-link" :to="{ name: 'AdminXiaohongshu' }">
          <span>📝 小红书文案</span>
        </router-link>
      </nav>
    </aside>

    <!-- 移动端顶部导航 -->
    <header class="mobile-header">
      <div class="mobile-header-top">
        <h2 class="mobile-title">激活码后台</h2>
        <div class="mobile-actions">
          <router-link class="btn-mobile-icon" to="/" title="返回前台">
            🏠
          </router-link>
          <button class="btn-mobile-icon btn-logout" @click="handleLogout" title="退出登录">
            🚪
          </button>
        </div>
      </div>

      <nav class="mobile-nav">
        <router-link class="mobile-nav-item" :to="{ name: 'AdminDashboard' }">
          <span class="nav-icon">📊</span>
          <span class="nav-text">数据总览</span>
        </router-link>
        <router-link class="mobile-nav-item" :to="{ name: 'AdminCodes' }">
          <span class="nav-icon">🎫</span>
          <span class="nav-text">激活码</span>
        </router-link>
        <router-link class="mobile-nav-item" :to="{ name: 'AdminAIConfig' }">
          <span class="nav-icon">🤖</span>
          <span class="nav-text">AI配置</span>
        </router-link>
        <router-link class="mobile-nav-item" :to="{ name: 'AdminXiaohongshu' }">
          <span class="nav-icon">📝</span>
          <span class="nav-text">小红书</span>
        </router-link>
      </nav>
    </header>

    <section class="admin-main">
      <header class="admin-topbar desktop-topbar">
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

/* 移动端导航默认隐藏 */
.mobile-header {
  display: none;
}

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

/* ========== 移动端样式 ========== */
@media (max-width: 768px) {
  /* 隐藏桌面端侧边栏和顶栏 */
  .desktop-sidebar {
    display: none !important;
  }

  .desktop-topbar {
    display: none !important;
  }

  /* 显示移动端导航 */
  .mobile-header {
    display: block;
    position: sticky;
    top: 0;
    z-index: 2100;
    background: var(--bg-card);
    border-bottom: 1px solid var(--border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .mobile-header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
  }

  .mobile-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-title);
    margin: 0;
  }

  .mobile-actions {
    display: flex;
    gap: 8px;
  }

  .btn-mobile-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    background: var(--bg-section);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
  }

  .btn-mobile-icon:active {
    transform: scale(0.9);
    background: var(--bg-main);
  }

  .btn-logout {
    background: #fee2e2;
  }

  .btn-logout:active {
    background: #fecaca;
  }

  /* 移动端导航标签 */
  .mobile-nav {
    display: flex;
    background: var(--bg-section);
  }

  .mobile-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 8px;
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 500;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    min-height: 60px;
  }

  .mobile-nav-item:active {
    background: var(--bg-card);
  }

  .mobile-nav-item.router-link-active {
    color: var(--primary);
    border-bottom-color: var(--primary);
    background: var(--bg-card);
  }

  .nav-icon {
    font-size: 22px;
    line-height: 1;
  }

  .nav-text {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  /* 调整主内容区域 */
  .admin-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .admin-main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .admin-content {
    padding: 12px;
    flex: 1;
  }
}

/* 超小屏幕优化 */
@media (max-width: 375px) {
  .mobile-header-top {
    padding: 10px 12px;
  }

  .mobile-title {
    font-size: 15px;
  }

  .btn-mobile-icon {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .mobile-nav-item {
    padding: 8px 6px;
    min-height: 56px;
  }

  .nav-icon {
    font-size: 20px;
  }

  .nav-text {
    font-size: 10px;
  }
}
</style>


