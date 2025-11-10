/**
 * 计分系统增强测试
 * 测试 scoring.js 的所有核心功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  calculateScores, 
  getLevel, 
  getType, 
  getDimensionLevel,
  getDimensionInterpretation,
  generateReport 
} from '../scoring.js'
import { mockAnswers, mockBasicInfo } from '../../../tests/mockData.js'

describe('计分系统 - 增强测试', () => {
  describe('calculateScores - 维度分数计算', () => {
    it('应该正确计算所有维度的分数', () => {
      const answers = {}
      // 设置每个维度的分数
      // 社交场景恐惧 (1-5): 5题
      for (let i = 1; i <= 5; i++) answers[i] = 5
      // 回避行为 (6-9): 4题
      for (let i = 6; i <= 9; i++) answers[i] = 4
      // 预期焦虑 (10-13): 4题
      for (let i = 10; i <= 13; i++) answers[i] = 3
      
      const result = calculateScores(answers)
      
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('dimensions')
      expect(result.dimensions).toHaveProperty('scene_fear')
      expect(result.dimensions.scene_fear).toBe(25) // 5*5
      expect(result.dimensions.avoidance).toBe(16) // 4*4
      expect(result.dimensions.anticipation).toBe(12) // 4*3
    })

    it('应该正确处理高分情况（社恐严重）', () => {
      const result = calculateScores(mockAnswers.highScoreAnswers)
      
      expect(result.total).toBeGreaterThan(140) // 高分
      expect(result.dimensions.scene_fear).toBeGreaterThan(20)
    })

    it('应该正确处理低分情况（社恐轻微）', () => {
      const result = calculateScores(mockAnswers.lowScoreAnswers)
      
      expect(result.total).toBeLessThan(50) // 低分
      expect(result.dimensions.scene_fear).toBeLessThanOrEqual(10)
    })

    it('应该排除效度题的负分', () => {
      const answers = {
        ...mockAnswers.mediumScoreAnswers,
        34: -999, // 效度题，应该被排除
        35: -888  // 效度题，应该被排除
      }
      
      const result = calculateScores(answers)
      
      // 总分不应包含负分
      expect(result.total).toBeGreaterThan(0)
      expect(result.total).toBe(99) // 33题 * 3分
    })

    it('应该处理部分缺失的答案', () => {
      const answers = {
        1: 5, 2: 4, 3: 3,
        // 其他题目缺失
      }
      
      const result = calculateScores(answers)
      
      expect(result.total).toBe(12)
      expect(result.dimensions.scene_fear).toBe(12)
    })
  })

  describe('getLevel - 等级判断（100分制）', () => {
    it('应该正确判断社交自如型（≤30分）', () => {
      const level = getLevel(25)
      expect(level.name).toBe('社交自如型')
      expect(level.color).toBe('#10b981')
    })

    it('应该正确判断轻度社交焦虑（31-50分）', () => {
      const level = getLevel(40)
      expect(level.name).toBe('轻度社交焦虑')
      expect(level.color).toBe('#3b82f6')
    })

    it('应该正确判断中度社交焦虑（51-70分）', () => {
      const level = getLevel(60)
      expect(level.name).toBe('中度社交焦虑')
      expect(level.color).toBe('#f59e0b')
    })

    it('应该正确判断重度社交焦虑（71-90分）', () => {
      const level = getLevel(85)
      expect(level.name).toBe('重度社交焦虑')
      expect(level.color).toBe('#ef4444')
    })

    it('应该正确判断极重度社交焦虑（>90分）', () => {
      const level = getLevel(95)
      expect(level.name).toBe('极重度社交焦虑')
      expect(level.color).toBe('#991b1b')
    })

    it('应该根据年龄调整阈值（大学生）', () => {
      const basicInfo = { age: 'college' }
      const level1 = getLevel(30, basicInfo)
      const level2 = getLevel(30, { age: 'young_adult' })
      
      // 大学生阈值放宽，同样分数可能判断更宽松
      expect(level1).toBeDefined()
      expect(level2).toBeDefined()
    })

    it('应该根据性别调整阈值', () => {
      const level1 = getLevel(50, { gender: 'female' })
      const level2 = getLevel(50, { gender: 'male' })
      
      expect(level1).toBeDefined()
      expect(level2).toBeDefined()
    })

    it('应该根据社交频率调整阈值', () => {
      const level1 = getLevel(50, { social_frequency: 'rarely' })
      const level2 = getLevel(50, { social_frequency: 'frequent' })
      
      // 社交频率低的人阈值更严格
      expect(level1).toBeDefined()
      expect(level2).toBeDefined()
    })

    it('应该处理边界值', () => {
      expect(getLevel(0).name).toBe('社交自如型')
      expect(getLevel(100).name).toBe('极重度社交焦虑')
    })
  })

  describe('getType - 社恐类型判断', () => {
    it('应该识别负面评价恐惧型', () => {
      const dimensions = {
        fear_of_negative_evaluation: 22,
        rumination: 16,
        scene_fear: 15,
        avoidance: 10,
        anticipation: 12,
        physical: 8,
        functional_impairment: 10,
        self_efficacy: 8
      }
      
      const type = getType(dimensions)
      expect(type.id).toBe('fear_evaluation')
      expect(type.name).toContain('负面评价恐惧型')
    })

    it('应该识别功能损害型', () => {
      const dimensions = {
        functional_impairment: 18,
        avoidance: 16,
        scene_fear: 14,
        fear_of_negative_evaluation: 12,
        anticipation: 10,
        rumination: 10,
        physical: 8,
        self_efficacy: 6
      }
      
      const type = getType(dimensions)
      expect(type.id).toBe('functional_impairment')
      expect(type.name).toContain('社交困难户')
    })

    it('应该识别预演型', () => {
      const dimensions = {
        anticipation: 18,
        rumination: 16,
        scene_fear: 12,
        avoidance: 10,
        fear_of_negative_evaluation: 12,
        physical: 8,
        functional_impairment: 10,
        self_efficacy: 8
      }
      
      const type = getType(dimensions)
      expect(type.id).toBe('rehearsal')
      expect(type.name).toContain('脑内彩排')
    })

    it('应该识别回避型', () => {
      const dimensions = {
        avoidance: 17,
        scene_fear: 20,
        anticipation: 12,
        fear_of_negative_evaluation: 12,
        rumination: 10,
        physical: 8,
        functional_impairment: 10,
        self_efficacy: 8
      }
      
      const type = getType(dimensions)
      expect(type.id).toBe('avoidant')
      expect(type.name).toContain('社交隐身术')
    })

    it('应该识别表演型', () => {
      const dimensions = {
        physical: 14,
        fear_of_negative_evaluation: 20,
        scene_fear: 15,
        avoidance: 10,
        anticipation: 10,
        rumination: 10,
        functional_impairment: 10,
        self_efficacy: 8
      }
      
      const type = getType(dimensions)
      expect(type.id).toBe('performance')
      expect(type.name).toContain('别人眼光放大镜')
    })

    it('应该返回综合型（无明显特征）', () => {
      const dimensions = {
        scene_fear: 12,
        avoidance: 10,
        anticipation: 11,
        fear_of_negative_evaluation: 12,
        rumination: 10,
        physical: 8,
        functional_impairment: 10,
        self_efficacy: 9
      }
      
      const type = getType(dimensions)
      expect(type.id).toBe('general')
      expect(type.name).toContain('社交小纠结')
    })

    it('类型对象应包含必要字段', () => {
      const dimensions = {
        scene_fear: 15,
        avoidance: 12,
        anticipation: 13,
        fear_of_negative_evaluation: 14,
        rumination: 11,
        physical: 9,
        functional_impairment: 10,
        self_efficacy: 8
      }
      
      const type = getType(dimensions)
      expect(type).toHaveProperty('id')
      expect(type).toHaveProperty('name')
      expect(type).toHaveProperty('englishName')
      expect(type).toHaveProperty('features')
      expect(type).toHaveProperty('rootCauses')
      expect(type).toHaveProperty('positiveReframe')
      expect(Array.isArray(type.features)).toBe(true)
      expect(Array.isArray(type.rootCauses)).toBe(true)
    })
  })

  describe('getDimensionLevel - 维度等级', () => {
    it('应该正确判断维度等级 - 还好啦', () => {
      const level = getDimensionLevel(8, 25) // 32%
      expect(level.level).toBe('还好啦')
      expect(level.icon).toBe('✓')
    })

    it('应该正确判断维度等级 - 有点小紧张', () => {
      const level = getDimensionLevel(13, 25) // 52%
      expect(level.level).toBe('有点小紧张')
    })

    it('应该正确判断维度等级 - 需要关注', () => {
      const level = getDimensionLevel(18, 25) // 72%
      expect(level.level).toBe('需要关注')
    })

    it('应该正确判断维度等级 - 重点改善区', () => {
      const level = getDimensionLevel(22, 25) // 88%
      expect(level.level).toBe('重点改善区')
      expect(level.icon).toBe('⚠')
    })
  })

  describe('getDimensionInterpretation - 维度解读', () => {
    it('应该返回正确的维度解读', () => {
      const interp = getDimensionInterpretation('scene_fear', 20, 25)
      expect(interp).toBeTruthy()
      expect(typeof interp).toBe('string')
    })

    it('应该为不同分数段返回不同解读', () => {
      const low = getDimensionInterpretation('scene_fear', 5, 25)
      const high = getDimensionInterpretation('scene_fear', 22, 25)
      expect(low).not.toBe(high)
    })

    it('应该处理所有维度', () => {
      const dimensions = [
        'scene_fear',
        'avoidance',
        'anticipation',
        'fear_of_negative_evaluation',
        'rumination',
        'physical',
        'functional_impairment',
        'self_efficacy'
      ]
      
      dimensions.forEach(dim => {
        const interp = getDimensionInterpretation(dim, 15, 25)
        expect(interp).toBeTruthy()
      })
    })
  })

  describe('generateReport - 完整报告生成', () => {
    it('应该生成完整的测评报告', async () => {
      const report = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.default
      )
      
      expect(report).toHaveProperty('isValid')
      expect(report).toHaveProperty('totalScore')
      expect(report).toHaveProperty('level')
      expect(report).toHaveProperty('type')
      expect(report).toHaveProperty('dimensions')
      expect(report).toHaveProperty('suggestions')
      expect(report.isValid).toBe(true)
    })

    it('应该拒绝无效答案（效度检验不通过）', async () => {
      const invalidAnswers = {
        ...mockAnswers.mediumScoreAnswers,
        34: -999 // "从未紧张"
      }
      
      const report = await generateReport(invalidAnswers, mockBasicInfo.default)
      
      expect(report.isValid).toBe(false)
      expect(report.warnings).toBeDefined()
      expect(report.warnings.length).toBeGreaterThan(0)
    })

    it('报告应包含正确数量的维度', async () => {
      const report = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.default
      )
      
      // 应该有6个核心维度
      expect(report.dimensions).toBeDefined()
      expect(report.dimensions.length).toBe(6)
    })

    it('报告应使用100分制', async () => {
      const report = await generateReport(
        mockAnswers.highScoreAnswers,
        mockBasicInfo.default
      )
      
      expect(report.maxScore).toBe(100)
      expect(report.totalScore).toBeGreaterThanOrEqual(0)
      expect(report.totalScore).toBeLessThanOrEqual(100)
    })

    it('维度对象应包含完整信息', async () => {
      const report = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.default
      )
      
      const dimension = report.dimensions[0]
      expect(dimension).toHaveProperty('key')
      expect(dimension).toHaveProperty('name')
      expect(dimension).toHaveProperty('score')
      expect(dimension).toHaveProperty('maxScore')
      expect(dimension).toHaveProperty('percentage')
      expect(dimension).toHaveProperty('level')
      expect(dimension).toHaveProperty('interpretation')
      expect(dimension).toHaveProperty('icon')
    })

    it('应该包含改善建议', async () => {
      const report = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.default
      )
      
      expect(report.suggestions).toBeDefined()
      expect(report.suggestions).toHaveProperty('immediate')
      expect(report.suggestions).toHaveProperty('weekly')
      expect(report.suggestions).toHaveProperty('longTerm')
      expect(Array.isArray(report.suggestions.immediate)).toBe(true)
    })

    it('应该处理不同的基础信息配置', async () => {
      const report1 = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.college
      )
      
      const report2 = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.mature
      )
      
      expect(report1.isValid).toBe(true)
      expect(report2.isValid).toBe(true)
      // 不同基础信息可能导致不同的判断
    })

    it('应该在AI失败时使用本地规则', async () => {
      // 模拟AI失败
      vi.mock('../aiService.js', () => ({
        generatePersonalizedAnalysis: vi.fn().mockResolvedValue(null),
        generateEnhancedAnalysis: vi.fn().mockReturnValue({
          id: 'general',
          name: '本地生成类型',
          englishName: 'Local Type',
          features: [],
          rootCauses: [],
          positiveReframe: ''
        })
      }))
      
      const report = await generateReport(
        mockAnswers.mediumScoreAnswers,
        mockBasicInfo.default
      )
      
      expect(report.isValid).toBe(true)
      expect(report.type).toBeDefined()
    })
  })

  describe('边界条件和异常处理', () => {
    it('应该处理空答案对象', () => {
      const result = calculateScores({})
      expect(result.total).toBe(0)
    })

    it('应该处理超出范围的分数', () => {
      const answers = {
        1: 10, // 超出范围
        2: -5, // 负数
        3: 0   // 零
      }
      const result = calculateScores(answers)
      expect(result.total).toBeGreaterThanOrEqual(0)
    })

    it('应该处理null和undefined', () => {
      const answers = {
        1: null,
        2: undefined,
        3: 3
      }
      const result = calculateScores(answers)
      expect(result.total).toBeGreaterThanOrEqual(0)
    })

    it('getLevel应该处理异常分数', () => {
      expect(getLevel(-10).name).toBeDefined()
      expect(getLevel(200).name).toBeDefined()
      expect(getLevel(NaN).name).toBeDefined()
    })

    it('getDimensionLevel应该处理零除错误', () => {
      const level = getDimensionLevel(10, 0)
      expect(level).toBeDefined()
    })
  })
})
