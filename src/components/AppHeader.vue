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
      </nav>

      <!-- 右侧：工具按钮 -->
      <div class="header-right">
        <!-- 配色切换按钮 -->
        <button 
          @click="showColorPicker = !showColorPicker" 
          class="icon-btn" 
          title="切换配色"
        >
          <span class="iconify" data-icon="mdi:palette" data-width="20" data-height="20"></span>
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

    <!-- 配色选择器弹窗（Telelport到body，避免被Header影响定位） -->
    <teleport to="body">
      <transition name="fade">
        <div v-if="showColorPicker" class="color-picker-modal" @click="showColorPicker = false">
          <div class="color-picker-content" @click.stop>
            <h3 class="picker-title">选择配色方案</h3>
            <div class="color-schemes minimal">
              <div
                v-for="scheme in colorSchemes"
                :key="scheme.id"
                class="scheme-item minimal"
                :class="{ active: currentScheme === scheme.id }"
                @click="selectScheme(scheme.id)"
              >
                <div class="scheme-name">{{ scheme.name }}</div>
                <div class="scheme-chip">
                  <span class="surface" :class="scheme.id"></span>
                  <span class="primary" :style="{ background: scheme.primary }"></span>
                  <span v-if="currentScheme === scheme.id" class="check">
                    <span class="iconify" data-icon="mdi:check" data-width="16" data-height="16"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

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
          </div>
        </div>
      </transition>
    </teleport>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useColorScheme } from '@/composables/useColorScheme'
import { checkActivation } from '@/utils/activation'

const route = useRoute()
const { currentScheme, colorSchemes, setColorScheme } = useColorScheme()

const showColorPicker = ref(false)
const showMobileMenu = ref(false)

const currentPath = computed(() => route.path)

const hasActivation = computed(() => {
  return checkActivation()
})

const hasReport = computed(() => {
  return localStorage.getItem('test_report') !== null
})

const selectScheme = (schemeId) => {
  setColorScheme(schemeId)
  showColorPicker.value = false
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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  height: 56px; /* 统一导航高度，供下层页面计算可用高度 */
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 8px var(--shadow);
  z-index: 100;
  backdrop-filter: blur(10px);
  background: rgba(var(--bg-card-rgb), 0.95);
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

/* 配色选择器弹窗 */
.color-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.color-picker-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 16px;
  width: calc(100% - 32px);
  max-width: 380px;
  max-height: 78vh;
  overflow: auto;
  box-shadow: 0 6px 24px var(--shadow-deep);
  border: 1px solid var(--border);
}

.picker-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 20px;
  text-align: center;
}

.color-schemes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.color-schemes.minimal { grid-template-columns: 1fr; gap: 8px; }

.scheme-item {
  box-sizing: border-box;
  padding: 14px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--bg-section);
}
.scheme-item.minimal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 10px;
}

.scheme-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.scheme-item.active {
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: 0 2px 12px var(--shadow-medium);
}

.scheme-chip {
  position: relative;
  width: 86px;
  height: 28px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-section);
  border: 1px solid var(--border);
}
.scheme-chip .surface {
  position: absolute;
  inset: 0;
  border-radius: 8px;
}
.scheme-chip .primary {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 36%;
}
.scheme-chip .check {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-title);
}

.scheme-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.scheme-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-body);
}

.scheme-check {
  color: var(--primary);
}

/* 预览 surface 背景色与深浅方案匹配 */
.surface.scheme1-light { background: #FFFFFF; }
.surface.scheme1-dark { background: #2A2624; }
.surface.scheme2-light { background: #FFFFFF; }
.surface.scheme2-dark { background: #252A25; }

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
  box-shadow: 0 12px 32px var(--shadow-deep);
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 遮罩淡入 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 200ms ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to { opacity: 0; }

@keyframes panel-in {
  from { transform: translateX(16px); opacity: 0.8; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes pop-in {
  from { transform: translateY(-6px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

