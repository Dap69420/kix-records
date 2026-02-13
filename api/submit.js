import fetch from "node-fetch";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || "";
  if (!webhookUrl) {
    res.status(500).json({ ok: false, error: "Webhook not configured" });
    return;
  }

  const payload = {
    legalName: req.body.legalName || "",
    releaseTitle: req.body.releaseTitle || "",
    artists: req.body.artists || [],
    email: req.body.email || "",
    links: req.body.links || "",
    bio: req.body.bio || "",
  };

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
      res.status(500).json({ ok: false, error: errorText });
      return;
    }

    res.json({ ok: true, ticketId });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Webhook error" });
  }
}
