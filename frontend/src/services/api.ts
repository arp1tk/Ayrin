const BASE_URL = "/api";

export interface Category {
  id: number;
  name: string;
  bookmarkCount: number;
  createdAt: string;
}

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description: string | null;
  categoryId: number | null;
  category: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkInput {
  title: string;
  url: string;
  description?: string;
  categoryId?: number | null;
}

export interface CategoryInput {
  name: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  getBookmarks: (params?: { search?: string; category?: number | string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.category != null) qs.set("category", String(params.category));
    const query = qs.toString() ? `?${qs}` : "";
    return request<{ bookmarks: Bookmark[] }>(`/bookmarks${query}`);
  },
  createBookmark: (data: BookmarkInput) =>
    request<Bookmark>(`/bookmarks`, { method: "POST", body: JSON.stringify(data) }),
  updateBookmark: (id: number, data: BookmarkInput) =>
    request<Bookmark>(`/bookmarks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBookmark: (id: number) =>
    request<{ message: string }>(`/bookmarks/${id}`, { method: "DELETE" }),
  reorderBookmarks: (order: { id: number; sortOrder: number }[]) =>
    request<{ message: string }>(`/bookmarks/reorder`, {
      method: "PUT",
      body: JSON.stringify({ order }),
    }),

  getCategories: () => request<{ categories: Category[] }>(`/categories`),
  createCategory: (data: CategoryInput) =>
    request<Category>(`/categories`, { method: "POST", body: JSON.stringify(data) }),
  deleteCategory: (id: number) =>
    request<{ message: string }>(`/categories/${id}`, { method: "DELETE" }),
};
