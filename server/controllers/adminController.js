const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const mongoose = require('mongoose');
const { getSignedUrl, uploadToS3, deleteFromS3 } = require('../config/s3');
const path = require('path');
const fs = require('fs');

// Dashboard Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const newUsersLast30Days = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const newUsersLast7Days = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Analysis Statistics
    const totalAnalyses = await Analysis.countDocuments();
    const analysesLast30Days = await Analysis.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const analysesLast7Days = await Analysis.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Contact Form Statistics
    const totalContacts = await Contact.countDocuments();
    const contactsLast30Days = await Contact.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Newsletter Statistics
    const totalSubscribers = await Newsletter.countDocuments();
    const subscribersLast30Days = await Newsletter.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // User Growth Chart Data (last 30 days)
    const userGrowthData = await User.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Analysis Growth Chart Data (last 30 days)
    const analysisGrowthData = await Analysis.aggregate([
      {
        $match: { createdAt: { $gte: thirtyDaysAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Most Active Users
    const mostActiveUsers = await Analysis.aggregate([
      {
        $group: {
          _id: "$user",
          analysisCount: { $sum: 1 },
          lastAnalysis: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 1,
          analysisCount: 1,
          lastAnalysis: 1,
          "user.name": 1,
          "user.email": 1,
          "user.createdAt": 1
        }
      },
      {
        $sort: { analysisCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          newUsersLast30Days,
          newUsersLast7Days,
          totalAnalyses,
          analysesLast30Days,
          analysesLast7Days,
          totalContacts,
          contactsLast30Days,
          totalSubscribers,
          subscribersLast30Days
        },
        charts: {
          userGrowth: userGrowthData,
          analysisGrowth: analysisGrowthData
        },
        mostActiveUsers
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics',
      error: error.message 
    });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { 'name.firstName': { $regex: search, $options: 'i' } },
        { 'name.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.isActive = status === 'active';
    }

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerificationToken -passwordResetToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    // Get analysis count for each user
    const usersWithAnalysisCount = await Promise.all(
      users.map(async (user) => {
        const analysisCount = await Analysis.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          analysisCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithAnalysisCount,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

// Toggle User Status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent deactivating super admins
    if (user.role === 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot deactivate super admin accounts' 
      });
    }

    // Prevent users from deactivating themselves
    if (userId === req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot deactivate your own account' 
      });
    }

    // Regular admins can only toggle user and admin accounts, not super admins
    if (req.user.role === 'admin' && user.role === 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can modify super admin accounts' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle user status',
      error: error.message 
    });
  }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role specified' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check permissions based on the requesting user's role
    const requestingUserRole = req.user.role;

    // Only super admins can create other super admins
    if (role === 'super_admin' && requestingUserRole !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can assign super admin roles' 
      });
    }

    // Regular admins cannot modify super admin users
    if (user.role === 'super_admin' && requestingUserRole !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only super admins can modify super admin accounts' 
      });
    }

    // Regular admins can only modify users and other regular admins
    if (requestingUserRole === 'admin' && 
        !['user', 'admin'].includes(user.role) && 
        role !== 'super_admin') {
      // This allows admins to update user/admin roles but not create super admins
    }

    // Prevent users from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot change your own role' 
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        userId: user._id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// Analysis Management
exports.getAllAnalyses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const bikeType = req.query.bikeType || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build filter object
    const filter = {};
    
    if (bikeType) {
      filter.bikeType = bikeType;
    }
    
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.createdAt = { $gte: startDate };
    } else if (endDate) {
      filter.createdAt = { $lte: endDate };
    }

    const skip = (page - 1) * limit;

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userId'
        }
      },
      {
        $unwind: '$userId'
      }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userId.name.firstName': { $regex: search, $options: 'i' } },
            { 'userId.name.lastName': { $regex: search, $options: 'i' } },
            { 'userId.email': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add other filters
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Add sorting, pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const [analyses, totalAnalyses] = await Promise.all([
      Analysis.aggregate(pipeline),
      Analysis.aggregate([
        ...pipeline.slice(0, -3), // Remove sort, skip, limit for count
        { $count: 'total' }
      ])
    ]);

    const totalCount = totalAnalyses.length > 0 ? totalAnalyses[0].total : 0;

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalAnalyses: totalCount,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analyses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analyses',
      error: error.message 
    });
  }
};

// Delete Analysis
exports.deleteAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Analysis not found' 
      });
    }

    await Analysis.findByIdAndDelete(analysisId);

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete analysis',
      error: error.message 
    });
  }
};

// Get Analysis by ID (Admin)
exports.getAnalysisById = async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findById(analysisId).populate('user', 'name email');
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Analysis not found' 
      });
    }

    // Transform for client (add some helpful flags)
    const analysisData = analysis.toObject();
    
    // Use the model's storageType if available, otherwise determine from files
    if (!analysisData.storageType || analysisData.storageType === 'local') {
      analysisData.storageType = 
        (analysis.processedVideo && analysis.processedVideo.s3Key) ? 's3' : 
        (analysis.processedVideo && analysis.processedVideo.filePath) ? 'local' :
        (analysis.originalVideo && analysis.originalVideo.s3Key) ? 's3' : 
        (analysis.originalVideo && analysis.originalVideo.filePath) ? 'local' : 
        analysisData.storageType || 'unknown';
    }
    
    // Ensure duration is properly set - try multiple sources
    if (!analysisData.duration || analysisData.duration === null) {
      if (analysis.originalVideo && analysis.originalVideo.duration) {
        analysisData.duration = analysis.originalVideo.duration;
      } else if (analysis.processedVideo && analysis.processedVideo.duration) {
        analysisData.duration = analysis.processedVideo.duration;
      }
    }
    
    console.log('Analysis duration:', analysisData.duration, 'Storage type:', analysisData.storageType);
    console.log('Original video duration:', analysis.originalVideo?.duration);
    console.log('Processed video duration:', analysis.processedVideo?.duration);
    
    // Check for video availability using both fields
    analysisData.processed_video_available = !!analysis.processedVideo?.s3Key || !!analysis.processedVideo?.filePath;
    
    // Always include keyframe information
    analysisData.keyframes_available = Array.isArray(analysis.keyframes) && analysis.keyframes.length > 0;
    analysisData.keyframe_count = Array.isArray(analysis.keyframes) ? analysis.keyframes.length : 0;

    res.json({
      success: true,
      data: {
        analysis: analysisData
      }
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analysis',
      error: error.message 
    });
  }
};

// Get Processed Video (Admin)
exports.getProcessedVideo = async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Analysis not found' 
      });
    }

    const videoData = analysis.processedVideo;
    if (!videoData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Processed video not found' 
      });
    }

    let videoUrl;
    
    // Handle old format (filePath) vs new format (s3Key)
    if (videoData.s3Key) {
      // New format - generate S3 signed URL
      console.log(`Using S3 storage for processed video:`, videoData.s3Key);
      videoUrl = await getSignedUrl(videoData.s3Key, 3600); // 1 hour expiry
    } else if (videoData.filePath) {
      // Legacy format - return a local URL
      console.log(`Using local storage for processed video:`, videoData.filePath);
      videoUrl = `${process.env.SERVER_URL || 'http://localhost:4000'}/static/${videoData.filePath.replace(/\\/g, '/')}`;
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'No valid video storage location found' 
      });
    }

    res.json({ url: videoUrl });
  } catch (error) {
    console.error('Error getting processed video:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get processed video',
      error: error.message 
    });
  }
};

// Get Original Video (Admin)
exports.getOriginalVideo = async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Analysis not found' 
      });
    }

    const videoData = analysis.originalVideo;
    if (!videoData) {
      return res.status(404).json({ 
        success: false, 
        message: 'Original video not found' 
      });
    }

    let videoUrl;
    
    // Handle old format (filePath) vs new format (s3Key)
    if (videoData.s3Key) {
      // New format - generate S3 signed URL
      console.log(`Using S3 storage for original video:`, videoData.s3Key);
      videoUrl = await getSignedUrl(videoData.s3Key, 3600); // 1 hour expiry
    } else if (videoData.filePath) {
      // Legacy format - return a local URL
      console.log(`Using local storage for original video:`, videoData.filePath);
      videoUrl = `${process.env.SERVER_URL || 'http://localhost:4000'}/static/${videoData.filePath.replace(/\\/g, '/')}`;
    } else {
      return res.status(404).json({ 
        success: false, 
        message: 'No valid video storage location found' 
      });
    }

    res.json({ url: videoUrl });
  } catch (error) {
    console.error('Error getting original video:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get original video',
      error: error.message 
    });
  }
};

// Get Keyframes (Admin)
exports.getKeyframes = async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Analysis not found' 
      });
    }

    if (!analysis.keyframes || analysis.keyframes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No keyframes available' 
      });
    }

    // Generate signed URLs for all keyframes
    const keyframeUrls = await Promise.all(
      analysis.keyframes.map(async (keyframe, index) => {
        let url;
        
        // Handle old format (filePath) vs new format (s3Key)
        if (keyframe.s3Key) {
          // New format - generate S3 signed URL
          console.log(`Using S3 storage for keyframe ${index}:`, keyframe.s3Key);
          url = await getSignedUrl(keyframe.s3Key, 3600); // 1 hour expiry
        } else if (keyframe.filePath) {
          // Legacy format - return a local URL
          console.log(`Using local storage for keyframe ${index}:`, keyframe.filePath);
          url = `${process.env.SERVER_URL || 'http://localhost:4000'}/static/${keyframe.filePath.replace(/\\/g, '/')}`;
        } else {
          return null; // Skip invalid keyframes
        }
        
        return {
          url,
          timestamp: keyframe.timestamp || 0
        };
      })
    );

    // Filter out null keyframes
    const validKeyframes = keyframeUrls.filter(kf => kf !== null);

    res.json({ keyframes: validKeyframes });
  } catch (error) {
    console.error('Error getting keyframes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get keyframes',
      error: error.message 
    });
  }
};

// Contact Form Management
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate && endDate) {
      filter.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.createdAt = { $gte: startDate };
    } else if (endDate) {
      filter.createdAt = { $lte: endDate };
    }

    const skip = (page - 1) * limit;

    const [contacts, totalContacts] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Contact.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalContacts / limit),
          totalContacts,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contacts',
      error: error.message 
    });
  }
};

// Update Contact Status
exports.updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;

    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status specified' 
      });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    contact.status = status;
    await contact.save();

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contact status',
      error: error.message 
    });
  }
};

// Newsletter Management
exports.getAllSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const [subscribers, totalSubscribers] = await Promise.all([
      Newsletter.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Newsletter.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalSubscribers / limit),
          totalSubscribers,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch subscribers',
      error: error.message 
    });
  }
};

// System Health Check
exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check database response time
    const start = Date.now();
    await User.findOne().limit(1);
    const dbResponseTime = Date.now() - start;

    // Get database stats
    const dbStats = await mongoose.connection.db.stats();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date(),
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
          size: `${Math.round(dbStats.dataSize / 1024 / 1024)}MB`,
          collections: dbStats.collections
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
      }
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      success: false, 
      message: 'System health check failed',
      error: error.message 
    });
  }
}; 