// 参照DESIGN_SYSTEM.md Input/间距规范
import React, { useState } from 'react';
import { wordCountOptions } from '../../data/writingConfig';
import { HumanizeToggle } from './HumanizeToggle';
import { HumanizeConfig } from './HumanizeLevelSelector';

interface WritingFormProps {
  topic: string;
  onTopicChange: (value: string) => void;
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
  wordCount: number;
  onWordCountChange: (value: number) => void;
  requirements: string;
  onRequirementsChange: (value: string) => void;
  // 去AI味相关属性
  humanizeConfig: HumanizeConfig;
  onHumanizeChange: (config: HumanizeConfig) => void;
}

export const WritingForm: React.FC<WritingFormProps> = ({
  topic,
  onTopicChange,
  keywords,
  onKeywordsChange,
  wordCount,
  onWordCountChange,
  requirements,
  onRequirementsChange,
  humanizeConfig,
  onHumanizeChange
}) => {
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      onKeywordsChange([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    onKeywordsChange(keywords.filter(k => k !== keyword));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-6">
      {/* 主题输入 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📌</span>
          写作主题
          <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder="请输入文稿主题，例如：优化营商环境、数字化转型..."
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                     placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                     transition-all duration-200"
        />
      </div>

      {/* 关键词 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>🏷️</span>
          关键词
          <span className="text-xs text-[#6b7280] font-normal">（按回车添加）</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入关键词后按回车..."
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                       placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                       transition-all duration-200"
          />
          <button
            onClick={handleAddKeyword}
            disabled={!keywordInput.trim()}
            className="px-4 py-3 bg-[#333] hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed
                       text-white rounded-lg transition-colors"
          >
            添加
          </button>
        </div>
        
        {/* 关键词标签 */}
        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#5765c7]/20 text-[#5765c7] 
                           rounded-full text-sm border border-[#5765c7]/30"
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 字数选择 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📏</span>
          字数要求
        </label>
        <div className="grid grid-cols-5 gap-2">
          {wordCountOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onWordCountChange(option.value)}
              className={`
                py-2 px-3 rounded-lg text-sm border transition-all duration-200
                ${wordCount === option.value
                  ? 'bg-[#5765c7] border-[#5765c7] text-white'
                  : 'bg-[#1a1a1a] border-[#333] text-[#9ca3af] hover:border-[#444]'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 去AI味功能 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>👤</span>
          内容优化
        </label>
        <HumanizeToggle 
          config={humanizeConfig}
          onChange={onHumanizeChange}
        />
      </div>

      {/* 补充要求 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📝</span>
          补充要求
          <span className="text-xs text-[#6b7280] font-normal">（可选）</span>
        </label>
        <textarea
          value={requirements}
          onChange={(e) => onRequirementsChange(e.target.value)}
          placeholder="请输入其他特殊要求，例如：需要引用最新政策、突出某个重点、针对特定受众..."
          rows={3}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                     placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                     transition-all duration-200 resize-none"
        />
      </div>
    </div>
  );
};
