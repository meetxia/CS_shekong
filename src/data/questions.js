/**
 * 社恐测评题目数据（30题）
 * 维度分布：
 * - 社交场景恐惧（Q1-Q5）
 * - 回避行为程度（Q6-Q10）
 * - 预期焦虑强度（Q11-Q15）
 * - 社交后反刍（Q16-Q20）
 * - 生理反应强度（Q21-Q25）
 * - 社交自我效能（Q26-Q30）
 */

export const questions = [
  // Q1-Q5: 社交场景恐惧
  {
    id: 1,
    dimension: 'scene_fear',
    question: '需要参加多人聚会时，你的第一反应是？',
    options: [
      { id: 1, text: '期待见到朋友，感到开心', score: 1 },
      { id: 2, text: '有些紧张但愿意参加', score: 2 },
      { id: 3, text: '明显焦虑，需要心理准备', score: 3 },
      { id: 4, text: '非常抗拒，想找理由推脱', score: 4 },
      { id: 5, text: '绝对不会参加', score: 5 }
    ]
  },
  {
    id: 2,
    dimension: 'scene_fear',
    question: '需要给陌生人打电话时，你会？',
    options: [
      { id: 1, text: '直接拨打，没有压力', score: 1 },
      { id: 2, text: '简单准备后拨打', score: 2 },
      { id: 3, text: '反复演练措辞，需要心理建设', score: 3 },
      { id: 4, text: '能用文字绝不打电话', score: 4 },
      { id: 5, text: '宁愿放弃也不愿打电话', score: 5 }
    ]
  },
  {
    id: 3,
    dimension: 'scene_fear',
    question: '在电梯或狭小空间里遇到陌生人时，你的感受是？',
    options: [
      { id: 1, text: '完全自然，不会紧张', score: 1 },
      { id: 2, text: '略有不适，但可以应对', score: 2 },
      { id: 3, text: '明显紧张，避免眼神接触', score: 3 },
      { id: 4, text: '非常紧张，心跳加速', score: 4 },
      { id: 5, text: '极度焦虑，想立刻离开', score: 5 }
    ]
  },
  {
    id: 4,
    dimension: 'scene_fear',
    question: '在餐厅用餐时，服务员走近询问需求，你会？',
    options: [
      { id: 1, text: '自然交流，清晰表达需求', score: 1 },
      { id: 2, text: '稍微紧张但能正常沟通', score: 2 },
      { id: 3, text: '说话有些紧张，容易结巴', score: 3 },
      { id: 4, text: '非常紧张，尽量少说话', score: 4 },
      { id: 5, text: '极度不适，希望别人帮忙点餐', score: 5 }
    ]
  },
  {
    id: 5,
    dimension: 'scene_fear',
    question: '需要在会议或课堂上发言时，你的感觉是？',
    options: [
      { id: 1, text: '充满信心，愿意表达观点', score: 1 },
      { id: 2, text: '有点紧张但能够完成', score: 2 },
      { id: 3, text: '非常紧张，担心说错', score: 3 },
      { id: 4, text: '极度恐惧，能避免就避免', score: 4 },
      { id: 5, text: '宁愿承受任何后果也不发言', score: 5 }
    ]
  },

  // Q6-Q10: 回避行为程度
  {
    id: 6,
    dimension: 'avoidance',
    question: '收到社交邀请（聚会、活动等）时，你通常会？',
    options: [
      { id: 1, text: '欣然接受，期待参加', score: 1 },
      { id: 2, text: '根据心情和场合决定', score: 2 },
      { id: 3, text: '经常找借口推脱', score: 3 },
      { id: 4, text: '几乎总是拒绝', score: 4 },
      { id: 5, text: '会主动屏蔽这类信息', score: 5 }
    ]
  },
  {
    id: 7,
    dimension: 'avoidance',
    question: '逛街或超市购物时，遇到需要询问店员的情况？',
    options: [
      { id: 1, text: '直接询问，没有顾虑', score: 1 },
      { id: 2, text: '会询问但稍有犹豫', score: 2 },
      { id: 3, text: '能自己找就不问', score: 3 },
      { id: 4, text: '宁愿多花时间也不问', score: 4 },
      { id: 5, text: '找不到就直接放弃购买', score: 5 }
    ]
  },
  {
    id: 8,
    dimension: 'avoidance',
    question: '面对需要与人合作的任务（如小组作业），你会？',
    options: [
      { id: 1, text: '积极参与，享受合作', score: 1 },
      { id: 2, text: '正常参与但不太主动', score: 2 },
      { id: 3, text: '尽量选择独立完成的部分', score: 3 },
      { id: 4, text: '能避免就避免参与讨论', score: 4 },
      { id: 5, text: '宁愿承担更多工作量也要减少交流', score: 5 }
    ]
  },
  {
    id: 9,
    dimension: 'avoidance',
    question: '遇到需要排队办事的场景（如银行、政府部门），你会？',
    options: [
      { id: 1, text: '正常前往，按流程办理', score: 1 },
      { id: 2, text: '会提前准备减少交流', score: 2 },
      { id: 3, text: '尽量选择线上办理', score: 3 },
      { id: 4, text: '一拖再拖，非常抗拒', score: 4 },
      { id: 5, text: '宁愿花钱请人代办', score: 5 }
    ]
  },
  {
    id: 10,
    dimension: 'avoidance',
    question: '在社交场合中，你更倾向于？',
    options: [
      { id: 1, text: '主动与他人交谈', score: 1 },
      { id: 2, text: '等待他人主动但会回应', score: 2 },
      { id: 3, text: '尽量待在角落少说话', score: 3 },
      { id: 4, text: '找借口早点离开', score: 4 },
      { id: 5, text: '一开始就不会去', score: 5 }
    ]
  },

  // Q11-Q15: 预期焦虑强度
  {
    id: 11,
    dimension: 'anticipation',
    question: '知道明天要参加社交活动，今晚你会？',
    options: [
      { id: 1, text: '正常休息，没有特别想法', score: 1 },
      { id: 2, text: '稍微想一下明天的安排', score: 2 },
      { id: 3, text: '反复想象明天的场景', score: 3 },
      { id: 4, text: '焦虑到难以入睡', score: 4 },
      { id: 5, text: '焦虑到想取消计划', score: 5 }
    ]
  },
  {
    id: 12,
    dimension: 'anticipation',
    question: '面对一周后的重要社交场合（如面试、演讲），你会？',
    options: [
      { id: 1, text: '提前准备，但不会过度担心', score: 1 },
      { id: 2, text: '会时不时想起并感到紧张', score: 2 },
      { id: 3, text: '每天都在担心，影响心情', score: 3 },
      { id: 4, text: '持续焦虑，影响日常生活', score: 4 },
      { id: 5, text: '极度恐惧，考虑放弃', score: 5 }
    ]
  },
  {
    id: 13,
    dimension: 'anticipation',
    question: '在社交活动开始前的1小时，你通常是？',
    options: [
      { id: 1, text: '保持平静，正常准备', score: 1 },
      { id: 2, text: '有些紧张但还好', score: 2 },
      { id: 3, text: '明显焦虑，坐立不安', score: 3 },
      { id: 4, text: '非常紧张，想找借口不去', score: 4 },
      { id: 5, text: '恐慌到身体不适', score: 5 }
    ]
  },
  {
    id: 14,
    dimension: 'anticipation',
    question: '对于"可能会遇到陌生人"的场合，你会？',
    options: [
      { id: 1, text: '觉得是认识新朋友的机会', score: 1 },
      { id: 2, text: '有一点紧张但能应对', score: 2 },
      { id: 3, text: '提前想好各种应对话术', score: 3 },
      { id: 4, text: '反复脑补尴尬场景', score: 4 },
      { id: 5, text: '极度恐惧，完全不想去', score: 5 }
    ]
  },
  {
    id: 15,
    dimension: 'anticipation',
    question: '计划参加社交活动的前几天，你的睡眠质量会？',
    options: [
      { id: 1, text: '完全不受影响', score: 1 },
      { id: 2, text: '偶尔会想起但影响不大', score: 2 },
      { id: 3, text: '睡眠质量有所下降', score: 3 },
      { id: 4, text: '经常失眠或多梦', score: 4 },
      { id: 5, text: '严重失眠，身心俱疲', score: 5 }
    ]
  },

  // Q16-Q20: 社交后反刍
  {
    id: 16,
    dimension: 'rumination',
    question: '社交活动结束后，你会？',
    options: [
      { id: 1, text: '很快就不再想这件事', score: 1 },
      { id: 2, text: '简单回顾一下就过去了', score: 2 },
      { id: 3, text: '反复回想自己的表现', score: 3 },
      { id: 4, text: '不断懊悔说错的话', score: 4 },
      { id: 5, text: '会持续懊悔好几天', score: 5 }
    ]
  },
  {
    id: 17,
    dimension: 'rumination',
    question: '回想起社交中的"尴尬时刻"时，你会？',
    options: [
      { id: 1, text: '一笑而过，不太在意', score: 1 },
      { id: 2, text: '稍微尴尬但能接受', score: 2 },
      { id: 3, text: '反复回想，感到难受', score: 3 },
      { id: 4, text: '非常痛苦，自责不已', score: 4 },
      { id: 5, text: '甚至会因此失眠', score: 5 }
    ]
  },
  {
    id: 18,
    dimension: 'rumination',
    question: '社交后，你是否会反复分析"别人怎么看我"？',
    options: [
      { id: 1, text: '基本不会，顺其自然', score: 1 },
      { id: 2, text: '偶尔会想但不深究', score: 2 },
      { id: 3, text: '经常分析他人的反应', score: 3 },
      { id: 4, text: '过度解读他人的表情和话语', score: 4 },
      { id: 5, text: '总觉得别人在批评自己', score: 5 }
    ]
  },
  {
    id: 19,
    dimension: 'rumination',
    question: '如果社交中说错了话或做了尴尬的事，之后你会？',
    options: [
      { id: 1, text: '当时道歉或澄清，之后就忘了', score: 1 },
      { id: 2, text: '会记得但不太影响心情', score: 2 },
      { id: 3, text: '会反复回想并感到后悔', score: 3 },
      { id: 4, text: '严重自责，影响几天心情', score: 4 },
      { id: 5, text: '可能记住很久，难以释怀', score: 5 }
    ]
  },
  {
    id: 20,
    dimension: 'rumination',
    question: '社交活动结束后，你脑海中出现的想法更多是？',
    options: [
      { id: 1, text: '愉快的回忆和收获', score: 1 },
      { id: 2, text: '整体还不错', score: 2 },
      { id: 3, text: '好的坏的参半', score: 3 },
      { id: 4, text: '更多关注不好的部分', score: 4 },
      { id: 5, text: '全是负面想法和自我批评', score: 5 }
    ]
  },

  // Q21-Q25: 生理反应强度
  {
    id: 21,
    dimension: 'physical',
    question: '在社交场合中，你是否会感到心跳加速？',
    options: [
      { id: 1, text: '从不或几乎不会', score: 1 },
      { id: 2, text: '偶尔会，但很轻微', score: 2 },
      { id: 3, text: '经常会，比较明显', score: 3 },
      { id: 4, text: '总是会，心跳很快', score: 4 },
      { id: 5, text: '心跳剧烈，感觉要跳出来', score: 5 }
    ]
  },
  {
    id: 22,
    dimension: 'physical',
    question: '社交时，你是否会出汗（手心、额头等）？',
    options: [
      { id: 1, text: '不会', score: 1 },
      { id: 2, text: '偶尔会出一点', score: 2 },
      { id: 3, text: '经常会出汗', score: 3 },
      { id: 4, text: '总是大量出汗', score: 4 },
      { id: 5, text: '汗如雨下，需要频繁擦拭', score: 5 }
    ]
  },
  {
    id: 23,
    dimension: 'physical',
    question: '社交时，你的呼吸会有变化吗？',
    options: [
      { id: 1, text: '完全正常', score: 1 },
      { id: 2, text: '稍微急促但不影响', score: 2 },
      { id: 3, text: '明显急促或不顺畅', score: 3 },
      { id: 4, text: '感觉呼吸困难', score: 4 },
      { id: 5, text: '严重到需要刻意调整呼吸', score: 5 }
    ]
  },
  {
    id: 24,
    dimension: 'physical',
    question: '社交场合中，你是否会感到肌肉紧张或颤抖？',
    options: [
      { id: 1, text: '不会', score: 1 },
      { id: 2, text: '轻微紧张但不颤抖', score: 2 },
      { id: 3, text: '肌肉明显紧张', score: 3 },
      { id: 4, text: '会轻微颤抖', score: 4 },
      { id: 5, text: '颤抖明显，他人可能注意到', score: 5 }
    ]
  },
  {
    id: 25,
    dimension: 'physical',
    question: '社交时，你是否会出现肠胃不适（恶心、腹痛等）？',
    options: [
      { id: 1, text: '从不', score: 1 },
      { id: 2, text: '极少出现', score: 2 },
      { id: 3, text: '偶尔会有不适', score: 3 },
      { id: 4, text: '经常不适', score: 4 },
      { id: 5, text: '严重到影响参与社交', score: 5 }
    ]
  },

  // Q26-Q30: 社交自我效能
  {
    id: 26,
    dimension: 'self_efficacy',
    question: '你认为自己在社交场合的表现如何？',
    options: [
      { id: 1, text: '很好，能够自如应对', score: 5 },
      { id: 2, text: '还不错，大多数情况没问题', score: 4 },
      { id: 3, text: '一般般，能应付但不轻松', score: 3 },
      { id: 4, text: '不太好，经常感到困难', score: 2 },
      { id: 5, text: '很差，几乎总是表现不好', score: 1 }
    ]
  },
  {
    id: 27,
    dimension: 'self_efficacy',
    question: '面对新的社交场合，你对自己的信心如何？',
    options: [
      { id: 1, text: '很有信心，相信能处理好', score: 5 },
      { id: 2, text: '比较有信心', score: 4 },
      { id: 3, text: '信心一般', score: 3 },
      { id: 4, text: '缺乏信心', score: 2 },
      { id: 5, text: '完全没信心，觉得肯定搞砸', score: 1 }
    ]
  },
  {
    id: 28,
    dimension: 'self_efficacy',
    question: '你是否相信自己能够建立和维护良好的社交关系？',
    options: [
      { id: 1, text: '非常相信', score: 5 },
      { id: 2, text: '比较相信', score: 4 },
      { id: 3, text: '不太确定', score: 3 },
      { id: 4, text: '不太相信', score: 2 },
      { id: 5, text: '完全不相信', score: 1 }
    ]
  },
  {
    id: 29,
    dimension: 'self_efficacy',
    question: '当社交出现尴尬或困难时，你觉得自己能化解吗？',
    options: [
      { id: 1, text: '可以，我有办法应对', score: 5 },
      { id: 2, text: '大多数情况可以', score: 4 },
      { id: 3, text: '有时可以有时不行', score: 3 },
      { id: 4, text: '通常做不到', score: 2 },
      { id: 5, text: '完全做不到，会更糟', score: 1 }
    ]
  },
  {
    id: 30,
    dimension: 'self_efficacy',
    question: '总体而言，你如何评价自己的社交能力？',
    options: [
      { id: 1, text: '很强，是我的优势', score: 5 },
      { id: 2, text: '不错，能够胜任', score: 4 },
      { id: 3, text: '中等水平', score: 3 },
      { id: 4, text: '较弱，是我的短板', score: 2 },
      { id: 5, text: '很弱，几乎没有社交能力', score: 1 }
    ]
  }
]

export const dimensionInfo = {
  scene_fear: {
    name: '社交场景恐惧',
    desc: '在不同社交场景中的恐惧程度'
  },
  avoidance: {
    name: '回避行为程度',
    desc: '主动避免社交的倾向'
  },
  anticipation: {
    name: '预期焦虑强度',
    desc: '社交前的担忧和焦虑'
  },
  rumination: {
    name: '社交后反刍',
    desc: '社交后的反复回想和自责'
  },
  physical: {
    name: '生理反应强度',
    desc: '社交时的身体反应'
  },
  self_efficacy: {
    name: '社交自我效能',
    desc: '对自己社交能力的信心'
  }
}

