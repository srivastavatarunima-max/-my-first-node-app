const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

dotenv.config();

const app = express();

app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// HOME
app.get("/", (req, res) => {
  res.send("🚀 Gemini AI Job Agent is LIVE");
});

// TEST
app.get("/test", (req, res) => {
  res.send("✅ Server is working correctly");
});

// ROUTES
app.get("/routes", (req, res) => {
  res.json({
    available_routes: [
      "GET /",
      "GET /test",
      "GET /routes",
      "GET /profile",
      "GET /cv",
      "GET /demo",
      "POST /rank-jobs"
    ]
  });
});

// PROFILE
app.get("/profile", (req, res) => {
  try {

    const profile = fs.readFileSync(
      "profile.json",
      "utf8"
    );

    res.json(JSON.parse(profile));

  } catch (error) {

    res.status(500).json({
      error: error.message
    });
// CV ROUTE

app.get("/cv", (req, res) => {

  try {

    const cv = fs.readFileSync(
      "cv.txt",
      "utf8"
    );

    res.json({
      cv: cv
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});
  }
});

// GEMINI TEST
app.get("/demo", async (req, res) => {

  try {

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(
      "Say hello to Tarunima and tell her her AI job agent is working."
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

// JOB RANKING
app.post("/rank-jobs", async (req, res) => {

  try {

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
You are an expert ESG and Sustainability recruiter.

Candidate CV:
${cv}

Jobs:
${JSON.stringify(jobs)}

For every job:

1. Give a score out of 100
2. Explain why it matches
3. Suggest CV improvements

Return the answer in a structured format.
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
