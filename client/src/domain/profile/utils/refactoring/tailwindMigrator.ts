/**
 * Tailwind v4 Syntax Migrator
 * 
 * Automatically migrates Tailwind CSS syntax from v3 to v4
 * Old: property-[var(--variable)]
 * New: property-(--variable)
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface MigrationPattern {
  pattern: RegExp;
  replacement: string;
  description: string;
}

export interface MigrationResult {
  filePath: string;
  changes: number;
  success: boolean;
  error?: string;
}

export interface MigrationSummary {
  totalFiles: number;
  filesModified: number;
  totalChanges: number;
  results: MigrationResult[];
}

/**
 * All Tailwind v4 migration patterns
 */
export const MIGRATION_PATTERNS: MigrationPattern[] = [
  // Text colors
  {
    pattern: /text-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'text-($1)',
    description: 'Text color'
  },
  // Background colors
  {
    pattern: /bg-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'bg-($1)',
    description: 'Background color'
  },
  // Border colors
  {
    pattern: /border-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'border-($1)',
    description: 'Border color'
  },
  // Ring colors
  {
    pattern: /ring-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'ring-($1)',
    description: 'Ring color'
  },
  // Ring offset colors
  {
    pattern: /ring-offset-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'ring-offset-($1)',
    description: 'Ring offset color'
  },
  // Shadow colors
  {
    pattern: /shadow-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'shadow-($1)',
    description: 'Shadow color'
  },
  // Divide colors
  {
    pattern: /divide-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'divide-($1)',
    description: 'Divide color'
  },
  // Placeholder colors
  {
    pattern: /placeholder-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'placeholder-($1)',
    description: 'Placeholder color'
  },
  // Outline colors
  {
    pattern: /outline-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'outline-($1)',
    description: 'Outline color'
  },
  // Accent colors
  {
    pattern: /accent-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'accent-($1)',
    description: 'Accent color'
  },
  // Caret colors
  {
    pattern: /caret-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'caret-($1)',
    description: 'Caret color'
  },
  // Fill colors
  {
    pattern: /fill-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'fill-($1)',
    description: 'Fill color'
  },
  // Stroke colors
  {
    pattern: /stroke-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'stroke-($1)',
    description: 'Stroke color'
  },
  // Decoration colors
  {
    pattern: /decoration-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'decoration-($1)',
    description: 'Decoration color'
  },
  // From colors (gradients)
  {
    pattern: /from-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'from-($1)',
    description: 'Gradient from color'
  },
  // Via colors (gradients)
  {
    pattern: /via-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'via-($1)',
    description: 'Gradient via color'
  },
  // To colors (gradients)
  {
    pattern: /to-\[var\((--[a-zA-Z0-9-]+)\)\]/g,
    replacement: 'to-($1)',
    description: 'Gradient to color'
  }
];

/**
 * Migrates a single file's Tailwind syntax
 * @param filePath - Path to the file to migrate
 * @returns Migration result
 */
export function migrateFile(filePath: string): MigrationResult {
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
    
    return {
      filePath,
      changes: totalChanges,
      success: true
    };
  } catch (error: any) {
    return {
      filePath,
      changes: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Migrates all TSX files in a directory
 * @param directory - Directory to scan for TSX files
 * @param recursive - Whether to scan recursively (default: true)
 * @returns Migration summary
 */
export async function migrateDirectory(
  directory: string,
  recursive: boolean = true
): Promise<MigrationSummary> {
  const pattern = recursive
    ? path.join(directory, '**/*.tsx')
    : path.join(directory, '*.tsx');
  
  const files = await glob(pattern, { 
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  const results: MigrationResult[] = [];
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
  
  return {
    totalFiles: files.length,
    filesModified,
    totalChanges,
    results
  };
}

/**
 * Prints a migration summary report
 * @param summary - Migration summary to print
 */
export function printMigrationSummary(summary: MigrationSummary): void {
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
  
  const failures = summary.results.filter(r => !r.success);
  if (failures.length > 0) {
    console.log('\n❌ Failed files:\n');
    failures.forEach(r => {
      const relativePath = path.relative(process.cwd(), r.filePath);
      console.log(`   ${relativePath}: ${r.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(summary.filesModified > 0 
    ? '✅ Migration completed successfully!' 
    : 'ℹ️  No changes needed'
  );
  console.log('='.repeat(50) + '\n');
}

/**
 * Validates that a file has no old Tailwind v3 syntax
 * @param filePath - Path to the file to validate
 * @returns true if file is compliant, false otherwise
 */
export function validateTailwindV4Compliance(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  for (const migration of MIGRATION_PATTERNS) {
    if (migration.pattern.test(content)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Validates Tailwind v4 compliance for all files in a directory
 * @param directory - Directory to validate
 * @returns Compliance report
 */
export async function validateDirectoryCompliance(
  directory: string
): Promise<{
  totalFiles: number;
  compliantFiles: number;
  nonCompliantFiles: string[];
}> {
  const pattern = path.join(directory, '**/*.tsx');
  const files = await glob(pattern, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  const nonCompliantFiles: string[] = [];
  
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
