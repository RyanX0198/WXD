// 参照DESIGN_SYSTEM.md 数据配置规范
import { DocumentTypeConfig, WritingStyleConfig, WritingToneConfig } from '../types/writing';

export const documentTypes: DocumentTypeConfig[] = [
  {
    id: 'official',
    name: '政务公文',
    description: '政府机关、事业单位正式文件',
    icon: '📋',
    promptTemplate: `请以政务公文的规范格式撰写一篇关于"{topic}"的公文。
要求：
1. 符合《党政机关公文处理工作条例》格式规范
2. 使用规范的政治术语和公文用语
3. 结构完整，包含标题、正文、落款
4. 语言庄重、准确、简洁
5. 字数要求：{wordCount}字左右

关键词：{keywords}
写作风格：{style}
语气基调：{tone}
特殊要求：{requirements}`,
    writingTips: [
      '开头简明扼要，直接点明发文目的',
      '使用规范公文用语："根据..."、"现将..."、"请..."',
      '避免口语化表达，不使用网络用语',
      '段落层次清晰，使用规范的结构层次序数',
      '结尾使用规范结束语'
    ],
    structureHints: [
      '标题：发文机关 + 事由 + 文种',
      '正文：开头（缘由）→ 主体（事项）→ 结尾（要求）',
      '落款：发文机关署名 + 成文日期'
    ],
    exampleTitles: [
      '关于开展2024年度安全生产检查工作的通知',
      '关于进一步加强疫情防控工作的通知',
      '关于印发《XX市数字经济发展规划》的通知'
    ]
  },
  {
    id: 'news',
    name: '新闻通稿',
    description: '新闻发布、媒体宣传稿件',
    icon: '📰',
    promptTemplate: `请以新闻通稿的格式撰写一篇关于"{topic}"的新闻稿。
要求：
1. 采用倒金字塔结构，重要信息前置
2. 包含新闻五要素：何时、何地、何人、何事、为何
3. 语言客观、准确、简洁
4. 标题吸引眼球，导语概括核心内容
5. 字数要求：{wordCount}字左右

关键词：{keywords}
写作风格：{style}
语气基调：{tone}
特殊要求：{requirements}`,
    writingTips: [
      '标题要简洁有力，突出新闻点',
      '导语段控制在100字以内，回答5W1H',
      '使用第三人称，保持客观中立',
      '直接引语增加可信度',
      '避免主观评价和感情色彩词汇'
    ],
    structureHints: [
      '标题：主标题 + 副标题（可选）',
      '导语：概括最重要的事实',
      '主体：按重要性递减排列',
      '背景：提供相关背景信息',
      '结尾：总结或展望'
    ],
    exampleTitles: [
      '我市成功举办首届数字经济高峰论坛',
      'XX区推出"一窗通办"政务服务新模式',
      '我市一季度GDP增长6.5% 实现"开门红"'
    ]
  },
  {
    id: 'summary',
    name: '工作总结',
    description: '年度/季度/月度工作总结报告',
    icon: '📊',
    promptTemplate: `请撰写一篇关于"{topic}"的工作总结。
要求：
1. 全面回顾工作，客观评价成绩与不足
2. 数据支撑，用事实说话
3. 条理清晰，层次分明
4. 提出下一步工作计划
5. 字数要求：{wordCount}字左右

关键词：{keywords}
写作风格：{style}
语气基调：{tone}
特殊要求：{requirements}`,
    writingTips: [
      '成绩要实事求是，不夸大不缩小',
      '问题分析要深入，找准症结',
      '使用具体数据和事例支撑观点',
      '经验总结要有推广价值',
      '工作计划要具体可操作'
    ],
    structureHints: [
      '标题：单位/部门 + 时间范围 + 工作总结',
      '前言：概述工作背景和目标',
      '主体：主要工作及成效 → 存在的问题 → 经验体会',
      '结尾：下一步工作计划'
    ],
    exampleTitles: [
      'XX局2024年上半年工作总结',
      '数字化转型专项工作总结',
      '优化营商环境工作年度报告'
    ]
  },
  {
    id: 'speech',
    name: '领导讲话',
    description: '会议发言、致辞、动员讲话',
    icon: '🎤',
    promptTemplate: `请撰写一篇关于"{topic}"的领导讲话稿。
要求：
1. 立场鲜明，体现政治站位',
2. 语言生动，有感染力',
3. 结构严谨，逻辑清晰',
4. 贴近实际，有针对性',
5. 字数要求：{wordCount}字左右

关键词：{keywords}
写作风格：{style}
语气基调：{tone}
特殊要求：{requirements}`,
    writingTips: [
      '开头要有称呼和问候，体现亲和力',
      '站位要高，体现战略思维',
      '使用排比、对偶等修辞增强气势',
      '适当使用"我们要..."、"同志们..."等呼告语',
      '结尾要有号召性'
    ],
    structureHints: [
      '开场：称呼 + 问候 + 开场白',
      '第一部分：肯定成绩/阐述背景',
      '第二部分：分析问题/提出任务',
      '第三部分：工作部署/具体要求',
      '结束语：号召 + 祝愿'
    ],
    exampleTitles: [
      '在全市招商引资工作会议上的讲话',
      '在数字经济动员大会上的致辞',
      '在机关作风建设推进会上的讲话'
    ]
  },
  {
    id: 'notice',
    name: '通知公告',
    description: '公示、通告、事项通知',
    icon: '📢',
    promptTemplate: `请撰写一篇关于"{topic}"的通知公告。
要求：
1. 内容简明扼要，重点突出',
2. 格式规范，要素齐全',
3. 语言准确，无歧义',
4. 执行要求明确具体',
5. 字数要求：{wordCount}字左右

关键词：{keywords}
写作风格：{style}
语气基调：{tone}
特殊要求：{requirements}`,
    writingTips: [
      '标题要准确概括通知内容',
      '正文开门见山，直接说明事由',
      '执行要求分条列项，清晰明了',
      '时间、地点、联系人等信息完整',
      '附件说明清楚'
    ],
    structureHints: [
      '标题：发文机关 + 关于...的 + 通知',
      '主送机关：明确受文单位',
      '正文：缘由 → 事项 → 执行要求',
      '附件：如有附件，列明清单'
    ],
    exampleTitles: [
      '关于举办2024年政务公开培训班的通知',
      '关于调整办公时间的公告',
      '关于征集优化营商环境建议的通告'
    ]
  },
  {
    id: 'report',
    name: '调研报告',
    description: '专题调研、情况汇报',
    icon: '📑',
    promptTemplate: `请撰写一篇关于"{topic}"的调研报告。
要求：
1. 调研方法科学，数据真实可靠',
2. 问题分析深入，找准症结',
3. 建议具体可行，有针对性',
4. 结构完整，论证充分',
5. 字数要求：{wordCount}字左右

关键词：{keywords}
写作风格：{style}
语气基调：{tone}
特殊要求：{requirements}`,
    writingTips: [
      '前言说明调研背景、目的和方法',
      '现状描述要客观全面',
      '问题分析要深入本质',
      '对策建议要具体可操作',
      '适当使用图表辅助说明'
    ],
    structureHints: [
      '标题：关于...的调研报告',
      '摘要：概述主要发现和结论',
      '正文：调研背景 → 现状分析 → 问题梳理 → 对策建议',
      '附录：调研问卷/数据统计'
    ],
    exampleTitles: [
      '关于我市中小微企业融资难问题的调研报告',
      '关于基层治理数字化转型的调研报告',
      '关于人才引进政策实施效果的调研报告'
    ]
  }
];

export const writingStyles: WritingStyleConfig[] = [
  {
    id: 'formal',
    name: '正式庄重',
    description: '语言规范严谨，适合公文、报告',
    characteristics: ['用词精准', '句式工整', '逻辑严密', '符合规范'],
    suitableFor: ['official', 'report', 'notice']
  },
  {
    id: 'concise',
    name: '简洁凝练',
    description: '言简意赅，直奔主题',
    characteristics: ['简短有力', '去繁就简', '重点突出', '高效传达'],
    suitableFor: ['news', 'notice', 'official']
  },
  {
    id: 'vivid',
    name: '生动形象',
    description: '语言活泼，富有感染力',
    characteristics: ['比喻恰当', '事例丰富', '语言鲜活', '引人入胜'],
    suitableFor: ['speech', 'news', 'summary']
  },
  {
    id: 'rigorous',
    name: '严谨规范',
    description: '论述严密，数据准确',
    characteristics: ['论证充分', '数据详实', '引用规范', '结论可靠'],
    suitableFor: ['report', 'summary', 'official']
  },
  {
    id: 'approachable',
    name: '平易近人',
    description: '通俗易懂，接地气',
    characteristics: ['口语自然', '贴近群众', '易于理解', '亲和力强'],
    suitableFor: ['speech', 'news', 'notice']
  }
];

export const writingTones: WritingToneConfig[] = [
  {
    id: 'authoritative',
    name: '权威型',
    description: '体现决策权威，具有约束力',
    keywords: ['必须', '务必', '严格', '坚决', '确保']
  },
  {
    id: 'guiding',
    name: '指导型',
    description: '提供工作指导，明确方向',
    keywords: ['应当', '建议', '参考', '结合', '因地制宜']
  },
  {
    id: 'encouraging',
    name: '鼓励型',
    description: '激励士气，调动积极性',
    keywords: ['希望', '期待', '相信', '共同', '奋斗']
  },
  {
    id: 'neutral',
    name: '中性型',
    description: '客观陈述，不偏不倚',
    keywords: ['现将', '有关', '相关', '予以', ' accordingly']
  },
  {
    id: 'urgent',
    name: '紧迫型',
    description: '强调时效，加快落实',
    keywords: ['立即', '抓紧', '尽快', '马上', '限时']
  }
];

// 字数选项
export const wordCountOptions = [
  { value: 500, label: '短文 (500字)' },
  { value: 800, label: '标准 (800字)' },
  { value: 1200, label: '详实 (1200字)' },
  { value: 2000, label: '长篇 (2000字)' },
  { value: 3000, label: '专题 (3000字)' }
];
