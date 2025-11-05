import { ref, onMounted } from 'vue'

const currentScheme = ref('scheme1-dark')

export function useColorScheme() {
  // 只保留雪尽霜余主题
  const colorSchemes = [
    { id: 'scheme1-light', name: '雪尽霜余 · 浅色', primary: '#BA9B92' },
    { id: 'scheme1-dark', name: '雪尽霜余 · 深色', primary: '#D4B5AC' }
  ]

  const setColorScheme = (schemeId) => {
    currentScheme.value = schemeId
    localStorage.setItem('preferred_color_scheme', schemeId)
  }

  // 切换深浅色模式
  const toggleColorScheme = () => {
    const newScheme = currentScheme.value === 'scheme1-dark' ? 'scheme1-light' : 'scheme1-dark'
    setColorScheme(newScheme)
  }

  const initColorScheme = () => {
    const saved = localStorage.getItem('preferred_color_scheme')
    if (saved && (saved === 'scheme1-dark' || saved === 'scheme1-light')) {
      currentScheme.value = saved
    } else {
      // 默认使用深色模式
      currentScheme.value = 'scheme1-dark'
      // 保存默认设置
      localStorage.setItem('preferred_color_scheme', 'scheme1-dark')
    }
  }

  // 判断是否为深色模式
  const isDark = () => currentScheme.value === 'scheme1-dark'

  return {
    currentScheme,
    colorSchemes,
    setColorScheme,
    toggleColorScheme,
    initColorScheme,
    isDark
  }
}

