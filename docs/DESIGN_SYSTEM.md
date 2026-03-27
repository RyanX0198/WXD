# WXD 写作助手 - 设计系统规范 v1.0

**版本**: v1.0  
**创建日期**: 2026-03-21  
**适用范围**: 所有前端开发任务  
**强制执行**: ✅ 是

---

## 📌 开发前必读

**每次开始开发任务前，必须阅读本文档相关章节。**  
**代码注释必须引用规范：** `// 参照DESIGN_SYSTEM.md Button规范`

---

## 🎨 色彩系统

### 主色调
| 名称 | CSS变量 | 色值 | 用途 |
|------|---------|------|------|
| 品牌主色 | `--color-primary` | `#5765c7` | 按钮、链接、强调 |
| 品牌 hover | `--color-primary-hover` | `#4654b6` | 按钮悬停 |
| 渐变起点 | `--color-gradient-start` | `#5765c7` | 标题渐变 |
| 渐变中点 | `--color-gradient-mid` | `#a0fcc9` | 标题渐变 |
| 渐变终点 | `--color-gradient-end` | `#ffa6ac` | 标题渐变 |

### 背景色
| 名称 | CSS变量 | 色值 | 用途 |
|------|---------|------|------|
| 页面背景 | `--bg-primary` | `#000000` | 页面主背景 |
| 卡片背景 | `--bg-card` | `#111111` | Card、Modal |
| 输入框背景 | `--bg-input` | `#1a1a1a` | Input、Textarea |
| 悬停背景 | `--bg-hover` | `#222222` | 列表项悬停 |

### 文字色
| 名称 | CSS变量 | 色值 | 用途 |
|------|---------|------|------|
| 主文字 | `--text-primary` | `#ffffff` | 标题、正文 |
| 次要文字 | `--text-secondary` | `#9ca3af` | 描述、提示 |
| 禁用文字 | `--text-disabled` | `#6b7280` | 禁用状态 |
| 链接文字 | `--text-link` | `#5765c7` | 可点击链接 |

### 边框色
| 名称 | CSS变量 | 色值 | 用途 |
|------|---------|------|------|
| 默认边框 | `--border-default` | `#333333` | 卡片、输入框 |
| 悬停边框 | `--border-hover` | `#444444` | 悬停状态 |
| 聚焦边框 | `--border-focus` | `#5765c7` | 输入框聚焦 |
| 强调边框 | `--border-accent` | `#5765c7/50` | 选中状态 |

---

## 🔤 字体规范

### 字体族
```css
--font-sans: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
--font-serif: 'Noto Serif SC', 'PingFang SC', 'Songti SC', serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 字号系统
| 级别 | 大小 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| Hero | `48px-72px` | `1.1` | `700` | 首页大标题 |
| H1 | `32px` | `1.3` | `700` | 页面标题 |
| H2 | `24px` | `1.4` | `600` | 区块标题 |
| H3 | `20px` | `1.4` | `600` | 卡片标题 |
| Body | `16px` | `1.6` | `400` | 正文 |
| Body-lg | `18px` | `2.2` | `400` | 阅读模式正文 |
| Small | `14px` | `1.5` | `400` | 辅助文字 |
| Tiny | `12px` | `1.5` | `400` | 时间戳、标签 |

### 字重
| 名称 | 值 | 用途 |
|------|-----|------|
| Normal | `400` | 正文 |
| Medium | `500` | 次要标题 |
| Semibold | `600` | 按钮、强调 |
| Bold | `700` | 标题 |

---

## 📐 间距系统（4px基线网格）

### 基础单位
```css
--space-unit: 4px;
```

### 间距刻度
| Token | 值 | 像素 | 用途 |
|-------|-----|------|------|
| `space-1` | 1 unit | `4px` | 图标间隙 |
| `space-2` | 2 units | `8px` | 紧凑间距 |
| `space-3` | 3 units | `12px` | 标签间距 |
| `space-4` | 4 units | `16px` | 标准内边距 |
| `space-6` | 6 units | `24px` | 卡片内边距 |
| `space-8` | 8 units | `32px` | 区块间距 |
| `space-12` | 12 units | `48px` | 大区块间距 |
| `space-16` | 16 units | `64px` | 页面间距 |

### 页面布局
```css
/* 最大宽度 */
--max-width: 1280px;
--content-width: 896px;
--reading-width: 768px;

/* 页面边距 */
--page-padding-x: 24px;
--page-padding-y: 32px;
```

---

## 🧩 组件规范

### Button 按钮

#### 主按钮（Primary）
```
背景: --color-primary
Hover: --color-primary-hover
文字: #ffffff
字号: 16px
字重: 500
内边距: 12px 24px (py-3 px-6)
圆角: 8px (rounded-lg)
过渡: 200ms ease
```
**代码:**
```tsx
<button className="bg-[#5765c7] hover:bg-[#4654b6] text-white px-6 py-3 rounded-lg font-medium transition-colors">
```

#### 次要按钮（Secondary）
```
背景: #333333
Hover: #444444
文字: #ffffff
边框: 1px solid #444444
```
**代码:**
```tsx
<button className="bg-[#333] hover:bg-[#444] border border-[#444] text-white px-6 py-3 rounded-lg">
```

#### 文字按钮（Ghost）
```
背景: transparent
Hover: rgba(255,255,255,0.1)
文字: #9ca3af
Hover文字: #ffffff
```

### Input 输入框

```
背景: #1a1a1a (--bg-input)
边框: 1px solid #333333
圆角: 8px
内边距: 12px 16px
字号: 16px

聚焦状态:
  边框: #5765c7
  outline: none
  box-shadow: 0 0 0 2px rgba(87, 101, 199, 0.2)

Placeholder: #6b7280
```

**代码:**
```tsx
<input 
  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 
             text-white outline-none focus:border-[#5765c7] 
             focus:ring-2 focus:ring-[#5765c7]/20"
  placeholder="提示文字"
/>
```

### Card 卡片

```
背景: #111111
边框: 1px solid #333333
圆角: 12px (rounded-xl)
内边距: 24px (p-6)
Hover边框: #5765c7/50
过渡: 200ms ease
```

**代码:**
```tsx
<div className="bg-[#111] border border-[#333] rounded-xl p-6 
                hover:border-[#5765c7]/50 transition-colors cursor-pointer">
```

### Modal 弹窗

#### 阅读模式弹窗
```
全屏: fixed inset-0
背景: #0a0a0a
内容区: max-w-4xl mx-auto
阅读卡片: bg-[#111] rounded-xl p-12
字号: 18px
行高: 2.2
字体: serif (宋体)
```

---

## ✨ 动效规范

### 过渡时长
| 场景 | 时长 | 缓动函数 |
|------|------|----------|
| 颜色变化 | 200ms | ease |
| 大小变化 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 位移动画 | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| 页面切换 | 400ms | ease-in-out |
| 加载动画 | 1000ms | linear infinite |

### 缓动函数
```css
--ease-default: ease;
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 悬停效果
```
Button Hover: scale(1.02) + 背景色变化
Card Hover: border-color变化
Link Hover: 下划线出现
```

---

## 📱 响应式断点

| 断点 | 宽度 | Tailwind类 | 用途 |
|------|------|------------|------|
| Mobile | < 640px | `default` | 手机 |
| Tablet | 640px-1024px | `sm: md:` | 平板 |
| Desktop | > 1024px | `lg:` | 桌面 |
| Large | > 1280px | `xl:` | 大屏 |

### 响应式规则
1. **Mobile First**: 默认样式为手机，逐步添加大屏样式
2. **字体响应式**: `text-2xl md:text-4xl lg:text-6xl`
3. **布局响应式**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
4. **间距响应式**: `p-4 md:p-6 lg:p-8`

---

## 📝 代码注释规范

**必须引用设计规范:**
```tsx
// 参照DESIGN_SYSTEM.md Button规范
<button className="bg-[#5765c7] hover:bg-[#4654b6] ...">

// 参照DESIGN_SYSTEM.md 字体规范 - Body-lg
<p className="text-lg leading-relaxed">

// 参照DESIGN_SYSTEM.md 间距系统 - space-6
<div className="p-6">
```

---

## ✅ 验收检查项

提交代码前必须确认:
- [ ] 所有颜色使用CSS变量或规范中的色值
- [ ] 字体大小符合规范中的字号系统
- [ ] 间距为4的倍数（4px, 8px, 12px...）
- [ ] 组件样式符合Button/Input/Card规范
- [ ] 动效时长和缓动函数符合规范
- [ ] 代码注释引用了DESIGN_SYSTEM.md
- [ ] 提供了正常状态和悬停状态的截图

---

**违反规范的代码将不被合并！**

如有疑问，联系 @卡维斯
