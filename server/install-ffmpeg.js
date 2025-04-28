const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('Checking for ffmpeg installation...');

try {
  // Try running ffmpeg command to check if it's already installed
  execSync('ffmpeg -version', { stdio: 'ignore' });
  console.log('✅ ffmpeg is already installed');
} catch (error) {
  console.log('❌ ffmpeg not found, attempting to install...');
  
  const platform = os.platform();
  let installCommand;
  
  if (platform === 'darwin') {
    // macOS
    try {
      // Check if brew is installed
      execSync('brew --version', { stdio: 'ignore' });
      installCommand = 'brew install ffmpeg';
    } catch (error) {
      console.error('Homebrew is not installed. Please install Homebrew first: https://brew.sh/');
      process.exit(1);
    }
  } else if (platform === 'win32') {
    // Windows - provide download link
    console.log(`
Please download and install ffmpeg for Windows:
1. Go to https://ffmpeg.org/download.html#build-windows
2. Download the latest release build
3. Extract it to a folder of your choice
4. Add the ffmpeg bin folder to your PATH environment variable

After installation, restart your terminal and run this script again.
    `);
    process.exit(1);
  } else if (platform === 'linux') {
    // Linux
    try {
      // Check which package manager to use
      try {
        execSync('apt --version', { stdio: 'ignore' });
        installCommand = 'sudo apt update && sudo apt install -y ffmpeg';
      } catch (error) {
        try {
          execSync('yum --version', { stdio: 'ignore' });
          installCommand = 'sudo yum install -y ffmpeg';
        } catch (error) {
          console.error('Could not determine package manager. Please install ffmpeg manually.');
          process.exit(1);
        }
      }
    } catch (error) {
      console.error('Error checking for package manager:', error);
      process.exit(1);
    }
  } else {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }
  
  if (installCommand) {
    try {
      console.log(`Running: ${installCommand}`);
      execSync(installCommand, { stdio: 'inherit' });
      console.log('✅ ffmpeg installed successfully');
    } catch (error) {
      console.error('❌ Failed to install ffmpeg:', error.message);
      process.exit(1);
    }
  }
}

// Check for ffprobe as well
try {
  execSync('ffprobe -version', { stdio: 'ignore' });
  console.log('✅ ffprobe is already installed');
} catch (error) {
  console.log('❌ ffprobe not found. It should be included with ffmpeg installation.');
  console.log('Please ensure you have both ffmpeg and ffprobe in your PATH');
  process.exit(1);
}

console.log('✅ All dependencies are installed and ready to use'); 