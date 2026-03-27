import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { memoryApi, Session } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Mock 数据
const mockSessions: Session[] = [
  {
    id: '1',
    title: '开学典礼讲话稿撰写',
    type: 'speech',
    createdAt: '2024-03-20T10:00:00Z',
    updatedAt: '2024-03-20T11:30:00Z',
    messageCount: 12,
    preview: '用户：帮我写一份开学典礼讲话稿，面向全校师生...',
  },
  {
    id: '2',
    title: '运动会活动通知',
    type: 'general',
    createdAt: '2024-03-18T14:00:00Z',
    updatedAt: '2024-03-18T14:20:00Z',
    messageCount: 5,
    preview: '用户：生成一份关于秋季运动会的活动通知...',
  },
  {
    id: '3',
    title: '年度工作总结',
    type: 'general',
    createdAt: '2024-03-15T09:00:00Z',
    updatedAt: '2024-03-15T10:45:00Z',
    messageCount: 18,
    preview: '用户：帮我写一份2023年度工作总结...',
  },
  {
    id: '4',
    title: '家长会发言稿',
    type: 'speech',
    createdAt: '2024-03-10T16:00:00Z',
    updatedAt: '2024-03-10T17:20:00Z',
    messageCount: 8,
    preview: '用户：需要一份期中家长会班主任发言稿...',
  },
  {
    id: '5',
    title: '教研活动方案',
    type: 'general',
    createdAt: '2024-03-05T11:00:00Z',
    updatedAt: '2024-03-05T11:45:00Z',
    messageCount: 6,
    preview: '用户：设计一个语文教研组活动方案...',
  },
];

export function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'speech' | 'general'>('all');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, filterType]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      // TODO: 后端API完成后切换为真实调用
      // const res = await memoryApi.getSessions();
      // setSessions(res.data);
      
      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setSessions(mockSessions);
    } catch (err) {
      console.error('加载会话失败:', err);
      setError('加载会话列表失败');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];
    
    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(s => s.type === filterType);
    }
    
    // 按搜索词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.preview.toLowerCase().includes(query)
      );
    }
    
    // 按日期倒序
    filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    setFilteredSessions(filtered);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'speech': return '讲话稿';
      case 'general': return '通用';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'speech': return 'bg-[#5765c7]';
      case 'general': return 'bg-[#6b7280]';
      default: return 'bg-[#6b7280]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">加载会话历史...</p>
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
              <h1 className="text-xl font-bold">💬 会话历史</h1>
            </div>
            <div className="text-sm text-gray-500">
              共 {sessions.length} 个会话
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 搜索和筛选 */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
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
              placeholder="搜索会话..."
              className="w-full bg-[#111] border border-[#333] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-[#5765c7]"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'speech', 'general'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  filterType === type
                    ? 'bg-[#5765c7] text-white'
                    : 'bg-[#111] border border-[#333] text-gray-400 hover:text-white'
                }`}
              >
                {type === 'all' ? '全部' : getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadSessions}
              className="mt-2 text-sm text-red-400 hover:text-red-300 underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 会话列表 */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-white mb-2">{searchQuery ? '未找到匹配的会话' : '暂无会话历史'}</h3>
            <p className="text-gray-500">
              {searchQuery ? '尝试调整搜索关键词' : '开始一个新对话，记录将显示在这里'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                className="mt-4 text-[#5765c7] hover:text-[#a0fcc9]"
              >
                清除筛选
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="bg-[#111] border border-[#333] rounded-xl p-6 hover:border-[#5765c7] cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(session.type)}`}>
                      {getTypeLabel(session.type)}
                    </span>
                    <h3 className="font-medium text-white group-hover:text-[#a0fcc9] transition-colors">
                      {session.title}
                    </h3>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(session.updatedAt)}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {session.preview}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {session.messageCount} 条消息
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    创建于 {new Date(session.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 会话详情弹窗 */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          />
          <div className="relative bg-[#111] border border-[#333] rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[#333]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getTypeColor(selectedSession.type)}`}>
                    {getTypeLabel(selectedSession.type)}
                  </span>
                  <h2 className="text-xl font-semibold">{selectedSession.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>创建时间: {new Date(selectedSession.createdAt).toLocaleString('zh-CN')}</span>
                  <span>更新时间: {new Date(selectedSession.updatedAt).toLocaleString('zh-CN')}</span>
                </div>
                
                <div className="bg-[#0a0a0a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">对话预览:</p>
                  <p className="text-white">{selectedSession.preview}</p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      navigate(`/chat?session=${selectedSession.id}`);
                    }}
                    className="flex-1 py-3 bg-[#5765c7] hover:bg-[#4654b6] rounded-lg text-white font-medium transition-colors"
                  >
                    继续对话
                  </button>
                  <button
                    onClick={() => {
                      // TODO: 导出功能
                      alert('导出功能开发中...');
                    }}
                    className="px-6 py-3 bg-[#222] hover:bg-[#333] rounded-lg text-gray-300 transition-colors"
                  >
                    导出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
