// 参照DESIGN_SYSTEM.md Button/Card规范
import React from 'react';
import { WritingTone } from '../../types/writing';
import { writingTones } from '../../data/writingConfig';

interface WritingToneSelectorProps {
  selectedTone: WritingTone | null;
  onSelect: (tone: WritingTone) => void;
}

export const WritingToneSelector: React.FC<WritingToneSelectorProps> = ({
  selectedTone,
  onSelect
}) => {
  const toneColors: Record<WritingTone, { bg: string; text: string }> = {
    authoritative: { bg: 'bg-red-500/20', text: 'text-red-400' },
    guiding: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    encouraging: { bg: 'bg-green-500/20', text: 'text-green-400' },
    neutral: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
    urgent: { bg: 'bg-orange-500/20', text: 'text-orange-400' }
  };

  const toneIcons: Record<WritingTone, string> = {
    authoritative: '👑',
    guiding: '🧭',
    encouraging: '💪',
    neutral: '⚖️',
    urgent: '⏰'
  };

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎯</span>
        <div>
          <h2 className="text-xl font-semibold text-white">语气基调</h2>
          <p className="text-sm text-[#9ca3af]">设定文稿的整体语气</p>
        </div>
      </div>

      {/* 语气选项 - 横向排列 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {writingTones.map((tone) => {
          const colors = toneColors[tone.id];
          
          return (
            <button
              key={tone.id}
              onClick={() => onSelect(tone.id)}
              className={`
                relative p-4 rounded-xl border text-center transition-all duration-200
                ${selectedTone === tone.id
                  ? 'bg-[#5765c7]/20 border-[#5765c7] ring-1 ring-[#5765c7]/30'
                  : 'bg-[#111] border-[#333] hover:border-[#444]'
                }
              `}
            >
              {/* 图标 */}
              <div className="text-2xl mb-2">{toneIcons[tone.id]}</div>
              
              {/* 名称 */}
              <h3 className="text-sm font-medium text-white mb-1">{tone.name}</h3>
              
              {/* 描述 */}
              <p className="text-xs text-[#9ca3af] mb-2">{tone.description}</p>
              
              {/* 关键词标签 */}
              <div className="flex flex-wrap justify-center gap-1">
                {tone.keywords.slice(0, 2).map((keyword, idx) => (
                  <span 
                    key={idx}
                    className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              {/* 选中指示器 */}
              {selectedTone === tone.id && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-[#5765c7] rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
