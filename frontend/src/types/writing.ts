// 参照DESIGN_SYSTEM.md 类型定义规范

export type DocumentType = 
  | 'official'      // 政务公文
  | 'news'          // 新闻通稿
  | 'summary'       // 工作总结
  | 'speech'        // 领导讲话
  | 'notice'        // 通知公告
  | 'report';       // 调研报告

export type WritingStyle = 
  | 'formal'        // 正式庄重
  | 'concise'       // 简洁凝练
  | 'vivid'         // 生动形象
  | 'rigorous'      // 严谨规范
  | 'approachable'; // 平易近人

export type WritingTone = 
  | 'authoritative' // 权威型
  | 'guiding'       // 指导型
  | 'encouraging'   // 鼓励型
  | 'neutral'       // 中性型
  | 'urgent';       // 紧迫型

// 去AI味相关类型
export type HumanizeLevel = 
  | 'light'   // 轻度：减少套话，保留结构
  | 'medium'  // 中度：口语化表达，打破规整
  | 'deep';   // 深度：彻底人性化改写

export interface DocumentTypeConfig {
  id: DocumentType;
  name: string;
  description: string;
  icon: string;
  promptTemplate: string;
  writingTips: string[];
  structureHints: string[];
  exampleTitles: string[];
}

export interface WritingStyleConfig {
  id: WritingStyle;
  name: string;
  description: string;
  characteristics: string[];
  suitableFor: DocumentType[];
}

export interface WritingToneConfig {
  id: WritingTone;
  name: string;
  description: string;
  keywords: string[];
}

export interface WritingRequest {
  documentType: DocumentType;
  style: WritingStyle;
  tone: WritingTone;
  topic: string;
  keywords: string[];
  wordCount: number;
  requirements: string;
  // 去AI味相关字段
  humanize?: {
    enabled: boolean;
    level: HumanizeLevel;
  };
}

export interface WritingResponse {
  content: string;
  title: string;
  outline: string[];
  suggestions: string[];
  // 去AI味相关字段
  humanizedContent?: string;      // 人性化后的内容
  aiDetectionScore?: number;      // AI检测评分（0-100，越高越像AI）
  humanizedDetectionScore?: number; // 人性化后的检测评分
  changes?: {                     // 改动说明
    type: 'removed' | 'added' | 'modified';
    description: string;
  }[];
}
