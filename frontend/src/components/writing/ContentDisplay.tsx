// 参照DESIGN_SYSTEM.md 阅读模式规范
import React, { useState } from 'react';
import { WritingResponse } from '../../types/writing';

interface ContentDisplayProps {
  content: WritingResponse | null;
  isLoading?: boolean;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  isLoading,
  onRegenerate,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'outline' | 'suggestions'>('content');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* 加载动画 */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-[#333] border-t-[#5765c7] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg">✍️</span>
            </div>
          </div>
          <p className="text-[#9ca3af]">正在为您创作文稿...请稍候</p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[#5765c7] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-[#5765c7] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-[#5765c7] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="text-5xl">📝</div>
          <h3 className="text-lg font-medium text-white">文稿将在此显示</h3>
          <p className="text-sm text-[#9ca3af] max-w-md">
            在左侧填写写作要求，选择文种、风格和语气，点击"生成文稿"按钮，AI将为您创作专业文稿
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 普通模式 */}
      <div className={`bg-[#111] border border-[#333] rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* 工具栏 */}
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          {/* Tab 切换 */}
          <div className="flex gap-1 bg-[#1a1a1a] rounded-lg p-1">
            {[
              { id: 'content', label: '文稿内容', icon: '📝' },
              { id: 'outline', label: '结构大纲', icon: '📋' },
              { id: 'suggestions', label: '优化建议', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all duration-200
                  ${activeTab === tab.id
                    ? 'bg-[#5765c7] text-white'
                    : 'text-[#9ca3af] hover:text-white'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-[#9ca3af] hover:text-white hover:bg-[#222] rounded-lg transition-colors"
              title={isFullscreen ? '退出全屏' : '全屏阅读'}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isFullscreen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </>
                )}
              </svg>
            </button>
            
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-2 px-4 py-2 bg-[#333] hover:bg-[#444] text-white rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                重新生成
              </button>
            )}
          </div>
        </div>

        {/* 内容区 */}
        <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'max-h-[600px]'} overflow-y-auto`}>
          {activeTab === 'content' && (
            <div className="p-8">
              {/* 标题 */}
              <h1 className="text-2xl font-bold text-white mb-8 text-center">
                {content.title}
              </h1>
              
              {/* 正文 - 阅读模式样式 */}
              <div 
                className="prose prose-invert max-w-none"
                style={{ 
                  fontFamily: '"Noto Serif SC", serif',
                  lineHeight: 2,
                  fontSize: '18px'
                }}
              >
                {content.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-[#e5e5e5] mb-6 text-justify indent-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'outline' && (
            <div className="p-8">
              <h3 className="text-lg font-medium text-white mb-6">文章结构大纲</h3>
              <div className="space-y-3">
                {content.outline.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#333]"
                  >
                    <span className="w-6 h-6 bg-[#5765c7] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[#e5e5e5]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div className="p-8">
              <h3 className="text-lg font-medium text-white mb-6">AI优化建议</h3>
              <div className="space-y-4">
                {content.suggestions.map((suggestion, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#333]"
                  >
                    <span className="text-xl">💡</span>
                    <p className="text-[#9ca3af] leading-relaxed">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
