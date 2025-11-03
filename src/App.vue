<template>
  <div id="app" :class="colorScheme">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useColorScheme } from './composables/useColorScheme'

const { currentScheme, initColorScheme } = useColorScheme()
const colorScheme = computed(() => currentScheme.value || 'scheme1-light')

onMounted(() => {
  initColorScheme()
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

