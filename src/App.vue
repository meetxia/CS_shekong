<template>
  <div id="app" :class="colorScheme">
    <AppHeader />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useColorScheme } from './composables/useColorScheme'
import AppHeader from '@/components/AppHeader.vue'

const { currentScheme, initColorScheme } = useColorScheme()
const colorScheme = computed(() => currentScheme.value || 'scheme1-light')
const previousScheme = ref('')

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

