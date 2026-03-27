# WXD 写作助手

> 让 AI 成为你的写作伙伴，提升创作效率

专为教育政务场景优化的 AI 写作助手，面向校长教师，支持讲话稿、工作报告、活动通知等公文智能生成。

## 项目结构

```
WXD/
├── frontend/          # 前端 (React + Vite + TypeScript)
├── backend/           # 后端 (Express + TypeScript + SQLite)
└── README.md
```

## 技术栈

**前端：** React 18 + Vite + TypeScript + TailwindCSS  
**后端：** Express + TypeScript + Prisma + SQLite  
**AI：** DeepSeek API  

## 快速开始

### 1. 启动后端
```bash
cd backend
npm install
cp .env.example .env  # 配置环境变量
npm run dev
```
后端运行在 http://localhost:3001

### 2. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在 http://localhost:5173

## 核心功能

- 🎤 **讲话稿生成** - 开学典礼、工作总结、动员讲话
- 📢 **活动通知** - 运动会、会议、培训通知
- 📝 **工作总结** - 年度总结、季度汇报
- 📚 **语料库管理** - 上传参考文档，提升生成质量
- 🧠 **记忆系统** - 记住写作偏好和风格

## 部署

- **后端：** Render (render.yaml 已配置)
- **前端：** Vercel (vercel.json 已配置)

## License

MIT
