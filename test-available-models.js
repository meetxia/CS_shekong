/**
 * 测试 API 支持的模型列表
 */

const AI_CONFIG = {
  apiKey: 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657',
  apiUrl: 'https://dpapi.cn/v1/chat/completions',
  timeout: 10000
};

// 常见的模型列表
const MODELS_TO_TEST = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4o',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'claude-3.5-sonnet',
  'claude-2.1',
  'claude-2',
  'deepseek-chat',
  'qwen-max',
  'qwen-plus',
  'glm-4'
];

async function testModel(modelName) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);
    
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: '你好'
          }
        ],
        max_tokens: 10
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (response.ok) {
      return { model: modelName, status: '✅ 可用', error: null };
    } else {
      const errorMsg = data.error?.message || '未知错误';
      if (errorMsg.includes('无可用渠道')) {
        return { model: modelName, status: '❌ 不可用', error: '无可用渠道' };
      } else if (errorMsg.includes('不存在') || errorMsg.includes('invalid')) {
        return { model: modelName, status: '❌ 模型不存在', error: errorMsg };
      } else {
        return { model: modelName, status: '⚠️ 错误', error: errorMsg.substring(0, 50) };
      }
    }
  } catch (error) {
    return { model: modelName, status: '❌ 请求失败', error: error.message };
  }
}

async function testAllModels() {
  console.log('🔍 开始测试可用模型...\n');
  console.log(`API: ${AI_CONFIG.apiUrl}\n`);
  
  const results = [];
  
  for (const model of MODELS_TO_TEST) {
    process.stdout.write(`测试 ${model}... `);
    const result = await testModel(model);
    results.push(result);
    console.log(result.status);
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 测试结果汇总\n');
  
  const available = results.filter(r => r.status === '✅ 可用');
  const unavailable = results.filter(r => r.status !== '✅ 可用');
  
  if (available.length > 0) {
    console.log('✅ 可用模型:');
    available.forEach(r => {
      console.log(`   - ${r.model}`);
    });
    console.log('');
  }
  
  if (unavailable.length > 0) {
    console.log('❌ 不可用模型:');
    unavailable.forEach(r => {
      console.log(`   - ${r.model}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n总计: ${available.length}/${MODELS_TO_TEST.length} 个模型可用\n`);
}

testAllModels();

