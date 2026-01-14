/**
 * Backup and Rollback Infrastructure for Profile Quality Improvements
 * 
 * This module provides utilities for creating backups of files before refactoring
 * and rolling back changes if validation fails.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface BackupMetadata {
  taskId: string;
  timestamp: Date;
  filesModified: string[];
  backupLocation: string;
}

export interface RollbackPoint {
  taskId: string;
  timestamp: Date;
  filesModified: string[];
  backupLocation: string;
}

const BACKUP_DIR = path.join(process.cwd(), '.refactoring-backups');

/**
 * Ensures the backup directory exists
 */
function ensureBackupDirectory(): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Creates a backup of specified files before refactoring
 * @param taskId - Unique identifier for the refactoring task
 * @param filePaths - Array of file paths to backup (relative to project root)
 * @returns Rollback point metadata
 */
export function createRollbackPoint(
  taskId: string,
  filePaths: string[]
): RollbackPoint {
  ensureBackupDirectory();
  
  const timestamp = new Date();
  const backupSubDir = path.join(
    BACKUP_DIR,
    `${taskId}_${timestamp.getTime()}`
  );
  
  fs.mkdirSync(backupSubDir, { recursive: true });
  
  const backedUpFiles: string[] = [];
  
  for (const filePath of filePaths) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      const relativePath = path.relative(process.cwd(), fullPath);
      const backupPath = path.join(backupSubDir, relativePath);
      const backupDir = path.dirname(backupPath);
      
      // Create directory structure in backup
      fs.mkdirSync(backupDir, { recursive: true });
      
      // Copy file to backup
      fs.copyFileSync(fullPath, backupPath);
      backedUpFiles.push(filePath);
    }
  }
  
  // Save metadata
  const metadata: BackupMetadata = {
    taskId,
    timestamp,
    filesModified: backedUpFiles,
    backupLocation: backupSubDir
  };
  
  fs.writeFileSync(
    path.join(backupSubDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  return {
    taskId,
    timestamp,
    filesModified: backedUpFiles,
    backupLocation: backupSubDir
  };
}

/**
 * Restores files from a rollback point
 * @param rollbackPoint - The rollback point to restore from
 * @returns true if rollback successful, false otherwise
 */
export function rollback(rollbackPoint: RollbackPoint): boolean {
  try {
    for (const filePath of rollbackPoint.filesModified) {
      const backupPath = path.join(rollbackPoint.backupLocation, filePath);
      const targetPath = path.join(process.cwd(), filePath);
      
      if (fs.existsSync(backupPath)) {
        // Ensure target directory exists
        const targetDir = path.dirname(targetPath);
        fs.mkdirSync(targetDir, { recursive: true });
        
        // Restore file
        fs.copyFileSync(backupPath, targetPath);
      }
    }
    
    console.log(`✅ Rollback successful for task: ${rollbackPoint.taskId}`);
    return true;
  } catch (error) {
    console.error(`❌ Rollback failed for task: ${rollbackPoint.taskId}`, error);
    return false;
  }
}

/**
 * Cleans up old backup directories
 * @param daysToKeep - Number of days to keep backups (default: 7)
 */
export function cleanupOldBackups(daysToKeep: number = 7): void {
  if (!fs.existsSync(BACKUP_DIR)) {
    return;
  }
  
  const now = Date.now();
  const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
  
  const backupDirs = fs.readdirSync(BACKUP_DIR);
  
  for (const dir of backupDirs) {
    const dirPath = path.join(BACKUP_DIR, dir);
    const stats = fs.statSync(dirPath);
    
    if (stats.isDirectory() && (now - stats.mtimeMs) > maxAge) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`🗑️  Cleaned up old backup: ${dir}`);
    }
  }
}

/**
 * Lists all available rollback points
 * @returns Array of rollback points
 */
export function listRollbackPoints(): RollbackPoint[] {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }
  
  const rollbackPoints: RollbackPoint[] = [];
  const backupDirs = fs.readdirSync(BACKUP_DIR);
  
  for (const dir of backupDirs) {
    const metadataPath = path.join(BACKUP_DIR, dir, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      rollbackPoints.push({
        ...metadata,
        timestamp: new Date(metadata.timestamp)
      });
    }
  }
  
  return rollbackPoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
