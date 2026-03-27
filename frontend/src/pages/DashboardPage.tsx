import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, documentApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface Document {
  id: string;
  title: string;
  preview: string;
  content?: string;
  wordCount?: number;
  createdAt: string;
}

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  useEffect(() => {
    loadDocuments();
  }, []);
  
  const loadDocuments = async () => {
    try {
      const res = await api.get('/documents');
      if (res.data.success) {
        setDocs(res.data.data);
      }
    } catch (err) {
      console.error('加载文档失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content || '');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板！');
  };

  const handleDownload = (doc: Document) => {
    const blob = new Blob([doc.content || doc.preview], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title || '文档'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这篇文档吗？')) return;
    
    try {
      await documentApi.delete(id);
      setDocs(docs.filter(d => d.id !== id));
      alert('删除成功！');
    } catch (err: any) {
      alert('删除失败：' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDoc) return;
    
    try {
      const res = await documentApi.update(selectedDoc.id, editTitle, editContent);
      if (res.data.success) {
        setSelectedDoc({ ...selectedDoc, title: editTitle, content: editContent });
        setDocs(docs.map(d => d.id === selectedDoc.id ? { ...d, title: editTitle } : d));
        setIsEditing(false);
        alert('保存成功！');
      }
    } catch (err: any) {
      alert('保存失败：' + (err.response?.data?.error || err.message));
    }
  };

  const closeModal = () => {
    setSelectedDoc(null);
    setIsEditing(false);
  };

  // 阅读模式视图
  if (selectedDoc) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* 顶部工具栏 */}
        <header className="sticky top-0 z-50 border-b border-[#222] px-4 md:px-6 py-4 flex justify-between items-center bg-[#111]">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-white flex items-center gap-1 md:gap-2 text-sm md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
          </div>
          <h1 className="text-sm md:text-lg font-medium truncate max-w-[120px] md:max-w-md px-2" title={selectedDoc.title}>
            {selectedDoc.title}
          </h1>
          
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-[#444] hover:bg-[#555] text-white px-3 py-1.5 rounded text-xs"
                >
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(selectedDoc.id, {} as React.MouseEvent)}
                  className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded text-xs"
                >
                  删除
                </button>
              </>
            )}
            <button
              onClick={() => handleCopy(selectedDoc.content || selectedDoc.preview)}
              className="bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-xs"
            >
              复制
            </button>
            <button
              onClick={() => handleDownload(selectedDoc)}
              className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-3 py-1.5 rounded text-xs"
            >
              下载
            </button>
          </div>
        </header>

        {/* 文档内容 - 直接滚动 */}
        <main className="max-w-[900px] mx-auto px-4 md:px-8 py-4 md:py-6 pb-16">
          {/* 标题 */}
          <div className="text-center mb-4 md:mb-6">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white text-center text-lg md:text-2xl font-bold outline-none focus:border-[#5765c7]"
              />
            ) : (
              <>
                <h2 className="text-lg md:text-2xl font-bold mb-2 break-words leading-tight">
                  {selectedDoc.title}
                </h2>
                <p className="text-gray-500 text-xs">
                  {new Date(selectedDoc.createdAt).toLocaleString('zh-CN')}
                </p>
              </>
            )}
          </div>

          {/* 内容 - 编辑或显示 */}
          <div className="bg-[#111] rounded-xl p-4 md:p-8 overflow-x-auto">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full min-h-[50vh] bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white text-sm md:text-base outline-none focus:border-[#5765c7] resize-y"
                style={{ fontFamily: '"Noto Serif SC", "PingFang SC", serif' }}
              />
            ) : (
              <pre 
                className="whitespace-pre-wrap text-gray-100 text-sm md:text-base leading-relaxed break-words"
                style={{ 
                  fontFamily: '"Noto Serif SC", "PingFang SC", serif',
                  overflowX: 'auto',
                  maxWidth: '100%'
                }}
              >
                {selectedDoc.content || selectedDoc.preview}
              </pre>
            )}
          </div>

          {/* 编辑模式保存按钮 */}
          {isEditing && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-[#333] hover:bg-[#444] text-white px-6 py-2 rounded text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm"
              >
                保存
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // 列表视图
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航 */}
      <header className="border-b border-[#333] px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">WXD 写作助手</h1>
          <span className="text-gray-400 text-sm hidden md:inline">{user?.email}</span>
        </div>
        <button
          onClick={onLogout}
          className="text-gray-400 hover:text-white text-sm"
        >
          退出
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <button
            onClick={() => navigate('/write')}
            className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-medium text-base md:text-lg transition-colors"
          >
            + 开始写作
          </button>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">我的文档 ({docs.length})</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : docs.length === 0 ? (
            <div className="bg-[#111] border border-[#333] rounded-lg p-8 text-center">
              <p className="text-gray-400">还没有文档，点击上方按钮开始写作</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#111] border border-[#333] rounded-lg p-4 hover:border-[#5765c7] cursor-pointer transition-colors group"
                  onClick={() => handleViewDoc(doc)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium mb-2 truncate flex-1">{doc.title}</h3>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-opacity"
                    >
                      删除
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{doc.preview}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">{new Date(doc.createdAt).toLocaleString()}</span>
                    <span className="text-gray-500 text-xs">{doc.wordCount?.toLocaleString() || 0} 字</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
