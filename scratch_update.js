const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else if (dirFile.endsWith('.js') && !dirFile.includes('FirestoreInterceptor.js') && !dirFile.includes('AuditLogger.js')) {
      filelist.push(dirFile);
    }
  });
  return filelist;
};

const mutations = ['addDoc', 'setDoc', 'updateDoc', 'deleteDoc'];
const files = walkSync('./src');
let changedCount = 0;

files.forEach(fullPath => {
  let content = fs.readFileSync(fullPath, 'utf8');
  let hasChanges = false;
  
  // Find import statement from firebase/firestore
  // Handle multi-line imports
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]firebase\/firestore['"];?/g;
  
  content = content.replace(importRegex, (match, importsStr) => {
    // split imports by comma
    let imports = importsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    // find which mutations are imported
    let intercepted = imports.filter(imp => {
       const name = imp.split(/\s+as\s+/)[0].trim();
       return mutations.includes(name);
    });
    
    if (intercepted.length === 0) return match; // no changes needed for this import block
    
    hasChanges = true;
    
    // remove intercepted from original imports
    let remaining = imports.filter(imp => {
       const name = imp.split(/\s+as\s+/)[0].trim();
       return !mutations.includes(name);
    });
    
    // calculate relative path to FirestoreInterceptor.js
    const depth = fullPath.replace(/\\/g, '/').split('src/')[1].split('/').length - 1;
    let prefix = depth === 0 ? './' : '../'.repeat(depth);
    const interceptorPath = prefix + 'api/FirestoreInterceptor';
    
    let replacement = '';
    
    if (remaining.length > 0) {
      replacement += `import { ${remaining.join(', ')} } from 'firebase/firestore';\n`;
    }
    replacement += `import { ${intercepted.join(', ')} } from '${interceptorPath}';`;
    
    return replacement;
  });

  if (hasChanges) {
    fs.writeFileSync(fullPath, content);
    changedCount++;
  }
});

console.log(`Successfully patched ${changedCount} files to use FirestoreInterceptor.`);
