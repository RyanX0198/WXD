import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { CorpusPage } from './pages/CorpusPage';
import { MemoryPage } from './pages/MemoryPage';
import { SessionsPage } from './pages/SessionsPage';
import { CorpusManagePage } from './pages/CorpusManagePage';
import { VectorTestPage } from './pages/VectorTestPage';
import './index.css';

function App() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* 首页 */}
        <Route path="/" element={<LandingPage />} />

        {/* 登录/注册 */}
        <Route
          path="/login"
          element={user ? <Navigate to="/chat" /> : <LoginPage />}
        />

        {/* AI对话 - 主功能页面 */}
        <Route path="/chat" element={<ChatPage />} />

        {/* 工作台 - 需要登录 */}
        <Route
          path="/dashboard"
          element={user ? <DashboardPage onLogout={logout} /> : <Navigate to="/login" />}
        />

        {/* 语料库管理（旧版） */}
        <Route path="/corpus" element={<CorpusPage />} />

        {/* ===== Phase 2: 记忆管理 ===== */}
        {/* 记忆管理 */}
        <Route path="/memory" element={<MemoryPage />} />

        {/* 会话历史 */}
        <Route path="/sessions" element={<SessionsPage />} />

        {/* 语料库文件管理 */}
        <Route path="/corpus-manage" element={<CorpusManagePage />} />

        {/* ===== Phase 3: 向量检索测试 ===== */}
        <Route path="/vector-test" element={<VectorTestPage />} />

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
