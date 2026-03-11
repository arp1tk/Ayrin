import cors from "cors";
import express from "express";
import bookmarksRouter from "./routes/bookmarks.js";
import categoriesRouter from "./routes/categories.js";
import db from "./utils/db.js";

const app = express();

app.use(cors());
app.use(express.json());

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      categoryId INTEGER,
      sortOrder INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(categoryId) REFERENCES categories(id)
    )
  `);

  // Migration: add sortOrder to existing databases (silently ignored if column exists)
  db.run(`ALTER TABLE bookmarks ADD COLUMN sortOrder INTEGER DEFAULT 0`, () => {
    db.run(`
      UPDATE bookmarks SET sortOrder = (
        SELECT COUNT(*) FROM bookmarks b2 WHERE b2.id <= bookmarks.id
      ) WHERE sortOrder = 0 OR sortOrder IS NULL
    `);
  });
});

app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/categories", categoriesRouter);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
