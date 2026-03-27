import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 顶部导航 */}
      <nav className="border-b border-[#333] px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold bg-gradient-to-r from-[#5765c7] via-[#a0fcc9] to-[#ffa6ac] bg-clip-text text-transparent">
          WXD 写作助手
        </div>
        <div className="flex gap-4">
          <a href="#features" className="text-gray-400 hover:text-white text-sm">功能</a>
          <a href="#about" className="text-gray-400 hover:text-white text-sm">关于</a>
          <button 
            onClick={() => navigate('/chat')}
            className="text-sm bg-[#5765c7] hover:bg-[#4654b6] text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            开始使用
          </button>
        </div>
      </nav>

      {/* 主横幅 Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#5765c7] via-[#a0fcc9] to-[#ffa6ac] bg-clip-text text-transparent">
            WXD 写作助手
          </h1>
          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            让 AI 成为你的写作伙伴，提升创作效率
          </p>
          <p className="text-sm text-[#5765c7] mb-8">
            专为教育政务场景优化 · 面向校长教师 · 专业讲话稿生成
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/chat')}
              className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-10 py-7 text-xl rounded-full transition-transform hover:scale-105"
            >
              🎤 开始写讲话稿
            </button>
          </div>
        </div>
      </section>

      {/* 功能特色 Features Section */}
      <section id="features" className="py-20 border-t border-[#222]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">核心功能</h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            专为教育政务场景打造，让公文写作更高效
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: '🎤', 
                title: '讲话稿生成', 
                desc: '开学典礼、工作总结、动员讲话一键生成，语言庄重得体',
                color: 'from-[#5765c7] to-[#4654b6]'
              },
              { 
                icon: '📢', 
                title: '活动通知', 
                desc: '运动会、会议、培训通知快速撰写，格式规范标准',
                color: 'from-[#a0fcc9] to-[#7ee8a8]'
              },
              { 
                icon: '📝', 
                title: '工作总结', 
                desc: '年度总结、季度汇报智能生成，数据支撑有力',
                color: 'from-[#ffa6ac] to-[#ff8a92]'
              },
            ].map((item) => (
              <div 
                key={item.title} 
                className="bg-[#111] border border-[#333] rounded-xl p-6 text-center hover:border-[#5765c7]/50 transition-colors group"
              >
                <div className={`text-4xl mb-4 w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 行动召唤 */}
      <section className="py-20 text-center border-t border-[#222]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-gray-400 mb-8">立即体验 AI 辅助写作的强大功能</p>
          <button 
            onClick={() => navigate('/chat')}
            className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-10 py-7 text-xl rounded-full transition-transform hover:scale-105"
          >
            🎤 开始写讲话稿
          </button>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-[#222]">
        <p>© 2026 WXD 写作助手 · 让公文写作更简单</p>
      </footer>
    </div>
  );
}
