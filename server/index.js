const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS configuration - update with your actual frontend domains
app.use(cors({
  origin: [
    'https://cyclofit.vercel.app',
    'http://localhost:3000',
    // Add any other frontend origins you need
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase JSON limit for large requests
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Increase timeout for large uploads
app.use(function(req, res, next) {
  res.setTimeout(600000); // 10 minute timeout
  next();
});

// ... existing middleware and routes 