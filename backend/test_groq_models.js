require('dotenv').config({ path: 'C:/Users/VINS/.gemini/antigravity-ide/scratch/ai-it-support-agent/backend/.env' });
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  const models = await groq.models.list();
  console.log(models.data.map(m => m.id));
}
test();
