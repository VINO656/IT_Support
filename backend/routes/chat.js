const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { processUserMessage } = require('../services/aiService');

const router = express.Router();

router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;
    
    // Process message through AI and MCP tools
    const reply = await processUserMessage(message, userId);
    
    res.json(reply);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
