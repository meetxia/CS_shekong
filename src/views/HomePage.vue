<template>
    <div class="home-page container page">
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 头部Logo区域 -->
        <div class="header-section fade-in">
          <div class="logo-area">
            <div class="brand-badge">
              <span class="iconify" data-icon="mdi:shield-check" data-width="16" data-height="16"></span>
              专业心理测评
            </div>
            <h1 class="brand-name text-title">社恐程度专业测评</h1>
            <p class="brand-subtitle text-secondary">Social Anxiety Assessment</p>
            <div class="credential-badges">
              <span class="badge-item">
                <span class="iconify" data-icon="mdi:certificate" data-width="14" data-height="14"></span>
                基于SAS量表
              </span>
              <span class="badge-separator">·</span>
              <span class="badge-item">
                <span class="iconify" data-icon="mdi:account-check" data-width="14" data-height="14"></span>
                {{ testCount.toLocaleString() }}+ 次测评
              </span>
            </div>
          </div>
        </div>
  
        <!-- 产品卡片 -->
        <div class="product-card card fade-in" style="animation-delay: 0.1s">
          <div class="card-header-group">
            <div class="card-badge">
              <span class="iconify" data-icon="mdi:sparkles" data-width="14" data-height="14"></span>
              专业量表改良
            </div>
            <div class="card-quality-mark">
              <span class="iconify" data-icon="mdi:check-decagram" data-width="18" data-height="18"></span>
            </div>
          </div>
          
          <h2 class="product-title text-title">深度了解你的社交焦虑程度</h2>
          <p class="product-desc text-body">基于国际权威SAS社交焦虑量表改良 · 科学专业 · 深度分析</p>
          
          <div class="trust-indicators">
            <div class="trust-item">
              <span class="iconify" data-icon="mdi:security" data-width="16" data-height="16"></span>
              <span>数据加密保护</span>
            </div>
            <div class="trust-item">
              <span class="iconify" data-icon="mdi:eye-off" data-width="16" data-height="16"></span>
              <span>匿名测评</span>
            </div>
            <div class="trust-item">
              <span class="iconify" data-icon="mdi:certificate-outline" data-width="16" data-height="16"></span>
              <span>专业认证</span>
            </div>
          </div>
          
          <!-- 特点列表 -->
          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <span class="feature-icon">
                  <span class="iconify" data-icon="mdi:chart-bar" data-width="24" data-height="24"></span>
                </span>
              </div>
              <div class="feature-content">
                <div class="feature-title">30题专业测评</div>
                <div class="feature-desc text-secondary">6大维度全面分析社交焦虑</div>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <span class="feature-icon">
                  <span class="iconify" data-icon="mdi:chart-line" data-width="24" data-height="24"></span>
                </span>
              </div>
              <div class="feature-content">
                <div class="feature-title">可视化报告</div>
                <div class="feature-desc text-secondary">雷达图+维度分析清晰展示</div>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <span class="feature-icon">
                  <span class="iconify" data-icon="mdi:lightbulb-on" data-width="24" data-height="24"></span>
                </span>
              </div>
              <div class="feature-content">
                <div class="feature-title">个性化建议</div>
                <div class="feature-desc text-secondary">根据结果提供针对性改善方案</div>
              </div>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <span class="feature-icon">
                  <span class="iconify" data-icon="mdi:clock-fast" data-width="24" data-height="24"></span>
                </span>
              </div>
              <div class="feature-content">
                <div class="feature-title">5-8分钟完成</div>
                <div class="feature-desc text-secondary">随时随地快速了解自己</div>
              </div>
            </div>
          </div>
  
          <!-- 统计数据 -->
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-number">{{ testCount.toLocaleString() }}</div>
              <div class="stat-label text-secondary">人已测试</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <div class="stat-number">98%</div>
              <div class="stat-label text-secondary">好评率</div>
            </div>
          </div>
        </div>
  
        <!-- 测试维度说明 -->
        <div class="dimensions-card card fade-in" style="animation-delay: 0.2s">
          <div class="section-header">
            <h3 class="section-title text-title">
              <span class="iconify" data-icon="mdi:blur-radial" data-width="20" data-height="20"></span>
              6大测评维度
            </h3>
            <p class="section-subtitle text-secondary">全方位评估你的社交焦虑状况</p>
          </div>
          <div class="dimensions-grid">
            <div class="dimension-tag" v-for="(dim, index) in dimensions" :key="index">
              <div class="dimension-number">{{ index + 1 }}</div>
              <div class="dimension-name">{{ dim }}</div>
              <div class="dimension-icon">
                <span class="iconify" data-icon="mdi:chevron-right" data-width="16" data-height="16"></span>
              </div>
            </div>
          </div>
        </div>
  
        <!-- CTA按钮 -->
        <button
          @click="startTest"
          class="btn-primary btn-start fade-in"
          style="animation-delay: 0.3s"
        >
          <span class="btn-start-content">
            <span v-if="hasActivation">继续测评</span>
            <span v-else>开始专业测评</span>
            <span class="iconify btn-icon" data-icon="mdi:arrow-right" data-width="20" data-height="20"></span>
          </span>
        </button>
  
        <!-- 说明文字 -->
        <div class="notice-text fade-in" style="animation-delay: 0.4s">
          <p class="text-secondary">
            本测评仅供自我探索参考，不构成医疗诊断<br>
            如有严重心理问题，请寻求专业帮助
          </p>
        </div>
      </div>
  
      <!-- 底部 -->
      <div class="footer fade-in" style="animation-delay: 0.5s">
        <div class="footer-links">
          <a href="#" class="footer-link text-secondary" @click.prevent="showAbout = true">关于测评</a>
          <span class="footer-separator">·</span>
          <a href="#" class="footer-link text-secondary" @click.prevent="showPrivacy = true">隐私保护</a>
        </div>
        <p class="footer-text text-disabled">数据安全 · 隐私保护 · 专业可信</p>
      </div>
  
      <!-- 关于测评弹窗 -->
      <div v-if="showAbout" class="modal" @click="showAbout = false">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title text-title">关于测评</h3>
          <div class="modal-body text-body">
            <p><strong>测评基础</strong></p>
            <p>本测评基于国际权威的SAS（社交焦虑量表）改良而成，经过心理学专业团队精心设计。</p>
            
            <p><strong>测评维度</strong></p>
            <p>涵盖社交场景恐惧、回避行为、预期焦虑、社交反刍、生理反应、自我效能6大维度，全面评估你的社交焦虑状况。</p>
            
            <p><strong>使用说明</strong></p>
            <p>• 请根据最近一个月的真实感受作答<br>
            • 没有对错之分，请诚实选择<br>
            • 建议在安静环境下独自完成<br>
            • 完成后可获得专业分析报告</p>
          </div>
          <button @click="showAbout = false" class="btn-primary modal-btn">知道了</button>
        </div>
      </div>
  
      <!-- 隐私保护弹窗 -->
      <div v-if="showPrivacy" class="modal" @click="showPrivacy = false">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title text-title">隐私保护</h3>
          <div class="modal-body text-body">
            <p><strong>数据安全承诺</strong></p>
            <p>• 所有测评数据仅存储在您的设备本地<br>
            • 不上传任何个人信息到服务器<br>
            • 您可随时清除浏览器数据删除记录<br>
            • 报告内容仅您本人可见</p>
            
            <p><strong>使用范围</strong></p>
            <p>本测评结果仅供自我探索和参考，不构成任何医疗诊断或建议。如您感到严重的心理困扰，建议咨询专业心理咨询师或精神科医生。</p>
          </div>
          <button @click="showPrivacy = false" class="btn-primary modal-btn">知道了</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { checkActivation } from '@/utils/activation'
  
  const router = useRouter()
  
  const testCount = ref(15328) // 模拟已测试人数
  const showAbout = ref(false)
  const showPrivacy = ref(false)
  
  const dimensions = [
    '社交场景恐惧',
    '回避行为程度',
    '预期焦虑强度',
    '负面评价恐惧',
    '社交后反刍',
    '功能损害程度'
  ]
  
  const hasActivation = computed(() => {
    return checkActivation()
  })
  
  const startTest = () => {
    if (hasActivation.value) {
      // 如果已激活，直接进入测评页
      router.push('/assessment')
    } else {
      // 否则进入激活页
      router.push('/activation')
    }
  }
  
  // 每隔一段时间增加测试人数（模拟实时数据）
  onMounted(() => {
    setInterval(() => {
      testCount.value += Math.floor(Math.random() * 3)
    }, 5000)
  })
  </script>
  
  <style scoped>
  .home-page {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
    padding: 60px 20px 40px 20px;
    position: relative;
    background: var(--bg-main);
  }
  
  .home-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 800px;
    height: 400px;
    background: radial-gradient(circle at top, var(--primary) 0%, transparent 70%);
    opacity: 0.03;
    pointer-events: none;
  }
  
  .home-page::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to top, var(--bg-section), transparent);
    opacity: 0.5;
    pointer-events: none;
  }
  
  .main-content {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    flex: 1;
    position: relative;
    z-index: 1;
  }
  
  /* 头部Logo */
  .header-section {
    text-align: center;
    margin-bottom: 36px;
  }
  
  .logo-area {
    padding: 24px 0 0 0;
  }
  
  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: #fff;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 16px;
  }
  
  .brand-name {
    font-size: 34px;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.3;
    letter-spacing: -0.5px;
  }
  
  .brand-subtitle {
    font-size: 13px;
    letter-spacing: 1px;
    margin-bottom: 12px;
  }
  
  .credential-badges {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-secondary);
  }
  
  .badge-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  
  .badge-separator {
    color: var(--border);
  }
  
  /* 产品卡片 */
  .product-card {
    padding: 28px 24px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
    border: 1px solid var(--border);
  }
  
  .card-header-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .card-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: var(--bg-section);
    color: var(--primary);
    border-radius: 16px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--border);
  }
  
  .card-quality-mark {
    color: var(--primary);
    display: flex;
    align-items: center;
    opacity: 0.8;
  }
  
  .product-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 12px;
    line-height: 1.4;
    letter-spacing: -0.3px;
  }
  
  .product-desc {
    font-size: 14px;
    line-height: 1.7;
    margin-bottom: 20px;
  }
  
  .trust-indicators {
    display: flex;
    justify-content: space-around;
    gap: 12px;
    padding: 16px 0;
    margin-bottom: 24px;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }
  
  .trust-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-secondary);
  }
  
  .trust-item .iconify {
    color: var(--primary);
    opacity: 0.8;
  }
  
  .trust-item span {
    white-space: nowrap;
  }
  
  /* 特点列表 */
  .features-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 24px;
  }
  
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 12px;
    background: var(--bg-section);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  .feature-item:hover {
    background: var(--bg-card);
    transform: translateX(4px);
  }
  
  .feature-icon-wrapper {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card);
    border-radius: 10px;
    border: 1px solid var(--border);
  }
  
  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }
  
  .feature-icon .iconify {
    color: var(--primary);
  }
  
  .feature-content {
    flex: 1;
    padding-top: 2px;
  }
  
  .feature-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-title);
    margin-bottom: 4px;
  }
  
  .feature-desc {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
  }
  
  /* 统计数据 */
  .stats-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 40px;
    padding: 24px 0 20px;
    border-top: 1px solid var(--border);
    background: linear-gradient(to bottom, var(--bg-section), transparent);
  }
  
  .stat-item {
    text-align: center;
    transition: transform 0.3s ease;
  }
  
  .stat-item:hover {
    transform: scale(1.05);
  }
  
  .stat-number {
    font-size: 32px;
    font-weight: 800;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 6px;
    letter-spacing: -1px;
  }
  
  .stat-label {
    font-size: 12px;
    font-weight: 500;
  }
  
  .stat-divider {
    width: 1px;
    height: 48px;
    background: linear-gradient(to bottom, transparent, var(--border), transparent);
  }
  
  /* 维度卡片 */
  .dimensions-card {
    padding: 28px 24px;
    margin-bottom: 28px;
    border: 1px solid var(--border);
  }
  
  .section-header {
    margin-bottom: 20px;
    text-align: center;
  }
  
  .section-title {
    font-size: 19px;
    font-weight: 700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--text-title);
  }
  
  .section-title .iconify {
    color: var(--primary);
  }
  
  .section-subtitle {
    font-size: 13px;
    margin-top: 6px;
  }
  
  .dimensions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .dimension-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 14px;
    background: linear-gradient(135deg, var(--bg-section) 0%, var(--bg-card) 100%);
    border-radius: 12px;
    font-size: 13px;
    color: var(--text-body);
    border: 1.5px solid var(--border);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .dimension-tag::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  .dimension-tag:hover::before {
    left: 100%;
  }
  
  .dimension-number {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
  }
  
  .dimension-name {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-title);
  }
  
  .dimension-icon {
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    opacity: 0.5;
    transition: all 0.3s ease;
  }
  
  .dimension-tag:hover {
    border-color: var(--primary);
    background: var(--bg-card);
    transform: translateY(-2px);
  }
  
  .dimension-tag:hover .dimension-icon {
    opacity: 1;
    color: var(--primary);
    transform: translateX(3px);
  }
  
  .dimension-tag:hover .dimension-name {
    color: var(--primary);
  }
  
  /* 开始按钮 */
  .btn-start {
    width: 100%;
    max-width: 600px;
    height: 60px;
    border-radius: 14px;
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 20px;
    border: none;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  }
  
  .btn-start::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }
  
  .btn-start:hover::before {
    left: 100%;
  }
  
  .btn-start-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    z-index: 1;
  }
  
  .btn-icon {
    transition: transform 0.3s ease;
  }
  
  .btn-start:hover:not(:disabled) {
    transform: translateY(-3px);
  }
  
  .btn-start:hover:not(:disabled) .btn-icon {
    transform: translateX(4px);
  }
  
  /* 说明文字 */
  .notice-text {
    text-align: center;
    margin-bottom: 32px;
  }
  
  .notice-text p {
    font-size: 12px;
    line-height: 1.8;
  }
  
  /* 底部 */
  .footer {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  
  .footer-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .footer-link {
    font-size: 13px;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .footer-link:hover {
    color: var(--primary);
  }
  
  .footer-separator {
    color: var(--text-disabled);
  }
  
  .footer-text {
    font-size: 12px;
  }
  
/* 弹窗 */
.modal {
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
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 32px 24px;
  width: 90%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
  border: 1px solid var(--border);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-title);
}

.modal-body {
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 24px;
  color: var(--text-body);
}

.modal-body p {
  margin-bottom: 12px;
  color: var(--text-body);
}

.modal-body strong {
  color: var(--text-title);
  display: block;
  margin-bottom: 8px;
  margin-top: 16px;
  font-weight: 700;
}

.modal-body p:first-child strong {
  margin-top: 0;
}
  
  .modal-btn {
    width: 100%;
    height: 48px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
  }
  
  /* 响应式 */
  @media (max-width: 480px) {
    .home-page {
      padding: 15% 16px 24px 16px;
    }
    
    .brand-name {
      font-size: 28px;
    }
    
    .product-title {
      font-size: 22px;
    }
    
    .dimensions-grid {
      grid-template-columns: 1fr;
    }
    
    .stats-row {
      gap: 24px;
    }
    
    .stat-number {
      font-size: 24px;
    }
  }
  
  @media (max-width: 360px) {
    .features-list {
      gap: 12px;
    }
    
    .feature-icon {
      font-size: 20px;
    }
    
    .feature-title {
      font-size: 15px;
    }
  }
  </style>
  