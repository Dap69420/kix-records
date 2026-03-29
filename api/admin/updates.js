import pg from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const getAuthUser = (req) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_error) {
    return null;
  }
};

export default async function handler(req, res) {
  const authUser = getAuthUser(req);

  if (!authUser) {
    return res.status(401).json({ ok: false, error: "Authentication required" });
  }

  if (authUser.role !== "Admin") {
    return res.status(403).json({ ok: false, error: "Admin access required" });
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        `SELECT id, badge, title, content, update_date, created_at, updated_at
         FROM site_updates
         ORDER BY created_at DESC, id DESC`
      );
      return res.json({ ok: true, updates: result.rows });
    } catch (error) {
      console.error("List admin updates error:", error);
      return res.status(500).json({ ok: false, error: "Failed to fetch updates" });
    }
  }

  if (req.method === "POST") {
    const { badge, title, content, updateDate } = req.body || {};

    if (!badge || !title || !content || !updateDate) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO site_updates (badge, title, content, update_date)
         VALUES ($1, $2, $3, $4)
         RETURNING id, badge, title, content, update_date, created_at, updated_at`,
        [badge.trim(), title.trim(), content.trim(), updateDate.trim()]
      );

      return res.status(201).json({ ok: true, update: result.rows[0] });
    } catch (error) {
      console.error("Create admin update error:", error);
      return res.status(500).json({ ok: false, error: "Failed to create update" });
    }
  }

  if (req.method === "PUT") {
    const { id, badge, title, content, updateDate } = req.body || {};
    const updateId = parseInt(id, 10);

    if (!updateId || Number.isNaN(updateId)) {
      return res.status(400).json({ ok: false, error: "Invalid update id" });
    }

    if (!badge || !title || !content || !updateDate) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    try {
      const result = await pool.query(
        `UPDATE site_updates
         SET badge = $1,
             title = $2,
             content = $3,
             update_date = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, badge, title, content, update_date, created_at, updated_at`,
        [badge.trim(), title.trim(), content.trim(), updateDate.trim(), updateId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ ok: false, error: "Update not found" });
      }

      return res.json({ ok: true, update: result.rows[0] });
    } catch (error) {
      console.error("Update admin update error:", error);
      return res.status(500).json({ ok: false, error: "Failed to update update" });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
