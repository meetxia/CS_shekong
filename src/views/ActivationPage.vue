<template>
  <div class="activation-page container page">

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
        <div class="value-cta">
          <span class="badge">7天有效</span>
          <span class="badge">每天3次</span>
          <span class="badge">最多21次</span>
          <span class="badge">可分享给朋友</span>
        </div>
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
      <div class="help-section fade-in" style="animation-delay: 0.4s">
        <p class="help-text text-secondary">
          激活码无效？请检查格式或联系客服
        </p>
        <div class="help-tips">
          <p class="tip-item">💡 每天可测评 3 次，有效期 7 天</p>
          <p class="tip-item">🕐 今日次数用完？明天 00:00 自动恢复</p>
          <p class="tip-item">📧 需要帮助？请联系客服获取支持</p>
        </div>
      </div>
    </div>

    <!-- 底部说明 -->
    <div class="footer fade-in" style="animation-delay: 0.5s">
      <div class="divider-small"></div>
      <p class="footer-text text-disabled">数据安全 · 隐私保护 · 仅供自我探索</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { formatActivationCode, validateActivationCode, verifyActivationCode, saveActivation } from '@/utils/activation'
import { showToast } from '@/utils/toast'

const router = useRouter()
const route = useRoute()

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
    const result = await verifyActivationCode(activationCode.value)
    
    if (result.valid) {
      // 兼容旧版本（如果返回的是 boolean）
      if (typeof result === 'boolean') {
        saveActivation(activationCode.value)
      }
      
      // 成功提示
      const successMsg = result.data 
        ? `激活成功！有效期 ${result.data.daysLeft} 天，每天 3 次测评机会`
        : '激活成功！'
      
      showToast(successMsg, 2000, 'success')
      
      // 延迟跳转以显示成功提示
      setTimeout(() => {
        router.push('/assessment')
      }, 2000)
    } else {
      // 智能错误提示
      const errorType = result.error || 'UNKNOWN'
      const mainMsg = result.message || '激活失败，请稍后重试'
      const tipMsg = result.tip || ''
      const icon = result.icon || ''
      
      // 设置错误信息（显示在输入框下方）
      error.value = mainMsg
      
      // Toast 提示（更详细）
      let toastMsg = icon ? `${icon} ${mainMsg}` : mainMsg
      if (tipMsg) {
        toastMsg = `${mainMsg}\n${tipMsg}`
      }
      
      // 根据错误类型设置不同的提示样式
      const toastType = errorType === 'DAILY_LIMIT_REACHED' ? 'warning' : 'error'
      const duration = errorType === 'DAILY_LIMIT_REACHED' ? 3000 : 2500
      
      showToast(toastMsg, duration, toastType)
    }
  } catch (err) {
    error.value = '网络异常，请检查网络后重试'
    showToast('网络异常，请检查网络后重试', 2000, 'error')
    console.error('激活码验证异常:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const code = route.query.code
  if (typeof code === 'string' && code) {
    activationCode.value = formatActivationCode(code)
  }
})
</script>

<style scoped>
.activation-page {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  /* 视口内包含了顶部 56px Header，高度需扣除，避免出现一屏外溢 */
  min-height: calc(100vh - 56px);
  padding: 10% 20px 20px;
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

.value-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.badge {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--bg-section);
  border: 1px solid var(--border);
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
.help-section {
  width: 100%;
  text-align: center;
}

.help-text {
  font-size: 12px;
  margin-bottom: 16px;
}

.help-tips {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--bg-section);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.tip-item {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: left;
  line-height: 1.6;
}

/* 底部 */
.footer {
  width: 100%;
  max-width: 500px;
  text-align: center;
  padding-top: 28px;
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
    padding: 30% 20px 24px; /* 小屏进一步减少底部留白，确保一屏可见 */
  }

  .header { margin-bottom: 28px; }
  .intro { margin-bottom: 28px; }
  .footer { padding-top: 20px; }
}
</style>

