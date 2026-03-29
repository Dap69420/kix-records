import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const releaseColumns = await pool.query(
  "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='releases' ORDER BY ordinal_position"
);

const recentReleases = await pool.query(
  "SELECT id, release_name, release_date, created_at FROM releases ORDER BY id DESC LIMIT 5"
);

const recentUpdates = await pool.query(
  "SELECT id, title, update_date, created_at FROM site_updates ORDER BY id DESC LIMIT 5"
);

console.log("RELEASE_COLUMNS", releaseColumns.rows);
console.log("RECENT_RELEASES", recentReleases.rows);
console.log("RECENT_UPDATES", recentUpdates.rows);

await pool.end();
