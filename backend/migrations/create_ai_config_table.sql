-- AI配置表
CREATE TABLE IF NOT EXISTS ai_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(50) NOT NULL COMMENT 'AI供应商: claude, deepseek, openai等',
  api_key VARCHAR(255) NOT NULL COMMENT 'API密钥',
  api_url VARCHAR(255) NOT NULL COMMENT 'API地址',
  model VARCHAR(100) NOT NULL COMMENT '模型名称',
  is_active TINYINT(1) DEFAULT 0 COMMENT '是否启用: 0-未启用, 1-启用',
  max_tokens INT DEFAULT 2000 COMMENT '最大token数',
  temperature DECIMAL(3,2) DEFAULT 0.70 COMMENT '温度参数',
  timeout INT DEFAULT 30000 COMMENT '超时时间(ms)',
  notes TEXT COMMENT '备注说明',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_provider (provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI供应商配置表';

-- 插入默认配置
INSERT INTO ai_config (provider, api_key, api_url, model, is_active, notes) VALUES
('claude', 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657', 'https://dpapi.cn/v1/chat/completions', 'claude-4.5-sonnet', 1, 'Claude API (通过dpapi.cn中转)'),
('deepseek', 'sk-uhdblleyrmgibqawryriyhivpgiyxcdxgjeabewylmjswbkx', 'https://api.siliconflow.cn/v1/chat/completions', 'deepseek-ai/DeepSeek-V3', 0, 'DeepSeek V3 (通过SiliconFlow)')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

