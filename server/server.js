const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Set default environment for development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Check required env variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'AWS_BUCKET_NAME',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

// Verify S3 connection
const { s3Client } = require('./config/s3');
const { ListBucketsCommand } = require('@aws-sdk/client-s3');

async function verifyS3Connection() {
  try {
    console.log('Verifying S3 connection...');
    const command = new ListBucketsCommand({});
    const { Buckets } = await s3Client.send(command);
    console.log('S3 Connection successful. Available buckets:', Buckets.map(b => b.Name).join(', '));
    
    // Check if our bucket exists
    if (!Buckets.some(b => b.Name === process.env.AWS_BUCKET_NAME)) {
      console.warn(`Warning: Bucket '${process.env.AWS_BUCKET_NAME}' not found in your account!`);
    } else {
      console.log(`Bucket '${process.env.AWS_BUCKET_NAME}' found and accessible.`);
    }
  } catch (error) {
    console.error('S3 Connection failed:', error.message);
    console.error('Please check your AWS credentials and permissions.');
  }
}

verifyS3Connection();

// Clean up uploads directory if it exists (since we're using S3 now)
const uploadsPath = path.join(__dirname, 'uploads');
if (fs.existsSync(uploadsPath)) {
  try {
    console.log('Removing legacy uploads directory...');
    fs.rm(uploadsPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Error removing uploads directory:', err);
      } else {
        console.log('Uploads directory removed successfully.');
      }
    });
  } catch (err) {
    console.error('Error removing uploads directory:', err);
  }
}

require('./config/passport');

const app = express();

// CORS - Put this FIRST before ANY other middleware
app.use(cors({
  origin: ['https://cyclofit.grity.co', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rest of middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for legacy paths during migration period)
app.use('/static', express.static(path.join(__dirname)));
console.log('Static file server enabled for legacy video paths');

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-setup', require('./routes/adminSetup')); // TEMPORARY - Remove after admin creation

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    msg: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 