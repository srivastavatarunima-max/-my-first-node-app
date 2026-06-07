const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const { generateCV, analyzeJob } = require("./ai");

const app = express();
app.use(bodyParser.json());

// 🟢 Health check
app.get("/", (req, res) => {
  res.send("AI Job Agent is running 🚀");
});

// 🤖 CV Generator (Option 1)
app.post("/generate-cv", async (req, res) => {
  const result = await generateCV(req.body);
  res.json({ cv: result });
});

// 🔎 Job Analyzer (Option 2)
app.post("/analyze-job", async (req, res) => {
  const result = await analyzeJob(req.body);
  res.json({ analysis: result });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
