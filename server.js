const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "vSGm05Pzjn"; // ควรตั้งใน .env จริง ไม่ควร hardcode

app.use(express.json());
app.use(cors()); // เปิดให้เว็บ frontend เรียกข้าม origin ได้ (จำกัด origin เฉพาะได้ถ้าต้องการ)

let currentData = { count: 0, players: [], serverTime: null, updatedAt: null };

// กันสแปม/โจมตี
const lastHit = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  if (now - (lastHit.get(ip) || 0) < 200) return res.status(429).send("Too Many Requests");
  lastHit.set(ip, now);
  next();
}

app.post("/api/players", rateLimit, (req, res) => {
  if (req.headers["auth"] !== AUTH_TOKEN) return res.status(403).send("Forbidden");

  const { count, players } = req.body || {};
  if (!Array.isArray(players) || typeof count !== "number") {
    return res.status(400).send("Bad Request: invalid payload");
  }

  currentData = {
    count,
    players, // [{ name, xuid }]
    serverTime: req.body.serverTime || null,
    updatedAt: new Date().toISOString(),
  };
  res.sendStatus(200);
});

app.get("/api/players", (req, res) => {
  res.json(currentData);
});

app.get("/health", (req, res) => res.send("OK"));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
