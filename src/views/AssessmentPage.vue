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
              <span v-if="answers[question.id] === option.id" class="iconify radio-checked" data-icon="mdi:circle" data-width="20" data-height="20"></span>
              <span v-else class="iconify radio-unchecked" data-icon="mdi:circle-outline" data-width="20" data-height="20"></span>
            </div>
            <span class="option-text">{{ option.text }}</span>
            <span v-if="answers[question.id] === option.id" class="iconify option-check" data-icon="mdi:check" data-width="20" data-height="20"></span>
          </div>
        </div>

        <!-- 操作按钮：题目下方约50px -->
        <div class="action-bar in-content">
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { questions } from '@/data/questions'
import { generateReport } from '@/utils/scoring'
import { showToast } from '@/utils/toast'
import { recordOneUsage, getActivationStatus } from '@/utils/activation'

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

    // 写入本地历史记录（仅保存在当前设备浏览器中）
    try {
      const raw = localStorage.getItem('test_history')
      const history = raw ? JSON.parse(raw) : []
      history.unshift({
        date: new Date().toISOString(),
        totalScore: report.totalScore,
        levelName: report.level.name,
        typeName: report.type.name
      })
      // 只保留最近20条，避免无限增长
      localStorage.setItem('test_history', JSON.stringify(history.slice(0, 20)))
    } catch (e) {
      console.warn('保存历史记录失败', e)
    }

    // 记录一次使用并提示剩余次数/有效期
    const rec = recordOneUsage()
    if (rec && rec.recorded) {
      showToast(`测试完成！今日剩余${rec.remainingToday}次 · 剩余${rec.daysLeft}天`, 2200, 'success')
    } else {
      const s = getActivationStatus()
      if (s.expired) {
        showToast('激活码已过期，完成本次后无法继续使用', 2500, 'warning')
      } else if (s.remainingToday === 0) {
        showToast('今日3次已用完，明天0点自动恢复', 2200, 'warning')
      } else {
        showToast('测评完成！', 1500, 'success')
      }
    }
    
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
  height: calc(100vh - 56px); /* 扣除导航高度，消除被挤压 */
  overflow: hidden;
  background: var(--bg-main);
}

/* 进度栏 */
.progress-header {
  padding: 16px 20px;
  margin-top: 5%;
  position: relative;
  z-index: 10;
}

/* 桌面端：进度栏也居中显示，左右留白17% */
@media (min-width: 769px) {
  .progress-header {
    padding: 16px 25%;
  }
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
  flex: 0.8;
  overflow-y: hidden; /* 禁止滚动 */
  padding: 12px 20px 0; /* 顶部留白更小，去掉底部额外间距 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中题目与选项 */
  background: var(--bg-main);
  overflow-x: hidden;
  overscroll-behavior: contain;
}

/* 桌面端：内容区域左右留白17%，内容宽度65% */
@media (min-width: 769px) {
  .content-area {
    padding: 12px 17% 0;
  }
}

.question-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 40px;
  text-align: center;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 20px 16px;
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
  padding: 9px 15px; /* 补偿边框 */
}

.option-radio {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-checked {
  color: var(--primary);
}

.radio-unchecked {
  color: var(--border);
}

.option-text {
  flex: 1;
  font-size: 16px;
  color: var(--text-body);
  line-height: 1.5;
}

.option-item.selected .option-text {
  color: var(--text-title);
  font-weight: 600;
}

.option-check {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-weight: bold;
}

/* 底部操作栏 */
.action-bar {
  padding: 12px 20px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.action-bar.in-content {
  margin-top: 50px; /* 题目下方约50px */
}

/* 桌面端：底部操作栏也居中显示，左右留白17% */
@media (min-width: 769px) {
  .action-bar { padding: 12px 17%; }
}

.btn-nav {
  flex: 1;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  background: var(--bg-section); /* 与背景拉开层级 */
  color: var(--text-title);
  border: 1px solid var(--border);
}

.btn-nav:not(:disabled):hover {
  background: rgba(var(--primary-rgb), 0.12);
  border-color: var(--primary);
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 主按钮配色（更醒目） */
.btn-primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.25);
}

.btn-primary:not(:disabled):hover {
  filter: brightness(0.95);
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 响应式 - 移动端优化观感 */
@media (max-width: 480px) {
  .content-area { padding: 16px; }

  .question-text {
    font-size: 18px;
    line-height: 1.35;
    margin-bottom: 30px;
  }

  .options-list { gap: 8px; }

  .option-item { padding: 14px; margin-bottom: 8px; }
  .option-text { font-size: 15px; }

  .action-bar.in-content { margin-top: 28px; }
  .btn-nav { height: 44px; font-size: 15px; border-radius: 10px; }
}
</style>

