# 语料库 MVP 前端设计文档

**版本**: v1.0  
**创建日期**: 2026-03-22  
**设计**: @frontend-lead  
**评审**: @卡维斯

---

## 📋 目录

1. [类型定义](#1-类型定义)
2. [组件设计](#2-组件设计)
3. [页面布局](#3-页面布局)
4. [API 对接需求](#4-api-对接需求)
5. [后端字段需求清单](#5-后端字段需求清单)
6. [文件结构](#6-文件结构)

---

## 1. 类型定义

### 1.1 语料类型 (Corpus Types)

```typescript
// src/types/corpus.ts

export type DocumentLanguage = 
  | 'zh'        // 中文
  | 'en'        // 英文
  | 'zh-en';    // 中英双语

export type DocumentSource = 
  | 'official'  // 官方文件
  | 'news'      // 新闻报道
  | 'academic'  // 学术资料
  | 'industry'  // 行业报告
  | 'custom';   // 自定义导入

export interface Corpus {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  content: string;               // 完整内容
  language: DocumentLanguage;    // 文种
  tags: string[];                // 标签数组
  source: DocumentSource;        // 来源类型
  sourceDetail?: string;         // 来源详情（如：国务院办公厅）
  author?: string;               // 作者（可选）
  createdAt: string;             // ISO 8601 格式
  updatedAt: string;             // ISO 8601 格式
  wordCount: number;             // 字数统计
  summary?: string;              // 自动摘要（前100字）
  isPinned?: boolean;            // 是否置顶
  usageCount?: number;           // 被引用次数
}

// 创建语料请求体
export interface CreateCorpusRequest {
  title: string;
  content: string;
  language: DocumentLanguage;
  tags: string[];
  source: DocumentSource;
  sourceDetail?: string;
  author?: string;
}

// 更新语料请求体
export interface UpdateCorpusRequest {
  title?: string;
  content?: string;
  language?: DocumentLanguage;
  tags?: string[];
  source?: DocumentSource;
  sourceDetail?: string;
  author?: string;
}

// 语料筛选条件
export interface CorpusFilter {
  keyword?: string;              // 关键词搜索
  language?: DocumentLanguage;   // 文种筛选
  tags?: string[];               // 标签筛选
  source?: DocumentSource;       // 来源筛选
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

// 语料列表响应
export interface CorpusListResponse {
  items: Corpus[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 1.2 常量配置

```typescript
// src/data/corpusConfig.ts

export const documentLanguages = [
  { value: 'zh', label: '中文', icon: '🇨🇳' },
  { value: 'en', label: '英文', icon: '🇬🇧' },
  { value: 'zh-en', label: '中英双语', icon: '🌐' }
] as const;

export const documentSources = [
  { value: 'official', label: '官方文件', icon: '📋', color: '#5765c7' },
  { value: 'news', label: '新闻报道', icon: '📰', color: '#a0fcc9' },
  { value: 'academic', label: '学术资料', icon: '📚', color: '#ffa6ac' },
  { value: 'industry', label: '行业报告', icon: '📊', color: '#fcd34d' },
  { value: 'custom', label: '自定义', icon: '📝', color: '#9ca3af' }
] as const;

// 预设标签建议
export const suggestedTags = [
  '政务公开',
  '数字经济',
  '营商环境',
  '基层治理',
  '安全生产',
  '环境保护',
  '民生保障',
  '招商引资',
  '科技创新',
  '乡村振兴'
];

// 列表分页配置
export const paginationConfig = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50]
};
```

---

## 2. 组件设计

### 2.1 语料库管理页面组件

#### 2.1.1 CorpusListPage（页面容器）

```typescript
// src/components/corpus/CorpusListPage.tsx

interface CorpusListPageProps {
  // 页面无外部props，内部管理状态
}

// 内部状态
interface CorpusListState {
  corpuses: Corpus[];
  loading: boolean;
  filter: CorpusFilter;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  selectedIds: string[];
  isCreateModalOpen: boolean;
  isDeleteModalOpen: boolean;
  detailModalCorpus: Corpus | null;
}
```

**功能说明**:
- 语料库主页面，包含筛选、列表、分页
- 管理所有模态框的显示状态
- 处理批量操作逻辑

---

#### 2.1.2 CorpusListItem（列表项）

```typescript
// src/components/corpus/CorpusListItem.tsx

interface CorpusListItemProps {
  corpus: Corpus;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (corpus: Corpus) => void;
  onDelete: (corpus: Corpus) => void;
  onEdit?: (corpus: Corpus) => void;  // MVP可选
}
```

**UI设计**:
```
┌─────────────────────────────────────────────────────────────┐
│ ○  📋 关于优化营商环境的实施意见                    [置顶]  │
│    🏷️ 营商环境 | 📊 官方文件 | 📅 2024-03-20 | 👁️ 12次引用  │
│    摘要：为进一步优化营商环境，促进经济高质量发展...        │
│                                                             │
│    [查看详情]  [删除]                                       │
└─────────────────────────────────────────────────────────────┘
```

**样式规范**（参照DESIGN_SYSTEM.md Card规范）:
```tsx
<div className="bg-[#111] border border-[#333] rounded-xl p-6 
                hover:border-[#5765c7]/50 transition-colors">
```

---

#### 2.1.3 CorpusFilterBar（筛选栏）

```typescript
// src/components/corpus/CorpusFilterBar.tsx

interface CorpusFilterBarProps {
  filter: CorpusFilter;
  onFilterChange: (filter: CorpusFilter) => void;
  onReset: () => void;
  resultCount: number;
}
```

**UI设计**:
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 [搜索关键词...]  [文种▼]  [来源▼]  [标签筛选▼]    共 24 条 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.1.4 CreateCorpusModal（添加语料弹窗）

```typescript
// src/components/corpus/CreateCorpusModal.tsx

interface CreateCorpusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCorpusRequest) => Promise<void>;
}

// 表单验证规则
interface FormValidation {
  title: { required: true; minLength: 2; maxLength: 200 };
  content: { required: true; minLength: 10; maxLength: 50000 };
  language: { required: true };
  tags: { maxItems: 10 };
}
```

**UI设计**:
```
┌─────────────────────────────────────────────────────────────────┐
│ 📚 添加新语料                                      [×]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📌 标题 *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 请输入语料标题...                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  🌍 文种 *                                    📊 来源 *        │
│  ┌───────────────┐                           ┌───────────────┐ │
│  │ 中文        ▼ │                           │ 官方文件    ▼ │ │
│  └───────────────┘                           └───────────────┘ │
│                                                                 │
│  🏷️ 标签（按回车添加）                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 输入标签后按回车...                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [营商环境] [数字经济] [x]                                     │
│                                                                 │
│  📝 内容 *                                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │ 粘贴语料全文内容...                                     │   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                    0 / 50000 字         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    [取消]    [确认添加]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 2.1.5 CorpusDetailModal（语料详情弹窗）

```typescript
// src/components/corpus/CorpusDetailModal.tsx

interface CorpusDetailModalProps {
  corpus: Corpus | null;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (content: string) => void;
}
```

**UI设计**:
```
┌─────────────────────────────────────────────────────────────────┐
│ 关于优化营商环境的实施意见                         [×]  [📋] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🏷️ 营商环境  📊 官方文件  🇨🇳 中文  📅 2024-03-20            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  语料完整内容展示区域...                                │   │
│  │                                                         │   │
│  │  （阅读模式样式：18px 行高2.2 serif字体）               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                    [关闭]    [复制全文]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**复制按钮**:
```tsx
// 参照DESIGN_SYSTEM.md Button规范
<button className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-6 py-3 rounded-lg">
  📋 复制全文
</button>
```

---

#### 2.1.6 DeleteConfirmModal（删除确认弹窗）

```typescript
// src/components/corpus/DeleteConfirmModal.tsx

interface DeleteConfirmModalProps {
  isOpen: boolean;
  corpus: Corpus | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}
```

**UI设计**:
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ 确认删除                                        [×]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────┐                                 │
│                    │   ⚠️   │                                 │
│                    └─────────┘                                 │
│                                                                 │
│           确定要删除以下语料吗？                               │
│                                                                 │
│         「关于优化营商环境的实施意见」                         │
│                                                                 │
│           此操作不可恢复，请谨慎操作。                         │
│                                                                 │
│              [取消]    [确认删除]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.2 写作表单集成组件

#### 2.2.1 CorpusSelector（语料选择器）

```typescript
// src/components/corpus/CorpusSelector.tsx

interface CorpusSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelection?: number;  // 默认3
  documentType?: DocumentType;  // 根据文种推荐相关语料
}

// 内部状态
interface SelectorState {
  isOpen: boolean;
  searchKeyword: string;
  corpuses: Corpus[];
  loading: boolean;
}
```

**UI设计**（嵌入WritingForm）:
```
┌─────────────────────────────────────────────────────────────────┐
│ 📚 参考范文                              已选择 2/3            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔍 搜索语料...                                    [▼] │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [关于优化营商环境的实施意见] [x]                              │
│  [数字经济高质量发展报告] [x]                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📋 基层治理创新实践案例                      [选择]   │   │
│  │  📋 安全生产责任落实指导意见                  [选择]   │   │
│  │  📋 2024年政府工作报告要点解读                [选择]   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**选中语料标签样式**:
```tsx
// 参照DESIGN_SYSTEM.md 色彩系统
<span className="inline-flex items-center gap-1 px-3 py-1.5 
                 bg-[#5765c7]/20 text-[#5765c7] 
                 rounded-lg text-sm border border-[#5765c7]/30">
  {corpus.title}
  <button onClick={() => onRemove(corpus.id)}>×</button>
</span>
```

---

#### 2.2.2 SelectedCorpusPreview（已选语料预览）

```typescript
// src/components/corpus/SelectedCorpusPreview.tsx

interface SelectedCorpusPreviewProps {
  corpus: Corpus;
  onRemove: () => void;
  onView: () => void;
}
```

**UI设计**:
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 关于优化营商环境的实施意见                        [👁️] [×]│
│  🏷️ 营商环境 | 📊 官方文件 | 1,250字                            │
│  ─────────────────────────────────────────────────────────────  │
│  摘要：为进一步优化营商环境，促进经济高质量发展，根据...       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 页面布局

### 3.1 语料库管理页面布局

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  WXD 写作助手                                                    [导航菜单]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  📚 语料库管理                                      [+ 添加语料]       │   │
│  ├─────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                         │   │
│  │  🔍 [搜索...]  [文种▼]  [来源▼]  [标签▼]                    共 24 条   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ ○  📋 关于优化营商环境的实施意见                      [置顶]   │   │   │
│  │  │     🏷️ 营商环境 | 📊 官方文件 | 📅 2024-03-20 | 👁️ 12次       │   │   │
│  │  │     摘要：为进一步优化营商环境，促进经济高质量发展...          │   │   │
│  │  │     [查看详情]  [删除]                                         │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ ○  📰 我市数字经济创新发展取得显著成效                        │   │   │
│  │  │     🏷️ 数字经济 | 📰 新闻报道 | 📅 2024-03-18 | 👁️ 8次        │   │   │
│  │  │     摘要：记者昨日从市发改委获悉，我市数字经济核心产业...      │   │   │
│  │  │     [查看详情]  [删除]                                         │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ ○  📊 基层治理数字化转型调研报告                               │   │   │
│  │  │     🏷️ 基层治理 | 📚 学术资料 | 📅 2024-03-15 | 👁️ 5次        │   │   │
│  │  │     摘要：本报告通过对全市12个街道、36个社区的实地调研...      │   │   │
│  │  │     [查看详情]  [删除]                                         │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                         │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │  [ ] 全选    已选择 0 项                         < 1 2 3 ... 10 >      │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 写作页面集成布局

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  左侧：写作配置区                         │  右侧：内容展示区                   │
│                                           │                                     │
│  ┌─────────────────────────────────────┐  │  ┌─────────────────────────────┐   │
│  │  📌 写作主题                        │  │  │  AI检测评分                 │   │
│  │  [输入主题...]                      │  │  │                             │   │
│  └─────────────────────────────────────┘  │  └─────────────────────────────┘   │
│                                           │                                     │
│  ┌─────────────────────────────────────┐  │  ┌─────────────────────────────┐   │
│  │  📚 参考范文              已选 2/3  │  │  │                             │   │
│  ├─────────────────────────────────────┤  │  │  生成内容展示               │   │
│  │  [关于优化...] [x] [数字...] [x]    │  │  │                             │   │
│  │                                     │  │  │                             │   │
│  │  ┌─────────────────────────────┐   │  │  │                             │   │
│  │  │ 🔍 搜索语料...         [▼]  │   │  │  │                             │   │
│  │  ├─────────────────────────────┤   │  │  │                             │   │
│  │  │ 📋 基层治理创新实践   [选择]│   │  │  │                             │   │
│  │  │ 📋 安全生产责任落实   [选择]│   │  │  │                             │   │
│  │  │ 📋 2024年政府工作报告 [选择]│   │  │  │                             │   │
│  │  └─────────────────────────────┘   │  │  │                             │   │
│  └─────────────────────────────────────┘  │  └─────────────────────────────┘   │
│                                           │                                     │
│  ┌─────────────────────────────────────┐  │                                     │
│  │  🏷️ 关键词                          │  │                                     │
│  │  [输入关键词...] [添加]             │  │                                     │
│  │  [标签1] [标签2]                    │  │                                     │
│  └─────────────────────────────────────┘  │                                     │
│                                           │                                     │
│  ┌─────────────────────────────────────┐  │                                     │
│  │  📏 字数要求                        │  │                                     │
│  │  [500字] [800字] [1200字] ...       │  │                                     │
│  └─────────────────────────────────────┘  │                                     │
│                                           │                                     │
│  [✨ 生成文稿]                            │                                     │
│                                           │                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 响应式布局规则

```
移动端 (< 640px):
┌─────────────────────┐
│ 📚 语料库管理       │
│ [+ 添加]            │
├─────────────────────┤
│ 🔍 [搜索] [筛选▼]   │
├─────────────────────┤
│ ○ 标题...           │
│ 标签 | 来源 | 日期  │
│ [查看] [删除]       │
├─────────────────────┤
│ ○ 标题...           │
│ 标签 | 来源 | 日期  │
│ [查看] [删除]       │
├─────────────────────┤
│ [加载更多...]       │
└─────────────────────┘

平板端 (640px - 1024px):
┌─────────────────────────────────┐
│ 📚 语料库管理        [+ 添加]  │
├─────────────────────────────────┤
│ 🔍 [搜索] [文种] [来源]        │
├─────────────────────────────────┤
│ ○ 标题...              [置顶]  │
│ 标签 | 来源 | 日期 | 引用次数   │
│ 摘要内容...                     │
│ [查看详情]  [删除]              │
├─────────────────────────────────┤
│ ← 1 2 3 ... 10 →               │
└─────────────────────────────────┘
```

---

## 4. API 对接需求

### 4.1 RESTful API 端点

```typescript
// API 基础路径: /api/v1/corpus

// 1. 获取语料列表
GET /api/v1/corpus
Request:
  Query:
    - page: number (default: 1)
    - pageSize: number (default: 10)
    - keyword?: string
    - language?: 'zh' | 'en' | 'zh-en'
    - source?: 'official' | 'news' | 'academic' | 'industry' | 'custom'
    - tags?: string[] (逗号分隔)
    - sortBy?: 'createdAt' | 'updatedAt' | 'usageCount'
    - sortOrder?: 'asc' | 'desc'

Response: CorpusListResponse

// 2. 获取单个语料详情
GET /api/v1/corpus/:id
Response: Corpus

// 3. 创建语料
POST /api/v1/corpus
Request Body: CreateCorpusRequest
Response: Corpus

// 4. 更新语料
PATCH /api/v1/corpus/:id
Request Body: UpdateCorpusRequest
Response: Corpus

// 5. 删除语料
DELETE /api/v1/corpus/:id
Response: { success: boolean }

// 6. 批量删除语料
DELETE /api/v1/corpus/batch
Request Body: { ids: string[] }
Response: { success: boolean; deletedCount: number }

// 7. 获取推荐语料（写作时使用）
GET /api/v1/corpus/recommended
Request:
  Query:
    - documentType?: DocumentType
    - keywords?: string[]
    - limit?: number (default: 5)
Response: Corpus[]

// 8. 增加引用计数（当语料被用于生成时）
POST /api/v1/corpus/:id/usage
Response: { usageCount: number }
```

### 4.2 错误处理规范

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// 错误码定义
const ErrorCodes = {
  'CORPUS_NOT_FOUND': '语料不存在',
  'CORPUS_TITLE_EXISTS': '标题已存在',
  'INVALID_CONTENT_LENGTH': '内容长度不符合要求',
  'MAX_CORPUS_LIMIT': '已达到语料数量上限',
  'TAG_LIMIT_EXCEEDED': '标签数量超过限制',
  'UNAUTHORIZED': '未授权操作'
};
```

### 4.3 前端 API 客户端封装

```typescript
// src/api/corpus.ts

import { Corpus, CreateCorpusRequest, UpdateCorpusRequest, CorpusFilter, CorpusListResponse } from '../types/corpus';

export const corpusApi = {
  // 获取列表
  async getList(filter: CorpusFilter, page: number, pageSize: number): Promise<CorpusListResponse>;
  
  // 获取详情
  async getById(id: string): Promise<Corpus>;
  
  // 创建
  async create(data: CreateCorpusRequest): Promise<Corpus>;
  
  // 更新
  async update(id: string, data: UpdateCorpusRequest): Promise<Corpus>;
  
  // 删除
  async delete(id: string): Promise<void>;
  
  // 批量删除
  async batchDelete(ids: string[]): Promise<{ deletedCount: number }>;
  
  // 获取推荐
  async getRecommended(documentType?: string, keywords?: string[]): Promise<Corpus[]>;
  
  // 增加引用计数
  async incrementUsage(id: string): Promise<number>;
};
```

---

## 5. 后端字段需求清单

### 5.1 数据库表结构建议

```sql
-- corpus 表
CREATE TABLE corpus (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(200) NOT NULL,
  content         TEXT NOT NULL,
  language        VARCHAR(10) NOT NULL CHECK (language IN ('zh', 'en', 'zh-en')),
  tags            TEXT[] DEFAULT '{}',
  source          VARCHAR(20) NOT NULL CHECK (source IN ('official', 'news', 'academic', 'industry', 'custom')),
  source_detail   VARCHAR(200),
  author          VARCHAR(100),
  word_count      INTEGER NOT NULL DEFAULT 0,
  summary         VARCHAR(200),
  is_pinned       BOOLEAN DEFAULT FALSE,
  usage_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_corpus_language ON corpus(language);
CREATE INDEX idx_corpus_source ON corpus(source);
CREATE INDEX idx_corpus_tags ON corpus USING GIN(tags);
CREATE INDEX idx_corpus_created_at ON corpus(created_at DESC);
CREATE INDEX idx_corpus_usage_count ON corpus(usage_count DESC);

-- 全文搜索（PostgreSQL）
CREATE INDEX idx_corpus_search ON corpus 
  USING gin(to_tsvector('chinese', title || ' ' || content));
```

### 5.2 后端需提供的字段

| 字段名 | 类型 | 必填 | 说明 | 前端用途 |
|--------|------|------|------|----------|
| id | UUID | ✅ | 唯一标识 | 列表key、删除操作 |
| title | string(200) | ✅ | 语料标题 | 列表展示、详情页 |
| content | text | ✅ | 完整内容 | 详情弹窗、复制功能 |
| language | enum | ✅ | 文种(zh/en/zh-en) | 筛选、标识展示 |
| tags | string[] | - | 标签数组(max 10) | 筛选、展示 |
| source | enum | ✅ | 来源类型 | 筛选、标识展示 |
| sourceDetail | string(200) | - | 来源详情 | 详情页展示 |
| author | string(100) | - | 作者 | 详情页展示（可选） |
| wordCount | int | ✅ | 字数统计 | 列表展示、详情页 |
| summary | string(200) | - | 自动摘要 | 列表展示 |
| isPinned | boolean | - | 是否置顶 | 列表排序 |
| usageCount | int | - | 引用次数 | 列表展示、排序 |
| createdAt | ISO8601 | ✅ | 创建时间 | 列表展示、排序 |
| updatedAt | ISO8601 | ✅ | 更新时间 | 列表展示 |

### 5.3 后端需提供的能力

| 能力 | 优先级 | 说明 |
|------|--------|------|
| 自动摘要生成 | P1 | 保存时自动生成前100字摘要 |
| 字数统计 | P1 | 保存时自动计算content字数 |
| 全文搜索 | P1 | 支持标题和内容的关键词搜索 |
| 标签去重 | P2 | 同一语料标签去重、大小写统一 |
| 引用计数 | P2 | 生成文章时自动累加 |
| 置顶功能 | P2 | 支持置顶，置顶项优先展示 |
| 批量删除 | P2 | 支持批量选择删除 |
| 导入导出 | P3 | MVP后可扩展 |

---

## 6. 文件结构

### 6.1 新增文件清单

```
src/
├── types/
│   └── corpus.ts                 # 语料类型定义
│
├── data/
│   └── corpusConfig.ts           # 语料配置常量
│
├── api/
│   └── corpus.ts                 # API客户端封装
│
├── components/
│   └── corpus/
│       ├── CorpusListPage.tsx    # 语料库管理页面
│       ├── CorpusListItem.tsx    # 列表项组件
│       ├── CorpusFilterBar.tsx   # 筛选栏
│       ├── CreateCorpusModal.tsx # 添加语料弹窗
│       ├── CorpusDetailModal.tsx # 详情弹窗
│       ├── DeleteConfirmModal.tsx# 删除确认弹窗
│       ├── CorpusSelector.tsx    # 语料选择器（写作页用）
│       ├── SelectedCorpusPreview.tsx # 已选语料预览
│       └── index.ts              # 导出
│
├── hooks/
│   └── useCorpus.ts              # 语料相关hooks
│
└── pages/
    └── CorpusPage.tsx            # 语料库页面路由
```

### 6.2 修改文件清单

```
src/
├── types/
│   └── writing.ts                # + 添加参考语料字段
│
├── components/
│   └── writing/
│       ├── WritingForm.tsx       # + 集成语料选择器
│       └── PromptPreview.tsx     # + 显示引用语料
│
└── pages/
    └── WritingAssistantPage.tsx  # + 管理语料选择状态
```

### 6.3 WritingForm 修改点

```typescript
// src/components/writing/WritingForm.tsx

interface WritingFormProps {
  // ... 原有字段
  
  // + 新增：语料引用
  selectedCorpusIds: string[];
  onSelectedCorpusChange: (ids: string[]) => void;
  corpusOptions: Corpus[];  // 可选语料列表
}

// src/types/writing.ts

interface WritingRequest {
  // ... 原有字段
  
  // + 新增
  referenceCorpusIds?: string[];  // 参考语料ID列表
}
```

---

## 7. 交互流程图

### 7.1 添加语料流程

```
用户点击"+ 添加语料"
        ↓
打开 CreateCorpusModal
        ↓
填写表单（验证实时反馈）
        ↓
点击"确认添加"
        ↓
显示 Loading 状态
        ↓
调用 POST /api/v1/corpus
        ↓
成功 → 关闭弹窗 + 刷新列表 + Toast提示
失败 → 显示错误信息
```

### 7.2 删除语料流程

```
用户点击"删除"
        ↓
打开 DeleteConfirmModal
        ↓
点击"确认删除"
        ↓
显示 Loading 状态
        ↓
调用 DELETE /api/v1/corpus/:id
        ↓
成功 → 关闭弹窗 + 从列表移除 + Toast提示
失败 → 显示错误信息
```

### 7.3 写作时引用语料流程

```
用户展开"参考范文"选择器
        ↓
调用 GET /api/v1/corpus/recommended
        ↓
显示推荐语料列表（带搜索）
        ↓
用户点击"选择"
        ↓
添加到 selectedCorpusIds（最多3个）
        ↓
显示 SelectedCorpusPreview 卡片
        ↓
用户点击"生成文稿"
        ↓
referenceCorpusIds 随请求发送
        ↓
后端调用 POST /api/v1/corpus/:id/usage 增加引用计数
```

---

## 8. 验收标准

### 8.1 功能验收

- [ ] 语料库管理页面可正常访问
- [ ] 列表展示标题、文种、标签、来源
- [ ] 添加语料表单完整（标题、内容、文种、标签、来源）
- [ ] 表单验证生效（必填项、长度限制）
- [ ] 删除语料有确认弹窗
- [ ] 写作页面可展开语料选择器
- [ ] 最多可选择3篇语料
- [ ] 选中语料显示标题摘要预览
- [ ] 语料详情弹窗可查看完整内容
- [ ] 复制功能可用

### 8.2 设计验收

- [ ] 所有组件遵循 DESIGN_SYSTEM.md 规范
- [ ] 颜色、字体、间距符合规范
- [ ] 代码注释引用设计规范
- [ ] 移动端适配正常
- [ ] 悬停、聚焦状态有反馈
- [ ] Loading状态有动画

### 8.3 性能验收

- [ ] 列表首屏加载 < 1s
- [ ] 搜索响应 < 300ms
- [ ] 添加/删除操作 < 500ms
- [ ] 语料选择器展开 < 300ms

---

**文档完成时间**: 2026-03-22  
**下一步**: 前端组件开发 / 后端API开发

---

_"设计已就绪，等待执行指令。"_ — 卡维斯
