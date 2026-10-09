const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const Ticket = require('./models/Ticket');
const { sendTicketNotification } = require('./services/notificationService');

// Define the Server
const mcpServer = new Server(
  { name: "it-support-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Register Tools
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_ticket",
        description: "Creates a new IT support ticket for the user if their issue requires human intervention or cannot be immediately resolved.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
            category: { type: "string", enum: ["Hardware", "Software", "Network", "Access", "General"] }
          },
          required: ["userId", "title", "description", "priority", "category"]
        }
      },
      {
        name: "check_system_status",
        description: "Checks the current status of internal IT systems like VPN, Email, Intranet, or Cloud Services.",
        inputSchema: {
          type: "object",
          properties: {
            systemName: { type: "string" }
          },
          required: ["systemName"]
        }
      }
    ]
  };
});

// Handle Tool Execution
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "create_ticket") {
    const newTicket = new Ticket({
      userId: args.userId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      category: args.category,
      aiResolved: false
    });
    await newTicket.save();
    
    // Trigger real-time notification asynchronously
    sendTicketNotification(newTicket);
    
    return {
      content: [{ type: "text", text: `Ticket created successfully with ID: ${newTicket._id}. The IT team will review it shortly.` }]
    };
  } else if (name === "check_system_status") {
    const statuses = ['Operational', 'Degraded Performance', 'Partial Outage'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      content: [{ type: "text", text: `The current status of ${args.systemName} is: ${randomStatus}.` }]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

let transport = null;

// Express setup functions
const handleSse = async (req, res) => {
  // Simple authentication token check for our "Secure MCP Server" claim
  if (req.query.token !== 'super_secret_token') {
    return res.status(401).send('Unauthorized');
  }

  transport = new SSEServerTransport("/mcp/messages", res);
  await mcpServer.connect(transport);
};

const handleMessages = async (req, res) => {
  if (!transport) {
    return res.status(500).send("Session not initialized");
  }
  await transport.handlePostMessage(req, res);
};

module.exports = { handleSse, handleMessages };
