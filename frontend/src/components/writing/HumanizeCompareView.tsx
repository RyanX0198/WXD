import React, { useState } from 'react';

export interface ComparisonData {
  original: string;
  humanized: string;
  changes: {
    type: 'removed' | 'added' | 'modified';
    description: string;
  }[];
}

interface HumanizeCompareViewProps {
  data: ComparisonData | null;
  isProcessing?: boolean;
}

export const HumanizeCompareView: React.FC<HumanizeCompareViewProps> = ({
  data,
  isProcessing = false
}) => {
  const [activeTab, setActiveTab] = useState<'split' | 'original' | 'humanized'>('split');
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  if (isProcessing) {
    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#333] border-t-[#a0fcc9] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#9ca3af]">正在去除AI痕迹...</p>
        <p className="text-xs text-[#6b7280] mt-2">分析文本结构 · 优化表达方式 · 添加人性化元素</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">🔄</div>
        <p className="text-[#9ca3af]">生成内容后将显示对比预览</p>
        <p className="text-xs text-[#6b7280] mt-2">开启"去AI味"功能可查看效果对比</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
      {/* 头部标签 */}
      <div className="flex border-b border-[#333]">
        {[
          { id: 'split', label: '分屏对比', icon: '⚖️' },
          { id: 'original', label: 'AI原文', icon: '🤖' },
          { id: 'humanized', label: '人性化版本', icon: '👤' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 py-3 px-4 text-sm font-medium transition-all duration-200
              flex items-center justify-center gap-2
              ${activeTab === tab.id
                ? 'bg-[#1a1a1a] text-white border-b-2 border-[#a0fcc9]'
                : 'text-[#6b7280] hover:text-[#9ca3af]'
              }
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {/* 分屏对比模式 */}
        {activeTab === 'split' && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* 左侧：原文 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#6b7280] mb-2">
                <span className="w-6 h-6 rounded bg-[#333] flex items-center justify-center text-xs">🤖</span>
                <span>AI生成原文</span>
              </div>
              <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 text-sm text-[#9ca3af] leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {data.original.split('\n').map((line, idx) => (
                  <div 
                    key={idx}
                    className={`
                      py-1 px-2 -mx-2 rounded transition-colors
                      ${hoveredSection === idx ? 'bg-red-500/10' : ''}
                    `}
                    onMouseEnter={() => setHoveredSection(idx)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：改写后 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-[#a0fcc9] mb-2">
                <span className="w-6 h-6 rounded bg-[#a0fcc9]/20 flex items-center justify-center text-xs">👤</span>
                <span>人性化版本</span>
              </div>
              <div className="bg-[#0a0a0a] border border-[#a0fcc9]/30 rounded-lg p-4 text-sm text-white leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {data.humanized.split('\n').map((line, idx) => (
                  <div 
                    key={idx}
                    className={`
                      py-1 px-2 -mx-2 rounded transition-colors
                      ${hoveredSection === idx ? 'bg-[#a0fcc9]/10' : ''}
                    `}
                    onMouseEnter={() => setHoveredSection(idx)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    {line || ' '}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 仅显示原文 */}
        {activeTab === 'original' && (
          <div className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4 text-sm text-[#9ca3af] leading-relaxed whitespace-pre-wrap min-h-[300px]">
            {data.original}
          </div>
        )}

        {/* 仅显示改写后 */}
        {activeTab === 'humanized' && (
          <div className="bg-[#0a0a0a] border border-[#a0fcc9]/30 rounded-lg p-4 text-sm text-white leading-relaxed whitespace-pre-wrap min-h-[300px]">
            {data.humanized}
          </div>
        )}
      </div>

      {/* 修改说明 */}
      {data.changes.length > 0 && (
        <div className="border-t border-[#333] p-4 bg-[#0a0a0a]">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <span>📝</span>
            主要改动
          </h4>
          <div className="grid md:grid-cols-2 gap-2">
            {data.changes.map((change, idx) => (
              <div 
                key={idx}
                className={`
                  flex items-start gap-2 text-xs p-2 rounded-lg
                  ${change.type === 'removed' ? 'bg-red-500/10 text-red-400' : ''}
                  ${change.type === 'added' ? 'bg-[#a0fcc9]/10 text-[#a0fcc9]' : ''}
                  ${change.type === 'modified' ? 'bg-yellow-500/10 text-yellow-400' : ''}
                `}
              >
                <span>
                  {change.type === 'removed' && '❌'}
                  {change.type === 'added' && '✅'}
                  {change.type === 'modified' && '✏️'}
                </span>
                <span>{change.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用提示 */}
      <div className="border-t border-[#333] p-4 bg-[#111]">
        <p className="text-xs text-[#6b7280] flex items-start gap-2">
          <span>💡</span>
          <span>
            分屏对比模式下，鼠标悬停可查看对应段落的变化。
            人性化版本已针对AI检测进行了优化，降低了被识别为机器生成内容的概率。
          </span>
        </p>
      </div>
    </div>
  );
};
