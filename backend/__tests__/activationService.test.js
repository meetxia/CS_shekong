/**
 * 激活码服务测试
 */
import { describe, it, expect } from 'vitest';
import { generateActivationCode } from '../activationService.js';

describe('激活码服务 - 基础功能测试', () => {
  describe('generateActivationCode - 生成激活码', () => {
    it('应该生成正确格式的激活码', () => {
      const code = generateActivationCode()
      expect(code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
    })

    it('应该生成不同的激活码', () => {
      const codes = new Set()
      for (let i = 0; i < 50; i++) {
        codes.add(generateActivationCode())
      }
      expect(codes.size).toBe(50)
    })

    it('激活码长度应该是14个字符', () => {
      const code = generateActivationCode()
      expect(code.length).toBe(14)
    })

    it('激活码应该只包含大写字母和数字', () => {
      const code = generateActivationCode()
      expect(code.replace(/-/g, '')).toMatch(/^[A-Z0-9]+$/)
    })
  })
})
