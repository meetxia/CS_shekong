# 激活状态调试指南

## 问题:导航栏没有显示激活状态

### 在浏览器控制台运行以下命令进行调试:

```javascript
// 1. 检查localStorage中的激活信息
console.log('激活状态:', localStorage.getItem('test_activated'))
console.log('激活码:', localStorage.getItem('activation_code'))
console.log('激活时间:', localStorage.getItem('activation_time'))
console.log('激活用量:', JSON.parse(localStorage.getItem('activation_usage')))

// 2. 手动调用后端API测试
const code = localStorage.getItem('activation_code')
const deviceId = localStorage.getItem('device_id')

if (code && deviceId) {
  fetch('http://localhost:3001/api/activation/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, deviceId })
  })
  .then(r => r.json())
  .then(data => {
    console.log('后端返回的状态:', data)
  })
  .catch(err => console.error('API调用失败:', err))
}

// 3. 手动触发刷新事件
window.dispatchEvent(new Event('activation-updated'))
console.log('已触发activation-updated事件')

// 4. 检查导航栏组件状态 (在Vue Devtools中查看)
```

## 常见问题排查:

### 1. localStorage为空
- 需要先激活一次激活码
- 访问 http://localhost:3000/activation 输入 DEMO-2024-0001

### 2. 后端API返回错误
- 检查后端服务是否运行: http://localhost:3001
- 检查deviceId是否匹配数据库

### 3. 事件没有触发
- 检查AppHeader组件是否正确监听了事件
- 在mounted钩子中检查loadActivationStatus是否被调用

## 手动设置测试数据:

```javascript
// 设置激活状态
localStorage.setItem('test_activated', 'true')
localStorage.setItem('activation_code', 'DEMO-2024-0001')
localStorage.setItem('activation_time', Date.now())
localStorage.setItem('activation_usage', JSON.stringify({
  code: 'DEMO-2024-0001',
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  dailyLimit: 3,
  usageByDate: {},
  recordId: 2,
  daysLeft: 7,
  remainingToday: 3,
  syncedDate: new Date().toISOString().split('T')[0]
}))

// 触发刷新
window.dispatchEvent(new Event('activation-updated'))
location.reload()
```

