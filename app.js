const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const serversByPlace = new Map();
const SERVER_TTL_MS = 90 * 1000;

function cleanupExpiredServers() {
  const now = Date.now();

  for (const [placeId, servers] of serversByPlace.entries()) {
    for (const [jobId, server] of servers.entries()) {
      if (now - server.updatedAt > SERVER_TTL_MS) {
        servers.delete(jobId);
      }
    }

    if (servers.size === 0) {
      serversByPlace.delete(placeId);
    }
  }
}

setInterval(cleanupExpiredServers, 30 * 1000);

app.get("/", (req, res) => {
  res.send("YTTD backend is running");
});

app.post("/heartbeat", (req, res) => {
  const { placeId, jobId, playing, maxPlayers } = req.body || {};

  if (!placeId || !jobId) {
    return res.status(400).json({ error: "placeId and jobId are required" });
  }

  const placeKey = String(placeId);
  const jobKey = String(jobId);

  if (!serversByPlace.has(placeKey)) {
    serversByPlace.set(placeKey, new Map());
  }

  const servers = serversByPlace.get(placeKey);

  servers.set(jobKey, {
    placeId: placeKey,
    jobId: jobKey,
    playing: Number(playing) || 0,
    maxPlayers: Number(maxPlayers) || 0,
    updatedAt: Date.now(),
  });

  return res.json({ success: true });
});

app.get("/servers", (req, res) => {
  cleanupExpiredServers();

  const placeId = req.query.placeId;
  if (!placeId) {
    return res.status(400).json({ error: "placeId is required" });
  }

  const placeKey = String(placeId);
  const servers = serversByPlace.get(placeKey);

  if (!servers) {
    return res.json({ servers: [] });
  }

  return res.json({
    servers: Array.from(servers.values()).map((server) => ({
      jobId: server.jobId,
      playing: server.playing,
      maxPlayers: server.maxPlayers,
    })),
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});