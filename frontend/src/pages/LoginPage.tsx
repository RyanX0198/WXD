import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        navigate('/chat');
      } else {
        await register(email, password, name || email.split('@')[0]);
        navigate('/chat');
      }
    } catch (err: any) {
      // 友好的错误提示
      let errorMsg = err.message || '操作失败';
      if (errorMsg.includes('401')) {
        errorMsg = '邮箱或密码错误，请检查后重试';
      } else if (errorMsg.includes('409')) {
        errorMsg = '该邮箱已被注册，请直接登录';
      } else if (errorMsg.includes('400')) {
        errorMsg = '请填写完整的邮箱和密码';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 快速测试账号
  const fillTestAccount = () => {
    setEmail('lr_wxd@163.com');
    setPassword('wxd123456');
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5765c7] via-[#a0fcc9] to-[#ffa6ac] bg-clip-text text-transparent">
            WXD 写作助手
          </h1>
          <p className="text-gray-400 mt-2">让 AI 成为你的写作伙伴</p>
        </div>
        
        <div className="bg-[#111] border border-[#333] rounded-lg p-6">
          <h2 className="text-xl mb-6 text-center">{isLogin ? '欢迎回来' : '创建账号'}</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <input
                type="text"
                placeholder="姓名（可选）"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20 transition-colors duration-200"
              />
            )}
            
            <input
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20 transition-colors duration-200"
            />
            
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20 transition-colors duration-200"
            />
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#5765c7] hover:bg-[#4654b6] text-white py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>处理中...</span>
                </>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={fillTestAccount}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              使用测试账号
            </button>
          </div>
          
          <p className="text-center mt-4 text-gray-400">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[#5765c7] hover:underline ml-1"
            >
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>
          
          <div className="mt-4 pt-4 border-t border-[#333] text-center">
            <button
              onClick={() => navigate('/chat')}
              className="text-sm text-gray-500 hover:text-gray-300"
            >
              ← 暂不登录，直接体验
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
