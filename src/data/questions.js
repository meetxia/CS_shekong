/**
 * 社恐测评题目数据 - 专业优化版
 * 
 * 基础信息题（6题）+ 测评题目（35题）
 * 
 * 测评维度分布：
 * - 社交场景恐惧（Q1-Q5）
 * - 回避行为程度（Q6-Q9）
 * - 预期焦虑强度（Q10-Q13）
 * - 负面评价恐惧（Q14-Q18）⭐新增核心维度
 * - 社交后反刍（Q19-Q22）
 * - 生理反应强度（Q23-Q25）
 * - 功能损害程度（Q26-Q29）⭐新增核心维度
 * - 社交自我效能（Q30-Q33）
 * - 效度检验题（Q34-Q35）⭐新增
 */

// ==================== 基础信息题 ====================
export const basicInfoQuestions = [
  {
    id: 'age',
    type: 'single',
    question: '你的年龄段是？',
    required: true,
    options: [
      { id: 1, text: '12-17岁', value: 'teen' },
      { id: 2, text: '18-22岁', value: 'college' },
      { id: 3, text: '23-29岁', value: 'young_adult' },
      { id: 4, text: '30-39岁', value: 'adult' },
      { id: 5, text: '40岁以上', value: 'mature' }
    ]
  },
  {
    id: 'gender',
    type: 'single',
    question: '你的性别是？',
    required: true,
    options: [
      { id: 1, text: '男', value: 'male' },
      { id: 2, text: '女', value: 'female' },
      { id: 3, text: '其他', value: 'other' }
    ]
  },
  {
    id: 'social_frequency',
    type: 'single',
    question: '每周社交频率？',
    required: true,
    options: [
      { id: 1, text: '几乎不参加', value: 'rarely' },
      { id: 2, text: '1-2次', value: 'occasional' },
      { id: 3, text: '3-4次', value: 'regular' },
      { id: 4, text: '5次以上', value: 'frequent' }
    ]
  },
  {
    id: 'zodiac',
    type: 'single',
    question: '你的星座是？',
    required: true,
    options: [
      { id: 1, text: '♈ 白羊座', value: 'aries' },
      { id: 2, text: '♉ 金牛座', value: 'taurus' },
      { id: 3, text: '♊ 双子座', value: 'gemini' },
      { id: 4, text: '♋ 巨蟹座', value: 'cancer' },
      { id: 5, text: '♌ 狮子座', value: 'leo' },
      { id: 6, text: '♍ 处女座', value: 'virgo' },
      { id: 7, text: '♎ 天秤座', value: 'libra' },
      { id: 8, text: '♏ 天蝎座', value: 'scorpio' },
      { id: 9, text: '♐ 射手座', value: 'sagittarius' },
      { id: 10, text: '♑ 摩羯座', value: 'capricorn' },
      { id: 11, text: '♒ 水瓶座', value: 'aquarius' },
      { id: 12, text: '♓ 双鱼座', value: 'pisces' }
    ]
  }
]

// ==================== 测评题目 ====================
export const questions = [
  // Q1-Q5: 社交场景恐惧
  {
    id: 1,
    dimension: 'scene_fear',
    question: '需要参加多人聚会时，你的第一反应是？',
    options: [
      { id: 1, text: '非常抗拒，想找理由推脱', score: 4 },
      { id: 2, text: '期待见到朋友，感到开心', score: 1 },
      { id: 3, text: '明显焦虑，需要心理准备', score: 3 },
      { id: 4, text: '绝对不会参加', score: 5 },
      { id: 5, text: '有些紧张但愿意参加', score: 2 }
    ]
  },
  {
    id: 2,
    dimension: 'scene_fear',
    question: '需要当面向陌生人询问信息时（如问路、咨询），你会？',
    options: [
      { id: 1, text: '能用手机查绝不开口问', score: 4 },
      { id: 2, text: '简单准备后询问', score: 2 },
      { id: 3, text: '宁愿绕路或放弃也不问', score: 5 },
      { id: 4, text: '直接询问，没有压力', score: 1 },
      { id: 5, text: '需要心理建设，反复斟酌措辞', score: 3 }
    ]
  },
  {
    id: 3,
    dimension: 'scene_fear',
    question: '在电梯或狭小空间里遇到陌生人时，你的感受是？',
    options: [
      { id: 1, text: '略有不适，但可以应对', score: 2 },
      { id: 2, text: '极度焦虑，想立刻离开', score: 5 },
      { id: 3, text: '完全自然，不会紧张', score: 1 },
      { id: 4, text: '明显紧张，避免眼神接触', score: 3 },
      { id: 5, text: '非常紧张，心跳加速', score: 4 }
    ]
  },
  {
    id: 4,
    dimension: 'scene_fear',
    question: '在公共场所（如咖啡厅、图书馆）独自坐着时，你会感到？',
    options: [
      { id: 1, text: '担心别人注意到我，很不自在', score: 3 },
      { id: 2, text: '非常放松，享受独处时光', score: 1 },
      { id: 3, text: '有点在意别人的眼光', score: 2 },
      { id: 4, text: '极度不适，总想快点离开', score: 5 },
      { id: 5, text: '很紧张，不敢抬头看周围', score: 4 }
    ]
  },
  {
    id: 5,
    dimension: 'scene_fear',
    question: '需要在会议或课堂上发言时，你的感觉是？',
    options: [
      { id: 1, text: '有点紧张但能够完成', score: 2 },
      { id: 2, text: '充满信心，愿意表达观点', score: 1 },
      { id: 3, text: '无法做到，会因此拒绝参加', score: 5 },
      { id: 4, text: '非常紧张，担心说错', score: 3 },
      { id: 5, text: '极度恐惧，能避免就避免', score: 4 }
    ]
  },

  // Q6-Q9: 回避行为程度
  {
    id: 6,
    dimension: 'avoidance',
    question: '收到社交邀请（聚会、活动等）时，你通常会？',
    options: [
      { id: 1, text: '根据心情和场合决定', score: 2 },
      { id: 2, text: '几乎总是拒绝', score: 4 },
      { id: 3, text: '欣然接受，期待参加', score: 1 },
      { id: 4, text: '会主动屏蔽这类信息', score: 5 },
      { id: 5, text: '经常找借口推脱', score: 3 }
    ]
  },
  {
    id: 7,
    dimension: 'avoidance',
    question: '逛街或超市购物时，遇到需要询问店员的情况？',
    options: [
      { id: 1, text: '找不到就直接放弃购买', score: 5 },
      { id: 2, text: '会询问但稍有犹豫', score: 2 },
      { id: 3, text: '能自己找就不问', score: 3 },
      { id: 4, text: '直接询问，没有顾虑', score: 1 },
      { id: 5, text: '宁愿多花时间也不问', score: 4 }
    ]
  },
  {
    id: 8,
    dimension: 'avoidance',
    question: '遇到需要排队办事的场景（如银行、政府部门），你会？',
    options: [
      { id: 1, text: '正常前往，按流程办理', score: 1 },
      { id: 2, text: '会因此一直拖延，直到不得不去', score: 5 },
      { id: 3, text: '一拖再拖，非常抗拒', score: 4 },
      { id: 4, text: '会提前准备减少交流', score: 2 },
      { id: 5, text: '尽量选择线上办理', score: 3 }
    ]
  },
  {
    id: 9,
    dimension: 'avoidance',
    question: '在社交场合中，你更倾向于？',
    options: [
      { id: 1, text: '尽量待在角落少说话', score: 3 },
      { id: 2, text: '主动与他人交谈', score: 1 },
      { id: 3, text: '找借口早点离开', score: 4 },
      { id: 4, text: '一开始就不会去', score: 5 },
      { id: 5, text: '等待他人主动但会回应', score: 2 }
    ]
  },

  // Q10-Q13: 预期焦虑强度
  {
    id: 10,
    dimension: 'anticipation',
    question: '知道明天要参加社交活动，今晚你会？',
    options: [
      { id: 1, text: '焦虑到想取消计划', score: 5 },
      { id: 2, text: '反复想象明天的场景', score: 3 },
      { id: 3, text: '稍微想一下明天的安排', score: 2 },
      { id: 4, text: '焦虑到难以入睡', score: 4 },
      { id: 5, text: '正常休息，没有特别想法', score: 1 }
    ]
  },
  {
    id: 11,
    dimension: 'anticipation',
    question: '面对一周后的重要社交场合（如面试、演讲），你会？',
    options: [
      { id: 1, text: '提前准备，但不会过度担心', score: 1 },
      { id: 2, text: '极度恐惧，考虑放弃', score: 5 },
      { id: 3, text: '持续焦虑，影响日常生活', score: 4 },
      { id: 4, text: '会时不时想起并感到紧张', score: 2 },
      { id: 5, text: '每天都在担心，影响心情', score: 3 }
    ]
  },
  {
    id: 12,
    dimension: 'anticipation',
    question: '在社交活动开始前的1小时，你通常是？',
    options: [
      { id: 1, text: '有些紧张但还好', score: 2 },
      { id: 2, text: '明显焦虑，坐立不安', score: 3 },
      { id: 3, text: '恐慌到身体不适', score: 5 },
      { id: 4, text: '保持平静，正常准备', score: 1 },
      { id: 5, text: '非常紧张，想找借口不去', score: 4 }
    ]
  },
  {
    id: 13,
    dimension: 'anticipation',
    question: '计划参加社交活动的前几天，你的睡眠质量会？',
    options: [
      { id: 1, text: '偶尔会想起但影响不大', score: 2 },
      { id: 2, text: '严重失眠，身心俱疲', score: 5 },
      { id: 3, text: '完全不受影响', score: 1 },
      { id: 4, text: '睡眠质量有所下降', score: 3 },
      { id: 5, text: '经常失眠或多梦', score: 4 }
    ]
  },

  // Q14-Q18: 负面评价恐惧 ⭐新增核心维度
  {
    id: 14,
    dimension: 'fear_of_negative_evaluation',
    question: '在社交场合中，你多担心"别人觉得我很奇怪"？',
    options: [
      { id: 1, text: '总是担心', score: 4 },
      { id: 2, text: '经常担心', score: 3 },
      { id: 3, text: '从不担心', score: 1 },
      { id: 4, text: '极度担心，这是我最大的恐惧', score: 5 },
      { id: 5, text: '偶尔担心', score: 2 }
    ]
  },
  {
    id: 15,
    dimension: 'fear_of_negative_evaluation',
    question: '当你意识到别人在看你时，你会？',
    options: [
      { id: 1, text: '不太在意，继续做自己的事', score: 1 },
      { id: 2, text: '恐慌，想立刻离开或躲起来', score: 5 },
      { id: 3, text: '有点不自在，但能应对', score: 2 },
      { id: 4, text: '非常焦虑，担心自己哪里不对', score: 4 },
      { id: 5, text: '明显紧张，会刻意调整行为', score: 3 }
    ]
  },
  {
    id: 16,
    dimension: 'fear_of_negative_evaluation',
    question: '你害怕在公共场合出丑或尴尬吗？',
    options: [
      { id: 1, text: '不太害怕，偶尔尴尬也能接受', score: 1 },
      { id: 2, text: '这是我最大的噩梦，极度恐惧', score: 5 },
      { id: 3, text: '有点害怕，但不会过度担心', score: 2 },
      { id: 4, text: '很害怕，会采取各种措施避免', score: 4 },
      { id: 5, text: '比较害怕，经常担心这个', score: 3 }
    ]
  },
  {
    id: 17,
    dimension: 'fear_of_negative_evaluation',
    question: '如果需要在众人面前吃东西或喝水，你会？',
    options: [
      { id: 1, text: '完全自然，不会多想', score: 1 },
      { id: 2, text: '稍微注意形象，但不紧张', score: 2 },
      { id: 3, text: '绝对不会，宁愿饿着', score: 5 },
      { id: 4, text: '很紧张，担心被人注意', score: 3 },
      { id: 5, text: '极度不适，手会抖', score: 4 }
    ]
  },
  {
    id: 18,
    dimension: 'fear_of_negative_evaluation',
    question: '你担心自己的穿着、外貌被别人评价吗？',
    options: [
      { id: 1, text: '会花很多时间担心这个', score: 4 },
      { id: 2, text: '基本不担心', score: 1 },
      { id: 3, text: '有点在意，但不会过度焦虑', score: 2 },
      { id: 4, text: '极度担心，每次出门都很焦虑', score: 5 },
      { id: 5, text: '比较担心，会反复检查确认', score: 3 }
    ]
  },

  // Q19-Q22: 社交后反刍
  {
    id: 19,
    dimension: 'rumination',
    question: '社交活动结束后，你会？',
    options: [
      { id: 1, text: '反复回想自己的表现', score: 3 },
      { id: 2, text: '会持续懊悔好几天', score: 5 },
      { id: 3, text: '很快就不再想这件事', score: 1 },
      { id: 4, text: '不断懊悔说错的话', score: 4 },
      { id: 5, text: '简单回顾一下就过去了', score: 2 }
    ]
  },
  {
    id: 20,
    dimension: 'rumination',
    question: '回想起社交中的"尴尬时刻"时，你会？',
    options: [
      { id: 1, text: '甚至会因此失眠', score: 5 },
      { id: 2, text: '一笑而过，不太在意', score: 1 },
      { id: 3, text: '非常痛苦，自责不已', score: 4 },
      { id: 4, text: '稍微尴尬但能接受', score: 2 },
      { id: 5, text: '反复回想，感到难受', score: 3 }
    ]
  },
  {
    id: 21,
    dimension: 'rumination',
    question: '如果社交中说错了话或做了尴尬的事，之后你会？',
    options: [
      { id: 1, text: '会记得但不太影响心情', score: 2 },
      { id: 2, text: '当时道歉或澄清，之后就忘了', score: 1 },
      { id: 3, text: '可能记住很久，难以释怀', score: 5 },
      { id: 4, text: '会反复回想并感到后悔', score: 3 },
      { id: 5, text: '严重自责，影响几天心情', score: 4 }
    ]
  },
  {
    id: 22,
    dimension: 'rumination',
    question: '社交活动结束后，你脑海中出现的想法更多是？',
    options: [
      { id: 1, text: '好的坏的参半', score: 3 },
      { id: 2, text: '愉快的回忆和收获', score: 1 },
      { id: 3, text: '全是负面想法和自我批评', score: 5 },
      { id: 4, text: '整体还不错', score: 2 },
      { id: 5, text: '更多关注不好的部分', score: 4 }
    ]
  },

  // Q23-Q25: 生理反应强度
  {
    id: 23,
    dimension: 'physical',
    question: '在社交场合中，你的心跳和出汗情况是？',
    options: [
      { id: 1, text: '从不或几乎不会心跳加速和出汗', score: 1 },
      { id: 2, text: '总是心跳很快，大量出汗', score: 4 },
      { id: 3, text: '心跳剧烈，汗如雨下，需要频繁擦拭', score: 5 },
      { id: 4, text: '偶尔会，但很轻微', score: 2 },
      { id: 5, text: '经常心跳加速和出汗，比较明显', score: 3 }
    ]
  },
  {
    id: 24,
    dimension: 'physical',
    question: '社交时，你的呼吸和肌肉状态是？',
    options: [
      { id: 1, text: '呼吸急促，肌肉明显紧张或颤抖', score: 4 },
      { id: 2, text: '完全正常，身体放松', score: 1 },
      { id: 3, text: '稍微急促和紧张，但不影响', score: 2 },
      { id: 4, text: '严重呼吸困难，颤抖明显他人可见', score: 5 },
      { id: 5, text: '明显呼吸不顺，肌肉紧张', score: 3 }
    ]
  },
  {
    id: 25,
    dimension: 'physical',
    question: '社交时，你是否会出现肠胃不适、头晕或其他身体症状？',
    options: [
      { id: 1, text: '从不出现', score: 1 },
      { id: 2, text: '严重到影响参与社交', score: 5 },
      { id: 3, text: '偶尔会有不适', score: 3 },
      { id: 4, text: '极少出现', score: 2 },
      { id: 5, text: '经常不适', score: 4 }
    ]
  },

  // Q26-Q29: 功能损害程度 ⭐新增核心维度
  {
    id: 26,
    dimension: 'functional_impairment',
    question: '社交焦虑对你的工作/学习造成了多大影响？',
    options: [
      { id: 1, text: '中度影响，有些任务难以完成', score: 3 },
      { id: 2, text: '没有影响', score: 1 },
      { id: 3, text: '轻微影响，但能完成任务', score: 2 },
      { id: 4, text: '极严重，已影响职业/学业发展', score: 5 },
      { id: 5, text: '严重影响，经常无法完成', score: 4 }
    ]
  },
  {
    id: 27,
    dimension: 'functional_impairment',
    question: '因为社交焦虑，你是否错过了重要的机会（如面试、聚会、活动）？',
    options: [
      { id: 1, text: '从未错过', score: 1 },
      { id: 2, text: '错过了很多重要机会', score: 4 },
      { id: 3, text: '几乎所有机会都会错过', score: 5 },
      { id: 4, text: '偶尔错过', score: 2 },
      { id: 5, text: '经常错过', score: 3 }
    ]
  },
  {
    id: 28,
    dimension: 'functional_impairment',
    question: '社交焦虑对你的人际关系（友情、恋爱、家庭）影响有多大？',
    options: [
      { id: 1, text: '严重影响，很难维持关系', score: 4 },
      { id: 2, text: '有一些影响，但还能维持', score: 2 },
      { id: 3, text: '几乎没有影响', score: 1 },
      { id: 4, text: '极度严重，几乎没有亲密关系', score: 5 },
      { id: 5, text: '中度影响，关系质量下降', score: 3 }
    ]
  },
  {
    id: 29,
    dimension: 'functional_impairment',
    question: '你是否因为社交焦虑而感到生活质量明显下降？',
    options: [
      { id: 1, text: '完全没有，生活很正常', score: 1 },
      { id: 2, text: '严重下降，很多事情做不了', score: 4 },
      { id: 3, text: '稍微有点影响', score: 2 },
      { id: 4, text: '极度严重，生活受到重大限制', score: 5 },
      { id: 5, text: '有明显影响', score: 3 }
    ]
  },

  // Q30-Q33: 社交自我效能（反向计分，算法处理）
  {
    id: 30,
    dimension: 'self_efficacy',
    question: '你认为自己在社交场合的表现如何？',
    options: [
      { id: 1, text: '一般般，能应付但不轻松', score: 3 },
      { id: 2, text: '很差，几乎总是表现不好', score: 5 },
      { id: 3, text: '很好，能够自如应对', score: 1 },
      { id: 4, text: '不太好，经常感到困难', score: 4 },
      { id: 5, text: '还不错，大多数情况没问题', score: 2 }
    ]
  },
  {
    id: 31,
    dimension: 'self_efficacy',
    question: '面对新的社交场合，你对自己的信心如何？',
    options: [
      { id: 1, text: '完全没信心，觉得肯定搞砸', score: 5 },
      { id: 2, text: '比较有信心', score: 2 },
      { id: 3, text: '信心一般', score: 3 },
      { id: 4, text: '缺乏信心', score: 4 },
      { id: 5, text: '很有信心，相信能处理好', score: 1 }
    ]
  },
  {
    id: 32,
    dimension: 'self_efficacy',
    question: '当社交出现尴尬或困难时，你觉得自己能化解吗？',
    options: [
      { id: 1, text: '大多数情况可以', score: 2 },
      { id: 2, text: '有时可以有时不行', score: 3 },
      { id: 3, text: '完全做不到，会更糟', score: 5 },
      { id: 4, text: '可以，我有办法应对', score: 1 },
      { id: 5, text: '通常做不到', score: 4 }
    ]
  },
  {
    id: 33,
    dimension: 'self_efficacy',
    question: '总体而言，你如何评价自己的社交能力？',
    options: [
      { id: 1, text: '不错，能够胜任', score: 2 },
      { id: 2, text: '很强，是我的优势', score: 1 },
      { id: 3, text: '很弱，几乎没有社交能力', score: 5 },
      { id: 4, text: '中等水平', score: 3 },
      { id: 5, text: '较弱，是我的短板', score: 4 }
    ]
  },

  // Q34-Q35: 效度检验题 ⭐新增
  {
    id: 34,
    dimension: 'validity_check',
    question: '过去一年里，你在社交场合中是否从未感到过一丝紧张或不适？',
    options: [
      { id: 1, text: '是的，我从未紧张过（完全不符合实际）', score: -999 }, // 标记为疑似无效作答
      { id: 2, text: '偶尔会紧张', score: 0 },
      { id: 3, text: '经常会紧张', score: 0 },
      { id: 4, text: '总是紧张', score: 0 },
      { id: 5, text: '不确定', score: 0 }
    ]
  },
  {
    id: 35,
    dimension: 'validity_check',
    question: '你是否认真阅读了每道题目并根据真实情况作答？',
    options: [
      { id: 1, text: '是的，我认真作答了', score: 0 },
      { id: 2, text: '大部分认真作答', score: 0 },
      { id: 3, text: '有些题目随意选的', score: -888 }, // 标记为疑似低质量作答
      { id: 4, text: '基本随便选的', score: -888 },
      { id: 5, text: '完全随机选择', score: -888 }
    ]
  }
]

// ==================== 维度信息 ====================
export const dimensionInfo = {
  scene_fear: {
    name: '社交场景恐惧',
    desc: '在不同社交场景中的恐惧程度',
    questionCount: 5,
    maxScore: 25,
    icon: '😰'
  },
  avoidance: {
    name: '回避行为程度',
    desc: '主动避免社交的倾向',
    questionCount: 4,
    maxScore: 20,
    icon: '🚪'
  },
  anticipation: {
    name: '预期焦虑强度',
    desc: '社交前的担忧和焦虑',
    questionCount: 4,
    maxScore: 20,
    icon: '⏰'
  },
  fear_of_negative_evaluation: {
    name: '负面评价恐惧',
    desc: '害怕被批评、被负面评价的程度',
    questionCount: 5,
    maxScore: 25,
    icon: '👀'
  },
  rumination: {
    name: '社交后反刍',
    desc: '社交后的反复回想和自责',
    questionCount: 4,
    maxScore: 20,
    icon: '🔄'
  },
  physical: {
    name: '生理反应强度',
    desc: '社交时的身体反应',
    questionCount: 3,
    maxScore: 15,
    icon: '💓'
  },
  functional_impairment: {
    name: '功能损害程度',
    desc: '对工作、学习、人际关系的影响',
    questionCount: 4,
    maxScore: 20,
    icon: '📉'
  },
  self_efficacy: {
    name: '社交自我效能',
    desc: '对自己社交能力的信心（分数越高越缺乏信心）',
    questionCount: 4,
    maxScore: 20,
    icon: '💪'
  },
  validity_check: {
    name: '效度检验',
    desc: '检测作答质量',
    questionCount: 2,
    maxScore: 0,
    icon: '✅'
  }
}

// ==================== 评分标准 ====================
export const scoringCriteria = {
  totalMaxScore: 100, // 100分制
  levels: [
    {
      range: [0, 30],
      level: 'normal',
      title: '社交自如型',
      color: '#10b981', // 绿色
      desc: '你在社交场合中表现自然，很少感到焦虑'
    },
    {
      range: [31, 50],
      level: 'mild',
      title: '轻度社交焦虑',
      color: '#3b82f6', // 蓝色
      desc: '你在某些社交中会感到紧张，但总体可控。'
    },
    {
      range: [51, 70],
      level: 'moderate',
      title: '中度社交焦虑',
      color: '#f59e0b', // 橙色
      desc: '已经明显影响你的日常生活'
    },
    {
      range: [71, 90],
      level: 'severe',
      title: '重度社交焦虑',
      color: '#ef4444', // 红色
      desc: '严重影响了你的生活'
    },
    {
      range: [91, 100],
      level: 'extreme',
      title: '极重度社交焦虑',
      color: '#991b1b', // 深红色
      desc: '建议尽快咨询专业心理医生。'
    }
  ]
}

// ==================== 免责声明和帮助信息 ====================
export const disclaimerInfo = {
  title: '重要提示',
  content: [
    '• 本测试仅供自我了解和参考，不能替代专业心理诊断',
    '• 社交焦虑是可以改善和治愈的，请不要过度担心',
    '• 如果测试结果显示中度以上焦虑，建议咨询专业心理咨询师',
    '• 你的测试数据将被严格保密，仅用于生成个人报告'
  ],
  helpline: {
    title: '如需帮助，可联系：',
    phones: [
      { name: '全国心理援助热线', number: '12355' },
      { name: '北京心理危机干预热线', number: '010-82951332' },
      { name: '上海心理援助热线', number: '021-12320-5' }
    ],
    suggestion: '建议预约正规医院心理科或精神科门诊'
  }
}

export default questions
