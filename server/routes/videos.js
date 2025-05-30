const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Use a unique filename to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    // Log the file information for debugging
    console.log("Received file:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    // Accept more file types (including non-video files for testing)
    if (file.mimetype.startsWith('video/') || 
        file.originalname.toLowerCase().endsWith('.mov') ||
        file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/octet-stream') {
      console.log("File accepted:", file.originalname);
      cb(null, true);
    } else {
      console.log("File rejected:", file.originalname, file.mimetype);
      // Accept the request but skip the file - don't throw an error
      cb(null, false);
    }
  }
});

// Temporary placeholder for video processing
// In a real implementation, you would integrate with PosePython or another service
router.post('/process-video', upload.single('video'), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const { user_height_cm, quality, bike_type } = req.body;
    const videoFile = req.file;
    
    if (!videoFile) {
      console.log("No file was uploaded or file was rejected");
      // Return mock data even if file is missing (for testing purposes)
      return res.json(createMockResponse(bike_type, user_height_cm));
    }
    
    // Log received data
    console.log('Received video processing request:');
    console.log('File:', videoFile.filename);
    console.log('User height:', user_height_cm, 'cm');
    console.log('Quality:', quality);
    console.log('Bike type:', bike_type);
    
    // Forward the video to the PosePython service for analysis
    try {
      const formData = new FormData();
      formData.append('video', fs.createReadStream(videoFile.path));
      formData.append('user_height_cm', user_height_cm);
      formData.append('quality', quality || '40');
      
      console.log('Forwarding video to PosePython service...');
      console.log('Using user height for analysis:', user_height_cm, 'cm');
      
      // Send to the PosePython service (adjust URL as needed)
      const posePythonResponse = await axios.post(process.env.PYTHON_SERVER_URL || 'https://cyclofit-ai.grity.co/process-video', formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('Received response from PosePython service');
      
      // Add bike type to the response data
      const analysisResult = posePythonResponse.data;
      analysisResult.bike_type = bike_type || 'road';
      
      // Always remove large base64 data if key frames are available
      if (analysisResult.key_frames && analysisResult.key_frames.length > 0) {
        // Since we have key frames, we can safely remove the full video to save bandwidth
        delete analysisResult.video;
        
        // Limit key frames to 5-10 for reasonable performance
        if (analysisResult.key_frames.length > 10) {
          console.log(`Reducing key frames from ${analysisResult.key_frames.length} to 10`);
          analysisResult.key_frames = analysisResult.key_frames.slice(0, 10);
        }
      }
      
      // Delete the uploaded file after processing
      fs.unlinkSync(videoFile.path);
      
      // Send the response with optimized data
      res.json(analysisResult);
    } catch (error) {
      console.error('Error forwarding to PosePython:', error.message);
      // Fallback to mock response if PosePython service is unavailable
      console.log('Falling back to mock response');
      res.json(createMockResponse(bike_type, user_height_cm));
    }
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'Error processing video', details: error.message });
  }
});

// Helper function to create mock response
function createMockResponse(bike_type, user_height_cm) {
  // Default height if not provided
  const height = user_height_cm ? parseFloat(user_height_cm) : 175;
  
  // Calculate body measurements proportionally based on user height
  const torso_length = Math.round(height * 0.34);
  const femur_length = Math.round(height * 0.245);
  const lower_leg_length = Math.round(height * 0.22);
  const arm_length = Math.round(height * 0.40);
  
  console.log(`Creating mock response with user height: ${height}cm`);
  console.log(`Calculated body measurements: torso=${torso_length}cm, femur=${femur_length}cm, lower_leg=${lower_leg_length}cm, arm=${arm_length}cm`);
  
  return {
    message: 'Video processed successfully (mock response)',
    success: true,
    bike_type: bike_type || 'road',
    user_height_cm: height,
    
    // Fields expected by AnalysisFeedback.js
    max_angles: {
      hip_knee_ankle: 150,
      knee: 150,
      hip: 110,
      back_angle: 45
    },
    min_angles: {
      hip_knee_ankle: 70,
      knee: 70,
      hip: 65,
      back_angle: 40
    },
    body_lengths_cm: {
      torso_length: torso_length,
      femur_length: femur_length,
      lower_leg_length: lower_leg_length,
      arm_length: arm_length
    },
    recommendations: {
      general: [
        'Your saddle height appears to be optimal.',
        'Your reach appears slightly too extended. Consider shortening your stem by 10mm.'
      ],
      road_bike: {
        endurance: [
          'For endurance riding, your current position is good.',
          'Consider a slightly more upright position for longer rides.'
        ],
        aggressive: [
          'For aggressive riding, lower your handlebars by 1cm.',
          'Move your saddle forward by 5mm for a more aggressive position.'
        ]
      },
      time_trial: [
        'Lower your aero bars by 2cm for a more aerodynamic position.',
        'Move your saddle forward by 1cm to open up your hip angle.'
      ]
    },
    video: null,  // We're not sending back a video
    key_frames: null  // We're not sending back keyframes
  };
}

module.exports = router; 