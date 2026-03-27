// 语料库API服务
import { Corpus, CorpusListResponse, CreateCorpusRequest, CorpusListParams } from '../types/corpus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

class CorpusApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'CorpusApiError';
  }
}

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new CorpusApiError(response.status, error.message || '请求失败');
  }

  return response.json();
}

export const corpusApi = {
  // 获取语料列表
  async getList(params: CorpusListParams = {}): Promise<CorpusListResponse> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.category) searchParams.set('category', params.category);
    if (params.keyword) searchParams.set('keyword', params.keyword);
    
    return fetchApi<CorpusListResponse>(`/api/corpus?${searchParams.toString()}`);
  },

  // 获取语料详情
  async getById(id: string): Promise<Corpus> {
    return fetchApi<Corpus>(`/api/corpus/${id}`);
  },

  // 创建语料
  async create(data: CreateCorpusRequest): Promise<Corpus> {
    return fetchApi<Corpus>('/api/corpus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新语料
  async update(id: string, data: Partial<CreateCorpusRequest>): Promise<Corpus> {
    return fetchApi<Corpus>(`/api/corpus/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // 删除语料
  async delete(id: string): Promise<void> {
    return fetchApi<void>(`/api/corpus/${id}`, {
      method: 'DELETE',
    });
  },
};
