-- ============================================
-- Supabase 激活码系统数据库设置
-- ============================================

-- 1. 创建激活码表
CREATE TABLE IF NOT EXISTS activation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(14) UNIQUE NOT NULL, -- 格式: XXXX-XXXX-XXXX
  status VARCHAR(20) DEFAULT 'active', -- active, used, expired, revoked
  max_uses INTEGER DEFAULT 1, -- 最大使用次数
  current_uses INTEGER DEFAULT 0, -- 当前使用次数
  expires_at TIMESTAMPTZ, -- 过期时间
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 使用限制
  daily_limit INTEGER DEFAULT 3, -- 每天使用次数限制
  validity_days INTEGER DEFAULT 7, -- 有效期天数
  
  -- 元数据
  notes TEXT, -- 备注信息
  created_by TEXT -- 创建者（管理员）
);

-- 2. 创建激活记录表（追踪每次激活）
CREATE TABLE IF NOT EXISTS activation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES activation_codes(id) ON DELETE CASCADE,
  activation_code VARCHAR(14) NOT NULL,
  user_device_id TEXT, -- 设备标识（可选，用于防刷）
  ip_address INET, -- IP地址（可选）
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- 本次激活的过期时间
  usage_count INTEGER DEFAULT 0, -- 已使用次数
  last_used_at TIMESTAMPTZ, -- 最后使用时间
  
  -- 用量追踪（按日期）
  usage_by_date JSONB DEFAULT '{}'::jsonb -- {"2024-01-01": 2, "2024-01-02": 1}
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_status ON activation_codes(status);
CREATE INDEX IF NOT EXISTS idx_activation_records_code_id ON activation_records(code_id);
CREATE INDEX IF NOT EXISTS idx_activation_records_activation_code ON activation_records(activation_code);

-- 4. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activation_codes_updated_at 
  BEFORE UPDATE ON activation_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用 Row Level Security (RLS)
ALTER TABLE activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activation_records ENABLE ROW LEVEL SECURITY;

-- 6. 创建策略（允许匿名用户验证激活码）
-- 注意：生产环境应该使用 Service Role Key 或更严格的权限控制

-- 策略1：允许任何人读取激活码（仅用于验证）
CREATE POLICY "Allow read activation codes for verification"
  ON activation_codes FOR SELECT
  USING (true);

-- 策略2：允许插入激活记录
CREATE POLICY "Allow insert activation records"
  ON activation_records FOR INSERT
  WITH CHECK (true);

-- 策略3：允许更新自己的激活记录（通过 device_id 或 IP）
CREATE POLICY "Allow update own activation records"
  ON activation_records FOR UPDATE
  USING (true); -- 生产环境应该限制只能更新自己的记录

-- 策略4：允许读取自己的激活记录
CREATE POLICY "Allow read own activation records"
  ON activation_records FOR SELECT
  USING (true); -- 生产环境应该限制只能读取自己的记录

-- 7. 创建验证激活码的函数
CREATE OR REPLACE FUNCTION verify_activation_code(
  input_code VARCHAR(14),
  device_id TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  code_record activation_codes%ROWTYPE;
  record_entry activation_records%ROWTYPE;
  today_date TEXT;
  today_usage INTEGER;
  result JSONB;
BEGIN
  -- 格式化代码（移除连字符）
  input_code := REPLACE(UPPER(input_code), '-', '');
  IF LENGTH(input_code) != 12 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', '激活码格式错误'
    );
  END IF;
  
  -- 重新添加连字符
  input_code := SUBSTRING(input_code, 1, 4) || '-' || 
                SUBSTRING(input_code, 5, 4) || '-' || 
                SUBSTRING(input_code, 9, 4);
  
  -- 查找激活码
  SELECT * INTO code_record
  FROM activation_codes
  WHERE code = input_code;
  
  -- 检查激活码是否存在
  IF code_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', '激活码不存在'
    );
  END IF;
  
  -- 检查状态
  IF code_record.status != 'active' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', '激活码已失效'
    );
  END IF;
  
  -- 检查是否过期
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < NOW() THEN
    -- 更新状态
    UPDATE activation_codes SET status = 'expired' WHERE id = code_record.id;
    RETURN jsonb_build_object(
      'valid', false,
      'error', '激活码已过期'
    );
  END IF;
  
  -- 检查使用次数
  IF code_record.current_uses >= code_record.max_uses THEN
    UPDATE activation_codes SET status = 'used' WHERE id = code_record.id;
    RETURN jsonb_build_object(
      'valid', false,
      'error', '激活码使用次数已达上限'
    );
  END IF;
  
  -- 查找或创建激活记录
  SELECT * INTO record_entry
  FROM activation_records
  WHERE activation_code = input_code
  ORDER BY activated_at DESC
  LIMIT 1;
  
  -- 如果已有记录，检查是否过期
  IF record_entry.id IS NOT NULL THEN
    IF record_entry.expires_at < NOW() THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', '激活码已过期'
      );
    END IF;
    
    -- 检查今日使用次数
    today_date := TO_CHAR(NOW(), 'YYYY-MM-DD');
    today_usage := COALESCE((record_entry.usage_by_date->>today_date)::INTEGER, 0);
    
    IF today_usage >= code_record.daily_limit THEN
      RETURN jsonb_build_object(
        'valid', false,
        'error', '今日使用次数已达上限'
      );
    END IF;
    
    -- 更新使用次数
    record_entry.usage_by_date := 
      jsonb_set(
        COALESCE(record_entry.usage_by_date, '{}'::jsonb),
        ARRAY[today_date],
        to_jsonb(today_usage + 1)
      );
    record_entry.usage_count := record_entry.usage_count + 1;
    record_entry.last_used_at := NOW();
    
    UPDATE activation_records
    SET usage_by_date = record_entry.usage_by_date,
        usage_count = record_entry.usage_count,
        last_used_at = record_entry.last_used_at
    WHERE id = record_entry.id;
    
    -- 更新激活码的使用次数
    UPDATE activation_codes
    SET current_uses = current_uses + 1
    WHERE id = code_record.id;
    
    RETURN jsonb_build_object(
      'valid', true,
      'record_id', record_entry.id,
      'expires_at', record_entry.expires_at,
      'remaining_today', code_record.daily_limit - today_usage - 1,
      'days_left', EXTRACT(DAY FROM (record_entry.expires_at - NOW()))::INTEGER
    );
  END IF;
  
  -- 创建新激活记录
  INSERT INTO activation_records (
    code_id,
    activation_code,
    user_device_id,
    expires_at
  ) VALUES (
    code_record.id,
    input_code,
    device_id,
    NOW() + (code_record.validity_days || ' days')::INTERVAL
  ) RETURNING * INTO record_entry;
  
  -- 更新激活码使用次数
  UPDATE activation_codes
  SET current_uses = current_uses + 1
  WHERE id = code_record.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'record_id', record_entry.id,
    'expires_at', record_entry.expires_at,
    'remaining_today', code_record.daily_limit - 1,
    'days_left', code_record.validity_days
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 创建获取激活状态的函数
CREATE OR REPLACE FUNCTION get_activation_status(
  input_code VARCHAR(14)
)
RETURNS JSONB AS $$
DECLARE
  record_entry activation_records%ROWTYPE;
  code_record activation_codes%ROWTYPE;
  today_date TEXT;
  today_usage INTEGER;
  days_left INTEGER;
BEGIN
  -- 格式化代码
  input_code := REPLACE(UPPER(input_code), '-', '');
  IF LENGTH(input_code) != 12 THEN
    RETURN jsonb_build_object('error', '激活码格式错误');
  END IF;
  input_code := SUBSTRING(input_code, 1, 4) || '-' || 
                SUBSTRING(input_code, 5, 4) || '-' || 
                SUBSTRING(input_code, 9, 4);
  
  -- 查找激活记录
  SELECT * INTO record_entry
  FROM activation_records
  WHERE activation_code = input_code
  ORDER BY activated_at DESC
  LIMIT 1;
  
  IF record_entry.id IS NULL THEN
    RETURN jsonb_build_object('error', '未找到激活记录');
  END IF;
  
  -- 查找激活码信息
  SELECT * INTO code_record
  FROM activation_codes
  WHERE id = record_entry.code_id;
  
  -- 计算剩余天数
  days_left := EXTRACT(DAY FROM (record_entry.expires_at - NOW()))::INTEGER;
  days_left := GREATEST(0, days_left);
  
  -- 计算今日使用次数
  today_date := TO_CHAR(NOW(), 'YYYY-MM-DD');
  today_usage := COALESCE((record_entry.usage_by_date->>today_date)::INTEGER, 0);
  
  RETURN jsonb_build_object(
    'expired', record_entry.expires_at < NOW(),
    'days_left', days_left,
    'remaining_today', GREATEST(0, code_record.daily_limit - today_usage),
    'daily_limit', code_record.daily_limit,
    'total_usage', record_entry.usage_count,
    'expires_at', record_entry.expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 插入测试数据（可选）
-- 注意：生产环境应该通过管理后台生成激活码
INSERT INTO activation_codes (code, status, max_uses, validity_days, daily_limit, notes)
VALUES 
  ('TEST-2024-ABCD', 'active', 100, 7, 3, '测试激活码1'),
  ('DEMO-1234-5678', 'active', 50, 7, 3, '测试激活码2'),
  ('MVPX-XXXX-YYYY', 'active', 10, 7, 3, '测试激活码3')
ON CONFLICT (code) DO NOTHING;

-- 10. 创建管理视图（可选，用于查看统计信息）
CREATE OR REPLACE VIEW activation_stats AS
SELECT 
  ac.code,
  ac.status,
  ac.max_uses,
  ac.current_uses,
  ac.expires_at,
  COUNT(ar.id) as total_activations,
  SUM(ar.usage_count) as total_usage_count
FROM activation_codes ac
LEFT JOIN activation_records ar ON ac.id = ar.code_id
GROUP BY ac.id, ac.code, ac.status, ac.max_uses, ac.current_uses, ac.expires_at;

