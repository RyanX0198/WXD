import React, { useState } from 'react';
import { SimilarityBadge } from './SimilarityBadge';
import { ChevronDown, ChevronUp, FileText, Quote } from 'lucide-react';

interface DocumentSnippetProps {
  id: string;
  documentName: string;
  content: string;
  similarity: number;
  metadata?: {
    page?: number;
    chunkIndex?: number;
    totalChunks?: number;
  };
  onQuote?: (content: string) => void;
  expanded?: boolean;
}

export const DocumentSnippet: React.FC<DocumentSnippetProps> = ({
  documentName,
  content,
  similarity,
  metadata,
  onQuote,
  expanded: initialExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isHovered, setIsHovered] = useState(false);

  // 截断过长的内容
  const maxLength = 300;
  const shouldTruncate = content.length > maxLength;
  const displayContent = isExpanded || !shouldTruncate
    ? content
    : content.slice(0, maxLength) + '...';

  return (
    <div
      className="group bg-[#111] border border-[#333] rounded-xl overflow-hidden transition-all duration-200 hover:border-[#5765c7]/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-[#222]">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-[#5765c7]" />
          <span className="text-sm font-medium text-white truncate max-w-[200px]">
            {documentName}
          </span>
          {metadata?.page && (
            <span className="text-xs text-gray-500">
              第{metadata.page}页
            </span>
          )}
          {metadata?.chunkIndex !== undefined && metadata?.totalChunks && (
            <span className="text-xs text-gray-500">
              片段 {metadata.chunkIndex + 1}/{metadata.totalChunks}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SimilarityBadge similarity={similarity} size="sm" />
          {onQuote && isHovered && (
            <button
              onClick={() => onQuote(content)}
              className="p-1.5 rounded-lg bg-[#5765c7]/20 text-[#5765c7] hover:bg-[#5765c7]/30 transition-colors"
              title="引用到编辑器"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4">
        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
          {displayContent}
        </p>

        {/* 展开/收起按钮 */}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center gap-1 text-xs text-[#5765c7] hover:text-[#4654b6] transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                展开全文
              </>
            )}
          </button>
        )}
      </div>

      {/* 底部进度条 - 可视化相似度 */}
      <div className="h-1 bg-[#222]">
        <div
          className={`h-full transition-all duration-500 ${
            similarity >= 0.8 ? 'bg-emerald-500' :
            similarity >= 0.6 ? 'bg-blue-500' :
            similarity >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${similarity * 100}%` }}
        />
      </div>
    </div>
  );
};
