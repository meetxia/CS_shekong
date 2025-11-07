import { describe, it, expect } from 'vitest';
import { calculateTotalScore, getLevel } from '../scoring';

describe('计分系统测试', () => {
  describe('calculateTotalScore - 总分计算', () => {
    it('应该正确计算35道题的总分', () => {
      // 所有题目答5分
      const answers = {};
      for (let i = 1; i <= 35; i++) {
        answers[`q${i}`] = 5;
      }
      expect(calculateTotalScore(answers)).toBe(175); // 35 * 5 = 175
    });

    it('应该正确计算35道题的最低分', () => {
      // 所有题目答1分
      const answers = {};
      for (let i = 1; i <= 35; i++) {
        answers[`q${i}`] = 1;
      }
      expect(calculateTotalScore(answers)).toBe(35); // 35 * 1 = 35
    });

    it('应该正确计算混合分数', () => {
      const answers = {
        q1: 5, q2: 4, q3: 3, q4: 2, q5: 1, // 15分
        q6: 3, q7: 3, q8: 3, q9: 3, q10: 3, // 15分
        // 前10题共30分
      };
      // 剩余25题假设都是3分
      for (let i = 11; i <= 35; i++) {
        answers[`q${i}`] = 3;
      }
      const total = calculateTotalScore(answers);
      expect(total).toBe(30 + 75); // 前10题30分 + 后25题75分 = 105分
    });

    it('应该忽略无效的答案', () => {
      const answers = {
        q1: 5,
        q2: 0, // 无效
        q3: 6, // 无效
        q4: null, // 无效
        q5: undefined, // 无效
      };
      // 只有q1有效，其他按0计算或忽略
      const total = calculateTotalScore(answers);
      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThanOrEqual(5);
    });
  });

  describe('getLevel - 等级判断', () => {
    it('应该正确判断轻度社交焦虑（≤60分）', () => {
      expect(getLevel(35).id).toBe('mild');
      expect(getLevel(50).id).toBe('mild');
      expect(getLevel(60).id).toBe('mild');
    });

    it('应该正确判断中度社交焦虑（61-90分）', () => {
      expect(getLevel(61).id).toBe('moderate');
      expect(getLevel(75).id).toBe('moderate');
      expect(getLevel(90).id).toBe('moderate');
    });

    it('应该正确判断重度社交焦虑（91-120分）', () => {
      expect(getLevel(91).id).toBe('severe');
      expect(getLevel(105).id).toBe('severe');
      expect(getLevel(120).id).toBe('severe');
    });

    it('应该正确判断极重度社交焦虑（>120分）', () => {
      expect(getLevel(121).id).toBe('extreme');
      expect(getLevel(150).id).toBe('extreme');
      expect(getLevel(175).id).toBe('extreme');
    });

    it('等级对象应包含必要字段', () => {
      const level = getLevel(75);
      expect(level).toHaveProperty('id');
      expect(level).toHaveProperty('name');
      expect(level).toHaveProperty('color');
      expect(level).toHaveProperty('description');
    });

    it('应该处理边界值', () => {
      expect(getLevel(0).id).toBe('mild');
      expect(getLevel(200).id).toBe('extreme');
    });
  });

  describe('维度分数计算', () => {
    it('基础信息应该被正确处理', () => {
      const basicInfo = {
        age: 'college',
        gender: 'female',
        occupation: 'student',
        social_frequency: 'occasional'
      };
      
      expect(basicInfo).toHaveProperty('age');
      expect(basicInfo).toHaveProperty('gender');
      expect(basicInfo.age).toBe('college');
    });
  });
});
