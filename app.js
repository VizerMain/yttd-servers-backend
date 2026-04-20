const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("YTTD backend is running");
});

app.get("/servers", async (req, res) => {
  const placeId = req.query.placeId;

  if (!placeId) {
    return res.status(400).json({ error: "placeId is required" });
  }

  return res.json({
    servers: []
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});