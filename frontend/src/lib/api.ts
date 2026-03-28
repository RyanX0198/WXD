import axios from 'axios';

// API 基础 URL 配置
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wxd-backend.onrender.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    if (error.response?.status === 401) {
      // Token 过期，清除登录状态
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== 认证 API ==========
export const authApi = {
  // 用户注册
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  
  // 用户登录
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  // 获取当前用户信息
  getMe: () =>
    api.get('/auth/me'),
};

// ========== 文档 API ==========
export const documentApi = {
  create: (title: string, content: string, userId: string) => 
    api.post('/documents', { title, content, userId }),
  
  getList: (userId: string) => 
    api.get(`/documents?userId=${userId}`),

  getById: (id: string) =>
    api.get(`/documents/${id}`),

  update: (id: string, title: string, content: string) =>
    api.put(`/documents/${id}`, { title, content }),

  delete: (id: string) =>
    api.delete(`/documents/${id}`),
};

// ========== 对话 API ==========
export const chatApi = {
  // 创建对话
  createConversation: (userId: string, title?: string, type: 'general' | 'speech' = 'general') =>
    api.post('/chat/conversations', { userId, title: title || '新对话', type }),
  
  // 获取对话列表
  getConversations: (userId: string) =>
    api.get(`/chat/conversations?userId=${userId}`),
  
  // 获取对话详情（包含消息历史）
  getConversation: (id: string) =>
    api.get(`/chat/conversations/${id}`),
  
  // 删除对话
  deleteConversation: (id: string) =>
    api.delete(`/chat/conversations/${id}`),
  
  // 发送消息（非流式，备用）
  sendMessage: (conversationId: string, content: string, userId?: string) =>
    api.post('/chat/messages', { conversationId, content, userId, autoCreate: true }),
  
  // 发送消息（流式 SSE）
  sendMessageStream: (conversationId: string, content: string, userId?: string) => {
    return fetch(`${API_BASE_URL}/chat/messages/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({ conversationId, content, userId, autoCreate: true })
    });
  }
};

// ========== 生成 API ==========
export const generateApi = {
  // 生成公文
  generate: (params: {
    type: string;
    topic: string;
    from: string;
    to: string;
    wordCount?: number;
    formality?: number;
    urgency?: number;
  }) =>
    api.post('/generate', params),
};

// ========== 记忆管理 API ==========
export interface MemoryData {
  profile: {
    writingStyle: string;
    tone: string;
    formality: number;
    verbosity: number;
  };
  decisions: {
    id: string;
    timestamp: string;
    context: string;
    decision: string;
    outcome: string;
  }[];
  wxdContent: string;
  lastUpdated: string;
}

export interface Session {
  id: string;
  title: string;
  type: 'general' | 'speech';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
}

export interface CorpusFile {
  id: string;
  name: string;
  path: string;
  size: number;
  indexed: boolean;
  uploadedAt: string;
  category?: string;
}

export const memoryApi = {
  // 获取记忆数据
  getMemory: () =>
    api.get<MemoryData>('/memory'),
  
  // 获取会话列表
  getSessions: () =>
    api.get<Session[]>('/memory/sessions'),
  
  // 获取单个会话详情
  getSession: (id: string) =>
    api.get<Session & { messages: any[] }>(`/memory/sessions/${id}`),
};

export interface CorpusListResponse {
  files?: CorpusFile[];
  items?: CorpusFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const corpusManageApi = {
  // 获取语料库目录结构
  getCorpusFiles: () =>
    api.get<{ success: boolean; data: CorpusListResponse; error?: string }>('/api/corpus/files'),

  // 上传文档
  uploadDocument: (file: File, category?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }
    return api.post('/corpus/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 删除文档
  deleteDocument: (id: string) =>
    api.delete(`/corpus/${id}`),

  // 触发索引
  triggerIndex: () =>
    api.post('/corpus/trigger-index'),

  // 获取索引状态 (mock实现)
  getIndexStatus: () =>
    Promise.resolve({ data: { status: 'idle' as const } }),
};

// ========== 向量检索 API ==========

export interface VectorSearchResult {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  similarity: number;
  metadata?: {
    page?: number;
    chunkIndex?: number;
    totalChunks?: number;
  };
}

export interface VectorSearchOptions {
  topK?: number;
  filter?: {
    documentIds?: string[];
    minSimilarity?: number;
  };
}

export interface IndexProgress {
  status: 'idle' | 'indexing' | 'completed' | 'error';
  progress: number;
  processed: number;
  total: number;
  speed: number;
  elapsedTime: number;
  estimatedTimeRemaining: number;
  currentFile?: string;
  logs: string[];
  errors: {
    file: string;
    error: string;
  }[];
}

export const vectorApi = {
  // 语义检索
  search: (query: string, options?: VectorSearchOptions) =>
    api.post<VectorSearchResult[]>('/vector/search', { query, ...options }),

  // 获取索引状态
  getIndexStatus: () =>
    api.get<{
      status: 'idle' | 'indexing' | 'completed' | 'error';
      lastIndexedAt?: string;
      documentCount: number;
      vectorCount: number;
    }>('/vector/index/status'),

  // 获取索引进度（流式SSE）
  getIndexProgress: () => {
    return new EventSource(`${API_BASE_URL}/vector/index/progress`, {
      withCredentials: true,
    });
  },

  // 重新索引
  reindex: () =>
    api.post('/vector/index'),
};
