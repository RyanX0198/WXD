// 语料库管理页面
import React, { useState, useEffect, useCallback } from 'react';
import { Corpus, CorpusListResponse, corpusCategories } from '../types/corpus';
import { corpusApi } from '../services/corpusApi';
import { 
  CorpusCard, 
  CorpusForm, 
  CorpusDetailModal, 
  DeleteConfirmModal 
} from '../components/corpus';

export const CorpusPage: React.FC = () => {
  // 数据状态
  const [corpusList, setCorpusList] = useState<Corpus[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(false);

  // 筛选状态
  const [category, setCategory] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 弹窗状态
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailCorpus, setDetailCorpus] = useState<Corpus | null>(null);
  const [deleteCorpus, setDeleteCorpus] = useState<Corpus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载语料列表
  const loadCorpus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await corpusApi.getList({
        page: pagination.page,
        limit: pagination.limit,
        category: category || undefined,
        keyword: keyword || undefined
      });
      setCorpusList(response.items);
      setPagination(prev => ({
        ...prev,
        total: response.total
      }));
    } catch (error) {
      console.error('加载语料失败:', error);
      // 可以添加错误提示
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, category, keyword]);

  // 初始加载和筛选变化时重新加载
  useEffect(() => {
    loadCorpus();
  }, [loadCorpus]);

  // 搜索防抖
  const handleKeywordChange = (value: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    const timeout = setTimeout(() => {
      setKeyword(value);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    setSearchDebounce(timeout);
  };

  // 创建语料
  const handleCreate = async (data: Parameters<typeof corpusApi.create>[0]) => {
    setIsSubmitting(true);
    try {
      await corpusApi.create(data);
      setIsFormOpen(false);
      loadCorpus();
    } catch (error) {
      console.error('创建语料失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除语料
  const handleDelete = async () => {
    if (!deleteCorpus) return;
    
    setIsDeleting(true);
    try {
      await corpusApi.delete(deleteCorpus.id);
      setDeleteCorpus(null);
      loadCorpus();
    } catch (error) {
      console.error('删除语料失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // 分页计算
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-black">
      {/* 顶部导航 */}
      <header className="border-b border-[#333] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5765c7] to-[#a0fcc9] rounded-xl flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">语料库</h1>
                <p className="text-xs text-[#9ca3af]">管理和使用写作参考语料</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="/#/write" 
                className="text-sm text-[#9ca3af] hover:text-white transition-colors"
              >
                写作助手
              </a>
              <div className="w-8 h-8 bg-[#333] rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 工具栏 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-1">
            {/* 搜索 */}
            <div className="relative flex-1 max-w-md">
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                defaultValue={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                placeholder="搜索语料..."
                className="w-full bg-[#111] border border-[#333] rounded-lg pl-12 pr-4 py-3 text-white 
                           placeholder-[#6b7280] outline-none focus:border-[#5765c7]"
              />
            </div>

            {/* 分类筛选 */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white 
                         outline-none focus:border-[#5765c7] cursor-pointer"
            >
              <option value="">全部分类</option>
              {corpusCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* 添加按钮 */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#5765c7] hover:bg-[#4654b6] text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            添加语料
          </button>
        </div>

        {/* 语料列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="w-10 h-10 border-4 border-[#333] border-t-[#5765c7] rounded-full animate-spin"></span>
          </div>
        ) : corpusList.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-white mb-2">暂无语料</h3>
            <p className="text-[#9ca3af] mb-6">{keyword || category ? '没有符合条件的语料' : '语料库为空，点击上方按钮添加语料'}</p>
            {(keyword || category) && (
              <button
                onClick={() => {
                  setCategory('');
                  setKeyword('');
                }}
                className="text-[#5765c7] hover:text-[#a0fcc9] transition-colors"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {corpusList.map((corpus) => (
                <CorpusCard
                  key={corpus.id}
                  corpus={corpus}
                  onClick={() => setDetailCorpus(corpus)}
                  onDelete={() => setDeleteCorpus(corpus)}
                />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-[#111] border border-[#333] rounded-lg text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#444]"
                >
                  上一页
                </button>
                
                <span className="text-sm text-[#9ca3af] px-4">
                  第 {pagination.page} 页 / 共 {totalPages} 页
                  <span className="ml-2 text-[#6b7280]">（共 {pagination.total} 条）</span>
                </span>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= totalPages}
                  className="px-4 py-2 bg-[#111] border border-[#333] rounded-lg text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#444]"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 添加语料弹窗 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsFormOpen(false)}
          />
          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#333]">
              <h2 className="text-xl font-semibold text-white">添加语料</h2>
            </div>
            <div className="p-6">
              <CorpusForm
                onSubmit={handleCreate}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* 语料详情弹窗 */}
      <CorpusDetailModal
        corpus={detailCorpus}
        isOpen={!!detailCorpus}
        onClose={() => setDetailCorpus(null)}
      />

      {/* 删除确认弹窗 */}
      <DeleteConfirmModal
        isOpen={!!deleteCorpus}
        onClose={() => setDeleteCorpus(null)}
        onConfirm={handleDelete}
        title={deleteCorpus ? `确定要删除「${deleteCorpus.title}」吗？` : undefined}
        isDeleting={isDeleting}
      />
    </div>
  );
};
