// FORCED DNS RESOLVER FIX FOR WINDOWS/NODE NETWORKS
const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('TaskForge Backend API is running smoothly!');
});

const dbURI = process.env.MONGO_URI;

if (!dbURI) {
  console.error("❌ CRITICAL ERROR: MONGO_URI is missing from your .env file!");
  process.exit(1);
}

// Connect to MongoDB Atlas
mongoose.connect(dbURI)
  .then(() => {
    console.log('🚀 Connected smoothly to MongoDB Atlas (TaskForge DB)!');
    app.listen(PORT, () => console.log(`💻 Server is running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database connection error layout:', err.message);
  });