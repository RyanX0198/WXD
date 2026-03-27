// 语料选择器组件（用于写稿页面）
import React, { useState, useEffect } from 'react';
import { Corpus } from '../../types/corpus';
import { corpusCategories } from '../../types/corpus';
import { corpusApi } from '../../services/corpusApi';
import { CorpusCard } from './CorpusCard';

interface CorpusSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  maxSelection?: number;
}

export const CorpusSelector: React.FC<CorpusSelectorProps> = ({
  selectedIds,
  onChange,
  maxSelection = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [corpusList, setCorpusList] = useState<Corpus[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [selectedCorpus, setSelectedCorpus] = useState<Corpus[]>([]);

  // 加载语料列表
  useEffect(() => {
    if (isOpen) {
      loadCorpus();
    }
  }, [isOpen, category, keyword]);

  // 加载已选语料详情
  useEffect(() => {
    const loadSelected = async () => {
      if (selectedIds.length === 0) {
        setSelectedCorpus([]);
        return;
      }
      
      try {
        const corpus = await Promise.all(
          selectedIds.map(id => corpusApi.getById(id))
        );
        setSelectedCorpus(corpus);
      } catch (error) {
        console.error('加载已选语料失败:', error);
      }
    };
    
    loadSelected();
  }, [selectedIds]);

  const loadCorpus = async () => {
    setLoading(true);
    try {
      const response = await corpusApi.getList({
        category: category || undefined,
        keyword: keyword || undefined,
        limit: 20
      });
      setCorpusList(response.items);
    } catch (error) {
      console.error('加载语料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (corpus: Corpus) => {
    if (selectedIds.includes(corpus.id)) {
      // 取消选择
      onChange(selectedIds.filter(id => id !== corpus.id));
    } else if (selectedIds.length < maxSelection) {
      // 添加选择
      onChange([...selectedIds, corpus.id]);
    }
  };

  const handleRemoveSelected = (id: string) => {
    onChange(selectedIds.filter(sid => sid !== id));
  };

  return (
    <div className="space-y-4">
      {/* 已选语料摘要 */}
      {selectedCorpus.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white flex items-center gap-2">
            <span>📚</span>
            已选参考语料
            <span className="text-xs text-[#6b7280] font-normal">({selectedIds.length}/{maxSelection})</span>
          </label>
          <div className="space-y-2">
            {selectedCorpus.map((corpus) => (
              <div 
                key={corpus.id}
                className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#333] rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span 
                    className="px-2 py-0.5 text-xs rounded border flex-shrink-0"
                    style={{ 
                      backgroundColor: `${corpusCategories.find(c => c.id === corpus.category)?.color}20`, 
                      borderColor: `${corpusCategories.find(c => c.id === corpus.category)?.color}40`,
                      color: corpusCategories.find(c => c.id === corpus.category)?.color 
                    }}
                  >
                    {corpusCategories.find(c => c.id === corpus.category)?.name}
                  </span>
                  <span className="text-sm text-white truncate">{corpus.title}</span>
                </div>
                <button
                  onClick={() => handleRemoveSelected(corpus.id)}
                  className="p-1 text-[#6b7280] hover:text-red-400 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 选择按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={selectedIds.length >= maxSelection}
        className={`
          w-full py-3 px-4 rounded-lg border-2 border-dashed transition-all duration-200
          flex items-center justify-center gap-2
          ${selectedIds.length >= maxSelection
            ? 'border-[#333] text-[#6b7280] cursor-not-allowed'
            : 'border-[#5765c7]/50 text-[#5765c7] hover:border-[#5765c7] hover:bg-[#5765c7]/10'
          }
        `}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {selectedIds.length >= maxSelection 
          ? `最多选择${maxSelection}篇语料` 
          : '选择参考语料'
        }
      </button>

      {/* 选择弹窗 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div>
                <h3 className="text-lg font-semibold text-white">选择参考语料</h3>
                <p className="text-sm text-[#9ca3af]">
                  已选择 {selectedIds.length}/{maxSelection} 篇语料
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#6b7280] hover:text-white hover:bg-[#222] rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 筛选区 */}
            <div className="p-6 border-b border-[#333] space-y-4">
              {/* 搜索 */}
              <div className="relative">
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280]"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="搜索语料标题..."
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-12 pr-4 py-3 text-white 
                             placeholder-[#6b7280] outline-none focus:border-[#5765c7]"
                />
              </div>

              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('')}
                  className={`
                    px-3 py-1.5 text-sm rounded-lg border transition-colors
                    ${!category 
                      ? 'bg-[#5765c7] border-[#5765c7] text-white' 
                      : 'bg-[#1a1a1a] border-[#333] text-[#9ca3af] hover:border-[#444]'
                    }
                  `}
                >
                  全部
                </button>
                {corpusCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`
                      px-3 py-1.5 text-sm rounded-lg border transition-colors
                      ${category === cat.id 
                        ? 'bg-[#5765c7] border-[#5765c7] text-white' 
                        : 'bg-[#1a1a1a] border-[#333] text-[#9ca3af] hover:border-[#444]'
                      }
                    `}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 语料列表 */}
            <div className="p-6 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-8 h-8 border-4 border-[#333] border-t-[#5765c7] rounded-full animate-spin"></span>
                </div>
              ) : corpusList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-[#9ca3af]">没有找到符合条件的语料</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {corpusList.map((corpus) => (
                    <CorpusCard
                      key={corpus.id}
                      corpus={corpus}
                      selected={selectedIds.includes(corpus.id)}
                      selectable
                      onClick={() => handleSelect(corpus)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 底部 */}
            <div className="flex items-center justify-between p-6 border-t border-[#333]">
              <span className="text-sm text-[#9ca3af]">
                已选择 <span className="text-white">{selectedIds.length}</span>/{maxSelection} 篇语料
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 bg-[#5765c7] hover:bg-[#4654b6] text-white rounded-lg transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
