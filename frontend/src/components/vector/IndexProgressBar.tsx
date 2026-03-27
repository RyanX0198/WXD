import React, { useEffect, useState, useRef } from 'react';
import { IndexProgress } from '../../lib/api';
import { Loader2, CheckCircle2, XCircle, FileText, Clock, Zap } from 'lucide-react';

interface IndexProgressBarProps {
  progress?: IndexProgress;
  compact?: boolean;
  onLogsUpdate?: (logs: string[]) => void;
}

export const IndexProgressBar: React.FC<IndexProgressBarProps> = ({
  progress,
  compact = false,
  onLogsUpdate,
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [showLogs, setShowLogs] = useState(false);

  // 自动滚动到日志底部
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progress?.logs, showLogs]);

  // 通知父组件日志更新
  useEffect(() => {
    if (progress?.logs && onLogsUpdate) {
      onLogsUpdate(progress.logs);
    }
  }, [progress?.logs, onLogsUpdate]);

  if (!progress) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} text-gray-500`}>
        <span>等待索引...</span>
      </div>
    );
  }

  const { status, progress: percent, processed, total, speed, elapsedTime, estimatedTimeRemaining, currentFile, logs, errors } = progress;

  const getStatusIcon = () => {
    switch (status) {
      case 'indexing':
        return <Loader2 className="w-4 h-4 animate-spin text-[#5765c7]" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'indexing':
        return '索引中...';
      case 'completed':
        return '已完成';
      case 'error':
        return '出错';
      default:
        return '待执行';
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${Math.round(seconds % 60)}秒`;
    return `${Math.floor(seconds / 3600)}时${Math.floor((seconds % 3600) / 60)}分`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={status === 'error' ? 'text-red-400' : 'text-gray-400'}>
              {getStatusText()}
            </span>
            <span className="text-gray-500">{Math.round(percent)}%</span>
          </div>
          <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                status === 'error' ? 'bg-red-500' :
                status === 'completed' ? 'bg-emerald-500' : 'bg-[#5765c7]'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
      {/* 主进度区 */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <span className={`font-medium ${
              status === 'error' ? 'text-red-400' :
              status === 'completed' ? 'text-emerald-400' : 'text-white'
            }`}>
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{processed} / {total} 文件</span>
            <span className="text-white font-medium">{Math.round(percent)}%</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="h-3 bg-[#222] rounded-full overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-300 relative ${
              status === 'error' ? 'bg-red-500' :
              status === 'completed' ? 'bg-emerald-500' : 'bg-[#5765c7]'
            }`}
            style={{ width: `${percent}%` }}
          >
            {status === 'indexing' && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Zap className="w-4 h-4" />
            <span>速度: <span className="text-white">{speed.toFixed(1)} 文件/秒</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>已用: <span className="text-white">{formatTime(elapsedTime)}</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>预计剩余: <span className="text-white">{formatTime(estimatedTimeRemaining)}</span></span>
          </div>
        </div>

        {/* 当前文件 */}
        {currentFile && status === 'indexing' && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
            <FileText className="w-4 h-4 text-[#5765c7]" />
            <span className="truncate">正在处理: {currentFile}</span>
          </div>
        )}
      </div>

      {/* 日志开关 */}
      {logs.length > 0 && (
        <div className="border-t border-[#222]">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors"
          >
            <span>实时日志 ({logs.length} 条)</span>
            <span className="text-xs">{showLogs ? '收起' : '展开'}</span>
          </button>

          {/* 日志内容 */}
          {showLogs && (
            <div className="px-4 py-3 bg-[#0a0a0a] max-h-48 overflow-y-auto font-mono text-xs">
              {logs.map((log, index) => (
                <div key={index} className="text-gray-400 py-0.5 border-b border-[#1a1a1a] last:border-0">
                  <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>{' '}
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}

      {/* 错误列表 */}
      {errors.length > 0 && (
        <div className="border-t border-[#222] p-4 bg-red-500/5">
          <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            错误文件 ({errors.length} 个)
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {errors.map((err, index) => (
              <div key={index} className="text-xs">
                <span className="text-gray-400">{err.file}:</span>{' '}
                <span className="text-red-400">{err.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
