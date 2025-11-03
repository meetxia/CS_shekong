<template>
  <div class="activation-page container page">
    <!-- 返回首页按钮 -->
    <button @click="goHome" class="btn-back-home">
      &lt; 返回首页
    </button>

    <div class="content">
      <!-- 标题区域 -->
      <div class="header fade-in">
        <h1 class="title text-title">社恐程度专业测评</h1>
        <p class="subtitle text-secondary">Social Anxiety Assessment</p>
        <div class="divider"></div>
      </div>

      <!-- 说明文字 -->
      <div class="intro fade-in" style="animation-delay: 0.1s">
        <p class="intro-text text-body">基于SAS社交焦虑量表改良</p>
        <p class="intro-text text-body">30题 · 5-8分钟 · 专业分析</p>
      </div>

      <!-- 激活码输入卡片 -->
      <div class="input-card card fade-in" style="animation-delay: 0.2s">
        <label class="input-label text-secondary">请输入您的激活码</label>
        <input
          v-model="activationCode"
          @input="handleInput"
          @focus="isFocused = true"
          @blur="isFocused = false"
          type="text"
          placeholder="输入激活码..."
          class="input-field"
          :class="{ 'focused': isFocused, 'error': error }"
          maxlength="14"
        />
        <p class="input-hint text-secondary">激活码格式：XXXX-XXXX-XXXX</p>
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>

      <!-- 开始按钮 -->
      <button
        @click="handleStart"
        :disabled="!isValid || loading"
        class="btn-primary btn-start fade-in"
        style="animation-delay: 0.3s"
      >
        <span v-if="!loading">开始测评</span>
        <span v-else class="loading-text">
          <span class="loading"></span>
          验证中...
        </span>
      </button>

      <!-- 帮助文字 -->
      <p class="help-text text-secondary fade-in" style="animation-delay: 0.4s">
        激活码无效？请检查格式或联系客服
      </p>
    </div>

    <!-- 底部说明 -->
    <div class="footer fade-in" style="animation-delay: 0.5s">
      <div class="divider-small"></div>
      <p class="footer-text text-disabled">数据安全 · 隐私保护 · 仅供自我探索</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatActivationCode, validateActivationCode, verifyActivationCode, saveActivation } from '@/utils/activation'
import { showToast } from '@/utils/toast'

const router = useRouter()

const activationCode = ref('')
const isFocused = ref(false)
const loading = ref(false)
const error = ref('')

const isValid = computed(() => {
  return validateActivationCode(activationCode.value)
})

const handleInput = (e) => {
  error.value = ''
  activationCode.value = formatActivationCode(e.target.value)
}

const goHome = () => {
  router.push('/')
}

const handleStart = async () => {
  if (!isValid.value) {
    error.value = '请输入正确格式的激活码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const valid = await verifyActivationCode(activationCode.value)
    
    if (valid) {
      saveActivation(activationCode.value)
      showToast('激活成功！', 1500, 'success')
      
      // 延迟跳转以显示成功提示
      setTimeout(() => {
        router.push('/assessment')
      }, 1500)
    } else {
      error.value = '激活码无效，请检查后重试'
      showToast('激活码无效，请检查后重试', 2000, 'error')
    }
  } catch (err) {
    error.value = '验证失败，请稍后重试'
    showToast('验证失败，请稍后重试', 2000, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.activation-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 100vh;
  padding: 60px 20px 40px;
  position: relative;
}

.btn-back-home {
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  padding: 8px 12px;
  transition: all 0.3s ease;
  z-index: 10;
}

.btn-back-home:hover {
  color: var(--primary);
  transform: translateX(-2px);
}

.content {
  width: 100%;
  max-width: 500px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 标题区域 */
.header {
  text-align: center;
  margin-bottom: 40px;
  width: 100%;
}

.title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
  line-height: 1.3;
}

.subtitle {
  font-size: 14px;
  margin-bottom: 24px;
}

.divider {
  width: 200px;
  height: 1px;
  background: var(--border);
  margin: 0 auto;
}

/* 介绍文字 */
.intro {
  text-align: center;
  margin-bottom: 40px;
}

.intro-text {
  font-size: 16px;
  line-height: 1.8;
}

/* 输入卡片 */
.input-card {
  width: 100%;
  margin-bottom: 24px;
  padding: 24px;
}

.input-label {
  display: block;
  font-size: 16px;
  margin-bottom: 12px;
}

.input-field {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-size: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-body);
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: var(--text-disabled);
}

.input-field.focused {
  border: 2px solid var(--primary);
  padding: 0 15px; /* 补偿边框增加的1px */
}

.input-field.error {
  border-color: var(--error);
}

.input-hint {
  font-size: 12px;
  margin-top: 8px;
}

.error-text {
  color: var(--error);
  font-size: 12px;
  margin-top: 8px;
}

/* 按钮 */
.btn-start {
  width: 100%;
  max-width: 500px;
  height: 56px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 帮助文字 */
.help-text {
  font-size: 12px;
  text-align: center;
}

/* 底部 */
.footer {
  width: 100%;
  max-width: 500px;
  text-align: center;
  padding-top: 40px;
}

.divider-small {
  width: 100%;
  height: 1px;
  background: var(--border);
  margin-bottom: 20px;
}

.footer-text {
  font-size: 12px;
}

/* 响应式 */
@media (max-width: 480px) {
  .title {
    font-size: 28px;
  }
  
  .activation-page {
    padding: 40px 20px 30px;
  }
}
</style>

