// 语料库类型定义

export interface Corpus {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  source: string;
  createdAt: string;
}

export interface CreateCorpusRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
  source?: string;
}

export interface UpdateCorpusRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  source?: string;
}

export interface CorpusListParams {
  page?: number;
  limit?: number;
  category?: string;
  keyword?: string;
}

export interface CorpusListResponse {
  items: Corpus[];
  total: number;
  page: number;
  limit: number;
}

// 语料分类选项
export const corpusCategories = [
  { id: 'official', name: '政务公文', color: '#5765c7' },
  { id: 'news', name: '新闻通稿', color: '#10b981' },
  { id: 'summary', name: '工作总结', color: '#f59e0b' },
  { id: 'speech', name: '领导讲话', color: '#ec4899' },
  { id: 'notice', name: '通知公告', color: '#8b5cf6' },
  { id: 'report', name: '调研报告', color: '#06b6d4' },
  { id: 'other', name: '其他', color: '#6b7280' }
] as const;

export type CorpusCategory = typeof corpusCategories[number]['id'];
