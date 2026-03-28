# 变更日志

所有 notable changes 都记录在此文件。格式基于 [Keep a Changelog](https://keepachangelog.com/)，版本号遵循 [SemVer](https://semver.org/)。

## [Unreleased]

### Added
- （下次发布的新功能在此累积）

---

## [0.2.1] - 2026-03-28

### Fixed
- 修复语料库上传后页面白屏问题（API响应防御性处理）
- CorpusListResponse 类型添加可选标记，兼容 files/items 格式
- 上传后增加延迟刷新机制，避免后端未就绪

### Added
- 开发规范 v1.3：防御性编程规范、API契约管理、ErrorBoundary要求
- 开发规范 v1.2：文档维护铁律、专人负责制
- 开发规范 v1.1：Trunk-Based分支、分级评审、分层测试
- 开发规范 v1.0：完整开发流程规范
- 版本发布管理文档 (RELEASES.md)
- 事故复盘文档 (postmortems/2026-03-28-corpus-upload-white-screen.md)
- KP架构Review文档 (ARCHITECTURE_REVIEW.md)

### Changed
- Vercel配置简化

---

## [0.2.0] - 2026-03-27

### Added
- 密码重置接口 POST /api/auth/reset-password
- 语料库文件上传/删除/索引功能
- 向量检索API框架
- 记忆管理页面（页面内直接编辑）
- 会话导出功能（TXT/Word）
- Prisma迁移到PostgreSQL

### Changed
- 前端项目结构重构（归档旧版写作表单到 archive/）
- API路由统一（/api/generate + /api/write + /api/chat）
- ChatPage输入区域高度优化
- 搜索框autocomplete密码填充修复

### Removed
- 冗余API路由 /api/writing
- 旧版写作表单前端代码（归档）

---

## [0.1.0] - 2026-03-20

### Added
- 项目初始化
- 基础AI对话功能（DeepSeek API集成）
- 文档生成API (/api/generate)
- Agent写作模式 (/api/write)
- 用户认证系统（注册/登录/JWT）
- 语料库数据模型（Prisma + SQLite）
- Vercel前端部署配置
- Render后端部署配置
