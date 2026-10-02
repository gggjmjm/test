const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_TOKEN = process.env.AUTH_TOKEN || "vSGm05Pzjn"; // แนะนำให้ตั้งใน .env แทนการ hardcode

app.use(express.json());
app.use(cors()); // ให้เว็บ frontend ดึงข้อมูลข้าม origin ได้ (ปรับให้ระบุ origin เฉพาะได้ถ้าต้องการความปลอดภัยเพิ่ม)

let currentData = { count: 0, players: [], updatedAt: null };

// จำกัดจำนวนคำขอ กันสแปม/โจมตี
const requestLog = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const last = requestLog.get(ip) || 0;
  if (now - last < 200) { // กันยิงถี่เกิน 5 ครั้ง/วินาทีต่อ IP
    return res.status(429).send("Too Many Requests");
  }
  requestLog.set(ip, now);
  next();
}

app.post("/api/players", rateLimit, (req, res) => {
  const token = req.headers["auth"];
  if (token !== AUTH_TOKEN) return res.status(403).send("Forbidden");

  const { count, players } = req.body || {};

  // ตรวจสอบข้อมูลก่อนบันทึก กันข้อมูลผิดรูปแบบทำให้ frontend พัง
  if (!Array.isArray(players) || typeof count !== "number") {
    return res.status(400).send("Bad Request: invalid payload");
  }

  currentData = {
    count,
    players,
    updatedAt: new Date().toISOString(),
  };
  res.sendStatus(200);
});

app.get("/api/players", (req, res) => {
  res.json(currentData);
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
