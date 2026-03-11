import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Bookmark, BookmarkInput, Category } from "../services/api";

interface BookmarkFormProps {
  bookmark?: Bookmark | null;
  categories: Category[];
  onSubmit: (data: BookmarkInput) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  onCategoryCreated?: () => void;
}

export default function BookmarkForm({
  bookmark,
  categories,
  onSubmit,
  onCancel,
  loading,
  error,
  onCategoryCreated,
}: BookmarkFormProps) {
  const [title, setTitle] = useState(bookmark?.title ?? "");
  const [url, setUrl] = useState(bookmark?.url ?? "");
  const [description, setDescription] = useState(bookmark?.description ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(bookmark?.categoryId ?? null);

  // Inline "create new category" state
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");
  const [localExtraCategories, setLocalExtraCategories] = useState<Category[]>([]);

  useEffect(() => {
    setTitle(bookmark?.title ?? "");
    setUrl(bookmark?.url ?? "");
    setDescription(bookmark?.description ?? "");
    setCategoryId(bookmark?.categoryId ?? null);
    setCreatingCat(false);
    setNewCatName("");
    setCatError("");
    setLocalExtraCategories([]);
  }, [bookmark]);

  const allCategories = [...categories, ...localExtraCategories];

  const handleCategoryChange = (val: string) => {
    if (val === "__new__") {
      setCreatingCat(true);
      setCatError("");
    } else {
      setCategoryId(val ? Number(val) : null);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    setCatError("");
    try {
      const created = await api.createCategory({ name: newCatName.trim() });
      setLocalExtraCategories((prev) => [...prev, { ...created, bookmarkCount: 0 }]);
      setCategoryId(created.id);
      setCreatingCat(false);
      setNewCatName("");
      onCategoryCreated?.();
    } catch (e) {
      setCatError(e instanceof Error ? e.message : "Failed to create category");
    } finally {
      setCatLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, url, description: description || undefined, categoryId: categoryId || null });
  };

  const inputCls = `
    w-full px-3 py-2 text-sm rounded-lg
    bg-white dark:bg-slate-800/60
    border border-slate-200 dark:border-slate-700/60
    text-gray-900 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-600
    focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50
    transition-colors
  `;

  const labelCls = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Server error */}
      {error && (
        <div className="px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs rounded-lg">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelCls}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. GitHub"
          className={inputCls}
        />
      </div>

      {/* URL */}
      <div>
        <label className={labelCls}>
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://example.com"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Optional short description"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Category */}
      <div>
        <label className={labelCls}>Category</label>

        {creatingCat ? (
          /* Inline new-category input */
          <div className="space-y-2">
            <input
              autoFocus
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleCreateCategory(); }
                if (e.key === "Escape") { setCreatingCat(false); setNewCatName(""); }
              }}
              placeholder="New category name"
              className={inputCls}
            />
            {catError && (
              <p className="text-xs text-red-500">{catError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={catLoading || !newCatName.trim()}
                className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
              >
                {catLoading ? "Creating…" : "Create Category"}
              </button>
              <button
                type="button"
                onClick={() => { setCreatingCat(false); setNewCatName(""); setCatError(""); }}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <select
            value={categoryId ?? ""}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`${inputCls} bg-white dark:bg-slate-800/60`}
          >
            <option value="">No category</option>
            {allCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
            <option value="__new__">+ Create new category…</option>
          </select>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="
            flex-1 px-4 py-2.5
            border border-slate-200 dark:border-slate-700
            text-sm font-medium text-slate-700 dark:text-slate-300
            rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800
            transition-colors
          "
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="
            flex-1 px-4 py-2.5
            bg-violet-600 hover:bg-violet-700 active:bg-violet-800
            disabled:opacity-50 text-sm font-medium text-white
            rounded-lg transition-colors
          "
        >
          {loading ? "Saving…" : bookmark ? "Update Bookmark" : "Save Bookmark"}
        </button>
      </div>
    </form>
  );
}
