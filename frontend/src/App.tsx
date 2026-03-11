import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import BookmarkForm from "./components/BookmarkForm";
import BookmarkList from "./components/BookmarkList";
import CategorySidebar from "./components/CategorySidebar";
import Modal from "./components/Modal";
import SearchBar from "./components/SearchBar";
import type { Bookmark, BookmarkInput, Category } from "./services/api";
import { api } from "./services/api";

export default function App() {
  // ── state ────────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [orderedBookmarks, setOrderedBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("ayrin-dark") === "true";
  });

  // ── dark mode ─────────────────────────────────────────────────────────
  const toggleDark = () =>
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("ayrin-dark", String(next));
      return next;
    });

  // Sync orderedBookmarks when server data changes
  useEffect(() => {
    setOrderedBookmarks(bookmarks);
  }, [bookmarks]);

  // ── data fetching ─────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchBookmarks = useCallback(async () => {
    setLoadingBookmarks(true);
    try {
      const data = await api.getBookmarks({
        search: searchQuery || undefined,
        category: selectedCategory ?? undefined,
      });
      setBookmarks(data.bookmarks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBookmarks(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  // ── DND reorder ───────────────────────────────────────────────────────
  const handleReorder = useCallback(
    async (activeId: number, overId: number) => {
      const oldIdx = orderedBookmarks.findIndex((b) => b.id === activeId);
      const newIdx = orderedBookmarks.findIndex((b) => b.id === overId);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
      const next = arrayMove(orderedBookmarks, oldIdx, newIdx);
      setOrderedBookmarks(next);
      try {
        await api.reorderBookmarks(next.map((b, i) => ({ id: b.id, sortOrder: i })));
      } catch {
        setOrderedBookmarks(orderedBookmarks);
      }
    },
    [orderedBookmarks]
  );

  // ── modal helpers ─────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingBookmark(null);
    setFormError("");
    setModalOpen(true);
  };
  const openEditModal = (b: Bookmark) => {
    setEditingBookmark(b);
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingBookmark(null);
    setFormError("");
  };

  const handleSubmit = async (data: BookmarkInput) => {
    setFormLoading(true);
    setFormError("");
    try {
      if (editingBookmark) {
        await api.updateBookmark(editingBookmark.id, data);
      } else {
        await api.createBookmark(data);
      }
      closeModal();
      fetchBookmarks();
      fetchCategories();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  // ── category / bookmark actions ───────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bookmark?")) return;
    try {
      await api.deleteBookmark(id);
      fetchBookmarks();
      fetchCategories();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await api.createCategory({ name });
      fetchCategories();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      await api.deleteCategory(id);
      if (selectedCategory === id) setSelectedCategory(null);
      fetchCategories();
      fetchBookmarks();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete category");
    }
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="flex h-screen bg-gray-50 dark:bg-[#09090b] overflow-hidden transition-colors duration-200">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed on mobile, static on desktop */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 shrink-0 flex flex-col
            transform transition-transform duration-300 ease-in-out
            lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => {
              setSelectedCategory(id);
              setSidebarOpen(false);
            }}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white dark:bg-[#09090b] border-b border-gray-100 dark:border-slate-800/60 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-1 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {darkMode ? (
                  /* Sun icon */
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  /* Moon icon */
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Add Bookmark */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Bookmark</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
            <div className="max-w-3xl">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100 tracking-tight">
                  {selectedCategoryName ?? "All Bookmarks"}
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {orderedBookmarks.length}{" "}
                  {orderedBookmarks.length === 1 ? "bookmark" : "bookmarks"}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>

              <BookmarkList
                bookmarks={orderedBookmarks}
                loading={loadingBookmarks}
                onEdit={openEditModal}
                onDelete={handleDelete}
                searchQuery={searchQuery}
                onReorder={handleReorder}
              />
            </div>
          </main>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={editingBookmark ? "Edit Bookmark" : "Add Bookmark"}
        >
          <BookmarkForm
            bookmark={editingBookmark}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={closeModal}
            loading={formLoading}
            error={formError}
            onCategoryCreated={fetchCategories}
          />
        </Modal>
      </div>
    </div>
  );
}
