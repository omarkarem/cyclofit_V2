const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../middlewares/uploadMiddleware');
const { uploadToS3, getSignedUrl } = require('../services/s3Service');
const Analysis = require('../models/analysis');
const { processVideoWithMediaPipe } = require('../services/mediaPipeService');

router.post('/', uploadMiddleware, async (req, res) => {
  try {
    // Extract data from the request
    const { 
      height, 
      weight,
      sportType,
      riderExperience,
      commonDiscomforts,
      preferredPositions,
      keyGoals,
    } = req.body;

    // Handle video upload
    if (!req.file) {
      return res.status(400).json({ message: 'No video file provided' });
    }

    // Upload the video to S3
    const file = req.file;
    const key = `videos/${Date.now()}-${file.originalname}`;
    
    await uploadToS3(key, file.buffer, file.mimetype);
    
    // Get the S3 URL for the uploaded video
    const videoUrl = await getSignedUrl(key);

    // Create a new analysis record
    const newAnalysis = new Analysis({
      userId: req.userId, // From auth middleware
      height,
      weight,
      sportType,
      riderExperience,
      commonDiscomforts,
      preferredPositions,
      keyGoals,
      videoKey: key,
      status: 'pending',
    });

    // Save the analysis to the database
    await newAnalysis.save();

    // Process the video through MediaPipe (or other analysis)
    processVideoWithMediaPipe(file.buffer, newAnalysis._id);

    // Return the initial response to the client
    res.status(201).json({ 
      message: 'Analysis started',
      analysisId: newAnalysis._id,
      videoUrl
    });
  } catch (error) {
    console.error('Error creating analysis:', error);
    res.status(500).json({ message: 'Failed to create analysis', error: error.message });
  }
});

module.exports = router; 