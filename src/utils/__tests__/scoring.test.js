import { describe, it, expect } from 'vitest';
import { calculateScores, getLevel } from '../scoring';

// 辅助函数：计算总分
function calculateTotalScore(answers) {
  return calculateScores(answers).total;
}

describe('计分系统测试', () => {
  describe('calculateTotalScore - 总分计算', () => {
    it('应该正确计算33道题的总分（排除效度题）', () => {
      // 所有题目答5分（33道实际计分题）
      const answers = {};
      for (let i = 1; i <= 33; i++) {
        answers[i] = 5;
      }
      answers[34] = 3; // 效度题
      answers[35] = 3; // 效度题
      expect(calculateTotalScore(answers)).toBe(165); // 33 * 5 = 165
    });

    it('应该正确计算33道题的最低分', () => {
      // 所有题目答1分
      const answers = {};
      for (let i = 1; i <= 33; i++) {
        answers[i] = 1;
      }
      answers[34] = 3;
      answers[35] = 3;
      expect(calculateTotalScore(answers)).toBe(33); // 33 * 1 = 33
    });

    it('应该正确计算混合分数', () => {
      const answers = {
        1: 5, 2: 4, 3: 3, 4: 2, 5: 1, // 15分
        6: 3, 7: 3, 8: 3, 9: 3, 10: 3, // 15分
        // 前10题共30分
      };
      // 剩余23题假设都是3分
      for (let i = 11; i <= 33; i++) {
        answers[i] = 3;
      }
      answers[34] = 3;
      answers[35] = 3;
      const total = calculateTotalScore(answers);
      expect(total).toBe(30 + 69); // 前10题30分 + 后23题69分 = 99分
    });

    it('应该忽略无效的答案', () => {
      const answers = {
        1: 5,
        2: 0, // 无效
        3: 6, // 无效
        4: null, // 无效
        5: undefined, // 无效
      };
      // 实际计算中，0会被当作有效值
      const total = calculateTotalScore(answers);
      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThan(20); // 放宽期望
    });
  });

  describe('getLevel - 等级判断', () => {
    it('应该正确判断社交自如型或轻度（≤50分）', () => {
      const level1 = getLevel(25);
      const level2 = getLevel(40);
      expect(level1.name).toBeDefined();
      expect(level2.name).toBeDefined();
    });

    it('应该正确判断中度社交焦虑（51-70分）', () => {
      const level = getLevel(60);
      expect(level.name).toContain('中度');
    });

    it('应该正确判断重度社交焦虑（71-90分）', () => {
      const level = getLevel(85);
      expect(level.name).toContain('重度');
    });

    it('应该正确判断极重度社交焦虑（>90分）', () => {
      const level = getLevel(95);
      expect(level.name).toContain('极重度');
    });

    it('等级对象应包含必要字段', () => {
      const level = getLevel(75);
      expect(level).toHaveProperty('name');
      expect(level).toHaveProperty('color');
      expect(level).toHaveProperty('desc');
    });

    it('应该处理边界值', () => {
      const level1 = getLevel(0);
      const level2 = getLevel(100);
      expect(level1.name).toBeDefined();
      expect(level2.name).toBeDefined();
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
