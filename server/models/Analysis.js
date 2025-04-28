const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnalysisSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: 'Bike Fit Analysis'
  },
  description: {
    type: String,
    default: ''
  },
  storageType: {
    type: String,
    enum: ['local', 's3'],
    default: 'local'
  },
  originalVideo: {
    // Old format for backward compatibility
    filePath: String, 
    s3Url: String,
    // New S3 format
    s3Key: String,
    contentType: String,
    filename: String,
    size: Number,
    duration: Number // Duration in seconds
  },
  processedVideo: {
    // Old format for backward compatibility
    filePath: String,
    s3Url: String,
    // New S3 format
    s3Key: String,
    contentType: String,
    duration: Number // Duration in seconds
  },
  keyframes: [{
    // Old format for backward compatibility
    filePath: String,
    s3Url: String,
    // New S3 format
    s3Key: String,
    contentType: String,
    timestamp: Number // Timestamp in seconds
  }],
  duration: {
    type: Number,
    default: null
  },
  bikeType: {
    type: String,
    enum: ['road', 'tt', 'mtb', 'gravel', 'hybrid'],
    default: 'road'
  },
  userHeightCm: {
    type: Number,
    required: true
  },
  maxAngles: {
    hip_knee_ankle: Number,
    shoulder_elbow_wrist: Number,
    hip: Number,
    shoulder_hip_knee: Number,
    elbow_shoulder_hip: Number
  },
  minAngles: {
    hip_knee_ankle: Number,
    shoulder_elbow_wrist: Number,
    hip: Number,
    shoulder_hip_knee: Number,
    elbow_shoulder_hip: Number
  },
  bodyLengthsCm: {
    torso_length: Number,
    femur_length: Number,
    lower_leg_length: Number,
    upper_arm_length: Number,
    forearm_length: Number
  },
  recommendations: {
    general: [Object],
    road_bike: {
      endurance: [Object],
      aggressive: [Object]
    },
    time_trial: [Object]
  }
}, { timestamps: true });

// Add index for fast queries by user
AnalysisSchema.index({ user: 1, createdAt: -1 });

// Add virtual for formatted date
AnalysisSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Add virtual for formatted duration
AnalysisSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'Unknown';
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Analysis', AnalysisSchema); 