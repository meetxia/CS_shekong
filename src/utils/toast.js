let currentToast = null

export function showToast(message, type = 'info', duration = 2000) {
  // 移除之前的toast
  if (currentToast && document.body.contains(currentToast)) {
    document.body.removeChild(currentToast)
  }
  currentToast = null
  
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
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    background: ${colors[type] || colors.info};
    color: #ffffff;
    animation: toastIn 0.25s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    will-change: transform, opacity;
    pointer-events: none;
    white-space: nowrap;
    max-width: 90vw;
    overflow: hidden;
    text-overflow: ellipsis;
  `
  
  document.body.appendChild(toast)
  currentToast = toast
  
  setTimeout(() => {
    if (currentToast === toast) {
      // 使用与进入相对的动画，保持 transform 中的 -50% 水平位移
      toast.style.animation = 'toastOut 0.25s ease forwards'
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast)
        }
        if (currentToast === toast) {
          currentToast = null
        }
      }, 260)
    }
  }, duration)
}

// 快捷方法
export function showSuccess(message, duration = 2000) {
  showToast(message, 'success', duration)
}

export function showError(message, duration = 2000) {
  showToast(message, 'error', duration)
}

export function showWarning(message, duration = 2000) {
  showToast(message, 'warning', duration)
}

export function hideToast() {
  if (currentToast && document.body.contains(currentToast)) {
    document.body.removeChild(currentToast)
    currentToast = null
  }
}

