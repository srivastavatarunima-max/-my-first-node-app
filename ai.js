const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🤖 CV Generator
async function generateCV(data) {
  const prompt = `
  Create a professional ATS-friendly CV.

  Name: ${data.name}
  Target Role: ${data.role}

  Make it structured, modern, and impactful.
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
}

// 🔎 Job Analyzer
async function analyzeJob(data) {
  const prompt = `
  Analyze this job description for fit with an ESG/Sustainability professional:

  Job:
  ${data.jobDescription}

  Return:
  - Match score (0-100)
  - Why it's a fit or not
  - CV improvement suggestions
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  return response.choices[0].message.content;
}

module.exports = { generateCV, analyzeJob };
