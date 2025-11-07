<template>
  <div class="login-container">
    <div class="login-card card">
      <div class="login-header">
        <h2 class="text-title">管理员登录</h2>
        <p class="text-secondary">社恐测评系统 Console</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username" class="form-label">用户名</label>
          <input
            id="username"
            type="text"
            class="input"
            v-model="username"
            placeholder="请输入用户名"
            required
            autocomplete="username"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">密码</label>
          <input
            id="password"
            type="password"
            class="input"
            v-model="password"
            placeholder="请输入密码"
            required
            autocomplete="current-password"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <button
          type="submit"
          class="btn-primary btn-block"
          :disabled="loading"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="login-footer">
        <router-link to="/" class="text-secondary">← 返回前台</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminLogin } from '@/utils/adminAuth'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请填写用户名和密码'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const result = await adminLogin(username.value, password.value)
    
    if (result.success) {
      // 登录成功，跳转到管理后台
      router.push('/admin/dashboard')
    } else {
      error.value = result.error || '登录失败'
    }
  } catch (err) {
    error.value = err.message || '网络错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  margin-bottom: 8px;
  color: var(--color-text);
}

.login-header p {
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--color-text);
}

.input {
  width: 100%;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 16px;
}

.error-message {
  padding: 12px;
  margin-bottom: 16px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 6px;
  color: #c33;
  font-size: 14px;
  text-align: center;
}

.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.login-footer a {
  text-decoration: none;
  font-size: 14px;
}

.login-footer a:hover {
  text-decoration: underline;
}
</style>

