const Groq = require('groq-sdk');
const Ticket = require('../models/Ticket');

// Initialize Groq API
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

// Define tools (OpenAI format for Groq)
const supportTools = [
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Creates a new IT support ticket for the user if their issue requires human intervention or cannot be immediately resolved.',
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
  },
  {
    type: 'function',
    function: {
      name: 'check_system_status',
      description: 'Checks the current status of internal IT systems like VPN, Email, Intranet, or Cloud Services.',
      parameters: {
        type: 'object',
        properties: {
          systemName: { type: 'string', description: 'Name of the system to check (e.g. VPN, Email, Jira, AWS)' }
        },
        required: ['systemName']
      }
    }
  }
];

const handleToolCall = async (toolCall, userId) => {
  const name = toolCall.function.name;
  const args = JSON.parse(toolCall.function.arguments);

  if (name === 'create_ticket') {
    const newTicket = new Ticket({
      userId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      category: args.category,
      aiResolved: false
    });
    await newTicket.save();
    return `Ticket created successfully with ID: ${newTicket._id}. The IT team will review it shortly.`;
  } else if (name === 'check_system_status') {
    // Mock system status check
    const statuses = ['Operational', 'Degraded Performance', 'Partial Outage'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return `The current status of ${args.systemName} is: ${randomStatus}.`;
  }
  return 'Unknown tool called.';
};

const processUserMessage = async (message, userId) => {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy_key') {
      return { 
        text: `(Mock Mode - Add GROQ_API_KEY in backend/.env) I am the AI IT Support Agent. You said: "${message}". I can help you check system statuses or create support tickets.` 
      };
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: "You are a helpful AI IT Support Agent. Your goal is to solve employee IT problems. If you cannot solve it immediately, use the create_ticket tool. If they ask if a system is down, use the check_system_status tool." },
        { role: 'user', content: message }
      ],
      tools: supportTools,
      tool_choice: 'auto'
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const call = responseMessage.tool_calls[0];
      const toolResult = await handleToolCall(call, userId);
      
      return { text: `I took an action on your behalf: ${toolResult}` };
    }

    return { text: responseMessage.content };

  } catch (error) {
    console.error('AI Service Error:', error);
    return { text: 'Sorry, I am having trouble connecting to my AI brain right now.' };
  }
};

module.exports = { processUserMessage };
