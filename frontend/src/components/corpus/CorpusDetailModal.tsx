// 语料详情弹窗组件
import React from 'react';
import { Corpus } from '../../types/corpus';
import { corpusCategories } from '../../types/corpus';

interface CorpusDetailModalProps {
  corpus: Corpus | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CorpusDetailModal: React.FC<CorpusDetailModalProps> = ({
  corpus,
  isOpen,
  onClose
}) => {
  if (!isOpen || !corpus) return null;

  const category = corpusCategories.find(c => c.id === corpus.category);

  const handleCopy = () => {
    navigator.clipboard.writeText(corpus.content);
    // 可以添加toast提示
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden animate-fadeIn">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <div className="flex items-center gap-3">
            <span 
              className="px-2.5 py-1 text-xs rounded-full border font-medium"
              style={{ 
                backgroundColor: `${category?.color}20`, 
                borderColor: `${category?.color}40`,
                color: category?.color 
              }}
            >
              {category?.name || corpus.category}
            </span>
            <span className="text-sm text-[#6b7280]">
              {new Date(corpus.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 bg-[#5765c7] hover:bg-[#4654b6] text-white rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              复制内容
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#6b7280] hover:text-white hover:bg-[#222] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* 标题 */}
          <h2 className="text-xl font-bold text-white mb-4">{corpus.title}</h2>

          {/* 标签 */}
          {corpus.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {corpus.tags.map((tag) => (
                <span 
                  key={tag}
                  className="text-sm text-[#9ca3af] bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 语料内容 */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#333]">
            <pre className="text-[#e5e5e5] whitespace-pre-wrap font-sans leading-relaxed">
              {corpus.content}
            </pre>
          </div>

          {/* 来源 */}
          {corpus.source && (
            <div className="mt-6 pt-4 border-t border-[#333]">
              <p className="text-sm text-[#6b7280]">
                <span className="text-[#9ca3af]">来源：</span>
                {corpus.source}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
