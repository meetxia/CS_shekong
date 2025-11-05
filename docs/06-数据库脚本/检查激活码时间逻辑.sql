-- ============================================
-- 激活码系统时间逻辑检查脚本
-- 用于诊断和验证激活码的时间计算是否正确
-- ============================================

USE shekong_ai;

-- ============================================
-- 1. 检查激活码表的配置
-- ============================================
SELECT 
    '检查激活码配置' AS '检查项',
    code AS '激活码',
    status AS '状态',
    validity_days AS '有效天数',
    daily_limit AS '每日上限',
    max_uses AS '最大使用次数',
    current_uses AS '当前已激活',
    expires_at AS '激活码本身的过期时间（可激活截止日期）',
    created_at AS '创建时间'
FROM activation_codes
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 2. 检查激活记录的时间设置
-- ============================================
SELECT 
    '检查激活记录时间' AS '检查项',
    ar.id AS '记录ID',
    ar.activation_code AS '激活码',
    ar.user_device_id AS '设备ID（前10位）',
    ar.activated_at AS '激活时间',
    ar.expires_at AS '过期时间',
    ac.validity_days AS '配置的有效天数',
    DATEDIFF(ar.expires_at, ar.activated_at) AS '实际计算天数',
    CASE 
        WHEN ar.expires_at IS NULL THEN '❌ 缺失过期时间'
        WHEN DATEDIFF(ar.expires_at, ar.activated_at) != ac.validity_days THEN '⚠️ 天数不匹配'
        WHEN ar.expires_at < NOW() THEN '⏰ 已过期'
        ELSE '✅ 正常'
    END AS '状态',
    ar.usage_count AS '已使用次数',
    ar.last_used_at AS '最后使用时间'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
ORDER BY ar.activated_at DESC
LIMIT 20;

-- ============================================
-- 3. 检查每日使用记录
-- ============================================
SELECT 
    '检查每日使用统计' AS '检查项',
    ar.activation_code AS '激活码',
    ar.user_device_id AS '设备ID（前10位）',
    ar.usage_by_date AS '每日使用记录JSON',
    ar.usage_count AS '总使用次数',
    ac.daily_limit AS '每日上限',
    CASE 
        WHEN ar.usage_by_date IS NULL OR ar.usage_by_date = '{}' THEN '⚠️ 无使用记录'
        ELSE '✅ 有记录'
    END AS '记录状态'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
WHERE ar.usage_count > 0
ORDER BY ar.last_used_at DESC
LIMIT 10;

-- ============================================
-- 4. 计算剩余天数和次数（模拟前端逻辑）
-- ============================================
SELECT 
    '计算剩余状态' AS '检查项',
    ar.activation_code AS '激活码',
    ar.activated_at AS '激活时间',
    ar.expires_at AS '过期时间',
    DATEDIFF(ar.expires_at, NOW()) AS '剩余天数',
    CASE 
        WHEN ar.expires_at < NOW() THEN '❌ 已过期'
        WHEN DATEDIFF(ar.expires_at, NOW()) <= 1 THEN '⚠️ 即将过期'
        ELSE '✅ 有效'
    END AS '有效性',
    ar.usage_count AS '已使用总次数',
    ac.daily_limit AS '每日上限',
    ac.validity_days * ac.daily_limit AS '理论最大次数'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
ORDER BY ar.activated_at DESC
LIMIT 20;

-- ============================================
-- 5. 查找可能的问题数据
-- ============================================

-- 5.1 查找缺失过期时间的激活记录
SELECT 
    '问题：缺失过期时间' AS '问题类型',
    ar.id AS '记录ID',
    ar.activation_code AS '激活码',
    ar.activated_at AS '激活时间',
    ar.expires_at AS '过期时间',
    '❌ 应该有过期时间但为空' AS '问题描述'
FROM activation_records ar
WHERE ar.expires_at IS NULL;

-- 5.2 查找天数计算错误的记录
SELECT 
    '问题：天数计算错误' AS '问题类型',
    ar.id AS '记录ID',
    ar.activation_code AS '激活码',
    ar.activated_at AS '激活时间',
    ar.expires_at AS '过期时间',
    ac.validity_days AS '配置天数',
    DATEDIFF(ar.expires_at, ar.activated_at) AS '实际天数',
    CONCAT('应该是', ac.validity_days, '天，实际是', DATEDIFF(ar.expires_at, ar.activated_at), '天') AS '问题描述'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
WHERE DATEDIFF(ar.expires_at, ar.activated_at) != ac.validity_days;

-- 5.3 查找已过期但状态未更新的激活码
SELECT 
    '问题：激活码状态未更新' AS '问题类型',
    ac.code AS '激活码',
    ac.status AS '当前状态',
    ac.expires_at AS '激活码过期时间',
    '❌ 激活码本身已过期但状态还是active' AS '问题描述'
FROM activation_codes ac
WHERE ac.status = 'active' 
  AND ac.expires_at IS NOT NULL 
  AND ac.expires_at < NOW();

-- 5.4 查找使用次数达上限但状态未更新的激活码
SELECT 
    '问题：使用次数达上限但状态未更新' AS '问题类型',
    ac.code AS '激活码',
    ac.status AS '当前状态',
    ac.current_uses AS '当前使用数',
    ac.max_uses AS '最大使用数',
    '❌ 已达上限但状态还是active' AS '问题描述'
FROM activation_codes ac
WHERE ac.status = 'active' 
  AND ac.current_uses >= ac.max_uses;

-- ============================================
-- 6. 统计汇总
-- ============================================
SELECT 
    '统计汇总' AS '项目',
    COUNT(*) AS '总激活码数',
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS '可用数',
    SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS '已过期数',
    SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) AS '已用完数',
    SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) AS '已撤销数',
    SUM(current_uses) AS '总激活次数'
FROM activation_codes;

SELECT 
    '统计汇总' AS '项目',
    COUNT(*) AS '总激活记录数',
    SUM(usage_count) AS '总使用次数',
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) AS '已过期记录数',
    COUNT(CASE WHEN expires_at >= NOW() THEN 1 END) AS '有效记录数'
FROM activation_records;

-- ============================================
-- 7. 修复建议（仅供参考，不自动执行）
-- ============================================

/*
-- 如果发现缺失过期时间的记录，可以手动修复：
UPDATE activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
SET ar.expires_at = DATE_ADD(ar.activated_at, INTERVAL ac.validity_days DAY)
WHERE ar.expires_at IS NULL;

-- 如果发现已过期的激活码状态未更新：
UPDATE activation_codes 
SET status = 'expired'
WHERE status = 'active' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();

-- 如果发现使用次数达上限的激活码状态未更新：
UPDATE activation_codes 
SET status = 'used'
WHERE status = 'active' 
  AND current_uses >= max_uses;
*/

-- ============================================
-- 8. 测试新激活码流程
-- ============================================

/*
-- 步骤1: 创建测试激活码
INSERT INTO activation_codes (code, validity_days, daily_limit, max_uses, notes, created_by) 
VALUES ('TEST-2024-9999', 7, 3, 1, '测试用激活码 - 7天3次', 'admin');

-- 步骤2: 模拟首次激活（会自动设置expires_at）
-- 通过API调用 POST /api/activation/verify 
-- body: { "code": "TEST-2024-9999", "deviceId": "test-device-001" }

-- 步骤3: 检查激活记录是否正确创建
SELECT 
    ar.*,
    ac.validity_days,
    DATEDIFF(ar.expires_at, ar.activated_at) AS '实际天数'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
WHERE ar.activation_code = 'TEST-2024-9999';

-- 步骤4: 模拟使用（会扣除次数）
-- 通过API调用 POST /api/activation/record-usage
-- body: { "recordId": <上面查询到的记录ID> }

-- 步骤5: 检查使用记录是否正确更新
SELECT 
    activation_code,
    usage_count,
    usage_by_date,
    last_used_at
FROM activation_records
WHERE activation_code = 'TEST-2024-9999';

-- 步骤6: 清理测试数据
DELETE FROM activation_records WHERE activation_code = 'TEST-2024-9999';
DELETE FROM activation_codes WHERE code = 'TEST-2024-9999';
*/

SELECT '✅ 检查完成！请查看上面的结果' AS '提示';

