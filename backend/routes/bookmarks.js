import { Router } from "express";
import db from "../utils/db.js";

const router = Router();

// GET /api/bookmarks?search=&category=
router.get("/", (req, res) => {
  const { search, category } = req.query;

  let sql = `
    SELECT b.*, c.name as category
    FROM bookmarks b
    LEFT JOIN categories c ON b.categoryId = c.id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += ` AND (b.title LIKE ? OR b.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    sql += ` AND b.categoryId = ?`;
    params.push(category);
  }

  sql += ` ORDER BY b.sortOrder ASC, b.createdAt DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ bookmarks: rows });
  });
});

// POST /api/bookmarks
router.post("/", (req, res) => {
  const { title, url, description, categoryId } = req.body;

  if (!title || !url) {
    return res.status(400).json({ error: "Title and URL required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // Insert at top (sortOrder = 0, shift others down)
  db.serialize(() => {
    db.run(`UPDATE bookmarks SET sortOrder = sortOrder + 1`);
    db.run(
      `INSERT INTO bookmarks (title, url, description, categoryId, sortOrder) VALUES (?, ?, ?, ?, 0)`,
      [title, url, description || null, categoryId || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get(
          `SELECT b.*, c.name as category FROM bookmarks b LEFT JOIN categories c ON b.categoryId = c.id WHERE b.id = ?`,
          [this.lastID],
          (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json(row);
          }
        );
      }
    );
  });
});

// PUT /api/bookmarks/reorder  — must be declared BEFORE /:id
router.put("/reorder", (req, res) => {
  const { order } = req.body; // [{ id, sortOrder }]
  if (!Array.isArray(order)) {
    return res.status(400).json({ error: "order array required" });
  }

  const stmt = db.prepare(`UPDATE bookmarks SET sortOrder = ? WHERE id = ?`);
  db.serialize(() => {
    order.forEach(({ id, sortOrder }) => stmt.run(sortOrder, id));
    stmt.finalize((err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Order updated" });
    });
  });
});

// PUT /api/bookmarks/:id
router.put("/:id", (req, res) => {
  const { title, url, description, categoryId } = req.body;
  const { id } = req.params;

  if (!title || !url) {
    return res.status(400).json({ error: "Title and URL required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const sql = `
    UPDATE bookmarks
    SET title = ?, url = ?, description = ?, categoryId = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [title, url, description || null, categoryId || null, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Bookmark not found" });

    db.get(
      `SELECT b.*, c.name as category FROM bookmarks b LEFT JOIN categories c ON b.categoryId = c.id WHERE b.id = ?`,
      [id],
      (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      }
    );
  });
});

// DELETE /api/bookmarks/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM bookmarks WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Bookmark not found" });
    res.json({ message: "Bookmark deleted" });
  });
});

export default router;
