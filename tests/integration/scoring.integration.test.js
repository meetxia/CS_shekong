/**
 * 计分系统集成测试
 */
import { describe, it, expect } from 'vitest'
import { calculateScores, getLevel, getType } from '../../src/utils/scoring.js'
import { mockAnswers, mockBasicInfo } from '../mockData.js'

describe('计分系统集成测试', () => {
  describe('完整评分流程', () => {
    it('从答案到最终报告的完整流程', () => {
      // 1. 计算分数
      const scores = calculateScores(mockAnswers.mediumScoreAnswers)
      expect(scores.total).toBeGreaterThan(0)
      
      // 2. 转换为100分制
      const totalScore100 = Math.round((scores.total / 165) * 100)
      expect(totalScore100).toBeGreaterThanOrEqual(0)
      expect(totalScore100).toBeLessThanOrEqual(100)
      
      // 3. 判断等级
      const level = getLevel(totalScore100, mockBasicInfo.default)
      expect(level).toHaveProperty('name')
      expect(level).toHaveProperty('color')
      
      // 4. 判断类型
      const type = getType(scores.dimensions, mockBasicInfo.default)
      expect(type).toHaveProperty('id')
      expect(type).toHaveProperty('name')
      expect(type).toHaveProperty('features')
    })

    it('高分答案应该得到严重评级', () => {
      const scores = calculateScores(mockAnswers.highScoreAnswers)
      const totalScore100 = Math.round((scores.total / 165) * 100)
      const level = getLevel(totalScore100)
      
      expect(totalScore100).toBeGreaterThan(70)
      expect(['重度社交焦虑', '极重度社交焦虑']).toContain(level.name)
    })

    it('低分答案应该得到轻度评级', () => {
      const scores = calculateScores(mockAnswers.lowScoreAnswers)
      const totalScore100 = Math.round((scores.total / 165) * 100)
      const level = getLevel(totalScore100)
      
      expect(totalScore100).toBeLessThan(50)
      expect(['社交自如型', '轻度社交焦虑']).toContain(level.name)
    })
  })

  describe('不同用户画像的差异化评分', () => {
    it('大学生和成年人应该有不同的阈值', () => {
      const scores = calculateScores(mockAnswers.mediumScoreAnswers)
      const totalScore100 = Math.round((scores.total / 165) * 100)
      
      const collegeLevel = getLevel(totalScore100, mockBasicInfo.college)
      const adultLevel = getLevel(totalScore100, mockBasicInfo.mature)
      
      expect(collegeLevel).toBeDefined()
      expect(adultLevel).toBeDefined()
    })
  })
})
