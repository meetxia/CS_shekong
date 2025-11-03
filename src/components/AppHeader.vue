<template>
  <header class="app-header">
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

    <!-- 配色选择器弹窗 -->
    <transition name="fade">
      <div v-if="showColorPicker" class="color-picker-modal" @click="showColorPicker = false">
        <div class="color-picker-content" @click.stop>
          <h3 class="picker-title">选择配色方案</h3>
          <div class="color-schemes">
            <div
              v-for="scheme in colorSchemes"
              :key="scheme.id"
              class="scheme-item"
              :class="{ active: currentScheme === scheme.id }"
              @click="selectScheme(scheme.id)"
            >
              <div class="scheme-preview" :style="{ background: scheme.primary }"></div>
              <div class="scheme-info">
                <div class="scheme-name">{{ scheme.name }}</div>
                <div v-if="currentScheme === scheme.id" class="scheme-check">
                  <span class="iconify" data-icon="mdi:check-circle" data-width="18" data-height="18"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- 移动端菜单 -->
    <transition name="overlay-fade">
      <div v-if="showMobileMenu" class="mobile-menu" @click="showMobileMenu = false">
        <div class="mobile-menu-content" @click.stop>
          <div class="mobile-menu-header">
            <span class="menu-title">菜单</span>
            <button @click="showMobileMenu = false" class="close-btn">
              <span class="iconify" data-icon="mdi:close" data-width="24" data-height="24"></span>
            </button>
          </div>
          <nav class="mobile-nav">
            <router-link 
              to="/" 
              class="mobile-nav-item" 
              @click="showMobileMenu = false"
            >
              <span class="iconify" data-icon="mdi:home" data-width="20" data-height="20"></span>
              <span>首页</span>
            </router-link>
            <router-link 
              v-if="hasActivation" 
              to="/assessment" 
              class="mobile-nav-item" 
              @click="showMobileMenu = false"
            >
              <span class="iconify" data-icon="mdi:clipboard-text" data-width="20" data-height="20"></span>
              <span>开始测评</span>
            </router-link>
            <router-link 
              v-if="hasReport" 
              to="/report" 
              class="mobile-nav-item" 
              @click="showMobileMenu = false"
            >
              <span class="iconify" data-icon="mdi:chart-box" data-width="20" data-height="20"></span>
              <span>查看报告</span>
            </router-link>
          </nav>
        </div>
      </div>
    </transition>
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
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px var(--shadow-deep);
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

.scheme-item {
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-section);
}

.scheme-item:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.scheme-item.active {
  border-color: var(--primary);
  background: var(--bg-card);
  box-shadow: 0 4px 16px var(--shadow-medium);
}

.scheme-preview {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

/* 移动端菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: flex-end;
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  max-width: 80%;
  background: var(--bg-card);
  box-shadow: -4px 0 16px var(--shadow-deep);
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  will-change: transform, opacity;
  animation: panel-in 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-menu-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-title);
}

.close-btn {
  width: 36px;
  height: 36px;
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

.close-btn:hover {
  background: var(--bg-section);
  color: var(--primary);
}

.mobile-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--text-body);
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.mobile-nav-item:hover {
  background: var(--bg-section);
  color: var(--primary);
}

.mobile-nav-item .iconify {
  color: var(--primary);
}

/* 响应式 */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
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
</style>

