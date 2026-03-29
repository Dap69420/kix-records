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
        `SELECT id, release_name, artist_names, cover_art_url, release_url, release_date::text AS release_date, created_at, updated_at
         FROM releases
        ORDER BY release_date DESC NULLS LAST, created_at DESC, id DESC`
      );
      return res.json({ ok: true, releases: result.rows });
    } catch (error) {
      console.error("List admin releases error:", error);
      return res.status(500).json({ ok: false, error: "Failed to fetch releases" });
    }
  }

  if (req.method === "POST") {
    const { releaseName, artistNames, coverArtUrl, releaseUrl, releaseDate } = req.body || {};
    const normalizedReleaseDate = (releaseDate || new Date().toISOString().slice(0, 10)).trim();

    if (!releaseName || !artistNames || !coverArtUrl || !releaseUrl) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO releases (release_name, artist_names, cover_art_url, release_url, release_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, release_name, artist_names, cover_art_url, release_url, release_date::text AS release_date, created_at, updated_at`,
        [releaseName.trim(), artistNames.trim(), coverArtUrl.trim(), releaseUrl.trim(), normalizedReleaseDate]
      );

      return res.status(201).json({ ok: true, release: result.rows[0] });
    } catch (error) {
      console.error("Create admin release error:", error);
      return res.status(500).json({ ok: false, error: "Failed to create release" });
    }
  }

  if (req.method === "PUT") {
    const { id, releaseName, artistNames, coverArtUrl, releaseUrl, releaseDate } = req.body || {};
    const releaseId = parseInt(id, 10);
    const normalizedReleaseDate = (releaseDate || new Date().toISOString().slice(0, 10)).trim();

    if (!releaseId || Number.isNaN(releaseId)) {
      return res.status(400).json({ ok: false, error: "Invalid release id" });
    }

    if (!releaseName || !artistNames || !coverArtUrl || !releaseUrl) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }

    try {
      const result = await pool.query(
        `UPDATE releases
         SET release_name = $1,
             artist_names = $2,
             cover_art_url = $3,
             release_url = $4,
             release_date = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, release_name, artist_names, cover_art_url, release_url, release_date::text AS release_date, created_at, updated_at`,
        [releaseName.trim(), artistNames.trim(), coverArtUrl.trim(), releaseUrl.trim(), normalizedReleaseDate, releaseId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ ok: false, error: "Release not found" });
      }

      return res.json({ ok: true, release: result.rows[0] });
    } catch (error) {
      console.error("Update admin release error:", error);
      return res.status(500).json({ ok: false, error: "Failed to update release" });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
