/**
 * 分享卡片生成工具
 * 为小红书用户优化的结果卡片生成
 */

/**
 * 生成分享卡片HTML
 * @param {Object} report - 测评报告数据
 * @param {String} cardType - 卡片类型: 'score' | 'type' | 'radar'
 * @returns {HTMLElement} - 卡片DOM元素
 */
export function generateShareCard(report, cardType = 'type') {
  const cards = {
    score: generateScoreCard,
    type: generateTypeCard,
    radar: generateRadarCard
  };
  
  return cards[cardType](report);
}

/**
 * 卡片1: 总分卡
 */
function generateScoreCard(report) {
  const card = document.createElement('div');
  card.className = 'share-card score-card';
  card.innerHTML = `
    <div class="card-header">
      <h3>社恐程度专业测评结果</h3>
      <p class="subtitle">基于SAS社交焦虑量表改良</p>
    </div>
    
    <div class="card-body">
      <div class="level-badge ${report.level.name}">${report.level.name}</div>
      <div class="total-score">${report.totalScore}<span class="unit">/100分</span></div>
      
      <div class="score-scale">
        <div class="scale-bar">
          <div class="scale-marker" style="left: ${report.totalScore}%"></div>
        </div>
        <div class="scale-labels">
          <span style="left: 10%">10<br>轻度</span>
          <span style="left: 30%">30<br>中度</span>
          <span style="left: 50%">50<br>中度</span>
          <span style="left: 70%">70<br>重度</span>
          <span style="left: 100%">100<br>极重</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <p class="hint">长按保存图片 · 查看完整报告</p>
    </div>
  `;
  
  return card;
}

/**
 * 卡片2: 类型卡（核心传播卡片）
 */
function generateTypeCard(report) {
  const { type } = report;
  
  // 为不同类型配图标
  const typeIcons = {
    '预演型社恐': '<span class="iconify" data-icon="mdi:script-text" data-width="24" data-height="24"></span>',
    '回避型社恐': '<span class="iconify" data-icon="mdi:run" data-width="24" data-height="24"></span>',
    '表演型社恐': '<span class="iconify" data-icon="mdi:microphone" data-width="24" data-height="24"></span>',
    '综合型社恐': '<span class="iconify" data-icon="mdi:swap-horizontal-circle" data-width="24" data-height="24"></span>',
    '轻度社恐': '<span class="iconify" data-icon="mdi:sprout" data-width="24" data-height="24"></span>',
    '负面评价恐惧型社恐': '<span class="iconify" data-icon="mdi:eye" data-width="24" data-height="24"></span>',
    '功能损害型社恐': '<span class="iconify" data-icon="mdi:alert-circle" data-width="24" data-height="24"></span>'
  };
  
  const icon = typeIcons[type.name] || '<span class="iconify" data-icon="mdi:heart" data-width="24" data-height="24"></span>';
  
  const card = document.createElement('div');
  card.className = 'share-card type-card';
  card.innerHTML = `
    <div class="card-header">
      <h3>你的社恐类型</h3>
    </div>
    
    <div class="card-body">
      <div class="type-name">
        「${type.name}」${icon}
      </div>
      <div class="type-name-en">${type.englishName}</div>
      
      <div class="divider"></div>
      
      <div class="features">
        ${type.features.map(f => `<div class="feature-item">· ${f}</div>`).join('')}
      </div>
      
      <div class="divider"></div>
      
      <div class="quote">
        <div class="quote-icon">"</div>
        <p class="quote-text">${getTypeQuote(type.name)}</p>
        <div class="quote-icon">"</div>
      </div>
    </div>
    
    <div class="card-footer">
      <div class="hashtags">
        #社恐测试 #${type.name}
      </div>
      <p class="test-hint">点击查看完整分析 →</p>
    </div>
  `;
  
  return card;
}

/**
 * 卡片3: 雷达图卡
 */
function generateRadarCard(report) {
  const { dimensions } = report;
  
  // 找出最高和最低维度
  const sorted = [...dimensions].sort((a, b) => b.percentage - a.percentage);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  
  const card = document.createElement('div');
  card.className = 'share-card radar-card';
  card.innerHTML = `
    <div class="card-header">
      <h3>六维度社恐分析</h3>
    </div>
    
          <div class="card-body">
        <div class="radar-chart-container">
          <canvas id="shareRadarChart" width="260" height="260"></canvas>
        </div>
      
      <div class="dimension-insight">
        <div class="insight-row">
          <span class="label">最高维度：</span>
          <span class="value high">${highest.name} ${highest.percentage}%</span>
        </div>
        <div class="insight-row">
          <span class="label">最低维度：</span>
          <span class="value low">${lowest.name} ${lowest.percentage}%</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <div class="pain-point">
        <div class="label">你的痛点：</div>
        <p>${getDimensionInsight(highest.name)}</p>
      </div>
      
      <div class="quick-tip">
        <div class="label"><span class="iconify" data-icon="mdi:lightbulb-on" data-width="18" data-height="18"></span> 立即行动：</div>
        <p>${getDimensionTip(highest.name)}</p>
      </div>
    </div>
    
    <div class="card-footer">
      <p class="hint">查看完整报告了解更多 →</p>
    </div>
  `;
  
  return card;
}

/**
 * 获取类型对应的一句话金句
 */
function getTypeQuote(typeName) {
  const quotes = {
    '预演型社恐': '你不是准备不够，而是给自己的压力太大了。',
    '回避型社恐': '逃避不可耻，但迈出一小步会更自由。',
    '表演型社恐': '你的紧张别人看不见，只有你自己在意。',
    '综合型社恐': '社恐不是缺陷，而是你敏感细腻的证明。',
    '轻度社恐': '你已经很好了，只是需要多一点点勇气。',
    '负面评价恐惧型社恐': '过度在意他人评价，往往忽略了真实的自己。',
    '功能损害型社恐': '意识到问题，就是改变的第一步。'
  };
  
  return quotes[typeName] || '社恐不是你的错，慢慢来，一切都会好起来。';
}

/**
 * 获取维度洞察文案
 */
function getDimensionInsight(dimensionName) {
  const insights = {
    '社交场景恐惧': '多人聚会、公开场合是你最大的压力源',
    '回避行为程度': '你经常选择逃避社交，错失了很多机会',
    '预期焦虑强度': '事前过度担心是你最大的困扰',
    '负面评价恐惧': '过度在意他人评价是你的核心困扰',
    '社交后反刍': '事后反复回想让你陷入自责循环',
    '功能损害程度': '社交焦虑已明显影响你的生活质量'
  };
  
  return insights[dimensionName] || '这个维度需要重点关注';
}

/**
 * 获取维度对应的快速建议
 */
function getDimensionTip(dimensionName) {
  const tips = {
    '社交场景恐惧': '从3-5人小聚开始，逐步适应',
    '回避行为程度': '每周至少参加1次社交活动',
    '预期焦虑强度': '使用5秒法则打断焦虑思维',
    '负面评价恐惧': '记住"聚光灯效应"，别人没那么关注你',
    '社交后反刍': '设定"回顾时间"，限制反刍时长',
    '功能损害程度': '建议寻求专业帮助，从最小社交单元开始重建'
  };
  
  return tips[dimensionName] || '查看报告获取详细建议';
}

/**
 * 将卡片转换为图片（用于保存和分享）
 * 使用dom-to-image-more库（更稳定的替代方案）
 */
export async function cardToImage(cardElement) {
  try {
    // 动态导入库
    const domtoimage = await import('dom-to-image-more');
    
    // 获取当前主题对应的背景色
    const theme = cardElement.getAttribute('data-theme') || 'light';
    const themeColors = {
      light: '#FFFFFF',
      warm: '#FFF5F0',
      cool: '#F0F5FF',
      dark: '#2A2A2A'
    };
    const bgColor = themeColors[theme] || '#FFFFFF';
    
    // 使用toPng方法生成图片
    const dataUrl = await domtoimage.toPng(cardElement, {
      quality: 1,
      bgcolor: bgColor,
      style: {
        transform: 'scale(2)',
        transformOrigin: 'top left',
        width: cardElement.offsetWidth + 'px',
        height: cardElement.offsetHeight + 'px'
      },
      width: cardElement.offsetWidth * 2,
      height: cardElement.offsetHeight * 2
    });
    
    return dataUrl;
  } catch (error) {
    console.error('生成图片失败:', error);
    // 降级方案：使用canvas直接截图
    return fallbackToCanvas(cardElement);
  }
}

/**
 * 降级方案：使用Canvas API直接转换
 */
async function fallbackToCanvas(element) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = element.getBoundingClientRect();
    
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    
    // 获取背景颜色
    const theme = element.getAttribute('data-theme') || 'light';
    const themeColors = {
      light: '#FFFFFF',
      warm: '#FFF5F0',
      cool: '#F0F5FF',
      dark: '#2A2A2A'
    };
    const bgColor = themeColors[theme] || '#FFFFFF';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // 简单提示
    const computedStyle = getComputedStyle(element);
    const textColor = computedStyle.getPropertyValue('--text-title') || '#000000';
    ctx.fillStyle = textColor;
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('请长按截图保存', rect.width / 2, rect.height / 2);
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('降级方案也失败:', error);
    return null;
  }
}

/**
 * 检测是否为移动端
 */
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    || window.innerWidth <= 768;
}

/**
 * 下载图片或显示预览
 */
export function downloadImage(dataUrl, filename = 'social-anxiety-result.png') {
  if (isMobile()) {
    // 移动端:显示图片预览,用户可以长按保存
    showImagePreview(dataUrl);
  } else {
    // 桌面端:直接下载
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  }
}

/**
 * 显示图片预览(移动端长按保存)
 */
function showImagePreview(dataUrl) {
  // 创建预览弹窗
  const previewModal = document.createElement('div');
  previewModal.className = 'image-preview-modal';
  previewModal.innerHTML = `
    <div class="image-preview-overlay"></div>
    <div class="image-preview-content">
      <div class="image-preview-header">
        <h3>长按图片保存</h3>
        <button class="image-preview-close">×</button>
      </div>
      <div class="image-preview-body">
        <img src="${dataUrl}" alt="测评结果" class="preview-image" />
      </div>
      <div class="image-preview-footer">
        <p class="preview-hint">💡 长按图片即可保存到相册</p>
      </div>
    </div>
  `;

  document.body.appendChild(previewModal);

  // 关闭按钮
  const closePreview = () => previewModal.remove();
  previewModal.querySelector('.image-preview-close').addEventListener('click', closePreview);
  previewModal.querySelector('.image-preview-overlay').addEventListener('click', closePreview);

  // 添加动画
  setTimeout(() => {
    previewModal.classList.add('active');
  }, 10);
}

/**
 * 显示分享卡片弹窗
 */
export function showShareModal(report) {
  // 检测移动端
  if (isMobile()) {
    // 移动端:显示卡片预览,带切换背景按钮
    showMobileSharePreview(report);
    return;
  }

  // 桌面端:显示设置弹窗
  const modal = document.createElement('div');
  modal.className = 'share-card-modal';
  modal.innerHTML = `
    <div class="share-card-modal-overlay"></div>
    <div class="share-card-modal-content">
      <div class="share-card-modal-header">
        <h3>分享测评结果</h3>
        <button class="share-card-close-btn">×</button>
      </div>

      <div class="share-card-modal-body">
        <div class="share-card-settings">
          <div class="share-card-theme-selector">
            <div class="share-card-theme-label">
              <span>背景</span>
            </div>
            <div class="share-card-theme-options">
              <div class="share-card-theme-option active" data-theme="light" title="白色背景">
                <div class="theme-preview-light"></div>
              </div>
              <div class="share-card-theme-option" data-theme="dark" title="深色背景">
                <div class="theme-preview-dark"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="share-card-preview-wrapper">
          <div class="share-card-preview" id="cardPreview">
            <!-- 卡片预览 -->
          </div>
        </div>
      </div>

      <div class="share-card-modal-footer">
        <button class="share-card-btn-cancel" id="btnCancel">取消</button>
        <button class="share-card-btn-download" id="btnDownload">保存图片</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // 初始化显示分数卡（直接显示分数卡，不再默认显示类型卡）
  const preview = modal.querySelector('#cardPreview');
  const scoreCard = generateScoreCard(report);
  scoreCard.setAttribute('data-theme', 'light');
  preview.appendChild(scoreCard);
  
  // 当前选中的主题
  let currentTheme = 'light';
  
  // 主题切换
  modal.querySelectorAll('.share-card-theme-option').forEach(option => {
    option.addEventListener('click', (e) => {
      modal.querySelectorAll('.share-card-theme-option').forEach(opt => opt.classList.remove('active'));
      e.currentTarget.classList.add('active');

      currentTheme = e.currentTarget.dataset.theme;
      const card = preview.querySelector('.share-card');
      if (card) {
        card.setAttribute('data-theme', currentTheme);
      }
    });
  });
  
  // 下载按钮
  modal.querySelector('#btnDownload').addEventListener('click', async () => {
    const btn = modal.querySelector('#btnDownload');
    const originalText = btn.textContent;
    
    try {
      btn.textContent = '生成中...';
      btn.disabled = true;
      
      const card = preview.querySelector('.share-card');
      const imageUrl = await cardToImage(card);
      
      if (imageUrl) {
        // 生成文件名
        const timestamp = new Date().getTime();
        const filename = `社恐测评-分数卡-${timestamp}.png`;
        
        downloadImage(imageUrl, filename);
        
        // 成功提示
        btn.textContent = '已保存！';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2000);
      } else {
        throw new Error('图片生成失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      btn.textContent = '保存失败，请重试';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 2000);
    }
  });
  
  // 关闭按钮
  const closeModal = () => modal.remove();
  modal.querySelector('.share-card-close-btn').addEventListener('click', closeModal);
  modal.querySelector('#btnCancel').addEventListener('click', closeModal);
  modal.querySelector('.share-card-modal-overlay').addEventListener('click', closeModal);
}

/**
 * 为分享卡片渲染雷达图
 */
function renderRadarForShare(report, cardElement, theme = 'light') {
  const canvas = cardElement.querySelector('#shareRadarChart');
  if (!canvas) {
    console.error('找不到雷达图canvas元素');
    return;
  }
  
      // 动态导入echarts
    import('echarts').then(echarts => {
      const chartInstance = echarts.init(canvas, null, {
      renderer: 'canvas',
      devicePixelRatio: 2,
      width: 260,
      height: 260
    });
    
    // 根据主题设置颜色
    const themeColors = {
      light: {
        gridColor: 'rgba(186,155,146,0.35)',
        lineColor: 'rgba(186,155,146,0.95)',
        areaColor: 'rgba(186,155,146,0.2)',
        labelColor: '#1C1614',
        areaGradient: ['rgba(186,155,146,0.04)', 'rgba(186,155,146,0.07)']
      },
      warm: {
        gridColor: 'rgba(232,155,155,0.3)',
        lineColor: 'rgba(255,77,79,0.9)',
        areaColor: 'rgba(255,140,120,0.3)',
        labelColor: '#2A1A10',
        areaGradient: ['rgba(255,180,140,0.06)', 'rgba(255,200,160,0.1)']
      },
      cool: {
        gridColor: 'rgba(160,180,255,0.25)',
        lineColor: 'rgba(77,119,255,0.85)',
        areaColor: 'rgba(140,170,255,0.25)',
        labelColor: '#0A1A2A',
        areaGradient: ['rgba(140,170,255,0.04)', 'rgba(160,190,255,0.08)']
      },
      dark: {
        gridColor: 'rgba(212,181,172,0.35)',
        lineColor: 'rgba(255,180,150,0.9)',
        areaColor: 'rgba(255,180,150,0.25)',
        labelColor: '#F5E6D3',
        areaGradient: ['rgba(212,181,172,0.05)', 'rgba(212,181,172,0.08)']
      }
    };
    
    const colors = themeColors[theme] || themeColors.light;
    
    // 准备雷达图数据
    const indicatorData = report.dimensions.map(dim => ({
      name: dim.name,
      max: dim.maxScore
    }));
    
    const seriesData = report.dimensions.map(dim => dim.score);
    
    const option = {
      backgroundColor: 'transparent',
      radar: {
        indicator: indicatorData,
        radius: '60%',
        splitNumber: 4,
        name: {
          textStyle: {
            color: colors.labelColor,
            fontSize: 12,
            fontWeight: 400
          }
        },
        splitLine: {
          lineStyle: {
            color: colors.gridColor,
            type: 'solid',
            width: 1.0
          }
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: colors.areaGradient
          }
        },
        axisLine: {
          lineStyle: {
            color: colors.gridColor,
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
            color: colors.areaColor,
            opacity: 0.7
          },
          lineStyle: {
            color: colors.lineColor,
            width: 3,
            shadowColor: colors.lineColor,
            shadowBlur: 6
          },
          itemStyle: {
            color: colors.lineColor,
            borderColor: '#fff',
            borderWidth: 2,
            shadowColor: colors.lineColor,
            shadowBlur: 4
          },
          symbolSize: 6,
          emphasis: {
            lineStyle: {
              width: 3.5
            },
            itemStyle: {
              shadowBlur: 8
            }
          }
        }]
      }]
    };
    
    chartInstance.setOption(option);
    
    // 监听主题变化
    const observer = new MutationObserver(() => {
      const newTheme = cardElement.getAttribute('data-theme') || 'light';
      if (newTheme !== theme) {
        theme = newTheme;
        const newColors = themeColors[theme] || themeColors.light;
        option.radar.name.textStyle.color = newColors.labelColor;
        option.radar.splitLine.lineStyle.color = newColors.gridColor;
        option.radar.splitArea.areaStyle.color = newColors.areaGradient;
        option.radar.axisLine.lineStyle.color = newColors.gridColor;
        option.series[0].data[0].areaStyle.color = newColors.areaColor;
        option.series[0].data[0].lineStyle.color = newColors.lineColor;
        option.series[0].data[0].itemStyle.color = newColors.lineColor;
        chartInstance.setOption(option);
      }
    });
    
    observer.observe(cardElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }).catch(error => {
    console.error('加载echarts失败:', error);
  });
}

/**
 * 移动端分享预览 - 显示卡片图片,带切换背景按钮
 */
async function showMobileSharePreview(report) {
  // 创建加载提示
  const loadingModal = document.createElement('div');
  loadingModal.className = 'mobile-share-loading';
  loadingModal.innerHTML = `
    <div class="loading-overlay"></div>
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <p>正在生成分享图片...</p>
    </div>
  `;
  document.body.appendChild(loadingModal);

  try {
    // 预生成两种背景的图片
    const images = {};

    // 生成白底卡片
    const lightCard = generateScoreCard(report);
    lightCard.setAttribute('data-theme', 'light');
    lightCard.style.position = 'absolute';
    lightCard.style.left = '-9999px';
    document.body.appendChild(lightCard);
    await new Promise(resolve => setTimeout(resolve, 100));
    images.light = await cardToImage(lightCard);
    document.body.removeChild(lightCard);

    // 生成黑底卡片
    const darkCard = generateScoreCard(report);
    darkCard.setAttribute('data-theme', 'dark');
    darkCard.style.position = 'absolute';
    darkCard.style.left = '-9999px';
    document.body.appendChild(darkCard);
    await new Promise(resolve => setTimeout(resolve, 100));
    images.dark = await cardToImage(darkCard);
    document.body.removeChild(darkCard);

    // 移除加载提示
    loadingModal.remove();

    // 显示图片预览,带切换按钮
    showMobileImageWithThemeSwitch(images);

  } catch (error) {
    console.error('生成图片失败:', error);
    loadingModal.remove();
    alert('生成图片失败,请重试');
  }
}

/**
 * 显示移动端图片预览,带切换背景按钮
 */
function showMobileImageWithThemeSwitch(images) {
  let currentTheme = 'light'; // 默认显示白底

  const previewModal = document.createElement('div');
  previewModal.className = 'mobile-image-preview-modal';

  previewModal.innerHTML = `
    <div class="mobile-preview-overlay"></div>
    <div class="mobile-preview-content">
      <div class="mobile-preview-header">
        <h3>长按图片保存</h3>
        <button class="mobile-preview-close">×</button>
      </div>

      <div class="mobile-theme-switch">
        <button class="theme-switch-btn active" data-theme="light">
          <span class="theme-icon">☀️</span>
          <span class="theme-name">白底</span>
        </button>
        <button class="theme-switch-btn" data-theme="dark">
          <span class="theme-icon">🌙</span>
          <span class="theme-name">黑底</span>
        </button>
      </div>

      <div class="mobile-preview-body">
        <img src="${images.light}" alt="分享卡片" class="mobile-preview-image" id="mobilePreviewImage" />
      </div>

      <div class="mobile-preview-footer">
        <p class="preview-hint">💡 长按图片即可保存到相册</p>
      </div>
    </div>
  `;

  document.body.appendChild(previewModal);

  // 切换背景按钮
  const switchBtns = previewModal.querySelectorAll('.theme-switch-btn');
  const previewImage = previewModal.querySelector('#mobilePreviewImage');

  switchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      if (theme === currentTheme) return;

      currentTheme = theme;

      // 更新按钮状态
      switchBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 切换图片,带淡入淡出效果
      previewImage.style.opacity = '0';
      setTimeout(() => {
        previewImage.src = images[theme];
        previewImage.style.opacity = '1';
      }, 200);
    });
  });

  // 关闭按钮
  const closePreview = () => previewModal.remove();
  previewModal.querySelector('.mobile-preview-close').addEventListener('click', closePreview);
  previewModal.querySelector('.mobile-preview-overlay').addEventListener('click', closePreview);

  // 添加动画
  setTimeout(() => {
    previewModal.classList.add('active');
  }, 10);
}
