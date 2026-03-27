import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { DocumentSnippet } from './DocumentSnippet';
import { VectorSearchResult, VectorSearchOptions } from '../../lib/api';

interface VectorSearchPanelProps {
  onSearch: (query: string, options: VectorSearchOptions) => Promise<VectorSearchResult[]>;
  onQuote?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const VectorSearchPanel: React.FC<VectorSearchPanelProps> = ({
  onSearch,
  onQuote,
  placeholder = '输入搜索内容...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VectorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<VectorSearchOptions>({
    topK: 5,
    filter: {
      minSimilarity: 0.6,
    },
  });
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await onSearch(query, options);
      setResults(searchResults);
    } catch (err) {
      console.error('搜索失败:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0a0a] border border-[#333] rounded-xl overflow-hidden ${className}`}>
      {/* 搜索头部 */}
      <div className="p-4 border-b border-[#222]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-24 py-3 text-white placeholder-gray-500 outline-none focus:border-[#5765c7] transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={clearSearch}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#333] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`p-2 rounded-lg transition-colors ${
                showOptions
                  ? 'bg-[#5765c7] text-white'
                  : 'text-gray-500 hover:text-white hover:bg-[#333]'
              }`}
              title="高级选项"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="px-4 py-2 bg-[#5765c7] hover:bg-[#4654b6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
            >
              {loading ? '搜索中...' : '搜索'}
            </button>
          </div>
        </div>

        {/* 高级选项 */}
        {showOptions && (
          <div className="mt-4 p-4 bg-[#111] rounded-xl border border-[#333]">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">返回结果数 (TopK)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={options.topK}
                    onChange={(e) => setOptions({ ...options, topK: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#5765c7]"
                  />
                  <span className="text-sm text-white w-8 text-center">{options.topK}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">最小相似度</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={(options.filter?.minSimilarity || 0.6) * 100}
                    onChange={(e) => setOptions({
                      ...options,
                      filter: { ...options.filter, minSimilarity: parseInt(e.target.value) / 100 }
                    })}
                    className="flex-1 h-2 bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#5765c7]"
                  />
                  <span className="text-sm text-white w-12 text-center">
                    {Math.round((options.filter?.minSimilarity || 0.6) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 搜索结果 */}
      <div className="flex-1 overflow-y-auto p-4">
        {!hasSearched ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Search className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">输入关键词开始语义检索</p>
            <p className="text-xs mt-2 opacity-60">支持自然语言描述，不限于关键词匹配</p>
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <div className="w-8 h-8 border-2 border-[#5765c7] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm">正在搜索相关文档...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <X className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm">未找到相关文档</p>
            <p className="text-xs mt-2 opacity-60">尝试调整搜索词或降低相似度阈值</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">
                找到 <span className="text-white font-medium">{results.length}</span> 个相关片段
              </p>
            </div>
            {results.map((result) => (
              <DocumentSnippet
                key={result.id}
                {...result}
                onQuote={onQuote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
