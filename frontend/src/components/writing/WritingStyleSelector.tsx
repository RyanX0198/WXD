// 参照DESIGN_SYSTEM.md Card/间距规范
import React from 'react';
import { WritingStyle } from '../../types/writing';
import { writingStyles } from '../../data/writingConfig';

interface WritingStyleSelectorProps {
  selectedStyle: WritingStyle | null;
  onSelect: (style: WritingStyle) => void;
  documentType?: string;
}

export const WritingStyleSelector: React.FC<WritingStyleSelectorProps> = ({
  selectedStyle,
  onSelect,
  documentType
}) => {
  // 根据文种推荐合适的风格
  const getRecommendation = (styleId: WritingStyle) => {
    if (!documentType) return null;
    const style = writingStyles.find(s => s.id === styleId);
    if (style?.suitableFor.includes(documentType as any)) {
      return '推荐';
    }
    return null;
  };

  const styleIcons: Record<WritingStyle, string> = {
    formal: '🏛️',
    concise: '⚡',
    vivid: '🎨',
    rigorous: '📐',
    approachable: '🤝'
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">✨</span>
        <div>
          <h2 className="text-xl font-semibold text-white">写作风格</h2>
          <p className="text-sm text-[#9ca3af]">选择适合您的语言风格</p>
        </div>
      </div>

      {/* 风格选项 */}
      <div className="grid grid-cols-1 gap-3">
        {writingStyles.map((style) => {
          const recommendation = getRecommendation(style.id);
          
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              className={`
                relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
                ${selectedStyle === style.id
                  ? 'bg-[#5765c7]/20 border-[#5765c7] ring-1 ring-[#5765c7]/30'
                  : 'bg-[#111] border-[#333] hover:border-[#444]'
                }
              `}
            >
              {/* 图标 */}
              <div className="text-3xl flex-shrink-0">{styleIcons[style.id]}</div>
              
              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-medium text-white">{style.name}</h3>
                  {recommendation && (
                    <span className="text-xs bg-[#a0fcc9]/20 text-[#a0fcc9] px-2 py-0.5 rounded-full">
                      {recommendation}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#9ca3af] mb-2">{style.description}</p>
                
                {/* 特征标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {style.characteristics.map((char, idx) => (
                    <span 
                      key={idx}
                      className="text-xs bg-[#1a1a1a] text-[#6b7280] px-2 py-0.5 rounded"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>

              {/* 选中指示器 */}
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${selectedStyle === style.id
                  ? 'border-[#5765c7] bg-[#5765c7]'
                  : 'border-[#444]'
                }
              `}>
                {selectedStyle === style.id && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
