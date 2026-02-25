import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages) {
    return res.status(400).json({ error: "Missing messages" });
  }

  const apiKey = process.env.SAMBANOVA_API_KEY;

  if (!apiKey) {
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
      return res.status(response.status).json({ error: "Failed to fetch from AI provider", details: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
