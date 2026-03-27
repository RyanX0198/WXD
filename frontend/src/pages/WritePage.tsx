import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const DOCUMENT_TYPES = [
  { value: '讲话稿', label: '讲话稿', desc: '开学典礼、工作总结讲话等' },
  { value: '活动通知', label: '活动通知', desc: '运动会、会议、培训通知等' },
  { value: '工作总结', label: '工作总结', desc: '年度总结、季度汇报等' },
  { value: '请示', label: '请示', desc: '向上级请示事项、请求批准' },
  { value: '报告', label: '报告', desc: '汇报工作、反映情况、答复询问' },
  { value: '批复', label: '批复', desc: '答复下级机关请示事项' },
  { value: '函', label: '函', desc: '不相隶属机关间商洽工作' },
  { value: '纪要', label: '纪要', desc: '记录会议主要精神和议定事项' },
];

export function WritePage() {
  const navigate = useNavigate();
  const [type, setType] = useState('讲话稿');
  const [topic, setTopic] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [content, setContent] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // 生成参数
  const [wordCount, setWordCount] = useState(1500);
  const [formality, setFormality] = useState(3);
  const [urgency, setUrgency] = useState(1);
  
  // 编辑模式
  const [isPreview, setIsPreview] = useState(false);
  
  // 自动保存提示
  const [saveStatus, setSaveStatus] = useState('');
  
  // 恢复草稿
  useEffect(() => {
    const draft = localStorage.getItem('wxd_draft');
    if (draft) {
      const { type: dType, topic: dTopic, from: dFrom, to: dTo, content: dContent } = JSON.parse(draft);
      if (!content && (dTopic || dContent)) {
        if (confirm('检测到未保存的草稿，是否恢复？')) {
          setType(dType || '讲话稿');
          setTopic(dTopic || '');
          setFrom(dFrom || '');
          setTo(dTo || '');
          setContent(dContent || '');
        }
      }
    }
  }, []);
  
  // 自动保存
  useEffect(() => {
    const timer = setInterval(() => {
      if (topic || content) {
        localStorage.setItem('wxd_draft', JSON.stringify({ type, topic, from, to, content }));
        setSaveStatus('已保存');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [type, topic, from, to, content]);

  // 游客模式直接生成
  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('请输入主题');
      return;
    }
    if (!from.trim() || !to.trim()) {
      alert('请输入发文单位和受众对象');
      return;
    }
    setGenerating(true);
    try {
      // 游客模式不需要token
      const res = await api.post('/generate', { 
        type, 
        topic, 
        from, 
        to,
        wordCount,
        formality,
        urgency
      });
      if (res.data.success) {
        setContent(res.data.data.content);
      } else {
        alert('生成失败：' + res.data.error);
      }
    } catch (err: any) {
      alert('生成失败：' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  // 插入Markdown
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
    
    setContent(newText);
    
    // 恢复焦点
    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  };

  // 简单Markdown渲染
  const renderMarkdown = (text: string): string => {
    return text
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-4">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  // 复制内容
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板！');
  };

  // 下载文档
  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic || '文档'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 保存（需要登录）
  const handleSave = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    // 已登录，直接保存
    saveDocument();
  };

  const saveDocument = async () => {
    try {
      const res = await api.post('/documents', { title: topic, content });
      if (res.data.success) {
        alert('保存成功！');
        navigate('/dashboard');
      }
    } catch (err: any) {
      alert('保存失败：' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航 */}
      <header className="border-b border-[#333] px-6 py-4 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white"
        >
          ← 返回首页
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-400 hover:text-white text-sm"
          >
            我的文档
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-4 py-2 rounded text-sm"
          >
            登录/注册
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* 文种选择 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">选择文种</label>
          <div className="flex gap-3">
            {DOCUMENT_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`px-4 py-3 rounded-lg border text-left flex-1 ${
                  type === t.value
                    ? 'border-[#5765c7] bg-[#5765c7]/10'
                    : 'border-[#333] hover:border-[#444]'
                }`}
              >
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-gray-400 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 主题输入 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">主题 *</label>
          <input
            type="text"
            placeholder="输入公文主题，如：全市教育工作会议上的讲话"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20 transition-colors duration-200"
          />
        </div>

        {/* 发文单位 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">发文单位/讲话人身份 *</label>
          <input
            type="text"
            placeholder="如：市教育局党委书记、局长"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20 transition-colors duration-200"
          />
        </div>

        {/* 受众对象 */}
        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">受众对象 *</label>
          <input
            type="text"
            placeholder="如：全市教育系统干部"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20 transition-colors duration-200"
          />
        </div>

        {/* 生成参数 */}
        <div className="mb-6 bg-[#111] border border-[#333] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-gray-400 text-sm">生成参数</label>
            {saveStatus && (
              <span className="text-green-400 text-xs">{saveStatus}</span>
            )}
          </div>
          
          {/* 字数 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">字数</span>
              <span className="text-white">{wordCount} 字</span>
            </div>
            <input
              type="range"
              min={800}
              max={3000}
              step={100}
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#5765c7]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>800</span>
              <span>3000</span>
            </div>
          </div>
          
          {/* 风格程度 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">风格</span>
              <span className="text-white">
                {formality === 1 ? '通俗易懂' : formality === 5 ? '严谨正式' : '适中'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={formality}
              onChange={(e) => setFormality(Number(e.target.value))}
              className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#5765c7]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>通俗</span>
              <span>正式</span>
            </div>
          </div>
          
          {/* 紧迫程度 */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">紧迫程度</span>
              <span className="text-white">
                {urgency === 1 ? '常规' : urgency === 2 ? '较急' : '紧急'}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={1}
              value={urgency}
              onChange={(e) => setUrgency(Number(e.target.value))}
              className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#5765c7]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>常规</span>
              <span>紧急</span>
            </div>
          </div>
        </div>

        {/* 生成按钮 */}
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-[#5765c7] hover:bg-[#4654b6] text-white py-4 rounded-lg font-medium text-lg disabled:opacity-50 transition-colors duration-200"
          >
            {generating ? 'AI生成中...' : '🤖 立即生成'}
          </button>
          <p className="text-gray-500 text-sm text-center mt-2">
            无需注册，免费体验
          </p>
        </div>

        {/* 内容编辑 */}
        {content && (
          <div className="mb-6">
            {/* 工具栏 */}
            <div className="flex flex-wrap items-center gap-2 mb-3 bg-[#111] border border-[#333] rounded-lg p-2">
              <button
                onClick={() => insertMarkdown('# ')}
                className="px-3 py-1.5 text-sm bg-[#222] hover:bg-[#333] rounded text-gray-300"
                title="一级标题"
              >
                H1
              </button>
              <button
                onClick={() => insertMarkdown('## ')}
                className="px-3 py-1.5 text-sm bg-[#222] hover:bg-[#333] rounded text-gray-300"
                title="二级标题"
              >
                H2
              </button>
              <button
                onClick={() => insertMarkdown('**', '**')}
                className="px-3 py-1.5 text-sm bg-[#222] hover:bg-[#333] rounded text-gray-300 font-bold"
                title="加粗"
              >
                B
              </button>
              <button
                onClick={() => insertMarkdown('- ')}
                className="px-3 py-1.5 text-sm bg-[#222] hover:bg-[#333] rounded text-gray-300"
                title="列表"
              >
                列表
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setIsPreview(!isPreview)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  isPreview 
                    ? 'bg-[#5765c7] text-white' 
                    : 'bg-[#222] hover:bg-[#333] text-gray-300'
                }`}
              >
                {isPreview ? '编辑' : '预览'}
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <label className="text-gray-400 text-sm">生成内容</label>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="text-sm bg-[#333] hover:bg-[#444] text-white px-3 py-1 rounded-lg transition-colors duration-200"
                >
                  复制
                </button>
                <button
                  onClick={handleDownload}
                  className="text-sm bg-[#333] hover:bg-[#444] text-white px-3 py-1 rounded-lg transition-colors duration-200"
                >
                  下载
                </button>
                <button
                  onClick={handleSave}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors duration-200"
                >
                  保存到云端
                </button>
              </div>
            </div>
            
            {isPreview ? (
              <div 
                className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white min-h-[400px] overflow-auto prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="w-full bg-[#111] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] font-mono text-sm leading-relaxed resize-none"
              />
            )}
          </div>
        )}
      </main>

      {/* 登录提示弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-[#333] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">保存到云端</h3>
            <p className="text-gray-400 mb-6">
              登录后可以保存文档到云端，随时查看和编辑。游客生成的内容可以直接复制或下载。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-[#333] hover:bg-[#444] text-white py-3 rounded"
              >
                继续体验
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-[#5765c7] hover:bg-[#4654b6] text-white py-3 rounded"
              >
                去登录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
