import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryApi, MemoryData } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Mock 数据（后端开发完成前使用）
const mockMemoryData: MemoryData = {
  profile: {
    writingStyle: '正式公文风格，注重逻辑清晰',
    tone: '专业、严谨、权威',
    formality: 0.85,
    verbosity: 0.6,
  },
  decisions: [
    {
      id: '1',
      timestamp: '2024-03-20T10:30:00Z',
      context: '开学典礼讲话稿',
      decision: '采用激励型开头，强调学校历史传承',
      outcome: '客户反馈：非常符合学校形象',
    },
    {
      id: '2',
      timestamp: '2024-03-18T14:20:00Z',
      context: '运动会通知',
      decision: '使用简洁明了的条目式结构',
      outcome: '客户反馈：清晰易读',
    },
  ],
  wxdContent: `# WXD 写作助手记忆档案

## 用户风格画像
- 偏好正式公文风格
- 注重逻辑性和条理性
- 喜欢使用数据支撑观点

## 历史决策记录
1. 激励型开头适合校庆类文档
2. 条目式结构适合通知类文档

## 常用语料标签
- 教育领域
- 政府公文
- 活动通知
`,
  lastUpdated: '2024-03-20T10:30:00Z',
};

export function MemoryPage() {
  const navigate = useNavigate();
  const [memory, setMemory] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'wxd'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    setLoading(true);
    try {
      // TODO: 后端API完成后切换为真实调用
      // const res = await memoryApi.getMemory();
      // setMemory(res.data);
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setMemory(mockMemoryData);
    } catch (err) {
      console.error('加载记忆失败:', err);
      setError('加载记忆数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditWXD = () => {
    if (memory) {
      setEditContent(memory.wxdContent);
      setIsEditing(true);
    }
  };

  const handleSaveWXD = async () => {
    if (!memory) return;
    setSaving(true);
    try {
      // TODO: 后端API完成后切换为真实调用
      // await memoryApi.updateWXD(editContent);
      await new Promise(resolve => setTimeout(resolve, 300));
      setMemory({ ...memory, wxdContent: editContent, lastUpdated: new Date().toISOString() });
      setIsEditing(false);
    } catch (err) {
      console.error('保存失败:', err);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">加载记忆中...</p>
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error || '加载失败'}</p>
          <button
            onClick={loadMemory}
            className="mt-4 px-4 py-2 bg-[#5765c7] hover:bg-[#4654b6] rounded-lg text-white"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold">🧠 记忆管理</h1>
            </div>
            <div className="text-sm text-gray-500">
              最后更新: {formatDate(memory.lastUpdated)}
            </div>
          </div>
        </div>
      </header>

      {/* Tab 导航 */}
      <div className="border-b border-[#333]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#5765c7] text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              概览
            </button>
            <button
              onClick={() => setActiveTab('wxd')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'wxd'
                  ? 'border-[#5765c7] text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              WXD.md
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* 风格画像卡片 */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎨</span> 风格画像
              </h2>
              <div className="bg-[#111] border border-[#333] rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">写作风格</label>
                    <p className="text-white">{memory.profile.writingStyle}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">语气语调</label>
                    <p className="text-white">{memory.profile.tone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">正式程度</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#222] rounded-full h-2">
                        <div
                          className="bg-[#5765c7] h-2 rounded-full transition-all"
                          style={{ width: `${memory.profile.formality * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12">
                        {Math.round(memory.profile.formality * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-2">详略程度</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-[#222] rounded-full h-2">
                        <div
                          className="bg-[#a0fcc9] h-2 rounded-full transition-all"
                          style={{ width: `${memory.profile.verbosity * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12">
                        {Math.round(memory.profile.verbosity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 历史决策 */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📋</span> 历史决策
              </h2>
              <div className="space-y-4">
                {memory.decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="bg-[#111] border border-[#333] rounded-xl p-6 hover:border-[#444] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-[#222] rounded-full text-sm text-gray-300">
                        {decision.context}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(decision.timestamp)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-[#5765c7] font-medium">决策:</span>
                        <span className="text-gray-300">{decision.decision}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[#a0fcc9] font-medium">结果:</span>
                        <span className="text-gray-300">{decision.outcome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                此文件包含系统的核心记忆配置
              </p>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-gray-300 transition-colors disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveWXD}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-[#22c55e] hover:bg-[#16a34a] rounded-lg text-white transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <LoadingSpinner size="sm" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        保存
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleEditWXD}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5765c7] hover:bg-[#4654b6] rounded-lg text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑 WXD.md
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="bg-[#111] border border-[#5765c7] rounded-xl p-4">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-[60vh] bg-[#0a0a0a] border border-[#333] rounded-lg p-4 text-sm text-gray-300 font-mono leading-relaxed outline-none focus:border-[#5765c7] resize-none"
                  placeholder="在此编辑 WXD.md 内容..."
                />
              </div>
            ) : (
              <div className="bg-[#111] border border-[#333] rounded-xl p-6">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {memory.wxdContent}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
