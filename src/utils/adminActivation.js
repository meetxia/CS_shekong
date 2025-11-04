// 管理端 激活码/统计 API 封装（前端）
// 说明：
// - 读取 activation_codes/activation_records 依赖 RLS 中的 SELECT 策略，已在脚本开启
// - 写操作（新增/更新/删除/撤销）需要在 Supabase 创建 SECURITY DEFINER 的 RPC 函数
//   本文件先提供占位封装，如未配置 RPC，将给出明确报错与脚本指引

import { supabase } from './supabaseClient'

// 列表激活码（分页+筛选）
export async function listActivationCodes({ page = 1, pageSize = 20, status, q } = {}) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('activation_codes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (q && q.trim()) {
    // 简单模糊搜索 code/notes
    query = query.or(`code.ilike.%${q.trim()}%,notes.ilike.%${q.trim()}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return { list: data || [], total: count || 0 }
}

// 查看某个激活码的使用记录（最近N条）
export async function listActivationRecordsByCode(code, limit = 30) {
  const { data, error } = await supabase
    .from('activation_records')
    .select('*')
    .eq('activation_code', code)
    .order('activated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

// 统计面板数据
export async function fetchActivationStats() {
  // 总览：激活码数量、有效/失效、总激活次数、总使用次数
  const [codesRes, recordsRes, viewRes] = await Promise.all([
    supabase.from('activation_codes').select('id,status,current_uses,max_uses,expires_at'),
    supabase.from('activation_records').select('id,usage_count'),
    supabase.from('activation_stats').select('*')
  ])

  if (codesRes.error) throw codesRes.error
  if (recordsRes.error) throw recordsRes.error
  if (viewRes.error) throw viewRes.error

  const codes = codesRes.data || []
  const records = recordsRes.data || []
  const statsRows = viewRes.data || []

  const totalCodes = codes.length
  const activeCodes = codes.filter(c => c.status === 'active').length
  const expiredCodes = codes.filter(c => c.status === 'expired').length
  const revokedCodes = codes.filter(c => c.status === 'revoked').length

  const totalActivations = statsRows.reduce((sum, r) => sum + (Number(r.total_activations) || 0), 0)
  const totalUsageCount = records.reduce((sum, r) => sum + (Number(r.usage_count) || 0), 0)

  return {
    totalCodes,
    activeCodes,
    expiredCodes,
    revokedCodes,
    totalActivations,
    totalUsageCount,
    byCode: statsRows
  }
}

// 创建激活码（占位：需要 RPC）
export async function adminCreateCode(payload) {
  // 需要在数据库侧创建：admin_create_code(jsonb) RETURNS jsonb SECURITY DEFINER
  const { data, error } = await supabase.rpc('admin_create_code', { input: payload })
  if (error) throw friendlyAdminError(error)
  return data
}

// 更新激活码（占位：需要 RPC）
export async function adminUpdateCode(id, payload) {
  const { data, error } = await supabase.rpc('admin_update_code', { id, input: payload })
  if (error) throw friendlyAdminError(error)
  return data
}

// 撤销激活码（占位：需要 RPC）
export async function adminRevokeCode(id) {
  const { data, error } = await supabase.rpc('admin_revoke_code', { id })
  if (error) throw friendlyAdminError(error)
  return data
}

// 删除激活码（占位：需要 RPC）
export async function adminDeleteCode(id) {
  const { data, error } = await supabase.rpc('admin_delete_code', { id })
  if (error) throw friendlyAdminError(error)
  return data
}

// 批量创建激活码（优先使用 RPC；若缺失则回退为串行创建）
export async function adminCreateCodesBulk(items) {
  try {
    const { data, error } = await supabase.rpc('admin_create_codes_bulk', { input: items })
    if (error) throw error
    return data
  } catch (e) {
    // 回退方案：逐个创建
    const results = { created: 0, failed: [] }
    for (const it of items) {
      try {
        await adminCreateCode(it)
        results.created += 1
      } catch (err) {
        results.failed.push({ code: it.code, error: err?.message || '创建失败' })
      }
    }
    return results
  }
}

function friendlyAdminError(error) {
  const msg = error?.message || ''
  if (msg.toLowerCase().includes('function') || msg.toLowerCase().includes('rpc')) {
    return new Error('未配置管理端 RPC。请执行 docs/06-数据库脚本 中的管理函数脚本并重试。')
  }
  return new Error(msg || '操作失败，请稍后重试')
}


