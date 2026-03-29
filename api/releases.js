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
      `SELECT id, release_name, artist_names, cover_art_url, release_url, release_date::text AS release_date, created_at, updated_at
       FROM releases
       ORDER BY release_date DESC NULLS LAST, created_at DESC, id DESC`
    );

    return res.json({ ok: true, releases: result.rows });
  } catch (error) {
    console.error("List releases error:", error);
    return res.status(500).json({ ok: false, error: "Failed to fetch releases" });
  }
}
