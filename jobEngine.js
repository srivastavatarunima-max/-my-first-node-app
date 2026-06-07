const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * CORE JOB RANKING ENGINE
 */
async function rankJobs(data) {
  const { cv, jobs } = data;

  const prompt = `
You are an expert career advisor AI.

TASK:
1. Compare CV with each job
2. Give match score (0-100)
3. Explain why match or not
4. Select TOP 10 jobs only
5. For each top job, suggest CV improvements

CV:
${cv}

JOBS:
${JSON.stringify(jobs, null, 2)}

Return STRICT JSON like:
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

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { rankJobs };
