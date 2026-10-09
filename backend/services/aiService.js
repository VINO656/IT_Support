const { GoogleGenAI } = require('@google/genai');
const Ticket = require('../models/Ticket');

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy_key' });

// Define tools (MCP concepts implemented as Gemini function calls)
const supportTools = [
  {
    name: 'create_ticket',
    description: 'Creates a new IT support ticket for the user if their issue requires human intervention or cannot be immediately resolved.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'A short summary of the issue' },
        description: { type: 'STRING', description: 'Detailed description of the problem' },
        priority: { type: 'STRING', description: 'Priority level: low, medium, high, critical' },
        category: { type: 'STRING', description: 'Category: Hardware, Software, Network, Access, General' }
      },
      required: ['title', 'description', 'priority', 'category']
    }
  },
  {
    name: 'check_system_status',
    description: 'Checks the current status of internal IT systems like VPN, Email, Intranet, or Cloud Services.',
    parameters: {
      type: 'OBJECT',
      properties: {
        systemName: { type: 'STRING', description: 'Name of the system to check (e.g. VPN, Email, Jira, AWS)' }
      },
      required: ['systemName']
    }
  }
];

const handleToolCall = async (toolCall, userId) => {
  const { name, args } = toolCall;
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
    // We check if API key is valid, otherwise mock it (for AWS free tier / easy testing)
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
      return { 
        text: `(Mock Mode - Add GEMINI_API_KEY in backend/.env) I am the AI IT Support Agent. You said: "${message}". I can help you check system statuses or create support tickets.` 
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: message,
      config: {
        systemInstruction: "You are a helpful AI IT Support Agent. Your goal is to solve employee IT problems. If you cannot solve it immediately, use the create_ticket tool. If they ask if a system is down, use the check_system_status tool.",
        tools: [{ functionDeclarations: supportTools }]
      }
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const toolResult = await handleToolCall(call, userId);
      
      // Return the result of the tool to the user (in a real app we might feed it back to LLM)
      return { text: `I took an action on your behalf: ${toolResult}` };
    }

    return { text: response.text };

  } catch (error) {
    console.error('AI Service Error:', error);
    return { text: 'Sorry, I am having trouble connecting to my AI brain right now.' };
  }
};

module.exports = { processUserMessage };
