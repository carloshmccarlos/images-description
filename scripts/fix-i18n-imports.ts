// Script to update imports from @/lib/i18n to next-intl/server
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const excludeDirs = ['node_modules', '.next', '.git', 'i18n/messages'];

function processFile(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Replace getServerLocale import from @/lib/i18n or @/lib/i18n/server
  if (content.includes("from '@/lib/i18n'") || content.includes("from '@/lib/i18n/server'")) {
    // Remove old imports
    content = content.replace(/import\s*{\s*getServerLocale\s*}\s*from\s*'@\/lib\/i18n(?:\/server)?';\s*\n?/g, '');
    content = content.replace(/import\s*{\s*getServerLocale,\s*getTranslations\s*}\s*from\s*'@\/lib\/i18n(?:\/server)?';\s*\n?/g, '');
    content = content.replace(/import\s*{\s*getTranslations\s*}\s*from\s*'@\/lib\/i18n(?:\/server)?';\s*\n?/g, '');
    
    // Check if we need getLocale
    const needsGetLocale = content.includes('getLocale()') || content.includes('await getLocale');
    
    // Replace getServerLocale with getLocale
    content = content.replace(/getServerLocale\(\)/g, 'getLocale()');
    content = content.replace(/await getLocale/g, 'await getLocale');
    
    // Add new import if needed
    if (needsGetLocale && !content.includes("from 'next-intl/server'")) {
      // Find the first import statement and add after it
      const firstImportMatch = content.match(/^import .+;\s*\n/m);
      if (firstImportMatch) {
        const insertPos = firstImportMatch.index! + firstImportMatch[0].length;
        content = content.slice(0, insertPos) + "import { getLocale } from 'next-intl/server';\n" + content.slice(insertPos);
      }
    }
    
    modified = true;
  }

  if (modified) {
    writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir: string) {
  const files = readdirSync(dir);
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.some(ex => filePath.includes(ex))) {
        walkDir(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  }
}

walkDir(rootDir);
console.log('Done!');
