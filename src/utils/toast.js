export function showToast(message, duration = 2000, type = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  
  // 根据类型设置样式
  const colors = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)'
  }
  
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    background: ${colors[type] || colors.info};
    color: #fff;
    animation: slideDown 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  `
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, duration)
}

