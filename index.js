const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");
const { google } = require("googleapis");
const PDFDocument = require("pdfkit");

dotenv.config();
const serviceAccount = JSON.parse(
  process.env.GOOGLE_SERVICE_ACCOUNT
);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    "https://www.googleapis.com/auth/drive"
  ]
});

const drive = google.drive({
  version: "v3",
  auth
});

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
      "GET /hello-test",
      "GET /jobs-test",
      "GET /generate-cv",
      "GET /shortlist-jobs",
      "GET /best-jobs",
      "GET /scrape-test",
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

    const result =
  await model.generateContent(prompt);

const shortlistedJobs =
  result.response.text();

fs.writeFileSync(
  "shortlistedJobs.json",
  shortlistedJobs
);

res.json({
  success: true,
  message: "Shortlisted jobs saved",
  result: shortlistedJobs
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

app.get("/hello-test", (req, res) => {

  res.json({
    success: true,
    message: "Hello Tarunima"
  });

});

app.get("/scrape-test", async (req, res) => {

  try {

    console.log("STEP 1");

    const response = await axios.get(
      "https://www.michaelpage.ae/jobs",
      {
        timeout: 10000
      }
    );

    console.log("STEP 2");

    const $ = cheerio.load(response.data);

const jobs = [];

$("h1, h2, h3").each((i, element) => {

  const title = $(element).text().trim();

  if (
  title.length > 10 &&
  !title.includes("Job seekers") &&
  !title.includes("Employers") &&
  !title.includes("About") &&
  !title.includes("Contact") &&
  !title.includes("Search jobs") &&
  !title.includes("Filter")
) {
  jobs.push(title);
}

});

fs.writeFileSync(
  "jobs.json",
  JSON.stringify(jobs, null, 2)
);

res.json({
  success: true,
  message: "Jobs saved successfully",
  totalJobs: jobs.length
});

  } catch (error) {

    console.log("SCRAPE ERROR:");
    console.log(error.message);

    res.json({
      success: false,
      error: error.message
    });

  }

});

app.get("/shortlist-jobs", async (req, res) => {

  try {

    const jobs = fs.readFileSync(
      "jobs.json",
      "utf8"
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `
You are an expert recruiter.

Candidate:

Tarunima

Background:
- Deloitte
- Business Transformation
- Strategy
- Analytics
- AI Governance
- AI Risk
- MBA Finance and IT

Jobs:
${jobs}

For every job return:

1. Match Score
2. Decision:
   APPLY
   MAYBE
   SKIP

Rules:

APPLY:
Score 75+

MAYBE:
Score 60-74

SKIP:
Below 60

Return only JSON.

Example:

[
 {
   "title":"Business Transformation Consultant",
   "score":90,
   "decision":"APPLY"
 }
]
`;

    const result =
  await model.generateContent(prompt);

const shortlist =
  result.response.text();

fs.writeFileSync(
  "shortlistedJobs.json",
  shortlist
);

res.json({
  success: true,
  message: "Shortlist saved",
  result: shortlist
});

  } catch (error) {

    res.json({
      success: false,
      error: error.message
    });

  }

});

app.get("/best-jobs", (req, res) => {

  try {

    const shortlistedJobs = JSON.parse(
        fs.readFileSync(
          "shortlistedJobs.json",
          "utf8"
        )
      );

    const applyJobs = shortlistedJobs.filter(
        job => job.decision === "APPLY"
      );

    applyJobs.sort(
      (a, b) => b.score - a.score
    );

    res.json({
      success: true,
      bestJob: applyJobs[0]
    });

  } catch (error) {

    res.json({
      success: false,
      error: error.message
    });

  }

});
app.get("/jobs-test", (req, res) => {

  const jobs = fs.readFileSync(
    "jobs.json",
    "utf8"
  );

  res.send(jobs);

});

app.get("/generate-cv", async (req, res) => {

  try {

    const cv = fs.readFileSync(
      "cv.txt",
      "utf8"
    );

    const profile = fs.readFileSync(
      "profile.json",
      "utf8"
    );

    const jobs = JSON.parse(
      fs.readFileSync(
        "jobs.json",
        "utf8"
      )
    );

    const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});
    
   const shortlistedResult =
  await model.generateContent(`
You are an expert recruiter.

Candidate:
Tarunima

Background:
- Deloitte
- Business Transformation
- Strategy
- Analytics
- AI Governance
- AI Risk

Jobs:
${JSON.stringify(jobs)}

Select ONLY the single best job.

Return JSON only.

Example:

{
  "title":"Business Transformation Consultant",
  "score":95,
  "decision":"APPLY"
}
`);

const selectedJob =
  shortlistedResult.response.text();

    const prompt = `
You are an expert CV writer.

Candidate Profile:
${profile}

Current CV:
${cv}

Target Job:
${selectedJob}

Rewrite the CV to maximize match for this role.

Keep it professional.

Return only the revised CV.
`;

    const result = await model.generateContent(
      prompt
    );

    res.json({
      success: true,
      targetJob: selectedJob,
      tailoredCV: result.response.text()
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

app.get("/generate-all-cvs", async (req, res) => {
  
try {

  const shortlistedJobs = JSON.parse(
    fs.readFileSync(
      "shortlistedJobs.json",
      "utf8"
    )
  );
  const applyJobs = shortlistedJobs.filter(
    job => job.decision === "APPLY"
  );

  const cv = fs.readFileSync(
  "cv.txt",
  "utf8"
);

const profile = fs.readFileSync(
  "profile.json",
  "utf8"
);

const generatedCVs = [];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

for (const job of applyJobs) {

  const prompt = `
You are an expert CV writer.

Candidate Profile:
${profile}

Current CV:
${cv}

Target Job:
${JSON.stringify(job)}

Rewrite the CV to maximize match.

Return only the revised CV.
`;

  const result = await model.generateContent(
    prompt
  );

  generatedCVs.push({
    jobTitle: job.title,
    score: job.score,
    tailoredCV: result.response.text()
  });
const pdf = new PDFDocument();

const fileName =
  job.title.replace(/[^a-zA-Z0-9]/g, "_") +
  ".pdf";

pdf.pipe(
  fs.createWriteStream(fileName)
);

pdf.fontSize(12);

pdf.text(
  result.response.text()
);

pdf.end();
}

res.json({
  success: true,
  totalCVs: generatedCVs.length,
  generatedCVs
});

} catch (error) {

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
