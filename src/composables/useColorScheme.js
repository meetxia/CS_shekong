import { ref, onMounted } from 'vue'

const currentScheme = ref('scheme1-light')

export function useColorScheme() {
  const colorSchemes = [
    { id: 'scheme1-light', name: '雪尽霜余（浅色）', primary: '#BA9B92' },
    { id: 'scheme1-dark', name: '雪尽霜余（深色）', primary: '#D4B5AC' },
    { id: 'scheme2-light', name: '芩江初雪（浅色）', primary: '#8BA995' },
    { id: 'scheme2-dark', name: '芩江初雪（深色）', primary: '#A8C9A8' }
  ]

  const setColorScheme = (schemeId) => {
    currentScheme.value = schemeId
    localStorage.setItem('preferred_color_scheme', schemeId)
  }

  const initColorScheme = () => {
    const saved = localStorage.getItem('preferred_color_scheme')
    if (saved) {
      currentScheme.value = saved
    } else {
      // 自动跟随系统深色模式
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentScheme.value = isDark ? 'scheme1-dark' : 'scheme1-light'
    }
  }

  return {
    currentScheme,
    colorSchemes,
    setColorScheme,
    initColorScheme
  }
}

