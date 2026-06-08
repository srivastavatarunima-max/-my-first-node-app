const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
dotenv.config();

const app = express();

app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Home Page
app.get("/", (req, res) => {
  res.send("🚀 Gemini AI Job Agent is LIVE");
});

// Health Check
app.get("/test", (req, res) => {
  res.send("✅ Server is working correctly");
});

// Show Available Routes
app.get("/routes", (req, res) => {
  res.json({
    available_routes: [
      "GET /",
      "GET /test",
      "GET /routes",
      "GET /demo",
      "POST /rank-jobs"
    ]
  });
});

// Simple Gemini Test
app.get("/demo", async (req, res) => {
  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(
      "Say hello to Tarunima and tell her her AI agent is working."
    );

    res.json({
      success: true,
      result: result.response.text()
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

// Job Ranking Endpoint
app.post("/rank-jobs", async (req, res) => {

  try {

    console.log("BODY RECEIVED:", req.body);

    const { cv, jobs } = req.body;

    if (!cv || !jobs) {
      return res.status(400).json({
        error: "Please provide cv and jobs in request body"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are an expert career advisor.

CV:
${cv}

Jobs:
${JSON.stringify(jobs)}

For each job:

1. Give score out of 100
2. Explain the match
3. Suggest CV improvements

Return the response in a structured format.
`;

    const result = await model.generateContent(prompt);

    res.json({
      success: true,
      result: result.response.text()
    });

  } catch (error) {

    console.error("FULL ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
