# 去AI味功能 - 前端实现文档

## 概述

卡维斯已完成"去AI味"功能的前端开发。该功能允许用户降低AI生成文本的机器痕迹，使其更像真人写作。

---

## 新增组件

### 1. HumanizeToggle - 去AI味开关组件
**文件**: `src/components/writing/HumanizeToggle.tsx`

功能：
- 启用/禁用去AI味功能
- 选择强度级别（轻度/中度/深度）
- 显示当前级别效果预览

**界面元素**：
- 开关按钮（带动画）
- 三档强度选择卡片
- 效果说明区域

---

### 2. HumanizeLevelSelector - 强度选择器
**文件**: `src/components/writing/HumanizeLevelSelector.tsx`

类型定义：
```typescript
export type HumanizeLevel = 'light' | 'medium' | 'deep';

export interface HumanizeConfig {
  enabled: boolean;
  level: HumanizeLevel;
}
```

各级别说明：
| 级别 | 图标 | 说明 | 主要改动 |
|------|------|------|----------|
| 轻度 🌱 | 轻微优化 | 减少套话、调整句式节奏 |
| 中度 🌿 | 自然平衡 | 口语化表达、打破规整结构、适当停顿词 |
| 深度 🔥 | 彻底改写 | 自然口语、轻微不完美、短句强调、完全去AI化 |

---

### 3. HumanizeCompareView - 对比预览组件
**文件**: `src/components/writing/HumanizeCompareView.tsx`

功能：
- 分屏对比模式（原文 vs 人性化版本）
- 单独查看原文
- 单独查看改写后版本
- 显示改动说明列表
- 悬停高亮对应段落

**界面元素**：
- 三种视图切换标签
- 分屏对比布局（左右并排）
- 改动清单（含类型标记：删除/新增/修改）

---

### 4. AIDetectionScore - AI检测评分组件
**文件**: `src/components/writing/AIDetectionScore.tsx`

功能：
- 显示AI检测评分（0-100%，越高越像AI）
- 对比模式（原文 vs 改写后）
- 风险等级标签（高风险/中等风险/低风险）
- 优化效果评估

---

## 类型定义更新

**文件**: `src/types/writing.ts`

新增类型：
```typescript
export type HumanizeLevel = 'light' | 'medium' | 'deep';

export interface WritingRequest {
  // ... 原有字段
  humanize?: {
    enabled: boolean;
    level: HumanizeLevel;
  };
}

export interface WritingResponse {
  // ... 原有字段
  humanizedContent?: string;         // 人性化后的内容
  aiDetectionScore?: number;         // AI检测评分（0-100）
  humanizedDetectionScore?: number;  // 人性化后的评分
  changes?: {                        // 改动说明
    type: 'removed' | 'added' | 'modified';
    description: string;
  }[];
}
```

---

## 需要后端提供的接口字段

### 1. 生成接口（POST /api/generate）
**请求参数**：
```json
{
  "documentType": "official",
  "style": "formal",
  "tone": "authoritative",
  "topic": "优化营商环境",
  "keywords": ["政策", "服务"],
  "wordCount": 800,
  "requirements": "",
  "humanize": {
    "enabled": true,
    "level": "medium"
  }
}
```

**响应数据**：
```json
{
  "title": "关于优化营商环境的通知",
  "content": "AI生成原文...",
  "humanizedContent": "人性化版本...",
  "outline": [...],
  "suggestions": [...],
  "aiDetectionScore": 85,
  "humanizedDetectionScore": 35,
  "changes": [
    { "type": "removed", "description": "删除'首先/其次/最后'等套话" },
    { "type": "added", "description": "加入口语化表达" }
  ]
}
```

### 2. 单独去AI味接口（可选）
**请求**：`POST /api/humanize`
```json
{
  "content": "原文内容...",
  "level": "deep"
}
```

**响应**：
```json
{
  "humanizedContent": "改写后内容...",
  "detectionScore": 20,
  "changes": [...]
}
```

---

## 使用说明

### 1. 基本使用流程

1. 填写写作表单（主题、关键词等）
2. 开启"去AI味"开关（可选）
3. 选择强度级别：
   - **轻度**：适合正式公文，保持基本结构
   - **中度**：适合一般文案，自然流畅
   - **深度**：适合轻松场景，完全口语化
4. 点击"生成文稿并去AI味"
5. 查看对比预览和AI检测评分

### 2. 动态调整

生成后可在右侧快捷切换强度级别，无需重新生成原文。

### 3. AI检测评分解读

| 评分范围 | 风险等级 | 说明 |
|----------|----------|------|
| 0-30% | 低风险 | 很像真人写作 |
| 30-60% | 中等风险 | 较为自然 |
| 60-80% | 较高风险 | 有明显AI痕迹 |
| 80-100% | 高风险 | 明显AI生成 |

---

## 去AI味核心策略

### 轻度优化
- 删除"首先/其次/最后/综上所述"等套话
- 保留段落结构
- 轻微调整句式

### 中度优化
- 加入口语化表达（"说实话"、"你看"）
- 打破规整的段落结构
- 添加适当停顿词（"嗯"、"这个"）
- 短句化处理

### 深度优化
- 彻底去除所有模板化结构
- 大量口语化、生活化表达
- 引入轻微不完美（重复、省略、反问）
- 完全自然的叙述节奏

---

## 修改文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/writing/HumanizeToggle.tsx` | 新增 | 去AI味开关组件 |
| `src/components/writing/HumanizeLevelSelector.tsx` | 新增 | 强度选择器 |
| `src/components/writing/HumanizeCompareView.tsx` | 新增 | 对比预览组件 |
| `src/components/writing/AIDetectionScore.tsx` | 新增 | AI检测评分组件 |
| `src/components/writing/WritingForm.tsx` | 修改 | 集成去AI味开关 |
| `src/components/writing/index.ts` | 修改 | 导出新组件 |
| `src/types/writing.ts` | 修改 | 添加类型定义 |
| `src/pages/WritingAssistantPage.tsx` | 修改 | 集成所有新功能 |

---

## 卡维斯汇报完毕

任务完成度：**100%**

所有前端UI组件已开发完成，包含完整的交互逻辑和视觉效果。等待后端接口对接。

如需调整样式或增加功能，请随时指示。
