-- ============================================
-- 激活码系统时间数据修复脚本
-- 修复可能存在的时间计算问题
-- ============================================

USE shekong_ai;

-- ⚠️ 警告：执行前请先备份数据库！
-- 建议：先执行 检查激活码时间逻辑.sql 查看问题，再执行此修复脚本

-- ============================================
-- 1. 备份提醒
-- ============================================
SELECT '⚠️ 执行修复前，请先备份数据库！' AS '警告';
SELECT '建议命令：mysqldump -u root -p shekong_ai > backup_before_fix.sql' AS '备份命令';
SELECT '按 Ctrl+C 取消，或继续执行' AS '提示';

-- ============================================
-- 2. 修复缺失过期时间的激活记录
-- ============================================
-- 问题：activation_records.expires_at 为 NULL
-- 原因：旧版本代码可能没有正确设置过期时间
-- 修复：根据 activated_at + validity_days 计算

SELECT '开始修复缺失过期时间的记录...' AS '步骤1';

-- 先查看需要修复的记录
SELECT 
    COUNT(*) AS '需要修复的记录数'
FROM activation_records ar
WHERE ar.expires_at IS NULL;

-- 执行修复
UPDATE activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
SET ar.expires_at = DATE_ADD(ar.activated_at, INTERVAL ac.validity_days DAY)
WHERE ar.expires_at IS NULL;

SELECT '✅ 完成！已修复缺失过期时间的记录' AS '结果';

-- ============================================
-- 3. 修复天数计算错误的记录
-- ============================================
-- 问题：expires_at 与 activated_at 的天数差不等于 validity_days
-- 原因：手动修改或程序bug
-- 修复：重新计算正确的过期时间

SELECT '开始修复天数计算错误的记录...' AS '步骤2';

-- 先查看需要修复的记录
SELECT 
    COUNT(*) AS '需要修复的记录数'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
WHERE DATEDIFF(ar.expires_at, ar.activated_at) != ac.validity_days;

-- 执行修复
UPDATE activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
SET ar.expires_at = DATE_ADD(ar.activated_at, INTERVAL ac.validity_days DAY)
WHERE DATEDIFF(ar.expires_at, ar.activated_at) != ac.validity_days;

SELECT '✅ 完成！已修复天数计算错误的记录' AS '结果';

-- ============================================
-- 4. 更新已过期但状态未变的激活码
-- ============================================
-- 问题：activation_codes 的 expires_at < NOW() 但 status 还是 'active'
-- 注意：这里的 expires_at 是激活码本身的可激活截止日期
-- 修复：将状态改为 'expired'

SELECT '开始更新已过期的激活码状态...' AS '步骤3';

-- 先查看需要更新的记录
SELECT 
    COUNT(*) AS '需要更新的激活码数'
FROM activation_codes
WHERE status = 'active' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();

-- 执行更新
UPDATE activation_codes 
SET status = 'expired'
WHERE status = 'active' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();

SELECT '✅ 完成！已更新已过期的激活码状态' AS '结果';

-- ============================================
-- 5. 更新使用次数达上限的激活码
-- ============================================
-- 问题：current_uses >= max_uses 但 status 还是 'active'
-- 修复：将状态改为 'used'

SELECT '开始更新使用次数达上限的激活码状态...' AS '步骤4';

-- 先查看需要更新的记录
SELECT 
    COUNT(*) AS '需要更新的激活码数'
FROM activation_codes
WHERE status = 'active' 
  AND current_uses >= max_uses;

-- 执行更新
UPDATE activation_codes 
SET status = 'used'
WHERE status = 'active' 
  AND current_uses >= max_uses;

SELECT '✅ 完成！已更新使用次数达上限的激活码状态' AS '结果';

-- ============================================
-- 6. 清理异常的每日使用记录
-- ============================================
-- 问题：usage_by_date 为 NULL 或空字符串
-- 修复：设置为空对象 '{}'

SELECT '开始清理异常的每日使用记录...' AS '步骤5';

-- 先查看需要清理的记录
SELECT 
    COUNT(*) AS '需要清理的记录数'
FROM activation_records
WHERE usage_by_date IS NULL OR usage_by_date = '' OR usage_by_date = 'null';

-- 执行清理
UPDATE activation_records
SET usage_by_date = '{}'
WHERE usage_by_date IS NULL OR usage_by_date = '' OR usage_by_date = 'null';

SELECT '✅ 完成！已清理异常的每日使用记录' AS '结果';

-- ============================================
-- 7. 验证修复结果
-- ============================================
SELECT '验证修复结果...' AS '步骤6';

-- 检查是否还有缺失过期时间的记录
SELECT 
    '缺失过期时间的记录' AS '检查项',
    COUNT(*) AS '数量',
    CASE WHEN COUNT(*) = 0 THEN '✅ 正常' ELSE '❌ 仍有问题' END AS '状态'
FROM activation_records
WHERE expires_at IS NULL;

-- 检查是否还有天数错误的记录
SELECT 
    '天数计算错误的记录' AS '检查项',
    COUNT(*) AS '数量',
    CASE WHEN COUNT(*) = 0 THEN '✅ 正常' ELSE '❌ 仍有问题' END AS '状态'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
WHERE DATEDIFF(ar.expires_at, ar.activated_at) != ac.validity_days;

-- 检查是否还有状态异常的激活码
SELECT 
    '已过期但状态未更新' AS '检查项',
    COUNT(*) AS '数量',
    CASE WHEN COUNT(*) = 0 THEN '✅ 正常' ELSE '❌ 仍有问题' END AS '状态'
FROM activation_codes
WHERE status = 'active' 
  AND expires_at IS NOT NULL 
  AND expires_at < NOW();

SELECT 
    '使用次数达上限但状态未更新' AS '检查项',
    COUNT(*) AS '数量',
    CASE WHEN COUNT(*) = 0 THEN '✅ 正常' ELSE '❌ 仍有问题' END AS '状态'
FROM activation_codes
WHERE status = 'active' 
  AND current_uses >= max_uses;

-- ============================================
-- 8. 显示修复后的数据摘要
-- ============================================
SELECT '修复后的数据摘要' AS '标题';

SELECT 
    '激活码统计' AS '类型',
    COUNT(*) AS '总数',
    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS '可用',
    SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS '已过期',
    SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) AS '已用完',
    SUM(CASE WHEN status = 'revoked' THEN 1 ELSE 0 END) AS '已撤销'
FROM activation_codes;

SELECT 
    '激活记录统计' AS '类型',
    COUNT(*) AS '总记录数',
    COUNT(CASE WHEN expires_at >= NOW() THEN 1 END) AS '有效记录',
    COUNT(CASE WHEN expires_at < NOW() THEN 1 END) AS '已过期记录',
    SUM(usage_count) AS '总使用次数'
FROM activation_records;

-- ============================================
-- 9. 最近的激活记录（验证时间是否正确）
-- ============================================
SELECT '最近10条激活记录' AS '标题';

SELECT 
    ar.activation_code AS '激活码',
    ar.activated_at AS '激活时间',
    ar.expires_at AS '过期时间',
    DATEDIFF(ar.expires_at, ar.activated_at) AS '有效天数',
    DATEDIFF(ar.expires_at, NOW()) AS '剩余天数',
    ar.usage_count AS '已使用次数',
    ac.daily_limit AS '每日上限',
    CASE 
        WHEN ar.expires_at < NOW() THEN '❌ 已过期'
        WHEN DATEDIFF(ar.expires_at, NOW()) <= 1 THEN '⚠️ 即将过期'
        ELSE '✅ 有效'
    END AS '状态'
FROM activation_records ar
JOIN activation_codes ac ON ar.code_id = ac.id
ORDER BY ar.activated_at DESC
LIMIT 10;

SELECT '✅✅✅ 所有修复完成！' AS '最终结果';
SELECT '请检查上面的验证结果，确保所有问题都已解决' AS '提示';

-- ============================================
-- 10. 可选：重置测试数据（仅用于开发环境）
-- ============================================

/*
-- ⚠️ 警告：以下操作会删除所有激活记录和激活码！
-- 仅在开发/测试环境使用，生产环境请勿执行！

-- 清空所有激活记录
TRUNCATE TABLE activation_records;

-- 清空所有激活码
TRUNCATE TABLE activation_codes;

-- 重新插入测试激活码
INSERT INTO activation_codes (code, validity_days, daily_limit, max_uses, notes, created_by) 
VALUES 
('TEST-2024-0001', 7, 3, 100, '测试激活码 - 7天3次/天', 'admin'),
('DEMO-2024-0001', 7, 3, 10, '演示激活码 - 7天3次/天', 'admin'),
('VIP1-2024-0001', 30, 10, 1000, 'VIP激活码 - 30天10次/天', 'admin');

SELECT '✅ 已重置测试数据' AS '结果';
*/

