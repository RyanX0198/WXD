import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatApi, authApi, vectorApi, VectorSearchResult, VectorSearchOptions } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { VectorSearchPanel } from '../components/vector';
import { Search, BookOpen } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  references?: string[];
}

interface Conversation {
  id: string;
  title: string;
  type: 'general' | 'speech';
  createdAt: string;
  updatedAt: string;
}

export function ChatPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string>('');
  const [currentConvType, setCurrentConvType] = useState<'general' | 'speech'>('speech');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  // 向量搜索相关状态
  const [showVectorPanel, setShowVectorPanel] = useState(false);
  const [vectorSearchLoading, setVectorSearchLoading] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // 游客模式，使用本地存储
      const guestConv = localStorage.getItem('wxd_guest_conversation');
      if (guestConv) {
        const { id, messages: savedMessages } = JSON.parse(guestConv);
        setCurrentConvId(id);
        setMessages(savedMessages || []);
      }
    } else {
      // 获取用户信息
      authApi.getMe().then(res => {
        if (res.data.success) {
          setUser(res.data.data.user);
          // 【方案A】登录状态，清除游客对话ID
          const guestConv = localStorage.getItem('wxd_guest_conversation');
          if (guestConv) {
            const { id } = JSON.parse(guestConv);
            if (currentConvId === id) {
              setCurrentConvId('');
              setMessages([]);
            }
          }
          loadConversations(res.data.data.user.userId);
        }
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  // 加载对话列表
  const loadConversations = async (userId: string) => {
    try {
      const res = await chatApi.getConversations(userId);
      if (res.data.success) {
        setConversations(res.data.data);
        // 如果有对话，加载第一个
        if (res.data.data.length > 0 && !currentConvId) {
          loadConversation(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('加载对话列表失败:', err);
    }
  };

  // 加载单个对话
  const loadConversation = async (convId: string) => {
    try {
      setLoadingConv(true);
      setCurrentConvId(convId);
      
      const res = await chatApi.getConversation(convId);
      if (res.data.success) {
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error('加载对话失败:', err);
      setMessages([]);
    } finally {
      setLoadingConv(false);
    }
  };

  // 创建新对话（仅本地切换，不立即创建后端记录）
  const createConversation = (type: 'general' | 'speech' = 'general') => {
    // 只切换类型和清空界面，不创建后端记录
    // 后端记录会在发送第一条消息时自动创建
    setCurrentConvType(type);
    setCurrentConvId(''); // 清空ID，表示还没有后端记录
    setMessages([]);
  };

  // 发送消息 - 使用非流式API（更稳定，兼容Render）
  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage: Message = {
      id: 'temp_' + Date.now(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString()
    };

    // 如果没有当前对话，先创建一个
    let convId: string | null = currentConvId;
    
    // 如果没有对话ID，需要先创建后端对话
    if (!convId) {
      if (user) {
        // 已登录：创建后端对话
        try {
          const res = await chatApi.createConversation(
            user.userId, 
            currentConvType === 'speech' ? '讲话稿对话' : '新对话', 
            currentConvType
          );
          if (res.data.success) {
            convId = res.data.data.id;
            setCurrentConvId(convId || '');
            setConversations(prev => [res.data.data, ...prev]);
          }
        } catch (err) {
          console.error('创建对话失败:', err);
        }
      } else {
        // 游客模式：提示需要登录
        setMessages(prev => [...prev, { ...userMessage, content: '请先登录后再使用AI对话功能' }]);
        setStreaming(false);
        return;
      }
    }

    if (!convId) {
      setMessages(prev => [...prev, { ...userMessage, content: '创建对话失败，请重试' }]);
      return;
    }

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreaming(true);

    // 创建AI消息占位
    const aiMessageId = 'ai_' + Date.now();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'assistant', content: '' }]);

    try {
      // 统一使用非流式API（更稳定，兼容Render免费版）
      const res = await chatApi.sendMessage(convId, userMessage.content, user?.userId);
      if (res.data.success) {
        // 模拟打字机效果
        const fullContent = res.data.data.content;
        let currentContent = '';
        
        for (let i = 0; i < fullContent.length; i++) {
          currentContent += fullContent[i];
          setMessages(prev => prev.map(m => 
            m.id === aiMessageId 
              ? { ...m, content: currentContent }
              : m
          ));
          // 延迟5ms模拟打字效果
          await new Promise(resolve => setTimeout(resolve, 5));
        }
        // 打字机效果完成后，解除输入框禁用
        setStreaming(false);
      } else {
        throw new Error(res.data.error || '发送失败');
      }
    } catch (err: any) {
      console.error('发送消息失败:', err);
      const errorMsg = err.response?.data?.error || err.message || '未知错误';
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId 
          ? { ...m, content: `抱歉，消息发送失败: ${errorMsg}` }
          : m
      ));
      setStreaming(false);
      // 更新游客模式的本地存储
      if (!user && currentConvId) {
        const guestConv = {
          id: currentConvId,
          title: '对话',
          messages: [...messages, userMessage, { id: aiMessageId, role: 'assistant', content: messages.find(m => m.id === aiMessageId)?.content || '' }],
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('wxd_guest_conversation', JSON.stringify(guestConv));
      }
    }
  };

  // 删除对话
  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除此对话？')) return;

    if (!user) {
      // 游客模式
      localStorage.removeItem('wxd_guest_conversation');
      setCurrentConvId('');
      setMessages([]);
      return;
    }

    try {
      await chatApi.deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (currentConvId === convId) {
        setCurrentConvId('');
        setMessages([]);
      }
    } catch (err) {
      console.error('删除对话失败:', err);
    }
  };

  // 自动滚动到底部 - 只在消息数量变化时触发（避免打字机效果导致抖动）
  useEffect(() => {
    const currentCount = messages.length;
    // 只在消息数量增加时滚动（新消息时），内容更新时不滚动
    if (currentCount > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = currentCount;
  }, [messages.length]);  // 只监听消息数量，不监听内容变化

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 向量搜索处理
  const handleVectorSearch = async (query: string, options: VectorSearchOptions): Promise<VectorSearchResult[]> => {
    setVectorSearchLoading(true);
    try {
      // TODO: 后端API完成后切换为真实调用
      // const res = await vectorApi.search(query, options);
      // return res.data;

      // Mock 数据
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockResults: VectorSearchResult[] = [
        {
          id: '1',
          documentId: 'doc1',
          documentName: '公文写作规范.pdf',
          content: '公文写作应当遵循准确、简明、得体的原则。标题要准确概括公文的主要内容，一般应当标明发文机关和公文种类。',
          similarity: 0.92,
          metadata: { page: 5, chunkIndex: 2, totalChunks: 10 },
        },
        {
          id: '2',
          documentId: 'doc2',
          documentName: '讲话稿范例合集.docx',
          content: '在撰写讲话稿时，首先要明确听众对象和讲话场合。开头应当简明扼要，开门见山；主体部分层次分明，逻辑清晰。',
          similarity: 0.87,
          metadata: { page: 12, chunkIndex: 5, totalChunks: 15 },
        },
        {
          id: '3',
          documentId: 'doc3',
          documentName: '通知模板库.txt',
          content: '通知的正文一般由缘由、事项和执行要求三部分组成。缘由部分简要说明发文的依据和目的。',
          similarity: 0.78,
          metadata: { chunkIndex: 0, totalChunks: 3 },
        },
      ];

      const minSim = options.filter?.minSimilarity || 0.6;
      const topK = options.topK || 5;
      return mockResults
        .filter(r => r.similarity >= minSim)
        .slice(0, topK);
    } finally {
      setVectorSearchLoading(false);
    }
  };

  // 引用文档片段到输入框
  const handleQuoteDocument = (content: string) => {
    const quoteText = `\n\n[引用文档片段]\n${content}\n[/引用]`;
    setInput(prev => prev + quoteText);
    setShowVectorPanel(false);
  };

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden">
      {/* 左侧对话列表 */}
      <aside className={`${showVectorPanel ? 'w-56' : 'w-64'} border-r border-[#333] flex flex-col h-full transition-all duration-300`}>
        {/* 顶部 */}
        <div className="p-4 border-b border-[#333]">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            ← WXD 写作助手
          </button>
        </div>

        {/* 新建对话按钮 */}
        <div className="p-4">
          <button
            onClick={() => createConversation('speech')}
            className="w-full bg-[#5765c7] hover:bg-[#4654b6] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <span>+</span>
            新建对话
          </button>
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => createConversation('general')}
              className="flex-1 py-2 bg-[#222] hover:bg-[#333] rounded text-sm text-gray-300"
            >
              通用
            </button>
            <button
              onClick={() => createConversation('speech')}
              className="flex-1 py-2 bg-[#222] hover:bg-[#333] rounded text-sm text-gray-300"
            >
              讲话稿
            </button>
          </div>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto px-4">
          {conversations.length === 0 && !currentConvId ? (
            <div className="text-gray-500 text-sm text-center py-8">
              暂无对话<br/>点击上方新建
            </div>
          ) : (
            <>
              {/* 当前对话（游客模式） */}
              {!user && currentConvId && (
                <div
                  className={`p-3 rounded-lg mb-2 cursor-pointer group relative ${
                    'bg-[#333]'
                  }`}
                >
                  <div className="text-sm truncate pr-6">对话</div>
                  <div className="text-xs text-gray-500 mt-1">讲话稿</div>
                  <button
                    onClick={(e) => deleteConversation(currentConvId, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* 登录用户的对话列表 */}
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`p-3 rounded-lg mb-2 cursor-pointer group relative ${
                    currentConvId === conv.id ? 'bg-[#333]' : 'hover:bg-[#222]'
                  }`}
                >
                  <div className="text-sm truncate pr-6">{conv.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {conv.type === 'speech' ? '讲话稿' : '通用'}
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 记忆管理入口 */}
        <div className="px-4 py-3 border-t border-[#333]">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">记忆管理</p>
          <div className="space-y-1">
            <button
              onClick={() => navigate('/memory')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-left"
            >
              <span>🧠</span> 记忆概览
            </button>
            <button
              onClick={() => navigate('/sessions')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-left"
            >
              <span>💬</span> 会话历史
            </button>
            <button
              onClick={() => navigate('/corpus-manage')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-left"
            >
              <span>📚</span> 语料库
            </button>
            <button
              onClick={() => navigate('/vector-test')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#222] hover:text-white transition-colors text-left"
            >
              <span>🔍</span> 向量检索测试
            </button>
          </div>
        </div>

        {/* 底部用户信息 */}
        <div className="p-4 border-t border-[#333]">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#5765c7] rounded-full flex items-center justify-center text-sm">
                {user.name?.[0] || user.email[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{user.name || user.email}</div>
                <div className="text-xs text-gray-500">已登录</div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setUser(null);
                  setConversations([]);
                  setCurrentConvId('');
                  setMessages([]);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-[#222] hover:bg-[#333] rounded text-sm text-gray-300"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </aside>

      {/* 中间聊天区域 */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingConv ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <LoadingSpinner size="lg" />
              <div className="mt-4 text-sm">加载对话中...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <div className="text-4xl mb-4">🎤</div>
              <div className="text-lg mb-2">开始你的写作对话</div>
              <div className="text-sm text-gray-600 max-w-md text-center">
                告诉我你想写什么类型的文档，比如：<br/>
                "帮我写一份开学典礼讲话稿，面向全校师生"<br/>
                "生成一份关于运动会的活动通知"
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setInput('帮我写一份开学典礼讲话稿，面向全校师生，主题是新学期新气象');
                  }}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm text-gray-300"
                >
                  💡 开学典礼讲话稿
                </button>
                <button
                  onClick={() => {
                    setInput('生成一份关于秋季运动会的活动通知');
                  }}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm text-gray-300"
                >
                  📢 运动会通知
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-[#5765c7] text-white'
                        : 'bg-[#222] text-white border border-[#333]'
                    }`}
                  >
                    {msg.role === 'assistant' && !msg.content && streaming ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm">AI正在思考...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="px-4 pt-2 pb-1 border-t border-[#333]">
          <div className="max-w-3xl mx-auto">
            {/* 工具栏 */}
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => setShowVectorPanel(!showVectorPanel)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  showVectorPanel
                    ? 'bg-[#5765c7] text-white'
                    : 'bg-[#222] text-gray-400 hover:text-white hover:bg-[#333]'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                相关文档
              </button>
              <button
                onClick={() => navigate('/corpus-manage')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-[#222] text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                语料库
              </button>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入你的写作需求，按回车发送..."
                rows={1}
                disabled={streaming}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2 pr-10 text-sm text-white outline-none focus:border-[#5765c7] resize-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || streaming}
                className="absolute right-2 bottom-2 w-7 h-7 bg-[#5765c7] hover:bg-[#4654b6] disabled:opacity-50 disabled:cursor-not-allowed rounded flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-[11px] text-gray-600 mt-0.5 mb-0 text-center leading-tight">
              {user ? '已登录，对话将自动保存到云端' : '游客模式，对话仅保存在本地'}
            </div>
          </div>
        </div>
      </main>

      {/* 右侧向量搜索面板 */}
      {showVectorPanel && (
        <aside className="w-96 border-l border-[#333] bg-[#0a0a0a] flex flex-col h-full animate-in slide-in-from-right duration-300">
          <VectorSearchPanel
            onSearch={handleVectorSearch}
            onQuote={handleQuoteDocument}
            placeholder="搜索相关文档..."
          />
        </aside>
      )}
    </div>
  );
}
