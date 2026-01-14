/**
 * Validation Pipeline for Profile Quality Improvements
 * 
 * This module provides validation utilities to ensure refactoring doesn't break
 * TypeScript compilation, tests, or imports.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationReport {
  typescript: ValidationResult;
  tests: ValidationResult;
  imports: ValidationResult;
  overall: boolean;
}

/**
 * Validates TypeScript compilation
 * @returns Validation result
 */
export async function validateTypeScript(): Promise<ValidationResult> {
  try {
    const { stdout, stderr } = await execAsync('npm run type-check', {
      cwd: path.join(process.cwd(), 'client')
    });
    
    return {
      success: true,
      errors: [],
      warnings: stderr ? [stderr] : []
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.stdout || error.message],
      warnings: []
    };
  }
}

/**
 * Validates that tests pass
 * @param testPattern - Optional pattern to run specific tests
 * @returns Validation result
 */
export async function validateTests(testPattern?: string): Promise<ValidationResult> {
  try {
    const command = testPattern
      ? `npm run test -- --run ${testPattern}`
      : 'npm run test -- --run';
    
    const { stdout, stderr } = await execAsync(command, {
      cwd: path.join(process.cwd(), 'client'),
      timeout: 60000 // 60 second timeout
    });
    
    return {
      success: true,
      errors: [],
      warnings: stderr ? [stderr] : []
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [error.stdout || error.message],
      warnings: []
    };
  }
}

/**
 * Validates that imports can be resolved
 * This is a simplified check - TypeScript compilation will catch most import issues
 * @returns Validation result
 */
export async function validateImports(): Promise<ValidationResult> {
  try {
    // Use TypeScript's --noEmit flag to check imports without generating files
    const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
      cwd: path.join(process.cwd(), 'client')
    });
    
    return {
      success: true,
      errors: [],
      warnings: stderr ? [stderr] : []
    };
  } catch (error: any) {
    const errorMessage = error.stdout || error.message;
    const importErrors = errorMessage
      .split('\n')
      .filter((line: string) => 
        line.includes('Cannot find module') || 
        line.includes('Module not found')
      );
    
    return {
      success: false,
      errors: importErrors.length > 0 ? importErrors : [errorMessage],
      warnings: []
    };
  }
}

/**
 * Runs complete validation pipeline
 * @param options - Validation options
 * @returns Complete validation report
 */
export async function runValidationPipeline(options?: {
  skipTests?: boolean;
  testPattern?: string;
}): Promise<ValidationReport> {
  console.log('🔍 Running validation pipeline...\n');
  
  // Validate TypeScript
  console.log('📝 Checking TypeScript compilation...');
  const typescript = await validateTypeScript();
  console.log(typescript.success ? '✅ TypeScript OK' : '❌ TypeScript errors found');
  
  // Validate imports
  console.log('📦 Checking imports...');
  const imports = await validateImports();
  console.log(imports.success ? '✅ Imports OK' : '❌ Import errors found');
  
  // Validate tests (if not skipped)
  let tests: ValidationResult;
  if (options?.skipTests) {
    console.log('⏭️  Skipping tests');
    tests = { success: true, errors: [], warnings: [] };
  } else {
    console.log('🧪 Running tests...');
    tests = await validateTests(options?.testPattern);
    console.log(tests.success ? '✅ Tests passed' : '❌ Tests failed');
  }
  
  const overall = typescript.success && imports.success && tests.success;
  
  console.log('\n' + '='.repeat(50));
  console.log(overall ? '✅ All validations passed!' : '❌ Validation failed');
  console.log('='.repeat(50) + '\n');
  
  return {
    typescript,
    tests,
    imports,
    overall
  };
}

/**
 * Prints a detailed validation report
 * @param report - Validation report to print
 */
export function printValidationReport(report: ValidationReport): void {
  console.log('\n📊 Validation Report\n');
  console.log('='.repeat(50));
  
  // TypeScript
  console.log('\n📝 TypeScript Compilation:');
  console.log(`   Status: ${report.typescript.success ? '✅ PASS' : '❌ FAIL'}`);
  if (report.typescript.errors.length > 0) {
    console.log('   Errors:');
    report.typescript.errors.forEach(err => console.log(`     - ${err}`));
  }
  if (report.typescript.warnings.length > 0) {
    console.log('   Warnings:');
    report.typescript.warnings.forEach(warn => console.log(`     - ${warn}`));
  }
  
  // Imports
  console.log('\n📦 Import Resolution:');
  console.log(`   Status: ${report.imports.success ? '✅ PASS' : '❌ FAIL'}`);
  if (report.imports.errors.length > 0) {
    console.log('   Errors:');
    report.imports.errors.forEach(err => console.log(`     - ${err}`));
  }
  
  // Tests
  console.log('\n🧪 Tests:');
  console.log(`   Status: ${report.tests.success ? '✅ PASS' : '❌ FAIL'}`);
  if (report.tests.errors.length > 0) {
    console.log('   Errors:');
    report.tests.errors.forEach(err => console.log(`     - ${err}`));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`Overall: ${report.overall ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(50) + '\n');
}

/**
 * Quick validation check (TypeScript only)
 * @returns true if TypeScript compiles successfully
 */
export async function quickValidation(): Promise<boolean> {
  const result = await validateTypeScript();
  return result.success;
}
