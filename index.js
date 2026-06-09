const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const axios = require("axios");
const cheerio = require("cheerio");

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
      "GET /jobs",
      "GET /auto-rank",
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

  }
});

// CV
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
// JOBS
app.get("/jobs", (req, res) => {

  try {

    const jobs = fs.readFileSync(
      "jobs.json",
      "utf8"
    );

    res.json(JSON.parse(jobs));

  } catch (error) {

    res.status(500).json({
      error: error.message
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

    const { jobs } = req.body;

    if (!jobs) {
      return res.status(400).json({
        error: "Please provide jobs in request body"
      });
    }

    const profile = fs.readFileSync(
      "profile.json",
      "utf8"
    );

    const cv = fs.readFileSync(
      "cv.txt",
      "utf8"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are an expert recruiter.

Candidate Profile:
${profile}

Candidate CV:
${cv}

Jobs:
${JSON.stringify(jobs)}

Evaluate each job.

For every job provide:

1. Match score out of 100
2. Why it matches
3. Missing skills
4. CV improvements
5. Priority ranking (High / Medium / Low)

Focus on:
- Consulting
- Business Transformation
- Digital Transformation
- Digital Analyst
- Business Analyst
- AI Governance
- AI Risk
- Data Analytics
- Program Management

Do NOT prioritize sustainability or ESG roles.

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

// AUTO RANK

app.get("/auto-rank", async (req, res) => {

  try {

    const profile = fs.readFileSync(
      "profile.json",
      "utf8"
    );

    const cv = fs.readFileSync(
      "cv.txt",
      "utf8"
    );

    const jobs = fs.readFileSync(
      "jobs.json",
      "utf8"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are an expert recruiter.

Candidate Profile:
${profile}

Candidate CV:
${cv}

Jobs:
${jobs}

For each job provide:

1. Match score out of 100
2. Why it matches
3. Missing skills
4. Priority ranking

Focus on:
- Consulting
- Business Transformation
- Digital Transformation
- Business Analyst
- Digital Analyst
- AI Governance
- AI Risk

Do not prioritize sustainability roles.
`;

    const result = await model.generateContent(prompt);

    res.json({
      success: true,
      result: result.response.text()
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.get("/refresh-jobs", async (req, res) => {

  try {

    const jobs = [

      {
        title: "Business Transformation Consultant",
        company: "PwC UAE",
        description: "Business transformation and analytics."
      },

      {
        title: "AI Governance Consultant",
        company: "KPMG UAE",
        description: "AI governance and AI risk."
      }

    ];

    fs.writeFileSync(
      "jobs.json",
      JSON.stringify(jobs, null, 2)
    );

    res.json({
      success: true,
      message: "Jobs refreshed"
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

app.get("/scrape-test", async (req, res) => {

  try {

    const response = await axios.get(
      "https://www.michaelpage.ae/jobs"
    );

    res.send(
      response.data.substring(0, 3000)
    );

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
