# Ayrin – Bookmark Manager

A full-stack bookmark manager built with React, Node.js/Express, and SQLite. Save, organize, search, and manage your website bookmarks with category support.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | TailwindCSS v4 |
| Backend | Node.js + Express 5 |
| Database | SQLite (via sqlite3) |

## Features

- Add, edit, and delete bookmarks (title, URL, description, category)
- Create and delete categories
- Filter bookmarks by category via the sidebar
- Search bookmarks by title or description
- Bookmark count per category
- Favicon auto-fetched for each bookmark
- Data persists across sessions via SQLite

## Project Structure

```
ayrin/
├── backend/
│   ├── routes/
│   │   ├── bookmarks.js      # CRUD for bookmarks
│   │   └── categories.js     # CRUD for categories
│   ├── utils/
│   │   └── db.js             # SQLite connection
│   ├── server.js             # Express entry point
│   └── database.db           # SQLite database file
└── frontend/
    └── src/
        ├── components/
        │   ├── BookmarkCard.tsx
        │   ├── BookmarkForm.tsx
        │   ├── BookmarkList.tsx
        │   ├── CategorySidebar.tsx
        │   ├── Modal.tsx
        │   └── SearchBar.tsx
        ├── services/
        │   └── api.ts         # Typed API service layer
        └── App.tsx            # Root component + state management
```

## How to Run

### Backend

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
# Use `npm run dev` for auto-reload with --watch
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
# API requests to /api are proxied to port 5000
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/bookmarks` | Get all bookmarks (supports `?search=` and `?category=`) |
| POST | `/api/bookmarks` | Create a bookmark |
| PUT | `/api/bookmarks/reorder` | Reorder bookmarks (accepts `{ order: [{ id, sortOrder }] }`) |
| PUT | `/api/bookmarks/:id` | Update a bookmark |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark |
| GET | `/api/categories` | Get all categories with bookmark counts |
| POST | `/api/categories` | Create a category |
| DELETE | `/api/categories/:id` | Delete a category (blocked if bookmarks exist) |


