import React from 'react';

interface SimilarityBadgeProps {
  similarity: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export const SimilarityBadge: React.FC<SimilarityBadgeProps> = ({
  similarity,
  size = 'md',
  showValue = true,
}) => {
  // 根据相似度确定颜色
  const getColor = (score: number) => {
    if (score >= 0.9) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    if (score >= 0.8) return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
    if (score >= 0.7) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' };
    if (score >= 0.6) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' };
  };

  const colors = getColor(similarity);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  // 相似度百分比
  const percentage = Math.round(similarity * 100);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses[size]}`}
    >
      {/* 相似度指示条 */}
      <div className="relative w-8 h-1.5 bg-black/30 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
            similarity >= 0.8 ? 'bg-emerald-400' :
            similarity >= 0.6 ? 'bg-blue-400' :
            similarity >= 0.4 ? 'bg-yellow-400' : 'bg-red-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <span className="font-medium tabular-nums">{percentage}%</span>
      )}
    </div>
  );
};
