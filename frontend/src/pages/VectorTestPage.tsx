import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vectorApi, VectorSearchResult, VectorSearchOptions, IndexProgress } from '../lib/api';
import { VectorSearchPanel, IndexProgressBar, SimilarityBadge } from '../components/vector';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, RefreshCw, Database, BarChart3, Activity } from 'lucide-react';

// Mock 搜索结果数据
const mockSearchResults: VectorSearchResult[] = [
  {
    id: '1',
    documentId: 'doc1',
    documentName: '公文写作规范.pdf',
    content: '公文写作应当遵循准确、简明、得体的原则。标题要准确概括公文的主要内容，一般应当标明发文机关和公文种类。正文应当观点明确，条理清晰，文字简练。',
    similarity: 0.92,
    metadata: { page: 5, chunkIndex: 2, totalChunks: 10 },
  },
  {
    id: '2',
    documentId: 'doc2',
    documentName: '讲话稿范例合集.docx',
    content: '在撰写讲话稿时，首先要明确听众对象和讲话场合。开头应当简明扼要，开门见山；主体部分层次分明，逻辑清晰；结尾要有力，给人以深刻印象。',
    similarity: 0.87,
    metadata: { page: 12, chunkIndex: 5, totalChunks: 15 },
  },
  {
    id: '3',
    documentId: 'doc3',
    documentName: '通知模板库.txt',
    content: '通知的正文一般由缘由、事项和执行要求三部分组成。缘由部分简要说明发文的依据和目的；事项部分具体说明通知的内容；执行要求部分提出具体的执行标准和时间要求。',
    similarity: 0.78,
    metadata: { chunkIndex: 0, totalChunks: 3 },
  },
  {
    id: '4',
    documentId: 'doc1',
    documentName: '公文写作规范.pdf',
    content: '公文格式包括版头、主体和版记三部分。版头部分包括份号、密级、紧急程度、发文机关标志、发文字号等；主体部分包括标题、主送机关、正文、附件说明等。',
    similarity: 0.71,
    metadata: { page: 8, chunkIndex: 4, totalChunks: 10 },
  },
  {
    id: '5',
    documentId: 'doc4',
    documentName: '学校简介资料.md',
    content: '我校创建于1950年，是一所具有悠久历史和光荣传统的综合性大学。学校秉承"厚德博学、求实创新"的校训，培养了大批优秀人才。',
    similarity: 0.65,
    metadata: { chunkIndex: 0, totalChunks: 5 },
  },
];

// Mock 索引状态
const mockIndexProgress: IndexProgress = {
  status: 'indexing',
  progress: 65,
  processed: 13,
  total: 20,
  speed: 2.5,
  elapsedTime: 320,
  estimatedTimeRemaining: 180,
  currentFile: '年度工作报告范本.pdf',
  logs: [
    '开始索引任务...',
    '发现 20 个文件待索引',
    '正在处理: 公文写作规范.pdf',
    '✓ 公文写作规范.pdf 索引完成 (125 向量)',
    '正在处理: 讲话稿范例合集.docx',
    '✓ 讲话稿范例合集.docx 索引完成 (230 向量)',
    '正在处理: 通知模板库.txt',
    '✓ 通知模板库.txt 索引完成 (45 向量)',
    '正在处理: 学校简介资料.md',
    '✓ 学校简介资料.md 索引完成 (67 向量)',
    '正在处理: 年度工作报告范本.pdf',
  ],
  errors: [
    { file: '损坏文件.pdf', error: 'PDF解析失败: 文件已损坏' },
  ],
};

export function VectorTestPage() {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>([]);
  const [indexProgress, setIndexProgress] = useState<IndexProgress | null>(mockIndexProgress);
  const [indexStats, setIndexStats] = useState<{
    documentCount: number;
    vectorCount: number;
    lastIndexedAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'status'>('search');
  const [showSimilarityChart, setShowSimilarityChart] = useState(false);

  // 加载索引统计
  useEffect(() => {
    loadIndexStats();
  }, []);

  // 模拟索引进度更新
  useEffect(() => {
    if (indexProgress?.status !== 'indexing') return;

    const interval = setInterval(() => {
      setIndexProgress(prev => {
        if (!prev || prev.status !== 'indexing') return prev;

        const newProgress = Math.min(prev.progress + 2, 100);
        const newProcessed = Math.floor((newProgress / 100) * prev.total);

        return {
          ...prev,
          progress: newProgress,
          processed: newProcessed,
          elapsedTime: prev.elapsedTime + 2,
          estimatedTimeRemaining: Math.max(0, prev.estimatedTimeRemaining - 2),
          logs: newProgress >= 100
            ? [...prev.logs, '✓ 年度工作报告范本.pdf 索引完成 (156 向量)', '索引任务完成！']
            : prev.logs,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [indexProgress?.status]);

  const loadIndexStats = async () => {
    try {
      // TODO: 后端API完成后切换为真实调用
      // const res = await vectorApi.getIndexStatus();
      // setIndexStats(res.data);

      // Mock 数据
      setIndexStats({
        documentCount: 20,
        vectorCount: 15420,
        lastIndexedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('加载索引统计失败:', err);
    }
  };

  const handleSearch = async (query: string, options: VectorSearchOptions): Promise<VectorSearchResult[]> => {
    setLoading(true);
    try {
      // TODO: 后端API完成后切换为真实调用
      // const res = await vectorApi.search(query, options);
      // return res.data;

      // Mock 延迟和结果筛选
      await new Promise(resolve => setTimeout(resolve, 800));

      // 根据相似度阈值筛选
      const minSim = options.filter?.minSimilarity || 0.6;
      const topK = options.topK || 5;
      const filtered = mockSearchResults
        .filter(r => r.similarity >= minSim)
        .slice(0, topK);

      setSearchResults(filtered);
      setShowSimilarityChart(true);
      return filtered;
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    try {
      // TODO: 后端API完成后切换为真实调用
      // await vectorApi.reindex();

      setIndexProgress({
        status: 'indexing',
        progress: 0,
        processed: 0,
        total: 20,
        speed: 0,
        elapsedTime: 0,
        estimatedTimeRemaining: 600,
        currentFile: '开始索引...',
        logs: ['开始索引任务...', '发现 20 个文件待索引'],
        errors: [],
      });
    } catch (err) {
      console.error('触发索引失败:', err);
    }
  };

  // 相似度分布数据
  const similarityDistribution = [
    { range: '90-100%', count: searchResults.filter(r => r.similarity >= 0.9).length, color: 'bg-emerald-500' },
    { range: '80-89%', count: searchResults.filter(r => r.similarity >= 0.8 && r.similarity < 0.9).length, color: 'bg-blue-500' },
    { range: '70-79%', count: searchResults.filter(r => r.similarity >= 0.7 && r.similarity < 0.8).length, color: 'bg-yellow-500' },
    { range: '60-69%', count: searchResults.filter(r => r.similarity >= 0.6 && r.similarity < 0.7).length, color: 'bg-orange-500' },
    { range: '<60%', count: searchResults.filter(r => r.similarity < 0.6).length, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航 */}
      <header className="border-b border-[#333] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </button>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-6 h-6 text-[#5765c7]" />
                向量检索测试
              </h1>
            </div>

            {/* 索引统计 */}
            {indexStats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">文档:</span>
                  <span className="text-white font-medium">{indexStats.documentCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">向量:</span>
                  <span className="text-white font-medium">{indexStats.vectorCount.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 标签切换 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'search'
                ? 'bg-[#5765c7] text-white'
                : 'bg-[#111] border border-[#333] text-gray-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            向量搜索
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'status'
                ? 'bg-[#5765c7] text-white'
                : 'bg-[#111] border border-[#333] text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            索引状态
          </button>
        </div>

        {activeTab === 'search' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 搜索面板 */}
            <div className="lg:col-span-2">
              <VectorSearchPanel
                onSearch={handleSearch}
                placeholder="输入搜索内容，支持自然语言描述..."
              />
            </div>

            {/* 右侧统计 */}
            <div className="space-y-6">
              {/* 相似度分布 */}
              {showSimilarityChart && searchResults.length > 0 && (
                <div className="bg-[#111] border border-[#333] rounded-xl p-4">
                  <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#5765c7]" />
                    相似度分布
                  </h3>
                  <div className="space-y-3">
                    {similarityDistribution.map((item) => (
                      <div key={item.range} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-14">{item.range}</span>
                        <div className="flex-1 h-4 bg-[#222] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all duration-500`}
                            style={{ width: `${Math.max((item.count / searchResults.length) * 100, 5)}%` }}
                          />
                        </div>
                        <span className="text-xs text-white w-6 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 搜索结果统计 */}
              {searchResults.length > 0 && (
                <div className="bg-[#111] border border-[#333] rounded-xl p-4">
                  <h3 className="text-sm font-medium text-white mb-4">结果统计</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">结果数量</span>
                      <span className="text-white font-medium">{searchResults.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">平均相似度</span>
                      <span className="text-white font-medium">
                        {(searchResults.reduce((acc, r) => acc + r.similarity, 0) / searchResults.length * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">最高相似度</span>
                      <span className="text-emerald-400 font-medium">
                        {(Math.max(...searchResults.map(r => r.similarity)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">来源文档</span>
                      <span className="text-white font-medium">
                        {new Set(searchResults.map(r => r.documentId)).size} 个
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 快速操作 */}
              <div className="bg-[#111] border border-[#333] rounded-xl p-4">
                <h3 className="text-sm font-medium text-white mb-4">快速操作</h3>
                <button
                  onClick={handleReindex}
                  disabled={indexProgress?.status === 'indexing'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#5765c7] hover:bg-[#4654b6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${indexProgress?.status === 'indexing' ? 'animate-spin' : ''}`} />
                  {indexProgress?.status === 'indexing' ? '索引中...' : '重新索引'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            <IndexProgressBar progress={indexProgress || undefined} />
          </div>
        )}
      </main>
    </div>
  );
}
