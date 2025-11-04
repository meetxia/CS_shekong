<template>
  <div class="report-page">
    <!-- 本页不再渲染局部导航，统一使用全局 AppHeader -->

    <!-- 滚动内容区 -->
    <div class="content-scroll">
      <div v-if="report" class="report-content container">
        <!-- 顶部角标：激活码剩余信息 -->
        <div v-if="status" class="status-badge">
          <span>激活码剩余：{{ status.daysLeft }}天 · 今日：{{ status.remainingToday }}/{{ status.dailyLimit }}</span>
        </div>
        <!-- 1. 总分卡片 -->
        <div class="score-card gradient-card fade-in" :data-level="getLevelCategory()">
          <div class="score-decoration"></div>
          <div class="score-layout">
            <!-- 左侧：超大分数 -->
            <div class="score-left">
              <div class="total-score">{{ report.totalScore }}</div>
              <div class="score-unit">分</div>
            </div>
            <!-- 右侧：文字信息 -->
            <div class="score-right">
              <h2 class="score-title">社恐程度评估结果</h2>
              <div class="level-name">{{ report.level.name }}</div>
              <div class="score-desc text-body">{{ report.level.desc }}</div>
            </div>
          </div>
        </div>

        <!-- 2. 等级图示 -->
        <div class="section-card card fade-in level-distribution-card" style="animation-delay: 0.1s">
          <h3 class="section-title text-title">社恐等级分布</h3>
          <div class="level-indicator">
            <div class="scale-line">
              <span class="scale-point">0</span>
              <span class="scale-point your-position" :style="{ left: `${Math.min(100, Math.max(0, report.totalScore))}%` }">
                {{ report.totalScore }}
                <span class="position-label">你在这里 ↑</span>
              </span>
              <span class="scale-point">100</span>
            </div>
            <div class="level-bar">
              <div class="level-segment level-seg-low">轻度</div>
              <div class="level-segment level-seg-medium">中度</div>
              <div class="level-segment level-seg-high">重度</div>
              <div class="level-segment level-seg-severe">极重度</div>
            </div>
          </div>
        </div>

        <!-- 3. 维度深度分析 -->
        <div class="section-card card fade-in dimension-analysis-card" style="animation-delay: 0.2s">
          <h3 class="section-title text-title">维度深度分析</h3>
          
          <!-- 雷达图 -->
          <div ref="radarChart" class="radar-chart"></div>
          
          <!-- 维度详解 -->
          <div class="dimensions-detail">
            <h4 class="detail-title text-title">维度详解</h4>
            <div
              v-for="(dim, index) in report.dimensions"
              :key="dim.key"
              class="dimension-item"
              :data-dimension="index"
            >
              <div class="dimension-header">
                <span class="dimension-name">{{ index + 1 }}. {{ dim.name }}</span>
                <span class="dimension-level" :class="'level-' + dim.level.level">
                  {{ dim.level.level }} {{ dim.level.icon }}
                </span>
              </div>
              <div class="dimension-bar">
                <div 
                  class="dimension-fill" 
                  :style="{ width: `${dim.percentage}%` }"
                  :data-dimension="index"
                ></div>
              </div>
              <div class="dimension-score">{{ dim.score }}/{{ dim.maxScore }}</div>
              <div class="dimension-desc text-body">→ {{ dim.interpretation }}</div>
            </div>
          </div>
        </div>

        <!-- 4. 类型诊断 -->
        <div class="section-card card fade-in" style="animation-delay: 0.3s">
          <h3 class="section-title text-title">你的社恐类型</h3>
          
          <div class="type-badge">
            <div class="type-name">「{{ report.type.name }}」</div>
            <div class="type-english">{{ report.type.englishName }}</div>
          </div>
          
          <div class="type-section">
            <h4 class="subsection-title text-title">核心特征</h4>
            <ul class="feature-list">
              <li v-for="(feature, index) in report.type.features" :key="index" class="feature-item text-body">
                {{ feature }}
              </li>
            </ul>
          </div>
          
          <div class="type-section">
            <h4 class="subsection-title text-title">心理根源分析</h4>
            <p class="text-body">你的社恐本质上源于：</p>
            <div v-for="(cause, index) in report.type.rootCauses" :key="index" class="cause-item">
              <div class="cause-title text-title">{{ index + 1 }}. {{ cause.title }}</div>
              <div class="cause-desc text-body">{{ cause.desc }}</div>
            </div>
          </div>
          
          <div class="type-section positive-section section-bg">
            <h4 class="subsection-title text-title">重新认识你的社恐</h4>
            <p class="text-body">{{ report.type.positiveReframe }}</p>
          </div>

          <!-- 情绪化金句：写给你的信 -->
          <div class="type-section section-bg" style="margin-top: 16px;">
            <h4 class="subsection-title text-title">💌 写给{{ report.type.name }}的你</h4>
            <p class="text-body" v-html="letterContent"></p>
          </div>
        </div>

        <!-- 5. 改善建议 -->
        <div class="section-card card fade-in" style="animation-delay: 0.4s">
          <h3 class="section-title text-title">专属改善建议</h3>
          
          <!-- 立即可行动 -->
          <div class="suggestions-section">
            <h4 class="subsection-title text-title">立即可行动</h4>
            <div v-for="(suggestion, index) in report.suggestions.immediate" :key="index" class="suggestion-item">
              <div class="suggestion-title">{{ index + 1 }}. {{ suggestion.title }}</div>
              <div v-if="suggestion.steps" class="suggestion-steps">
                <div class="step-label">具体方法：</div>
                <ol class="step-list">
                  <li v-for="(step, i) in suggestion.steps" :key="i" class="step-item">{{ step }}</li>
                </ol>
                <div class="step-reason text-secondary">
                  <strong>原理：</strong>{{ suggestion.reason }}
                </div>
              </div>
              <div v-if="suggestion.content" class="suggestion-content text-body" v-html="formatContent(suggestion.content)"></div>
            </div>
          </div>
          
          <!-- 4周渐进计划 -->
          <div class="suggestions-section">
            <h4 class="subsection-title text-title">从"低风险社交"开始</h4>
            <div class="weekly-plan">
              <div v-for="(week, key) in report.suggestions.weekly" :key="key" class="week-item" v-if="key !== 'principle'">
                <div class="week-title">{{ week.title }}</div>
                <ul class="week-tasks">
                  <li v-for="(task, i) in week.tasks" :key="i" class="task-item text-body">{{ task }}</li>
                </ul>
              </div>
              <div class="principle-note text-secondary">
                <strong>关键原则：</strong>{{ report.suggestions.weekly.principle }}
              </div>
            </div>
          </div>
          
          <!-- 长期改善 -->
          <div class="suggestions-section">
            <h4 class="subsection-title text-title">长期改善路径</h4>
            <div class="longterm-content">
              <div class="resource-group">
                <div class="resource-label">推荐阅读：</div>
                <ul class="resource-list">
                  <li v-for="(book, i) in report.suggestions.longTerm.books" :key="i" class="text-body">
                    · {{ book.title }} - {{ book.author }}
                  </li>
                </ul>
              </div>
              <div class="resource-group">
                <div class="resource-label">推荐练习：</div>
                <ul class="resource-list">
                  <li v-for="(practice, i) in report.suggestions.longTerm.practices" :key="i" class="text-body">
                    · {{ practice }}
                  </li>
                </ul>
              </div>
              <p class="text-secondary">{{ report.suggestions.longTerm.note }}</p>
            </div>
          </div>
          
          <!-- 专业帮助提示 -->
          <div class="warning-section">
            <h4 class="warning-title">{{ report.suggestions.warning.title }}</h4>
            <p class="text-body">如果你的社恐已经：</p>
            <ul class="warning-list">
              <li v-for="(condition, i) in report.suggestions.warning.conditions" :key="i" class="text-body">
                · {{ condition }}
              </li>
            </ul>
            <p class="warning-advice text-body">
              <strong>建议：</strong>{{ report.suggestions.warning.advice }}
            </p>
          </div>
        </div>

        <!-- 6. 报告说明 -->
        <div class="footer-info fade-in" style="animation-delay: 0.5s">
          <h4 class="info-title text-secondary">测评说明</h4>
          <ul class="info-list text-secondary">
            <li>· 本测评基于SAS社交焦虑量表改良</li>
            <li>· 测评结果仅供自我探索参考</li>
            <li>· 不构成医疗诊断，如有严重心理问题请寻求专业帮助</li>
            <li>· 测评时间：{{ formatDate(report.testDate) }}</li>
          </ul>
          <div class="footer-text text-disabled">数据安全 · 隐私保护 · 专业可信</div>
        </div>

        <!-- 7. 你的测试历史（只保存在本设备） -->
        <div class="section-card card fade-in" style="animation-delay: 0.55s">
          <h3 class="section-title text-title">你的测试历史</h3>
          <p class="text-secondary small-note">提示：历史记录只保存在本设备的浏览器中，如果切换设备或清除浏览器数据，历史记录将不会保留。</p>
          <div v-if="history.length > 0" class="history-list">
            <div v-for="(h, idx) in history" :key="idx" class="history-item">
              <div class="history-date">{{ dayjs(h.date).format('YYYY.MM.DD') }}</div>
              <div class="history-score">{{ h.totalScore }}分</div>
              <div class="history-level">{{ h.levelName }}</div>
              <div class="history-type">{{ h.typeName }}</div>
            </div>
            <div v-if="history.length >= 2" class="history-summary text-title">
              <span>最近进步：{{ progressText }}</span>
            </div>
          </div>
          <div v-else class="text-secondary">暂无历史记录</div>
        </div>

        <!-- 8. 下一步行动 -->
        <div class="section-card card fade-in" style="animation-delay: 0.65s">
          <h3 class="section-title text-title">下一步行动</h3>
          <div class="next-actions">
            <button class="btn-primary next-btn" @click="goRetest">再测一次（建议2-3天后）</button>
            <button class="btn-secondary next-btn" @click="openShareActivation">分享激活码给好友</button>
            <button class="next-btn" @click="openShare">分享结果到小红书</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除本地配色弹窗，改由全局 AppHeader 控制 -->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { showShareModal } from '@/utils/shareCard'
import { getActivationStatus, getActivationCode, generateActivationShareLink } from '@/utils/activation'

const router = useRouter()
const report = ref(null)
const radarChart = ref(null)
let chartInstance = null
const status = ref(null)
const letterContent = ref('')
const history = ref([])
const progressText = ref('')

// 全局导航已提供返回与首页入口


const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY年MM月DD日')
}

const formatContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 根据分数获取等级分类（用于配色）
const getLevelCategory = () => {
  // 直接根据评分名称映射，避免阈值不一致
  switch (report.value?.level?.name) {
    case '社交自如型':
      return 'low'
    case '轻度社交焦虑':
      return 'medium'
    case '中度社交焦虑':
      return 'high'
    case '重度社交焦虑':
    case '极重度社交焦虑':
      return 'severe'
    default:
      return 'medium'
  }
}

// 主题切换由全局处理；当主题类变化时会触发重绘

const openShare = () => {
  if (report.value) {
    showShareModal(report.value)
  }
}

// 基础信息映射到展示文案

const buildLetter = (typeName) => {
  const letters = {
    '预演型社恐': `每次社交前，你都在心里排练无数遍对话。请记得：你不是准备不够，而是给自己的压力太大了。慢慢来，你已经很好。`,
    '回避型社恐': `逃避不可耻，但迈出一小步会更自由。从一次短短的问候开始，你会看到变化。`,
    '表演型社恐': `你以为所有人都在看你，其实大多数人都忙着关注自己。你的紧张，别人看不见。`,
    '综合型社恐': `敏感细腻不是缺陷，它让你更懂他人。和自己和解，一点点地往前走。`,
    '轻度社恐': `你已经很好了，只需要多一点点勇气。今天做一件让自己更自在的小事吧。`
  }
  return letters[typeName] || '你不需要变成“社交牛逼症”，只需更温柔地对待自己。慢慢来，会好的。'
}

const goRetest = () => {
  router.push('/assessment')
}

const openShareActivation = () => {
  const code = getActivationCode()
  const link = generateActivationShareLink()
  const modal = document.createElement('div')
  modal.className = 'share-modal'
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header"><h3>分享给好友</h3><button class="close-btn">×</button></div>
      <div class="modal-body">
        <div class="share-activation">
          <div class="row"><span class="label">激活码</span><input class="copy-input" value="${code}" readonly /></div>
          <div class="row"><span class="label">专属链接</span><input class="copy-input" value="${link}" readonly /></div>
          <div class="tips text-secondary">说明：同一激活码每日最多3次，总有效期7天</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="copyCode">复制激活码</button>
        <button class="btn-primary" id="copyLink">复制链接</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)
  const copy = (text) => navigator.clipboard?.writeText(text)
  modal.querySelector('#copyCode').addEventListener('click', () => copy(code))
  modal.querySelector('#copyLink').addEventListener('click', () => copy(link))
  const close = () => modal.remove()
  modal.querySelector('.close-btn').addEventListener('click', close)
  modal.querySelector('.modal-overlay').addEventListener('click', close)
}

const renderRadarChart = () => {
  if (!radarChart.value || !report.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(radarChart.value, null, {
    renderer: 'canvas',
    devicePixelRatio: window.devicePixelRatio || 1,
    useDirtyRect: true
  })
  
  // 获取当前主题颜色
  const computedStyle = getComputedStyle(document.documentElement)
  const primaryColor = computedStyle.getPropertyValue('--primary').trim()
  const textColor = computedStyle.getPropertyValue('--text-title').trim()
  const isDark = document.body.className.includes('-dark')
  
  // 优化配色 - 更明亮生动
  const gridColor = isDark ? 'rgba(212,181,172,0.35)' : 'rgba(212,165,116,0.25)'
  const radarLineColor = isDark ? 'rgba(255,180,150,0.9)' : 'rgba(255,77,79,0.85)'
  const radarAreaColor = isDark 
    ? 'rgba(255,180,150,0.25)' 
    : 'rgba(255,160,122,0.25)'
  const labelColor = isDark ? '#F5E6D3' : '#2A2A2A'
  
  // 准备雷达图数据
  const indicatorData = report.value.dimensions.map(dim => ({
    name: dim.name,
    max: dim.maxScore
  }))
  
  const seriesData = report.value.dimensions.map(dim => dim.score)
  
  const option = {
    backgroundColor: 'transparent',
    radar: {
      indicator: indicatorData,
      radius: '60%',
      splitNumber: 4,
      name: {
        textStyle: {
          color: labelColor,
          fontSize: 13,
          fontWeight: 400
        }
      },
      splitLine: {
        lineStyle: {
          color: gridColor,
          type: 'solid',
          width: 1.0
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDark 
            ? ['rgba(212,181,172,0.05)', 'rgba(212,181,172,0.08)']
            : ['rgba(255,160,122,0.04)', 'rgba(255,180,140,0.08)']
        }
      },
      axisLine: {
        lineStyle: {
          color: gridColor,
          width: 1
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: seriesData,
        name: '你的数据',
        areaStyle: {
          color: radarAreaColor,
          opacity: 0.7
        },
        lineStyle: {
          color: radarLineColor,
          width: 3.5,
          shadowColor: radarLineColor,
          shadowBlur: 8
        },
        itemStyle: {
          color: radarLineColor,
          borderColor: '#fff',
          borderWidth: 2.5,
          shadowColor: radarLineColor,
          shadowBlur: 6
        },
        symbolSize: 7,
        emphasis: {
          lineStyle: {
            width: 4
          },
          itemStyle: {
            shadowBlur: 10
          }
        }
      }]
    }]
  }
  
  chartInstance.setOption(option)
  chartInstance.resize()
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

onMounted(async () => {
  // 加载报告数据
  const savedReport = localStorage.getItem('test_report')
  if (savedReport) {
    try {
      report.value = JSON.parse(savedReport)
      status.value = await getActivationStatus()
      letterContent.value = buildLetter(report.value.type.name).replace(/\n/g, '<br>')
      // 历史记录与常模对比
      try {
        const raw = localStorage.getItem('test_history')
        history.value = raw ? JSON.parse(raw) : []
        if (history.value.length >= 2) {
          const a = history.value[0].totalScore
          const b = history.value[1].totalScore
          const diff = b - a
          progressText.value = diff > 0 ? `较上次降低 ${diff} 分（进步）` : diff < 0 ? `较上次增加 ${-diff} 分` : '与上次持平'
        }
      } catch {}

      // 渲染雷达图
      nextTick(() => {
        renderRadarChart()
      })
    } catch (e) {
      console.error('加载报告失败:', e)
      router.push('/assessment')
    }
  } else {
    router.push('/assessment')
  }
})
</script>

<style scoped>
.report-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-main);
  /* 优化字体渲染，防止模糊 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 顶部导航样式改由全局 AppHeader 提供 */

/* 滚动内容 */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  /* 让内容起始不被全局导航遮挡 - 增加顶部间距避免导航遮挡 */
  padding: 72px 0 24px 0;
  background: var(--bg-main);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  /* 确保内容清晰，不受 backdrop-filter 影响 */
  transform: translateZ(0);
  will-change: scroll-position;
}

.report-content {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 40px;
  /* 强制硬件加速，提升清晰度 */
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 顶部角标：激活状态 - 固定在页面顶部 */
.status-badge {
  position: fixed;
  top: -35px;
  left: 16px;
  z-index: 100;
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bg-section);
  color: var(--text-title);
  font-size: 11px;
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
  max-width: 200px;
}

/* 总分卡片 - 根据等级动态配色 */
.score-card {
  position: relative;
  padding: 40px 32px;
  margin-top: 40px;
  margin-bottom: 20px;
  border-radius: 16px;
  color: #fff;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}

/* 分数布局容器 - 左右分布 */
.score-layout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  position: relative;
  z-index: 1;
  max-width: 550px;
  width: 100%;
}

/* 左侧分数区域 */
.score-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
}

/* 右侧文字信息区域 */
.score-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  flex-shrink: 0;
}

/* 装饰性背景元素 */
.score-decoration {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

/* 轻度社恐 - 更淡的宁静绿 */
.score-card[data-level="low"] {
  background: linear-gradient(135deg, #A8BDA5 0%, #C9D9C4 50%, #A8BDA5 100%);
}

/* 中度社恐 - 更淡的温暖橙 */
.score-card[data-level="medium"] {
  background: linear-gradient(135deg, #E0BF9A 0%, #F0D9C0 50%, #E0BF9A 100%);
}

/* 重度社恐 - 更淡的柔和红 */
.score-card[data-level="high"] {
  background: linear-gradient(135deg, #D9A39B 0%, #ECC5BE 50%, #D9A39B 100%);
}

/* 极重度社恐 - 更淡的深沉紫红 */
.score-card[data-level="severe"] {
  background: linear-gradient(135deg, #B88FA0 0%, #D9B0BC 50%, #B88FA0 100%);
}

/* 左侧：超大分数 */
.total-score {
  font-size: 110px;
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 1;
  background: linear-gradient(180deg, #FF4D4F 0%, #FF7875 50%, #FFA940 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  filter: drop-shadow(0 4px 12px rgba(255, 77, 79, 0.2));
  transform: scale(1);
  transition: transform 0.3s ease;
}

.total-score:hover {
  transform: scale(1.08);
}

/* 分数单位 */
.score-unit {
  font-size: 28px;
  font-weight: 700;
  color: #1A1A1A;
  opacity: 0.8;
  align-self: flex-end;
  margin-bottom: 8px;
}

/* 右侧：标题 */
.score-title {
  font-size: 12px;
  font-weight: 500;
  color: #1A1A1A;
  opacity: 0.7;
  letter-spacing: 0.5px;
  margin: 0;
}

/* 右侧：等级名 */
.level-name {
  font-size: 40px;
  font-weight: 800;
  color: #1A1A1A;
  letter-spacing: 3px;
  margin: 4px 0;
  line-height: 1.2;
}

/* 右侧：等级描述文字 */
.score-desc {
  font-size: 13px;
  opacity: 0.85;
  font-weight: 400;
  letter-spacing: 0.3px;
  color: #1A1A1A;
  margin-top: 8px;
  line-height: 1.5;
}

/* 章节卡片 */
.section-card {
  margin-bottom: 20px;
  padding: 24px;
  transition: all 0.3s ease;
}

.section-card:hover {
  transform: translateY(-2px);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

/* 等级图示 */
.level-distribution-card {
  background: linear-gradient(
    to bottom right,
    var(--bg-card) 0%,
    rgba(184, 201, 168, 0.05) 100%
  );
}

.level-indicator {
  padding: 20px 0;
}

.scale-line {
  position: relative;
  height: 40px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scale-point {
  font-size: 14px;
  color: var(--text-secondary);
  position: relative;
  font-weight: 500;
}

.your-position {
  position: absolute;
  color: var(--primary);
  font-weight: 700;
  font-size: 18px;
}

.position-label {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
  font-weight: 600;
}

.level-bar {
  display: flex;
  height: 36px;
  border-radius: 18px;
  overflow: hidden;
}

.level-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  font-weight: 700;
  transition: all 0.3s ease;
}

.level-segment:hover {
  filter: brightness(1.1);
}

.level-seg-low {
  width: 50%; /* 0-50分：包含社交自如型(0-30)和轻度(31-50) */
  background: linear-gradient(135deg, #91A88E 0%, #B8C9A8 100%);
}

.level-seg-medium {
  width: 20%; /* 51-70分：中度 */
  background: linear-gradient(135deg, #D4A574 0%, #E8C4A0 100%);
}

.level-seg-high {
  width: 20%; /* 71-90分：重度 */
  background: linear-gradient(135deg, #C8837B 0%, #DDA89E 100%);
}

.level-seg-severe {
  width: 10%; /* 91-100分：极重度 */
  background: linear-gradient(135deg, #A17185 0%, #C9949F 100%);
}

/* 维度分析卡片 - 添加柔和渐变背景 */
.dimension-analysis-card {
  position: relative;
  background: linear-gradient(
    to bottom right,
    var(--bg-card) 0%,
    var(--bg-section) 100%
  );
}

/* 雷达图 */
.radar-chart {
  width: 100%;
  height: 300px;
  margin: 20px 0;
  padding: 16px;
  background: var(--bg-section);
  border-radius: 12px;
}

/* 维度详解 */
.dimensions-detail {
  margin-top: 24px;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.dimension-item {
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-card);
  transition: all 0.3s ease;
}

.dimension-item:hover {
  background: var(--bg-section);
  transform: translateX(4px);
}

.dimension-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.dimension-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-title);
}

.dimension-level {
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.level-较低 {
  background: linear-gradient(135deg, #B8C9A8 0%, #91A88E 100%);
  color: #fff;
}

.level-中等 {
  background: linear-gradient(135deg, #E8C4A0 0%, #D4A574 100%);
  color: #fff;
}

.level-中高 {
  background: linear-gradient(135deg, #E8A87D 0%, #D48555 100%);
  color: #fff;
}

.level-偏高 {
  background: linear-gradient(135deg, #E89B9B 0%, #D67575 100%);
  color: #fff;
}

.dimension-bar {
  height: 8px;
  background: var(--bg-section);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.dimension-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.5s ease;
  border-radius: 4px;
}

/* 六维度专属配色 - 心理学色彩搭配 */
.dimension-fill[data-dimension="0"] {
  background: linear-gradient(90deg, #E89B9B 0%, #D67575 100%); /* 陌生人恐惧 - 柔和红 */
}

.dimension-fill[data-dimension="1"] {
  background: linear-gradient(90deg, #E8C4A0 0%, #D4A574 100%); /* 权威恐惧 - 温暖橙 */
}

.dimension-fill[data-dimension="2"] {
  background: linear-gradient(90deg, #D9C89E 0%, #C4B584 100%); /* 评价恐惧 - 金色 */
}

.dimension-fill[data-dimension="3"] {
  background: linear-gradient(90deg, #B8C9A8 0%, #91A88E 100%); /* 社交表现焦虑 - 宁静绿 */
}

.dimension-fill[data-dimension="4"] {
  background: linear-gradient(90deg, #A8B8D4 0%, #7B91B8 100%); /* 回避行为 - 冷静蓝 */
}

.dimension-fill[data-dimension="5"] {
  background: linear-gradient(90deg, #C9A8C9 0%, #A885A8 100%); /* 生理症状 - 柔和紫 */
}

.dimension-score {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.dimension-desc {
  font-size: 14px;
  line-height: 1.6;
}

/* 类型诊断 */
.type-badge {
  text-align: center;
  padding: 32px 24px;
  background: linear-gradient(135deg, 
    rgba(145, 168, 142, 0.15) 0%, 
    rgba(212, 165, 116, 0.15) 50%,
    rgba(200, 131, 123, 0.15) 100%
  );
  border-radius: 16px;
  margin-bottom: 24px;
  border: 2px solid var(--border);
  position: relative;
  overflow: hidden;
}

.type-badge::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  pointer-events: none;
}

.type-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 8px;
  position: relative;
  z-index: 1;

}

.type-english {
  font-size: 14px;
  color: var(--text-secondary);
  position: relative;
  z-index: 1;
}

.type-section {
  margin-bottom: 24px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.feature-list {
  list-style: none;
  padding: 0;
}

.feature-item {
  padding: 8px 0;
  padding-left: 20px;
  position: relative;
  line-height: 1.8;
}

.feature-item::before {
  content: "·";
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: 700;
  font-size: 20px;
}

.cause-item {
  margin-bottom: 16px;
}

.cause-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.cause-desc {
  font-size: 14px;
  line-height: 1.6;
  padding-left: 16px;
}

.positive-section {
  padding: 20px;
  border-radius: 12px;
  line-height: 1.8;
  background: linear-gradient(135deg, 
    rgba(184, 201, 168, 0.2) 0%, 
    rgba(168, 184, 212, 0.2) 100%
  );
  border-left: 4px solid #91A88E;
}

/* 改善建议 */
.suggestions-section {
  margin-bottom: 32px;
}

.suggestion-item {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(
    to bottom right,
    var(--bg-section) 0%,
    var(--bg-card) 100%
  );
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.suggestion-item:hover {
  transform: translateY(-2px);
}

.suggestion-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-title);
}

.suggestion-steps {
  font-size: 14px;
  line-height: 1.8;
}

.step-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.step-list {
  margin: 8px 0;
  padding-left: 20px;
}

.step-item {
  margin: 4px 0;
}

.step-reason {
  margin-top: 12px;
  font-size: 13px;
  padding: 12px;
  background: linear-gradient(
    to right,
    rgba(184, 201, 168, 0.2) 0%,
    rgba(168, 184, 212, 0.2) 100%
  );
  border-radius: 8px;
  border-left: 3px solid #91A88E;
}

.suggestion-content {
  font-size: 14px;
  line-height: 1.8;
  white-space: pre-line;
}

/* 周计划 */
.weekly-plan {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.week-item {
  padding: 18px;
  background: linear-gradient(
    135deg,
    rgba(168, 184, 212, 0.12) 0%,
    rgba(201, 168, 201, 0.12) 100%
  );
  border-radius: 12px;
  border-left: 4px solid var(--primary);
}

.week-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 8px;
}

.week-tasks {
  list-style: none;
  padding: 0;
}

.task-item {
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
  font-size: 14px;
  line-height: 1.6;
}

.task-item::before {
  content: "·";
  position: absolute;
  left: 0;
  color: var(--primary);
}

.principle-note {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(
    to right,
    rgba(232, 196, 160, 0.15) 0%,
    rgba(184, 201, 168, 0.15) 100%
  );
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  border-left: 3px solid #D4A574;
}

/* 长期改善 */
.longterm-content {
  font-size: 14px;
  line-height: 1.8;
}

.resource-group {
  margin-bottom: 16px;
}

.resource-label {
  font-weight: 600;
  margin-bottom: 8px;
}

.resource-list {
  list-style: none;
  padding: 0;
}

/* 警告区域 */
.warning-section {
  padding: 20px;
  background: linear-gradient(
    135deg,
    rgba(232, 155, 155, 0.12) 0%,
    rgba(232, 196, 160, 0.12) 100%
  );
  border: 2px solid #E8A87D;
  border-radius: 12px;
  margin-top: 24px;
  position: relative;
  overflow: hidden;
}

.warning-section::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(
    to bottom,
    #E89B9B 0%,
    #E8A87D 50%,
    #D4A574 100%
  );
}

.warning-title {
  font-size: 16px;
  font-weight: 600;
  color: #D48555;
  margin-bottom: 12px;
  padding-left: 12px;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 12px 0;
}

.warning-advice {
  margin-top: 12px;
}

/* 底部信息 */
.footer-info {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.info-list {
  list-style: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.8;
  margin-bottom: 16px;
}

.footer-text {
  text-align: center;
  font-size: 12px;
}

/* 历史列表 */
.small-note { 
  font-size: 12px; 
  margin-bottom: 12px;
  color: var(--text-secondary);
}

.history-list { 
  display: flex; 
  flex-direction: column; 
  gap: 10px; 
}

.history-item { 
  display: grid; 
  grid-template-columns: 1fr 1fr 1fr 1fr; 
  gap: 8px; 
  padding: 16px; 
  background: linear-gradient(
    to right,
    rgba(168, 184, 212, 0.08) 0%,
    rgba(201, 168, 201, 0.08) 100%
  );
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.history-item:hover {
  transform: translateX(4px);
}

.history-date, .history-score, .history-level, .history-type { 
  font-size: 14px; 
}

.history-summary { 
  margin-top: 12px;
  padding: 12px;
  background: linear-gradient(
    135deg,
    rgba(184, 201, 168, 0.15) 0%,
    rgba(232, 196, 160, 0.15) 100%
  );
  border-radius: 8px;
  border-left: 3px solid #91A88E;
}

/* 常模对比 */
.norm-box { display: flex; flex-direction: column; gap: 8px; }
.norm-row { display: flex; justify-content: space-between; font-size: 14px; }
.norm-row .label { color: var(--text-secondary); }
.norm-row .value.up { color: var(--error); }
.norm-row .value.down { color: var(--success); }
.norm-note { margin-top: 8px; font-size: 12px; }

/* 下一步行动 */
.next-actions { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
}

.next-btn { 
  height: 48px; 
  border-radius: 12px; 
  font-weight: 600;
  transition: all 0.3s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
}

.btn-secondary {
  background: linear-gradient(135deg, 
    rgba(168, 184, 212, 0.8) 0%, 
    rgba(184, 201, 168, 0.8) 100%
  );
  color: var(--text-title);
}

/* 删除本地配色选择器相关样式（统一用全局） */

/* 响应式 - 移动端优化 */
/* 平板 (769px - 1024px) */
@media (max-width: 1024px) {
  .score-layout {
    gap: 24px;
  }
  
  .total-score {
    font-size: 90px;
  }
  
  .score-unit {
    font-size: 24px;
  }
  
  .level-name {
    font-size: 32px;
  }
}

/* 大屏手机 (481px - 768px) */
@media (max-width: 768px) {
  .score-card {
    padding: 32px 32px;
    margin-top: 32px;
  }
  
  .score-layout {
    gap: 24px;
    max-width: 480px;
  }
  
  .total-score {
    font-size: 80px;
    letter-spacing: -3px;
  }
  
  .score-unit {
    font-size: 22px;
  }
  
  .score-title {
    font-size: 11px;
  }
  
  .level-name {
    font-size: 28px;
    letter-spacing: 2px;
  }
  
  .score-desc {
    font-size: 12px;
  }
}

/* 小屏手机 (≤480px) - 保持左右布局 */
@media (max-width: 480px) {
  .score-card {
    padding: 28px 24px;
    margin-top: 24px;
    border-radius: 12px;
  }
  
  /* 保持左右布局，缩小间距 */
  .score-layout {
    gap: 20px;
    max-width: 100%;
  }
  
  .score-left {
    gap: 5px;
  }
  
  .total-score {
    font-size: 68px;
    letter-spacing: -2px;
  }
  
  .score-unit {
    font-size: 19px;
    margin-bottom: 4px;
  }
  
  .score-title {
    font-size: 10px;
  }
  
  .level-name {
    font-size: 24px;
    letter-spacing: 1.5px;
    margin: 2px 0;
  }
  
  .score-desc {
    font-size: 11px;
  }
  
  .section-card {
    padding: 20px 16px;
  }
  
  .radar-chart {
    height: 250px;
  }
}

/* 超小屏 (≤360px) */
@media (max-width: 360px) {
  .score-card {
    padding: 24px 20px;
  }
  
  .score-layout {
    gap: 16px;
  }
  
  .score-left {
    gap: 4px;
  }
  
  .total-score {
    font-size: 60px;
    letter-spacing: -1px;
  }
  
  .score-unit {
    font-size: 17px;
    margin-bottom: 3px;
  }
  
  .score-title {
    font-size: 9px;
  }
  
  .level-name {
    font-size: 20px;
    letter-spacing: 1px;
  }
  
  .score-desc {
    font-size: 10px;
  }
}

/* ========== 深色模式适配 ========== */

/* 深色模式下，总分卡片需要更深的色调 */
.scheme1-dark .score-card[data-level="low"],
.scheme2-dark .score-card[data-level="low"] {
  background: linear-gradient(135deg, #6B7D68 0%, #8A9A84 50%, #6B7D68 100%);
}

.scheme1-dark .score-card[data-level="medium"],
.scheme2-dark .score-card[data-level="medium"] {
  background: linear-gradient(135deg, #9C7D58 0%, #B8966F 50%, #9C7D58 100%);
}

.scheme1-dark .score-card[data-level="high"],
.scheme2-dark .score-card[data-level="high"] {
  background: linear-gradient(135deg, #96635C 0%, #A97C75 50%, #96635C 100%);
}

.scheme1-dark .score-card[data-level="severe"],
.scheme2-dark .score-card[data-level="severe"] {
  background: linear-gradient(135deg, #7A5566 0%, #936A7C 50%, #7A5566 100%);
}

/* 深色模式下装饰元素更柔和 */
.scheme1-dark .score-decoration,
.scheme2-dark .score-decoration {
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}

/* 深色模式下等级条颜色调暗 */
.scheme1-dark .level-seg-low,
.scheme2-dark .level-seg-low {
  background: linear-gradient(135deg, #6B7D68 0%, #8A9A84 100%);
}

.scheme1-dark .level-seg-medium,
.scheme2-dark .level-seg-medium {
  background: linear-gradient(135deg, #9C7D58 0%, #B8966F 100%);
}

.scheme1-dark .level-seg-high,
.scheme2-dark .level-seg-high {
  background: linear-gradient(135deg, #96635C 0%, #A97C75 100%);
}

.scheme1-dark .level-seg-severe,
.scheme2-dark .level-seg-severe {
  background: linear-gradient(135deg, #7A5566 0%, #936A7C 100%);
}

/* 深色模式下六维度颜色调暗 */
.scheme1-dark .dimension-fill[data-dimension="0"],
.scheme2-dark .dimension-fill[data-dimension="0"] {
  background: linear-gradient(90deg, #B87575 0%, #A05858 100%);
}

.scheme1-dark .dimension-fill[data-dimension="1"],
.scheme2-dark .dimension-fill[data-dimension="1"] {
  background: linear-gradient(90deg, #B8966F 0%, #9C7D58 100%);
}

.scheme1-dark .dimension-fill[data-dimension="2"],
.scheme2-dark .dimension-fill[data-dimension="2"] {
  background: linear-gradient(90deg, #A89974 0%, #8D7F5F 100%);
}

.scheme1-dark .dimension-fill[data-dimension="3"],
.scheme2-dark .dimension-fill[data-dimension="3"] {
  background: linear-gradient(90deg, #8A9A84 0%, #6B7D68 100%);
}

.scheme1-dark .dimension-fill[data-dimension="4"],
.scheme2-dark .dimension-fill[data-dimension="4"] {
  background: linear-gradient(90deg, #7B91A8 0%, #5F758A 100%);
}

.scheme1-dark .dimension-fill[data-dimension="5"],
.scheme2-dark .dimension-fill[data-dimension="5"] {
  background: linear-gradient(90deg, #9A7B9A 0%, #7D5F7D 100%);
}

/* ========== 浅色模式适配 ========== */

/* 浅色模式下，总分卡片字体采用深色以增强对比度 */
.scheme1-light .report-page .score-card,
.scheme2-light .report-page .score-card {
  color: #1A1A1A;
}

/* 浅色模式下装饰元素更明亮 */
.scheme1-light .score-decoration,
.scheme2-light .score-decoration {
  background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
}

/* 浅色模式下等级标签调亮 */
.scheme1-light .level-较低,
.scheme2-light .level-较低 {
  background: linear-gradient(135deg, #C9DAB8 0%, #A8C998 100%);
  color: #2A4A1F;
}

.scheme1-light .level-中等,
.scheme2-light .level-中等 {
  background: linear-gradient(135deg, #F5D9B8 0%, #E8C4A0 100%);
  color: #5A3A1F;
}

.scheme1-light .level-中高,
.scheme2-light .level-中高 {
  background: linear-gradient(135deg, #F5BEA0 0%, #E8A87D 100%);
  color: #5A2F1F;
}

.scheme1-light .level-偏高,
.scheme2-light .level-偏高 {
  background: linear-gradient(135deg, #F5B0B0 0%, #E89B9B 100%);
  color: #5A1F1F;
}

/* 深色模式 - 强化分数视觉冲击力 */
.scheme1-dark .report-page .total-score,
.scheme2-dark .report-page .total-score {
  color: #FFFFFF;
  -webkit-text-stroke: 1.5px rgba(0,0,0,0.4);
  filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
}

/* 浅色模式 - 强化分数视觉冲击力 */
.scheme1-light .report-page .total-score,
.scheme2-light .report-page .total-score {
  color: #000000;
  -webkit-text-stroke: 0.5px rgba(0,0,0,0.1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.scheme1-light .report-page .level-name,
.scheme2-light .report-page .level-name {
  color: #000000;
}
</style>

