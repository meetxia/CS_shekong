/**
 * 激活码集成测试
 * 测试激活码从生成到验证的完整流程
 */
import { describe, it, expect } from 'vitest'
import { 
  formatActivationCode, 
  validateActivationCode 
} from '../../src/utils/activation.js'

describe('激活码集成测试', () => {
  describe('激活码完整流程', () => {
    it('格式化后的激活码应该通过验证', () => {
      const input = 'test2024abcd'
      const formatted = formatActivationCode(input)
      const isValid = validateActivationCode(formatted)
      
      expect(formatted).toBe('TEST-2024-ABCD')
      expect(isValid).toBe(true)
    })

    it('应该处理各种输入格式', () => {
      const inputs = [
        'test2024abcd',
        'TEST2024ABCD',
        'TEST-2024-ABCD',
        'test-2024-abcd',
        ' test 2024 abcd '
      ]
      
      inputs.forEach(input => {
        const formatted = formatActivationCode(input)
        expect(formatted).toBe('TEST-2024-ABCD')
        expect(validateActivationCode(formatted)).toBe(true)
      })
    })
  })

  describe('无效激活码处理', () => {
    it('应该拒绝所有无效格式', () => {
      const invalidCodes = [
        'short',
        'TOOLONG-TOOLONG-TOOLONG',
        'TEST_2024_ABCD',
        'test-2024-abcd', // 小写
        'TEST-2024-AB@D', // 特殊字符
        ''
      ]
      
      invalidCodes.forEach(code => {
        expect(validateActivationCode(code)).toBe(false)
      })
    })
  })
})
