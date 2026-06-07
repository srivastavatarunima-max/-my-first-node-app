const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
app.use(bodyParser.json());

// -------------------------------
// BASIC HEALTH CHECK
// -------------------------------
app.get("/", (req, res) => {
  res.send("🚀 AI Job Agent is LIVE");
});

// -------------------------------
// DEBUG: CHECK IF SERVER WORKING
// -------------------------------
app.get("/test", (req, res) => {
  res.send("✅ Server is working correctly");
});

// -------------------------------
// DEBUG: SEE ALL AVAILABLE ROUTES
// -------------------------------
app.get("/routes", (req, res) => {
  res.json({
    status: "RUNNING",
    available_routes: [
      "GET /",
      "GET /test",
      "GET /routes",
      "POST /rank-jobs"
    ]
  });
});

// -------------------------------
// AI JOB RANKING (MAIN FEATURE)
// -------------------------------
app.post("/rank-jobs", async (req, res) => {
  try {
    const { cv, jobs } = req.body;

    if (!cv || !jobs) {
      return res.status(400).json({
        error: "Please provide cv and jobs in request body"
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const prompt = `
You are an expert AI career assistant.

TASK:
- Match CV with jobs
- Score each job (0–100)
- Rank top matches
- Explain reasoning
- Suggest CV improvements

CV:
${cv}

JOBS:
${JSON.stringify(jobs, null, 2)}

Return ONLY valid JSON:
{
  "ranked_jobs": [
    {
      "title": "",
      "score": 0,
      "reason": "",
      "cv_changes": ""
    }
  ]
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({
      success: true,
      result: response.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// -------------------------------
// START SERVER
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
