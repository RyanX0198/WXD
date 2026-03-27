// 参照DESIGN_SYSTEM.md Card规范
import React, { useState } from 'react';
import { WritingRequest } from '../../types/writing';
import { documentTypes, writingStyles, writingTones, wordCountOptions } from '../../data/writingConfig';

interface PromptPreviewProps {
  request: Partial<WritingRequest>;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({ request }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const docType = documentTypes.find(t => t.id === request.documentType);
  const style = writingStyles.find(s => s.id === request.style);
  const tone = writingTones.find(t => t.id === request.tone);
  const wordCount = wordCountOptions.find(w => w.value === request.wordCount);

  const generatePrompt = () => {
    if (!docType) return '请先选择文种类型...';
    
    return docType.promptTemplate
      .replace('{topic}', request.topic || '[主题]')
      .replace('{wordCount}', String(request.wordCount || 800))
      .replace('{keywords}', request.keywords?.join('、') || '[关键词]')
      .replace('{style}', style?.name || '[风格]')
      .replace('{tone}', tone?.name || '[语气]')
      .replace('{requirements}', request.requirements || '无');
  };

  const hasContent = request.documentType || request.topic;

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
      {/* 头部 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔍</span>
          <div className="text-left">
            <h3 className="text-base font-medium text-white">提示词预览</h3>
            <p className="text-sm text-[#9ca3af]">
              {hasContent ? '已根据您的选择生成提示词' : '选择文种后将显示提示词预览'}
            </p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-[#9ca3af] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 内容区 */}
      {isExpanded && (
        <div className="border-t border-[#333] p-4 space-y-4">
          {/* 配置摘要 */}
          {hasContent && (
            <div className="flex flex-wrap gap-2">
              {docType && (
                <span className="text-xs bg-[#5765c7]/20 text-[#5765c7] px-2 py-1 rounded-full">
                  {docType.icon} {docType.name}
                </span>
              )}
              {style && (
                <span className="text-xs bg-[#a0fcc9]/20 text-[#a0fcc9] px-2 py-1 rounded-full">
                  ✨ {style.name}
                </span>
              )}
              {tone && (
                <span className="text-xs bg-[#ffa6ac]/20 text-[#ffa6ac] px-2 py-1 rounded-full">
                  🎯 {tone.name}
                </span>
              )}
              {wordCount && (
                <span className="text-xs bg-[#333] text-[#9ca3af] px-2 py-1 rounded-full">
                  📝 {wordCount.label}
                </span>
              )}
            </div>
          )}

          {/* 提示词内容 */}
          <div className="bg-[#0a0a0a] rounded-lg p-4">
            <pre className="text-sm text-[#9ca3af] whitespace-pre-wrap font-mono leading-relaxed">
              {generatePrompt()}
            </pre>
          </div>

          {/* 提示说明 */}
          <div className="flex items-start gap-2 text-xs text-[#6b7280]">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>此提示词将发送给AI模型用于生成文稿。您可以在下方补充更多具体要求。</span>
          </div>
        </div>
      )}
    </div>
  );
};
