#!/usr/bin/env node
/**
 * Tailwind v4 Migration Script (JavaScript version)
 * 
 * Automatically migrates all TSX files in the profile domain from Tailwind v3 to v4 syntax
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Migration patterns
const MIGRATION_PATTERNS = [
  { pattern: /text-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'text-($1)', description: 'Text color' },
  { pattern: /bg-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'bg-($1)', description: 'Background color' },
  { pattern: /border-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'border-($1)', description: 'Border color' },
  { pattern: /ring-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'ring-($1)', description: 'Ring color' },
  { pattern: /ring-offset-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'ring-offset-($1)', description: 'Ring offset color' },
  { pattern: /shadow-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'shadow-($1)', description: 'Shadow color' },
  { pattern: /divide-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'divide-($1)', description: 'Divide color' },
  { pattern: /placeholder-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'placeholder-($1)', description: 'Placeholder color' },
  { pattern: /outline-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'outline-($1)', description: 'Outline color' },
  { pattern: /accent-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'accent-($1)', description: 'Accent color' },
  { pattern: /caret-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'caret-($1)', description: 'Caret color' },
  { pattern: /fill-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'fill-($1)', description: 'Fill color' },
  { pattern: /stroke-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'stroke-($1)', description: 'Stroke color' },
  { pattern: /decoration-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'decoration-($1)', description: 'Decoration color' },
  { pattern: /from-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'from-($1)', description: 'Gradient from color' },
  { pattern: /via-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'via-($1)', description: 'Gradient via color' },
  { pattern: /to-\[var\((--[a-zA-Z0-9-]+)\)\]/g, replacement: 'to-($1)', description: 'Gradient to color' }
];

function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist') && !file.includes('build')) {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let totalChanges = 0;
    
    for (const migration of MIGRATION_PATTERNS) {
      const matches = content.match(migration.pattern);
      if (matches) {
        totalChanges += matches.length;
        content = content.replace(migration.pattern, migration.replacement);
      }
    }
    
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
    
    return { filePath, changes: totalChanges, success: true };
  } catch (error) {
    return { filePath, changes: 0, success: false, error: error.message };
  }
}

function migrateDirectory(directory) {
  const files = getAllTsxFiles(directory);
  
  const results = [];
  let totalChanges = 0;
  let filesModified = 0;
  
  for (const file of files) {
    const result = migrateFile(file);
    results.push(result);
    
    if (result.success && result.changes > 0) {
      totalChanges += result.changes;
      filesModified++;
    }
  }
  
  return { totalFiles: files.length, filesModified, totalChanges, results };
}

function validateTailwindV4Compliance(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  for (const migration of MIGRATION_PATTERNS) {
    if (migration.pattern.test(content)) {
      return false;
    }
  }
  
  return true;
}

function validateDirectoryCompliance(directory) {
  const files = getAllTsxFiles(directory);
  const nonCompliantFiles = [];
  
  for (const file of files) {
    if (!validateTailwindV4Compliance(file)) {
      nonCompliantFiles.push(file);
    }
  }
  
  return {
    totalFiles: files.length,
    compliantFiles: files.length - nonCompliantFiles.length,
    nonCompliantFiles
  };
}

function main() {
  console.log('🚀 Starting Tailwind v4 Migration\n');
  
  const profileDir = path.join(process.cwd(), 'src/domain/profile');
  
  // Run migration
  console.log('🔄 Running migration...\n');
  const summary = migrateDirectory(profileDir);
  
  console.log('\n📊 Tailwind v4 Migration Summary\n');
  console.log('='.repeat(50));
  console.log(`Total files scanned: ${summary.totalFiles}`);
  console.log(`Files modified: ${summary.filesModified}`);
  console.log(`Total changes: ${summary.totalChanges}`);
  console.log('='.repeat(50));
  
  if (summary.filesModified > 0) {
    console.log('\n✅ Modified files:\n');
    summary.results
      .filter(r => r.success && r.changes > 0)
      .forEach(r => {
        const relativePath = path.relative(process.cwd(), r.filePath);
        console.log(`   ${relativePath} (${r.changes} changes)`);
      });
  }
  
  // Validate compliance
  console.log('\n🔍 Validating Tailwind v4 compliance...\n');
  const compliance = validateDirectoryCompliance(profileDir);
  
  console.log('📊 Compliance Report\n');
  console.log('='.repeat(50));
  console.log(`Total files: ${compliance.totalFiles}`);
  console.log(`Compliant files: ${compliance.compliantFiles}`);
  console.log(`Non-compliant files: ${compliance.nonCompliantFiles.length}`);
  console.log('='.repeat(50));
  
  if (compliance.nonCompliantFiles.length > 0) {
    console.log('\n⚠️  Non-compliant files:\n');
    compliance.nonCompliantFiles.forEach(file => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`   - ${relativePath}`);
    });
    console.log('\n❌ Migration incomplete. Some files still have old syntax.');
  } else {
    console.log('\n✅ All files are Tailwind v4 compliant!\n');
  }
}

main();
