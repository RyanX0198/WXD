// 语料卡片组件
import React from 'react';
import { Corpus } from '../../types/corpus';
import { corpusCategories } from '../../types/corpus';

interface CorpusCardProps {
  corpus: Corpus;
  onClick?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  selectable?: boolean;
}

export const CorpusCard: React.FC<CorpusCardProps> = ({
  corpus,
  onClick,
  onDelete,
  selected = false,
  selectable = false
}) => {
  const category = corpusCategories.find(c => c.id === corpus.category);
  
  // 截取内容摘要
  const summary = corpus.content.length > 100 
    ? corpus.content.slice(0, 100) + '...' 
    : corpus.content;

  return (
    <div
      onClick={onClick}
      className={`
        relative p-5 rounded-xl border transition-all duration-200 cursor-pointer
        ${selected 
          ? 'bg-[#5765c7]/20 border-[#5765c7] ring-2 ring-[#5765c7]/30' 
          : 'bg-[#111] border-[#333] hover:border-[#5765c7]/50'
        }
      `}
    >
      {/* 选中标记 */}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 bg-[#5765c7] rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* 分类标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span 
          className="px-2 py-0.5 text-xs rounded-full border"
          style={{ 
            backgroundColor: `${category?.color}20`, 
            borderColor: `${category?.color}40`,
            color: category?.color 
          }}
        >
          {category?.name || corpus.category}
        </span>
        <span className="text-xs text-[#6b7280]">
          {new Date(corpus.createdAt).toLocaleDateString('zh-CN')}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">{corpus.title}</h3>

      {/* 内容摘要 */}
      <p className="text-sm text-[#9ca3af] mb-3 line-clamp-2 leading-relaxed">{summary}</p>

      {/* 标签 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {corpus.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="text-xs text-[#9ca3af] bg-[#1a1a1a] px-2 py-0.5 rounded">
              #{tag}
            </span>
          ))}
          {corpus.tags.length > 3 && (
            <span className="text-xs text-[#6b7280]">+{corpus.tags.length - 3}</span>
          )}
        </div>

        {/* 删除按钮 */}
        {onDelete && !selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-[#6b7280] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
