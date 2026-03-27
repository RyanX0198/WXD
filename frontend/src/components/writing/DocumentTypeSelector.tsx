// 参照DESIGN_SYSTEM.md Button/Card规范
import React, { useState } from 'react';
import { DocumentType, DocumentTypeConfig } from '../../types/writing';
import { documentTypes } from '../../data/writingConfig';

interface DocumentTypeSelectorProps {
  selectedType: DocumentType | null;
  onSelect: (type: DocumentType) => void;
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  selectedType,
  onSelect
}) => {
  const [hoveredType, setHoveredType] = useState<DocumentType | null>(null);
  
  const activeType = hoveredType || selectedType;
  const activeConfig = documentTypes.find(t => t.id === activeType);

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">📝</span>
        <h2 className="text-xl font-semibold text-white">选择文种</h2>
      </div>

      {/* 文种卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {documentTypes.map((docType) => (
          <button
            key={docType.id}
            onClick={() => onSelect(docType.id)}
            onMouseEnter={() => setHoveredType(docType.id)}
            onMouseLeave={() => setHoveredType(null)}
            className={`
              relative p-6 rounded-xl border text-left transition-all duration-200
              ${selectedType === docType.id
                ? 'bg-[#5765c7]/20 border-[#5765c7] ring-2 ring-[#5765c7]/30'
                : 'bg-[#111] border-[#333] hover:border-[#5765c7]/50'
              }
            `}
          >
            {/* 选中标记 */}
            {selectedType === docType.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-[#5765c7] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {/* 图标和名称 */}
            <div className="text-3xl mb-3">{docType.icon}</div>
            <h3 className="text-lg font-medium text-white mb-1">{docType.name}</h3>
            <p className="text-sm text-[#9ca3af] leading-relaxed">{docType.description}</p>
          </button>
        ))}
      </div>

      {/* 选中/悬停文种的详细引导 */}
      {activeConfig && (
        <div className="bg-[#111] border border-[#333] rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{activeConfig.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-white">{activeConfig.name}</h3>
              <p className="text-sm text-[#9ca3af]">{activeConfig.description}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 写作建议 */}
            <div>
              <h4 className="text-sm font-medium text-[#5765c7] mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                写作建议
              </h4>
              <ul className="space-y-2">
                {activeConfig.writingTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                    <span className="text-[#5765c7] mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 结构提示 */}
            <div>
              <h4 className="text-sm font-medium text-[#5765c7] mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                结构提示
              </h4>
              <ul className="space-y-2">
                {activeConfig.structureHints.map((hint, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                    <span className="text-[#a0fcc9] mt-0.5">{index + 1}.</span>
                    <span>{hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 示例标题 */}
          <div className="mt-4 pt-4 border-t border-[#333]">
            <h4 className="text-sm font-medium text-[#9ca3af] mb-2">示例标题</h4>
            <div className="flex flex-wrap gap-2">
              {activeConfig.exampleTitles.map((title, index) => (
                <span 
                  key={index}
                  className="text-xs bg-[#1a1a1a] text-[#9ca3af] px-3 py-1.5 rounded-full border border-[#333]"
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
