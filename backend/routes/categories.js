import { Router } from "express";
import db from "../utils/db.js";

const router = Router();

// GET /api/categories
router.get("/", (req, res) => {
  const sql = `
    SELECT c.*, COUNT(b.id) as bookmarkCount
    FROM categories c
    LEFT JOIN bookmarks b ON b.categoryId = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ categories: rows });
  });
});

// POST /api/categories
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Category name required" });
  }

  db.run(`INSERT INTO categories (name) VALUES (?)`, [name.trim()], function (err) {
    if (err) {
      if (err.message.includes("UNIQUE")) {
        return res.status(409).json({ error: "Category already exists" });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, name: name.trim(), bookmarkCount: 0 });
  });
});

// DELETE /api/categories/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.get(`SELECT COUNT(*) as count FROM bookmarks WHERE categoryId = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row.count > 0) {
      return res.status(400).json({
        error: `Cannot delete: ${row.count} bookmark(s) are using this category. Reassign them first.`,
      });
    }

    db.run(`DELETE FROM categories WHERE id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Category not found" });
      res.json({ message: "Category deleted" });
    });
  });
});

export default router;
