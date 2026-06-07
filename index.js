const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { rankJobs } = require("./jobEngine");

const app = express();
app.use(bodyParser.json());

// health check
app.get("/", (req, res) => {
  res.send("AI Job Ranking Engine is running 🚀");
});

/**
 * INPUT:
 * {
 *   "cv": "...text...",
 *   "jobs": [
 *     { "title": "", "description": "" }
 *   ]
 * }
 */
app.post("/rank-jobs", async (req, res) => {
  try {
    const result = await rankJobs(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
