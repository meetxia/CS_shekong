/**
 * 服务器基础功能测试
 */
import { describe, it, expect } from 'vitest'

describe('服务器配置测试', () => {
  it('环境变量应该正确配置', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })

  it('端口配置应该有默认值', () => {
    const port = process.env.PORT || 3001
    expect(port).toBeDefined()
    expect(Number(port)).toBeGreaterThan(0)
  })
})
