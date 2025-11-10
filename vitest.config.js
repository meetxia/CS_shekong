import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 测试环境
    environment: 'happy-dom',
    
    // 全局配置
    globals: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/**/*.{js,vue}',
        'backend/**/*.js'
      ],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        'backup/',
        'src/**/*.test.js',
        'src/**/__tests__/**',
        'backend/**/*.test.js',
        'backend/**/__tests__/**',
        '**/mockData.js',
        '**/constants.js'
      ],
      // 覆盖率阈值
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60
      }
    },
    
    // 测试包含模式
    include: [
      'src/**/*.test.js',
      'src/**/__tests__/**/*.js',
      'backend/**/*.test.js',
      'backend/**/__tests__/**/*.js',
      'tests/**/*.test.js'
    ],
    
    // 排除模式
    exclude: [
      '**/node_modules/**',
      'node_modules/**',
      'dist/',
      'docs/',
      'backup/',
      'backend/node_modules/**'
    ],
    
    // 设置测试超时
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 显示详细输出
    reporters: ['verbose', 'html'],
    
    // 设置线程
    threads: true,
    
    // 监听模式排除
    watchExclude: ['**/node_modules/**', '**/dist/**'],
    
    // 模拟配置
    setupFiles: ['./tests/setup.js']
  },
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@backend': fileURLToPath(new URL('./backend', import.meta.url))
    }
  }
})
