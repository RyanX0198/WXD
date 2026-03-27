import React from 'react';

interface AIDetectionScoreProps {
  originalScore?: number;  // 0-100, 越高越像AI
  humanizedScore?: number; // 0-100, 越高越像AI
  isLoading?: boolean;
}

export const AIDetectionScore: React.FC<AIDetectionScoreProps> = ({
  originalScore,
  humanizedScore,
  isLoading = false
}) => {
  // 获取评分颜色
  const getScoreColor = (score: number, isAI: boolean) => {
    if (isAI) {
      // AI检测评分：越高越红（危险）
      if (score >= 80) return { bg: 'bg-red-500', text: 'text-red-400', label: '高风险' };
      if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: '中等风险' };
      return { bg: 'bg-[#a0fcc9]', text: 'text-[#a0fcc9]', label: '低风险' };
    } else {
      // 人类化评分：越高越绿（好）
      if (score >= 80) return { bg: 'bg-[#a0fcc9]', text: 'text-[#a0fcc9]', label: '非常自然' };
      if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-400', label: '较为自然' };
      return { bg: 'bg-red-500', text: 'text-red-400', label: '仍需优化' };
    }
  };

  const getHumanLikeness = (aiScore: number) => Math.max(0, 100 - aiScore);

  if (isLoading) {
    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#333] border-t-[#5765c7] rounded-full animate-spin"></div>
          <div>
            <p className="text-sm text-white">正在分析...</p>
            <p className="text-xs text-[#6b7280]">检测AI生成概率</p>
          </div>
        </div>
      </div>
    );
  }

  // 单版本评分（未开启去AI味时）
  if (originalScore !== undefined && humanizedScore === undefined) {
    const colors = getScoreColor(originalScore, true);
    const humanLike = getHumanLikeness(originalScore);

    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <span>🤖</span>
            AI检测评分
          </h4>
          <span className={`text-xs px-2 py-1 rounded-full ${colors.bg}/20 ${colors.text}`}>
            {colors.label}
          </span>
        </div>
        
        {/* 进度条 */}
        <div className="relative h-3 bg-[#333] rounded-full overflow-hidden mb-2">
          <div 
            className={`absolute left-0 top-0 h-full ${colors.bg} transition-all duration-1000`}
            style={{ width: `${originalScore}%` }}
          />
          <div className="absolute inset-0 flex">
            <div className="flex-1 border-r border-[#111]/30"></div>
            <div className="flex-1 border-r border-[#111]/30"></div>
            <div className="flex-1"></div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-[#6b7280]">
          <span>人类写作</span>
          <span className="text-white font-medium">{originalScore}% AI概率</span>
          <span>机器生成</span>
        </div>

        {originalScore >= 70 && (
          <p className="mt-3 text-xs text-yellow-400 flex items-start gap-2">
            <span>⚠️</span>
            <span>当前内容AI痕迹较重，建议开启"去AI味"功能优化</span>
          </p>
        )}
      </div>
    );
  }

  // 对比评分（开启去AI味后）
  if (originalScore !== undefined && humanizedScore !== undefined) {
    const originalColors = getScoreColor(originalScore, true);
    const humanizedColors = getScoreColor(humanizedScore, true);
    const improvement = Math.max(0, originalScore - humanizedScore);

    return (
      <div className="bg-[#111] border border-[#333] rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <span>📊</span>
            AI检测对比
          </h4>
          {improvement > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-[#a0fcc9]/20 text-[#a0fcc9] flex items-center gap-1">
              <span>↓</span>
              降低 {improvement}%
            </span>
          )}
        </div>

        {/* 原文评分 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#9ca3af]">🤖 AI原文</span>
            <span className={`text-xs font-medium ${originalColors.text}`}>
              {originalScore}% AI概率
            </span>
          </div>
          <div className="relative h-2 bg-[#333] rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full ${originalColors.bg} transition-all duration-1000`}
              style={{ width: `${originalScore}%` }}
            />
          </div>
        </div>

        {/* 人性化评分 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a0fcc9]">👤 人性化版本</span>
            <span className={`text-xs font-medium ${humanizedColors.text}`}>
              {humanizedScore}% AI概率
            </span>
          </div>
          <div className="relative h-2 bg-[#333] rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full ${humanizedColors.bg} transition-all duration-1000`}
              style={{ width: `${humanizedScore}%` }}
            />
          </div>
        </div>

        {/* 效果评估 */}
        <div className="mt-4 pt-3 border-t border-[#333]">
          {improvement >= 30 ? (
            <p className="text-xs text-[#a0fcc9] flex items-start gap-2">
              <span>✨</span>
              <span>优化效果显著！内容更加自然，AI检测风险大幅降低</span>
            </p>
          ) : improvement >= 10 ? (
            <p className="text-xs text-yellow-400 flex items-start gap-2">
              <span>👍</span>
              <span>有一定改善，如需要更自然的效果可尝试"深度"模式</span>
            </p>
          ) : (
            <p className="text-xs text-[#6b7280] flex items-start gap-2">
              <span>💡</span>
              <span>当前内容本身已较为自然，或建议调整原始提示词</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // 默认状态
  return (
    <div className="bg-[#111] border border-[#333] rounded-xl p-4">
      <p className="text-sm text-[#6b7280] text-center">
        生成内容后将显示AI检测评分
      </p>
    </div>
  );
};
