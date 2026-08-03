// FORCED DNS RESOLVER FIX FOR WINDOWS/NODE NETWORKS
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import our task routes
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { initializeSocket } = require('./socket');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
initializeSocket(httpServer);
const PORT = process.env.PORT || 5000;

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean);

// Middleware
app.use(cors({
  origin(origin, callback) {
    // Allow non-browser tools (no Origin) and configured frontends
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Base Check Route
app.get('/', (req, res) => {
  res.send('TaskForge Backend API is running smoothly!');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'taskforge-api' });
});

// 🔗 LINK OUR TASK API ROUTES HERE
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chat', chatRoutes);

const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error('❌ CRITICAL ERROR: MONGO_URI is missing from your .env file!');
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(dbURI)
  .then(() => {
    console.log('🚀 Connected smoothly to MongoDB Atlas (TaskForge DB)!');
    httpServer.listen(PORT, () => console.log(`💻 Server is running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Database connection error layout:', err.message);
  });
