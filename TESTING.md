# 🧪 快速测试指南

## 一键运行测试

```bash
# 运行所有测试
npm test

# 运行测试（单次，不监听）
npm test -- --run

# 运行测试并查看详细输出
npm test -- --run --reporter=verbose
```

## 📊 当前测试状态

```
✅ 测试文件: 11/11 通过
✅ 测试用例: 103/103 通过
✅ 通过率: 100%
⏱️ 执行时间: ~1.4秒
```

## 🎯 测试覆盖范围

### ✅ 已测试功能
- **激活码系统** (15个测试)
  - 格式化、验证、生成
  
- **计分系统** (60个测试)
  - 分数计算、等级判断、类型识别
  - 维度分析、报告生成
  
- **UI组件** (7个测试)
  - Toast提示系统
  
- **集成测试** (7个测试)
  - 完整业务流程
  
- **后端服务** (6个测试)
  - 激活码服务、服务器配置

### ⏳ 待测试功能
- Vue组件测试 (占位已完成)
- API路由测试
- E2E用户流程测试

## 📁 测试文件位置

```
项目根目录/
├── src/utils/__tests__/          # 前端单元测试
│   ├── activation.test.js        # 激活码测试
│   ├── scoring.test.js           # 计分基础测试
│   ├── scoring.enhanced.test.js  # 计分增强测试
│   ├── aiService.test.js         # AI服务测试
│   └── toast.test.js             # Toast测试
├── backend/__tests__/             # 后端单元测试
│   ├── activationService.test.js # 激活码服务测试
│   └── server.test.js            # 服务器测试
├── tests/
│   ├── integration/               # 集成测试
│   ├── components/                # 组件测试
│   ├── e2e/                       # E2E测试
│   ├── mockData.js                # 模拟数据
│   └── setup.js                   # 测试配置
└── vitest.config.js               # Vitest配置
```

## 🔧 常用命令

### 运行测试
```bash
# 所有测试
npm test

# 前端测试
npm test -- src/

# 后端测试
npm test -- backend/

# 特定文件
npm test -- src/utils/__tests__/scoring.test.js
```

### 调试测试
```bash
# 详细输出
npm test -- --reporter=verbose

# UI界面
npm run test:ui

# 只运行失败的测试
npm test -- --run --bail
```

### 覆盖率报告
```bash
# 生成覆盖率
npm run test:coverage

# 查看HTML报告
# 报告会生成在 coverage/ 目录
```

## 🎯 测试编写规范

### 基本结构
```javascript
describe('功能模块', () => {
  describe('子功能', () => {
    it('应该做某件事', () => {
      // Arrange: 准备
      const input = 'test'
      
      // Act: 执行
      const result = someFunction(input)
      
      // Assert: 验证
      expect(result).toBe('expected')
    })
  })
})
```

### 使用Mock数据
```javascript
import { mockAnswers } from '../tests/mockData.js'

it('测试示例', () => {
  const result = calculate(mockAnswers.mediumScoreAnswers)
  expect(result).toBeDefined()
})
```

## 📈 测试结果解读

### 成功输出
```
✓ 测试名称 (执行时间ms)
```

### 失败输出
```
✗ 测试名称
  Expected: xxx
  Received: yyy
```

## 🔍 问题排查

### 测试失败？
1. 查看错误信息
2. 检查测试代码
3. 验证被测试代码
4. 查看 `tests/README.md`

### 测试很慢？
1. 使用 `--run` 禁用监听
2. 减少并发测试
3. 优化测试代码

### 环境问题？
1. 检查 Node.js 版本 (需要16+)
2. 重新安装依赖: `npm install`
3. 清除缓存: `npm cache clean --force`

## 📚 相关文档

- 📖 [详细测试文档](./tests/README.md)
- 📋 [测试计划](./tests/TEST_PLAN.md)
- 📊 [测试报告](./TEST_REPORT.md)
- ⚙️ [Vitest配置](./vitest.config.js)

## ✨ 测试最佳实践

1. ✅ **每次提交前运行测试**
   ```bash
   npm test -- --run
   ```

2. ✅ **编写新功能时同步编写测试**

3. ✅ **保持测试简单明确**

4. ✅ **使用描述性的测试名称**

5. ✅ **不要跳过测试（skip）**

6. ✅ **定期更新Mock数据**

## 🎉 成功案例

当前项目测试状态：
- ✅ **103个测试全部通过**
- ✅ **100%通过率**
- ✅ **核心功能全覆盖**
- ✅ **文档完善**

---

**快速开始**: 直接运行 `npm test` 即可！

*最后更新: 2025-11-10*
