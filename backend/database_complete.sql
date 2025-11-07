-- ============================================
-- 社恐测评系统 - 完整数据库结构
-- 创建日期: 2025-11-06
-- 说明: 包含所有必需的表,已优化字段
-- ============================================

-- 使用数据库
USE shekong_ai;

-- ============================================
-- 1. activation_codes - 激活码表
-- ============================================
CREATE TABLE IF NOT EXISTS activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '激活码ID',
    code VARCHAR(14) UNIQUE NOT NULL COMMENT '激活码格式: XXXX-XXXX-XXXX',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active-有效, expired-已过期, revoked-已撤销',
    max_uses INT DEFAULT 21 COMMENT '最大可激活设备数',
    current_uses INT DEFAULT 0 COMMENT '当前已激活设备数',
    daily_limit INT DEFAULT 3 COMMENT '每日使用次数限制(所有设备共享)',
    validity_days INT DEFAULT 7 COMMENT '激活后有效天数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    notes TEXT COMMENT '备注信息',
    
    INDEX idx_code (code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表';

-- ============================================
-- 2. activation_records - 激活记录表
-- ============================================
CREATE TABLE IF NOT EXISTS activation_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    code_id INT NOT NULL COMMENT '激活码ID',
    activation_code VARCHAR(14) NOT NULL COMMENT '激活码',
    user_device_id VARCHAR(255) NOT NULL COMMENT '设备标识',
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '激活时间(倒计时起点)',
    expires_at DATETIME NOT NULL COMMENT '过期时间(倒计时终点)',
    usage_by_date JSON COMMENT '按日期统计使用次数 {"2025-11-06": 2}',
    
    INDEX idx_code_id (code_id),
    INDEX idx_activation_code (activation_code),
    INDEX idx_device (user_device_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (code_id) REFERENCES activation_codes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活记录表';

-- ============================================
-- 3. admin_users - 管理员账号表
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    nickname VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active-正常, disabled-禁用',
    last_login_at DATETIME DEFAULT NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) DEFAULT NULL COMMENT '最后登录IP',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员账号表';

-- ============================================
-- 4. admin_sessions - 管理员会话表
-- ============================================
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
    admin_id INT NOT NULL COMMENT '管理员ID',
    token VARCHAR(64) UNIQUE NOT NULL COMMENT '会话令牌',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    user_agent TEXT DEFAULT NULL COMMENT '用户代理',
    expires_at DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_token (token),
    INDEX idx_admin_id (admin_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员会话表';

-- ============================================
-- 5. ai_config - AI配置表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_config (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
    provider VARCHAR(50) NOT NULL COMMENT 'AI供应商: claude, openai, deepseek等',
    api_key VARCHAR(255) NOT NULL COMMENT 'API密钥',
    api_url VARCHAR(255) NOT NULL COMMENT 'API地址',
    model VARCHAR(100) NOT NULL COMMENT '模型名称',
    is_active BOOLEAN DEFAULT FALSE COMMENT '是否激活',
    max_tokens INT DEFAULT 2000 COMMENT '最大token数',
    temperature DECIMAL(3,2) DEFAULT 0.70 COMMENT '温度参数',
    timeout INT DEFAULT 30000 COMMENT '超时时间(ms)',
    notes TEXT COMMENT '备注',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    INDEX idx_provider (provider),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI配置表';

-- ============================================
-- 6. ai_generation_logs - AI生成日志表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id VARCHAR(255) DEFAULT NULL COMMENT '用户ID（可为空，支持匿名用户）',
    total_score INT NOT NULL COMMENT '总分',
    level_name VARCHAR(100) COMMENT '等级名称',
    type_name VARCHAR(100) COMMENT '类型名称',
    english_name VARCHAR(200) COMMENT '英文名称',
    features TEXT COMMENT '核心特征',
    root_causes TEXT COMMENT '心理根源',
    positive_reframe TEXT COMMENT '正向重构',
    basic_info TEXT COMMENT '基础信息',
    success BOOLEAN DEFAULT TRUE COMMENT '是否成功',
    error_message TEXT COMMENT '错误信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI生成日志表';

-- ============================================
-- 7. ai_stats - AI统计表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_stats (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    date DATE NOT NULL UNIQUE COMMENT '日期',
    total_calls INT DEFAULT 0 COMMENT '总调用次数',
    success_calls INT DEFAULT 0 COMMENT '成功次数',
    failed_calls INT DEFAULT 0 COMMENT '失败次数',
    avg_response_time FLOAT DEFAULT 0 COMMENT '平均响应时间(ms)',
    total_tokens INT DEFAULT 0 COMMENT '总token消耗',
    
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI统计表';

-- ============================================
-- 8. reports - 测评报告表
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '报告ID',
    user_id VARCHAR(255) NOT NULL COMMENT '用户设备ID',
    activation_code VARCHAR(14) DEFAULT NULL COMMENT '使用的激活码',
    total_score INT NOT NULL COMMENT '总分',
    level_name VARCHAR(255) NOT NULL COMMENT '等级名称',
    type_name VARCHAR(255) NOT NULL COMMENT '类型名称',
    ai_generated BOOLEAN DEFAULT FALSE COMMENT '是否AI生成',
    report_data JSON NOT NULL COMMENT '完整报告数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_activation_code (activation_code),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='测评报告表';

-- ============================================
-- 插入默认数据
-- ============================================

-- 插入默认管理员账号 (密码: admin123)
INSERT INTO admin_users (username, password_hash, nickname, status)
VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'active')
ON DUPLICATE KEY UPDATE username=username;

-- 插入测试激活码
INSERT INTO activation_codes (code, status, max_uses, daily_limit, validity_days, notes)
VALUES 
('TEST-2024-0001', 'active', 21, 3, 7, '测试激活码 - 7天有效'),
('DEMO-2024-0002', 'active', 21, 3, 7, '演示激活码 - 7天有效'),
('VIP1-2024-0003', 'active', 100, 10, 30, 'VIP激活码 - 30天有效')
ON DUPLICATE KEY UPDATE code=code;

-- 插入默认AI配置
INSERT INTO ai_config (provider, api_key, api_url, model, is_active, max_tokens, temperature, timeout, notes)
VALUES 
('deepseek', 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657', 'https://api.siliconflow.cn/v1/chat/completions', 'deepseek-ai/DeepSeek-V3', TRUE, 2000, 0.70, 30000, '默认AI配置'),
('claude', 'sk-neZiqN36Qh4HbF7WB3633aC322844cB09c5474D64d5fA657', 'https://dpapi.cn/v1/chat/completions', 'claude-4.5-sonnet', FALSE, 2000, 0.70, 30000, 'Claude 4.5 Sonnet')
ON DUPLICATE KEY UPDATE provider=provider;

-- ============================================
-- 完成提示
-- ============================================
SELECT '✅ 数据库结构创建完成！' AS message;
SELECT CONCAT('管理员账号: admin, 密码: admin123') AS admin_info;
SELECT CONCAT('已创建 ', COUNT(*), ' 个测试激活码') AS activation_info FROM activation_codes;

