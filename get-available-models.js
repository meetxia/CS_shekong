/**
 * 查询 API 支持的模型列表
 */

const AI_CONFIG = {
  apiKey: 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657',
  apiUrl: 'https://dpapi.cn/v1/models'
};

async function getAvailableModels() {
  console.log('🔍 正在查询可用模型列表...\n');
  console.log(`API: ${AI_CONFIG.apiUrl}\n`);
  
  try {
    const response = await fetch(AI_CONFIG.apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AI_CONFIG.apiKey}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API返回错误:');
      console.error(`状态码: ${response.status}`);
      console.error(`错误信息: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('✅ 查询成功！\n');
    console.log('='.repeat(80));
    console.log('📊 可用模型列表:\n');
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`共 ${data.data.length} 个模型:\n`);
      
      data.data.forEach((model, index) => {
        console.log(`${index + 1}. ${model.id}`);
        if (model.owned_by) {
          console.log(`   提供商: ${model.owned_by}`);
        }
        if (model.created) {
          const date = new Date(model.created * 1000);
          console.log(`   创建时间: ${date.toLocaleString('zh-CN')}`);
        }
        console.log('');
      });
    } else {
      console.log('原始响应:');
      console.log(JSON.stringify(data, null, 2));
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ 查询失败！');
    console.error('错误类型:', error.name);
    console.error('错误信息:', error.message);
  }
}

getAvailableModels();

