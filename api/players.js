const { kv } = require("@vercel/kv");

const AUTH_TOKEN = process.env.AUTH_TOKEN; // ตั้งค่าใน Vercel Project Settings -> Environment Variables
const KV_KEY = "player_data";

module.exports = async (req, res) => {
  // อนุญาตให้เว็บ frontend เรียกข้าม origin ได้
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, auth");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const token = req.headers["auth"];
    if (token !== AUTH_TOKEN) {
      return res.status(403).send("Forbidden");
    }

    const { count, players } = req.body || {};
    if (!Array.isArray(players) || typeof count !== "number") {
      return res.status(400).send("Bad Request: invalid payload");
    }

    const data = {
      count,
      players, // [{ name, xuid }]
      serverTime: req.body.serverTime || null,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(KV_KEY, data);
    return res.status(200).send("OK");
  }

  if (req.method === "GET") {
    const data = (await kv.get(KV_KEY)) || {
      count: 0,
      players: [],
      serverTime: null,
      updatedAt: null,
    };
    return res.status(200).json(data);
  }

  return res.status(405).send("Method Not Allowed");
};
