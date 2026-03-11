import { useState } from "react";
import type { Category } from "../services/api";

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: number) => void;
  onClose: () => void;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateCategory,
  onDeleteCategory,
  onClose,
}: CategorySidebarProps) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onCreateCategory(newName.trim());
    setNewName("");
    setAdding(false);
  };

  return (
    <aside className="flex flex-col h-full w-full bg-white dark:bg-[#09090b] border-r border-slate-100 dark:border-slate-800">
      {/* Logo + close (mobile) */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-none">Ayrin</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none">Bookmark Manager</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-600 px-3 mb-1.5">
          Categories
        </p>

        {/* All Bookmarks */}
        <NavItem
          label="All Bookmarks"
          count={categories.reduce((s, c) => s + c.bookmarkCount, 0)}
          isActive={selectedCategory === null}
          onClick={() => onSelectCategory(null)}
          icon={
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          }
        />

        {/* Per-category items */}
        <div className="mt-0.5 space-y-0.5">
          {categories.map((cat) => (
            <NavItem
              key={cat.id}
              label={cat.name}
              count={cat.bookmarkCount}
              isActive={selectedCategory === cat.id}
              onClick={() => onSelectCategory(cat.id)}
              onDelete={() => onDeleteCategory(cat.id)}
              icon={
                <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                </span>
              }
            />
          ))}
        </div>

        {/* New category */}
        <div className="mt-4 px-1">
          {adding ? (
            <div className="flex gap-1.5 items-center">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                  if (e.key === "Escape") { setAdding(false); setNewName(""); }
                }}
                placeholder="Category name"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs rounded-md
                  bg-slate-100 dark:bg-slate-800
                  border border-slate-200 dark:border-slate-700
                  text-gray-800 dark:text-slate-200
                  placeholder-slate-400 dark:placeholder-slate-600
                  focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
              />
              <button
                onClick={handleAdd}
                className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 rounded-md text-xs font-medium text-white transition-colors shrink-0"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-slate-400 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Category
            </button>
          )}
        </div>
      </nav>
    </aside>
  );
}

// ── Sub-component: individual nav item ───────────────────────────────────────
interface NavItemProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  onDelete?: () => void;
  icon: React.ReactNode;
}

function NavItem({ label, count, isActive, onClick, onDelete, icon }: NavItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`
        group relative flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm
        select-none transition-colors duration-100
        ${isActive
          ? "bg-violet-500/10 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
        }
      `}
    >
      {/* Active accent bar */}
      {isActive && (
        <span className="absolute left-0 inset-y-1.5 w-0.5 bg-violet-500 rounded-full" />
      )}

      <span className={isActive ? "text-violet-600 dark:text-violet-400" : ""}>{icon}</span>
      <span className="flex-1 truncate font-medium text-xs leading-snug">{label}</span>

      {/* Count badge */}
      <span
        className={`
          text-[10px] px-1.5 py-0.5 rounded-full font-medium tabular-nums
          ${isActive
            ? "bg-violet-500/20 text-violet-600 dark:text-violet-300"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
          }
        `}
      >
        {count}
      </span>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-all"
          title="Delete category"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
