<template>
  <div class="report-page">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <button @click="goBack" class="btn-back">
        &lt; 返回测评
      </button>
      <span class="nav-title text-body">测评报告</span>
      <div class="nav-actions">
        <button @click="goHome" class="btn-home" title="返回首页">
          <span class="iconify" data-icon="mdi:home" data-width="20" data-height="20"></span>
        </button>
        <button @click="showColorPicker = true" class="btn-color">
          切换配色
        </button>
        <button @click="openShare" class="btn-color" title="分享结果">
          🔗 分享结果
        </button>
      </div>
    </div>

    <!-- 滚动内容区 -->
    <div class="content-scroll">
      <div v-if="report" class="report-content container">
        <!-- 顶部角标：激活码剩余信息 -->
        <div v-if="status" class="status-badge">
          <span>激活码剩余：{{ status.daysLeft }}天 · 今日：{{ status.remainingToday }}/{{ status.dailyLimit }}</span>
        </div>
        <!-- 1. 总分卡片 -->
        <div class="score-card gradient-card fade-in">
          <h2 class="score-title">社恐程度评估结果</h2>
          <div class="level-name">{{ report.level.name }}</div>
          <div class="total-score">{{ report.totalScore }}分</div>
          <div class="percentile-text">击败全国 {{ report.percentile }}% 的测试者</div>
        </div>

        <!-- 2. 等级图示 -->
        <div class="section-card card fade-in" style="animation-delay: 0.1s">
          <h3 class="section-title text-title">社恐等级分布</h3>
          <div class="level-indicator">
            <div class="scale-line">
              <span class="scale-point">30</span>
              <span class="scale-point your-position" :style="{ left: `${(report.totalScore - 30) / 120 * 100}%` }">
                {{ report.totalScore }}
                <span class="position-label">你在这里 ↑</span>
              </span>
              <span class="scale-point">150</span>
            </div>
            <div class="level-bar">
              <div class="level-segment" style="width: 20%; background: rgba(145, 168, 142, 0.6)">轻度</div>
              <div class="level-segment" style="width: 25%; background: rgba(212, 165, 116, 0.6)">中度</div>
              <div class="level-segment" style="width: 25%; background: rgba(200, 131, 123, 0.6)">重度</div>
              <div class="level-segment" style="width: 30%; background: rgba(200, 131, 123, 0.8)">极重度</div>
            </div>
          </div>
        </div>

        <!-- 3. 六维度分析 -->
        <div class="section-card card fade-in" style="animation-delay: 0.2s">
          <h3 class="section-title text-title">六维度深度分析</h3>
          
          <!-- 雷达图 -->
          <div ref="radarChart" class="radar-chart"></div>
          
          <!-- 维度详解 -->
          <div class="dimensions-detail">
            <h4 class="detail-title text-title">维度详解</h4>
            <div
              v-for="(dim, index) in report.dimensions"
              :key="dim.key"
              class="dimension-item"
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

        <!-- 8. 你 vs 常模 -->
        <div class="section-card card fade-in" style="animation-delay: 0.6s">
          <h3 class="section-title text-title">你 vs 常模</h3>
          <div class="norm-box">
            <div class="norm-row"><span class="label">你的总分</span><span class="value">{{ report.totalScore }}分</span></div>
            <div class="norm-row"><span class="label">18-30岁平均</span><span class="value">72分</span></div>
            <div class="norm-row"><span class="label">差异</span><span class="value" :class="{ up: report.totalScore-72>0, down: report.totalScore-72<=0 }">{{ diffText }}</span></div>
            <div class="norm-note text-secondary">常模为示例参考值，后续可根据样本更新。</div>
          </div>
        </div>

        <!-- 9. 下一步行动 -->
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

    <!-- 配色选择弹窗 -->
    <div v-if="showColorPicker" class="color-picker-modal" @click="showColorPicker = false">
      <div class="color-picker-content" @click.stop>
        <h3 class="picker-title text-title">选择配色方案</h3>
        <div class="color-schemes minimal">
          <div
            v-for="scheme in colorSchemes"
            :key="scheme.id"
            class="scheme-card minimal"
            :class="{ 'active': currentScheme === scheme.id }"
            @click="changeColorScheme(scheme.id)"
          >
            <div class="scheme-name">{{ scheme.name }}</div>
            <div class="scheme-chip">
              <span class="surface" :class="scheme.id"></span>
              <span class="primary" :style="{ background: scheme.primary }"></span>
            </div>
          </div>
        </div>
        <div class="picker-actions">
          <button @click="showColorPicker = false" class="btn-cancel">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useColorScheme } from '@/composables/useColorScheme'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { showShareModal } from '@/utils/shareCard'
import { getActivationStatus, getActivationCode, generateActivationShareLink } from '@/utils/activation'

const router = useRouter()
const { currentScheme, colorSchemes, setColorScheme } = useColorScheme()

const report = ref(null)
const radarChart = ref(null)
const showColorPicker = ref(false)
let chartInstance = null
const status = ref(null)
const letterContent = ref('')
const history = ref([])
const progressText = ref('')
const diffText = ref('')

const goBack = () => {
  router.push('/assessment')
}

const goHome = () => {
  router.push('/')
}

const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY年MM月DD日')
}

const formatContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

const changeColorScheme = (schemeId) => {
  setColorScheme(schemeId)
  showColorPicker.value = false
  
  // 重新渲染雷达图
  nextTick(() => {
    renderRadarChart()
  })
}

const openShare = () => {
  if (report.value) {
    showShareModal(report.value)
  }
}

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
  
  chartInstance = echarts.init(radarChart.value)
  
  // 获取当前主题颜色
  const computedStyle = getComputedStyle(document.documentElement)
  const primaryColor = computedStyle.getPropertyValue('--primary').trim()
  const textColor = computedStyle.getPropertyValue('--text-body').trim()
  const borderColor = computedStyle.getPropertyValue('--border').trim()
  
  // 准备雷达图数据
  const indicatorData = report.value.dimensions.map(dim => ({
    name: dim.name,
    max: 25
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
          color: textColor,
          fontSize: 12,
          fontWeight: 400
        }
      },
      splitLine: {
        lineStyle: {
          color: borderColor,
          type: 'dashed',
          width: 1
        }
      },
      splitArea: {
        areaStyle: {
          color: 'transparent'
        }
      },
      axisLine: {
        lineStyle: {
          color: borderColor,
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
          color: `${primaryColor}33` // 20% 透明度
        },
        lineStyle: {
          color: primaryColor,
          width: 2
        },
        itemStyle: {
          color: primaryColor,
          borderColor: '#fff',
          borderWidth: 2
        }
      }]
    }]
  }
  
  chartInstance.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    chartInstance?.resize()
  })
}

onMounted(() => {
  // 加载报告数据
  const savedReport = localStorage.getItem('test_report')
  if (savedReport) {
    try {
      report.value = JSON.parse(savedReport)
      status.value = getActivationStatus()
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
      const base = 72
      const d = report.value.totalScore - base
      diffText.value = d === 0 ? '持平' : (d > 0 ? `高出 ${d} 分` : `低于 ${-d} 分`)

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
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-card);
  box-shadow: 0 2px 8px var(--shadow);
  position: relative;
  z-index: 10;
}

.btn-back,
.btn-color,
.btn-home {
  background: transparent;
  color: var(--text-body);
  font-size: 14px;
  padding: 8px 12px;
  transition: all 0.3s ease;
}

.btn-back:hover,
.btn-color:hover,
.btn-home:hover {
  color: var(--primary);
  transform: scale(1.05);
}

.btn-home {
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-home .iconify {
  color: var(--text-body);
  transition: color 0.3s ease;
}

.btn-home:hover .iconify {
  color: var(--primary);
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 滚动内容 */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
  background: var(--bg-main);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.report-content {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* 顶部角标：激活状态 */
.status-badge {
  position: sticky;
  top: 8px;
  z-index: 5;
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: var(--bg-section);
  color: var(--text-title);
  font-size: 12px;
  border: 1px solid var(--border);
}

/* 总分卡片 */
.score-card {
  text-align: center;
  padding: 40px 24px;
  margin-bottom: 20px;
  border-radius: 16px;
}

.score-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.level-name {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
}

.total-score {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.percentile-text {
  font-size: 16px;
  opacity: 0.9;
}

/* 章节卡片 */
.section-card {
  margin-bottom: 20px;
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

/* 等级图示 */
.level-indicator {
  padding: 20px 0;
}

.scale-line {
  position: relative;
  height: 40px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scale-point {
  font-size: 14px;
  color: var(--text-secondary);
  position: relative;
}

.your-position {
  position: absolute;
  color: var(--primary);
  font-weight: 700;
  font-size: 16px;
}

.position-label {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
}

.level-bar {
  display: flex;
  height: 32px;
  border-radius: 16px;
  overflow: hidden;
}

.level-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
  font-weight: 600;
}

/* 雷达图 */
.radar-chart {
  width: 100%;
  height: 300px;
  margin: 20px 0;
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
  margin-bottom: 20px;
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
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-section);
}

.level-较低 {
  color: var(--success);
}

.level-中等,
.level-中高 {
  color: var(--warning);
}

.level-偏高 {
  color: var(--error);
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
  padding: 24px;
  background: var(--bg-section);
  border-radius: 12px;
  margin-bottom: 24px;
}

.type-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 8px;
}

.type-english {
  font-size: 14px;
  color: var(--text-secondary);
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
  padding: 16px;
  border-radius: 8px;
  line-height: 1.8;
}

/* 改善建议 */
.suggestions-section {
  margin-bottom: 32px;
}

.suggestion-item {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-section);
  border-radius: 8px;
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
  padding: 8px;
  background: var(--bg-card);
  border-radius: 4px;
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
  padding: 16px;
  background: var(--bg-section);
  border-radius: 8px;
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
  padding: 12px;
  background: var(--bg-section);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
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
  padding: 16px;
  background: rgba(212, 165, 116, 0.1);
  border: 2px solid var(--warning);
  border-radius: 8px;
  margin-top: 24px;
}

.warning-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--warning);
  margin-bottom: 12px;
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
.small-note { font-size: 12px; margin-bottom: 12px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; padding: 12px; background: var(--bg-section); border-radius: 8px; }
.history-date, .history-score, .history-level, .history-type { font-size: 14px; }
.history-summary { margin-top: 8px; }

/* 常模对比 */
.norm-box { display: flex; flex-direction: column; gap: 8px; }
.norm-row { display: flex; justify-content: space-between; font-size: 14px; }
.norm-row .label { color: var(--text-secondary); }
.norm-row .value.up { color: var(--error); }
.norm-row .value.down { color: var(--success); }
.norm-note { margin-top: 8px; font-size: 12px; }

/* 下一步行动 */
.next-actions { display: flex; flex-direction: column; gap: 8px; }
.next-btn { height: 44px; border-radius: 8px; font-weight: 600; }

/* 配色选择弹窗 */
.color-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.color-picker-content {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 32px var(--shadow-deep);
  border: 1px solid var(--border);
}

.picker-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-title);
}

.color-schemes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
.color-schemes.minimal { grid-template-columns: 1fr; gap: 8px; }

.scheme-card {
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}
.scheme-card.minimal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
}

.scheme-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.scheme-card.active {
  border-color: var(--primary);
  background: var(--bg-section);
  box-shadow: 0 4px 12px var(--shadow-medium);
}

.scheme-name {
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--text-title);
  font-weight: 600;
}

.scheme-chip {
  position: relative;
  width: 86px;
  height: 28px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-section);
  border: 1px solid var(--border);
}
.scheme-chip .surface { position: absolute; inset: 0; border-radius: 8px; }
.scheme-chip .primary { position: absolute; right: 0; top: 0; bottom: 0; width: 36%; }

/* 预览 surface 与深浅方案匹配 */
.surface.scheme1-light { background: #FFFFFF; }
.surface.scheme1-dark { background: #2A2624; }
.surface.scheme2-light { background: #FFFFFF; }
.surface.scheme2-dark { background: #252A25; }

.picker-actions {
  display: flex;
  justify-content: center;
}

.btn-cancel {
  padding: 10px 24px;
  background: var(--bg-section);
  color: var(--text-title);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background: var(--bg-card);
  border-color: var(--primary);
  color: var(--primary);
}

/* 响应式 */
@media (max-width: 480px) {
  .score-card {
    padding: 32px 20px;
  }
  
  .level-name {
    font-size: 28px;
  }
  
  .total-score {
    font-size: 40px;
  }
  
  .section-card {
    padding: 20px 16px;
  }
  
  .radar-chart {
    height: 250px;
  }
}
</style>

