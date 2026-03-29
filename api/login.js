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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { username, password, securityAnswer } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Username and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, username, password_hash, security_question, security_answer_hash, role FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid username or password" });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ ok: false, error: "Invalid username or password" });
    }

    if (!securityAnswer) {
      return res.json({
        ok: true,
        requiresSecurityQuestion: true,
        securityQuestion: user.security_question,
      });
    }

    const normalizedSecurityAnswer = securityAnswer.trim().toLowerCase();
    const isValidSecurityAnswer = await bcrypt.compare(normalizedSecurityAnswer, user.security_answer_hash || "");

    if (!isValidSecurityAnswer) {
      return res.status(401).json({ ok: false, error: "Invalid security answer" });
    }

    const token = generateToken(user.id, user.username, user.role || "User");

    return res.json({
      ok: true,
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, role: user.role || "User" },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ ok: false, error: "Login failed" });
  }
}
