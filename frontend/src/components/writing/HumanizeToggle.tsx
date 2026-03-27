import React from 'react';
import { HumanizeConfig, HumanizeLevel } from './HumanizeLevelSelector';

interface HumanizeToggleProps {
  config: HumanizeConfig;
  onChange: (config: HumanizeConfig) => void;
}

export const HumanizeToggle: React.FC<HumanizeToggleProps> = ({
  config,
  onChange
}) => {
  const handleToggle = () => {
    onChange({
      ...config,
      enabled: !config.enabled
    });
  };

  const handleLevelChange = (level: HumanizeLevel) => {
    onChange({
      ...config,
      level
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-[#333] rounded-xl p-5">
      {/* 标题和开关 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
            ${config.enabled 
              ? 'bg-gradient-to-br from-[#a0fcc9] to-[#5765c7]' 
              : 'bg-[#333]'
            }
          `}>
            <span className="text-xl">{config.enabled ? '👤' : '🤖'}</span>
          </div>
          <div>
            <h3 className="font-medium text-white flex items-center gap-2">
              去AI味
              <span className={`
                text-xs px-2 py-0.5 rounded-full font-normal
                ${config.enabled 
                  ? 'bg-[#a0fcc9]/20 text-[#a0fcc9]' 
                  : 'bg-[#333] text-[#6b7280]'
                }
              `}>
                {config.enabled ? '已开启' : '未开启'}
              </span>
            </h3>
            <p className="text-xs text-[#9ca3af]">
              {config.enabled 
                ? '文稿将经过人性化处理，更自然真实' 
                : '开启后可降低AI痕迹，提升真实感'
              }
            </p>
          </div>
        </div>
        
        {/* 开关按钮 */}
        <button
          onClick={handleToggle}
          className={`
            relative w-14 h-7 rounded-full transition-all duration-300
            ${config.enabled ? 'bg-[#a0fcc9]' : 'bg-[#333]'}
          `}
        >
          <span className={`
            absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md
            transition-transform duration-300
            ${config.enabled ? 'translate-x-7' : 'translate-x-0'}
          `}>
            <span className="absolute inset-0 flex items-center justify-center text-xs">
              {config.enabled ? '✓' : '✕'}
            </span>
          </span>
        </button>
      </div>

      {/* 强度选择 */}
      {config.enabled && (
        <div className="border-t border-[#333] pt-4 animate-fadeIn">
          <label className="text-sm font-medium text-white mb-3 block">
            去AI强度
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', label: '轻度', desc: '轻微优化', icon: '🌱' },
              { id: 'medium', label: '中度', desc: '自然平衡', icon: '🌿' },
              { id: 'deep', label: '深度', desc: '彻底改写', icon: '🔥' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => handleLevelChange(level.id as HumanizeLevel)}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all duration-200
                  ${config.level === level.id
                    ? 'border-[#a0fcc9] bg-[#a0fcc9]/10'
                    : 'border-[#333] bg-[#1a1a1a] hover:border-[#555]'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <span>{level.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-white">{level.label}</div>
                    <div className="text-xs text-[#6b7280]">{level.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {/* 效果说明 */}
          <div className="mt-4 bg-[#0a0a0a] rounded-lg p-3 border border-[#333]">
            <div className="flex items-start gap-2 text-xs">
              <span className="text-[#a0fcc9] mt-0.5">✨</span>
              <div className="text-[#9ca3af]">
                <span className="text-white font-medium">当前效果：</span>
                {config.level === 'light' && '减少套话，保留主要结构，适合正式场合'}
                {config.level === 'medium' && '加入口语化表达，打破规整结构，自然流畅'}
                {config.level === 'deep' && '彻底人性化改写，轻微不完美，完全去AI化'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 未开启时的提示 */}
      {!config.enabled && (
        <div className="mt-4 flex items-start gap-2 text-xs text-[#6b7280]">
          <span>💡</span>
          <p>
            AI生成的文本往往过于规整、使用"首先/其次/综上所述"等套话。
            开启此功能可降低AI检测率，让内容更像真人写作。
          </p>
        </div>
      )}
    </div>
  );
};
