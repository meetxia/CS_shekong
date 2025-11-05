-- ============================================
-- 更新 ai_generation_logs 表的列注释
-- ============================================
USE shekong_ai;

ALTER TABLE ai_generation_logs 
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '日志ID',
  MODIFY COLUMN user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
  MODIFY COLUMN total_score INT NOT NULL COMMENT '总分',
  MODIFY COLUMN level_name VARCHAR(100) COMMENT '等级名称',
  MODIFY COLUMN type_name VARCHAR(100) COMMENT '类型名称',
  MODIFY COLUMN english_name VARCHAR(200) COMMENT '英文名称',
  MODIFY COLUMN features TEXT COMMENT '核心特征',
  MODIFY COLUMN root_causes TEXT COMMENT '心理根源',
  MODIFY COLUMN positive_reframe TEXT COMMENT '正向重构',
  MODIFY COLUMN basic_info TEXT COMMENT '基础信息',
  MODIFY COLUMN success BOOLEAN DEFAULT TRUE COMMENT '是否成功',
  MODIFY COLUMN error_message TEXT COMMENT '错误信息',
  MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';

-- ============================================
-- 更新 ai_stats 表的列注释
-- ============================================
ALTER TABLE ai_stats 
  MODIFY COLUMN id INT AUTO_INCREMENT COMMENT '统计ID',
  MODIFY COLUMN date DATE NOT NULL UNIQUE COMMENT '统计日期',
  MODIFY COLUMN total_calls INT DEFAULT 0 COMMENT '总调用次数',
  MODIFY COLUMN success_calls INT DEFAULT 0 COMMENT '成功次数',
  MODIFY COLUMN failed_calls INT DEFAULT 0 COMMENT '失败次数',
  MODIFY COLUMN avg_response_time FLOAT DEFAULT 0 COMMENT '平均响应时间(ms)',
  MODIFY COLUMN total_tokens INT DEFAULT 0 COMMENT '总Token消耗';

SELECT '列注释更新完成！' AS message;
