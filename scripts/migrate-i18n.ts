// Script to replace react-i18next with next-intl
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const excludeDirs = ['node_modules', '.next', '.git', 'i18n/messages'];

function processFile(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Replace import statement
  if (content.includes("from 'react-i18next'")) {
    content = content.replace(
      /import\s*{\s*useTranslation\s*}\s*from\s*'react-i18next';?/g,
      "import { useTranslations } from 'next-intl';"
    );
    modified = true;
  }

  // Replace useTranslation hook usage: const t = useTranslations('namespace');
  // to: const t = useTranslations('namespace');
  if (content.includes('useTranslation(')) {
    content = content.replace(
      /const\s*{\s*t\s*}\s*=\s*useTranslation\s*\(\s*['"]([^'"]+)['"]\s*\);?/g,
      "const t = useTranslations('$1');"
    );
    modified = true;
  }

  // Replace useTranslation hook with multiple destructured values
  // const t = useTranslations('namespace'); -> const t = useTranslations('namespace');
  if (content.includes('useTranslation(')) {
    content = content.replace(
      /const\s*{\s*t[^}]*}\s*=\s*useTranslation\s*\(\s*['"]([^'"]+)['"]\s*\);?/g,
      "const t = useTranslations('$1');"
    );
    modified = true;
  }

  // Replace t: tCommon pattern
  if (content.includes('useTranslation(')) {
    content = content.replace(
      /const\s*{\s*t:\s*(\w+)\s*}\s*=\s*useTranslation\s*\(\s*['"]([^'"]+)['"]\s*\);?/g,
      "const $1 = useTranslations('$2');"
    );
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
