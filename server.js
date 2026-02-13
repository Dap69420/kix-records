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
app.use(express.static(__dirname));

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

app.post("/submit", submitDemo);
app.post("/api/submit", submitDemo);

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
