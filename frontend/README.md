# WXD 写作助手

让 AI 成为你的写作伙伴，提升创作效率

---

## 🚀 快速启动

### 1. 启动后端服务

```bash
cd ~/.openclaw/workspace-backend-lead/WXD-Backend
npm run dev
```

后端服务将在 `http://localhost:3001` 启动

### 2. 启动前端服务

```bash
cd ~/.openclaw/workspace-frontend-lead
npm run dev
```

前端服务默认在 `http://localhost:5173` 启动

**注意**: 如果5173端口被占用，会自动切换到5174、5175等，请查看终端输出确认实际端口号。

### 3. 访问应用

打开浏览器访问显示的地址，例如：
```
http://localhost:5173
```
或
```
http://localhost:5175
```

---

## 📁 项目结构

```
workspace/
├── WXD-产品功能清单.md      # 功能完成度跟踪
├── WXD-项目迭代计划.md      # 迭代规划
├── WXD-每日晨会-*.md        # 每日同步记录
└── WXD-测试报告-*.md        # 测试报告

workspace-frontend-lead/     # 前端项目
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx  # 首页
│   │   ├── LoginPage.tsx    # 登录/注册
│   │   ├── ChatPage.tsx     # AI对话
│   │   └── DashboardPage.tsx # 工作台
│   ├── contexts/
│   │   └── AuthContext.tsx  # 认证状态
│   ├── lib/
│   │   └── api.ts           # API客户端
│   └── components/
│       └── LoadingSpinner.tsx # 加载组件

workspace-backend-lead/WXD-Backend/  # 后端项目
├── src/
│   ├── routes/
│   │   ├── auth.ts          # 认证API
│   │   ├── chat.ts          # 对话API
│   │   ├── documents.ts     # 文档API
│   │   └── generate.ts      # 生成API
│   └── mockDB.ts            # 数据库
```

---

## ✅ 已完成功能

### 用户系统
- ✅ 用户注册
- ✅ 用户登录
- ✅ Token认证
- ✅ 游客模式

### AI对话
- ✅ 创建对话
- ✅ 对话列表
- ✅ 流式消息 (SSE)
- ✅ 消息历史
- ✅ 打字机效果

### 文档管理
- ✅ 创建文档
- ✅ 文档列表
- ✅ 文档编辑

### 公文生成
- ✅ 8种文种支持
- ✅ DeepSeek API集成
- ✅ 参数调整

---

## 🧪 测试账号

```
邮箱: lr_wxd@163.com
密码: wxd123456
```

或点击登录页的"使用测试账号"按钮自动填充。

---

## 📝 API 端点

| 端点 | 说明 |
|------|------|
| `POST /api/auth/register` | 用户注册 |
| `POST /api/auth/login` | 用户登录 |
| `POST /api/chat/conversations` | 创建对话 |
| `POST /api/chat/messages/stream` | 流式消息 |
| `POST /api/generate` | 公文生成 |

---

## 🐛 常见问题

### Q: 前端提示"无法连接服务器"
**A**: 请检查后端服务是否已启动 (`http://localhost:3001/health`)

### Q: 登录返回401
**A**: 账号未注册，请先注册或点击"使用测试账号"

### Q: 端口被占用
**A**: Vite会自动切换到其他端口(5174/5175等)，请查看终端输出

---

**更新时间**: 2026-03-21
