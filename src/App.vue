<template>
  <div id="app" :class="colorScheme">
    <AppHeader v-if="!isAdminRoute" />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useColorScheme } from './composables/useColorScheme'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const { currentScheme, initColorScheme } = useColorScheme()
const colorScheme = computed(() => currentScheme.value || 'scheme1-dark')
const previousScheme = ref('')

// 判断是否是后台路由
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

onMounted(() => {
  initColorScheme()
  applySchemeToBody(colorScheme.value)
})

const applySchemeToBody = (scheme) => {
  if (!scheme) return
  if (previousScheme.value) {
    document.body.classList.remove(previousScheme.value)
  }
  document.body.classList.add(scheme)
  previousScheme.value = scheme
}

watch(colorScheme, (scheme) => {
  applySchemeToBody(scheme)
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

