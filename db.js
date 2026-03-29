import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text, params) => {
  return pool.query(text, params);
};

export const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50),
        email VARCHAR(255),
        password_hash VARCHAR(255) NOT NULL,
        security_question VARCHAR(255),
        security_answer_hash VARCHAR(255),
        role VARCHAR(20) DEFAULT 'User',
        legal_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question VARCHAR(255);");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer_hash VARCHAR(255);");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'User';");
    await pool.query("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx ON users ((LOWER(username))); ");
    await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
    await pool.query(
      "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('User', 'A&R', 'Admin'));"
    );

    await pool.query(`
      CREATE TABLE IF NOT EXISTS releases (
        id SERIAL PRIMARY KEY,
        release_name VARCHAR(255) NOT NULL,
        artist_names VARCHAR(255) NOT NULL,
        cover_art_url TEXT NOT NULL,
        release_url TEXT NOT NULL,
        release_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query("ALTER TABLE releases ADD COLUMN IF NOT EXISTS release_date DATE;");
    await pool.query("ALTER TABLE releases ALTER COLUMN release_date SET DEFAULT CURRENT_DATE;");
    await pool.query("UPDATE releases SET release_date = created_at::date WHERE release_date IS NULL;");
    await pool.query("ALTER TABLE releases ALTER COLUMN release_date SET NOT NULL;");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_updates (
        id SERIAL PRIMARY KEY,
        badge VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        update_date VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("✓ Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};

export default pool;
