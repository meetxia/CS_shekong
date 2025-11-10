/**
 * Toast提示工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { showToast, hideToast, showSuccess, showError, showWarning } from '../toast.js'

describe('Toast提示工具测试', () => {
  beforeEach(() => {
    // 清理DOM和隐藏当前toast
    hideToast()
    document.body.innerHTML = ''
  })

  describe('showToast - 基础提示', () => {
    it('应该显示基础提示', () => {
      showToast('测试消息')
      const toast = document.querySelector('.toast')
      expect(toast).toBeTruthy()
      expect(toast.textContent).toContain('测试消息')
    })

    it('应该支持不同类型', () => {
      showToast('成功', 'success')
      let toast = document.querySelector('.toast')
      expect(toast.classList.contains('toast-success')).toBe(true)
      
      hideToast()
      showToast('错误', 'error')
      toast = document.querySelector('.toast')
      expect(toast.classList.contains('toast-error')).toBe(true)
    })

    it('应该支持自定义持续时间', () => {
      vi.useFakeTimers()
      showToast('测试', 'info', 1000)
      expect(document.querySelector('.toast')).toBeTruthy()
      
      // 等待足够长的时间让所有setTimeout完成
      vi.advanceTimersByTime(2000)
      expect(document.querySelector('.toast')).toBeFalsy()
      vi.useRealTimers()
    })
  })

  describe('快捷方法', () => {
    it('showSuccess应该显示成功提示', () => {
      showSuccess('操作成功')
      const toast = document.querySelector('.toast')
      expect(toast).toBeTruthy()
    })

    it('showError应该显示错误提示', () => {
      showError('操作失败')
      const toast = document.querySelector('.toast')
      expect(toast).toBeTruthy()
    })

    it('showWarning应该显示警告提示', () => {
      showWarning('警告信息')
      const toast = document.querySelector('.toast')
      expect(toast).toBeTruthy()
    })
  })

  describe('hideToast - 隐藏提示', () => {
    it('应该能够手动隐藏提示', () => {
      showToast('测试')
      expect(document.querySelector('.toast')).toBeTruthy()
      
      hideToast()
      expect(document.querySelector('.toast')).toBeFalsy()
    })
  })

  describe('多个提示处理', () => {
    it('应该替换之前的提示', () => {
      showToast('第一个')
      showToast('第二个')
      
      const toasts = document.querySelectorAll('.toast')
      expect(toasts.length).toBeLessThanOrEqual(1)
    })
  })
})
