const Analysis = require('../models/Analysis');
const FormData = require('form-data');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const { exec } = require('child_process');
const execPromise = promisify(exec);
const { uploadToS3, getSignedUrl, deleteFromS3 } = require('../config/s3');
const fs = require('fs');
const os = require('os');
const path = require('path');

// File cache with TTL
const fileCache = new Map();
const MAX_CACHE_SIZE = 20; // Maximum number of files in cache
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Extract video duration using ffprobe
 * This function needs to be run on a local temporary file
 * @param {Buffer} videoBuffer - The video data buffer
 * @returns {Promise<Number>} - Duration in seconds
 */
const getVideoDuration = async (videoBuffer) => {
  try {
    // Write the buffer to a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `temp-${uuidv4()}.mp4`);
    
    await fs.promises.writeFile(tempFilePath, videoBuffer);
    
    try {
      const { stdout } = await execPromise(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFilePath}"`
      );
      
      // Clean up the temporary file
      await fs.promises.unlink(tempFilePath);
      
      const duration = parseFloat(stdout.trim());
      return isNaN(duration) ? null : duration;
    } catch (ffprobeError) {
      console.log('FFprobe not available or error running FFprobe, skipping duration extraction');
      
      // Clean up the temporary file
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Error removing temp file:', unlinkError);
      }
      
      // Continue without duration
      return null;
    }
  } catch (error) {
    console.error('Error in video duration extraction:', error);
    return null;
  }
};

/**
 * Save analysis results to the database
 * @param {Object} userId - The user ID
 * @param {Object} videoBuffer - The original video buffer
 * @param {String} contentType - The content type of the video
 * @param {String} filename - The original filename
 * @param {Number} fileSize - The size of the file
 * @param {Number} userHeightCm - The user's height in cm
 * @param {String} bikeType - The type of bike
 * @param {Object} analysisResults - The results from PosePython
 * @returns {Promise<Object>} - The saved analysis document
 */
const saveAnalysis = async (userId, videoBuffer, contentType, filename, fileSize, userHeightCm, bikeType, analysisResults) => {
  try {
    // Process the analysis results to extract the parts we need
    const { max_angles, min_angles, body_lengths_cm, recommendations, video, analysis_id, keyframe_count, video_available } = analysisResults;
    
    // Generate a unique ID for this analysis
    const analysisId = analysis_id || uuidv4();
    
    // Extract video duration from the original video buffer
    const originalDuration = await getVideoDuration(videoBuffer);
    console.log(`Original video duration: ${originalDuration ? originalDuration + ' seconds' : 'unavailable'}`);
    
    // Create a new Analysis document
    const analysis = new Analysis({
      user: userId,
      userHeightCm,
      bikeType,
      duration: originalDuration || null,
      originalVideo: {
        // We don't store the original video on S3 anymore, just keep metadata
        contentType,
        filename,
        size: fileSize,
        duration: originalDuration || null
      },
      maxAngles: max_angles,
      minAngles: min_angles,
      bodyLengthsCm: body_lengths_cm,
      recommendations
    });
    
    // Important: Set storageType to 's3' explicitly
    analysis.storageType = 's3';
    
    // If we have a processed video from the analysis, upload that too
    if (video && video.length > 0) {
      try {
        // Convert base64 to buffer
        const processedVideoBuffer = Buffer.from(video, 'base64');
        
        // Upload processed video to S3
        const processedVideoKey = `videos/${analysisId}/processed.mp4`;
        await uploadToS3(processedVideoBuffer, processedVideoKey, 'video/mp4');
        
        // Get duration of processed video (usually the same as original but might be different)
        const processedDuration = await getVideoDuration(processedVideoBuffer);
        console.log(`Processed video duration: ${processedDuration ? processedDuration + ' seconds' : 'unavailable'}`);
        
        // Add processed video info to the analysis document
        analysis.processedVideo = {
          s3Key: processedVideoKey,
          contentType: 'video/mp4',
          duration: processedDuration || originalDuration || null // Use original duration as fallback, then null
        };
      } catch (videoError) {
        console.error('Error processing video result:', videoError);
      }
    }
    
    // Save keyframes if available
    if (analysisResults.key_frames && Array.isArray(analysisResults.key_frames)) {
      const keyframes = [];
      
      for (let i = 0; i < analysisResults.key_frames.length; i++) {
        try {
          // Convert base64 to buffer
          const frameBuffer = Buffer.from(analysisResults.key_frames[i], 'base64');
          
          // Upload frame to S3
          const frameKey = `videos/${analysisId}/keyframe_${i}.jpg`;
          await uploadToS3(frameBuffer, frameKey, 'image/jpeg');
          
          // Calculate approximate timestamp (evenly spaced, can be improved)
          const timestamp = i * (originalDuration / analysisResults.key_frames.length);
          
          // Add keyframe info to the array
          keyframes.push({
            s3Key: frameKey,
            contentType: 'image/jpeg',
            timestamp
          });
        } catch (frameError) {
          console.error(`Error processing keyframe ${i}:`, frameError);
        }
      }
      
      // Add keyframes to the analysis document
      if (keyframes.length > 0) {
        analysis.keyframes = keyframes;
      }
    }
    
    // Save the analysis document to MongoDB
    await analysis.save();
    return analysis;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

/**
 * Process video with AI model
 * @param {Buffer} videoBuffer - The video buffer
 * @param {Number} userHeightCm - The user's height in cm
 * @param {Number} quality - The quality setting for processing
 * @returns {Promise<Object>} - The results from the AI processing
 */
const processVideoWithAI = async (videoBuffer, userHeightCm, quality) => {
  try {
    // Create a form with the video buffer and params
    const formData = new FormData();
    formData.append('video', videoBuffer, { filename: 'video.mp4' });
    formData.append('user_height_cm', userHeightCm.toString());
    
    if (quality) {
      formData.append('quality', quality.toString());
    }
    
    // Send to Flask API for processing
    console.log('Sending video to processing API...');
    const response = await axios.post(process.env.PYTHON_SERVER_URL || 'https://cyclofit-ai.grity.co/process-video', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 600000, // 10 minutes timeout to match client-side
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing video with AI:', error);
    throw error;
  }
};

/**
 * Get all analyses for a user
 * @param {String} userId - The user ID
 * @returns {Promise<Array>} - Array of analysis documents
 */
const getUserAnalyses = async (userId) => {
  try {
    return await Analysis.find({ user: userId })
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error getting user analyses:', error);
    throw error;
  }
};

/**
 * Get a specific analysis by ID
 * @param {String} analysisId - The analysis ID
 * @param {String} userId - The user ID (for authorization)
 * @returns {Promise<Object>} - The analysis document
 */
const getAnalysisById = async (analysisId, userId) => {
  try {
    return await Analysis.findOne({ 
      _id: analysisId,
      user: userId
    });
  } catch (error) {
    console.error('Error getting analysis by ID:', error);
    throw error;
  }
};

/**
 * Get a signed URL for accessing a video
 * @param {String} analysisId - The analysis ID
 * @param {String} userId - The user ID (for authorization)
 * @param {String} videoType - 'original' or 'processed'
 * @returns {Promise<String>} - Signed URL for the video
 */
const getVideoUrl = async (analysisId, userId, videoType) => {
  try {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      user: userId
    });
    
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    
    let videoData;
    if (videoType === 'original') {
      videoData = analysis.originalVideo;
    } else if (videoType === 'processed') {
      videoData = analysis.processedVideo;
    } else {
      throw new Error(`${videoType} video not found`);
    }
    
    if (!videoData) {
      throw new Error(`${videoType} video not found in analysis`);
    }
    
    // Handle old format (filePath) vs new format (s3Key)
    if (videoData.s3Key) {
      // New format - generate S3 signed URL
      console.log(`Using S3 storage for ${videoType} video:`, videoData.s3Key);
      return await getSignedUrl(videoData.s3Key, 3600); // 1 hour expiry
    } else if (videoData.filePath) {
      // Legacy format - return a local URL
      console.log(`Using local storage for ${videoType} video:`, videoData.filePath);
      
      // Migrate to S3 if video file exists
      try {
        const fullPath = path.join(__dirname, '..', videoData.filePath);
        if (fs.existsSync(fullPath)) {
          console.log(`Migrating ${videoType} video to S3:`, fullPath);
          
          // Read the file
          const fileBuffer = await fs.promises.readFile(fullPath);
          
          // Upload to S3
          const s3Key = `videos/${analysisId}/${path.basename(videoData.filePath)}`;
          await uploadToS3(fileBuffer, s3Key, videoData.contentType || 'application/octet-stream');
          
          // Update the database record
          if (videoType === 'original') {
            analysis.originalVideo.s3Key = s3Key;
          } else {
            analysis.processedVideo.s3Key = s3Key;
          }
          
          await analysis.save();
          console.log(`Successfully migrated ${videoType} video to S3`);
          
          // Return the S3 URL
          return await getSignedUrl(s3Key, 3600);
        }
      } catch (migrationError) {
        console.error(`Error migrating ${videoType} video to S3:`, migrationError);
      }
      
      // If migration failed or file doesn't exist, return the local path
      return `${process.env.SERVER_URL || 'http://localhost:4000'}/static/${videoData.filePath.replace(/\\/g, '/')}`;
    }
    
    throw new Error(`No valid storage location found for ${videoType} video`);
  } catch (error) {
    console.error('Error getting video URL:', error);
    throw error;
  }
};

/**
 * Get a signed URL for accessing a keyframe
 * @param {String} analysisId - The analysis ID
 * @param {String} userId - The user ID (for authorization)
 * @param {Number} index - The keyframe index
 * @returns {Promise<String>} - Signed URL for the keyframe
 */
const getKeyframeUrl = async (analysisId, userId, index) => {
  try {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      user: userId
    });
    
    if (!analysis) {
      throw new Error('Analysis not found');
    }
    
    if (!analysis.keyframes || !analysis.keyframes[index]) {
      throw new Error('Keyframe not found');
    }
    
    const keyframe = analysis.keyframes[index];
    
    // Handle old format (filePath) vs new format (s3Key)
    if (keyframe.s3Key) {
      // New format - generate S3 signed URL
      console.log(`Using S3 storage for keyframe ${index}:`, keyframe.s3Key);
      return await getSignedUrl(keyframe.s3Key, 3600); // 1 hour expiry
    } else if (keyframe.filePath) {
      // Legacy format - return a local URL
      console.log(`Using local storage for keyframe ${index}:`, keyframe.filePath);
      
      // Migrate to S3 if keyframe file exists
      try {
        const fullPath = path.join(__dirname, '..', keyframe.filePath);
        if (fs.existsSync(fullPath)) {
          console.log(`Migrating keyframe ${index} to S3:`, fullPath);
          
          // Read the file
          const fileBuffer = await fs.promises.readFile(fullPath);
          
          // Upload to S3
          const s3Key = `videos/${analysisId}/keyframe_${index}.jpg`;
          await uploadToS3(fileBuffer, s3Key, keyframe.contentType || 'image/jpeg');
          
          // Update the database record
          analysis.keyframes[index].s3Key = s3Key;
          await analysis.save();
          console.log(`Successfully migrated keyframe ${index} to S3`);
          
          // Return the S3 URL
          return await getSignedUrl(s3Key, 3600);
        }
      } catch (migrationError) {
        console.error(`Error migrating keyframe ${index} to S3:`, migrationError);
      }
      
      // If migration failed or file doesn't exist, return the local path
      return `${process.env.SERVER_URL || 'http://localhost:4000'}/static/${keyframe.filePath.replace(/\\/g, '/')}`;
    }
    
    throw new Error(`No valid storage location found for keyframe ${index}`);
  } catch (error) {
    console.error('Error getting keyframe URL:', error);
    throw error;
  }
};

/**
 * Delete an analysis and its associated files
 * @param {String} analysisId - The analysis ID
 * @param {String} userId - The user ID (for authorization)
 * @returns {Promise<Boolean>} - Whether the deletion was successful
 */
const deleteAnalysis = async (analysisId, userId) => {
  try {
    const analysis = await Analysis.findOne({
      _id: analysisId,
      user: userId
    });
    
    if (!analysis) {
      return false;
    }
    
    // Delete files from S3
    const deletePromises = [];
    
    // Delete original video
    if (analysis.originalVideo && analysis.originalVideo.s3Key) {
      deletePromises.push(deleteFromS3(analysis.originalVideo.s3Key));
    }
    
    // Delete processed video
    if (analysis.processedVideo && analysis.processedVideo.s3Key) {
      deletePromises.push(deleteFromS3(analysis.processedVideo.s3Key));
    }
    
    // Delete keyframes
    if (analysis.keyframes && analysis.keyframes.length > 0) {
      for (const keyframe of analysis.keyframes) {
        if (keyframe.s3Key) {
          deletePromises.push(deleteFromS3(keyframe.s3Key));
        }
      }
    }
    
    // Wait for all delete operations to complete
    await Promise.allSettled(deletePromises);
    
    // Delete the analysis document from MongoDB
    await Analysis.deleteOne({ _id: analysisId });
    
    return true;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

module.exports = {
  saveAnalysis,
  processVideoWithAI,
  getUserAnalyses,
  getAnalysisById,
  getVideoUrl,
  getKeyframeUrl,
  deleteAnalysis
}; 