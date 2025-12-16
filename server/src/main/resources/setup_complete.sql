-- ============================================
-- Complete Database Setup Script
-- Creates table and inserts all vocabulary data
-- ============================================

-- Set client encoding to UTF-8
SET client_encoding = 'UTF8';

-- Step 1: Drop existing table if it exists
DROP TABLE IF EXISTS vocabulary_items;

-- Step 2: Create the vocabulary_items table
CREATE TABLE IF NOT EXISTS vocabulary_items (
    id SERIAL PRIMARY KEY,
    expression TEXT UNIQUE NOT NULL,
    meaning TEXT,
    meaning_en TEXT,
    meaning_zh TEXT,
    example TEXT,
    level VARCHAR(50)
);

-- Step 3: Insert vocabulary data (with duplicate protection)
\i idioms.sql
