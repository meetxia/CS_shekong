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
    top: 10%;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 14px 28px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 9999;
    background: ${colors[type] || colors.info};
    color: #ffffff;
    animation: toastIn 0.25s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    will-change: transform, opacity;
    pointer-events: none;
  `
  
  document.body.appendChild(toast)
  
  setTimeout(() => {
    // 使用与进入相对的动画，保持 transform 中的 -50% 水平位移
    toast.style.animation = 'toastOut 0.25s ease forwards'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 260)
  }, duration)
}

