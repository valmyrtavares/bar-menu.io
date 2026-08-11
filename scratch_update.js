const fs = require('fs');
const docJsPath = 'c:/Codigo/bar-menu.io/src/assets/docs/systemHelpDoc.js';
const mdPath = 'C:/Users/DragonArena 08/.gemini/antigravity-ide/brain/22ba9322-fdd1-471a-8648-88a75a2eeae0/.system_generated/steps/24/content.md';

let docJs = fs.readFileSync(docJsPath, 'utf8');
let md = fs.readFileSync(mdPath, 'utf8');

// Remove header from md
const splitMd = md.split('---');
let newDoc = splitMd.length > 1 ? splitMd.slice(1).join('---').trim() : md.trim();

// Escape backticks and dollars
newDoc = newDoc.replace(/`/g, '\\`').replace(/\$/g, '\\$');

const regex = /export const SYSTEM_HELP_DOCUMENT = `[\s\S]*?`;/;
const replacement = 'export const SYSTEM_HELP_DOCUMENT = `\\n' + newDoc + '\\n`;';

docJs = docJs.replace(regex, replacement);

fs.writeFileSync(docJsPath, docJs);
console.log('Updated systemHelpDoc.js successfully.');
