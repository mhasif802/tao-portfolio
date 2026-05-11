import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

const TAOSTATS_API_KEY = process.env.TAOSTATS_API_KEY;
const COLDKEY = process.env.COLDKEY;
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

if (!TAOSTATS_API_KEY) {
  console.warn("WARNING: TAOSTATS_API_KEY is not set in environment variables.");
}

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get("/api/portfolio", async (req, res) => {
  if (!TAOSTATS_API_KEY || !COLDKEY) {
    return res.status(500).json({ error: "Server not configured. Set TAOSTATS_API_KEY and COLDKEY in environment variables." });
  }

  try {
    const url = `https://api.taostats.io/api/dtao/stake_balance/latest/v1?coldkey=${COLDKEY}&limit=50`;
    const response = await fetch(url, {
      headers: {
        Authorization: TAOSTATS_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `TaoStats API error: ${response.status}`, detail: text });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch from TaoStats.", detail: err.message });
  }
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
