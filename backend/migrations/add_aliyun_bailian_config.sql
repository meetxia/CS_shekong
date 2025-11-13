-- 添加阿里云百炼AI配置
INSERT INTO ai_config (provider, api_key, api_url, model, is_active, max_tokens, temperature, timeout, notes) VALUES
('aliyun_bailian', 'sk-bb800a93f0fa4ebbb306a4c87f2de724', 'https://dashscope.aliyuncs.com/compatible-mode/v1', 'deepseek-v3.1', 0, 2000, 0.70, 30000, '阿里云百炼 - DeepSeek V3.1 深度思考模型')
ON DUPLICATE KEY UPDATE 
  api_key = VALUES(api_key),
  api_url = VALUES(api_url),
  model = VALUES(model),
  max_tokens = VALUES(max_tokens),
  temperature = VALUES(temperature),
  timeout = VALUES(timeout),
  notes = VALUES(notes),
  updated_at = CURRENT_TIMESTAMP;
