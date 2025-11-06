<template>
  <header class="app-header" :class="{ 'assessment-layout': currentPath === '/assessment' }">
    <div class="header-container">
      <!-- 左侧：Logo/标题 -->
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <span class="iconify logo-icon" data-icon="mdi:brain" data-width="24" data-height="24"></span>
          <span class="logo-text">社恐测评</span>
        </router-link>
      </div>

      <!-- 中间：导航菜单（桌面端） -->
      <nav class="header-nav desktop-only">
        <router-link to="/" class="nav-item" :class="{ active: currentPath === '/' }">
          <span class="iconify" data-icon="mdi:home" data-width="18" data-height="18"></span>
          <span>首页</span>
        </router-link>
        <router-link 
          v-if="hasActivation" 
          to="/assessment" 
          class="nav-item" 
          :class="{ active: currentPath === '/assessment' }"
        >
          <span class="iconify" data-icon="mdi:clipboard-text" data-width="18" data-height="18"></span>
          <span>测评</span>
        </router-link>
        <router-link 
          v-if="hasReport" 
          to="/report" 
          class="nav-item" 
          :class="{ active: currentPath === '/report' }"
        >
          <span class="iconify" data-icon="mdi:chart-box" data-width="18" data-height="18"></span>
          <span>报告</span>
        </router-link>
        <!-- 激活码状态（桌面端） -->
        <div v-if="hasActivation && activationStatus" class="activation-status desktop-only">
          <span class="iconify" data-icon="mdi:key-variant" data-width="14" data-height="14"></span>
          <span class="status-text">
            剩余{{ activationStatus.daysLeft }}天 · 今日{{ activationStatus.remainingToday }}/{{ activationStatus.dailyLimit }}
          </span>
        </div>
      </nav>

      <!-- 右侧：工具按钮 -->
      <div class="header-right">
        <!-- 更换激活码按钮（已激活状态下显示） -->
        <button
          v-if="hasActivation"
          @click="goToActivation"
          class="icon-btn"
          title="更换激活码"
        >
          <span class="iconify" data-icon="mdi:key-plus" data-width="20" data-height="20"></span>
        </button>

        <!-- 主题切换按钮 -->
        <button
          @click="toggleTheme"
          class="icon-btn"
          :title="isDark() ? '切换到浅色模式' : '切换到深色模式'"
        >
          <span
            class="iconify"
            :data-icon="isDark() ? 'mdi:weather-night' : 'mdi:white-balance-sunny'"
            data-width="20"
            data-height="20"
          ></span>
        </button>

        <!-- 报告页：返回测评 -->
        <button
          v-if="currentPath === '/report'"
          @click="goAssessment"
          class="icon-btn desktop-only"
          title="返回测评"
        >
          <span class="iconify" data-icon="mdi:arrow-left" data-width="20" data-height="20"></span>
        </button>

        <!-- 报告页：分享结果（桌面端） -->
        <button
          v-if="currentPath === '/report'"
          @click="openShareFromHeader"
          class="icon-btn desktop-only"
          title="分享结果"
        >
          <span class="iconify" data-icon="mdi:share-variant" data-width="20" data-height="20"></span>
        </button>

        <!-- 报告页：分享结果（移动端） -->
        <button
          v-if="currentPath === '/report'"
          @click="openShareFromHeader"
          class="icon-btn mobile-only"
          title="分享结果"
        >
          <span class="iconify" data-icon="mdi:share-variant" data-width="20" data-height="20"></span>
        </button>

        <!-- 移动端菜单按钮（汉堡动效） -->
        <button
          @click="toggleMobileMenu"
          class="hamburger-btn mobile-only"
          :aria-expanded="showMobileMenu ? 'true' : 'false'"
          aria-label="主菜单"
          title="菜单"
        >
          <span class="hamburger" :class="{ open: showMobileMenu }">
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
          </span>
        </button>
      </div>
    </div>


    <!-- 移动端菜单（Popover 下拉卡片） -->
    <teleport to="body">
      <transition name="overlay-fade">
        <div v-if="showMobileMenu" class="mobile-overlay" @click="showMobileMenu = false">
          <div class="mobile-popover" role="menu" @click.stop>
            <router-link to="/" class="popover-item" @click="showMobileMenu = false">
              <span class="iconify" data-icon="mdi:home" data-width="18" data-height="18"></span>
              <span>首页</span>
            </router-link>
            <router-link to="/assessment" class="popover-item" @click="showMobileMenu = false">
              <span class="iconify" data-icon="mdi:clipboard-text" data-width="18" data-height="18"></span>
              <span>测评</span>
            </router-link>
            <router-link v-if="hasReport" to="/report" class="popover-item" @click="showMobileMenu = false">
              <span class="iconify" data-icon="mdi:chart-box" data-width="18" data-height="18"></span>
              <span>报告</span>
            </router-link>
            <!-- 报告页专属操作 -->
            <div v-if="currentPath === '/report'" class="popover-divider"></div>
            <button v-if="currentPath === '/report'" class="popover-item popover-action" @click="handleRetest">
              <span class="iconify" data-icon="mdi:refresh" data-width="18" data-height="18"></span>
              <span>再测一次</span>
            </button>
            <button v-if="currentPath === '/report'" class="popover-item popover-action" @click="handleShareScore">
              <span class="iconify" data-icon="mdi:share-variant" data-width="18" data-height="18"></span>
              <span>分享你的分数</span>
            </button>
            <!-- 分隔线 -->
            <div v-if="hasActivation" class="popover-divider"></div>
            <!-- 激活码状态（移动端） -->
            <div v-if="hasActivation && activationStatus" class="popover-item activation-status-mobile">
              <span class="iconify" data-icon="mdi:key-variant" data-width="18" data-height="18"></span>
              <span>激活码剩余：{{ activationStatus.daysLeft }}天 · 今日：{{ activationStatus.remainingToday }}/{{ activationStatus.dailyLimit }}</span>
            </div>
            <!-- 更换激活码按钮（移动端） -->
            <router-link v-if="hasActivation" to="/activation" class="popover-item popover-action" @click="showMobileMenu = false">
              <span class="iconify" data-icon="mdi:key-plus" data-width="18" data-height="18"></span>
              <span>更换激活码</span>
            </router-link>
          </div>
        </div>
      </transition>
    </teleport>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useColorScheme } from '@/composables/useColorScheme'
import { checkActivation, getActivationStatus } from '@/utils/activation'
import { showShareModal } from '@/utils/shareCard'

const route = useRoute()
const router = useRouter()
const { currentScheme, toggleColorScheme, isDark } = useColorScheme()

const showMobileMenu = ref(false)
const activationStatus = ref(null)

const currentPath = computed(() => route.path)

// 注意：localStorage 变化不是响应式，这里用 ref 并在事件里手动刷新
const hasActivation = ref(checkActivation())

// 使用 ref 而不是 computed，以便手动更新
const hasReport = ref(localStorage.getItem('test_report') !== null)

// 获取激活码状态
const loadActivationStatus = async () => {
  console.log('[AppHeader] loadActivationStatus 调用, hasActivation:', hasActivation.value)
  if (hasActivation.value) {
    try {
      activationStatus.value = await getActivationStatus()
      console.log('[AppHeader] 激活状态已更新:', activationStatus.value)
    } catch (e) {
      console.error('[AppHeader] 获取激活码状态失败:', e)
    }
  } else {
    console.log('[AppHeader] 未激活，跳过状态加载')
  }
}

const toggleTheme = () => {
  toggleColorScheme()
}

const goAssessment = () => {
  router.push('/assessment')
}

const goToActivation = () => {
  router.push('/activation')
}

const openShareFromHeader = () => {
  const raw = localStorage.getItem('test_report')
  if (!raw) return
  try {
    const report = JSON.parse(raw)
    showShareModal(report)
  } catch (e) {}
}

const handleRetest = () => {
  showMobileMenu.value = false
  // 清除上一次测试的所有数据
  localStorage.removeItem('test_answers')
  localStorage.removeItem('test_basic_info')
  // 跳转到测评页面
  router.push('/assessment')
}

const handleShareScore = () => {
  showMobileMenu.value = false
  const raw = localStorage.getItem('test_report')
  if (!raw) return
  try {
    const report = JSON.parse(raw)
    showShareModal(report)
  } catch (e) {}
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 键盘 Esc 关闭、开启时锁定滚动
const handleKeydown = (e) => {
  if (e.key === 'Escape' && showMobileMenu.value) {
    showMobileMenu.value = false
  }
}

watch(showMobileMenu, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

// 监听路由变化，更新激活码状态和报告状态
watch(() => route.path, () => {
  hasActivation.value = checkActivation()
  hasReport.value = localStorage.getItem('test_report') !== null
  loadActivationStatus()
})

// 🔧 监听自定义事件，在测评提交后刷新状态
const handleActivationUpdate = () => {
  console.log('🔄 [AppHeader] 收到激活状态更新通知，刷新状态...')
  hasActivation.value = checkActivation()
  hasReport.value = localStorage.getItem('test_report') !== null
  loadActivationStatus()
}

// 🔧 定时刷新激活码状态（每30秒）
let refreshTimer = null

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('activation-updated', handleActivationUpdate)
  loadActivationStatus()

  // 每30秒自动刷新一次状态
  refreshTimer = setInterval(() => {
    hasActivation.value = checkActivation()
    hasReport.value = localStorage.getItem('test_report') !== null
    if (hasActivation.value) {
      loadActivationStatus()
    }
  }, 30000)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('activation-updated', handleActivationUpdate)
  document.body.style.overflow = ''
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px; /* 统一导航高度，供下层页面计算可用高度 */
  border-bottom: 1px solid var(--border);
  z-index: 2000; /* 确保永远浮在内容区之上 */
  background: var(--bg-card);
  /* 优化渲染性能和清晰度 */
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

/* 左侧 Logo */
.header-left {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--text-title);
  font-weight: 700;
  font-size: 18px;
  transition: all 0.3s ease;
}

.logo-link:hover {
  color: var(--primary);
}

.logo-icon {
  color: var(--primary);
}

.logo-text {
  font-size: 16px;
  letter-spacing: 0.5px;
}

/* 中间导航 */
.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-body);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.nav-item:hover {
  background: var(--bg-section);
  color: var(--primary);
}

.nav-item.active {
  background: var(--bg-section);
  color: var(--primary);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: var(--primary);
  border-radius: 2px 2px 0 0;
}

/* 右侧工具按钮 */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--text-body);
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: var(--bg-section);
  color: var(--primary);
}

/* 汉堡按钮 */
.hamburger-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.hamburger-btn:hover {
  background: var(--bg-section);
}

.hamburger {
  position: relative;
  width: 20px;
  height: 14px;
}
.hamburger .line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--text-title);
  border-radius: 2px;
  transition: transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1),
              opacity 200ms ease, top 300ms ease;
}
.hamburger .line:nth-child(1) { top: 0; }
.hamburger .line:nth-child(2) { top: 6px; }
.hamburger .line:nth-child(3) { top: 12px; }

.hamburger.open .line:nth-child(1) {
  top: 6px;
  transform: rotate(45deg);
}
.hamburger.open .line:nth-child(2) {
  opacity: 0;
}
.hamburger.open .line:nth-child(3) {
  top: 6px;
  transform: rotate(-45deg);
}

/* 移动端下拉菜单（Popover） */
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.mobile-popover {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 56px);
  right: 12px;
  width: 180px;
  background: var(--bg-card);
  color: var(--text-body);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px;
  animation: pop-in 160ms ease;
}

.popover-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-body);
  font-size: 14px;
}

.popover-item:hover { 
  background: var(--bg-section);
  color: var(--primary);
}

.popover-item .iconify { color: var(--primary); }

/* 激活码状态样式 */
.activation-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: var(--bg-section);
  color: var(--text-body);
  font-size: 12px;
  white-space: nowrap;
  margin-left: 8px;
}

.activation-status .iconify {
  color: var(--primary);
  flex-shrink: 0;
}

.status-text {
  font-weight: 500;
}

/* 移动端菜单分隔线 */
.popover-divider {
  height: 1px;
  background: var(--border);
  margin: 8px 0;
}

/* 移动端激活码状态 */
.activation-status-mobile {
  color: var(--text-secondary);
  font-size: 13px;
  cursor: default;
  padding: 10px 16px;
}

.activation-status-mobile:hover {
  background: transparent;
  color: var(--text-secondary);
}

.activation-status-mobile .iconify {
  color: var(--primary);
}

/* 移动端操作按钮（更换激活码、再测一次、分享分数） */
.popover-action {
  color: var(--primary);
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
}

.popover-action:hover {
  background: var(--bg-section);
  color: var(--primary);
}

/* 响应式 */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

/* 测评页面布局：桌面端17%留白 */
@media (min-width: 769px) {
  .app-header.assessment-layout .header-container {
    padding-left: 22%;
    padding-right: 22%;
  }
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: flex;
  }

  .header-container {
    padding: 10px 16px;
  }

  .logo-text {
    font-size: 15px;
  }

  /* 小屏下配色选择器单列，避免挤压 */
  .color-schemes {
    grid-template-columns: 1fr;
  }
}

/* 桌面端：与页面内容保持一致的左右留白（约 17%） */
@media (min-width: 769px) {
  .header-container {
    max-width: none;
    padding-left: 22%;
    padding-right: 22%;
  }
}

/* 动画 */
/* 遮罩淡入 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 200ms ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

@keyframes pop-in {
  from { transform: translateY(-6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

