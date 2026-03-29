import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const result = await pool.query(
      `SELECT id, badge, title, content, update_date, created_at, updated_at
       FROM site_updates
       ORDER BY created_at DESC, id DESC`
    );

    return res.json({ ok: true, updates: result.rows });
  } catch (error) {
    console.error("List updates error:", error);
    return res.status(500).json({ ok: false, error: "Failed to fetch updates" });
  }
}
