import React from 'react';

export type HumanizeLevel = 'light' | 'medium' | 'deep';

export interface HumanizeConfig {
  enabled: boolean;
  level: HumanizeLevel;
}

export interface HumanizeLevelConfig {
  id: HumanizeLevel;
  name: string;
  description: string;
  features: string[];
  icon: string;
}

export const humanizeLevelConfigs: HumanizeLevelConfig[] = [
  {
    id: 'light',
    name: '轻度',
    description: '保留核心逻辑，轻微优化',
    features: ['减少套话', '调整句式节奏'],
    icon: '🌱'
  },
  {
    id: 'medium',
    name: '中度',
    description: '平衡自然与规范',
    features: ['加入口语化表达', '打破规整结构', '适当停顿词'],
    icon: '🌿'
  },
  {
    id: 'deep',
    name: '深度',
    description: '彻底人性化改写',
    features: ['自然口语风格', '轻微不完美', '短句强调', '去AI化'],
    icon: '🔥'
  }
];

interface HumanizeLevelSelectorProps {
  selectedLevel: HumanizeLevel;
  onSelect: (level: HumanizeLevel) => void;
  disabled?: boolean;
}

export const HumanizeLevelSelector: React.FC<HumanizeLevelSelectorProps> = ({
  selectedLevel,
  onSelect,
  disabled = false
}) => {
  return (
    <div className={`space-y-3 ${disabled ? 'opacity-50' : ''}`}>
      <div className="grid grid-cols-3 gap-3">
        {humanizeLevelConfigs.map((level) => (
          <button
            key={level.id}
            onClick={() => !disabled && onSelect(level.id)}
            disabled={disabled}
            className={`
              relative p-4 rounded-xl border-2 transition-all duration-200 text-left
              ${selectedLevel === level.id && !disabled
                ? 'border-[#a0fcc9] bg-[#a0fcc9]/10'
                : 'border-[#333] bg-[#1a1a1a] hover:border-[#444]'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* 选中标记 */}
            {selectedLevel === level.id && !disabled && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-[#a0fcc9] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            <div className="text-2xl mb-2">{level.icon}</div>
            <div className="font-medium text-white mb-1">{level.name}</div>
            <div className="text-xs text-[#9ca3af] mb-2">{level.description}</div>
            
            {/* 特性标签 */}
            <div className="flex flex-wrap gap-1">
              {level.features.slice(0, 2).map((feature, idx) => (
                <span 
                  key={idx}
                  className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${selectedLevel === level.id && !disabled
                      ? 'bg-[#a0fcc9]/20 text-[#a0fcc9]'
                      : 'bg-[#333] text-[#6b7280]'
                    }
                  `}
                >
                  {feature}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
      
      {/* 当前级别说明 */}
      {!disabled && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-[#a0fcc9]">
            <span>💡</span>
            <span>当前效果预览：</span>
          </div>
          <p className="text-xs text-[#9ca3af] mt-1 ml-6">
            {humanizeLevelConfigs.find(l => l.id === selectedLevel)?.features.join('、')}
          </p>
        </div>
      )}
    </div>
  );
};
