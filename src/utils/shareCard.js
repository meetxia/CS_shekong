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
      <div class="total-score">${report.totalScore}<span class="unit">/150分</span></div>
      <div class="percentile">击败全国 ${report.percentile}% 的测试者</div>
      
      <div class="score-scale">
        <div class="scale-bar">
          <div class="scale-marker" style="left: ${(report.totalScore - 30) / 120 * 100}%"></div>
        </div>
        <div class="scale-labels">
          <span>30<br>轻度</span>
          <span>60<br>中度</span>
          <span>90<br>重度</span>
          <span>120<br>极重</span>
        </div>
      </div>
    </div>
    
    <div class="card-footer">
      <p class="hint">长按保存图片 · 查看完整报告</p>
      <div class="qrcode-hint">
        <span>扫码测测你的社恐程度 →</span>
        <div class="qrcode-placeholder">[二维码]</div>
      </div>
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
    '轻度社恐': '<span class="iconify" data-icon="mdi:sprout" data-width="24" data-height="24"></span>'
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
        <canvas id="shareRadarChart" width="300" height="300"></canvas>
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
    '轻度社恐': '你已经很好了，只是需要多一点点勇气。'
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
    '社交后反刍': '事后反复回想让你陷入自责循环',
    '生理反应强度': '身体的紧张反应影响了你的表现',
    '社交自我效能': '不相信自己能处理好社交是核心问题'
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
    '社交后反刍': '设定"回顾时间"，限制反刍时长',
    '生理反应强度': '练习深呼吸和正念冥想',
    '社交自我效能': '记录每次成功的社交经历'
  };
  
  return tips[dimensionName] || '查看报告获取详细建议';
}

/**
 * 将卡片转换为图片（用于保存和分享）
 * 使用html2canvas库
 */
export async function cardToImage(cardElement) {
  // 需要引入html2canvas库
  // import html2canvas from 'html2canvas';
  
  try {
    const canvas = await html2canvas(cardElement, {
      backgroundColor: '#FFFFFF',
      scale: 2, // 2倍清晰度
      useCORS: true,
      logging: false
    });
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('生成图片失败:', error);
    return null;
  }
}

/**
 * 下载图片
 */
export function downloadImage(dataUrl, filename = 'social-anxiety-result.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * 显示分享卡片弹窗
 */
export function showShareModal(report) {
  const modal = document.createElement('div');
  modal.className = 'share-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择要分享的卡片</h3>
        <button class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <div class="card-tabs">
          <button class="tab-btn active" data-card="type">类型卡</button>
          <button class="tab-btn" data-card="score">总分卡</button>
          <button class="tab-btn" data-card="radar">雷达图</button>
        </div>
        
        <div class="card-preview" id="cardPreview">
          <!-- 卡片预览 -->
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" id="btnCancel">取消</button>
        <button class="btn-primary" id="btnDownload">保存图片</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 初始化显示类型卡
  const preview = modal.querySelector('#cardPreview');
  const typeCard = generateTypeCard(report);
  preview.appendChild(typeCard);
  
  // 切换卡片类型
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const cardType = e.target.dataset.card;
      preview.innerHTML = '';
      const card = generateShareCard(report, cardType);
      preview.appendChild(card);
      
      // 如果是雷达图，需要重新渲染图表
      if (cardType === 'radar') {
        renderRadarForShare(report);
      }
    });
  });
  
  // 下载按钮
  modal.querySelector('#btnDownload').addEventListener('click', async () => {
    const card = preview.querySelector('.share-card');
    const imageUrl = await cardToImage(card);
    if (imageUrl) {
      downloadImage(imageUrl);
    }
  });
  
  // 关闭按钮
  const closeModal = () => modal.remove();
  modal.querySelector('.close-btn').addEventListener('click', closeModal);
  modal.querySelector('#btnCancel').addEventListener('click', closeModal);
  modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

/**
 * 为分享卡片渲染雷达图（简化版）
 */
function renderRadarForShare(report) {
  // 这里需要使用ECharts渲染
  // 实现略，参考ReportPage中的雷达图配置
  console.log('渲染分享雷达图', report);
}

