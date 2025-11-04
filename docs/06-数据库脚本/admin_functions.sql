-- 管理端 RPC 函数（前端可调用），以 SECURITY DEFINER 方式执行受控写操作
-- 注意：此方案用于 MVP 内部管理用途。生产环境请改为 Edge Functions + Service Key。

-- 创建/更新/撤销/删除 激活码

CREATE OR REPLACE FUNCTION admin_create_code(input JSONB)
RETURNS JSONB AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO activation_codes (
    code, status, max_uses, daily_limit, validity_days, expires_at, notes, created_by
  ) VALUES (
    COALESCE(input->>'code', ''),
    'active',
    COALESCE((input->>'max_uses')::INT, 21),
    COALESCE((input->>'daily_limit')::INT, 3),
    COALESCE((input->>'validity_days')::INT, 7),
    CASE WHEN input ? 'expires_at' THEN (input->>'expires_at')::timestamptz ELSE NULL END,
    input->>'notes',
    'admin'
  ) RETURNING id INTO new_id;
  RETURN jsonb_build_object('id', new_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 批量创建激活码：input 为 json 数组，每项同 admin_create_code 的字段
-- 形如：[{"code":"XXXX-XXXX-XXXX","max_uses":100,"daily_limit":3,"validity_days":7,"expires_at":"2025-12-31T00:00:00Z","notes":"..."}, ...]
CREATE OR REPLACE FUNCTION admin_create_codes_bulk(input JSONB)
RETURNS JSONB AS $$
DECLARE
  arr JSONB;
  elem JSONB;
  created_count INT := 0;
  failed JSONB := '[]'::jsonb;
BEGIN
  arr := input;
  IF jsonb_typeof(arr) != 'array' THEN
    RETURN jsonb_build_object('created', 0, 'failed', jsonb_build_array(jsonb_build_object('error','input must be array')));
  END IF;

  FOR elem IN SELECT * FROM jsonb_array_elements(arr) LOOP
    BEGIN
      INSERT INTO activation_codes (
        code, status, max_uses, daily_limit, validity_days, expires_at, notes, created_by
      ) VALUES (
        COALESCE(elem->>'code',''),
        'active',
        COALESCE((elem->>'max_uses')::INT, 21),
        COALESCE((elem->>'daily_limit')::INT, 3),
        COALESCE((elem->>'validity_days')::INT, 7),
        CASE WHEN elem ? 'expires_at' THEN (elem->>'expires_at')::timestamptz ELSE NULL END,
        elem->>'notes',
        'admin'
      );
      created_count := created_count + 1;
    EXCEPTION WHEN OTHERS THEN
      failed := failed || jsonb_build_array(jsonb_build_object('code', elem->>'code', 'error', SQLERRM));
    END;
  END LOOP;

  RETURN jsonb_build_object('created', created_count, 'failed', failed);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_update_code(id UUID, input JSONB)
RETURNS JSONB AS $$
BEGIN
  UPDATE activation_codes SET
    code = COALESCE(input->>'code', code),
    max_uses = COALESCE((input->>'max_uses')::INT, max_uses),
    daily_limit = COALESCE((input->>'daily_limit')::INT, daily_limit),
    validity_days = COALESCE((input->>'validity_days')::INT, validity_days),
    expires_at = CASE WHEN input ? 'expires_at' THEN (input->>'expires_at')::timestamptz ELSE expires_at END,
    notes = COALESCE(input->>'notes', notes)
  WHERE activation_codes.id = admin_update_code.id;
  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_revoke_code(id UUID)
RETURNS JSONB AS $$
BEGIN
  UPDATE activation_codes SET status = 'revoked' WHERE activation_codes.id = admin_revoke_code.id;
  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_delete_code(id UUID)
RETURNS JSONB AS $$
BEGIN
  DELETE FROM activation_codes WHERE activation_codes.id = admin_delete_code.id;
  RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


