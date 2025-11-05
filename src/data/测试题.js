/**
 * 社恐测评题目数据 - 完整优化版
 * 
 * 基础信息题（6题）+ 测评题目（44题）
 * 
 * 测评维度分布：
 * - 社交场景恐惧（Q1-Q8）
 * - 回避行为程度（Q9-Q13）
 * - 预期焦虑强度（Q14-Q17）
 * - 负面评价恐惧（Q18-Q22）
 * - 社交后反刍（Q23-Q26）
 * - 生理反应强度（Q27-Q29）
 * - 功能损害程度（Q30-Q33）
 * - 社交自我效能（Q34-Q37）
 * - 效度检验题（Q38-Q39）
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
  },
  {
    id: 'platform_usage',
    type: 'single',
    question: '你使用小红书的频率是？',
    required: true,
    options: [
      { id: 1, text: '几乎不使用', value: 'rarely' },
      { id: 2, text: '每周1-2次', value: 'occasional' },
      { id: 3, text: '每周3-5次', value: 'regular' },
      { id: 4, text: '每天使用', value: 'daily' }
    ]
  },
  {
    id: 'social_type',
    type: 'single',
    question: '你更倾向于哪种社交模式？',
    required: true,
    options: [
      { id: 1, text: '独处为主，很少社交', value: 'introvert_heavy' },
      { id: 2, text: '偏好小范围深度社交', value: 'introvert_light' },
      { id: 3, text: '两者平衡，视情况而定', value: 'balanced' },
      { id: 4, text: '喜欢广泛社交，朋友众多', value: 'extrovert_light' },
      { id: 5, text: '社交是主要能量来源', value: 'extrovert_heavy' }
    ]
  }
]

// ==================== 测评题目 ====================
export const questions = [
  // Q1-Q8: 社交场景恐惧（含新增场景）
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
  {
    id: 6,
    dimension: 'scene_fear',
    question: '发布带本人出镜的小红书笔记后，你会？',
    options: [
      { id: 1, text: '反复检查评论，担心负面评价', score: 4 },
      { id: 2, text: '设置仅粉丝可见，减少暴露', score: 3 },
      { id: 3, text: '完全不纠结，发完就忘', score: 1 },
      { id: 4, text: '焦虑到删帖，再也不发本人内容', score: 5 },
      { id: 5, text: '有点在意但能接受不同声音', score: 2 }
    ]
  },
  {
    id: 7,
    dimension: 'scene_fear',
    question: '接到陌生电话（如快递、客服）时，你会？',
    options: [
      { id: 1, text: '响到自动挂断，宁愿回短信', score: 5 },
      { id: 2, text: '深吸一口气再接，提前想好话术', score: 3 },
      { id: 3, text: '直接接，自然沟通', score: 1 },
      { id: 4, text: '有点紧张，但能说清需求', score: 2 },
      { id: 5, text: '接起后声音发抖，表达不流畅', score: 4 }
    ]
  },
  {
    id: 8,
    dimension: 'scene_fear',
    question: '和不太熟的人视频通话（如工作汇报、远房亲戚）时，你会？',
    options: [
      { id: 1, text: '全程盯着屏幕角落，不敢对视', score: 4 },
      { id: 2, text: '提前调整角度/灯光，怕显丑', score: 3 },
      { id: 3, text: '自然交流，和面对面一样', score: 1 },
      { id: 4, text: '尽量开语音模式，避免露脸', score: 5 },
      { id: 5, text: '有点不自在，但能保持基本互动', score: 2 }
    ]
  },

  // Q9-Q13: 回避行为程度（含新增场景）
  {
    id: 9,
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
    id: 10,
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
    id: 11,
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
    id: 12,
    dimension: 'avoidance',
    question: '收到陌生人的小红书私信时，你会？',
    options: [
      { id: 1, text: '已读不回，假装没看见', score: 3 },
      { id: 2, text: '立刻回复，怕对方觉得不礼貌', score: 2 },
      { id: 3, text: '直接关闭私信功能，避免麻烦', score: 5 },
      { id: 4, text: '自然互动，不觉得有压力', score: 1 },
      { id: 5, text: '纠结很久才回复，担心说错话', score: 4 }
    ]
  },
  {
    id: 13,
    dimension: 'avoidance',
    question: '突然接到视频通话邀请时，你的第一反应是？',
    options: [
      { id: 1, text: '立刻挂断，说“网络不好”', score: 5 },
      { id: 2, text: '整理下仪容再接，延迟10秒', score: 3 },
      { id: 3, text: '直接接，不在意状态', score: 1 },
      { id: 4, text: '切换成语音后再接', score: 4 },
      { id: 5, text: '有点慌乱，但还是会接', score: 2 }
    ]
  },

  // Q14-Q17: 预期焦虑强度（含新增场景）
  {
    id: 14,
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
    id: 15,
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
    id: 16,
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
    id: 17,
    dimension: 'anticipation',
    question: '被邀请参加小红书线下活动（如博主面基）时，你会？',
    options: [
      { id: 1, text: '提前几天就焦虑，反复确认流程', score: 4 },
      { id: 2, text: '找借口拒绝，宁愿线上互动', score: 5 },
      { id: 3, text: '轻松接受，期待认识同好', score: 1 },
      { id: 4, text: '有点紧张，但会说服自己参加', score: 2 },
      { id: 5, text: '要求朋友陪同才敢去', score: 3 }
    ]
  },

  // Q18-Q22: 负面评价恐惧
  {
    id: 18,
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
    id: 19,
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
    id: 20,
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
    id: 21,
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
    id: 22,
    dimension: 'fear_of_negative_evaluation',
    question: '当别人突然对你的穿搭/发型评价时（如“你今天好特别”），你会？',
    options: [
      { id: 1, text: '尴尬到语塞，想立刻转移话题', score: 4 },
      { id: 2, text: '大方感谢，不觉得有压力', score: 1 },
      { id: 3, text: '怀疑对方在讽刺，反复回想', score: 5 },
      { id: 4, text: '礼貌回应，但内心有点紧张', score: 2 },
      { id: 5, text: '担心自己哪里不合适，回家后换掉', score: 3 }
    ]
  },

  // Q23-Q26: 社交后反刍
  {
    id: 23,
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
    id: 24,
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
    id: 25,
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
    id: 26,
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

  // Q27-Q29: 生理反应强度
  {
    id: 27,
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
    id: 28,
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
    id: 29,
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

  // Q30-Q33: 功能损害程度（含新增场景）
  {
    id: 30,
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
    id: 31,
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
    id: 32,
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
    id: 33,
    dimension: 'functional_impairment',
    question: '参加完3人以上的聚会后，你需要多久恢复精力？',
    options: [
      { id: 1, text: '1-2天，期间不想说话', score: 4 },
      { id: 2, text: '几小时，独处一会儿就好', score: 2 },
      { id: 3, text: '完全不需要恢复，还能继续玩', score: 1 },
      { id: 4, text: '3天以上，会感到极度疲惫', score: 5 },
      { id: 5, text: '半天左右，需要安静环境', score: 3 }
    ]
  },

  // Q34-Q37: 社交自我效能（反向计分，算法处理）
  {
    id: 34,
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
    id: 35,
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
    id: 36,
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
    id: 37,
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

  // Q38-Q39: 效度检验题
  {
    id: 38,
    dimension: 'validity_check',
    question: '过去一年里，你在社交场合中是否从未感到过一丝紧张或不适？',
    options: [
      { id: 1, text: '是的，我从未紧张过（完全不符合实际）', score: -999 },
      { id: 2, text: '偶尔会紧张', score: 0 },
      { id: 3, text: '经常会紧张', score: 0 },
      { id: 4, text: '总是紧张', score: 0 },
      { id: 5, text: '不确定', score: 0 }
    ]
  },
  {
    id: 39,
    dimension: 'validity_check',
    question: '你是否认真阅读了每道题目并根据真实情况作答？',
    options: [
      { id: 1, text: '是的，我认真作答了', score: 0 },
      { id: 2, text: '大部分认真作答', score: 0 },
      { id: 3, text: '有些题目随意选的', score: -888 },
      { id: 4, text: '基本随便选的', score: -888 },
      { id: 5, text: '完全随机选择', score: -888 }
    ]
  },

  // Q40: I人特质专项题
  {
    id: 40,
    dimension: 'introvert_trait',
    question: '被朋友临时约出门（如“现在出来喝杯咖啡吗”），你会？',
    options: [
      { id: 1, text: '找借口拒绝，需要提前规划', score: 4 },
      { id: 2, text: '愉快答应，随时能出门', score: 1 },
      { id: 3, text: '虽然不想去，但怕扫兴只好答应', score: 3 },
      { id: 4, text: '直接说“今天想独处”', score: 2 },
      { id: 5, text: '假装没看见消息，事后再解释', score: 5 }
    ]
  }
]

// ==================== 维度信息 ====================
export const dimensionInfo = {
  scene_fear: {
    name: '社交场景恐惧',
    desc: '在不同社交场景中的恐惧程度（含线上线下、视频电话场景）',
    questionCount: 8,
    maxScore: 40,
    icon: '😰'
  },
  avoidance: {
    name: '回避行为程度',
    desc: '主动避免社交的倾向（含线上互动回避）',
    questionCount: 5,
    maxScore: 25,
    icon: '🚪'
  },
  anticipation: {
    name: '预期焦虑强度',
    desc: '社交前的担忧和焦虑（含特定场景预期）',
    questionCount: 4,
    maxScore: 20,
    icon: '⏳'
  },
  fear_of_negative_evaluation: {
    name: '负面评价恐惧',
    desc: '对他人负面评价的担忧程度',
    questionCount: 5,
    maxScore: 25,
    icon: '👀'
  },
  rumination: {
    name: '社交后反刍',
    desc: '社交后对自身表现的反复回想',
    questionCount: 4,
    maxScore: 20,
    icon: '🔄'
  },
  physical: {
    name: '生理反应强度',
    desc: '社交时的身体不适反应',
    questionCount: 3,
    maxScore: 15,
    icon: '💓'
  },
  functional_impairment: {
    name: '功能损害程度',
    desc: '社交焦虑对生活功能的影响（含能量恢复）',
    questionCount: 4,
    maxScore: 20,
    icon: '🛡️'
  },
  self_efficacy: {
    name: '社交自我效能',
    desc: '对自身社交能力的信心（反向计分）',
    questionCount: 4,
    maxScore: 20,
    icon: '💪'
  },
  validity_check: {
    name: '作答效度检验',
    desc: '检验作答的真实性和有效性',
    questionCount: 2,
    maxScore: 0,
    icon: '✅'
  },
  introvert_trait: {
    name: '内向特质倾向',
    desc: '内向者特有的社交行为模式',
    questionCount: 1,
    maxScore: 5,
    icon: '🌙'
  }
}
