import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '开始写作...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return <div className="text-gray-400">编辑器加载中...</div>;
  }

  return (
    <div className="bg-[#111] border border-[#333] rounded-lg">
      {/* 工具栏 */}
      <div className="border-b border-[#333] p-2 flex gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('bold') ? 'bg-[#5765c7]' : 'hover:bg-[#333]'
          }`}
        >
          粗体
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('italic') ? 'bg-[#5765c7]' : 'hover:bg-[#333]'
          }`}
        >
          斜体
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1 rounded text-sm ${
            editor.isActive('heading', { level: 1 }) ? 'bg-[#5765c7]' : 'hover:bg-[#333]'
          }`}
        >
          标题
        </button>
      </div>

      {/* 编辑区域 */}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[400px] prose prose-invert max-w-none"
      />
    </div>
  );
}
