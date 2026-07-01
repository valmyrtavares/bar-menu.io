const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'build');
const destDir = path.join(__dirname, 'docs');

// Helper to recursively delete and recreate a directory
function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

// Helper to copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('Cleaning docs directory...');
  cleanDir(destDir);

  console.log('Copying build files to docs directory...');
  if (fs.existsSync(srcDir)) {
    copyDir(srcDir, destDir);
    console.log('Build files successfully copied to docs!');
  } else {
    console.error('Error: build directory does not exist. Run react-scripts build first.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error during deploy copy operation:', error);
  process.exit(1);
}
