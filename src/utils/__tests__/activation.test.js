import { describe, it, expect } from 'vitest';
import { formatActivationCode, validateActivationCode } from '../activation';

describe('激活码工具函数测试', () => {
  describe('formatActivationCode - 激活码格式化', () => {
    it('应该正确格式化无连字符的激活码', () => {
      expect(formatActivationCode('TEST2024ABCD')).toBe('TEST-2024-ABCD');
      expect(formatActivationCode('1234567890AB')).toBe('1234-5678-90AB');
    });

    it('应该正确格式化已有连字符的激活码', () => {
      expect(formatActivationCode('test-2024-abcd')).toBe('TEST-2024-ABCD');
      expect(formatActivationCode('TEST-2024-ABCD')).toBe('TEST-2024-ABCD');
    });

    it('应该将小写字母转为大写', () => {
      expect(formatActivationCode('test-2024-abcd')).toBe('TEST-2024-ABCD');
      expect(formatActivationCode('abc-def-ghi')).toBe('ABC-DEF-GHI');
    });

    it('应该移除多余的空格', () => {
      expect(formatActivationCode(' TEST 2024 ABCD ')).toBe('TEST-2024-ABCD');
    });

    it('应该处理空字符串', () => {
      expect(formatActivationCode('')).toBe('');
      expect(formatActivationCode('   ')).toBe('');
    });
  });

  describe('validateActivationCode - 激活码验证', () => {
    it('应该验证正确格式的激活码', () => {
      expect(validateActivationCode('TEST-2024-ABCD')).toBe(true);
      expect(validateActivationCode('1234-5678-9ABC')).toBe(true);
      expect(validateActivationCode('AAAA-BBBB-CCCC')).toBe(true);
      expect(validateActivationCode('0000-0000-0000')).toBe(true);
    });

    it('应该拒绝长度不正确的激活码', () => {
      expect(validateActivationCode('TEST-2024')).toBe(false);
      expect(validateActivationCode('TEST-2024-ABC')).toBe(false);
      expect(validateActivationCode('TEST-2024-ABCDE')).toBe(false);
    });

    it('应该拒绝格式不正确的激活码', () => {
      expect(validateActivationCode('TEST20243BCD')).toBe(false); // 缺少连字符
      expect(validateActivationCode('TEST_2024_ABCD')).toBe(false); // 错误分隔符
    });

    it('应该拒绝包含小写字母的激活码', () => {
      expect(validateActivationCode('test-2024-abcd')).toBe(false);
      expect(validateActivationCode('TEST-2024-abcd')).toBe(false);
    });

    it('应该拒绝包含特殊字符的激活码', () => {
      expect(validateActivationCode('TEST-2024-AB@D')).toBe(false);
      expect(validateActivationCode('TEST-2024-AB#D')).toBe(false);
    });

    it('应该拒绝空字符串', () => {
      expect(validateActivationCode('')).toBe(false);
      expect(validateActivationCode('   ')).toBe(false);
    });
  });
});
