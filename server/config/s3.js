const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: generateSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Function to upload file to S3
const uploadToS3 = async (fileBuffer, fileName, contentType) => {
  try {
    // Create base params without ACL
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      ContentDisposition: 'inline',
      CacheControl: 'max-age=31536000',
      Metadata: {
        'x-amz-meta-content-type': contentType
      }
    };

    // First try without ACL
    try {
      const upload = new Upload({
        client: s3Client,
        params
      });
      
      const result = await upload.done();
      console.log(`File uploaded successfully to ${result.Location}`);
      return result.Key;
    } catch (error) {
      // If error wasn't related to ACL, just throw it
      if (!error.message.includes('AccessControlList')) {
        throw error;
      }
      
      console.log('Trying upload again without ACL parameter');
      const upload = new Upload({
        client: s3Client,
        params
      });
      
      const result = await upload.done();
      console.log(`File uploaded successfully to ${result.Location}`);
      return result.Key;
    }
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw error;
  }
};

// Function to get a signed URL for temporary access
const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });
    
    return await generateSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Function to delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    });
    
    const response = await s3Client.send(command);
    console.log(`File ${key} deleted successfully`);
    return response;
  } catch (error) {
    console.error(`Error deleting file ${key} from S3:`, error);
    throw error;
  }
};

module.exports = {
  s3Client,
  uploadToS3,
  getSignedUrl,
  deleteFromS3
}; 