<template>
  <div class="assessment-page">
    <!-- 顶部进度栏 -->
    <div class="progress-header">
      <div class="progress-info">
        <span class="text-body">社恐程度测评</span>
        <span class="text-body">第{{ currentQuestion }}/共30题 {{ progressPercent }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-area">
      <div v-if="question" class="question-container slide-up" :key="question.id">
        <!-- 题目 -->
        <h2 class="question-text text-title">{{ question.question }}</h2>

        <!-- 选项列表 -->
        <div class="options-list">
          <div
            v-for="option in question.options"
            :key="option.id"
            class="option-item"
            :class="{ 
              'selected': answers[question.id] === option.id,
              'hoverable': !answers[question.id]
            }"
            @click="selectOption(option.id)"
          >
            <div class="option-radio">
              <div v-if="answers[question.id] === option.id" class="radio-checked">◉</div>
              <div v-else class="radio-unchecked">○</div>
            </div>
            <span class="option-text">{{ option.text }}</span>
            <div v-if="answers[question.id] === option.id" class="option-check">✓</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar section-bg">
      <button
        @click="prevQuestion"
        :disabled="currentQuestion === 1"
        class="btn-nav"
      >
        上一题
      </button>
      
      <button
        v-if="currentQuestion < 30"
        @click="nextQuestion"
        class="btn-nav btn-primary"
      >
        下一题
      </button>
      
      <button
        v-else
        @click="submitAssessment"
        :disabled="submitting"
        class="btn-nav btn-primary"
      >
        <span v-if="!submitting">提交测评</span>
        <span v-else class="loading-text">
          <span class="loading"></span>
          生成报告中...
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { questions } from '@/data/questions'
import { generateReport } from '@/utils/scoring'
import { showToast } from '@/utils/toast'

const router = useRouter()

const currentQuestion = ref(1)
const answers = ref({})
const submitting = ref(false)

const question = computed(() => {
  return questions.find(q => q.id === currentQuestion.value)
})

const progressPercent = computed(() => {
  return Math.round((currentQuestion.value / 30) * 100)
})

// 选择选项
const selectOption = (optionId) => {
  answers.value[currentQuestion.value] = optionId
  saveAnswers()
  
  // 自动跳转到下一题（延迟0.5秒）
  setTimeout(() => {
    if (currentQuestion.value < 30) {
      nextQuestion()
    }
  }, 500)
}

// 上一题
const prevQuestion = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (!answers.value[currentQuestion.value]) {
    showToast('请选择一个答案', 2000, 'warning')
    return
  }
  
  if (currentQuestion.value < 30) {
    currentQuestion.value++
  }
}

// 保存答案到LocalStorage
const saveAnswers = () => {
  const data = {
    answers: answers.value,
    currentQuestion: currentQuestion.value,
    lastUpdate: Date.now()
  }
  localStorage.setItem('test_answers', JSON.stringify(data))
}

// 加载保存的答案
const loadAnswers = () => {
  const saved = localStorage.getItem('test_answers')
  if (saved) {
    try {
      const data = JSON.parse(saved)
      answers.value = data.answers || {}
      currentQuestion.value = data.currentQuestion || 1
    } catch (e) {
      console.error('加载答案失败:', e)
    }
  }
}

// 提交测评
const submitAssessment = async () => {
  // 检查是否所有题目都已回答
  const unanswered = []
  for (let i = 1; i <= 30; i++) {
    if (!answers.value[i]) {
      unanswered.push(i)
    }
  }
  
  if (unanswered.length > 0) {
    showToast(`还有${unanswered.length}道题未作答`, 2000, 'warning')
    currentQuestion.value = unanswered[0]
    return
  }
  
  submitting.value = true
  showToast('正在生成报告...', 2000, 'info')
  
  // 模拟生成报告的延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  try {
    // 生成报告
    const report = generateReport(answers.value)
    
    // 保存报告
    localStorage.setItem('test_report', JSON.stringify(report))
    
    showToast('测评完成！', 1500, 'success')
    
    // 跳转到报告页
    setTimeout(() => {
      router.push('/report')
    }, 1500)
  } catch (error) {
    console.error('生成报告失败:', error)
    showToast('生成报告失败，请重试', 2000, 'error')
  } finally {
    submitting.value = false
  }
}

// 进度提示
watch(currentQuestion, (newVal) => {
  if (newVal === 10) {
    showToast('已完成33%，继续加油！', 1500, 'success')
  } else if (newVal === 20) {
    showToast('已完成67%，马上完成！', 1500, 'success')
  }
})

onMounted(() => {
  loadAnswers()
  
  // 如果有保存的进度，询问是否继续
  if (Object.keys(answers.value).length > 0 && currentQuestion.value > 1) {
    showToast(`继续之前的测评（第${currentQuestion.value}题）`, 2000, 'info')
  }
})
</script>

<style scoped>
.assessment-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 进度栏 */
.progress-header {
  padding: 16px 20px;
  background: var(--bg-card);
  box-shadow: 0 2px 8px var(--shadow);
  position: relative;
  z-index: 10;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-section);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

/* 内容区域 */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.question-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.question-text {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.6;
  margin-bottom: 32px;
  text-align: center;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.option-item.hoverable:hover {
  background: var(--bg-section);
  border-color: var(--primary);
  transform: translateY(-2px);
}

.option-item.selected {
  background: var(--bg-section);
  border: 2px solid var(--primary);
  padding: 19px; /* 补偿边框 */
}

.option-radio {
  flex-shrink: 0;
  font-size: 20px;
  color: var(--primary);
}

.radio-unchecked {
  color: var(--border);
}

.option-text {
  flex: 1;
  font-size: 18px;
  color: var(--text-body);
  line-height: 1.5;
}

.option-item.selected .option-text {
  color: var(--text-title);
  font-weight: 600;
}

.option-check {
  flex-shrink: 0;
  font-size: 16px;
  color: var(--primary);
}

/* 底部操作栏 */
.action-bar {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 -2px 8px var(--shadow);
}

.btn-nav {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: var(--bg-card);
  color: var(--text-body);
  border: 1px solid var(--border);
}

.btn-nav:not(:disabled):hover {
  background: var(--bg-section);
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 响应式 */
@media (max-width: 480px) {
  .question-text {
    font-size: 20px;
  }
  
  .option-text {
    font-size: 16px;
  }
  
  .content-area {
    padding: 24px 16px;
  }
}
</style>

