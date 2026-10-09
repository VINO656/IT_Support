require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { connectRedis } = require('./services/redisService');

const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const chatRoutes = require('./routes/chat');
const { handleSse, handleMessages } = require('./mcp');
const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/itsupport')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Redis connection
connectRedis();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/chat', chatRoutes);

// Secure MCP Endpoints
app.get('/mcp/sse', handleSse);
app.post('/mcp/messages', handleMessages);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
