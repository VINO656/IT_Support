const Groq = require('groq-sdk');
const EventSource = require('eventsource');
global.EventSource = EventSource;

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_key' });

let mcpClient = null;

async function getMcpClient() {
  if (mcpClient) return mcpClient;
  const port = process.env.PORT || 5000;
  const transport = new SSEClientTransport(
    new URL(`http://127.0.0.1:${port}/mcp/sse?token=super_secret_token`)
  );
  
  mcpClient = new Client({ name: "it-support-client", version: "1.0.0" }, { capabilities: {} });
  await mcpClient.connect(transport);
  return mcpClient;
}

const processUserMessage = async (message, userId) => {
  try {
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'dummy_key') {
      return { text: `(Mock Mode) I am the AI IT Support Agent. You said: "${message}".` };
    }

    // 1. Connect to MCP Server
    const client = await getMcpClient();
    const toolsResult = await client.listTools();
    
    // Map tools by name so we can distribute them to different agents
    const allTools = toolsResult.tools.map(t => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.inputSchema }
    }));

    // Define Specialized Agent Tools
    const supportTools = allTools.filter(t => t.function.name === 'create_ticket');
    const infraTools = allTools.filter(t => t.function.name === 'check_system_status');

    // =========================================================================
    // MULTI-AGENT SYSTEM START
    // =========================================================================

    // AGENT 1: The Triage Agent (Router)
    // Goal: Determine which specialized agent should handle this request.
    console.log("🤖 [Agent 1: Triage] Analyzing request...");
    const triageResponse = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b', // Fast, small model is perfect for routing
      messages: [
        { 
          role: 'system', 
          content: "You are the Triage Agent. Your only job is to route requests. If the user is asking about a server, VPN, Email, or system being down, reply with exactly the word 'INFRA'. If the user has a general issue, needs hardware, software, or password help, reply with exactly the word 'SUPPORT'. Do not say anything else." 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1
    });

    const route = triageResponse.choices[0].message.content.trim().toUpperCase();
    console.log(`🔀 [Router] Handoff to -> ${route} AGENT`);

    // AGENT 2 & 3: The Specialized Agents
    let selectedTools;
    let systemPrompt;
    let agentName;

    if (route.includes('INFRA')) {
      agentName = "Infrastructure Agent";
      selectedTools = infraTools;
      systemPrompt = "You are the specialized Infrastructure Agent. Your job is to check system statuses for employees. Use your tool to check if systems are operational.";
    } else {
      // Default to Support Agent
      agentName = "IT Support Agent";
      selectedTools = supportTools;
      systemPrompt = "You are the specialized IT Support Agent. Your job is to help users with their general IT problems and create tickets for them using your tool if human intervention is needed.";
    }

    console.log(`🤖 [Agent 2: ${agentName}] Processing request...`);
    
    // The Specialist Agent now processes the user's message using ONLY its specific tools
    const specialistResponse = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b', // Could use a larger model here for complex reasoning
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      tools: selectedTools.length > 0 ? selectedTools : undefined,
      tool_choice: 'auto'
    });

    const responseMessage = specialistResponse.choices[0].message;

    // 3. Execute Tool if the Specialist decided to use one
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const call = responseMessage.tool_calls[0];
      const name = call.function.name;
      const args = JSON.parse(call.function.arguments);
      
      if (name === 'create_ticket') args.userId = userId;
      
      console.log(`🛠️ [${agentName}] Executing tool: ${name}`);
      const toolResult = await client.callTool({ name, arguments: args });
      
      return { 
        text: `[${agentName}] I took an action on your behalf: ${toolResult.content[0].text}` 
      };
    }

    return { text: `[${agentName}] ${responseMessage.content}` };

  } catch (error) {
    console.error('AI Service Error:', error);
    return { text: `Sorry, the Agent Swarm is currently offline. Error: ${error.message}` };
  }
};

module.exports = { processUserMessage };
