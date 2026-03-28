import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { corpusManageApi, CorpusFile, vectorApi, IndexProgress } from '../lib/api';
import { IndexProgressBar } from '../components/vector';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Database, RefreshCw, Settings, Trash2, FileUp } from 'lucide-react';

type IndexStatus = 'idle' | 'indexing' | 'completed' | 'error';

export function CorpusManagePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<CorpusFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<CorpusFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [indexProgress, setIndexProgress] = useState<IndexProgress | null>(null);
  const [showIndexPanel, setShowIndexPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterIndexed, setFilterIndexed] = useState<'all' | 'indexed' | 'pending'>('all');
  const [dragOver, setDragOver] = useState(false);
  const [vectorStats, setVectorStats] = useState<{ documentCount: number; vectorCount: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
    loadVectorStats();
    // 定时检查索引状态
    const interval = setInterval(checkIndexStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterFiles();
  }, [files, searchQuery, filterIndexed]);

  // 模拟索引进度更新
  useEffect(() => {
    if (indexProgress?.status !== 'indexing') return;

    const interval = setInterval(() => {
      setIndexProgress(prev => {
        if (!prev || prev.status !== 'indexing') return prev;

        const newProgress = Math.min(prev.progress + 5, 100);
        const newProcessed = Math.floor((newProgress / 100) * prev.total);
        const newElapsed = prev.elapsedTime + 2;
        const newRemaining = Math.max(0, prev.estimatedTimeRemaining - 2);

        // 模拟日志更新
        const newLogs = [...prev.logs];
        if (newProgress % 20 === 0 && newProgress < 100) {
          newLogs.push(`正在处理文件 ${newProcessed}/${prev.total}...`);
        }
        if (newProgress >= 100) {
          newLogs.push('✓ 索引任务完成！');
          loadFiles();
        }

        return {
          ...prev,
          progress: newProgress,
          processed: newProcessed,
          elapsedTime: newElapsed,
          estimatedTimeRemaining: newRemaining,
          speed: newProcessed / (newElapsed || 1),
          logs: newLogs,
          status: newProgress >= 100 ? 'completed' : 'indexing',
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [indexProgress?.status]);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await corpusManageApi.getCorpusFiles();
      console.log('[Corpus] API response:', res.data);
      if (res.data.success) {
        // 防御性处理：兼容 files 和 items 两种格式，并规范化字段
        const rawList = res.data.data?.files || res.data.data?.items || res.data.data || [];
        const fileList = (Array.isArray(rawList) ? rawList : []).map((f: any) => ({
          ...f,
          id: f.id || f._id || String(Date.now() + Math.random()),
          name: f.name || f.title || f.filename || f.originalName || f.original_name || '未命名文件',
          size: Number(f.size || f.fileSize || f.file_size) || 0,
          indexed: f.indexed ?? f.is_indexed ?? false,
          category: f.category || f.type || '',
          uploadedAt: f.uploadedAt || f.uploaded_at || f.createdAt || f.created_at || new Date().toISOString(),
        }));
        setFiles(fileList);
      } else {
        setError(res.data.error || '加载失败');
        setFiles([]);
      }
    } catch (err: any) {
      console.error('加载文件失败:', err);
      setError(err.response?.data?.error || '加载文件失败，请检查网络连接');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVectorStats = async () => {
    try {
      // 简化版：基于当前文件计算
      setVectorStats({
        documentCount: files.filter(f => f.indexed).length,
        vectorCount: files.filter(f => f.indexed).length * 1000, // 估算
      });
    } catch (err) {
      console.error('加载向量统计失败:', err);
    }
  };

  const checkIndexStatus = async () => {
    try {
      // TODO: 后端API完成后切换为真实调用
      // const res = await corpusManageApi.getIndexStatus();
      // 更新索引状态
    } catch (err) {
      console.error('检查索引状态失败:', err);
    }
  };

  const filterFiles = () => {
    let filtered = [...files];

    // 按搜索词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f =>
        (f.name || '').toLowerCase().includes(query) ||
        (f.category || '').toLowerCase().includes(query)
      );
    }

    // 按索引状态筛选
    if (filterIndexed === 'indexed') {
      filtered = filtered.filter(f => f.indexed);
    } else if (filterIndexed === 'pending') {
      filtered = filtered.filter(f => !f.indexed);
    }

    // 按上传时间倒序
    filtered.sort((a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    setFilteredFiles(filtered);
  };

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(selectedFiles)) {
        console.log('上传文件:', file.name);
        const response = await corpusManageApi.uploadDocument(file);
        console.log('[Upload] Response:', response.data);
      }
      // 上传成功后延迟刷新，给后端处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadFiles();
      alert('文件上传成功！');
    } catch (err: any) {
      console.error('上传失败:', err);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || '上传文件失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (id: string, name: string) => {
    if (!confirm(`确定要删除文件 "${name}" 吗？\n此操作不可撤销。`)) return;

    try {
      await corpusManageApi.deleteDocument(id);
      await loadFiles();
      alert('文件删除成功！');
    } catch (err: any) {
      console.error('删除失败:', err);
      setError(err.response?.data?.error || '删除文件失败');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const triggerIndex = async () => {
    if (indexProgress?.status === 'indexing') return;

    setShowIndexPanel(true);

    try {
      const res = await corpusManageApi.triggerIndex();
      if (res.data.success) {
        const { total, indexed } = res.data.data;
        setIndexProgress({
          status: 'indexing',
          progress: 0,
          processed: 0,
          total: total || 1,
          speed: 0,
          elapsedTime: 0,
          estimatedTimeRemaining: total * 30,
          currentFile: '准备索引...',
          logs: ['开始索引任务...', `发现 ${total} 个文件待索引`],
          errors: []
        });
        // 延迟刷新列表
        setTimeout(() => loadFiles(), 2000);
      } else {
        setError(res.data.error || '触发索引失败');
      }
    } catch (err: any) {
      console.error('触发索引失败:', err);
      setError(err.response?.data?.error || '触发索引失败');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getIndexStatusBadge = (indexed: boolean) => {
    if (indexed) {
      return (
        <span className="flex items-center gap-1 text-xs text-[#a0fcc9]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          已索引
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs text-yellow-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        待索引
      </span>
    );
  };

  const getFileIcon = (filename: string) => {
    if (!filename) return '📎';
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'docx':
      case 'doc': return '📝';
      case 'txt': return '📃';
      case 'md': return '📑';
      default: return '📎';
    }
  };

  const stats = {
    total: files.length,
    indexed: files.filter(f => f.indexed).length,
    pending: files.filter(f => !f.indexed).length,
    totalSize: files.reduce((acc, f) => acc + (Number(f.size) || 0), 0),
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航 */}
      <header className="border-b border-[#333] bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/chat')}
                className="text-gray-400 hover:text-white flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回
              </button>
              <h1 className="text-xl font-bold">📚 语料库管理</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* 向量统计 */}
              {vectorStats && (
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Database className="w-4 h-4" />
                    <span>向量: <span className="text-white">{vectorStats.vectorCount.toLocaleString()}</span></span>
                  </div>
                </div>
              )}

              {/* 索引状态 */}
              <div className="flex items-center gap-3 bg-[#111] border border-[#333] rounded-lg px-4 py-2">
                <IndexProgressBar
                  progress={indexProgress || undefined}
                  compact
                />
                <button
                  onClick={() => setShowIndexPanel(!showIndexPanel)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                  title="展开详情"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={triggerIndex}
                  disabled={indexProgress?.status === 'indexing' || stats.pending === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5765c7] hover:bg-[#4654b6] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${indexProgress?.status === 'indexing' ? 'animate-spin' : ''}`} />
                  {indexProgress?.status === 'indexing' ? '索引中...' : '重新索引'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] border border-[#333] rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">总文件数</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-[#111] border border-[#333] rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">已索引</p>
            <p className="text-2xl font-bold text-[#a0fcc9]">{stats.indexed}</p>
          </div>
          <div className="bg-[#111] border border-[#333] rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">待索引</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
          </div>
          <div className="bg-[#111] border border-[#333] rounded-xl p-4">
            <p className="text-sm text-gray-500 mb-1">总大小</p>
            <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
          </div>
        </div>

        {/* 索引进度面板 */}
        {showIndexPanel && indexProgress && (
          <div className="mb-8">
            <IndexProgressBar progress={indexProgress} />
          </div>
        )}

        {/* 上传区域 */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? 'border-[#5765c7] bg-[#5765c7]/10'
              : 'border-[#333] hover:border-[#444] bg-[#111]'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <LoadingSpinner size="md" />
              <p className="mt-3 text-gray-400">正在上传文件...</p>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-3">{dragOver ? '📤' : '📁'}</div>
              <p className="text-white font-medium mb-1">
                {dragOver ? '松开以上传文件' : '拖拽文件到此处，或点击选择'}
              </p>
              <p className="text-sm text-gray-500">
                支持 PDF、DOCX、TXT、MD 格式，单个文件不超过 50MB
              </p>
            </>
          )}
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文件..."
              className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#5765c7]"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'indexed', 'pending'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterIndexed(type)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  filterIndexed === type
                    ? 'bg-[#5765c7] text-white'
                    : 'bg-[#111] border border-[#333] text-gray-400 hover:text-white'
                }`}
              >
                {type === 'all' ? '全部' : type === 'indexed' ? '已索引' : '待索引'}
              </button>
            ))}
          </div>
        </div>

        {/* 文件列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchQuery || filterIndexed !== 'all' ? '未找到匹配的文件' : '暂无文件'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterIndexed !== 'all'
                ? '尝试调整筛选条件'
                : '拖拽或点击上方区域上传文件'}
            </p>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#333] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a] border-b border-[#333]">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">文件名</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">分类</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">大小</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">上传时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getFileIcon(file.name)}</span>
                          <span className="text-white">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-[#222] rounded text-sm text-gray-300">
                          {file.category || '未分类'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{formatFileSize(file.size)}</td>
                      <td className="py-3 px-4">{getIndexStatusBadge(file.indexed)}</td>
                      <td className="py-3 px-4 text-gray-400">{formatDate(file.uploadedAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          disabled={uploading}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="删除文件"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
