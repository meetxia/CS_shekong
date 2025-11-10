/**
 * Vitest 全局测试配置文件
 * 在所有测试文件执行前运行
 */

import { vi } from 'vitest'

// 模拟 localStorage
const store = {}
const localStorageMock = {
  getItem: vi.fn((key) => store[key] || null),
  setItem: vi.fn((key, value) => { store[key] = value }),
  removeItem: vi.fn((key) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]) }),
}
global.localStorage = localStorageMock

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock

// 模拟 window.location
delete global.window.location
global.window.location = {
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  reload: vi.fn(),
  replace: vi.fn(),
  assign: vi.fn(),
}

// 模拟 fetch API
global.fetch = vi.fn()

// 模拟 console 方法（可选，用于静默某些日志）
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  // log: vi.fn(), // 如果需要静默 log，取消注释
}

// 模拟环境变量
process.env.VITE_API_BASE_URL = 'http://localhost:3001'
process.env.NODE_ENV = 'test'

// 清理函数，在每个测试后执行
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})
