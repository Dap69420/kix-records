import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

const generateToken = (userId, username, role) => {
  return jwt.sign({ id: userId, username, role }, JWT_SECRET, { expiresIn: "7d" });
};

// Initialize database
const initializeDatabase = async () => {
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
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const {
    username,
    password,
    confirmPassword,
    securityQuestion,
    securityAnswer,
  } = req.body;

  if (!username || !password || !confirmPassword || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ ok: false, error: "Username must be 3-20 chars and only letters, numbers, underscore" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ ok: false, error: "Passwords do not match" });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: "Password must be at least 6 characters" });
  }

  try {
    // Initialize database
    await initializeDatabase();

    const userCheck = await pool.query("SELECT id FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ ok: false, error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedSecurityAnswer = securityAnswer.trim().toLowerCase();
    const hashedSecurityAnswer = await bcrypt.hash(normalizedSecurityAnswer, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password_hash, security_question, security_answer_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, role`,
      [username, hashedPassword, securityQuestion, hashedSecurityAnswer, "User"]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.username, user.role);

    return res.status(201).json({
      ok: true,
      message: "Account created successfully",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ ok: false, error: "Registration failed" });
  }
}
