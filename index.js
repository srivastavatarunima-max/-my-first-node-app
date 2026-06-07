const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(bodyParser.json());

/**
 * ✅ TEST ROUTE (CHECK IF SERVER WORKS)
 */
app.get("/", (req, res) => {
  res.send("AI Job Ranking Engine is LIVE 🚀");
});

/**
 * ✅ TEST ROUTE FOR DEBUGGING POSTMAN
 */
app.get("/rank-jobs", (req, res) => {
  res.send("Rank Jobs endpoint exists. Use POST request.");
});

/**
 * 🤖 MAIN AI JOB RANKING ENGINE
 */
app.post("/rank-jobs", async (req, res) => {
  try {
    const { cv, jobs } = req.body;

    const prompt = `
You are an expert career advisor AI.

TASK:
- Compare CV with job descriptions
- Score each job 0–100
- Select TOP matching jobs
- Explain why

CV:
${cv}

Jobs:
${JSON.stringify(jobs)}

Return JSON:
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
      result: response.choices[0].message.content
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
