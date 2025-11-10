<template>
  <div class="report-page">
    <!-- 本页不再渲染局部导航，统一使用全局 AppHeader -->

    <!-- 滚动内容区 -->
    <div class="content-scroll">
      <!-- 开发者面板（仅开发环境显示，用于快速切换分数） 
      <div v-if="isDev && report" class="dev-panel">
        <div class="dev-row">
          <span class="dev-title">调试分数</span>
          <input class="dev-input" type="number" min="0" max="100" v-model.number="devScore" @change="applyDevScore" />
        </div>
        <input class="dev-range" type="range" min="0" max="100" v-model.number="devScore" @input="applyDevScore" />
        <div class="dev-buttons">
          <button class="dev-btn" @click="quickSet(25)">25</button>
          <button class="dev-btn" @click="quickSet(45)">45</button>
          <button class="dev-btn" @click="quickSet(65)">65</button>
          <button class="dev-btn" @click="quickSet(85)">85</button>
          <button class="dev-btn" @click="quickSet(95)">95</button>
        </div>
      </div>-->
      <div v-if="report" class="report-content container" :data-level="getLevelCategory()">
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
          
          <!-- 维度详解：默认收起，提供明显的展开提示 -->
          <div class="collapse-toggle" @click="showDimensions = !showDimensions">
            <span class="toggle-text">
              {{ showDimensions ? '收起维度详解' : '点击查看维度详解' }}
            </span>
            <span class="arrow" :class="{ open: showDimensions }">▼</span>
          </div>

          <!-- 半展开预览：折叠时显示前3个维度 -->
          <div class="dimensions-preview" v-show="!showDimensions">
            <div
              v-for="(dim, index) in report.dimensions.slice(0, 3)"
              :key="dim.key"
              class="dimension-preview-item"
              :data-dimension="index"
            >
              <div class="dimension-preview-header">
                <span class="dimension-preview-name">{{ index + 1 }}. {{ dim.name }}</span>
                <span class="dimension-preview-level" :class="'level-' + dim.level.level">
                  {{ dim.level.level }}
                </span>
              </div>
              <div class="dimension-preview-bar">
                <div 
                  class="dimension-preview-fill" 
                  :style="{ width: `${dim.percentage}%` }"
                  :data-dimension="index"
                ></div>
              </div>
              <div class="dimension-preview-score">{{ dim.score }}/{{ dim.maxScore }}</div>
            </div>
            <div class="preview-hint text-secondary">
              <span>点击上方展开查看全部 {{ report.dimensions.length }} 个维度详解</span>
            </div>
          </div>

          <div class="dimensions-detail" v-show="showDimensions">
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
          <h3 class="section-title text-title">
            你的社恐类型
            <span class="enhanced-badge" title="基于你的答题模式深度分析">专属分析</span>
          </h3>
          
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
            <h4 class="subsection-title text-title">为什么会这样</h4>
            <p class="cause-intro text-body">其实啊，你会有这些感受，可能是因为：</p>
            <div class="cause-list">
              <div v-for="(cause, index) in report.type.rootCauses" :key="index" class="cause-item">
                <div class="cause-title text-title">{{ index + 1 }}. {{ cause.title }}</div>
                <div class="cause-desc text-body">{{ cause.desc }}</div>
              </div>
            </div>
          </div>

          <div class="type-section positive-section section-bg">
            <h4 class="subsection-title text-title">换个角度看自己</h4>
            <p class="text-body">{{ report.type.positiveReframe }}</p>
          </div>

          <!-- 情绪化金句：写给你的信 -->
          <div class="type-section section-bg" style="margin-top: 16px;">
            <h4 class="subsection-title text-title">写给{{ report.type.name }}的你</h4>
            <p class="text-body" v-html="letterContent"></p>
          </div>
        </div>

        <!-- 5. 改善建议（默认收起） -->
        <div class="section-card card fade-in" style="animation-delay: 0.4s">
          <h3 class="section-title text-title">给你的一些小建议</h3>

          <div class="collapse-toggle" @click="showSuggestions = !showSuggestions">
            <span class="toggle-text">
              <span class="toggle-icon">💡</span>
              {{ showSuggestions ? '收起建议' : '点击查看可以试试的方法' }}
            </span>
            <span class="arrow" :class="{ open: showSuggestions }">▼</span>
          </div>

          <!-- 半展开预览：折叠时显示前2个建议标题 -->
          <div class="suggestions-preview" v-show="!showSuggestions">
            <div class="suggestions-preview-section">
              <h4 class="subsection-title text-title">现在就可以试试</h4>
              <div
                v-for="(suggestion, index) in report.suggestions.immediate.slice(0, 2)"
                :key="index"
                class="suggestion-preview-item"
              >
                <div class="suggestion-preview-title">{{ index + 1 }}. {{ suggestion.title }}</div>
                <div class="suggestion-preview-hint text-secondary">
                  {{ suggestion.steps ? `包含 ${suggestion.steps.length} 个具体方法` : '查看详细内容' }}
                </div>
              </div>
            </div>
            <div class="preview-hint text-secondary">
              <span>点击上方展开查看全部建议（现在就能做的、4周小计划、长期方向）</span>
            </div>
          </div>

          <div v-show="showSuggestions">
          <!-- 立即可行动 -->
          <div class="suggestions-section">
            <h4 class="subsection-title text-title">现在就可以试试</h4>
            <div v-for="(suggestion, index) in report.suggestions.immediate" :key="index" class="suggestion-item">
              <div class="suggestion-title">{{ index + 1 }}. {{ suggestion.title }}</div>
              <div v-if="suggestion.steps" class="suggestion-steps">
                <div class="step-label">具体怎么做：</div>
                <ol class="step-list">
                  <li v-for="(step, i) in suggestion.steps" :key="i" class="step-item">{{ step }}</li>
                </ol>
                <div class="step-reason text-secondary">
                  <strong>为什么有用：</strong>{{ suggestion.reason }}
                </div>
              </div>
              <div v-if="suggestion.content" class="suggestion-content text-body" v-html="formatContent(suggestion.content)"></div>
            </div>
          </div>

          <!-- 4周渐进计划 -->
          <div class="suggestions-section">
            <h4 class="subsection-title text-title">4周小计划（一步一步来）</h4>
            <div class="weekly-plan">
              <div v-for="(week, key) in report.suggestions.weekly" :key="key" class="week-item" v-if="key !== 'principle'">
                <div class="week-title">{{ week.title }}</div>
                <ul class="week-tasks">
                  <li v-for="(task, i) in week.tasks" :key="i" class="task-item text-body">{{ task }}</li>
                </ul>
              </div>
              <div class="principle-note text-secondary">
                <strong>记住：</strong>{{ report.suggestions.weekly.principle }}
              </div>
            </div>
          </div>
          
          <!-- 长期改善 -->
          <div class="suggestions-section">
            <h4 class="subsection-title text-title">如果想深入了解</h4>
            <div class="longterm-content">
              <div class="resource-group">
                <div class="resource-label">可以看看这些书：</div>
                <ul class="resource-list">
                  <li v-for="(book, i) in report.suggestions.longTerm.books" :key="i" class="text-body">
                    · {{ book.title }} - {{ book.author }}
                  </li>
                </ul>
              </div>
              <div class="resource-group">
                <div class="resource-label">可以试试这些方法：</div>
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
            <p class="text-body1">如果你发现：</p>
            <ul class="warning-list">
              <li v-for="(condition, i) in report.suggestions.warning.conditions" :key="i" class="text-body1">
                · {{ condition }}
              </li>
            </ul>
            <p class="warning-advice text-body1">
              <strong>那么：</strong>{{ report.suggestions.warning.advice }}
            </p>
          </div>
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

        <!-- 8. 下一步行动 - 移动端显示 -->
        <div class="section-card card fade-in mobile-only-section" style="animation-delay: 0.65s">
          <div class="next-actions">
            <button class="btn-primary next-btn" @click="openShare">
              <span class="iconify" data-icon="mdi:share-variant" data-width="20" data-height="20"></span>
              分享你的分数
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除本地配色弹窗，改由全局 AppHeader 控制 -->

    <!-- 桌面端悬浮按钮 -->
    <div class="floating-actions desktop-only-floating">
      <button class="floating-btn floating-btn-retest" @click="goRetest" title="再测一次（建议5-6天后）">
        <span class="iconify" data-icon="mdi:refresh" data-width="24" data-height="24"></span>
        <span class="floating-btn-text">再测一次</span>
      </button>
      <button class="floating-btn floating-btn-share" @click="openShare" title="分享你的分数">
        <span class="iconify" data-icon="mdi:share-variant" data-width="24" data-height="24"></span>
        <span class="floating-btn-text">分享分数</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { showShareModal } from '@/utils/shareCard'
import { getActivationCode, generateActivationShareLink } from '@/utils/activation'
import { getLevel } from '@/utils/scoring'

const router = useRouter()
const report = ref(null)
// 折叠切换：维度详解 & 改善建议 默认收起
const showDimensions = ref(false)
const showSuggestions = ref(false)
const radarChart = ref(null)
let chartInstance = null
const resizeHandler = () => {
  chartInstance?.resize()
}
const letterContent = ref('')
const history = ref([])
const progressText = ref('')
const isDev = ref(import.meta.env.DEV)
const devScore = ref(0)

// 全局导航已提供返回与首页入口


const formatDate = (dateString) => {
  return dayjs(dateString).format('YYYY年MM月DD日')
}

const formatContent = (content) => {
  return content.replace(/\n/g, '<br>')
}

// 根据分数获取等级分类（用于配色，V4→V1）
const getLevelCategory = () => {
  switch (report.value?.level?.name) {
    case '社交自如型':
      return 'normal' // 低于轻度
    case '轻度社交焦虑':
      return 'mild'   // V4（蓝）
    case '中度社交焦虑':
      return 'moderate' // V3（金）
    case '重度社交焦虑':
      return 'severe'   // V2（银灰）
    case '极重度社交焦虑':
      return 'verysevere' // V1（红粉）
    default:
      return 'moderate'
  }
}

// 主题切换由全局处理；当主题类变化时会触发重绘

const openShare = () => {
  if (report.value) {
    showShareModal(report.value)
  }
}

// 开发者：应用调试分数（仅前端预览，不持久化）
const applyDevScore = () => {
  if (!report.value) return
  const s = Math.max(0, Math.min(100, Number(devScore.value || 0)))
  report.value.totalScore = s
  try {
    report.value.level = getLevel(s, report.value.basicInfo || {})
  } catch {}
}

const quickSet = (s) => {
  devScore.value = s
  applyDevScore()
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
  // 清除上一次测试的所有数据
  localStorage.removeItem('test_answers')
  localStorage.removeItem('test_basic_info')
  
  // 跳转到测评页面
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
      <div class="modal-header">
        <h3>✨ 分享给好友</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="share-activation">
          <div class="row">
            <span class="label">激活码</span>
            <input class="copy-input" value="${code}" readonly />
          </div>
          <div class="row">
            <span class="label">专属链接</span>
            <input class="copy-input" value="${link}" readonly />
          </div>
          <div class="tips">同一激活码每日最多3次，总有效期7天</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" id="copyCode">📋 复制激活码</button>
        <button class="btn-primary" id="copyLink">🔗 复制链接</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  // 复制功能增强 - 添加成功提示
  const copy = async (text, buttonId) => {
    try {
      await navigator.clipboard.writeText(text)
      const button = modal.querySelector(`#${buttonId}`)
      const originalText = button.textContent
      button.textContent = '✅ 已复制!'
      button.style.background = 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'

      setTimeout(() => {
        button.textContent = originalText
        button.style.background = ''
      }, 2000)
    } catch (err) {
      console.error('复制失败:', err)
      alert('复制失败,请手动复制')
    }
  }

  modal.querySelector('#copyCode').addEventListener('click', () => copy(code, 'copyCode'))
  modal.querySelector('#copyLink').addEventListener('click', () => copy(link, 'copyLink'))

  const close = () => modal.remove()
  modal.querySelector('.close-btn').addEventListener('click', close)
  modal.querySelector('.modal-overlay').addEventListener('click', close)

  // 支持 ESC 键关闭
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      close()
      document.removeEventListener('keydown', handleEsc)
    }
  }
  document.addEventListener('keydown', handleEsc)
}

const renderRadarChart = () => {
  if (!radarChart.value || !report.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(radarChart.value, null, {
    renderer: 'canvas',
    devicePixelRatio: window.devicePixelRatio || 2,  // 提高分辨率
    useDirtyRect: true
  })

  // 获取当前主题 - 检查body的class
  const isDark = document.body.className?.includes('-dark') || false

  // 雷达图配色方案 - 使用固定的高对比度颜色
  const gridColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)'  // 网格线
  const radarLineColor = isDark ? 'rgba(255,180,150,0.95)' : 'rgba(241,105,46,0.95)'  // 雷达线条
  const radarAreaColor = isDark ? 'rgba(255,180,150,0.3)' : 'rgba(241,104,46,0.35)'  // 雷达填充
  const labelColor = isDark ? '#FFFFFF' : '#000000'  // 标签文字
  
  // 准备雷达图数据
  const indicatorData = report.value.dimensions.map(dim => ({
    name: dim.name,
    max: dim.maxScore
  }))
  
  const seriesData = report.value.dimensions.map(dim => dim.score)
  
  // 检测是否为移动端
  const isMobile = window.innerWidth <= 768

  const option = {
    backgroundColor: 'transparent',
    grid: {
      left: isMobile ? '5%' : '10%',
      right: isMobile ? '5%' : '10%',
      top: isMobile ? '15%' : '10%',
      bottom: isMobile ? '10%' : '10%'
    },
    radar: {
      indicator: indicatorData,
      radius: isMobile ? '55%' : '60%',
      center: ['50%', '50%'],
      splitNumber: 4,
      name: {
        textStyle: {
          color: labelColor,
          fontSize: isMobile ? 13 : 15,
          fontWeight: 600
        },
        padding: isMobile ? [0, 5] : [0, 0]
      },
      splitLine: {
        lineStyle: {
          color: gridColor,
          type: 'solid',
          width: 2  // 增加网格线宽度，从1.2提升到2
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: isDark
            ? ['rgba(255,192,203,0.03)', 'rgba(255,192,203,0.06)']  // 深色模式用淡粉色
            : ['rgba(241,105,46,0.02)', 'rgba(241,105,46,0.04)']  // 浅色模式用淡橙色
        }
      },
      axisLine: {
        lineStyle: {
          color: gridColor,
          width: 2  // 增加轴线宽度，从1提升到2
        }
      }
    },
    tooltip: {
      show: true,
      confine: true,
      backgroundColor: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
      borderColor: 'rgba(255,105,180,0.3)',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#FFFFFF' : '#000000',
        fontSize: 12
      },
      formatter: (params) => {
        const values = params.value
        return report.value.dimensions
          .map((d, i) => `${d.name}：${values[i]}/${d.maxScore}`)
          .join('<br/>')
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: seriesData,
        name: '你的数据',
        areaStyle: {
          color: radarAreaColor,
          opacity: 0.6  // 适中的填充透明度
        },
        lineStyle: {
          color: radarLineColor,
          width: 3  // 适中的线条宽度
        },
        itemStyle: {
          color: radarLineColor,
          borderColor: isDark ? '#000' : '#fff',  // 简单的边框
          borderWidth: 2  // 适中的边框宽度
        },
        symbolSize: 8,  // 适中的数据点尺寸
        emphasis: {
          lineStyle: {
            width: 4  // 鼠标悬停时稍微加粗
          },
          itemStyle: {
            borderWidth: 3  // 鼠标悬停时边框稍微加粗
          }
        }
      }]
    }]
  }
  
  chartInstance.setOption(option)
  chartInstance.resize()
  
  // 响应式调整
  window.addEventListener('resize', resizeHandler)
}

// 监听主题切换（通过 body class 变化），自动重绘雷达图
let themeObserver = null
let isDataLoaded = false  // 标记数据是否已加载
let radarRenderTimer = null  // 雷达图渲染定时器

onMounted(async () => {
  // 加载报告数据
  const savedReport = localStorage.getItem('test_report')
  if (savedReport) {
    try {
      report.value = JSON.parse(savedReport)
      letterContent.value = buildLetter(report.value.type.name).replace(/\n/g, '<br>')
      devScore.value = report.value.totalScore || 0
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

      // 标记数据已加载
      isDataLoaded = true

      // 渲染雷达图 - 使用requestAnimationFrame确保DOM和CSS完全准备好
      nextTick(() => {
        // 使用requestAnimationFrame确保浏览器完成渲染
        requestAnimationFrame(() => {
          // 再延迟一帧，确保CSS变量已经应用
          requestAnimationFrame(() => {
            renderRadarChart()
          })
        })
      })
    } catch (e) {
      console.error('加载报告失败:', e)
      router.push('/assessment')
    }
  } else {
    router.push('/assessment')
  }

  // 设置主题监听器 - 只在数据加载后才重绘，并使用防抖避免频繁重绘
  themeObserver = new MutationObserver(() => {
    if (isDataLoaded) {  // 只有数据加载完成后才响应主题切换
      // 清除之前的定时器，防止重复渲染
      if (radarRenderTimer) {
        clearTimeout(radarRenderTimer)
      }
      // 延迟渲染，等待CSS变量更新完成
      radarRenderTimer = setTimeout(() => {
        nextTick(() => {
          renderRadarChart()
        })
      }, 150)  // 延迟150ms确保主题切换完全完成
    }
  })
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler)
  themeObserver?.disconnect()
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 滚动内容 */
.content-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 72px 0 32px 0;
  background: var(--bg-main);
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth; /* 平滑滚动 */
}

.report-content {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 60px;
  animation: slideUp 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* 页面入场动画 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 开发者面板样式（固定右上角） */
.dev-panel {
  position: fixed;
  top: 76px;
  right: 16px;
  z-index: 1200;
  padding: 10px 12px;
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  color: #fff;
  min-width: 200px;
}

.dev-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.dev-title { font-size: 12px; opacity: 0.9; }
.dev-input { width: 72px; height: 28px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: #fff; padding: 0 6px; }
.dev-range { width: 100%; margin: 4px 0 8px; }
.dev-buttons { display: flex; gap: 6px; flex-wrap: wrap; }
.dev-btn { height: 28px; padding: 0 8px; border-radius: 6px; border: none; cursor: pointer; background: linear-gradient(135deg, #4facfe, #00f2fe); color: #1a1a1a; font-weight: 700; }
.dev-btn:hover { filter: brightness(1.05); }

/* 总分卡片 - 极简扁平化设计，无边框 */
.score-card {
  position: relative;
  padding: 48px 32px;
  margin-top: 24px;
  margin-bottom: 24px;
  border-radius: 20px;
  color: #fff;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: none;
  cursor: pointer;
  transform-origin: center;
}

/* 点击反馈动画 */
.score-card:active {
  transform: scale(0.98);
}

/* 分数布局容器 - 左右分布 */
.score-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  position: relative;
  z-index: 1;
  max-width: 550px;
}

/* 左侧分数区域 */
.score-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-shrink: 0;
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* 右侧文字信息区域 */
.score-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  flex-shrink: 0;
  animation: slideInRight 0.5s ease-out;
}

/* 装饰性背景元素 - 扁平化几何图形 */
.score-decoration {
  position: absolute;
  top: -30%;
  right: -15%;
  width: 250px;
  height: 250px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  pointer-events: none;
  animation: float 6s ease-in-out infinite;
}

/* 浮动动画 */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  50% {
    transform: translate(-10px, -10px) rotate(5deg);
  }
}

/* 弹入动画 */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 右滑入动画 */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* V4 轻度（mild）- 冰蓝背景 */
.score-card[data-level="mild"] {
  background: linear-gradient(135deg, #DDEBFF 0%, #C7D2FE 55%, #A5B4FC 130%);
}

/* V3 中度（moderate）- 金色背景 */
.score-card[data-level="moderate"] {
  background: linear-gradient(135deg, #F6E3B5 0%, #E7C36A 55%, #F5D58A 130%);
}

/* V2 重度（severe）- 银灰背景 */
.score-card[data-level="severe"] {
  background: linear-gradient(135deg, #d6d6d6 0%, #7ba0eb 50%, rgb(74, 84, 100) 120%);
}

/* V1 极重度（verysevere）- 红粉背景 */
.score-card[data-level="verysevere"] {
  background: linear-gradient(135deg, #FFC6C9 0%, #FF8AAE 55%, #FF6B8B 135%);
}

/* V5 自如（normal）- 冰白淡紫背景 */
.score-card[data-level="normal"] {
  background: linear-gradient(135deg, #F6F7FB 0%, #ECEBFF 55%, #DFE2FF 120%);
}

/* 左侧：超大分数 - 扁平化，无阴影 */
.total-score {
  font-size: 120px;
  font-weight: 900;
  letter-spacing: -5px;
  line-height: 1;
  background: none;
  -webkit-background-clip: text !important;
  background-clip: text;
  -webkit-text-fill-color: transparent !important;
  color: transparent !important;
  display: inline-block;
  position: relative;
  transform: scale(1);
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.total-score:hover {
  transform: scale(1.1) rotate(-2deg);
}

/* 分数数字颜色：跟随等级的对比渐变（V4→V1） */
.score-card[data-level="mild"] .total-score {
  background: linear-gradient(180deg, #2444E6 0%, #4E86FF 55%, #59C4FF 100%);
}

.score-card[data-level="moderate"] .total-score {
  background: linear-gradient(218deg, #ffbb62 0%, #995f00 55%, #000000 100%);
}

.score-card[data-level="severe"] .total-score {
  background: linear-gradient(180deg, #98abd3 0%, #131f38 55%, #27344e 100%);
}

.score-card[data-level="verysevere"] .total-score {
  background: linear-gradient(180deg, #2c2929 0%, #5e3439 55%, #FFE08A 100%);
}

/* V5 自如（normal）分数渐变：高对比靛蓝→亮紫 */
.score-card[data-level="normal"] .total-score {
  background: linear-gradient(180deg, #2D2DE8 0%, #6C63FF 55%, #A78BFA 100%);
}

/* 分数单位 */
.score-unit {
  font-size: 32px;
  font-weight: 800;
  color: rgba(77, 77, 77, 0.95);
  align-self: flex-end;
  margin-bottom: 10px;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

/* 右侧：等级名 */
.level-name {
  font-size: 32px;
  font-weight: 900;
  color: rgba(65, 64, 64, 0.98);
  letter-spacing: 4px;
  margin: 6px 0;
  line-height: 1.2;
  text-transform: uppercase;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

/* 右侧：等级描述文字 */
.score-desc {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: rgba(77, 77, 77, 0.9);
  margin-top: 10px;
  line-height: 1.6;
  animation: fadeIn 0.8s ease-out 0.5s both;
}

/* 章节卡片 - 极简扁平化设计 */
.section-card {
  margin-bottom: 24px;
  padding: 28px 24px;
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  border: none;
  border-radius: 16px;
  background: var(--bg-card);
  position: relative;
  overflow: hidden;
}


/* 卡片点击反馈 */
.section-card:active {
  transform: translateY(-2px);
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--primary);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--text-title);
  position: relative;
}

/* 标题装饰线 */
.section-title::after {
  content: '';
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 25%;
  height: 2px;
  background: var(--primary);
  animation: expandWidth 0.6s ease-out;
}

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 60px;
  }
}

.enhanced-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ffa94d 0%, #ff6b6b 100%);
  color: #fff;
  white-space: nowrap;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: pulse-scale 2s ease-in-out infinite;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 扁平化脉冲动画 - 无阴影 */
@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
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
  transform: translateX(-50%);
}

/* 指示颜色跟随当前等级（与分数卡片一致） */
.report-content[data-level="mild"] .your-position { color: #6391ff; }
.report-content[data-level="normal"] .your-position { color: #6C63FF; }
.report-content[data-level="moderate"] .your-position { color: #C08A1F; }
.report-content[data-level="severe"] .your-position { color: #c6d9ff; }
.report-content[data-level="verysevere"] .your-position { color: #ff7896; }

.position-label {
  display: block;
  font-size: 12px;
  margin-top: 4px;
  white-space: nowrap;
  font-weight: 600;
}

.level-bar {
  display: flex;
  height: 44px;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  background: var(--bg-section);
}

.level-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  white-space: nowrap;
  cursor: pointer;
  position: relative;
  text-transform: uppercase;
  letter-spacing: 0.5px; /* 防止移动端换行（如“极重度”） */
}

.level-segment:hover {
  transform: scale(1.05);
  z-index: 1;
}

.level-segment:active {
  transform: scale(0.98);
}

.level-seg-low {
  width: 50%; /* 0-50分：包含社交自如与轻度 */
  background: linear-gradient(135deg, #C7D2FE 0%, #A5B4FC 100%); /* 冰蓝（V4 风格） */
}

.level-seg-medium {
  width: 20%; /* 51-70分：中度（V3 金色） */
  background: linear-gradient(135deg, #E7C36A 0%, #F5D58A 100%);
}

.level-seg-high {
  width: 20%; /* 71-90分：重度（V2 银灰） */
  background: linear-gradient(135deg, #415f9c 0%, #697fa5 100%);
}

.level-seg-severe {
  width: 10%; /* 91-100分：极重度（V1 粉红） */
  background: linear-gradient(135deg, #FF8AAE 0%, #FF6B8B 100%);
}


/* 雷达图 - 极简扁平化 */
.radar-chart {
  width: 100%;
  height: 360px;
  margin: 24px 0;
  padding: 40px 20px 30px 20px;
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
}


/* 浅色模式下雷达图 */
.scheme1-light .radar-chart,
.scheme2-light .radar-chart {
  border: none;
}

/* 移动端雷达图优化 */
@media (max-width: 768px) {
  .radar-chart {
    height: 380px;
    padding: 50px 10px 40px 10px;
  }
}

@media (max-width: 480px) {
  .radar-chart {
    height: 400px;
    padding: 60px 5px 50px 5px;
  }
}

/* 维度详解 */
.dimensions-detail {
  margin-top: 24px;
}

/* 折叠切换条 - 极简移动端优化 */
.collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  min-height: 56px; /* 移动端触摸目标 */
}

/* 点击波纹效果 */
.collapse-toggle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.collapse-toggle:active::before {
  width: 300px;
  height: 300px;
}

.collapse-toggle:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
  transform: translateY(-2px);
}

.collapse-toggle:active {
  transform: translateY(0);
}

.collapse-toggle .arrow {
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  font-size: 18px;
  font-weight: bold;
}

.collapse-toggle .arrow.open {
  transform: rotate(180deg);
}

/* 折叠按钮文字和图标 */
.toggle-text {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.toggle-icon {
  font-size: 20px;
  animation: bounce 2s ease-in-out infinite;
}

/* 图标弹跳动画 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* 维度详解预览样式 - 极简扁平化 */
.dimensions-preview {
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  border: none;
  animation: fadeIn 0.4s ease-out;
}

.dimension-preview-item {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.dimension-preview-item:hover {
  background: var(--bg-main);
  transform: translateX(4px);
}

.dimension-preview-item:active {
  transform: translateX(2px);
}

.dimension-preview-item:last-of-type {
  margin-bottom: 0;
}

.dimension-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.dimension-preview-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-title);
  flex: 1;
}

.dimension-preview-level {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 10px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
}

/* 预览等级标签复用完整版的配色 */
.dimension-preview-level.level-较低 {
  background: linear-gradient(135deg, #B8C9A8 0%, #91A88E 100%);
  color: #fff;
}

.dimension-preview-level.level-有点小紧张 {
  background: linear-gradient(135deg, #E8C4A0 0%, #D4A574 100%);
  color: #fff;
}

.dimension-preview-level.level-需要关注 {
  background: linear-gradient(135deg, #E8A87D 0%, #D48555 100%);
  color: #fff;
}

.dimension-preview-level.level-重点改善区 {
  background: linear-gradient(135deg, #E89B9B 0%, #D67575 100%);
  color: #fff;
}

.dimension-preview-bar {
  height: 6px;
  background: var(--bg-section);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.dimension-preview-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 预览填充条使用与完整版相同的配色 */
.dimension-preview-fill[data-dimension="0"] {
  background: linear-gradient(90deg, #E89B9B 0%, #D67575 100%);
}

.dimension-preview-fill[data-dimension="1"] {
  background: linear-gradient(90deg, #E8C4A0 0%, #D4A574 100%);
}

.dimension-preview-fill[data-dimension="2"] {
  background: linear-gradient(90deg, #D9C89E 0%, #C4B584 100%);
}

.dimension-preview-score {
  font-size: 11px;
  color: var(--text-secondary);
}

.preview-hint {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border);
  font-size: 12px;
  text-align: center;
  line-height: 1.5;
}

/* 改善建议预览样式 - 极简扁平化 */
.suggestions-preview {
  margin-top: 20px;
  padding: 20px;
  border-radius: 16px;
  border: none;
  animation: fadeIn 0.4s ease-out;
}

.suggestions-preview-section {
  margin-bottom: 16px;
}

.suggestion-preview-item {
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  margin-bottom: 12px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.suggestion-preview-item:hover {
  background: var(--bg-section);
  transform: translateX(4px);
}

.suggestion-preview-item:active {
  transform: translateX(2px);
}

.suggestion-preview-item:last-child {
  margin-bottom: 0;
}

.suggestion-preview-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-title);
  margin-bottom: 8px;
}

.suggestion-preview-hint {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.detail-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.dimension-item {
  padding: 20px;
  border-radius: 12px;
  background: var(--bg-card);
  border: none;
  margin-bottom: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.dimension-item:hover {
  background: var(--bg-section);
  transform: translateX(6px);
}

.dimension-item:active {
  transform: translateX(3px);
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

.level-还好啦 {
  background: linear-gradient(135deg, #B8C9A8 0%, #91A88E 100%);
  color: #fff;
}

.level-有点小紧张 {
  background: linear-gradient(135deg, #E8C4A0 0%, #D4A574 100%);
  color: #fff;
}

.level-需要关注 {
  background: linear-gradient(135deg, #E8A87D 0%, #D48555 100%);
  color: #fff;
}

.level-重点改善区 {
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

/* 类型诊断 - 极简扁平化设计 */
.type-badge {
  text-align: center;
  padding: 40px 28px;
  background: var(--primary);
  border-radius: 20px;
  margin-bottom: 28px;
  border: none;
  position: relative;
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* 装饰性几何图形 */
.type-badge::before {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
}

.type-badge::after {
  content: '';
  position: absolute;
  bottom: -40%;
  left: -15%;
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  pointer-events: none;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.type-name {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
  letter-spacing: 2px;
  text-shadow: none;
}

.type-english {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 1;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.type-section {
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.type-section:hover {
  transition: all 0.3s ease;
  transform: translateX(4px);
}

.subsection-title {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.subsection-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--primary);
  border-radius: 2px;
}

.feature-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-item {
  padding: 5px 7px;
  padding-left: 35px;
  position: relative;
  line-height: 1.9;
  background: var(--bg-card);
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  transform: translateX(4px);
  background: var(--bg-section);
}

.feature-item::before {
  content: "●";
  position: absolute;
  left: 10px;
  color: var(--primary);
  font-weight: 700;
  font-size: 16px;
  top: 16px;
}

.cause-intro {
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: var(--info);
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
}

.cause-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cause-item {
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border-left: 4px solid var(--primary);
  transition: all 0.3s ease;
}

.cause-item:hover {
  transform: translateX(4px);
  background: var(--bg-section);
}

.cause-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-title);
}

.cause-desc {
  font-size: 15px;
  line-height: 1.9;
  padding-left: 0;
  color: var(--text-body);
}

.positive-section {
  padding: 28px;
  border-radius: 16px;
  line-height: 2;
  background: #3a3333;
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 16px;
  animation: fadeIn 0.6s ease-out;
}

.positive-section .subsection-title {
  color: #fff !important;
  font-weight: 800 !important;
  font-size: 20px !important;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.text-body1{
  color: #ffffff;
}
.positive-section .text-body {
  color: rgba(255, 255, 255, 0.95) !important;
  font-weight: 600;
  font-size: 14px;
  line-height: 2;
}

/* 改善建议 */
.suggestions-section {
  margin-bottom: 32px;
}

.suggestion-item {
  margin-bottom: 20px;
  padding: 24px;
  background: var(--bg-card);
  border-radius: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.suggestion-item:hover {
  background: var(--bg-section);
  transform: translateY(-4px);
}

.suggestion-item:active {
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
  margin-top: 16px;
  font-size: 14px;
  padding: 16px;
  background: var(--info);
  color: #fff;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  line-height: 1.7;
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
  padding: 20px;
  background: var(--bg-section);
  border-radius: 16px;
  border: none;
  border-left: 6px solid var(--primary);
  transition: all 0.3s ease;
}

.week-item:hover {
  transform: translateX(4px);
  background: var(--bg-card);
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
  margin-top: 20px;
  padding: 20px;
  background: var(--warning);
  color: #fff;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.8;
  border: none;
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

/* 警告区域 - 扁平化 */
.warning-section {
  padding: 24px;
  background: var(--error);
  color: #242424;
  border: 4px solid var(--error);
  border-radius: 16px;
  margin-top: 28px;
  position: relative;
  overflow: hidden;
  animation: shake 0.5s ease-in-out;
}

/* 抖动动画吸引注意 */
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.warning-section::before {
  content: '⚠️';
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 40px;
  opacity: 0.3;
}

.warning-title {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
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
  margin: 32px 20px;
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
  gap: 12px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: 12px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
}

.history-item:hover {
  background: var(--bg-section);
  transform: translateX(6px);
}

.history-item:active {
  transform: translateX(3px);
}

.history-date, .history-score, .history-level, .history-type { 
  font-size: 14px; 
}

.history-summary {
  margin-top: 16px;
  padding: 16px;
  background: var(--success);
  color: #fff;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  font-size: 15px;
}

/* 常模对比 */
.norm-box { display: flex; flex-direction: column; gap: 8px; }
.norm-row { display: flex; justify-content: space-between; font-size: 14px; }
.norm-row .label { color: var(--text-secondary); }
.norm-row .value.up { color: var(--error); }
.norm-row .value.down { color: var(--success); }
.norm-note { margin-top: 8px; font-size: 12px; }

/* 下一步行动 - 移动端优化 */
.next-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next-btn {
  height: 56px;
  border-radius: 16px;
  font-weight: 700;
  font-size: 16px;
  border: none;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 按钮点击波纹效果 */
.next-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.next-btn:active::before {
  width: 300px;
  height: 300px;
}

.next-btn:hover {
  transform: translateY(-4px);
}

.next-btn:active {
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--secondary);
  color: #fff;
}

.btn-secondary:hover {
  opacity: 0.9;
}

/* 删除本地配色选择器相关样式（统一用全局） */

/* 桌面端悬浮按钮 */
.floating-actions {
  position: fixed;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1500;
  animation: fadeInRight 0.5s ease-out;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.floating-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--bg-card);
  border: 2px solid var(--primary);
  border-radius: 50px;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

.floating-btn:hover {
  background: var(--primary);
  color: #fff;
  transform: translateX(-4px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
}

.floating-btn:active {
  transform: translateX(-2px) scale(0.98);
}

.floating-btn .iconify {
  flex-shrink: 0;
}

.floating-btn-retest {
  border-color: var(--primary);
  color: var(--primary);
}

.floating-btn-retest:hover {
  background: var(--primary);
  color: #fff;
}

.floating-btn-share {
  border-color: var(--secondary);
  color: var(--secondary);
}

.floating-btn-share:hover {
  background: var(--secondary);
  color: #fff;
}

/* 移动端显示/隐藏控制 */
.mobile-only-section {
  display: none;
}

.desktop-only-floating {
  display: flex;
}

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
    font-size: 25px;
  }

  /* 平板端也隐藏悬浮按钮,显示移动端区域 */
  .desktop-only-floating {
    display: none;
  }

  .mobile-only-section {
    display: block;
  }
}

/* 大屏手机 (481px - 768px) */
@media (max-width: 768px) {
  .content-scroll {
    padding: 68px 0 28px 0;
  }

  .score-card {
    padding: 36px 0;
    margin-top: 20px;
  }

  .type-badge {
    padding: 36px 20px;
  }

  /* 类型诊断区域优化 */
  .type-section {
    padding: 22px 20px;
    margin-bottom: 28px;
  }

  .subsection-title {
    font-size: 17px;
  }

  .feature-item {
    padding: 10px 12px;
    padding-left: 25px;
    font-size: 14px;
  }

  .feature-item::before {
    left: 6px;
    top: 15px;
  }

  .cause-intro {
    font-size: 14px;
    padding: 15px 18px;
  }

  .cause-item {
    padding: 18px;
  }

  .cause-title {
    font-size: 15px;
  }

  .cause-desc {
    font-size: 14px;
  }

  .score-layout {
    gap: 24px;
    max-width: 480px;
    padding: 0 28px;
  }

  .score-left {
    flex: 0 0 45%;
  }

  .score-right {
    flex: 1;
    min-width: 0;
  }

  .total-score {
    font-size: 90px;
    letter-spacing: -4px;
  }

  .dimensions-preview {
    padding: 0px;
  }

  .score-unit {
    font-size: 26px;
  }

  .level-name {
    font-size: 26px;
    letter-spacing: 2px;
  }

  .score-desc {
    font-size: 13px;
  }

  .section-card {
    padding: 24px 20px;
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 20px;
    margin-bottom: 20px;
    padding-bottom: 14px;
  }

  .collapse-toggle {
    padding: 16px 18px;
    font-size: 15px;
    min-height: 54px;
  }

}

/* 小屏手机 (≤480px) - 移动端优先优化 */
@media (max-width: 480px) {
  .content-scroll {
    padding: 64px 0 24px 0;
  }

  .report-content {
    padding-bottom: 40px;
  }
  .dimensions-preview {
    padding: 0px;
  }
  .score-card {
    padding: 32px 0;
    margin-top: 16px;
    border-radius: 16px;
    min-height: 160px;
  }

  .type-badge {
    padding: 32px 16px;
  }

  /* 类型诊断区域优化 */
  .type-section {
    padding: 20px 16px;
    margin-bottom: 24px;
  }

  .subsection-title {
    font-size: 17px;
    margin-bottom: 16px;
  }

  .subsection-title::before {
    width: 3px;
    height: 18px;
  }

  .feature-item {
    padding: 8px 10px;
    padding-left: 20px;
    font-size: 14px;
  }

  .feature-item::before {
    left: 2px;
    top: 14px;
    font-size: 14px;
  }

  .cause-intro {
    font-size: 14px;
    padding: 14px 16px;
    margin-bottom: 16px;
  }

  .cause-item {
    padding: 16px;
  }

  .cause-title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  .cause-desc {
    font-size: 14px;
    line-height: 1.8;
  }

  /* 保持左右布局，优化间距 - 分数占40% */
  .score-layout {
    gap: 16px;
    max-width: 100%;
    padding: 0 20px;
  }

  .score-left {
    gap: 6px;
    flex: 0 0 45%;
  }

  .score-right {
    flex: 1;
    min-width: 0;
  }

  .total-score {
    font-size: 90px;
    letter-spacing: -3px;
  }

  .score-unit {
    font-size: 22px;
    margin-bottom: 6px;
  }

  .level-name {
    font-size: 20px;
    letter-spacing: 1.5px;
    margin: 4px 0;
  }

  .score-desc {
    font-size: 12px;
    line-height: 1.5;
  }

  .section-card {
    padding: 10px 16px;
    margin-bottom: 10px;
    border-width: 2px;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom-width: 1px;
  }

  .section-title::after {
    width: 30%;
    height: 2px;
  }

  .collapse-toggle {
    padding: 14px 16px;
    border-radius: 10px;
    font-size: 14px;
    min-height: 52px;
  }

  .radar-chart {
    height: 260px;
    padding: 12px;
    margin: 16px 0;
  }

  /* 预览样式移动端优化 */
  .dimensions-preview,
  .suggestions-preview {
    padding: 0px;
    margin-top: 16px;
  }

  .dimension-preview-item,
  .suggestion-preview-item {
    padding: 14px;
    margin-bottom: 12px;
  }

  .dimension-preview-name {
    font-size: 14px;
  }

  .dimension-preview-level {
    font-size: 11px;
    padding: 3px 10px;
  }

  .dimension-preview-score {
    font-size: 11px;
  }

  .suggestion-preview-title {
    font-size: 15px;
  }

  .suggestion-preview-hint {
    font-size: 12px;
  }

  .preview-hint {
    font-size: 12px;
    margin-top: 12px;
    padding-top: 12px;
  }

  /* 维度和建议项优化 */
  .dimension-item,
  .suggestion-item {
    padding: 16px;
    margin-bottom: 12px;
    border-width: 2px;
  }

  .type-name {
    font-size: 26px;
    letter-spacing: 1px;
  }

  .type-english {
    font-size: 13px;
  }

  .subsection-title {
    font-size: 15px;
    margin-bottom: 10px;
  }

  /* 按钮优化 */
  .next-btn {
    height: 52px;
    font-size: 15px;
    border-width: 2px;
  }

  /* 移动端显示下一步行动区域 */
  .mobile-only-section {
    display: block;
  }

  /* 移动端隐藏悬浮按钮 */
  .desktop-only-floating {
    display: none;
  }

  /* 周计划优化 */
  .week-item {
    padding: 16px;
    border-width: 2px;
    border-left-width: 5px;
  }

  /* 警告区域优化 */
  .warning-section {
    padding: 20px;
    border-width: 3px;
  }

  .warning-section::before {
    font-size: 32px;
    top: 16px;
    right: 16px;
  }

  /* 历史记录优化 */
  .history-item {
    padding: 16px;
    gap: 10px;
    border-width: 2px;
  }

  .history-date,
  .history-score,
  .history-level,
  .history-type {
    font-size: 13px;
  }
}

/* iPad专用优化 (769px-1024px) */
@media (min-width: 769px) and (max-width: 1024px) {
  .content-scroll {
    padding: 80px 5% 40px 5%; /* iPad使用5%左右留白 */
  }
  
  .container {
    max-width: 90%;
    padding: 0;
  }
  
  .score-card {
    padding: 40px 32px;
    margin-top: 20px;
  }
  
  .score-layout {
    gap: 24px;
  }
  
  .total-score {
    font-size: 100px;
  }
  
  .level-name {
    font-size: 26px;
  }
  
  .section-card {
    padding: 24px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .radar-chart {
    height: 320px;
  }
  
  .type-badge {
    padding: 36px 24px;
  }
  
  .type-name {
    font-size: 26px;
  }
  
  .dimension-item {
    padding: 16px;
  }
  
  .dimension-name {
    font-size: 15px;
  }
  
  .suggestion-item {
    padding: 16px;
  }
}

/* 超小屏 (≤360px) */
@media (max-width: 360px) {
  .content-scroll {
    padding: 60px 0 20px 0;
  }

  .score-card {
    padding: 28px 16px;
    margin-top: 12px;
    min-height: 140px;
  }

  .type-badge {
    padding: 28px 12px;
  }

  .score-layout {
    gap: 12px;
    padding: 0 16px;
  }

  .score-left {
    gap: 4px;
    flex: 0 0 45%;
  }

  .score-right {
    flex: 1;
    min-width: 0;
  }

  .total-score {
    font-size: 64px;
    letter-spacing: -2px;
  }

  .score-unit {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .level-name {
    font-size: 18px;
    letter-spacing: 1px;
  }

  .score-desc {
    font-size: 11px;
  }

  .section-card {
    padding: 10px 12px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 14px;
    padding-bottom: 10px;
  }

  .collapse-toggle {
    padding: 12px 14px;
    font-size: 13px;
    min-height: 48px;
  }

  .radar-chart {
    height: 240px;
    padding: 10px;
  }

  .type-name {
    font-size: 22px;
  }

  .type-english {
    font-size: 12px;
  }

  .next-btn {
    height: 48px;
    font-size: 14px;
  }
}

/* ========== 深色模式适配 ========== */

/* 深色模式下，总分卡片需要更深的色调 */
/* 深色模式：各等级更深色系 */
/* 深色模式下保持与浅色一致：不对分数卡片背景做覆盖 */

/* 深色模式下装饰元素更柔和 */
.scheme1-dark .score-decoration,
.scheme2-dark .score-decoration {
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
}

/* 深色模式下不覆盖等级条颜色，保持与浅色一致 */

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

/* 浅色模式下仍保持白色前景，确保对比强烈（背景更深） */
/* 取消浅色模式对文字颜色的强制覆盖，让两种模式保持一致 */
/* （保留装饰元素的差异化，不影响卡片与分数颜色） */

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
/* 取消深色模式对分数字体的特殊处理（与浅色一致） */

/* 浅色模式 - 分数依旧用暖红橙渐变以吸睛 */
/* 取消浅色模式对分数字体的特殊处理（与深色一致） */

.scheme1-light .report-page .level-name,
.scheme2-light .report-page .level-name { color: #000000; }
</style>

