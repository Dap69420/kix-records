import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initializeDatabase, query as dbQuery } from "./db.js";
import { authenticateToken, generateToken } from "./auth.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "Admin") {
    return res.status(403).json({ ok: false, error: "Admin access required" });
  }
  next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const clip = (value, max) => {
  if (!value) {
    return "";
  }
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
};

const getRandomColor = () => {
  return Math.floor(Math.random() * 16777215);
};

const generateTicketId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const generateSegment = () => {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return segment;
  };
  return `DEMO-${generateSegment()}-${generateSegment()}`;
};

const submitDemo = async (req, res) => {
  if (!webhookUrl) {
    return res.status(500).json({ ok: false, error: "Webhook not configured" });
  }

  const payload = {
    legalName: req.body.legalName || "",
    releaseTitle: req.body.releaseTitle || "",
    artists: req.body.artists || [],
    email: req.body.email || "",
    links: req.body.links || "",
    bio: req.body.bio || "",
  };

  // Format artists with their Spotify links for the embed
  const formatArtists = () => {
    if (!Array.isArray(payload.artists) || payload.artists.length === 0) {
      return "-";
    }
    return payload.artists
      .map((artist) => {
        if (artist.spotify) {
          return `${artist.name}: ${artist.spotify}`;
        }
        return artist.name;
      })
      .join("\n");
  };

  try {
    const ticketId = generateTicketId();
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "KIX RECORDS Demo Intake",
        embeds: [
          {
            title: "New Demo Submission",
            description: `A fresh submission just landed in the intake queue.\n**Ticket ID: \`\`\`${ticketId}\`\`\`**`,
            color: getRandomColor(),
            fields: [
              { name: "Account", value: clip(req.user?.username || "unknown", 1024), inline: true },
              { name: "Role", value: clip(req.user?.role || "User", 1024), inline: true },
              { name: "Legal Name", value: clip(payload.legalName, 1024) || "-", inline: true },
              { name: "Release Title", value: clip(payload.releaseTitle, 1024) || "-", inline: true },
              { name: "Artists", value: formatArtists(), inline: false },
              { name: "Email", value: clip(payload.email, 1024) || "-", inline: true },
              { name: "Demo Link", value: clip(payload.links, 1024) || "-", inline: false },
              ...(payload.bio ? [{ name: "Message", value: clip(payload.bio, 1024), inline: false }] : []),
            ],
            footer: { text: "KIX RECORDS · Demo Intake" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ ok: false, error: errorText });
    }

    return res.json({ ok: true, ticketId });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "Webhook error" });
  }
};

const listReleasesHandler = async (_req, res) => {
  try {
    const result = await dbQuery(
      `SELECT id, release_name, artist_names, cover_art_url, release_url, release_date::text AS release_date, created_at, updated_at
       FROM releases
       ORDER BY release_date DESC NULLS LAST, created_at DESC, id DESC`
    );
    return res.json({ ok: true, releases: result.rows });
  } catch (error) {
    console.error("List releases error:", error);
    return res.status(500).json({ ok: false, error: "Failed to fetch releases" });
  }
};

const listUpdatesHandler = async (_req, res) => {
  try {
    const result = await dbQuery(
      `SELECT id, badge, title, content, update_date, created_at, updated_at
       FROM site_updates
       ORDER BY created_at DESC, id DESC`
    );
    return res.json({ ok: true, updates: result.rows });
  } catch (error) {
    console.error("List updates error:", error);
    return res.status(500).json({ ok: false, error: "Failed to fetch updates" });
  }
};

const adminCreateReleaseHandler = async (req, res) => {
  const { releaseName, artistNames, coverArtUrl, releaseUrl, releaseDate } = req.body;
  const normalizedReleaseDate = (releaseDate || new Date().toISOString().slice(0, 10)).trim();

  if (!releaseName || !artistNames || !coverArtUrl || !releaseUrl) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  try {
    const result = await dbQuery(
      `INSERT INTO releases (release_name, artist_names, cover_art_url, release_url, release_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, release_name, artist_names, cover_art_url, release_url, release_date::text AS release_date, created_at, updated_at`,
      [releaseName.trim(), artistNames.trim(), coverArtUrl.trim(), releaseUrl.trim(), normalizedReleaseDate]
    );

    return res.status(201).json({ ok: true, release: result.rows[0] });
  } catch (error) {
    console.error("Create release error:", error);
    return res.status(500).json({ ok: false, error: "Failed to create release" });
  }
};

const adminUpdateReleaseHandler = async (req, res) => {
  const releaseId = parseInt(req.params.id || req.body.id, 10);
  const { releaseName, artistNames, coverArtUrl, releaseUrl, releaseDate } = req.body;
  const normalizedReleaseDate = (releaseDate || new Date().toISOString().slice(0, 10)).trim();

  if (!releaseId || Number.isNaN(releaseId)) {
    return res.status(400).json({ ok: false, error: "Invalid release id" });
  }

  if (!releaseName || !artistNames || !coverArtUrl || !releaseUrl) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  try {
    const result = await dbQuery(
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
    console.error("Update release error:", error);
    return res.status(500).json({ ok: false, error: "Failed to update release" });
  }
};

const adminCreateUpdateHandler = async (req, res) => {
  const { badge, title, content, updateDate } = req.body;

  if (!badge || !title || !content || !updateDate) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  try {
    const result = await dbQuery(
      `INSERT INTO site_updates (badge, title, content, update_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, badge, title, content, update_date, created_at, updated_at`,
      [badge.trim(), title.trim(), content.trim(), updateDate.trim()]
    );

    return res.status(201).json({ ok: true, update: result.rows[0] });
  } catch (error) {
    console.error("Create update error:", error);
    return res.status(500).json({ ok: false, error: "Failed to create update" });
  }
};

const adminUpdateUpdateHandler = async (req, res) => {
  const updateId = parseInt(req.params.id || req.body.id, 10);
  const { badge, title, content, updateDate } = req.body;

  if (!updateId || Number.isNaN(updateId)) {
    return res.status(400).json({ ok: false, error: "Invalid update id" });
  }

  if (!badge || !title || !content || !updateDate) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  try {
    const result = await dbQuery(
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
    console.error("Update update error:", error);
    return res.status(500).json({ ok: false, error: "Failed to update update" });
  }
};

const chatHandler = async (req, res) => {
  const { messages } = req.body;
  
  if (!messages) {
    return res.status(400).json({ error: "Missing messages" });
  }

  const apiKey = process.env.SAMBANOVA_API_KEY;

  if (!apiKey) {
    console.error("SAMBANOVA_API_KEY is missing");
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-8B-Instruct",
        messages: [
          { 
            role: "system", 
            content: `You are the official AI assistant for KIX RECORDS, a new independent label owned by KIXIA (the producer behind Homage Funk) that launched in 2026. Your job is to answer visitor questions accurately.

CRITICAL RULES:
1.  **Demo Submissions:** We ONLY accept demos via the "Submit Demo" tab on our website or through our Discord server. NEVER suggest email for submissions. WE DO NOT ACCEPT DEMOS VIA EMAIL.
2.  **Submission Guidelines:** 
    - Streaming links (SoundCloud private or Dropbox) only. No file attachments.
    - 1-3 tracks max per demo.
    - Include stage name, city, and production credits.
    - No unsolicited remixes or samples.
3.  **Response Time:** We review demos regularly. If interested, we follow up within 1 week.
4.  **Releases:**
    - MONTAGEM RESADA by serii$, TXMZ, DJ AKKING (Feb 2026)
    - FUNK INFERON by ARDEST (Feb 2026)
    - MONTAGEM PASAA by SRULX, RKZZ (Feb 2026)
    - LIGHT by AIRMAIL (Feb 2026)
    - MONTAGEM VOZES SENTAR by ARDEST (Feb 2026)
    - VEM CHEGANDO by felzx & Xulf Killa (Feb 2026) - Not on Spotify, check YouTube/SoundCloud.
5.  **Socials:** 
    - Discord: https://discord.gg/raPDZy4qnE (Best place for updates)
    - YouTube: https://www.youtube.com/@kixrecords
    - We are also on Spotify, SoundCloud, and Instagram.

FORMATTING:
- Use bullet points for lists.
- Use **bold** for emphasis.
- Keep responses concise.

If you don't know the answer, say "I don't have that information right now, but you can always ask in our Discord!"` 
          },
          ...messages
        ],
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SambaNova API Error:", errorText);
      return res.status(500).json({ error: "AI provider error", details: errorText });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Chat Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Auth handler for register
const registerHandler = async (req, res) => {
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
    const userCheck = await dbQuery("SELECT id FROM users WHERE LOWER(username) = LOWER($1)", [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ ok: false, error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedSecurityAnswer = securityAnswer.trim().toLowerCase();
    const hashedSecurityAnswer = await bcrypt.hash(normalizedSecurityAnswer, 10);

    const result = await dbQuery(
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
};

// Auth handler for login
const loginHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { username, password, securityAnswer } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, error: "Username and password are required" });
  }

  try {
    const result = await dbQuery(
      "SELECT id, username, password_hash, security_question, security_answer_hash, role FROM users WHERE LOWER(username) = LOWER($1)",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid username, password, or security answer" });
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
};

// Routes
app.post("/api/register", registerHandler);
app.post("/api/login", loginHandler);
app.post("/submit", authenticateToken, submitDemo);
app.post("/api/submit", authenticateToken, submitDemo);
app.post("/api/chat", chatHandler);
app.get("/api/releases", listReleasesHandler);
app.get("/api/updates", listUpdatesHandler);
app.get("/api/admin/releases", authenticateToken, requireAdmin, listReleasesHandler);
app.post("/api/admin/releases", authenticateToken, requireAdmin, adminCreateReleaseHandler);
app.put("/api/admin/releases", authenticateToken, requireAdmin, adminUpdateReleaseHandler);
app.put("/api/admin/releases/:id", authenticateToken, requireAdmin, adminUpdateReleaseHandler);
app.get("/api/admin/updates", authenticateToken, requireAdmin, listUpdatesHandler);
app.post("/api/admin/updates", authenticateToken, requireAdmin, adminCreateUpdateHandler);
app.put("/api/admin/updates", authenticateToken, requireAdmin, adminUpdateUpdateHandler);
app.put("/api/admin/updates/:id", authenticateToken, requireAdmin, adminUpdateUpdateHandler);

if (process.env.VERCEL !== "1") {
  // Initialize database
  initializeDatabase()
    .catch(error => {
      console.error("Failed to initialize database:", error);
      process.exit(1);
    });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
