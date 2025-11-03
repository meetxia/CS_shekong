export function showToast(message, duration = 2000, type = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  
  // 根据类型设置样式 - 使用更深的颜色以确保白色文字有足够对比度
  const colors = {
    success: '#5A7A57',
    warning: '#A87844',
    error: '#A85550',
    info: '#5C6C7A'
  }
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    background: ${colors[type] || colors.info};
    color: #ffffff;
    animation: slideDown 0.3s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  `
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, duration)
}

