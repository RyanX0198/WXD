#!/bin/bash

# 创建目录
mkdir -p src/components src/hooks

# 创建 types.ts
cat > src/types.ts << 'EOF'
export interface Article {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  createdAt: number;
}
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
EOF

# 创建 useAutoSave.ts
cat > src/hooks/useAutoSave.ts << 'EOF'
import { useState, useEffect, useRef } from 'react';
import type { SaveStatus } from '../types';

export function useAutoSave<T>({ key, data, debounceMs = 2000 }: { key: string; data: T; debounceMs?: number }) {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStatus('unsaved');
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(data));
      setStatus('saved');
    }, debounceMs);
    return () => clearTimeout(timeoutRef.current);
  }, [data, key, debounceMs]);

  return { status };
}
EOF

# 创建 Editor.tsx（简化版，无BubbleMenu）
cat > src/components/Editor.tsx << 'EOF'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}><strong>B</strong></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}><em>I</em></button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}>1. List</button>
        <button onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded hover:bg-gray-200 ml-auto">↩️</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded hover:bg-gray-200">↪️</button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  );
}
EOF

# 创建 App.tsx
cat > src/App.tsx << 'EOF'
import { useState, useEffect, useCallback } from 'react';
import { Editor } from './components/Editor';
import { useAutoSave } from './hooks/useAutoSave';
import type { Article, SaveStatus } from './types';

const STORAGE_KEY = 'wxd-articles';

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setArticles(parsed);
        if (parsed.length > 0) {
          setCurrentId(parsed[0].id);
          setTitle(parsed[0].title);
          setContent(parsed[0].content);
        }
      } catch (e) {
        console.error('Failed to load articles:', e);
      }
    }
  }, []);

  const { status } = useAutoSave({ key: STORAGE_KEY, data: articles, debounceMs: 2000 });

  const createArticle = useCallback(() => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: '未命名文章',
      content: '<p>开始写作...</p>',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setArticles(prev => [newArticle, ...prev]);
    setCurrentId(newArticle.id);
    setTitle(newArticle.title);
    setContent(newArticle.content);
  }, []);

  const updateArticle = useCallback((updates: Partial<Article>) => {
    if (!currentId) return;
    setArticles(prev => prev.map(article => {
      if (article.id === currentId) {
        return { ...article, ...updates, updatedAt: Date.now() };
      }
      return article;
    }));
  }, [currentId]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    updateArticle({ title: newTitle });
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    updateArticle({ content: newContent });
  };

  const deleteArticle = (id: string) => {
    if (confirm('确定要删除这篇文章吗？')) {
      setArticles(prev => prev.filter(a => a.id !== id));
      if (currentId === id) {
        const remaining = articles.filter(a => a.id !== id);
        if (remaining.length > 0) {
          setCurrentId(remaining[0].id);
          setTitle(remaining[0].title);
          setContent(remaining[0].content);
        } else {
          createArticle();
        }
      }
    }
  };

  const selectArticle = (article: Article) => {
    setCurrentId(article.id);
    setTitle(article.title);
    setContent(article.content);
    setIsSidebarOpen(false);
  };

  const getStatusText = (status: SaveStatus) => {
    switch (status) {
      case 'saved': return '已保存';
      case 'saving': return '保存中...';
      case 'unsaved': return '未保存';
      case 'error': return '保存失败';
    }
  };

  const getStatusColor = (status: SaveStatus) => {
    switch (status) {
      case 'saved': return 'text-green-600';
      case 'saving': return 'text-yellow-600';
      case 'unsaved': return 'text-gray-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded">☰</button>
          <h1 className="text-xl font-bold text-gray-800">WXD 编辑器</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm ${getStatusColor(status)}`}>{getStatusText(status)}</span>
          <button onClick={createArticle} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ 新建文章</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b flex justify-between items-center lg:hidden">
            <h2 className="font-semibold">文章列表</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2">✕</button>
          </div>
          <div className="overflow-y-auto h-full">
            {articles.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">暂无文章</div>
            ) : (
              articles.map(article => (
                <div key={article.id} onClick={() => selectArticle(article)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${currentId === article.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''}`}>
                  <h3 className="font-medium truncate">{article.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{new Date(article.updatedAt).toLocaleString()}</p>
                  <button onClick={(e) => { e.stopPropagation(); deleteArticle(article.id); }} className="text-red-500 text-xs mt-2 hover:underline">删除</button>
                </div>
              ))
            )}
          </div>
        </aside>

        {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="文章标题" className="w-full text-3xl font-bold border-none outline-none bg-transparent mb-6 placeholder-gray-300" />
            <Editor content={content} onChange={handleContentChange} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
EOF

echo "✅ 所有文件创建完成！"
echo "现在运行: npm run build && npx vercel --prod"
