# 社恐程度专业测评 MVP

基于SAS社交焦虑量表改良的专业心理测评H5应用

## 🤖 **AI智能分析**（最新功能！）

✨ 集成 **Claude 4.5 Sonnet** AI，提供深度个性化的社恐类型分析！

- 🎯 **真正个性化**：根据答题情况生成独一无二的分析
- ⚡ **秒开报告**：智能预生成技术，提交后<1秒查看
- 🛡️ **高可用**：AI + 本地增强规则双重保障
- 💎 **专业深度**：心理学理论支撑，温暖且有力量

📖 [查看AI功能详细说明](docs/AI功能说明.md) | [查看生成示例](docs/AI生成示例.md) | [测试指引](docs/测试AI功能.md)

## 📋 项目特点

- ✨ **极简MVP设计**：3个核心页面，流程清晰
- 🎨 **高级国风配色**：4套精美配色方案（2浅+2深）
- 📊 **专业测评体系**：35题8维度深度分析
- 🤖 **AI个性化分析**：Claude 4.5驱动的深度分析
- 🔒 **激活码机制**：验证购买凭证
- 💾 **本地数据存储**：LocalStorage自动保存进度
- 📱 **响应式设计**：完美适配移动端和桌面端

## 🚀 快速开始

### 环境要求

- Node.js 16+ 
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
cd backend ; npm run dev
npm run dev
```

浏览器会自动打开 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
CS_shekong/
├── docs/                          # 文档目录
│   └── 04-功能开发报告/
│       └── 社恐最新极简MVP产品原型设计文档.md
├── src/
│   ├── views/                     # 页面组件
│   │   ├── ActivationPage.vue    # P1: 激活页
│   │   ├── AssessmentPage.vue    # P2: 测评页
│   │   └── ReportPage.vue        # P3: 报告页
│   ├── composables/               # 组合式函数
│   │   └── useColorScheme.js     # 配色系统
│   ├── utils/                     # 工具函数
│   │   ├── activation.js         # 激活码验证
│   │   ├── scoring.js            # 计分和报告生成
│   │   └── toast.js              # 提示组件
│   ├── data/                      # 数据
│   │   └── questions.js          # 30道测评题目
│   ├── styles/                    # 样式
│   │   ├── index.css             # 全局样式
│   │   └── themes.css            # 配色主题
│   ├── router/                    # 路由
│   │   └── index.js
│   ├── App.vue                    # 根组件
│   └── main.js                    # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎨 配色方案

项目提供4套国风配色方案，用户可在报告页自由切换：

1. **雪尽霜余（浅色）** - 温润雅致的灰茶红系
2. **雪尽霜余（深色）** - 沉稳内敛的暗夜雅韵
3. **芩江初雪（浅色）** - 清新淡雅的翡翠绿系
4. **芩江初雪（深色）** - 静谧深邃的幽林夜色

## 📱 功能页面

### P1. 激活页
- 输入激活码（格式：XXXX-XXXX-XXXX）
- 自动格式化和验证
- 验证成功后跳转测评页

**测试激活码**（开发阶段任何格式正确的激活码都可通过）：
- `TEST-2024-ABCD`
- `DEMO-1234-5678`
- `MVPX-XXXX-YYYY`

### P2. 测评页
- 30道专业测评题目
- 6个心理维度：
  - 社交场景恐惧
  - 回避行为程度
  - 预期焦虑强度
  - 社交后反刍
  - 生理反应强度
  - 社交自我效能
- 实时进度显示
- 自动保存答题进度
- 支持返回修改答案

### P3. 报告页
- 总分和等级展示
- 六维度雷达图分析
- 社恐类型诊断（预演型/回避型/表演型/综合型）
- 心理根源分析
- 个性化改善建议
- 4周渐进计划
- 配色方案切换

## 🛠 技术栈

- **框架**: Vue 3
- **构建工具**: Vite 5
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表**: ECharts 5
- **日期处理**: Day.js
- **样式**: 原生CSS + CSS变量

## 💡 核心功能

### 激活码验证
```javascript
// 格式：XXXX-XXXX-XXXX（数字+大写字母）
// 自动格式化输入
// 实时验证格式
```

### 答题系统
- LocalStorage自动保存
- 支持断点续答
- 防止未答题提交

### 计分系统
- 每题1-5分
- 总分30-150分
- 等级：轻度(≤60) / 中度(61-90) / 重度(91-120) / 极重度(>120)

### 类型判断
基于6个维度的分数组合，智能判断社恐类型：
- **预演型**：预期焦虑高 + 社交反刍高
- **回避型**：回避行为高 + 社交场景恐惧高
- **表演型**：生理反应高 + 自我效能低
- **综合型**：各维度均衡分布

## 📊 数据流程

```
用户输入激活码 
  → 验证通过 
    → 开始测评（30题）
      → 实时保存答案
        → 提交测评
          → 计算分数
            → 判断类型
              → 生成报告
                → 展示结果
```

## 🔐 数据安全

- 所有数据存储在本地LocalStorage
- 不上传任何个人信息
- 仅在用户设备上处理
- 可随时清除浏览器数据

## 📝 开发说明

### 激活码验证逻辑

当前为开发阶段，任何格式正确的激活码（XXXX-XXXX-XXXX）都可通过验证。

生产环境需要修改 `src/utils/activation.js` 中的 `verifyActivationCode` 函数，对接真实的后端API：

```javascript
export async function verifyActivationCode(code) {
  const response = await fetch('/api/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  const data = await response.json()
  return data.valid
}
```

### 添加新的社恐类型

在 `src/utils/scoring.js` 的 `getType` 函数中添加新的判断逻辑：

```javascript
if (dimensions.某维度 >= 阈值 && dimensions.另一维度 >= 阈值) {
  return {
    id: 'new-type',
    name: '新类型名称',
    englishName: 'New Type',
    features: [...],
    rootCauses: [...],
    positiveReframe: '...'
  }
}
```

### 自定义配色方案

在 `src/styles/themes.css` 中添加新的配色类：

```css
.scheme-new {
  --primary: #颜色值;
  --bg-main: #颜色值;
  /* ... 其他颜色变量 */
}
```

## 🎯 路线图

- [x] 基础框架搭建
- [x] 激活页实现
- [x] 测评页实现
- [x] 报告页实现
- [x] 配色系统
- [x] 30道题目和文案
- [ ] 后端API对接
- [ ] 激活码管理系统
- [ ] 数据分析后台
- [ ] 分享功能（V2.0）
- [ ] 历史记录（V2.0）

## 📄 许可证

MIT License

## 👨‍💻 贡献

欢迎提交Issue和Pull Request

---

**开发日期**: 2025年11月3日  
**版本**: V1.0 极简MVP版  
**设计文档**: [查看完整设计文档](./docs/04-功能开发报告/社恐最新极简MVP产品原型设计文档.md)

