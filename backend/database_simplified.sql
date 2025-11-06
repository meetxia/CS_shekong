-- ============================================
-- 社恐测评系统 - 精简版数据库结构
-- 创建日期: 2025-11-06
-- 说明: 删除冗余字段,只保留核心业务必需字段
-- ============================================

-- 使用现有数据库
USE shekong_ai;

-- ============================================
-- 精简版 activation_codes 表
-- ============================================
-- 删除旧表并重建 (⚠️ 生产环境请使用 ALTER TABLE 迁移数据)
DROP TABLE IF EXISTS activation_records;
DROP TABLE IF EXISTS activation_codes;

CREATE TABLE activation_codes (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活码表(精简版)';

-- ============================================
-- 精简版 activation_records 表
-- ============================================
CREATE TABLE activation_records (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    code_id INT NOT NULL COMMENT '激活码ID',
    activation_code VARCHAR(14) NOT NULL COMMENT '激活码',
    user_device_id VARCHAR(255) NOT NULL COMMENT '设备标识',
    activated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '激活时间(倒计时起点)',
    expires_at DATETIME NOT NULL COMMENT '过期时间(倒计时终点)',
    usage_by_date JSON DEFAULT '{}' COMMENT '按日期统计使用次数 {"2025-11-06": 2}',
    
    INDEX idx_code_id (code_id),
    INDEX idx_activation_code (activation_code),
    INDEX idx_device (user_device_id),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (code_id) REFERENCES activation_codes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='激活记录表(精简版)';

-- ============================================
-- 插入测试激活码
-- ============================================
INSERT INTO activation_codes (code, status, max_uses, daily_limit, validity_days, notes)
VALUES 
('TEST-2024-0001', 'active', 21, 3, 7, '测试激活码 - 7天有效'),
('DEMO-2024-0002', 'active', 21, 3, 7, '演示激活码 - 7天有效'),
('VIP1-2024-0003', 'active', 100, 10, 30, 'VIP激活码 - 30天有效');

-- ============================================
-- 字段变更说明
-- ============================================
-- activation_codes 表删除的字段:
--   ❌ expires_at - 激活码本身不需要过期时间,用户激活后才开始倒计时
--   ❌ updated_at - 实际用处不大
--   ❌ created_by - 单管理员系统不需要

-- activation_records 表删除的字段:
--   ❌ ip_address - 实际用处不大
--   ❌ usage_count - 只关心每日次数,不关心总次数
--   ❌ last_used_at - 实际用处不大

-- ============================================
-- 核心业务逻辑
-- ============================================
-- 1. 一个激活码可以被多个设备使用 (max_uses 控制)
-- 2. 每日次数限制是所有设备共享 (daily_limit)
-- 3. 只关心每日剩余次数,不关心总使用次数
-- 4. 剩余时间 = expires_at - now() (精确到分钟)
-- 5. 今日已用次数 = SUM(usage_by_date[today]) for all devices

SELECT '✅ 精简版数据库结构创建完成！' AS message;
SELECT CONCAT('已创建 ', COUNT(*), ' 个测试激活码') AS info FROM activation_codes;

