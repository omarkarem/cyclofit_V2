const express = require('express');
const router = express.Router();
const multer = require('multer');
const passport = require('passport');
const analysisController = require('../controllers/analysisController');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const fetch = require('node-fetch');
const FormData = require('form-data');

// Helper middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  // First try session-based authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  // If no session, try JWT token from Authorization header
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request - note that our token has 'id' as the identifier
    req.user = { _id: decoded.id };
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Configure multer for video uploads with increased size limit
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
    fieldSize: 200 * 1024 * 1024 // 200MB for text fields (in case of large base64 strings)
  },
  fileFilter: function (req, file, cb) {
    // Accept video file types
    if (file.mimetype.startsWith('video/') || 
        file.originalname.toLowerCase().endsWith('.mov') ||
        file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
  }
});

// Add configuration for the AI API endpoint
const AI_ANALYSIS_URL = process.env.PYTHON_SERVER_URL || 'https://cyclofit-ai.grity.co/process-video';

// Process video for analysis
router.post('/process', ensureAuthenticated, upload.single('video'), async (req, res) => {
  try {
    console.log('Video processing request received');
    
    // Get user info
    const userHeight = req.body.user_height_cm;
    const quality = req.body.quality || '100';
    const bikeType = req.body.bike_type || 'road';
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No video file provided' });
    }
    
    console.log(`Processing video analysis for user ${req.user._id}`);
    
    // Create a form data object to send to the AI server
    const aiFormData = new FormData();
    aiFormData.append('video', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    aiFormData.append('user_height_cm', userHeight);
    aiFormData.append('quality', quality);
    aiFormData.append('bike_type', bikeType);
    
    console.log(`Forwarding request to AI endpoint: ${AI_ANALYSIS_URL}`);
    
    // Forward the request to the AI analysis service
    const aiResponse = await fetch(AI_ANALYSIS_URL, {
      method: 'POST',
      body: aiFormData,
      headers: {
        ...aiFormData.getHeaders(),
      },
    });
    
    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`AI service error: ${aiResponse.status}`, errorText);
      return res.status(aiResponse.status).json({ 
        success: false, 
        error: `AI analysis service error: ${aiResponse.status}` 
      });
    }
    
    // Get the analysis result from the AI service
    const aiData = await aiResponse.json();
    console.log('AI analysis completed successfully');
    
    // Create a new Analysis record
    const analysis = await analysisController.saveAnalysis(
      req.user._id,
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      req.file.size,
      parseFloat(userHeight),
      bikeType,
      aiData
    );
    
    // Return the analysis result and the database ID
    return res.json({
      success: true,
      analysisId: analysis._id,
      analysisResult: aiData
    });
    
  } catch (error) {
    console.error('Error in video processing:', error);
    return res.status(500).json({
      success: false,
      error: `Video processing failed: ${error.message}`
    });
  }
});

// Get list of user's analyses
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const analyses = await analysisController.getUserAnalyses(req.user._id);
    res.json({ analyses });
  } catch (error) {
    console.error('Error getting analyses:', error);
    res.status(500).json({ error: 'Error getting analyses' });
  }
});

// Get specific analysis by ID
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const analysis = await analysisController.getAnalysisById(req.params.id, req.user._id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // Add a field to indicate which storage type is being used
    const storageType = 
      (analysis.originalVideo && analysis.originalVideo.s3Key) ? 's3' : 
      (analysis.originalVideo && analysis.originalVideo.filePath) ? 'local' : 
      'unknown';
    
    // Transform for client (add some helpful flags)
    const analysisData = analysis.toObject();
    analysisData.storageType = storageType;
    
    // Check for video availability using both fields
    analysisData.processed_video_available = !!analysis.processedVideo?.s3Key || !!analysis.processedVideo?.filePath;
    
    // Always include keyframe information
    analysisData.keyframes_available = Array.isArray(analysis.keyframes) && analysis.keyframes.length > 0;
    analysisData.keyframe_count = Array.isArray(analysis.keyframes) ? analysis.keyframes.length : 0;
    
    res.json({ analysis: analysisData });
  } catch (error) {
    console.error('Error getting analysis:', error);
    res.status(500).json({ error: 'Error getting analysis' });
  }
});

// Get processed video for an analysis
router.get('/:id/processed-video', ensureAuthenticated, async (req, res) => {
  try {
    const videoUrl = await analysisController.getVideoUrl(req.params.id, req.user._id, 'processed');
    
    // Redirect to the signed URL
    res.json({ url: videoUrl });
  } catch (error) {
    console.error('Error getting processed video:', error);
    res.status(500).json({ error: 'Error getting processed video', details: error.message });
  }
});

// Get original video for an analysis
router.get('/:id/original-video', ensureAuthenticated, async (req, res) => {
  try {
    const videoUrl = await analysisController.getVideoUrl(req.params.id, req.user._id, 'original');
    
    // Redirect to the signed URL
    res.json({ url: videoUrl });
  } catch (error) {
    console.error('Error getting original video:', error);
    res.status(500).json({ error: 'Error getting original video', details: error.message });
  }
});

// Get specific keyframe for an analysis
router.get('/:id/keyframes/:index', ensureAuthenticated, async (req, res) => {
  try {
    const keyframeUrl = await analysisController.getKeyframeUrl(
      req.params.id, 
      req.user._id,
      parseInt(req.params.index)
    );
    
    // Return the signed URL
    res.json({ url: keyframeUrl });
  } catch (error) {
    console.error('Error getting keyframe:', error);
    res.status(500).json({ error: 'Error getting keyframe', details: error.message });
  }
});

// Get all keyframes for an analysis
router.get('/:id/keyframes', ensureAuthenticated, async (req, res) => {
  try {
    const analysis = await analysisController.getAnalysisById(req.params.id, req.user._id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    if (!analysis.keyframes || analysis.keyframes.length === 0) {
      return res.status(404).json({ error: 'No keyframes available' });
    }
    
    // Generate signed URLs for all keyframes
    const keyframeUrls = await Promise.all(
      analysis.keyframes.map(async (keyframe, index) => {
        const url = await analysisController.getKeyframeUrl(req.params.id, req.user._id, index);
        return {
          url,
          timestamp: keyframe.timestamp || 0
        };
      })
    );
    
    res.json({ keyframes: keyframeUrls });
  } catch (error) {
    console.error('Error getting all keyframes:', error);
    res.status(500).json({ error: 'Error getting keyframes', details: error.message });
  }
});

// Delete an analysis
router.delete('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const deleted = await analysisController.deleteAnalysis(req.params.id, req.user._id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Analysis not found or already deleted' });
    }
    
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ error: 'Error deleting analysis' });
  }
});

// Mock function to generate sample analysis results
function mockAnalysisResults(userHeightCm, bikeType = 'road') {
  console.log('Using mock analysis results since PosePython service is unavailable');
  
  // Convert height to number
  const height = parseFloat(userHeightCm);
  
  // Calculate body measurements proportionally based on user height
  const torso_length = Math.round(height * 0.34);
  const femur_length = Math.round(height * 0.245);
  const lower_leg_length = Math.round(height * 0.22);
  const upper_arm_length = Math.round(height * 0.18);
  const forearm_length = Math.round(height * 0.14);
  
  // Generate a mock analysis ID
  const analysis_id = uuid.v4();
  
  return {
    analysis_id,
    max_angles: {
      hip_knee_ankle: 152,
      shoulder_elbow_wrist: 160,
      shoulder_hip_knee: 112,
      elbow_shoulder_hip: 68
    },
    min_angles: {
      hip_knee_ankle: 72,
      shoulder_elbow_wrist: 82,
      shoulder_hip_knee: 45,
      elbow_shoulder_hip: 60
    },
    body_lengths_cm: {
      torso_length,
      femur_length,
      lower_leg_length,
      upper_arm_length,
      forearm_length,
      measurement_method: 'estimated from height'
    },
    recommendations: {
      general: [
        {
          component: 'SADDLE HEIGHT',
          issue: 'Good position',
          action: 'No change needed',
          current: '145° knee extension',
          target: '140-148°',
          priority: 'low'
        },
        {
          component: 'HANDLEBAR HEIGHT',
          issue: 'Balanced road position',
          action: 'No change needed',
          current: '35° torso angle',
          target: '25-40°',
          priority: 'low'
        }
      ],
      road_bike: {
        endurance: [
          {
            component: 'HANDLEBAR HEIGHT',
            issue: 'Could be more comfortable',
            action: 'Raise handlebars by 10mm',
            current: '35° torso angle',
            target: '40-55°',
            priority: 'low'
          }
        ],
        aggressive: [
          {
            component: 'HANDLEBAR HEIGHT',
            issue: 'Could be more aerodynamic',
            action: 'Lower handlebars by 20mm',
            current: '35° torso angle',
            target: '15-25°',
            priority: 'low'
          }
        ]
      },
      time_trial: [
        {
          component: 'HANDLEBAR HEIGHT',
          issue: 'Not aerodynamic enough for TT',
          action: 'Lower handlebars/pads by 40mm',
          current: '35° torso angle',
          target: '5-15°',
          priority: 'high'
        }
      ]
    },
    // Don't include video data, but indicate it's "available"
    video_available: true,
    keyframe_count: 3
  };
}

// Status endpoint for debugging
router.get('/status/s3', ensureAuthenticated, async (req, res) => {
  try {
    const { s3Client } = require('../config/s3');
    const { ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
    
    // Check if we can list buckets
    const { Buckets } = await s3Client.send(new ListBucketsCommand({}));
    
    // Check our target bucket
    const bucketName = process.env.AWS_BUCKET_NAME;
    let objects = [];
    let bucketExists = Buckets.some(b => b.Name === bucketName);
    
    if (bucketExists) {
      // Try to list objects (limited to 10)
      const { Contents } = await s3Client.send(new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 10
      }));
      
      objects = Contents ? Contents.map(obj => ({
        key: obj.Key,
        size: obj.Size,
        lastModified: obj.LastModified
      })) : [];
    }
    
    res.json({
      success: true,
      s3Status: {
        connected: true,
        buckets: Buckets.map(b => b.Name),
        targetBucket: bucketName,
        bucketExists,
        recentObjects: objects
      }
    });
  } catch (error) {
    console.error('S3 status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      s3Status: {
        connected: false,
        errorCode: error.code || 'unknown',
        errorDetails: error.message
      }
    });
  }
});

// Test endpoint for video URL
router.get('/:id/test-video', ensureAuthenticated, async (req, res) => {
  try {
    const videoUrl = await analysisController.getVideoUrl(req.params.id, req.user._id, 'processed');
    
    // Try to fetch the video headers to verify it's accessible
    const fetch = require('node-fetch');
    const headResponse = await fetch(videoUrl, { method: 'HEAD' });
    
    const headers = {};
    headResponse.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    res.json({ 
      url: videoUrl,
      status: headResponse.status,
      headers: headers,
      accessible: headResponse.ok
    });
  } catch (error) {
    console.error('Error testing video:', error);
    res.status(500).json({ error: 'Error testing video', details: error.message });
  }
});

console.log('API URL:', process.env.REACT_APP_API_URL);

module.exports = router; 