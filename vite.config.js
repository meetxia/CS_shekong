import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  build: {
    // 生产环境优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'echarts-vendor': ['echarts'],
          'utils': ['dayjs']
        }
      }
    }
  }
})

