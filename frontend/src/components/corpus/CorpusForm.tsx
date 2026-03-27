// 添加语料表单组件
import React, { useState } from 'react';
import { CreateCorpusRequest, corpusCategories } from '../../types/corpus';

interface CorpusFormProps {
  onSubmit: (data: CreateCorpusRequest) => void;
  onCancel: () => void;
  initialData?: Partial<CreateCorpusRequest>;
  isSubmitting?: boolean;
}

export const CorpusForm: React.FC<CorpusFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || corpusCategories[0].id);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [source, setSource] = useState(initialData?.source || '');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      source: source.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 标题 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📌</span>
          语料标题
          <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入语料标题..."
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                     placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                     transition-all duration-200"
          required
        />
      </div>

      {/* 文种分类 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📂</span>
          文种分类
        </label>
        <div className="grid grid-cols-4 gap-2">
          {corpusCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`
                py-2 px-3 rounded-lg text-sm border transition-all duration-200
                ${category === cat.id
                  ? 'bg-[#5765c7] border-[#5765c7] text-white'
                  : 'bg-[#1a1a1a] border-[#333] text-[#9ca3af] hover:border-[#444]'
                }
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 内容 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📝</span>
          语料内容
          <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入语料内容..."
          rows={8}
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                     placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                     transition-all duration-200 resize-none"
          required
        />
      </div>

      {/* 标签 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>🏷️</span>
          标签
          <span className="text-xs text-[#6b7280] font-normal">（按回车添加）</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入标签后按回车..."
            className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                       placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                       transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
            className="px-4 py-3 bg-[#333] hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed
                       text-white rounded-lg transition-colors"
          >
            添加
          </button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#5765c7]/20 text-[#5765c7] 
                           rounded-full text-sm border border-[#5765c7]/30"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 来源 */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          <span>📎</span>
          来源
          <span className="text-xs text-[#6b7280] font-normal">（可选）</span>
        </label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="例如：政府工作报告、政策文件等..."
          className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-white 
                     placeholder-[#6b7280] outline-none focus:border-[#5765c7] focus:ring-2 focus:ring-[#5765c7]/20
                     transition-all duration-200"
        />
      </div>

      {/* 按钮 */}
      <div className="flex gap-3 pt-4 border-t border-[#333]">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-4 bg-[#333] hover:bg-[#444] text-white rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !content.trim()}
          className="flex-1 py-3 px-4 bg-[#5765c7] hover:bg-[#4654b6] disabled:opacity-50 
                     disabled:cursor-not-allowed text-white rounded-lg transition-colors
                     flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              保存中...
            </>
          ) : (
            '保存语料'
          )}
        </button>
      </div>
    </form>
  );
};
