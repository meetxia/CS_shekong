/**
 * 激活码系统测试脚本
 * 用于验证精简重构后的激活码系统功能
 */

const {
  createActivationCode,
  createActivationCodesBulk,
  listActivationCodes,
  updateActivationCode,
  revokeActivationCode,
  deleteActivationCode,
  verifyActivationCode,
  recordUsage
} = require('./activationService');

// 测试结果统计
let passedTests = 0;
let failedTests = 0;

// 辅助函数
function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 测试1: 创建激活码
async function test1_createActivationCode() {
  console.log('\n📝 测试1: 创建激活码');
  
  const result = await createActivationCode({
    code: 'TEST-2024-0001',
    max_uses: 21,
    validity_days: 7,
    daily_limit: 3,
    notes: '测试激活码'
  });
  
  assert(result.success === true, '创建激活码成功');
  assert(result.data && result.data.id, '返回激活码ID');
  
  return result.data;
}

// 测试2: 批量创建激活码
async function test2_createActivationCodesBulk() {
  console.log('\n📝 测试2: 批量创建激活码');
  
  const items = [
    { code: 'BULK-0001-TEST', max_uses: 21, validity_days: 7, daily_limit: 3, notes: '批量测试1' },
    { code: 'BULK-0002-TEST', max_uses: 21, validity_days: 7, daily_limit: 3, notes: '批量测试2' },
    { code: 'BULK-0003-TEST', max_uses: 21, validity_days: 7, daily_limit: 3, notes: '批量测试3' }
  ];
  
  const result = await createActivationCodesBulk(items);
  
  assert(result.success === true, '批量创建激活码成功');
  assert(result.created === 3, '创建了3个激活码');
  
  return result;
}

// 测试3: 列出激活码
async function test3_listActivationCodes() {
  console.log('\n📝 测试3: 列出激活码');
  
  const result = await listActivationCodes({ page: 1, pageSize: 20 });
  
  assert(result.success === true, '获取激活码列表成功');
  assert(Array.isArray(result.list), '返回列表是数组');
  assert(result.total >= 4, '至少有4个激活码');
  
  // 验证新增字段
  if (result.list.length > 0) {
    const item = result.list[0];
    assert(item.hasOwnProperty('todayUsed'), '包含 todayUsed 字段');
    assert(item.hasOwnProperty('todayRemaining'), '包含 todayRemaining 字段');
    assert(item.hasOwnProperty('activatedDevices'), '包含 activatedDevices 字段');
    assert(item.hasOwnProperty('timeRemaining'), '包含 timeRemaining 字段');
  }
  
  return result;
}

// 测试4: 更新激活码
async function test4_updateActivationCode(codeData) {
  console.log('\n📝 测试4: 更新激活码');
  
  const result = await updateActivationCode(codeData.id, {
    notes: '更新后的备注'
  });
  
  assert(result.success === true, '更新激活码成功');
  
  // 验证更新
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const updated = listResult.list.find(item => item.id === codeData.id);
  assert(updated && updated.notes === '更新后的备注', '备注已更新');
  
  return result;
}

// 测试5: 验证激活码
async function test5_verifyActivationCode() {
  console.log('\n📝 测试5: 验证激活码');
  
  const result = await verifyActivationCode('TEST-2024-0001', 'test-device-001');
  
  assert(result.success === true, '验证激活码成功');
  assert(result.data && result.data.validity_days === 7, '返回有效天数');
  assert(result.data && result.data.daily_limit === 3, '返回每日上限');
  
  return result;
}

// 测试6: 记录使用次数
async function test6_recordUsage() {
  console.log('\n📝 测试6: 记录使用次数');
  
  const result = await recordUsage('TEST-2024-0001', 'test-device-001');
  
  assert(result.success === true, '记录使用次数成功');
  
  // 验证今日已用次数
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const code = listResult.list.find(item => item.code === 'TEST-2024-0001');
  assert(code && code.todayUsed === 1, '今日已用次数为1');
  assert(code && code.todayRemaining === 2, '今日剩余次数为2');
  
  return result;
}

// 测试7: 验证每日次数限制
async function test7_dailyLimitCheck() {
  console.log('\n📝 测试7: 验证每日次数限制');
  
  // 再使用2次,达到每日上限
  await recordUsage('TEST-2024-0001', 'test-device-001');
  await recordUsage('TEST-2024-0001', 'test-device-001');
  
  // 验证今日已用次数
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const code = listResult.list.find(item => item.code === 'TEST-2024-0001');
  assert(code && code.todayUsed === 3, '今日已用次数为3');
  assert(code && code.todayRemaining === 0, '今日剩余次数为0');
  
  // 尝试第4次使用,应该失败
  const result = await verifyActivationCode('TEST-2024-0001', 'test-device-001');
  assert(result.success === false, '超过每日限制时验证失败');
  assert(result.error && result.error.includes('今日使用次数已达上限'), '返回正确的错误信息');
  
  return result;
}

// 测试8: 验证多设备共享每日次数
async function test8_multiDeviceSharing() {
  console.log('\n📝 测试8: 验证多设备共享每日次数');
  
  // 创建新激活码
  const createResult = await createActivationCode({
    code: 'MULTI-DEV-TEST',
    max_uses: 21,
    validity_days: 7,
    daily_limit: 3,
    notes: '多设备测试'
  });
  
  assert(createResult.success === true, '创建测试激活码成功');
  
  // 设备A激活并使用2次
  await verifyActivationCode('MULTI-DEV-TEST', 'device-A');
  await recordUsage('MULTI-DEV-TEST', 'device-A');
  await recordUsage('MULTI-DEV-TEST', 'device-A');
  
  // 设备B激活
  await verifyActivationCode('MULTI-DEV-TEST', 'device-B');
  
  // 验证设备数量
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const code = listResult.list.find(item => item.code === 'MULTI-DEV-TEST');
  assert(code && code.activatedDevices === 2, '已激活2个设备');
  assert(code && code.todayUsed === 2, '今日已用2次(设备A)');
  
  // 设备B尝试使用,应该只能用1次
  const usageResult = await recordUsage('MULTI-DEV-TEST', 'device-B');
  assert(usageResult.success === true, '设备B使用1次成功');
  
  // 验证总使用次数
  const listResult2 = await listActivationCodes({ page: 1, pageSize: 20 });
  const code2 = listResult2.list.find(item => item.code === 'MULTI-DEV-TEST');
  assert(code2 && code2.todayUsed === 3, '今日总共用了3次');
  assert(code2 && code2.todayRemaining === 0, '今日剩余0次');
  
  // 设备B尝试第2次使用,应该失败
  const verifyResult = await verifyActivationCode('MULTI-DEV-TEST', 'device-B');
  assert(verifyResult.success === false, '超过每日限制时验证失败');
  
  return code2;
}

// 测试9: 验证剩余时间计算
async function test9_timeRemainingCalculation() {
  console.log('\n📝 测试9: 验证剩余时间计算');
  
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const code = listResult.list.find(item => item.code === 'TEST-2024-0001');
  
  if (code && code.timeRemaining) {
    assert(code.timeRemaining.hasOwnProperty('days'), '包含天数');
    assert(code.timeRemaining.hasOwnProperty('hours'), '包含小时');
    assert(code.timeRemaining.hasOwnProperty('minutes'), '包含分钟');
    assert(code.timeRemaining.hasOwnProperty('text'), '包含格式化文本');
    assert(code.timeRemaining.days >= 0 && code.timeRemaining.days <= 7, '天数在合理范围内');
    assert(code.timeRemaining.text.includes('天'), '格式化文本包含"天"');
    assert(code.timeRemaining.text.includes('小时'), '格式化文本包含"小时"');
    assert(code.timeRemaining.text.includes('分钟'), '格式化文本包含"分钟"');
  } else {
    console.log('⚠️  激活码未激活,跳过剩余时间测试');
  }
  
  return code;
}

// 测试10: 撤销激活码
async function test10_revokeActivationCode(codeData) {
  console.log('\n📝 测试10: 撤销激活码');
  
  const result = await revokeActivationCode(codeData.id);
  
  assert(result.success === true, '撤销激活码成功');
  
  // 验证状态
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const revoked = listResult.list.find(item => item.id === codeData.id);
  assert(revoked && revoked.status === 'revoked', '状态已变为revoked');
  
  return result;
}

// 测试11: 删除激活码
async function test11_deleteActivationCode(codeData) {
  console.log('\n📝 测试11: 删除激活码');
  
  const result = await deleteActivationCode(codeData.id);
  
  assert(result.success === true, '删除激活码成功');
  
  // 验证已删除
  const listResult = await listActivationCodes({ page: 1, pageSize: 20 });
  const deleted = listResult.list.find(item => item.id === codeData.id);
  assert(!deleted, '激活码已从列表中删除');
  
  return result;
}

// 主测试函数
async function runAllTests() {
  console.log('🚀 开始测试激活码系统...\n');
  console.log('=' .repeat(60));
  
  try {
    // 执行所有测试
    const code1 = await test1_createActivationCode();
    await test2_createActivationCodesBulk();
    await test3_listActivationCodes();
    await test4_updateActivationCode(code1);
    await test5_verifyActivationCode();
    await test6_recordUsage();
    await test7_dailyLimitCheck();
    await test8_multiDeviceSharing();
    await test9_timeRemainingCalculation();
    await test10_revokeActivationCode(code1);
    await test11_deleteActivationCode(code1);
    
    // 输出测试结果
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 测试结果统计:');
    console.log(`✅ 通过: ${passedTests} 个测试`);
    console.log(`❌ 失败: ${failedTests} 个测试`);
    console.log(`📈 通过率: ${Math.round(passedTests / (passedTests + failedTests) * 100)}%`);
    
    if (failedTests === 0) {
      console.log('\n🎉 所有测试通过! 激活码系统工作正常!');
    } else {
      console.log('\n⚠️  部分测试失败,请检查错误信息');
    }
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
  
  process.exit(failedTests === 0 ? 0 : 1);
}

// 运行测试
runAllTests();

