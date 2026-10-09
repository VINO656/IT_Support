require('dotenv').config({ path: 'C:/Users/VINS/.gemini/antigravity-ide/scratch/ai-it-support-agent/backend/.env' });
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supportTools = [
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Creates a new IT support ticket.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'A short summary of the issue' },
          description: { type: 'string', description: 'Detailed description of the problem' },
          priority: { type: 'string', description: 'Priority level: low, medium, high, critical' },
          category: { type: 'string', description: 'Category: Hardware, Software, Network, Access, General' }
        },
        required: ['title', 'description', 'priority', 'category']
      }
    }
  }
];

async function test() {
  try {
    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: "You are a helpful AI IT Support Agent." },
        { role: 'user', content: "My office printer is jammed and I need someone to fix it, please create a ticket" }
      ],
      tools: supportTools,
      tool_choice: 'auto'
    });
    console.log("Success:");
    console.log(response.choices[0].message);
  } catch (error) {
    console.error("Error:");
    console.error(error);
  }
}
test();
