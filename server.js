import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";

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

app.post("/submit", submitDemo);
app.post("/api/submit", submitDemo);
app.post("/api/chat", chatHandler);

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
