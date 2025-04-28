/**
 * Convert base64 encoded data to a Blob
 * @param {string} base64 - Base64 encoded string
 * @param {string} mimeType - The MIME type of the data
 * @returns {Blob} - The resulting Blob
 */
export const base64ToBlob = (base64, mimeType) => {
  // Validate inputs
  if (!base64 || typeof base64 !== 'string') {
    throw new Error('Invalid base64 data: must be a non-empty string');
  }
  
  if (!mimeType || typeof mimeType !== 'string') {
    console.warn('Invalid mimeType provided, defaulting to application/octet-stream');
    mimeType = 'application/octet-stream';
  }
  
  try {
    // Remove any header or prefix from base64 string (e.g., "data:image/jpeg;base64,")
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    return new Blob(byteArrays, { type: mimeType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    throw new Error(`Failed to convert base64 to blob: ${error.message}`);
  }
}; 