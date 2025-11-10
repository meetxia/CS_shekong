<template>
  <div class="assessment-page">
    <!-- 开发者调试面板 -->
    <div 
      v-if="isDev && devPanelVisible" 
      class="dev-panel"
      :class="{ minimized: devPanelMinimized, dragging: devPanelDragging }"
      :style="{ left: `${devPanelPosition.x}px`, top: `${devPanelPosition.y}px` }"
    >
      <div 
        class="dev-panel-header"
        @mousedown="startDevPanelDrag"
        @touchstart="startDevPanelDrag"
      >
        <span class="iconify drag-handle" data-icon="mdi:drag" data-width="16"></span>
        <span class="iconify" data-icon="mdi:bug" data-width="16"></span>
        <span class="dev-panel-title">开发者工具</span>
        <div class="dev-panel-controls">
          <button 
            @click.stop="toggleDevPanelMinimize" 
            class="dev-control-btn"
            :title="devPanelMinimized ? '展开' : '最小化'"
          >
            <span class="iconify" :data-icon="devPanelMinimized ? 'mdi:window-maximize' : 'mdi:window-minimize'" data-width="14"></span>
          </button>
          <button 
            @click.stop="toggleDevPanel" 
            class="dev-control-btn"
            title="隐藏"
          >
            <span class="iconify" data-icon="mdi:close" data-width="14"></span>
          </button>
        </div>
      </div>
      <div v-show="!devPanelMinimized" class="dev-panel-actions">
        <button @click="clearAllAnswers" class="dev-btn dev-btn-warning">
          <span class="iconify" data-icon="mdi:delete-sweep" data-width="16"></span>
          清空所有答案
        </button>
        <button @click="fillRandomAnswers" class="dev-btn dev-btn-primary">
          <span class="iconify" data-icon="mdi:auto-fix" data-width="16"></span>
          随机填充答案
        </button>
        <button @click="jumpToQuestion(1)" class="dev-btn dev-btn-info">
          <span class="iconify" data-icon="mdi:skip-previous" data-width="16"></span>
          跳到第1题
        </button>
        <button @click="jumpToQuestion(35)" class="dev-btn dev-btn-info">
          <span class="iconify" data-icon="mdi:skip-next" data-width="16"></span>
          跳到第35题
        </button>
        <button @click="resetToBasicInfoPage" class="dev-btn dev-btn-info">
          <span class="iconify" data-icon="mdi:reload" data-width="16"></span>
          重置到基础信息页
        </button>
      </div>
    </div>
    
    <!-- 开发面板快捷打开按钮（当面板隐藏时显示） -->
    <button 
      v-if="isDev && !devPanelVisible" 
      @click="toggleDevPanel"
      class="dev-panel-toggle-btn"
      title="打开开发者工具"
    >
      <span class="iconify" data-icon="mdi:bug" data-width="20"></span>
    </button>

    <!-- 基础信息收集页 -->
    <div v-if="showBasicInfoPage" class="basic-info-page">
      <div class="basic-info-container">
        <h1 class="basic-info-title text-title">开始测评前</h1>
        <p class="basic-info-subtitle text-body">请填写以下基础信息，帮助我们生成更准确的个性化报告</p>
        
        <div class="basic-info-form">
          <div 
            v-for="question in displayedBasicInfoQuestions" 
            :key="question.id" 
            class="info-question-group"
          >
            <label class="info-label text-title">
              {{ question.question }}
              <span v-if="!question.required" class="optional-tag">（选填）</span>
            </label>
            
            <div class="info-options">
              <div
                v-for="option in question.options"
                :key="`${question.id}-${option.id}`"
                class="info-option"
                :class="{ 'selected': isBasicInfoSelected(question.id, option.value) }"
                @click="handleBasicInfoClick(question.id, option.value)"
              >
                <span class="info-option-text">{{ option.text }}</span>
                <!-- 使用内联 SVG，避免 Iconify 运行时篡改 DOM 导致的补丁错误 -->
                <svg v-if="isBasicInfoSelected(question.id, option.value)" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M7 12.5L10 15.5L17 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 基础信息分页导航（移动端和桌面端） -->
        <div v-if="basicInfoTotalPages > 1" class="basic-info-nav">
          <button class="btn-nav" :disabled="basicInfoPageIndex === 0" @click="prevBasicInfoPage">上一页</button>
          <div class="basic-info-dots">
            <span v-for="n in basicInfoTotalPages" :key="n" class="dot" :class="{ active: n - 1 === basicInfoPageIndex }"></span>
          </div>
          <button class="btn-nav btn-primary" :disabled="basicInfoPageIndex >= basicInfoTotalPages - 1" @click="nextBasicInfoPage">下一页</button>
        </div>

        <button 
          @click="startAssessment" 
          :disabled="!canStartAssessment"
          class="btn-start-assessment"
        >
          <span v-if="canStartAssessment">开始测评（共35题）</span>
          <span v-else>请完成必填项</span>
        </button>

        <p class="privacy-note text-secondary">
          <span class="iconify" data-icon="mdi:shield-check" data-width="16"></span>
          你的信息仅用于生成个性化报告，不会被分享或用于其他用途
        </p>
      </div>
    </div>

    <!-- 答题页面 -->
    <div v-else class="assessment-content">
      <!-- 顶部进度栏 -->
      <div class="progress-header">
        <div class="progress-info">
          <span class="text-body">社恐程度测评</span>
          <span class="text-body">第{{ currentQuestion }}/共35题 {{ progressPercent }}%</span>
        </div>
        <div 
          ref="progressBarRef"
          class="progress-bar interactive"
          @click="handleProgressClick"
          @mousedown="handleProgressDragStart"
          @touchstart="handleProgressDragStart"
        >
          <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
          <div 
            class="progress-thumb" 
            :style="{ left: `${progressPercent}%` }"
          ></div>
          <!-- 刻度点 -->
          <div class="progress-dots">
            <div 
              v-for="n in 35" 
              :key="n"
              class="progress-dot"
              :class="{ 'answered': answers[n], 'current': currentQuestion === n }"
              :style="{ left: `${(n / 35) * 100}%` }"
              :title="`第${n}题`"
            ></div>
          </div>
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
              :key="`q${question.id}-opt${option.id}`"
              class="option-item"
              :class="{
                'selected': isSelected(question.id, option.id)
              }"
              @click="selectOption(option.id, option.score)"
            >
              <div class="option-radio">
                <span v-show="isSelected(question.id, option.id)" class="iconify radio-checked" data-icon="mdi:circle" data-width="20" data-height="20"></span>
                <span v-show="!isSelected(question.id, option.id)" class="iconify radio-unchecked" data-icon="mdi:circle-outline" data-width="20" data-height="20"></span>
              </div>
              <span class="option-text">{{ option.text }}</span>
              <span v-show="isSelected(question.id, option.id)" class="iconify option-check" data-icon="mdi:check" data-width="20" data-height="20"></span>
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
              v-if="currentQuestion < 35"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getRandomQuestions, basicInfoQuestions } from '@/data/questionBank'
import { generateReport } from '@/utils/scoring'
import { showToast } from '@/utils/toast'
import { recordOneUsage, getActivationStatus } from '@/utils/activation'

const router = useRouter()

// 🎲 每次进入页面生成新的随机题目（60题库随机抽35题）
const questions = ref([])

// 🤖 AI预生成缓存
let aiPreGeneratedReport = null
let isAiPreGenerating = false
let aiPreGenerationTriggered = false // 🔒 标记是否已经触发过AI预生成（防止重复触发）

const showBasicInfoPage = ref(true)
const basicInfo = reactive({})
const isMobile = ref(window.innerWidth <= 768)
const basicInfoPageIndex = ref(0)
const BASIC_INFO_PAGE_SIZE_MOBILE = 2 // 小屏幕每页显示2题，确保开始按钮可见
const BASIC_INFO_PAGE_SIZE_DESKTOP = 3 // 桌面端每页显示3题
const currentQuestion = ref(1)
const answers = reactive({})
const submitting = ref(false)
const progressBarRef = ref(null)
const isDragging = ref(false)
const progressToastShown = ref({
  q10: false,
  q20: false,
  q30: false
})

// 开发者模式（检测是否在开发环境）
const isDev = ref(import.meta.env.DEV)

// 开发面板状态
const devPanelVisible = ref(true) // 是否显示开发面板
const devPanelMinimized = ref(false) // 是否最小化
const devPanelPosition = reactive({
  x: window.innerWidth - 220, // 默认靠右
  y: 10 // 默认靠上
})
const devPanelDragging = ref(false)

// 监听窗口尺寸，切换移动端/桌面端展示
const handleResize = () => {
  const nowMobile = window.innerWidth <= 768
  if (isMobile.value !== nowMobile) {
    isMobile.value = nowMobile
    basicInfoPageIndex.value = 0
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 检查必填项是否完成
const canStartAssessment = computed(() => {
  const requiredQuestions = basicInfoQuestions.filter(q => q.required)
  return requiredQuestions.every(q => basicInfo[q.id])
})

// 基础信息分页（移动端和桌面端都支持）
const basicInfoTotalPages = computed(() => {
  const pageSize = isMobile.value ? BASIC_INFO_PAGE_SIZE_MOBILE : BASIC_INFO_PAGE_SIZE_DESKTOP
  return Math.ceil(basicInfoQuestions.length / pageSize)
})

const displayedBasicInfoQuestions = computed(() => {
  const pageSize = isMobile.value ? BASIC_INFO_PAGE_SIZE_MOBILE : BASIC_INFO_PAGE_SIZE_DESKTOP
  const start = basicInfoPageIndex.value * pageSize
  return basicInfoQuestions.slice(start, start + pageSize)
})

const prevBasicInfoPage = () => {
  if (basicInfoPageIndex.value > 0) basicInfoPageIndex.value--
}

const nextBasicInfoPage = () => {
  if (basicInfoPageIndex.value < basicInfoTotalPages.value - 1) basicInfoPageIndex.value++
}

const question = computed(() => {
  return questions.value.find(q => q.id === currentQuestion.value)
})

const progressPercent = computed(() => {
  return Math.round((currentQuestion.value / 35) * 100)
})

// ========== 基础信息相关函数 ==========

// 检查基础信息选项是否被选中
const isBasicInfoSelected = (questionId, value) => {
  return basicInfo[questionId] === value
}

// 处理基础信息点击事件
const handleBasicInfoClick = (questionId, value) => {
  console.log('点击基础信息选项:', questionId, value, '当前值:', basicInfo[questionId])

  // 单选逻辑：直接设置新值
  if (basicInfo[questionId] === value) {
    // 点击已选中的选项，取消选中
    basicInfo[questionId] = null
  } else {
    // 选中新选项
    basicInfo[questionId] = value
  }

  console.log('更新后的值:', basicInfo[questionId])

  // 立即保存
  saveBasicInfo()

  // 检查当前页所有题目是否都已回答
  const pageSize = isMobile.value ? BASIC_INFO_PAGE_SIZE_MOBILE : BASIC_INFO_PAGE_SIZE_DESKTOP
  const start = basicInfoPageIndex.value * pageSize
  const currentPageQuestions = basicInfoQuestions.slice(start, start + pageSize)
  const allCurrentPageAnswered = currentPageQuestions.every(q => basicInfo[q.id])

  // 如果当前页所有题目都已回答，且不是最后一页，自动跳转到下一页
  if (allCurrentPageAnswered && basicInfoPageIndex.value < basicInfoTotalPages.value - 1) {
    setTimeout(() => {
      basicInfoPageIndex.value++
    }, 300)
  }
}

// 开始测评
const startAssessment = () => {
  if (!canStartAssessment.value) {
    showToast('请完成必填项', 2000, 'warning')
    return
  }
  
  // 🤖 开始新测评时，清空旧的AI预生成缓存和标记
  aiPreGeneratedReport = null
  isAiPreGenerating = false
  aiPreGenerationTriggered = false
  console.log('🆕 [开始测评] 已清除旧的AI预生成缓存和触发标记')
  
  showBasicInfoPage.value = false
  showToast('开始测评，共35题', 2000, 'success')
}

// 保存基础信息
const saveBasicInfo = () => {
  try {
    // 创建一个纯对象来保存，避免保存响应式代理
    const dataToSave = {}
    Object.keys(basicInfo).forEach(key => {
      if (basicInfo[key] !== null && basicInfo[key] !== undefined) {
        dataToSave[key] = basicInfo[key]
      }
    })
    localStorage.setItem('test_basic_info', JSON.stringify(dataToSave))
  } catch (e) {
    console.error('保存基础信息失败:', e)
  }
}

// 加载基础信息（强制为单选值，兼容历史上可能存为数组的情况）
const loadBasicInfo = () => {
  try {
    const saved = localStorage.getItem('test_basic_info')
    if (saved) {
      const data = JSON.parse(saved)
      // 清空现有数据
      Object.keys(basicInfo).forEach(key => {
        delete basicInfo[key]
      })
      // 加载新数据，确保每个问题只有一个值
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          const value = Array.isArray(data[key]) ? data[key][0] : data[key]
          basicInfo[key] = value
        }
      })
    }
  } catch (e) {
    console.error('加载基础信息失败:', e)
    // 加载失败时清空 localStorage
    localStorage.removeItem('test_basic_info')
  }
}

// ========== 开发面板控制函数 ==========

// 切换开发面板显示/隐藏
const toggleDevPanel = () => {
  devPanelVisible.value = !devPanelVisible.value
}

// 切换开发面板最小化
const toggleDevPanelMinimize = () => {
  devPanelMinimized.value = !devPanelMinimized.value
}

// 开发面板拖动开始
const startDevPanelDrag = (event) => {
  event.preventDefault()
  devPanelDragging.value = true
  
  const startX = event.clientX || event.touches?.[0]?.clientX || 0
  const startY = event.clientY || event.touches?.[0]?.clientY || 0
  const startPosX = devPanelPosition.x
  const startPosY = devPanelPosition.y
  
  const handleMove = (e) => {
    e.preventDefault()
    const currentX = e.clientX || e.touches?.[0]?.clientX || 0
    const currentY = e.clientY || e.touches?.[0]?.clientY || 0
    
    const deltaX = currentX - startX
    const deltaY = currentY - startY
    
    // 限制在窗口范围内
    const maxX = window.innerWidth - 200
    const maxY = window.innerHeight - 100
    
    devPanelPosition.x = Math.max(0, Math.min(maxX, startPosX + deltaX))
    devPanelPosition.y = Math.max(0, Math.min(maxY, startPosY + deltaY))
  }
  
  const handleEnd = () => {
    devPanelDragging.value = false
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove)
    document.removeEventListener('touchend', handleEnd)
  }
  
  document.addEventListener('mousemove', handleMove)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove)
  document.addEventListener('touchend', handleEnd)
}

// ========== 开发者工具函数 ==========

// 清空所有答案
const clearAllAnswers = () => {
  // 清空答题数据
  Object.keys(answers).forEach(key => {
    delete answers[key]
  })
  
  // 清空基础信息
  Object.keys(basicInfo).forEach(key => {
    delete basicInfo[key]
  })
  
  // 🤖 清空AI预生成缓存和标记
  aiPreGeneratedReport = null
  isAiPreGenerating = false
  aiPreGenerationTriggered = false
  console.log('🧹 [清空数据] 已清除AI预生成缓存和触发标记')
  
  // 清空本地存储
  localStorage.removeItem('test_answers')
  localStorage.removeItem('test_basic_info')
  
  // 重置页面状态
  currentQuestion.value = 1
  showBasicInfoPage.value = true
  basicInfoPageIndex.value = 0
  
  // 强制更新视图
  nextTick(() => {
    showToast('已清空所有答案', 1500, 'success')
  })
}

// 随机填充答案
const fillRandomAnswers = () => {
  // 🤖 先清空AI预生成缓存和标记
  aiPreGeneratedReport = null
  isAiPreGenerating = false
  aiPreGenerationTriggered = false
  
  // 填充基础信息
  basicInfoQuestions.forEach(q => {
    const randomOption = q.options[Math.floor(Math.random() * q.options.length)]
    basicInfo[q.id] = randomOption.value
  })
  saveBasicInfo()
  
  // 填充答题
  for (let i = 1; i <= 35; i++) {
    const question = questions.value.find(q => q.id === i)
    if (question) {
      const randomOption = question.options[Math.floor(Math.random() * question.options.length)]
      answers[i] = { optionId: randomOption.id, score: randomOption.score }
    }
  }
  saveAnswers()
  showToast('已随机填充所有答案', 1500, 'success')
  console.log('🧹 [随机填充] 已清除AI预生成缓存')
}

// 跳转到指定题目
const jumpToQuestion = (questionNum) => {
  if (questionNum >= 1 && questionNum <= 35) {
    showBasicInfoPage.value = false
    currentQuestion.value = questionNum
    showToast(`已跳转到第${questionNum}题`, 1000, 'info')
    
    // 🤖 开发者工具跳题后也检查是否需要触发AI预生成
    setTimeout(() => {
      checkAndTriggerAIPreGeneration()
    }, 100)
  }
}

// 重置到基础信息页
const resetToBasicInfoPage = () => {
  // 🤖 清空AI预生成缓存和标记
  aiPreGeneratedReport = null
  isAiPreGenerating = false
  aiPreGenerationTriggered = false
  
  // 重置页面状态
  showBasicInfoPage.value = true
  currentQuestion.value = 1
  basicInfoPageIndex.value = 0
  
  // 强制更新视图
  nextTick(() => {
    showToast('已重置到基础信息页', 1500, 'success')
    console.log('🧹 [重置页面] 已清除AI预生成缓存和触发标记')
  })
}

// ========== 原有功能 ==========

// 检查选项是否被选中
const isSelected = (questionId, optionId) => {
  return answers[questionId]?.optionId === optionId
}

// 选择选项（修改为保存 optionId 和 score）
const selectOption = (optionId, score) => {
  // 立即更新答案（同时保存optionId和score）
  answers[currentQuestion.value] = {
    optionId: optionId,
    score: score
  }

  // 强制 Vue 立即更新 DOM
  nextTick(() => {
    saveAnswers()

    // 🤖 智能检查是否应该触发AI预生成
    checkAndTriggerAIPreGeneration()

    // 自动跳转到下一题（延迟0.6秒）
    setTimeout(() => {
      if (currentQuestion.value < 35) {
        nextQuestion(true) // 传递true表示这是正常答题流程
      }
    }, 600)
  })
}

// 上一题
const prevQuestion = () => {
  if (currentQuestion.value > 1) {
    currentQuestion.value--
  }
}

// 下一题
const nextQuestion = (isNormalFlow = false) => {
  if (!answers[currentQuestion.value]) {
    showToast('请选择一个答案', 2000, 'warning')
    return
  }
  
  if (currentQuestion.value < 35) {
    currentQuestion.value++
    
    // 只在正常答题流程中显示进度提示，且每个提示只显示一次
    if (isNormalFlow) {
      if (currentQuestion.value === 10 && !progressToastShown.value.q10) {
        showToast('已完成28%，继续加油！', 1500, 'success')
        progressToastShown.value.q10 = true
      } else if (currentQuestion.value === 20 && !progressToastShown.value.q20) {
        showToast('已完成57%，过半啦！', 1500, 'success')
        progressToastShown.value.q20 = true
      } else if (currentQuestion.value === 30 && !progressToastShown.value.q30) {
        showToast('已完成86%，马上完成！', 1500, 'success')
        progressToastShown.value.q30 = true
      }
    }
    
    // 🤖 在切换到第34题或第35题时，也检查是否需要触发AI预生成
    checkAndTriggerAIPreGeneration()
  }
}

// 根据进度条位置计算题目编号
const calculateQuestionFromPosition = (event) => {
  if (!progressBarRef.value) return 1
  
  const rect = progressBarRef.value.getBoundingClientRect()
  const clientX = event.touches ? event.touches[0].clientX : event.clientX
  const x = clientX - rect.left
  const percentage = Math.max(0, Math.min(1, x / rect.width))
  const questionNum = Math.max(1, Math.min(35, Math.ceil(percentage * 35)))
  
  return questionNum
}

// 点击进度条跳转
const handleProgressClick = (event) => {
  if (isDragging.value) return
  
  const questionNum = calculateQuestionFromPosition(event)
  currentQuestion.value = questionNum
  showToast(`跳转到第${questionNum}题`, 1500, 'info')
  
  // 🤖 跳题后也检查是否需要触发AI预生成
  setTimeout(() => {
    checkAndTriggerAIPreGeneration()
  }, 100)
}

// 开始拖动
const handleProgressDragStart = (event) => {
  isDragging.value = true
  
  const handleDrag = (e) => {
    e.preventDefault()
    const questionNum = calculateQuestionFromPosition(e)
    currentQuestion.value = questionNum
  }
  
  const handleDragEnd = () => {
    isDragging.value = false
    showToast(`已跳转到第${currentQuestion.value}题`, 1500, 'success')
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDrag)
    document.removeEventListener('touchend', handleDragEnd)
    
    // 🤖 拖动结束后也检查是否需要触发AI预生成
    setTimeout(() => {
      checkAndTriggerAIPreGeneration()
    }, 100)
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', handleDragEnd)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', handleDragEnd)
  
  // 立即更新一次位置
  handleDrag(event)
}

// 保存答案到LocalStorage
const saveAnswers = () => {
  const data = {
    answers: answers,
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
      if (data.answers) {
        Object.assign(answers, data.answers)
      }
      if (data.currentQuestion && data.currentQuestion > 1) {
        currentQuestion.value = data.currentQuestion
        showBasicInfoPage.value = false // 如果有保存的进度，跳过基础信息页
      }
    } catch (e) {
      console.error('加载答案失败:', e)
    }
  }
}

// 🤖 检查并触发AI预生成（智能判断时机）
const checkAndTriggerAIPreGeneration = () => {
  // 🔒 【重要】如果已经触发过，直接跳过（防止用户退回题目时重复触发）
  if (aiPreGenerationTriggered) {
    return
  }
  
  // 如果已经在生成或已经生成过，跳过
  if (isAiPreGenerating || aiPreGeneratedReport) {
    return
  }
  
  const answeredCount = Object.keys(answers).length
  
  // 🎯 严格条件：必须同时满足以下条件才触发
  // 1. 已答题数 >= 33 题
  // 2. 当前在第 33-35 题之间（确保用户快要答完了）
  // 3. 前 25 题必须已经全部回答（确保是正常流程，不是残留数据）
  const isInFinalStage = currentQuestion.value >= 33 && currentQuestion.value <= 35
  const hasEnoughAnswers = answeredCount >= 33
  
  // 检查前25题是否都已回答（验证是正常答题流程）
  let first25Answered = true
  for (let i = 1; i <= 25; i++) {
    if (!answers[i]) {
      first25Answered = false
      break
    }
  }
  
  const shouldTrigger = isInFinalStage && hasEnoughAnswers && first25Answered
  
  if (shouldTrigger) {
    console.log(`🎯 [触发检查] ✅ 满足所有条件，触发AI预生成`)
    console.log(`   - 已答题数: ${answeredCount}/35`)
    console.log(`   - 当前题号: ${currentQuestion.value}`)
    console.log(`   - 前25题完成: ${first25Answered}`)
    
    // 🔒 标记已触发，防止重复触发
    aiPreGenerationTriggered = true
    console.log(`🔒 [触发检查] 已设置触发标记，后续不会再次触发`)
    
    preGenerateAIReport()
  } else if (answeredCount >= 33 && !shouldTrigger) {
    console.log(`⏸️  [触发检查] 已答${answeredCount}题但不触发 - 当前第${currentQuestion.value}题，前25题完成:${first25Answered}`)
  }
}

// 🤖 预生成AI报告（在用户答到第33题时触发）
const preGenerateAIReport = async () => {
  if (isAiPreGenerating) {
    console.log('⏳ [AI预生成] 已在进行中，跳过')
    return
  }
  
  console.log('═══════════════════════════════════════════')
  console.log('🚀 [AI预生成] 提前开始AI报告生成！')
  console.log(`📊 [AI预生成] 当前已答题: ${Object.keys(answers).length}/35`)
  console.log(`👤 [AI预生成] 用户信息: 年龄=${basicInfo.age}, 性别=${basicInfo.gender}`)
  console.log('═══════════════════════════════════════════')
  
  isAiPreGenerating = true
  const startTime = Date.now()
  
  try {
    // 转换答案格式为 { questionId: score }
    const answersForScoring = {}
    Object.entries(answers).forEach(([qId, answerObj]) => {
      answersForScoring[qId] = answerObj.score
    })
    
    console.log(`📝 [AI预生成] 答案数据已准备好: ${Object.keys(answersForScoring).length} 个答案`)
    
    // 提前生成报告
    aiPreGeneratedReport = await generateReport(answersForScoring, basicInfo)
    
    const duration = Date.now() - startTime
    console.log('═══════════════════════════════════════════')
    console.log(`✅ [AI预生成] AI报告预生成完成！(耗时: ${duration}ms)`)
    console.log(`📝 [AI预生成] 生成的类型: ${aiPreGeneratedReport?.type?.name}`)
    console.log(`📊 [AI预生成] 总分: ${aiPreGeneratedReport?.totalScore}/100`)
    console.log(`🏷️  [AI预生成] 等级: ${aiPreGeneratedReport?.level?.name}`)
    console.log(`🤖 [AI预生成] AI生成: ${aiPreGeneratedReport?.aiGenerated ? '是' : '否（使用本地规则）'}`)
    console.log('═══════════════════════════════════════════')
    
    // 用户友好提示
    showToast('✨ 专属报告已准备好！', 1500, 'success')
  } catch (error) {
    const duration = Date.now() - startTime
    console.log('═══════════════════════════════════════════')
    console.error(`❌ [AI预生成] AI预生成失败 (耗时: ${duration}ms)`)
    console.error(`📄 [AI预生成] 错误信息:`, error)
    console.log('═══════════════════════════════════════════')
    aiPreGeneratedReport = null
  } finally {
    isAiPreGenerating = false
  }
}

// 🎯 显示重新测试确认对话框
const showRetestConfirmDialog = () => {
  return new Promise((resolve) => {
    // 锁定背景滚动
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // 创建对话框元素
    const modal = document.createElement('div')
    modal.className = 'retest-confirm-modal'
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">💡 提示</h3>
        </div>
        <div class="modal-body">
          <p class="modal-message">您已经完成过测评了，是否要重新测试？</p>
          <p class="modal-hint">重新测试将清除当前答题进度，但会保留您的历史报告。</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn modal-btn-secondary" id="cancelRetest">查看报告</button>
          <button class="modal-btn modal-btn-primary" id="confirmRetest">重新测试</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // 绑定事件
    const handleCancel = () => {
      document.body.style.overflow = originalOverflow
      modal.remove()
      resolve(false)
    }

    const handleConfirm = () => {
      document.body.style.overflow = originalOverflow
      modal.remove()
      resolve(true)
    }

    modal.querySelector('#cancelRetest').addEventListener('click', handleCancel)
    modal.querySelector('#confirmRetest').addEventListener('click', handleConfirm)
    modal.querySelector('.modal-overlay').addEventListener('click', handleCancel)
  })
}

// 提交测评
const submitAssessment = async () => {
  // 检查是否所有题目都已回答
  const unanswered = []
  for (let i = 1; i <= 35; i++) {
    if (!answers[i]) {
      unanswered.push(i)
    }
  }
  
  if (unanswered.length > 0) {
    showToast(`还有${unanswered.length}道题未作答`, 2000, 'warning')
    currentQuestion.value = unanswered[0]
    return
  }
  
  submitting.value = true
  
  try {
    // 🔧 【修复】提交时不再检查次数（次数已在开始测评时扣除）
    // 只进行简单的状态检查，确保激活未过期即可
    const statusBeforeSubmit = await getActivationStatus()
    console.log('[提交测评] 提交前状态检查:', statusBeforeSubmit)
    
    if (statusBeforeSubmit.expired) {
      showToast('激活码已过期，无法提交', 2500, 'error')
      submitting.value = false
      setTimeout(() => router.push('/activation'), 1500)
      return
    }
    
    // 🔧 【重要】不检查剩余次数，因为次数已在开始测评时扣除
    console.log(`✅ [提交测评] 状态检查通过（次数已在开始测评时扣除）`)
    
    let report

    // 🎯 如果有预生成的报告，直接使用
    if (aiPreGeneratedReport) {
      console.log('═══════════════════════════════════════════')
      console.log('⚡ [提交测评] 使用预生成的专属报告，秒开！')
      console.log('═══════════════════════════════════════════')
      showToast('正在生成专属分析报告...', 800, 'info')
      await new Promise(resolve => setTimeout(resolve, 800)) // 短暂延迟，给用户反馈
      report = aiPreGeneratedReport
      aiPreGeneratedReport = null // 使用后清空
    } else if (isAiPreGenerating) {
      // 🔄 如果预生成正在进行中，等待它完成
      console.log('═══════════════════════════════════════════')
      console.log('⏳ [提交测评] AI预生成正在进行中，等待完成...')
      console.log('═══════════════════════════════════════════')
      showToast('正在生成专属分析报告...', 2000, 'info')

      // 等待预生成完成（最多等待30秒）
      const maxWaitTime = 30000 // 30秒
      const startWaitTime = Date.now()

      while (isAiPreGenerating && (Date.now() - startWaitTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100)) // 每100ms检查一次
      }

      if (aiPreGeneratedReport) {
        console.log('✅ [提交测评] 预生成完成，使用预生成报告！')
        report = aiPreGeneratedReport
        aiPreGeneratedReport = null
      } else {
        // 预生成失败或超时，实时生成
        console.log('⚠️ [提交测评] 预生成失败或超时，改为实时生成')
        const answersForScoring = {}
        Object.entries(answers).forEach(([qId, answerObj]) => {
          answersForScoring[qId] = answerObj.score
        })
        report = await generateReport(answersForScoring, basicInfo)
      }
    } else {
      // 没有预生成，正常生成
      console.log('═══════════════════════════════════════════')
      console.log('⏳ [提交测评] 实时生成专属报告...')
      console.log('💡 [提交测评] 提示：为了更快体验，AI会在第33题时预生成')
      console.log('═══════════════════════════════════════════')
      showToast('正在生成专属分析报告...', 2000, 'info')

      const startTime = Date.now()

      // 转换答案格式为 { questionId: score }
      const answersForScoring = {}
      Object.entries(answers).forEach(([qId, answerObj]) => {
        answersForScoring[qId] = answerObj.score
      })

      // 生成报告（传入答案和基础信息）- 现在是异步的
      report = await generateReport(answersForScoring, basicInfo)

      const duration = Date.now() - startTime
      console.log(`✅ [提交测评] 报告生成完成 (耗时: ${duration}ms)`)
    }
    
    // 检查效度
    if (!report.isValid) {
      showToast(report.message, 3000, 'warning')
      submitting.value = false
      return
    }

    // 🔧 【修改】不再在提交测评时扣除次数（已在激活时扣除）
    // 直接保存报告
    console.log('📊 [提交测评] 保存测评报告...')

    // 保存报告到 localStorage
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

    // 获取当前激活状态用于显示
    const status = await getActivationStatus()
    const remainingMsg = status.remainingToday !== undefined && status.daysLeft !== undefined
      ? `今日剩余${status.remainingToday}次 · 剩余${status.daysLeft}天`
      : ''

    showToast(`测试完成！${remainingMsg}`, 2200, 'success')

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

onMounted(async () => {
  // 🔒 【重要】进入答题页面前，先检查激活状态
  const activationStatus = await getActivationStatus()
  console.log('[进入答题页] 激活状态检查:', activationStatus)

  // 检查激活码是否过期
  if (activationStatus.expired) {
    showToast('激活码已过期，请重新激活', 2500, 'error')
    setTimeout(() => {
      router.push('/activation')
    }, 1500)
    return
  }

  // 🎯 【核心逻辑】检查是否已完成测评（有旧报告）
  const hasCompletedReport = localStorage.getItem('test_report')
  
  if (hasCompletedReport) {
    // ========== 场景2：重新测评（有旧报告）==========
    console.log('📋 [有旧报告] 检测到已完成的测评报告')
    
    // 先检查今日剩余次数（扣除前检查）
    if (activationStatus.remainingToday <= 0) {
      showToast('今日测评次数已用完（3次/天），明天0点自动恢复', 2500, 'warning')
      setTimeout(() => {
        router.push('/')
      }, 2000)
      return
    }
    
    // 显示确认对话框
    const shouldRetest = await showRetestConfirmDialog()
    if (!shouldRetest) {
      // 用户选择不重新测试，返回报告页
      router.push('/report')
      return
    }

    // 🔑 用户确认重新测试，扣除一次次数
    console.log('🔄 [重新测试] 用户确认重新测试，开始扣除次数...')
    const rec = await recordOneUsage()

    if (!rec || !rec.recorded) {
      // ❌ 扣次数失败（可能是次数不足或激活码过期）
      const errorMsg = rec?.error || '无法开始新测评'
      showToast(errorMsg, 2500, 'error')

      // 根据具体情况跳转
      if (rec?.expired) {
        setTimeout(() => router.push('/activation'), 1500)
      } else if (rec?.remainingToday <= 0) {
        setTimeout(() => router.push('/'), 1500)
      } else {
        setTimeout(() => router.push('/report'), 1500)
      }
      return
    }

    // ✅ 扣次数成功，清除旧数据，开始新测评
    console.log(`✅ [重新测试] 扣次数成功！今日剩余 ${rec.remainingToday} 次，有效期剩余 ${rec.daysLeft} 天`)
    localStorage.removeItem('test_answers')
    localStorage.removeItem('test_basic_info')
    // 注意：不删除 test_report，保留旧报告以便用户对比

    showToast(`开始新测评！今日剩余${rec.remainingToday}次 · 剩余${rec.daysLeft}天`, 2000, 'success')
    
  } else {
    // ========== 场景1：第一次测评（没有旧报告）==========
    console.log('🆕 [第一次测评] 没有旧报告，次数已在激活页面扣除')
    // 注意：此时次数已经在 ActivationPage.vue 中扣除了
    // 这里不需要再次扣除，也不需要检查剩余次数
  }

  // 🎲 生成随机题目（从60题库中随机抽取35题+2题固定效度题）
  questions.value = getRandomQuestions()
  console.log('✨ 已生成随机题目，本次测评共', questions.value.length, '题')

  window.addEventListener('resize', handleResize)
  handleResize()
  loadBasicInfo()
  loadAnswers()

  // 如果有保存的进度，询问是否继续
  if (Object.keys(answers).length > 0 && currentQuestion.value > 1) {
    showToast(`继续之前的测评（第${currentQuestion.value}题）`, 2000, 'info')
  }
})
</script>

<style scoped>
.assessment-page {
  flex-direction: column;
  height: calc(100vh - 56px); /* 扣除导航高度，消除被挤压 */
  overflow: visible; /* 改为visible，避免底部按钮被裁切 */
  background: var(--bg-main);
}

/* 移动端使用动态视口高度，避免浏览器UI遮挡 */
@media (max-width: 768px) {
  .assessment-page {
    height: calc(100dvh - 56px); /* 使用动态视口高度 */
    padding-bottom: env(safe-area-inset-bottom); /* iOS安全区域 */
    overflow: visible; /* 确保内容不被裁切 */
  }
}

/* ========== 基础信息页样式 ========== */
.basic-info-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 60px 20px 40px; /* 减少顶部padding，为小屏幕留出更多空间 */
  background: var(--bg-main);
  overflow-y: auto;
}

/* 小屏幕优化：减少padding确保按钮可见 */
@media (max-width: 480px) {
  .basic-info-page {
    padding: 70px 16px 30px;
    align-items: flex-start; /* 顶部对齐，避免内容被裁切 */
  }
}

.basic-info-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
}

.basic-info-title {
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 12px;
}

/* 小屏幕优化：减小标题尺寸 */
@media (max-width: 480px) {
  .basic-info-title {
    font-size: 26px;
    margin-bottom: 8px;
  }
}

.basic-info-subtitle {
  font-size: 16px;
  text-align: center;
  margin-bottom: 32px; /* 减少底部间距 */
  line-height: 1.6;
}

/* 小屏幕优化：减小字体和间距 */
@media (max-width: 480px) {
  .basic-info-subtitle {
    font-size: 14px;
    margin-bottom: 24px;
    line-height: 1.5;
  }
}

.basic-info-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-bottom: 32px; /* 减少底部间距 */
}

/* 小屏幕优化：减少间距 */
@media (max-width: 480px) {
  .basic-info-form {
    gap: 24px;
    margin-bottom: 24px;
  }
}

.info-question-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 小屏幕优化：减少间距 */
@media (max-width: 480px) {
  .info-question-group {
    gap: 12px;
  }
}

.info-label {
  font-size: 16px;
  font-weight: 600;
}

.optional-tag {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-secondary);
  margin-left: 4px;
}

.info-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

/* 平板与桌面：更多列，提升信息密度 */
@media (min-width: 768px) {
  .info-options {
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }
}

.info-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 10px;
  background: var(--bg-card);
  border: 2px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.info-option:hover {
  background: var(--bg-section);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.info-option.selected {
  background: var(--bg-section);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb, 255, 99, 132), 0.15);
}

.info-option-text {
  font-size: 14px;
  color: var(--text-body);
  line-height: 1.2;
  pointer-events: none;
}

.info-option.selected .info-option-text {
  color: var(--text-title);
  font-weight: 600;
}

.info-option .iconify {
  color: var(--primary);
  pointer-events: none;
  margin-left: 4px;
}

.btn-start-assessment {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  background: var(--primary);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

/* 小屏幕优化：调整按钮尺寸 */
@media (max-width: 480px) {
  .btn-start-assessment {
    height: 50px;
    font-size: 16px;
    margin-bottom: 12px;
  }
}

.btn-start-assessment:not(:disabled):hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-rgb, 255, 99, 132), 0.3);
}

.btn-start-assessment:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.privacy-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  text-align: center;
  line-height: 1.6;
}

/* 基础信息分页导航（移动端和桌面端） */
.basic-info-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 8px 0 16px; /* 增加底部间距 */
}

/* 小屏幕优化：调整间距 */
@media (max-width: 480px) {
  .basic-info-nav {
    margin: 12px 0 16px;
  }
}

.basic-info-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.basic-info-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border);
}

.basic-info-dots .dot.active {
  background: var(--primary);
}

/* ========== 答题页面样式（原有样式保持不变） ========== */
.assessment-content {
  display: flex;
  flex-direction: column;

}

/* ========== 开发者调试面板 ========== */
.dev-panel {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 0;
  z-index: 9999;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  min-width: 200px;
  max-width: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dev-panel.dragging {
  cursor: move;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  transform: scale(1.02);
}

.dev-panel.minimized {
  min-width: auto;
}

.dev-panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffd700;
  font-size: 12px;
  font-weight: 600;
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px 12px 0 0;
}

.dev-panel-header:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dev-panel-header .drag-handle {
  color: rgba(255, 255, 255, 0.3);
  cursor: move;
}

.dev-panel-header:hover .drag-handle {
  color: rgba(255, 255, 255, 0.6);
}

.dev-panel-title {
  flex: 1;
}

.dev-panel-controls {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.dev-control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
  padding: 0;
}

.dev-control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.dev-control-btn:active {
  transform: scale(0.95);
}

.dev-panel-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dev-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.dev-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dev-btn:active {
  transform: translateY(0);
}

.dev-btn-warning {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
}

.dev-btn-warning:hover {
  background: linear-gradient(135deg, #ff5252, #e04e5f);
}

.dev-btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.dev-btn-primary:hover {
  background: linear-gradient(135deg, #5568d3, #6a4093);
}

.dev-btn-info {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.dev-btn-info:hover {
  background: linear-gradient(135deg, #3d9ae8, #00d9e8);
}

/* 进度栏 */
.progress-header {
  padding: 16px 20px;
  margin-top: 8%;
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
  height: 8px;
  background: var(--bg-section);
  border-radius: 4px;
  position: relative;
  transition: height 0.2s ease;
}

.progress-bar.interactive {
  cursor: pointer;
}

.progress-bar:hover {
  height: 12px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, var(--primary-hover, var(--primary)) 100%);
  border-radius: 4px;
  transition: width 0.15s ease;
  pointer-events: none;
}

/* 进度条滑块 */
.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: var(--primary);
  border: 3px solid var(--bg-main);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.15s ease;
  pointer-events: none;
  opacity: 0;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
  width: 20px;
  height: 20px;
}

/* 刻度点容器 */
.progress-dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 刻度点 */
.progress-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: var(--bg-section);
  border: 1.5px solid var(--border);
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0;
}

.progress-bar:hover .progress-dot {
  opacity: 1;
}

.progress-dot.answered {
  background: var(--primary);
  border-color: var(--primary);
  opacity: 0.6;
}

.progress-bar:hover .progress-dot.answered {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.progress-dot.current {
  background: var(--primary);
  border-color: var(--primary);
  opacity: 1;
  width: 8px;
  height: 8px;
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 255, 99, 132), 0.2);
}

.progress-bar:hover .progress-dot.current {
  transform: translate(-50%, -50%) scale(1.3);
}

/* 内容区域 */
.content-area {
  margin-top: 3%;
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

/* 移动端内容区域优化 */
@media (max-width: 768px) {
  .content-area {
    padding-bottom: max(20px, env(safe-area-inset-bottom)); /* 确保底部有足够空间 */
  }
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
  padding: 15px 15px;
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
  padding: 19px 15px; /* 补偿边框 */
  box-shadow: 0 4px 12px rgba(var(--primary-rgb, 255, 99, 132), 0.15);
}

/* 选中动画 - 使用 v-show 配合 CSS */
.option-item.selected {
  animation: selectPulse 0.4s ease-out;
}

@keyframes selectPulse {
  0% {
    transform: scale(0.98);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

.option-radio {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.radio-checked {
  color: var(--primary);
  animation: radioPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes radioPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.radio-unchecked {
  color: var(--border);
  transition: all 0.2s ease;
}

.option-item:hover .radio-unchecked {
  color: var(--primary);
  transform: scale(1.1);
}

.option-text {
  flex: 1;
  font-size: 16px;
  color: var(--text-body);
  line-height: 1.5;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-item.selected .option-text {
  color: var(--text-title);
  font-weight: 600;
  transform: translateX(2px);
}

.option-check {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-weight: bold;
  animation: checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes checkPop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  60% {
    transform: scale(1.2) rotate(5deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
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
  padding-bottom: max(12px, env(safe-area-inset-bottom)); /* iOS安全区域 */
}

/* 桌面端：底部操作栏也居中显示，左右留白17% */
@media (min-width: 769px) {
  .action-bar { padding: 12px 17%; }
}

/* 移动端底部操作栏优化 */
@media (max-width: 768px) {
  .action-bar.in-content {
    margin-bottom: env(safe-area-inset-bottom); /* 确保不被底部UI遮挡 */
  }
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
  .basic-info-page {
    padding: 72px 12px 16px;
    min-height: 100vh;
  }
  
  .basic-info-container {
    padding: 0;
  }
  
  .basic-info-title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .basic-info-subtitle {
    font-size: 13px;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  
  .basic-info-form {
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .info-question-group {
    gap: 10px;
  }
  
  .info-label {
    font-size: 15px;
  }
  
  .info-options {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  
  .info-option {
    padding: 8px 6px;
    border-radius: 8px;
  }
  
  .info-option-text {
    font-size: 13px;
  }
  
  .btn-start-assessment {
    height: 48px;
    font-size: 16px;
    margin-bottom: 12px;
    border-radius: 10px;
  }
  
  .privacy-note {
    font-size: 12px;
    gap: 6px;
  }
  
  .basic-info-nav {
    margin: 12px 0 16px;
  }

  .content-area { 
    padding: 16px; 
    padding-bottom: max(16px, env(safe-area-inset-bottom)); /* 底部安全区域 */
  }

  .question-text {
    font-size: 18px;
    line-height: 1.35;
    margin-bottom: 30px;
  }
  .progress-header { margin-top: 15%; }
  .options-list { gap: 8px; }

  .option-item { padding: 14px; margin-bottom: 8px; }
  .option-text { font-size: 15px; }

  .action-bar.in-content { 
    margin-top: 28px;
    margin-bottom: max(8px, env(safe-area-inset-bottom)); /* 底部安全距离 */
  }
  .btn-nav { height: 44px; font-size: 15px; border-radius: 10px; }
}
</style>

<!-- 🎯 重新测试确认对话框样式 (全局样式,不受 scoped 限制) -->
<style>
.retest-confirm-modal {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 99999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  animation: fadeIn 0.2s ease;
  pointer-events: auto !important;
}

.retest-confirm-modal .modal-overlay {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.6) !important;
  backdrop-filter: blur(4px);
}

.retest-confirm-modal .modal-content {
  position: relative !important;
  background: var(--bg-card) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px var(--shadow-deep) !important;
  max-width: 420px !important;
  width: 90% !important;
  overflow: hidden !important;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--border) !important;
}

.retest-confirm-modal .modal-header {
  padding: 24px 24px 16px !important;
  border-bottom: 1px solid var(--border) !important;
  background: var(--bg-section) !important;
}

.retest-confirm-modal .modal-title {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: var(--text-title) !important;
  margin: 0 !important;
}

.retest-confirm-modal .modal-body {
  padding: 24px !important;
  background: var(--bg-card) !important;
}

.retest-confirm-modal .modal-message {
  font-size: 16px !important;
  font-weight: 600 !important;
  color: var(--text-title) !important;
  margin: 0 0 12px 0 !important;
  line-height: 1.5 !important;
}

.retest-confirm-modal .modal-hint {
  font-size: 14px !important;
  color: var(--text-secondary) !important;
  margin: 0 !important;
  line-height: 1.6 !important;
}

.retest-confirm-modal .modal-footer {
  padding: 16px 24px 24px !important;
  display: flex !important;
  gap: 12px !important;
  background: var(--bg-card) !important;
}

.retest-confirm-modal .modal-btn {
  flex: 1 !important;
  height: 48px !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.retest-confirm-modal .modal-btn-secondary {
  background: var(--bg-section) !important;
  color: var(--text-title) !important;
  border: 1px solid var(--border) !important;
}

.retest-confirm-modal .modal-btn-secondary:hover {
  background: var(--bg-main) !important;
  border-color: var(--primary) !important;
}

.retest-confirm-modal .modal-btn-primary {
  background: var(--primary) !important;
  color: #fff !important;
}

.retest-confirm-modal .modal-btn-primary:hover {
  background: var(--primary-hover) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px var(--shadow-medium) !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 移动端优化 */
@media (max-width: 480px) {
  .retest-confirm-modal .modal-content {
    max-width: 95% !important;
  }

  .retest-confirm-modal .modal-header {
    padding: 20px 20px 12px !important;
  }

  .retest-confirm-modal .modal-title {
    font-size: 18px !important;
  }

  .retest-confirm-modal .modal-body {
    padding: 20px !important;
  }

  .retest-confirm-modal .modal-message {
    font-size: 15px !important;
  }

  .retest-confirm-modal .modal-hint {
    font-size: 13px !important;
  }

  .retest-confirm-modal .modal-footer {
    padding: 12px 20px 20px !important;
    flex-direction: column !important;
  }

  .retest-confirm-modal .modal-btn {
    height: 44px !important;
    font-size: 15px !important;
  }
}
</style>
