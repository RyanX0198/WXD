# WXD 写作助手 - 技术架构文档

## 系统架构

```
┌─────────────────────────────────────────┐
│           Frontend (React/Vite)          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Landing  │ │ Chat    │ │ Corpus  │   │
│  │  Page   │ │  Page   │ │ Manage  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
└───────┼───────────┼───────────┼────────┘
        │           │           │
        └───────────┼───────────┘
                    │ REST API / SSE
┌───────────────────┼────────────────────┐
│           Backend (Express/TS)          │
│  ┌─────────┐ ┌────┴────┐ ┌─────────┐   │
│  │ Auth    │ │ Chat    │ │ Corpus  │   │
│  │ Module  │ │ Module  │ │ Module  │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
│  ┌────┴────┐ ┌────┴────┐ ┌────┴────┐   │
│  │Generate │ │Humanize │ │  Write  │   │
│  │ Module  │ │ Module  │ │ (Agent) │   │
│  └────┬────┘ └────┬────┘ └────┬────┘   │
└───────┼───────────┼───────────┼────────┘
        │           │           │
        └───────────┼───────────┘
                    │
┌───────────────────┼────────────────────┐
│           Data Layer                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ SQLite  │ │ Vector  │ │  File   │   │
│  │(Prisma) │ │ Store   │ │ Storage │   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
        │
        │ LLM API
┌───────┴─────────────────────────────────┐
│           AI Services                    │
│  ┌─────────┐ ┌─────────┐               │
│  │DeepSeek │ │  Kimi   │               │
│  │  API    │ │  API    │               │
│  └─────────┘ └─────────┘               │
└─────────────────────────────────────────┘
```

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|:---|:---|:---|:---|
| **前端框架** | React | 18.x | SPA单页应用 |
| **构建工具** | Vite | 5.x | 开发/构建 |
| **语言** | TypeScript | 5.x | 全栈统一 |
| **样式** | TailwindCSS | 3.x | 原子化CSS |
| **后端框架** | Express | 4.x | REST API |
| **ORM** | Prisma | 6.x | 数据库操作 |
| **数据库** | SQLite | 3.x | 轻量级，生产可切换PostgreSQL |
| **AI引擎** | DeepSeek API | - | 公文生成核心 |
| **文件解析** | Mammoth | 1.x | DOCX文档解析 |
| **Agent框架** | LangChain/LangGraph | - | 智能写作Agent |

## API 架构

| 路径 | 方法 | 功能 | 认证 |
|:---|:---|:---|:---|
| `/health` | GET | 健康检查 | 无 |
| `/api/auth/register` | POST | 用户注册 | 无 |
| `/api/auth/login` | POST | 用户登录 | 无 |
| `/api/chat/conversations` | GET/POST | 会话管理 | JWT |
| `/api/chat/messages/stream` | POST | 流式对话(SSE) | JWT |
| `/api/generate` | POST | 公文生成 | 无 |
| `/api/write` | POST | Agent智能写作 | 无 |
| `/api/humanize` | POST | 去AI味润色 | 无 |
| `/api/corpus` | GET/POST | 语料库管理 | JWT |
| `/api/corpus/upload` | POST | 文件上传 | JWT |
| `/api/documents` | CRUD | 文档管理 | JWT |

## 模块状态

| 模块 | 状态 | 备注 |
|:---|:---|:---|
| 用户认证系统 | ✅ 完成 | JWT + 游客模式 |
| AI对话写作 | ✅ 完成 | SSE流式 + 打字机效果 |
| 公文直接生成 | ✅ 完成 | DeepSeek集成 |
| Agent智能写作 | ✅ 完成 | LangGraph工作流 |
| 语料库管理 | ✅ 完成 | 上传/索引/检索 |
| 向量检索 | ✅ 完成 | 相似度匹配 |
| 去AI味润色 | ✅ 完成 | Humanize模块 |
| 文档CRUD | ✅ 完成 | 增删改查 |

## 部署架构

```
用户浏览器
    │
    ├── 前端 (Vercel CDN)
    │   └── React SPA 静态资源
    │
    └── 后端 (Render)
        ├── Express API 服务
        ├── SQLite 数据库 (持久化磁盘)
        └── DeepSeek API 调用
```

## 技术债务

- [ ] API 错误处理标准化
- [ ] 前端状态管理重构（Context → Zustand）
- [ ] 单元测试覆盖率提升
- [ ] 是否引入 Redis（会话缓存、限流）
- [ ] 是否引入消息队列（异步任务处理）

## Git工作流

- **分支策略**: Git Flow 简化版 (main + feature/*)
- **提交规范**: Conventional Commits (feat/fix/docs/refactor)
- **部署**: 推送main分支自动触发部署
