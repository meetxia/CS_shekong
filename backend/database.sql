-- ============================================
-- 社恐测评系统 - MySQL数据库初始化脚本
-- 创建日期: 2025-11-05
-- ============================================

CREATE DATABASE IF NOT EXISTS shekong_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE shekong_ai;

-- ============================================
-- 1. reports - 测评报告表
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
-- 2. activation_codes - 激活码表
-- ============================================
CREATE TABLE IF NOT EXISTS activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '激活码ID',
    code VARCHAR(14) UNIQUE NOT NULL COMMENT '激活码格式: XXXX-XXXX-XXXX',
    status VARCHAR(20) DEFAULT 'active' COMMENT '状态: active-有效, used-已用完, expired-已过期, revoked-已撤销',
    max_uses INT DEFAULT 1 COMMENT '最大使用次数',
    current_uses INT DEFAULT 0 COMMENT '当前使用次数',
    expires_at DATETIME DEFAULT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    daily_limit INT DEFAULT 3 COMMENT '每天使用次数限制',
    validity_days INT DEFAULT 7 COMMENT '有效期天数',
    
    notes TEXT COMMENT '备注信息',
    created_by VARCHAR(50) DEFAULT 'admin' COMMENT '创建者',
    
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表';

-- ============================================
-- 3. activation_records - 激活记录表
-- ============================================
CREATE TABLE IF NOT EXISTS activation_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    code_id INT NOT NULL COMMENT '激活码ID',
    activation_code VARCHAR(14) NOT NULL COMMENT '激活码',
    user_device_id VARCHAR(255) DEFAULT NULL COMMENT '设备标识',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '激活时间',
    expires_at DATETIME DEFAULT NULL COMMENT '本次激活过期时间',
    usage_count INT DEFAULT 0 COMMENT '已使用次数',
    last_used_at DATETIME DEFAULT NULL COMMENT '最后使用时间',
    usage_by_date JSON DEFAULT NULL COMMENT '按日期统计使用次数',
    
    INDEX idx_code_id (code_id),
    INDEX idx_activation_code (activation_code),
    INDEX idx_user_device_id (user_device_id),
    INDEX idx_activated_at (activated_at),
    FOREIGN KEY (code_id) REFERENCES activation_codes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活记录表';

-- ============================================
-- 4. ai_generation_logs - AI生成日志表
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id VARCHAR(255) NOT NULL COMMENT '用户ID',
    total_score INT NOT NULL COMMENT '总分',
    level_name VARCHAR(100) COMMENT '等级名称',
    type_name VARCHAR(100) COMMENT '类型名称',
    english_name VARCHAR(200) COMMENT '英文名称',
    features TEXT COMMENT '核心特征',
    root_causes TEXT COMMENT '心理根源',
    positive_reframe TEXT COMMENT '正向重构',
    basic_info TEXT COMMENT '基础信息',
    report_id INT DEFAULT NULL COMMENT '关联报告ID',
    success BOOLEAN DEFAULT FALSE COMMENT '是否成功',
    error_message TEXT DEFAULT NULL COMMENT '错误信息',
    response_time INT DEFAULT NULL COMMENT '响应时间(ms)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI生成日志表';

-- ============================================
-- 5. ai_stats - AI统计表（按日期统计）
-- ============================================
CREATE TABLE IF NOT EXISTS ai_stats (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '统计ID',
    date DATE NOT NULL UNIQUE COMMENT '统计日期',
    total_calls INT DEFAULT 0 COMMENT '总调用次数',
    success_calls INT DEFAULT 0 COMMENT '成功次数',
    failed_calls INT DEFAULT 0 COMMENT '失败次数',
    avg_response_time FLOAT DEFAULT 0 COMMENT '平均响应时间(ms)',
    total_tokens INT DEFAULT 0 COMMENT '总Token消耗',
    
    INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI统计表';

-- ============================================
-- 插入测试激活码（如果不存在）
-- ============================================
INSERT IGNORE INTO activation_codes (code, status, max_uses, daily_limit, validity_days, notes, created_by)
VALUES 
('TEST-2024-0001', 'active', 100, 10, 365, '测试激活码 - 1年有效', 'admin'),
('DEMO-2024-0001', 'active', 10, 3, 7, '演示激活码 - 7天有效', 'admin'),
('VIP1-2024-0001', 'active', 1000, 50, 365, 'VIP激活码 - 1年有效', 'admin');

SELECT '数据库初始化完成！' AS message;
SELECT CONCAT('已创建 ', COUNT(*), ' 个测试激活码') AS info FROM activation_codes;
